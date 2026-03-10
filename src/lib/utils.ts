import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata valor monetário em BRL com 2 casas decimais.
 * Ex: formatCurrencyBRL(1234.5) => "R$ 1.234,50"
 */
export function formatCurrencyBRL(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formata uma string date-only (YYYY-MM-DD) como DD/MM/YYYY sem passar por new Date(),
 * evitando problemas de timezone que fazem a data "voltar 1 dia".
 * Se receber datetime ISO ou Date, normaliza para UTC noon antes de formatar.
 */
export function formatDateOnly(value: string | null | undefined): string {
  if (!value) return '—';
  // Date-only string: "2026-03-09"
  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    return `${dateOnlyMatch[3]}/${dateOnlyMatch[2]}/${dateOnlyMatch[1]}`;
  }
  // ISO datetime: parse to UTC noon to avoid day shift
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}
