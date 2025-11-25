import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Activity,
  FolderOpen,
  Database,
  Shield,
  Mail,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { value: "overview", label: "لمحة عامة", icon: LayoutDashboard },
  { value: "users", label: "إدارة المستخدمين", icon: Users },
  { value: "signups", label: "طلبات Beta", icon: UserPlus },
  { value: "tokens", label: "استخدام الرموز", icon: Activity },
  { value: "projects", label: "مراقبة المشاريع", icon: FolderOpen },
  { value: "training", label: "تصدير التدريب", icon: Database },
  { value: "audit", label: "سجل المراجعة", icon: Shield },
  { value: "email", label: "قوالب البريد", icon: Mail },
];

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { open, setOpen, isMobile } = useSidebar();

  const handleItemClick = (value: string) => {
    onTabChange(value);
    // Close sidebar on mobile after selection
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <Sidebar
      className={!open ? "w-0" : "w-64"}
      collapsible="offcanvas"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold px-4 py-3">
            لوحة التحكم
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.value;
                
                return (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton
                      onClick={() => handleItemClick(item.value)}
                      className={`hover:bg-muted/50 transition-colors ${
                        isActive
                          ? "bg-accent text-accent-foreground font-bold border-r-4 border-accent"
                          : ""
                      }`}
                    >
                      <Icon className="h-5 w-5 ml-3" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
