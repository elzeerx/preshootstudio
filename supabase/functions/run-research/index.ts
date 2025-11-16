import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// System prompt for research
const RESEARCH_SYSTEM_PROMPT = `أنت باحث ومحلل تقني محترف تكتب باللغة العربية الفصحى المبسّطة.

مهمتك جمع وتنظيم معلومات دقيقة وحديثة حول موضوع معيّن، بحيث تصلح لصنّاع محتوى يريدون شرح الموضوع لجمهور عام غير متخصص.

اكتب النتائج بصيغة JSON فقط، وبدون أي نص زائد، وبالبنية التالية:
{
  "summary": "ملخص شامل للموضوع في 3-5 جمل",
  "keyPoints": ["نقطة أساسية 1", "نقطة أساسية 2", ...],
  "facts": [
    {
      "label": "عنوان الحقيقة",
      "value": "القيمة أو الوصف",
      "source": "المصدر (اختياري)"
    }
  ],
  "sources": [
    {
      "title": "اسم المصدر",
      "url": "الرابط (اختياري)",
      "type": "official أو article أو video أو other"
    }
  ],
  "mythsVsReality": [
    {
      "myth": "خرافة أو مفهوم خاطئ شائع",
      "reality": "الحقيقة العلمية أو الواقعية"
    }
  ],
  "trends": ["توجه حالي 1", "توجه حالي 2", ...],
  "faqs": [
    {
      "question": "سؤال متوقع من الجمهور",
      "answer": "إجابة واضحة ومبسطة"
    }
  ]
}

التزم بالتالي:
- اجعل اللغة بسيطة وواضحة وقابلة للقراءة بصوت عالٍ في فيديو
- إذا لم تكن متأكداً من معلومة، قل إن المعلومة تقريبية أو متغيرة
- اذكر المصادر الموثوقة في حقل sources مع عناوين وروابط حقيقية قدر الإمكان
- ركز على المعلومات الحديثة والمحدّثة
- اجعل المحتوى مناسباً لصناع محتوى عرب (يوتيوبرز، ريلز، بودكاست)
- استخدم أمثلة عربية عندما يكون ذلك ممكناً
- في حقل mythsVsReality، اذكر 2-3 مفاهيم خاطئة شائعة إن وُجدت
- في حقل faqs، اذكر 3-5 أسئلة متوقعة من الجمهور العام

تذكر: أنت تساعد صانع محتوى عربي في تجهيز معلومات دقيقة وسهلة الفهم لجمهوره.`;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId } = await req.json();

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Missing projectId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching project:', projectId);

    // Fetch project from database
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (fetchError || !project) {
      console.error('Project not found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Project found:', project.topic);

    // Update status to loading
    await supabase
      .from('projects')
      .update({ research_status: 'loading' })
      .eq('id', projectId);

    // Get Lovable AI API key
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Calling Lovable AI for research...');

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: RESEARCH_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `قم بإجراء بحث شامل حول الموضوع التالي:\n\n"${project.topic}"\n\nتذكر: يجب أن تكون الإجابة بصيغة JSON فقط حسب البنية المحددة في تعليماتك.`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      // Update status to error
      await supabase
        .from('projects')
        .update({ research_status: 'error' })
        .eq('id', projectId);

      return new Response(
        JSON.stringify({ error: 'Failed to generate research' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;

    console.log('AI response received, parsing JSON...');

    // Parse JSON response
    let researchData;
    try {
      // Clean the content - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/g, '');
      }
      
      researchData = JSON.parse(cleanContent);
      console.log('JSON parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Content was:', content);
      
      // Update status to error
      await supabase
        .from('projects')
        .update({ research_status: 'error' })
        .eq('id', projectId);

      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save research data to database
    console.log('Saving research data to database...');
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        research_status: 'ready',
        research_last_run_at: new Date().toISOString(),
        research_summary: researchData.summary,
        research_data: researchData,
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Failed to update project:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save research data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Research completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        data: researchData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in run-research function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
