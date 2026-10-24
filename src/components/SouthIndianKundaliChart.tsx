import React from 'react';
import { KundaliChartHouse } from '../utils/sampurnKundali';

interface SouthIndianKundaliChartProps {
  houses: KundaliChartHouse[];
  title: string;
  subtitle: string;
  lagnaRashiNumber?: number;
  lagnaDegInt?: number;
}

const RASHI_BOX_MAPPING: Array<{
  rashiNum: number;
  rashiNameHindi: string;
  gridArea: string; // CSS grid area e.g. "col-start-1 row-start-1"
}> = [
  { rashiNum: 12, rashiNameHindi: '12. मीन', gridArea: 'col-start-1 row-start-1' },
  { rashiNum: 1, rashiNameHindi: '1. मेष', gridArea: 'col-start-2 row-start-1' },
  { rashiNum: 2, rashiNameHindi: '2. वृषभ', gridArea: 'col-start-3 row-start-1' },
  { rashiNum: 3, rashiNameHindi: '3. मिथुन', gridArea: 'col-start-4 row-start-1' },
  { rashiNum: 4, rashiNameHindi: '4. कर्क', gridArea: 'col-start-4 row-start-2' },
  { rashiNum: 5, rashiNameHindi: '5. सिंह', gridArea: 'col-start-4 row-start-3' },
  { rashiNum: 6, rashiNameHindi: '6. कन्या', gridArea: 'col-start-4 row-start-4' },
  { rashiNum: 7, rashiNameHindi: '7. तुला', gridArea: 'col-start-3 row-start-4' },
  { rashiNum: 8, rashiNameHindi: '8. वृश्चिक', gridArea: 'col-start-2 row-start-4' },
  { rashiNum: 9, rashiNameHindi: '9. धनु', gridArea: 'col-start-1 row-start-4' },
  { rashiNum: 10, rashiNameHindi: '10. मकर', gridArea: 'col-start-1 row-start-3' },
  { rashiNum: 11, rashiNameHindi: '11. कुंभ', gridArea: 'col-start-1 row-start-2' },
];

export const SouthIndianKundaliChart: React.FC<SouthIndianKundaliChartProps> = ({
  houses,
  title,
  subtitle,
  lagnaRashiNumber,
  lagnaDegInt,
}) => {
  // Map houses by rashiNumber (1..12)
  const houseByRashiMap = React.useMemo(() => {
    const map: Record<number, KundaliChartHouse> = {};
    houses.forEach((h) => {
      map[h.rashiNumber] = h;
    });
    return map;
  }, [houses]);

  return (
    <div className="bg-gradient-to-b from-[#161008] via-[#101726] to-[#0b101d] border-2 border-amber-500/50 rounded-2xl p-3.5 sm:p-5 shadow-xl flex flex-col items-center">
      <div className="text-center mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
          {subtitle} (दक्षिण भारतीय प्रारूप)
        </span>
        <h4 className="text-base sm:text-lg font-bold font-vedic text-amber-100 mt-1">{title}</h4>
      </div>

      <div className="w-full max-w-[360px] aspect-square bg-[#120d06] rounded-xl border-2 border-amber-500/60 p-1 shadow-inner relative">
        <div className="grid grid-cols-4 grid-rows-4 w-full h-full gap-0.5">
          {/* Central 2x2 Hollow Area */}
          <div className="col-start-2 col-span-2 row-start-2 row-span-2 bg-[#181109] border border-amber-600/30 rounded-lg flex flex-col items-center justify-center p-2 text-center z-0">
            <span className="text-2xl text-amber-400 font-extrabold font-vedic">ॐ</span>
            <span className="text-[11px] font-extrabold text-yellow-300 mt-0.5">{title}</span>
            <span className="text-[9px] text-amber-300/80 font-mono">दक्षिण भारतीय कुंडली</span>
          </div>

          {/* 12 Sign Outer Cells */}
          {RASHI_BOX_MAPPING.map((box) => {
            const houseData = houseByRashiMap[box.rashiNum];
            const isLagnaSign = lagnaRashiNumber
              ? lagnaRashiNumber === box.rashiNum
              : houseData?.houseNumber === 1;

            return (
              <div
                key={box.rashiNum}
                className={`${box.gridArea} bg-[#191107] border border-amber-500/40 p-1 rounded-sm flex flex-col justify-between overflow-hidden relative group hover:bg-amber-950/40 transition-colors`}
              >
                {/* Top Row: Rashi Name + Lagna Indicator */}
                <div className="flex items-center justify-between gap-0.5 border-b border-amber-800/30 pb-0.5">
                  <span className="text-[9px] font-bold text-amber-400/90 leading-none">
                    {box.rashiNameHindi}
                  </span>

                  {isLagnaSign && (
                    <span className="px-1 py-0.2 rounded bg-emerald-500 text-slate-950 text-[8px] font-black leading-none">
                      {typeof lagnaDegInt === 'number'
                        ? `लग्न ${String(lagnaDegInt).padStart(2, '0')}°`
                        : 'लग्न'}
                    </span>
                  )}
                </div>

                {/* Center / Bottom: Planets in this Rashi */}
                <div className="my-auto py-0.5 flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5">
                  {houseData?.planets && houseData.planets.length > 0 ? (
                    houseData.planets.map((p, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-extrabold text-amber-100 leading-tight font-mono"
                        title={`${p.hindiName} ${p.fullDegreeDMS}`}
                      >
                        {p.chartLabel}
                        <sup className="text-[8px] text-yellow-400 ml-0.5">{p.degInt}°</sup>
                      </span>
                    ))
                  ) : (
                    <span className="text-[9px] text-slate-600 font-mono">—</span>
                  )}
                </div>

                {/* House Number Badge */}
                <div className="text-right">
                  <span className="text-[8px] font-mono text-amber-500/60 font-bold">
                    भाव {houseData?.houseNumber || ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
