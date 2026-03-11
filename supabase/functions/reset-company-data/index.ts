import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing auth header')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // User client to get identity
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userErr } = await userClient.auth.getUser()
    if (userErr || !user) throw new Error('Not authenticated')

    // Admin client for deletions
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Get profile
    const { data: profile } = await adminClient
      .from('profiles')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      throw new Error('Apenas administradores podem resetar dados.')
    }

    const companyId = profile.company_id
    const body = await req.json().catch(() => ({}))
    const deleteTemplates = body.delete_templates === true

    const counts: Record<string, number> = {}

    // Delete in safe order (children first)
    const tables = [
      'maintenance_items',
      'maintenance_orders',
      'rental_events',
      'rental_contracts',
      'fines',
      'rentals',
      'drivers',
      'vehicles',
    ]

    if (deleteTemplates) {
      tables.push('contract_templates')
    }

    for (const table of tables) {
      const { data, error } = await adminClient
        .from(table)
        .delete()
        .eq('company_id', companyId)
        .select('id')

      if (error) {
        console.error(`Error deleting ${table}:`, error.message)
        counts[table] = -1
      } else {
        counts[table] = data?.length ?? 0
      }
    }

    // Reset vehicle code sequence
    await adminClient
      .from('vehicle_code_sequences')
      .update({ next_val: 1 })
      .eq('company_id', companyId)

    return new Response(JSON.stringify({ success: true, counts }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
