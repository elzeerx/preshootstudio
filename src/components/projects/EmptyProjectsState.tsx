import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Inbox, Plus } from "lucide-react";

export const EmptyProjectsState = () => {
  return (
    <Card variant="subtle" className="max-w-xl mx-auto animate-scale-in">
      <CardContent className="pt-16 pb-16 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 mb-8">
          <Inbox className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-4">ما عندك أي مشروع لحد الآن</h3>
        <p className="body-text-secondary mb-8 max-w-md mx-auto">
          ابدأ من الصفحة الرئيسية بإدخال موضوع جديد، وخلي PreShoot AI يجهز لك كل شيء
        </p>
        <Link to="/create">
          <Button variant="default" size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            إنشاء مشروع جديد
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

