import * as React from 'react';
import { CategoryFilterBase, SortType, SortDir } from '../base/category-filter';
import { DocTable } from 'objio-object/client/doc-table';
import { LoadCellsArgs, Condition, SubtableAttrs, CompoundCond } from 'objio-object/base/table';
import { PropsGroup, PropItem, DropDownPropItem } from 'ts-react-ui/prop-sheet';
import { Tabs, Tab } from 'ts-react-ui/tabs';
import { ListViewLoadableModel } from 'ts-react-ui/list-view-loadable';

const sortTypeArr = [
  { value: 'value', render: 'Value' },
  { value: 'count', render: 'Count' }
];

const sortDirArr = [
  { value: 'natural', render: 'Natural' },
  { value: 'asc',     render: 'Ascending' },
  { value: 'desc',    render: 'Descending' }
];

export class CategoryFilter extends CategoryFilterBase<DocTable> {
  protected subtable: string;
  protected rowsNum: number = 0;
  protected listModel = new ListViewLoadableModel();
  private cond: Condition;
  private select: string;

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
        .then((rows: Array<Array<string>>) => {
          return rows.map((row: Array<string>, i) => {
            return {
              value: row[0],
              render: (
                <div title={`${row[0]} (${row[1]})`}>
                  {row[0] == null || row[0].trim() == '' ? <span style={{ visibility: 'hidden' }}>?</span> : row[0]}
                </div>
              )
            };
          });
        })
    );
  }

  getDataProps() {
    return <>
      <PropItem label='rows' value={this.rowsNum} />
      <DropDownPropItem
        label='column'
        value={this.column ? { value: this.column } : null}
        values={this.obj.getAllColumns().map(col => {
          return {
            value: col.name
          };
        })}
        onSelect={value => this.setColumn(value.value)}
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
    </>;
  }

  getAvailableTableSources() {
    let objs = Array<DocTable>();
    this.owner.getHolders().getArray().forEach(holder => {
      const table = holder.getObject() as DocTable;
      if (!(table instanceof DocTable))
        return;

      if (objs.indexOf(table) != -1)
        return;

      objs.push(table);
    });

    return objs;
  }

  getDrillDownProps() {
    const tables = this.getAvailableTableSources();
    return (
      <>
        <DropDownPropItem
          label='parent table'
          value={this.parentTable ? {
            value: this.parentTable.holder.getID(),
            render: this.parentTable.getName()
          } : {
            value: '-- nothing --'
          }}
          values={tables.map(table => {
            return {
              value: table.holder.getID(),
              render: table.getName()
            };
          })}
          onSelect={value => {
            this.setParentTable(tables.find(table => table.holder.getID() == value.value));
          }}
        />
        <DropDownPropItem
          label='parent id column'
          disabled={this.parentTable == null}
          value={{ value: this.parentIdColumn || '-- nothing --' }}
          values={!this.parentTable ? [] :
            this.parentTable.getAllColumns().map(col => {
              return { value: col.name };
            })}
          onSelect={value => {
            this.setParentIdColumn(value.value);
            if (this.idColumn)
              return;

            if(this.parentTable.getAllColumns().find(col => col.name == this.parentIdColumn))
              this.idColumn = this.parentIdColumn;
          }}
        />
        <DropDownPropItem
          label='id column'
          disabled={this.parentTable == null}
          value={{ value: this.idColumn || '-- nothing --' }}
          values={!this.parentTable ? [] :
            this.obj.getAllColumns().map(col => {
              return { value: col.name };
            })}
          onSelect={value => {
            this.setIdColumn(value.value);

            if (this.parentIdColumn)
              return;

            if (this.obj.getAllColumns().find(col => col.name == this.idColumn))
              this.parentIdColumn = this.idColumn;
          }}
        />
      </>
    );
  }

  getProps() {
    return (
      <PropsGroup label='table' key={this.holder.getID()}>
        <Tabs defaultSelect='data'>
          <Tab id='data' label='data'>
            {this.getDataProps()}
          </Tab>
          <Tab id='drill-down' label='drill-down'>
            {this.getDrillDownProps()}
          </Tab>
        </Tabs>
      </PropsGroup>
    );
  }

  filter(filter: string): Promise<Array<{ value: string }>> {
    this.updateTable(filter);
    return Promise.resolve(this.listModel.getValues());
  }

  setSelect(value: string) {
    this.select = value;

    let cond: Condition;
    if (value && !this.parentTable) {
      cond = {
        column: this.column,
        value: '' + value
      };
    } else if (value) {
      cond = {
        column: this.parentIdColumn,
        value: {
          table: this.obj.getTable(),
          op: 'or',
          values: [ { column: this.column, value } ]
        } as CompoundCond
      };
    }

    this.owner.getCondHandler().setSelfCondition(this, cond);
    this.holder.delayedNotify();
  }

  getSelect(): string {
    return this.select;
  }

  onUpdateCondition(cond: Condition) {
    this.cond = cond;
    this.updateTable();
  }

  private updateTable = (filterStr?: string) => {
    if (!this.column)
      return;

    const column = this.sortType == 'value' ? this.column : 'count';
    const dir = this.sortDir == 'asc' ? 'asc' : 'desc';
    let filter: Condition = this.cond;
    if (filterStr) {
      const filterCond = { column: this.column, like: true, value: filterStr };
      filter = this.cond ? { op: 'and', values: [ this.cond, filterCond ] } : filterCond;
    }

    const args: Partial<SubtableAttrs> = {
      distinct: { column: this.column },
      sort: this.sortDir == 'natural' ? null : [{ column, dir }],
      filter
    };

    const task = this.obj.getTableRef().createSubtable(args)
      .then(res => {
        this.rowsNum = res.rowsNum;
        this.subtable = res.subtable;
        this.listModel.setValues([]);
        const values = this.loadNext(0, 100).then(values => {
          this.listModel.appendValues(values);
        });
        this.watchTask(values);
        this.holder.notify();
      });
    this.watchTask(task);
  };
}
