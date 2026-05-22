import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BuildingOffice2Icon, 
  AcademicCapIcon, 
  ChartBarIcon, 
  BeakerIcon,
  ScaleIcon,
  ArrowRightIcon,
  CpuChipIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  PlayIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const LandingPage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-inter selection:bg-upf-primary selection:text-white relative overflow-x-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-upf-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"></div>
      <div className="absolute top-[20%] right-0 w-[400px] h-[400px] bg-upf-accent/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 backdrop-blur-md bg-white/75 border-b border-slate-100/80 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-upf-primary flex items-center justify-center shadow-lg shadow-upf-primary/20 border border-upf-primaryLight/10 flex-shrink-0">
                <AcademicCapIcon className="w-6 h-6 sm:w-7 sm:h-7 text-upf-accent" />
              </div>
              <div className="flex flex-col">
                <span className="font-outfit font-extrabold text-sm sm:text-base md:text-lg lg:text-xl text-slate-900 leading-tight tracking-tight max-w-[170px] sm:max-w-none">
                  Université Privée de Fès
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold text-upf-accent uppercase tracking-widest mt-0.5">
                  Reconnue par l'État
                </span>
              </div>
            </div>
            
            <div className="hidden lg:flex space-x-8 items-center">
              <a href="#facultes" className="text-sm font-semibold text-slate-600 hover:text-upf-primary hover:bg-slate-50 px-3 py-2 rounded-lg transition-all duration-200">Nos Facultés</a>
              <a href="#smart-upf" className="text-sm font-semibold text-slate-600 hover:text-upf-primary hover:bg-slate-50 px-3 py-2 rounded-lg transition-all duration-200">Plateforme SMART</a>
              <a href="#admissions" className="text-sm font-semibold text-slate-600 hover:text-upf-primary hover:bg-slate-50 px-3 py-2 rounded-lg transition-all duration-200">Admissions</a>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <a href="/login" className="hidden lg:inline-flex text-sm font-bold text-upf-primary hover:text-upf-accent transition-colors py-2 px-3 rounded-lg hover:bg-upf-primary/5">
                Espace Étudiant
              </a>
              <a href="/login" className="bg-upf-primary hover:bg-upf-primaryLight text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 shadow-md shadow-upf-primary/10 hover:shadow-lg hover:shadow-upf-primary/20 flex items-center gap-1.5 sm:gap-2 group transform active:scale-95">
                Candidature <ArrowRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-upf-primary hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-20 left-0 w-full bg-white border-b border-slate-100 shadow-lg z-40 lg:hidden overflow-hidden"
          >
            <div className="px-6 py-6 space-y-4 flex flex-col font-medium">
              <a 
                href="#facultes" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base text-slate-700 hover:text-upf-primary hover:bg-slate-50 px-4 py-3 rounded-xl transition-all duration-200"
              >
                Nos Facultés
              </a>
              <a 
                href="#smart-upf" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base text-slate-700 hover:text-upf-primary hover:bg-slate-50 px-4 py-3 rounded-xl transition-all duration-200"
              >
                Plateforme SMART
              </a>
              <a 
                href="#admissions" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base text-slate-700 hover:text-upf-primary hover:bg-slate-50 px-4 py-3 rounded-xl transition-all duration-200"
              >
                Admissions
              </a>
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                <a 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center text-sm font-bold text-upf-primary border border-upf-primary/20 py-3 rounded-xl hover:bg-upf-primary/5 transition-all"
                >
                  Espace Étudiant
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-36 overflow-hidden bg-white/40 backdrop-blur-[2px] border-b border-slate-100 flex flex-col justify-between">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10"></div>
          <img 
            src="/hero-campus.png" 
            alt="Campus UPF" 
            className="w-full h-full object-cover object-right opacity-30 mix-blend-multiply"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-upf-primary/5 border border-upf-primary/10 text-upf-primary font-bold text-[10px] sm:text-[11px] uppercase tracking-widest mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-upf-accent animate-pulse"></span>
                Inscriptions Ouvertes 2026-2027
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-outfit font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
                L'Excellence Académique <br/>
                à l'ère <span className="text-transparent bg-clip-text bg-gradient-to-r from-upf-primary to-upf-accent">Numérique</span>.
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl font-normal">
                Rejoignez la première université marocaine équipée d'un système d'exploitation académique intelligent (<span className="font-semibold text-slate-900">SMART UPF</span>). 
                L'alliance parfaite entre l'excellence pédagogique traditionnelle et l'innovation technologique de rupture.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-16 md:mb-0">
                <a href="#facultes" className="bg-upf-primary hover:bg-upf-primaryLight text-white px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 shadow-xl shadow-upf-primary/20 hover:shadow-2xl hover:shadow-upf-primary/30 flex items-center justify-center gap-2 transform active:scale-98">
                  Découvrir nos Diplômes
                </a>
                <button className="bg-white border border-slate-200 hover:border-upf-primary hover:bg-slate-50 text-slate-800 px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 group shadow-sm transform active:scale-98">
                  <PlayIcon className="w-5 h-5 text-upf-accent group-hover:text-upf-primary transition-colors duration-300" />
                  Visite Virtuelle
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="relative md:absolute md:bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 py-6 md:py-8 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="px-2 sm:px-6 border-r border-slate-100">
                <p className="text-2xl sm:text-3xl font-outfit font-black text-upf-primary">5</p>
                <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Établissements</p>
              </div>
              <div className="px-2 sm:px-6 md:border-r border-slate-100">
                <p className="text-2xl sm:text-3xl font-outfit font-black text-upf-primary">Reconnue</p>
                <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Par l'État Marocain</p>
              </div>
              <div className="px-2 sm:px-6 border-r border-slate-100">
                <p className="text-2xl sm:text-3xl font-outfit font-black text-upf-primary">100%</p>
                <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Équivalence Public</p>
              </div>
              <div className="px-2 sm:px-6">
                <p className="text-2xl sm:text-3xl font-outfit font-black text-upf-primary">4.0</p>
                <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Campus Intelligent</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facultés Section */}
      <section id="facultes" className="py-28 bg-slate-50/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="text-xs font-bold text-upf-accent uppercase tracking-widest mb-3">Formations de Pointe</div>
              <h2 className="text-4xl lg:text-5xl font-outfit font-extrabold text-slate-900 tracking-tight">
                Nos Pôles d'Excellence
              </h2>
              <p className="text-slate-500 text-lg mt-4 font-normal leading-relaxed">
                Des formations de pointe (Licence, Master, Ingénieur d'État) structurées selon le système LMD, conçues pour répondre aux exigences du marché national et international.
              </p>
            </div>
            <a href="/login" className="text-upf-primary font-bold hover:text-upf-accent transition-colors mt-4 md:mt-0 flex items-center gap-1.5 text-sm group">
              Tous nos diplômes <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FacultyCard 
              code="FSI"
              name="Faculté des Sciences de l'Ingénieur"
              icon={<CpuChipIcon className="w-8 h-8 text-upf-primary" />}
              desc="Génie Informatique, Génie Civil, Systèmes Énergétiques, Intelligence Artificielle et Systèmes Embarqués."
            />
            <FacultyCard 
              code="FBS"
              name="Fès Business School"
              icon={<ChartBarIcon className="w-8 h-8 text-upf-primary" />}
              desc="Finance d'Entreprise, Marketing Digital, Management des RH, Comptabilité Contrôle et Audit (CCA)."
            />
            <FacultyCard 
              code="ESMAB"
              name="École Supérieure des Métiers de l'Architecture"
              icon={<BuildingOffice2Icon className="w-8 h-8 text-upf-primary" />}
              desc="Architecture d'intérieur, Urbanisme, Aménagement Paysager et Design Innovant."
            />
            <FacultyCard 
              code="FSPTS"
              name="Sciences Paramédicales & Santé"
              icon={<BeakerIcon className="w-8 h-8 text-upf-primary" />}
              desc="Sciences Infirmières, Anesthésie-Réanimation, Laboratoire Biomédical, Diététique."
            />
            <FacultyCard 
              code="IHEJS"
              name="Hautes Études Juridiques et Sociales"
              icon={<ScaleIcon className="w-8 h-8 text-upf-primary" />}
              desc="Droit des Affaires, Notariat, Sciences Politiques, Relations Internationales."
            />
          </div>
        </div>
      </section>

      {/* SMART UPF Platform Section */}
      <section id="smart-upf" className="py-28 bg-white border-y border-slate-100 relative overflow-hidden">
        {/* Glow background */}
        <div className="absolute right-0 bottom-0 w-[600px] h-[600px] bg-upf-primary/5 rounded-full blur-3xl pointer-events-none z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div className="relative rounded-3xl overflow-hidden shadow-glass border border-slate-100 group p-2 bg-slate-50/50">
              <div className="absolute inset-0 bg-gradient-to-t from-upf-primary/20 to-transparent mix-blend-multiply z-10 rounded-[22px] pointer-events-none"></div>
              <img 
                src="/features-bg.png" 
                alt="Smart UPF Analytics" 
                className="w-full h-full object-cover rounded-[22px] transform group-hover:scale-102 transition-transform duration-700" 
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-upf-accent/5 border border-upf-accent/10 text-upf-accent font-bold text-[10px] uppercase tracking-widest mb-6">
                Innovation Pédagogique Majeure
              </div>
              <h2 className="text-3xl lg:text-4xl font-outfit font-extrabold text-slate-900 mb-6 tracking-tight">
                Découvrez SMART UPF : <br/>L'Écosystème Intelligent
              </h2>
              <p className="text-slate-500 text-lg mb-10 leading-relaxed">
                L'Université Privée de Fès se dote d'une infrastructure digitale inédite. 
                Une plateforme unifiée qui orchestre toute votre vie étudiante avec fluidité, simplicité et sécurité renforcée.
              </p>
              
              <ul className="space-y-8">
                <li className="flex gap-4">
                  <div className="mt-1 w-12 h-12 rounded-2xl bg-upf-primary/5 border border-upf-primary/10 flex flex-shrink-0 items-center justify-center">
                    <AcademicCapIcon className="w-6 h-6 text-upf-primary" />
                  </div>
                  <div>
                    <h4 className="font-outfit font-bold text-slate-900 text-lg tracking-tight">Gestion Académique Intégrée</h4>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">Suivi centralisé du système LMD : relevés de notes en temps réel, alertes d'absences, emplois du temps dynamiques.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 w-12 h-12 rounded-2xl bg-upf-accent/5 border border-upf-accent/10 flex flex-shrink-0 items-center justify-center">
                    <GlobeAltIcon className="w-6 h-6 text-upf-accent" />
                  </div>
                  <div>
                    <h4 className="font-outfit font-bold text-slate-900 text-lg tracking-tight">Jumeau Numérique & Simulateurs VR</h4>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">Entraînez-vous virtuellement aux oraux ou visitez les laboratoires depuis votre espace, grâce à la réalité virtuelle et au jumeau 3D.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-shrink-0 items-center justify-center">
                    <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-outfit font-bold text-slate-900 text-lg tracking-tight">Sécurité Zero-Trust Intransigeante</h4>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">La confidentialité absolue de vos données, sécurisée par une architecture de protection avancée et traçabilité d'audits.</p>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-upf-primary pt-24 pb-12 border-t-[6px] border-upf-accent relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-20">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                  <AcademicCapIcon className="w-6 h-6 text-upf-accent" />
                </div>
                <span className="font-outfit font-extrabold text-2xl text-white tracking-tight">UPF Fès</span>
              </div>
              <p className="text-blue-100/70 text-sm leading-relaxed max-w-sm mb-6 font-normal">
                L'Université Privée de Fès est une institution supérieure d'excellence reconnue par l'État marocain, 
                délivrant des diplômes équivalents au secteur public dans les filières porteuses de l'ingénierie, du management, de la santé, du droit et de l'architecture.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-outfit font-extrabold text-base tracking-wider uppercase mb-6">Candidats</h4>
              <ul className="space-y-3.5 text-sm text-blue-200/80 font-medium">
                <li><a href="#" className="hover:text-upf-accent transition-colors">Conditions d'admission</a></li>
                <li><a href="#" className="hover:text-upf-accent transition-colors">Frais de scolarité</a></li>
                <li><a href="#" className="hover:text-upf-accent transition-colors">Système de Bourses</a></li>
                <li><a href="#" className="hover:text-upf-accent transition-colors">Étudiants Internationaux</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-outfit font-extrabold text-base tracking-wider uppercase mb-6">Contact & Accès</h4>
              <ul className="space-y-4 text-sm text-blue-200/80 font-medium">
                <li className="flex gap-2.5 items-start"><span className="text-upf-accent text-base">📍</span> Lotissement Oued Fès, Fès, Maroc</li>
                <li className="flex gap-2.5 items-center"><span className="text-upf-accent text-base">✉️</span> contact@upf.ac.ma</li>
                <li className="flex gap-2.5 items-center"><span className="text-upf-accent text-base">📞</span> +212 (0) 535 610 320</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-blue-200/60 text-sm font-medium">
              &copy; {new Date().getFullYear()} Université Privée de Fès. Tous droits réservés.
            </p>
            <div className="flex gap-6 text-sm text-blue-200/60 font-semibold">
              <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
              <a href="/login" className="hover:text-white text-white font-bold transition-colors">Portail SMART UPF</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Sub-components
const FacultyCard = ({ code, name, icon, desc }: { code: string, name: string, icon: React.ReactNode, desc: string }) => {
  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-glass hover:shadow-upf-primary/5 transition-all duration-300 group cursor-pointer flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex items-start justify-between mb-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 group-hover:bg-upf-primary/5 flex items-center justify-center transition-colors duration-300 border border-slate-100 group-hover:border-upf-primary/10">
            {icon}
          </div>
          <span className="text-[10px] font-bold text-upf-accent bg-upf-accent/5 border border-upf-accent/10 px-3 py-1 rounded-full uppercase tracking-wider">{code}</span>
        </div>
        <h3 className="text-xl font-outfit font-bold text-slate-900 mb-3 group-hover:text-upf-primary transition-colors duration-300 tracking-tight leading-snug">{name}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-8 font-normal">{desc}</p>
      </div>
      <div className="flex items-center text-sm font-bold text-upf-primary group-hover:text-upf-primaryLight transition-all">
        En savoir plus <ArrowRightIcon className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </motion.div>
  );
};

export default LandingPage;
