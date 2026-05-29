import React, { useState, useRef } from 'react';
import { X, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { StoreSettings } from '../types';

interface SettingsModalProps {
  onClose: () => void;
  onSave: (url: string, settings: StoreSettings) => void;
  currentUrl: string;
  currentSettings: StoreSettings;
}

export function SettingsModal({ onClose, onSave, currentUrl, currentSettings }: SettingsModalProps) {
  const [url, setUrl] = useState(currentUrl);
  const [settings, setSettings] = useState<StoreSettings>(currentSettings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logoBase64: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl z-10 overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
          <h3 className="font-heading font-bold text-lg text-slate-800">Pengaturan Toko & Integrasi</h3>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Store Logo */}
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Logo Toko</label>
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                  {settings.logoBase64 ? (
                    <img src={settings.logoBase64} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="text-slate-300" size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <Upload size={16} /> Upload Logo
                  </button>
                  <p className="text-xs text-slate-400 mt-1.5">Rasio 1:1 atau proporsional direkomendasikan.</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Toko</label>
              <input 
                type="text"
                value={settings.name} onChange={(e) => setSettings({...settings, name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Alamat Lengkap</label>
              <textarea 
                value={settings.address} onChange={(e) => setSettings({...settings, address: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[80px]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nomor Telepon / WhatsApp</label>
              <input 
                type="text"
                value={settings.phone} onChange={(e) => setSettings({...settings, phone: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="h-px bg-slate-200 w-full" />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Google Apps Script Web App URL</label>
            <p className="text-xs text-slate-500 mb-2">
              Untuk sinkronisasi data invoice langsung ke Google Sheets.
            </p>
            <textarea 
              value={url} onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm h-24 break-all"
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            />
          </div>
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={() => onSave(url, settings)}
            className="flex-1 flex justify-center items-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
          >
            <Save size={18} />
            Simpan
          </button>
        </div>
      </motion.div>
    </div>
  );
}
