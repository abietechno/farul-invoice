import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, FileText, Search } from 'lucide-react';

interface HistoryTabProps {
  gasUrl: string;
}

export function HistoryTab({ gasUrl }: HistoryTabProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHistory = async () => {
    if (!gasUrl) {
      setError('URL Google Apps Script belum diatur.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(gasUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      if (data && data.status === 'success') {
        setHistory(data.data);
      } else {
        throw new Error('Format respons tidak valid');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil data dari Google Sheets. Pastikan URL benar dan aplikasi sudah di-deploy ulang setelah menambahkan fungsi doGet().');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [gasUrl]);

  const filteredHistory = history.filter(item => 
    item['No. Invoice']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item['Nama Pelanggan']?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatIDR = (val: any) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari No. Invoice atau Nama Pelanggan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button 
            onClick={fetchHistory}
            disabled={isLoading}
            className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            Muat Ulang
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-red-600 text-center font-medium text-sm">
          {error}
        </div>
      ) : isLoading && history.length === 0 ? (
        <div className="flex items-center justify-center p-12">
          <RefreshCw size={32} className="animate-spin text-blue-500" />
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">Belum ada riwayat invoice ditemukan.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">No. Invoice</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Item Layanan</th>
                  <th className="px-6 py-4 text-right">Grand Total</th>
                  <th className="px-6 py-4 text-right">Status / Sisa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item, idx) => (
                  <motion.tr 
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono font-semibold text-slate-600 bg-slate-50/50 group-hover:bg-slate-100/50 transition-colors">
                      {item['No. Invoice'] || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {item['Tanggal'] ? new Date(item['Tanggal']).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {item['Nama Pelanggan'] || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-normal min-w-[240px]">
                      <div className="line-clamp-2 text-xs leading-relaxed">
                        {item['Item Layanan'] ? String(item['Item Layanan']).replace(/\\n/g, ', ') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      {formatIDR(item['Grand Total'])}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item['Sisa Tagihan'] > 0 ? (
                        <div className="inline-flex flex-col items-end">
                          <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider mb-0.5">Sisa Tagihan</span>
                          <span className="font-bold text-red-600">{formatIDR(item['Sisa Tagihan'])}</span>
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">LUNAS</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
