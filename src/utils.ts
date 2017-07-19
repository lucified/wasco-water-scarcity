import { format } from 'd3-format';

export function toMidpoint(startYear: number, endYear: number): Date {
  const startDate = new Date(startYear, 0, 1);
  const endDate = new Date(endYear, 11, 31);

  return new Date((endDate.getTime() + startDate.getTime()) / 2);
}

export function formatPopulation(d: number) {
  return format('.2s')(d).replace('G', 'B');
}
