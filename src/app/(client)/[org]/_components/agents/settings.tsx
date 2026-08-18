"use client";

import { useParams } from "next/navigation";
import { X } from "lucide-react";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import Loading from "~/components/ui/loading";
import { PutRequest } from "~/utils/new-request";
import DeleteAgentModal from "~/components/layout/modals/delete-agent";
import { showSuccess } from "~/components/toast/sonner";

/* eslint-disable */

export default function AgentSettings({
  data,
  setData,
  settings,
  multiSelectValues,
  setMultiSelectValues,
  agent,
}: any) {
  const [textInputs, setTextInputs] = useState<Record<string, string>>({});
  const [buttonloading, setButtonloading] = useState(false);
  const params = useParams();
  const id = params.id as string;
  const [deleteloading, setDeleteloading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const handleMultiSelectInput = (
    label: string,
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setTextInputs((prev) => ({ ...prev, [label]: value }));

    if (value.includes("\n") || value.includes(",")) {
      const newValues = value
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter((item) => item && !multiSelectValues[label]?.includes(item));

      setMultiSelectValues((prevValues: any) => ({
        ...prevValues,
        [label]: [...(prevValues[label] || []), ...newValues],
      }));

      setTextInputs((prev) => ({ ...prev, [label]: "" }));
      setData((prevData: any) => ({
        ...prevData,
        [label]: [...(multiSelectValues[label] || []), ...newValues],
      }));
    }
  };

  const handleRemoveMultiSelectValue = (
    label: string,
    valueToRemove: string
  ) => {
    setMultiSelectValues((prevValues: any) => {
      const updatedValues =
        prevValues[label]?.filter((item: any) => item !== valueToRemove) || [];
      // Update `data` state accordingly
      setData((prevData: any) => ({ ...prevData, [label]: updatedValues }));
      return { ...prevValues, [label]: updatedValues };
    });
  };

  // Handle paste for multi-select
  const handlePasteMultiSelect = (
    label: string,
    e: React.ClipboardEvent<HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const newValues = pastedText
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter((item) => item && !multiSelectValues[label]?.includes(item));

    setMultiSelectValues((prevValues: any) => ({
      ...prevValues,
      [label]: [...(prevValues[label] || []), ...newValues],
    }));
    setData((prevData: any) => ({
      ...prevData,
      [label]: [...(data[label] || []), ...newValues],
    }));
  };

  const saveSettings = async () => {
    setButtonloading(true);

    try {
      // Update settings with current data values
      const updatedSettings = settings.map((field: any) => ({
        ...field,
        default: data[field.label],
      }));

      // Create a new integration object
      const payload = {
        setting_entry: {
          settings: updatedSettings,
        },
      };

      const token = localStorage.getItem("token") || "";
      const orgId = localStorage.getItem("orgId") || "";

      const res = await PutRequest(
        `/organisations/${orgId}/integrations/custom/${id}/settings`,
        payload
      );
      if (res?.status === 200 || res?.status === 201) {
        showSuccess(res?.data?.message);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setButtonloading(false);
    }
  };

  const handleChange = (label: string, value: any) => {
    setData((prevData: any) => ({
      ...prevData,
      [label]: value,
    }));
  };

  //

  return (
    <div className="text-neutral-600 py-4">
      <>
        {settings?.map((field: any) => (
          <div key={field.label} className="my-8">
            {field.type === "text" && (
              <>
                <label className="text-sm mb-1 block capitalize">
                  {field.label}
                </label>
                <input
                  type="text"
                  value={data[field.label] || ""}
                  onChange={(e) => handleChange(field.label, e.target.value)}
                  className="w-full md:w-[500px] py-3 text-xs text-[#747474] px-4 border rounded-sm border-[#D0D0FD] outline-none focus:border-primary-500"
                />
              </>
            )}

            {field.type === "checkbox" && (
              <div className="flex items-center gap-2 my-8">
                <input
                  className="size-4"
                  type="checkbox"
                  checked={data[field.label] || false}
                  onChange={(e) => handleChange(field.label, e.target.checked)}
                />
                <label className="text-sm capitalize">{field.label}</label>
              </div>
            )}
            {field.type === "number" && (
              <>
                <label className="text-sm mb-1 block capitalize">
                  {field.label}
                </label>
                <input
                  type="number"
                  value={data[field.label] || ""}
                  onChange={(e) =>
                    handleChange(field.label, Number(e.target.value))
                  }
                  className="w-full md:w-[500px] py-3 text-xs text-[#747474] px-4 border rounded-sm border-[#D0D0FD] outline-none focus:border-primary-500"
                />
              </>
            )}
            {field.type === "dropdown" && (
              <>
                <label className="text-sm mb-1 block capitalize">
                  {field.label}
                </label>
                <Select
                  value={data[field.label] || ""}
                  onValueChange={(value) => handleChange(field.label, value)}
                >
                  <SelectTrigger className="h-10 w-full md:w-[500px] text-primary focus:outline-none focus:ring-0 focus:ring-primary focus-visible:ring-0 focus-visible:ring-primary">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    {field?.options?.map((option: any, index: number) => (
                      <SelectItem value={option} key={index}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {field.type === "multi-checkbox" && (
              <>
                <label className="text-sm mb-1 block capitalize">
                  {field.label}
                </label>
                <div>
                  {field.options?.map((option: any) => (
                    <label
                      key={option}
                      className="text-sm mb-1 flex items-center gap-2"
                    >
                      <input
                        className=""
                        type="checkbox"
                        checked={data[field.label]?.includes(option) || false}
                        onChange={(e) => {
                          const selected = data[field.label] || [];
                          const updated = e.target.checked
                            ? [...selected, option]
                            : selected.filter((opt: string) => opt !== option);
                          handleChange(field.label, updated);
                        }}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </>
            )}

            {field.type === "radio" && (
              <>
                <label className="text-sm mb-1 block capitalize">
                  {field.label}
                </label>
                <div>
                  {field.options?.map((option: any) => (
                    <label
                      key={option}
                      className="text-sm mb-1 flex items-center gap-2"
                    >
                      <input
                        className="size-4"
                        type="radio"
                        name={field.label}
                        value={option}
                        checked={data[field.label] === option}
                        onChange={(e) =>
                          handleChange(field.label, e.target.value)
                        }
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </>
            )}

            {field.type === "multi-select" && (
              <>
                <label className="text-sm mb-1 block capitalize">
                  {field.label}
                </label>
                <div className="w-full md:w-[600px] border-[1.5px] border-[#D0D0FD] rounded max-h-[150px] px-[16px] py-[12px] overflow-auto flex flex-row space-x-2 flex-wrap">
                  {multiSelectValues[field.label]?.map(
                    (value: any, index: number) => (
                      <div key={index} className="h-full">
                        <div className="text-[14px] font-[500] mb-1 flex items-center px-2 py-1 bg-[#F2F4F7] rounded">
                          <span>{value}</span>
                          <button
                            title="removeValue"
                            type="button"
                            onClick={() =>
                              handleRemoveMultiSelectValue(field.label, value)
                            }
                            className="ml-3"
                          >
                            <X width={15} height={15} />
                          </button>
                        </div>
                      </div>
                    )
                  )}
                  <textarea
                    id={`textarea-${field.label}`}
                    value={textInputs[field.label] || ""}
                    onPaste={(e) => handlePasteMultiSelect(field.label, e)}
                    onChange={(e) => handleMultiSelectInput(field.label, e)}
                    placeholder="Type values and press Enter or paste them here..."
                    rows={1}
                    className="text-[14px] inline-block h-[25px] w-full focus:outline-none resize-none"
                  />
                </div>
              </>
            )}
          </div>
        ))}

        <span className="text-gray-500 text-sm">
          Note: Setting your agent’s functionality helps you ensure that it
          caters to your company’s preferences.
        </span>

        <div className="my-6 flex flex-col sm:flex-row gap-7">
          <Button
            onClick={saveSettings}
            className="w-[150px] px-6 py-4 bg-primary-500 hover:bg-opacity-80 disabled:cursor-not-allowed disabled:bg-opacity-50 text-white font-medium"
          >
            {buttonloading ? (
              <span className="flex items-center gap-x-2">
                <span className="animate-pulse">Saving...</span>{" "}
                <Loading width="20" height="40" />
              </span>
            ) : (
              "Save Settings"
            )}
          </Button>

          <Button
            onClick={() => setDeleteModal(true)}
            className="w-[150px] px-6 py-4 bg-transparent border border-red-500 text-red-500 hover:bg-opacity-80 disabled:cursor-not-allowed disabled:bg-opacity-50 font-medium"
          >
            Deactivate Agent
          </Button>
        </div>
      </>

      {deleteModal && (
        <DeleteAgentModal
          onCancel={() => setDeleteModal(false)}
          agent={agent}
        />
      )}
    </div>
  );
}
