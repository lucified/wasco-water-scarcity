import { Axis } from 'd3-axis';
import { select } from 'd3-selection';
import 'd3-transition'; // adds transition() to selections d3.select
import * as React from 'react';

interface Props {
  axis: Axis<any>;
  className?: string;
  transform?: string;
}

export default class AxisComponent extends React.Component<Props, void> {
  constructor(props: Props) {
    super(props);
    this.storeAxisRef = this.storeAxisRef.bind(this);
  }

  private axisRef: SVGGElement;

  private storeAxisRef(ref: SVGGElement) {
    this.axisRef = ref;
  }

  public componentDidMount() {
    this.drawAxes(true);
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.props.axis !== prevProps.axis) {
      this.drawAxes(false);
    }
  }

  private drawAxes(initialDraw: boolean) {
    const { axis } = this.props;
    if (initialDraw) {
      select(this.axisRef).call(axis);
    } else {
      select(this.axisRef).transition().call(axis as any);
    }
  }

  public render() {
    const { className, transform } = this.props;
    return (
      <g className={className} transform={transform} ref={this.storeAxisRef} />
    );
  }
}
