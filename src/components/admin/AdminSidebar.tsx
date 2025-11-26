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
  Settings,
  ChevronLeft,
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingSignupsCount?: number;
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
  { value: "settings", label: "الإعدادات", icon: Settings },
];

export function AdminSidebar({ activeTab, onTabChange, pendingSignupsCount }: AdminSidebarProps) {
  const { open, setOpen, isMobile } = useSidebar();
  const currentItem = menuItems.find((item) => item.value === activeTab);

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
        {/* Breadcrumb Section */}
        <div className="px-4 py-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LayoutDashboard className="h-4 w-4" />
            <span>إدارة النظام</span>
          </div>
          <Separator />
          {currentItem && (
            <div className="flex items-center gap-2 mt-2">
              <ChevronLeft className="h-4 w-4 text-accent" />
              <div className="flex items-center gap-2 text-foreground font-bold">
                {currentItem.icon && <currentItem.icon className="h-4 w-4" />}
                <span>{currentItem.label}</span>
              </div>
            </div>
          )}
        </div>
        
        <Separator className="mb-2" />
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-base font-bold px-4 py-2">
            الأقسام
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
                      {item.value === 'signups' && pendingSignupsCount && pendingSignupsCount > 0 && (
                        <Badge className="mr-auto bg-red-500 text-white animate-pulse">
                          {pendingSignupsCount}
                        </Badge>
                      )}
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
