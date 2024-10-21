export const PresetDefaultGrid = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 8,
  xl: 8,
  xxl: 6,
};

export const DefaultGutter = { xs: 8, sm: 16, md: 16, lg: 24, xl: 24, xxl: 32 };

export const RowAligns = ['top', 'middle', 'bottom', 'stretch'] as const;
export const RowJustify = [
  'start',
  'end',
  'center',
  'space-around',
  'space-between',
  'space-evenly',
] as const;

export const alignPropsMap: Record<(typeof RowAligns)[number], string> = {
  top: 'flex-start',
  middle: 'center',
  bottom: 'flex-end',
  stretch: 'stretch',
};

export const justifyPropsMap: Record<(typeof RowJustify)[number], string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  'space-around': 'space-around',
  'space-between': 'space-between',
  'space-evenly': 'space-evenly',
};
