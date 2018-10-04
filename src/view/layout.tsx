import * as React from 'react';
import { Layout } from 'ts-react-ui/layout';
import { DocLayout } from '../client/layout';
import { DataSourceHolder,
  ViewFactory,
  FactoryItem,
  LayoutItemViewProps
} from '../server/layout';

export {
  DocLayout,
  DataSourceHolder,
  ViewFactory,
  FactoryItem,
  LayoutItemViewProps
};

export interface Props {
  model: DocLayout;
}

export class DocLayoutView extends React.Component<Props, {}> {
  subscriber = () => {
    this.setState({});
  }

  componentDidMount() {
    this.props.model.updateLayoutMap();
    this.props.model.holder.subscribe(this.subscriber);
  }

  componentWillUnmount() {
    this.props.model.holder.unsubscribe(this.subscriber);
  }

  render() {
    const model = this.props.model;
    return (
      <Layout
        key={model.holder.getID()}
        model={model.getLayout()}
      />
    );
  }
}
