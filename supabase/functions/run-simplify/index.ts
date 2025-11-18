import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { SIMPLIFY_SYSTEM_PROMPT } from '../_shared/systemPrompts.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId } = await req.json();
    console.log('Starting simplify for project:', projectId);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Fetch project data
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('topic, research_data')
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      throw new Error('Failed to fetch project');
    }

    // Update status to processing
    await supabaseClient
      .from('projects')
      .update({ simplify_status: 'processing' })
      .eq('id', projectId);

    // Prepare prompt
    const topic = project.topic;
    const researchContext = project.research_data 
      ? `\n\nمعلومات من البحث:\n${JSON.stringify(project.research_data, null, 2)}`
      : '';

    const userPrompt = `الموضوع: ${topic}${researchContext}\n\nقم بتبسيط هذا الموضوع للجمهور العام.`;

    console.log('Calling Lovable AI for simplification...');

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
          { role: 'system', content: SIMPLIFY_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const simplifiedContent = aiData.choices[0].message.content;
    
    console.log('Received simplification from AI');

    // Parse JSON response
    let simplifyData;
    try {
      simplifyData = JSON.parse(simplifiedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    // Save to database
    const { error: updateError } = await supabaseClient
      .from('projects')
      .update({
        simplify_status: 'ready',
        simplify_last_run_at: new Date().toISOString(),
        simplify_data: simplifyData,
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project:', updateError);
      throw new Error('Failed to save simplification');
    }

    console.log('Simplification completed successfully');

    return new Response(
      JSON.stringify({ success: true, data: simplifyData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in run-simplify:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
