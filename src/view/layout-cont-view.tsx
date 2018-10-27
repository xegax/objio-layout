import * as React from 'react';
import { DataSourceHolder } from '../server/layout';
import './layout-cont-view.scss';
import { Header } from 'ts-react-ui/layout';
import { DocLayout } from '../client/layout';

const classes = {
  cont: 'layout-cont',
  title: 'layout-cont-title',
  tools: 'layout-cont-tools',
  titleWrap: 'layout-cont-titlewrap',
  header: 'layout-cont-header'
};

export interface Owner {
  onRemove?();
  onEdit?();
  isEdit?(): boolean;
  setName?(name: string): void;
}

export interface Props {
  layoutId: string;
  model: DataSourceHolder;
  owner?: Owner;
}

export class LayoutContView extends React.Component<Props> {
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
    const { model, owner } = this.props;
    let title: JSX.Element;
    if (owner.isEdit()) {
      title = (
        <input
          autoFocus
          defaultValue={model.getName() as string}
          onKeyDown={evt => {
            if (evt.keyCode == 13) {
              owner.setName && owner.setName(evt.currentTarget.value);
            }
          }}
          onBlur={evt => {
            owner.setName && owner.setName(evt.currentTarget.value);
          }}
        />
      );
    } else {
      title = (
        <div className={classes.titleWrap}
          onDoubleClick={() => {
            owner.onEdit && owner.onEdit();
          }}
        >
          {model.getName()}
        </div>
      );
    }

    return (
      <div className={classes.title}>
        {title}
      </div>
    );
  }

  renderTools() {
    const obj = this.props.model;
    const owner = this.props.owner;
    const tools = [
      ...obj.getTools(),
      <i
        onClick={() => {
          obj.toggleEdit();
        }}
        style={{backgroundColor: obj.isEdit() ? 'gray' : null }}
        className='fa fa-edit'
      />,
      owner && owner.onRemove ?
        <i
          onClick={owner.onRemove}
          className='fa fa-remove'
        /> : null
    ] as Array<JSX.Element>;
    return (
      <div className={classes.tools}>
        {tools.filter(t => t).map((item, i) => React.cloneElement(item, {key: i}))}
      </div>
    );
  }

  render() {
    const obj = this.props.model;
    const docLayout = obj.getLayout() as DocLayout;
    const owner = this.props.owner;
    return (
      <div className={classes.cont}>
        <div className={classes.header}>
          <Header
            enabled={!owner.isEdit()}
            key={this.props.layoutId}
            data={{id: this.props.layoutId}}
            layout={docLayout.getLayout()}
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
