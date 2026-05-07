import React from 'react';
import { motion } from 'framer-motion';
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
  PlayIcon
} from '@heroicons/react/24/outline';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-inter selection:bg-upf-blue selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 glass-panel border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-upf-blue flex items-center justify-center shadow-lg">
                <AcademicCapIcon className="w-7 h-7 text-upf-gold" />
              </div>
              <div className="flex flex-col">
                <span className="font-outfit font-bold text-xl text-slate-900 leading-tight">
                  Université Privée de Fès
                </span>
                <span className="text-xs font-semibold text-upf-gold uppercase tracking-wider">
                  Reconnue par l'État
                </span>
              </div>
            </div>
            
            <div className="hidden lg:flex space-x-8 items-center">
              <a href="#facultes" className="text-sm font-semibold text-slate-600 hover:text-upf-blue transition-colors">Nos Facultés</a>
              <a href="#smart-upf" className="text-sm font-semibold text-slate-600 hover:text-upf-blue transition-colors">Plateforme SMART</a>
              <a href="#admissions" className="text-sm font-semibold text-slate-600 hover:text-upf-blue transition-colors">Admissions</a>
            </div>

            <div className="flex items-center space-x-4">
              <a href="/login" className="hidden md:inline-flex text-sm font-semibold text-upf-blue hover:text-upf-gold transition-colors">
                Espace Étudiant
              </a>
              <button className="bg-upf-blue hover:bg-slate-900 text-white px-6 py-2.5 rounded-md text-sm font-semibold transition-all shadow-md flex items-center gap-2 group">
                Candidature <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/30 z-10"></div>
          <img 
            src="/hero-campus.png" 
            alt="Campus UPF" 
            className="w-full h-full object-cover object-right opacity-40 mix-blend-multiply"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-upf-blue/5 border border-upf-blue/10 text-upf-blue font-bold text-xs uppercase tracking-widest mb-6">
                <span className="w-2 h-2 rounded-full bg-upf-gold"></span>
                Inscriptions Ouvertes 2026-2027
              </div>
              <h1 className="text-5xl lg:text-7xl font-outfit font-extrabold text-slate-900 leading-[1.1] mb-6">
                L'Excellence Académique <br/>
                à l'ère <span className="text-upf-blue">Numérique</span>.
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl">
                Rejoignez la première université marocaine équipée d'un système d'exploitation académique intelligent (SMART UPF). 
                L'alliance parfaite entre l'excellence pédagogique traditionnelle et l'innovation technologique de rupture.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-upf-blue hover:bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold text-base transition-all shadow-xl shadow-upf-blue/20 flex items-center justify-center gap-2">
                  Découvrir nos Diplômes
                </button>
                <button className="bg-white border-2 border-gray-200 hover:border-upf-blue text-slate-800 px-8 py-4 rounded-lg font-semibold text-base transition-all flex items-center justify-center gap-2 group">
                  <PlayIcon className="w-5 h-5 text-upf-gold group-hover:text-upf-blue transition-colors" />
                  Visite Virtuelle
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 py-8 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-4 gap-8 divide-x divide-gray-100">
              <div className="px-6">
                <p className="text-3xl font-outfit font-extrabold text-upf-blue">5</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mt-1">Établissements</p>
              </div>
              <div className="px-6">
                <p className="text-3xl font-outfit font-extrabold text-upf-blue">Reconnue</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mt-1">Par l'État Marocain</p>
              </div>
              <div className="px-6">
                <p className="text-3xl font-outfit font-extrabold text-upf-blue">100%</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mt-1">Équivalence au Public</p>
              </div>
              <div className="px-6">
                <p className="text-3xl font-outfit font-extrabold text-upf-blue">4.0</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mt-1">Campus Intelligent</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facultés Section */}
      <section id="facultes" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div className="max-w-2xl">
              <h2 className="text-3xl lg:text-4xl font-outfit font-extrabold text-slate-900 mb-4">
                Nos Pôles d'Excellence
              </h2>
              <p className="text-slate-600 text-lg">
                Des formations de pointe (Licence, Master, Ingénieur d'État) structurées selon le système LMD, conçues pour répondre aux exigences du marché national et international.
              </p>
            </div>
            <a href="/programmes" className="text-upf-blue font-bold hover:text-upf-gold transition-colors mt-4 md:mt-0 flex items-center gap-1">
              Tous nos diplômes <ArrowRightIcon className="w-4 h-4" />
            </a>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FacultyCard 
              code="FSI"
              name="Faculté des Sciences de l'Ingénieur"
              icon={<CpuChipIcon className="w-8 h-8 text-upf-blue" />}
              desc="Génie Informatique, Génie Civil, Systèmes Énergétiques, Intelligence Artificielle et Systèmes Embarqués."
            />
            <FacultyCard 
              code="FBS"
              name="Fès Business School"
              icon={<ChartBarIcon className="w-8 h-8 text-upf-blue" />}
              desc="Finance d'Entreprise, Marketing Digital, Management des RH, Comptabilité Contrôle et Audit (CCA)."
            />
            <FacultyCard 
              code="ESMAB"
              name="École Supérieure des Métiers de l'Architecture"
              icon={<BuildingOffice2Icon className="w-8 h-8 text-upf-blue" />}
              desc="Architecture d'intérieur, Urbanisme, Aménagement Paysager et Design Innovant."
            />
            <FacultyCard 
              code="FSPTS"
              name="Sciences Paramédicales & Santé"
              icon={<BeakerIcon className="w-8 h-8 text-upf-blue" />}
              desc="Sciences Infirmières, Anesthésie-Réanimation, Laboratoire Biomédical, Diététique."
            />
            <FacultyCard 
              code="IHEJS"
              name="Hautes Études Juridiques et Sociales"
              icon={<ScaleIcon className="w-8 h-8 text-upf-blue" />}
              desc="Droit des Affaires, Notariat, Sciences Politiques, Relations Internationales."
            />
          </div>
        </div>
      </section>

      {/* SMART UPF Platform Section */}
      <section id="smart-upf" className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
              <div className="absolute inset-0 bg-upf-blue/10 mix-blend-multiply z-10"></div>
              <img src="/features-bg.png" alt="Smart UPF Analytics" className="w-full h-full object-cover" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-upf-gold/10 text-[#B8860B] font-bold text-xs uppercase tracking-widest mb-6">
                Innovation Pédagogique Majeure
              </div>
              <h2 className="text-3xl lg:text-4xl font-outfit font-extrabold text-slate-900 mb-6">
                Découvrez SMART UPF : L'Écosystème Intelligent
              </h2>
              <p className="text-slate-600 text-lg mb-8">
                L'Université Privée de Fès se dote d'une infrastructure digitale inédite. 
                Une plateforme unifiée qui orchestre toute votre vie étudiante avec fluidité et sécurité.
              </p>
              
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="mt-1 w-10 h-10 rounded-full bg-upf-blue/10 flex flex-shrink-0 items-center justify-center">
                    <AcademicCapIcon className="w-5 h-5 text-upf-blue" />
                  </div>
                  <div>
                    <h4 className="font-outfit font-bold text-slate-900 text-lg">Gestion Académique Intégrée</h4>
                    <p className="text-slate-600 text-sm mt-1">Suivi centralisé du système LMD : relevés de notes en temps réel, alertes d'absences, emplois du temps dynamiques.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 w-10 h-10 rounded-full bg-upf-gold/20 flex flex-shrink-0 items-center justify-center">
                    <GlobeAltIcon className="w-5 h-5 text-[#B8860B]" />
                  </div>
                  <div>
                    <h4 className="font-outfit font-bold text-slate-900 text-lg">Jumeau Numérique & Simulateurs VR</h4>
                    <p className="text-slate-600 text-sm mt-1">Entraînez-vous virtuellement aux oraux ou visitez les laboratoires depuis votre espace, grâce à la réalité virtuelle et au jumeau 3D.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 w-10 h-10 rounded-full bg-emerald-50 flex flex-shrink-0 items-center justify-center border border-emerald-100">
                    <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-outfit font-bold text-slate-900 text-lg">Sécurité Zero-Trust Intransigeante</h4>
                    <p className="text-slate-600 text-sm mt-1">La confidentialité absolue de vos données, sécurisée par une architecture de protection avancée et traçabilité d'audits.</p>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-upf-blue pt-20 pb-10 border-t-[6px] border-upf-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded bg-white flex items-center justify-center">
                  <AcademicCapIcon className="w-6 h-6 text-upf-gold" />
                </div>
                <span className="font-outfit font-extrabold text-2xl text-white">UPF Fès</span>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed max-w-sm mb-6">
                L'Université Privée de Fès est une institution supérieure d'excellence reconnue par l'État marocain, 
                délivrant des diplômes équivalents au secteur public dans les filières porteuses de l'ingénierie, du management, de la santé, du droit et de l'architecture.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-outfit font-bold mb-6">Candidats</h4>
              <ul className="space-y-3 text-sm text-blue-200">
                <li><a href="#" className="hover:text-upf-gold transition-colors">Conditions d'admission</a></li>
                <li><a href="#" className="hover:text-upf-gold transition-colors">Frais de scolarité</a></li>
                <li><a href="#" className="hover:text-upf-gold transition-colors">Système de Bourses</a></li>
                <li><a href="#" className="hover:text-upf-gold transition-colors">Étudiants Internationaux</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-outfit font-bold mb-6">Contact & Accès</h4>
              <ul className="space-y-3 text-sm text-blue-200">
                <li className="flex gap-2"><span className="text-upf-gold">📍</span> Lotissement Oued Fès, Fès, Maroc</li>
                <li className="flex gap-2"><span className="text-upf-gold">✉️</span> contact@upf.ac.ma</li>
                <li className="flex gap-2"><span className="text-upf-gold">📞</span> +212 (0) 535 610 320</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-blue-200 text-sm font-medium">
              &copy; {new Date().getFullYear()} Université Privée de Fès. Tous droits réservés.
            </p>
            <div className="flex gap-6 text-sm text-blue-200">
              <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
              <a href="/login" className="hover:text-white font-bold transition-colors">Portail SMART UPF</a>
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
      whileHover={{ y: -5 }}
      className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-xl hover:shadow-upf-blue/10 transition-all group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-16 h-16 rounded-xl bg-slate-50 group-hover:bg-upf-blue/5 flex items-center justify-center transition-colors">
          {icon}
        </div>
        <span className="text-xs font-bold text-upf-gold bg-upf-gold/10 px-2.5 py-1 rounded-md">{code}</span>
      </div>
      <h3 className="text-lg font-outfit font-bold text-slate-900 mb-3 group-hover:text-upf-blue transition-colors">{name}</h3>
      <p className="text-sm text-slate-600 leading-relaxed mb-6">{desc}</p>
      <div className="flex items-center text-sm font-bold text-upf-blue group-hover:gap-2 transition-all">
        En savoir plus <ArrowRightIcon className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
};

export default LandingPage;
