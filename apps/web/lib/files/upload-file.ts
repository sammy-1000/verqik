import { wsClient } from "@/lib/ws/client";
import { WsEvents } from "@/lib/ws/events";
import type { FileUploadResult, RequestUploadPayload } from "@/lib/ws/types";

export async function uploadFile(
  file: File,
  options: Omit<RequestUploadPayload, "filename" | "mimeType">,
): Promise<FileUploadResult> {
  const { fileId, uploadUrl } = await wsClient.rpc<{
    fileId: string;
    uploadUrl: string;
    publicUrl: string;
    key: string;
  }>(WsEvents.FILES_UPLOAD_URL, {
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    ...options,
  });

  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
  });

  if (!response.ok) {
    throw new Error(`Upload failed (${response.status})`);
  }

  await wsClient.rpc(WsEvents.FILES_CONFIRM, { fileId });

  return { fileId, fileName: file.name };
}
