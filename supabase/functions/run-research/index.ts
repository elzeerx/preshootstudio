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

// Tavily Web Search function with caching
async function searchWithTavily(query: string, maxResults = 8, supabase: any) {
  const tavilyApiKey = Deno.env.get('TAVILY_API_KEY');
  
  if (!tavilyApiKey) {
    throw new Error('TAVILY_API_KEY not configured');
  }

  // Create query hash for caching
  const encoder = new TextEncoder();
  const queryData = encoder.encode(query);
  const hashBuffer = await crypto.subtle.digest('SHA-256', queryData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const queryHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Check cache first
  const { data: cachedResult } = await supabase
    .from('tavily_cache')
    .select('*')
    .eq('query_hash', queryHash)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (cachedResult) {
    console.log('Using cached Tavily results for:', query);
    return cachedResult.search_results;
  }

  console.log('Searching with Tavily (no cache):', query);

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

  const responseData = await response.json();
  const results = responseData.results || [];
  console.log(`Tavily returned ${results.length} results`);
  
  // Cache results for 24 hours (background task)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  supabase
    .from('tavily_cache')
    .insert({
      query_hash: queryHash,
      query_text: query,
      search_results: results,
      expires_at: expiresAt.toISOString(),
    })
    .then(() => console.log('Cached Tavily results'))
    .catch((err: Error) => console.error('Failed to cache results:', err));
  
  return results;
}

// Calculate research quality score
function calculateQualityScore(researchData: any): { score: number; metrics: any } {
  const sourceCount = researchData.sources?.length || 0;
  const sourceTypes = new Set(researchData.sources?.map((s: any) => s.type || "other") || []);
  const hasTrends = (researchData.trends?.length || 0) > 0;

  // Scoring components
  const sourceCountScore = Math.min(40, sourceCount * 5); // Max 40 points
  const diversityScore = Math.min(30, sourceTypes.size * 6); // Max 30 points
  const recencyScore = hasTrends ? 30 : 15; // Max 30 points

  const overallScore = Math.round(sourceCountScore + diversityScore + recencyScore);

  return {
    score: overallScore,
    metrics: {
      sourceCount: sourceCountScore,
      sourceDiversity: diversityScore,
      recencyScore: recencyScore,
      overallScore: overallScore,
    },
  };
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

    // Step 1: Search with Tavily (with caching)
    console.log('Searching with Tavily for:', project.topic);
    let tavilyResults;
    try {
      tavilyResults = await searchWithTavily(project.topic, 8, supabase);
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
        tools: [{
          type: "function",
          function: {
            name: "provide_research_data",
            description: "Provide comprehensive research data about the topic",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string", description: "ملخص شامل للموضوع بناءً على نتائج البحث" },
                keyPoints: { 
                  type: "array", 
                  items: { type: "string" },
                  description: "نقاط رئيسية من البحث (3-5 نقاط)"
                },
                facts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      label: { type: "string" },
                      value: { type: "string" },
                      source: { type: "string" },
                      url: { type: "string" }
                    },
                    required: ["label", "value", "source", "url"]
                  },
                  description: "حقائق وإحصائيات مع المصادر (3-5 حقائق)"
                },
                sources: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      url: { type: "string" },
                      type: { type: "string", enum: ["article", "blog", "news", "video", "official", "research"] }
                    },
                    required: ["title", "url", "type"]
                  },
                  description: "قائمة المصادر المستخدمة"
                },
                mythsVsReality: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      myth: { type: "string" },
                      reality: { type: "string" }
                    },
                    required: ["myth", "reality"]
                  },
                  description: "خرافات شائعة والحقيقة عنها (2-3 خرافات)"
                }
              },
              required: ["summary", "keyPoints", "facts", "sources"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "provide_research_data" } }
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
    
    console.log('AI response received, extracting structured data...');

    // Extract research data from tool call response
    let researchData;
    try {
      const toolCall = aiData.choices[0].message.tool_calls?.[0];
      if (!toolCall || !toolCall.function || !toolCall.function.arguments) {
        throw new Error('No tool call found in AI response');
      }
      
      researchData = JSON.parse(toolCall.function.arguments);
      console.log('Structured data extracted successfully');
    } catch (parseError) {
      console.error('Failed to extract research data:', parseError);
      console.error('AI response:', JSON.stringify(aiData, null, 2));
      
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

    // Calculate quality score
    const qualityInfo = calculateQualityScore(researchData);
    console.log('Quality score calculated:', qualityInfo.score);

    // Get current version number for history
    const { data: historyCount } = await supabase
      .from('research_history')
      .select('version_number', { count: 'exact' })
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersion = (historyCount && historyCount.length > 0) 
      ? (historyCount[0].version_number + 1) 
      : 1;

    // Save to research history
    console.log('Saving to research history (version', nextVersion, ')...');
    const { error: historyError } = await supabase
      .from('research_history')
      .insert({
        project_id: projectId,
        version_number: nextVersion,
        research_data: researchData,
        research_summary: researchData.summary,
        quality_score: qualityInfo.score,
        quality_metrics: qualityInfo.metrics,
        created_by: project.user_id,
      });

    if (historyError) {
      console.error('Failed to save research history:', historyError);
      // Continue anyway, this is not critical
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
        research_quality_score: qualityInfo.score,
        research_quality_metrics: qualityInfo.metrics,
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
        data: researchData,
        qualityScore: qualityInfo.score,
        version: nextVersion,
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
