import React, { useState } from 'react';
import { X, Copy, ExternalLink, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AppScriptGuideProps {
  onClose: () => void;
  onOpenSettings: () => void;
}

const SCRIPT_CODE = `function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  if (!e.postData || !e.postData.contents) {
    return ContentService.createTextOutput("Error: No data");
  }
  
  const payload = JSON.parse(e.postData.contents);
  const data = payload.data;
  
  // Set Headers if they don't exist (only first time)
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp", "No. Invoice", "Tanggal", "Nama Pelanggan", "Subtotal", 
      "Diskon %", "Total Diskon", "Ongkir", 
      "Grand Total", "Uang Muka", "Sisa Tagihan", "Item Layanan"
    ]);
  }
  
  const itemNames = data.items.map(function(item) {
    let text = item.name;
    if (item.description) {
      text += " - " + item.description;
    }
    text += " (" + item.quantity + " " + item.unitType + ")";
    return text;
  }).join(",\\n");

  sheet.appendRow([
    data.timestamp,
    data.invoiceNumber,
    data.invoiceDate,
    data.customerName,
    data.subtotal,
    data.discountPercent,
    data.discountAmount,
    data.shippingCost,
    data.grandTotal,
    data.downPayment,
    data.remainingBalance,
    itemNames
  ]);

  return ContentService.createTextOutput("Success")
    .setMimeType(ContentService.MimeType.TEXT);
}

// Function to get history using GET request
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({ status: "success", data: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const headers = data[0];
  const rows = data.slice(1);
  
  const result = rows.map(function(row) {
    const obj = {};
    headers.forEach(function(header, index) {
      obj[header] = row[index];
    });
    return obj;
  });
  
  // Return reversed to show newest first
  return ContentService.createTextOutput(JSON.stringify({ status: "success", data: result.reverse() }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Implement options to handle CORS preflight
function doOptions(e) {
  return ContentService.createTextOutput("")
}
`;

export function AppScriptGuide({ onClose, onOpenSettings }: AppScriptGuideProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-xl z-10 overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
          <h3 className="font-heading font-bold text-lg text-slate-800">Panduan Google Apps Script</h3>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          <ol className="space-y-4 list-decimal list-inside text-sm text-slate-600">
             <li>Buka file <b>Google Sheets</b> baru.</li>
             <li>Pilih menu <b>Ekstensi</b> {'>'} <b>Apps Script</b>.</li>
             <li>Salin (copy) kode di bawah lalu timpa (paste) kode ke dalam editor.</li>
          </ol>

          <div className="relative group">
            <div className="absolute right-2 top-2">
               <button 
                 onClick={handleCopy}
                 className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition"
               >
                 {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
                 {copied ? 'Tersalin' : 'Salin Kode'}
               </button>
            </div>
            <pre className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-800 overflow-x-auto">
              <code>{SCRIPT_CODE}</code>
            </pre>
          </div>

          <ol className="space-y-4 list-decimal list-inside text-sm text-slate-600" start={4}>
             <li>Klik <b>Simpan</b> (ikon disket), lalu klik tombol biru <b>Terapkan (Deploy)</b> di kanan atas.</li>
             <li>Pilih <b>Deployment baru</b>.</li>
             <li>Pilih jenis <b>Aplikasi Web (Web App)</b>.</li>
             <li>Set <i>Akses (Who has access)</i> menjadi <b>Siapa saja (Anyone)</b>.</li>
             <li>Klik Terapkan dan otorisasi akses (berikan izin).</li>
             <li>Salin <b>Web App URL</b> yang muncul dan masukkan ke halaman Pengaturan aplikasi ini.</li>
          </ol>
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Tutup
          </button>
          <button 
            onClick={onOpenSettings}
            className="flex-1 flex justify-center items-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
          >
            Lanjut ke Pengaturan
            <ExternalLink size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
