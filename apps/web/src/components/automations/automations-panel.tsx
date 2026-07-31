import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Trash2, Calendar, Eye, Activity, Play, Zap, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Rule {
  id: string;
  name: string;
  trigger: string;
  conditions: {
    field: string;
    operator: string;
    value: string;
  } | null;
  actions: Array<{
    type: string;
    config: {
      url: string;
      secret: string;
    };
  }>;
  isActive: boolean;
  createdAt: string;
}

interface Log {
  id: string;
  ruleId: string;
  rule?: { name: string };
  eventPayload: any;
  status: 'pending' | 'success' | 'failed';
  error: string | null;
  executedAt: string;
}

export function AutomationsPanel() {
  const [activeSubTab, setActiveSubTab] = useState<'rules' | 'logs'>('rules');
  const [rules, setRules] = useState<Rule[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Form State for new Rule
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [trigger, setTrigger] = useState('CONTACT_CREATED');
  const [hasCondition, setHasCondition] = useState(false);
  const [condField, setCondField] = useState('');
  const [condOperator, setCondOperator] = useState('equals');
  const [condValue, setCondValue] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');

  useEffect(() => {
    if (activeSubTab === 'rules') {
      fetchRules();
    } else {
      fetchLogs();
    }
  }, [activeSubTab]);

  const fetchRules = async () => {
    setLoadingRules(true);
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch('http://localhost:4000/api/v1/automation/rules', {
        headers: {
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch rules');
      const data = await res.json();
      setRules(data);
    } catch (err) {
      console.error(err);
      // Fallback local en desarrollo
      setRules([
        {
          id: 'rule-1',
          name: 'Notificar Webhook Nuevo Contacto',
          trigger: 'CONTACT_CREATED',
          conditions: { field: 'type', operator: 'equals', value: 'PERSON' },
          actions: [{ type: 'send_webhook', config: { url: 'https://api.mycrm.com/webhook', secret: 'hmac_key_123' } }],
          isActive: true,
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
      ]);
    } finally {
      setLoadingRules(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch('http://localhost:4000/api/v1/automation/logs', {
        headers: {
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
      // Fallback local en desarrollo
      setLogs([
        {
          id: 'log-1',
          ruleId: 'rule-1',
          rule: { name: 'Notificar Webhook Nuevo Contacto' },
          eventPayload: { id: 'c-Bruce', firstName: 'Bruce', type: 'PERSON' },
          status: 'success',
          error: null,
          executedAt: new Date().toISOString(),
        },
        {
          id: 'log-2',
          ruleId: 'rule-1',
          rule: { name: 'Notificar Webhook Nuevo Contacto' },
          eventPayload: { id: 'c-Oscorp', type: 'COMPANY' },
          status: 'failed',
          error: 'Timeout after 5000ms connecting to https://api.mycrm.com/webhook',
          executedAt: new Date(Date.now() - 300000).toISOString(),
        },
      ]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const createRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim() || !webhookUrl.trim()) return;

    const payload = {
      name: ruleName,
      description: 'Regla de automatización configurable',
      trigger,
      conditions: hasCondition ? { field: condField, operator: condOperator, value: condValue } : null,
      actions: [
        {
          type: 'send_webhook',
          config: {
            url: webhookUrl,
            secret: webhookSecret || 'saas_secret',
          },
        },
      ],
    };

    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch('http://localhost:4000/api/v1/automation/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create rule');
      
      setShowCreateModal(false);
      // Reset form
      setRuleName('');
      setHasCondition(false);
      setCondField('');
      setCondValue('');
      setWebhookUrl('');
      setWebhookSecret('');
      
      fetchRules();
    } catch (err) {
      alert('Error guardando la regla en base de datos. Se usará mock.');
      setRules((prev) => [
        {
          id: `rule-${Math.random()}`,
          name: ruleName,
          trigger,
          conditions: hasCondition ? { field: condField, operator: condOperator, value: condValue } : null,
          actions: [{ type: 'send_webhook', config: { url: webhookUrl, secret: webhookSecret } }],
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setShowCreateModal(false);
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta regla de automatización?')) return;
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      await fetch(`http://localhost:4000/api/v1/automation/rules/${id}`, {
        method: 'DELETE',
        headers: {
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchRules();
    } catch (err) {
      console.error(err);
      setRules((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* CABECERA AUTOMATIZACIONES */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-secondary" />
            <span>Automatizaciones y Triggers</span>
          </h2>
          <p className="text-xs text-slate-400">Configura disparadores, condiciones y webhooks seguros firmados mediante HMAC</p>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveSubTab('rules')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${activeSubTab === 'rules' ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Reglas</span>
            </button>
            <button
              onClick={() => setActiveSubTab('logs')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${activeSubTab === 'logs' ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Historial</span>
            </button>
          </div>

          {activeSubTab === 'rules' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-xs font-bold text-primary-foreground transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Regla</span>
            </button>
          )}
        </div>
      </div>

      {/* SUB-PESTAÑA: REGLAS */}
      {activeSubTab === 'rules' && (
        <div className="grid grid-cols-1 gap-6">
          {loadingRules ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : rules.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs bg-slate-950 rounded-2xl border border-slate-800">No hay reglas de automatización configuradas.</div>
          ) : (
            rules.map((rule) => (
              <div key={rule.id} className="p-5 bg-slate-950 border border-slate-800 hover:border-slate-700 transition rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{rule.name}</h3>
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">{rule.trigger}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-slate-500">SI</span>
                    {rule.conditions ? (
                      <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300">
                        {rule.conditions.field} {rule.conditions.operator} "{rule.conditions.value}"
                      </span>
                    ) : (
                      <span className="text-slate-600 italic">Siempre</span>
                    )}

                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    
                    <span className="font-semibold text-slate-500">ENTONCES</span>
                    <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300 font-mono">
                      Webhook ➔ {rule.actions[0]?.config.url}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(rule.createdAt).toLocaleDateString()}</span>
                  </span>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-1 text-rose-500 hover:text-rose-400 hover:bg-slate-900 rounded border border-transparent hover:border-slate-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUB-PESTAÑA: HISTORIAL LOGS */}
      {activeSubTab === 'logs' && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
          {loadingLogs ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Regla</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Detalle / Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-xs">No hay ejecuciones registradas.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{log.rule?.name || 'Regla Eliminada'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                          log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : log.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {log.status === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          <span className="capitalize">{log.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{new Date(log.executedAt).toLocaleString()}</td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-mono max-w-xs truncate">
                        {log.error ? <span className="text-rose-400">{log.error}</span> : <span className="text-slate-500">Payload: {JSON.stringify(log.eventPayload)}</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* MODAL: CREAR REGLA */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white">Configurar Regla de Automatización</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={createRule} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Nombre de la Regla</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sincronizar Contacto en Zapier"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Disparador (Trigger)</label>
                  <select
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-slate-700"
                  >
                    <option value="CONTACT_CREATED">Contacto Creado</option>
                    <option value="PET_CREATED">Mascota Registrada</option>
                    <option value="BOOKING_STAGE_CHANGED">Etapa de Reserva Modificada</option>
                  </select>
                </div>

                <div className="flex items-end pb-2.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasCondition}
                      onChange={(e) => setHasCondition(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-800 text-blue-500"
                    />
                    <span>¿Añadir Condición?</span>
                  </label>
                </div>
              </div>

              {hasCondition && (
                <div className="p-4 bg-slate-900/50 border border-slate-850 rounded-2xl grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Campo</label>
                    <input
                      type="text"
                      placeholder="ej. type"
                      value={condField}
                      onChange={(e) => setCondField(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Operador</label>
                    <select
                      value={condOperator}
                      onChange={(e) => setCondOperator(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300"
                    >
                      <option value="equals">Igual a</option>
                      <option value="not_equals">Diferente a</option>
                      <option value="greater_than">Mayor que</option>
                      <option value="less_than">Menor que</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Valor</label>
                    <input
                      type="text"
                      placeholder="ej. PERSON"
                      value={condValue}
                      onChange={(e) => setCondValue(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Webhook URL Destino</label>
                <input
                  type="url"
                  required
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Firma HMAC Secreto (Opcional)</label>
                <input
                  type="password"
                  placeholder="Secreto para firmar payload (HMAC-SHA256)"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl hover:bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold transition-all"
                >
                  Guardar Automatización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
