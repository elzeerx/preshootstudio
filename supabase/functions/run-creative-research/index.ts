import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { trackTokenUsage } from "../_shared/tokenTracker.ts";
import { checkTokenLimit } from "../_shared/tokenLimitChecker.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// System prompts for different content types
const CREATIVE_SYSTEM_PROMPT = `أنت خبير في صناعة المحتوى الإبداعي والترفيهي، وتساعد صناع المحتوى العرب في تطوير أفكار مبتكرة.

أنت تعمل مع محتوى إبداعي وترفيهي (ألعاب، مراجعات، ترفيه، فلوجات).

مهمتك:
1. تحليل الموضوع أو الفكرة المقترحة
2. تقديم زوايا إبداعية متعددة لتناول الموضوع
3. اقتراح هوكس (hooks) قوية لجذب المشاهدين
4. تقديم أفكار لهيكلة المحتوى (story beats)
5. تحديد المحفزات العاطفية والعناصر القابلة للارتباط
6. اقتراح صيغ فيديو رائجة تناسب هذا النوع من المحتوى
7. توقع أسئلة الجمهور واهتماماتهم
8. تقديم أمثلة لمحتوى مشابه ناجح (كمصدر إلهام)
9. تحديد نقطة البيع الفريدة (USP) للمحتوى

البنية المطلوبة (JSON فقط):
{
  "contentAngles": ["زاوية إبداعية أولى", "زاوية ثانية", "زاوية ثالثة"],
  "hooks": ["هوك جذاب أول", "هوك ثاني", "هوك ثالث"],
  "storyBeats": ["نقطة سردية أولى", "نقطة ثانية", "نقطة ثالثة"],
  "emotionalTriggers": ["محفز عاطفي أول", "محفز ثاني"],
  "trendingFormats": ["صيغة فيديو رائجة أولى", "صيغة ثانية"],
  "audienceQuestions": ["سؤال متوقع من الجمهور", "سؤال آخر"],
  "inspirationReferences": ["مثال لمحتوى ناجح مشابه"],
  "uniqueValueProp": "ما الذي يجعل هذا المحتوى مميزاً وفريداً"
}

قواعد مهمة:
✅ ركز على الجوانب الإبداعية والترفيهية
✅ اجعل الأفكار قابلة للتنفيذ وعملية
✅ افهم جمهور صناع المحتوى العرب (يوتيوب، تيك توك، إنستغرام)
✅ قدم أفكاراً متنوعة تناسب صيغ مختلفة (ريلز، فيديو طويل، بودكاست)
✅ استخدم لغة عربية بسيطة وواضحة`;

const PERSONAL_SYSTEM_PROMPT = `أنت خبير في صناعة المحتوى الشخصي وسرد القصص، وتساعد صناع المحتوى في تطوير محتوى قصصي وتجارب شخصية مؤثرة.

أنت تعمل مع محتوى شخصي (تجارب حياتية، قصص، نمط حياة).

مهمتك:
1. مساعدة صانع المحتوى في بناء قصة مؤثرة
2. تقديم هيكل سردي واضح للقصة
3. تحديد نقاط الاتصال العاطفي مع الجمهور
4. اقتراح هوكس عاطفية جذابة
5. تحديد العناصر القابلة للارتباط (relatable elements)
6. تقديم أفكار لتحويل التجربة الشخصية إلى محتوى مفيد
7. توقع ردود فعل واهتمامات الجمهور
8. تحديد فرص بناء العلامة الشخصية

البنية المطلوبة (JSON فقط):
{
  "contentAngles": ["زاوية لسرد القصة", "زاوية أخرى للتجربة"],
  "hooks": ["هوك عاطفي جذاب", "هوك آخر"],
  "storyBeats": ["البداية - التقديم", "الصراع أو التحدي", "التحول", "الخاتمة والدرس المستفاد"],
  "emotionalTriggers": ["محفز عاطفي يتواصل مع الجمهور", "محفز آخر"],
  "trendingFormats": ["صيغة سرد قصصي رائجة"],
  "audienceQuestions": ["سؤال قد يطرحه المشاهد", "سؤال آخر"],
  "inspirationReferences": ["أمثلة على محتوى قصصي ناجح"],
  "uniqueValueProp": "ما الذي يجعل هذه القصة فريدة ومؤثرة"
}

قواعد مهمة:
✅ ركز على الصدق والأصالة في السرد
✅ اجعل القصة قابلة للارتباط (relatable)
✅ حدد الدروس والفوائد التي يمكن للجمهور استخلاصها
✅ اقترح طرقاً لجعل المحتوى ملهماً ومفيداً`;

const OPINION_SYSTEM_PROMPT = `أنت خبير في صناعة المحتوى الرأي والتعليق، وتساعد صناع المحتوى في بناء محتوى متوازن ومثير للنقاش.

أنت تعمل مع محتوى رأي (تحليل، تعليق، ردود فعل، مراجعات نقدية).

مهمتك:
1. تحليل الموضوع من زوايا متعددة
2. تقديم وجهات نظر متنوعة ومتوازنة
3. اقتراح حجج ونقاط قوية للنقاش
4. تحديد نقاط الجدل والخلاف المحتملة
5. اقتراح هيكل للمحتوى الرأي
6. توقع ردود الفعل والتعليقات
7. تحديد فرص التفاعل مع الجمهور

البنية المطلوبة (JSON فقط):
{
  "contentAngles": ["زاوية رأي أولى", "زاوية معارضة", "زاوية وسطية"],
  "hooks": ["هوك يثير الفضول والنقاش", "هوك آخر"],
  "storyBeats": ["تقديم الموضوع", "عرض وجهة النظر", "مناقشة الآراء المختلفة", "الخلاصة"],
  "emotionalTriggers": ["عنصر يثير النقاش", "نقطة خلاف محتملة"],
  "trendingFormats": ["صيغة رائجة لمحتوى الرأي"],
  "audienceQuestions": ["سؤال متوقع من المشاهدين", "سؤال آخر"],
  "inspirationReferences": ["أمثلة على محتوى رأي ناجح"],
  "uniqueValueProp": "ما الذي يجعل هذا الرأي أو التحليل مميزاً"
}

قواعد مهمة:
✅ كن متوازناً واعرض وجهات نظر متعددة
✅ استخدم حجج منطقية ومقنعة
✅ شجع على النقاش البناء
✅ تجنب التطرف أو الاستقطاب المبالغ فيه`;

function getSystemPrompt(contentType: string): string {
  switch (contentType) {
    case 'creative':
      return CREATIVE_SYSTEM_PROMPT;
    case 'personal':
      return PERSONAL_SYSTEM_PROMPT;
    case 'opinion':
      return OPINION_SYSTEM_PROMPT;
    default:
      return CREATIVE_SYSTEM_PROMPT;
  }
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

    console.log('Fetching project for creative research:', projectId);

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

    console.log('Project found:', project.topic, '| Content Type:', project.content_type);

    // Check token limits before proceeding
    const limitCheck = await checkTokenLimit(
      supabaseUrl,
      supabaseKey,
      project.user_id,
      30000 // Estimated tokens for creative research (lower than factual)
    );

    if (!limitCheck.canProceed) {
      console.log('Token limit exceeded for user:', project.user_id);
      
      await supabase
        .from('projects')
        .update({ research_status: 'error' })
        .eq('id', projectId);

      return new Response(
        JSON.stringify({ 
          error: 'تم تجاوز حد الاستخدام الشهري. يرجى الانتظار حتى بداية الشهر القادم.',
          limit_info: {
            current_usage: limitCheck.currentUsage,
            limit: limitCheck.limit,
            usage_percentage: limitCheck.usagePercentage
          }
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

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

    // Select system prompt based on content type
    const contentType = project.content_type || 'creative';
    const systemPrompt = getSystemPrompt(contentType);

    // Build user prompt (no web search needed)
    const userPrompt = `الموضوع أو الفكرة: "${project.topic}"

نوع المحتوى: ${contentType === 'creative' ? 'إبداعي/ترفيهي' : contentType === 'personal' ? 'شخصي/قصصي' : 'رأي/تحليل'}

قدّم أفكاراً إبداعية وعملية لتطوير هذا المحتوى بناءً على نوع المحتوى المحدد.
قدّم المخرجات بصيغة JSON حسب البنية المحددة في تعليماتك.`;

    console.log('Calling Lovable AI for creative ideation...');

    // Call Lovable AI Gateway (NO web search)
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
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "provide_creative_research",
            description: "Provide creative ideation and content angles",
            parameters: {
              type: "object",
              properties: {
                contentAngles: { 
                  type: "array", 
                  items: { type: "string" },
                  description: "زوايا إبداعية متعددة لتناول الموضوع (3-5 زوايا)"
                },
                hooks: { 
                  type: "array", 
                  items: { type: "string" },
                  description: "هوكس جذابة لبداية المحتوى (3-5 هوكس)"
                },
                storyBeats: {
                  type: "array",
                  items: { type: "string" },
                  description: "نقاط سردية لهيكلة المحتوى (4-6 نقاط)"
                },
                emotionalTriggers: {
                  type: "array",
                  items: { type: "string" },
                  description: "محفزات عاطفية وعناصر قابلة للارتباط (3-4 محفزات)"
                },
                trendingFormats: {
                  type: "array",
                  items: { type: "string" },
                  description: "صيغ فيديو رائجة تناسب هذا المحتوى (2-4 صيغ)"
                },
                audienceQuestions: {
                  type: "array",
                  items: { type: "string" },
                  description: "أسئلة متوقعة من الجمهور (3-5 أسئلة)"
                },
                inspirationReferences: {
                  type: "array",
                  items: { type: "string" },
                  description: "أمثلة على محتوى مشابه ناجح (2-3 أمثلة)"
                },
                uniqueValueProp: {
                  type: "string",
                  description: "نقطة البيع الفريدة - ما يميز هذا المحتوى"
                }
              },
              required: ["contentAngles", "hooks", "storyBeats", "emotionalTriggers", "uniqueValueProp"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "provide_creative_research" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      await supabase
        .from('projects')
        .update({ research_status: 'error' })
        .eq('id', projectId);

      return new Response(
        JSON.stringify({ error: 'Failed to generate creative research' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    
    console.log('AI response received, extracting creative data...');

    // Track token usage
    const usage = aiData.usage || {};
    await trackTokenUsage(supabaseUrl, supabaseKey, {
      userId: project.user_id,
      projectId: projectId,
      functionName: 'run-creative-research',
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      modelUsed: 'google/gemini-2.5-flash',
      requestStatus: 'success',
    });

    // Extract creative research data from tool call response
    let creativeData;
    try {
      const toolCall = aiData.choices[0].message.tool_calls?.[0];
      if (!toolCall || !toolCall.function || !toolCall.function.arguments) {
        throw new Error('No tool call found in AI response');
      }
      
      creativeData = JSON.parse(toolCall.function.arguments);
      console.log('Creative data extracted successfully');
    } catch (parseError) {
      console.error('Failed to extract creative data:', parseError);
      console.error('AI response:', JSON.stringify(aiData, null, 2));
      
      await supabase
        .from('projects')
        .update({ research_status: 'error' })
        .eq('id', projectId);

      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save creative data to database
    console.log('Saving creative research data to database...');
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        creative_data: creativeData,
        research_status: 'completed',
        research_last_run_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Failed to update project:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save creative research' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creative research completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        creativeData: creativeData,
        contentType: contentType
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in creative research function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
