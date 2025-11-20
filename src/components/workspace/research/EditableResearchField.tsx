import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Pencil, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditableResearchFieldProps {
  projectId: string;
  field: string;
  value: string;
  isEdited?: boolean;
  onSave: (field: string, value: string) => void;
  multiline?: boolean;
}

export const EditableResearchField = ({
  projectId,
  field,
  value,
  isEdited = false,
  onSave,
  multiline = false,
}: EditableResearchFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Get current project data
      const { data: project } = await supabase
        .from("projects")
        .select("research_data, research_manual_edits")
        .eq("id", projectId)
        .single();

      if (!project) throw new Error("Project not found");

      // Update the specific field in research_data
      const updatedResearchData = { ...(project.research_data as any) };
      const fieldParts = field.split(".");
      
      if (fieldParts.length === 1) {
        updatedResearchData[field] = editValue;
      } else {
        // Handle nested fields (e.g., "facts.0.value")
        let current = updatedResearchData;
        for (let i = 0; i < fieldParts.length - 1; i++) {
          current = current[fieldParts[i]];
        }
        current[fieldParts[fieldParts.length - 1]] = editValue;
      }

      // Track manual edits
      const manualEdits = {
        ...(project.research_manual_edits as any || {}),
        [field]: true,
      };

      // Save to database
      const { error } = await supabase
        .from("projects")
        .update({
          research_data: updatedResearchData as any,
          research_manual_edits: manualEdits as any,
        })
        .eq("id", projectId);

      if (error) throw error;

      toast.success("تم حفظ التعديل");
      onSave(field, editValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving field:", error);
      toast.error("فشل حفظ التعديل");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        {multiline ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={4}
            className="text-right"
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-right"
          />
        )}
        <div className="flex items-center gap-2 justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="w-4 h-4 ml-1" />
            إلغاء
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Check className="w-4 h-4 ml-1" />
            حفظ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {multiline ? (
            <p className="text-right whitespace-pre-wrap">{value}</p>
          ) : (
            <span>{value}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEdited && (
            <Badge variant="secondary" className="text-xs">
              معدّل
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pencil className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
