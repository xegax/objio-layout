import { LayoutCont } from 'ts-react-ui/model/layout';
import { OBJIOArray, SERIALIZER, OBJIOItem } from 'objio';
import { ObjectBase } from 'objio-object/base/object-base';

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

  removeTask<T>(task: Promise<T>) {
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

  getHolders(): OBJIOArray<ObjectHolderBase> {
    return this.holders;
  }

  static TYPE_ID = 'DocLayout2';
  static SERIALIZE: SERIALIZER = () => ({
    ...ObjectBase.SERIALIZE(),
    layout:  { type: 'json' },
    holders: { type: 'object' }
  })
}
