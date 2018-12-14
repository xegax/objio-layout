import { ConditionHolder } from './layout';
import { SERIALIZER } from 'objio';
import { ObjectBase } from 'objio-object/view/config';
import { SortPair, Condition } from 'objio-object/client/table';

// base to client and server object
export class DrillDownTableBase<T extends ObjectBase> extends ConditionHolder<T> {
  protected colsToShow = Array<string>();
  protected idColumn: string;
  protected searchColumn: string;
  protected sort: SortPair;

  setSort(pair: SortPair) {
    if ((!pair && !this.sort))
      return;

    if (pair && this.sort && pair.column == this.sort.column && pair.dir == this.sort.dir)
      return;

    if (pair)
      this.sort = { ...pair };
    else
      this.sort = null;
    this.holder.delayedNotify();
    this.holder.save();
  }

  getSort() {
    return this.sort;
  }

  setColumnToShow(column: string, show: boolean) {
    if (this.isColumnShown(column) == show)
      return;

    if (show)
      this.colsToShow.push(column);
    else
      this.colsToShow.splice(this.colsToShow.indexOf(column), 1);
    this.holder.delayedNotify();
    this.holder.save();
  }

  setShowOneColumn(col: string) {
    if (this.colsToShow.length == 1 && this.colsToShow.indexOf(col) != -1)
      return;

    this.colsToShow = [];
    this.setColumnToShow(col, true);
  }

  toggleColumn(column: string) {
    this.setColumnToShow(column, !this.isColumnShown(column));
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

  setIdColumn(column: string) {
    if (column == this.idColumn)
      return;

    this.idColumn = column;
    this.holder.delayedNotify();
    this.holder.save();
  }

  getSearchColumn() {
    return this.searchColumn;
  }

  setSearchColumn(column: string) {
    if (this.searchColumn == column)
      return;

    this.searchColumn = column;
    this.holder.delayedNotify();
    this.holder.save();
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
