import * as React from 'react';
import { OBJIOItemClassViewable, registerViews } from 'objio-object/view/config';
import { DocTable } from 'objio-object/client/doc-table';
import { FileObject } from 'objio-object/client/file-object';
import { DrillDownTable, DrillDownTableView } from './drilldown-table';
import {
  DocLayoutView,
  DocLayout,
  ObjectHolderBase,
  ObjectHolderBaseArgs
} from './layout';
import { CategoryFilterView, CategoryFilter } from './category-filter';
import { RangeFilter, RangeFilterView } from './range-filter';
import { ViewFactory } from 'objio-object/common/view-factory';

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
      })
    }
  });

  lvf.register({
    classObj: DocTable,
    createObject: (args: ObjectHolderBaseArgs) => new DrillDownTable(args),
    viewType: 'drilldown-table',
    view: (props: { model: DrillDownTable }) => (
      <DrillDownTableView model={props.model}/>
    )
  });

  lvf.register({
    classObj: DocTable,
    createObject: (args: ObjectHolderBaseArgs) => new CategoryFilter(args),
    viewType: 'category-filter',
    view: (props: { model: CategoryFilter }) => (
      <CategoryFilterView model={props.model}/>
    )
  });

  lvf.register({
    classObj: DocTable,
    createObject: (args: ObjectHolderBaseArgs) => new RangeFilter(args),
    viewType: 'range-filter',
    view: (props: { model: RangeFilter }) => (
      <RangeFilterView model={props.model}/>
    )
  });
}

export function getViews(): Array<OBJIOItemClassViewable> {
  registerViews({
    classObj: DocLayout,
    views: [{
      view: (props: { model: DocLayout }) => <DocLayoutView {...props}/>
    }],
    flags: [ 'create-wizard' ],
    desc: 'Layout new'
  });

  return [
    DocLayout
  ];
}
