import { csvFormatRows } from 'd3-dsv';
import * as FileSaver from 'file-saver';
import { flatMap } from 'lodash';
import { StressShortageDatum, TimeAggregate, TimeScale } from './types';

function toStringOrEmpty(value?: number) {
  return value != null ? value.toString() : '';
}

function toCSV(data: Array<TimeAggregate<StressShortageDatum>>): string {
  const fields = [
    'Time',
    'RegionID',
    'Shortage',
    'Stress',
    'Population',
    'Availability',
    'Consumption (Total)',
    'Consumption (Irrigation)',
    'Consumption (Domestic)',
    'Consumption (Electric)',
    'Consumption (Livestock)',
    'Consumption (Manufacturing)',
  ];
  const csvData: string[][] = flatMap(data, d => {
    const time =
      d.startYear === d.endYear
        ? d.startYear.toString()
        : `${d.startYear}-${d.endYear}`;
    return Object.keys(d.data).map(regionId => {
      const regionDatum = d.data[Number(regionId)];
      return [
        time,
        regionId,
        toStringOrEmpty(regionDatum.shortage),
        toStringOrEmpty(regionDatum.stress),
        toStringOrEmpty(regionDatum.population),
        toStringOrEmpty(regionDatum.availability),
        toStringOrEmpty(regionDatum.consumptionTotal),
        toStringOrEmpty(regionDatum.consumptionIrrigation),
        toStringOrEmpty(regionDatum.consumptionDomestic),
        toStringOrEmpty(regionDatum.consumptionElectric),
        toStringOrEmpty(regionDatum.consumptionLivestock),
        toStringOrEmpty(regionDatum.consumptionManufacturing),
      ];
    });
  });

  return csvFormatRows([fields].concat(csvData));
}

export function saveCSV(
  climateModel: string,
  impactModel: string,
  timeScale: TimeScale,
  data: Array<TimeAggregate<StressShortageDatum>>,
): boolean {
  const filename = `${[climateModel, impactModel, timeScale].join(
    '-',
  )}-${new Date().toISOString()}.csv`;

  FileSaver.saveAs(
    new Blob([toCSV(data)], { type: 'text/csv;charset=utf-8' }),
    filename,
  );

  return false;
}
