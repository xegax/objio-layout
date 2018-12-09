import { DataSourceHolder, DocLayout } from './layout';
import { DocTable } from 'objio-object/server/doc-table';
import { SERIALIZER, OBJIOItem } from 'objio';
import { DrillDownTableBase } from '../base/drilldown-table';

export class DrillDownTable<
    TSource extends DocTable = DocTable,
    TLayout extends DocLayout = DocLayout
  > extends DataSourceHolder<TSource, TLayout> {

  protected idColumn: string;
  protected colsToShow = Array<string>();
  protected searchColumn: string;

  getIdColumn(): string {
    return this.idColumn;
  }

  setIdColumn(col: string): boolean {
    if (col == this.idColumn)
      return false;

    this.idColumn = col;
    this.holder.save();
    this.holder.delayedNotify();
    return true;
  }

  getSearchColumn(): string {
    return this.searchColumn;
  }

  setSearchColumn(col: string): void {
    this.searchColumn = col;
    this.holder.save();
    this.holder.delayedNotify();
  }

  static TYPE_ID = 'DrillDownTable';
  static SERIALIZE: SERIALIZER = () => ({
    ...DataSourceHolder.SERIALIZE(),
    idColumn:     { type: 'string' },
    colsToShow:   { type: 'json' },
    searchColumn: { type: 'string' }
  })
}

export class DrillDownTable2 extends DrillDownTableBase<DocTable> {
}
