import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Clock3,
  ExternalLink,
  FileImage,
  LogOut,
  Pencil,
  Search,
  ShieldCheck,
  Save,
  Trash2,
  UserRound,
  UsersRound,
  X,
  XCircle,
} from 'lucide-react';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || '';
const statusMeta = {
  pending_review: { label: 'Новая заявка', className: 'pending' },
  approved: { label: 'Одобрено', className: 'approved' },
  rejected: { label: 'Отклонено', className: 'rejected' },
  completed: { label: 'Зарегистрирован', className: 'approved' },
};
const accountStatusMeta = {
  active: { label: 'Активен', className: 'approved' },
  disabled: { label: 'Отключен', className: 'rejected' },
};
const sections = {
  applications: {
    detailEmpty: 'Выберите заявку для просмотра.',
    icon: ShieldCheck,
    title: 'Заявки',
  },
  clients: {
    detailEmpty: 'Выберите клиента для просмотра.',
    icon: UsersRound,
    memberType: 'client',
    title: 'Клиенты',
  },
  masters: {
    detailEmpty: 'Выберите мастера для просмотра.',
    icon: UserRound,
    memberType: 'master',
    title: 'Мастера',
  },
  salons: {
    detailEmpty: 'Выберите салон для просмотра.',
    icon: Building2,
    memberType: 'salon',
    title: 'Салоны',
  },
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('xsize_admin_token') || '');
  const [password, setPassword] = useState('');
  const [section, setSection] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({});
  const [selected, setSelected] = useState(null);
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!token) return;
    if (section === 'applications') {
      loadApplications();
      return;
    }
    loadMembers();
  }, [token, section, type, search]);

  async function login(event) {
    event.preventDefault();
    setError('');
    const response = await fetch(`${API_URL}/api/admin/login`, {
      body: JSON.stringify({ password }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || 'Не удалось войти');
      return;
    }
    localStorage.setItem('xsize_admin_token', data.token);
    setToken(data.token);
  }

  async function loadApplications() {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ search, type });
    const response = await apiFetch(`/api/admin/applications?${params}`);
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.message || 'Не удалось загрузить заявки');
      return;
    }
    setApplications(data.applications);
    setMembers([]);
    setStats(data.stats);
  }

  async function loadMembers() {
    const memberType = sections[section].memberType;
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ search });
    const response = await apiFetch(`/api/admin/members/${memberType}?${params}`);
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.message || 'Не удалось загрузить профили');
      return;
    }
    setMembers(data.members);
    setApplications([]);
    setStats(data.stats);
  }

  async function openDetails(item) {
    if (!item) return;
    setError('');
    setSelected(null);
    setComment('');
    setDetailLoading(true);
    const path =
      section === 'applications'
        ? `/api/admin/applications/${item.type}/${item.id}`
        : `/api/admin/members/${item.type}/${item.id}`;
    const response = await apiFetch(path);
    const data = await response.json();
    setDetailLoading(false);
    if (!response.ok) {
      setError(data.message || 'Не удалось открыть карточку');
      return;
    }
    const detail = data.application || data.member;
    setSelected(detail);
    setComment(detail.adminComment || '');
    setDraft(detail.status === 'pending_review' ? createApplicationDraft(detail) : null);
    setEditing(false);
  }

  function backToList() {
    setSelected(null);
    setComment('');
    setDraft(null);
    setEditing(false);
    setDetailLoading(false);
    setError('');
  }

  async function saveApplicationDraft() {
    if (!selected || !draft || saving) return;

    setSaving(true);
    const response = await apiFetch(`/api/admin/applications/${selected.type}/${selected.id}`, {
      body: JSON.stringify(draft),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(data.message || 'Не удалось сохранить правки');
      return;
    }

    setSelected(data.application);
    setDraft(createApplicationDraft(data.application));
    setEditing(false);
    await loadApplications();
  }

  async function updateApplicationStatus(nextStatus) {
    if (!selected || saving) return;
    setSaving(true);
    const response = await apiFetch(`/api/admin/applications/${selected.type}/${selected.id}/status`, {
      body: JSON.stringify({ adminComment: comment, status: nextStatus }),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(data.message || 'Не удалось обновить статус');
      return;
    }
    backToList();
    await loadApplications();
  }

  async function updateAccountStatus(nextStatus) {
    if (!selected || saving) return;
    setSaving(true);
    const response = await apiFetch(`/api/admin/members/${selected.type}/${selected.id}/account-status`, {
      body: JSON.stringify({ accountStatus: nextStatus }),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(data.message || 'Не удалось обновить статус аккаунта');
      return;
    }
    setSelected(data.member);
    setMembers((current) =>
      current.map((item) =>
        item.id === data.member.id && item.type === data.member.type
          ? { ...item, accountStatus: data.member.accountStatus }
          : item,
      ),
    );
  }

  function apiFetch(path, options = {}) {
    return fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  }

  function changeSection(nextSection) {
    setSection(nextSection);
    setSelected(null);
    setComment('');
    setError('');
    setSearch('');
    if (nextSection !== 'applications') {
      setType('all');
    }
  }

  function logout() {
    localStorage.removeItem('xsize_admin_token');
    setToken('');
    setSelected(null);
  }

  if (!token) {
    return (
      <main className="login-page">
        <section className="login-panel">
          <div className="brand-mark">XSIZE</div>
          <h1>Админ-панель</h1>
          <p>Модерация заявок и управление профилями XSIZE Partner.</p>
          <form onSubmit={login}>
            <label>
              Пароль администратора
              <input
                autoFocus
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Введите пароль"
                type="password"
                value={password}
              />
            </label>
            {error ? <div className="form-error">{error}</div> : null}
            <button type="submit">Войти</button>
          </form>
        </section>
      </main>
    );
  }

  const currentSection = sections[section];
  const list = section === 'applications' ? applications : members;
  const isDetailView = detailLoading || Boolean(selected);

  return (
    <main className="admin-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-mark small">XSIZE</div>
          <nav>
            {Object.entries(sections).map(([key, item]) => {
              const Icon = item.icon;
              return (
                <button
                  className={section === key ? 'active' : ''}
                  key={key}
                  onClick={() => changeSection(key)}
                >
                  <Icon size={18} /> {item.title}
                </button>
              );
            })}
          </nav>
        </div>
        <button className="logout" onClick={logout}>
          <LogOut size={18} /> Выйти
        </button>
      </aside>

      <section className="workspace">
        {isDetailView ? (
          <>
            <header className="topbar detail-topbar">
              <button className="back-to-list" onClick={backToList}>
                <ArrowLeft size={19} /> Назад к списку
              </button>
              <div className="detail-topbar-title">
                <span className="eyebrow">{currentSection.title}</span>
                <h2>{selected?.title || 'Загружаем карточку'}</h2>
              </div>
            </header>

            {error ? <div className="inline-error">{error}</div> : null}

            {detailLoading ? (
              <LoaderCard label="Загружаем полную информацию..." />
            ) : section === 'applications' ? (
              <ApplicationDetailPanel
                comment={comment}
                draft={draft}
                editing={editing}
                emptyText={currentSection.detailEmpty}
                onComment={setComment}
                onDraft={setDraft}
                onEditing={setEditing}
                onSave={saveApplicationDraft}
                onStatus={updateApplicationStatus}
                saving={saving}
                selected={selected}
              />
            ) : (
              <MemberDetailPanel
                emptyText={currentSection.detailEmpty}
                onAccountStatus={updateAccountStatus}
                saving={saving}
                selected={selected}
              />
            )}
          </>
        ) : (
          <>
            <header className="topbar compact">
              <div>
                <h2>{currentSection.title}</h2>
              </div>
              <div className="search">
                <Search size={18} />
                <input
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Поиск по имени, городу, телефону"
                  value={search}
                />
              </div>
            </header>

            {section === 'applications' ? (
              <>
                <section className="stats-grid">
                  <StatCard icon={<Clock3 />} label="Новые заявки" value={stats.pending || 0} />
                  <StatCard icon={<UserRound />} label="Мастера ждут" value={stats.pendingMasters || 0} />
                  <StatCard icon={<Building2 />} label="Салоны ждут" value={stats.pendingSalons || 0} />
                  <StatCard icon={<ShieldCheck />} label="Всего аккаунтов" value={stats.totalAccounts || 0} />
                </section>
                <div className="filter-panel single">
                  <div className="filters">
                    <span>От кого</span>
                    {[
                      ['all', 'Все'],
                      ['master', 'Мастера'],
                      ['salon', 'Салоны'],
                    ].map(([key, label]) => (
                      <button
                        className={type === key ? 'selected' : ''}
                        key={key}
                        onClick={() => setType(key)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <section className="stats-grid three">
                <StatCard icon={<ShieldCheck />} label="Всего" value={stats.total || 0} />
                <StatCard icon={<BadgeCheck />} label="Активные" value={stats.active || 0} />
                <StatCard icon={<XCircle />} label="Отключены" value={stats.disabled || 0} />
              </section>
            )}

            {error ? <div className="inline-error">{error}</div> : null}

            <section className="list-page">
              {loading ? <LoaderCard label="Загружаем список..." /> : null}
              {!loading && list.length === 0 ? (
                <div className="empty">
                  {section === 'applications' ? 'Новых заявок пока нет.' : 'Профилей в разделе пока нет.'}
                </div>
              ) : null}
              {!loading ? (
                <div className="application-list">
                  {list.map((item) => (
                    <ListCard item={item} key={`${item.type}-${item.id}`} onClick={() => openDetails(item)} />
                  ))}
                </div>
              ) : null}
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <article className="stat-card">
      <div>{React.cloneElement(icon, { size: 21 })}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function LoaderCard({ label }) {
  return (
    <div className="loader-card">
      <div className="loader-spinner" />
      <span>{label}</span>
    </div>
  );
}

function ListCard({ item, onClick, selected }) {
  const Icon = item.type === 'salon' ? Building2 : item.type === 'client' ? UsersRound : UserRound;
  const meta = item.status === 'pending_review' ? statusMeta[item.status] : accountStatusMeta[item.accountStatus];

  return (
    <button className={`application-card ${selected ? 'active' : ''}`} onClick={onClick}>
      <div className="application-icon">
        <Icon size={22} />
      </div>
      <div className="application-main">
        <div className="application-title-row">
          <strong>{item.title}</strong>
          <span className={`status ${meta?.className || 'neutral'}`}>{meta?.label || item.status}</span>
        </div>
        <p>{item.subtitle || item.typeLabel}</p>
        <span>
          {item.city || 'Город не указан'} · {formatDate(item.createdAt)}
        </span>
      </div>
    </button>
  );
}

function ApplicationDetailPanel({
  comment,
  draft,
  editing,
  emptyText,
  onComment,
  onDraft,
  onEditing,
  onSave,
  onStatus,
  saving,
  selected,
}) {
  if (!selected) {
    return <aside className="detail-panel empty-panel">{emptyText}</aside>;
  }

  const resetDraft = () => {
    onDraft(createApplicationDraft(selected));
    onEditing(false);
  };

  return (
    <aside className="detail-panel">
      <DetailHeader selected={selected} status={statusMeta[selected.status]} />
      <div className="editor-toolbar">
        <div>
          <strong>{editing ? 'Редактирование заявки' : 'Проверка заявки'}</strong>
          <span>
            {editing
              ? 'Измените данные или удалите лишние файлы перед решением.'
              : 'Перед одобрением можно поправить анкету и состав файлов.'}
          </span>
        </div>
        {editing ? (
          <div className="toolbar-actions">
            <button className="ghost-action" disabled={saving} onClick={resetDraft}>
              <X size={17} /> Отмена
            </button>
            <button className="save-action" disabled={saving} onClick={onSave}>
              <Save size={17} /> {saving ? 'Сохраняем...' : 'Сохранить'}
            </button>
          </div>
        ) : (
          <button className="edit-action" onClick={() => onEditing(true)}>
            <Pencil size={17} /> Редактировать
          </button>
        )}
      </div>

      {editing ? (
        <ApplicationEditor draft={draft} onDraft={onDraft} selected={selected} />
      ) : (
        <ProfileSections selected={selected} />
      )}

      <div className="details-section">
        <h4>Комментарий модератора</h4>
        <textarea
          onChange={(event) => onComment(event.target.value)}
          placeholder="Добавьте заметку или причину отклонения"
          value={comment}
        />
      </div>

      <div className="moderation-actions">
        <button className="approve" disabled={saving || editing} onClick={() => onStatus('approved')}>
          {saving ? 'Сохраняем...' : 'Одобрить'}
        </button>
        <button className="reject" disabled={saving || editing} onClick={() => onStatus('rejected')}>
          Отклонить
        </button>
      </div>
      {editing ? <p className="moderation-note">Сначала сохраните или отмените правки, затем примите решение.</p> : null}
    </aside>
  );
}

function ApplicationEditor({ draft, onDraft, selected }) {
  if (!draft) return null;

  const updateField = (key, value) => onDraft({ ...draft, [key]: value });
  const updateDocuments = (documents) => onDraft({ ...draft, documents });

  return (
    <>
      <div className="details-section edit-panel">
        <h4>Данные анкеты</h4>
        <div className="edit-grid">
          {getEditableFields(selected.type).map((field) => (
            <label className={field.multiline ? 'wide' : ''} key={field.key}>
              {field.label}
              {field.multiline ? (
                <textarea
                  onChange={(event) => updateField(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  value={draft[field.key] || ''}
                />
              ) : (
                <input
                  onChange={(event) => updateField(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  value={draft[field.key] || ''}
                />
              )}
            </label>
          ))}
        </div>
      </div>

      <EditableDocuments
        documents={draft.documents || {}}
        onDocuments={updateDocuments}
        type={selected.type}
      />
    </>
  );
}

function EditableDocuments({ documents, onDocuments, type }) {
  const removeSingle = (key) => onDocuments({ ...documents, [key]: null });
  const removeFromArray = (key, index) =>
    onDocuments({
      ...documents,
      [key]: (documents[key] || []).filter((_, itemIndex) => itemIndex !== index),
    });
  const groups =
    type === 'master'
      ? [
          ['id', 'Удостоверение личности', documents.id ? [documents.id] : [], true],
          ['certificates', 'Сертификаты', documents.certificates || [], false],
          ['diplomas', 'Дипломы', documents.diplomas || [], false],
          ['licenses', 'Лицензии', documents.licenses || [], false],
        ]
      : [
          ['ownerId', 'Удостоверение владельца', documents.ownerId ? [documents.ownerId] : [], true],
          ['licenses', 'Лицензии', documents.licenses || [], false],
          ['certificates', 'Сертификаты', documents.certificates || [], false],
          ['photos', 'Фото салона', documents.photos || [], false],
        ];

  return (
    <div className="details-section edit-panel">
      <h4>Файлы заявки</h4>
      <div className="editable-docs">
        {groups.map(([key, title, files, single]) => (
          <div className="editable-doc-group" key={key}>
            <div className="editable-doc-title">
              <span>{title}</span>
              <small>{files.length}</small>
            </div>
            {files.length ? (
              <div className="editable-file-grid">
                {files.map((file, index) => (
                  <div className="editable-file-card" key={file.key || `${key}-${index}`}>
                    <a href={file.signedUrl || file.url} rel="noreferrer" target="_blank">
                      <img alt={file.originalName || title} src={file.signedUrl || file.url} />
                    </a>
                    <div>
                      <span>{file.originalName || 'Файл'}</span>
                      <small>{formatBytes(file.size)}</small>
                    </div>
                    <button
                      onClick={() => (single ? removeSingle(key) : removeFromArray(key, index))}
                      type="button"
                    >
                      <Trash2 size={16} /> Удалить
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">Файлы не загружены или удалены из заявки</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MemberDetailPanel({ emptyText, onAccountStatus, saving, selected }) {
  if (!selected) {
    return <aside className="detail-panel empty-panel">{emptyText}</aside>;
  }

  const isActive = selected.accountStatus !== 'disabled';

  return (
    <aside className="detail-panel">
      <DetailHeader selected={selected} status={accountStatusMeta[selected.accountStatus || 'active']} />
      <ProfileSections selected={selected} />

      <div className="details-section account-control">
        <h4>Управление аккаунтом</h4>
        <p>
          {isActive
            ? 'Профиль сейчас активен и может отображаться в приложении.'
            : 'Профиль временно отключен: его можно скрывать и блокировать в приложении.'}
        </p>
        <button
          className={isActive ? 'danger-toggle' : 'approve-toggle'}
          disabled={saving}
          onClick={() => onAccountStatus(isActive ? 'disabled' : 'active')}
        >
          {saving ? 'Сохраняем...' : isActive ? 'Временно отключить профиль' : 'Вернуть профиль в работу'}
        </button>
      </div>
    </aside>
  );
}

function DetailHeader({ selected, status }) {
  return (
    <div className="detail-header">
      <div>
        <span className="eyebrow">{selected.typeLabel}</span>
        <h3>{selected.title}</h3>
        <p>{selected.city || 'Город не указан'} · {formatDate(selected.createdAt)}</p>
      </div>
      <span className={`status large ${status?.className || 'neutral'}`}>
        {status?.label || selected.status || selected.accountStatus}
      </span>
    </div>
  );
}

function ProfileSections({ selected }) {
  return (
    <>
      <div className="details-section">
        <h4>Анкета</h4>
        <InfoGrid selected={selected} />
      </div>

      {selected.about || selected.description ? (
        <div className="details-section">
          <h4>Описание</h4>
          <p className="long-text">{selected.about || selected.description}</p>
        </div>
      ) : null}

      {selected.portfolio || selected.website ? (
        <a
          className="portfolio-link"
          href={normalizeUrl(selected.portfolio || selected.website)}
          rel="noreferrer"
          target="_blank"
        >
          <ExternalLink size={17} /> Открыть ссылку
        </a>
      ) : null}

      <Documents selected={selected} />
    </>
  );
}

function InfoGrid({ selected }) {
  const fieldsByType = {
    client: [
      ['ФИО', selected.title],
      ['Город', selected.city],
      ['Телефон', selected.phone],
      ['Дата рождения', selected.birthDate],
      ['Пол', formatGender(selected.gender)],
      ['Статус аккаунта', accountStatusMeta[selected.accountStatus || 'active']?.label],
    ],
    master: [
      ['ФИО', selected.title],
      ['Город', selected.city],
      ['Дата рождения', selected.birthDate],
      ['Пол', formatGender(selected.gender)],
      ['Опыт', selected.experience],
      ['Согласия', selected.agreement && selected.personalData ? 'Подтверждены' : 'Не полностью'],
    ],
    salon: [
      ['Салон', selected.title],
      ['Владелец', selected.ownerName || selected.subtitle],
      ['Юр. название', selected.legalName],
      ['Город', selected.city],
      ['Телефон', selected.phone],
      ['Адрес', selected.address],
      ['График', [selected.workDays, selected.openTime, selected.closeTime].filter(Boolean).join(', ')],
    ],
  };

  return (
    <dl className="info-grid">
      {(fieldsByType[selected.type] || [])
        .filter(([, value]) => value)
        .map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
    </dl>
  );
}

function Documents({ selected }) {
  const docs = selected.documents || {};
  const photos = selected.photos || {};
  const groupsByType = {
    client: [
      ['Основное фото', photos.main ? [photos.main] : []],
      ['Дополнительные фото', photos.extra || []],
    ],
    master: [
      ['Удостоверение личности', docs.id ? [docs.id] : []],
      ['Сертификаты', docs.certificates || []],
      ['Дипломы', docs.diplomas || []],
      ['Лицензии', docs.licenses || []],
    ],
    salon: [
      ['Удостоверение владельца', docs.ownerId ? [docs.ownerId] : []],
      ['Лицензии', docs.licenses || []],
      ['Сертификаты', docs.certificates || []],
      ['Фото салона', docs.photos || []],
    ],
  };
  const groups = groupsByType[selected.type] || [];

  return (
    <div className="details-section">
      <h4>{selected.type === 'client' ? 'Фотографии' : 'Файлы и документы'}</h4>
      {groups.map(([title, files]) => (
        <div className="doc-group" key={title}>
          <div className="doc-group-title">
            <FileImage size={17} />
            {title}
            <span>{files.length}</span>
          </div>
          {files.length > 0 ? (
            <div className="doc-grid">
              {files.map((file) => (
                <a
                  href={file.signedUrl || file.url}
                  key={file.key || file.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  <img alt={file.originalName || title} src={file.signedUrl || file.url} />
                  <span>{formatBytes(file.size)}</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="muted">Файлы не загружены</p>
          )}
        </div>
      ))}
    </div>
  );
}

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(value));
}

function createApplicationDraft(application) {
  if (!application) return null;

  if (application.type === 'master') {
    return {
      about: application.about || '',
      birthDate: application.birthDate || '',
      city: application.city || '',
      documents: application.documents || {},
      experience: application.experience || '',
      fullName: application.title || '',
      gender: application.gender || '',
      phone: application.phone || '',
      portfolio: application.portfolio || '',
    };
  }

  return {
    address: application.address || '',
    city: application.city || '',
    closeTime: application.closeTime || '',
    description: application.description || '',
    documents: application.documents || {},
    legalName: application.legalName || '',
    openTime: application.openTime || '',
    ownerName: application.ownerName || application.subtitle || '',
    phone: application.phone || '',
    salonName: application.title || '',
    website: application.website || '',
    workDays: application.workDays || '',
  };
}

function getEditableFields(type) {
  if (type === 'master') {
    return [
      { key: 'fullName', label: 'ФИО', placeholder: 'Введите ФИО' },
      { key: 'city', label: 'Город', placeholder: 'Введите город' },
      { key: 'phone', label: 'Телефон', placeholder: '+7...' },
      { key: 'birthDate', label: 'Дата рождения', placeholder: 'дд.мм.гггг' },
      { key: 'gender', label: 'Пол', placeholder: 'male / female' },
      { key: 'experience', label: 'Опыт', placeholder: 'Например: 3-5 лет' },
      { key: 'portfolio', label: 'Портфолио', placeholder: 'https://... или @username' },
      {
        key: 'about',
        label: 'Описание',
        multiline: true,
        placeholder: 'Описание мастера, специализация и достижения',
      },
    ];
  }

  return [
    { key: 'salonName', label: 'Название салона', placeholder: 'Введите название салона' },
    { key: 'ownerName', label: 'Ответственное лицо', placeholder: 'Введите ФИО' },
    { key: 'phone', label: 'Телефон', placeholder: '+7...' },
    { key: 'website', label: 'Сайт/Instagram', placeholder: 'https://... или @username' },
    { key: 'legalName', label: 'Юридическое название', placeholder: 'Введите юридическое название' },
    { key: 'city', label: 'Город', placeholder: 'Введите город' },
    { key: 'address', label: 'Адрес', placeholder: 'Введите адрес' },
    { key: 'workDays', label: 'Дни работы', placeholder: 'Например: Пн-Пт' },
    { key: 'openTime', label: 'Открытие', placeholder: '09:00' },
    { key: 'closeTime', label: 'Закрытие', placeholder: '18:00' },
    {
      key: 'description',
      label: 'Описание',
      multiline: true,
      placeholder: 'Описание салона, особенности и услуги',
    },
  ];
}

function formatBytes(value = 0) {
  if (!value) return '0 KB';
  return `${Math.max(1, Math.round(value / 1024))} KB`;
}

function formatGender(value) {
  if (value === 'male') return 'Мужской';
  if (value === 'female') return 'Женский';
  return '';
}

function normalizeUrl(value) {
  if (!value) return '#';
  if (value.startsWith('http')) return value;
  if (value.startsWith('@')) return `https://instagram.com/${value.slice(1)}`;
  return `https://${value}`;
}

createRoot(document.getElementById('root')).render(<App />);
