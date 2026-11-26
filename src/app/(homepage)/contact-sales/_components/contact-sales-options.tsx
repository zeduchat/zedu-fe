"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ContactSalesBenefits } from "./ContactSalesBenefits";
import { ContactSalesForm } from "./ContactSalesForm";
import { BookingPreview } from "./booking-preview";

export function ContactSalesOptions() {
  const [tab, setTab] = useState("enquiry");
  let bookingUrl = "";
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SALES_BOOKING_URL || "");
    if (
      url.protocol === "https:" &&
      url.hostname === "calendly.com" &&
      !url.username &&
      !url.password &&
      !url.port &&
      url.pathname.split("/").filter(Boolean).length >= 2
    )
      bookingUrl = url.href;
  } catch {
    /* Booking stays hidden until configured. */
  }
  if (!bookingUrl && process.env.NODE_ENV === "production")
    return (
      <>
        <ContactSalesBenefits />
        <ContactSalesForm />
      </>
    );
  return (
    <>
      <ContactSalesBenefits booking={tab === "demo"} />
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="min-w-0 rounded-[28px] bg-white p-6 shadow-[0_28px_60px_-18px_rgba(38,24,102,0.28)] ring-1 ring-[#6f4ef6]/5 sm:p-8 lg:p-9"
      >
        <TabsList
          aria-label="Contact sales options"
          className="mb-6 grid h-auto grid-cols-2 rounded-none border-b bg-transparent p-0"
        >
          {[
            ["enquiry", "Send an enquiry"],
            ["demo", "Book a demo"],
          ].map(([value, label]) => (
            <TabsTrigger
              key={value}
              value={value}
              id={`${value}-tab`}
              aria-controls={`${value}-panel`}
              className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-[#6f4ef6] data-[state=active]:text-[#6f4ef6] data-[state=active]:shadow-none"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div
          id="enquiry-panel"
          role="tabpanel"
          aria-labelledby="enquiry-tab"
          hidden={tab !== "enquiry"}
          tabIndex={0}
        >
          <ContactSalesForm embedded />
        </div>
        {tab === "demo" && (
          <div
            id="demo-panel"
            role="tabpanel"
            aria-labelledby="demo-tab"
            tabIndex={0}
          >
            <BookingPreview live={Boolean(bookingUrl)} />
            {bookingUrl && (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block text-sm text-[#6f4ef6] underline"
              >
                Book directly with Calendly
              </a>
            )}
          </div>
        )}
      </Tabs>
    </>
  );
}
