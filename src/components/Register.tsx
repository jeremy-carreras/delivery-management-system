import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { registerUser, AppDispatch } from '../store';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';

export const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'phone') {
      const val = e.target.value.replace(/\D/g, '');
      if (val.length <= 10) {
        setFormData({ ...formData, phone: val });
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    dispatch(registerUser(formData))
      .unwrap()
      .then(() => {
        setLoading(false);
        navigate('/login', { state: { message: '¡Registro exitoso! Por favor inicia sesión.' } });
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message || 'Ocurrió un error durante el registro');
      });
  };

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="bg-primary p-3 rounded-2xl mb-4 shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-background-dark text-4xl font-bold">person_add</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Cuenta</h1>
        </div>

        <form onSubmit={handleRegister} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm font-medium flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </motion.div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Usuario *</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Elige un usuario"
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Nombre Completo</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Juan Pérez"
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Teléfono</label>
              <input
                type="tel"
                name="phone"
                maxLength={10}
                pattern="[0-9]{10}"
                value={formData.phone}
                onChange={handleChange}
                placeholder="ej. 5549593871"
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Dirección</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Calle Principal 123"
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Contraseña *</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Crea una contraseña"
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Confirmar Contraseña *</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite la contraseña"
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!formData.username || !formData.password || loading || (formData.phone.length > 0 && formData.phone.length !== 10)}
            className="w-full bg-primary hover:bg-primary/90 text-background-dark py-3.5 mt-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="block w-5 h-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin" />
            ) : (
              'Registrarse'
            )}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Iniciar sesión
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
