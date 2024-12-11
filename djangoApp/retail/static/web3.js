const contractABI = [
			{
				"inputs": [],
				"stateMutability": "nonpayable",
				"type": "constructor"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "uint256",
						"name": "orderId",
						"type": "uint256"
					},
					{
						"indexed": false,
						"internalType": "uint256",
						"name": "deliveryDate",
						"type": "uint256"
					}
				],
				"name": "InvoiceSent",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "uint256",
						"name": "orderId",
						"type": "uint256"
					},
					{
						"indexed": false,
						"internalType": "string",
						"name": "reason",
						"type": "string"
					}
				],
				"name": "OrderCancelled",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "uint256",
						"name": "orderId",
						"type": "uint256"
					},
					{
						"indexed": false,
						"internalType": "address",
						"name": "retailer",
						"type": "address"
					},
					{
						"indexed": false,
						"internalType": "string",
						"name": "product",
						"type": "string"
					},
					{
						"indexed": false,
						"internalType": "uint256",
						"name": "quantity",
						"type": "uint256"
					}
				],
				"name": "OrderCreated",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "uint256",
						"name": "orderId",
						"type": "uint256"
					}
				],
				"name": "OrderDelivered",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "uint256",
						"name": "orderId",
						"type": "uint256"
					}
				],
				"name": "OrderPayed",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "uint256",
						"name": "orderId",
						"type": "uint256"
					},
					{
						"indexed": false,
						"internalType": "address",
						"name": "to",
						"type": "address"
					},
					{
						"indexed": false,
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					}
				],
				"name": "PaymentReleased",
				"type": "event"
			},
			{
				"anonymous": false,
				"inputs": [
					{
						"indexed": true,
						"internalType": "uint256",
						"name": "orderId",
						"type": "uint256"
					},
					{
						"indexed": false,
						"internalType": "uint256",
						"name": "orderPrice",
						"type": "uint256"
					},
					{
						"indexed": false,
						"internalType": "uint256",
						"name": "shipmentPrice",
						"type": "uint256"
					}
				],
				"name": "PriceSent",
				"type": "event"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "orderId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "reason",
						"type": "string"
					}
				],
				"name": "cancelOrder",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "address",
						"name": "retailer",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "product",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "quantity",
						"type": "uint256"
					}
				],
				"name": "createOrder",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [],
				"name": "manufacturer",
				"outputs": [
					{
						"internalType": "address",
						"name": "",
						"type": "address"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "orderId",
						"type": "uint256"
					}
				],
				"name": "markDelivered",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [],
				"name": "orderCount",
				"outputs": [
					{
						"internalType": "uint256",
						"name": "",
						"type": "uint256"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "",
						"type": "uint256"
					}
				],
				"name": "orders",
				"outputs": [
					{
						"internalType": "address",
						"name": "retailer",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "courier",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "product",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "quantity",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "orderPrice",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "shipmentPrice",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "grandTotal",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "deliveryDate",
						"type": "uint256"
					},
					{
						"internalType": "enum SupplyChain.OrderStatus",
						"name": "status",
						"type": "uint8"
					}
				],
				"stateMutability": "view",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "orderId",
						"type": "uint256"
					}
				],
				"name": "pay",
				"outputs": [],
				"stateMutability": "payable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "orderId",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "deliveryDate",
						"type": "uint256"
					}
				],
				"name": "sendInvoice",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			},
			{
				"inputs": [
					{
						"internalType": "uint256",
						"name": "orderId",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "_orderPrice",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "_shipmentPrice",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "_deliveryDate",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "_courier",
						"type": "address"
					}
				],
				"name": "setPrices",
				"outputs": [],
				"stateMutability": "nonpayable",
				"type": "function"
			}
		];
const contractAddress = "0x2fe6b04652b3FFC4D24127512b89b34fBaebd7Ad"; //SEPOLIA
// const contractAddress = "0xeca4dfb822c0c25912E9C3166ED32a15D43d9f01"; //GANACHE


async function payOrder(element) {
  // Ensure MetaMask is installed
  if (typeof window.ethereum === 'undefined') {
    alert("MetaMask is not installed. Please install it to continue.");
    return;
  }

  // Initialize Web3
  const web3 = new Web3(window.ethereum);

  element = element.parentElement.parentElement;

  // Get order details from the form
  const orderId = element.querySelector('input[name="id"]').value;
  const orderPriceETH = parseFloat(element.querySelector('input[name="priceETH"]').value.replace(",", "."));

  // Convert ETH price to wei
  const priceInWei = web3.utils.toWei(orderPriceETH.toString(), 'ether');

  // Create the contract instance
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  try {
    // Request the user's account via MetaMask
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0]; // Get the first account

    // Prompt MetaMask to pay
    const tx = await contract.methods.pay(orderId).send({
      from: account,       // The user's account
      value: priceInWei,   // Payment amount in wei
      gas: 300000,         // Adjust gas limit if necessary
    });

    // Wait for the transaction receipt
    waiting();
    const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
    waitingRevert();

    // Process the successful transaction
    const message = [{
        orderId: orderId,
        paidAmount: orderPriceETH,
        type: "Paid"
    }];

    location.replace(`http://localhost:8000/?message=${JSON.stringify(message)}`);
  } catch (error) {
    waitingRevert();
    console.error("Payment failed:", error);
    alert("Mokėjimas nepavyko. Pažiūrėkite konsolę");
  }
}


async function confirmDelivered(element) {
  // Ensure MetaMask is installed
  if (typeof window.ethereum === 'undefined') {
      alert("MetaMask is not installed. Please install it to continue.");
      return;
  }

  // Initialize Web3
  const web3 = new Web3(window.ethereum);

  element = element.parentElement.parentElement;

  // Get order details from the form
  const orderId = element.querySelector('input[name="id"]').value;

  // Create the contract instance
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  try {
      // Request the user's account via MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0]; // Get the first account

      // Call the `markDelivered` function
      const tx = await contract.methods.markDelivered(orderId).send({
          from: account, // The user's account
          gas: 300000,         // Adjust gas limit if necessary

      });

      waiting();
      const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
      waitingRevert();

      // Build a message to notify the user and redirect to a new page
      const message = [{
          orderId: orderId,
          type: "Delivered",
      }];

      // Redirect with the success message
      location.replace(`http://localhost:8000/?message=${encodeURIComponent(JSON.stringify(message))}`);
  } catch (error) {
      waitingRevert();
      console.error("Confirmation failed:", error);
      alert("Failed to confirm delivery. Check the console for details.");
  }
}

