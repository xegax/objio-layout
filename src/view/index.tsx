import * as React from 'react';
import { OBJIOItemClassViewable, registerViews } from 'objio-object/view/config';
import { DatabaseTable } from 'objio-object/client/database/database-table';
import { VideoFileObject } from 'objio-object/client/video-file-object';
import { ObjectBase } from 'objio-object/base/object-base';
import {
  DocLayoutView,
  DocLayout,
  ObjectHolderBase,
  ObjectHolderBaseArgs
} from './layout';
import { ViewFactory } from 'objio-object/common/view-factory';
import { Icon } from 'ts-react-ui/icon';
import 'ts-react-ui/typings';
import * as LayoutIcon from '../images/layout.png';
import { ObjectToCreate } from 'objio-object/common/interfaces';

export function getObjectsToCreate(): Array<ObjectToCreate> {
  return [
    {
      name: 'layout',
      desc: 'object to layout views',
      create: () => new DocLayout()
    }
  ];
}

export function initDocLayout(mvf: ViewFactory) {
  const lvf = DocLayout.getViewFactory();
  lvf.register({
    classObj: ObjectBase,
    createObject: (args: ObjectHolderBaseArgs) => new ObjectHolderBase(args),
    viewType: 'content',
    view: (props: { model: ObjectHolderBase }) => {
      return mvf.getView({
        classObj: ObjectBase,
        props: { model: props.model.getObject() }
      });
    }
  });

  lvf.register({
    classObj: DatabaseTable,
    createObject: (args: ObjectHolderBaseArgs) => new ObjectHolderBase(args),
    viewType: 'content',
    view: (props: { model: ObjectHolderBase }) => {
      return mvf.getView({
        classObj: DatabaseTable,
        props: { model: props.model.getObject() }
      });
    }
  });

  lvf.register({
    classObj: VideoFileObject,
    createObject: (args: ObjectHolderBaseArgs) => new ObjectHolderBase(args),
    viewType: 'content',
    view: (props: { model: ObjectHolderBase }) => {
      return mvf.getView({
        classObj: VideoFileObject,
        props: { model: props.model.getObject(), onlyContent: true }
      });
    }
  });
}

export function getViews(): Array<OBJIOItemClassViewable> {
  registerViews({
    classObj: DocLayout,
    icons: { item: <Icon src={LayoutIcon}/> },
    views: [{
      view: (props: { model: DocLayout }) => <DocLayoutView {...props}/>
    }],
    flags: [ 'create-wizard' ],
    desc: 'Layout'
  });

  return [
    DocLayout
  ];
}
