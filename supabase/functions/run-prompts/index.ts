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
      .update({ prompts_status: 'loading' })
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
        if (scriptsData.longVideo?.tone) {
          userPrompt += `\nنمط الفيديو: ${scriptsData.longVideo.tone}`;
        }
      } else if (scriptsData.teleprompter?.title) {
        userPrompt += `\n\nعنوان الفيديو المقترح: ${scriptsData.teleprompter.title}`;
        if (scriptsData.teleprompter?.tone) {
          userPrompt += `\nنمط الفيديو: ${scriptsData.teleprompter.tone}`;
        }
      }
    }

    if (project.broll_data) {
      const brollData = project.broll_data as any;
      if (brollData.shots && brollData.shots.length > 0) {
        const shotTitles = brollData.shots.slice(0, 3).map((s: any) => s.title).join('، ');
        userPrompt += `\n\nلقطات B-Roll المقترحة تتضمن: ${shotTitles}...`;
      }
    }

    userPrompt += '\n\nالرجاء توليد حزمة البرومبتات حسب البنية المحددة في تعليمات النظام.';

    // System prompt for Prompts
    const systemPrompt = `أنت مبدع برومبتات (Prompt Engineer) محترف تعمل مع صنّاع محتوى عرب.

مهمتك إنشاء حزمة برومبتات جاهزة يمكن استخدامها في:
- مولدات الصور مثل Midjourney و Gemini.
- مولدات الفيديو مثل Sora و Veo وغيرها.
- إنشاء صور Thumbnails جذابة لفيديوهات يوتيوب وريلز.

الموضوع يُعطى لك كعنوان عام، وقد تُعطى لك:
- ملخص بحثي عن الموضوع.
- عنوان سكريبت أو فكرة الفيديو.
- سياق عن لقطات B-Roll المقترحة.

مطلوب منك إنتاج JSON فقط، وبدون أي نص زائد، وبالبنية التالية حرفيًا:
{
  "imagePrompts": [
    {
      "id": "img-1",
      "label": "وصف قصير بالعربية",
      "model": "midjourney" | "gemini" | "generic",
      "aspectRatio": "16:9",
      "style": "cinematic",
      "prompt": "Professional English prompt text here..."
    }
  ],
  "videoPrompts": [
    {
      "id": "vid-1",
      "label": "وصف المشهد بالعربية",
      "durationSec": 30,
      "style": "cinematic trailer",
      "prompt": "Video prompt in English..."
    }
  ],
  "thumbnailPrompts": [
    {
      "id": "thumb-1",
      "label": "وصف الـ Thumbnail بالعربية",
      "prompt": "Thumbnail prompt in English..."
    }
  ],
  "notes": ["نصيحة 1 بالعربية", "نصيحة 2 بالعربية"]
}

التزم بالتالي:
- البرومبتات نفسها (داخل الحقل prompt) تكون باللغة الإنجليزية بصياغة احترافية مناسبة لنماذج الصور أو الفيديو.
- الحقول label و notes بالعربية، تشرح لصانع المحتوى متى ولماذا يستخدم كل برومبت.
- اربط البرومبتات فعلاً بالموضوع، وبأجواء الفيديو (تعليمي، تقني، ترفيهي…).
- اجعل أسلوب الصور يميل للطابع السينمائي أو التحريري (editorial) عندما يكون مناسبًا.
- احترم الـ aspect ratio (مثل 16:9 للفيديو، 9:16 للريلز، 4:5 أو 1:1 للصور الاجتماعية).
- اقترح 5-8 برومبتات للصور، 2-4 برومبتات للفيديو، و 2-3 برومبتات للـ Thumbnails حسب طبيعة الموضوع.
- في notes، أضف 3-5 نصائح عملية لاستخدام البرومبتات بفعالية.

تذكر: أنت تساعد صانع محتوى عربي في تجهيز برومبتات احترافية جاهزة للاستخدام.`;

    console.log('Calling Lovable AI Gateway for Prompts generation...');

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
          prompts_status: 'error',
          prompts_last_run_at: new Date().toISOString()
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
          prompts_status: 'error',
          prompts_last_run_at: new Date().toISOString()
        })
        .eq('id', projectId);

      return new Response(
        JSON.stringify({ error: 'No AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI response received, parsing JSON...');

    // Parse JSON from AI response
    let promptsData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : aiContent;
      promptsData = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('AI content:', aiContent);
      
      await supabase
        .from('projects')
        .update({ 
          prompts_status: 'error',
          prompts_last_run_at: new Date().toISOString()
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
        prompts_status: 'ready',
        prompts_last_run_at: new Date().toISOString(),
        prompts_data: promptsData
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save Prompts data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Prompts generation completed successfully');

    return new Response(
      JSON.stringify({ success: true, data: promptsData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in run-prompts function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
