import React from 'react';
import { motion } from 'motion/react';
import { Order } from '../store';

type OrderStatus = 'Pending' | 'Accepted' | 'Preparando' | 'En reparto' | 'Entregado' | 'Cancelled';

const STATUS_FLOW: OrderStatus[] = ['Pending', 'Accepted', 'Preparando', 'En reparto', 'Entregado'];

const STATUS_CONFIG: Record<OrderStatus, { icon: string; bg: string; text: string; label: string }> = {
  Pending:      { icon: 'hourglass_top',    bg: 'bg-yellow-50',  text: 'text-yellow-600', label: 'Pendiente' },
  Accepted:     { icon: 'thumb_up',         bg: 'bg-blue-50',    text: 'text-blue-600',   label: 'Aceptado' },
  Preparando:   { icon: 'soup_kitchen',     bg: 'bg-orange-50',  text: 'text-orange-500', label: 'En preparación' },
  'En reparto': { icon: 'electric_moped',   bg: 'bg-purple-50',  text: 'text-purple-600', label: 'En reparto' },
  Entregado:    { icon: 'check_circle',     bg: 'bg-green-50',   text: 'text-green-600',  label: 'Entregado' },
  Cancelled:    { icon: 'cancel',           bg: 'bg-red-50',     text: 'text-red-500',    label: 'Cancelado' },
};

interface StatusTrackerProps {
  status: OrderStatus;
  variant?: 'full' | 'compact';
}

export const StatusTracker: React.FC<StatusTrackerProps> = ({ status, variant = 'full' }) => {
  if (status === 'Cancelled' || status === 'Entregado') return null;

  const currentIdx = STATUS_FLOW.indexOf(status);

  // Variables de color para hacer match con la captura
  const ACTIVE_COLOR = '#00C68E';
  const INACTIVE_COLOR = '#EAEAEC';

  if (variant === 'compact') {
    return (
      <div className="relative w-full pt-4 pb-2 px-2">
        <div className="relative z-10 flex justify-between items-center w-full">
          {STATUS_FLOW.map((s, i) => {
            const isDone = i < currentIdx;
            const isCurrent = i === currentIdx;
            const isPending = i > currentIdx;
            
            return (
              <React.Fragment key={s}>
                {/* Connector Line (drawn before node, except for first) */}
                {i > 0 && (
                  <div className="flex-1 h-1 mx-[-2px] z-0 overflow-hidden relative">
                    <div className="absolute inset-0" style={{ backgroundColor: isDone || (isCurrent && i <= currentIdx) ? ACTIVE_COLOR : INACTIVE_COLOR }} />
                  </div>
                )}

                {/* Node */}
                <div className="relative flex justify-center items-center z-10">
                  {/* Current State Outer Ring */}
                  {isCurrent && (
                    <motion.div
                      className="absolute rounded-full border-2 bg-transparent"
                      style={{ 
                        borderColor: ACTIVE_COLOR,
                        width: '44px',
                        height: '44px' 
                      }}
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  
                  {/* Inner Node */}
                  <div 
                    className={`rounded-full flex items-center justify-center transition-colors shadow-sm overflow-hidden z-20 ${
                      isCurrent ? 'size-[34px] bg-white' : 
                      isDone ? 'size-6 text-white' : 
                      'size-8 bg-white border-2'
                    }`}
                    style={{
                      backgroundColor: isDone ? ACTIVE_COLOR : 'white',
                      borderColor: isPending ? INACTIVE_COLOR : 'transparent'
                    }}
                  >
                    {isDone ? (
                      <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                    ) : isCurrent ? (
                       <div className="size-full rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                          <span className="material-symbols-outlined text-[18px]">{STATUS_CONFIG[s].icon}</span>
                       </div>
                    ) : (
                      <span className="material-symbols-outlined text-[16px] text-slate-300">
                        {STATUS_CONFIG[s].icon}
                      </span>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // Full variant (Rappi / Uber Style para detalles de orden)
  return (
    <div className="mt-6 mb-4 px-2">
      <div className="relative w-full">
        {/* Nodos circulares superpuestos y Textos */}
        <div className="relative z-10 flex justify-between items-start w-full">
          {STATUS_FLOW.map((s, i) => {
            const isDone = i < currentIdx;
            const isCurrent = i === currentIdx;
            const isPending = i > currentIdx;
            const cfg = STATUS_CONFIG[s];

            return (
              <React.Fragment key={s}>
                {i > 0 && (
                  <div className="h-1 flex-1 mt-7 z-0 overflow-hidden relative" style={{ marginLeft: '-4px', marginRight: '-4px' }}>
                    <div className="absolute inset-0" style={{ backgroundColor: isDone || (isCurrent && i <= currentIdx) ? ACTIVE_COLOR : INACTIVE_COLOR }} />
                  </div>
                )}
                
                <div className="flex flex-col items-center relative shrink-0" style={{ width: '48px' }}>
                  {/* Contenedor del Icono/Punto */}
                  <div className="relative flex items-center justify-center h-14 w-full mb-1 bg-white z-10">
                    {/* Ring actual pulsante */}
                    {isCurrent && (
                      <motion.div
                        className="absolute rounded-full border-[3px] bg-transparent"
                        style={{ 
                          borderColor: ACTIVE_COLOR,
                          width: '56px', 
                          height: '56px' 
                        }}
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                    
                    {/* Circulo conteniendo al icono */}
                    <div 
                      className={`rounded-full flex items-center justify-center relative z-20 transition-all duration-300 shadow-sm overflow-hidden ${
                        isCurrent ? 'size-11 bg-slate-50' : 
                        isDone ? 'size-9 text-white' : 
                        'size-10 bg-white border-[2.5px]'
                      }`}
                      style={{
                        backgroundColor: isDone ? ACTIVE_COLOR : undefined,
                        borderColor: isPending ? INACTIVE_COLOR : 'transparent'
                      }}
                    >
                      {isDone ? (
                        <span className="material-symbols-outlined text-[20px] font-bold">check</span>
                      ) : (
                        <span className={`material-symbols-outlined ${isCurrent ? 'text-[24px] text-slate-700' : 'text-[20px] text-slate-300'}`}>
                          {isCurrent && s === 'En reparto' ? 'two_wheeler' : cfg.icon}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Etiqueta de Texto Abajo (Solo en Full variant) */}
                  <span className={`text-[10px] font-bold text-center leading-tight transition-colors absolute top-[60px] w-[70px] ${
                    isCurrent ? 'text-slate-900' : isDone ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {cfg.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
