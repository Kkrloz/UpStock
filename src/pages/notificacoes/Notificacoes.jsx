import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import api from '../../services/api';

function Notificacoes() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products'),
      api.get('/movements'),
    ])
      .then(([prodRes, movRes]) => {
        const list = [];

        const lowStock = prodRes.data.filter((p) => p.quantity <= 5);
        lowStock.forEach((p) => {
          list.push({
            id: `low-${p.id}`,
            type: 'alerta',
            title: 'Estoque Baixo',
            message: `"${p.name}" está com apenas ${p.quantity} unidade(s) em estoque.`,
            time: new Date().toLocaleString('pt-BR'),
          });
        });

        movRes.data.slice(0, 5).forEach((m) => {
          list.push({
            id: `mov-${m.id}`,
            type: m.type === 'ENTRADA' ? 'sucesso' : 'info',
            title: m.type === 'ENTRADA' ? 'Entrada Registrada' : 'Saída Registrada',
            message: `${m.type === 'ENTRADA' ? 'Entrada' : 'Saída'} de ${m.quantity} unidade(s) de "${m.productName}" — ${m.userName}.`,
            time: new Date(m.timestamp).toLocaleString('pt-BR'),
          });
        });

        list.sort((a, b) => new Date(b.time) - new Date(a.time));
        setNotifications(list);
      })
      .catch((err) => console.error('Erro ao carregar notificações:', err))
      .finally(() => setLoading(false));
  }, []);

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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-(--text-primary-color)">Notificações</h1>
          <p className="text-sm sm:text-base text-(--text-secondary-color)">
            Acompanhe alertas, avisos e logs do sistema UpStock.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Bell size={36} className="text-(--text-tercery-color)" />
            <p className="text-sm text-(--text-secondary-color)">Nenhuma notificação no momento.</p>
          </div>
        )}
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
