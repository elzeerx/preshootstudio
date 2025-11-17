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
    
    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Missing projectId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey || !lovableApiKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch project
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (fetchError || !project) {
      console.error('Error fetching project:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update status to loading
    await supabase
      .from('projects')
      .update({ broll_status: 'loading' })
      .eq('id', projectId);

    // Build user prompt
    let userPrompt = `الموضوع هو: ${project.topic}`;
    
    if (project.research_summary) {
      userPrompt += `\n\nملخص عن الموضوع لمساعدتك في فهم المحتوى (لا تنسخه حرفيًا، استخدمه فقط كمرجع):\n${project.research_summary}`;
    }

    if (project.scripts_data) {
      const scriptsData = project.scripts_data as any;
      if (scriptsData.longVideo?.title) {
        userPrompt += `\n\nعنوان الفيديو المقترح: ${scriptsData.longVideo.title}`;
      } else if (scriptsData.teleprompter?.title) {
        userPrompt += `\n\nعنوان الفيديو المقترح: ${scriptsData.teleprompter.title}`;
      }
    }

    // System prompt for B-Roll
    const systemPrompt = `أنت مخرج فيديو وخبير تصوير محتوى تعمل مع صنّاع محتوى عرب.

مهمتك اقتراح لقطات B-Roll لمقطع فيديو يشرح موضوعًا معيّنًا، بحيث:
- تكون اللقطات متنوعة (قريبة، متوسطة، واسعة، ماكرو، تسجيل شاشة، إلخ).
- تراعي إمكانيات تصوير بسيطة (استوديو أو مكتب أو منزل).
- يمكن تنفيذها بسهولة من صانع محتوى فردي.
- يكون الوصف باللغة العربية الفصحى المبسّطة.

كما يجب أن تقترح لكل لقطة برومبت نصي باللغة الإنجليزية يمكن استخدامه مع مولدات الصور (مثل Midjourney و Gemini) لتمثيل نفس المشهد بأسلوب تصوير احترافي.

أعد الاستجابة بصيغة JSON فقط، وبدون أي نص زائد، وبالبنية التالية حرفيًا:
{
  "shots": [
    {
      "id": "shot-1",
      "title": "عنوان اللقطة",
      "description": "وصف تفصيلي للقطة",
      "shotType": "close-up" | "medium" | "wide" | "macro" | "screen-record" | "product" | "b-roll",
      "cameraMovement": "static" | "pan" | "tilt" | "slide" | "handheld" | "zoom-in" | "zoom-out" | "orbit",
      "durationSec": 5,
      "locationOrContext": "المكان أو السياق",
      "notes": "ملاحظات إضافية",
      "aiImagePrompt": "Professional cinematic shot of..."
    }
  ],
  "generalTips": ["نصيحة 1", "نصيحة 2", "نصيحة 3"]
}

التزم بالتالي:
- اجعل الوصف العربي واضحًا ومباشرًا
- اربط اللقطات فعلًا بمحتوى الموضوع، وليس لقطات عشوائية
- اجعل aiImagePrompt بالإنجليزية، بأسلوب برومبت تصوير سينمائي أو فوتوغرافي
- اقترح 5-10 لقطات متنوعة حسب طبيعة الموضوع
- في generalTips، أضف 3-5 نصائح عملية للتصوير
- استخدم أمثلة عربية عندما يكون ذلك ممكناً

تذكر: أنت تساعد صانع محتوى عربي في تجهيز لقطات داعمة احترافية لفيديوهاته.`;

    console.log('Calling Lovable AI Gateway for B-Roll generation...');

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      await supabase
        .from('projects')
        .update({ 
          broll_status: 'error',
          broll_last_run_at: new Date().toISOString()
        })
        .eq('id', projectId);

      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await response.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.error('No content in AI response');
      
      await supabase
        .from('projects')
        .update({ 
          broll_status: 'error',
          broll_last_run_at: new Date().toISOString()
        })
        .eq('id', projectId);

      return new Response(
        JSON.stringify({ error: 'No AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI response received, parsing JSON...');

    // Parse JSON from AI response
    let brollData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : aiContent;
      brollData = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('AI content:', aiContent);
      
      await supabase
        .from('projects')
        .update({ 
          broll_status: 'error',
          broll_last_run_at: new Date().toISOString()
        })
        .eq('id', projectId);

      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save to database
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        broll_status: 'ready',
        broll_last_run_at: new Date().toISOString(),
        broll_data: brollData
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save B-Roll data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('B-Roll generation completed successfully');

    return new Response(
      JSON.stringify({ success: true, data: brollData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in run-broll function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
