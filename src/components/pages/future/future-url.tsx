import { Props } from '.';

export function futurePageURL<T extends Props>(
  props: T,
  includeHash?: boolean,
) {
  return `/${props.selectedDataType}/${
    props.selectedTimeIndex
  }/${toUrlEncodedBase64String(
    props.selectedScenario,
  )}/${toUrlEncodedBase64String(props.comparisonVariables)}${
    includeHash ? `#${window.location.hash}` : ''
  }`;
}

function toUrlEncodedBase64String(obj: any) {
  return encodeURIComponent(btoa(JSON.stringify(obj)));
}

export function fromUrlEncodedBase64String(str: string) {
  console.log('parsed:', JSON.parse(atob(decodeURIComponent(str))));
  return JSON.parse(atob(decodeURIComponent(str)));
}
