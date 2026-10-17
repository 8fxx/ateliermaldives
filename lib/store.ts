import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/db/schema";

export const CURRENCY = "USD";

// Delivery pricing (minor units). Pickup is always free.
export const DELIVERY_FEE = 500;
export const FREE_DELIVERY_FROM = 15000;

export const shippingFor = (fulfilment: "delivery" | "pickup", subtotal: number) =>
  fulfilment === "pickup" || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;

export function formatPrice(minor: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: CURRENCY }).format(minor / 100);
}

export const orderNumber = (id: number) => `AM-${1000 + id}`;

export const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  ready: "Ready for pickup",
  shipped: "Out for delivery",
  delivered: "Completed",
  cancelled: "Cancelled",
};

export const paymentLabels: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  refunded: "Refunded",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  bank_transfer: "Bank transfer",
  cash_on_delivery: "Cash on delivery / pickup",
};

export const PICKUP_LOCATION = process.env.NEXT_PUBLIC_PICKUP_LOCATION ?? "Atelier Maldives studio, Malé";
