import { useState } from "react";
import { Link, Minus, Plus } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import type { HomeFAQ } from "../../../_lib/faqData";

type FAQAccordionItemProps = {
  faq: HomeFAQ;
  isOpen: boolean;
  answerFragment?: string;
};

export const FAQAccordionItem = ({
  faq,
  isOpen,
  answerFragment,
}: FAQAccordionItemProps) => {
  const [copyStatus, setCopyStatus] = useState({ message: "", attempt: 0 });

  const copyAnswerLink = async () => {
    if (!answerFragment) return;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }

      const url = new URL(window.location.href);
      url.hash = answerFragment;
      await navigator.clipboard.writeText(url.toString());
      setCopyStatus(({ attempt }) => ({
        message: "Answer link copied to clipboard.",
        attempt: attempt + 1,
      }));
    } catch {
      setCopyStatus(({ attempt }) => ({
        message: "Could not copy the answer link. Please try again.",
        attempt: attempt + 1,
      }));
    }
  };

  const trigger = (
    <AccordionTrigger className="px-4 py-4 text-sm font-semibold text-[#101828] hover:no-underline sm:px-6 sm:py-6 sm:text-base">
      {faq.question}
      <span className="text-[#7141F8]">
        {isOpen ? (
          <Minus className="h-5 w-5 sm:h-6 sm:w-6" />
        ) : (
          <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
        )}
      </span>
    </AccordionTrigger>
  );

  return (
    <AccordionItem
      id={answerFragment}
      value={faq.id}
      className="scroll-mt-28 overflow-hidden rounded-xl border border-[#E5E8FF] bg-[#FAFAFF]"
    >
      {answerFragment ? (
        <div className="flex items-center [&>h3]:min-w-0 [&>h3]:flex-1">
          {trigger}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={copyAnswerLink}
            aria-label={`Copy link to answer: ${faq.question}`}
            className="mr-2 shrink-0 text-primary-500 hover:bg-primary-50 hover:text-primary-400 sm:mr-4"
          >
            <Link aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only sm:ml-2 sm:not-sr-only">Copy link</span>
          </Button>
        </div>
      ) : (
        trigger
      )}
      <AccordionContent className="px-4 text-sm font-normal text-[#344054] sm:px-6 sm:text-base">
        {faq.answer}
      </AccordionContent>
      {answerFragment && (
        <span
          key={copyStatus.attempt}
          role="status"
          aria-live="polite"
          className="sr-only"
        >
          {copyStatus.message}
        </span>
      )}
    </AccordionItem>
  );
};
