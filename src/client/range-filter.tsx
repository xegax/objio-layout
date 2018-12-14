import * as React from 'react';
import { RangeFilterBase } from '../base/range-filter';
import { DocTable } from 'objio-object/client/doc-table';
import { PropsGroup, PropItem, DropDownPropItem, TextPropItem } from 'ts-react-ui/prop-sheet';
import { Tabs, Tab } from 'ts-react-ui/tabs';
import { Condition } from '../base/layout';

export class RangeFilter extends RangeFilterBase<DocTable> {
  private minMaxRange: { min: number; max: number };
  private range: { min: number; max: number };
  private cond: Condition;

  constructor(args) {
    super(args);

    this.holder.addEventHandler({
      onLoad: this.onLoad,
      onCreate: this.onCreate,
      onObjChange: this.onChange
    });
  }

  onLoad = () => {
    this.updateData();
    return Promise.resolve();
  }

  onCreate = () => {
    this.updateData();
    return Promise.resolve();
  }

  onChange = () => {
    this.updateData();
  }

  setColumn(column: string) {
    if (!super.setColumn(column))
      return false;

    this.updateData();
    return true;
  }

  getMinMaxRange() {
    return this.minMaxRange;
  }

  getRange() {
    return this.range;
  }

  setRange(range: { min?: number; max?: number }) {
    const newRange = { ...this.range, ...range };
    if (this.range.min == newRange.min && this.range.max == newRange.max)
      return false;

    if (range.min == null) {
      newRange.max = Math.min(this.minMaxRange.max, range.max);
      newRange.max = Math.max(this.range.min, newRange.max);
    } else if (range.max == null) {
      newRange.min = Math.max(this.minMaxRange.min, range.min);
      newRange.min = Math.min(this.range.max, newRange.min);
    }

    if (newRange.min == this.range.min && newRange.max == this.range.max)
      return false;

    this.range = { ...newRange };
    this.holder.delayedNotify();
    return true;
  }

  onUpdateCondition(cond: Condition) {
    this.cond = cond;
    this.updateData();
  }

  getProps() {
    return (
      <PropsGroup label='table' key={this.holder.getID()}>
        <Tabs defaultSelect='data'>
          <Tab id='data' label='data'>
            <DropDownPropItem
              label='column'
              value={this.column ? { value: this.column } : null}
              values={this.obj.getAllColumns()
                .filter(col => ['integer', 'real'].indexOf(col.type.toLowerCase()) != -1)
                .map(col => {
                  return {
                    value: col.name
                  };
                })}
              onSelect={value => this.setColumn( value.value )}
            />
            <PropItem
              label='min ; max'
              disabled={!this.minMaxRange}
              value={this.minMaxRange ? [ this.minMaxRange.min, this.minMaxRange.max ].join(' ; ') : ''}
            />
            <TextPropItem
              label='minimal'
              disabled={!this.range}
              value={this.range ? this.range.min : ''}
              onChanged={value => {
                if (!this.setRange({min: +value}))
                  this.holder.delayedNotify();
              }}
            />
            <TextPropItem
              label='maximal'
              disabled={!this.range}
              value={this.range ? this.range.max : ''}
              onChanged={value => {
                if (!this.setRange({max: +value}))
                  this.holder.delayedNotify();
              }}
            />
          </Tab>
        </Tabs>
      </PropsGroup>
    );
  }

  protected updateData() {
    if (!this.column)
      return;

    const task = this.obj.getTableRef().createSubtable({
      filter: this.cond
    }).then(res => {
      return (
        this.obj.getTableRef().getNumStats({ column: this.column, table: res.subtable })
        .then(res => {
          this.minMaxRange = { ...res };
          this.range = { ...res };
          this.holder.delayedNotify();
        })
      );
    });
    this.watchTask(task);
  }
}
