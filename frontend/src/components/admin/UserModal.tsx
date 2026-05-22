import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CameraIcon, UserIcon, EnvelopeIcon, PhoneIcon, IdentificationIcon, AcademicCapIcon, BriefcaseIcon, PlusIcon, CheckIcon, SparklesIcon, UserGroupIcon, MagnifyingGlassIcon, KeyIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useUsersStore, type User } from '../../store/usersStore';
import { useRolesStore } from '../../store/rolesStore';
import { useBuildingsStore } from '../../store/buildingsStore';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

const API = 'http://localhost:3001/api';

// Reusable multi-select toggle component - UPGRADED PREMIUM VERSION
const MultiSelect: React.FC<{
  label: string;
  icon?: React.ReactNode;
  items: { id: string; name: string; sub?: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
  color: 'blue' | 'amber' | 'emerald' | 'orange' | 'purple' | 'rose';
}> = ({ label, icon, items, selected, onChange, color }) => {
  const [search, setSearch] = useState('');
  
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    (item.sub && item.sub.toLowerCase().includes(search.toLowerCase()))
  );

  const activeColorClasses = {
    blue: 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20',
    amber: 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20',
    emerald: 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20',
    orange: 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/20',
    purple: 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20',
    rose: 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/20',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-tight">
          <span className={`p-1.5 rounded-lg bg-${color}-50 text-${color}-600`}>{icon}</span>
          {label}
        </label>
        {selected.length > 0 && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase bg-${color}-100 text-${color}-700 animate-pulse`}>
            {selected.length} sélectionné(s)
          </span>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <MagnifyingGlassIcon className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${search ? `text-${color}-500` : 'text-slate-400'}`} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`Rechercher un(e) ${label.toLowerCase().replace('(s)', '')}...`}
          className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-${color}-400/50 bg-slate-50/50 hover:bg-white transition-all`}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            &times;
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar p-1">
        {filteredItems.length === 0 && (
          <div className="col-span-full py-6 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
            <p className="text-xs text-slate-400 italic font-medium">
              {search ? `Aucun résultat pour "${search}"` : "Aucun élément disponible"}
            </p>
          </div>
        )}
        {filteredItems.map(item => {
          const active = selected.includes(item.id);
          return (
            <motion.button
              key={item.id}
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggle(item.id)}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 ${
                active ? activeColorClasses[color] : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between w-full gap-2">
                <span className={`text-xs font-bold leading-tight ${active ? 'text-white' : 'text-slate-800'}`}>
                  {item.name}
                </span>
                {active && <CheckIcon className="w-4 h-4 shrink-0 text-white" />}
              </div>
              {item.sub && (
                <span className={`text-[10px] mt-1 font-medium px-1.5 py-0.5 rounded-md ${
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {item.sub}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user }) => {
  const { createUser, updateUser, resetUserPassword } = useUsersStore();
  const { roles, fetchRoles } = useRolesStore();
  const { buildings, fetchBuildings } = useBuildingsStore();
  const { accessToken } = useAuthStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const confirmResetPassword = async () => {
    if (!user) return;
    
    setIsResettingPassword(true);
    setSubmitError(null);
    try {
      const result = await resetUserPassword(user.id);
      const password = result?.data?.tempPassword || result?.tempPassword;
      if (password) {
        setCreatedCredentials({
          email: user.email,
          password: password
        });
        setShowConfirmReset(false);
      }
    } catch (error: any) {
      console.error('[UserModal] Reset password error:', error?.response?.data || error);
      const serverData = error?.response?.data;
      const msg = serverData?.message || error?.message || 'Erreur lors de la réinitialisation';
      setSubmitError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const [formData, setFormData] = useState<any>({
    firstName: '', lastName: '', email: '', phone: '', avatarUrl: '',
    status: 'ACTIVE', roleId: '', buildingId: '',
    // Profil Étudiant
    studentCne: '', studentCin: '', studentGender: 'MALE', studentBirthDate: '', studentBirthPlace: '',
    studentNationality: 'Marocaine', studentAddress: '', studentCity: '',
    studentBacType: '', studentBacYear: new Date().getFullYear(), studentHighSchool: '',
    studentEnrollmentYear: new Date().getFullYear(), studentStatus: 'ENROLLED',
    studentProgramId: '',
    // Profil Professeur
    profCin: '', profGender: 'MALE', profTitle: 'Dr.', profSpeciality: '', profDepartment: '',
    profContract: 'PERMANENT', profHireDate: '', profOffice: '', profHours: '',
    profResearch: '', profBio: '',
    profDepartmentIds: [] as string[],
    profProgramIds: [] as string[],
    profModuleIds: [] as string[],
    // Profil Parent
    parentCin: '', parentGender: 'MALE', parentRelationship: 'FATHER',
    parentProfession: '', parentAddress: '', parentCity: '', parentEmergency: '', parentPrimary: true,
    parentStudentId: '',
    studentLevel: 1
  });

  // Data for selects
  const [students, setStudents] = useState<{id:string;name:string;cne:string;cin:string}[]>([]);
  const [departments, setDepartments] = useState<{id:string;name:string}[]>([]);
  const [programs, setPrograms] = useState<{id:string;name:string;sub:string;facultyId:string;buildingId?:string;duration:number}[]>([]);
  const [academicModules, setAcademicModules] = useState<{id:string;name:string;sub:string;programIds:string[]}[]>([]);
  // Smart student search
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<{id:string;name:string;cne:string;cin:string} | null>(null);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [isLoadingAcademicData, setIsLoadingAcademicData] = useState(true);
  const [createdCredentials, setCreatedCredentials] = useState<{email: string, password: string} | null>(null);
  const [departmentsType, setDepartmentsType] = useState<'faculty' | 'building'>('faculty');

  useEffect(() => {
    if (isOpen) {
      setIsLoadingAcademicData(true);
      fetchRoles();
      fetchBuildings();
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };

      axios.get(`${API}/users?role=ETUDIANT`, config).then(r => {
        const data = r.data?.data ?? r.data;
        const list = Array.isArray(data) ? data : (data?.items ?? []);
        setStudents(list.map((u: any) => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          cne: u.studentProfile?.cne || '',
          cin: u.studentProfile?.cin || '',
        })));
      }).catch(() => {});

      const fetchAcademicData = async () => {
        setIsLoadingAcademicData(true);
        try {
          const [pRes, fRes, mRes] = await Promise.all([
            axios.get(`${API}/programs`, config),
            axios.get(`${API}/faculties`, config),
            axios.get(`${API}/academic-modules`, config)
          ]);

          // Handle Programs
          const pData = pRes.data?.data ?? pRes.data;
          setPrograms((Array.isArray(pData) ? pData : []).map((p: any) => ({ 
            id: p.id, name: p.name, sub: p.code, facultyId: p.facultyId, buildingId: p.buildingId, duration: p.duration 
          })));

          // Handle Faculties
          const fData = fRes.data?.data ?? fRes.data;
          const faculties = Array.isArray(fData) ? fData : [];
          if (faculties.length > 0) {
            setDepartments(faculties.map((f: any) => ({ id: f.id, name: f.name, sub: f.code })));
            setDepartmentsType('faculty');
          } else {
            const br = await axios.get(`${API}/buildings`, config);
            const bData = br.data?.data ?? br.data;
            setDepartments((Array.isArray(bData) ? bData : []).map((b: any) => ({ id: b.id, name: b.name, sub: b.code || 'Bâtiment' })));
            setDepartmentsType('building');
          }

          // Handle Modules
          const mData = mRes.data?.data ?? mRes.data;
          setAcademicModules((Array.isArray(mData) ? mData : []).map((m: any) => ({ 
            id: m.id, name: m.name, sub: m.code, programIds: m.programs?.map((pm: any) => pm.programId) || [] 
          })));

        } catch (err) {
          console.error('Error fetching academic data:', err);
        } finally {
          setIsLoadingAcademicData(false);
        }
      };

      fetchAcademicData();

      if (user) {
        setFormData({
          firstName: user.firstName, lastName: user.lastName, email: user.email,
          phone: user.phone || '', avatarUrl: user.avatarUrl || '',
          status: user.status, roleId: user.roleId, buildingId: user.buildingId || '',
          // Student
          studentCne: user.studentProfile?.cne || '',
          studentCin: user.studentProfile?.cin || '',
          studentGender: user.studentProfile?.gender || 'MALE',
          studentBirthDate: user.studentProfile?.birthDate ? new Date(user.studentProfile.birthDate).toISOString().split('T')[0] : '',
          studentBirthPlace: user.studentProfile?.birthPlace || '',
          studentNationality: user.studentProfile?.nationality || 'Marocaine',
          studentAddress: user.studentProfile?.address || '',
          studentCity: user.studentProfile?.city || '',
          studentBacType: user.studentProfile?.baccalaureateType || '',
          studentBacYear: user.studentProfile?.baccalaureateYear?.toString() || '',
          studentHighSchool: user.studentProfile?.highSchool || '',
          studentEnrollmentYear: user.studentProfile?.enrollmentYear?.toString() || new Date().getFullYear().toString(),
          studentStatus: user.studentProfile?.academicStatus || 'ENROLLED',
          studentProgramId: user.studentProfile?.programId || '',
          studentLevel: user.studentProfile?.currentLevel || 1,
          // Professor
          profCin: user.professorProfile?.cin || '',
          profGender: user.professorProfile?.gender || 'MALE',
          profTitle: user.professorProfile?.academicTitle || 'Dr.',
          profSpeciality: user.professorProfile?.speciality || '',
          profDepartment: user.professorProfile?.department || '',
          profContract: user.professorProfile?.employmentType || 'PERMANENT',
          profHireDate: user.professorProfile?.hireDate ? new Date(user.professorProfile.hireDate).toISOString().split('T')[0] : '',
          profOffice: user.professorProfile?.officeRoom || '',
          profHours: user.professorProfile?.officeHours || '',
          profResearch: user.professorProfile?.researchInterests || '',
          profBio: user.professorProfile?.biography || '',
          profDepartmentIds: [
            ...(user.professorProfile?.faculties?.map((f: any) => f.id) || []),
            ...(user.professorProfile?.buildings?.map((b: any) => b.id) || []),
            ...(user.professorProfile?.departments?.map((d: any) => d.id) || [])
          ],
          profProgramIds: user.professorProfile?.programs?.map((p: any) => p.id) || [],
          profModuleIds: user.professorProfile?.modules?.map((m: any) => m.id) || [],
          // Parent
          parentCin: user.parentProfile?.cin || '',
          parentGender: user.parentProfile?.gender || 'MALE',
          parentRelationship: user.parentProfile?.relationship || 'FATHER',
          parentProfession: user.parentProfile?.profession || '',
          parentAddress: user.parentProfile?.address || '',
          parentCity: user.parentProfile?.city || '',
          parentEmergency: user.parentProfile?.emergencyPhone || '',
          parentPrimary: user.parentProfile?.isPrimaryContact ?? true,
          parentStudentId: '',
        });
      } else {
        setFormData({
          firstName: '', lastName: '', email: '', phone: '', avatarUrl: '',
          status: 'ACTIVE', roleId: '', buildingId: '',
          studentCne: '', studentCin: '', studentGender: 'MALE', studentBirthDate: '', studentBirthPlace: '',
          studentNationality: 'Marocaine', studentAddress: '', studentCity: '', studentBacType: '', studentBacYear: new Date().getFullYear(), studentHighSchool: '', studentEnrollmentYear: new Date().getFullYear(), studentStatus: 'ENROLLED', studentProgramId: '',
          profCin: '', profGender: 'MALE', profTitle: 'Dr.', profSpeciality: '', profDepartment: '', profContract: 'PERMANENT', profHireDate: '', profOffice: '', profHours: '', profResearch: '', profBio: '',
          profDepartmentIds: [], profProgramIds: [], profModuleIds: [],
          parentCin: '', parentGender: 'MALE', parentRelationship: 'FATHER', parentProfession: '', parentAddress: '', parentCity: '', parentEmergency: '', parentPrimary: true, parentStudentId: '',
          studentLevel: 1
        });
      }
    }
  }, [isOpen, user, fetchRoles, fetchBuildings]);

  // --- CASCADING FILTERS LOGIC ---
  // Show programs for selected faculties - with fallback to ALL programs if facultyId isn't set
  const filteredPrograms = React.useMemo(() => {
    if (!formData.profDepartmentIds?.length) return [];
    
    // Strict filtering: Only programs linked to the selected Faculty OR Building IDs
    return programs.filter(p => 
      (p.facultyId && formData.profDepartmentIds.includes(p.facultyId)) ||
      (p.buildingId && formData.profDepartmentIds.includes(p.buildingId))
    );
  }, [programs, formData.profDepartmentIds]);

  const filteredModules = React.useMemo(() => {
    if (!formData.profProgramIds?.length) return [];
    return academicModules.filter(m => 
      m.programIds.some((pId: string) => formData.profProgramIds.includes(pId))
    );
  }, [academicModules, formData.profProgramIds]);

  // Clear sub-selections when parent selection changes to keep data consistent
  useEffect(() => {
    if (isLoadingAcademicData) return; // Wait for data to load
    
    if (formData.profDepartmentIds?.length === 0) {
      if (formData.profProgramIds?.length > 0) {
        setFormData((f: any) => ({ ...f, profProgramIds: [], profModuleIds: [] }));
      }
    } else {
      // Filter out programs that are no longer valid for the selected faculties
      // But only if there are actually programs that MATCH the selected faculties (strict mode)
      const strictMatches = programs.filter(p => p.facultyId && formData.profDepartmentIds.includes(p.facultyId));
      
      if (strictMatches.length > 0) {
        const validProgramIds = formData.profProgramIds.filter((pId: any) => 
          strictMatches.some(p => p.id === pId)
        );
        if (validProgramIds.length !== formData.profProgramIds.length) {
          setFormData((f: any) => ({ ...f, profProgramIds: validProgramIds }));
        }
      }
      // If no strict matches exist in the entire dataset for these faculties, we don't clear anything
      // to allow the fallback "show all" logic to work.
    }
  }, [formData.profDepartmentIds, programs, isLoadingAcademicData]);

  useEffect(() => {
    if (isLoadingAcademicData) return; // Wait for data to load

    if (formData.profProgramIds?.length === 0) {
      if (formData.profModuleIds?.length > 0) {
        setFormData((f: any) => ({ ...f, profModuleIds: [] }));
      }
    } else {
      // Filter out modules that are no longer valid for the selected programs
      // Only if there are actually modules strictly linked to the selected programs
      const strictMatches = academicModules.filter(m => 
        m.programIds.some((pId: string) => formData.profProgramIds.includes(pId))
      );

      if (strictMatches.length > 0) {
        const validModuleIds = formData.profModuleIds.filter((mId: any) => 
          strictMatches.some(m => m.id === mId)
        );
        if (validModuleIds.length !== formData.profModuleIds.length) {
          setFormData((f: any) => ({ ...f, profModuleIds: validModuleIds }));
        }
      }
    }
  }, [formData.profProgramIds, academicModules, isLoadingAcademicData]);

  const selectedRoleName = roles.find(r => r.id === formData.roleId)?.name;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await axios.post('http://localhost:3001/api/users/upload-avatar', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`
        }
      });
      const data = res.data.data || res.data;
      setFormData((prev: any) => ({ ...prev, avatarUrl: data.url }));
    } catch (error) {
      console.error('Erreur upload avatar', error);
      toast.error('Erreur lors de l\'envoi de l\'avatar.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Construction du payload final avec les bons profils
    const payload: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || undefined,
      avatarUrl: formData.avatarUrl || undefined,
      status: formData.status,
      roleId: formData.roleId,
      buildingId: formData.buildingId || undefined,
    };

    if (selectedRoleName === 'ETUDIANT') {
      payload.studentProfile = {
        cne: formData.studentCne || undefined,
        cin: formData.studentCin || undefined,
        gender: formData.studentGender || undefined,
        birthDate: formData.studentBirthDate ? new Date(formData.studentBirthDate) : undefined,
        birthPlace: formData.studentBirthPlace || undefined,
        nationality: formData.studentNationality || undefined,
        address: formData.studentAddress || undefined,
        city: formData.studentCity || undefined,
        baccalaureateType: formData.studentBacType || undefined,
        baccalaureateYear: Number(formData.studentBacYear) || undefined,
        highSchool: formData.studentHighSchool || undefined,
        enrollmentYear: Number(formData.studentEnrollmentYear) || undefined,
        academicStatus: formData.studentStatus || undefined,
        programId: formData.studentProgramId || undefined,
        currentLevel: Number(formData.studentLevel) || undefined,
        buildingId: formData.buildingId || undefined
      };
    } else if (selectedRoleName === 'PROFESSEUR') {
      payload.professorProfile = {
        cin: formData.profCin || undefined,
        gender: formData.profGender || undefined,
        academicTitle: formData.profTitle || undefined,
        speciality: formData.profSpeciality || undefined,
        department: formData.profDepartment || undefined,
        employmentType: formData.profContract || undefined,
        hireDate: formData.profHireDate ? new Date(formData.profHireDate) : undefined,
        officeRoom: formData.profOffice || undefined,
        officeHours: formData.profHours || undefined,
        researchInterests: formData.profResearch || undefined,
        biography: formData.profBio || undefined,
        facultyIds: departmentsType === 'faculty' && formData.profDepartmentIds.length > 0 ? formData.profDepartmentIds : [],
        departmentIds: [],
        buildingIds: departmentsType === 'building' && formData.profDepartmentIds.length > 0 ? formData.profDepartmentIds : [],
        programIds: formData.profProgramIds.length > 0 ? formData.profProgramIds : [],
        moduleIds: formData.profModuleIds.length > 0 ? formData.profModuleIds : [],
      };
    } else if (selectedRoleName === 'PARENT') {
      payload.parentProfile = {
        cin: formData.parentCin || undefined,
        gender: formData.parentGender || undefined,
        relationship: formData.parentRelationship || undefined,
        profession: formData.parentProfession || undefined,
        address: formData.parentAddress || undefined,
        city: formData.parentCity || undefined,
        emergencyPhone: formData.parentEmergency || undefined,
        isPrimaryContact: formData.parentPrimary,
        childrenIds: formData.parentStudentId ? [formData.parentStudentId] : undefined
      };
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (user) {
        await updateUser(user.id, payload);
        onClose();
      } else {
        const result = await createUser(payload);
        const password = result?.data?.tempPassword || result?.tempPassword;
        if (password) {
          setCreatedCredentials({
            email: payload.email,
            password: password
          });
        } else {
          onClose();
        }
      }
    } catch (error: any) {
      console.error('[UserModal] Submit error details:', error?.response?.data || error);
      const serverData = error?.response?.data;
      const msg = serverData?.message || error?.message || 'Erreur inconnue lors de la sauvegarde';
      setSubmitError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className={`bg-white rounded-2xl shadow-xl w-full ${createdCredentials ? 'max-w-md' : 'max-w-2xl'} max-h-[90vh] flex flex-col pointer-events-auto overflow-hidden transition-all duration-500 relative`}>
              
              {/* Custom Confirmation Overlay for Password Reset */}
              <AnimatePresence>
                {showConfirmReset && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md rounded-2xl"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center border border-slate-100"
                    >
                      <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <KeyIcon className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-extrabold text-slate-800 mb-3 font-outfit">Réinitialiser ?</h3>
                      <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                        Êtes-vous sûr de vouloir générer un nouveau mot de passe ? L'ancien mot de passe ne fonctionnera plus immédiatement.
                      </p>
                      <div className="flex gap-3">
                        <button 
                          type="button"
                          onClick={() => setShowConfirmReset(false)}
                          disabled={isResettingPassword}
                          className="flex-1 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all disabled:opacity-50"
                        >
                          Annuler
                        </button>
                        <button 
                          type="button"
                          onClick={confirmResetPassword}
                          disabled={isResettingPassword}
                          className="flex-1 px-4 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isResettingPassword ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Confirmer"}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {createdCredentials ? (
                <div className="p-10 text-center space-y-6 bg-white overflow-y-auto">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <CheckIcon className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-800 font-outfit tracking-tight">Utilisateur Créé !</h2>
                  <p className="text-slate-500 text-sm">Veuillez copier ces identifiants pour les transmettre à l'utilisateur. Ils ne seront affichés qu'une seule fois pour des raisons de sécurité.</p>
                  
                  <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 space-y-4">
                    <div className="text-left">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identifiant (Email)</label>
                      <div className="flex items-center justify-between mt-1 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <span className="font-mono text-slate-700 text-sm truncate mr-2">{createdCredentials.email}</span>
                        <button 
                          onClick={() => copyToClipboard(createdCredentials.email)} 
                          className="px-3 py-1 bg-upf-primary/10 text-upf-primary rounded-lg hover:bg-upf-primary/20 transition-colors text-xs font-bold whitespace-nowrap"
                        >
                          Copier
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-left">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mot de Passe Sécurisé</label>
                      <div className="flex items-center justify-between mt-1 p-3 bg-white rounded-xl border border-slate-100 shadow-sm group">
                        <span className="font-mono text-xl font-bold text-upf-primary tracking-wider">{createdCredentials.password}</span>
                        <button 
                          onClick={() => copyToClipboard(createdCredentials.password)} 
                          className="px-3 py-1 bg-upf-primary/10 text-upf-primary rounded-lg hover:bg-upf-primary/20 transition-colors text-xs font-bold whitespace-nowrap"
                        >
                          Copier
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setCreatedCredentials(null);
                      onClose();
                    }}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                  >
                    J'ai bien noté les accès
                  </button>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")'}} />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <UserIcon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 font-outfit">
                          {user ? 'Modifier l\'utilisateur' : 'Nouvel Utilisateur'}
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">Configurez le profil, le rôle et les informations de l'utilisateur.</p>
                      </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all relative z-10 border border-slate-200/60 hover:border-red-100">
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>

              {/* Body */}
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
                <form id="userForm" onSubmit={handleSubmit} className="space-y-8">
                  {submitError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700"
                    >
                      <XMarkIcon className="w-5 h-5 shrink-0 mt-0.5" />
                      <div className="text-xs font-bold leading-relaxed">
                        <p className="uppercase tracking-widest text-[10px] mb-1">Erreur de sauvegarde</p>
                        {submitError}
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 relative transition-transform duration-300 group-hover:scale-105">
                        {formData.avatarUrl ? (
                          <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                            <UserIcon className="w-12 h-12 opacity-50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <CameraIcon className="w-8 h-8 text-white drop-shadow-md" />
                        </div>
                        {isUploading && (
                          <div className="absolute inset-0 bg-white/90 flex items-center justify-center backdrop-blur-sm">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center shadow-md">
                        <PlusIcon className="w-4 h-4 text-white" />
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                    </div>
                  </div>

                  {/* General Info */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <IdentificationIcon className="w-4 h-4 text-slate-400" />
                      Informations Personnelles
                    </h3>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Prénom *</label>
                        <div className="relative">
                          <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium" placeholder="Ex: Karim" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Nom *</label>
                        <div className="relative">
                          <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium" placeholder="Ex: Tazi" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Email *</label>
                        <div className="relative">
                          <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium" placeholder="karim@upf.ac.ma" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Téléphone</label>
                        <div className="relative">
                          <PhoneIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium" placeholder="+212 6..." />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Role & Building */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <BriefcaseIcon className="w-4 h-4 text-slate-400" />
                      Affectation et Rôle
                    </h3>
                    <div className="grid grid-cols-1 gap-5">
                      <div className={formData.roleId && selectedRoleName !== 'PARENT' && selectedRoleName !== 'ETUDIANT' ? 'md:grid md:grid-cols-2 md:gap-5' : ''}>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Rôle de l'utilisateur *</label>
                          <select 
                            required 
                            value={formData.roleId} 
                            onChange={e => setFormData({...formData, roleId: e.target.value, buildingId: '', studentProgramId: ''})} 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold text-slate-700"
                          >
                            <option value="">Sélectionner un rôle</option>
                            {roles.map(r => (
                              <option key={r.id} value={r.id}>{r.name.replace('_', ' ')}</option>
                            ))}
                          </select>
                        </div>

                        <AnimatePresence>
                          {formData.roleId && selectedRoleName !== 'PARENT' && selectedRoleName !== 'ETUDIANT' && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="mt-5 md:mt-0"
                            >
                              <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Établissement rattaché *</label>
                              <select 
                                required={selectedRoleName !== 'SUPER_ADMIN'}
                                value={formData.buildingId} 
                                onChange={e => setFormData({...formData, buildingId: e.target.value})} 
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-700"
                              >
                                <option value="">Choisir un bâtiment</option>
                                {buildings.filter(b => b.isActive).map(b => (
                                  <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                              </select>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Profiles */}
                  <AnimatePresence mode="wait">
                    {selectedRoleName === 'ETUDIANT' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-blue-800"><AcademicCapIcon className="w-4 h-4" /> Profil Étudiant</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Code Massar (CNE)</label>
                            <input type="text" value={formData.studentCne} onChange={e => setFormData({...formData, studentCne: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">CIN</label>
                            <input type="text" value={formData.studentCin} onChange={e => setFormData({...formData, studentCin: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Genre</label>
                            <select value={formData.studentGender} onChange={e => setFormData({...formData, studentGender: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                              <option value="MALE">Homme</option>
                              <option value="FEMALE">Femme</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Date de naissance</label>
                            <input type="date" value={formData.studentBirthDate} onChange={e => setFormData({...formData, studentBirthDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Lieu de naissance</label>
                            <input type="text" value={formData.studentBirthPlace} onChange={e => setFormData({...formData, studentBirthPlace: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Nationalité</label>
                            <input type="text" value={formData.studentNationality} onChange={e => setFormData({...formData, studentNationality: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Série du Bac</label>
                            <input type="text" placeholder="Ex: Sc. Maths A" value={formData.studentBacType} onChange={e => setFormData({...formData, studentBacType: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Année d'inscription</label>
                            <input type="number" value={formData.studentEnrollmentYear} onChange={e => setFormData({...formData, studentEnrollmentYear: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                          </div>
                           <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Statut Académique</label>
                            <select value={formData.studentStatus} onChange={e => setFormData({...formData, studentStatus: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                              <option value="ENROLLED">Inscrit</option>
                              <option value="GRADUATED">Diplômé</option>
                              <option value="SUSPENDED">Suspendu</option>
                              <option value="DROPPED_OUT">Abandon</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Niveau Actuel *</label>
                            <select 
                              required
                              disabled={!formData.studentProgramId}
                              value={formData.studentLevel} 
                              onChange={e => setFormData({...formData, studentLevel: Number(e.target.value)})} 
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm disabled:bg-slate-50"
                            >
                              {!formData.studentProgramId ? (
                                <option>Choisir une filière d'abord</option>
                              ) : (
                                Array.from({ length: programs.find(p => p.id === formData.studentProgramId)?.duration || 5 }, (_, i) => i + 1).map(l => (
                                  <option key={l} value={l}>{l === 1 ? '1ère' : `${l}ème`} Année</option>
                                ))
                              )}
                            </select>
                          </div>
                          <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-blue-100">
                            <div>
                              <label className="block text-xs font-bold text-blue-700 mb-1">1. Établissement (Bâtiment) *</label>
                              <select 
                                required 
                                value={formData.buildingId} 
                                onChange={e => setFormData({...formData, buildingId: e.target.value, studentProgramId: ''})} 
                                className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm font-bold text-blue-600 bg-white shadow-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                              >
                                <option value="">Sélectionner l'établissement</option>
                                {buildings.filter(b => b.isActive).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-blue-700 mb-1">2. Filière / Programme d'études *</label>
                              <select 
                                required
                                disabled={!formData.buildingId}
                                value={formData.studentProgramId} 
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, studentProgramId: e.target.value})} 
                                className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm disabled:bg-slate-50 disabled:text-slate-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white"
                              >
                                <option value="">{formData.buildingId ? 'Choisir la filière' : '← Choisir d\'abord un établissement'}</option>
                                {programs
                                  .filter(p => !formData.buildingId || p.buildingId === formData.buildingId)
                                  .map(p => <option key={p.id} value={p.id}>{p.name} ({p.sub})</option>)
                                }
                              </select>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {selectedRoleName === 'PROFESSEUR' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl space-y-4">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-amber-800"><BriefcaseIcon className="w-4 h-4" /> Profil Enseignant</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Titre Académique</label>
                            <select value={formData.profTitle} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, profTitle: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                              <option value="Dr.">Docteur (Dr.)</option>
                              <option value="Prof.">Professeur (Prof.)</option>
                              <option value="Mr.">Monsieur</option>
                              <option value="Mme.">Madame</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Spécialité</label>
                            <input type="text" placeholder="Ex: Informatique" value={formData.profSpeciality} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, profSpeciality: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Type de Contrat</label>
                            <select value={formData.profContract} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, profContract: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                              <option value="PERMANENT">Permanent (Titulaire)</option>
                              <option value="VACATAIRE">Vacataire</option>
                              <option value="VISITING">Professeur Visiteur</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Bureau</label>
                            <input type="text" value={formData.profOffice} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, profOffice: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Heures de réception</label>
                            <input type="text" value={formData.profHours} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, profHours: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                          </div>
                        </div>

                        {/* Multi-select section - PREMIUM REDESIGN */}
                        <div className="space-y-6 pt-6 border-t border-amber-100">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                              <SparklesIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight">Affectations Académiques</h5>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-70">Spécialisations et cours</p>
                            </div>
                          </div>

                          <div className="space-y-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-200/50">
                            <MultiSelect
                              label="Établissement(s)"
                              icon={<UserGroupIcon className="w-4 h-4" />}
                              items={departments}
                              selected={formData.profDepartmentIds}
                              onChange={(ids: string[]) => setFormData({...formData, profDepartmentIds: ids})}
                              color="amber"
                            />
                            
                            <div className={`transition-all duration-300 ${!formData.profDepartmentIds?.length ? 'opacity-50 grayscale pointer-events-none' : 'opacity-100'}`}>
                               <MultiSelect
                                 label="2. Filière(s) d'enseignement"
                                 icon={<AcademicCapIcon className="w-4 h-4" />}
                                 items={isLoadingAcademicData ? [] : filteredPrograms}
                                 selected={formData.profProgramIds}
                                 onChange={(ids: string[]) => setFormData({...formData, profProgramIds: ids})}
                                 color="blue"
                               />
                               {isLoadingAcademicData ? (
                                 <p className="text-[10px] text-blue-500 font-bold mt-1 ml-2 animate-pulse">Chargement des filières...</p>
                               ) : !formData.profDepartmentIds?.length && (
                                 <p className="text-[10px] text-amber-600 font-bold mt-1 ml-2">⚠️ Sélectionnez au moins un établissement d'abord</p>
                               )}
                             </div>
                            
                            <div className={`transition-all duration-300 ${!formData.profProgramIds?.length ? 'opacity-50 grayscale pointer-events-none' : 'opacity-100'}`}>
                               <MultiSelect
                                 label="3. Module(s) de spécialité"
                                 icon={<BriefcaseIcon className="w-4 h-4" />}
                                 items={isLoadingAcademicData ? [] : filteredModules}
                                 selected={formData.profModuleIds}
                                 onChange={(ids: string[]) => setFormData({...formData, profModuleIds: ids})}
                                 color="orange"
                               />
                               {isLoadingAcademicData ? (
                                 <p className="text-[10px] text-orange-500 font-bold mt-1 ml-2 animate-pulse">Chargement des modules...</p>
                               ) : !formData.profProgramIds?.length && (
                                 <p className="text-[10px] text-blue-600 font-bold mt-1 ml-2">⚠️ Sélectionnez au moins une filière d'abord</p>
                               )}
                             </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {selectedRoleName === 'PARENT' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-4">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-800"><UserIcon className="w-4 h-4" /> Profil Parent</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Lien de parenté</label>
                            <select value={formData.parentRelationship} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, parentRelationship: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                              <option value="FATHER">Père</option>
                              <option value="MOTHER">Mère</option>
                              <option value="GUARDIAN">Tuteur Légal</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Profession</label>
                            <input type="text" value={formData.parentProfession} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, parentProfession: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Tél. Urgence</label>
                            <input type="text" value={formData.parentEmergency} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, parentEmergency: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                          </div>
                        </div>
                        {/* Student smart search */}
                        <div className="pt-2 border-t border-emerald-100">
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">
                            Enfant rattaché — Rechercher par CNE ou CIN
                          </label>

                          {/* Selected badge */}
                          {selectedStudent && (
                            <div className="flex items-center gap-3 p-2.5 mb-2 bg-emerald-100 border border-emerald-300 rounded-lg">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-emerald-900 truncate">{selectedStudent.name}</p>
                                <div className="flex gap-3 text-xs text-emerald-700 mt-0.5">
                                  {selectedStudent.cne && <span>CNE: <strong>{selectedStudent.cne}</strong></span>}
                                  {selectedStudent.cin && <span>CIN: <strong>{selectedStudent.cin}</strong></span>}
                                </div>
                              </div>
                              <button type="button" onClick={() => { setSelectedStudent(null); setFormData({...formData, parentStudentId: ''}); setStudentSearch(''); }}
                                className="text-emerald-600 hover:text-red-500 transition-colors text-lg font-bold leading-none">&times;</button>
                            </div>
                          )}

                          {/* Search input */}
                          {!selectedStudent && (
                            <div className="relative">
                              <input
                                type="text"
                                value={studentSearch}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setStudentSearch(e.target.value); setShowStudentDropdown(true); }}
                                onFocus={() => setShowStudentDropdown(true)}
                                placeholder="Tapez un CNE (ex: G1234567) ou CIN (ex: BJ567890)..."
                                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                              />

                              {/* Dropdown results */}
                              {showStudentDropdown && studentSearch.length >= 2 && (() => {
                                const q = studentSearch.toLowerCase();
                                const results = students.filter(s =>
                                  s.cne.toLowerCase().includes(q) ||
                                  s.cin.toLowerCase().includes(q) ||
                                  s.name.toLowerCase().includes(q)
                                ).slice(0, 8);
                                return results.length > 0 ? (
                                  <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                                    {results.map(s => (
                                      <button key={s.id} type="button"
                                        onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                                        onClick={() => {
                                          setSelectedStudent(s);
                                          setFormData({...formData, parentStudentId: s.id});
                                          setShowStudentDropdown(false);
                                          setStudentSearch('');
                                        }}
                                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left border-b border-slate-50 last:border-0"
                                      >
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-xs font-bold text-emerald-700">
                                          {s.name[0]}
                                        </div>
                                        <div>
                                          <p className="text-sm font-bold text-slate-900">{s.name}</p>
                                          <div className="flex gap-3 text-xs text-slate-500 mt-0.5">
                                            {s.cne && <span>CNE: <strong className="text-slate-700">{s.cne}</strong></span>}
                                            {s.cin && <span>CIN: <strong className="text-slate-700">{s.cin}</strong></span>}
                                          </div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl px-4 py-3">
                                    <p className="text-xs text-slate-400 italic">Aucun étudiant trouvé pour "{studentSearch}"</p>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                          <p className="text-xs text-slate-400 mt-1.5">La recherche est possible par CNE, CIN ou nom complet.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </form>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 bg-white border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-2xl">
                {user && (
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmReset(true)}
                    disabled={isResettingPassword || isSubmitting}
                    className="mr-auto px-4 py-2.5 text-sm font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all flex items-center gap-2"
                  >
                    {isResettingPassword ? (
                      <div className="w-4 h-4 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
                    ) : (
                      <KeyIcon className="w-4 h-4" />
                    )}
                    Nouveau mot de passe
                  </button>
                )}
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all">
                  Annuler
                </button>
                <button
                  type="submit"
                  form="userForm"
                  disabled={isSubmitting}
                  className="px-7 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {user ? 'Enregistrer les modifications' : 'Créer l\'utilisateur'}
                </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserModal;

