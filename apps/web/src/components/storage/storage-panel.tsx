import React, { useState, useEffect, useRef } from 'react';
import { HardDrive, Upload, Trash2, Download, Eye, Calendar, FileText, Loader2, RefreshCw } from 'lucide-react';

interface StorageFile {
  key: string;
  entityName: string;
  originalName: string;
  sizeBytes: number;
  lastModified: string;
}

export function StoragePanel() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [entityName, setEntityName] = useState('docs');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch('http://localhost:4000/api/v1/storage/list', {
        headers: {
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch files');
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error(err);
      // Fallback local en desarrollo
      setFiles([
        {
          key: 'org-1/pets/vaccines_sparky.pdf',
          entityName: 'pets',
          originalName: 'vaccines_sparky.pdf',
          sizeBytes: 1548291, // 1.48 MB
          lastModified: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          key: 'org-1/contacts/logo_company.png',
          entityName: 'contacts',
          originalName: 'logo_company.png',
          sizeBytes: 524288, // 512 KB
          lastModified: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch(`http://localhost:4000/api/v1/storage/upload?entityName=${entityName}`, {
        method: 'POST',
        headers: {
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to upload file');
      }
      
      alert('¡Archivo subido exitosamente!');
      fetchFiles();
    } catch (err: any) {
      alert(`Error al subir archivo: ${err.message}`);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const downloadFile = async (key: string) => {
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch(`http://localhost:4000/api/v1/storage/presign?key=${encodeURIComponent(key)}`, {
        headers: {
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to get presigned URL');
      const data = await res.json();
      window.open(data.url, '_blank');
    } catch (err: any) {
      alert(`Error al descargar: ${err.message}`);
    }
  };

  const deleteFile = async (key: string, sizeBytes: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este archivo permanentemente?')) return;
    
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch(
        `http://localhost:4000/api/v1/storage/delete?key=${encodeURIComponent(key)}&sizeBytes=${sizeBytes}`,
        {
          method: 'DELETE',
          headers: {
            'x-organization-id': 'org-1',
            'Authorization': `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error('Failed to delete file');
      fetchFiles();
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
      setFiles((prev) => prev.filter((f) => f.key !== key));
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* CABECERA ALMACENAMIENTO */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-secondary" />
            <span>Gestión de Archivos y Adjuntos</span>
          </h2>
          <p className="text-xs text-slate-400">Administra documentos privados del inquilino almacenados en MinIO/S3</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchFiles}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="flex gap-2 items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <select
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              className="bg-transparent border-0 rounded text-xs text-slate-300 font-semibold focus:outline-none focus:ring-0 cursor-pointer px-2"
            >
              <option value="docs">Documentos</option>
              <option value="pets">Mascotas</option>
              <option value="contacts">Contactos</option>
            </select>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={handleUploadClick}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-xs font-bold text-primary-foreground transition-all"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>Subir Archivo</span>
            </button>
          </div>
        </div>
      </div>

      {/* TABLA DE ARCHIVOS */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Nombre del Archivo</th>
                <th className="px-6 py-4">Entidad Asociada</th>
                <th className="px-6 py-4">Tamaño</th>
                <th className="px-6 py-4">Modificado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {files.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-xs">No hay archivos guardados en el almacenamiento del tenant.</td>
                </tr>
              ) : (
                files.map((file) => (
                  <tr key={file.key} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate max-w-xs">{file.originalName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-900 text-slate-300 border border-slate-800 uppercase tracking-wide">
                        {file.entityName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{formatSize(file.sizeBytes)}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => downloadFile(file.key)}
                          className="p-1 hover:bg-slate-900 rounded border border-transparent hover:border-slate-800 text-blue-400 hover:text-blue-300 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteFile(file.key, file.sizeBytes)}
                          className="p-1 hover:bg-slate-900 rounded border border-transparent hover:border-slate-800 text-rose-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
