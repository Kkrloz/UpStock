import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, AlertCircle, Edit, Trash2, X, Save, Store } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

function Produtos() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', quantity: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState('');

  const isAdmin = user?.role === 'admin';

  const loadProducts = useCallback(() => {
    const abort = new AbortController();
    api.get('/products', { signal: abort.signal })
      .then((res) => setProducts(res.data))
      .catch((err) => { if (err.code !== 'ERR_CANCELED') console.error('Erro ao carregar produtos:', err); })
      .finally(() => setLoading(false));
    return abort;
  }, []);

  useEffect(() => {
    const abort = loadProducts();
    return () => abort.abort();
  }, [loadProducts]);

  const formatPrice = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const isLowStock = (qty) => qty <= 5;

  const formatPriceInput = (raw) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    const num = parseInt(digits, 10) / 100;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };

  const unformatPrice = (formatted) => {
    if (!formatted) return '';
    const digits = formatted.replace(/\D/g, '');
    if (!digits) return '';
    return (parseInt(digits, 10) / 100).toFixed(2);
  };

  const openCreate = useCallback(() => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', quantity: '' });
    setFormError('');
    setShowModal(true);
  }, []);

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      quantity: product.quantity.toString(),
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('O nome do produto é obrigatório.');
      return;
    }
    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      setFormError('Informe um preço válido.');
      return;
    }
    const quantity = parseInt(formData.quantity, 10);
    if (isNaN(quantity) || quantity < 0) {
      setFormError('Informe uma quantidade válida.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price,
        quantity,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      setShowModal(false);
      loadProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erro ao salvar produto.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      setDeleteTarget(null);
      loadProducts();
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-(--spinner-track) border-t-(--blue-color3) rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-(--text-primary-color)">Produtos</h1>
          <p className="text-sm sm:text-base text-(--text-secondary-color)">
            Gerencie o catálogo de produtos, estoque e valores.
          </p>
        </div>
        <button type="button" onClick={openCreate} className="group flex items-center gap-1.5 sm:gap-2 bg-(--blue-color3) hover:bg-(--blue-color2) active:scale-95 text-white font-bold py-2 sm:py-2.5 px-3 sm:px-5 rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-200 cursor-pointer text-sm sm:text-base">
          <Plus size={18} className="sm:size-5 transition-transform duration-200 group-hover:rotate-90" />
          <span className="hidden xs:inline">Adicionar Produto</span>
          <span className="xs:hidden">Adicionar</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center bg-(--bg-card-color) border border-(--border-color) rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg w-full">
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary-color) group-focus-within:text-(--blue-color3) transition-colors duration-200" size={18} />
          <input
            type="text"
            placeholder="Pesquisar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-(--bg-subtle) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--placeholder) focus:outline-none focus:border-(--input-border-focus) focus:shadow-(--input-shadow-focus) focus:bg-(--bg-card-hover-color) text-sm transition-all duration-200"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button type="button" className="flex items-center justify-center gap-2 border border-(--border-color) hover:border-(--blue-border-soft) hover:bg-(--hover-bg) hover:text-(--badge-admin-text) text-(--text-primary-color) font-semibold py-2 px-4 rounded-xl text-sm transition-all w-full sm:w-auto cursor-pointer">
            <Filter size={16} />
            Filtros
          </button>
        </div>
      </div>

      <div className="bg-(--bg-card-color) border border-(--border-color) rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-(--border-color) bg-(--bg-subtle) text-xs font-semibold text-(--text-secondary-color) uppercase tracking-wider">
                {isAdmin && <th className="py-3.5 px-4 sm:px-5">Loja</th>}
                <th className="py-3.5 px-4 sm:px-5">Nome</th>
                <th className="py-3.5 px-4 sm:px-5">Preço</th>
                <th className="py-3.5 px-4 sm:px-5">Estoque</th>
                <th className="py-3.5 px-4 sm:px-5">Status</th>
                <th className="py-3.5 px-4 sm:px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-color) text-sm">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-(--text-secondary-color)">
                    {search ? 'Nenhum produto encontrado para esta busca.' : 'Nenhum produto cadastrado.'}
                  </td>
                </tr>
              )}
              {filtered.map((product, idx) => {
                const lowStock = isLowStock(product.quantity);
                return (
                  <tr key={product.id} className={`transition-colors ${idx % 2 === 0 ? 'bg-(--bg-card-color)' : 'bg-(--bg-subtle)'} hover:bg-(--bg-card-hover-color) group relative`}>
                    {isAdmin && (
                      <td className="py-3.5 px-4 sm:px-5 text-(--text-secondary-color) text-sm">
                        {product.storeName ? (
                          <div className="flex items-center gap-1.5">
                            <Store size={14} className="shrink-0 text-(--blue-color3)" />
                            <span>{product.storeName}</span>
                          </div>
                        ) : (
                          <span title={`Email da loja: ${product.userEmail}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-(--yellow-color2) border border-amber-500/20">
                            Sem estabelecimento
                          </span>
                        )}
                      </td>
                    )}
                    <td className="py-3.5 px-4 sm:px-5 font-semibold text-(--text-primary-color)">
                      <div>{product.name}</div>
                      {product.description && (
                        <div className="text-xs text-(--text-secondary-color) font-normal mt-0.5">{product.description}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 font-semibold text-(--text-primary-color)">
                      {formatPrice(product.price)}
                    </td>
                    <td className="py-3.5 px-4 sm:px-5">
                      <span className={`font-bold ${lowStock ? 'text-(--yellow-color2)' : 'text-(--text-primary-color)'}`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-5">
                      {lowStock ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-(--yellow-color2) border border-amber-500/20">
                          <AlertCircle size={12} />
                          Estoque Baixo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-(--green-color4) border border-emerald-500/20">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 text-right">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => openEdit(product)} className="p-2 hover:bg-(--active-bg) rounded-lg text-(--text-secondary-color) hover:text-(--badge-admin-text) transition-all cursor-pointer">
                          <Edit size={15} />
                        </button>
                        <button type="button" onClick={() => setDeleteTarget(product)} className="p-2 hover:bg-(--danger-bg) rounded-lg text-(--text-secondary-color) hover:text-(--red-color4) transition-all cursor-pointer">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-(--bg-card-color) border border-(--border-color) rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-(--text-primary-color)">
                {editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
              </h2>
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

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">Nome *</label>
                <input
                  type="text"
                  placeholder="Nome do produto"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-(--input-bg) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--text-secondary-color) focus:outline-none focus:border-(--input-border-focus) text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">Descrição</label>
                <textarea
                  placeholder="Descrição do produto (opcional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 bg-(--input-bg) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--text-secondary-color) focus:outline-none focus:border-(--input-border-focus) text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">Preço *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary-color) font-semibold text-sm pointer-events-none">R$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={formData.price ? formatPriceInput(formData.price) : ''}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw.length > 18) return;
                        setFormData({ ...formData, price: unformatPrice(raw) });
                      }}
                      className="w-full pl-10 pr-3 py-2.5 bg-(--input-bg) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--text-secondary-color) focus:outline-none focus:border-(--input-border-focus) text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-(--text-secondary-color) uppercase tracking-wider">Quantidade *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2.5 bg-(--input-bg) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--text-secondary-color) focus:outline-none focus:border-(--input-border-focus) text-sm"
                    required
                  />
                </div>
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
                    <Save size={15} />
                  )}
                  {saving ? 'Salvando...' : editingProduct ? 'Salvar Alterações' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-(--bg-card-color) border border-(--border-color) rounded-2xl shadow-2xl w-full max-w-sm p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-3 rounded-full bg-rose-500/10">
                <Trash2 size={24} className="text-(--red-color4)" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-(--text-primary-color)">Excluir Produto</h2>
                <p className="text-sm text-(--text-secondary-color) mt-1">
                  Tem certeza que deseja remover <strong>{deleteTarget.name}</strong>?
                </p>
              </div>
              <div className="flex gap-3 w-full pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-(--border-color) text-(--text-secondary-color) hover:text-(--text-primary-color) hover:bg-(--bg-card-hover-color) text-sm font-medium transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-(--red-color4) hover:bg-(--red-color5) text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {deleting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                  {deleting ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Produtos;
