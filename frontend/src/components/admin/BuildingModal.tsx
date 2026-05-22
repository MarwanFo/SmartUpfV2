import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  PhotoIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  DocumentTextIcon,
  TagIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import type { Building } from '../../store/buildingsStore';
import { useAuthStore } from '../../store/authStore';

interface BuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  building?: Building | null;
  isLoading: boolean;
}

const BuildingModal: React.FC<BuildingModalProps> = ({ isOpen, onClose, onSubmit, building, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    description: '',
    logoUrl: '',
    numRooms: 0,
    isActive: true,
  });
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (building) {
      setFormData({
        name: building.name,
        code: building.code,
        address: building.address,
        description: building.description || '',
        logoUrl: building.logoUrl || '',
        numRooms: building.numRooms || 0,
        isActive: building.isActive,
      });
    } else {
      setFormData({ name: '', code: '', address: '', description: '', logoUrl: '', numRooms: 0, isActive: true });
    }
    setError('');
  }, [building, isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const { default: axios } = await import('axios');
      const { accessToken } = useAuthStore.getState();
      
      const response = await axios.post('http://localhost:3001/api/buildings/upload-logo', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      const data = response.data.data || response.data;
      setFormData(prev => ({ ...prev, logoUrl: data.url }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du téléchargement de l\'image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="relative px-7 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <BuildingOffice2Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 font-outfit">
                    {building ? 'Modifier l\'établissement' : 'Nouvel établissement'}
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {building ? `Mise à jour de ${building.code}` : 'Remplissez les informations du pôle académique'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors group">
                <XMarkIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </button>
            </div>
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
                <div className="px-7 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2 text-sm text-red-600 font-medium">
                  <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-7 space-y-6">
            {/* Logo preview */}
            {formData.logoUrl && (
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} className="flex justify-center">
                <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  <img src={formData.logoUrl} alt="Preview" className="w-full h-full object-contain p-2" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <BuildingOffice2Icon className="w-3.5 h-3.5 text-slate-400" /> Nom <span className="text-red-400">*</span>
                </label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Faculté des Sciences de l'Ingénieur"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none transition-all text-sm" />
              </div>

              {/* Code */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <TagIcon className="w-3.5 h-3.5 text-slate-400" /> Code <span className="text-red-400">*</span>
                </label>
                <input type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="FSI"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none transition-all text-sm font-mono font-bold uppercase tracking-widest" />
              </div>

              {/* Address */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <MapPinIcon className="w-3.5 h-3.5 text-slate-400" /> Adresse <span className="text-red-400">*</span>
                </label>
                <input type="text" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Route d'Imouzzer, Fès"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none transition-all text-sm" />
              </div>

              {/* Number of Rooms */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <BuildingOffice2Icon className="w-3.5 h-3.5 text-slate-400" /> Nombre de Salles / Classes <span className="text-red-400">*</span>
                </label>
                <input type="number" required min="0" value={formData.numRooms} onChange={(e) => setFormData({ ...formData, numRooms: parseInt(e.target.value) || 0 })}
                  placeholder="Ex: 15"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none transition-all text-sm" />
              </div>

              {/* Logo URL / Upload */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <PhotoIcon className="w-3.5 h-3.5 text-slate-400" /> Logo (Importer ou URL)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhotoIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input type="url" value={formData.logoUrl || ''} onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      placeholder="https://votre-site.com/logo.png"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none transition-all text-sm" />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors border border-slate-200 flex items-center justify-center min-w-[120px]"
                  >
                    {isUploading ? 'Envoi...' : 'Parcourir'}
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <DocumentTextIcon className="w-3.5 h-3.5 text-slate-400" /> Description
                </label>
                <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
                  placeholder="Décrivez brièvement cet établissement…"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none transition-all text-sm resize-none" />
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-700">Statut de l'établissement</p>
                <p className="text-xs text-slate-500 mt-0.5">{formData.isActive ? 'Visible et opérationnel' : 'Masqué et désactivé'}</p>
              </div>
              <button type="button" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${formData.isActive ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all active:scale-[0.98]">
                Annuler
              </button>
              <button type="submit" disabled={isLoading}
                className="flex-[2] inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 active:scale-[0.98]">
                {isLoading ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Enregistrement…</>
                ) : (
                  <><CheckIcon className="w-4 h-4" /> {building ? 'Mettre à jour' : 'Créer l\'établissement'}</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BuildingModal;

