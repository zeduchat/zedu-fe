// components/CustomInputField.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Input } from "~/components/ui/input";
import clsx from "clsx";

type CustomInputFieldProps = {
  type: "text" | "password" | "email";
  placeholder?: string;
  value: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  label?: string;
  helpText?: string;
  isRequired?: boolean;
  maxLength?: number;
  icon?: React.ReactNode;
};

const CustomInputField: React.FC<CustomInputFieldProps> = ({
  type,
  placeholder = "",
  value,
  onChange,
  error = "",
  label,
  helpText,
  isRequired = false,
  maxLength,
  icon,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [validationError, setValidationError] = useState<string | undefined>(
    error
  );

  const validateInput = useCallback(
    (inputValue: string) => {
      if (isRequired && !inputValue) {
        setValidationError("This field is required.");
      } else if (type === "email" && !isValidEmail(inputValue)) {
        setValidationError("Please enter a valid email address.");
      } else {
        setValidationError(undefined);
      }
    },
    [isRequired, type]
  );

  useEffect(() => {
    validateInput(value);
  }, [value, validateInput]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {isRequired && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative mt-1">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            {icon}
          </div>
        )}
        <Input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={maxLength}
          aria-required={isRequired}
          aria-invalid={!!validationError}
          className={clsx(
            "w-full rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0",
            {
              "pl-10": icon,
              "border-gray-300": !isFocused && !validationError,
              "border-gray-400": isFocused,
              "border-red-500": validationError,
            },
            "border" // Ensure border is always present
          )}
        />
      </div>
      {validationError && (
        <span className="text-red-500 text-sm mt-1">{validationError}</span>
      )}
      {helpText && <p className="text-gray-600 text-sm mt-1">{helpText}</p>}
    </div>
  );
};

export default CustomInputField;
