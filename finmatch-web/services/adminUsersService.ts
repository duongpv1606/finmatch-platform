import { User, UserRole } from "@/types";
import { USE_MOCK, authedFetch, mockDelay } from "./apiClient";

export async function getUsers(): Promise<User[]> {
  if (USE_MOCK) {
    return mockDelay([
      {
        id: "mock-1",
        name: "Khách hàng Demo",
        email: "demo@finmatch.vn",
        phone: "0900000000",
        role: "customer" as UserRole,
        createdAt: new Date().toISOString(),
      },
    ]);
  }
  return authedFetch<User[]>("/admin/users");
}

export async function updateUserRole(id: string, role: UserRole): Promise<User> {
  if (USE_MOCK) {
    return mockDelay({
      id,
      name: "Mock",
      email: "mock@finmatch.vn",
      role,
      createdAt: new Date().toISOString(),
    });
  }
  return authedFetch<User>(`/admin/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}
