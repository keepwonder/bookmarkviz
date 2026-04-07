import { useEffect, useRef } from 'react';
import echarts from '../../lib/echarts';
import type { Analytics } from '../../lib/data';
import { getChartColors } from '../../lib/chart-theme';
import { useTheme } from '../../lib/theme';

interface Props { analytics: Analytics }

export default function AuthorGraph({ analytics }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolved } = useTheme();

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    const c = getChartColors();
    const { topAuthors, authorConnections } = analytics;
    const authorMap = new Map(topAuthors.map(a => [a.handle, a]));

    const nodes = topAuthors.map(a => ({
      name: a.handle,
      symbolSize: Math.max(12, Math.min(50, a.count * 12)),
      itemStyle: { color: c.palette[a.handle.charCodeAt(0) % c.palette.length] },
      label: { show: a.count >= 2, fontSize: 11, color: c.text },
      value: a.count,
    }));

    const links = authorConnections
      .filter(cn => authorMap.has(cn.source) && authorMap.has(cn.target))
      .map(cn => ({ source: cn.source, target: cn.target, lineStyle: { width: cn.weight * 1.5, opacity: 0.3, color: c.label } }));

    chart.setOption({
      tooltip: {
        formatter: (params: { name: string; value?: number; dataType: string }) => {
          if (params.dataType === 'node') return `@${params.name}<br/>🔖 ${params.value}`;
          return '';
        },
        backgroundColor: c.cardBg, borderColor: c.border,
        textStyle: { color: c.text, fontSize: 13 },
      },
      series: [{
        type: 'graph', layout: 'force', data: nodes, links,
        roam: true, draggable: true,
        force: { repulsion: 200, edgeLength: [80, 160], gravity: 0.1 },
        emphasis: { focus: 'adjacency', lineStyle: { width: 4, opacity: 0.8, color: c.from } },
        label: { position: 'right' },
      }],
    });

    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
  }, [analytics, resolved]);

  return <div ref={ref} className="w-full h-[400px]" />;
}
