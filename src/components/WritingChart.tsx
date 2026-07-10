import React from 'react';
import { motion } from 'motion/react';

interface ChartItem {
  label: string;
  value: number;
  secondary_value?: number;
}

interface ChartData {
  chart_type: 'bar' | 'line' | 'pie' | 'compare_bar';
  chart_title: string;
  x_label: string;
  y_label: string;
  items: ChartItem[];
  additional_info?: string[];
}

interface WritingChartProps {
  chartData: ChartData;
}

export const WritingChart: React.FC<WritingChartProps> = ({ chartData }) => {
  const { chart_type, chart_title, x_label, y_label, items, additional_info } = chartData;

  const maxVal = Math.max(
    ...items.flatMap(item => [item.value, item.secondary_value || 0])
  ) || 100;
  
  const totalVal = items.reduce((acc, curr) => acc + curr.value, 0) || 100;

  // Custom colors for styling
  const colors = [
    'stroke-cyan-400 fill-cyan-400 bg-cyan-400',
    'stroke-purple-500 fill-purple-500 bg-purple-500',
    'stroke-emerald-400 fill-emerald-400 bg-emerald-400',
    'stroke-amber-400 fill-amber-400 bg-amber-400',
    'stroke-rose-500 fill-rose-500 bg-rose-500',
  ];

  const fillGradients = [
    'from-cyan-500/80 to-blue-600/80',
    'from-purple-500/80 to-indigo-600/80',
    'from-emerald-500/80 to-teal-600/80',
    'from-amber-400/80 to-orange-500/80',
    'from-rose-500/80 to-red-600/80',
  ];

  // Render Bar / Compare Bar Chart
  const renderBarChart = () => {
    return (
      <div className="flex-1 flex flex-col justify-end h-[240px] border-b border-l border-slate-700/80 p-4 relative bg-slate-950/40">
        {/* Y Axis Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full border-t border-cyan-400 border-dashed" />
          ))}
        </div>

        <div className="flex justify-around items-end h-full w-full relative z-10">
          {items.map((item, idx) => {
            const pct1 = (item.value / maxVal) * 85; // cap at 85% for label space
            const hasSecondary = chart_type === 'compare_bar' && item.secondary_value !== undefined;
            const pct2 = hasSecondary ? ((item.secondary_value || 0) / maxVal) * 85 : 0;

            return (
              <div key={idx} className="flex flex-col items-center flex-1 mx-2">
                <div className="flex items-end justify-center gap-1.5 w-full h-[180px]">
                  {/* First Bar */}
                  <div className="flex flex-col items-center w-full max-w-[40px]">
                    <span className="text-[10px] text-cyan-400 mb-1 font-mono font-bold">
                      {item.value}
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${pct1}%` }}
                      className={`w-full bg-gradient-to-t ${fillGradients[idx % fillGradients.length]} border border-cyan-400/30 rounded-t-sm shadow-[0_0_15px_rgba(6,182,212,0.15)]`}
                    />
                  </div>

                  {/* Secondary Bar for Compare Bar */}
                  {hasSecondary && (
                    <div className="flex flex-col items-center w-full max-w-[40px]">
                      <span className="text-[10px] text-purple-400 mb-1 font-mono font-bold">
                        {item.secondary_value}
                      </span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${pct2}%` }}
                        className={`w-full bg-gradient-to-t ${fillGradients[(idx + 1) % fillGradients.length]} border border-purple-400/30 rounded-t-sm shadow-[0_0_15px_rgba(168,85,247,0.15)]`}
                      />
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 mt-2 font-medium font-mono text-center truncate w-full">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Unit indicator */}
        <div className="absolute -top-6 left-0 text-[9px] text-cyan-500/60 uppercase font-mono tracking-wider">
          {y_label}
        </div>
      </div>
    );
  };

  // Render Line Chart
  const renderLineChart = () => {
    const width = 500;
    const height = 200;
    const padding = 30;

    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = items.map((item, idx) => {
      const x = padding + (idx / (items.length - 1 || 1)) * chartWidth;
      const y = padding + chartHeight - (item.value / maxVal) * chartHeight;
      return { x, y, label: item.label, value: item.value };
    });

    let pathD = '';
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        pathD += ` L ${points[i].x} ${points[i].y}`;
      }
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-2 bg-slate-950/40 relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[220px]">
          <defs>
            <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding + chartHeight * ratio;
            return (
              <line
                key={idx}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#334155"
                strokeWidth="0.5"
                strokeDasharray="4 4"
                className="opacity-40"
              />
            );
          })}

          {/* Fill under line */}
          {points.length > 0 && (
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              d={`${pathD} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`}
              fill="url(#lineGlow)"
            />
          )}

          {/* Connection line */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            d={pathD}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="3"
            filter="url(#glow)"
          />

          {/* Chart Nodes */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                cx={pt.x}
                cy={pt.y}
                r="5"
                className="fill-slate-900 stroke-cyan-400 stroke-2"
              />
              <motion.text
                initial={{ opacity: 0, y: pt.y - 10 }}
                animate={{ opacity: 1, y: pt.y - 12 }}
                x={pt.x}
                textAnchor="middle"
                className="fill-cyan-300 font-mono text-[10px] font-bold"
              >
                {pt.value}
              </motion.text>
              <text
                x={pt.x}
                y={height - 10}
                textAnchor="middle"
                className="fill-slate-400 font-mono text-[9px]"
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>
        
        {/* Axis Unit Labels */}
        <div className="absolute top-2 left-4 text-[9px] text-cyan-500/60 uppercase font-mono tracking-wider">
          {y_label}
        </div>
      </div>
    );
  };

  // Render Pie / Donut Chart
  const renderPieChart = () => {
    let cumulativePercent = 0;
    const r = 50;
    const circ = 2 * Math.PI * r; // ~314.16

    return (
      <div className="flex-1 flex flex-col md:flex-row items-center justify-around p-4 gap-6 bg-slate-950/40">
        <div className="relative w-[180px] h-[180px] flex items-center justify-center">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            {items.map((item, idx) => {
              const pct = item.value / totalVal;
              const strokeLength = pct * circ;
              const strokeOffset = circ - strokeLength + cumulativePercent * circ;
              cumulativePercent += pct;

              const colorClass = colors[idx % colors.length].split(' ')[0];

              return (
                <motion.circle
                  key={idx}
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: strokeOffset }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  cx="60"
                  cy="60"
                  r={r}
                  fill="transparent"
                  className={`${colorClass} stroke-[10]`}
                  strokeDasharray={`${circ} ${circ}`}
                />
              );
            })}
            <circle cx="60" cy="60" r="42" className="fill-slate-900" />
          </svg>

          {/* Central Donut Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">TOTAL</span>
            <span className="text-xl font-bold text-white">{totalVal}</span>
            <span className="text-[9px] text-cyan-500/60">{y_label}</span>
          </div>
        </div>

        {/* Legend Panel */}
        <div className="flex flex-col gap-2.5 max-w-xs w-full">
          {items.map((item, idx) => {
            const pct = Math.round((item.value / totalVal) * 100);
            const bgColorClass = colors[idx % colors.length].split(' ')[2];
            return (
              <div key={idx} className="flex items-center justify-between border-b border-slate-800/60 pb-1.5 last:border-0 font-mono">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${bgColorClass}`} />
                  <span className="text-[11px] text-slate-300 font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                  <span>{item.value}</span>
                  <span className="text-[9px] text-cyan-600">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="border border-cyan-500/20 bg-slate-950/20 rounded p-4 flex flex-col gap-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2">
        <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wide flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-cyan-400 animate-pulse rounded-full" />
          {chart_title || "SYNTAX_ANALYSIS_CHART"}
        </h3>
        <span className="text-[9px] bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-cyan-400 rounded font-mono uppercase">
          TYPE: {chart_type}
        </span>
      </div>

      {/* Main Chart Stage */}
      <div className="flex flex-col justify-center min-h-[220px]">
        {chart_type === 'pie' && renderPieChart()}
        {chart_type === 'line' && renderLineChart()}
        {(chart_type === 'bar' || chart_type === 'compare_bar') && renderBarChart()}
      </div>

      {/* Legend / Info panels for Compare Bar */}
      {chart_type === 'compare_bar' && (
        <div className="flex items-center justify-center gap-6 text-[10px] font-mono p-1 border-t border-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-3 h-1.5 bg-cyan-500 rounded-sm" />
            <span className="text-slate-400">CATEGORY_A</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1.5 bg-purple-500 rounded-sm" />
            <span className="text-slate-400">CATEGORY_B</span>
          </div>
        </div>
      )}

      {/* Additional Trends/Reasons panel typical of Question 53 */}
      {additional_info && additional_info.length > 0 && (
        <div className="bg-cyan-500/5 border border-cyan-500/10 p-3 rounded flex flex-col gap-1.5 mt-2">
          <span className="text-[10px] text-cyan-400/60 font-bold uppercase tracking-wider font-mono">
            // SUPPLEMENTARY_METADATA :
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
            {additional_info.map((info, i) => (
              <div key={i} className="flex gap-2 items-start text-slate-300">
                <span className="text-cyan-500 font-bold">▶</span>
                <span>{info}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
