import axios from "axios";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
import { showError } from "~/components/toast/sonner";
// ==========PATCH REQUEST=====================
export const PatchRequestForForm = async (
  url: string,
  data?: any,
  token?: string
) => {
  try {
    const res = await axios.patch(BASE_URL + url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res;
  } catch (error: any) {
    showError(error?.response?.data?.message);
    return error;
  }
};
