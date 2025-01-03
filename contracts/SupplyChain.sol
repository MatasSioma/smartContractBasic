// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChain {
    address public manufacturer;

    struct Order {
        address retailer;
        address courier;
        string product;
        uint256 quantity;
        uint256 orderPrice;
        uint256 shipmentPrice;
        uint256 grandTotal;
        uint256 deliveryDate;
        OrderStatus status;
    }

    enum OrderStatus { None, Ordered, Priced, Paid, Delivered, Cancelled }

    uint256 public orderCount;
    mapping(uint256 => Order) public orders;

    event OrderCreated(uint256 indexed orderId, address retailer, string product, uint256 quantity);
    event PriceSent(uint256 indexed orderId, uint256 orderPrice, uint256 shipmentPrice);
    event OrderPayed(uint256 indexed orderId);
    event OrderDelivered(uint256 indexed orderId);
    event OrderCancelled(uint256 indexed orderId, string reason);
    event PaymentReleased(uint256 indexed orderId, address to, uint256 amount);
    event InvoiceSent(uint256 indexed orderId, uint256 deliveryDate);

    constructor() {
        manufacturer = msg.sender;
        orderCount = 0;
    }

    modifier onlyManufacturer() {
        require(msg.sender == manufacturer, "Not the Manufacturer");
        _;
    }

    modifier onlyRetailer(uint256 orderId) {
        require(msg.sender == orders[orderId].retailer, "Not the Retailer for this Order");
        _;
    }

    modifier onlyCourier(uint256 orderId) {
        require(msg.sender == orders[orderId].courier, "Not the Courier");
        _;
    }

    function createOrder(address retailer, string memory product, uint256 quantity) public onlyManufacturer {
        orderCount++;
        orders[orderCount] = Order({
            retailer: retailer,
            courier: address(0),
            product: product,
            quantity: quantity,
            orderPrice: 0,
            shipmentPrice: 0,
            grandTotal: 0,
            deliveryDate: 0,
            status: OrderStatus.Ordered
        });

        emit OrderCreated(orderCount, retailer, product, quantity);
    }

    function setPrices(uint256 orderId, uint256 _orderPrice, uint256 _shipmentPrice, uint256 _deliveryDate, address _courier) public onlyManufacturer {
        require(orders[orderId].status == OrderStatus.Ordered, "Order not in Ordered status");
        orders[orderId].orderPrice = _orderPrice;
        orders[orderId].shipmentPrice = _shipmentPrice;
        orders[orderId].courier = _courier;
        orders[orderId].deliveryDate = _deliveryDate;
        orders[orderId].grandTotal = _orderPrice + _shipmentPrice;
        orders[orderId].status = OrderStatus.Priced;

        emit PriceSent(orderId, _orderPrice, _shipmentPrice);
    }

    function pay(uint256 orderId) public payable onlyRetailer(orderId) {
        require(orders[orderId].status == OrderStatus.Priced, "Prices not set yet");
        require(msg.value == orders[orderId].grandTotal, "Incorrect payment amount");
        orders[orderId].status = OrderStatus.Paid;

        emit OrderPayed(orderId);
    }

    function sendInvoice(uint256 orderId, uint256 deliveryDate) public onlyManufacturer {
        require(orders[orderId].status == OrderStatus.Paid, "Payment not completed");
        orders[orderId].deliveryDate = deliveryDate;

        emit InvoiceSent(orderId, deliveryDate);
    }

    function markDelivered(uint256 orderId) public onlyRetailer(orderId) {
        require(orders[orderId].status == OrderStatus.Paid, "Payment not completed");
        orders[orderId].status = OrderStatus.Delivered;

        emit OrderDelivered(orderId);

        // Payout
        payable(manufacturer).transfer(orders[orderId].orderPrice);
        payable(orders[orderId].courier).transfer(orders[orderId].shipmentPrice);

        emit PaymentReleased(orderId, manufacturer, orders[orderId].orderPrice);
        emit PaymentReleased(orderId, orders[orderId].courier, orders[orderId].shipmentPrice);
    }

    function cancelOrder(uint256 orderId, string memory reason) public {
        Order storage order = orders[orderId];
        require(
            msg.sender == manufacturer || msg.sender == order.retailer,
            "Only Manufacturer or Retailer can cancel the order"
        );
        require(
            order.status == OrderStatus.Ordered || order.status == OrderStatus.Priced,
            "Order cannot be cancelled at this stage"
        );

        // If payment was made, refund the retailer
        if (order.status == OrderStatus.Paid) {
            payable(order.retailer).transfer(order.grandTotal);
        }

        order.status = OrderStatus.Cancelled;

        emit OrderCancelled(orderId, reason);
    }
}
