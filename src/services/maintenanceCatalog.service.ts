import { supabase } from '@/integrations/supabase/client';

// ─── Catalog Items ───

export interface CatalogItem {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export async function fetchCatalogItems(): Promise<CatalogItem[]> {
  const { data, error } = await supabase
    .from('maintenance_catalog_items')
    .select('*')
    .order('name');
  if (error) throw error;
  return (data || []) as CatalogItem[];
}

export async function createCatalogItem(name: string, description?: string): Promise<CatalogItem> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  const { data: profile } = await supabase.from('profiles').select('company_id').eq('user_id', user.id).single();
  if (!profile) throw new Error('Perfil não encontrado');

  const { data, error } = await supabase
    .from('maintenance_catalog_items')
    .insert({ company_id: profile.company_id, name, description: description || null })
    .select()
    .single();
  if (error) throw error;
  return data as CatalogItem;
}

export async function deleteCatalogItem(id: string): Promise<void> {
  const { error } = await supabase.from('maintenance_catalog_items').delete().eq('id', id);
  if (error) throw error;
}

// ─── Model Plans ───

export interface ModelPlan {
  id: string;
  company_id: string;
  vehicle_model: string;
  item_id: string;
  interval_km: number | null;
  interval_days: number | null;
  alert_before_km: number | null;
  active: boolean;
  created_at: string;
  maintenance_catalog_items?: CatalogItem | null;
}

export async function fetchModelPlans(vehicleModel?: string): Promise<ModelPlan[]> {
  let q = supabase
    .from('model_maintenance_plans')
    .select('*, maintenance_catalog_items(*)')
    .order('vehicle_model')
    .order('created_at');

  if (vehicleModel) q = q.eq('vehicle_model', vehicleModel);

  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as ModelPlan[];
}

export async function createModelPlan(payload: {
  vehicle_model: string;
  item_id: string;
  interval_km?: number | null;
  interval_days?: number | null;
  alert_before_km?: number | null;
}): Promise<ModelPlan> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  const { data: profile } = await supabase.from('profiles').select('company_id').eq('user_id', user.id).single();
  if (!profile) throw new Error('Perfil não encontrado');

  const { data, error } = await supabase
    .from('model_maintenance_plans')
    .insert({
      company_id: profile.company_id,
      vehicle_model: payload.vehicle_model,
      item_id: payload.item_id,
      interval_km: payload.interval_km ?? null,
      interval_days: payload.interval_days ?? null,
      alert_before_km: payload.alert_before_km ?? 500,
    })
    .select('*, maintenance_catalog_items(*)')
    .single();
  if (error) throw error;
  return data as ModelPlan;
}

export async function deleteModelPlan(id: string): Promise<void> {
  const { error } = await supabase.from('model_maintenance_plans').delete().eq('id', id);
  if (error) throw error;
}

// ─── Executed Items ───

export interface ExecutedItem {
  id: string;
  maintenance_order_id: string;
  item_id: string;
  company_id: string;
  notes: string | null;
  created_at: string;
  maintenance_catalog_items?: CatalogItem | null;
}

export async function fetchExecutedItems(orderId: string): Promise<ExecutedItem[]> {
  const { data, error } = await supabase
    .from('maintenance_executed_items')
    .select('*, maintenance_catalog_items(*)')
    .eq('maintenance_order_id', orderId);
  if (error) throw error;
  return (data || []) as ExecutedItem[];
}

export async function saveExecutedItems(orderId: string, itemIds: string[]): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  const { data: profile } = await supabase.from('profiles').select('company_id').eq('user_id', user.id).single();
  if (!profile) throw new Error('Perfil não encontrado');

  // Delete existing
  await supabase.from('maintenance_executed_items').delete().eq('maintenance_order_id', orderId);

  // Insert new
  if (itemIds.length > 0) {
    const rows = itemIds.map(item_id => ({
      maintenance_order_id: orderId,
      item_id,
      company_id: profile.company_id,
    }));
    const { error } = await supabase.from('maintenance_executed_items').insert(rows);
    if (error) throw error;
  }
}

// ─── Distinct vehicle models ───

export async function fetchDistinctModels(): Promise<string[]> {
  const { data, error } = await supabase
    .from('vehicles')
    .select('model')
    .is('deleted_at', null)
    .order('model');
  if (error) throw error;
  const unique = [...new Set((data || []).map(v => v.model))];
  return unique;
}
