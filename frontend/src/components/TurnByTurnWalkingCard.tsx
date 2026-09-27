import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Footprints, ArrowRight, CornerUpRight, CheckCircle } from 'lucide-react';

interface TurnByTurnWalkingCardProps {
  distanceMeters: number;
  stopName: string;
}

export const TurnByTurnWalkingCard: React.FC<TurnByTurnWalkingCardProps> = ({ distanceMeters, stopName }) => {
  const { language } = useAppStore();

  const steps = [
    { text: `Walk ${Math.round(distanceMeters * 0.4)}m towards main road junction.`, icon: Footprints },
    { text: `Turn left at signal near depot corner.`, icon: CornerUpRight },
    { text: `Cross signal carefully.`, icon: ArrowRight },
    { text: `Reach ${stopName}.`, icon: CheckCircle },
  ];

  const stepsTamil = [
    `பிரதான சாலை சந்திப்பு நோக்கி ${Math.round(distanceMeters * 0.4)}மீ நடக்கவும்.`,
    `சிக்னலில் இடதுபுறம் திரும்பவும்.`,
    `சாலையைக் கவனமாகக் கடக்கவும்.`,
    `${stopName} நிறுத்தத்தை அடையவும்.`
  ];

  return (
    <div className="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/30 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="font-extrabold text-xs text-emerald-400 flex items-center gap-1.5">
          <Footprints className="w-4 h-4" />
          <span>Walking Guidance ({distanceMeters}m)</span>
        </span>
        <span className="text-[10px] text-slate-400">~{Math.ceil(distanceMeters / 80)} mins</span>
      </div>

      <div className="space-y-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
              <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <p>{language === 'ta' ? stepsTamil[idx] : step.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
