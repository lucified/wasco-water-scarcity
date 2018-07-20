import { format } from 'd3-format';

import { Datum } from './types';

export function toMidpoint(startYear: number, endYear: number): Date {
  const startDate = new Date(startYear, 0, 1);
  const endDate = new Date(endYear, 11, 31);

  return new Date((endDate.getTime() + startDate.getTime()) / 2);
}

export function formatPopulation(d: number) {
  return format('.2s')(d).replace('G', 'B');
}

export function formatYearRange(d: Datum, longForm = false) {
  const shortFormatter = format('02d');
  if (d.startYear === d.endYear) {
    return longForm
      ? String(d.startYear)
      : `'${shortFormatter(d.startYear % 100)}`;
  }

  return longForm
    ? `${d.startYear}-${d.endYear}`
    : `'${shortFormatter(d.startYear % 100)}-'${shortFormatter(
        d.endYear % 100,
      )}`;
}

export function historicalDataRequestId(
  climateModel: string,
  impactModel: string,
  timeScale: string,
) {
  return `${climateModel}-${impactModel}-${timeScale}`;
}
