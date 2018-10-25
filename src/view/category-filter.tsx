import * as React from 'react';
import { List2, List2Item } from 'ts-react-ui/list2';
import { FitToParent } from 'ts-react-ui/fittoparent';
import './_category-filter.scss';
import { CategoryFilter, Row } from '../client/category-filter';

export { CategoryFilter };

const classes = {
  filter: 'category-filter',
  item: 'category-item',
  itemWrap: 'category-item-wrap'
};

export interface Props {
  model: CategoryFilter;
}

export class CategoryFilterView extends React.Component<Props> {
  subscriber = () => {
    this.setState({});
  }

  componentDidMount() {
    this.props.model.holder.subscribe(this.subscriber);
  }

  componentWillUnmount() {
    this.props.model.holder.unsubscribe(this.subscriber);
  }

  renderColumnSelect(): JSX.Element {
    const model = this.props.model;
    if (!model.isEdit())
      return null;

    const value = model.getColumn();
    return (
      <select
        value={value}
        onChange={e => {
          model.setColumn(e.currentTarget.value);
        }}
      >
        {model.getColumns().map((col, i) => {
          return <option key={i} value={col.name}>{col.name}</option>;
        })}
      </select>
    );
  }

  renderTableName(): JSX.Element {
    const model = this.props.model;
    if (!model.isEdit())
      return;

    return (
      <div>
        table: {model.get().getTableRef().getTable()}
      </div>
    );
  }

  renderData(): JSX.Element {
    const model = this.props.model;
    const state = model.get();
    if (!state.isStatusValid()) {
      return <React.Fragment>in progress: {state.getProgress()}</React.Fragment>;
    }

    return (
      <React.Fragment>
        {this.renderTableName()}
        {this.renderColumnSelect()}
        <FitToParent wrapToFlex>
          <List2 model={model.getRender()}/>
        </FitToParent>
        <div>rows: {model.getTotalRows()}</div>
      </React.Fragment>
    );
  }

  render() {
    return (
      <div className={classes.filter}>
        {this.renderData()}
      </div>
    );
  }
}
