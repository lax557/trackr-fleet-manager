import { supabase } from '@/integrations/supabase/client';
import { RentalWithDetails } from './rentals.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrencyBRL } from '@/lib/utils';

export interface ContractTemplate {
  id: string;
  company_id: string;
  name: string;
  body: string;
  is_active: boolean;
  created_at: string;
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

export async function fetchContractTemplates(): Promise<ContractTemplate[]> {
  const { data, error } = await supabase
    .from('contract_templates')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as ContractTemplate[];
}

export function renderTemplate(body: string, rental: RentalWithDetails): string {
  const vars: Record<string, string> = {
    '{{nome_motorista}}': rental.driver_name || '—',
    '{{cpf_motorista}}': (rental as any).driver_cpf || '—',
    '{{marca}}': rental.vehicle_brand || '—',
    '{{modelo}}': rental.vehicle_model || '—',
    '{{versao}}': '',
    '{{placa}}': rental.vehicle_plate || '—',
    '{{vehicle_code}}': rental.vehicle_code || '—',
    '{{categoria}}': '',
    '{{data_inicio}}': rental.start_date ? format(new Date(rental.start_date), 'dd/MM/yyyy', { locale: ptBR }) : '—',
    '{{data_fim}}': rental.end_date ? format(new Date(rental.end_date), 'dd/MM/yyyy', { locale: ptBR }) : '—',
    '{{valor_semanal}}': formatCurrencyBRL(rental.weekly_rate),
    '{{valor_caucao}}': formatCurrencyBRL(rental.deposit),
    '{{data_atual}}': format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
  };

  let result = body;
  for (const [placeholder, value] of Object.entries(vars)) {
    result = result.replaceAll(placeholder, value);
  }
  return result;
}

export async function createRentalContract(rentalId: string, templateId: string): Promise<void> {
  const companyId = await getCompanyId();

  // Fetch rental details
  const { data: rental, error: rErr } = await supabase
    .from('rentals')
    .select('*, drivers(full_name, phone, cpf), vehicles(plate, vehicle_code, brand, model)')
    .eq('id', rentalId)
    .single();
  if (rErr || !rental) throw new Error('Locação não encontrada.');

  // Fetch template
  const { data: template, error: tErr } = await supabase
    .from('contract_templates')
    .select('*')
    .eq('id', templateId)
    .single();
  if (tErr || !template) throw new Error('Modelo não encontrado.');

  const rentalWithDetails: RentalWithDetails = {
    ...(rental as any),
    driver_name: (rental as any).drivers?.full_name || '—',
    driver_phone: (rental as any).drivers?.phone || null,
    vehicle_plate: (rental as any).vehicles?.plate || null,
    vehicle_code: (rental as any).vehicles?.vehicle_code || null,
    vehicle_brand: (rental as any).vehicles?.brand || '',
    vehicle_model: (rental as any).vehicles?.model || '',
  };

  const rendered = renderTemplate((template as any).body, rentalWithDetails);

  // Insert contract
  const { error: insertErr } = await supabase
    .from('rental_contracts')
    .insert({
      company_id: companyId,
      rental_id: rentalId,
      driver_id: rental.driver_id,
      template_id: templateId,
      status: 'generated',
      rendered_body: rendered,
    } as any);
  if (insertErr) throw insertErr;

  // Change rental status to awaiting_signature
  const { changeRentalStatus } = await import('./rentals.service');
  await changeRentalStatus(rentalId, 'awaiting_signature');
}

export async function fetchPricingRules(): Promise<{ category: string; weekly_rate: number; deposit_amount: number }[]> {
  const { data, error } = await supabase
    .from('pricing_rules')
    .select('category, weekly_rate, deposit_amount')
    .eq('active', true);
  if (error) throw error;
  return (data || []) as any[];
}
