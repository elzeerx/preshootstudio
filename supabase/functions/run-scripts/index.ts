
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId } = await req.json();
    console.log('Fetching project:', projectId);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('Project not found:', projectError);
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Project found:', project.topic);

    // Update status to loading
    await supabase
      .from('projects')
      .update({ scripts_status: 'loading' })
      .eq('id', projectId);

    // Build user prompt with context from research if available
    let userPrompt = `الموضوع هو: ${project.topic}`;
    
    if (project.research_summary) {
      userPrompt += `\n\nملخص عن الموضوع لمساعدتك في الفهم (لا تنسخه حرفيًا، استخدمه فقط كمرجع):\n${project.research_summary}`;
    }

    userPrompt += '\n\nالرجاء توليد السكريبتات الثلاثة حسب البنية المحددة في تعليمات النظام.';

    console.log('Calling Lovable AI for scripts...');

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `أنت كاتب محتوى فيديو محترف تعمل مع صنّاع محتوى عرب.

مهمتك كتابة سكريبتات لفيديوهات تشرح موضوع معيّن لجمهور عام غير متخصص، بلغة عربية فصحى مبسّطة وقريبة من حديث الناس، قابلة للقراءة بصوت عالٍ في فيديو.

مطلوب منك أن تنتج ٣ سكريبتات مختلفة لنفس الموضوع:
1) سكريبت كامل لقراءة تلقين (Teleprompter) - نص متدفق سهل القراءة
2) سكريبت قصير لريلز (30–60 ثانية تقريبًا) - افتتاحية قوية ونقاط سريعة
3) سكريبت لفيديو طويل على يوتيوب - مخطط تفصيلي مع أقسام منظمة

الناتج يجب أن يكون بصيغة JSON فقط، وبدون أي نص زائد، وبالبنية التالية حرفيًا:
{
  "teleprompter": {
    "title": "عنوان جذاب للسكريبت",
    "tone": "friendly أو professional أو humorous أو serious",
    "estimatedDurationSec": رقم تقديري بالثواني,
    "lines": ["جملة قصيرة 1", "جملة قصيرة 2", ...]
  },
  "reel": {
    "title": "عنوان مشوق للريلز",
    "hook": "افتتاحية قوية تجذب الانتباه في 3-5 ثواني",
    "bodyPoints": ["نقطة رئيسية 1", "نقطة رئيسية 2", "نقطة رئيسية 3"],
    "outro": "خاتمة قوية مع دعوة لاتخاذ إجراء",
    "estimatedDurationSec": رقم بين 30-60
  },
  "longVideo": {
    "title": "عنوان شامل للفيديو الطويل",
    "intro": "مقدمة تشرح الموضوع وأهميته (2-3 جمل)",
    "sections": [
      {
        "title": "عنوان القسم الأول",
        "summary": "ملخص قصير للقسم",
        "bullets": ["نقطة فرعية 1", "نقطة فرعية 2", ...]
      }
    ],
    "fullScript": "النص الكامل المفصل للفيديو من البداية للنهاية",
    "outro": "خاتمة ملخصة مع دعوة لاتخاذ إجراء",
    "estimatedDurationMin": رقم تقديري بالدقائق
  }
}

التزم بالتالي:
- اجعل الجمل قصيرة وواضحة وسهلة القراءة من Teleprompter
- ابدأ السكريبتات بـ Hook قوي وحافظ على تسلسل منطقي
- في سكريبت التلقين: اجعل كل line جملة واحدة كاملة (لا تقطع الجملة)
- في سكريبت الريلز: ركز على السرعة والإثارة والمحتوى المكثف
- في الفيديو الطويل: اجعل fullScript تفصيلي وشامل (500+ كلمة)
- اعتمد على أي ملخص بحث أو نقاط رئيسية تُعطى لك كمرجع، لكن لا تنسخها حرفيًا
- استخدم لغة محادثية قريبة من الجمهور العربي
- تجنب المصطلحات المعقدة أو اشرحها بطريقة مبسطة`
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      await supabase
        .from('projects')
        .update({ 
          scripts_status: 'error',
          scripts_last_run_at: new Date().toISOString()
        })
        .eq('id', projectId);

      return new Response(
        JSON.stringify({ error: 'Failed to generate scripts' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response');
      throw new Error('No content received from AI');
    }

    console.log('AI response received, parsing JSON...');

    // Parse JSON response
    let scriptsData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      scriptsData = JSON.parse(jsonMatch[0]);
      console.log('JSON parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError, 'Content:', content);
      
      await supabase
        .from('projects')
        .update({ 
          scripts_status: 'error',
          scripts_last_run_at: new Date().toISOString()
        })
        .eq('id', projectId);

      return new Response(
        JSON.stringify({ error: 'Failed to parse scripts data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate structure
    if (!scriptsData.teleprompter || !scriptsData.reel || !scriptsData.longVideo) {
      console.error('Invalid scripts structure:', scriptsData);
      throw new Error('Invalid scripts data structure');
    }

    console.log('Saving scripts data to database...');

    // Save to database
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        scripts_status: 'ready',
        scripts_last_run_at: new Date().toISOString(),
        scripts_data: scriptsData,
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Failed to update project:', updateError);
      throw updateError;
    }

    console.log('Scripts completed successfully');

    return new Response(
      JSON.stringify({ success: true, data: scriptsData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in run-scripts function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
