import { useEffect, useRef } from 'react';
import echarts from '../../lib/echarts';
import type { Analytics } from '../../lib/data';
import { getChartColors } from '../../lib/chart-theme';
import { useTheme } from '../../lib/theme';

interface Props { analytics: Analytics }

export default function CalendarHeatmap({ analytics }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolved } = useTheme();

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    const c = getChartColors();
    const { dailyCounts } = analytics;
    const dates = dailyCounts.map(d => d.date).sort();
    const maxVal = Math.max(...dailyCounts.map(d => d.count), 1);

    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[dates.length - 1]);
    const fullData: [string, number][] = [];
    const d = new Date(startDate);
    while (d <= endDate) {
      const dateStr = d.toISOString().split('T')[0];
      const existing = dailyCounts.find(dc => dc.date === dateStr);
      fullData.push([dateStr, existing ? existing.count : 0]);
      d.setDate(d.getDate() + 1);
    }

    chart.setOption({
      tooltip: {
        backgroundColor: c.cardBg,
        borderColor: c.border,
        textStyle: { color: c.text, fontSize: 13 },
        formatter: (params: { value: [string, number] }) => {
          const [date, count] = params.value;
          return `${date}<br/>🔖 ${count}`;
        },
      },
      visualMap: {
        show: false, min: 0, max: maxVal,
        inRange: { color: [c.empty, '#0a3d62', '#1d9bf0', '#71c9f8'] },
      },
      calendar: {
        top: 20, left: 50, right: 20, bottom: 10,
        range: [dates[0], dates[dates.length - 1]],
        cellSize: [14, 14],
        itemStyle: { borderWidth: 3, borderColor: c.cardBg, borderRadius: 2 },
        yearLabel: { show: false },
        monthLabel: { fontSize: 12, color: c.label, fontFamily: "'DM Sans', sans-serif" },
        dayLabel: {
          firstDay: 1, fontSize: 11, color: c.label,
          fontFamily: "'DM Sans', sans-serif",
          nameMap: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        },
        splitLine: { show: true, lineStyle: { color: c.border, width: 1 } },
      },
      series: [{
        type: 'heatmap', coordinateSystem: 'calendar', data: fullData,
        itemStyle: { borderRadius: 2 },
        emphasis: { itemStyle: { borderColor: c.accent, borderWidth: 1 } },
      }],
    });

    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
  }, [analytics, resolved]);

  return <div ref={ref} className="w-full h-[200px]" />;
}
