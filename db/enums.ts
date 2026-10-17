// Plain constants with no database imports, so client components can use them too.
export const ROLES = ["customer", "staff", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const CATEGORIES = ["Tops", "Bottoms", "Accessories"] as const;

export const ORDER_STATUSES = ["pending", "confirmed", "ready", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export const PAYMENT_METHODS = ["bank_transfer", "cash_on_delivery"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export const FULFILMENT = ["delivery", "pickup"] as const;
