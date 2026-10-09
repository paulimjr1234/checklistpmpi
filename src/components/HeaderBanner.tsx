import React from 'react';

interface HeaderBannerProps {
  title?: string;
  subtitle?: string;
  showBrasao?: boolean;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  title = 'POLÍCIA MILITAR DO ESTADO DO PIAUÍ',
  subtitle = 'CHECKLIST DE VIATURA',
  showBrasao = true,
}) => {
  return (
    <div className="w-full bg-[#0A2240] text-white pt-6 pb-7 px-5 shadow-md border-b-2 border-[#C8961D]">
      <div className="max-w-xl mx-auto flex flex-col items-center text-center">
        {showBrasao && (
          <div className="mb-4">
            <img
              src="/brasao_pmpi.png"
              alt="Brasão da Polícia Militar do Estado do Piauí"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow"
            />
          </div>
        )}

        <h1 className="text-sm sm:text-base font-bold tracking-wider text-slate-100 uppercase">
          {title}
        </h1>

        <h2 className="text-xl sm:text-2xl font-black tracking-wide text-[#FFD54F] mt-1">
          {subtitle}
        </h2>

        <p className="text-xs text-slate-300 mt-1">
          Sistema de Inspeção e Controle Operacional
        </p>
      </div>
    </div>
  );
};
