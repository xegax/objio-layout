import * as React from 'react';
import { CategoryFilter as Base, SortType, SortDir } from '../server/category-filter';
import { DocTable } from 'objio-object/client/doc-table';
import { ColumnAttr, LoadCellsArgs, Condition } from 'objio-object/client/table';
import { DocLayout } from './layout';
import { CondHolder, CondHolderOwner } from './cond-holder';
import { OBJIOItem } from 'objio';
import { List2Model, List2Item } from 'ts-react-ui/list2';

export interface Row extends List2Item {
  row: Array<string>;
}

export { SortType, SortDir };

const classes = {
  excluded: 'excluded'
};

export interface CategoryFilterOwner extends OBJIOItem {
  getColumn(): string;
  setCondition(cond: Condition): void;
  get(): DocTable;

  getSortType(): SortType;
  setSortType(type: SortType): void;

  getSortDir(): SortDir;
  setSortDir(dir: SortDir): void;
}

export class CategoryFilter extends Base<DocTable, DocLayout> implements CondHolderOwner, CategoryFilterOwner {
  private condHolder = new CondHolder();
  private impl = new CategoryFilterImpl(this);

  getCondHolder(): CondHolder {
    return this.condHolder;
  }

  getColumn(): string {
    return this.column || this.source.getAllColumns()[0].name;
  }

  setColumn(name: string): boolean {
    if (!super.setColumn(name))
      return false;

    this.impl.updateSubtable();
    return true;
  }

  setSortType(type: SortType) {
    if (!super.setSortType(type))
      return false;

    this.impl.updateSubtable();
    return true;
  }

  setSortDir(dir: SortDir) {
    if (!super.setSortDir(dir))
      return false;

    this.impl.updateSubtable();
    return true;
  }

  getColumns(): Array<ColumnAttr> {
    return this.source.getAllColumns();
  }

  setCondition(cond: Condition): void {
    this.condHolder.setCondition(this.source, cond, this.layout.getObjects().getArray(), this);
  }

  getTotalRows(): number {
    return this.impl.getTotalRows();
  }

  getRender() {
    return this.impl.getRender();
  }

  getSourceTotalRows(): number {
    return this.source.getTotalRowsNum();
  }

  getTools(): Array<JSX.Element> {
    const classes = {
      'AscAlpha': 'fa fa-sort-alpha-asc',
      'DescAlpha': 'fa fa-sort-alpha-desc',
      'AscCount': 'fa fa-sort-amount-asc',
      'DescCount': 'fa fa-sort-amount-desc'
    };

    return [
      <i
        className='fa fa-sort'
        onClick={() => {
          this.setSortDir(this.getSortDir() == 'Asc' ? 'Desc' : 'Asc');
        }}
      />,
      <i
        className={classes[this.getSortDir() + this.getSortType()]}
        onClick={() => {
          this.setSortType(this.getSortType() == 'Alpha' ? 'Count' : 'Alpha');
        }}
      />
    ];
  }
}

export class CategoryFilterImpl<TCategoryFilterOwner extends CategoryFilterOwner = CategoryFilterOwner> {
  protected owner: TCategoryFilterOwner;
  private render = new List2Model();
  private subtable: string;
  private colsToRender = Array<ColumnAttr>();
  private rowsNum: number = 0;
  private rowsCache: {[rowIdx: string]: string} = {};
  private sel = Array<string>();
  private excludeSel = new Set<string>();

  constructor(object: TCategoryFilterOwner) {
    this.owner = object;

    this.render.setHandler({
      loadNext: (first: number, count: number): Promise<Array<Row>> => {
        const args: LoadCellsArgs = { first, count };
        if (this.subtable)
          args.table = this.subtable;

        return (
          this.getSource().getTableRef().loadCells(args)
        ).then(rows => {
          return rows.map((row, i) => ({ id: (first + i) + '', row }))
        });
      },
      render: (item: Row, idx: number): JSX.Element => {
        const rows = this.getSource().getTotalRowsNum();
        const perc = +item.row[1] * 100 / rows;
        return (
          <div key={idx} title={`${item.row[1]} (${Math.round(perc * 100) / 100}%)`}>
            <div style={{width: perc + '%'}}>
              {item.row[0] || '$missing$'}
            </div>
          </div>
        );
      }
    });

    this.owner.holder.addEventHandler({
      onLoad: this.onInit,
      onCreate: this.onInit,
      onObjChange: this.updateSubtable
    });
  }

  getSource(): DocTable {
    return this.owner.get();
  }

  updateCondition() {
    const items = this.render.getItems();
    this.sel = this.render.getSelectedIds().map(rowIdx => {
      const item = items[+rowIdx] as Row;
      return item.row[0];
    });

    const column = this.owner.getColumn();
    if (this.sel.length + this.excludeSel.size == 0) {
      this.setCondition(null);
    } else if (this.sel.length == 1 && this.excludeSel.size == 0) {
      this.setCondition({ column, value: this.sel[0] });
    } else if (this.sel.length == 0 && this.excludeSel.size == 1) {
      this.setCondition({ column, inverse: true, value: Array.from(this.excludeSel)[0]});
    } else {
      const cond: Condition = { op: 'or', values: this.sel.map(value => ({ column, value }))};
      const exclude: Condition = {
        op: 'and',
        values: Array.from(this.excludeSel).map(value => {
          return { column, inverse: true, value };
        })
      };

      if (this.excludeSel.size == 0) {
        this.setCondition(cond);
      } else if (this.sel.length == 0) {
        this.setCondition(exclude);
      } else {
        this.setCondition({ op: 'and', values: [ cond, exclude ] } as Condition);
      }
    }
  }

  setCondition(cond: Condition): void {
    this.owner.setCondition(cond);
  }

  onInit = () => {
    this.updateSubtable();

    this.render.subscribe(() => {
      this.updateCondition();
    }, 'select');

    return Promise.resolve();
  }

  updateSubtable = () => {
    const column = this.owner.getSortType() == 'Alpha' ? this.owner.getColumn() : 'count';
    const dir = this.owner.getSortDir() == 'Asc' ? 'asc' : 'desc';
    return this.owner.get().getTableRef().createSubtable({
      distinct: { column: this.owner.getColumn() },
      sort: [{ column, dir }]
    }).then(res => {
      this.colsToRender = res.columns;
      this.subtable = res.subtable;
      this.rowsNum = res.rowsNum;
    }).then(() => {
      this.rowsCache = {};
      this.sel = [];
      this.render.clear({ reload: true });
      this.owner.holder.notify();
    });
  }

  excludeValue(value: string) {
    if (!this.excludeSel.has(value)) {
      this.excludeSel.add(value);
    } else {
      this.excludeSel.delete(value);
    }

    this.updateCondition();
    this.owner.holder.delayedNotify();
  }

  getRender(): List2Model {
    return this.render;
  }

  getColumnsToRender() {
    return this.colsToRender;
  }

  getTotalRows() {
    return this.rowsNum;
  }

  getSourceTotalRows() {
    return this.owner.get().getTotalRowsNum();
  }
}
