"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { toast } from "sonner";
import { getWhatsAppUrl } from "@/lib/utils";

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate form submission
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Message sent! We'll get back to you within 24 hours.");
    (e.target as HTMLFormElement).reset();
    setIsLoading(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb items={[{ label: "Contact Us" }]} className="mb-6" />

      <h1 className="text-3xl md:text-4xl font-bold mb-8">Contact Us</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <p className="text-muted leading-relaxed">
            We&apos;d love to hear from you. Whether you have a question about our products, orders,
            or anything else, our team is ready to help.
          </p>

          <div className="space-y-6">
            {[
              { icon: Phone, label: "Phone / WhatsApp", value: "0327-6796087" },
              { icon: Mail, label: "Email", value: "info@fashionpalette.pk" },
              { icon: MapPin, label: "Address", value: "Lahore, Pakistan" },
              { icon: Clock, label: "Business Hours", value: "Mon - Sat: 10 AM - 8 PM" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-sm text-muted">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-lg font-semibold text-sm hover:bg-[#20bd5a] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Chat on WhatsApp
          </a>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-surface p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-4">Send us a Message</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" name="name" placeholder="Your name" required />
            <Input label="Email" name="email" type="email" placeholder="your@email.com" required />
          </div>
          <Input label="Phone" name="phone" placeholder="03XX-XXXXXXX" />
          <Input label="Subject" name="subject" placeholder="How can we help?" required />
          <div>
            <label className="block text-sm font-medium mb-1.5">Message</label>
            <textarea
              name="message"
              rows={5}
              className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
              placeholder="Your message..."
              required
            />
          </div>
          <Button type="submit" isLoading={isLoading} className="w-full">
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
}
