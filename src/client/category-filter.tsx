import * as React from 'react';
import { CategoryFilterBase, SortType, SortDir } from '../base/category-filter';
import { DocTable } from 'objio-object/client/doc-table';
import { ColumnAttr, LoadCellsArgs, Condition, SubtableAttrs } from 'objio-object/client/table';
import { PropsGroup, PropItem, DropDownPropItem } from 'ts-react-ui/prop-sheet';
import { Tabs, Tab } from 'ts-react-ui/tabs';
import { ListViewLoadableModel } from 'ts-react-ui/list-view-loadable';

const sortTypeArr = [
  { value: 'value', render: 'Value' },
  { value: 'count', render: 'Count' }
];

const sortDirArr = [
  { value: 'natural', render: 'Natural' },
  { value: 'asc', render: 'Ascending' },
  { value: 'desc', render: 'Descending' }
];

export class CategoryFilter extends CategoryFilterBase<DocTable> {
  protected subtable: string;
  protected rowsNum: number = 0;
  protected listModel = new ListViewLoadableModel();
  private dataKey: number = 0;

  constructor(args) {
    super(args);

    this.holder.addEventHandler({
      onLoad: this.onLoad,
      onCreate: this.onCreate,
      onObjChange: this.onChange
    });
  }

  onLoad = () => {
    this.updateTable();
    return Promise.resolve();
  }

  onCreate = () => {
    this.updateTable();
    return Promise.resolve();
  }

  onChange = () => {
    this.updateTable();
  }

  getRowsNum() {
    return this.rowsNum;
  }

  getTotalRowsNum() {
    return this.obj.getTotalRowsNum();
  }

  setColumn(column: string) {
    if (!super.setColumn(column))
      return false;
    
    this.updateTable();
    return true;
  }

  setSortType(type: SortType) {
    if (!super.setSortType(type))
      return false;

    this.updateTable();
    return true;
  }

  setSortDir(dir: SortDir) {
    if (!super.setSortDir(dir))
      return false;

    this.updateTable();
    return true;
  }

  getListModel() {
    return this.listModel;
  }

  loadNext(first: number, count: number) {
    const args: LoadCellsArgs = { first, count };
    if (this.subtable)
      args.table = this.subtable;

    return this.watchTask(
      this.getObject().getTableRef().loadCells(args)
      .then((rows: Array< Array<string> > ) => {
        return rows.map((row: Array<string>, i) => {
          return {
            value: row[0],
            render: (
              <div title={row[1]}>
                {row[0] == null || row[0].trim() == '' ? <span style={{visibility: 'hidden'}}>?</span> : row[0]}
              </div>
            )
          };
        });
      })
    );
  }

  getProps() {
    return (
      <PropsGroup label='table' key={this.holder.getID()}>
        <Tabs defaultSelect='data'>
          <Tab id='data' label='data'>
            <PropItem label='rows' value={this.rowsNum}/>
            <DropDownPropItem
              label='column'
              value={this.column ? { value: this.column } : null}
              values={this.obj.getAllColumns().map(col => {
                return {
                  value: col.name
                };
              })}
              onSelect={value => this.setColumn( value.value )}
            />
            <DropDownPropItem
              label='sort'
              disabled={this.sortDir == 'natural'}
              value={{ value: this.sortType }}
              values={sortTypeArr}
              onSelect={value => this.setSortType(value.value as any)}
            />
            <DropDownPropItem
              label='sort direction'
              value={{ value: this.sortDir }}
              values={sortDirArr}
              onSelect={value => this.setSortDir(value.value as any)}
            />
          </Tab>
        </Tabs>
      </PropsGroup>
    );
  }

  getDataKey() {
    return this.dataKey;
  }

  private updateTable = () => {
    if (!this.column)
      return;

    const column = this.sortType == 'value' ? this.column : 'count';
    const dir = this.sortDir == 'asc' ? 'asc' : 'desc';
    const args: Partial<SubtableAttrs> = {
      distinct: { column: this.column },
      sort: this.sortDir == 'natural' ? null : [{ column, dir }]
    };

    const task = this.obj.getTableRef().createSubtable(args)
    .then(res => {
      this.dataKey++;
      this.rowsNum = res.rowsNum;
      this.subtable = res.subtable;
      this.listModel.setValues([]);
      this.watchTask(this.loadNext(0, 100).then(values => this.listModel.appendValues(values)));
      this.holder.notify();
    });
    this.watchTask(task);
  };
}
