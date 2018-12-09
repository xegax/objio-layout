import * as React from 'react';
import { OBJIOItemClassViewable, registerViews } from 'objio-object/view/config';
import { DocLayout, DocLayoutView } from './layout';
import { DataSourceHolder, LayoutItemViewProps } from '../server/layout';
import { ViewFactory } from '../client/view-factory';
import { DocTable } from 'objio-object/client/doc-table';
import { FileObject } from 'objio-object/client/file-object';
import { CategoryFilter, CategoryFilterView } from './category-filter';
import { TagFilter, TagFilterView } from './tag-filter';
import { DrillDownTable, DrillDownTableView } from './drilldown-table';
import { DrillDownTable2, DrillDownTable2View } from './drilldown-table2';
import { SelectDetails, SelectDetailsView } from './select-details';
import { RangeFilter, RangeFilterView } from './range-filter-view';
import {
  DocLayoutView2,
  DocLayout as DocLayout2,
  ObjectHolderBase,
  ObjectHolderBaseArgs
} from './layout2';

export function initDocLayout(mvf: ViewFactory) {
  DocLayout2.getViewFactory().register({
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

  DocLayout2.getViewFactory().register({
    classObj: DocTable,
    createObject: (args: ObjectHolderBaseArgs) => new DrillDownTable2(args),
    viewType: 'drilldown-table',
    view: (props: { model: DrillDownTable2 }) => (
      <DrillDownTable2View model={props.model}/>
    )
  });

  const vf = DataSourceHolder.getFactory<DocTable, DocLayout>();

  vf.register({
    classObj: FileObject,
    object: args => new DataSourceHolder(args),
    viewType: 'content',
    view: (props: LayoutItemViewProps<FileObject, FileObject>) => {
      return mvf.getView({
        classObj: FileObject,
        props: { model: props.dataSource, onlyContent: true }
      });
    }
  });

  vf.register({
    classObj: FileObject,
    object: args => new DataSourceHolder(args),
    viewType: 'objInfo',
    view: (props: LayoutItemViewProps<FileObject, FileObject>) => (
      <div>
        <div>extention: {props.dataSource.getExt()}</div>
        <div>size: {props.dataSource.getSize()}</div>
        <div>name: {props.dataSource.getName()}</div>
      </div>
    )
  });

  vf.register({
    classObj: DocTable,
    object: args => new CategoryFilter(args),
    viewType: 'category-filter',
    view: props => (
      <CategoryFilterView model = {props.model as CategoryFilter}/>
    )
  });

  vf.register({
    classObj: DocTable,
    object: args => new TagFilter(args),
    viewType: 'tag-filter',
    view: props => (
      <TagFilterView model={props.model as TagFilter}/>
    )
  });

  vf.register({
    classObj: DocTable,
    object: args => new DrillDownTable(args),
    viewType: 'drilldown-table',
    view: props => (
      <DrillDownTableView model={props.model as DrillDownTable}/>
    )
  });

  vf.register({
    classObj: DocTable,
    object: args => new SelectDetails(args),
    viewType: 'select-details',
    view: props => (
      <SelectDetailsView model={ props.model as SelectDetails }/>
    )
  });

  vf.register({
    classObj: DocTable,
    object: args => new RangeFilter(args),
    viewType: 'range-filter',
    view: props => (
      <RangeFilterView model = {props.model as RangeFilter}/>
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
    desc: 'Layout'
  });

  registerViews({
    classObj: DocLayout2,
    views: [{
      view: (props: { model: DocLayout2 }) => <DocLayoutView2 {...props}/>
    }],
    flags: [ 'create-wizard' ],
    desc: 'Layout new'
  });

  return [
    DocLayout,
    DocLayout2
  ];
}
