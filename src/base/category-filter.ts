import { SERIALIZER } from 'objio';
import { ObjectHolderBase, ConditionHolder, Condition } from './layout';
import { ObjectBase } from 'objio-object/view/config';

export type SortDir = 'asc' | 'desc' | 'natural';
export type SortType = 'value' | 'count';

export class CategoryFilterBase<T extends ObjectBase> extends ConditionHolder<T> {
  protected column: string;
  protected sortType: SortType = 'value';
  protected sortDir: SortDir = 'desc';

  protected parentTable: T; // tag mode
  protected parentIdColumn: string;
  protected idColumn: string;

  setColumn(name: string): boolean {
    if (name == this.column)
      return false;

    this.column = name;
    this.holder.save();
    this.holder.delayedNotify();
    return true;
  }

  getColumn(): string {
    return this.column;
  }

  setSortType(type: SortType): boolean {
    if (type == this.sortType)
      return false;

    this.sortType = type;
    this.holder.save();
    this.holder.delayedNotify();
    return true;
  }

  getSortType(): SortType {
    return this.sortType;
  }

  setSortDir(dir: SortDir): boolean {
    if (dir == this.sortDir)
      return false;

    this.sortDir = dir;
    this.holder.save();
    this.holder.delayedNotify();
    return true;
  }

  setParentTable(parent: T) {
    if (parent == this.obj)
      parent = null;

    if (this.parentTable == parent)
      return;

    this.parentTable = parent;
    this.holder.save();
    this.holder.delayedNotify();
  }

  setParentIdColumn(column: string) {
    if (this.parentIdColumn == column)
      return;

    this.parentIdColumn = column;
    this.holder.save();
    this.holder.delayedNotify();
  }

  setIdColumn(column: string) {
    if (this.idColumn == column)
      return;

    this.idColumn = column;
    this.holder.save();
    this.holder.delayedNotify();
  }

  getSortDir(): SortDir {
    return this.sortDir;
  }

  getDataSource() {
    return this.parentTable || this.obj;
  }

  onUpdateCondition(cond: Condition) {
  }

  static TYPE_ID = 'CategoryFilter2';
  static SERIALIZE: SERIALIZER = () => ({
    ...ObjectHolderBase.SERIALIZE(),
    column:         { type: 'string' },
    sortType:       { type: 'string' },
    sortDir:        { type: 'string' },
    parentTable:    { type: 'object' },
    parentIdColumn: { type: 'string' },
    idColumn:       { type: 'string' }
  })
}
