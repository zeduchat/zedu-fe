export type HomeFAQ = {
  id: string;
  question: string;
  answer: string;
};

export const homeFAQs: HomeFAQ[] = [
  {
    id: "item-1",
    question: "What is Zedu?",
    answer:
      "Zedu is a communication and learning platform built for schools, bootcamps, and training programs. It combines structured channels, learning workflows, and AI-powered support to help educators teach and learners stay engaged.",
  },
  {
    id: "item-2",
    question: "How does Zedu support students and learners?",
    answer:
      "Zedu supports learners with organized class spaces, timely reminders, searchable learning materials, and quick help through AI assistants. Students can follow lessons, ask questions, and track progress in one place.",
  },
  {
    id: "item-3",
    question: "Is Zedu difficult to set up for a school or bootcamp?",
    answer:
      "No. Zedu is designed for quick onboarding with simple setup steps, guided workspace creation, and role-based controls. Most teams can start running cohorts or classes in a short time.",
  },
  {
    id: "item-4",
    question: "Can Zedu use our institution’s information to answer questions?",
    answer:
      "Yes. You can connect your institutional content such as course documents, policies, and internal resources so AI assistants can provide responses grounded in your own approved materials.",
  },
  {
    id: "item-5",
    question: "Is student support fully automated?",
    answer:
      "No. Zedu uses a hybrid model where AI handles routine questions and guidance, while educators and staff remain in control for mentoring, grading, and sensitive support decisions.",
  },
  {
    id: "item-6",
    question: "How does pricing work for educational institutions?",
    answer:
      "Pricing is flexible based on your institution size, usage needs, and required features. Zedu offers plans for growing cohorts and custom options for larger schools or multi-program organisations.",
  },
];

export const pricingFAQs: HomeFAQ[] = [
  {
    id: "pricing-faq-1",
    question: "Do we pay per student or a flat rate per workspace?",
    answer:
      "Zedu does not charge punitive per-student seat fees on standard plans. Unlike corporate chat platforms that bill $7–$15 per user each month, Zedu offers predictable tiered plans with unlimited participants, so your educational budget remains predictable even as your cohorts grow.",
  },
  {
    id: "pricing-faq-2",
    question: "Can we switch plans or pause between cohorts?",
    answer:
      "Yes. Bootcamps and academic terms run on cyclical schedules, so you can upgrade for an active cohort and switch plans or pause directly in your workspace billing settings. All changes take effect at the end of your current billing period.",
  },
  {
    id: "pricing-faq-3",
    question: "Is there a free trial, and do I need a credit card to start?",
    answer:
      "No credit card is required. You can launch a free workspace on the Starter plan immediately with organized channels, file sharing, and direct messaging. When you need expanded cohorts, higher AI credit allocations, and advanced moderation tools, you can easily upgrade to Pro.",
  },
  {
    id: "pricing-faq-4",
    question: "How do AI credits work across plans?",
    answer:
      "Every plan includes a monthly allocation of AI credits for automated class summaries, learner Q&A, and study assistants. If your workspace exhausts its monthly allotment, all core communication (messaging, audio, and files) continues without interruption, and admins can top up extra credits at any time.",
  },
  {
    id: "pricing-faq-5",
    question:
      "Do you offer discounts for schools, non-profits, or student clubs?",
    answer:
      "Yes. We offer special educational rates and grants for accredited K-12 schools, registered non-profit educational initiatives, and student-run hackathons. Contact our sales team with proof of non-profit or institutional affiliation to apply.",
  },
  {
    id: "pricing-faq-6",
    question: "What payment methods and currencies are supported?",
    answer:
      "We accept all major credit and debit cards (Visa, Mastercard, American Express) via secure Stripe processing, with support for local and international billing. Annual and Enterprise institutional contracts can also be settled via direct invoice and bank transfer.",
  },
  {
    id: "pricing-faq-7",
    question: "What happens to our cohort data and channels if we downgrade?",
    answer:
      "All your cohort channels, message histories, uploaded resources, and student submissions remain securely saved and accessible. Downgrading only adjusts feature limits (such as monthly AI credit allotments); you will never lose access to your previous cohort archives.",
  },
];
