import * as React from 'react';
import { DocLayout, ObjectHolderBase } from '../client/layout';
import { Header } from 'ts-react-ui/layout';
import { className as cn } from 'ts-react-ui/common/common';
import { LayoutModel } from 'ts-react-ui/model/layout';
import './_obj-holder-view.scss';

const classes = {
  cont: 'layout-cont',
  title: 'layout-cont-title',
  tools: 'layout-cont-tools',
  titleWrap: 'layout-cont-titlewrap',
  header: 'layout-cont-header'
};

export interface Props {
  layoutId: string;
  model: ObjectHolderBase;
  layout?: LayoutModel;     // pass by LayoutView
  docLayout: DocLayout;
}

export class ObjHolderView extends React.Component<Props> {
  subscriber = () => {
    this.setState({});
  }

  componentDidMount() {
    this.props.model.holder.subscribe(this.subscriber);
  }

  componentWillUnmount() {
    this.props.model.holder.unsubscribe(this.subscriber);
  }

  renderTitle(): JSX.Element {
    const { model } = this.props;
    const title = (
      <div className={classes.titleWrap}>
        {model.getName()}
      </div>
    );

    return (
      <div className={classes.title}>
        {title}
      </div>
    );
  }

  remove = () => {
    this.props.docLayout.remove(this.props.model);
  }

  renderTools() {
    const obj = this.props.model;
    const tools = [
      <i
        className='fa fa-spinner fa-spin'
        style={{ display: obj.getTasksInProgress() ? null : 'none' }}
      />,
      <i
        onClick={this.remove}
        className='fa fa-remove'
      />
    ] as Array<JSX.Element>;
    return (
      <div className={classes.tools}>
        {tools.filter(t => t).map((item, i) => React.cloneElement(item, {key: i}))}
      </div>
    );
  }

  setSelect = () => {
    this.props.docLayout.setSelect(this.props.model);
  }

  render() {
    const select = this.props.docLayout.getSelect() == this.props.model;
    return (
      <div className={cn(classes.cont, select && 'select')}>
        <div className={classes.header} onClick={this.setSelect}>
          <Header
            key={this.props.layoutId}
            data={{id: this.props.layoutId}}
            layout={this.props.layout}
          >
            {this.renderTitle()}
          </Header>
          {this.renderTools()}
        </div>
        {this.props.children}
      </div>
    );
  }
}
