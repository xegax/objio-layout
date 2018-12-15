import * as React from 'react';
import './_category-filter.scss';
import { CategoryFilter } from '../client/category-filter';
import { DropDownLoadable } from 'ts-react-ui/drop-down-loadable';

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

  onLoadNext = (from: number, count: number) => {
    return this.props.model.loadNext(from, count);
  }

  renderData(): JSX.Element {
    const model = this.props.model;
    const table = model.getObject();
    if (!table.isStatusValid()) {
      return <div>in progress: {table.getProgress()}</div>;
    }

    const value = model.getSelect() as string;
    return (
      <div style={{display: 'flex', alignItems: 'center', padding: 5}}>
        <i
          className='fa fa-undo'
          style={{flexGrow: 0, cursor: 'pointer', marginLeft: 5, marginRight: 5}}
          onClick={() => {
            model.setSelect(null);
          }}
        />
        <DropDownLoadable
          disabled={!model.getColumn()}
          style={{flexGrow: 1}}
          model={model.getListModel()}
          totalValues={() => model.getRowsNum()}
          onLoadNext={this.onLoadNext}
          onSelect={value => {
            model.setSelect(value.value);
          }}
          onFilter={filter => {
            return model.filter(filter);
          }}
          value={value ? { value } : { value: '-- nothing --' }}
        />
      </div>
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
