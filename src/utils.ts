export function toMidpoint(startYear: number, endYear: number): Date {
  const startDate = new Date(startYear, 0, 1);
  const endDate = new Date(endYear, 11, 31);

  return new Date((endDate.getTime() + startDate.getTime()) / 2);
}
