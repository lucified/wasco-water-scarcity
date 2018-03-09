import { ScaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { transition } from 'd3-transition'; // adds transition() to selections d3.select
import * as React from 'react';

import * as styles from './bar.scss';

interface Props {
  y0: number;
  y1: number;
  width: number;
  scale: ScaleLinear<number, number>;
  fill: string;
  transitionDuration?: number;
}

interface DefaultProps {
  transitionDuration: number;
}

type PropsWithDefaults = Props & DefaultProps;

export default class Bar extends React.Component<Props, any> {
  public static defaultProps: DefaultProps = {
    transitionDuration: 250,
  };

  // prettier-ignore
  private barRef!: SVGElement;
  // prettier-ignore
  private groupRef!: SVGElement;

  constructor(props: Props) {
    super(props);

    this.storeBarRef = this.storeBarRef.bind(this);
    this.storeGroupRef = this.storeGroupRef.bind(this);
  }

  public componentDidMount() {
    this.updateHeight(true);
  }

  public shouldComponentUpdate(nextProps: Props) {
    const { y0, y1, scale, width, fill } = this.props as PropsWithDefaults;

    return (
      nextProps.y0 !== y0 ||
      nextProps.y1 !== y1 ||
      nextProps.scale !== scale ||
      nextProps.width !== width ||
      nextProps.fill !== fill
    );
  }

  public componentDidUpdate() {
    this.updateHeight(false);
  }

  private updateHeight(initialDraw: boolean) {
    const { scale, y0, y1, transitionDuration } = this
      .props as PropsWithDefaults;
    const topY = scale(y1);
    const bottomY = scale(y0);
    const height = Math.max(bottomY - topY, 0);
    const t = transition('bar-chart').duration(transitionDuration);

    // We scale by (1, -1) to invert the coordinates: positive becomes up and negative down.
    // This allows us to grow the bar from bottom to top instead of top to bottom.
    if (!initialDraw) {
      // prettier-ignore
      select(this.groupRef)
        .transition(t as any)
          .attr('transform', `scale(1, -1) translate(0, -${bottomY})`);
    } else {
      select(this.groupRef).attr(
        'transform',
        `scale(1, -1) translate(0, -${bottomY})`,
      );
    }

    select(this.barRef)
      .transition(t as any)
      .attr('height', height);
  }

  private storeBarRef(ref: SVGRectElement) {
    this.barRef = ref;
  }

  private storeGroupRef(ref: SVGGElement) {
    this.groupRef = ref;
  }

  public render() {
    const { width, fill } = this.props as PropsWithDefaults;

    return (
      <g ref={this.storeGroupRef}>
        <rect
          ref={this.storeBarRef}
          className={styles.bar}
          width={width}
          fill={fill}
          y={0}
        />
      </g>
    );
  }
}
