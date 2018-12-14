import { LayoutCont } from 'ts-react-ui/model/layout';
import { OBJIOArray, SERIALIZER, OBJIOItem } from 'objio';
import { ObjectBase } from 'objio-object/server/object-base';
// import { ConditionHandler } from './condition-handler';
import { Condition } from 'objio-object/client/table';
export { Condition };

export interface ObjectHolderBaseArgs {
  obj: ObjectBase;
  view: string;
}

export class ObjectHolderBase<T extends ObjectBase = ObjectBase> extends OBJIOItem {
  protected name: string;
  protected obj: T;
  protected view: string;
  protected tasks = new Array<Promise<any>>();
  protected owner: DocLayoutBase;

  constructor(args?: ObjectHolderBaseArgs) {
    super();

    if (args) {
      this.obj = args.obj as T;
      this.view = args.view;
    }
  }

  setOwner(owner: DocLayoutBase) {
    this.owner = owner;
  }

  getObject(): T {
    return this.obj;
  }

  getView(): string {
    return this.view;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string) {
    if (this.name == name)
      return;

    this.name = name;
    this.holder.save();
    this.holder.delayedNotify();
  }

  getTasksInProgress(): number {
    return this.tasks.length;
  }

  getProps(): JSX.Element {
    return null;
  }

  private addTask<T>(task: Promise<T>) {
    if (this.tasks.indexOf(task) == -1)
      this.tasks.push(task);
  }

  private removeTask<T>(task: Promise<T>) {
    this.tasks.splice(this.tasks.indexOf(task), 1);
    this.holder.delayedNotify();
  }

  watchTask<T>(task: Promise<T>): Promise<T> {
    this.addTask(task);
    return (
      task.then(res => {
        this.removeTask(task);
        return res;
      }).catch(err => {
        this.removeTask(task);
        return Promise.reject(err);
      })
    );
  }

  static TYPE_ID = 'LayoutObjectHolder';
  static SERIALIZE: SERIALIZER = () => ({
    name: { type: 'string' },
    obj:  { type: 'object' },
    view: { type: 'string' }
  });
}

export class DocLayoutBase extends ObjectBase {
  protected layout: LayoutCont = { type: 'row', items: [] };
  protected holders = new OBJIOArray<ObjectHolderBase>();
  protected condHandler = new ConditionHandler(this);

  getHolders(): OBJIOArray<ObjectHolderBase> {
    return this.holders;
  }

  getCondHandler(): ConditionHandler {
    return this.condHandler;
  }

  static TYPE_ID = 'DocLayout2';
  static SERIALIZE: SERIALIZER = () => ({
    ...ObjectBase.SERIALIZE(),
    layout:  { type: 'json' },
    holders: { type: 'object' }
  })
}


export class ConditionHandler {
  private self: { [id: string]: Condition } = {}; // self conditions
  private combined: { [id: string]: Condition } = {}; // combined conditions
  protected layout: DocLayoutBase;

  constructor(layout: DocLayoutBase) {
    this.layout = layout;
  }

  private updateCombinedCondition(tgt: ConditionHolder<ObjectBase>) {
    const tgtId = tgt.holder.getID();
    if (this.self[tgtId])
      return;

    let combined = Array<Condition>();
    const holders = this.layout.getHolders().getArray() as Array<ConditionHolder<ObjectBase>>;
    const tableId = tgt.getObject().holder.getID();
    
    Object.keys(this.self).forEach(selfId => {
      if (selfId == tgt.holder.getID())
        return;

      const holder  = holders.find(holder => holder.holder.getID() == selfId);

      if ((holder as ConditionHolder<ObjectBase>).getDataSource().holder.getID() != tableId)
        return;

      if (this.self[selfId])
        combined.push(this.self[selfId]);
    });

    let newCond: Condition;
    if (combined.length == 0) {
      newCond = null;
    } else if (combined.length == 1) {
      newCond = combined[0];
    } else if (combined.length > 1) {
      newCond = { op: 'and', values: combined };
    }
    
    if (newCond == this.combined[tgtId])
      return;

    if (newCond && this.combined[tgtId] && JSON.stringify(newCond) == JSON.stringify(this.combined[tgtId]))
      return;

    tgt.onUpdateCondition(this.combined[tgtId] = newCond);
  }

  setSelfCondition(holder: ConditionHolder<ObjectBase>, cond: Condition | undefined) {
    this.self[holder.holder.getID()] = cond;

    const holders = this.layout.getHolders().getArray() as Array<ConditionHolder<ObjectBase>>;
    holders.forEach(obj => {
      if (obj == holder)
        return;

      this.updateCombinedCondition(obj);
    });
  }

  getSelfCondition(holder: ConditionHolder<ObjectBase>) {
    return this.self[holder.holder.getID()];
  }

  getCombinedCondition(holder: ConditionHolder<ObjectBase>): Condition {
    return this.combined[holder.holder.getID()];
  }
}

export abstract class ConditionHolder<T extends ObjectBase> extends ObjectHolderBase<T> {
  abstract onUpdateCondition(cond: Condition);

  getDataSource(): T {
    return this.obj;
  }
}
