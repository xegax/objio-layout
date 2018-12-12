import * as React from 'react';
import { RangeFilter } from '../client/range-filter';
import { RangeSlider } from 'ts-react-ui/range-slider';
import './_range-filter.scss';

export {
  RangeFilter
};

const classes = {
  rangeFilter: 'range-filter',
  label: 'range-filter-label',
  ctrl: 'range-filter-ctrl'
};

export interface Props {
  model: RangeFilter;
}

export class RangeFilterView extends React.Component<Props> {
  subscriber = () => {
    this.setState({});
  }

  componentDidMount() {
    this.props.model.holder.subscribe(this.subscriber);
  }

  componentWillUnmount() {
    this.props.model.holder.unsubscribe(this.subscriber);
  }

  render() {
    const range = this.props.model.getRange();
    const minMax = this.props.model.getMinMaxRange();
    if (!minMax || !range)
      return null;

    return (
      <div className={classes.rangeFilter}>
        <div className={classes.label}>{range.min}</div>
        <div className={classes.ctrl}>
          <RangeSlider
            min={minMax.min}
            max={minMax.max}
            range={[range.min, range.max]}
            onChanged={(min: number, max: number) => {
              this.props.model.setRange({ min, max });
            }}
            />
        </div>
        <div className={classes.label}>{range.max}</div>
      </div>
    );
  }
}
