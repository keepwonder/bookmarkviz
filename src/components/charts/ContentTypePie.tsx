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

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    const c = getChartColors();
    const LABELS: Record<string, string> = { article: t.explore.typeArticle, text: t.explore.typeText, video: t.explore.typeVideo, image: t.explore.typeImage };
    const data = analytics.contentTypeDist.map((d, i) => ({
      name: LABELS[d.type] || d.type, value: d.count,
      itemStyle: { color: c.palette[i % c.palette.length] },
    }));

    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', backgroundColor: c.cardBg, borderColor: c.border, textStyle: { color: c.text, fontSize: 13 } },
      series: [{
        type: 'pie', radius: ['42%', '72%'], center: ['50%', '55%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: c.cardBg, borderWidth: 3 },
        label: { fontSize: 13, color: c.text, formatter: '{b}\n{d}%' },
        data,
      }],
    });

    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
  }, [analytics, t, resolved]);

  return <div ref={ref} className="w-full h-[300px]" />;
}
