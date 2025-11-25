import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify admin role
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    // Get request body
    const { email, password, full_name, role, monthly_token_limit, send_email } = await req.json();

    console.log('Creating user:', { email, full_name, role });

    // Create user using Admin API
    const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
      },
    });

    if (createError) {
      console.error('Error creating user:', createError);
      throw createError;
    }

    console.log('User created successfully:', newUser.user.id);

    // Update profile with additional fields
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        full_name,
        monthly_token_limit: monthly_token_limit || 100000,
      })
      .eq('id', newUser.user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }

    // Assign role if specified
    if (role && role !== 'user') {
      const { error: roleError } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: newUser.user.id,
          role,
        });

      if (roleError) {
        console.error('Error assigning role:', roleError);
      }
    }

    // Log audit entry
    await supabaseClient.from('admin_audit_log').insert({
      admin_id: user.id,
      action_type: 'create_user',
      target_user_id: newUser.user.id,
      new_values: { email, full_name, role, monthly_token_limit },
      notes: `Created new user account for ${email}`,
    });

    console.log('User creation complete');

    return new Response(
      JSON.stringify({ success: true, user: newUser.user }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in admin-create-user:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
