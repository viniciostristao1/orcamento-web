import { TireData, PromoInfo } from '../types';

export function parsePreco(precoStr: string): number {
  if (!precoStr) return 0;
  // Remove R$, points (thousands) and replace comma with dot (decimal)
  const clean = precoStr.replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.').trim();
  const val = parseFloat(clean);
  return isNaN(val) ? 0 : val;
}

export function formatarPreco(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function parseInput(input: string): PromoInfo {
  const lines = input.trim().split('\n').map(l => l.split('\t'));
  if (lines.length < 2) return { measure: '', tires: [] };

  const measure = lines[0][0] || 'Promoção';
  
  const tires: TireData[] = lines.slice(1).map(line => ({
    sku: line[0]?.trim() || '',
    brand: line[1]?.trim() || '',
    priceInstallment: parsePreco(line[2]),
    priceCash: parsePreco(line[3]),
    stock: parseInt(line[4]?.trim() || '0', 10),
  }));

  return { measure, tires };
}
