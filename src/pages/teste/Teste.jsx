import { useState, useEffect } from 'react';
import { Package, ArrowUpRight, ArrowDownRight, AlertTriangle, Activity, DollarSign } from 'lucide-react';
import api from '../../services/api';

function Teste() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abort = new AbortController();
    Promise.all([
      api.get('/products', { signal: abort.signal }),
      api.get('/movements', { signal: abort.signal }),
    ])
      .then(([prodRes, movRes]) => {
        if (!abort.signal.aborted) {
          setProducts(prodRes.data);
          setMovements(movRes.data);
        }
      })
      .catch((err) => { if (!abort.signal.aborted) console.error('Erro ao carregar dashboard:', err); })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDateTime = (ts) =>
    new Date(ts).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const today = new Date().toDateString();

  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.quantity <= 5);
  const todayEntries = movements.filter(
    (m) => m.type === 'ENTRADA' && new Date(m.timestamp).toDateString() === today
  );
  const todayExits = movements.filter(
    (m) => m.type === 'SAIDA' && new Date(m.timestamp).toDateString() === today
  );
  const totalStockValue = products.reduce(
    (sum, p) => sum + (p.price || 0) * (p.quantity || 0), 0
  );

  const recentMovements = movements.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-(--spinner-track) border-t-(--blue-color3) rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Produtos Cadastrados',
      value: totalProducts.toString(),
      change: `${totalProducts} produto(s) no catálogo`,
      isPositive: true,
      icon: Package,
      color: 'var(--blue-color3)',
    },
    {
      label: 'Entradas (Hoje)',
      value: todayEntries.length.toString(),
      change: `${todayEntries.reduce((s, m) => s + m.quantity, 0)} unidades`,
      isPositive: true,
      icon: ArrowUpRight,
      color: 'var(--green-color4)',
    },
    {
      label: 'Saídas (Hoje)',
      value: todayExits.length.toString(),
      change: `${todayExits.reduce((s, m) => s + m.quantity, 0)} unidades`,
      isPositive: false,
      icon: ArrowDownRight,
      color: 'var(--red-color4)',
    },
    {
      label: 'Alertas de Estoque',
      value: lowStockProducts.length.toString(),
      change: 'Itens com estoque baixo',
      isPositive: false,
      icon: AlertTriangle,
      color: 'var(--yellow-color2)',
    },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-(--text-primary-color)">Visão Geral</h1>
        <p className="text-sm sm:text-base text-(--text-secondary-color)">
          Bem-vindo ao painel de gerenciamento do UpStock. Aqui está o resumo das operações de hoje.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-(--bg-card-color) border border-(--border-color) rounded-2xl p-6 flex flex-col gap-4 hover:border-gray-600 transition-all duration-300 shadow-lg hover:translate-y-[-2px]"
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold text-(--text-secondary-color)">{stat.label}</span>
                <div
                  className="p-2 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
                >
                  <Icon size={20} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-2xl sm:text-3xl font-bold text-(--text-primary-color)">{stat.value}</span>
                <span
                  className={`text-xs font-medium ${
                    stat.isPositive
                      ? 'text-(--green-color4)'
                      : stat.label.includes('Alertas')
                      ? 'text-(--yellow-color2)'
                      : 'text-(--red-color4)'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-(--bg-card-color) border border-(--border-color) rounded-2xl p-6 lg:col-span-2 flex flex-col gap-4 shadow-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold text-(--text-primary-color) flex items-center gap-2">
              <Activity size={18} className="sm:size-5 text-(--blue-color3)" />
              Últimas Movimentações
            </h2>
            <button className="text-xs text-(--blue-color3) hover:underline font-semibold">Ver todas</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-(--border-color) text-xs font-semibold text-(--text-secondary-color) uppercase">
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4">Qtd.</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Operador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border-color) text-sm text-(--text-primary-color)">
                {recentMovements.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-(--text-secondary-color)">
                      Nenhuma movimentação recente.
                    </td>
                  </tr>
                )}
                {recentMovements.map((move) => (
                  <tr key={move.id} className="hover:bg-(--bg-card-hover-color) transition-colors">
                    <td className="py-3.5 px-4 font-semibold">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                          move.type === 'ENTRADA'
                            ? 'bg-emerald-500/10 text-(--green-color4)'
                            : 'bg-rose-500/10 text-(--red-color4)'
                        }`}
                      >
                        {move.type === 'ENTRADA' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-(--text-primary-color) font-medium">{move.productName}</td>
                    <td className={`py-3.5 px-4 font-bold ${move.type === 'ENTRADA' ? 'text-(--green-color4)' : 'text-(--red-color4)'}`}>
                      {move.type === 'ENTRADA' ? `+${move.quantity}` : `-${move.quantity}`}
                    </td>
                    <td className="py-3.5 px-4 text-(--text-secondary-color)">{formatDateTime(move.timestamp)}</td>
                    <td className="py-3.5 px-4 text-(--text-secondary-color)">{move.userName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-(--bg-card-color) border border-(--border-color) rounded-2xl p-6 flex flex-col gap-4 shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold text-(--text-primary-color) flex items-center gap-2">
              <DollarSign size={18} className="sm:size-5 text-(--green-color4)" />
              Valor Total do Estoque
            </h2>
            <div className="flex flex-col gap-1 py-2">
              <span className="text-2xl sm:text-4xl font-extrabold text-(--text-primary-color)">
                {formatCurrency(totalStockValue)}
              </span>
              <span className="text-xs text-(--green-color4) flex items-center gap-1 font-medium">
                Valor estimado dos produtos armazenados
              </span>
            </div>
          </div>

          {lowStockProducts.length > 0 && (
            <div className="bg-(--bg-card-color) border border-(--border-color) rounded-2xl p-6 flex flex-col gap-4 shadow-lg">
              <h2 className="text-base sm:text-lg font-bold text-(--text-primary-color) flex items-center gap-2">
                <AlertTriangle size={18} className="text-(--yellow-color2)" />
                Ações Recomendadas
              </h2>
              <div className="flex flex-col gap-3">
                {lowStockProducts.slice(0, 3).map((p) => (
                  <div key={p.id} className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex flex-col gap-1">
                    <span className="text-xs font-bold text-(--yellow-color2)">Estoque Baixo: {p.name}</span>
                    <span className="text-xs text-(--text-secondary-color)">
                      Restam apenas {p.quantity} unidade(s) no almoxarifado principal.
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Teste;
