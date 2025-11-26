import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Calendar, BookOpen, Lightbulb, User, MessageSquare } from "lucide-react";

interface Project {
  id: string;
  topic: string;
  status: string;
  created_at: string;
  updated_at: string;
  content_type: string | null;
  research_status: string | null;
  scripts_status: string | null;
  broll_status: string | null;
  article_status: string | null;
  prompts_status: string | null;
  simplify_status: string | null;
}

interface ProjectCardProps {
  project: Project;
  index: number;
  getStatusLabel: (status: string) => string;
  getStatusVariant: (status: string) => "default" | "secondary" | "outline";
  getCompletedFeatures: (project: Project) => number;
  formatDate: (dateString: string) => string;
}

export const ProjectCard = ({
  project,
  index,
  getStatusLabel,
  getStatusVariant,
  getCompletedFeatures,
  formatDate,
}: ProjectCardProps) => {
  const getContentTypeConfig = (contentType: string | null) => {
    switch (contentType) {
      case 'creative':
        return {
          label: 'إبداعي',
          icon: Lightbulb,
          className: 'bg-purple-500/20 text-purple-200 border-purple-500/30'
        };
      case 'personal':
        return {
          label: 'شخصي',
          icon: User,
          className: 'bg-blue-500/20 text-blue-200 border-blue-500/30'
        };
      case 'opinion':
        return {
          label: 'رأي',
          icon: MessageSquare,
          className: 'bg-orange-500/20 text-orange-200 border-orange-500/30'
        };
      case 'factual':
      default:
        return {
          label: 'علمي',
          icon: BookOpen,
          className: 'bg-green-500/20 text-green-200 border-green-500/30'
        };
    }
  };

  const contentTypeConfig = getContentTypeConfig(project.content_type);
  const ContentTypeIcon = contentTypeConfig.icon;

  return (
    <Link 
      to={`/projects/${project.id}`}
      style={{ animationDelay: `${index * 50}ms` }}
      className="animate-fade-in"
    >
      <Card 
        variant="editorial" 
        className="h-full group cursor-pointer overflow-hidden"
      >
        <CardHeader className="space-y-4">
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant={getStatusVariant(project.status)}
                className="shadow-sm"
              >
                {getStatusLabel(project.status)}
              </Badge>
              <Badge 
                variant="outline"
                className={`shadow-sm flex items-center gap-1 ${contentTypeConfig.className}`}
              >
                <ContentTypeIcon className="w-3 h-3" />
                {contentTypeConfig.label}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
              <CheckCircle2 className="w-3 h-3" />
              {getCompletedFeatures(project)}/6
            </div>
          </div>
          
          <CardTitle className="text-xl line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {project.topic}
          </CardTitle>
          
          <CardDescription className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span className="text-xs">
              {formatDate(project.created_at)}
            </span>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">التقدم</span>
                <span className="font-semibold text-primary">
                  {Math.round((getCompletedFeatures(project) / 6) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${(getCompletedFeatures(project) / 6) * 100}%` }}
                />
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full group-hover:bg-primary/10 transition-colors"
            >
              فتح المشروع ←
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

