import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
}

export function DashboardShell({
  children,
  userName,
  userEmail,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar userName={userName} userEmail={userEmail} />
      <div className="flex flex-1 flex-col">
        <MobileNav userName={userName} userEmail={userEmail} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
