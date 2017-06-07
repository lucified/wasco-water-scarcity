export interface BarChartSegmentDatum {
  key: string;
  total: number;
  color?: string;
  y0?: number;
  y1?: number;
}

export interface BarChartDatum {
  // Key: integer index. Should be adjacent numbers.
  key: number;
  // Total: sum of "values" fields of objects in values array.
  total: number;
  // Values: each object in this array is represented by a stacked bar
  values: BarChartSegmentDatum[];
}
