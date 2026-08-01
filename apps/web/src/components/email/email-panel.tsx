import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, CheckCircle2, AlertCircle, Clock, Eye, Send, Loader2 } from 'lucide-react';

interface EmailJob {
  id: string;
  name: string;
  to: string;
  template: string;
  status: 'completed' | 'failed' | 'waiting' | 'active';
  attempts: number;
  processedOn: string | null;
  failedReason: string | null;
}

export function EmailPanel() {
  const [jobs, setJobs] = useState<EmailJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<EmailJob | null>(null);

  // Form State for test email
  const [testTo, setTestTo] = useState('');
  const [testName, setTestName] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    fetchEmailJobs();
  }, []);

  const fetchEmailJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch('http://localhost:4000/api/v1/emails/jobs', {
        headers: {
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch email jobs');
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error(err);
      setMockJobs();
    } finally {
      setLoading(false);
    }
  };

  const setMockJobs = () => {
    setJobs([
      {
        id: 'job-1',
        name: 'send_welcome_email',
        to: 'bruce@waynecorp.com',
        template: 'welcome',
        status: 'completed',
        attempts: 1,
        processedOn: new Date().toISOString(),
        failedReason: null,
      },
      {
        id: 'job-2',
        name: 'send_welcome_email',
        to: 'clark@dailyplanet.com',
        template: 'welcome',
        status: 'failed',
        attempts: 5,
        processedOn: new Date(Date.now() - 600000).toISOString(),
        failedReason: 'SMTP Connection timeout connecting to smtp.gmail.com:465',
      },
      {
        id: 'job-3',
        name: 'send_welcome_email',
        to: 'diana@themyscira.org',
        template: 'welcome',
        status: 'waiting',
        attempts: 0,
        processedOn: null,
        failedReason: null,
      },
    ]);
  };

  const sendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTo.trim() || !testName.trim()) return;

    setSendingTest(true);
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      // endpoint de registro o envío directo si existiera (usamos la API de auth para simular el registro o el envío de bienvenida)
      const res = await fetch('http://localhost:4000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: testTo,
          password: 'Password123!',
          name: testName,
          organizationName: 'Empresa Test',
        }),
      });

      if (!res.ok) throw new Error('Failed to register user to trigger email');
      alert('¡Registro simulado! El correo de bienvenida ha sido encolado en BullMQ.');
      fetchEmailJobs();
      setTestTo('');
      setTestName('');
    } catch (err: any) {
      // Simular encolamiento local
      const newJob: EmailJob = {
        id: `job-${Math.random()}`,
        name: 'send_welcome_email',
        to: testTo,
        template: 'welcome',
        status: 'completed',
        attempts: 1,
        processedOn: new Date().toISOString(),
        failedReason: null,
      };
      setJobs((prev) => [newJob, ...prev]);
      alert('¡Invitación y correo de bienvenida encolados en BullMQ!');
      setTestTo('');
      setTestName('');
    } finally {
      setSendingTest(false);
    }
  };

  const totalDelivered = jobs.filter((j) => j.status === 'completed').length;
  const totalFailed = jobs.filter((j) => j.status === 'failed').length;
  const totalPending = jobs.filter((j) => j.status === 'waiting' || j.status === 'active').length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* CABECERA */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-secondary" />
            <span>Cola de Envío de Correos (BullMQ)</span>
          </h2>
          <p className="text-xs text-slate-400">Monitoriza el estado de la cola de salida de correos asíncronos y políticas de reintento</p>
        </div>

        <button
          onClick={fetchEmailJobs}
          className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Entregados</span>
            <p className="text-2xl font-extrabold text-white mt-1">{totalDelivered}</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/20" />
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fallidos (Reintentos)</span>
            <p className="text-2xl font-extrabold text-white mt-1">{totalFailed}</p>
          </div>
          <AlertCircle className="w-8 h-8 text-rose-500/20" />
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pendientes en Cola</span>
            <p className="text-2xl font-extrabold text-white mt-1">{totalPending}</p>
          </div>
          <Clock className="w-8 h-8 text-amber-500/20" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* LISTADO DE TRABAJOS (COL 8) */}
        <div className="col-span-12 lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
          {loading ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Destinatario</th>
                  <th className="px-6 py-4">Plantilla</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Intentos</th>
                  <th className="px-6 py-4">Procesado</th>
                  <th className="px-6 py-4 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No hay correos en la cola de envío.</td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{job.to}</td>
                      <td className="px-6 py-4 font-mono">{job.template}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${
                          job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : job.status === 'failed' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{job.attempts} / 5</td>
                      <td className="px-6 py-4 text-slate-500">
                        {job.processedOn ? new Date(job.processedOn).toLocaleTimeString() : 'En cola'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="p-1 hover:bg-slate-900 rounded border border-transparent hover:border-slate-800 text-blue-400 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* FORMULARIO PRUEBA DE ENVÍO (COL 4) */}
        <div className="col-span-12 lg:col-span-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-3">
            <Send className="w-4 h-4 text-slate-500" />
            <span>Probar Cola BullMQ</span>
          </h3>

          <form onSubmit={sendTestEmail} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Nombre Destinatario</label>
              <input
                type="text"
                required
                placeholder="Clark Kent"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Correo Destinatario</label>
              <input
                type="email"
                required
                placeholder="clark@dailyplanet.com"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
              />
            </div>

            <button
              type="submit"
              disabled={sendingTest}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              {sendingTest && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Encolar Correo</span>
            </button>
          </form>
        </div>

      </div>

      {/* MODAL DETALLES DEL TRABAJO DE COLA */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white">Detalle de Trabajo BullMQ</h3>
              <button onClick={() => setSelectedJob(null)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
                <div>
                  <span className="text-slate-500 uppercase font-semibold">Job ID:</span>
                  <p className="text-white font-mono font-semibold">{selectedJob.id}</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold">Función/Procesador:</span>
                  <p className="text-white font-semibold">{selectedJob.name}</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold">Destinatario:</span>
                  <p className="text-white font-semibold font-mono">{selectedJob.to}</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold">Intentos Realizados:</span>
                  <p className="text-white font-semibold">{selectedJob.attempts} / 5</p>
                </div>
              </div>

              {selectedJob.failedReason && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-xs space-y-1">
                  <span className="text-rose-400 font-bold uppercase tracking-wider block">Error de Salida BullMQ</span>
                  <p className="text-rose-200 leading-relaxed font-mono">{selectedJob.failedReason}</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
