"use client";
import React from "react";
import { Check } from "lucide-react";

export interface Step {
  id: string | number;
  label: string;
  description?: string;
  isCompleted?: boolean;
  isOptional?: boolean;
}

export interface StepIndicatorProps {
  steps: Step[];
  currentStep: string | number;
  variant?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  showDescriptions?: boolean;
  className?: string;
  stepClassName?: string;
  lineClassName?: string;
  completedColor?: string;
  activeColor?: string;
  inactiveColor?: string;
  // eslint-disable-next-line no-unused-vars
  onStepClick?: (stepId: string | number) => void;
  allowClickableSteps?: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  variant = "horizontal",
  size = "md",
  showLabels = true,
  showDescriptions = false,
  className = "",
  stepClassName = "",
  lineClassName = "",
  completedColor = "bg-blue-500",
  activeColor = "bg-blue-500",
  inactiveColor = "bg-gray-200",
  onStepClick,
  allowClickableSteps = false,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          circle: "w-6 h-6 text-xs",
          label: "text-xs",
          description: "text-xs",
        };
      case "lg":
        return {
          circle: "w-10 h-10 text-base",
          label: "text-base",
          description: "text-sm",
        };
      default:
        return {
          circle: "w-8 h-8 text-sm",
          label: "text-sm",
          description: "text-xs",
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const getStepStatus = (step: Step) => {
    if (step.isCompleted) return "completed";
    if (step.id === currentStep) return "active";
    return "inactive";
  };

  const getStepStyles = (status: string) => {
    switch (status) {
      case "completed":
        return {
          circle: `${completedColor} text-white`,
          text: "text-blue-500",
        };
      case "active":
        return {
          circle: `${activeColor} text-white`,
          text: "text-blue-500",
        };
      default:
        return {
          circle: `${inactiveColor} text-gray-600`,
          text: "text-gray-400",
        };
    }
  };

  const handleStepClick = (stepId: string | number) => {
    if (allowClickableSteps && onStepClick) {
      onStepClick(stepId);
    }
  };

  const renderStep = (step: Step, index: number) => {
    const status = getStepStatus(step);
    const styles = getStepStyles(status);
    const isClickable = allowClickableSteps && onStepClick;

    return (
      <div
        key={step.id}
        className={`flex ${
          variant === "horizontal" ? "items-center" : "flex-col"
        } ${stepClassName}`}
      >
        {/* Step Circle */}
        <div
          className={`${sizeClasses.circle} rounded-full flex items-center justify-center font-semibold ${
            styles.circle
          } ${isClickable ? "cursor-pointer hover:opacity-80" : ""} transition-all duration-200`}
          onClick={() => handleStepClick(step.id)}
        >
          {status === "completed" ? (
            <Check className="w-4 h-4" />
          ) : (
            <span>{index + 1}</span>
          )}
        </div>

        {/* Step Content */}
        {(showLabels || showDescriptions) && (
          <div
            className={`${
              variant === "horizontal" ? "ml-2" : "mt-2 text-center"
            }`}
          >
            {showLabels && (
              <div
                className={`font-medium ${styles.text} ${sizeClasses.label}`}
              >
                {step.label}
                {step.isOptional && (
                  <span className="text-gray-400 ml-1">(Optional)</span>
                )}
              </div>
            )}
            {showDescriptions && step.description && (
              <div className={`text-gray-500 mt-1 ${sizeClasses.description}`}>
                {step.description}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderConnector = (index: number) => {
    if (index === steps.length - 1) return null;

    const baseClasses =
      variant === "horizontal" ? "flex-1 h-px" : "w-px h-8 ml-4";

    return <div className={`${baseClasses} bg-gray-200 ${lineClassName}`} />;
  };

  if (variant === "vertical") {
    return (
      <div className={`flex flex-col ${className}`}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {renderStep(step, index)}
            {renderConnector(index)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {renderStep(step, index)}
          {renderConnector(index)}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;
