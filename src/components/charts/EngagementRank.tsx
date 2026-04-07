import { useEffect, useRef } from 'react';
import echarts from '../../lib/echarts';
import type { Bookmark } from '../../lib/data';
import { getChartColors } from '../../lib/chart-theme';
import { useTheme } from '../../lib/theme';

interface Props { bookmarks: Bookmark[] }

function truncate(s: string, max: number): string {
  const clean = s.replace(/https?:\/\/\S+/g, '').replace(/\n/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max) + '...' : clean;
}

export default function EngagementRank({ bookmarks }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolved } = useTheme();

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    const c = getChartColors();
    const top = [...bookmarks].sort((a, b) => b.engagement.bookmarkCount - a.engagement.bookmarkCount).slice(0, 10).reverse();

    // Compute min/max for color scale
    const values = top.map(b => b.engagement.bookmarkCount);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    // Interpolate accent color from light (low) to full (high)
    const accentColor = c.accent;
    // Parse accent hex to RGB
    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const bHex = parseInt(accentColor.slice(5, 7), 16);

    function barColor(val: number): string {
      const t = (val - minVal) / range; // 0 = lightest, 1 = darkest
      // Light version: 30% opacity, full version: 100%
      const alpha = 0.25 + t * 0.75;
      return `rgba(${r},${g},${bHex},${alpha})`;
    }

    chart.setOption({
      tooltip: {
        trigger: 'axis', axisPointer: { type: 'shadow' },
        backgroundColor: c.cardBg, borderColor: c.border,
        textStyle: { color: c.text, fontSize: 13 },
        formatter: (params: { data: { handle: string; text: string; likes: number; reposts: number; value: number } }[]) => {
          const d = params[0].data;
          return `<strong>@${d.handle}</strong><br/>${d.text}<br/>🔖 ${d.value.toLocaleString()} · ❤️ ${d.likes.toLocaleString()} · 🔄 ${d.reposts.toLocaleString()}`;
        },
      },
      grid: { left: 100, right: 40, top: 10, bottom: 20 },
      xAxis: { type: 'value', axisLabel: { color: c.label }, splitLine: { lineStyle: { color: c.split } } },
      yAxis: { type: 'category', data: top.map(b => `@${b.authorHandle}`), axisLabel: { fontSize: 12, color: c.textSecondary } },
      series: [{
        type: 'bar',
        data: top.map(bk => ({
          value: bk.engagement.bookmarkCount, handle: bk.authorHandle, text: truncate(bk.text, 60),
          likes: bk.engagement.likeCount, reposts: bk.engagement.repostCount,
          itemStyle: {
            color: barColor(bk.engagement.bookmarkCount),
            borderRadius: [0, 4, 4, 0],
          },
        })),
        barWidth: 18,
      }],
    });

    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
  }, [bookmarks, resolved]);

  return <div ref={ref} className="w-full h-[400px]" />;
}
