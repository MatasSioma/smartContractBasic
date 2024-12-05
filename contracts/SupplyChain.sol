// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChain {
    address public manufacturer;
    address public retailer;
    address public courier;

    uint256 public orderPrice;
    uint256 public shipmentPrice;
    uint256 public grandTotal;

    enum OrderStatus { None, Ordered, Priced, Paid, Delivered }
    OrderStatus public status;

    struct Invoice {
        uint256 deliveryDate;
        string otherData;
    }
    Invoice public invoice;

    event OrderSent(address indexed retailer, string product, uint256 quantity);
    event PriceSent(uint256 orderPrice, uint256 shipmentPrice);
    event InvoiceSent(uint256 deliveryDate, string otherData);
    event OrderDelivered();
    event PaymentReleased(address to, uint256 amount);

    constructor(address _retailer, address _courier) {
        manufacturer = msg.sender;
        retailer = _retailer;
        courier = _courier;
        status = OrderStatus.None;
    }

    modifier onlyManufacturer() {
        require(msg.sender == manufacturer, "Not the Manufacturer");
        _;
    }

    modifier onlyRetailer() {
        require(msg.sender == retailer, "Not the Retailer");
        _;
    }

    modifier onlyCourier() {
        require(msg.sender == courier, "Not the Courier");
        _;
    }

    function sendOrder(string memory product, uint256 quantity) public onlyRetailer {
        require(status == OrderStatus.None, "Order already placed");
        emit OrderSent(msg.sender, product, quantity);
        status = OrderStatus.Ordered;
    }

    function setPrices(uint256 _orderPrice, uint256 _shipmentPrice) public onlyManufacturer {
        require(status == OrderStatus.Ordered, "Order not placed yet");
        orderPrice = _orderPrice;
        shipmentPrice = _shipmentPrice;
        grandTotal = orderPrice + shipmentPrice;
        emit PriceSent(orderPrice, shipmentPrice);
        status = OrderStatus.Priced;
    }

    function pay() public payable onlyRetailer {
        require(status == OrderStatus.Priced, "Prices not set yet");
        require(msg.value == grandTotal, "Incorrect payment amount");
        status = OrderStatus.Paid;
    }

    function sendInvoice(uint256 deliveryDate, string memory otherData) public onlyManufacturer {
        require(status == OrderStatus.Paid, "Payment not completed");
        invoice = Invoice(deliveryDate, otherData);
        emit InvoiceSent(deliveryDate, otherData);
    }

    function markDelivered() public onlyCourier {
        require(status == OrderStatus.Paid, "Payment not completed");
        status = OrderStatus.Delivered;
        emit OrderDelivered();

        payable(manufacturer).transfer(orderPrice);
        payable(courier).transfer(shipmentPrice);

        emit PaymentReleased(manufacturer, orderPrice);
        emit PaymentReleased(courier, shipmentPrice);
    }
}