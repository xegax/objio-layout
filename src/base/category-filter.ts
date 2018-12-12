import { SERIALIZER } from 'objio';
import { ObjectHolderBase } from './layout';
import { ObjectBase } from 'objio-object/view/config';

export type SortDir = 'asc' | 'desc' | 'natural';
export type SortType = 'value' | 'count';

export class CategoryFilterBase<T extends ObjectBase> extends ObjectHolderBase<T> {
  protected column: string;
  protected sortType: SortType = 'value';
  protected sortDir: SortDir = 'desc';

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

  getSortDir(): SortDir {
    return this.sortDir;
  }

  static TYPE_ID = 'CategoryFilter2';
  static SERIALIZE: SERIALIZER = () => ({
    ...ObjectHolderBase.SERIALIZE(),
    column:     { type: 'string' },
    sortType:   { type: 'string' },
    sortDir:    { type: 'string' }
  })
}
