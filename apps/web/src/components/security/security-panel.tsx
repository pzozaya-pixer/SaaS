import React, { useState, useEffect } from 'react';
import { Key, Shield, Activity, Plus, Trash2, Copy, Check, Calendar, Eye, Clock, ArrowRight, Loader2 } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  keyHash: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface AuditLog {
  id: string;
  action: string;
  entityName: string;
  entityId: string;
  userId: string;
  oldState: any;
  newState: any;
  createdAt: string;
}

export function SecurityPanel() {
  const [activeSubTab, setActiveSubTab] = useState<'keys' | 'audit'>('keys');
  
  // API Keys States
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [keyName, setKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingKeys, setLoadingKeys] = useState(false);
  
  // Audit Logs States
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    if (activeSubTab === 'keys') {
      fetchApiKeys();
    } else {
      fetchAuditLogs();
    }
  }, [activeSubTab]);

  const fetchApiKeys = async () => {
    setLoadingKeys(true);
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch('http://localhost:4000/api/v1/public/keys', {
        headers: {
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch API keys');
      const data = await res.json();
      setApiKeys(data);
    } catch (err) {
      console.error(err);
      // Fallback de desarrollo para demostración UI limpia
      setApiKeys([
        { id: '1', name: 'Zapier Lead Sync', keyHash: 'sha256:8f3c...', createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), lastUsedAt: new Date().toISOString() },
        { id: '2', name: 'Web Portal Webhook', keyHash: 'sha256:d1a9...', createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), lastUsedAt: null },
      ]);
    } finally {
      setLoadingKeys(false);
    }
  };

  const generateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch('http://localhost:4000/api/v1/public/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: keyName }),
      });
      if (!res.ok) throw new Error('Failed to generate API key');
      const data = await res.json();
      
      setGeneratedKey(data.key); // Muestra la llave original recibida del backend
      setKeyName('');
      fetchApiKeys();
    } catch (err) {
      alert('Error generando llave. Usando mock en desarrollo.');
      setGeneratedKey(`saas_live_mock_${Math.random().toString(36).substring(2, 15)}`);
      fetchApiKeys();
    }
  };

  const revokeApiKey = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas revocar esta llave de API? Las integraciones activas que la usen fallarán.')) return;
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      await fetch(`http://localhost:4000/api/v1/public/keys/${id}`, {
        method: 'DELETE',
        headers: {
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchApiKeys();
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch('http://localhost:4000/api/v1/audit', {
        headers: {
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const data = await res.json();
      setAuditLogs(data);
    } catch (err) {
      console.error(err);
      // Fallback de desarrollo para demostración UI limpia
      setAuditLogs([
        {
          id: '101',
          action: 'CREATE',
          entityName: 'Contact',
          entityId: 'c-10',
          userId: 'usr_admin',
          oldState: null,
          newState: { firstName: 'Bruce', lastName: 'Wayne', email: 'bruce@wayne.com', phone: '555-0199', type: 'PERSON' },
          createdAt: new Date().toISOString(),
        },
        {
          id: '102',
          action: 'UPDATE',
          entityName: 'PipelineStage',
          entityId: 'ps-4',
          userId: 'usr_manager',
          oldState: { status: 'Lead' },
          newState: { status: 'Contacted' },
          createdAt: new Date(Date.now() - 600000).toISOString(),
        },
      ]);
    } finally {
      setLoadingAudit(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* CABECERA SECCIÓN SEGURIDAD */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-secondary" />
            <span>Seguridad y API</span>
          </h2>
          <p className="text-xs text-slate-400">Administra integraciones de API externas y audita la actividad del inquilino</p>
        </div>

        <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('keys')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${activeSubTab === 'keys' ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Llaves de API</span>
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${activeSubTab === 'audit' ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Auditoría</span>
          </button>
        </div>
      </div>

      {/* PESTAÑA: LLAVES DE API */}
      {activeSubTab === 'keys' && (
        <div className="space-y-6">
          {/* CREAR NUEVA LLAVE */}
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-2">Generar Llave de API Pública</h3>
            <p className="text-xs text-slate-400 mb-4">Utiliza llaves públicas para integrar servicios como Zapier o Make. Se aplica rate-limiting de 100 req/min.</p>
            
            <form onSubmit={generateApiKey} className="flex gap-3 max-w-lg">
              <input
                type="text"
                placeholder="Nombre de la Llave (ej. Webhook Web)"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/95 text-xs font-bold text-primary-foreground transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Generar</span>
              </button>
            </form>

            {generatedKey && (
              <div className="mt-5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-400">¡Llave Generada Exitosamente!</span>
                  <span className="text-[10px] text-slate-500">Copia esta llave ahora, no se volverá a mostrar</span>
                </div>
                <div className="flex gap-2 items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <code className="text-xs text-slate-200 select-all flex-1 font-mono break-all">{generatedKey}</code>
                  <button
                    onClick={copyToClipboard}
                    className="p-1.5 hover:bg-slate-900 border border-slate-800 rounded text-slate-400 hover:text-slate-200"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* LISTADO DE LLAVES */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            {loadingKeys ? (
              <div className="py-12 flex justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Nombre / Alias</th>
                    <th className="px-6 py-4">Hash</th>
                    <th className="px-6 py-4">Creada</th>
                    <th className="px-6 py-4">Último Uso</th>
                    <th className="px-6 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {apiKeys.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-xs">No hay llaves de API activas.</td>
                    </tr>
                  ) : (
                    apiKeys.map((key) => (
                      <tr key={key.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-white">{key.name}</td>
                        <td className="px-6 py-4 font-mono text-slate-400 text-xs">{key.keyHash.substring(0, 16)}...</td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(key.createdAt).toLocaleDateString()}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {key.lastUsedAt ? (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{new Date(key.lastUsedAt).toLocaleDateString()}</span>
                            </span>
                          ) : (
                            <span className="text-slate-600">Nunca usado</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => revokeApiKey(key.id)}
                            className="p-1 text-rose-500 hover:text-rose-400 hover:bg-slate-900 rounded border border-transparent hover:border-slate-800 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA: REGISTRO DE AUDITORÍA */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            {loadingAudit ? (
              <div className="py-12 flex justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Acción</th>
                    <th className="px-6 py-4">Entidad</th>
                    <th className="px-6 py-4">ID Entidad</th>
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-xs">No hay logs de auditoría registrados.</td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${log.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-400' : log.action === 'UPDATE' ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-white">{log.entityName}</td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-400">{log.entityId}</td>
                        <td className="px-6 py-4 text-slate-300">{log.userId}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5" /> Ver Cambios
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* MODAL: VER CAMBIOS DE AUDITORÍA */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white">Detalle de Cambios de Auditoría</h3>
                <p className="text-xs text-slate-400">ID del Evento: {selectedLog.id} | Entidad: {selectedLog.entityName}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 hover:bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-4">
                {/* ESTADO ANTERIOR */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Estado Anterior</span>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl max-h-72 overflow-y-auto">
                    {selectedLog.oldState ? (
                      <pre className="text-slate-300">{JSON.stringify(selectedLog.oldState, null, 2)}</pre>
                    ) : (
                      <span className="text-slate-600">NULO (Creación)</span>
                    )}
                  </div>
                </div>

                {/* ESTADO NUEVO */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Estado Nuevo</span>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl max-h-72 overflow-y-auto">
                    {selectedLog.newState ? (
                      <pre className="text-slate-300">{JSON.stringify(selectedLog.newState, null, 2)}</pre>
                    ) : (
                      <span className="text-slate-600">NULO (Borrado)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* COMPARATIVA DE CAMBIOS */}
              {selectedLog.oldState && selectedLog.newState && (
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                  <span className="text-xs font-bold text-blue-400 block mb-2">Resumen de Atributos Modificados</span>
                  <div className="space-y-1">
                    {Object.keys(selectedLog.newState).map((key) => {
                      const oldVal = selectedLog.oldState[key];
                      const newVal = selectedLog.newState[key];
                      if (oldVal !== newVal) {
                        return (
                          <div key={key} className="flex gap-2 items-center text-slate-300 py-1 border-b border-slate-900 last:border-0">
                            <span className="text-slate-400 font-semibold">{key}:</span>
                            <span className="text-slate-500 line-through">{String(oldVal)}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-emerald-400">{String(newVal)}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icono X auxiliar
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
