import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
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
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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
      } else if (currentUser?.role === 'ETUDIANT') {
        navigate('/student/dashboard');
      } else {
        navigate('/login'); 
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
      icon: <UserIcon className="w-5 h-5 transition-colors" />
    },
    professeur: {
      title: "Espace Professeur",
      desc: "Gérez vos classes, saisissez les notes et ressources.",
      icon: <BriefcaseIcon className="w-5 h-5 transition-colors" />
    },
    parent: {
      title: "Espace Parent",
      desc: "Suivez la scolarité et les performances de vos enfants.",
      icon: <UsersIcon className="w-5 h-5 transition-colors" />
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-inter flex relative overflow-hidden">
      {/* Background visual details */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-upf-primary/5 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-1/2 w-[350px] h-[350px] bg-upf-accent/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* Left Panel - Image & Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-upf-primary overflow-hidden items-stretch">
        <div className="absolute inset-0 bg-gradient-to-t from-upf-primary via-upf-primary/80 to-upf-primary/30 z-10"></div>
        <img 
          src="/login-bg.png" 
          alt="UPF Architecture" 
          className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-[8000ms] ease-out mix-blend-overlay"
        />
        
        <div className="relative z-20 flex flex-col justify-between h-full w-full p-16">
          <Link to="/" className="inline-block bg-white py-2 px-3.5 rounded-xl shadow-lg hover:opacity-90 transition-opacity w-max">
            <img src="/logo_upf.png" alt="UPF Université" className="h-8 w-auto object-contain" />
          </Link>

          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase mb-8 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Portail SMART UPF
            </div>
            <h1 className="text-4xl xl:text-5xl font-outfit font-black text-white leading-tight mb-6 tracking-tight">
              Votre parcours académique, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Centralisé & Sécurisé.</span>
            </h1>
            <p className="text-blue-100/80 text-lg font-normal leading-relaxed">
              Connectez-vous à l'écosystème numérique de l'UPF Université pour accéder à l'ensemble de vos services administratifs et pédagogiques.
            </p>
          </div>
          
          <div className="text-blue-200/50 text-xs font-semibold">
            &copy; {new Date().getFullYear()} UPF Université. Tous droits réservés.
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 xl:p-24 relative z-10">
        <Link to="/" className="absolute top-4 right-4 sm:top-8 sm:right-8 text-xs sm:text-sm font-bold text-slate-500 hover:text-upf-primary transition-colors py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-lg hover:bg-slate-100 flex items-center gap-1 group z-20">
          Retour à l'accueil
        </Link>
        
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="inline-block">
              <img src="/logo_upf.png" alt="UPF Université" className="h-9 w-auto object-contain" />
            </Link>
          </div>

          <h2 className="text-3xl font-outfit font-black text-slate-900 mb-2 tracking-tight">Bienvenue</h2>
          <p className="text-slate-500 font-medium text-sm mb-10">Veuillez sélectionner votre profil pour vous connecter.</p>

          {/* Role Selection Tabs */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 mb-10 border border-slate-200/20 relative">
            {(Object.keys(roleConfig) as RoleType[]).map((role) => {
              const isSelected = activeRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setActiveRole(role)}
                  className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-2 transition-all duration-300 relative z-10 ${
                    isSelected 
                      ? 'text-upf-primary' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {isSelected && (
                    <motion.div 
                      layoutId="activeRoleTab"
                      className="absolute inset-0 bg-white rounded-xl shadow-md border border-slate-200/20"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-20 flex items-center gap-2 capitalize">
                    {roleConfig[role].icon}
                    {role}
                  </span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-8">
                <h3 className="text-xl font-black font-outfit text-slate-900 mb-1.5 tracking-tight">{roleConfig[activeRole].title}</h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">{roleConfig[activeRole].desc}</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-xl bg-semantic-danger/5 border border-semantic-danger/10 text-semantic-danger text-xs font-bold text-center">
                    Identifiants incorrects ou session expirée.
                  </div>
                )}
                
                <div className="space-y-2">
                  <Input
                    label="Adresse Email Universitaire"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`identifiant@${activeRole === 'etudiant' ? 'etu.' : ''}upf.ac.ma`}
                    leftIcon={<EnvelopeIcon className="h-5 w-5 text-slate-400" />}
                    className="focus:ring-upf-primary focus:border-upf-primary rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <span />
                    <a href="#" className="text-xs font-bold text-upf-primary hover:text-upf-accent transition-colors">
                      Mot de passe oublié ?
                    </a>
                  </div>
                  <Input
                    label="Mot de passe"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    leftIcon={<LockClosedIcon className="h-5 w-5 text-slate-400" />}
                    className="focus:ring-upf-primary focus:border-upf-primary rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-8 py-4 bg-upf-primary hover:bg-upf-primaryLight text-white rounded-xl font-bold text-sm shadow-lg shadow-upf-primary/10 hover:shadow-xl hover:shadow-upf-primary/20 transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-2"
                  isLoading={isLoading}
                >
                  {!isLoading && (
                    <>
                      Se connecter <ArrowRightIcon className="w-4 h-4 ml-1" />
                    </>
                  )}
                  {isLoading && 'Connexion en cours...'}
                </Button>
              </form>

              {activeRole === 'etudiant' && (
                <div className="mt-8 text-center text-xs text-slate-500 font-semibold leading-relaxed">
                  Vous n'avez pas de compte ? <a href="#" className="font-bold text-upf-primary hover:text-upf-accent transition-colors">Démarrez votre inscription en ligne</a>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
