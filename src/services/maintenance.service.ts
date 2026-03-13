import { supabase } from '@/integrations/supabase/client';

export type MaintenanceOrderStatus = 'open' | 'in_progress' | 'done' | 'cancelled';
export type MaintenanceTypeDB = 'preventive' | 'corrective';
export type ServiceAreaDB = 'mechanical' | 'electrical' | 'bodyshop' | 'tires' | 'inspection' | 'other';

export interface MaintenanceOrderRow {
  id: string;
  company_id: string;
  vehicle_id: string;
  opened_at: string;
  closed_at: string | null;
  type: MaintenanceTypeDB;
  service_area: ServiceAreaDB;
  status: MaintenanceOrderStatus;
  supplier_name: string | null;
  odometer_at_open: number | null;
  notes: string | null;
  parts_cost: number | null;
  labor_cost: number | null;
  total_cost: number | null;
  created_at: string;
  updated_at: string;
  // joined
  vehicles?: { plate: string | null; brand: string; model: string; vehicle_code: string | null } | null;
  maintenance_items?: MaintenanceItemRow[];
}

export interface MaintenanceItemRow {
  id: string;
  company_id: string;
  maintenance_order_id: string;
  description: string;
  qty: number;
  unit_cost: number;
  total_cost: number;
  created_at: string;
}

// ─── Label maps (UI-friendly) ───
export const statusLabels: Record<MaintenanceOrderStatus, string> = {
  open: 'Aberta',
  in_progress: 'Em Execução',
  done: 'Finalizada',
  cancelled: 'Cancelada',
};

export const typeLabels: Record<MaintenanceTypeDB, string> = {
  preventive: 'Preventiva',
  corrective: 'Corretiva',
};

export const areaLabels: Record<ServiceAreaDB, string> = {
  mechanical: 'Mecânica',
  electrical: 'Elétrica',
  bodyshop: 'Funilaria',
  tires: 'Pneus',
  inspection: 'Revisão',
  other: 'Outros',
};

// ─── Queries ───

export interface MaintenanceFilters {
  search?: string;
  status?: MaintenanceOrderStatus | 'ALL';
  type?: MaintenanceTypeDB | 'ALL';
  area?: ServiceAreaDB | 'ALL';
  vehicleId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function listOrders(filters: MaintenanceFilters = {}) {
  let q = supabase
    .from('maintenance_orders')
    .select('*, vehicles(plate, brand, model, vehicle_code), maintenance_items(*)')
    .order('opened_at', { ascending: false });

  if (filters.status && filters.status !== 'ALL') q = q.eq('status', filters.status);
  if (filters.type && filters.type !== 'ALL') q = q.eq('type', filters.type);
  if (filters.area && filters.area !== 'ALL') q = q.eq('service_area', filters.area);
  if (filters.vehicleId) q = q.eq('vehicle_id', filters.vehicleId);
  if (filters.dateFrom) q = q.gte('opened_at', filters.dateFrom);
  if (filters.dateTo) q = q.lte('opened_at', filters.dateTo + 'T23:59:59');

  const { data, error } = await q;
  if (error) throw error;

  let results = (data || []) as MaintenanceOrderRow[];

  // client-side text search
  if (filters.search) {
    const s = filters.search.toLowerCase();
    results = results.filter(m =>
      m.vehicles?.plate?.toLowerCase().includes(s) ||
      m.vehicles?.vehicle_code?.toLowerCase().includes(s) ||
      m.supplier_name?.toLowerCase().includes(s) ||
      m.maintenance_items?.some(i => i.description.toLowerCase().includes(s))
    );
  }

  return results;
}

export async function getOrderById(id: string) {
  const { data, error } = await supabase
    .from('maintenance_orders')
    .select('*, vehicles(plate, brand, model, vehicle_code, category), maintenance_items(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as MaintenanceOrderRow & { vehicles: any };
}

export interface CreateOrderPayload {
  vehicle_id: string;
  opened_at?: string;
  type: MaintenanceTypeDB;
  service_area: ServiceAreaDB;
  status?: MaintenanceOrderStatus;
  supplier_id: string;
  supplier_name?: string | null;
  odometer_at_open: number;
  notes?: string | null;
  labor_cost?: number;
  items: { description: string; qty: number; unit_cost: number }[];
}

export async function createOrder(payload: CreateOrderPayload) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('user_id', user.id)
    .single();
  if (!profile) throw new Error('Perfil não encontrado');

  const partsCost = payload.items.reduce((s, i) => s + i.qty * i.unit_cost, 0);
  const laborCost = payload.labor_cost ?? 0;

  const { data: order, error } = await supabase
    .from('maintenance_orders')
    .insert({
      company_id: profile.company_id,
      vehicle_id: payload.vehicle_id,
      opened_at: payload.opened_at || new Date().toISOString(),
      type: payload.type,
      service_area: payload.service_area,
      status: payload.status || 'open',
      supplier_id: payload.supplier_id,
      supplier_name: payload.supplier_name || null,
      odometer_at_open: payload.odometer_at_open,
      notes: payload.notes || null,
      labor_cost: laborCost,
      parts_cost: partsCost,
      total_cost: partsCost + laborCost,
    })
    .select()
    .single();
  if (error) throw error;

  // Insert items
  if (payload.items.length > 0) {
    const items = payload.items.map(i => ({
      company_id: profile.company_id,
      maintenance_order_id: order.id,
      description: i.description,
      qty: i.qty,
      unit_cost: i.unit_cost,
      total_cost: i.qty * i.unit_cost,
    }));
    const { error: itemsErr } = await supabase.from('maintenance_items').insert(items);
    if (itemsErr) throw itemsErr;
  }

  return order;
}

export async function updateOrder(id: string, payload: Partial<{
  type: MaintenanceTypeDB;
  service_area: ServiceAreaDB;
  status: MaintenanceOrderStatus;
  supplier_id: string;
  supplier_name: string | null;
  odometer_at_open: number | null;
  notes: string | null;
  labor_cost: number;
  opened_at: string;
}>) {
  // If labor_cost changed, recalculate total_cost
  const updatePayload: any = { ...payload };
  if (payload.labor_cost !== undefined) {
    // Fetch current parts_cost to recalculate total
    const { data: current } = await supabase
      .from('maintenance_orders')
      .select('parts_cost')
      .eq('id', id)
      .single();
    const partsCost = current?.parts_cost || 0;
    updatePayload.total_cost = partsCost + payload.labor_cost;
  }

  const { data, error } = await supabase
    .from('maintenance_orders')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function setOrderStatus(id: string, status: MaintenanceOrderStatus) {
  return updateOrder(id, { status });
}

// ─── Items ───

export async function addItem(orderId: string, item: { description: string; qty: number; unit_cost: number }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');
  const { data: profile } = await supabase.from('profiles').select('company_id').eq('user_id', user.id).single();
  if (!profile) throw new Error('Perfil não encontrado');

  const { data, error } = await supabase
    .from('maintenance_items')
    .insert({
      company_id: profile.company_id,
      maintenance_order_id: orderId,
      description: item.description,
      qty: item.qty,
      unit_cost: item.unit_cost,
      total_cost: item.qty * item.unit_cost,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateItem(itemId: string, item: { description: string; qty: number; unit_cost: number }) {
  const { data, error } = await supabase
    .from('maintenance_items')
    .update({
      description: item.description,
      qty: item.qty,
      unit_cost: item.unit_cost,
      total_cost: item.qty * item.unit_cost,
    })
    .eq('id', itemId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteItem(itemId: string) {
  const { error } = await supabase
    .from('maintenance_items')
    .delete()
    .eq('id', itemId);
  if (error) throw error;
}

// ─── Delete Order ───

export async function deleteOrder(orderId: string) {
  // CASCADE will handle maintenance_items and maintenance_executed_items
  const { error } = await supabase
    .from('maintenance_orders')
    .delete()
    .eq('id', orderId);
  if (error) throw error;
}
