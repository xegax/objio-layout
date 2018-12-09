import { LayoutCont } from 'ts-react-ui/model/layout';
import { OBJIOArray, SERIALIZER, OBJIOItem } from 'objio';
import { ObjectBase } from 'objio-object/server/object-base';

export interface ObjectHolderBaseArgs {
  obj: ObjectBase;
  view: string;
}

export class ObjectHolderBase<T extends ObjectBase = ObjectBase> extends OBJIOItem {
  protected name: string;
  protected obj: T;
  protected view: string;

  constructor(args?: ObjectHolderBaseArgs) {
    super();

    if (args) {
      this.obj = args.obj as T;
      this.view = args.view;
    }
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

  getInvokesInProgress() {
    return this.obj.getInvokesInProgress();
  }

  getProps(): JSX.Element {
    return null;
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
