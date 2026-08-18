"use client";

import React, { useEffect, useRef, useState } from "react";

import Image from "next/image";

export interface FilterOption {
  id: string;
  label: string;
  value: string;
  imageUrl?: string;
}

export interface FilterDropdownProps {
  title: string;
  options: FilterOption[];
  selectedValues?: string[];
  onSelectionChange?: (selectedValues: string[]) => void;
  multiSelect?: boolean;
  position?: "left" | "right";
  className?: string;
  showSearch?: boolean;
  type?: "filter" | "sort";
}

const Sorting: React.FC<FilterDropdownProps> = ({
  title,
  options,
  selectedValues = [],
  onSelectionChange,
  multiSelect = false,
  position = "left",
  className = "",
  type = "filter",
  showSearch = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((options) =>
    options.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOptionClick = (value: string) => {
    if (multiSelect) {
      const newSelectedValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];

      onSelectionChange?.(newSelectedValues);
    } else {
      onSelectionChange?.(selectedValues.includes(value) ? [] : [value]);
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  const clearSelection = () => {
    onSelectionChange?.([]);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return title;
    if (selectedValues.length === 1) {
      const selectedOption = options?.find(
        (opt) => opt.value === selectedValues[0]
      );
      return selectedOption?.label || title;
    }
    return `${selectedValues.length} selected`;
  };

  // Document icon SVG
  const DocumentIcon = () => (
    <svg
      className="w-4 h-4 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  // Check icon SVG
  const CheckIcon = () => (
    <svg
      className="w-4 h-4 text-[#5F5FE1]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div className="flex text-[13px] font-semibold items-center gap-1">
        {/* Filter Button */}
        <button
          type="button"
          className={`inline-flex items-center gap-2 px-3 py-2 text-[13px] text-[#344054] h-8 ring-1 ring-inset ring-[#E6EAEF] hover:bg-[#D0D0FD] transition-colors ${
            selectedValues.length > 0
              ? "bg-[#D0D0FD] ring-[#BABAFB] text-[#3E3E93] rounded-l-md "
              : "rounded-md bg-white"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{getDisplayText()}</span>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {selectedValues.length > 0 && (
          <button
            type="button"
            onClick={clearSelection}
            className="h-8 px-2 text-[#3E3E93] bg-[#d0d0fd]  rounded-tr-md rounded-br-md transition-colors"
            title="Clear selection"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute ${
            position === "right" ? "right-0" : "left-0"
          } z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
        >
          <div className="py-2">
            {/* Search Input - Conditionally rendered */}
            {showSearch && (
              <div className="px-4 py-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5F5FE1] focus:border-[#5F5FE1]"
                  autoFocus
                />
              </div>
            )}

            {/* Options List */}
            <div className="max-h-60 text-black overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-2 text-sm text-[#344054] text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center px-4 py-2 hover:bg-gray-50 text-[#344054] cursor-pointer transition-colors"
                    onClick={() => handleOptionClick(option.value)}
                  >
                    <div className="flex-shrink-0 w-5 h-5 mr-3">
                      {selectedValues.includes(option.value) ? (
                        <CheckIcon />
                      ) : option.imageUrl ? (
                        <Image
                          src={option.imageUrl}
                          alt={option.label}
                          width={16}
                          height={16}
                          className="w-4 h-4 object-cover"
                        />
                      ) : type === "filter" ? (
                        <DocumentIcon />
                      ) : (
                        <div className="w-4 h-4"></div>
                      )}
                    </div>

                    {/* Option Label */}
                    <span
                      className={`text-sm flex-1 ${
                        selectedValues.includes(option.value)
                          ? "font-medium text-[#5F5FE1]"
                          : "text-[#101828]"
                      }`}
                    >
                      {option.label}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sorting;
