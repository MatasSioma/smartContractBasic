from django.shortcuts import render
from django.http import HttpResponseRedirect, JsonResponse
from web3 import Web3
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from datetime import datetime
import json

#            0.000000000000003 3k eur
WEI_IN_EUR = 0.0000000000003

with open(f'{settings.BASE_DIR}/retail/config.json', 'r') as cfg:
    config = json.load(cfg)

# PROVIDER = "https://ethereum-sepolia-rpc.publicnode.com"
PROVIDER = "HTTP://127.0.0.1:7545"

# CONTRACT = config["SEPOLIA_CONTRACT_ADDRESS"]
CONTRACT = config["GANACHE_CONTRACT_ADDRESS"]

# MANUFACTURER_PRIVATE_KEY = config["SEPOLIA_MANUFACTURER_PRIVATE_KEY"]
MANUFACTURER_PRIVATE_KEY = config["GANACHE_MANUFACTURER_PRIVATE_KEY"]

# Connect to the Ethereum node
web3 = Web3(Web3.HTTPProvider(PROVIDER))

with open('C:/Programos/smartContractBasic/build/contracts/SupplyChain.json', 'r') as abif:
    contractAbi = json.load(abif)
    contractAbi = contractAbi["abi"]

contract = web3.eth.contract(address=CONTRACT, abi=contractAbi)

MANUFACTURER_ADDRESS = web3.eth.account.from_key(MANUFACTURER_PRIVATE_KEY).address

# Create your views here.
def index(request):
    if request.method == "GET":
        # print(request.GET.get("message").replace("'",'"'))
        try:
            popUps = json.loads(request.GET.get("message", "").replace("'",'"'))
        except:
            popUps = []

        with open(f'{settings.BASE_DIR}/retail/products.json', 'r') as productsf:
            products = json.load(productsf)
        orderAmount = contract.functions.orderCount().call()

        statusTrans = {
            0: "None",
            1: "Ordered",
            2: "Priced",
            3: "Paid",
            4: "Delivered",
            5: "Cancelled"
        }

        orders = []
        for orderId in range(1, orderAmount+1):
            order = contract.functions.orders(orderId).call()
            order = {
                "orderId": orderId,
                "retailer": order[0],
                "courier":order[1],
                "product": order[2],
                "quantity": order[3],
                "orderPrice": order[4],
                "shipmentPrice": order[5],
                "grandTotal": order[6],
                "deliveryDate": order[7],
                "status": statusTrans[order[8]],
            }
            for product in products:
                if product["title"] == order["product"]:
                    order["weight"] = order["quantity"] * product["weight"]
                    break
            if order["grandTotal"] != 0:
                order["price"] = round(order["grandTotal"] * WEI_IN_EUR, 2)
                order["priceETH"] = web3.from_wei(order["grandTotal"],'ether')

            orders.append(order)

        return render(request, "index.html", {"products": products, "popUps": popUps,"orders": orders})

@csrf_exempt
def send_order(request):
    if request.method == "POST":
        try:
            product = request.POST.get("product")
            quantity = int(request.POST.get("quantity"))
            retailer_address = request.POST.get("retailer-address")
            
            transaction = contract.functions.createOrder(
                retailer_address, product, quantity
            ).build_transaction({
                'from': MANUFACTURER_ADDRESS,
                'gas': 2000000,
                'nonce': web3.eth.get_transaction_count(MANUFACTURER_ADDRESS),
            })
            signed_tx = web3.eth.account.sign_transaction(transaction, MANUFACTURER_PRIVATE_KEY)
            tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
            web3.eth.wait_for_transaction_receipt(tx_hash)

            # events = contract.events.OrderCreated.create_filter(from_block="latest").get_all_entries()
            message = [
            {
                "retailer": retailer_address,
                "product": product,
                "quantity": quantity,
                "type": "Created"
            }
            ]

            return HttpResponseRedirect(f"/?message={json.dumps(message).replace("'", '"')}")
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def set_price(request):
    if request.method == "POST":
        try:
            orderId = int(request.POST.get("id"))
            productTitle = request.POST.get("product")
            quantity = int(request.POST.get("quantity"))
            shipmentPrice = float(request.POST.get("price"))
            deliveryDate = int(datetime.fromisoformat(request.POST.get("date")).timestamp())
            courierAddress = request.POST.get("courier-address")
            

            with open(f'{settings.BASE_DIR}/retail/products.json', 'r') as productsf:
                products = json.load(productsf)

            for product in products:
                if productTitle == product["title"]:
                    orderPrice = round(product["price"] * quantity, 2)
                    break
            
            orderPrice = int(orderPrice / WEI_IN_EUR)
            shipmentPrice = int(shipmentPrice / WEI_IN_EUR)

            transaction = contract.functions.setPrices(
                orderId, orderPrice, shipmentPrice, deliveryDate, courierAddress
            ).build_transaction({
                'from': MANUFACTURER_ADDRESS,
                'gas': 2000000,
                'nonce': web3.eth.get_transaction_count(MANUFACTURER_ADDRESS),
            })
            signed_tx = web3.eth.account.sign_transaction(transaction, MANUFACTURER_PRIVATE_KEY)
            tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
            web3.eth.wait_for_transaction_receipt(tx_hash)


            message = [
            {
                "orderId": orderId,
                "orderPrice": round(orderPrice*WEI_IN_EUR,2),
                "shipmentPrice": round(shipmentPrice*WEI_IN_EUR,2),
                "grandTotal": round(orderPrice*WEI_IN_EUR + shipmentPrice*WEI_IN_EUR,2),
                "type": "Priced"
            }
            ]

            return HttpResponseRedirect(f"/?message={json.dumps(message).replace("'", '"')}")
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        
@csrf_exempt
def cancel_order(request):
    if request.method == "POST":
        try:
            orderId = int(request.POST.get("id"))
            retailer = request.POST.get("retailer-address")

            order = contract.functions.orders(orderId).call()
            if(order[0] != retailer): 
                print(order[0], retailer)
                raise Exception("Prijungtas adresas ir užsakovas nesutampa!")

            transaction = contract.functions.cancelOrder(
                orderId, "SiapSau"
            ).build_transaction({
                'from': MANUFACTURER_ADDRESS,
                'gas': 2000000,
                'nonce': web3.eth.get_transaction_count(MANUFACTURER_ADDRESS),
            })
            signed_tx = web3.eth.account.sign_transaction(transaction, MANUFACTURER_PRIVATE_KEY)
            tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
            web3.eth.wait_for_transaction_receipt(tx_hash)

            message = [{"type": "Canceled", "orderId": orderId}]

            return HttpResponseRedirect(f"/?message={json.dumps(message)}")
        except:
            return HttpResponseRedirect(f"/?message={json.dumps([{"type": "Error", "orderId": orderId, "message": "Prijungtas adresas ir užsakovas nesutampa!", "retail": order[0], "orderRetail": retailer}])}")



