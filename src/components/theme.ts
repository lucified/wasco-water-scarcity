import styled from 'styled-components';
const Sticky = require('react-stickynode');

// FONT

const bodyFontSize = 16;
const bodyFontFamily =
  "'Open Sans', 'Helvetica Neue', Arial, Helvetica, sans-serif";
const headingFontFamily =
  "'Open Sans', 'Helvetica Neue', Arial, Helvetica, sans-serif";
const labelFontFamily = headingFontFamily;
const bodyLineHeight = 1.64;

// BREAKPOINTS

const mobileBreakpoint = 320;
const tabletBreakpoint = 768;
const computerBreakpoint = 992;
const largeMonitorBreakpoint = 1200;
const widescreenMonitorBreakpoint = 1920;

// COLOR VALUES

// colors from design
export const colors = {
  red: '#dd0035',
  blue: '#2374C4',
  blueDarker: '#000d5c',
  blueLight: '#58addb',
  blueChill: 'rgb(10, 135, 165)',
  blueChillDarker: 'rgb(0, 84, 114)',
  cerise: '#e6007e',
  green: '#60c13c',
  grayHint: '#f9f8f8',
  grayLightestWithTransparency: 'rgba(247, 246, 246, 0.04)',
  grayLightest: '#f7f6f6',
  grayLighter: '#f0e9e9',
  grayLight: '#e5dddb',
  gray: '#999999',
  grayDark: '#807775',
  grayDarker: '#373433',
  grayDarkest: '#131212',
  redLighter: '#e19791',
  redDark: '#930e03',
  blueAalto: '#0075b1',

  // COMMON COLOR PRESETS

  expandBorder: '#58addb', // blueLight
  grayDivider: '#e5dddb', // grayLight
  border: 'rgba(60, 30, 0, 0.12)',
  text: '#373433', // grayDarker
  textHover: 'black',
  textSelection: '#2374C4', // blue
  textMenu: '#807775', // grayDark

  selection: 'white',
  selectionActive: 'white',
};

// SIZE AND POSITION

const borderRadius = 2;
const borderWidth = 1;
const dividerWidth = 1;
const defaultMargin = 20;

// REPEATING ELEMENTS
export const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const DataTypeSelectorContainer = styled.div`
  margin-top: ${defaultMargin}px;
  width: 100%;
  max-width: 420px;
  padding-right: ${defaultMargin}px;
`;

export const Title = styled.h1`
  font-weight: 800;
  font-size: 28px;
`;

export const BodyContainer = styled.div`
  position: relative;
  display: flex;
  flex-flow: column;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  margin-top: ${defaultMargin}px;
`;

export const Scroll = styled.div`
  position: relative;
  display: block;
`;

const selectorsWidth = '400px';

export const SelectorsContent = styled.div`
  position: relative;
  width: ${selectorsWidth};
  padding-right: ${defaultMargin}px;
`;

export const StickyGraphics = styled(Sticky)`
  left: calc(100% - ${selectorsWidth});
  width: calc(100% - ${selectorsWidth});
  height: 100%;
  float: right;
`;

export const SectionHeader = styled.h2`
  margin-bottom: ${defaultMargin / 2}px;
  font-size: 24px;
  font-weight: 400;
`;

export const SmallSectionHeader = styled.h3`
  margin-top: 0;
`;

export const BodyText = styled.div`
  font-family: ${bodyFontFamily};
  font-size: ${bodyFontSize}px;
  line-height: ${bodyLineHeight};
  color: ${colors.grayDarker};

  b {
    color: ${colors.grayDarkest};
  }
`;

export const SelectorHeader = styled.h3`
  font-size: 16px;
  font-weight: 700;
`;

export const SelectorDescription = BodyText.extend`
  font-size: ${bodyFontSize - 2}px;
`;

export const SecondaryContent = BodyText.extend`
  font-size: 15px;
  padding-left: ${defaultMargin}px;
  padding-top: 5px;
  border-left: 1px solid ${colors.grayLight};
`;

export const theme = {
  bodyFontFamily,
  bodyFontSize,
  bodyLineHeight,
  headingFontFamily,
  labelFontFamily,
  mobileBreakpoint,
  tabletBreakpoint,
  computerBreakpoint,
  largeMonitorBreakpoint,
  widescreenMonitorBreakpoint,
  borderRadius,
  borderWidth,
  dividerWidth,
  defaultMargin,
  colors,
  margin: (n = 1) => `${n * defaultMargin}px`,
};
