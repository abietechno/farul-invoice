import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Send, FileSpreadsheet, ChevronRight, X, Info, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Invoice, InvoiceItem, StoreSettings } from './types';
import { AppScriptGuide } from './components/AppScriptGuide';
import { SettingsModal } from './components/SettingsModal';
import { ItemModal } from './components/ItemModal';
import { InvoicePreview } from './components/InvoicePreview';
import { HistoryTab } from './components/HistoryTab';

const UNIT_TYPES = ['Pcs', 'Kg', 'Gram', 'Liter', 'Box', 'Pak', 'Set', 'Bulan', 'Tahun', 'Paket'];

const generateInvoiceNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV/${dateStr}/${random}`;
};

const getTodayDateStr = () => {
  return new Date().toISOString().slice(0, 10);
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [invoice, setInvoice] = useState<Invoice>({
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: getTodayDateStr(),
    customerName: '',
    items: [],
    discountPercent: 0,
    shippingCost: 0,
    downPayment: 0,
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const savedSettings = localStorage.getItem('STORE_SETTINGS');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Failed to parse settings');
      }
    }
    return {
      name: import.meta.env.VITE_STORE_NAME || 'Nama Toko Anda',
      address: import.meta.env.VITE_STORE_ADDRESS || 'Jl. Contoh Alamat No. 123, Kota',
      phone: import.meta.env.VITE_STORE_PHONE || '081234567890',
      logoBase64: import.meta.env.VITE_STORE_LOGO || '',
    };
  });

  const [gasUrl, setGasUrl] = useState(() => {
    return import.meta.env.VITE_GAS_URL || localStorage.getItem('GAS_WEB_APP_URL') || '';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Calculations
  const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const discountAmount = subtotal * (invoice.discountPercent / 100);
  const totalAfterDiscount = subtotal - discountAmount;
  const grandTotal = totalAfterDiscount + invoice.shippingCost;
  const remainingBalance = grandTotal - invoice.downPayment;

  const handleSaveSettings = (url: string, settings: StoreSettings) => {
    setGasUrl(url);
    localStorage.setItem('GAS_WEB_APP_URL', url);
    setStoreSettings(settings);
    localStorage.setItem('STORE_SETTINGS', JSON.stringify(settings));
    setIsSettingsOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const updateInvoice = (field: keyof Invoice, value: any) => {
    setInvoice(prev => ({ ...prev, [field]: value }));
  };

  const addItem = (item: InvoiceItem) => {
    setInvoice(prev => ({ ...prev, items: [...prev.items, item] }));
    setIsItemModalOpen(false);
  };

  const removeItem = (id: string) => {
    setInvoice(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const handleSubmit = async () => {
    if (!gasUrl) {
      alert("Mohon atur URL Google Apps Script di Pengaturan terlebih dahulu.");
      setIsSettingsOpen(true);
      return;
    }
    if (!invoice.customerName) {
      alert("Nama Pelanggan wajib diisi.");
      return;
    }
    if (invoice.items.length === 0) {
      alert("Masukkan minimal 1 tipe/layanan.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const payload = {
        action: 'createInvoice',
        data: {
          timestamp: new Date().toISOString(),
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate,
          customerName: invoice.customerName,
          subtotal,
          discountPercent: invoice.discountPercent,
          discountAmount,
          shippingCost: invoice.shippingCost,
          grandTotal,
          downPayment: invoice.downPayment,
          remainingBalance,
          items: invoice.items
        }
      };

      const response = await fetch(gasUrl, {
        method: 'POST',
        // mode: 'no-cors' option might be needed if GAS is not setup for CORS correctly,
        // but no-cors makes it hard to read the JSON response.
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', 
          // Note: using text/plain prevents CORS preflight issues with GAS.
        },
        body: JSON.stringify(payload)
      });

      // Usually GAS returns JSON, but sometimes with plain text we can just assume success if it doesn't throw.
      setSubmitStatus('success');
      
      // Reset after 2s
      setTimeout(() => {
        setSubmitStatus('idle');
        setInvoice({
          invoiceNumber: generateInvoiceNumber(),
          invoiceDate: getTodayDateStr(),
          customerName: '',
          items: [],
          discountPercent: 0,
          shippingCost: 0,
          downPayment: 0,
        });
      }, 3000);

    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
      alert("Gagal mengirim data. Pastikan URL GAS benar dan bisa diakses.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 sm:pb-8">
      {/* Header */}
      <header className="bg-white px-4 py-4 sticky top-0 z-10 border-b border-slate-200 shadow-sm block no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading font-bold text-slate-900">Manajemen Invoice</h1>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">Sinkronisasi Google Sheets</p>
          </div>
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 mr-2 sm:mr-4 flex-1 max-w-[240px] justify-center mx-4 sm:mx-0">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold transition-all ${activeTab === 'create' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Buat Baru
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold transition-all ${activeTab === 'history' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Riwayat
            </button>
          </div>
          <div className="flex gap-1 sm:gap-2">
             <button 
              onClick={() => setIsGuideOpen(true)}
              className="p-2 justify-center rounded-full hover:bg-slate-100 text-blue-600 transition-colors shrink-0"
              title="Panduan Script"
            >
              <Info size={22} />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors shrink-0"
              title="Pengaturan"
            >
              <Settings size={22} />
            </button>
          </div>
        </div>
      </header>

      {activeTab === 'create' ? (
        <>
          <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start no-print">
        <div className="col-span-1 lg:col-span-8 space-y-6">
          {/* Customer Details */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Informasi Invoice & Pelanggan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">No. Invoice</label>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={(e) => updateInvoice('invoiceNumber', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal</label>
                <input
                  type="date"
                  value={invoice.invoiceDate}
                  onChange={(e) => updateInvoice('invoiceDate', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Pelanggan</label>
               <input
                type="text"
                value={invoice.customerName}
                onChange={(e) => updateInvoice('customerName', e.target.value)}
                placeholder="Masukkan nama pelanggan..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
               />
            </div>
          </section>

        {/* Item List */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Rincian Tipe/Layanan</h2>
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                {invoice.items.length} Item
              </span>
           </div>

           <div className="space-y-3 mb-4">
              <AnimatePresence>
                {invoice.items.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl"
                  >
                    <p className="text-slate-400 text-sm">Belum ada tipe/layanan ditambahkan.</p>
                  </motion.div>
                )}
                {invoice.items.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }}
                    className="flex justify-between items-start bg-slate-50 border border-slate-100 p-3.5 rounded-xl"
                  >
                    <div className="flex-1 pr-3">
                      <h4 className="font-semibold text-slate-800 text-sm">{item.name}</h4>
                      {item.description && (
                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                      <p className="text-slate-500 text-sm mt-1.5 font-medium">
                        {item.quantity} {item.unitType} <span className="mx-1 text-slate-300">x</span> {formatIDR(item.unitPrice)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className="font-bold text-slate-900 text-sm">{formatIDR(item.quantity * item.unitPrice)}</span>
                       <button onClick={() => removeItem(item.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors">
                          <Trash2 size={16} />
                       </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>

           <button 
             onClick={() => setIsItemModalOpen(true)}
             className="w-full py-3 flex justify-center items-center gap-2 border-2 border-dashed border-blue-200 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-colors"
           >
             <Plus size={18} />
             Tambah Tipe/Layanan
           </button>
        </section>
        </div>

        <div className="col-span-1 lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Pricing Summary & Adjustments */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Rincian Pembayaran</h2>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-slate-500">Subtotal</span>
            <span className="font-semibold text-slate-700">{formatIDR(subtotal)}</span>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-500 flex-1">Diskon (%)</label>
            <div className="w-24 relative">
              <input 
                type="number"
                min="0" max="100"
                value={invoice.discountPercent || ''}
                onChange={(e) => updateInvoice('discountPercent', Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-right focus:ring-2 focus:ring-blue-500 outline-none pr-8"
              />
              <span className="absolute right-3 top-2 text-slate-400">%</span>
            </div>
          </div>
          {discountAmount > 0 && (
             <div className="flex justify-end text-xs text-green-600 font-medium">
               - {formatIDR(discountAmount)}
             </div>
          )}

          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-500 flex-1">Biaya Pengiriman</label>
            <div className="w-32">
              <input 
                type="number"
                min="0"
                value={invoice.shippingCost || ''}
                onChange={(e) => updateInvoice('shippingCost', Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-right focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <div className="h-px bg-slate-200 my-2"></div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">Total Harga</span>
            <span className="text-lg font-bold text-slate-900">{formatIDR(grandTotal)}</span>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <label className="text-sm text-slate-500 flex-1 flex flex-col">
              Uang Muka
              <span className="text-xs text-slate-400 font-normal">(Opsional)</span>
            </label>
            <div className="w-32">
              <input 
                type="number"
                min="0"
                value={invoice.downPayment || ''}
                onChange={(e) => updateInvoice('downPayment', Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-right focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <div className="h-px bg-slate-200 my-2"></div>

          <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
            <span className="text-sm font-bold text-blue-900">Sisa Tagihan</span>
            <span className="text-xl font-heading font-bold text-blue-700">{formatIDR(Math.max(0, remainingBalance))}</span>
          </div>
        </section>

        {/* Action Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] lg:relative lg:bg-transparent lg:border-0 lg:shadow-none lg:p-0 z-20 flex gap-3">
           <button 
             onClick={handlePrint}
             className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold flex items-center justify-center gap-2 py-4 rounded-xl shadow-sm hover:bg-slate-50 transition-all"
           >
             <Printer size={18} />
             Cetak PDF
           </button>
           <button 
             onClick={handleSubmit}
             disabled={isSubmitting || submitStatus === 'success'}
             className="flex-[2] bg-slate-900 text-white font-semibold flex items-center justify-center gap-2 py-4 rounded-xl shadow-md hover:bg-slate-800 transition-all disabled:opacity-70"
           >
             {isSubmitting ? (
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                 <FileSpreadsheet size={20} />
               </motion.div>
             ) : submitStatus === 'success' ? (
               <span className="flex items-center gap-2">Tersimpan ke Sheets!</span>
             ) : (
               <>
                 <Send size={18} />
                 Simpan ke Sheets
               </>
             )}
           </button>
        </div>
        </div>
      </main>

      {/* Invoice Print Container - Automatically hidden by default if outside print context but we also hide it from regular view and show only the actual print output, wait, let's display it as a Preview on Desktop! */}
      <div className="max-w-6xl mx-auto px-4 py-8 mb-20 no-print">
        <div className="flex items-center gap-3 mb-6">
           <div className="h-px bg-slate-200 flex-1"></div>
           <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Preview Invoice</span>
           <div className="h-px bg-slate-200 flex-1"></div>
        </div>
        <InvoicePreview 
          invoice={invoice}
          storeSettings={storeSettings}
          subtotal={subtotal}
          discountAmount={discountAmount}
          grandTotal={grandTotal}
          remainingBalance={remainingBalance}
        />
      </div>

      {/* Hidden duplicate specifically for robust printing in isolating mode */}
      <div className="hidden print:block w-full">
         <InvoicePreview 
          invoice={invoice}
          storeSettings={storeSettings}
          subtotal={subtotal}
          discountAmount={discountAmount}
          grandTotal={grandTotal}
          remainingBalance={remainingBalance}
        />
      </div>
      </>
      ) : (
        <HistoryTab gasUrl={gasUrl} />
      )}

      {/* Modals */}
      <div className="no-print">
      <AnimatePresence>
        {isItemModalOpen && (
          <ItemModal 
            onClose={() => setIsItemModalOpen(false)} 
            onSave={addItem} 
            unitTypes={UNIT_TYPES} 
          />
        )}
        {isSettingsOpen && (
          <SettingsModal 
            onClose={() => setIsSettingsOpen(false)} 
            currentUrl={gasUrl} 
            currentSettings={storeSettings}
            onSave={handleSaveSettings} 
          />
        )}
        {isGuideOpen && (
          <AppScriptGuide 
            onClose={() => setIsGuideOpen(false)}
            onOpenSettings={() => {
              setIsGuideOpen(false);
              setIsSettingsOpen(true);
            }} 
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
