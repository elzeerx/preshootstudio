import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SIMPLIFY_SYSTEM_PROMPT } from '../_shared/systemPrompts.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let projectId: string | null = null;
  let supabase: ReturnType<typeof createClient> | null = null;

  try {
    const body = await req.json();
    projectId = body.projectId;

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Missing projectId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting simplify for project:', projectId);

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('topic, research_data')
      .eq('id', projectId)
      .single() as { 
        data: { topic: string; research_data: any } | null; 
        error: any 
      };

    if (projectError || !project) {
      console.error('Error fetching project:', projectError);
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Project found:', project.topic);

    // Update status to processing
    await supabase
      .from('projects')
      // @ts-ignore - Supabase types not available in edge functions
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
    const { error: updateError } = await supabase
      .from('projects')
      // @ts-ignore - Supabase types not available in edge functions
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
      JSON.stringify({ 
        success: true,
        data: simplifyData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in run-simplify function:', error);
    
    // Try to update project status to error if we have projectId and supabase client
    if (projectId && supabase) {
      try {
        await supabase
          .from('projects')
          // @ts-ignore - Supabase types not available in edge functions
          .update({ simplify_status: 'error' })
          .eq('id', projectId);
      } catch (statusUpdateError) {
        console.error('Failed to update error status:', statusUpdateError);
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
