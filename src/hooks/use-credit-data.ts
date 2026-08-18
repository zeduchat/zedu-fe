"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { CreditUsageRecord } from "~/app/(client)/[org]/settings/organisation/billing/type";

export const useCreditData = () => {
  const [creditUsage, setCreditUsage] = useState<CreditUsageRecord[] | null>(
    null
  );
  const [creditUsageLoading, setCreditUsageLoading] = useState(false);
  const [lastRefetchTime, setLastRefetchTime] = useState<number>(0);

  // Function to fetch credit usage data
  const fetchCreditUsage = useCallback(async () => {
    try {
      setCreditUsageLoading(true);
      const token = localStorage.getItem("token") || "";
      const orgId = localStorage.getItem("orgId") || "";

      if (!orgId || !token) {
        console.warn("Missing orgId or token for credit usage request");
        setCreditUsageLoading(false);
        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/credits/usage/${orgId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Handle both successful response with data and null data
      if (response.status === 200) {
        setCreditUsage(response.data.data || []);
        setLastRefetchTime(Date.now());

        // Dispatch custom event for credit usage update
        window.dispatchEvent(
          new CustomEvent("creditUsageUpdated", {
            detail: { creditUsage: response.data.data || [] },
          })
        );
      }
    } catch (error) {
      console.error("Error fetching credit usage:", error);
      setCreditUsage([]);
    } finally {
      setCreditUsageLoading(false);
    }
  }, []);

  // Function to refetch both credit balance and usage data
  const refetchAllCreditData = useCallback(async () => {
    const token = localStorage.getItem("token") || "";
    const orgId = localStorage.getItem("orgId") || "";

    if (!orgId || !token) {
      console.warn("Missing orgId or token for credit data refetch");
      return;
    }

    try {
      // Fetch both credit balance (org data) and usage data in parallel
      const [orgResponse, usageResponse] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/organisations/${orgId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/credits/usage/${orgId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        ),
      ]);

      // Update organization data (credit balance)
      if (orgResponse?.status === 200 || orgResponse?.status === 201) {
        const orgData = orgResponse?.data?.data;
        if (orgData.id) {
          localStorage.setItem("user", JSON.stringify(orgData));

          // Dispatch custom event for credit balance update
          window.dispatchEvent(
            new CustomEvent("creditBalanceUpdated", {
              detail: { creditBalance: orgData.credit_balance, orgData },
            })
          );
        }
      }

      // Update credit usage data
      if (usageResponse.status === 200) {
        setCreditUsage(usageResponse.data.data || []);
        setLastRefetchTime(Date.now());

        // Dispatch custom event for credit usage update
        window.dispatchEvent(
          new CustomEvent("creditUsageUpdated", {
            detail: { creditUsage: usageResponse.data.data || [] },
          })
        );
      }
    } catch (error) {
      console.error("Error refetching all credit data:", error);
    }
  }, []);

  // Function to refetch with debouncing to prevent too frequent calls
  const refetchCreditDataDebounced = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRefetch = now - lastRefetchTime;
    const minRefetchInterval = 2000; // 2 seconds minimum between refetches

    if (timeSinceLastRefetch >= minRefetchInterval) {
      refetchAllCreditData();
    } else {
      // Schedule refetch after the minimum interval
      setTimeout(() => {
        refetchAllCreditData();
      }, minRefetchInterval - timeSinceLastRefetch);
    }
  }, [lastRefetchTime, refetchAllCreditData]);

  // Initial fetch on mount
  useEffect(() => {
    fetchCreditUsage();
  }, [fetchCreditUsage]);

  // Listen for agent message events to trigger refetch
  useEffect(() => {
    const handleAgentMessageSent = () => {
      refetchCreditDataDebounced();
    };

    // Listen for custom event that will be dispatched when agent messages are sent
    window.addEventListener("agentMessageSent", handleAgentMessageSent);

    return () => {
      window.removeEventListener("agentMessageSent", handleAgentMessageSent);
    };
  }, [refetchCreditDataDebounced]);

  return {
    creditUsage,
    creditUsageLoading,
    fetchCreditUsage,
    refetchAllCreditData,
    refetchCreditDataDebounced,
    lastRefetchTime,
  };
};
