import { format } from 'd3-format';

import { Datum } from './types';

export function formatAxisNumber(d: number) {
  return d > 90000 ? format('.2s')(d).replace('G', 'B') : format('.2r')(d);
}

export const formatPopulation = formatAxisNumber;

export const formatLabel = format(',');

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
