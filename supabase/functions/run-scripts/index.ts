
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { trackTokenUsage } from "../_shared/tokenTracker.ts";

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

    // Determine content type
    const contentType = project.content_type || 'factual';
    const isCreativeContent = contentType === 'creative' || contentType === 'personal' || contentType === 'opinion';
    console.log('Content type:', contentType);

    // Update status to loading
    await supabase
      .from('projects')
      .update({ scripts_status: 'loading' })
      .eq('id', projectId);

    // Build user prompt based on content type
    let userPrompt = `الموضوع هو: ${project.topic}`;
    
    if (isCreativeContent && project.creative_data) {
      // Use creative research data
      const creativeData = project.creative_data as any;
      
      if (creativeData.uniqueValueProp) {
        userPrompt += `\n\nما يميز هذا المحتوى: ${creativeData.uniqueValueProp}`;
      }
      
      if (creativeData.contentAngles && creativeData.contentAngles.length > 0) {
        userPrompt += `\n\nزوايا المحتوى المقترحة:\n${creativeData.contentAngles.slice(0, 3).map((angle: string, i: number) => `${i + 1}. ${angle}`).join('\n')}`;
      }
      
      if (creativeData.hooks && creativeData.hooks.length > 0) {
        userPrompt += `\n\nافتتاحيات جذابة:\n${creativeData.hooks.slice(0, 2).map((hook: string) => `• ${hook}`).join('\n')}`;
      }
      
      if (creativeData.storyBeats && creativeData.storyBeats.length > 0) {
        userPrompt += `\n\nهيكل القصة المقترح:\n${creativeData.storyBeats.map((beat: string, i: number) => `${i + 1}. ${beat}`).join('\n')}`;
      }
      
      if (creativeData.emotionalTriggers && creativeData.emotionalTriggers.length > 0) {
        userPrompt += `\n\nالمحفزات العاطفية: ${creativeData.emotionalTriggers.slice(0, 3).join('، ')}`;
      }
    } else if (project.research_summary) {
      // Use factual research data
      userPrompt += `\n\nملخص عن الموضوع لمساعدتك في الفهم (لا تنسخه حرفيًا، استخدمه فقط كمرجع):\n${project.research_summary}`;
    }

    userPrompt += '\n\nالرجاء توليد السكريبتات الثلاثة حسب البنية المحددة في تعليمات النظام.';

    // System prompt adapts based on content type
    const systemPrompt = isCreativeContent 
      ? `أنت كاتب محتوى فيديو محترف متخصص في المحتوى الترفيهي والإبداعي.

قواعد اللغة العربية:
✅ استخدم اللغة العربية الفصحى الصرفة حصراً
✅ تجنب تماماً أي لهجات عامية أو محلية أو خليجية أو مصرية أو شامية
✅ استخدم مفردات فصيحة واضحة ومفهومة للجمهور العربي عموماً
✅ حافظ على اتساق اللغة في جميع المخرجات
❌ لا تستخدم تعبيرات دارجة أو عامية حتى لو كانت شائعة

مهمتك كتابة سكريبتات لفيديوهات ترفيهية أو شخصية أو رأي لجمهور عام، بلغة عربية فصحى واضحة ومفهومة، قابلة للقراءة بصوت عالٍ في فيديو.

مطلوب منك أن تنتج ٣ سكريبتات مختلفة لنفس الموضوع:
1) سكريبت كامل لقراءة تلقين (Teleprompter) - نص متدفق سهل القراءة، محادثة مباشرة مع الجمهور
2) سكريبت قصير لريلز (30–60 ثانية تقريبًا) - افتتاحية قوية ونقاط سريعة جذابة
3) سكريبت لفيديو طويل على يوتيوب - مخطط تفصيلي مع أقسام منظمة

التزم بالتالي:
- اجعل النبرة شخصية ومباشرة كأنك تتحدث مع صديق
- استخدم أسلوب storytelling وربط القصص الشخصية
- ركز على المشاعر والتجارب الإنسانية
- ابدأ السكريبتات بـ Hook قوي يجذب الانتباه فورًا
- في سكريبت التلقين: اجعل كل line جملة واحدة كاملة واضحة
- في سكريبت الريلز: ركز على السرعة والإثارة والمحتوى المكثف
- في الفيديو الطويل: اجعل fullScript تفصيلي وشامل (500+ كلمة) مع قصص وأمثلة
- استخدم اللغة العربية الفصحى الواضحة والمفهومة، بدون لهجات أو عامية
- اجعل المحتوى relatable وممتع ومسلي`
      : `أنت كاتب محتوى فيديو محترف تعمل مع صنّاع محتوى عرب.

قواعد اللغة العربية:
✅ استخدم اللغة العربية الفصحى الصرفة حصراً
✅ تجنب تماماً أي لهجات عامية أو محلية أو خليجية أو مصرية أو شامية
✅ استخدم مفردات فصيحة واضحة ومفهومة للجمهور العربي عموماً
✅ حافظ على اتساق اللغة في جميع المخرجات
❌ لا تستخدم تعبيرات دارجة أو عامية حتى لو كانت شائعة

مهمتك كتابة سكريبتات لفيديوهات تشرح موضوع معيّن لجمهور عام غير متخصص، بلغة عربية فصحى واضحة ومفهومة، قابلة للقراءة بصوت عالٍ في فيديو.

مطلوب منك أن تنتج ٣ سكريبتات مختلفة لنفس الموضوع:
1) سكريبت كامل لقراءة تلقين (Teleprompter) - نص متدفق سهل القراءة
2) سكريبت قصير لريلز (30–60 ثانية تقريبًا) - افتتاحية قوية ونقاط سريعة
3) سكريبت لفيديو طويل على يوتيوب - مخطط تفصيلي مع أقسام منظمة

التزم بالتالي:
- اجعل الجمل قصيرة وواضحة وسهلة القراءة من Teleprompter
- ابدأ السكريبتات بـ Hook قوي وحافظ على تسلسل منطقي
- في سكريبت التلقين: اجعل كل line جملة واحدة كاملة (لا تقطع الجملة)
- في سكريبت الريلز: ركز على السرعة والإثارة والمحتوى المكثف
- في الفيديو الطويل: اجعل fullScript تفصيلي وشامل (500+ كلمة)
- اعتمد على أي ملخص بحث أو نقاط رئيسية تُعطى لك كمرجع، لكن لا تنسخها حرفيًا
- استخدم اللغة العربية الفصحى الواضحة والمفهومة، بدون لهجات أو عامية
- تجنب المصطلحات المعقدة أو اشرحها بطريقة مبسطة`;

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
            name: "provide_scripts",
            description: "Provide teleprompter, reel, and long video scripts",
            parameters: {
              type: "object",
              properties: {
                teleprompter: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    tone: { type: "string", enum: ["friendly", "professional", "humorous", "serious"] },
                    estimatedDurationSec: { type: "number" },
                    lines: { type: "array", items: { type: "string" } }
                  },
                  required: ["title", "tone", "estimatedDurationSec", "lines"]
                },
                reel: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    hook: { type: "string" },
                    bodyPoints: { type: "array", items: { type: "string" } },
                    outro: { type: "string" },
                    estimatedDurationSec: { type: "number" }
                  },
                  required: ["title", "hook", "bodyPoints", "outro", "estimatedDurationSec"]
                },
                longVideo: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    intro: { type: "string" },
                    sections: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          summary: { type: "string" },
                          bullets: { type: "array", items: { type: "string" } }
                        },
                        required: ["title", "summary", "bullets"]
                      }
                    },
                    fullScript: { type: "string" },
                    outro: { type: "string" },
                    estimatedDurationMin: { type: "number" }
                  },
                  required: ["title", "intro", "sections", "fullScript", "outro", "estimatedDurationMin"]
                }
              },
              required: ["teleprompter", "reel", "longVideo"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "provide_scripts" } }
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
    
    // Track token usage
    const usage = aiData.usage || {};
    await trackTokenUsage(supabaseUrl, supabaseKey, {
      userId: project.user_id,
      projectId: projectId,
      functionName: 'run-scripts',
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
      modelUsed: 'google/gemini-2.5-flash',
      requestStatus: 'success',
    });
    
    console.log('AI response received, extracting structured data...');

    // Extract scripts data from tool call response
    let scriptsData;
    try {
      const toolCall = aiData.choices[0].message.tool_calls?.[0];
      if (!toolCall || !toolCall.function || !toolCall.function.arguments) {
        throw new Error('No tool call found in AI response');
      }
      
      scriptsData = JSON.parse(toolCall.function.arguments);
      console.log('Scripts data extracted successfully');
    } catch (parseError) {
      console.error('Failed to extract scripts data:', parseError);
      console.error('AI response:', JSON.stringify(aiData, null, 2));
      
      await supabase
        .from('projects')
        .update({ 
          scripts_status: 'error',
          scripts_last_run_at: new Date().toISOString()
        })
        .eq('id', projectId);

      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
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
