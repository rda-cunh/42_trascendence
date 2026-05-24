import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/app/core/contexts/AuthContext";
import { useCart } from "@/app/core/contexts/CartContext";
import { api } from "@/app/core/lib/api";
import { Trash2, CreditCard, ArrowLeft, LockKeyhole, MapPin, User } from "lucide-react";
import { ImageWithFallback } from "@/app/shared/components/figma/ImageWithFallback";
import { resolveImageUrl } from "@/app/core/lib/images";
import { toast } from "sonner";
import { Link } from "react-router";

type StripeElementType = "cardNumber" | "cardExpiry" | "cardCvc";

interface StripeElementChangeEvent {
  complete: boolean;
  error?: { message?: string };
  brand?: string;
}

interface StripeCardElement {
  mount: (domElement: HTMLElement) => void;
  destroy: () => void;
  on: (event: "change", handler: (event: StripeElementChangeEvent) => void) => void;
}

interface StripeElements {
  create: (type: StripeElementType, options?: Record<string, unknown>) => StripeCardElement;
}

interface StripeBillingDetails {
  name: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

interface StripePaymentMethod {
  id: string;
  card?: {
    brand?: string;
    last4?: string;
    exp_month?: number;
    exp_year?: number;
  };
}

interface Stripe {
  elements: (options?: Record<string, unknown>) => StripeElements;
  createPaymentMethod: (options: {
    type: "card";
    card: StripeCardElement;
    billing_details: StripeBillingDetails;
  }) => Promise<{ paymentMethod?: StripePaymentMethod; error?: { message?: string } }>;
}

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => Stripe;
  }
}

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const STRIPE_SCRIPT_ID = "stripe-js-v3";
const STRIPE_INPUT_STYLE = {
  base: {
    color: "#111827",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    fontSize: "16px",
    "::placeholder": {
      color: "#9ca3af",
    },
  },
  invalid: {
    color: "#dc2626",
  },
};

const DEFAULT_BILLING = {
  name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
};

export function Checkout() {
  const { items, removeItem, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [billing, setBilling] = useState({
    ...DEFAULT_BILLING,
    name: user?.name ?? "",
  });
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [cardNumberElement, setCardNumberElement] = useState<StripeCardElement | null>(null);
  const [stripeError, setStripeError] = useState<string | null>(
    STRIPE_PUBLISHABLE_KEY ? null : "Stripe publishable key is not configured."
  );
  const [cardStatus, setCardStatus] = useState({
    numberComplete: false,
    expiryComplete: false,
    cvcComplete: false,
    brand: "",
  });
  const cardNumberRef = useRef<HTMLDivElement | null>(null);
  const cardExpiryRef = useRef<HTMLDivElement | null>(null);
  const cardCvcRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!STRIPE_PUBLISHABLE_KEY) {
      return;
    }

    let isMounted = true;
    let createdElements: StripeCardElement[] = [];

    const initializeStripe = () => {
      if (!isMounted || !window.Stripe) return;
      const stripeClient = window.Stripe(STRIPE_PUBLISHABLE_KEY);
      const elements = stripeClient.elements({ locale: "auto" });
      const elementOptions = { style: STRIPE_INPUT_STYLE };
      const numberElement = elements.create("cardNumber", {
        ...elementOptions,
        showIcon: true,
        placeholder: "1234 1234 1234 1234",
      });
      const expiryElement = elements.create("cardExpiry", elementOptions);
      const cvcElement = elements.create("cardCvc", elementOptions);

      if (!cardNumberRef.current || !cardExpiryRef.current || !cardCvcRef.current) return;

      numberElement.mount(cardNumberRef.current);
      expiryElement.mount(cardExpiryRef.current);
      cvcElement.mount(cardCvcRef.current);

      numberElement.on("change", (event) => {
        setStripeError(event.error?.message ?? null);
        setCardStatus((current) => ({
          ...current,
          numberComplete: event.complete,
          brand: event.brand ?? current.brand,
        }));
      });
      expiryElement.on("change", (event) => {
        setStripeError(event.error?.message ?? null);
        setCardStatus((current) => ({ ...current, expiryComplete: event.complete }));
      });
      cvcElement.on("change", (event) => {
        setStripeError(event.error?.message ?? null);
        setCardStatus((current) => ({ ...current, cvcComplete: event.complete }));
      });

      createdElements = [numberElement, expiryElement, cvcElement];
      setStripe(stripeClient);
      setCardNumberElement(numberElement);
    };

    const existingScript = document.getElementById(STRIPE_SCRIPT_ID) as HTMLScriptElement | null;

    if (window.Stripe) {
      initializeStripe();
    } else if (existingScript) {
      existingScript.addEventListener("load", initializeStripe);
    } else {
      const script = document.createElement("script");
      script.id = STRIPE_SCRIPT_ID;
      script.src = "https://js.stripe.com/v3/";
      script.async = true;
      script.addEventListener("load", initializeStripe);
      script.addEventListener("error", () => {
        if (isMounted) setStripeError("Stripe could not be loaded. Check your connection.");
      });
      document.head.appendChild(script);
    }

    return () => {
      isMounted = false;
      createdElements.forEach((element) => element.destroy());
      existingScript?.removeEventListener("load", initializeStripe);
    };
  }, []);

  const handleBillingChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setBilling((current) => ({ ...current, [name]: value }));
  };

  const getBillingDetails = (): StripeBillingDetails => ({
    name: billing.name.trim(),
    address: {
      line1: billing.line1.trim(),
      ...(billing.line2.trim() ? { line2: billing.line2.trim() } : {}),
      city: billing.city.trim(),
      state: billing.state.trim(),
      postal_code: billing.postalCode.trim(),
      country: billing.country,
    },
  });

  const validateCheckout = () => {
    const requiredFields: Array<[keyof typeof billing, string]> = [
      ["name", "Name on card"],
      ["line1", "Billing address"],
      ["city", "City"],
      ["state", "State or region"],
      ["postalCode", "Postal code"],
      ["country", "Country"],
    ];
    const missingField = requiredFields.find(([field]) => !billing[field].trim());

    if (missingField) {
      toast.error(`${missingField[1]} is required`);
      return false;
    }

    if (!stripe || !cardNumberElement) {
      toast.error(stripeError ?? "Stripe is still loading");
      return false;
    }

    if (!cardStatus.numberComplete || !cardStatus.expiryComplete || !cardStatus.cvcComplete) {
      toast.error(stripeError ?? "Complete your card details");
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const buyerId = Number(user?.id);
    if (!Number.isFinite(buyerId)) {
      toast.error("Unable to identify buyer account");
      return;
    }

    if (!validateCheckout()) return;

    if (!user?.id) {
      toast.error("You must be signed in to place an order");
      return;
    }

    setIsProcessing(true);
    try {
      const billingDetails = getBillingDetails();
      const { paymentMethod, error } = await stripe!.createPaymentMethod({
        type: "card",
        card: cardNumberElement!,
        billing_details: billingDetails,
      });

      if (error || !paymentMethod) {
        throw new Error(error?.message ?? "Unable to authorize payment method");
      }

      await api.createOrder({
        user_id: buyerId,
        items: items.map((i: (typeof items)[number]) => ({
          product_id: Number(i.listing.id),
          qty: i.quantity,
        })),
        payment_provider: "stripe",
        stripe_payment_method_id: paymentMethod.id,
        payment_method: {
          brand: paymentMethod.card?.brand,
          last4: paymentMethod.card?.last4,
          exp_month: paymentMethod.card?.exp_month,
          exp_year: paymentMethod.card?.exp_year,
        },
        billing_details: billingDetails,
      });

      clear();
      toast.success("Payment authorized and order placed successfully!");
      navigate("/orders");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to place order";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="app-page flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Your cart is empty
          </h2>
          <Link to="/" className="text-purple-600 hover:underline dark:text-purple-400">
            Browse assets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="app-container-narrow">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>

        <h1 className="page-title mb-8">Checkout</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="surface-padded">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Order Summary
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.listing.id}
                    className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0 dark:border-gray-800"
                  >
                    <ImageWithFallback
                      src={resolveImageUrl(item.listing.image)}
                      alt={item.listing.title}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900 dark:text-white">
                        {item.listing.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.listing.category} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${(item.listing.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.listing.id)}
                        className="text-gray-400 transition-colors hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-padded">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Billing information
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Used by Stripe to verify your payment.
                  </p>
                </div>
                <LockKeyhole className="h-5 w-5 text-gray-400" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="billing-name" className="form-label">
                    Name on card
                  </label>
                  <div className="relative">
                    <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="billing-name"
                      name="name"
                      value={billing.name}
                      onChange={handleBillingChange}
                      className="form-control-icon"
                      autoComplete="cc-name"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="billing-line1" className="form-label">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="billing-line1"
                      name="line1"
                      value={billing.line1}
                      onChange={handleBillingChange}
                      className="form-control-icon"
                      autoComplete="billing address-line1"
                      placeholder="123 Market Street"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="billing-line2" className="form-label">
                    Apartment, suite, etc. (optional)
                  </label>
                  <input
                    id="billing-line2"
                    name="line2"
                    value={billing.line2}
                    onChange={handleBillingChange}
                    className="form-control"
                    autoComplete="billing address-line2"
                    placeholder="Suite 400"
                  />
                </div>
                <div>
                  <label htmlFor="billing-city" className="form-label">
                    City
                  </label>
                  <input
                    id="billing-city"
                    name="city"
                    value={billing.city}
                    onChange={handleBillingChange}
                    className="form-control"
                    autoComplete="billing address-level2"
                    placeholder="San Francisco"
                  />
                </div>
                <div>
                  <label htmlFor="billing-state" className="form-label">
                    State / region
                  </label>
                  <input
                    id="billing-state"
                    name="state"
                    value={billing.state}
                    onChange={handleBillingChange}
                    className="form-control"
                    autoComplete="billing address-level1"
                    placeholder="CA"
                  />
                </div>
                <div>
                  <label htmlFor="billing-postal-code" className="form-label">
                    Postal code
                  </label>
                  <input
                    id="billing-postal-code"
                    name="postalCode"
                    value={billing.postalCode}
                    onChange={handleBillingChange}
                    className="form-control"
                    autoComplete="billing postal-code"
                    placeholder="94103"
                  />
                </div>
                <div>
                  <label htmlFor="billing-country" className="form-label">
                    Country
                  </label>
                  <select
                    id="billing-country"
                    name="country"
                    value={billing.country}
                    onChange={handleBillingChange}
                    className="form-control"
                    autoComplete="billing country"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="FR">France</option>
                    <option value="DE">Germany</option>
                    <option value="PT">Portugal</option>
                    <option value="ES">Spain</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="surface-padded">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Card details
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Card data is entered securely through Stripe.
                  </p>
                </div>
                <CreditCard className="h-5 w-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="form-label">Card number</label>
                  <div
                    ref={cardNumberRef}
                    className="min-h-[44px] rounded-lg border border-gray-300 bg-white px-4 py-3 transition-colors focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/30 dark:border-gray-700"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="form-label">Expiration</label>
                    <div
                      ref={cardExpiryRef}
                      className="min-h-[44px] rounded-lg border border-gray-300 bg-white px-4 py-3 transition-colors focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/30 dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="form-label">CVC</label>
                    <div
                      ref={cardCvcRef}
                      className="min-h-[44px] rounded-lg border border-gray-300 bg-white px-4 py-3 transition-colors focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/30 dark:border-gray-700"
                    />
                  </div>
                </div>
                {stripeError ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                    {stripeError}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {cardStatus.brand
                      ? `${cardStatus.brand.toUpperCase()} card detected`
                      : "Stripe will validate the card before the order is placed."}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="surface-padded sticky top-24">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Payment</h2>
              <div className="mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 dark:border-gray-800">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="btn-primary w-full py-3"
              >
                <CreditCard className="h-5 w-5" />
                {isProcessing ? "Processing..." : "Place Order"}
              </button>
              <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                Digital delivery — instant access after purchase
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
