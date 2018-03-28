import { compose, Omit, renameProp, toClass } from 'recompose';
const Dimensions = require('react-dimensions');

export default function responsive<
  Props extends { width?: number; [key: string]: any }
>(Component: React.ComponentType<Props>) {
  const enhance = compose<Props, Omit<Props, 'width'>>(
    Dimensions(),
    toClass,
    renameProp('containerWidth', 'width'),
  );

  return enhance(Component);
}

export interface ResponsiveProps {
  width: number;
}
