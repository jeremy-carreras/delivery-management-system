import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setProfile } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { AddressInput } from './AddressInput';

interface ProfileModalProps {
  isOpen: boolean;
  onClose?: () => void;
  requireClose?: boolean;
  phoneOnly?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, requireClose = false, phoneOnly = false }) => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile);
  
  const [draftName, setDraftName] = React.useState(profile.name);
  const [draftPhone, setDraftPhone] = React.useState(profile.phone);
  const [draftAddress, setDraftAddress] = React.useState(profile.address);
  const [isAddressSelected, setIsAddressSelected] = React.useState(!!profile.address);

  React.useEffect(() => {
    setDraftName(profile.name);
    setDraftPhone(profile.phone);
    setDraftAddress(profile.address);
    setIsAddressSelected(!!profile.address);
  }, [profile, isOpen]);

  const handleSaveProfile = () => {
    if (phoneOnly) {
      if (!draftPhone.trim()) return;
      dispatch(setProfile({ name: profile.name, phone: draftPhone.trim(), address: profile.address }));
      if (onClose) onClose();
      return;
    }
    if (!draftName.trim() || !draftPhone.trim() || !isAddressSelected) return;
    dispatch(setProfile({ name: draftName.trim(), phone: draftPhone.trim(), address: draftAddress.trim() }));
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl flex flex-col gap-4"
          >
            {phoneOnly ? (
              <>
                <div className="flex flex-col items-center gap-1 mb-2">
                  <div className="size-14 bg-primary/20 rounded-full flex items-center justify-center mb-1">
                    <span className="material-symbols-outlined text-3xl text-primary">phone</span>
                  </div>
                  <h2 className="text-xl font-bold">Ingresa tu teléfono</h2>
                  <p className="text-sm text-slate-500 text-center">Para ver tus pedidos necesitamos tu número</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Número de teléfono</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">phone</span>
                    <input
                      type="tel"
                      value={draftPhone}
                      onChange={(e) => setDraftPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      placeholder="ej. 5549593871"
                      autoFocus
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold">Completa tu perfil</h2>
                <p className="text-sm text-slate-500">Ingresa tus datos para continuar</p>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre completo</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
                    <input
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      placeholder="ej. Juan García"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Teléfono</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">phone</span>
                    <input
                      type="tel"
                      value={draftPhone}
                      onChange={(e) => setDraftPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      placeholder="ej. 5549593871"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dirección de entrega</label>
                  <AddressInput
                    value={draftAddress}
                    onChange={(val) => {
                      setDraftAddress(val);
                      setIsAddressSelected(false);
                    }}
                    onSelect={() => setIsAddressSelected(true)}
                    placeholder="ej. Calle Reforma 123"
                    bgClass="bg-slate-50"
                  />
                </div>
              </>
            )}
            
            <div className="flex gap-2 mt-2">
              {!requireClose && onClose && (
                <button 
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold text-sm transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleSaveProfile}
                disabled={phoneOnly ? !draftPhone.trim() : (!draftName.trim() || !draftPhone.trim() || !isAddressSelected)}
                className="flex-1 py-3 bg-primary text-background-dark hover:bg-primary/90 rounded-xl font-bold text-sm disabled:opacity-50 transition-colors"
              >
                Guardar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
