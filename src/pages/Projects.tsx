import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Search } from "lucide-react";
import { ProjectStats } from "@/components/projects/ProjectStats";
import { ProjectFilters } from "@/components/projects/ProjectFilters";
import { EmptyProjectsState } from "@/components/projects/EmptyProjectsState";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { AppHeader } from "@/components/common/AppHeader";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { AppFooter } from "@/components/common/AppFooter";
import { useProjects } from "@/hooks/useProjects";
import { formatDate, getStatusLabel, getStatusVariant } from "@/lib/helpers/formatters";

const Projects = () => {
  const { projects, isLoading, stats, filterProjects, getCompletedFeatures } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Filter projects
  const filteredProjects = filterProjects(searchQuery, filterStatus);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative z-10 flex-1">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs />

          {/* Page Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 mb-6 shadow-lg">
              <FolderOpen className="w-10 h-10 text-primary" />
            </div>
            <h1 className="heading-2 mb-3">مشاريعي</h1>
            <p className="body-text-secondary max-w-2xl mx-auto">
              جميع مشاريعك في مكان واحد - تابع، عدّل، وصدّر محتواك بسهولة
            </p>
          </div>

          {/* Stats Cards */}
          {!isLoading && projects.length > 0 && <ProjectStats stats={stats} />}

          {/* Search and Filter */}
          {!isLoading && projects.length > 0 && (
            <ProjectFilters
              searchQuery={searchQuery}
              filterStatus={filterStatus}
              onSearchChange={setSearchQuery}
              onFilterChange={setFilterStatus}
            />
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-20">
              <div className="inline-block w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-6"></div>
              <p className="body-text-secondary">جاري تحميل مشاريعك...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && projects.length === 0 && <EmptyProjectsState />}

          {/* No Results State */}
          {!isLoading && projects.length > 0 && filteredProjects.length === 0 && (
            <Card variant="subtle" className="max-w-xl mx-auto">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-muted/50 mb-6">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">لا توجد نتائج</h3>
                <p className="body-text-secondary mb-6">
                  جرب تعديل البحث أو الفلتر
                </p>
                <Button variant="outline" onClick={() => { setSearchQuery(""); setFilterStatus("all"); }}>
                  إعادة تعيين
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Projects Grid */}
          {!isLoading && filteredProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  getStatusLabel={getStatusLabel}
                  getStatusVariant={getStatusVariant}
                  getCompletedFeatures={getCompletedFeatures}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default Projects;
