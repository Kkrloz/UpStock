import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, DollarSign, TrendingUp, AlertTriangle, Download, Store, FileText } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

function exportCsv(data, filename) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map((row) => headers.map((h) => `"${row[h] ?? ''}"`).join(',')),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function Relatorios() {
  const { isAdmin } = useAuth();
  const { t, i18n } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const abort = new AbortController();
    Promise.all([
      api.get('/reports/summary', { signal: abort.signal }),
      api.get('/reports/inventory', { signal: abort.signal }),
    ])
      .then(([sumRes, invRes]) => {
        setSummary(sumRes.data);
        setInventory(invRes.data);
      })
      .catch((err) => {
        if (err.code !== 'ERR_CANCELED') {
          setError(t('reports.errorLoad'));
          console.error(err);
        }
      })
      .finally(() => setLoading(false));
    return () => abort.abort();
  }, []);

  const formatCurrency = (v) =>
    new Intl.NumberFormat(i18n.language || 'pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const handleExportInventory = () => {
    if (!inventory.length) return;
    const data = inventory.map((item) => ({
      [t('reports.tableProduct')]: item.productName,
      [t('reports.tablePrice')]: item.price,
      [t('reports.tableStock')]: item.quantity,
      [t('reports.tableTotal')]: item.totalValue,
      [t('products.tableStore')]: item.storeName || (item.userEmail ? t('products.noStore') : ''),
    }));
    exportCsv(data, 'inventario');
  };

  const summaryCards = summary
    ? [
        {
          label: t('reports.tableProduct') + 's',
          value: summary.totalProducts,
          icon: Package,
          color: 'text-(--blue-color3)',
          bg: 'bg-blue-500/10',
        },
        {
          label: t('reports.tableTotal'),
          value: formatCurrency(summary.totalValue),
          icon: DollarSign,
          color: 'text-(--green-color4)',
          bg: 'bg-emerald-500/10',
        },
        {
          label: t('movements.title'),
          value: summary.movementsThisMonth,
          icon: TrendingUp,
          color: 'text-(--purple-color2)',
          bg: 'bg-purple-500/10',
        },
        {
          label: t('products.lowStock'),
          value: summary.lowStockCount,
          icon: AlertTriangle,
          color: 'text-(--yellow-color2)',
          bg: 'bg-amber-500/10',
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-(--text-primary-color)">{t('reports.title')}</h1>
          <p className="text-sm sm:text-base text-(--text-secondary-color)">
            {t('reports.subtitle')}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-(--red-color4) text-sm rounded-xl">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-(--bg-card-color) border border-(--border-color) rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-(--bg-card-hover-color)" />
                <div className="min-w-0 flex-1">
                  <div className="h-3 bg-(--bg-card-hover-color) rounded w-20 mb-2" />
                  <div className="h-5 bg-(--bg-card-hover-color) rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {summaryCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="bg-(--bg-card-color) border border-(--border-color) rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={card.color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-(--text-secondary-color) font-medium uppercase tracking-wider truncate">
                      {card.label}
                    </p>
                    <p className="text-lg sm:text-xl font-extrabold text-(--text-primary-color) truncate">
                      {card.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-(--bg-card-color) border border-(--border-color) rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-(--border-color)">
            <h2 className="text-sm font-bold text-(--text-primary-color) flex items-center gap-2">
              <FileText size={16} className="text-(--blue-color3)" />
              {t('reports.subtitle')}
            </h2>
            <button
              type="button"
              onClick={handleExportInventory}
              disabled={!inventory.length}
              className="flex items-center gap-1.5 bg-(--blue-color3) hover:bg-(--blue-color2) disabled:opacity-50 disabled:pointer-events-none text-white font-bold py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Download size={14} />
              <span className="hidden xs:inline">{t('reports.exportCSV')}</span>
              <span className="xs:hidden">CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-(--border-color) bg-(--bg-subtle) text-xs font-semibold text-(--text-secondary-color) uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-5">{t('reports.tableProduct')}</th>
                  <th className="py-3.5 px-4 sm:px-5">{t('reports.tablePrice')}</th>
                  <th className="py-3.5 px-4 sm:px-5">{t('reports.tableStock')}</th>
                  <th className="py-3.5 px-4 sm:px-5">{t('reports.tableTotal')}</th>
                  {isAdmin && <th className="py-3.5 px-4 sm:px-5">{t('products.tableStore')}</th>}
                </tr>
            </thead>
            <tbody className="divide-y divide-(--border-color) text-sm">
              {inventory.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="py-12 text-center text-(--text-secondary-color)">
                    {t('reports.noData')}
                  </td>
                </tr>
              )}
              {inventory.map((item, i) => (
                <tr
                  key={i}
                  className="hover:bg-(--bg-card-hover-color) transition-colors"
                >
                  <td className="py-3.5 px-4 sm:px-5 font-semibold text-(--text-primary-color)">
                    {item.productName}
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 text-(--text-primary-color)">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 text-(--text-primary-color)">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 font-semibold text-(--text-primary-color)">
                    {formatCurrency(item.totalValue)}
                  </td>
                  {isAdmin && (
                    <td className="py-3.5 px-4 sm:px-5 text-(--text-secondary-color)">
                      {item.storeName ? (
                        <span className="flex items-center gap-1">
                          <Store size={14} className="text-(--blue-color3)" />
                          {item.storeName}
                        </span>
                      ) : item.userEmail ? (
                        <span
                          title={`${t('users.tableEmail')}: ${item.userEmail}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-(--yellow-color2) border border-amber-500/20"
                        >
                          {t('products.noStore')}
                        </span>
                      ) : null}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Relatorios;
