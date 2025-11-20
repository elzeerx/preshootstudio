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
    const { userId, category } = await req.json();
    
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

    // Optionally fetch user's recent topics for context
    let recentTopics: string[] = [];
    if (userId) {
      const { data: projects } = await supabase
        .from('projects')
        .select('topic')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (projects) {
        recentTopics = projects.map(p => p.topic);
      }
    }

    // Category-specific prompts
    const categoryPrompts: Record<string, string> = {
      educational: 'مواضيع تعليمية وتقنية (مثل: برمجة، علوم، تكنولوجيا، دروس تعليمية، نصائح تقنية)',
      entertainment: 'مواضيع ترفيهية وثقافية (مثل: مراجعات أفلام، ألعاب، سفر، طعام، تجارب ممتعة)',
      business: 'مواضيع أعمال وريادة (مثل: استثمار، تسويق، مشاريع، نصائح مالية، إدارة الأعمال)',
      lifestyle: 'مواضيع أسلوب حياة (مثل: صحة، لياقة، تطوير ذات، عادات يومية، إنتاجية)'
    };

    // Build user prompt
    let userPrompt = '';
    
    if (category && category !== 'all') {
      userPrompt = `أريد 4 اقتراحات مواضيع في فئة: ${categoryPrompts[category] || 'متنوعة'}.\n\n`;
    } else {
      userPrompt = 'أريد 4 اقتراحات مواضيع متنوعة ومثيرة للاهتمام لفيديوهات يمكن لصانع محتوى عربي إنشاؤها.\n\n';
    }
    
    if (recentTopics.length > 0) {
      userPrompt += `المواضيع السابقة للمستخدم:\n${recentTopics.join('\n')}\n\n`;
      userPrompt += 'يرجى اقتراح مواضيع جديدة ومتنوعة، مختلفة عن المواضيع السابقة.\n\n';
    }
    
    if (category && category !== 'all') {
      userPrompt += `يرجى التركيز على ${categoryPrompts[category]}.\n\n`;
    } else {
      userPrompt += 'يرجى تقديم 4 اقتراحات مواضيع متنوعة تشمل:\n';
      userPrompt += '- مواضيع تعليمية وتقنية\n';
      userPrompt += '- مواضيع أسلوب حياة وإنتاجية\n';
      userPrompt += '- مواضيع ترفيهية وثقافية\n';
      userPrompt += '- مواضيع أعمال وريادة\n\n';
    }
    
    userPrompt += 'كل موضوع يجب أن يكون:\n';
    userPrompt += '- واضحاً ومحدداً\n';
    userPrompt += '- مناسباً لصانع محتوى عربي\n';
    userPrompt += '- قابلاً للتحويل إلى فيديو جذاب\n';
    userPrompt += '- مكتوباً بالعربية الفصحى المبسطة';

    // System prompt for topic suggestions
    const systemPrompt = `أنت مساعد ذكي لصانعي المحتوى العرب. مهمتك اقتراح مواضيع فيديوهات متنوعة وجذابة.

يجب أن تقدم 4 اقتراحات مواضيع متنوعة تشمل:
- مواضيع تعليمية وتقنية (مثل: نصائح برمجية، أدوات إنتاجية، تقنيات حديثة)
- مواضيع أسلوب حياة وإنتاجية (مثل: عادات يومية، تنظيم الوقت، تطوير الذات)
- مواضيع ترفيهية وثقافية (مثل: مراجعات، تجارب، قصص)
- مواضيع تحفيزية ومُلهمة (مثل: نجاحات، تحديات، رحلات)

كل موضوع يجب أن يكون:
- واضحاً ومحدداً (ليس عاماً جداً)
- مناسباً لصانع محتوى عربي
- قابلاً للتحويل إلى فيديو جذاب
- مكتوباً بالعربية الفصحى المبسطة

أعد الاستجابة بصيغة JSON فقط، وبدون أي نص زائد، وبالبنية التالية حرفيًا:
{
  "suggestions": [
    "الموضوع الأول",
    "الموضوع الثاني",
    "الموضوع الثالث",
    "الموضوع الرابع"
  ]
}`;

    console.log('Calling Lovable AI Gateway for topic suggestions...');

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
        temperature: 0.8,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await response.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.error('No content in AI response');
      
      return new Response(
        JSON.stringify({ error: 'No AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI response received, parsing JSON...');

    // Parse JSON from AI response
    let suggestionsData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiContent;
      suggestionsData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw AI content:', aiContent);
      
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate response structure
    if (!suggestionsData.suggestions || !Array.isArray(suggestionsData.suggestions)) {
      console.error('Invalid response structure:', suggestionsData);
      
      return new Response(
        JSON.stringify({ error: 'Invalid response format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure we have exactly 4 suggestions
    const suggestions = suggestionsData.suggestions.slice(0, 4);

    console.log('Topic suggestions generated successfully:', suggestions);

    return new Response(
      JSON.stringify({ suggestions }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

