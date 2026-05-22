import React from 'react';
import { ShieldCheckIcon, PlusIcon, LockClosedIcon, FingerPrintIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const StaffPage: React.FC = () => {
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-10 shadow-2xl">
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-upf-primary flex items-center justify-center shadow-xl shadow-purple-500/20 text-white">
              <ShieldCheckIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight font-outfit">Staff & Permissions</h1>
              <p className="text-slate-400 font-medium text-lg mt-1 opacity-90">
                Contrôle d'accès granulaire et sécurité RBAC
              </p>
            </div>
          </div>
          <button className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md text-white font-black px-8 py-4 rounded-2xl border border-white/10 cursor-not-allowed opacity-50">
            <PlusIcon className="w-6 h-6" />
            Nouveau Staff
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-24 text-center relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-upf-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50" />

        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto mb-8 bg-slate-50 rounded-[2rem] flex items-center justify-center">
            <LockClosedIcon className="w-12 h-12 text-slate-200" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight font-outfit">Sécurité Avancée en cours de déploiement</h2>
          <p className="text-slate-500 mt-4 max-w-lg mx-auto text-lg font-medium">
            Le module de gestion granulaire (RBAC), les permissions par établissement et l'authentification multi-facteurs seront disponibles dans la v8.0.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
            {[
              { title: 'RBAC', desc: 'Rôles personnalisés', icon: ShieldCheckIcon },
              { title: 'Audit Logs', desc: 'Traçabilité complète', icon: FingerPrintIcon },
              { title: 'Isolation', desc: 'Données par bâtiment', icon: LockClosedIcon },
            ].map((feature, i) => (
              <div key={i} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <feature.icon className="w-6 h-6 text-upf-primaryLight mx-auto mb-3" />
                <div className="font-black text-slate-800 text-sm uppercase tracking-widest">{feature.title}</div>
                <div className="text-xs text-slate-400 font-bold mt-1">{feature.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StaffPage;

