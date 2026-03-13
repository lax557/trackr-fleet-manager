import { supabase } from '@/integrations/supabase/client';
import { VehicleWithDetails, VehicleStats, VehicleStatus, AcquisitionStage } from '@/types';

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

export interface VehicleRow {
  id: string;
  vehicleCode: string | null;
  plate: string | null;
  make: string;
  model: string;
  version: string;
  yearMfg: number | null;
  yearModel: number | null;
  category: string;
  vin: string | null;
  renavam: string | null;
  color: string | null;
  currentStatus: VehicleStatus;
  statusSince: Date;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  acquisitionStage: AcquisitionStage | null;
  ownerType: string | null;
  ownerName: string | null;
  ownerDocument: string | null;
}

function mapRowToVehicle(row: any): VehicleRow & VehicleWithDetails {
  const acquisitionStage = row.acquisition_stage as AcquisitionStage | null;
  const currentStatus = statusMap[row.status] || 'DISPONIVEL';

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
    color: row.color || null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    currentStatus,
    statusSince: new Date(row.status_since),
    deliveredAt: row.delivered_at ? new Date(row.delivered_at) : null,
    currentDriver: null,
    acquisition: currentStatus === 'EM_LIBERACAO' && acquisitionStage ? {
      id: row.id,
      vehicleId: row.id,
      stage: acquisitionStage,
      purchaseMode: 'A_VISTA' as any,
      supplierOrGroup: null,
      group: null,
      quota: null,
      expectedDate: null,
      notes: null,
    } : null,
    finance: null,
    openFinesCount: 0,
    acquisitionStage,
    ownerType: row.owner_type || null,
    ownerName: row.owner_name || null,
    ownerDocument: row.owner_document || null,
  };
}

export async function fetchVehicles() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapRowToVehicle);
}

export async function fetchVehicleById(vehicleId: string) {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', vehicleId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapRowToVehicle(data);
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
  delivered_at?: string;
  owner_type?: string;
  owner_name?: string;
  owner_document?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('user_id', user.id)
    .single();

  if (!profile) throw new Error('Profile not found');

  const insertData: any = {
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
    owner_type: vehicle.owner_type || null,
    owner_name: vehicle.owner_name || null,
    owner_document: vehicle.owner_document || null,
  };

  // If delivered_at is provided, set it; otherwise vehicle starts as backlog
  if (vehicle.delivered_at) {
    insertData.delivered_at = vehicle.delivered_at;
  }

  // Default status is backlog (EM_LIBERACAO) unless delivered
  if (!vehicle.delivered_at) {
    insertData.status = 'backlog';
    insertData.acquisition_stage = 'EM_LIBERACAO';
  }

  const { data, error } = await supabase
    .from('vehicles')
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateVehicle(vehicleId: string, fields: {
  plate?: string;
  brand?: string;
  model?: string;
  version?: string;
  category?: string;
  year_mfg?: number;
  year_model?: number;
  color?: string;
  vin?: string;
  renavam?: string;
  delivered_at?: string | null;
  owner_type?: string | null;
  owner_name?: string | null;
  owner_document?: string | null;
}) {
  const updateData: any = {};
  if (fields.plate !== undefined) updateData.plate = fields.plate || null;
  if (fields.brand !== undefined) updateData.brand = fields.brand;
  if (fields.model !== undefined) updateData.model = fields.model;
  if (fields.version !== undefined) updateData.version = fields.version || null;
  if (fields.category !== undefined) updateData.category = fields.category;
  if (fields.year_mfg !== undefined) updateData.year_mfg = fields.year_mfg;
  if (fields.year_model !== undefined) updateData.year_model = fields.year_model;
  if (fields.color !== undefined) updateData.color = fields.color || null;
  if (fields.vin !== undefined) updateData.vin = fields.vin || null;
  if (fields.renavam !== undefined) updateData.renavam = fields.renavam || null;
  if (fields.delivered_at !== undefined) updateData.delivered_at = fields.delivered_at;
  if (fields.owner_type !== undefined) updateData.owner_type = fields.owner_type;
  if (fields.owner_name !== undefined) updateData.owner_name = fields.owner_name;
  if (fields.owner_document !== undefined) updateData.owner_document = fields.owner_document;

  const { error } = await supabase
    .from('vehicles')
    .update(updateData)
    .eq('id', vehicleId);

  if (error) throw error;
}

export async function updateVehicleStatus(vehicleId: string, newStatus: VehicleStatus) {
  const dbStatus = reverseStatusMap[newStatus];
  if (!dbStatus) throw new Error(`Invalid status: ${newStatus}`);

  const updateData: any = { status: dbStatus, status_since: new Date().toISOString() };
  
  // If moving to available, clear acquisition stage
  if (newStatus === 'DISPONIVEL') {
    updateData.acquisition_stage = null;
  }

  const { error } = await supabase
    .from('vehicles')
    .update(updateData)
    .eq('id', vehicleId);

  if (error) throw error;
}

export async function updateVehicleAcquisitionStage(vehicleId: string, stage: AcquisitionStage) {
  const updateData: any = { acquisition_stage: stage };
  
  // If stage is PRONTO_PARA_ALUGAR, also set status to available
  if (stage === 'PRONTO_PARA_ALUGAR') {
    updateData.status = 'available';
    updateData.status_since = new Date().toISOString();
    updateData.acquisition_stage = null;
    updateData.delivered_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('vehicles')
    .update(updateData)
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
      acquisition_stage: null,
    } as any)
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
