export interface TireData {
  sku: string;
  brand: string;
  priceInstallment: number;
  priceCash: number;
  stock: number;
}

export interface PromoInfo {
  measure: string;
  tires: TireData[];
}
