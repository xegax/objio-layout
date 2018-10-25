import { DataSourceHolder, DocLayout } from './layout';
import { DocTable } from 'objio-object/server/doc-table';
import { SERIALIZER } from 'objio';

export type SortDir = 'Asc' | 'Desc' | 'Natural';
export type SortType = 'Alpha' | 'Count';

export class CategoryFilter<
    TSource extends DocTable = DocTable,
    TLayout extends DocLayout = DocLayout
  > extends DataSourceHolder<TSource, TLayout> {
  protected column: string;
  protected colsToShow = Array<string>();
  protected sortType: SortType = 'Alpha';
  protected sortDir: SortDir = 'Desc';

  setColumn(name: string): boolean {
    if (name == this.column)
      return false;

    this.column = name;
    this.holder.save();
    this.holder.delayedNotify();
    return true;
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

  static TYPE_ID = 'CategoryFilter';
  static SERIALIZE: SERIALIZER = () => ({
    ...DataSourceHolder.SERIALIZE(),
    column:     { type: 'string' },
    colsToShow: { type: 'json'  },
    sortType:   { type: 'string' },
    sortDir:    { type: 'string' }
  })
}
