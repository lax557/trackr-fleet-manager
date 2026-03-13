import { supabase } from '@/integrations/supabase/client';

export type AlertStatus = 'overdue' | 'near' | 'ok';

export interface PreventiveAlert {
  vehicleId: string;
  vehiclePlate: string | null;
  vehicleCode: string | null;
  vehicleModel: string;
  vehicleBrand: string;
  catalogItemId: string;
  catalogItemName: string;
  planId: string;
  intervalKm: number | null;
  intervalDays: number | null;
  alertBeforeKm: number | null;
  currentOdometer: number;
  lastOdometer: number | null;
  lastDate: string | null;
  kmSinceLast: number;
  kmRemaining: number | null;
  daysSinceLast: number | null;
  daysRemaining: number | null;
  status: AlertStatus;
}

export async function fetchPreventiveAlerts(): Promise<PreventiveAlert[]> {
  // 1) Fetch active plans with catalog items
  const { data: plans, error: plansErr } = await supabase
    .from('model_maintenance_plans')
    .select('*, maintenance_catalog_items(id, name)')
    .eq('active', true);
  if (plansErr) throw plansErr;
  if (!plans || plans.length === 0) return [];

  // 2) Get distinct models from plans
  const models = [...new Set(plans.map(p => p.vehicle_model))];

  // 3) Fetch vehicles matching those models
  const { data: vehicles, error: vErr } = await supabase
    .from('vehicles')
    .select('id, plate, vehicle_code, model, brand, odometer')
    .is('deleted_at', null)
    .in('model', models)
    .not('status', 'in', '("for_sale","backlog")');
  if (vErr) throw vErr;
  if (!vehicles || vehicles.length === 0) return [];

  const vehicleIds = vehicles.map(v => v.id);

  // 4) Fetch all maintenance orders for these vehicles (to get max odometer)
  const { data: orders, error: oErr } = await supabase
    .from('maintenance_orders')
    .select('id, vehicle_id, odometer_at_open, opened_at')
    .in('vehicle_id', vehicleIds)
    .not('status', 'eq', 'cancelled');
  if (oErr) throw oErr;

  // 5) Fetch executed items for these orders
  const orderIds = (orders || []).map(o => o.id);
  let executedItems: any[] = [];
  if (orderIds.length > 0) {
    // Batch in chunks of 500 to avoid query limits
    for (let i = 0; i < orderIds.length; i += 500) {
      const chunk = orderIds.slice(i, i + 500);
      const { data, error } = await supabase
        .from('maintenance_executed_items')
        .select('item_id, maintenance_order_id')
        .in('maintenance_order_id', chunk);
      if (error) throw error;
      executedItems = executedItems.concat(data || []);
    }
  }

  // Build lookup: orderId -> order details
  const orderMap = new Map<string, { vehicle_id: string; odometer_at_open: number | null; opened_at: string }>();
  (orders || []).forEach(o => orderMap.set(o.id, o));

  // Build lookup: vehicleId -> max odometer from orders
  const vehicleMaxOdo = new Map<string, number>();
  (orders || []).forEach(o => {
    if (o.odometer_at_open) {
      const cur = vehicleMaxOdo.get(o.vehicle_id) || 0;
      if (o.odometer_at_open > cur) vehicleMaxOdo.set(o.vehicle_id, o.odometer_at_open);
    }
  });

  // Build lookup: vehicleId+itemId -> last order (highest odometer) with that item
  const lastExecMap = new Map<string, { odometer: number | null; date: string }>();
  executedItems.forEach(ei => {
    const order = orderMap.get(ei.maintenance_order_id);
    if (!order) return;
    const key = `${order.vehicle_id}:${ei.item_id}`;
    const existing = lastExecMap.get(key);
    const odo = order.odometer_at_open || 0;
    if (!existing || odo > (existing.odometer || 0)) {
      lastExecMap.set(key, { odometer: order.odometer_at_open, date: order.opened_at });
    }
  });

  const now = new Date();
  const alerts: PreventiveAlert[] = [];

  for (const vehicle of vehicles) {
    const vehiclePlans = plans.filter(p => p.vehicle_model === vehicle.model);
    const currentOdo = vehicle.odometer || vehicleMaxOdo.get(vehicle.id) || 0;

    for (const plan of vehiclePlans) {
      const catItem = plan.maintenance_catalog_items as any;
      if (!catItem) continue;

      const key = `${vehicle.id}:${plan.item_id}`;
      const lastExec = lastExecMap.get(key);

      const lastOdo = lastExec?.odometer ?? null;
      const lastDate = lastExec?.date ?? null;
      const kmSinceLast = lastOdo != null ? currentOdo - lastOdo : currentOdo;

      let kmRemaining: number | null = null;
      let daysRemaining: number | null = null;
      let daysSinceLast: number | null = null;

      let statusByKm: AlertStatus = 'ok';
      let statusByDays: AlertStatus = 'ok';

      if (plan.interval_km) {
        kmRemaining = plan.interval_km - kmSinceLast;
        const alertThreshold = plan.alert_before_km ?? 500;
        if (kmRemaining <= 0) statusByKm = 'overdue';
        else if (kmRemaining <= alertThreshold) statusByKm = 'near';
      }

      if (plan.interval_days && lastDate) {
        daysSinceLast = Math.floor((now.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));
        daysRemaining = plan.interval_days - daysSinceLast;
        if (daysRemaining <= 0) statusByDays = 'overdue';
        else if (daysRemaining <= 7) statusByDays = 'near';
      } else if (plan.interval_days && !lastDate) {
        // Never done => overdue by days
        statusByDays = 'overdue';
      }

      // Worst case
      const statusPriority: Record<AlertStatus, number> = { overdue: 0, near: 1, ok: 2 };
      const status = statusPriority[statusByKm] <= statusPriority[statusByDays] ? statusByKm : statusByDays;

      alerts.push({
        vehicleId: vehicle.id,
        vehiclePlate: vehicle.plate,
        vehicleCode: vehicle.vehicle_code,
        vehicleModel: vehicle.model,
        vehicleBrand: vehicle.brand,
        catalogItemId: catItem.id,
        catalogItemName: catItem.name,
        planId: plan.id,
        intervalKm: plan.interval_km,
        intervalDays: plan.interval_days,
        alertBeforeKm: plan.alert_before_km,
        currentOdometer: currentOdo,
        lastOdometer: lastOdo,
        lastDate,
        kmSinceLast,
        kmRemaining,
        daysSinceLast,
        daysRemaining,
        status,
      });
    }
  }

  // Sort: overdue first, then near, then ok
  const statusOrder: Record<AlertStatus, number> = { overdue: 0, near: 1, ok: 2 };
  alerts.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  return alerts;
}
