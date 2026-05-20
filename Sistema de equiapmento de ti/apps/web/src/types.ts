import type { LucideIcon } from "lucide-react";

export type UserRole = "ADMIN" | "GERENTE" | "VENDEDOR" | "ESTOQUISTA" | "SUPORTE";

export type ViewKey =
  | "dashboard"
  | "sales"
  | "inventory"
  | "products"
  | "stores"
  | "crm"
  | "users"
  | "reports"
  | "audit"
  | "tickets";

export type NavItem = {
  key: ViewKey;
  label: string;
  icon: LucideIcon;
  allowedRoles: UserRole[];
};

export type StatusTone = "green" | "amber" | "red" | "blue" | "gray" | "violet";

export type Notify = (message: string, tone?: StatusTone) => void;

export type ToastMessage = {
  id: string;
  message: string;
  tone: StatusTone;
};
