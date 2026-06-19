import { useState, useEffect } from 'react';
import { Plus, Search, Filter, AlertCircle, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';

function Produtos() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products')
      .then((res) => setProducts(res.data))
      .catch((err) => console.error('Erro ao carregar produtos:', err))
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const isLowStock = (qty) => qty <= 5;

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
        <button className="group flex items-center gap-1.5 sm:gap-2 bg-(--blue-color3) hover:bg-(--blue-color2) active:scale-95 text-white font-bold py-2 sm:py-2.5 px-3 sm:px-5 rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-200 cursor-pointer text-sm sm:text-base">
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
            className="w-full pl-10 pr-4 py-2 bg-(--bg-subtle) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--placeholder) focus:outline-none focus:border-(--input-border-focus) focus:shadow-(--input-shadow-focus) focus:bg-(--bg-card-hover-color) text-sm transition-all duration-200"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex items-center justify-center gap-2 border border-(--border-color) hover:border-(--blue-border-soft) hover:bg-(--hover-bg) hover:text-(--badge-admin-text) text-(--text-primary-color) font-semibold py-2 px-4 rounded-xl text-sm transition-all w-full sm:w-auto cursor-pointer">
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
                <th className="py-3.5 px-4 sm:px-5">Nome</th>
                <th className="py-3.5 px-4 sm:px-5">Preço</th>
                <th className="py-3.5 px-4 sm:px-5">Estoque</th>
                <th className="py-3.5 px-4 sm:px-5">Status</th>
                <th className="py-3.5 px-4 sm:px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-color) text-sm">
              {products.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-(--text-secondary-color)">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
              {products.map((product, idx) => {
                const lowStock = isLowStock(product.quantity);
                return (
                  <tr key={product.id} className={`transition-colors ${idx % 2 === 0 ? 'bg-(--bg-card-color)' : 'bg-(--bg-subtle)'} hover:bg-(--bg-card-hover-color) group relative`}>
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
                        <button className="p-2 hover:bg-(--active-bg) rounded-lg text-(--text-secondary-color) hover:text-(--badge-admin-text) transition-all cursor-pointer">
                          <Edit size={15} />
                        </button>
                        <button className="p-2 hover:bg-(--danger-bg) rounded-lg text-(--text-secondary-color) hover:text-(--red-color4) transition-all cursor-pointer">
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
    </div>
  );
}

export default Produtos;
