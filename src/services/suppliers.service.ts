import { supabase } from '@/integrations/supabase/client';

export interface SupplierRow {
  id: string;
  company_id: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
}

export async function fetchSuppliers(): Promise<SupplierRow[]> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data || []) as SupplierRow[];
}

export async function createSupplier(supplier: {
  name: string;
  document?: string;
  phone?: string;
  email?: string;
  address?: string;
}): Promise<SupplierRow> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('user_id', user.id)
    .single();
  if (!profile) throw new Error('Perfil não encontrado');

  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      company_id: profile.company_id,
      name: supplier.name,
      document: supplier.document || null,
      phone: supplier.phone || null,
      email: supplier.email || null,
      address: supplier.address || null,
    } as any)
    .select()
    .single();
  if (error) throw error;
  return data as SupplierRow;
}
