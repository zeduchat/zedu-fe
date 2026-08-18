"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Plus, X } from "lucide-react";

export default function UpdateProfile({
  setProfileDialog,
}: {
  setProfileDialog: Function;
}) {
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [title, setTitle] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImageFile(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Add API logic here
  };

  const isFormValid = fullName && displayName && title && timeZone;

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl border border-purple-300 mt-10 relative">
      <X
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointer"
        onClick={() => setProfileDialog(false)}
      />
      <h2 className="text-xl font-semibold border-b p-4">
        Update Your Details
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {image ? (
              <div className="flex gap-4 items-center">
                <img
                  src={image}
                  alt="Profile"
                  className="w-36 h-36 rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-[#F81404] text-sm text-nowrap whitespace-nowrap hover:underline font-medium"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <label className="cursor-pointer flex items-center justify-center w-36 h-36 border-2 border-[#E6EAEF] bg-gradient-to-b from-[#E3D9FE] to-white rounded-md">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Plus className="text-[#7141F8]" />
                </label>
                <label className="cursor-pointer flex items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <p className="text-[#7141F8] text-sm text-nowrap whitespace-nowrap hover:underline font-medium">
                    Add Image
                  </p>
                </label>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Display Name</label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This could be your first name, or nickname - however you would like
            people to refer to you in Zedu.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Let people know what you do at Timbu Tech Ltd.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Time Zone</label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            required
          >
            <option value="">Select a time zone</option>
            <option value="(UTC+01:00) West Central Africa">
              (UTC+01:00) West Central Africa
            </option>
            <option value="(UTC+00:00) GMT">(UTC+00:00) GMT</option>
            <option value="(UTC+05:30) India Standard Time">
              (UTC+05:30) India Standard Time
            </option>
          </select>
        </div>

        <p className="text-xs text-gray-500">
          <strong>Note:</strong> Your display name helps people tag you. Your
          time zone means your time is currently{" "}
          {new Date().toLocaleTimeString()}.
        </p>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => setProfileDialog(false)}
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
