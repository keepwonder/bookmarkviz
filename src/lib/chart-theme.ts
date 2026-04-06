export function getChartColors() {
  const style = getComputedStyle(document.documentElement);
  const get = (v: string) => style.getPropertyValue(v).trim();
  return {
    bg: get('--bg'),
    cardBg: get('--bg-secondary'),
    text: get('--text-primary'),
    textSecondary: get('--text-secondary'),
    label: get('--chart-label'),
    border: get('--border'),
    accent: get('--accent'),
    from: get('--chart-from'),
    to: get('--chart-to'),
    areaFrom: get('--chart-area-from'),
    areaTo: get('--chart-area-to'),
    empty: get('--chart-empty') || '#1a1d21',
    split: get('--chart-split') || get('--border'),
    axis: get('--chart-axis') || get('--border'),
    palette: [
      get('--chart-palette-1') || '#1d9bf0',
      get('--chart-palette-2') || '#00ba7c',
      get('--chart-palette-3') || '#f91880',
      get('--chart-palette-4') || '#ffd400',
    ],
  };
}
