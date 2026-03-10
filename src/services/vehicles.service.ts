import { supabase } from '@/integrations/supabase/client';
import { VehicleWithDetails, VehicleStats, VehicleStatus } from '@/types';

const statusMap: Record<string, VehicleStatus> = {
  available: 'DISPONIVEL',
  rented: 'ALUGADO',
  maintenance: 'MANUTENCAO',
  incident: 'SINISTRO',
  for_sale: 'PARA_VENDA',
  backlog: 'EM_LIBERACAO',
};

const reverseStatusMap: Record<string, string> = Object.fromEntries(
  Object.entries(statusMap).map(([k, v]) => [v, k])
);

function mapRowToVehicleWithDetails(row: any): VehicleWithDetails & { vehicleCode: string | null; deliveredAt: Date | null } {
  return {
    id: row.id,
    vehicleCode: row.vehicle_code || null,
    plate: row.plate,
    make: row.brand,
    model: row.model,
    version: row.version || '',
    yearMfg: row.year_mfg,
    yearModel: row.year_model,
    category: (row.category || 'B') as any,
    vin: row.vin,
    renavam: row.renavam,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    currentStatus: statusMap[row.status] || 'DISPONIVEL',
    statusSince: new Date(row.status_since),
    deliveredAt: row.delivered_at ? new Date(row.delivered_at) : null,
    currentDriver: null,
    acquisition: null,
    finance: null,
    openFinesCount: 0,
  };
}

export async function fetchVehicles() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapRowToVehicleWithDetails);
}

export async function fetchVehicleById(vehicleId: string) {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', vehicleId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapRowToVehicleWithDetails(data);
}

export async function fetchVehicleStats(): Promise<VehicleStats> {
  const vehicles = await fetchVehicles();
  return {
    total: vehicles.length,
    disponivel: vehicles.filter(v => v.currentStatus === 'DISPONIVEL').length,
    alugado: vehicles.filter(v => v.currentStatus === 'ALUGADO').length,
    manutencao: vehicles.filter(v => v.currentStatus === 'MANUTENCAO').length,
    sinistro: vehicles.filter(v => v.currentStatus === 'SINISTRO').length,
    paraVenda: vehicles.filter(v => v.currentStatus === 'PARA_VENDA').length,
    emLiberacao: vehicles.filter(v => v.currentStatus === 'EM_LIBERACAO').length,
  };
}

export async function createVehicle(vehicle: {
  brand: string;
  model: string;
  version?: string;
  plate?: string;
  category?: string;
  year_mfg?: number;
  year_model?: number;
  color?: string;
  vin?: string;
  renavam?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('user_id', user.id)
    .single();

  if (!profile) throw new Error('Profile not found');

  const { data, error } = await supabase
    .from('vehicles')
    .insert({
      company_id: profile.company_id,
      brand: vehicle.brand,
      model: vehicle.model,
      version: vehicle.version || null,
      plate: vehicle.plate || null,
      category: vehicle.category || 'B',
      year_mfg: vehicle.year_mfg || null,
      year_model: vehicle.year_model || null,
      color: vehicle.color || null,
      vin: vehicle.vin || null,
      renavam: vehicle.renavam || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateVehicleStatus(vehicleId: string, newStatus: VehicleStatus) {
  const dbStatus = reverseStatusMap[newStatus];
  if (!dbStatus) throw new Error(`Invalid status: ${newStatus}`);

  const { error } = await supabase
    .from('vehicles')
    .update({ status: dbStatus as any, status_since: new Date().toISOString() })
    .eq('id', vehicleId);

  if (error) throw error;
}

export async function markVehicleDelivered(vehicleId: string) {
  const { error } = await supabase
    .from('vehicles')
    .update({
      delivered_at: new Date().toISOString(),
      status: 'available' as any,
      status_since: new Date().toISOString(),
    })
    .eq('id', vehicleId);

  if (error) throw error;
}

export async function deleteVehicle(vehicleId: string) {
  const { error } = await supabase
    .from('vehicles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', vehicleId);

  if (error) throw error;
}
