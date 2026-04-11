"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check, ChevronRight } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useCart } from "@/hooks/useCart";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { FREE_DELIVERY_THRESHOLD, DEFAULT_DELIVERY_CHARGES, PROVINCES, CITIES } from "@/lib/constants";
import { toast } from "sonner";

const steps = ["Shipping", "Payment", "Review"];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    paymentMethod: "cod",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  const subtotal = getSubtotal();
  const deliveryCharges = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_CHARGES;
  const total = subtotal + deliveryCharges;

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/"><Button>Continue Shopping</Button></Link>
      </div>
    );
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateShipping = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.fullName) newErrors.fullName = "Name is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    else if (!/^03\d{9}$/.test(formData.phone)) newErrors.phone = "Enter valid phone (03XXXXXXXXX)";
    if (!formData.addressLine1) newErrors.addressLine1 = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.province) newErrors.province = "Province is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 0 && !validateShipping()) return;
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const orderItems = items.map((item) => {
        const price = item.product.salePrice ? parseFloat(item.product.salePrice) : parseFloat(item.product.basePrice);
        return {
          productId: item.productId,
          variantId: item.variantId,
          productName: item.product.name,
          productImage: item.product.images?.[0]?.imageUrl || "/images/placeholder/product-1.jpg",
          size: item.variant?.size || null,
          color: item.variant?.color || null,
          quantity: item.quantity,
          unitPrice: price.toFixed(2),
        };
      });

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          shippingAddress: {
            fullName: formData.fullName,
            phone: formData.phone,
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2 || undefined,
            city: formData.city,
            province: formData.province,
            postalCode: formData.postalCode || undefined,
          },
          paymentMethod: formData.paymentMethod,
          notes: formData.notes || undefined,
          items: orderItems,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      clearCart();
      toast.success(`Order ${data.orderNumber} placed successfully!`);
      router.push(`/account/orders?new=${data.orderNumber}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const provinceOptions = PROVINCES.map((p) => ({ value: p, label: p }));
  const cityOptions = CITIES.map((c) => ({ value: c, label: c }));

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} className="mb-6" />

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
              i < currentStep ? "bg-success text-white" : i === currentStep ? "bg-accent text-white" : "bg-surface text-muted"
            )}>
              {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={cn("text-sm font-medium hidden sm:inline", i === currentStep ? "text-primary" : "text-muted")}>{step}</span>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-muted mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Shipping Information</h2>
              <Input label="Email Address" id="email" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} error={errors.email} placeholder="you@example.com" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" id="fullName" value={formData.fullName} onChange={(e) => updateField("fullName", e.target.value)} error={errors.fullName} placeholder="Your full name" />
                <Input label="Phone Number" id="phone" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} error={errors.phone} placeholder="03XXXXXXXXX" />
              </div>
              <Input label="Address" id="addressLine1" value={formData.addressLine1} onChange={(e) => updateField("addressLine1", e.target.value)} error={errors.addressLine1} placeholder="House no, street, area" />
              <Input label="Address Line 2 (Optional)" id="addressLine2" value={formData.addressLine2} onChange={(e) => updateField("addressLine2", e.target.value)} placeholder="Apartment, suite, etc." />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select label="Province" id="province" options={provinceOptions} value={formData.province} onChange={(e) => updateField("province", e.target.value)} error={errors.province} placeholder="Select province" />
                <Select label="City" id="city" options={cityOptions} value={formData.city} onChange={(e) => updateField("city", e.target.value)} error={errors.city} placeholder="Select city" />
                <Input label="Postal Code (Optional)" id="postalCode" value={formData.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} placeholder="e.g. 54000" />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleNext} size="lg">Continue to Payment</Button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Payment Method</h2>
              {[
                { id: "cod", label: "Cash on Delivery (COD)", desc: "Pay when you receive your order" },
                { id: "bank_transfer", label: "Bank Transfer", desc: "Transfer to our bank account and share receipt" },
              ].map((method) => (
                <label key={method.id} className={cn(
                  "flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors",
                  formData.paymentMethod === method.id ? "border-accent bg-accent/5" : "border-border hover:border-muted"
                )}>
                  <input type="radio" name="paymentMethod" value={method.id} checked={formData.paymentMethod === method.id} onChange={(e) => updateField("paymentMethod", e.target.value)} className="mt-1 text-accent focus:ring-accent" />
                  <div>
                    <p className="font-semibold text-sm">{method.label}</p>
                    <p className="text-xs text-muted mt-0.5">{method.desc}</p>
                  </div>
                </label>
              ))}
              {formData.paymentMethod === "bank_transfer" && (
                <div className="bg-surface p-4 rounded-lg text-sm space-y-1">
                  <p className="font-semibold">Bank Account Details:</p>
                  <p className="text-muted">Bank: Meezan Bank</p>
                  <p className="text-muted">Account Title: Fashion Palette</p>
                  <p className="text-muted">Account No: 0123456789</p>
                  <p className="text-muted">IBAN: PK00MEZN0000000123456789</p>
                  <p className="text-xs text-accent mt-2">Please share the payment receipt via WhatsApp after transfer.</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5">Order Notes (Optional)</label>
                <textarea value={formData.notes} onChange={(e) => updateField("notes", e.target.value)} rows={3} className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:border-accent resize-none" placeholder="Special instructions..." />
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>Back</Button>
                <Button onClick={handleNext} size="lg">Review Order</Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Review Your Order</h2>
              <div className="bg-surface p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-sm">Shipping To:</h3>
                <p className="text-sm text-muted">{formData.fullName}</p>
                <p className="text-sm text-muted">{formData.addressLine1}{formData.addressLine2 && `, ${formData.addressLine2}`}</p>
                <p className="text-sm text-muted">{formData.city}, {formData.province}</p>
                <p className="text-sm text-muted">{formData.phone} | {formData.email}</p>
              </div>
              <div className="bg-surface p-4 rounded-lg">
                <h3 className="font-semibold text-sm mb-2">Payment: {formData.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}</h3>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Items ({items.length}):</h3>
                {items.map((item) => {
                  const price = item.product.salePrice ? parseFloat(item.product.salePrice) : parseFloat(item.product.basePrice);
                  return (
                    <div key={`${item.productId}-${item.variantId}`} className="flex items-center gap-3 text-sm">
                      <div className="w-12 h-14 bg-surface relative overflow-hidden flex-shrink-0">
                        <Image src={getImageUrl(item.product.images?.[0]?.imageUrl)} alt={item.product.name} fill className="object-cover" sizes="48px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted">Qty: {item.quantity}{item.variant?.size && ` | Size: ${item.variant.size}`}</p>
                      </div>
                      <p className="font-semibold">{formatPrice(price * item.quantity)}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>Back</Button>
                <Button onClick={handlePlaceOrder} isLoading={isSubmitting} size="lg">Place Order</Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-surface p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Delivery</span><span className={deliveryCharges === 0 ? "text-success font-medium" : "font-medium"}>{deliveryCharges === 0 ? "FREE" : formatPrice(deliveryCharges)}</span></div>
              <hr className="border-border" />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
