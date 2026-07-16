import { useState, useEffect, useCallback } from 'react';
import { ArrowUpRight, ArrowDownRight, Search, Filter, Plus, X, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSse } from '../../hooks/useSse';

const DATE_RANGES = [
  { label: 'Todas as datas', days: null },
  { label: 'Hoje', days: 0 },
  { label: 'Esta Semana', days: 7 },
  { label: 'Este Mês', days: 30 },
  { label: 'Este Ano', days: 365 },
];

function toISODate(daysAgo) {
  if (daysAgo == null) return null;
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function toISODateEnd(daysAgo) {
  if (daysAgo == null) return null;
  const d = new Date();
  if (daysAgo === 0) {
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }
  return new Date().toISOString();
}

function Movimentacoes() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [dateRangeIndex, setDateRangeIndex] = useState(0);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productId: '', productName: '', type: 'ENTRADA', quantity: '', userName: user?.name || '',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadData = useCallback((opts = {}) => {
    const params = { page: opts.page ?? 0 };
    if (opts.search) params.search = opts.search;
    if (opts.type && opts.type !== 'todos') params.type = opts.type;
    if (opts.startDate) params.startDate = opts.startDate;
    if (opts.endDate) params.endDate = opts.endDate;

    const abort = new AbortController();
    Promise.all([
      api.get('/movements', { params, signal: abort.signal }),
      api.get('/products', { params: { size: 5000 }, signal: abort.signal }),
    ])
      .then(([movRes, prodRes]) => {
        setTransactions(movRes.data.content || []);
        setTotalPages(movRes.data.totalPages || 0);
        setProducts(prodRes.data.content || []);
      })
      .catch((err) => { if (err.code !== 'ERR_CANCELED') console.error('Erro ao carregar dados:', err); })
      .finally(() => setLoading(false));
    return abort;
  }, []);

  useEffect(() => {
    const abort = loadData();
    return () => abort.abort();
  }, []);

  useEffect(() => {
    const range = DATE_RANGES[dateRangeIndex];
    const timer = setTimeout(() => {
      setPage(0);
      loadData({
        page: 0,
        search: search || undefined,
        type: typeFilter,
        startDate: toISODate(range.days),
        endDate: toISODateEnd(range.days),
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const reloadWithFilters = useCallback((targetPage) => {
    const range = DATE_RANGES[dateRangeIndex];
    loadData({
      page: targetPage ?? page,
      search: search || undefined,
      type: typeFilter,
      startDate: toISODate(range.days),
      endDate: toISODateEnd(range.days),
    });
  }, [search, page, typeFilter, dateRangeIndex, loadData]);

  useSse({
    events: ['MOVEMENT_CREATED', 'PRODUCT_CHANGED'],
    onEvent: reloadWithFilters,
    token: localStorage.getItem('upstock_token'),
    enabled: !loading,
  });

  const formatDateTime = (ts) =>
    new Date(ts).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const typeLabel = (type) => (type === 'ENTRADA' ? 'Entrada' : 'Saída');

  const openCreate = useCallback(() => {
    setFormData({ productId: '', productName: '', type: 'ENTRADA', quantity: '', userName: user?.name || '' });
    setFormError('');
    setShowModal(true);
  }, []);

  const handleProductChange = (e) => {
    const pid = parseInt(e.target.value, 10);
    const prod = products.find((p) => p.id === pid);
    setFormData({
      ...formData,
      productId: pid,
      productName: prod ? prod.name : '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.productId) {
      setFormError('Selecione um produto.');
      return;
    }
    const qty = parseInt(formData.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setFormError('Informe uma quantidade válida.');
      return;
    }
    if (!formData.userName.trim()) {
      setFormError('Informe o nome do operador.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/movements', {
        productId: formData.productId,
        productName: formData.productName,
        type: formData.type,
        quantity: qty,
        userName: formData.userName.trim(),
      });
      setShowModal(false);
      reloadWithFilters();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erro ao registrar movimentação.');
    } finally {
      setSaving(false);
    }
  };

  const goToPage = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return;
    setPage(newPage);
    const range = DATE_RANGES[dateRangeIndex];
    loadData({
      page: newPage,
      search: search || undefined,
      type: typeFilter,
      startDate: toISODate(range.days),
      endDate: toISODateEnd(range.days),
    });
  };

  const handleTypeChange = (type) => {
    setTypeFilter(type);
    setPage(0);
    const range = DATE_RANGES[dateRangeIndex];
    loadData({
      page: 0,
      search: search || undefined,
      type,
      startDate: toISODate(range.days),
      endDate: toISODateEnd(range.days),
    });
  };

  const handleDateChange = (index) => {
    setDateRangeIndex(index);
    setShowDateMenu(false);
    setPage(0);
    const range = DATE_RANGES[index];
    loadData({
      page: 0,
      search: search || undefined,
      type: typeFilter,
      startDate: toISODate(range.days),
      endDate: toISODateEnd(range.days),
    });
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-(--text-primary-color)">Movimentações</h1>
          <p className="text-sm sm:text-base text-(--text-secondary-color)">
            Histórico completo de entradas e saídas do estoque.
          </p>
        </div>
        <button type="button" onClick={openCreate} className="group flex items-center gap-1.5 sm:gap-2 bg-(--blue-color3) hover:bg-(--blue-color2) active:scale-95 text-white font-bold py-2 sm:py-2.5 px-3 sm:px-5 rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-200 cursor-pointer text-sm sm:text-base">
          <Plus size={18} className="sm:size-5 transition-transform duration-200 group-hover:rotate-90" />
          <span className="hidden xs:inline">Registrar Movimentação</span>
          <span className="xs:hidden">Registrar</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center bg-(--bg-card-color) border border-(--border-color) rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg w-full">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary-color)" size={18} />
          <input
            type="text"
            placeholder="Pesquisar por produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-(--bg-card-hover-color) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--text-secondary-color) focus:outline-none focus:border-gray-500 text-sm"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto relative">
          <button
            type="button"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center justify-center gap-2 border border-(--border-color) hover:bg-(--bg-card-hover-color) text-(--text-primary-color) font-semibold py-2 px-4 rounded-xl text-sm transition-all w-full sm:w-auto cursor-pointer"
          >
            <Filter size={16} />
            {typeFilter === 'todos' ? 'Tipo' : typeLabel(typeFilter)}
          </button>
          {showFilterMenu && (
            <div className="absolute top-full right-0 mt-1 bg-(--bg-card-color) border border-(--border-color) rounded-xl shadow-2xl z-10 min-w-[160px] overflow-hidden">
              {['todos', 'ENTRADA', 'SAIDA'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { setShowFilterMenu(false); handleTypeChange(opt); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                    typeFilter === opt
                      ? 'bg-(--active-bg) text-(--badge-admin-text) font-semibold'
                      : 'text-(--text-primary-color) hover:bg-(--bg-card-hover-color)'
                  }`}
                >
                  {opt === 'todos' ? 'Todos' : typeLabel(opt)}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowDateMenu(!showDateMenu)}
            className={`flex items-center justify-center gap-2 border ${dateRangeIndex > 0 ? 'border-(--blue-border-soft) bg-(--active-bg) text-(--badge-admin-text)' : 'border-(--border-color) text-(--text-primary-color)'} hover:bg-(--bg-card-hover-color) font-semibold py-2 px-4 rounded-xl text-sm transition-all w-full sm:w-auto cursor-pointer`}
          >
            <Filter size={16} />
            {DATE_RANGES[dateRangeIndex].label}
          </button>
          {showDateMenu && (
            <div className="absolute top-full right-0 mt-1 bg-(--bg-card-color) border border-(--border-color) rounded-xl shadow-2xl z-10 min-w-[160px] overflow-hidden" style={{ right: 0 }}>
              {DATE_RANGES.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDateChange(i)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                    dateRangeIndex === i
                      ? 'bg-(--active-bg) text-(--badge-admin-text) font-semibold'
                      : 'text-(--text-primary-color) hover:bg-(--bg-card-hover-color)'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-(--bg-card-color) border border-(--border-color) rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-(--border-color) text-xs font-semibold text-(--text-secondary-color) uppercase">
                <th className="py-3 px-4">Direção</th>
                <th className="py-3 px-4">Produto</th>
                <th className="py-3 px-4">Quantidade</th>
                <th className="py-3 px-4">Data/Hora</th>
                <th className="py-3 px-4">Usuário</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-color) text-sm text-(--text-primary-color)">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-(--text-secondary-color)">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-(--spinner-track) border-t-(--blue-color3) rounded-full animate-spin" />
                      <span>Carregando movimentações...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-(--text-secondary-color)">
                    {search || typeFilter !== 'todos' || dateRangeIndex > 0
                      ? 'Nenhuma movimentação encontrada para esta busca.'
                      : 'Nenhuma movimentação registrada.'}
                  </td>
                </tr>
              )}
              {transactions.map((t) => {
                const IsInput = t.type === 'ENTRADA';
                const Icon = IsInput ? ArrowUpRight : ArrowDownRight;
                return (
                  <tr key={t.id} className="hover:bg-(--bg-card-hover-color) transition-colors">
                    <td className="py-3.5 px-4 font-semibold">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        IsInput ? 'bg-emerald-500/10 text-(--green-color4)' : 'bg-rose-500/10 text-(--red-color4)'
                      }`}>
                        <Icon size={14} />
                        {typeLabel(t.type)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-(--text-primary-color) font-medium">{t.productName}</td>
                    <td className={`py-3.5 px-4 font-bold ${IsInput ? 'text-(--green-color4)' : 'text-(--red-color4)'}`}>
                      {IsInput ? `+${t.quantity}` : `-${t.quantity}`}
                    </td>
                    <td className="py-3.5 px-4 text-(--text-secondary-color)">{formatDateTime(t.timestamp)}</td>
                    <td className="py-3.5 px-4 text-(--text-secondary-color)">{t.userName}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-(--blue-color3)">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-(--bg-card-color) border border-(--border-color) rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-(--text-primary-color)">Registrar Movimentação</h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-(--text-secondary-color) hover:text-(--text-primary-color) hover:bg-(--bg-card-hover-color) transition-all cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="flex items-center gap-2.5 p-3 mb-4 bg-rose-500/10 border border-rose-500/20 text-(--red-color4) text-sm rounded-xl">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">Produto *</label>
                <select
                  value={formData.productId}
                  onChange={handleProductChange}
                  className="w-full px-3 py-2.5 bg-(--input-bg) border border-(--border-color) rounded-xl text-(--text-primary-color) focus:outline-none focus:border-(--input-border-focus) text-sm"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {p.quantity} em estoque</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">Tipo *</label>
                <div className="flex gap-3">
                  {['ENTRADA', 'SAIDA'].map((opt) => (
                    <label
                      key={opt}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all text-sm font-semibold ${
                        formData.type === opt
                          ? opt === 'ENTRADA'
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-(--green-color4)'
                            : 'border-rose-500/50 bg-rose-500/10 text-(--red-color4)'
                          : 'border-(--border-color) bg-(--bg-subtle) text-(--text-secondary-color) hover:bg-(--input-bg)'
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={opt}
                        checked={formData.type === opt}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="hidden"
                      />
                      {opt === 'ENTRADA' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      {typeLabel(opt)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">Quantidade *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2.5 bg-(--input-bg) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--text-secondary-color) focus:outline-none focus:border-(--input-border-focus) text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">Operador *</label>
                <input
                  type="text"
                  placeholder="Nome do operador"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-(--input-bg) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--text-secondary-color) focus:outline-none focus:border-(--input-border-focus) text-sm"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-(--border-color) text-(--text-secondary-color) hover:text-(--text-primary-color) hover:bg-(--bg-card-hover-color) text-sm font-medium transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 bg-(--blue-color3) hover:bg-(--blue-color2) text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-(--spinner-track) border-t-(--spinner-top) rounded-full animate-spin" />
                  ) : (
                    <Plus size={15} />
                  )}
                  {saving ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Movimentacoes;
