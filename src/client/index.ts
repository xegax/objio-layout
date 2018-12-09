import { OBJIOItemClass } from 'objio';
import { DocLayout as DocLayoutOld } from './layout';
import { DataSourceHolder } from '../server/layout';
import { CategoryFilter } from './category-filter';
import { DrillDownTable } from './drilldown-table';
import { RangeFilter } from './range-filter';
import { SelectDetails } from './select-details';
import { TagFilter } from './tag-filter';
import { DocLayout, ObjectHolderBase } from './layout2';

import { DrillDownTable2 } from './drilldown-table2';

export function getClasses(): Array<OBJIOItemClass> {
  return [
    DataSourceHolder,
    TagFilter,
    CategoryFilter,
    DrillDownTable,
    DrillDownTable2,
    RangeFilter,
    SelectDetails,
    DocLayout,
    ObjectHolderBase,
    DocLayoutOld
  ];
}
