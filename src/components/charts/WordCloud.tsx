import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import 'echarts-wordcloud';
import type { Analytics } from '../../lib/data';
import { getChartColors } from '../../lib/chart-theme';
import { useTheme } from '../../lib/theme';

interface Props { analytics: Analytics }

export default function WordCloud({ analytics }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolved } = useTheme();

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    const c = getChartColors();
    const data = analytics.wordFrequencies.map(({ word, weight }) => ({ name: word, value: weight }));

    chart.setOption({
      tooltip: {
        formatter: (params: { name: string; value: number }) => `${params.name}: ${params.value}`,
        backgroundColor: c.cardBg, borderColor: c.border,
        textStyle: { color: c.text, fontSize: 13 },
      },
      series: [{
        type: 'wordCloud', shape: 'circle',
        left: 'center', top: 'center', width: '90%', height: '90%',
        sizeRange: [14, 52], rotationRange: [-30, 30], rotationStep: 15, gridSize: 8,
        drawOutOfBound: false,
        textStyle: {
          fontFamily: "'DM Sans', sans-serif", fontWeight: 'bold',
          color: () => c.palette[Math.floor(Math.random() * c.palette.length)],
        },
        emphasis: { textStyle: { shadowBlur: 8, shadowColor: 'rgba(29,155,240,0.3)' } },
        data,
      }],
    });

    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
  }, [analytics, resolved]);

  return <div ref={ref} className="w-full h-[320px]" />;
}
