"use client";
import { useState, useRef } from 'react';

export function CloudinaryTestClient() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return; setError(null);
    if (!['image/jpeg','image/png','image/jpg'].includes(f.type)) { setError('Only JPG/PNG images are allowed'); return; }
    if (f.size > 2*1024*1024) { setError('File too large (max 2MB)'); return; }
    setFile(f); setPreview(URL.createObjectURL(f)); setResultUrl(null);
  }

  async function onUpload() {
    if (!file) return; setUploading(true); setError(null);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/api/uploads/profile', { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.success) setError(data.message || 'Upload failed'); else setResultUrl(data.data.url);
    } catch (e: any) { setError(e?.message || 'Unexpected error'); }
    finally { setUploading(false); }
  }

  function reset() { setFile(null); setPreview(null); setResultUrl(null); setError(null); if (inputRef.current) inputRef.current.value=''; }

  return (
    <section className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">Select Image</label>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg" onChange={onSelect} className="block text-sm" />
        {file && <p className="text-xs text-slate-500">{file.name} ({(file.size/1024).toFixed(1)} KB)</p>}
      </div>
      {preview && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600">Local Preview</p>
            <img src={preview} alt="preview" className="rounded-lg border border-slate-200 shadow-sm max-h-64 object-cover" />
          </div>
          {resultUrl && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">Cloudinary Result</p>
              <img src={resultUrl} alt="uploaded" className="rounded-lg border border-emerald-300 shadow max-h-64 object-cover" />
              <a href={resultUrl} target="_blank" rel="noopener" className="text-blue-600 text-xs hover:underline break-all">{resultUrl}</a>
            </div>
          )}
        </div>
      )}
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}
      <div className="flex flex-wrap gap-3">
        <button disabled={!file || uploading} onClick={onUpload} className="px-5 py-2 rounded-md bg-blue-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 shadow">{uploading ? 'Uploading…' : 'Upload'}</button>
        <button type="button" onClick={reset} className="px-4 py-2 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm">Reset</button>
      </div>
    </section>
  );
}

export function Badge({ label, type }: { label: string; type?: 'ok' | 'warn' }) {
  const base = 'px-2 py-1 rounded-md border text-[10px] font-medium tracking-wide';
  if (type === 'ok') return <span className={base + ' bg-emerald-50 border-emerald-300 text-emerald-700'}>{label}</span>;
  if (type === 'warn') return <span className={base + ' bg-amber-50 border-amber-300 text-amber-700'}>{label}</span>;
  return <span className={base + ' bg-slate-50 border-slate-200 text-slate-600'}>{label}</span>;
}
