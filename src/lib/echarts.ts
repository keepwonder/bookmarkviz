import * as echarts from 'echarts/core';

import {
  BarChart,
  LineChart,
  PieChart,
  HeatmapChart,
  GraphChart,
} from 'echarts/charts';

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  CalendarComponent,
  VisualMapComponent,
} from 'echarts/components';

import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  HeatmapChart,
  GraphChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  CalendarComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

export default echarts;
