import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

interface SuperAdminGuardProps {
  children: React.ReactNode;
}

const SuperAdminGuard: React.FC<SuperAdminGuardProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Not logged in at all → redirect to admin login page
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to="/secure-portal-upf-sysadmin" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Logged in but not Super Admin → access denied
  // The role name 'SUPER_ADMIN' must match what is stored in the DB
  if (user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] font-inter relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full max-w-lg p-1"
        >
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl text-center relative overflow-hidden group">
            {/* Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-20">
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  filter: ["drop-shadow(0 0 0px rgba(239, 68, 68, 0))", "drop-shadow(0 0 20px rgba(239, 68, 68, 0.4))", "drop-shadow(0 0 0px rgba(239, 68, 68, 0))"]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 mb-8 shadow-xl shadow-red-500/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-8l-2-2m0 0L10 9m2-2v6m7 0a7 7 0 11-14 0 7 7 0 0114 0z" strokeDasharray="4 4" className="opacity-40" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </motion.div>
              
              <h1 className="text-4xl font-extrabold text-white font-outfit mb-4 tracking-tight">Accès Refusé</h1>
              <div className="h-1 w-16 bg-red-500 mx-auto rounded-full mb-6" />
              
              <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-sm mx-auto">
                Votre compte <span className="text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded-md">{user.email}</span> ne possède pas les privilèges requis pour accéder à la zone d'administration.
              </p>
              
              <motion.a 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="/secure-portal-upf-sysadmin"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-upf-accent to-yellow-500 text-slate-900 font-black px-10 py-4 rounded-2xl shadow-xl shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all duration-300 uppercase tracking-tighter text-sm"
              >
                Retourner au portail Admin
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.a>
            </div>
          </div>
          
          <p className="text-center text-slate-600 text-xs mt-8 font-medium tracking-widest uppercase opacity-40">
            Security Layer v2.4 • Smart UPF Enterprise
          </p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SuperAdminGuard;
