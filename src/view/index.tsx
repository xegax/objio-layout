import * as React from 'react';
import { OBJIOItemClassViewable, registerViews } from 'objio-object/view/config';
import { Table2 } from 'objio-object/client/database/table2';
import { FileObject } from 'objio-object/client/file-object';
import { VideoFileObject } from 'objio-object/client/video-file-object';
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
    classObj: FileObject,
    createObject: (args: ObjectHolderBaseArgs) => new ObjectHolderBase(args),
    viewType: 'content',
    view: (props: { model: ObjectHolderBase }) => {
      return mvf.getView({
        classObj: FileObject,
        props: { model: props.model.getObject() }
      });
    }
  });

  lvf.register({
    classObj: Table2,
    createObject: (args: ObjectHolderBaseArgs) => new ObjectHolderBase(args),
    viewType: 'content',
    view: (props: { model: ObjectHolderBase }) => {
      return mvf.getView({
        classObj: Table2,
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
