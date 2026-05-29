export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  unitType: string; // Pcs, Kg, Box, etc.
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  items: InvoiceItem[];
  discountPercent: number;
  shippingCost: number;
  downPayment: number;
}

export interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  logoBase64: string;
}
