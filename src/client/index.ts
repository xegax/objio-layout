import { OBJIOItemClass } from 'objio';
import { DocLayout, ObjectHolderBase } from './layout';

export function getClasses(): Array<OBJIOItemClass> {
  return [
    DocLayout,
    ObjectHolderBase
  ];
}
