import * as React from 'react';
import { CategoryFilter as Base, SortType, SortDir } from '../server/category-filter';
import { DocTable } from 'objio-object/client/doc-table';
import { ColumnAttr, LoadCellsArgs, Condition } from 'objio-object/client/table';
import { DocLayout } from './layout';
import { CondHolder, CondHolderOwner } from './cond-holder';
import { OBJIOItem } from 'objio';
import { List2Item } from 'ts-react-ui/list2';
import { DropDownListModel } from 'ts-react-ui/drop-down-list';

function throttling(f: () => void, ms: number): () => void {
  let t = null;
  return () => {
    if (t != null)
      return;

    t = setTimeout(() => {
      t = null;
      f();
    }, ms);
  };
}

export type RowData = { row: Array<string> };
export type Row = List2Item<RowData>;

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

  isInvokesInProgress(): boolean {
    return this.source.getTableRef().holder.getInvokesInProgress() > 0;
  }

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
        onClick={e => {
          this.setSortDir(this.getSortDir() == 'Asc' ? 'Desc' : 'Asc');
          e.preventDefault();
        }}
      />,
      <i
        className={classes[this.getSortDir() + this.getSortType()]}
        onClick={e => {
          this.setSortType(this.getSortType() == 'Alpha' ? 'Count' : 'Alpha');
          e.preventDefault();
        }}
      />
    ];
  }

  getName(): string | JSX.Element {
    if (this.isEdit())
      return super.getName();

    return `${super.getName()} ( ${this.getTotalRows()} )`;
  }

  resetSelect() {
    this.impl.getRender().clearSelect();
    this.impl.getRender().setFilter('');
  }
}

export class CategoryFilterImpl<TCategoryFilterOwner extends CategoryFilterOwner = CategoryFilterOwner> {
  protected owner: TCategoryFilterOwner;
  private render = new DropDownListModel<RowData>();
  private subtable: string;
  private colsToRender = Array<ColumnAttr>();
  private rowsNum: number = 0;
  private sel = Array<string>();
  private excludeSel = new Set<string>();

  constructor(object: TCategoryFilterOwner) {
    this.owner = object;

    this.render.setHandler({
      loadNext: (first: number, count: number): Promise< Array<Row> > => {
        const args: LoadCellsArgs = { first, count };
        if (this.subtable)
          args.table = this.subtable;

        return (
          this.getSource().getTableRef().loadCells(args)
        ).then((rows: Array< Array<string> > ) => {
          return rows.map((row: Array<string>, i) => {
            return {
              id: row[0],
              label: row[0],
              data: { row }
            } as Row;
          });
        });
      },
      render: (item: Row, idx: number): JSX.Element => {
        const rows = this.getSource().getTotalRowsNum();
        const perc = +item.data.row[1] * 100 / rows;
        return (
          <div key={idx} title={`${item.data.row[1]} (${Math.round(perc * 100) / 100}%)`}>
            <div style={{width: perc + '%', backgroundColor: 'lightgreen'}}>
              {item.data.row[0] || '$missing$'}
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
    this.sel = this.render.getSelectedItems().map(item => item.id);

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
    this.getSource().getTableRef().holder.subscribe(() => {
      this.owner.holder.delayedNotify();
    }, 'invokesInProgress');

    this.render.subscribe(() => {
      this.updateCondition();
      this.render.setFilter('');
    }, 'select');

    this.render.setFilterable(true);
    this.render.subscribe(throttling(() => {
      this.updateSubtable();
    }, 2000), 'filter');

    return Promise.resolve();
  }

  updateSubtable = () => {
    const filter = this.render.getFilter();
    const column = this.owner.getSortType() == 'Alpha' ? this.owner.getColumn() : 'count';
    const dir = this.owner.getSortDir() == 'Asc' ? 'asc' : 'desc';
    const like = true;
    return this.owner.get().getTableRef().createSubtable({
      filter: filter ? { value: filter, column: this.owner.getColumn(), like } : null,
      distinct: { column: this.owner.getColumn() },
      sort: [{ column, dir }]
    }).then(res => {
      this.colsToRender = res.columns;
      this.subtable = res.subtable;
      this.rowsNum = res.rowsNum;
    }).then(() => {
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

  getRender(): DropDownListModel<RowData> {
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
