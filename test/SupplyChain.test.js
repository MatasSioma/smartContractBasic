const SupplyChain = artifacts.require("SupplyChain");
const { expectRevert } = require('@openzeppelin/test-helpers');

contract("SupplyChain", (accounts) => {
  const [manufacturer, retailer, courier, unauthorized] = accounts;
  let contractInstance;

  beforeEach(async () => {
    contractInstance = await SupplyChain.new({ from: manufacturer });
  });

  it("should initialize with correct manufacturer", async () => {
    const storedManufacturer = await contractInstance.manufacturer();
    assert.equal(storedManufacturer, manufacturer, "Manufacturer address does not match");
  });

  it("should allow manufacturer to create an order", async () => {
    await contractInstance.createOrder(retailer, "Product A", 10, { from: manufacturer });

    const order = await contractInstance.orders(1);
    assert.equal(order.retailer, retailer, "Retailer address does not match");
    assert.equal(order.product, "Product A", "Product name does not match");
    assert.equal(order.quantity, 10, "Quantity does not match");
    assert.equal(order.status.toNumber(), 1, "Order status should be 'Ordered'");
  });

  it("should allow manufacturer to set prices for an order", async () => {
    await contractInstance.createOrder(retailer, "Product B", 5, { from: manufacturer });
    await contractInstance.setPrices(1, 1000, 200, Math.floor(Date.now() / 1000), courier, { from: manufacturer });

    const order = await contractInstance.orders(1);
    assert.equal(order.orderPrice, 1000, "Order price does not match");
    assert.equal(order.shipmentPrice, 200, "Shipment price does not match");
    assert.equal(order.courier, courier, "Courier address does not match");
    assert.equal(order.status.toNumber(), 2, "Order status should be 'Priced'");
  });

  it("should allow retailer to pay for the order", async () => {
    await contractInstance.createOrder(retailer, "Product C", 3, { from: manufacturer });
    await contractInstance.setPrices(1, 1500, 300, Math.floor(Date.now() / 1000), courier, { from: manufacturer });

    const totalPrice = 1500 + 300;
    await contractInstance.pay(1, { from: retailer, value: totalPrice });

    const order = await contractInstance.orders(1);
    assert.equal(order.status.toNumber(), 3, "Order status should be 'Paid'");
  });

  it("should not allow payment with incorrect amount", async () => {
    await contractInstance.createOrder(retailer, "Product D", 2, { from: manufacturer });
    await contractInstance.setPrices(1, 1000, 100, Math.floor(Date.now() / 1000), courier, { from: manufacturer });

    await expectRevert(
      contractInstance.pay(1, { from: retailer, value: 500 }),
      "Incorrect payment amount"
    );
  });

  it("should allow manufacturer to send an invoice after payment", async () => {
    await contractInstance.createOrder(retailer, "Product E", 1, { from: manufacturer });
    await contractInstance.setPrices(1, 500, 50, Math.floor(Date.now() / 1000), courier, { from: manufacturer });

    const totalPrice = 500 + 50;
    await contractInstance.pay(1, { from: retailer, value: totalPrice });
    await contractInstance.sendInvoice(1, Math.floor(Date.now() / 1000) + 86400, "Some data", { from: manufacturer });

    const order = await contractInstance.orders(1);
    assert.equal(order.otherData, "Some data", "Invoice data does not match");
  });

  it("should allow courier to mark the order as delivered", async () => {
    await contractInstance.createOrder(retailer, "Product F", 2, { from: manufacturer });
    await contractInstance.setPrices(1, 800, 200, Math.floor(Date.now() / 1000), courier, { from: manufacturer });

    const totalPrice = 800 + 200;
    await contractInstance.pay(1, { from: retailer, value: totalPrice });

    await contractInstance.markDelivered(1, { from: courier });

    const order = await contractInstance.orders(1);
    assert.equal(order.status.toNumber(), 4, "Order status should be 'Delivered'");
  });

  it("should allow cancellation of an order by manufacturer", async () => {
    await contractInstance.createOrder(retailer, "Product G", 5, { from: manufacturer });
    await contractInstance.cancelOrder(1, "Order no longer needed", { from: manufacturer });

    const order = await contractInstance.orders(1);
    assert.equal(order.status.toNumber(), 5, "Order status should be 'Cancelled'");
  });

  it("should revert if unauthorized user tries to modify order", async () => {
    await contractInstance.createOrder(retailer, "Product H", 7, { from: manufacturer });

    await expectRevert(
      contractInstance.setPrices(1, 1000, 100, Math.floor(Date.now() / 1000), courier, { from: unauthorized }),
      "Not the Manufacturer"
    );

    await expectRevert(
      contractInstance.pay(1, { from: unauthorized, value: 1100 }),
      "Not the Retailer for this Order"
    );
  });
});
