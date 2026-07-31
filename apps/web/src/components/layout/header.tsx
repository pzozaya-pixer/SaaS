import React, { useEffect, useState } from 'react';
import { Palette, Bell, X, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { io } from 'socket.io-client';

interface HeaderProps {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor: (color: string) => void;
}

export function Header({ primaryColor, setPrimaryColor, secondaryColor, setSecondaryColor }: HeaderProps) {
  const [toasts, setToasts] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Leer token de localStorage (o mock por defecto)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || 'mock-session-token-32-chars-long' : 'mock-session-token-32-chars-long';
    
    // Conectar al gateway de WebSockets en el backend
    const socket = io('http://localhost:4000/notifications', {
      query: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to real-time notification gateway');
    });

    // Escuchar evento de exportación completada
    socket.on('export.completed', (payload: any) => {
      const toastId = Math.random().toString();
      const newToast = {
        id: toastId,
        type: 'export',
        title: '¡Exportación Lista!',
        message: 'Tu archivo CSV de contactos se ha generado en segundo plano.',
        downloadUrl: `http://localhost:9000/saas-attachments/${payload.key}`, // Descarga directa local
        createdAt: new Date(),
      };

      setToasts((prev) => [newToast, ...prev]);
      setUnreadCount((c) => c + 1);

      // Auto-eliminar el toast en 15 segundos
      setTimeout(() => removeToast(toastId), 15000);
    });

    // Escuchar evento de importación completada
    socket.on('import.completed', (payload: any) => {
      const toastId = Math.random().toString();
      const newToast = {
        id: toastId,
        type: 'import',
        title: '¡Importación Finalizada!',
        message: `Importados: ${payload.importedCount} | Omitidos: ${payload.skippedCount} | Errores: ${payload.errors?.length || 0}`,
        errors: payload.errors,
        createdAt: new Date(),
      };

      setToasts((prev) => [newToast, ...prev]);
      setUnreadCount((c) => c + 1);

      setTimeout(() => removeToast(toastId), 15000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleBellClick = () => {
    setUnreadCount(0);
  };

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-md font-semibold text-slate-200">Panel de Administración</h1>
          <p className="text-xs text-slate-400">
            Organización: <span className="text-secondary font-medium">PetResidence S.L.</span>
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* SELECTOR DE COLORES CORPORATIVOS (Fase 2 & 18: White-labeling dinámico) */}
          <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-xs">
            <Palette className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 font-medium mr-2">Colores Corporativos:</span>
            
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Primario:</span>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-5 h-5 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 ml-3">
              <span className="text-slate-500">Secundario:</span>
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-5 h-5 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
            </div>
          </div>

          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Plan Profesional
          </span>

          {/* BOTÓN CAMPANA DE NOTIFICACIONES */}
          <button
            onClick={handleBellClick}
            className="relative p-2 text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all duration-200"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-[10px] text-white font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold border border-slate-700 text-slate-300">
            AD
          </div>
        </div>
      </header>

      {/* TOASTS CONTENEDOR EN TIEMPO REAL */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-96 max-w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="p-4 bg-slate-900/95 border border-slate-800 backdrop-blur-md rounded-2xl shadow-2xl flex gap-3 text-sm text-slate-200 transition-all duration-300 animate-slide-in"
          >
            {toast.type === 'export' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-100">{toast.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{toast.message}</p>

              {toast.type === 'export' && toast.downloadUrl && (
                <a
                  href={toast.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-lg text-white transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar CSV
                </a>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-300 shrink-0 self-start"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
