import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 font-inter">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-outfit font-extrabold text-slate-200">404</h1>
        <h2 className="text-2xl font-bold text-slate-900 mt-4 mb-2">Page Introuvable</h2>
        <p className="text-slate-500 mb-8">
          La page que vous recherchez n'existe pas, a été déplacée ou est temporairement indisponible.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-upf-primary hover:bg-slate-900 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          <HomeIcon className="w-5 h-5" />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
