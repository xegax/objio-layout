import * as React from 'react';
import { List } from 'ts-react-ui/list';
import { FitToParent } from 'ts-react-ui/fittoparent';
import { DrillDownTable } from '../client/drilldown-table';

import './_drilldown-table.scss';

export { DrillDownTable };

const classes = {
  class: 'drilldown-table'
};

export interface Props {
  model: DrillDownTable;
}

export class DrillDownTable2View extends React.Component<Props> {
  subscriber = () => {
    this.setState({});
  }

  componentDidMount() {
    this.props.model.holder.subscribe(this.subscriber);
  }

  componentWillUnmount() {
    this.props.model.holder.unsubscribe(this.subscriber);
  }

  renderData(): JSX.Element {
    const model = this.props.model;
    const obj = model.getObject();
    if (!obj.isStatusValid()) {
      return <>in progress: {obj.getProgress()}</>;
    }

    return (
      <FitToParent wrapToFlex>
        <List border model={model.getTableRender()}/>
      </FitToParent>
    );
  }

  render() {
    return (
      <div className={classes.class}>
        {this.renderData()}
      </div>
    );
  }
}
