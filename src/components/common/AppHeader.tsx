import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FolderOpen, Plus, User, Shield, LogOut, Menu, X, Receipt, CreditCard } from "lucide-react";
import preshootLogoNew from "@/assets/preshoot-logo-new.png";
import { APP_ROUTES } from "@/lib/constants";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const AppHeader = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userInitials = user?.email
    ?.split("@")[0]
    .substring(0, 2)
    .toUpperCase() || "U";

  const isActive = (path: string) => {
    if (path === APP_ROUTES.PROJECTS) {
      return location.pathname.startsWith("/projects");
    }
    return location.pathname === path;
  };

  const navLinks = [
    {
      label: "مشاريعي",
      path: APP_ROUTES.PROJECTS,
      icon: FolderOpen,
    },
    {
      label: "مشروع جديد",
      path: APP_ROUTES.CREATE_PROJECT,
      icon: Plus,
    },
    {
      label: "الملف الشخصي",
      path: APP_ROUTES.PROFILE,
      icon: User,
    },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/10 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to={APP_ROUTES.HOME} className="flex items-center gap-2 flex-shrink-0">
            <img 
              src={preshootLogoNew} 
              alt="PreShoot Studio" 
              className="h-8 w-auto brightness-0 invert" 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.path} to={link.path}>
                  <Button
                    variant={isActive(link.path) ? "default" : "ghost"}
                    size="sm"
                    className="gap-2 flex-row-reverse"
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}

            {isAdmin && (
              <Link to={APP_ROUTES.ADMIN}>
                <Button
                  variant={isActive(APP_ROUTES.ADMIN) ? "default" : "outline"}
                  size="sm"
                  className="gap-2 flex-row-reverse"
                >
                  <Shield className="w-4 h-4" />
                  لوحة التحكم
                </Button>
              </Link>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 flex-row-reverse">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">حسابي</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to={APP_ROUTES.PROFILE}>
                  <DropdownMenuItem className="flex-row-reverse cursor-pointer">
                    <User className="ml-2 h-4 w-4" />
                    الملف الشخصي
                  </DropdownMenuItem>
                </Link>
                <Link to={APP_ROUTES.SUBSCRIPTION}>
                  <DropdownMenuItem className="flex-row-reverse cursor-pointer">
                    <CreditCard className="ml-2 h-4 w-4" />
                    إدارة الاشتراك
                  </DropdownMenuItem>
                </Link>
                <Link to={APP_ROUTES.PAYMENT_HISTORY}>
                  <DropdownMenuItem className="flex-row-reverse cursor-pointer">
                    <Receipt className="ml-2 h-4 w-4" />
                    سجل المدفوعات
                  </DropdownMenuItem>
                </Link>
                {isAdmin && (
                  <Link to={APP_ROUTES.ADMIN}>
                    <DropdownMenuItem className="flex-row-reverse cursor-pointer">
                      <Shield className="ml-2 h-4 w-4" />
                      لوحة التحكم
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="flex-row-reverse cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">القائمة</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <DropdownMenuItem
                        className={cn(
                          "flex-row-reverse cursor-pointer",
                          isActive(link.path) && "bg-primary/10"
                        )}
                      >
                        <Icon className="ml-2 h-4 w-4" />
                        {link.label}
                      </DropdownMenuItem>
                    </Link>
                  );
                })}
                <Link
                  to={APP_ROUTES.SUBSCRIPTION}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <DropdownMenuItem
                    className={cn(
                      "flex-row-reverse cursor-pointer",
                      isActive(APP_ROUTES.SUBSCRIPTION) && "bg-primary/10"
                    )}
                  >
                    <CreditCard className="ml-2 h-4 w-4" />
                    إدارة الاشتراك
                  </DropdownMenuItem>
                </Link>
                <Link
                  to={APP_ROUTES.PAYMENT_HISTORY}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <DropdownMenuItem
                    className={cn(
                      "flex-row-reverse cursor-pointer",
                      isActive(APP_ROUTES.PAYMENT_HISTORY) && "bg-primary/10"
                    )}
                  >
                    <Receipt className="ml-2 h-4 w-4" />
                    سجل المدفوعات
                  </DropdownMenuItem>
                </Link>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <Link
                      to={APP_ROUTES.ADMIN}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <DropdownMenuItem
                        className={cn(
                          "flex-row-reverse cursor-pointer",
                          isActive(APP_ROUTES.ADMIN) && "bg-primary/10"
                        )}
                      >
                        <Shield className="ml-2 h-4 w-4" />
                        لوحة التحكم
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-row-reverse cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

