import type { PromoInfo } from '../types';
import { formatarPreco } from './parser';

/**
 * Texto pronto para colar no WhatsApp: medida + uma linha por marca (valor em
 * até 10x no cartão e à vista). A bolinha é o bullet "•".
 */
export const montarDescricaoWhats = (promo: PromoInfo): string => {
  const linhas = promo.tires.map(
    (t) =>
      `• ${t.brand.toUpperCase()} - ${formatarPreco(t.priceInstallment)} (em até 10x no Cartão) ou ${formatarPreco(t.priceCash)} (Dinheiro, Pix, Débito).`,
  );
  return [`MEDIDA PNEU: ${promo.measure}`, '', ...linhas.flatMap((l) => [l, ''])].join('\n').trim();
};
