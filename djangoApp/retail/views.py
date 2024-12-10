from django.shortcuts import render
from django.http import HttpResponseRedirect, JsonResponse
from web3 import Web3
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json

# Connect to the Ethereum node
web3 = Web3(Web3.HTTPProvider("HTTP://127.0.0.1:7545"))

with open(f'{settings.BASE_DIR}/retail/config.json', 'r') as cfg:
    config = json.load(cfg)

with open('C:/Programos/smartContractBasic/build/contracts/SupplyChain.json', 'r') as abif:
    contractAbi = json.load(abif)
    contractAbi = contractAbi["abi"]

contract = web3.eth.contract(address=config["CONTRACT_ADDRESS"], abi=contractAbi)

MANUFACTURER_ADDRESS = web3.eth.account.from_key(config["MANUFACTURER_PRIVATE_KEY"]).address

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
        orders = []
        for orderId in range(orderAmount):
            orders.append(contract.functions.orders(orderId).call())
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
            signed_tx = web3.eth.account.sign_transaction(transaction, config["MANUFACTURER_PRIVATE_KEY"])
            tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
            web3.eth.wait_for_transaction_receipt(tx_hash)

            events = contract.events.OrderCreated.create_filter(from_block="latest").get_all_entries()
            message = [
            {
                "orderId": event.args.orderId,
                "retailer": event.args.retailer,
                "product": event.args.product,
                "quantity": event.args.quantity,
                "type": "Created"
            } for event in events
            ]

            return HttpResponseRedirect(f"/?message={json.dumps(message).replace("'", '"')}")
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        
def get_order_events(request):
    try:
        events = contract.events.OrderCreated.create_filter(from_block="latest").get_all_entries()
        response = [
            {
                "orderId": event.args.orderId,
                "retailer": event.args.retailer,
                "product": event.args.product,
                "quantity": event.args.quantity,
            } for event in events
        ]
        return JsonResponse({"events": response})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)