import { ChartOptions } from 'chart.js';

export type ChartOptionsPreset = { compact?: boolean };

export function baseChartOptions(
  type: 'bar' | 'line' | 'doughnut' = 'bar',
  preset: ChartOptionsPreset = {},
): ChartOptions {
  const compact = preset.compact ?? false;
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
  const muted = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim();
  const fg = textColor ? `rgb(${textColor})` : '#334155';
  const grid = muted ? `rgba(${muted}, 0.25)` : 'rgba(148, 163, 184, 0.25)';

  const legendLabels = {
    color: fg,
    font: { family: 'inherit', size: compact ? 11 : 12 },
    boxWidth: compact ? 10 : 12,
    padding: compact ? 6 : 10,
  };

  const common = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'center' as const,
        labels: legendLabels,
      },
    },
  };

  if (type === 'doughnut') {
    return {
      ...common,
      layout: {
        padding: compact
          ? { top: 2, right: 4, bottom: 2, left: 4 }
          : { top: 4, right: 8, bottom: 4, left: 8 },
      },
      cutout: compact ? '72%' : '68%',
      plugins: {
        legend: {
          ...common.plugins!.legend!,
          display: true,
          labels: {
            ...legendLabels,
            boxWidth: compact ? 8 : 10,
            padding: compact ? 4 : 6,
          },
        },
      },
    } as ChartOptions;
  }

  return {
    ...common,
    indexAxis: type === 'bar' ? ('x' as const) : undefined,
    scales: {
      x: {
        ticks: { color: fg },
        grid: { color: grid },
      },
      y: {
        ticks: { color: fg },
        grid: { color: grid },
      },
    },
  } as ChartOptions;
}
