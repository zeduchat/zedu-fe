"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { cn } from "~/lib/utils";

type CoinFAQ = {
  id: string;
  question: string;
  answer: string;
};

/**
 * Pre-launch explainer for Zedu Coin (ZDU).
 *
 * Deliberately read-only: no price, wallet or purchase action while ZDU is
 * pre-launch. The value line is the approved wording and nothing here claims
 * the token will appreciate.
 */
const ZDU_FAQS: CoinFAQ[] = [
  {
    id: "zdu-what",
    question: "What is ZDU?",
    answer:
      "Zedu Learning’s blockchain payment token. At launch it will be how you pay for in-app purchases and subscription renewals.",
  },
  {
    id: "zdu-when",
    question: "When can I use it?",
    answer:
      "Coming soon, when Zedu Learning launches. It isn’t available to buy or use yet.",
  },
  {
    id: "zdu-value",
    question: "What about the value?",
    answer: "Prices are subject to fluctuation.",
  },
  {
    id: "zdu-today",
    question: "How do I pay today?",
    answer:
      "Card payments for AI Credits continue as normal until ZDU launches.",
  },
];

export const ZeduCoinSection = () => {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <section
      id="zedu-coin"
      className="relative isolate flex w-full flex-col items-center gap-10 overflow-hidden px-4 py-12 text-center sm:gap-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="rounded-full border border-[#E5E8FF] bg-primary-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary-500">
          Pre-launch
        </span>
        <h2 className="text-center text-3xl font-bold leading-tight text-[#101828] sm:text-4xl lg:text-5xl">
          Zedu Coin <span className="text-primary-500">(ZDU)</span>
        </h2>
        <p className="max-w-2xl text-base text-[#475467] sm:text-lg">
          Zedu Learning’s blockchain payment token for in-app purchases and
          subscription renewals — coming soon.
        </p>
      </div>

      <div className="w-full max-w-3xl text-left">
        <Accordion
          type="single"
          collapsible
          value={openItem || ""}
          onValueChange={(value) => setOpenItem(value || null)}
          className="space-y-4"
        >
          {ZDU_FAQS.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="overflow-hidden rounded-xl border border-[#E5E8FF] bg-white shadow-sm"
            >
              <AccordionTrigger
                className={cn(
                  "items-center px-6 py-5 text-lg font-semibold text-[#101828] hover:no-underline sm:px-8 sm:py-6 sm:text-xl",
                  openItem === faq.id && "bg-primary-50"
                )}
              >
                {faq.question}
                <span className="ml-4 shrink-0 text-primary-500">
                  {openItem === faq.id ? (
                    <Minus className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 text-base leading-relaxed text-[#475467] sm:px-8 sm:pb-8 sm:pt-3 sm:text-lg">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="mt-6 text-center text-sm font-medium text-[#475467]">
          Prices are subject to fluctuation.
        </p>
      </div>
    </section>
  );
};
