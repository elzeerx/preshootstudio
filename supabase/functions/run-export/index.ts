import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PreShootExportPack {
  projectId: string;
  topic: string;
  createdAt: string;
  statuses: {
    research: string;
    scripts: string;
    broll: string;
    prompts: string;
    article: string;
  };
  research?: any;
  scripts?: any;
  broll?: any;
  prompts?: any;
  article?: any;
  markdown: string;
}

function determineSectionStatus(status: string | null, data: any): string {
  if (!status || status === 'idle') return 'idle';
  if (status === 'error') return 'error';
  if (status === 'ready' && data) return 'ready';
  return 'missing';
}

function buildMarkdown(project: any, pack: Partial<PreShootExportPack>): string {
  let md = '';

  // Header
  md += `# PreShoot Pack – ${project.topic}\n\n`;
  md += `- **تاريخ إنشاء المشروع:** ${new Date(project.created_at).toLocaleDateString('ar-SA')}\n`;
  md += `- **معرف المشروع:** ${project.id}\n\n`;

  // Status Summary
  md += `## ملخص حالة مخرجات PreShoot\n\n`;
  md += `- **البحث:** ${getStatusLabel(pack.statuses!.research)}\n`;
  md += `- **السكريبتات:** ${getStatusLabel(pack.statuses!.scripts)}\n`;
  md += `- **B-Roll:** ${getStatusLabel(pack.statuses!.broll)}\n`;
  md += `- **البرومبتات:** ${getStatusLabel(pack.statuses!.prompts)}\n`;
  md += `- **المقال:** ${getStatusLabel(pack.statuses!.article)}\n\n`;

  md += `---\n\n`;

  // Research Section
  if (pack.research && pack.statuses!.research === 'ready') {
    md += `## البحث\n\n`;
    
    if (pack.research.summary) {
      md += `### ملخص البحث\n\n`;
      md += `${pack.research.summary}\n\n`;
    }

    if (pack.research.keyPoints && pack.research.keyPoints.length > 0) {
      md += `### أهم النقاط\n\n`;
      pack.research.keyPoints.forEach((point: string) => {
        md += `- ${point}\n`;
      });
      md += `\n`;
    }

    if (pack.research.facts && pack.research.facts.length > 0) {
      md += `### حقائق ومعلومات\n\n`;
      pack.research.facts.forEach((fact: any) => {
        md += `- **${fact.label}:** ${fact.value}\n`;
      });
      md += `\n`;
    }

    if (pack.research.sources && pack.research.sources.length > 0) {
      md += `### المصادر\n\n`;
      pack.research.sources.forEach((source: any) => {
        md += `- ${source.title}`;
        if (source.url) md += ` ([رابط](${source.url}))`;
        md += `\n`;
      });
      md += `\n`;
    }
  }

  // Scripts Section
  if (pack.scripts && pack.statuses!.scripts === 'ready') {
    md += `## السكريبتات\n\n`;

    if (pack.scripts.teaser) {
      md += `### سكريبت التلقين (Teaser)\n\n`;
      md += `**العنوان:** ${pack.scripts.teaser.title}\n\n`;
      if (pack.scripts.teaser.hook) {
        md += `**الهوك:**\n${pack.scripts.teaser.hook}\n\n`;
      }
      if (pack.scripts.teaser.mainPoints && pack.scripts.teaser.mainPoints.length > 0) {
        md += `**النقاط الرئيسية:**\n`;
        pack.scripts.teaser.mainPoints.forEach((point: string) => {
          md += `- ${point}\n`;
        });
        md += `\n`;
      }
    }

    if (pack.scripts.reel) {
      md += `### سكريبت الريلز (Reel)\n\n`;
      md += `**العنوان:** ${pack.scripts.reel.title}\n\n`;
      if (pack.scripts.reel.hook) {
        md += `**الهوك:**\n${pack.scripts.reel.hook}\n\n`;
      }
      if (pack.scripts.reel.mainPoints && pack.scripts.reel.mainPoints.length > 0) {
        md += `**النقاط الرئيسية:**\n`;
        pack.scripts.reel.mainPoints.forEach((point: string) => {
          md += `- ${point}\n`;
        });
        md += `\n`;
      }
    }

    if (pack.scripts.longVideo) {
      md += `### سكريبت الفيديو الطويل\n\n`;
      md += `**العنوان:** ${pack.scripts.longVideo.title}\n\n`;
      if (pack.scripts.longVideo.outline && pack.scripts.longVideo.outline.length > 0) {
        md += `**المخطط:**\n`;
        pack.scripts.longVideo.outline.forEach((section: any) => {
          md += `- **${section.section}:** ${section.content}\n`;
        });
        md += `\n`;
      }
    }
  }

  // B-Roll Section
  if (pack.broll && pack.statuses!.broll === 'ready') {
    md += `## خطة الـ B-Roll\n\n`;

    if (pack.broll.generalTips && pack.broll.generalTips.length > 0) {
      md += `### نصائح عامة\n\n`;
      pack.broll.generalTips.forEach((tip: string) => {
        md += `- ${tip}\n`;
      });
      md += `\n`;
    }

    if (pack.broll.shots && pack.broll.shots.length > 0) {
      md += `### اللقطات المقترحة\n\n`;
      pack.broll.shots.forEach((shot: any, index: number) => {
        md += `#### ${index + 1}. ${shot.title}\n\n`;
        md += `${shot.description}\n\n`;
        md += `- **نوع اللقطة:** ${shot.shotType}\n`;
        md += `- **حركة الكاميرا:** ${shot.cameraMovement}\n`;
        if (shot.lighting) md += `- **الإضاءة:** ${shot.lighting}\n`;
        md += `\n`;
      });
    }
  }

  // Prompts Section
  if (pack.prompts && pack.statuses!.prompts === 'ready') {
    md += `## حزمة البرومبتات\n\n`;

    if (pack.prompts.imagePrompts && pack.prompts.imagePrompts.length > 0) {
      md += `### برومبتات الصور\n\n`;
      pack.prompts.imagePrompts.forEach((img: any) => {
        md += `#### ${img.label}\n\n`;
        md += `- **Model:** ${img.model}\n`;
        md += `- **Aspect Ratio:** ${img.aspectRatio}\n`;
        md += `- **Style:** ${img.style}\n\n`;
        md += '```text\n';
        md += `${img.prompt}\n`;
        md += '```\n\n';
      });
    }

    if (pack.prompts.videoPrompts && pack.prompts.videoPrompts.length > 0) {
      md += `### برومبتات الفيديو\n\n`;
      pack.prompts.videoPrompts.forEach((vid: any) => {
        md += `#### ${vid.label}\n\n`;
        md += `- **Duration:** ${vid.durationSec}s\n`;
        md += `- **Style:** ${vid.style}\n\n`;
        md += '```text\n';
        md += `${vid.prompt}\n`;
        md += '```\n\n';
      });
    }

    if (pack.prompts.thumbnailPrompts && pack.prompts.thumbnailPrompts.length > 0) {
      md += `### برومبتات الـ Thumbnail\n\n`;
      pack.prompts.thumbnailPrompts.forEach((thumb: any) => {
        md += `#### ${thumb.label}\n\n`;
        md += '```text\n';
        md += `${thumb.prompt}\n`;
        md += '```\n\n';
      });
    }

    if (pack.prompts.notes && pack.prompts.notes.length > 0) {
      md += `### ملاحظات إضافية\n\n`;
      pack.prompts.notes.forEach((note: string) => {
        md += `- ${note}\n`;
      });
      md += `\n`;
    }
  }

  // Article Section
  if (pack.article && pack.statuses!.article === 'ready') {
    md += `## المقال\n\n`;
    md += `### ${pack.article.title}\n\n`;
    
    if (pack.article.subtitle) {
      md += `#### ${pack.article.subtitle}\n\n`;
    }

    md += `**مدة القراءة:** ${pack.article.readingTimeMinutes} دقيقة\n\n`;

    md += `#### مقدمة\n\n`;
    md += `${pack.article.intro}\n\n`;

    if (pack.article.sections && pack.article.sections.length > 0) {
      md += `#### الأقسام\n\n`;
      pack.article.sections.forEach((section: any) => {
        md += `##### ${section.heading}\n\n`;
        md += `${section.body}\n\n`;
      });
    }

    md += `#### خاتمة\n\n`;
    md += `${pack.article.conclusion}\n\n`;

    if (pack.article.seoMeta) {
      md += `#### معلومات SEO\n\n`;
      md += `- **عنوان SEO:** ${pack.article.seoMeta.seoTitle}\n`;
      md += `- **وصف SEO:** ${pack.article.seoMeta.seoDescription}\n`;
      if (pack.article.seoMeta.seoKeywords && pack.article.seoMeta.seoKeywords.length > 0) {
        md += `- **الكلمات المفتاحية:** ${pack.article.seoMeta.seoKeywords.join(', ')}\n`;
      }
      md += `\n`;
    }
  }

  md += `---\n\n`;
  md += `*تم إنشاء هذه الحزمة بواسطة PreShoot AI*\n`;

  return md;
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'ready': return '✅ جاهز';
    case 'error': return '❌ خطأ';
    case 'idle': return '⏸️ لم يتم';
    case 'missing': return '⚠️ غير متوفر';
    default: return '❓ غير معروف';
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get project ID from request body
    const { projectId } = await req.json();

    if (!projectId) {
      console.error('Missing projectId parameter');
      return new Response(
        JSON.stringify({ error: 'معرف المشروع مطلوب' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Building export pack for project: ${projectId}`);

    // Fetch project from database
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (fetchError || !project) {
      console.error('Project not found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'لم يتم العثور على المشروع' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build export pack
    const exportPack: PreShootExportPack = {
      projectId: project.id,
      topic: project.topic,
      createdAt: project.created_at,
      statuses: {
        research: determineSectionStatus(project.research_status, project.research_data),
        scripts: determineSectionStatus(project.scripts_status, project.scripts_data),
        broll: determineSectionStatus(project.broll_status, project.broll_data),
        prompts: determineSectionStatus(project.prompts_status, project.prompts_data),
        article: determineSectionStatus(project.article_status, project.article_data),
      },
      research: project.research_data,
      scripts: project.scripts_data,
      broll: project.broll_data,
      prompts: project.prompts_data,
      article: project.article_data,
      markdown: '',
    };

    // Build markdown
    exportPack.markdown = buildMarkdown(project, exportPack);

    console.log('Export pack built successfully');

    return new Response(
      JSON.stringify(exportPack),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error building export pack:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'حدث خطأ أثناء بناء حزمة التصدير' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
