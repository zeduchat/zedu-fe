import axios from "axios";
// import { ErrorWebhook, SuccessWebhook } from "./webhook-request";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const INTEGRATION_URL = process.env.NEXT_PUBLIC_INTEGRATION_URL;
import { showError } from "~/components/toast/sonner";
import { handleUnauthorizedIfNeeded } from "~/utils/auth-session";

// ============DO NOT TOUCH THIS FILE OR MAKE CHANGES TO IT==============================
// ============DO NOT TOUCH THIS FILE OR MAKE CHANGES TO IT==============================
// ============DO NOT TOUCH THIS FILE OR MAKE CHANGES TO IT==============================
// ============DO NOT TOUCH THIS FILE OR MAKE CHANGES TO IT==============================

// ==============GET REQUEST=================================
export const GetRequest = async (url: string, token?: string) => {
  try {
    const res = await axios.get(BASE_URL + url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return res;
  } catch (error: any) {
    handleUnauthorizedIfNeeded(error);
    // showError(error?.response?.data?.message);
    return error;
  }
};

// ==========POST REQUEST=====================
export const PostRequest = async (url: string, data?: any, token?: string) => {
  try {
    const res = await axios.post(BASE_URL + url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res;
  } catch (error: any) {
    showError(error?.response?.data?.message);
    handleUnauthorizedIfNeeded(error);
    return error;
  }
};

export const ResetPasswordRequest = async (
  url: string,
  data?: any,
  token?: string
) => {
  try {
    const res = await axios.post(BASE_URL + url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res;
  } catch (error: any) {
    showError(error?.response?.data?.message);
    return error;
  }
};

// ==========PATCH REQUEST=====================
export const PatchRequest = async (url: string, data?: any, token?: string) => {
  try {
    const res = await axios.patch(BASE_URL + url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return res;
  } catch (error: any) {
    showError(error?.response?.data?.message);
    handleUnauthorizedIfNeeded(error);
    return error;
  }
};

// ==========PUT REQUEST=====================
export const PutRequest = async (url: string, data?: any, token?: string) => {
  try {
    const res = await axios.put(BASE_URL + url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return res;
  } catch (error: any) {
    showError(error?.response?.data?.message);
    handleUnauthorizedIfNeeded(error);
    return error;
  }
};

// ==========DELETE REQUEST=====================
export const DeleteRequest = async (url: string, token?: string) => {
  try {
    const res = await axios.delete(BASE_URL + url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return res;
  } catch (error: any) {
    showError(error?.response?.data?.message);
    handleUnauthorizedIfNeeded(error);
    return error;
  }
};

export const DeleteRequests = async (
  url: string,
  data?: any,
  token?: string
) => {
  try {
    const res = await axios.delete(BASE_URL + url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data,
    });

    return res;
  } catch (error: any) {
    showError(error?.response?.data?.message);
    handleUnauthorizedIfNeeded(error);
    return error;
  }
};

// ============INTEGRATION SECTION============

// ==============GET REQUEST=================================
export const IntegrationGetRequest = async (url: string, token?: string) => {
  try {
    const res = await axios.get(INTEGRATION_URL + url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return res;
  } catch (error: any) {
    handleUnauthorizedIfNeeded(error);
    // showError(error?.response?.data?.message);
    return error;
  }
};

// ==========POST REQUEST=====================
export const IntegrationPostRequest = async (
  url: string,
  data?: any,
  token?: string
) => {
  try {
    const res = await axios.post(INTEGRATION_URL + url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return res;
  } catch (error: any) {
    showError(error?.response?.data?.message);
    handleUnauthorizedIfNeeded(error);

    return error;
  }
};

// ==========DELETE REQUEST=====================
export const IntegrationDeleteRequest = async (
  url: string,
  data?: any,
  token?: string
) => {
  try {
    const res = await axios.delete(INTEGRATION_URL + url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data,
    });

    return res;
  } catch (error: any) {
    showError(error?.response?.data?.message);
    handleUnauthorizedIfNeeded(error);

    return error;
  }
};
