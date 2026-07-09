import { getAccessToken } from "./authService";
import { API_BASE_URL, USE_MOCK } from "./apiClient";

export async function uploadAvatar(file: File): Promise<string> {
  if (USE_MOCK) return URL.createObjectURL(file);
  return uploadTo("/upload/avatar", file);
}

export async function uploadAsset(file: File, folder: "logos" | "banners"): Promise<string> {
  if (USE_MOCK) return URL.createObjectURL(file);
  return uploadTo(`/upload/${folder}`, file);
}

async function uploadTo(path: string, file: File): Promise<string> {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Lỗi ${res.status}`);
  }
  const data = await res.json();
  return data.url;
}
