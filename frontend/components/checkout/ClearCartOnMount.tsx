"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-store";

/**
 * Clears the cart once, on mount. Rendered on the order-success page so that
 * customers returning from the Stripe hosted checkout land with an empty cart.
 */
export function ClearCartOnMount() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
