import React, { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";

const TagInput = () => {
  const [tags, setTags] = useState<string[]>([
    "johndoe",
    "sarahjohn",
    "stephchelte",
    "johndoe@gmail.com",
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      setTags([...tags, trimmedValue]);
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="flex flex-wrap items-center gap-2 p-3 border border-gray-300 rounded-lg bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
          >
            {tag}
            <button
              onClick={() => removeTag(index)}
              className="hover:text-gray-900 focus:outline-none"
              aria-label={`Remove ${tag}`}
            >
              <X size={14} strokeWidth={2} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? "Add people to send link to" : ""}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {/* Dropdown simulation */}
      <div className="flex items-center justify-end mt-2 px-2">
        <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
          Can View
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
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TagInput;
