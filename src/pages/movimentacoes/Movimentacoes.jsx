import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Search, Calendar, Filter } from 'lucide-react';
import api from '../../services/api';

function Movimentacoes() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/movements')
      .then((res) => setTransactions(res.data))
      .catch((err) => console.error('Erro ao carregar movimentacoes:', err))
      .finally(() => setLoading(false));
  }, []);

  const formatDateTime = (ts) =>
    new Date(ts).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const typeLabel = (type) => (type === 'ENTRADA' ? 'Entrada' : 'Saída');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-(--spinner-track) border-t-(--blue-color3) rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-(--text-primary-color)">Movimentações</h1>
        <p className="text-sm sm:text-base text-(--text-secondary-color)">
          Histórico completo de entradas e saídas do estoque.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center bg-(--bg-card-color) border border-(--border-color) rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg w-full">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary-color)" size={18} />
          <input
            type="text"
            placeholder="Pesquisar por produto..."
            className="w-full pl-10 pr-4 py-2 bg-(--bg-card-hover-color) border border-(--border-color) rounded-xl text-(--text-primary-color) placeholder-(--text-secondary-color) focus:outline-none focus:border-gray-500 text-sm"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex items-center justify-center gap-2 border border-(--border-color) hover:bg-(--bg-card-hover-color) text-(--text-primary-color) font-semibold py-2 px-4 rounded-xl text-sm transition-all w-full sm:w-auto">
            <Calendar size={16} />
            Período
          </button>
          <button className="flex items-center justify-center gap-2 border border-(--border-color) hover:bg-(--bg-card-hover-color) text-(--text-primary-color) font-semibold py-2 px-4 rounded-xl text-sm transition-all w-full sm:w-auto">
            <Filter size={16} />
            Tipo
          </button>
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
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-(--text-secondary-color)">
                    Nenhuma movimentação encontrada.
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
    </div>
  );
}

export default Movimentacoes;
