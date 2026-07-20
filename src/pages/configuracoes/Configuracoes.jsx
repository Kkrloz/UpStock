import { useState, useRef, useCallback } from 'react';
import {
  User, Shield, Settings, Save, Camera, Trash2, Eye, EyeOff,
  CheckCircle2, AlertCircle, Monitor, Globe, Bell, Clock,
  Mail, MessageSquare, Smartphone, LogOut, Laptop, Lock,
  Sun, Moon, Languages, BellOff, BellRing, Check, X,
  Upload, RefreshCw, Store
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getInitials, getAvatarColor } from '../../utils/avatar';
import api from '../../services/api';

function passwordStrength(pwd, t) {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { label: t('settings.security.strengthVeryWeak'), color: 'var(--red-color4)' },
    { label: t('settings.security.strengthWeak'),     color: 'var(--yellow-color2)' },
    { label: t('settings.security.strengthMedium'),   color: 'var(--yellow-color2)' },
    { label: t('settings.security.strengthStrong'),   color: 'var(--green-color4)' },
    { label: t('settings.security.strengthVeryStrong'), color: 'var(--green-color4)' },
  ];
  return { score, ...map[score] };
}

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

function CfgInput({ id, type = 'text', value, onChange, disabled, placeholder, readOnly, style }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      readOnly={readOnly}
      style={style}
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
  const { t } = useTranslation();
  const { score, label, color } = passwordStrength(pwd, t);
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

function TabPerfil({ user }) {
  const { t } = useTranslation();
  const [name, setName]         = useState(user?.name || '');
  const [email, setEmail]       = useState(user?.email || '');
  const [storeName, setStoreName] = useState(user?.storeName || '');
  const [phone, setPhone]       = useState('');
  const [bio, setBio]           = useState('');
  const [avatar, setAvatar]     = useState(null);
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
    if (!name.trim()) { setFeedback({ type: 'error', msg: t('settings.profile.errorNameRequired') }); return; }
    setSaving(true); setFeedback(null);
    try {
      await api.put('/users/me', { name, email, cargo: user?.cargo || '', storeName });
      setFeedback({ type: 'success', msg: t('settings.profile.saveSuccess') });
    } catch (err) {
      setFeedback({ type: 'error', msg: err.response?.data?.message || t('settings.profile.saveError') });
    } finally {
      setSaving(false);
    }
  };

  const initials   = getInitials(user?.name || name);
  const avatarBg   = getAvatarColor(user?.name || name);
  const displaySrc = preview || avatar;

  return (
    <form onSubmit={handleSave} className="cfg-tab-body">
      <FeedbackBanner type={feedback?.type} message={feedback?.msg} onClose={() => setFeedback(null)} />

      <SectionCard title={t('settings.profile.sectionTitle')} description={t('settings.profile.sectionDesc')}>
        <div className="cfg-avatar-row">
          <div className="cfg-avatar-wrap">
            {displaySrc
              ? <img src={displaySrc} alt="Preview" className="cfg-avatar-img" />
              : <div className="cfg-avatar-initials" style={{ backgroundColor: avatarBg }}>
                  <span>{initials}</span>
                </div>
            }
            <button type="button" onClick={() => fileRef.current?.click()} className="cfg-avatar-camera" title={t('common.edit')}>
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
              aria-label={t('common.edit')}
            >
              <Upload size={18} className="cfg-dropzone-icon" />
              <span className="cfg-dropzone-text">
                <strong>{t('common.edit')}</strong>
              </span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />

            {displaySrc && (
              <button type="button" onClick={removePhoto} className="cfg-remove-photo-btn">
                <Trash2 size={13} />
                {t('common.delete')}
              </button>
            )}
          </div>
        </div>

        <div className="cfg-grid-2">
          <div className="cfg-field">
            <FieldLabel>{t('settings.profile.nameLabel')}</FieldLabel>
            <CfgInput id="cfg-name" value={name} onChange={e => setName(e.target.value)} placeholder={t('settings.profile.namePlaceholder')} />
          </div>
          <div className="cfg-field">
            <FieldLabel>{t('settings.profile.emailLabel')}</FieldLabel>
            <CfgInput id="cfg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('settings.profile.emailPlaceholder')} />
          </div>
          <div className="cfg-field">
            <FieldLabel>{t('settings.profile.storeLabel')}</FieldLabel>
            <div className="relative">
              <Store size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary-color)" />
              <CfgInput id="cfg-store" value={storeName} onChange={e => setStoreName(e.target.value)} placeholder={t('settings.profile.storePlaceholder')} style={{ paddingLeft: '2.25rem' }} />
            </div>
          </div>
          <div className="cfg-field">
            <FieldLabel hint={t('common.description')}>{t('settings.profile.roleLabel')}</FieldLabel>
            <CfgInput id="cfg-cargo" value={user?.cargo || t('settings.profile.rolePlaceholder')} readOnly />
          </div>
        </div>
        <div className="cfg-field" style={{ marginTop: '12px' }}>
          <FieldLabel hint={`${bio.length}/160`}>{t('settings.profile.bioLabel')}</FieldLabel>
          <textarea
            id="cfg-bio"
            value={bio}
            onChange={e => bio.length < 160 || e.target.value.length < bio.length ? setBio(e.target.value) : null}
            placeholder={t('settings.profile.bioPlaceholder')}
            className="cfg-textarea"
            rows={3}
          />
        </div>
      </SectionCard>

      <div className="cfg-form-footer">
        <button type="submit" disabled={saving} className="cfg-btn-primary">
          {saving ? <><div className="cfg-btn-spinner"/><span>{t('common.saving')}</span></> : <><Save size={15}/><span>{t('common.save')}</span></>}
        </button>
      </div>
    </form>
  );
}

function TabSeguranca({ user }) {
  const { t } = useTranslation();
  const [curr, setCurr]     = useState('');
  const [next, setNext]     = useState('');
  const [confirm, setConf]  = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFb]   = useState(null);

  const strength = passwordStrength(next, t);
  const mismatch = confirm && next && next !== confirm;
  const match    = confirm && next && next === confirm;

  const handlePassword = async e => {
    e.preventDefault();
    if (!curr || !next || !confirm) { setFb({ type:'error', msg: t('settings.security.errorFields') }); return; }
    if (next !== confirm)           { setFb({ type:'error', msg: t('settings.security.errorMismatch') }); return; }
    if (strength.score < 2)        { setFb({ type:'error', msg: t('settings.security.errorWeakPassword') }); return; }
    setSaving(true); setFb(null);
    try {
      await api.post('/auth/change-password', {
        currentPassword: curr,
        newPassword: next,
        confirmPassword: confirm,
      });
      setCurr(''); setNext(''); setConf('');
      setFb({ type:'success', msg: t('settings.security.saveSuccess') });
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setFb({ type:'error', msg: t('settings.security.errorCurrentPassword') });
      } else {
        setFb({ type:'error', msg: err.response?.data?.message || t('settings.security.saveError') });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cfg-tab-body">
      <FeedbackBanner type={feedback?.type} message={feedback?.msg} onClose={() => setFb(null)} />

      <SectionCard title={t('settings.security.sectionTitle')} description={t('settings.security.sectionDesc')}>
        <form onSubmit={handlePassword} className="cfg-pw-form">
          <div className="cfg-field">
            <FieldLabel>{t('settings.security.currentPasswordLabel')}</FieldLabel>
            <PasswordInput id="cfg-curr-pw" value={curr} onChange={e => setCurr(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="cfg-field">
            <FieldLabel>{t('settings.security.newPasswordLabel')}</FieldLabel>
            <PasswordInput id="cfg-new-pw" value={next} onChange={e => setNext(e.target.value)} placeholder={t('settings.security.newPasswordPlaceholder')} />
            <StrengthBar pwd={next} />
            <ul className="cfg-pw-rules">
              {[
                [next.length >= 8,     t('settings.security.ruleLength')],
                [/[A-Z]/.test(next),   t('settings.security.ruleUppercase')],
                [/[0-9]/.test(next),   t('settings.security.ruleNumber')],
                [/[^A-Za-z0-9]/.test(next), t('settings.security.ruleSymbol')],
              ].map(([ok, label]) => (
                <li key={label} className={`cfg-pw-rule${ok ? ' cfg-pw-rule-ok' : ''}`}>
                  {ok ? <Check size={11}/> : <X size={11}/>}
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="cfg-field">
            <FieldLabel>{t('settings.security.confirmPasswordLabel')}</FieldLabel>
            <div className="cfg-pw-wrapper">
              <PasswordInput id="cfg-conf-pw" value={confirm} onChange={e => setConf(e.target.value)} placeholder={t('settings.security.confirmPasswordPlaceholder')} />
            </div>
            {mismatch && <p className="cfg-field-err"><AlertCircle size={12}/>{t('settings.security.errorMismatch')}</p>}
            {match    && <p className="cfg-field-ok"><CheckCircle2 size={12}/>{t('settings.security.saveSuccess')}</p>}
          </div>
          <div className="cfg-form-footer cfg-form-footer-inline">
            <button type="submit" disabled={saving || mismatch} className="cfg-btn-primary">
              {saving ? <><div className="cfg-btn-spinner"/><span>{t('common.saving')}</span></> : <><Lock size={14}/><span>{t('settings.security.saveButton')}</span></>}
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}

function TabPreferencias() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
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
    setFb({ type: 'success', msg: t('settings.preferences.saveSuccess') });
  };

  return (
    <form onSubmit={handleSave} className="cfg-tab-body">
      <FeedbackBanner type={feedback?.type} message={feedback?.msg} onClose={() => setFb(null)} />

      <SectionCard title={t('settings.preferences.themeLabel')} description={t('settings.preferences.sectionDesc')}>
        <div className="cfg-theme-opts">
          {[
            { val: 'dark',  Icon: Moon,    label: t('settings.preferences.themeDark') },
            { val: 'light', Icon: Sun,     label: t('settings.preferences.themeLight') },
            { val: 'auto',  Icon: Monitor, label: t('settings.preferences.themeSystem') },
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

      <SectionCard title={t('settings.preferences.languageLabel')}>
        <div className="cfg-grid-2">
          <div className="cfg-field">
            <FieldLabel><Languages size={13}/> {t('settings.preferences.languageLabel')}</FieldLabel>
            <select value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)} className="cfg-select">
              <option value="pt">{t('settings.preferences.langPtBr')}</option>
              <option value="en">{t('settings.preferences.langEnUs')}</option>
              <option value="es">{t('settings.preferences.langEs')}</option>
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

      <SectionCard title={t('settings.preferences.notificationsSection')} description={t('settings.preferences.notificationsDesc')}>
        <div className="cfg-toggle-list">
          {[
            { id:'notif-app',   Icon: Bell,           label: t('settings.preferences.notifSystem'),  sub: t('settings.preferences.notifSystemDesc'), val: notifApp,   set: setNApp   },
            { id:'notif-email', Icon: Mail,           label: t('settings.preferences.notifEmail'),  sub: t('settings.preferences.notifEmailDesc'),   val: notifEmail, set: setNEmail },
            { id:'notif-sms',   Icon: MessageSquare,  label: t('settings.preferences.notifSms'),    sub: t('settings.preferences.notifSmsDesc'),     val: notifSMS,   set: setNSMS   },
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
            ? <><div className="cfg-btn-spinner"/><span>{t('common.saving')}</span></>
            : <><Save size={15}/><span>{t('settings.preferences.saveButton')}</span></>
          }
        </button>
      </div>
    </form>
  );
}

function Configuracoes() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');

  const TABS = [
    { id: 'perfil',       label: t('settings.tabs.profile'),       Icon: User    },
    { id: 'seguranca',    label: t('settings.tabs.security'),      Icon: Shield  },
    { id: 'preferencias', label: t('settings.tabs.preferences'),   Icon: Settings },
  ];

  return (
    <div className="cfg-page">
      <div className="cfg-page-header">
        <div>
          <h1 className="cfg-page-title">{t('settings.title')}</h1>
          <p className="cfg-page-subtitle">{t('settings.subtitle')}</p>
        </div>
      </div>

      <div className="cfg-layout">
        <nav className="cfg-nav" aria-label={t('settings.title')}>
          <div className="cfg-nav-profile">
            <div className="cfg-nav-avatar" style={{ backgroundColor: getAvatarColor(user?.name || '') }}>
              <span>{getInitials(user?.name || '')}</span>
            </div>
            <div className="cfg-nav-profile-info">
              <p className="cfg-nav-profile-name">{user?.name || t('common.user')}</p>
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
