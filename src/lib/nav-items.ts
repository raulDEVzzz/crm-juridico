import {
  Calendar,
  Gavel,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clientes",
    href: "/clients",
    icon: Users,
  },
  {
    title: "Processos",
    href: "/processes",
    icon: Gavel,
  },
  {
    title: "Agenda",
    href: "/agenda",
    icon: Calendar,
  },
];
