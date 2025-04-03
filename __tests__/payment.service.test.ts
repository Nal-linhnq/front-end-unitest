import { describe, test, expect, vi, afterEach, afterAll } from "vitest";
import { PaymentService } from "../src/services/payment.service";
import { PaymentMethod } from "../src/models/payment.model";
import { Order } from "../src/models/order.model";

describe("src/services/payment.service.ts", () => {
  const paymentService = new PaymentService();

  afterAll(() => {
    vi.restoreAllMocks();
  });

  test("Should return all payment methods when totalPrice is 200,000", () => {
    const result = paymentService.buildPaymentMethod(200000);
    expect(result).toBe(
      `${PaymentMethod.CREDIT},${PaymentMethod.PAYPAY},${PaymentMethod.AUPAY}`
    );
  });

  test("Should remove paypay and aupay method when totalPrice is 600,000", () => {
    const result = paymentService.buildPaymentMethod(600000);
    expect(result).toBe(`${PaymentMethod.CREDIT}`);
  });

  test("Should remove aupay method when totalPrice is 400,000", () => {
    const result = paymentService.buildPaymentMethod(400000);
    expect(result).toBe(`${PaymentMethod.CREDIT},${PaymentMethod.PAYPAY}`);
  });

  test("Should call window.open with correct URL in payViaLink", async () => {
    const paymentService = new PaymentService();
    const order: Order = {
      id: "12345",
      totalPrice: 100000,
      paymentMethod: PaymentMethod.CREDIT,
      items: [],
      couponId: "SALE20OFF",
    };

    const windowOpenSpy = vi
      .spyOn(window, "open")
      .mockImplementation(() => null);

    await paymentService.payViaLink(order);

    expect(windowOpenSpy).toHaveBeenCalledWith(
      `https://payment.example.com/pay?orderId=${order.id}`,
      "_blank"
    );
  });
});
