import React from 'react';
import { CheckCircle2, ChevronDown, CircleDot } from 'lucide-react';

interface StepCardProps {
  stepNumber: string;
  title: string;
  isCompleted: boolean;
  isActive: boolean;
  isExpanded?: boolean;
  summary?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const StepCard: React.FC<StepCardProps> = ({
  stepNumber,
  title,
  isCompleted,
  isActive,
  isExpanded = false,
  summary,
  action,
  children
}) => {
  if (isExpanded) {
    return (
      <div className="bg-[#14171f] border-2 border-[#05d9e8]/70 rounded-2xl p-5 mb-5 shadow-lg shadow-cyan-950/20 transition-all animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#262c3a] mb-4">
          <div className="flex items-center gap-2.5">
            <CircleDot className="w-5 h-5 text-[#05d9e8]" />
            <h2 className="text-lg font-bold text-white tracking-wide font-outfit uppercase">
              Step {stepNumber}: {title} (Editing)
            </h2>
          </div>
          {action}
        </div>
        <div className="mt-2">{children}</div>
      </div>
    );
  }

  if (isCompleted && !isActive) {
    return (
      <div className="bg-[#14171f] border border-[#262c3a] rounded-xl p-3.5 mb-4 shadow-sm transition-all hover:border-[#384257]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Step {stepNumber}: {title}
              </span>
              <div className="text-sm font-semibold text-gray-200 mt-0.5">
                {summary}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {action}
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Completed
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (isActive) {
    return (
      <div className="bg-[#14171f] border-2 border-[#FF9933]/60 rounded-2xl p-5 mb-5 shadow-lg shadow-orange-950/20 transition-all">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#262c3a] mb-4">
          <CircleDot className="w-5 h-5 text-[#FF9933] animate-pulse" />
          <h2 className="text-lg font-bold text-white tracking-wide font-outfit uppercase">
            Step {stepNumber}: {title}
          </h2>
        </div>
        <div className="mt-2">{children}</div>
      </div>
    );
  }

  // Pending / Future Step
  return (
    <div className="bg-[#14171f]/50 border border-[#262c3a]/50 rounded-xl p-3.5 mb-3 opacity-40 select-none">
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-full border border-gray-600 flex items-center justify-center text-[10px] font-bold text-gray-500">
          {stepNumber}
        </div>
        <span className="text-sm font-medium text-gray-400 font-outfit uppercase">
          {title}
        </span>
      </div>
    </div>
  );
};
