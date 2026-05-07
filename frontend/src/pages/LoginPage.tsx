import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AcademicCapIcon, 
  UserIcon, 
  UsersIcon, 
  BriefcaseIcon,
  ArrowRightIcon,
  LockClosedIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

type RoleType = 'etudiant' | 'professeur' | 'parent';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [activeRole, setActiveRole] = useState<RoleType>('etudiant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(email, password);
      toast.success('Connexion réussie !');
      
      const currentUser = useAuthStore.getState().user;
      
      if (currentUser?.role === 'PROFESSEUR') {
        navigate('/prof/dashboard');
      } else if (currentUser?.role === 'SUPER_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/prof/dashboard'); 
      }
    } catch (err: any) {
      const msg = err.message || 'Identifiants incorrects.';
      toast.error(msg);
    }
  };

  const roleConfig = {
    etudiant: {
      title: "Espace Étudiant",
      desc: "Accédez à vos cours, notes, et votre emploi du temps.",
      icon: <UserIcon className="w-5 h-5" />
    },
    professeur: {
      title: "Espace Professeur",
      desc: "Gérez vos classes, saisissez les notes et ressources.",
      icon: <BriefcaseIcon className="w-5 h-5" />
    },
    parent: {
      title: "Espace Parent",
      desc: "Suivez la scolarité et les performances de vos enfants.",
      icon: <UsersIcon className="w-5 h-5" />
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-inter flex">
      {/* Left Panel - Image & Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-upf-blue overflow-hidden">
        <div className="absolute inset-0 bg-upf-blue/80 mix-blend-multiply z-10"></div>
        <img 
          src="/login-bg.png" 
          alt="UPF Architecture" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="relative z-20 flex flex-col justify-between h-full p-16">
          <Link to="/" className="flex items-center gap-3 w-max hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 rounded bg-white flex items-center justify-center">
              <AcademicCapIcon className="w-7 h-7 text-upf-gold" />
            </div>
            <span className="font-outfit font-bold text-2xl text-white">UPF Fès</span>
          </Link>

          <div>
            <div className="inline-block px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white text-xs font-semibold tracking-wider uppercase mb-6">
              Portail SMART UPF
            </div>
            <h1 className="text-4xl xl:text-5xl font-outfit font-extrabold text-white leading-tight mb-6">
              Votre parcours académique, <br />
              Centralisé & Sécurisé.
            </h1>
            <p className="text-blue-100 text-lg max-w-md font-light leading-relaxed">
              Connectez-vous à l'écosystème numérique de l'Université Privée de Fès pour accéder à l'ensemble de vos services administratifs et pédagogiques.
            </p>
          </div>
          
          <div className="text-blue-200 text-sm font-medium">
            &copy; {new Date().getFullYear()} Université Privée de Fès.
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 xl:p-24 relative">
        <Link to="/" className="absolute top-8 right-8 text-sm font-semibold text-slate-500 hover:text-upf-blue transition-colors">
          Retour à l'accueil
        </Link>
        
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded bg-upf-blue flex items-center justify-center">
              <AcademicCapIcon className="w-6 h-6 text-upf-gold" />
            </div>
            <span className="font-outfit font-bold text-xl text-slate-900">UPF Fès</span>
          </div>

          <h2 className="text-3xl font-outfit font-bold text-slate-900 mb-2">Bienvenue</h2>
          <p className="text-slate-500 mb-10">Veuillez sélectionner votre profil pour vous connecter.</p>

          {/* Role Selection Tabs */}
          <div className="bg-slate-100 p-1.5 rounded-xl flex gap-1 mb-10">
            {(Object.keys(roleConfig) as RoleType[]).map((role) => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold flex flex-col sm:flex-row items-center justify-center gap-2 transition-all duration-200 ${
                  activeRole === role 
                    ? 'bg-white text-upf-blue shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {roleConfig[role].icon}
                <span className="capitalize">{role}</span>
              </button>
            ))}
          </div>

          <motion.div
            key={activeRole}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <h3 className="text-xl font-bold font-outfit text-slate-900 mb-2">{roleConfig[activeRole].title}</h3>
              <p className="text-sm text-slate-500">{roleConfig[activeRole].desc}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-semibold text-center">
                  Identifiants incorrects.
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Adresse Email Universitaire</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-upf-blue focus:border-transparent transition-all"
                    placeholder={`identifiant@${activeRole === 'etudiant' ? 'etu.' : ''}upf.ac.ma`}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-slate-700">Mot de passe</label>
                  <a href="#" className="text-sm font-semibold text-upf-blue hover:text-upf-gold transition-colors">
                    Oublié ?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-upf-blue focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-upf-blue hover:bg-slate-900 text-white font-semibold py-3.5 px-4 rounded-lg transition-all shadow-lg shadow-upf-blue/20 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
              >
                {isLoading ? 'Connexion...' : "Se connecter à l'espace"}
                {!isLoading && <ArrowRightIcon className="w-5 h-5" />}
              </button>
            </form>

            {activeRole === 'etudiant' && (
              <div className="mt-8 text-center text-sm text-slate-500">
                Vous n'avez pas de compte ? <a href="#" className="font-semibold text-upf-blue hover:text-upf-gold transition-colors">Démarrez votre inscription</a>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
