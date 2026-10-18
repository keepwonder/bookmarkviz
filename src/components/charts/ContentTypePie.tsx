import { useEffect, useRef } from 'react';
import echarts from '../../lib/echarts';
import type { Analytics } from '../../lib/data';
import { useI18n } from '../../lib/i18n';
import { getChartColors } from '../../lib/chart-theme';
import { useTheme } from '../../lib/theme';

interface Props { analytics: Analytics }

export default function ContentTypePie({ analytics }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const { resolved } = useTheme();
  const LABELS: Record<string, string> = { article: t.explore.typeArticle, text: t.explore.typeText, video: t.explore.typeVideo, image: t.explore.typeImage };
  const legendColors = getChartColors();
  const legendItems = analytics.contentTypeDist.map((d, i) => ({
    name: LABELS[d.type] || d.type,
    value: d.count,
    color: legendColors.palette[i % legendColors.palette.length],
  }));

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    const c = getChartColors();
    const labels: Record<string, string> = { article: t.explore.typeArticle, text: t.explore.typeText, video: t.explore.typeVideo, image: t.explore.typeImage };
    const data = analytics.contentTypeDist.map((d, i) => ({
      name: labels[d.type] || d.type, value: d.count,
      itemStyle: { color: c.palette[i % c.palette.length] },
    }));

    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', backgroundColor: c.cardBg, borderColor: c.border, textStyle: { color: c.text, fontSize: 13 } },
      series: [{
        type: 'pie', radius: ['36%', '62%'], center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: c.cardBg, borderWidth: 3 },
        label: { show: false },
        data,
      }],
    });

    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
  }, [analytics, t, resolved]);

  return (
    <div className="max-w-[380px] mx-auto">
      <div ref={ref} className="w-full h-[250px] md:h-[320px]" />
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-1">
        {legendItems.map(item => (
          <span key={item.name} className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: item.color }} aria-hidden="true" />
            {item.name}
            <span style={{ color: 'var(--text-tertiary)' }}>{item.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
