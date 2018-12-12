import { OBJIOItemClass } from 'objio';
import { DocLayout, ObjectHolderBase } from './layout';
import { DrillDownTable2 } from './drilldown-table';
import { CategoryFilter2 } from './category-filter';
import { RangeFilter2 } from './range-filter';

export function getClasses(): Array<OBJIOItemClass> {
  return [
    DocLayout,
    ObjectHolderBase,
    CategoryFilter2,
    DrillDownTable2,
    RangeFilter2
  ];
}
