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
def retailer(request):
    if request.method == "GET":
        with open(f'{settings.BASE_DIR}/retail/products.json', 'r') as productsf:
            products = json.load(productsf)
        return render(request, "retailer.html", {"products": products})

def manufacturer(request):
    return HttpResponseRedirect("/")

def courier(request):
    return HttpResponseRedirect("/")

@csrf_exempt
def send_order(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            product = data["product"]
            quantity = int(data["quantity"])
            retailer_address = data["retailer_address"]

            # Build the transaction
            txn = contract.functions.sendOrder(product, quantity).buildTransaction({
                'from': retailer_address,
                'gas': 2000000,
                'nonce': web3.eth.getTransactionCount(retailer_address),
            })

            return JsonResponse({"message": "Transaction built successfully.", "txn": txn})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
        
def get_order_events(request):
    try:
        events = contract.events.OrderSent.createFilter(fromBlock="latest").get_all_entries()
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