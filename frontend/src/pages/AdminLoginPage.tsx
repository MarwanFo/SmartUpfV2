import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LockClosedIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  ServerStackIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      toast.success('Accès autorisé. Bienvenue, Administrateur.');
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Identifiants administrateur incorrects.');
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 font-inter flex">
      {/* Left Panel - Image & Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/85 mix-blend-multiply z-10"></div>
        {/* We reuse the same image but the dark overlay makes it feel more "sysadmin/secure" */}
        <img 
          src="/login-bg.png" 
          alt="UPF Architecture" 
          className="absolute inset-0 w-full h-full object-cover grayscale"
        />
        
        {/* Subtle grid pattern for tech feel */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-10"></div>
        
        <div className="relative z-20 flex flex-col justify-between h-full p-16">
          <Link to="/" className="flex items-center gap-3 w-max hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 rounded bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <ShieldCheckIcon className="w-7 h-7 text-upf-gold" />
            </div>
            <span className="font-outfit font-bold text-2xl text-white">UPF Command Center</span>
          </Link>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 backdrop-blur-md text-red-400 text-xs font-semibold tracking-wider uppercase mb-6">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Accès Restreint
            </div>
            <h1 className="text-4xl xl:text-5xl font-outfit font-extrabold text-white leading-tight mb-6">
              Portail d'Administration <br />
              <span className="text-upf-gold">Hautement Sécurisé.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md font-light leading-relaxed mb-8">
              Vous êtes sur le point de vous connecter à l'interface de gestion centrale Zero-Trust de l'Université Privée de Fès. 
              Toute tentative d'accès non autorisée sera enregistrée et signalée.
            </p>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <ServerStackIcon className="w-5 h-5 text-emerald-500" /> Infrastructure opérationnelle
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <ShieldCheckIcon className="w-5 h-5 text-emerald-500" /> Protocoles de sécurité actifs
              </div>
            </div>
          </div>
          
          <div className="text-slate-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} UPF Fès - DSI (Direction des Systèmes d'Information).
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 xl:p-24 relative bg-white">
        
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded bg-slate-900 flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-upf-gold" />
            </div>
            <span className="font-outfit font-bold text-xl text-slate-900">UPF Admin</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-10">
              <h2 className="text-3xl font-outfit font-bold text-slate-900 mb-2">Authentification DSI</h2>
              <p className="text-sm text-slate-500">
                Veuillez saisir vos identifiants administrateur. Une authentification multi-facteurs (MFA) sera requise à l'étape suivante.
              </p>
            </div>

              {error && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 mb-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Identifiant Super Admin</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50"
                    placeholder="admin.name@upf.ac.ma"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-slate-700">Clé d'Accès (Mot de passe)</label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50"
                    placeholder="••••••••••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-lg transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Authentification en cours...</>
                  ) : (
                    <><LockClosedIcon className="w-5 h-5 text-upf-gold" /> Initialiser la connexion sécurisée</>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-800 leading-relaxed">
                <strong>Avertissement Légal :</strong> L'accès à ce portail est strictement réservé au personnel autorisé de la DSI de l'UPF. 
                L'adresse IP <strong>{window.location.hostname}</strong> est actuellement scannée et enregistrée dans le journal d'audit.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
