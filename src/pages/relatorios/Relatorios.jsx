import { BarChart3, TrendingUp, Calendar, Download } from 'lucide-react';

function Relatorios() {
  const reportCards = [
    { title: 'Movimentações Mensais', desc: 'Resumo de todas as entradas e saídas do mês corrente.', icon: BarChart3, color: 'var(--blue-color3)' },
    { title: 'Giro de Estoque', desc: 'Análise de rotatividade de produtos e eficiência de armazenagem.', icon: TrendingUp, color: 'var(--green-color4)' },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-(--text-primary-color)">Relatórios</h1>
          <p className="text-(--text-secondary-color)">
            Gere e exporte relatórios detalhados sobre a saúde do seu estoque.
          </p>
        </div>
        <button className="group flex items-center gap-1.5 sm:gap-2 bg-(--blue-color3) hover:bg-(--blue-color2) active:scale-95 text-white font-bold py-2 sm:py-2.5 px-3 sm:px-5 rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-200 cursor-pointer text-sm sm:text-base">
          <Download size={16} className="sm:size-[18px] transition-transform duration-200 group-hover:-translate-y-0.5" />
          <span className="hidden xs:inline">Exportar Todos</span>
          <span className="xs:hidden">Exportar</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reportCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-(--bg-card-color) border border-(--border-color) rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                  <Icon size={24} />
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold text-(--text-primary-color)">{card.title}</h2>
                  <p className="text-sm text-(--text-secondary-color)">{card.desc}</p>
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-(--border-color) pt-4">
                <span className="text-xs text-(--text-secondary-color) flex items-center gap-1">
                  <Calendar size={14} />
                  Atualizado há 1 hora
                </span>
                <button className="bg-(--blue-color1) hover:bg-(--blue-color2) text-(--text-primary-color) font-semibold text-sm py-1.5 px-3 rounded-lg transition-colors">
                  Visualizar Relatório
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Relatorios;
