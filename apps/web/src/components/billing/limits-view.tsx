import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  limits: {
    users: number;
    centers: number;
    storage_bytes: number;
  };
}

interface SubscriptionState {
  planId: string;
  status: string;
  plan: Plan;
}

export function LimitsView() {
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Consumos actuales reales del inquilino (simulados para la UI)
  const currentUsage = {
    users: 3,
    centers: 2,
    storage_bytes: 1288490188, // 1.2 GB
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch('http://localhost:4000/api/v1/billing/subscription', {
        headers: {
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch subscription');
      const data = await res.json();
      
      if (data) {
        setSubscription(data);
      } else {
        // Fallback si no hay registro
        setSubscription(getDefaultSubscription());
      }
    } catch (err) {
      console.error(err);
      setSubscription(getDefaultSubscription());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSubscription = (): SubscriptionState => ({
    planId: 'plan-prof',
    status: 'active',
    plan: {
      id: 'plan-prof',
      name: 'Plan Profesional',
      priceMonthly: 79,
      limits: {
        users: 5,
        centers: 2,
        storage_bytes: 10737418240, // 10 GB
      },
    },
  });

  const changePlan = async (planId: string) => {
    setActionLoading(planId);
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      
      // Mock de IDs de planes para inyectar en backend
      const res = await fetch('http://localhost:4000/api/v1/billing/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId,
          billingCycle: 'monthly',
        }),
      });

      if (!res.ok) throw new Error('Failed to change subscription plan');
      await fetchSubscription();
    } catch (err) {
      // Simular cambio en local si la API falla o no está sembrada
      const mockPlan = getAvailablePlans().find((p) => p.id === planId);
      if (mockPlan) {
        setSubscription({
          planId,
          status: 'active',
          plan: mockPlan,
        });
      }
    } finally {
      setActionLoading(null);
    }
  };

  const getAvailablePlans = (): Plan[] => [
    {
      id: 'plan-basic',
      name: 'Plan Básico',
      priceMonthly: 29,
      limits: { users: 2, centers: 1, storage_bytes: 2147483648 }, // 2 GB
    },
    {
      id: 'plan-prof',
      name: 'Plan Profesional',
      priceMonthly: 79,
      limits: { users: 5, centers: 2, storage_bytes: 10737418240 }, // 10 GB
    },
    {
      id: 'plan-ent',
      name: 'Plan Enterprise',
      priceMonthly: 199,
      limits: { users: 9999, centers: 9999, storage_bytes: 107374182400 }, // 100 GB
    },
  ];

  if (loading || !subscription) {
    return (
      <div className="py-12 flex justify-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const activePlan = subscription.plan;

  // Calculo de porcentajes y validaciones de límites
  const usersPercent = Math.min((currentUsage.users / activePlan.limits.users) * 100, 100);
  const usersExceeded = currentUsage.users > activePlan.limits.users;

  const centersPercent = Math.min((currentUsage.centers / activePlan.limits.centers) * 100, 100);
  const centersExceeded = currentUsage.centers > activePlan.limits.centers;

  const storageLimitGB = activePlan.limits.storage_bytes / (1024 * 1024 * 1024);
  const storageUsageGB = currentUsage.storage_bytes / (1024 * 1024 * 1024);
  const storagePercent = Math.min((storageUsageGB / storageLimitGB) * 100, 100);
  const storageExceeded = currentUsage.storage_bytes > activePlan.limits.storage_bytes;

  const anyExceeded = usersExceeded || centersExceeded || storageExceeded;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-secondary" />
          <span>Suscripción y Cuotas</span>
        </h2>
        <p className="text-xs text-slate-400">Verifica el uso de recursos y selecciona tu plan de facturación</p>
      </div>

      {anyExceeded && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-sm text-rose-300">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-200">¡Límites de Suscripción Excedidos!</h4>
            <p className="text-xs text-rose-400/90 mt-0.5 leading-relaxed">
              El uso actual de tu organización supera los límites permitidos en tu nuevo plan. 
              Por favor, elimina recursos sobrantes (centros o usuarios) o actualiza tu plan para restaurar la operatividad completa del sistema.
            </p>
          </div>
        </div>
      )}

      {/* PLANES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {getAvailablePlans().map((plan) => {
          const isActive = subscription.planId === plan.id;
          const isLoading = actionLoading === plan.id;

          return (
            <div
              key={plan.id}
              className={`bg-slate-950 p-6 rounded-2xl border flex flex-col justify-between gap-4 relative transition-all ${
                isActive
                  ? 'border-primary shadow-lg shadow-primary/5'
                  : 'border-slate-800'
              }`}
            >
              {isActive && (
                <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                  Plan Activo
                </div>
              )}
              <div>
                <h3 className="text-md font-bold text-white">{plan.name}</h3>
                <p className="text-2xl font-extrabold text-white mt-2">
                  {plan.priceMonthly} € <span className="text-xs text-slate-500 font-medium">/ mes</span>
                </p>
                <ul className="text-xs text-slate-400 space-y-2 mt-4">
                  <li className="flex items-center gap-2">
                    ✓ Hasta {plan.limits.users === 9999 ? 'ilimitados' : `${plan.limits.users}`} usuarios
                  </li>
                  <li className="flex items-center gap-2">
                    ✓ Hasta {plan.limits.centers === 9999 ? 'ilimitados' : `${plan.limits.centers}`} Sedes/Centros
                  </li>
                  <li className="flex items-center gap-2">
                    ✓ {plan.limits.storage_bytes / (1024 * 1024 * 1024)} GB de almacenamiento
                  </li>
                  {plan.id !== 'plan-basic' && (
                    <li className="flex items-center gap-2 text-emerald-400/90 font-medium">
                      ✓ Todos los plugins habilitados
                    </li>
                  )}
                </ul>
              </div>

              <button
                onClick={() => changePlan(plan.id)}
                disabled={isActive || isLoading}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-slate-900 border border-slate-800 text-slate-500 cursor-default'
                    : 'bg-primary text-primary-foreground hover:opacity-90 active:scale-95'
                }`}
              >
                {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isActive ? 'Plan Activo' : 'Seleccionar Plan'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* LÍMITES DETALLADOS */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="text-sm font-semibold text-slate-300">Consumo de Recursos</h3>
        
        <div className="space-y-5">
          {/* USUARIOS */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Usuarios Activos</span>
              <span className={`font-semibold ${usersExceeded ? 'text-rose-400' : 'text-slate-300'}`}>
                {currentUsage.users} / {activePlan.limits.users === 9999 ? '∞' : activePlan.limits.users} usuarios
                {usersExceeded && ' (Límite Excedido)'}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-550 ${
                  usersExceeded ? 'bg-rose-500' : 'bg-primary'
                }`}
                style={{ width: `${usersPercent}%` }}
              ></div>
            </div>
          </div>

          {/* CENTROS */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Centros y Delegaciones</span>
              <span className={`font-semibold ${centersExceeded ? 'text-rose-400' : 'text-slate-300'}`}>
                {currentUsage.centers} / {activePlan.limits.centers === 9999 ? '∞' : activePlan.limits.centers} centros
                {centersExceeded && ' (Límite Excedido)'}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-550 ${
                  centersExceeded ? 'bg-rose-500' : 'bg-primary'
                }`}
                style={{ width: `${centersPercent}%` }}
              ></div>
            </div>
          </div>

          {/* ALMACENAMIENTO */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Almacenamiento de Archivos (MinIO)</span>
              <span className={`font-semibold ${storageExceeded ? 'text-rose-400' : 'text-slate-300'}`}>
                {storageUsageGB.toFixed(1)} GB / {storageLimitGB} GB
                {storageExceeded && ' (Límite Excedido)'}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-550 ${
                  storageExceeded ? 'bg-rose-500' : 'bg-primary'
                }`}
                style={{ width: `${storagePercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
