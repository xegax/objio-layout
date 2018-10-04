import { OBJIOItemClass } from 'objio';
import { DocLayout, DataSourceHolder } from './layout';
import { CategoryFilter } from './category-filter';
import { DrillDownTable } from './drilldown-table';
import { RangeFilter } from './range-filter';
import { SelectDetails } from './select-details';
import { TagFilter } from './tag-filter';

export function getClasses(): Array<OBJIOItemClass> {
  return [
    DocLayout,
    DataSourceHolder,
    CategoryFilter,
    DrillDownTable,
    RangeFilter,
    SelectDetails,
    TagFilter
  ];
}
