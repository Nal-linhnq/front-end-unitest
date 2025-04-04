import { Order } from "../models/order.model";
import { PaymentService } from "./payment.service";

export class OrderService {
  constructor(private readonly paymentService: PaymentService) {}

  async process(order: Partial<Order>) {
    if (!order.items?.length) {
      throw new Error("Order items are required");
    }

    if (order.items.some((item) => item.price <= 0 || item.quantity <= 0)) {
      throw new Error("Order items are invalid");
    }

    let totalPrice = order.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    if (order.couponId) {
      try {
        const response = await fetch(
          `https://67eb7353aa794fb3222a4c0e.mockapi.io/coupons/${order.couponId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch coupon");
        }

        const coupon = await response.json();

        if (!coupon) {
          throw new Error("Invalid coupon");
        }

        totalPrice -= coupon.discount;

        if (totalPrice < 0) {
          totalPrice = 0;
        }
      } catch (error) {
        console.error("Error applying coupon");
      }
    }

    const orderPayload = {
      ...order,
      totalPrice,
      paymentMethod: this.paymentService.buildPaymentMethod(totalPrice),
    };

    try {
      const orderResponse = await fetch(
        "https://67eb7353aa794fb3222a4c0e.mockapi.io/order",
        {
          method: "POST",
          body: JSON.stringify(orderPayload),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const createdOrder = await orderResponse.json();

      this.paymentService.payViaLink(createdOrder);
    } catch (error) {
      console.error("Error creating order");
    }
  }
}
