import React from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

const ParametresPage: React.FC = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-outfit font-bold text-slate-900">Paramètres</h2>
          <p className="text-sm text-slate-500 mt-1">Configuration générale de la plateforme Smart UPF</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
        <Cog6ToothIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Module en cours de développement</h3>
        <p className="text-slate-400 max-w-md mx-auto">
          Les paramètres système (SMTP, sécurité, thème, maintenance) seront disponibles dans la prochaine mise à jour.
        </p>
      </div>
    </div>
  );
};

export default ParametresPage;

