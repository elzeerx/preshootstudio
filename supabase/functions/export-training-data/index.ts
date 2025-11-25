import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
  exportType: string;
  fileFormat: string;
  minQuality: number;
  selectedSections: string[];
  anonymize: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const {
      exportType,
      fileFormat,
      minQuality,
      selectedSections,
      anonymize,
    }: ExportRequest = await req.json();

    // Fetch approved projects with moderation data
    let query = supabase
      .from('projects')
      .select(`
        *,
        project_moderation!inner (
          moderation_status,
          quality_rating,
          training_eligible,
          training_tags
        )
      `)
      .eq('project_moderation.training_eligible', true);

    if (minQuality > 0) {
      query = query.gte('project_moderation.quality_rating', minQuality);
    }

    const { data: projects, error: fetchError } = await query;

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }

    // Process projects based on export type and sections
    const exportData = projects.map(project => {
      const item: any = {
        topic: project.topic,
        created_at: project.created_at,
        quality_rating: project.project_moderation?.quality_rating,
        training_tags: project.project_moderation?.training_tags || [],
      };

      // Add user_id only if not anonymizing
      if (!anonymize) {
        item.user_id = project.user_id;
      }

      // Add selected sections
      if (selectedSections.includes('research') && project.research_data) {
        item.research = project.research_data;
      }
      if (selectedSections.includes('scripts') && project.scripts_data) {
        item.scripts = project.scripts_data;
      }
      if (selectedSections.includes('prompts') && project.prompts_data) {
        item.prompts = project.prompts_data;
      }
      if (selectedSections.includes('broll') && project.broll_data) {
        item.broll = project.broll_data;
      }
      if (selectedSections.includes('article') && project.article_data) {
        item.article = project.article_data;
      }
      if (selectedSections.includes('simplify') && project.simplify_data) {
        item.simplify = project.simplify_data;
      }

      return item;
    });

    // Format based on file type
    let content: string;
    let totalTokens = 0;

    if (fileFormat === 'jsonl') {
      // JSONL format - one JSON object per line
      content = exportData.map(item => {
        const tokens = estimateTokens(JSON.stringify(item));
        totalTokens += tokens;
        return JSON.stringify(item);
      }).join('\n');
    } else if (fileFormat === 'csv') {
      // CSV format - simplified
      const headers = ['topic', 'quality_rating', 'training_tags', 'sections'];
      const rows = exportData.map(item => {
        const sections = Object.keys(item).filter(k => !['topic', 'quality_rating', 'training_tags', 'user_id', 'created_at'].includes(k));
        return [
          item.topic,
          item.quality_rating,
          (item.training_tags || []).join(';'),
          sections.join(';'),
        ];
      });
      content = [headers, ...rows].map(row => row.join(',')).join('\n');
    } else {
      // JSON format
      content = JSON.stringify(exportData, null, 2);
      totalTokens = estimateTokens(content);
    }

    // Log export to database
    await supabase.from('training_data_exports').insert({
      exported_by: user.id,
      export_type: exportType,
      project_count: projects.length,
      total_tokens: totalTokens,
      file_format: fileFormat,
      filters_applied: {
        minQuality,
        selectedSections,
        anonymize,
      },
    });

    console.log(`Exported ${projects.length} projects, ~${totalTokens} tokens`);

    return new Response(
      JSON.stringify({
        content,
        projectCount: projects.length,
        totalTokens,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
