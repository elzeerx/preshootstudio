import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus } from "lucide-react";

interface ProjectFiltersProps {
  searchQuery: string;
  filterStatus: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (status: string) => void;
}

export const ProjectFilters = ({
  searchQuery,
  filterStatus,
  onSearchChange,
  onFilterChange,
}: ProjectFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="flex-1 relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="ابحث في مشاريعك..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-12"
        />
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filterStatus === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("all")}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          الكل
        </Button>
        <Button
          variant={filterStatus === "new" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("new")}
        >
          جديد
        </Button>
        <Button
          variant={filterStatus === "processing" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("processing")}
        >
          قيد التجهيز
        </Button>
        <Button
          variant={filterStatus === "ready" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("ready")}
        >
          جاهز
        </Button>
      </div>

      <Link to="/create">
        <Button variant="default" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          مشروع جديد
        </Button>
      </Link>
    </div>
  );
};

