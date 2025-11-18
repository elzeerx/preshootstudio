import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced system prompt for research with Tavily integration
const RESEARCH_SYSTEM_PROMPT_V2 = `أنت باحث وصحفي تقني محترف، وتكتب باللغة العربية الفصحى المبسّطة.

يتم تزويدك بنتائج بحث حقيقية من Tavily Web Search تتضمن عناوين وروابط ونصوص مختصرة من مصادر فعلية على الإنترنت.

مهمتك:
1. تحليل جميع النتائج المقدمة بعناية
2. استخراج أهم المعلومات الدقيقة والحديثة
3. جمع الحقائق مع ذكر المصدر الحقيقي + الرابط الصحيح الفعلي
4. تبسيط الفكرة للقارئ غير المتخصص
5. تنظيم المخرجات بصيغة JSON فقط

البنية المطلوبة (JSON فقط):
{
  "summary": "ملخص عربي واضح للموضوع في 3-5 جمل، يشرح الفكرة الأساسية بشكل مبسط",
  "keyPoints": [
    "النقطة الأساسية الأولى",
    "النقطة الأساسية الثانية",
    "النقطة الأساسية الثالثة"
  ],
  "facts": [
    {
      "label": "عنوان الحقيقة أو الإحصائية",
      "value": "القيمة أو الوصف التفصيلي",
      "source": "عنوان المصدر الحقيقي من نتائج Tavily",
      "url": "الرابط الفعلي والصحيح من نتائج Tavily فقط"
    }
  ],
  "sources": [
    {
      "title": "عنوان المصدر",
      "url": "الرابط الحقيقي من نتائج Tavily",
      "type": "official" أو "article" أو "blog" أو "video" أو "news"
    }
  ],
  "mythsVsReality": [
    {
      "myth": "خرافة أو مفهوم خاطئ شائع حول هذا الموضوع",
      "reality": "الحقيقة العلمية أو الواقعية المدعومة بالمصادر"
    }
  ],
  "trends": [
    "التوجه أو الترند الحالي الأول",
    "التوجه أو الترند الحالي الثاني"
  ],
  "faqs": [
    {
      "question": "سؤال متوقع من الجمهور العام",
      "answer": "إجابة واضحة ومبسطة ومفيدة"
    }
  ]
}

قواعد صارمة يجب الالتزام بها:
✅ استخدم فقط المعلومات والروابط الموجودة في نتائج Tavily المقدمة
✅ لا تختلق أي مصادر أو روابط خارج نتائج Tavily
✅ إذا كانت المعلومة غير مؤكدة أو تختلف بين المصادر، اذكر ذلك بوضوح في النص
✅ استخدم لغة سهلة القراءة، مختصرة، مناسبة لشرح فيديو يوتيوب أو ريلز
✅ ممنوع منعًا باتًا استخدام أي مراجع دون روابط حقيقية من Tavily
✅ اجعل المحتوى مناسباً لصناع محتوى عرب (يوتيوبرز، صناع ريلز، بودكاست)
✅ ركز على المعلومات الحديثة والمحدثة والدقيقة
✅ في حقل mythsVsReality، اذكر 2-3 مفاهيم خاطئة شائعة إن وُجدت
✅ في حقل faqs، اذكر 3-5 أسئلة متوقعة من الجمهور العام

تذكر: أنت تساعد صانع محتوى عربي في تجهيز معلومات دقيقة وموثقة بمصادر حقيقية، لا مختلقة.`;

// Tavily Web Search function
async function searchWithTavily(query: string, maxResults = 8) {
  const tavilyApiKey = Deno.env.get('TAVILY_API_KEY');
  
  if (!tavilyApiKey) {
    throw new Error('TAVILY_API_KEY not configured');
  }

  console.log('Searching with Tavily:', query);

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: tavilyApiKey,
      query: query,
      search_depth: 'advanced',
      max_results: maxResults,
      include_answer: false,
      include_images: false,
      include_domains: [], // Open search
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Tavily API error:', response.status, errorText);
    throw new Error(`Tavily API error: ${response.status}`);
  }

  const data = await response.json();
  console.log(`Tavily returned ${data.results?.length || 0} results`);
  
  return data.results || [];
}

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

    // Get Lovable API Key
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Step 1: Search with Tavily
    console.log('Searching with Tavily for:', project.topic);
    let tavilyResults;
    try {
      tavilyResults = await searchWithTavily(project.topic, 8);
    } catch (tavilyError) {
      console.error('Tavily search failed:', tavilyError);
      
      // Update status to error
      await supabase
        .from('projects')
        .update({ research_status: 'error' })
        .eq('id', projectId);

      return new Response(
        JSON.stringify({ error: 'Failed to fetch search results from Tavily' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Build user prompt with Tavily results
    const userPrompt = `الموضوع المطلوب البحث عنه: "${project.topic}"

هذه نتائج بحث حقيقية من Tavily Web Search:

${JSON.stringify(tavilyResults, null, 2)}

استخدم هذه النتائج فقط لاستخراج الحقائق والمصادر والروابط.
لا تختلق أي روابط أو مصادر غير موجودة في النتائج أعلاه.
قدّم المخرجات بصيغة JSON حسب البنية المحددة في تعليماتك.`;

    console.log('Calling Lovable AI for analysis...');

    // Step 3: Call Lovable AI Gateway with Tavily results
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
            content: RESEARCH_SYSTEM_PROMPT_V2
          },
          {
            role: 'user',
            content: userPrompt
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

    console.log('Research completed successfully with Tavily web search');

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
