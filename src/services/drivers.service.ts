import { supabase } from '@/integrations/supabase/client';

export interface DriverRow {
  id: string;
  full_name: string;
  phone: string | null;
  cpf: string | null;
  cnh: string | null;
  birth_date: string | null;
  email: string | null;
  driver_app: string | null;
  company_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DriverWithRental extends DriverRow {
  currentVehiclePlate: string | null;
  currentVehicleId: string | null;
  currentVehicleCode: string | null;
  computedStatus: 'active' | 'inactive';
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

export async function fetchDrivers(): Promise<DriverWithRental[]> {
  const { data: drivers, error } = await supabase
    .from('drivers')
    .select('*')
    .is('deleted_at', null)
    .order('full_name', { ascending: true });

  if (error) throw error;

  // Fetch active rentals to determine status
  const { data: activeRentals } = await supabase
    .from('rentals')
    .select('driver_id, vehicle_id, vehicles(plate, vehicle_code)')
    .eq('status', 'active');

  const rentalMap = new Map<string, { vehicleId: string; plate: string | null; vehicleCode: string | null }>();
  (activeRentals || []).forEach((r: any) => {
    rentalMap.set(r.driver_id, {
      vehicleId: r.vehicle_id,
      plate: r.vehicles?.plate || null,
      vehicleCode: r.vehicles?.vehicle_code || null,
    });
  });

  return (drivers || []).map(d => {
    const rental = rentalMap.get(d.id);
    return {
      ...d,
      currentVehiclePlate: rental?.plate || null,
      currentVehicleId: rental?.vehicleId || null,
      currentVehicleCode: rental?.vehicleCode || null,
      computedStatus: rental ? 'active' as const : 'inactive' as const,
    };
  });
}

export async function fetchDriverById(driverId: string): Promise<DriverWithRental | null> {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('id', driverId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { data: rental } = await supabase
    .from('rentals')
    .select('vehicle_id, vehicles(plate, vehicle_code, brand, model, status)')
    .eq('driver_id', driverId)
    .eq('status', 'active')
    .maybeSingle();

  return {
    ...data,
    currentVehiclePlate: (rental as any)?.vehicles?.plate || null,
    currentVehicleId: rental?.vehicle_id || null,
    currentVehicleCode: (rental as any)?.vehicles?.vehicle_code || null,
    computedStatus: rental ? 'active' : 'inactive',
  };
}

export async function createDriver(driver: {
  full_name: string;
  phone?: string;
  cpf?: string;
  cnh?: string;
  birth_date?: string;
  email?: string;
  driver_app?: string;
}) {
  const companyId = await getCompanyId();

  const { data, error } = await supabase
    .from('drivers')
    .insert({
      company_id: companyId,
      full_name: driver.full_name,
      phone: driver.phone || null,
      cpf: driver.cpf || null,
      cnh: driver.cnh || null,
      birth_date: driver.birth_date || null,
      email: driver.email || null,
      driver_app: driver.driver_app || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDriver(driverId: string, updates: {
  full_name?: string;
  phone?: string;
  cpf?: string;
  cnh?: string;
  birth_date?: string;
  email?: string;
  driver_app?: string;
}) {
  const { error } = await supabase
    .from('drivers')
    .update(updates)
    .eq('id', driverId);

  if (error) throw error;
}

export async function archiveDriver(driverId: string) {
  const { error } = await supabase
    .from('drivers')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', driverId);

  if (error) throw error;
}
