import React from 'react';
import { Invoice, StoreSettings } from '../types';

interface InvoicePreviewProps {
  invoice: Invoice;
  storeSettings: StoreSettings;
  subtotal: number;
  discountAmount: number;
  grandTotal: number;
  remainingBalance: number;
}

export function InvoicePreview({
  invoice,
  storeSettings,
  subtotal,
  discountAmount,
  grandTotal,
  remainingBalance
}: InvoicePreviewProps) {
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="bg-white p-8 max-w-3xl mx-auto shadow-sm border border-slate-200 rounded-2xl print:border-none print:shadow-none print:p-0 print:w-full print:max-w-none text-slate-900">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
         <div className="flex items-center gap-4">
            {storeSettings.logoBase64 && (
              <img src={storeSettings.logoBase64} alt="Store Logo" className="h-16 w-16 object-contain" />
            )}
            <div>
              <h1 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">{storeSettings.name || 'Nama Toko'}</h1>
              <p className="text-sm text-slate-500 max-w-xs mt-1 leading-relaxed">{storeSettings.address}</p>
              <p className="text-sm text-slate-500 mt-0.5">{storeSettings.phone}</p>
            </div>
         </div>
         <div className="text-right">
            <h2 className="text-3xl font-heading font-black text-slate-200 uppercase tracking-widest mb-2">Invoice</h2>
            <p className="text-sm font-semibold text-slate-800"># {invoice.invoiceNumber || 'INV/----/0000'}</p>
            <p className="text-sm text-slate-500 mt-1">Tanggal: {invoice.invoiceDate}</p>
         </div>
      </div>

      {/* Customer */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tagihan Kepada:</h3>
        <p className="text-base font-bold text-slate-800">{invoice.customerName || '-'}</p>
      </div>

      {/* Items Table */}
      <div className="mb-8 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm whitespace-nowrap sm:whitespace-normal">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-700 w-12">No</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Tipe/Layanan Deskripsi</th>
              <th className="px-4 py-3 font-semibold text-slate-700 text-right">Harga</th>
              <th className="px-4 py-3 font-semibold text-slate-700 text-right">Jumlah</th>
              <th className="px-4 py-3 font-semibold text-slate-700 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
             {invoice.items.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-4 py-8 text-center text-slate-400">Belum ada item.</td>
               </tr>
             ) : (
               invoice.items.map((item, index) => (
                 <tr key={index} className="bg-white">
                   <td className="px-4 py-3 text-slate-500 font-medium">{index + 1}</td>
                   <td className="px-4 py-3">
                     <p className="font-semibold text-slate-800">{item.name}</p>
                     {item.description && <p className="text-xs text-slate-500 whitespace-pre-wrap">{item.description}</p>}
                   </td>
                   <td className="px-4 py-3 text-right text-slate-600">{formatIDR(item.unitPrice)}</td>
                   <td className="px-4 py-3 text-right text-slate-600">{item.quantity} {item.unitType}</td>
                   <td className="px-4 py-3 text-right font-medium text-slate-800">{formatIDR(item.quantity * item.unitPrice)}</td>
                 </tr>
               ))
             )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex flex-col items-end border-t border-slate-200 pt-6">
        <div className="w-full max-w-sm space-y-3">
           <div className="flex justify-between text-sm">
             <span className="text-slate-500">Subtotal</span>
             <span className="font-medium text-slate-800">{formatIDR(subtotal)}</span>
           </div>
           {discountAmount > 0 && (
             <div className="flex justify-between text-sm">
               <span className="text-slate-500">Diskon ({invoice.discountPercent}%)</span>
               <span className="font-medium text-red-600">- {formatIDR(discountAmount)}</span>
             </div>
           )}
           {invoice.shippingCost > 0 && (
             <div className="flex justify-between text-sm">
               <span className="text-slate-500">Ongkos Kirim</span>
               <span className="font-medium text-slate-800">{formatIDR(invoice.shippingCost)}</span>
             </div>
           )}
           <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-100">
             <span>Total Keseluruhan</span>
             <span>{formatIDR(grandTotal)}</span>
           </div>
           {invoice.downPayment > 0 && (
             <div className="flex justify-between text-sm">
               <span className="text-slate-500">Uang Muka Dibayar</span>
               <span className="font-medium text-green-600">- {formatIDR(invoice.downPayment)}</span>
             </div>
           )}
           <div className="flex justify-between text-lg font-bold text-blue-700 bg-blue-50/50 p-3 rounded-lg border border-blue-100 mt-2">
             <span>Sisa Tagihan</span>
             <span>{formatIDR(Math.max(0, remainingBalance))}</span>
           </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-16 text-center">
         <p className="text-sm font-semibold text-slate-800">Terima Kasih atas Kepercayaan Anda</p>
         <p className="text-xs text-slate-500 mt-1">Invoice ini sah dan diproses secara digital.</p>
      </div>
    </div>
  );
}
