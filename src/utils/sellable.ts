import { Product } from '../types';

export const SELLABLE_SOAP_IDS = new Set([
  'prod-him-scrub-bar',
  'prod-him-ayurvedic-detan-soap',
  'prod-him-anti-acne-soap',
]);

export function isSoapAvailableForSale(product: Product): boolean {
  return SELLABLE_SOAP_IDS.has(product.id);
}
