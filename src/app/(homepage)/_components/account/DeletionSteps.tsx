import React from "react";
import { CheckCircle2, UserX, Mail, Clock, Trash2 } from "lucide-react";

const DeletionSteps = () => {
  const steps = [
    {
      icon: UserX,
      title: "Submit Request",
      description:
        "Fill out the account deletion request form below with your registered email address and reason for deletion.",
      color: "purple",
    },
    {
      icon: Mail,
      title: "Email Verification",
      description:
        "You will receive a confirmation email to verify your identity and confirm your deletion request.",
      color: "blue",
    },
    {
      icon: Clock,
      title: "30-Day Grace Period",
      description:
        "Your account will be deactivated immediately. You have 30 days to change your mind and reactivate it.",
      color: "amber",
    },
    {
      icon: Trash2,
      title: "Permanent Deletion",
      description:
        "After 30 days, all your data will be permanently deleted from our systems. This action cannot be reversed.",
      color: "red",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      purple: {
        bg: "bg-purple-100",
        text: "text-purple-600",
        border: "border-purple-200",
      },
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      amber: {
        bg: "bg-amber-100",
        text: "text-amber-600",
        border: "border-amber-200",
      },
      red: {
        bg: "bg-red-100",
        text: "text-red-600",
        border: "border-red-200",
      },
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-100 rounded-full mb-6">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">
              How It Works
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Account Deletion Process
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Follow these simple steps to request deletion of your Zedu account
            and associated data
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((step, index) => {
            const colors = getColorClasses(step.color);
            const Icon = step.icon;

            return (
              <div
                key={index}
                className="relative bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 border border-gray-100 group"
              >
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 ${colors.bg} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-8 h-8 ${colors.text}`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Decorative Element */}
                <div
                  className={`absolute bottom-0 left-0 w-full h-1 ${colors.bg} rounded-b-2xl`}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Timeline Connector (Desktop Only) */}
        <div className="hidden md:block absolute left-1/2 top-0 w-0.5 h-full bg-gradient-to-b from-purple-200 via-blue-200 to-red-200 -z-10"></div>
      </div>
    </section>
  );
};

export default DeletionSteps;
