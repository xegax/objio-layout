import * as React from 'react';
import { DrillDownTableBase } from '../base/drilldown-table';
import { RenderListModel } from 'ts-react-ui/list';
import { RenderArgs, ListColumn } from 'ts-react-ui/model/list';
import { Cancelable, ExtPromise } from 'objio';
import {
  LoadCellsArgs,
  ColumnAttr,
  SubtableAttrs
} from 'objio-object/client/table';
import { DocTable } from 'objio-object/client/doc-table';
import { PropsGroup, PropItem, DropDownPropItem } from 'ts-react-ui/prop-sheet';
import { Tabs, Tab } from 'ts-react-ui/tabs';
import { ListView } from 'ts-react-ui/list-view';

export class DrillDownTable extends DrillDownTableBase<DocTable> {
  private tableRender = new RenderListModel(0, 20);
  private lastLoadTimer: Cancelable;
  private maxTimeBetweenRequests: number = 300;
  private subtable: string;
  private colsToRender = Array<ColumnAttr>();
  private colsFromServer = Array<ColumnAttr>();

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

    //this.holder.subscribe(this.requestTable, EventType.change);
    /*this.tableRender.subscribe(() => {
      this.layout.delayedNotifyObjects(EventTypes.selProvSelection);
    }, 'select-row');*/
  }

  getInvokesInProgress() {
    return super.getInvokesInProgress() + this.obj.getTableRef().getInvokesInProgress();
  }

  getTableRender() {
    return this.tableRender;
  }

  setSortColumn(column: string) {
    const dir = this.sort ? this.sort.dir : 'asc';
    super.setSort({ column, dir });
    this.onObjChange();
  }

  setSortDir(dir: string) {
    if (!this.sort)
      return;

    const column = this.sort.column;
    super.setSort({ column, dir: dir as any });
    this.onObjChange();
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
                  this.setShowOneColumn(col.name);
                else
                  this.toggleColumn(col.name);
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
              onSelect={value => this.setSortColumn( value.value )}
            />
            <DropDownPropItem
              label='sort direction'
              disabled={!this.sort}
              value={this.sort ? { value: this.sort.dir } : null }
              values={[
                { value: 'asc', render: 'Ascending' },
                { value: 'desc', render: 'Descending' }
              ]}
              onSelect={value => this.setSortDir( value.value )}
            />
          </Tab>
        </Tabs>
      </PropsGroup>
    );
  }

  private onLoad = () => {
    this.obj.getTableRef().holder.subscribe(() => {
      console.log('invoke in progress', this.getInvokesInProgress());
      this.holder.delayedNotify();
    }, 'invokesInProgress');

    this.updateTable();
    return Promise.resolve();
  }

  private onCreate = () => {
    this.obj.getTableRef().holder.subscribe(() => {
      this.holder.delayedNotify();
    }, 'invokesInProgress');

    this.colsToShow = this.obj.getAllColumns().map(col => col.name);
    this.holder.save();
    this.updateTable();
    return Promise.resolve();
  }

  private onObjChange = () => {
    this.updateTable();
  }

  setColumnToShow(col: string, show: boolean) {
    super.setColumnToShow(col, show);
    this.onObjChange();
  }

  private loadItems = (first: number, count: number) => {
    if (this.lastLoadTimer) {
      this.lastLoadTimer.cancel();
      this.lastLoadTimer = null;
    }

    this.lastLoadTimer = ExtPromise().cancelable( ExtPromise().timer(this.maxTimeBetweenRequests) );
    return this.lastLoadTimer.then(() => {
      this.lastLoadTimer = null;

      const args: LoadCellsArgs = { first, count };
      if (this.subtable)
        args.table = this.subtable;

      return this.obj.getTableRef().loadCells(args);
    });
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

  private updateTableDataImpl = () => {
    const args: Partial<SubtableAttrs> = {};
    args.cols = this.getColsToRequest();
    if (this.sort)
      args.sort = [ this.sort ];

    this.obj.getTableRef().createSubtable(args)
    .then(res => {
      this.colsFromServer = res.columns.slice();
      this.subtable = res.subtable;

      this.updateTableRender(res.rowsNum, this.getColsToShow());
      this.holder.notify();
    });
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
