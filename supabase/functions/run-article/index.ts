import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ARTICLE_SYSTEM_PROMPT } from "../_shared/systemPrompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId } = await req.json();

    if (!projectId) {
      throw new Error("Project ID is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      throw new Error("Project not found");
    }

    // Update status to loading
    await supabase
      .from("projects")
      .update({
        article_status: "loading",
        article_last_run_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    // Build context for the AI model
    let context = `الموضوع: ${project.topic}\n\n`;

    if (project.research_summary) {
      context += `ملخص البحث (للاستفادة، لا للنسخ الحرفي):\n${project.research_summary}\n\n`;
    }

    if (project.research_data) {
      const researchData = project.research_data as any;
      if (researchData.keyPoints && Array.isArray(researchData.keyPoints)) {
        context += `نقاط رئيسية من البحث:\n`;
        researchData.keyPoints.slice(0, 5).forEach((point: string) => {
          context += `- ${point}\n`;
        });
        context += `\n`;
      }
    }

    if (project.scripts_data) {
      const scriptsData = project.scripts_data as any;
      if (scriptsData.longVideo?.title) {
        context += `عنوان الفيديو المقترح: ${scriptsData.longVideo.title}\n\n`;
      }
      if (scriptsData.teleprompter?.title) {
        context += `عنوان السكريبت: ${scriptsData.teleprompter.title}\n\n`;
      }
    }

    const userPrompt = `${context}
اكتب مقالاً احترافياً جاهزاً للنشر حول هذا الموضوع.
الجمهور المستهدف: جمهور عربي مهتم بالتقنية والمحتوى، غير متخصص بالضرورة.
نوع المقال: مقال تحليلي تقني مبسط.

التزم بصيغة JSON المحددة في التعليمات، وتأكد من:
- عنوان جذاب ومقدمة مشوقة
- تقسيم منطقي إلى 3-5 أقسام
- خاتمة تلخص الفكرة الأساسية
- معلومات SEO محسّنة`;

    console.log("Calling OpenAI API for article generation...");

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: ARTICLE_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const articleText = data.choices[0].message.content;

    console.log("Received response from OpenAI, parsing JSON...");

    let articleData;
    try {
      articleData = JSON.parse(articleText);
    } catch (parseError) {
      console.error("Failed to parse article JSON:", parseError);
      console.error("Raw response:", articleText);
      throw new Error("Failed to parse article data from AI response");
    }

    // Validate the structure
    if (!articleData.title || !articleData.sections || !Array.isArray(articleData.sections)) {
      console.error("Invalid article structure:", articleData);
      throw new Error("Invalid article structure received from AI");
    }

    console.log("Article generated successfully, saving to database...");

    // Save to database
    const { error: updateError } = await supabase
      .from("projects")
      .update({
        article_status: "ready",
        article_data: articleData,
        article_last_run_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (updateError) {
      console.error("Error saving article to database:", updateError);
      throw updateError;
    }

    console.log("Article saved successfully");

    return new Response(
      JSON.stringify({ success: true, data: articleData }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in run-article function:", error);

    // Try to update status to error
    try {
      const { projectId } = await req.json();
      if (projectId) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase
          .from("projects")
          .update({
            article_status: "error",
            article_last_run_at: new Date().toISOString(),
          })
          .eq("id", projectId);
      }
    } catch (updateError) {
      console.error("Failed to update error status:", updateError);
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
