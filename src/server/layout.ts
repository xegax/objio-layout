import { ObjectBase } from 'objio-object/server/object-base';
import { ObjectHolderBase as ObjHolderBase, DocLayoutBase } from '../base/layout';

export class ObjectHolderBase<T extends ObjectBase = ObjectBase> extends ObjHolderBase<T> {
}

export class DocLayout extends DocLayoutBase {
}
