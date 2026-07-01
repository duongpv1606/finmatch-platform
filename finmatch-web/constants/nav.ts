import { UserRole } from "@/types";

export interface NavItem {
  href: string;
  label: string;
  icon: string; // tabler icon class suffix, e.g. "layout-dashboard"
  badge?: { text: string; color: string };
  roles?: UserRole[]; // if omitted, visible to everyone
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Chính",
    items: [
      { href: "/", label: "Tổng quan", icon: "layout-dashboard" },
      { href: "/ai", label: "Tư vấn AI", icon: "brain", badge: { text: "Mới", color: "var(--blue)" } },
    ],
  },
  {
    label: "Sản phẩm",
    items: [
      { href: "/loans", label: "Vay vốn", icon: "building-bank" },
      { href: "/cards", label: "Thẻ tín dụng", icon: "credit-card" },
      { href: "/insurance", label: "Bảo hiểm", icon: "shield-check" },
      { href: "/invest", label: "Đầu tư", icon: "chart-line" },
      { href: "/savings", label: "Tiết kiệm", icon: "coins" },
    ],
  },
  {
    label: "Công cụ",
    items: [
      { href: "/compare", label: "So sánh", icon: "arrows-diff" },
      { href: "/calc", label: "Máy tính", icon: "calculator" },
      { href: "/news", label: "Tin tức", icon: "news" },
    ],
  },
  {
    label: "Nền tảng",
    items: [
      {
        href: "/dashboard/marketplace",
        label: "Marketplace Lead",
        icon: "bolt",
        badge: { text: "Hot", color: "var(--amber)" },
        roles: ["sale", "agency", "bank", "admin", "super_admin"],
      },
      {
        href: "/dashboard/sale",
        label: "Sale Dashboard",
        icon: "chart-bar",
        roles: ["sale", "agency", "admin", "super_admin"],
      },
      {
        href: "/dashboard/crm",
        label: "CRM của tôi",
        icon: "address-book",
        roles: ["sale", "agency", "admin", "super_admin"],
      },
      { href: "/dashboard/membership", label: "Gói thành viên", icon: "crown", badge: { text: "Mới", color: "var(--purple)" } },
      { href: "/dashboard/community", label: "Cộng đồng", icon: "users" },
      {
        href: "/dashboard/admin",
        label: "Admin",
        icon: "shield-lock",
        roles: ["admin", "super_admin"],
      },
    ],
  },
];

export function isNavItemVisible(item: NavItem, role: UserRole): boolean {
  return !item.roles || item.roles.includes(role);
}
