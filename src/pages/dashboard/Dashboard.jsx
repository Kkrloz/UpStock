import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, ArrowUpRight, ArrowDownRight, AlertTriangle, Activity, DollarSign } from 'lucide-react';
import api from '../../services/api';

function Dashboard() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abort = new AbortController();
    Promise.all([
      api.get('/products', { params: { size: 5000 }, signal: abort.signal }),
      api.get('/movements', { params: { size: 5 }, signal: abort.signal }),
    ])
      .then(([prodRes, movRes]) => {
        if (!abort.signal.aborted) {
          setProducts(prodRes.data.content || []);
          setMovements(movRes.data.content || []);
        }
      })
      .catch((err) => { if (!abort.signal.aborted) console.error('Erro ao carregar dashboard:', err); })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, []);

  const locale = i18n.language || 'pt-BR';
  const formatCurrency = (value) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(value);

  const formatDateTime = (ts) =>
    new Date(ts).toLocaleString(locale, {
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

  const entriesQty = todayEntries.reduce((s, m) => s + m.quantity, 0);
  const exitsQty = todayExits.reduce((s, m) => s + m.quantity, 0);

  const stats = [
    {
      label: t('dashboard.statProducts'),
      value: totalProducts.toString(),
      change: t('dashboard.statProductsChange', { count: totalProducts }),
      isPositive: true,
      icon: Package,
      color: 'var(--blue-color3)',
    },
    {
      label: t('dashboard.statEntries'),
      value: todayEntries.length.toString(),
      change: t('dashboard.statEntriesChange', { count: entriesQty }),
      isPositive: true,
      icon: ArrowUpRight,
      color: 'var(--green-color4)',
    },
    {
      label: t('dashboard.statExits'),
      value: todayExits.length.toString(),
      change: t('dashboard.statExitsChange', { count: exitsQty }),
      isPositive: false,
      icon: ArrowDownRight,
      color: 'var(--red-color4)',
    },
    {
      label: t('dashboard.statAlerts'),
      value: lowStockProducts.length.toString(),
      change: t('dashboard.statAlertsChange'),
      isPositive: false,
      icon: AlertTriangle,
      color: 'var(--yellow-color2)',
    },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-(--text-primary-color)">{t('dashboard.title')}</h1>
        <p className="text-sm sm:text-base text-(--text-secondary-color)">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-(--bg-card-color) border border-(--border-color) rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-(--bg-card-hover-color) rounded w-24 mb-4" />
              <div className="h-8 bg-(--bg-card-hover-color) rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
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
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-(--bg-card-color) border border-(--border-color) rounded-2xl p-6 lg:col-span-2 flex flex-col gap-4 shadow-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold text-(--text-primary-color) flex items-center gap-2">
              <Activity size={18} className="sm:size-5 text-(--blue-color3)" />
              {t('dashboard.recentMovements')}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-(--border-color) text-xs font-semibold text-(--text-secondary-color) uppercase">
                  <th className="py-3 px-4">{t('dashboard.tableType')}</th>
                  <th className="py-3 px-4">{t('dashboard.tableProduct')}</th>
                  <th className="py-3 px-4">{t('dashboard.tableQty')}</th>
                  <th className="py-3 px-4">{t('dashboard.tableDate')}</th>
                  <th className="py-3 px-4">{t('dashboard.tableOperator')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border-color) text-sm text-(--text-primary-color)">
                {recentMovements.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-(--text-secondary-color)">
                      {t('dashboard.noRecentMovements')}
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
                        {move.type === 'ENTRADA' ? t('dashboard.entry') : t('dashboard.exit')}
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
              {t('dashboard.totalStockValue')}
            </h2>
            <div className="flex flex-col gap-1 py-2">
              <span className="text-2xl sm:text-4xl font-extrabold text-(--text-primary-color)">
                {formatCurrency(totalStockValue)}
              </span>
              <span className="text-xs text-(--green-color4) flex items-center gap-1 font-medium">
                {t('dashboard.totalStockValueDesc')}
              </span>
            </div>
          </div>

          {lowStockProducts.length > 0 && (
            <div className="bg-(--bg-card-color) border border-(--border-color) rounded-2xl p-6 flex flex-col gap-4 shadow-lg">
              <h2 className="text-base sm:text-lg font-bold text-(--text-primary-color) flex items-center gap-2">
                <AlertTriangle size={18} className="text-(--yellow-color2)" />
                {t('dashboard.recommendedActions')}
              </h2>
              <div className="flex flex-col gap-3">
                {lowStockProducts.slice(0, 3).map((p) => (
                  <div key={p.id} className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex flex-col gap-1">
                    <span className="text-xs font-bold text-(--yellow-color2)">{t('dashboard.lowStockTitle', { name: p.name })}</span>
                    <span className="text-xs text-(--text-secondary-color)">
                      {t('dashboard.lowStockDesc', { qty: p.quantity })}
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

export default Dashboard;
