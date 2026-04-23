import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import * as api from '../api';

interface StaffUser {
  id: string;
  username: string;
  name?: string;
  phone?: string;
  role: 'admin' | 'repartidor' | 'preparador';
  created_at?: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  repartidor: 'Repartidor',
  preparador: 'Preparador',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  repartidor: 'bg-blue-100 text-blue-700 border-blue-200',
  preparador: 'bg-amber-100 text-amber-700 border-amber-200',
};

const ROLE_ICONS: Record<string, string> = {
  admin: 'shield_person',
  repartidor: 'local_shipping',
  preparador: 'restaurant',
};

const emptyForm = {
  username: '',
  password: '',
  name: '',
  phone: '',
  role: 'preparador' as StaffUser['role'],
};

export const UsersAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getUsers();
      setUsers(res.data);
    } catch (e: any) {
      setError(e.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: StaffUser) => {
    setEditingId(user.id);
    setForm({
      username: user.username,
      password: '',
      name: user.name || '',
      phone: user.phone || '',
      role: user.role,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError(null);
  };

  const handleSave = async () => {
    setFormError(null);
    if (!form.username.trim()) { setFormError('El username es requerido.'); return; }
    if (!editingId && !form.password.trim()) { setFormError('El password es requerido para nuevos usuarios.'); return; }
    if (form.phone && form.phone.trim().length !== 10) { setFormError('El teléfono debe tener exactamente 10 dígitos.'); return; }

    setIsSaving(true);
    try {
      if (editingId) {
        const payload: any = { username: form.username, name: form.name, phone: form.phone, role: form.role };
        if (form.password.trim()) payload.password = form.password;
        await api.updateUser(editingId, payload);
        showSuccess('Usuario actualizado correctamente.');
      } else {
        await api.createUser({
          username: form.username,
          password: form.password,
          name: form.name,
          phone: form.phone,
          role: form.role,
        });
        showSuccess('Usuario creado correctamente.');
      }
      handleCloseForm();
      loadUsers();
    } catch (e: any) {
      setFormError(e.message || 'Error al guardar usuario.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsSaving(true);
    try {
      await api.deleteUser(id);
      setDeletingId(null);
      showSuccess('Usuario eliminado.');
      loadUsers();
    } catch (e: any) {
      setError(e.message || 'Error al eliminar usuario.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light max-w-4xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm border-b border-slate-200">
        <div className="flex items-center p-4 gap-4">
          <button
            onClick={() => navigate('/')}
            className="size-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold tracking-tight">Gestión de Usuarios</h2>
            <p className="text-xs text-slate-500">Solo visible para admins</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-slate-900 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            Nuevo
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">

        {/* Toast messages */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm font-medium"
            >
              <span className="material-symbols-outlined text-lg">check_circle</span>
              {successMsg}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm font-medium"
            >
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
              <button onClick={() => setError(null)} className="ml-auto"><span className="material-symbols-outlined text-sm">close</span></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create / Edit Form */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">{editingId ? 'edit' : 'person_add'}</span>
                    {editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </h3>
                  <button onClick={handleCloseForm} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                    <span className="material-symbols-outlined text-slate-500">close</span>
                  </button>
                </div>

                <AnimatePresence>
                  {formError && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex gap-2 items-center"
                    >
                      <span className="material-symbols-outlined text-sm">error</span>
                      {formError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Username *</label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={e => setForm({ ...form, username: e.target.value })}
                      placeholder="ej. repartidor01"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">
                      {editingId ? 'Nueva contraseña (opcional)' : 'Contraseña *'}
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder={editingId ? 'Dejar en blanco para no cambiar' : 'Contraseña'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Nombre</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Nombre completo"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Teléfono</label>
                    <input
                      type="tel"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={form.phone}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 10) setForm({ ...form, phone: val });
                      }}
                      placeholder="ej. 5549593871"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Rol *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['admin', 'repartidor', 'preparador'] as const).map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setForm({ ...form, role: r })}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                            form.role === r
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xl">{ROLE_ICONS[r]}</span>
                          {ROLE_LABELS[r]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleCloseForm}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 py-2.5 bg-primary text-slate-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">save</span>
                        {editingId ? 'Guardar cambios' : 'Crear usuario'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Users list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-3 block">group_off</span>
            <p className="font-medium">No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              {users.length} {users.length === 1 ? 'usuario' : 'usuarios'}
            </p>
            {users.map(user => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-xl border border-slate-100 shadow-sm p-4"
              >
                {deletingId === user.id ? (
                  /* Delete confirm */
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-500">warning</span>
                      ¿Eliminar a <span className="text-red-600">{user.username}</span>?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeletingId(null)}
                        className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={isSaving}
                        className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm flex justify-center items-center disabled:opacity-50"
                      >
                        {isSaving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary">{ROLE_ICONS[user.role]}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm truncate">{user.username}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_COLORS[user.role]}`}>
                          {ROLE_LABELS[user.role]}
                        </span>
                      </div>
                      {user.name && (
                        <p className="text-xs text-slate-500 truncate">{user.name}</p>
                      )}
                      {user.phone && (
                        <a href={`tel:${user.phone}`} className="text-xs text-slate-400 hover:underline text-blue-500">{user.phone}</a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-sm text-slate-700">edit</span>
                      </button>
                      <button
                        onClick={() => setDeletingId(user.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-sm text-red-600">delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
