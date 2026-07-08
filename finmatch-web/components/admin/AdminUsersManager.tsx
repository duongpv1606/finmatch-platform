"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUsers, updateUserRole } from "@/services/adminUsersService";
import { UserRole } from "@/types";

const ASSIGNABLE_ROLES: UserRole[] = ["customer", "sale", "agency", "bank"];

const ROLE_BADGE_CLASS: Record<string, string> = {
  admin: "role-badge-admin",
  super_admin: "role-badge-admin",
  sale: "role-badge-sale",
  customer: "role-badge-customer",
};

export function AdminUsersManager() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: getUsers,
  });

  async function handleRoleChange(id: string, role: UserRole) {
    setError(null);
    setSavingId(id);
    try {
      await updateUserRole(id, role);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="card">
      <div className="sec-hd">
        <div>
          <div className="sec-eyebrow">Quản trị</div>
          <h3>Người dùng ({users?.length ?? 0})</h3>
        </div>
      </div>

      {error && <div style={{ color: "#DC2626", fontSize: 12, marginBottom: 10 }}>{error}</div>}

      <div className="table-wrap" style={{ overflowX: "auto" }}>
        <table className="compare-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Vai trò</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--gray-400)" }}>
                  Đang tải...
                </td>
              </tr>
            )}
            {users?.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 700 }}>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone ?? "—"}</td>
                <td>
                  {u.role === "admin" || u.role === "super_admin" ? (
                    <span className={`role-badge ${ROLE_BADGE_CLASS[u.role]}`}>{u.role}</span>
                  ) : (
                    <select
                      value={u.role}
                      disabled={savingId === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      style={{
                        fontSize: 12,
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid var(--gray-200)",
                        background: "white",
                      }}
                    >
                      {ASSIGNABLE_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td style={{ color: "var(--gray-400)", fontSize: 12 }}>
                  {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                </td>
              </tr>
            ))}
            {users?.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--gray-400)" }}>
                  Chưa có người dùng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 10 }}>
        Tài khoản Admin không thể đổi quyền qua bảng này (bảo vệ theo thiết kế) — chỉ đúng email được chỉ định mới giữ quyền Admin.
      </p>
    </div>
  );
}
