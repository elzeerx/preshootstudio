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

    const { action, user_id, updates } = await req.json();

    console.log('Admin action:', { action, user_id });

    if (action === 'delete') {
      // Prevent self-deletion
      if (user_id === user.id) {
        throw new Error('Cannot delete your own account');
      }

      // Delete user using Admin API (cascades to related tables via foreign keys)
      const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user_id);

      if (deleteError) {
        console.error('Error deleting user:', deleteError);
        throw deleteError;
      }

      // Log audit entry
      await supabaseClient.from('admin_audit_log').insert({
        admin_id: user.id,
        action_type: 'delete_user',
        target_user_id: user_id,
        notes: `Deleted user account`,
      });

      console.log('User deleted successfully');

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'update') {
      // Update profile
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update(updates)
        .eq('id', user_id);

      if (updateError) {
        console.error('Error updating user:', updateError);
        throw updateError;
      }

      // Log audit entry
      await supabaseClient.from('admin_audit_log').insert({
        admin_id: user.id,
        action_type: 'update_user',
        target_user_id: user_id,
        new_values: updates,
        notes: `Updated user profile`,
      });

      console.log('User updated successfully');

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'suspend' || action === 'ban') {
      // Update account status
      const { error: statusError } = await supabaseClient
        .from('profiles')
        .update({
          account_status: action === 'suspend' ? 'suspended' : 'banned',
          suspended_at: new Date().toISOString(),
          suspended_by: user.id,
          suspension_reason: updates?.reason || '',
        })
        .eq('id', user_id);

      if (statusError) {
        console.error('Error updating status:', statusError);
        throw statusError;
      }

      // Log audit entry
      await supabaseClient.from('admin_audit_log').insert({
        admin_id: user.id,
        action_type: `${action}_user`,
        target_user_id: user_id,
        new_values: { status: action, reason: updates?.reason },
        notes: `${action === 'suspend' ? 'Suspended' : 'Banned'} user account`,
      });

      console.log(`User ${action}ed successfully`);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');
  } catch (error: any) {
    console.error('Error in admin-manage-user:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
