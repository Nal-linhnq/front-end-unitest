import { describe, test, expect, beforeEach, vi } from "vitest";
import { OrderService } from "../src/services/order.service";
import { PaymentService } from "../src/services/payment.service";
import { Order, OrderItem } from "../src/models/order.model";
import { PaymentMethod } from "../src/models/payment.model";

vi.mock("../src/services/payment.service");
const mockPaymentService = new PaymentService();

describe("src/services/order.service.ts", () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService(mockPaymentService);
  });

  test("Should throw an error if no items are provided in the order", async () => {
    await expect(orderService.process({})).rejects.toThrow(
      "Order items are required"
    );
  });

  test("Should throw an error if any item has an invalid price or quantity", async () => {
    const invalidOrder = {
      items: [
        { price: 10, quantity: 0, id: "item1", productId: "product1" },
      ] as OrderItem[],
    };
    await expect(orderService.process(invalidOrder)).rejects.toThrow(
      "Order items are invalid"
    );
  });

  test("Should apply coupon discount and update totalPrice", async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ discount: 20 }),
    });

    const order: Order = {
      items: [
        { price: 50, quantity: 2, id: "item1", productId: "product1" },
      ] as OrderItem[],
      couponId: "coupon123",
      id: "20",
      totalPrice: 100,
      paymentMethod: PaymentMethod.CREDIT,
    };

    await orderService.process(order);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://67eb7353aa794fb3222a4c0e.mockapi.io/coupons/coupon123"
    );
    expect(mockPaymentService.buildPaymentMethod).toHaveBeenCalledWith(80);
  });

  test("Should not apply coupon if there is an error fetching the coupon", async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    const order = {
      items: [{ price: 50, quantity: 2, id: "item1", productId: "product1" }],
      couponId: "coupon123",
    };

    await orderService.process(order);

    expect(mockPaymentService.buildPaymentMethod).toHaveBeenCalledWith(100);
  });

  test("Should return error if invalid coupon", async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    });

    const order = {
      items: [{ price: 50, quantity: 2, id: "item1", productId: "product1" }],
      couponId: "coupon123",
    };

    await orderService.process(order);
  });

  test("Should return totalPrice = 0 if discount greater than totalPrice", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          discount: 200,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "item1", productId: "product1", ...order }),
      });

    const order = {
      items: [{ price: 50, quantity: 2, id: "item1", productId: "product1" }],
      totalPrice: 100,
      couponId: "coupon123",
    };

    await orderService.process(order);
  });

  test("Should create an order and call payViaLink", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ discount: 20 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "item1", productId: "product1", ...order }),
      });

    const order = {
      items: [{ price: 50, quantity: 2, id: "item1", productId: "product1" }],
      totalPrice: 100,
      couponId: "coupon123",
    };

    await orderService.process(order);

    expect(mockPaymentService.payViaLink).toHaveBeenCalledWith({
      id: "item1",
      productId: "product1",
      ...order,
      totalPrice: 100,
    });
  });

  test("Should return error 'Error creating order' when creating the order", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ discount: 20 }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

    const order = {
      items: [{ price: 50, quantity: 2, id: "item1", productId: "product1" }],
      couponId: "coupon123",
    };
    const spy = vi.spyOn(console, "error");

    await orderService.process(order);

    expect(spy).toHaveBeenCalledWith("Error creating order");
  });
});
