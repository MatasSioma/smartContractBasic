const SupplyChain = artifacts.require("SupplyChain");
const { expect } = require("chai");
const { BN, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");

contract("SupplyChain", (accounts) => {
    const [manufacturer, retailer, courier, otherAccount] = accounts;

    let supplyChain;

    beforeEach(async () => {
        supplyChain = await SupplyChain.new({ from: manufacturer });
    });

    it("should initialize correctly", async () => {
        const contractManufacturer = await supplyChain.manufacturer();
        expect(contractManufacturer).to.equal(manufacturer);

        const orderCount = await supplyChain.orderCount();
        expect(orderCount).to.be.bignumber.equal(new BN(0));
    });

    it("should allow the manufacturer to create an order", async () => {
        const tx = await supplyChain.createOrder(retailer, "Product A", 10, { from: manufacturer });

        expectEvent(tx, "OrderCreated", {
            orderId: new BN(1),
            retailer,
            product: "Product A",
            quantity: new BN(10),
        });

        const order = await supplyChain.orders(1);
        expect(order.retailer).to.equal(retailer);
        expect(order.product).to.equal("Product A");
        expect(order.quantity).to.be.bignumber.equal(new BN(10));
        expect(order.status).to.be.bignumber.equal(new BN(1)); // Ordered
    });

    it("should allow the manufacturer to set prices", async () => {
        await supplyChain.createOrder(retailer, "Product A", 10, { from: manufacturer });

        const tx = await supplyChain.setPrices(1, 100, 20, 1234567890, courier, { from: manufacturer });

        expectEvent(tx, "PriceSent", {
            orderId: new BN(1),
            orderPrice: new BN(100),
            shipmentPrice: new BN(20),
        });

        const order = await supplyChain.orders(1);
        expect(order.orderPrice).to.be.bignumber.equal(new BN(100));
        expect(order.shipmentPrice).to.be.bignumber.equal(new BN(20));
        expect(order.courier).to.equal(courier);
        expect(order.grandTotal).to.be.bignumber.equal(new BN(120));
        expect(order.status).to.be.bignumber.equal(new BN(2)); // Priced
    });

    it("should allow the retailer to pay for the order", async () => {
        await supplyChain.createOrder(retailer, "Product A", 10, { from: manufacturer });
        await supplyChain.setPrices(1, 100, 20, 1234567890, courier, { from: manufacturer });

        const tx = await supplyChain.pay(1, { from: retailer, value: 120 });

        expectEvent(tx, "OrderPayed", { orderId: new BN(1) });

        const order = await supplyChain.orders(1);
        expect(order.status).to.be.bignumber.equal(new BN(3)); // Paid
    });

    it("should allow the manufacturer to send an invoice", async () => {
        await supplyChain.createOrder(retailer, "Product A", 10, { from: manufacturer });
        await supplyChain.setPrices(1, 100, 20, 1234567890, courier, { from: manufacturer });
        await supplyChain.pay(1, { from: retailer, value: 120 });

        const tx = await supplyChain.sendInvoice(1, 1234567890, { from: manufacturer });

        expectEvent(tx, "InvoiceSent", {
            orderId: new BN(1),
            deliveryDate: new BN(1234567890),
        });

        const order = await supplyChain.orders(1);
        expect(order.deliveryDate).to.be.bignumber.equal(new BN(1234567890));
    });

    it("should allow the retailer to mark the order as delivered", async () => {
        await supplyChain.createOrder(retailer, "Product A", 10, { from: manufacturer });
        await supplyChain.setPrices(1, 100, 20, 1234567890, courier, { from: manufacturer });
        await supplyChain.pay(1, { from: retailer, value: 120 });

        const tx = await supplyChain.markDelivered(1, { from: retailer });

        expectEvent(tx, "OrderDelivered", { orderId: new BN(1) });

        const order = await supplyChain.orders(1);
        expect(order.status).to.be.bignumber.equal(new BN(4)); // Delivered
    });

    it("should allow order cancellation by retailer or manufacturer", async () => {
        await supplyChain.createOrder(retailer, "Product A", 10, { from: manufacturer });

        const tx = await supplyChain.cancelOrder(1, "No longer needed", { from: retailer });

        expectEvent(tx, "OrderCancelled", {
            orderId: new BN(1),
            reason: "No longer needed",
        });

        const order = await supplyChain.orders(1);
        expect(order.status).to.be.bignumber.equal(new BN(5)); // Cancelled
    });

    it("should prevent unauthorized actions", async () => {
        await supplyChain.createOrder(retailer, "Product A", 10, { from: manufacturer });

        await expectRevert(
            supplyChain.setPrices(1, 100, 20, 1234567890, courier, { from: otherAccount }),
            "Not the Manufacturer"
        );

        await expectRevert(
            supplyChain.pay(1, { from: otherAccount, value: 120 }),
            "Not the Retailer for this Order"
        );

        await expectRevert(
            supplyChain.markDelivered(1, { from: otherAccount }),
            "Not the Retailer for this Order"
        );
    });
});
