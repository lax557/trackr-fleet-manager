import { supabase } from '@/integrations/supabase/client';
import { deriveFineStatus } from './fines.service';
import { VehicleStats } from '@/types';

// ── Status mapping: DB enum → UI key ──
const statusMap: Record<string, keyof Omit<VehicleStats, 'total'>> = {
  available: 'disponivel',
  rented: 'alugado',
  maintenance: 'manutencao',
  incident: 'sinistro',
  for_sale: 'paraVenda',
  backlog: 'emLiberacao',
};

// ── 1. Fleet counts by status ──
export async function getFleetCounts(): Promise<VehicleStats> {
  const { data, error } = await supabase
    .from('vehicles')
    .select('status')
    .is('deleted_at', null);

  if (error) throw error;

  const stats: VehicleStats = { total: 0, disponivel: 0, alugado: 0, manutencao: 0, sinistro: 0, paraVenda: 0, emLiberacao: 0 };
  (data || []).forEach(v => {
    stats.total++;
    const key = statusMap[v.status];
    if (key) stats[key]++;
  });
  return stats;
}

// ── 2. Attention lists (top N each) ──
export interface AttentionFine {
  id: string;
  due_date: string | null;
  amount: number;
  status: string;
  infraction: string | null;
  vehicles: { plate: string | null; brand: string; model: string; vehicle_code: string | null } | null;
}

export interface AttentionMaintenance {
  id: string;
  status: string;
  opened_at: string;
  type: string;
  vehicles: { plate: string | null; brand: string; model: string; vehicle_code: string | null } | null;
}

export interface AttentionRental {
  id: string;
  status: string;
  start_date: string;
  drivers: { full_name: string } | null;
  vehicles: { plate: string | null; brand: string; model: string; vehicle_code: string | null } | null;
}

export interface AttentionVehicle {
  id: string;
  status: string;
  brand: string;
  model: string;
  vehicle_code: string | null;
  plate: string | null;
}

export interface ExpiringRental {
  id: string;
  start_date: string;
  end_date: string | null;
  weekly_rate: number | null;
  drivers: { full_name: string } | null;
  vehicles: { brand: string; model: string; vehicle_code: string | null; plate: string | null } | null;
  daysRemaining: number;
}

export interface AttentionLists {
  vehiclesAttention: AttentionVehicle[];
  finesDueSoon: AttentionFine[];
  maintenancesOpen: AttentionMaintenance[];
  rentalsAwaiting: AttentionRental[];
  expiringContracts: ExpiringRental[];
}

export async function getAttentionLists(): Promise<AttentionLists> {
  const now = new Date();

  // Vehicles in maintenance or incident
  const vehiclesP = supabase
    .from('vehicles')
    .select('id, status, brand, model, vehicle_code, plate')
    .is('deleted_at', null)
    .in('status', ['maintenance', 'incident'])
    .limit(10);

  // Fines due soon (open, within 7 days or overdue)
  const finesP = supabase
    .from('fines')
    .select('id, due_date, amount, status, infraction, vehicles(plate, brand, model, vehicle_code)')
    .in('status', ['open', 'nearing_due', 'overdue'])
    .order('due_date', { ascending: true })
    .limit(10);

  // Maintenances open/in_progress
  const maintP = supabase
    .from('maintenance_orders')
    .select('id, status, opened_at, type, vehicles(plate, brand, model, vehicle_code)')
    .in('status', ['open', 'in_progress'])
    .order('opened_at', { ascending: true })
    .limit(10);

  // Rentals awaiting signature
  const rentalsP = supabase
    .from('rentals')
    .select('id, status, start_date, drivers(full_name), vehicles(plate, brand, model, vehicle_code)')
    .eq('status', 'awaiting_signature')
    .limit(10);

  // Expiring contracts: active rentals with end_date within 30 days OR start_date ~12 months ago
  const rentalsExpiringP = supabase
    .from('rentals')
    .select('id, start_date, end_date, weekly_rate, drivers(full_name), vehicles(brand, model, vehicle_code, plate)')
    .eq('status', 'active')
    .order('start_date', { ascending: true });

  const [vehiclesRes, finesRes, maintRes, rentalsRes, rentalsExpRes] = await Promise.all([
    vehiclesP, finesP, maintP, rentalsP, rentalsExpiringP,
  ]);

  // Derive fine statuses and filter to truly due soon
  const enrichedFines = (finesRes.data || []).map(f => ({
    ...f,
    derivedStatus: deriveFineStatus(f),
  })).filter(f => ['open', 'nearing_due', 'overdue'].includes(f.derivedStatus));

  // Calculate expiring contracts
  const expiringContracts: ExpiringRental[] = (rentalsExpRes.data || [])
    .map(r => {
      let contractEnd: Date;
      if (r.end_date) {
        contractEnd = new Date(r.end_date);
      } else {
        // Estimate: start_date + 12 months
        contractEnd = new Date(r.start_date);
        contractEnd.setMonth(contractEnd.getMonth() + 12);
      }
      const daysRemaining = Math.ceil((contractEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { ...r, daysRemaining };
    })
    .filter(r => r.daysRemaining >= 0 && r.daysRemaining <= 30)
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 10);

  return {
    vehiclesAttention: (vehiclesRes.data || []) as AttentionVehicle[],
    finesDueSoon: enrichedFines as unknown as AttentionFine[],
    maintenancesOpen: (maintRes.data || []) as unknown as AttentionMaintenance[],
    rentalsAwaiting: (rentalsRes.data || []) as unknown as AttentionRental[],
    expiringContracts,
  };
}

// ── 3. Fines summary ──
export interface FinesSummary {
  open: number;
  dueSoon: number;
  overdue: number;
  paid: number;
  totalOpenAmount: number;
}

export async function getFinesSummary(): Promise<FinesSummary> {
  const { data, error } = await supabase
    .from('fines')
    .select('status, due_date, amount');
  if (error) throw error;

  const summary: FinesSummary = { open: 0, dueSoon: 0, overdue: 0, paid: 0, totalOpenAmount: 0 };
  (data || []).forEach(f => {
    const derived = deriveFineStatus(f);
    if (derived === 'open') summary.open++;
    else if (derived === 'nearing_due') summary.dueSoon++;
    else if (derived === 'overdue') summary.overdue++;
    else if (derived === 'paid') summary.paid++;

    if (['open', 'nearing_due', 'overdue'].includes(derived)) {
      summary.totalOpenAmount += f.amount;
    }
  });
  return summary;
}

// ── 4. Backlog vehicles ──
export interface BacklogVehicle {
  id: string;
  brand: string;
  model: string;
  vehicle_code: string | null;
  plate: string | null;
  status: string;
}

export async function getBacklogVehicles(): Promise<BacklogVehicle[]> {
  const { data, error } = await supabase
    .from('vehicles')
    .select('id, brand, model, vehicle_code, plate, status')
    .is('deleted_at', null)
    .eq('status', 'backlog')
    .limit(20);
  if (error) throw error;
  return (data || []) as BacklogVehicle[];
}

// ── 5. Executive metrics ──

// ── Utility helpers for weekly billing ──

/**
 * Parse a date string into a UTC-noon Date to avoid timezone shift issues.
 * e.g. "2026-03-09" → Date(2026-03-09T12:00:00Z) so getUTCDay() = Monday.
 */
function toUTCDate(d: Date | string): Date {
  if (typeof d === 'string') {
    // Date-only strings ("2026-03-09") → treat as UTC noon
    if (d.length === 10) return new Date(d + 'T12:00:00Z');
    return new Date(d);
  }
  // Already a Date — re-create at UTC noon of the same UTC date
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12));
}

/** Get the Monday (start) of the week containing `date` (UTC). */
function getWeekMonday(date: Date): Date {
  const d = toUTCDate(date);
  const day = d.getUTCDay(); // 0=Sun,1=Mon,...,6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

/** Get the Sunday (end) of the week containing `date` (UTC). */
function getWeekSunday(date: Date): Date {
  const d = toUTCDate(date);
  const day = d.getUTCDay(); // 0=Sun
  const diff = day === 0 ? 0 : 7 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

/** Count of days from `a` to `b` inclusive (UTC day granularity). */
function daysBetweenInclusive(a: Date, b: Date): number {
  const msPerDay = 86400000;
  const startDay = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const endDay = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.floor((endDay - startDay) / msPerDay) + 1;
}

/**
 * Count Mondays in a given month/year that fall within [rangeStart, rangeEnd] (UTC).
 */
function countMondaysInMonthWithinRange(
  year: number,
  month: number, // 0-indexed
  rangeStart: Date,
  rangeEnd: Date | null,
): number {
  let count = 0;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const rangeStartTime = Date.UTC(rangeStart.getUTCFullYear(), rangeStart.getUTCMonth(), rangeStart.getUTCDate());
  const rangeEndTime = rangeEnd ? Date.UTC(rangeEnd.getUTCFullYear(), rangeEnd.getUTCMonth(), rangeEnd.getUTCDate()) : null;
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(Date.UTC(year, month, day, 12));
    if (d.getUTCDay() !== 1) continue; // not Monday
    const t = Date.UTC(year, month, day);
    if (t < rangeStartTime) continue;
    if (rangeEndTime !== null && t > rangeEndTime) continue;
    count++;
  }
  return count;
}

/*
 * ── Validation (debug) ──
 * March 2026 has Mondays: 2, 9, 16, 23, 30
 *
 * Case A: start_ref = 2026-03-09 (Monday), weekly_rate=750, full month
 *   prorata=0, first_billing_monday=Mar 9
 *   mondays in [9..31] = 9,16,23,30 = 4 → 750*4 = 3000 ✓
 *
 * Case B: start_ref = 2026-03-12 (Thursday), weekly_rate=750, full month
 *   prorata = Thu-Sun = 4 days → 750/7*4 = 428.57
 *   first_billing_monday = Mar 16
 *   mondays in [16..31] = 16,23,30 = 3 → 750*3 = 2250
 *   total = 2678.57 ✓
 *
 * Case C: Two rentals starting Mon 09/03, rates 750+600, full month
 *   3000 + 2400 = 5400 ✓
 */

/**
 * Estimate revenue for a single weekly rental in a given month.
 *
 * Model: prepaid weekly billing, due every Monday.
 * - If driver starts mid-week (not Monday), they pay pro-rata daily
 *   from start_ref to Sunday of that week.
 * - From the next Monday onward, full weekly charges on each Monday.
 *
 * Validation cases (March 2026 has 5 Mondays: 2,9,16,23,30):
 * - Start Mon 09/03: prorata=0, mondays 09,16,23,30 = 4 charges
 * - Start Thu 12/03: prorata=4 days (Thu-Sun), mondays 16,23,30 = 3 charges
 * - Active full month start before month: 5 charges (2,9,16,23,30)
 */
function estimateRentalRevenueForMonth(
  weeklyRate: number,
  startRef: Date,
  endRef: Date, // last day of month or returned_at
  year: number,
  month: number, // 0-indexed
): number {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

  // Clamp effective range to the month
  const effectiveStart = startRef > monthStart ? startRef : monthStart;
  const effectiveEnd = endRef < monthEnd ? endRef : monthEnd;

  if (effectiveStart > effectiveEnd) return 0;

  const dailyRate = weeklyRate / 7;
  let prorataAmount = 0;
  let firstFullWeekMonday: Date;

  const startDay = effectiveStart.getDay(); // 0=Sun,1=Mon

  if (startDay === 1) {
    // Start is Monday — no pro-rata, this Monday counts as first charge
    firstFullWeekMonday = new Date(effectiveStart);
  } else {
    // Pro-rata from effectiveStart to Sunday of that week
    const weekSunday = getWeekSunday(effectiveStart);
    const prorataEnd = weekSunday < effectiveEnd ? weekSunday : effectiveEnd;
    const prorataDays = daysBetweenInclusive(effectiveStart, prorataEnd);
    prorataAmount = dailyRate * prorataDays;

    // First full-week Monday is the Monday after effectiveStart's week
    const nextMonday = getWeekMonday(effectiveStart);
    nextMonday.setDate(nextMonday.getDate() + 7);
    firstFullWeekMonday = nextMonday;
  }

  // Count Mondays from firstFullWeekMonday to effectiveEnd within the month
  const mondayCount = countMondaysInMonthWithinRange(year, month, firstFullWeekMonday, effectiveEnd);
  const weeklyAmount = weeklyRate * mondayCount;

  return prorataAmount + weeklyAmount;
}

export interface ExecutiveMetrics {
  estimatedMonthlyRevenue: number;
  realizedRevenue: number | null; // null = not connected to payment provider
  maintenanceCostMonth: number;
  operationalMargin: number;
  occupancyRate: number;
  unproductiveRate: number;
}

export async function getExecutiveMetrics(): Promise<ExecutiveMetrics> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthStart = new Date(year, month, 1).toISOString();
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

  // Active rentals for revenue estimation
  const rentalsP = supabase
    .from('rentals')
    .select('weekly_rate, start_date, delivered_at, returned_at, end_date')
    .eq('status', 'active');

  // Maintenance cost this month
  const maintP = supabase
    .from('maintenance_orders')
    .select('total_cost')
    .gte('opened_at', monthStart)
    .lte('opened_at', monthEnd);

  // Fleet counts for occupancy/unproductive
  const vehiclesP = supabase
    .from('vehicles')
    .select('status, delivered_at')
    .is('deleted_at', null);

  const [rentalsRes, maintRes, vehiclesRes] = await Promise.all([rentalsP, maintP, vehiclesP]);

  // Estimated revenue: pro-rata initial + Monday-based weekly charges
  const lastDayOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
  const estimatedMonthlyRevenue = (rentalsRes.data || []).reduce((sum, r) => {
    const startRef = new Date(r.delivered_at || r.start_date);
    const endRef = r.returned_at ? new Date(r.returned_at) : (r.end_date ? new Date(r.end_date) : lastDayOfMonth);
    return sum + estimateRentalRevenueForMonth(r.weekly_rate || 0, startRef, endRef, year, month);
  }, 0);

  // Maintenance cost
  const maintenanceCostMonth = (maintRes.data || []).reduce((sum, m) => sum + (m.total_cost || 0), 0);

  // Margin
  const operationalMargin = estimatedMonthlyRevenue > 0
    ? ((estimatedMonthlyRevenue - maintenanceCostMonth) / estimatedMonthlyRevenue) * 100
    : 0;

  // Fleet metrics — exclude backlog AND for_sale from operational fleet
  const allVehicles = vehiclesRes.data || [];
  const operationalFleet = allVehicles.filter(
    v => v.delivered_at !== null && v.status !== 'backlog' && v.status !== 'for_sale'
  );
  const operationalCount = operationalFleet.length;
  const rentedCount = operationalFleet.filter(v => v.status === 'rented').length;
  const unproductiveCount = operationalFleet.filter(v => v.status === 'maintenance' || v.status === 'incident').length;

  const occupancyRate = operationalCount > 0 ? (rentedCount / operationalCount) * 100 : 0;
  const unproductiveRate = operationalCount > 0 ? (unproductiveCount / operationalCount) * 100 : 0;

  return {
    estimatedMonthlyRevenue,
    realizedRevenue: null, // Phase 2: connect to payment provider
    maintenanceCostMonth,
    operationalMargin,
    occupancyRate,
    unproductiveRate,
  };
}
