interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export default function StepIndicator({
  currentStep,
  totalSteps,
  className = "",
}: StepIndicatorProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <p className="text-sm text-gray-500">
        Step <span className="text-black">{currentStep}</span> of {totalSteps}
      </p>
      <div className="flex items-center justify-center gap-2 mt-2">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`h-1 w-10 rounded-full ${
              index < currentStep ? "bg-orange-500" : "bg-orange-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
