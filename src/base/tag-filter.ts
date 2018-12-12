import { SERIALIZER } from 'objio';
import { CategoryFilterBase } from './category-filter';
import { ObjectBase } from 'objio-object/view/config';

export class TagFilterBase<T extends ObjectBase> extends CategoryFilterBase<T> {
  protected joinColumn: string;
  protected joinSource: T;

  setJoinColumn(column: string): boolean {
    if (this.column == this.joinColumn)
      return false;

    this.joinColumn = column;
    this.holder.delayedNotify();
    this.holder.save();
    return true;
  }

  setJoinSource(source: T): boolean {
    if (this.joinSource == source)
      return false;

    this.joinSource = source;
    this.holder.delayedNotify();
    this.holder.save();
    return true;
  }

  static TYPE_ID = 'TagFilter2';
  static SERIALIZE: SERIALIZER = () => ({
    ...CategoryFilterBase.SERIALIZE(),
    joinColumn: { type: 'string' },
    joinSource: { type: 'object' }
  })
}
