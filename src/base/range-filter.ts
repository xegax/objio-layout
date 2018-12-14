import { SERIALIZER } from 'objio';
import { ObjectHolderBase, ConditionHolder, Condition } from './layout';
import { ObjectBase } from 'objio-object/view/config';

export class RangeFilterBase<T extends ObjectBase> extends ConditionHolder<T> {
  protected column: string;

  setColumn(column: string): boolean {
    if (this.column == column)
      return false;

    this.column = column;
    this.holder.delayedNotify();
    this.holder.save();
    return true;
  }

  onUpdateCondition(cond: Condition) {
  }

  static TYPE_ID = 'RangeFilter2';
  static SERIALIZE: SERIALIZER = () => ({
    ...ObjectHolderBase.SERIALIZE(),
    column: { type: 'string' }
  })
}
