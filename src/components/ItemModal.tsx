import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { InvoiceItem } from '../types';

interface ItemModalProps {
  onClose: () => void;
  onSave: (item: InvoiceItem) => void;
  unitTypes: string[];
}

export function ItemModal({ onClose, onSave, unitTypes }: ItemModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unitType, setUnitType] = useState(unitTypes[0]);
  const [unitPrice, setUnitPrice] = useState<number | ''>('');

  const handleSave = () => {
    if (!name || !quantity || !unitPrice) {
      alert('Mohon lengkapi data tipe/layanan.');
      return;
    }
    onSave({
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      quantity: Number(quantity),
      unitType,
      unitPrice: Number(unitPrice),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-white w-full sm:w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-xl z-10 overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
          <h3 className="font-heading font-bold text-lg text-slate-800">Tambah Tipe/Layanan</h3>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Tipe/Layanan</label>
            <input 
              type="text" autoFocus
              value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Contoh: Komputer Server"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Deskripsi (Opsional)</label>
            <textarea 
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
              placeholder="Contoh: Core i7, RAM 16GB, SSD 512GB..."
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-[2]">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Kuantitas</label>
              <input 
                type="number" min="1"
                value={quantity} onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0"
              />
            </div>
            <div className="flex-[1.5]">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Satuan</label>
              <select 
                value={unitType} onChange={(e) => setUnitType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              >
                {unitTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Harga Satuan (Rp)</label>
            <input 
              type="number" min="0" step="1000"
              value={unitPrice} onChange={(e) => setUnitPrice(e.target.value ? Number(e.target.value) : '')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0"
            />
          </div>
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-100 pb-8 sm:pb-5 shrink-0">
          <button 
            onClick={handleSave}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            <Check size={18} />
            Simpan Tipe/Layanan
          </button>
        </div>
      </motion.div>
    </div>
  );
}
