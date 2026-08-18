import { GetRequest } from "~/utils/new-request";

export const getFileDetails = async (fileId: string) => {
  const response = await GetRequest(`/files/file/${fileId}`);
  return response.data;
};
