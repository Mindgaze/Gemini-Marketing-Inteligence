
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  suffix?: string;
  prefix?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, change, suffix, prefix }) => {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl hover:border-slate-600 transition-all">
      <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        {prefix && <span className="text-slate-400 text-lg">{prefix}</span>}
        <h3 className="text-2xl font-bold text-slate-100">{value}</h3>
        {suffix && <span className="text-slate-400 text-sm font-normal">{suffix}</span>}
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${change >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
          {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{Math.abs(change)}% vs last month</span>
        </div>
      )}
    </div>
  );
};

export default MetricsCard;
