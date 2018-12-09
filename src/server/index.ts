import { OBJIOItemClass } from 'objio';
import { DocLayout2, ObjectHolderBase } from './layout2';
import { DocLayout, DataSourceHolder } from './layout';
import { CategoryFilter } from './category-filter';
import { DrillDownTable } from './drilldown-table';
import { RangeFilter } from './range-filter';
import { SelectDetails } from './select-details';
import { TagFilter } from './tag-filter';
import { DrillDownTable2 } from './drilldown-table';

export function getClasses(): Array<OBJIOItemClass> {
  return [
    DocLayout,
    DocLayout2,
    DataSourceHolder,
    ObjectHolderBase,
    CategoryFilter,
    DrillDownTable,
    DrillDownTable2,
    RangeFilter,
    SelectDetails,
    TagFilter
  ];
}
