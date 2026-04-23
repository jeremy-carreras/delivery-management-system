import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setProfile, logout } from '../store';
import { motion } from 'motion/react';
import { AddressInput } from './AddressInput';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profile = useSelector((state: RootState) => state.profile);

  const [name, setName] = React.useState(profile.name);
  const [phone, setPhone] = React.useState(profile.phone);
  const [address, setAddress] = React.useState(profile.address);
  const [isAddressSelected, setIsAddressSelected] = React.useState(!!profile.address);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    setName(profile.name);
    setPhone(profile.phone);
    setAddress(profile.address);
    setIsAddressSelected(!!profile.address);
  }, [profile]);

  const handleSave = () => {
    dispatch(setProfile({ name: name.trim(), phone: phone.trim(), address: address.trim() }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const isComplete = name.trim().length > 0 && phone.trim().length === 10 && isAddressSelected;

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-3">
          <span className="material-symbols-outlined text-4xl text-primary">person</span>
        </div>
        <h2 className="text-xl font-bold">Mi Perfil</h2>
        <p className="text-sm text-slate-400">Llena tus datos para empezar a pedir</p>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Nombre Completo
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="ej. Juan Pérez"
              className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Teléfono
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">phone</span>
            <input
              type="tel"
              maxLength={10}
              pattern="[0-9]{10}"
              value={phone}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 10) setPhone(val);
              }}
              placeholder="ej. 5549593871"
              className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Dirección de Entrega
          </label>
          <AddressInput
            value={address}
            onChange={(val) => {
              setAddress(val);
              setIsAddressSelected(false);
            }}
            onSelect={() => setIsAddressSelected(true)}
            placeholder="ej. Calle Principal 123"
            bgClass="bg-slate-100"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={!isComplete}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
            isComplete
              ? 'bg-primary text-background-dark shadow-md shadow-primary/30'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {saved ? '✓ ¡Guardado!' : 'Guardar Perfil'}
        </motion.button>
      </div>

      {/* Status badge */}
      {profile.name && profile.address && (
        <div className="mt-6 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
          <div>
            <p className="text-xs font-bold text-green-700">{profile.name}</p>
            <a href={`tel:${profile.phone}`} className="text-[10px] text-green-600 font-medium hover:underline hover:text-blue-500">{profile.phone}</a>
            <p className="text-xs text-green-600">{profile.address}</p>
          </div>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={() => {
          navigate('/login');
          dispatch(logout());
        }}
        className="mt-8 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors"
      >
        <span className="material-symbols-outlined text-lg">logout</span>
        Cerrar Sesión
      </button>
    </div>
  );
};
