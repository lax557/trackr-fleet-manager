import { supabase } from '@/integrations/supabase/client';
import { addDays, isBefore, isAfter } from 'date-fns';

export interface FineRow {
  id: string;
  company_id: string;
  vehicle_id: string;
  driver_id: string | null;
  rental_id: string | null;
  occurred_at: string;
  due_date: string | null;
  severity: string | null;
  points: number | null;
  infraction_code: string | null;
  infraction: string | null;
  amount: number;
  status: string;
  paid_at: string | null;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  vehicles?: { plate: string | null; brand: string; model: string; vehicle_code: string | null } | null;
  drivers?: { full_name: string } | null;
}

export type FineStatus = 'open' | 'nearing_due' | 'overdue' | 'paid' | 'disputed' | 'cancelled';

/** Derive display status based on due_date */
export function deriveFineStatus(fine: { status: string; due_date: string | null }): FineStatus {
  const s = fine.status as FineStatus;
  if (s === 'paid' || s === 'disputed' || s === 'cancelled') return s;
  if (!fine.due_date) return s;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(fine.due_date);
  due.setHours(0, 0, 0, 0);

  if (isAfter(today, due)) return 'overdue';
  if (isBefore(due, addDays(today, 8))) return 'nearing_due';
  return 'open';
}

export const fineStatusLabels: Record<FineStatus, string> = {
  open: 'Em Aberto',
  nearing_due: 'Vence em Breve',
  overdue: 'Vencida',
  paid: 'Paga',
  disputed: 'Contestada',
  cancelled: 'Cancelada',
};

export const fineStatusColors: Record<FineStatus, string> = {
  open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  nearing_due: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  disputed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export const severityLabels: Record<string, string> = {
  leve: 'Leve',
  media: 'Média',
  grave: 'Grave',
  gravissima: 'Gravíssima',
};

export const severityColors: Record<string, string> = {
  leve: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  media: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  grave: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  gravissima: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const FINE_SELECT = `*, vehicles(plate, brand, model, vehicle_code), drivers(full_name)`;

export async function fetchFines() {
  const { data, error } = await supabase
    .from('fines')
    .select(FINE_SELECT)
    .order('occurred_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as FineRow[];
}

export async function getFineById(id: string) {
  const { data, error } = await supabase
    .from('fines')
    .select(FINE_SELECT)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as unknown as FineRow;
}

export interface CreateFinePayload {
  vehicle_id: string;
  driver_id?: string | null;
  rental_id?: string | null;
  occurred_at: string;
  due_date: string;
  severity?: string | null;
  points?: number | null;
  infraction_code?: string | null;
  infraction: string; // description
  amount: number;
  notes?: string | null;
}

export async function createFine(payload: CreateFinePayload) {
  // Get company_id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('user_id', user.id)
    .single();
  if (!profile) throw new Error('Perfil não encontrado');

  // Auto-link driver from active rental if not provided
  let driverId = payload.driver_id || null;
  let rentalId = payload.rental_id || null;

  if (!driverId && payload.vehicle_id) {
    const { data: activeRental } = await supabase
      .from('rentals')
      .select('id, driver_id')
      .eq('vehicle_id', payload.vehicle_id)
      .eq('status', 'active')
      .limit(1)
      .single();

    if (activeRental) {
      driverId = activeRental.driver_id;
      rentalId = activeRental.id;
    }
  }

  const { data, error } = await supabase
    .from('fines')
    .insert({
      company_id: profile.company_id,
      vehicle_id: payload.vehicle_id,
      driver_id: driverId,
      rental_id: rentalId,
      occurred_at: payload.occurred_at,
      due_date: payload.due_date,
      severity: payload.severity || null,
      points: payload.points || null,
      infraction_code: payload.infraction_code || null,
      infraction: payload.infraction,
      amount: payload.amount,
      notes: payload.notes || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateFine(id: string, payload: Partial<CreateFinePayload>) {
  const updateData: Record<string, unknown> = {};
  if (payload.vehicle_id !== undefined) updateData.vehicle_id = payload.vehicle_id;
  if (payload.driver_id !== undefined) updateData.driver_id = payload.driver_id;
  if (payload.rental_id !== undefined) updateData.rental_id = payload.rental_id;
  if (payload.occurred_at !== undefined) updateData.occurred_at = payload.occurred_at;
  if (payload.due_date !== undefined) updateData.due_date = payload.due_date;
  if (payload.severity !== undefined) updateData.severity = payload.severity;
  if (payload.points !== undefined) updateData.points = payload.points;
  if (payload.infraction_code !== undefined) updateData.infraction_code = payload.infraction_code;
  if (payload.infraction !== undefined) updateData.infraction = payload.infraction;
  if (payload.amount !== undefined) updateData.amount = payload.amount;
  if (payload.notes !== undefined) updateData.notes = payload.notes;

  const { data, error } = await supabase
    .from('fines')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markFineAsPaid(id: string, paidAt: string, paymentReference?: string) {
  const { data, error } = await supabase
    .from('fines')
    .update({
      status: 'paid' as any,
      paid_at: paidAt,
      payment_reference: paymentReference || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markFineAsDisputed(id: string, notes?: string) {
  const updateData: Record<string, unknown> = { status: 'disputed' as any };
  if (notes) updateData.notes = notes;

  const { data, error } = await supabase
    .from('fines')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelFine(id: string, notes?: string) {
  const updateData: Record<string, unknown> = { status: 'cancelled' as any };
  if (notes) updateData.notes = notes;

  const { data, error } = await supabase
    .from('fines')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
