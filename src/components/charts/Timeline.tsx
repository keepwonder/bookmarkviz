import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { Analytics } from '../../lib/data';
import { getChartColors } from '../../lib/chart-theme';
import { useTheme } from '../../lib/theme';

interface Props { analytics: Analytics }

export default function Timeline({ analytics }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolved } = useTheme();

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    const c = getChartColors();
    const dates = analytics.dailyCounts.map(d => d.date);
    const counts = analytics.dailyCounts.map(d => d.count);

    chart.setOption({
      tooltip: { trigger: 'axis', backgroundColor: c.cardBg, borderColor: c.border, textStyle: { color: c.text, fontSize: 13 } },
      grid: { left: 50, right: 20, top: 30, bottom: 30 },
      xAxis: { type: 'category', data: dates, axisLabel: { fontSize: 11, color: c.label, rotate: 30 }, axisLine: { lineStyle: { color: c.axis } } },
      yAxis: { type: 'value', axisLabel: { color: c.label }, splitLine: { lineStyle: { color: c.split } } },
      series: [{
        type: 'line', data: counts, smooth: true, symbol: 'circle', symbolSize: 6,
        lineStyle: { width: 2.5, color: c.from },
        itemStyle: { color: c.from },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: c.areaFrom }, { offset: 1, color: c.areaTo },
          ]),
        },
      }],
    });

    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
  }, [analytics, resolved]);

  return <div ref={ref} className="w-full h-[280px]" />;
}
