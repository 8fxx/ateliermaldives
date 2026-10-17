import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { DELIVERY_FEE, FREE_DELIVERY_FROM, PICKUP_LOCATION } from "@/lib/store";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  return (
    <CheckoutForm
      defaults={{ contactName: user.name, contactPhone: user.phone ?? "" }}
      config={{ deliveryFee: DELIVERY_FEE, freeDeliveryFrom: FREE_DELIVERY_FROM, pickupLocation: PICKUP_LOCATION }}
    />
  );
}
