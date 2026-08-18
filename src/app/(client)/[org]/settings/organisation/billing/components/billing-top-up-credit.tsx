import React, { useContext } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { TopUpCreditsProps } from "../type";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { SelectItem } from "@radix-ui/react-select";
import { DataContext } from "~/store/GlobalState";
import axios from "axios";
import { showError } from "~/components/toast/sonner";

const BillingTopUpCredits: React.FC<TopUpCreditsProps> = ({
  creditPrice,
  creditsPerDollar,
  // eslint-disable-next-line,
  creditOptions,
  // onPurchase,
}) => {
  const [creditAmount, setCreditAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { state } = useContext(DataContext);

  const selectedOption = creditOptions?.find(
    (option) => option.credits === creditAmount
  );
  const totalCost = selectedOption ? selectedOption.price : 0;

  const handlePurchase = async () => {
    if (creditAmount === 0 || !selectedOption) return;

    setIsLoading(true);

    const token = localStorage.getItem("token") || "";

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/credits/purchase`,
        {
          package_id: selectedOption.id,
          org_id: state.orgId,
          email: state.user.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const data = response.data.data;
        if (data.checkout_session_url) {
          // Redirect to Stripe payment page
          window.location.href = data.checkout_session_url;
        } else {
          throw new Error("No payment URL received from server");
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Purchase error:", error);

      // Handle different types of errors
      let errorMessage =
        "There was an error processing your request. Please try again later.";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          errorMessage =
            error.response.data?.message ||
            `Server error: ${error.response.status}`;
        } else if (error.request) {
          // Request was made but no response received
          errorMessage =
            "Network error. Please check your connection and try again.";
        }
      }

      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 py-6 shadow-sm">
      <div className="border-b px-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-0">
          <h3 className="text-xl font-bold text-gray-900">Top-Up AI Credits</h3>
          <span className="text-sm text-black bg-[#F2F4F7] font-bold px-4 py-2 rounded-lg whitespace-nowrap w-fit mt-2 sm:mt-0">
            ${creditPrice} • {creditsPerDollar}{" "}
            <span className="text-gray-500 font-[300]">AI credits</span>
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-3">
          Stay connected when you have enough to go round!
        </p>
      </div>

      <div className="px-4 pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI Credits
        </label>
        <div className="flex flex-col sm:grid sm:grid-cols-6 gap-4">
          <div className="sm:col-span-4 h-full">
            <div className="flex items-center space-x-1 text-black relative">
              <Select
                value={creditAmount > 0 ? creditAmount.toString() : ""}
                onValueChange={(value) => {
                  const selectedCredits = parseInt(value);
                  setCreditAmount(selectedCredits);
                }}
              >
                <SelectTrigger className="w-full h-[42px]">
                  <SelectValue
                    placeholder="Select a credit package"
                    className="text-gray-800 !placeholder:text-gray-400 text-sm sm:text-base"
                  >
                    {selectedOption
                      ? `${selectedOption.name} - ${selectedOption.credits.toLocaleString()} credits ($${selectedOption.price})`
                      : "Select a credit package"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {creditOptions.map((option) => (
                    <SelectItem
                      key={option.id}
                      value={option.credits.toString()}
                      className="py-1 px-2 cursor-pointer hover:bg-gray-100 data-[state=checked]:bg-gray-100 data-[state=checked]:font-medium text-sm sm:text-base"
                    >
                      {option.name} - {option.credits.toLocaleString()} credits
                      (${option.price})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
                <ChevronDown size={16} className="text-gray-500" />
              </div>
            </div>
          </div>
          <div className="sm:col-span-2 h-full">
            <Button
              onClick={handlePurchase}
              disabled={creditAmount === 0 || isLoading}
              className={`w-full py-3 px-2 sm:px-4 rounded-md font-medium transition-colors ${
                creditAmount === 0
                  ? "bg-[#7141F8] text-white cursor-not-allowed"
                  : "bg-[#7141F8] text-white"
              }`}
            >
              {isLoading ? (
                <div className="flex gap-2 items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm sm:text-base">Processing...</span>
                </div>
              ) : (
                <span className="text-sm sm:text-base whitespace-nowrap">
                  Pay ${totalCost.toFixed(0)}
                  {/* •{" "}
                  {new Intl.NumberFormat("en-US").format(
                    creditAmount * creditsPerDollar
                  )}{" "}
                  AI Credits */}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingTopUpCredits;
