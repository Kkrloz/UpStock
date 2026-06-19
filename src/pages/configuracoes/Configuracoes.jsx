import { useState, useRef, useCallback } from 'react';
import {
  User, Shield, Settings, Save, Camera, Trash2, Eye, EyeOff,
  CheckCircle2, AlertCircle, Monitor, Globe, Bell, Clock,
  Mail, MessageSquare, Smartphone, LogOut, Laptop, Lock,
  Sun, Moon, Languages, BellOff, BellRing, Check, X,
  Upload, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getInitials, getAvatarColor } from '../../utils/avatar';

function passwordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { label: 'Muito fraca', color: 'var(--red-color4)' },
    { label: 'Fraca',       color: 'var(--yellow-color2)' },
    { label: 'Média',       color: 'var(--yellow-color2)' },
    { label: 'Forte',       color: 'var(--green-color4)' },
    { label: 'Muito forte', color: 'var(--green-color4)' },
  ];
  return { score, ...map[score] };
}

/* ─── sub-components ──────────────────────────────────────────── */

function FeedbackBanner({ type, message, onClose }) {
  if (!message) return null;
  const isOk = type === 'success';
  return (
    <div className={`cfg-banner ${isOk ? 'cfg-banner-ok' : 'cfg-banner-err'}`}>
      {isOk ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      <span>{message}</span>
      {onClose && <button onClick={onClose} className="cfg-banner-close"><X size={13}/></button>}
    </div>
  );
}

function FieldLabel({ children, hint }) {
  return (
    <div className="cfg-field-label-row">
      <label className="cfg-field-label">{children}</label>
      {hint && <span className="cfg-field-hint">{hint}</span>}
    </div>
  );
}

function CfgInput({ id, type = 'text', value, onChange, disabled, placeholder, readOnly }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`cfg-input${disabled || readOnly ? ' cfg-input-disabled' : ''}`}
    />
  );
}

function PasswordInput({ id, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="cfg-pw-wrapper">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="cfg-input cfg-input-pw"
      />
      <button type="button" tabIndex="-1" onClick={() => setShow(s => !s)} className="cfg-pw-eye">
        {show ? <EyeOff size={15}/> : <Eye size={15}/>}
      </button>
    </div>
  );
}

function StrengthBar({ pwd }) {
  const { score, label, color } = passwordStrength(pwd);
  if (!pwd) return null;
  return (
    <div className="cfg-strength">
      <div className="cfg-strength-bars">
        {[0,1,2,3].map(i => (
          <div key={i} className="cfg-strength-seg" style={{ backgroundColor: i < score ? color : undefined }} />
        ))}
      </div>
      <span className="cfg-strength-label" style={{ color }}>{label}</span>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, id }) {
  return (
    <label htmlFor={id} className={`cfg-toggle${checked ? ' cfg-toggle-on' : ''}`}>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className="cfg-toggle-thumb" />
    </label>
  );
}

function SectionCard({ title, description, children }) {
  return (
    <div className="cfg-section-card">
      <div className="cfg-section-header">
        <h3 className="cfg-section-title">{title}</h3>
        {description && <p className="cfg-section-desc">{description}</p>}
      </div>
      <div className="cfg-section-body">{children}</div>
    </div>
  );
}

/* ─── ABAS ────────────────────────────────────────────────────── */

/* ABA 1 — PERFIL */
function TabPerfil({ user }) {
  const [name, setName]         = useState(user?.name || '');
  const [email, setEmail]       = useState(user?.email || '');
  const [phone, setPhone]       = useState('');
  const [bio, setBio]           = useState('');
  const [avatar, setAvatar]     = useState(null); // base64 ou null
  const [preview, setPreview]   = useState(null);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [feedback, setFeedback] = useState(null);
  const fileRef = useRef();

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => { setPreview(e.target.result); setAvatar(e.target.result); };
    reader.readAsDataURL(file);
  }, []);

  const onFileChange = e => processFile(e.target.files[0]);
  const onDrop = e => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files[0]); };
  const removePhoto = () => { setAvatar(null); setPreview(null); if (fileRef.current) fileRef.current.value = ''; };

  const handleSave = async e => {
    e.preventDefault();
    if (!name.trim()) { setFeedback({ type: 'error', msg: 'O nome não pode ficar em branco.' }); return; }
    setSaving(true); setFeedback(null);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    setFeedback({ type: 'success', msg: 'Perfil atualizado com sucesso.' });
  };

  const initials   = getInitials(user?.name || name);
  const avatarBg   = getAvatarColor(user?.name || name);
  const displaySrc = preview || avatar;

  return (
    <form onSubmit={handleSave} className="cfg-tab-body">
      <FeedbackBanner type={feedback?.type} message={feedback?.msg} onClose={() => setFeedback(null)} />

      {/* Foto de perfil */}
      <SectionCard title="Foto de Perfil" description="Formatos aceitos: JPG, PNG, WEBP. Tamanho máximo: 2 MB.">
        <div className="cfg-avatar-row">
          <div className="cfg-avatar-wrap">
            {displaySrc
              ? <img src={displaySrc} alt="Preview" className="cfg-avatar-img" />
              : <div className="cfg-avatar-initials" style={{ backgroundColor: avatarBg }}>
                  <span>{initials}</span>
                </div>
            }
            <button type="button" onClick={() => fileRef.current?.click()} className="cfg-avatar-camera" title="Alterar foto">
              <Camera size={14} />
            </button>
          </div>

          <div className="cfg-avatar-actions">
            <div
              className={`cfg-dropzone${dragging ? ' cfg-dropzone-active' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
              aria-label="Área de upload de foto"
            >
              <Upload size={18} className="cfg-dropzone-icon" />
              <span className="cfg-dropzone-text">
                <strong>Clique para enviar</strong> ou arraste aqui
              </span>
              <span className="cfg-dropzone-sub">PNG, JPG, WEBP até 2 MB</span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />

            {displaySrc && (
              <button type="button" onClick={removePhoto} className="cfg-remove-photo-btn">
                <Trash2 size={13} />
                Remover foto
              </button>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Dados pessoais */}
      <SectionCard title="Dados Pessoais">
        <div className="cfg-grid-2">
          <div className="cfg-field">
            <FieldLabel>Nome completo</FieldLabel>
            <CfgInput id="cfg-name" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" />
          </div>
          <div className="cfg-field">
            <FieldLabel>E-mail</FieldLabel>
            <CfgInput id="cfg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
          </div>
          <div className="cfg-field">
            <FieldLabel>Telefone</FieldLabel>
            <CfgInput id="cfg-phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+55 (11) 9 0000-0000" />
          </div>
          <div className="cfg-field">
            <FieldLabel hint="Somente leitura">Cargo</FieldLabel>
            <CfgInput id="cfg-cargo" value={user?.cargo || 'Colaborador'} readOnly />
          </div>
        </div>
        <div className="cfg-field" style={{ marginTop: '12px' }}>
          <FieldLabel hint={`${bio.length}/160`}>Sobre mim</FieldLabel>
          <textarea
            id="cfg-bio"
            value={bio}
            onChange={e => bio.length < 160 || e.target.value.length < bio.length ? setBio(e.target.value) : null}
            placeholder="Uma breve descrição sobre você..."
            className="cfg-textarea"
            rows={3}
          />
        </div>
      </SectionCard>

      <div className="cfg-form-footer">
        <button type="submit" disabled={saving} className="cfg-btn-primary">
          {saving ? <><div className="cfg-btn-spinner"/><span>Salvando…</span></> : <><Save size={15}/><span>Salvar Perfil</span></>}
        </button>
      </div>
    </form>
  );
}

/* ABA 2 — SEGURANÇA */
function TabSeguranca({ user }) {
  const [curr, setCurr]     = useState('');
  const [next, setNext]     = useState('');
  const [confirm, setConf]  = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFb]   = useState(null);

  const strength = passwordStrength(next);
  const mismatch = confirm && next && next !== confirm;
  const match    = confirm && next && next === confirm;

  const SESSIONS = [
    { id: 's1', device: 'Chrome — Windows 11', location: 'São Paulo, BR', time: 'Agora', current: true, Icon: Monitor },
    { id: 's2', device: 'Safari — iPhone 15',  location: 'São Paulo, BR', time: 'Há 2h', current: false, Icon: Smartphone },
    { id: 's3', device: 'Firefox — Ubuntu',    location: 'Rio de Janeiro, BR', time: 'Há 1d', current: false, Icon: Laptop },
  ];

  const [sessions, setSessions] = useState(SESSIONS);
  const [revoking, setRevoking] = useState(null);

  const handlePassword = async e => {
    e.preventDefault();
    if (!curr || !next || !confirm) { setFb({ type:'error', msg:'Preencha todos os campos.' }); return; }
    if (next !== confirm)           { setFb({ type:'error', msg:'As senhas não coincidem.' }); return; }
    if (strength.score < 2)        { setFb({ type:'error', msg:'Escolha uma senha mais forte.' }); return; }
    setSaving(true); setFb(null);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setCurr(''); setNext(''); setConf('');
    setFb({ type:'success', msg:'Senha alterada com sucesso.' });
  };

  const revokeSession = async id => {
    setRevoking(id);
    await new Promise(r => setTimeout(r, 700));
    setSessions(s => s.filter(x => x.id !== id));
    setRevoking(null);
  };

  const revokeAll = async () => {
    setRevoking('all');
    await new Promise(r => setTimeout(r, 900));
    setSessions(s => s.filter(x => x.current));
    setRevoking(null);
  };

  return (
    <div className="cfg-tab-body">
      <FeedbackBanner type={feedback?.type} message={feedback?.msg} onClose={() => setFb(null)} />

      {/* Troca de Senha */}
      <SectionCard title="Alterar Senha" description="Use uma senha forte com letras, números e símbolos.">
        <form onSubmit={handlePassword} className="cfg-pw-form">
          <div className="cfg-field">
            <FieldLabel>Senha atual</FieldLabel>
            <PasswordInput id="cfg-curr-pw" value={curr} onChange={e => setCurr(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="cfg-field">
            <FieldLabel>Nova senha</FieldLabel>
            <PasswordInput id="cfg-new-pw" value={next} onChange={e => setNext(e.target.value)} placeholder="Mínimo 8 caracteres" />
            <StrengthBar pwd={next} />
            <ul className="cfg-pw-rules">
              {[
                [next.length >= 8,     '8 ou mais caracteres'],
                [/[A-Z]/.test(next),   'Letra maiúscula'],
                [/[0-9]/.test(next),   'Número'],
                [/[^A-Za-z0-9]/.test(next), 'Símbolo especial'],
              ].map(([ok, label]) => (
                <li key={label} className={`cfg-pw-rule${ok ? ' cfg-pw-rule-ok' : ''}`}>
                  {ok ? <Check size={11}/> : <X size={11}/>}
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="cfg-field">
            <FieldLabel>Confirmar nova senha</FieldLabel>
            <div className="cfg-pw-wrapper">
              <PasswordInput id="cfg-conf-pw" value={confirm} onChange={e => setConf(e.target.value)} placeholder="Repita a nova senha" />
            </div>
            {mismatch && <p className="cfg-field-err"><AlertCircle size={12}/>As senhas não coincidem</p>}
            {match    && <p className="cfg-field-ok"><CheckCircle2 size={12}/>Senhas conferem</p>}
          </div>
          <div className="cfg-form-footer cfg-form-footer-inline">
            <button type="submit" disabled={saving || mismatch} className="cfg-btn-primary">
              {saving ? <><div className="cfg-btn-spinner"/><span>Alterando…</span></> : <><Lock size={14}/><span>Alterar Senha</span></>}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Sessões */}
      <SectionCard title="Sessões Ativas" description="Dispositivos onde sua conta está conectada.">
        <div className="cfg-sessions">
          {sessions.map(({ id, device, location, time, current, Icon }) => (
            <div key={id} className="cfg-session-row">
              <div className="cfg-session-icon"><Icon size={18}/></div>
              <div className="cfg-session-info">
                <p className="cfg-session-device">
                  {device}
                  {current && <span className="cfg-session-badge">Esta sessão</span>}
                </p>
                <p className="cfg-session-meta">{location} · {time}</p>
              </div>
              {!current && (
                <button
                  onClick={() => revokeSession(id)}
                  disabled={revoking === id}
                  className="cfg-session-revoke"
                  title="Encerrar sessão"
                >
                  {revoking === id
                    ? <div className="cfg-btn-spinner cfg-btn-spinner-sm"/>
                    : <LogOut size={14}/>
                  }
                </button>
              )}
            </div>
          ))}
        </div>
        {sessions.filter(s => !s.current).length > 0 && (
          <button onClick={revokeAll} disabled={revoking === 'all'} className="cfg-btn-ghost cfg-btn-danger" style={{ marginTop: '12px' }}>
            {revoking === 'all' ? <div className="cfg-btn-spinner"/> : <LogOut size={14}/>}
            <span>Encerrar todas as outras sessões</span>
          </button>
        )}
      </SectionCard>
    </div>
  );
}

/* ABA 3 — PREFERÊNCIAS */
function TabPreferencias() {
  const { theme, setTheme } = useTheme();
  const [language,   setLang]     = useState('pt-BR');
  const [timezone,   setTZ]       = useState('America/Sao_Paulo');
  const [notifApp,   setNApp]     = useState(true);
  const [notifEmail, setNEmail]   = useState(true);
  const [notifSMS,   setNSMS]     = useState(false);
  const [weekStart,  setWeekStart]= useState('monday');
  const [saving, setSaving]       = useState(false);
  const [feedback, setFb]         = useState(null);

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true); setFb(null);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setFb({ type: 'success', msg: 'Preferências salvas com sucesso.' });
  };

  return (
    <form onSubmit={handleSave} className="cfg-tab-body">
      <FeedbackBanner type={feedback?.type} message={feedback?.msg} onClose={() => setFb(null)} />

      {/* Aparência */}
      <SectionCard title="Aparência" description="Escolha o tema visual do sistema.">
        <div className="cfg-theme-opts">
          {[
            { val: 'dark',  Icon: Moon,    label: 'Escuro' },
            { val: 'light', Icon: Sun,     label: 'Claro' },
            { val: 'auto',  Icon: Monitor, label: 'Sistema' },
          ].map(({ val, Icon, label }) => (
            <button
              key={val}
              type="button"
              onClick={() => setTheme(val)}
              className={`cfg-theme-opt${theme === val ? ' cfg-theme-opt-active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
              {theme === val && <Check size={13} className="cfg-theme-check"/>}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Idioma e Fuso */}
      <SectionCard title="Idioma & Fuso Horário">
        <div className="cfg-grid-2">
          <div className="cfg-field">
            <FieldLabel><Languages size={13}/> Idioma</FieldLabel>
            <select value={language} onChange={e => setLang(e.target.value)} className="cfg-select">
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>
          <div className="cfg-field">
            <FieldLabel><Clock size={13}/> Fuso Horário</FieldLabel>
            <select value={timezone} onChange={e => setTZ(e.target.value)} className="cfg-select">
              <option value="America/Sao_Paulo">América/São Paulo (UTC-3)</option>
              <option value="America/New_York">América/New York (UTC-5)</option>
              <option value="Europe/London">Europa/Londres (UTC+0)</option>
              <option value="Asia/Tokyo">Ásia/Tóquio (UTC+9)</option>
            </select>
          </div>
          <div className="cfg-field">
            <FieldLabel>Início da Semana</FieldLabel>
            <select value={weekStart} onChange={e => setWeekStart(e.target.value)} className="cfg-select">
              <option value="sunday">Domingo</option>
              <option value="monday">Segunda-feira</option>
            </select>
          </div>
        </div>
      </SectionCard>

      {/* Notificações */}
      <SectionCard title="Notificações" description="Controle como e quando você é notificado.">
        <div className="cfg-toggle-list">
          {[
            { id:'notif-app',   Icon: Bell,           label: 'Notificações no sistema',  sub: 'Alertas de estoque, movimentações e relatórios.', val: notifApp,   set: setNApp   },
            { id:'notif-email', Icon: Mail,           label: 'Notificações por e-mail',  sub: 'Resumos diários e alertas críticos.',             val: notifEmail, set: setNEmail },
            { id:'notif-sms',   Icon: MessageSquare,  label: 'Notificações por SMS',     sub: 'Somente alertas de segurança e urgência.',         val: notifSMS,   set: setNSMS   },
          ].map(({ id, Icon, label, sub, val, set }) => (
            <div key={id} className="cfg-toggle-row">
              <div className="cfg-toggle-icon"><Icon size={16}/></div>
              <div className="cfg-toggle-text">
                <p className="cfg-toggle-label">{label}</p>
                <p className="cfg-toggle-sub">{sub}</p>
              </div>
              <ToggleSwitch id={id} checked={val} onChange={() => set(v => !v)} />
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="cfg-form-footer">
        <button type="submit" disabled={saving} className="cfg-btn-primary">
          {saving
            ? <><div className="cfg-btn-spinner"/><span>Salvando…</span></>
            : <><Save size={15}/><span>Salvar Preferências</span></>
          }
        </button>
      </div>
    </form>
  );
}

/* ─── COMPONENTE PRINCIPAL ────────────────────────────────────── */

const TABS = [
  { id: 'perfil',       label: 'Perfil',               Icon: User    },
  { id: 'seguranca',    label: 'Segurança & Acesso',    Icon: Shield  },
  { id: 'preferencias', label: 'Preferências Gerais',   Icon: Settings },
];

function Configuracoes() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');

  return (
    <div className="cfg-page">
      {/* Cabeçalho da página */}
      <div className="cfg-page-header">
        <div>
          <h1 className="cfg-page-title">Configurações</h1>
          <p className="cfg-page-subtitle">Gerencie seu perfil, segurança e preferências do sistema.</p>
        </div>
      </div>

      <div className="cfg-layout">
        {/* Navegação lateral */}
        <nav className="cfg-nav" aria-label="Seções de configurações">
          {/* Mini perfil no topo da nav */}
          <div className="cfg-nav-profile">
            <div className="cfg-nav-avatar" style={{ backgroundColor: getAvatarColor(user?.name || '') }}>
              <span>{getInitials(user?.name || '')}</span>
            </div>
            <div className="cfg-nav-profile-info">
              <p className="cfg-nav-profile-name">{user?.name || 'Usuário'}</p>
              <p className="cfg-nav-profile-email">{user?.email || ''}</p>
            </div>
          </div>

          <div className="cfg-nav-divider" />

          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`cfg-nav-btn${activeTab === id ? ' cfg-nav-btn-active' : ''}`}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              <Icon size={16} />
              <span>{label}</span>
              {activeTab === id && <div className="cfg-nav-indicator" aria-hidden="true"/>}
            </button>
          ))}
        </nav>

        {/* Conteúdo das abas */}
        <div className="cfg-content">
          {activeTab === 'perfil'       && <TabPerfil       user={user} />}
          {activeTab === 'seguranca'    && <TabSeguranca    user={user} />}
          {activeTab === 'preferencias' && <TabPreferencias />}
        </div>
      </div>
    </div>
  );
}

export default Configuracoes;
