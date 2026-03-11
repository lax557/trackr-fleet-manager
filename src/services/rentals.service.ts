import { supabase } from '@/integrations/supabase/client';

export interface RentalRow {
  id: string;
  company_id: string;
  vehicle_id: string;
  driver_id: string;
  status: 'draft' | 'awaiting_signature' | 'active' | 'ended' | 'cancelled';
  start_date: string;
  end_date: string | null;
  weekly_rate: number | null;
  deposit: number | null;
  delivery_scheduled_at: string | null;
  delivered_at: string | null;
  return_scheduled_at: string | null;
  returned_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RentalWithDetails extends RentalRow {
  driver_name: string;
  driver_phone: string | null;
  vehicle_plate: string | null;
  vehicle_code: string | null;
  vehicle_brand: string;
  vehicle_model: string;
}

async function getCompanyId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('user_id', user.id)
    .single();
  if (!profile) throw new Error('Profile not found');
  return profile.company_id;
}

export async function fetchRentals(): Promise<RentalWithDetails[]> {
  const { data, error } = await supabase
    .from('rentals')
    .select('*, drivers(full_name, phone, cpf, cnh, email, address_full), vehicles(plate, vehicle_code, brand, model)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((r: any) => ({
    ...r,
    driver_name: r.drivers?.full_name || '—',
    driver_phone: r.drivers?.phone || null,
    vehicle_plate: r.vehicles?.plate || null,
    vehicle_code: r.vehicles?.vehicle_code || null,
    vehicle_brand: r.vehicles?.brand || '',
    vehicle_model: r.vehicles?.model || '',
  }));
}

export async function fetchRentalById(rentalId: string): Promise<RentalWithDetails | null> {
  const { data, error } = await supabase
    .from('rentals')
    .select('*, drivers(full_name, phone, cpf, cnh), vehicles(plate, vehicle_code, brand, model, status)')
    .eq('id', rentalId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    driver_name: (data as any).drivers?.full_name || '—',
    driver_phone: (data as any).drivers?.phone || null,
    driver_cpf: (data as any).drivers?.cpf || null,
    driver_cnh: (data as any).drivers?.cnh || null,
    vehicle_plate: (data as any).vehicles?.plate || null,
    vehicle_code: (data as any).vehicles?.vehicle_code || null,
    vehicle_brand: (data as any).vehicles?.brand || '',
    vehicle_model: (data as any).vehicles?.model || '',
  } as RentalWithDetails;
}

export async function createRental(payload: {
  driver_id: string;
  vehicle_id: string;
  start_date: string;
  end_date?: string;
  weekly_rate?: number;
  deposit?: number;
  notes?: string;
}): Promise<RentalRow> {
  const companyId = await getCompanyId();

  // Validate no active rental for this vehicle
  const { data: existingVehicle } = await supabase
    .from('rentals')
    .select('id')
    .eq('vehicle_id', payload.vehicle_id)
    .eq('status', 'active')
    .limit(1);

  if (existingVehicle && existingVehicle.length > 0) {
    throw new Error('Este veículo já possui uma locação ativa.');
  }

  // Validate no active rental for this driver
  const { data: existingDriver } = await supabase
    .from('rentals')
    .select('id')
    .eq('driver_id', payload.driver_id)
    .eq('status', 'active')
    .limit(1);

  if (existingDriver && existingDriver.length > 0) {
    throw new Error('Este motorista já possui uma locação ativa.');
  }

  const { data, error } = await supabase
    .from('rentals')
    .insert({
      company_id: companyId,
      driver_id: payload.driver_id,
      vehicle_id: payload.vehicle_id,
      start_date: payload.start_date,
      end_date: payload.end_date || null,
      weekly_rate: payload.weekly_rate || null,
      deposit: payload.deposit || null,
      notes: payload.notes || null,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw error;

  // Log event
  await supabase.from('rental_events').insert({
    company_id: companyId,
    rental_id: data.id,
    type: 'created',
    payload: { status: 'draft' },
  });

  return data as RentalRow;
}

export async function changeRentalStatus(
  rentalId: string,
  newStatus: 'awaiting_signature' | 'active' | 'ended' | 'cancelled'
): Promise<void> {
  const companyId = await getCompanyId();

  // Fetch current rental
  const { data: rental, error: fetchErr } = await supabase
    .from('rentals')
    .select('*')
    .eq('id', rentalId)
    .single();

  if (fetchErr || !rental) throw new Error('Locação não encontrada.');

  const oldStatus = rental.status;

  // Validate transitions
  const validTransitions: Record<string, string[]> = {
    draft: ['awaiting_signature', 'active', 'cancelled'],
    awaiting_signature: ['active', 'cancelled'],
    active: ['ended'],
    ended: [],
    cancelled: [],
  };

  if (!validTransitions[oldStatus]?.includes(newStatus)) {
    throw new Error(`Transição de "${oldStatus}" para "${newStatus}" não é permitida.`);
  }

  // Conflict check when activating
  if (newStatus === 'active') {
    const { data: vehicleConflict } = await supabase
      .from('rentals')
      .select('id')
      .eq('vehicle_id', rental.vehicle_id)
      .eq('status', 'active')
      .neq('id', rentalId)
      .limit(1);

    if (vehicleConflict && vehicleConflict.length > 0) {
      throw new Error('Este veículo já possui outra locação ativa.');
    }

    // Driver conflict check
    const { data: driverConflict } = await supabase
      .from('rentals')
      .select('id')
      .eq('driver_id', rental.driver_id)
      .eq('status', 'active')
      .neq('id', rentalId)
      .limit(1);

    if (driverConflict && driverConflict.length > 0) {
      throw new Error('Este motorista já possui outra locação ativa.');
    }
  }

  // Build rental update
  const rentalUpdate: Record<string, any> = { status: newStatus };

  if (newStatus === 'active' && !rental.delivered_at) {
    // Use start_date at 12:00 UTC to avoid timezone day-shift issues
    if (rental.start_date) {
      rentalUpdate.delivered_at = rental.start_date + 'T12:00:00Z';
    } else {
      rentalUpdate.delivered_at = new Date().toISOString();
    }
  }
  if (newStatus === 'ended' && !rental.returned_at) {
    rentalUpdate.returned_at = new Date().toISOString();
  }

  // Update rental
  const { error: updateErr } = await supabase
    .from('rentals')
    .update(rentalUpdate)
    .eq('id', rentalId);

  if (updateErr) throw updateErr;

  // Cascade vehicle status
  if (newStatus === 'active') {
    await supabase
      .from('vehicles')
      .update({ status: 'rented', status_since: new Date().toISOString() })
      .eq('id', rental.vehicle_id);

    // Also set vehicles.delivered_at if null
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('delivered_at')
      .eq('id', rental.vehicle_id)
      .single();

    if (vehicle && !vehicle.delivered_at) {
      await supabase
        .from('vehicles')
        .update({ delivered_at: rentalUpdate.delivered_at || new Date().toISOString() })
        .eq('id', rental.vehicle_id);
    }
  } else if (newStatus === 'ended') {
    await supabase
      .from('vehicles')
      .update({ status: 'available', status_since: new Date().toISOString() })
      .eq('id', rental.vehicle_id);
  }

  // Log event
  await supabase.from('rental_events').insert({
    company_id: companyId,
    rental_id: rentalId,
    type: 'status_changed',
    payload: { from: oldStatus, to: newStatus },
  });
}

export async function fetchRentalEvents(rentalId: string) {
  const { data, error } = await supabase
    .from('rental_events')
    .select('*')
    .eq('rental_id', rentalId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}
