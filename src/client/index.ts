import { OBJIOItemClass } from 'objio';
import { DocLayout, ObjectHolderBase } from './layout';

import { DrillDownTable } from './drilldown-table';
import { CategoryFilter } from './category-filter';
import { RangeFilter } from './range-filter';

export function getClasses(): Array<OBJIOItemClass> {
  return [
    CategoryFilter,
    DrillDownTable,
    RangeFilter,
    DocLayout,
    ObjectHolderBase
  ];
}
