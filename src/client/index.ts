import { OBJIOItemClass } from 'objio';
import { DocLayout } from './layout';
import { DataSourceHolder } from '../server/layout';
import { CategoryFilter } from './category-filter';
import { DrillDownTable } from './drilldown-table';
import { RangeFilter } from './range-filter';
import { SelectDetails } from './select-details';
import { TagFilter } from './tag-filter';

export function getClasses(): Array<OBJIOItemClass> {
  return [
    DataSourceHolder,
    TagFilter,
    CategoryFilter,
    DrillDownTable,
    RangeFilter,
    SelectDetails,
    DocLayout
  ];
}
