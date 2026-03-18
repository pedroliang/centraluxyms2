import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Plus, Package, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/processo/novo", label: "Novo Processo", icon: Plus },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-60 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <Truck className="h-5 w-5 text-sidebar-primary" />
        <span className="text-base font-semibold tracking-heading">CENTRALUX</span>
        <span className="ml-auto rounded bg-sidebar-accent px-1.5 py-0.5 text-[10px] font-mono font-semibold text-sidebar-primary">
          YMS
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Status */}
      <div className="border-t border-sidebar-border px-5 py-4">
        <div className="flex items-center gap-2 text-xs text-sidebar-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Sistema Online
        </div>
      </div>
    </aside>
  );
}
