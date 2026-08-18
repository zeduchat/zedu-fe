import { useContext, useEffect } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { GetRequest } from "~/utils/new-request";

export const useSubscriptionPlans = () => {
  const { state, dispatch } = useContext(DataContext);

  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        const response = await GetRequest("/subscriptions/plans");

        if (response?.status === 200 || response?.status === 201) {
          dispatch({
            type: ACTIONS.SUBSCRIPTION_PLANS,
            payload: response?.data?.data,
          });
        }
      } catch (error) {
        console.error("Failed to fetch subscription plans:", error);
      }
    };

    // Only fetch if plans haven't been loaded yet
    if (!state?.subscriptionPlans) {
      fetchSubscriptionPlans();
    }
  }, [dispatch, state?.subscriptionPlans]);

  return {
    subscriptionPlans: state?.subscriptionPlans,
    isLoading: !state?.subscriptionPlans,
  };
};
