import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, logout } from '../store';
import { useNavigate } from 'react-router-dom';

export const WorkerProfile: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);
  const currentUser = auth.currentUser;

  // Si no hay usuario, regresamos para evitar crashes, el enrutador debe atajar esto.
  if (!currentUser) return null;

  const roleTextMap = {
    'admin': 'Admin',
    'repartidor': 'Repartidor',
    'preparador': 'Preparador'
  };

  const roleIconMap = {
    'admin': 'shield_person',
    'repartidor': 'local_shipping',
    'preparador': 'restaurant'
  };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-3">
          <span className="material-symbols-outlined text-4xl text-primary">badge</span>
        </div>
        <h2 className="text-xl font-bold">Perfil de Trabajador</h2>
        <p className="text-sm text-slate-400">Información de lectura</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Username */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Username
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">account_circle</span>
            <input
              type="text"
              value={currentUser.username}
              disabled
              className="w-full bg-slate-200/50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-500 shadow-sm cursor-not-allowed"
            />
          </div>
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Nombre
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
            <input
              type="text"
              value={currentUser.name || 'No especificado'}
              disabled
              className="w-full bg-slate-200/50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-500 shadow-sm cursor-not-allowed"
            />
          </div>
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Teléfono
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">phone</span>
            <input
              type="text"
              value={currentUser.phone || 'No especificado'}
              disabled
              className="w-full bg-slate-200/50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-500 shadow-sm cursor-not-allowed"
            />
          </div>
        </div>

        {/* Rol */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Rol
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
              {roleIconMap[currentUser.role] || 'badge'}
            </span>
            <input
              type="text"
              value={roleTextMap[currentUser.role] || currentUser.role}
              disabled
              className="w-full bg-slate-200/50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-500 shadow-sm cursor-not-allowed font-medium"
            />
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          navigate('/login');
          dispatch(logout());
        }}
        className="mt-8 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm hover:bg-red-500/20 transition-colors"
      >
        <span className="material-symbols-outlined text-lg">logout</span>
        Cerrar Sesión
      </button>
    </div>
  );
};
