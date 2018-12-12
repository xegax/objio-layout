import * as React from 'react';
import { Layout } from 'ts-react-ui/layout';
import { DocLayout, ObjectHolderBase, ObjectHolderBaseArgs } from '../client/layout';

export {
  DocLayout,
  ObjectHolderBase,
  ObjectHolderBaseArgs
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
