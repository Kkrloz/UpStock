import { useState, useEffect } from 'react';
import {
  Users, UserPlus, Trash2, Shield, UserCircle,
  Mail, Lock, User, Briefcase, AlertCircle,
  CheckCircle2, X, Eye, EyeOff, Crown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function Usuarios() {
  const { user: currentUser, createUser, deleteUser, listUsers } = useAuth();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', cargo: '', role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Delete state
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const list = await listUsers();
      setUsers(list);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.name || !formData.email || !formData.password) {
      setFormError('Preencha nome, e-mail e senha.');
      return;
    }
    if (formData.password.length < 6) {
      setFormError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setFormLoading(true);
    try {
      await createUser(formData);
      setFormSuccess(`Usuário "${formData.name}" criado com sucesso!`);
      setFormData({ name: '', email: '', password: '', cargo: '', role: 'user' });
      await fetchUsers();
      setTimeout(() => {
        setShowForm(false);
        setFormSuccess('');
      }, 1800);
    } catch (err) {
      setFormError(err.message || 'Erro ao criar usuário.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Deseja realmente remover o usuário "${userName}"?`)) return;
    setDeletingId(userId);
    setDeleteError('');
    try {
      await deleteUser(userId);
      await fetchUsers();
    } catch (err) {
      setDeleteError(err.message || 'Erro ao remover usuário.');
    } finally {
      setDeletingId(null);
    }
  };

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount = users.filter((u) => u.role === 'user').length;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Cabeçalho da página */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-(--text-primary-color) tracking-tight flex items-center gap-2">
            <Users size={20} className="sm:size-6 text-(--blue-color3)" />
            Gerenciamento de Usuários
          </h1>
          <p className="text-sm text-(--text-secondary-color) mt-1">
            Cadastre e gerencie as contas de acesso ao UpStock
          </p>
        </div>
        <button
          id="btn-novo-usuario"
          onClick={() => { setShowForm(true); setFormError(''); setFormSuccess(''); }}
          className="flex items-center gap-2 bg-(--blue-color3) hover:bg-(--blue-color2) text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all duration-200 active:scale-[0.98] shadow-md cursor-pointer"
        >
          <UserPlus size={16} />
          Novo Usuário
        </button>
      </div>

      {/* Cards de resumo */}
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

      {/* Erro de delete */}
      {deleteError && (
        <div className="flex items-center gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-(--red-color4) text-sm rounded-xl">
          <AlertCircle size={16} className="shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Formulário de novo usuário */}
      {showForm && (
        <div className="bg-(--bg-card-color) border border-(--border-color) rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-(--text-primary-color) flex items-center gap-2">
              <UserPlus size={18} className="text-(--blue-color3)" />
              Novo Usuário
            </h2>
            <button
              onClick={() => { setShowForm(false); setFormError(''); setFormSuccess(''); }}
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
            {/* Nome */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">Nome Completo *</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary-color)" />
                <input
                  id="form-user-name"
                  name="name"
                  type="text"
                  placeholder="Nome do usuário"
                  value={formData.name}
                  onChange={handleFormChange}
                  disabled={formLoading}
                   className="w-full pl-9 pr-3 py-2.5 bg-(--input-bg) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--text-secondary-color) focus:outline-none focus:border-(--input-border-focus) focus:ring-1 focus:ring-(--input-border-focus) text-sm transition-all"
                   required
                 />
               </div>
             </div>

             {/* Email */}
             <div className="flex flex-col gap-1">
               <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">E-mail *</label>
               <div className="relative">
                 <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary-color)" />
                 <input
                   id="form-user-email"
                   name="email"
                   type="email"
                   placeholder="email@exemplo.com"
                   value={formData.email}
                   onChange={handleFormChange}
                   disabled={formLoading}
                   className="w-full pl-9 pr-3 py-2.5 bg-(--input-bg) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--text-secondary-color) focus:outline-none focus:border-(--input-border-focus) focus:ring-1 focus:ring-(--input-border-focus) text-sm transition-all"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">Senha *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary-color)" />
                <input
                  id="form-user-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleFormChange}
                  disabled={formLoading}
                   className="w-full pl-9 pr-9 py-2.5 bg-(--input-bg) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--text-secondary-color) focus:outline-none focus:border-(--input-border-focus) focus:ring-1 focus:ring-(--input-border-focus) text-sm transition-all"
                   required
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

            {/* Cargo */}
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

              {/* Perfil de acesso */}
              <div className="flex flex-col gap-1 sm:col-span-2">
               <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">Perfil de Acesso</label>
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
                     <p className="text-sm font-bold text-(--text-primary-color)">Usuário</p>
                    <p className="text-xs text-(--text-secondary-color)">Acesso ao painel operacional</p>
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
                     <p className="text-sm font-bold text-(--text-primary-color)">Administrador</p>
                    <p className="text-xs text-(--text-secondary-color)">Acesso total + gestão de usuários</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Botões */}
            <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(''); setFormSuccess(''); }}
                className="px-4 py-2.5 rounded-xl border border-(--border-color) text-(--text-secondary-color) hover:text-(--text-primary-color) hover:bg-(--bg-card-hover-color) text-sm font-medium transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="form-user-submit"
                type="submit"
                disabled={formLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-(--blue-color3) hover:bg-(--blue-color2) text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {formLoading ? (
                    <div className="w-4 h-4 border-2 border-(--spinner-track) border-t-(--spinner-top) rounded-full animate-spin" />
                ) : (
                  <UserPlus size={15} />
                )}
                {formLoading ? 'Criando...' : 'Criar Usuário'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de usuários */}
      <div className="bg-(--bg-card-color) border border-(--border-color) rounded-xl sm:rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-(--border-color)">
          <h2 className="text-sm font-bold text-(--text-primary-color)">Contas Cadastradas</h2>
        </div>

        {loadingUsers ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-6 h-6 border-2 border-(--spinner-track) border-t-(--blue-color3) rounded-full animate-spin" />
            <span className="text-sm text-(--text-secondary-color)">Carregando usuários...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Users size={36} className="text-(--text-tercery-color)" />
            <p className="text-sm text-(--text-secondary-color)">Nenhum usuário cadastrado.</p>
          </div>
        ) : (
          <div className="divide-y divide-(--border-color)">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-(--bg-card-hover-color) transition-colors">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-(--avatar-bg) flex items-center justify-center shrink-0 font-bold text-(--text-on-accent) text-sm select-none">
                  {u.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-(--text-primary-color) truncate">{u.name}</p>
                    {u.id === currentUser?.id && (
                      <span className="text-xs px-1.5 py-0.5 rounded-md bg-(--bg-raised) text-(--text-secondary-color) font-medium">você</span>
                    )}
                  </div>
                  <p className="text-xs text-(--text-secondary-color) truncate">{u.email}</p>
                  {u.cargo && <p className="text-xs text-(--text-tercery-color) truncate">{u.cargo}</p>}
                </div>

                {/* Role badge */}
                <div className="shrink-0">
                  {u.role === 'admin' ? (
                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-(--yellow-color2) border border-yellow-500/20 font-semibold">
                      <Shield size={11} />
                      Admin
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-(--bg-subtle) text-(--text-secondary-color) border border-(--border-color) font-semibold">
                      <UserCircle size={11} />
                      Usuário
                    </span>
                  )}
                </div>

                {/* Data */}
                <p className="text-xs text-(--text-secondary-color) shrink-0 hidden md:block">{u.createdAt}</p>

                {/* Botão remover */}
                <button
                  onClick={() => handleDeleteUser(u.id, u.name)}
                  disabled={deletingId === u.id || u.id === currentUser?.id}
                  title={u.id === currentUser?.id ? 'Não é possível remover sua própria conta' : 'Remover usuário'}
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
      </div>
    </div>
  );
}

export default Usuarios;
