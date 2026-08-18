import { Minus, Plus } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import type { HomeFAQ } from "../../../_lib/faqData";

type FAQAccordionItemProps = {
  faq: HomeFAQ;
  isOpen: boolean;
};

export const FAQAccordionItem = ({ faq, isOpen }: FAQAccordionItemProps) => {
  return (
    <AccordionItem
      value={faq.id}
      className="overflow-hidden rounded-xl border border-[#E5E8FF] bg-[#FAFAFF]"
    >
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
      <AccordionContent className="px-4 text-sm font-normal text-[#344054] sm:px-6 sm:text-base">
        {faq.answer}
      </AccordionContent>
    </AccordionItem>
  );
};
