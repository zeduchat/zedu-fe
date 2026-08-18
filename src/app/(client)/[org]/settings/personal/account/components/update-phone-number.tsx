"use client";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useState, FormEvent } from "react";
import { X } from "lucide-react";

export default function UpdatePhoneNumber({
  setNumberDialog,
}: {
  setNumberDialog: Function;
}) {
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Add API logic here
    // Show success message and Redirect to login page
  };

  const isFormValid = phone.length > 6;

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl border border-purple-300 mt-10 relative">
      <X
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointer"
        onClick={() => setNumberDialog(false)}
      />
      <h2 className="text-xl font-semibold border-b p-4">
        Update Your Email Address
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="border-b pb-4 mb-4">
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <PhoneInput
            country={"us"}
            value={phone}
            onChange={setPhone}
            inputClass="!w-full !border !rounded-md !py-4"
            dropdownClass="!z-[9999]"
            containerClass="!w-full"
            enableSearch
          />
        </div>

        <p className="text-xs text-gray-500">
          <strong>Note:</strong> Your phone number shows on your profile to
          allow your team reach you.{" "}
        </p>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => setNumberDialog(false)}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!isFormValid}
            className={`px-4 py-2 rounded-md text-white ${
              isFormValid
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
