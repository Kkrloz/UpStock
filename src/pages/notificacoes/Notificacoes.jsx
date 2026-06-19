import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';

function Notificacoes() {
  const notifications = [
    { id: 1, type: 'alerta', title: 'Estoque Mínimo Atingido', message: 'O item "Mouse Logitech MX Master 3S" atingiu o estoque mínimo de 5 unidades. Reponha o estoque.', time: 'há 10 min' },
    { id: 2, type: 'sucesso', title: 'Entrada de Mercadoria Registrada', message: 'Lote de 20 unidades do "SSD Kingston NV2 1TB" foi conferido e adicionado com sucesso.', time: 'há 2 horas' },
    { id: 3, type: 'info', title: 'Backup de Segurança Concluído', message: 'O backup automático da base de dados do sistema foi concluído sem erros.', time: 'Ontem, 23:00' },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-(--text-primary-color)">Notificações</h1>
          <p className="text-sm sm:text-base text-(--text-secondary-color)">
            Acompanhe alertas, avisos e logs do sistema UpStock.
          </p>
        </div>
        <button className="text-xs text-(--blue-color3) hover:underline font-semibold">Marcar todas como lidas</button>
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-4">
        {notifications.map((notif) => {
          let Icon = Info;
          let colorClass = 'text-sky-400 bg-sky-500/10 border-sky-500/20';
          if (notif.type === 'alerta') {
            Icon = AlertTriangle;
            colorClass = 'text-(--yellow-color2) bg-amber-500/5 border-amber-500/20';
          } else if (notif.type === 'sucesso') {
            Icon = CheckCircle;
            colorClass = 'text-(--green-color4) bg-emerald-500/5 border-emerald-500/20';
          }
          return (
              <div key={notif.id} className={`flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl border ${colorClass} shadow-lg transition-all hover:scale-[1.005]`}>
                <Icon className="shrink-0 mt-0.5" size={18} />
              <div className="flex flex-col gap-1 w-full sm:flex-row sm:justify-between sm:items-start">
                <div className="flex flex-col gap-0.5">
                  <h2 className="font-bold text-(--text-primary-color) text-sm sm:text-base">{notif.title}</h2>
                  <p className="text-xs sm:text-sm text-(--text-secondary-color)">{notif.message}</p>
                </div>
                <span className="text-xs text-(--text-secondary-color) shrink-0 whitespace-nowrap mt-1 sm:mt-0">{notif.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Notificacoes;
