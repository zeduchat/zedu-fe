"use client";

import { useState, FormEvent } from "react";
import { X } from "lucide-react";

export default function UpdateEmail({
  setEmailDialog,
}: {
  setEmailDialog: Function;
}) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Add API logic here
    // Show success message and Redirect to login page
  };

  const isFormValid = email;

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl border border-purple-300 mt-10 relative">
      <X
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointer"
        onClick={() => setEmailDialog(false)}
      />
      <h2 className="text-xl font-semibold border-b p-4">
        Update Your Email Address
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="border-b pb-4 mb-4">
          <label className="block text-sm font-medium mb-1">
            New Email Address
          </label>
          <input
            type="email"
            className="w-full border rounded-md px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="placeholder@gmail.com"
            required
          />
        </div>

        <p className="text-xs text-gray-500">
          <strong>Note:</strong> You are changing your email address from{" "}
          <b>placeholder@gmail.com </b>. You would need to login again to effect
          this email change.{" "}
        </p>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => setEmailDialog(false)}
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
