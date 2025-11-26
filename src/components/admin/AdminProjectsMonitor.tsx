import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProjectModerationDialog } from './ProjectModerationDialog';
import { ContentFlagBadges } from './ContentFlagBadges';
import { Search, Filter, Eye, CheckCircle } from 'lucide-react';
import type { ProjectDetail } from '@/hooks/useProjectDetail';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ProjectWithModeration extends ProjectDetail {
  moderation?: {
    moderation_status: string;
    content_flags: string[];
    quality_rating: number;
    training_eligible: boolean;
  };
  user_email?: string;
}

export function AdminProjectsMonitor() {
  const [projects, setProjects] = useState<ProjectWithModeration[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithModeration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [moderationFilter, setModerationFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null);
  const [showModerationDialog, setShowModerationDialog] = useState(false);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      // Fetch all projects (admin can see all)
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch moderation data
      const projectIds = projectsData?.map(p => p.id) || [];
      const { data: moderationData, error: moderationError } = await supabase
        .from('project_moderation')
        .select('*')
        .in('project_id', projectIds);

      if (moderationError) throw moderationError;

      // Fetch user emails separately
      const userIds = [...new Set(projectsData?.map(p => p.user_id).filter(Boolean) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p.email]) || []);

      // Combine data
      const combinedData: ProjectWithModeration[] = (projectsData || []).map(project => {
        const moderation = moderationData?.find(m => m.project_id === project.id);
        return {
          ...project,
          content_type: project.content_type,
          creative_data: project.creative_data as any,
          research_manual_edits: project.research_manual_edits as any,
          research_data: project.research_data as any,
          research_quality_metrics: project.research_quality_metrics as any,
          scripts_data: project.scripts_data as any,
          broll_data: project.broll_data as any,
          prompts_data: project.prompts_data as any,
          article_data: project.article_data as any,
          simplify_data: project.simplify_data as any,
          moderation: moderation ? {
            moderation_status: moderation.moderation_status,
            content_flags: moderation.content_flags || [],
            quality_rating: moderation.quality_rating || 0,
            training_eligible: moderation.training_eligible || false,
          } : undefined,
          user_email: project.user_id ? profilesMap.get(project.user_id) : undefined,
        };
      });

      setProjects(combinedData);
      setFilteredProjects(combinedData);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('فشل تحميل المشاريع');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    let filtered = projects;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Moderation filter
    if (moderationFilter !== 'all') {
      filtered = filtered.filter(p => p.moderation?.moderation_status === moderationFilter);
    }

    setFilteredProjects(filtered);
  }, [searchQuery, statusFilter, moderationFilter, projects]);

  const handleViewProject = (project: ProjectWithModeration) => {
    setSelectedProject(project);
    setShowModerationDialog(true);
  };

  const getModerationStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="secondary">لم يتم المراجعة</Badge>;
    
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      approved: 'default',
      flagged: 'destructive',
      rejected: 'outline',
    };

    const labels: Record<string, string> = {
      pending: 'قيد المراجعة',
      approved: 'موافق عليه',
      flagged: 'محدد',
      rejected: 'مرفوض',
    };

    return <Badge variant={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          مراقبة المشاريع
        </CardTitle>
        <CardDescription>
          إجمالي المشاريع: {projects.length} | معروضة: {filteredProjects.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالموضوع أو البريد الإلكتروني..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="حالة المشروع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="new">جديد</SelectItem>
              <SelectItem value="in_progress">قيد التقدم</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
            </SelectContent>
          </Select>
          <Select value={moderationFilter} onValueChange={setModerationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="حالة المراجعة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المراجعات</SelectItem>
              <SelectItem value="pending">قيد المراجعة</SelectItem>
              <SelectItem value="approved">موافق عليه</SelectItem>
              <SelectItem value="flagged">محدد</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الموضوع</TableHead>
                <TableHead>المستخدم</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>حالة المراجعة</TableHead>
                <TableHead>العلامات</TableHead>
                <TableHead>الجودة</TableHead>
                <TableHead>التدريب</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    لا توجد مشاريع
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {project.topic}
                    </TableCell>
                    <TableCell>{project.user_email || 'غير معروف'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(project.created_at), 'dd MMM yyyy', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{project.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {getModerationStatusBadge(project.moderation?.moderation_status)}
                    </TableCell>
                    <TableCell>
                      <ContentFlagBadges flags={project.moderation?.content_flags || []} />
                    </TableCell>
                    <TableCell>
                      {project.moderation?.quality_rating ? (
                        <div className="flex items-center gap-1">
                          <span>{project.moderation.quality_rating}</span>
                          <span className="text-yellow-400">★</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {project.moderation?.training_eligible ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewProject(project)}
                      >
                        مراجعة
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <ProjectModerationDialog
        project={selectedProject}
        open={showModerationDialog}
        onOpenChange={setShowModerationDialog}
        onModerationComplete={loadProjects}
      />
    </Card>
  );
}
