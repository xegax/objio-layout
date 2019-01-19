import * as React from 'react';
import { DrillDownTableBase } from '../base/drilldown-table';
import { RenderListModel } from 'ts-react-ui/list';
import { RenderArgs, ListColumn } from 'ts-react-ui/model/list';
import {
  LoadCellsArgs,
  ColumnAttr,
  SubtableAttrs,
  Condition
} from 'objio-object/base/database/table';
import { DocTable } from 'objio-object/client/database/doc-table';
import { PropsGroup, PropItem, DropDownPropItem } from 'ts-react-ui/prop-sheet';
import { Tabs, Tab } from 'ts-react-ui/tabs';
import { ListView } from 'ts-react-ui/list-view';

export class DrillDownTable extends DrillDownTableBase<DocTable> {
  private tableRender = new RenderListModel(0, 20);
  private lastLoadTimer: Promise<any>;
  private maxTimeBetweenRequests: number = 500;
  private subtable: string;
  private colsToRender = Array<ColumnAttr>();
  private colsFromServer = Array<ColumnAttr>();
  private cond: Condition;

  constructor(args) {
    super(args);

    this.tableRender.setHandler({
      loadItems: this.loadItems
    });

    this.holder.addEventHandler({
      onLoad: this.onLoad,
      onCreate: this.onCreate,
      onObjChange: this.onObjChange
    });
  }

  getTableRender() {
    return this.tableRender;
  }

  getColumnItem = (col: ColumnAttr) => {
    return {
      value: col.name,
      render: () => {
        return (
          <>
            <i
              style={{ marginRight: 5 }}
              className={this.isColumnShown(col.name) ? 'fa fa-check-square-o' : 'fa fa-square-o'}
              onClick={e => {
                if (e.ctrlKey)
                  this.setShowOneColumn({ column: col.name, save: false });
                else
                  this.toggleColumn({ column: col.name, save: false });
              }}
            />
            {col.name}
          </>
        );
      }
    };
  }

  getProps() {
    return (
      <PropsGroup label='table'>
        <Tabs defaultSelect='data' key={this.holder.getID()}>
          <Tab id='data' label='data'>
            <PropItem label='rows' value={this.tableRender.getItemsCount()}/>
            <PropItem label='columns' value={this.colsToShow.length || this.obj.getAllColumns().length}/>
            <PropItem inline={false}>
              <ListView
                itemsPerPage={7}
                style={{flexGrow: 1, textAlign: 'left' }}
                values={this.obj.getAllColumns().map(this.getColumnItem)}
              />
            </PropItem>
            <DropDownPropItem
              label='sort'
              value={this.sort ? { value: this.sort.column } : null }
              values={this.obj.getAllColumns().map(col => {
                return {
                  value: col.name
                };
              })}
              onSelect={value => {
                this.setSort({
                  column: value.value,
                  dir: this.sort.dir,
                  save: false
                });
              }}
            />
            <DropDownPropItem
              label='sort direction'
              disabled={!this.sort}
              value={this.sort ? { value: this.sort.dir } : null }
              values={[
                { value: 'asc', render: 'Ascending' },
                { value: 'desc', render: 'Descending' }
              ]}
              onSelect={value => {
                if (!this.sort)
                  return;

                this.setSort({
                  column: this.sort.column,
                  dir: value.value as any,
                  save: false
                });
              }}
            />
            <PropItem>
              <button
                onClick={() => {
                  this.onObjChange();
                  this.holder.save();
                }}
              >
                apply
              </button>
            </PropItem>
          </Tab>
        </Tabs>
      </PropsGroup>
    );
  }

  private onLoad = () => {
    this.updateTable();
    return Promise.resolve();
  }

  private onCreate = () => {
    this.colsToShow = this.obj.getAllColumns().map(col => col.name);
    this.holder.save();
    this.updateTable();
    return Promise.resolve();
  }

  private onObjChange = () => {
    this.updateTable();
  }

  onUpdateCondition(cond: Condition) {
    console.log(cond);
    this.cond = cond;
    this.updateTableDataImpl();
  }

  private loadItems = (first: number, count: number) => {
    this.lastLoadTimer && this.lastLoadTimer.cancel();

    this.lastLoadTimer = Promise.delay(this.maxTimeBetweenRequests)
    .then(() => {
      const args: LoadCellsArgs = { first, count };
      if (this.subtable)
        args.table = this.subtable;

      return this.watchTask(this.obj.getTableRef().loadCells(args));
    });

    return this.lastLoadTimer;
  }

  private getColsToRequest(): Array<string> | null {
    if (this.colsToShow.length == 0)
      return null;

    return this.obj.getAllColumns()
      .map(col => col.name)
      .filter(col => this.colsToShow.indexOf(col) != -1);
  }

  private getColsToShow(): Array<ColumnAttr> {
    if (this.colsToShow.length == 0)
      return this.colsFromServer.slice();

    return this.colsFromServer.filter(col => {
      return this.colsToShow.indexOf(col.name) != -1;
    });
  }

  private updateTable = () => {
    this.colsToRender = this.obj.getAllColumns();
    if (this.colsToShow.length) {
      this.colsToRender = this.colsToRender
      .filter(col => {
        return this.colsToShow.indexOf(col.name) != -1;
      });
    }

    this.updateTableDataImpl();
  }

  private updateTask: Promise<any>;
  private updateTableDataImpl = () => {
    const args: Partial<SubtableAttrs> = {};
    args.cols = this.getColsToRequest();

    if (this.sort.column)
      args.sort = [ { column: this.sort.column, dir: this.sort.dir } ];

    if (this.cond)
      args.filter = this.cond;

    if (this.updateTask) {
      this.updateTask.cancel();
      this.removeTask(this.updateTask);
      this.updateTask = null;
    }

    this.updateTask = this.obj.getTableRef().createSubtable(args);
    this.updateTask.then(res => {
      this.colsFromServer = res.columns.slice();
      this.subtable = res.subtable;

      this.updateTableRender(res.rowsNum, this.getColsToShow());
      this.holder.notify();
    });

    this.watchTask(this.updateTask);
  };

  private updateTableRender(rowsNum: number, cols: Array<ColumnAttr>) {
    this.tableRender.setItemsCount(rowsNum);
    this.tableRender.setColumns( cols.map((col, c) => {
      c = this.colsFromServer.findIndex(srvCol => srvCol.name == col.name);
      return {
        name: col.name,
        render: (args: RenderArgs<Array<string>>) => {
          return <div>{args.item[c]}</div>;
        },
        renderHeader: (jsx: JSX.Element, col: ListColumn) => {
          return (
            <div>
              {jsx}
            </div>
          );
        }
      };
    }) );
    this.tableRender.reload();
  }
}
