import { supabase } from '@/integrations/supabase/client';

export interface VehicleOwner {
  id: string;
  companyId: string;
  type: string;
  name: string;
  document: string | null;
  createdAt: Date;
}

function mapRow(row: any): VehicleOwner {
  return {
    id: row.id,
    companyId: row.company_id,
    type: row.type,
    name: row.name,
    document: row.document,
    createdAt: new Date(row.created_at),
  };
}

export async function fetchVehicleOwners(): Promise<VehicleOwner[]> {
  const { data, error } = await supabase
    .from('vehicle_owners')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapRow);
}

export async function createVehicleOwner(owner: {
  type: string;
  name: string;
  document?: string;
}): Promise<VehicleOwner> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('user_id', user.id)
    .single();

  if (!profile) throw new Error('Profile not found');

  const { data, error } = await supabase
    .from('vehicle_owners')
    .insert({
      company_id: profile.company_id,
      type: owner.type,
      name: owner.name,
      document: owner.document || null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapRow(data);
}
