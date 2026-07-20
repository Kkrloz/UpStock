import { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import {
  Users, UserPlus, Trash2, Shield, UserCircle,
  Mail, Lock, User, Briefcase, AlertCircle,
  CheckCircle2, X, Eye, EyeOff, Crown, Store, Pencil, Search,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function Usuarios() {
  const { t } = useTranslation();
  const { user: currentUser, createUser, updateUser, deleteUser, listUsers } = useAuth();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', cargo: '', role: 'user', storeName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchUsers = async (opts = {}) => {
    setLoadingUsers(true);
    try {
      const params = { page: opts.page ?? 0 };
      if (opts.search) params.search = opts.search;
      if (opts.role && opts.role !== 'todos') params.role = opts.role;
      const result = await listUsers(params);
      setUsers(result.users);
      setTotalPages(result.totalPages);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchUsers({ page: 0, search: search || undefined, role: roleFilter });
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRoleFilter = (role) => {
    setRoleFilter(role);
    setPage(0);
    fetchUsers({ page: 0, search: search || undefined, role });
  };

  const goToPage = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return;
    setPage(newPage);
    fetchUsers({ page: newPage, search: search || undefined, role: roleFilter });
  };

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      cargo: user.cargo || '',
      role: user.role || 'user',
      storeName: user.storeName || '',
    });
    setFormError('');
    setFormSuccess('');
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormError('');
    setFormSuccess('');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.name || !formData.email) {
      setFormError(t('users.errorNameEmailRequired'));
      return;
    }
    if (!editingUser && formData.password.length < 6) {
      setFormError(t('users.errorPasswordLength'));
      return;
    }

    setFormLoading(true);
    try {
      if (editingUser) {
        const payload = { name: formData.name, email: formData.email, cargo: formData.cargo, role: formData.role, storeName: formData.storeName };
        if (formData.password) payload.password = formData.password;
        await updateUser(editingUser.id, payload);
        setFormSuccess(t('users.updateSuccess'));
      } else {
        await createUser(formData);
        setFormSuccess(t('users.createSuccess'));
      }
      setFormData({ name: '', email: '', password: '', cargo: '', role: 'user', storeName: '' });
      await fetchUsers({ search: search || undefined, role: roleFilter });
      setTimeout(() => {
        handleCloseForm();
      }, 1800);
    } catch (err) {
      setFormError(err.message || (editingUser ? t('users.errorUpdate') : t('users.errorCreate')));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(t('users.modalDeleteConfirm', { name: userName }))) return;
    setDeletingId(userId);
    setDeleteError('');
    try {
      await deleteUser(userId);
      await fetchUsers({ search: search || undefined, role: roleFilter });
    } catch (err) {
      setDeleteError(err.message || t('users.errorDelete'));
    } finally {
      setDeletingId(null);
    }
  };

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount = users.filter((u) => u.role === 'user').length;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-(--text-primary-color) tracking-tight flex items-center gap-2">
            <Users size={20} className="sm:size-6 text-(--blue-color3)" />
            {t('users.title')}
          </h1>
          <p className="text-sm text-(--text-secondary-color) mt-1">
            {t('users.subtitle')}
          </p>
        </div>
        <button
          id="btn-novo-usuario"
          onClick={() => { setEditingUser(null); setShowForm(true); setFormError(''); setFormSuccess(''); setFormData({ name: '', email: '', password: '', cargo: '', role: 'user', storeName: '' }); }}
          className="flex items-center gap-2 bg-(--blue-color3) hover:bg-(--blue-color2) text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all duration-200 active:scale-[0.98] shadow-md cursor-pointer"
        >
          <UserPlus size={16} />
          {t('users.newUser')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-(--bg-card-color) border border-(--border-color) rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Users size={18} className="text-(--blue-color3)" />
          </div>
          <div>
            <p className="text-xs text-(--text-secondary-color) font-medium uppercase tracking-wider">Total</p>
            <p className="text-2xl font-extrabold text-(--text-primary-color)">{users.length}</p>
          </div>
        </div>
        <div className="bg-(--bg-card-color) border border-(--border-color) rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <Crown size={18} className="text-(--yellow-color2)" />
          </div>
          <div>
            <p className="text-xs text-(--text-secondary-color) font-medium uppercase tracking-wider">Admins</p>
            <p className="text-2xl font-extrabold text-(--text-primary-color)">{adminCount}</p>
          </div>
        </div>
        <div className="bg-(--bg-card-color) border border-(--border-color) rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <UserCircle size={18} className="text-(--green-color4)" />
          </div>
          <div>
            <p className="text-xs text-(--text-secondary-color) font-medium uppercase tracking-wider">Usuários</p>
            <p className="text-2xl font-extrabold text-(--text-primary-color)">{userCount}</p>
          </div>
        </div>
      </div>

      {deleteError && (
        <div className="flex items-center gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-(--red-color4) text-sm rounded-xl">
          <AlertCircle size={16} className="shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-center bg-(--bg-card-color) border border-(--border-color) rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary-color)" size={18} />
          <input
            type="text"
            placeholder={t('users.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-(--bg-subtle) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--placeholder) focus:outline-none focus:border-(--input-border-focus) text-sm"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {['todos', 'admin', 'user'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleFilter(r)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                roleFilter === r
                  ? r === 'admin'
                    ? 'bg-yellow-500/10 text-(--yellow-color2) border border-yellow-500/20'
                    : r === 'user'
                    ? 'bg-blue-500/10 text-(--blue-color3) border border-blue-500/20'
                    : 'bg-(--active-bg) text-(--badge-admin-text) border border-(--blue-border-soft)'
                  : 'border border-(--border-color) text-(--text-secondary-color) hover:bg-(--bg-card-hover-color)'
              }`}
            >
              {r === 'todos' ? 'Todos' : r === 'admin' ? t('users.roleAdmin') : t('users.roleUser')}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="bg-(--bg-card-color) border border-(--border-color) rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-(--text-primary-color) flex items-center gap-2">
              {editingUser ? <Pencil size={18} className="text-(--yellow-color2)" /> : <UserPlus size={18} className="text-(--blue-color3)" />}
              {editingUser ? t('users.modalEditTitle') : t('users.modalCreateTitle')}
            </h2>
            <button
              onClick={handleCloseForm}
              className="p-1.5 rounded-lg text-(--text-secondary-color) hover:text-(--text-primary-color) hover:bg-(--bg-card-hover-color) transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {formError && (
            <div className="flex items-start gap-2.5 p-3 mb-4 bg-rose-500/10 border border-rose-500/20 text-(--red-color4) text-sm rounded-xl">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}
          {formSuccess && (
            <div className="flex items-start gap-2.5 p-3 mb-4 bg-emerald-500/10 border border-emerald-500/20 text-(--green-color4) text-sm rounded-xl">
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">{t('users.labelName')}</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary-color)" />
                <input
                  id="form-user-name"
                  name="name"
                  type="text"
                  placeholder={t('users.placeholderName')}
                  value={formData.name}
                  onChange={handleFormChange}
                  disabled={formLoading}
                   className="w-full pl-9 pr-3 py-2.5 bg-(--input-bg) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--text-secondary-color) focus:outline-none focus:border-(--input-border-focus) focus:ring-1 focus:ring-(--input-border-focus) text-sm transition-all"
                   required
                 />
                </div>
              </div>

              <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">{t('users.labelEmail')}</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary-color)" />
                <input
                  id="form-user-email"
                  name="email"
                  type="email"
                  placeholder={t('users.placeholderEmail')}
                    value={formData.email}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    className="w-full pl-9 pr-3 py-2.5 bg-(--input-bg) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--text-secondary-color) focus:outline-none focus:border-(--input-border-focus) focus:ring-1 focus:ring-(--input-border-focus) text-sm transition-all"
                   required
                 />
               </div>
             </div>

             <div className="flex flex-col gap-1">
               <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">{t('users.labelPassword')}</label>
               <div className="relative">
                 <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary-color)" />
                 <input
                   id="form-user-password"
                   name="password"
                   type={showPassword ? 'text' : 'password'}
                   placeholder={editingUser ? 'Deixe em branco para manter' : t('users.placeholderPassword')}
                   value={formData.password}
                   onChange={handleFormChange}
                   disabled={formLoading}
                   className="w-full pl-9 pr-9 py-2.5 bg-(--input-bg) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--text-secondary-color) focus:outline-none focus:border-(--input-border-focus) focus:ring-1 focus:ring-(--input-border-focus) text-sm transition-all"
                   required={!editingUser}
                  />
                  <button
                    type="button"
                    tabIndex="-1"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-secondary-color) hover:text-(--text-primary-color) transition-colors"
                 >
                   {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                 </button>
               </div>
             </div>

             <div className="flex flex-col gap-1">
               <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">Cargo</label>
               <div className="relative">
                 <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary-color)" />
                 <input
                   id="form-user-cargo"
                   name="cargo"
                   type="text"
                   placeholder="Ex: Operador de Estoque"
                   value={formData.cargo}
                   onChange={handleFormChange}
                   disabled={formLoading}
                    className="w-full pl-9 pr-3 py-2.5 bg-(--input-bg) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--text-secondary-color) focus:outline-none focus:border-(--input-border-focus) focus:ring-1 focus:ring-(--input-border-focus) text-sm transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">{t('users.labelStore')}</label>
                <div className="relative">
                  <Store size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary-color)" />
                  <input
                    id="form-user-store"
                    name="storeName"
                    type="text"
                    placeholder={t('users.placeholderStore')}
                    value={formData.storeName}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    className="w-full pl-9 pr-3 py-2.5 bg-(--input-bg) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--text-secondary-color) focus:outline-none focus:border-(--input-border-focus) focus:ring-1 focus:ring-(--input-border-focus) text-sm transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
               <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">{t('users.labelRole')}</label>
               <div className="flex gap-3">
                 <label className={`flex items-center gap-2.5 flex-1 p-3 rounded-xl border cursor-pointer transition-all ${formData.role === 'user' ? 'border-blue-500/50 bg-blue-500/10' : 'border-(--border-color) bg-(--bg-subtle) hover:bg-(--input-bg)'}`}>
                   <input
                     type="radio"
                     name="role"
                     value="user"
                     checked={formData.role === 'user'}
                     onChange={handleFormChange}
                     className="hidden"
                   />
                   <UserCircle size={18} className={formData.role === 'user' ? 'text-(--blue-color3)' : 'text-(--text-secondary-color)'} />
                   <div>
                      <p className="text-sm font-bold text-(--text-primary-color)">{t('users.roleStore')}</p>
                     <p className="text-xs text-(--text-secondary-color)">Acesso próprio — vê apenas seus produtos</p>
                   </div>
                 </label>
                 <label className={`flex items-center gap-2.5 flex-1 p-3 rounded-xl border cursor-pointer transition-all ${formData.role === 'admin' ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-(--border-color) bg-(--bg-subtle) hover:bg-(--input-bg)'}`}>
                   <input
                     type="radio"
                     name="role"
                     value="admin"
                     checked={formData.role === 'admin'}
                     onChange={handleFormChange}
                     className="hidden"
                   />
                   <Shield size={18} className={formData.role === 'admin' ? 'text-(--yellow-color2)' : 'text-(--text-secondary-color)'} />
                   <div>
                      <p className="text-sm font-bold text-(--text-primary-color)">{t('users.roleAdmin')}</p>
                     <p className="text-xs text-(--text-secondary-color)">Acesso total — gerencia todas as lojas</p>
                   </div>
                 </label>
               </div>
             </div>

             <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row gap-3 justify-end pt-2">
               <button
                 type="button"
                 onClick={handleCloseForm}
                 className="px-4 py-2.5 rounded-xl border border-(--border-color) text-(--text-secondary-color) hover:text-(--text-primary-color) hover:bg-(--bg-card-hover-color) text-sm font-medium transition-all cursor-pointer"
               >
                  {t('common.cancel')}
                </button>
               <button
                 id="form-user-submit"
                 type="submit"
                 disabled={formLoading}
                 className="flex items-center gap-2 px-4 py-2.5 bg-(--blue-color3) hover:bg-(--blue-color2) text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
               >
                 {formLoading ? (
                     <div className="w-4 h-4 border-2 border-(--spinner-track) border-t-(--spinner-top) rounded-full animate-spin" />
                 ) : editingUser ? (
                   <Pencil size={15} />
                 ) : (
                   <UserPlus size={15} />
                 )}
                  {formLoading ? (editingUser ? t('users.saveSaving') : t('users.saveCreating')) : editingUser ? t('users.saveChanges') : t('users.createUser')}
               </button>
             </div>
           </form>
         </div>
       )}

      <div className="bg-(--bg-card-color) border border-(--border-color) rounded-xl sm:rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-(--border-color)">
          <h2 className="text-sm font-bold text-(--text-primary-color)">Contas Cadastradas</h2>
        </div>

        {loadingUsers ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-6 h-6 border-2 border-(--spinner-track) border-t-(--blue-color3) rounded-full animate-spin" />
            <span className="text-sm text-(--text-secondary-color)">{t('users.loading')}</span>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Users size={36} className="text-(--text-tercery-color)" />
            <p className="text-sm text-(--text-secondary-color)">{t('users.noResults')}</p>
          </div>
        ) : (
          <div className="divide-y divide-(--border-color)">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-(--bg-card-hover-color) transition-colors">
                <div className="w-10 h-10 rounded-full bg-(--avatar-bg) flex items-center justify-center shrink-0 font-bold text-(--text-on-accent) text-sm select-none">
                  {u.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-(--text-primary-color) truncate">{u.name}</p>
                    {u.id === currentUser?.id && (
                      <span className="text-xs px-1.5 py-0.5 rounded-md bg-(--bg-raised) text-(--text-secondary-color) font-medium">{t('users.you')}</span>
                    )}
                  </div>
                  <p className="text-xs text-(--text-secondary-color) truncate">{u.email}</p>
                  {u.storeName && <p className="text-xs text-(--text-tercery-color) truncate flex items-center gap-1"><Store size={10} />{u.storeName}</p>}
                  {u.cargo && <p className="text-xs text-(--text-tercery-color) truncate">{u.cargo}</p>}
                </div>

                <div className="shrink-0">
                  {u.role === 'admin' ? (
                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-(--yellow-color2) border border-yellow-500/20 font-semibold">
                      <Shield size={11} />
                      {t('users.roleAdmin')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-(--bg-subtle) text-(--text-secondary-color) border border-(--border-color) font-semibold">
                      <UserCircle size={11} />
                      {t('users.roleUser')}
                    </span>
                  )}
                </div>

                <p className="text-xs text-(--text-secondary-color) shrink-0 hidden md:block">{u.createdAt}</p>

                <button
                  onClick={() => handleEditUser(u)}
                  title={t('common.edit')}
                  className="p-2 rounded-lg text-(--text-secondary-color) hover:text-(--yellow-color2) hover:bg-amber-500/10 transition-all cursor-pointer shrink-0"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDeleteUser(u.id, u.name)}
                  disabled={deletingId === u.id || u.id === currentUser?.id}
                  title={u.id === currentUser?.id ? t('users.modalCantDeleteSelf') : t('common.delete')}
                  className="p-2 rounded-lg text-(--text-secondary-color) hover:text-(--red-color4) hover:bg-(--danger-bg) transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer shrink-0"
                >
                  {deletingId === u.id ? (
                    <div className="w-4 h-4 border-2 border-(--spinner-track) border-t-(--red-color4) rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4 border-t border-(--border-color)">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page === 0}
              className="p-2 rounded-lg border border-(--border-color) text-(--text-secondary-color) hover:text-(--text-primary-color) hover:bg-(--bg-card-hover-color) disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToPage(i)}
                className={`min-w-[32px] h-8 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  page === i
                    ? 'bg-(--blue-color3) text-white'
                    : 'border border-(--border-color) text-(--text-secondary-color) hover:text-(--text-primary-color) hover:bg-(--bg-card-hover-color)'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg border border-(--border-color) text-(--text-secondary-color) hover:text-(--text-primary-color) hover:bg-(--bg-card-hover-color) disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Usuarios;
