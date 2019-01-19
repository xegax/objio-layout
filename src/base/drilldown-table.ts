import { ConditionHolder } from './layout';
import { SERIALIZER } from 'objio';
import { ObjectBase } from 'objio-object/view/config';
import { SortPair, Condition } from 'objio-object/base/database/table';

// base to client and server object
export class DrillDownTableBase<T extends ObjectBase> extends ConditionHolder<T> {
  protected colsToShow = Array<string>();
  protected idColumn: string;
  protected searchColumn: string;
  protected sort: Partial<SortPair> = {};

  setSort(args: SortPair & { save: boolean }) {
    let { save, ...sort } = args;
    if (sort.column == this.sort.column && sort.dir == this.sort.dir)
      return;

    this.sort = { ...sort };
    this.holder.delayedNotify();
    (save == null || save) && this.holder.save();
  }

  getSort() {
    return this.sort;
  }

  addColumnToShow(args: { column: string, show: boolean, save?: boolean }) {
    if (this.isColumnShown(args.column) == args.show)
      return;

    if (args.show)
      this.colsToShow.push(args.column);
    else
      this.colsToShow.splice(this.colsToShow.indexOf(args.column), 1);
    this.holder.delayedNotify();
    (args.save == null || args.save) && this.holder.save();
  }

  setShowOneColumn(args: { column: string, save?: boolean }) {
    if (this.colsToShow.length == 1 && this.colsToShow[0] == args.column)
      return;

    this.colsToShow = [];
    this.addColumnToShow({show: true, ...args});
  }

  toggleColumn(args: { column: string, save?: boolean }) {
    const show = !this.isColumnShown(args.column);
    this.addColumnToShow({...args, show});
  }

  isColumnShown(column: string): boolean {
    return this.colsToShow.indexOf(column) != -1;
  }

  getColumnsToShow(): Array<string> {
    return this.colsToShow;
  }

  getIdColumn(): string {
    return this.idColumn;
  }

  setIdColumn(args: { column: string, save?: boolean }) {
    if (args.column == this.idColumn)
      return;

    this.idColumn = args.column;
    this.holder.delayedNotify();
    args.save && this.holder.save();
  }

  getSearchColumn() {
    return this.searchColumn;
  }

  setSearchColumn(args: { column: string, save?: boolean }) {
    if (this.searchColumn == args.column)
      return;

    this.searchColumn = args.column;
    this.holder.delayedNotify();
    args.save && this.holder.save();
  }

  onUpdateCondition(cond: Condition) {
  }

  static TYPE_ID = 'DrillDownTable2';
  static SERIALIZE: SERIALIZER = () => ({
    ...ConditionHolder.SERIALIZE(),
    idColumn:     { type: 'string' },
    colsToShow:   { type: 'json' },
    searchColumn: { type: 'string' },
    sort:         { type: 'json' }
  })
}
