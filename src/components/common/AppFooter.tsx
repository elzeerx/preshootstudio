import { Link } from "react-router-dom";
import { APP_ROUTES } from "@/lib/constants";
import { Github, Twitter, Mail } from "lucide-react";

export const AppFooter = () => {
  return (
    <footer className="border-t border-border/50 bg-background/95 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">PreShoot AI</h3>
            <p className="text-sm text-muted-foreground">
              مساعدك الشخصي قبل التصوير وبعده - منصة شاملة لمساعدة صناع المحتوى العرب
            </p>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to={APP_ROUTES.PROJECTS}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  مشاريعي
                </Link>
              </li>
              <li>
                <Link
                  to={APP_ROUTES.CREATE_PROJECT}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  إنشاء مشروع جديد
                </Link>
              </li>
              <li>
                <Link
                  to={APP_ROUTES.PROFILE}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  الملف الشخصي
                </Link>
              </li>
              <li>
                <Link
                  to={APP_ROUTES.HOME}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  الصفحة الرئيسية
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">تابعنا</h4>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@preshoot.studio"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>© 2025 PreShoot Studio. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

