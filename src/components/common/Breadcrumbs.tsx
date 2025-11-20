import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { APP_ROUTES } from "@/lib/constants";
import { Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

const getBreadcrumbItems = (pathname: string): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = [
    { label: "الرئيسية", href: APP_ROUTES.HOME },
  ];

  if (pathname === APP_ROUTES.PROJECTS) {
    items.push({ label: "مشاريعي" });
  } else if (pathname === APP_ROUTES.CREATE_PROJECT) {
    items.push({ label: "مشروع جديد" });
  } else if (pathname === APP_ROUTES.PROFILE) {
    items.push({ label: "الملف الشخصي" });
  } else if (pathname.startsWith("/projects/")) {
    items.push({ label: "مشاريعي", href: APP_ROUTES.PROJECTS });
    // Project detail - we'll need to get the project name from props or context
    items.push({ label: "تفاصيل المشروع" });
  } else if (pathname === APP_ROUTES.ADMIN) {
    items.push({ label: "لوحة التحكم" });
  }

  return items;
};

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  const location = useLocation();
  const breadcrumbItems = items || getBreadcrumbItems(location.pathname);

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList className="flex-row-reverse">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <div key={index} className="flex items-center gap-1.5">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-semibold">
                    {index === 0 && <Home className="w-4 h-4 inline ml-1" />}
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      to={item.href || "#"}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      {index === 0 && <Home className="w-4 h-4" />}
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="rotate-180" />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

