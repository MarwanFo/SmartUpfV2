import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UsersIcon, PlusIcon, MagnifyingGlassIcon, 
  PencilSquareIcon, TrashIcon, CheckCircleIcon, 
  XCircleIcon, ArrowPathIcon, AcademicCapIcon, 
  BriefcaseIcon, UserGroupIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useUsersStore, type User } from '../../store/usersStore';
import { useModalStore } from '../../store/modalStore';
import UserModal from '../../components/admin/UserModal';

type ViewMode = 'grid' | 'table';
type FilterStatus = 'all' | 'active' | 'suspended';
type FilterRole = 'all' | 'ETUDIANT' | 'PROFESSEUR' | 'PARENT' | 'STAFF_SCOLARITE' | 'SUPER_ADMIN';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

const UtilisateursPage: React.FC = () => {
  const { users, isLoading, fetchUsers, deleteUser } = useUsersStore();
  const { openConfirm } = useModalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterRole, setFilterRole] = useState<FilterRole>('all');

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleOpenModal = (user: User | null = null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    openConfirm({
      title: 'Supprimer l\'utilisateur',
      message: `Voulez-vous vraiment supprimer ${user.firstName} ${user.lastName} ? Cette action est irréversible et supprimera toutes ses données.`,
      confirmLabel: 'Supprimer définitivement',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteUser(user.id);
        } catch (err) {
          // Toast handle error if needed
        }
      }
    });
  };

  const filteredUsers = users
    .filter(u => 
      u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(u => {
      if (filterStatus === 'active') return u.status === 'ACTIVE';
      if (filterStatus === 'suspended') return u.status === 'SUSPENDED';
      return true;
    })
    .filter(u => {
      if (filterRole === 'all') return true;
      return u.role.name === filterRole;
    });

  const activeCount = users.filter(u => u.status === 'ACTIVE').length;
  const studentsCount = users.filter(u => u.role.name === 'ETUDIANT').length;
  const profsCount = users.filter(u => u.role.name === 'PROFESSEUR').length;

  const getRoleIcon = (roleName: string) => {
    if (roleName === 'ETUDIANT') return <AcademicCapIcon className="w-5 h-5 text-blue-500" />;
    if (roleName === 'PROFESSEUR') return <BriefcaseIcon className="w-5 h-5 text-amber-500" />;
    if (roleName === 'PARENT') return <UserGroupIcon className="w-5 h-5 text-emerald-500" />;
    if (roleName === 'SUPER_ADMIN') return <ShieldCheckIcon className="w-5 h-5 text-purple-500" />;
    return <UsersIcon className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 shadow-xl">
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                <UsersIcon className="w-6 h-6" />
              </div>
              <div className="px-3 py-1 rounded-full bg-white/10 text-blue-300 text-xs font-bold tracking-wider uppercase backdrop-blur-sm border border-white/10">
                Annuaire
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-white font-outfit">Gestion des Utilisateurs</h2>
            <p className="text-slate-400 mt-2 max-w-xl">
              Gérez l'ensemble des acteurs de l'écosystème UPF : Étudiants, Professeurs, Staff et Parents.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95 whitespace-nowrap"
          >
            <PlusIcon className="w-5 h-5" />
            Nouvel utilisateur
          </button>
        </div>

        {/* Mini stats */}
        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Total', value: users.length, icon: UsersIcon, color: 'from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/20' },
            { label: 'Actifs', value: activeCount, icon: CheckCircleIcon, color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/20' },
            { label: 'Étudiants', value: studentsCount, icon: AcademicCapIcon, color: 'from-upf-primaryLight/20 to-upf-primaryLight/10 text-upf-primaryLight border-upf-primaryLight/20' },
            { label: 'Enseignants', value: profsCount, icon: BriefcaseIcon, color: 'from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/20' },
          ].map(s => (
            <div key={s.label} className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r ${s.color} border backdrop-blur-sm`}>
              <s.icon className="w-5 h-5 flex-shrink-0" />
              <div>
                <div className="text-lg font-extrabold text-white font-outfit">{s.value}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/40 outline-none transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value as FilterRole)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tous les rôles</option>
            <option value="ETUDIANT">Étudiants</option>
            <option value="PROFESSEUR">Professeurs</option>
            <option value="PARENT">Parents</option>
            <option value="STAFF_SCOLARITE">Staff</option>
            <option value="SUPER_ADMIN">Super Admins</option>
          </select>
          <div className="w-px h-8 bg-slate-200 hidden md:block" />
          <div className="flex items-center bg-slate-100 rounded-lg p-1 shrink-0">
            {(['all','active','suspended'] as FilterStatus[]).map(f => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterStatus === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : 'Suspendus'}
              </button>
            ))}
          </div>
          <div className="w-px h-8 bg-slate-200 hidden md:block" />
          <div className="flex items-center bg-slate-100 rounded-lg p-1 shrink-0">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
            </button>
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="2" rx="0.5"/><rect x="1" y="7" width="14" height="2" rx="0.5"/><rect x="1" y="12" width="14" height="2" rx="0.5"/></svg>
            </button>
          </div>
          <button onClick={() => fetchUsers()} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all shrink-0" title="Rafraîchir">
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading && users.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-slate-100 rounded-full" />
                <div className="flex-1"><div className="h-4 bg-slate-100 rounded w-3/4 mb-2" /><div className="h-3 bg-slate-100 rounded w-1/2" /></div>
              </div>
              <div className="h-px bg-slate-50 mb-4" />
              <div className="h-8 bg-slate-50 rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="bg-white rounded-2xl p-16 text-center border border-dashed border-slate-300 shadow-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-50 flex items-center justify-center">
            <UsersIcon className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-outfit">Aucun utilisateur trouvé</h3>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((user) => (
            <motion.div variants={staggerItem} layout key={user.id}
              className={`group relative bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${user.status === 'ACTIVE' ? 'border-slate-200 hover:border-slate-300' : 'border-red-200/60 opacity-80'}`}
            >
              {/* Top gradient bar indicating status */}
              <div className={`h-1.5 ${user.status === 'ACTIVE' ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-gradient-to-r from-red-300 to-red-500'}`} />

              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 flex items-center justify-center overflow-hidden shrink-0">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-slate-400 text-lg">{user.firstName[0]}{user.lastName[0]}</span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                      {user.status === 'ACTIVE' ? <CheckCircleIcon className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
                      {user.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-outfit line-clamp-1">{user.firstName} {user.lastName}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{user.email}</p>
                </div>

                {/* Role Badge */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 flex items-center gap-2 w-full">
                    {getRoleIcon(user.role.name)}
                    <span className="text-xs font-bold text-slate-700">{user.role.name.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Contextual Info (Depends on Profile) */}
                <div className="mt-4 text-xs text-slate-500 space-y-1.5">
                  {user.role.name === 'ETUDIANT' && user.studentProfile && (
                    <>
                      <div className="flex justify-between"><span className="font-medium">CNE:</span> <span className="text-slate-800 font-bold">{user.studentProfile.cne || '-'}</span></div>
                      <div className="flex justify-between"><span className="font-medium">Filière:</span> <span className="text-slate-800">{user.studentProfile.baccalaureateType || '-'}</span></div>
                    </>
                  )}
                  {user.role.name === 'PROFESSEUR' && user.professorProfile && (
                    <>
                      <div className="flex justify-between"><span className="font-medium">Titre:</span> <span className="text-slate-800 font-bold">{user.professorProfile.academicTitle || '-'}</span></div>
                      <div className="flex justify-between"><span className="font-medium">Spécialité:</span> <span className="text-slate-800 line-clamp-1 text-right">{user.professorProfile.speciality || '-'}</span></div>
                    </>
                  )}
                  {user.role.name === 'PARENT' && user.parentProfile && (
                    <>
                      <div className="flex justify-between"><span className="font-medium">Lien:</span> <span className="text-slate-800 font-bold">{user.parentProfile.relationship || '-'}</span></div>
                      <div className="flex justify-between"><span className="font-medium">Tél:</span> <span className="text-slate-800">{user.parentProfile.emergencyPhone || user.phone || '-'}</span></div>
                    </>
                  )}
                </div>

                {/* Action buttons */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <button onClick={() => handleOpenModal(user)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all border border-slate-200/60">
                    <PencilSquareIcon className="w-3.5 h-3.5" /> Modifier
                  </button>
                  <button onClick={() => handleDeleteClick(user)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* ── Table View ── */
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rôle & Profil</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Statut</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-slate-400">{user.firstName[0]}{user.lastName[0]}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{user.firstName} {user.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600">{user.email}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{user.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role.name)}
                        <span className="font-bold text-slate-700 text-xs bg-slate-100 px-2 py-1 rounded-md">{user.role.name.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><PencilSquareIcon className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteClick(user)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><TrashIcon className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        user={selectedUser} 
      />
    </div>
  );
};

export default UtilisateursPage;


