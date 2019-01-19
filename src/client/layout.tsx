import * as React from 'react';
import { LayoutModel, clone, LayoutCont, LayoutItem } from 'ts-react-ui/model/layout';
import { OBJIOItem } from 'objio';
import { ObjectBase } from 'objio-object/base/object-base';
import { select } from 'ts-react-ui/prompt';
import { ViewFactory } from 'objio-object/common/view-factory';
import { ObjHolderView } from '../view/obj-holder-view';
import { PropSheet, PropItem, PropsGroup, TextPropItem } from 'ts-react-ui/prop-sheet';
import { AppComponent } from 'ts-react-ui/app-comp-layout';
import {
  DocLayoutBase,
  ObjectHolderBase,
  ObjectHolderBaseArgs
} from '../base/layout';

export {
  ObjectHolderBaseArgs,
  ObjectHolderBase
}

export class DocLayout extends DocLayoutBase {
  private model = new LayoutModel();
  private static viewFactory = new ViewFactory(); 
  private select: ObjectHolderBase;

  static getViewFactory(): ViewFactory {
    return this.viewFactory;
  }

  constructor() {
    super();

    this.holder.addEventHandler({
      onObjChange: () => {
        this.model.setLayout( clone(this.layout) as LayoutCont );
        this.model.delayedNotify();
      },
      onLoad: () => {
        this.holders.holder.addEventHandler({
          onObjChange: () => {
            this.updateLayoutMap();
            this.model.delayedNotify();
          }
        });

        this.model.setLayout( clone(this.layout) as LayoutCont );
        return Promise.resolve();
      }
    });

    this.model.subscribe(() => {
      this.layout = clone(this.model.getLayout()) as LayoutCont;
      this.holder.save();
    }, 'change');

    this.model.setHandler({
      onDrop: this.onDrop
    });
  }

  onDrop = (item: LayoutItem): Promise<LayoutItem> => {
    return (
      this.holder.getObject(item.id)
      .then((draggedObj: ObjectBase) => {
        const objViews = DocLayout.viewFactory.findAll({
          classObj: OBJIOItem.getClass(draggedObj)
        });

        if (objViews.length == 1)
          return Promise.resolve({ draggedObj, factItem: objViews[0] });

        return select({
          items: objViews.map(view => view.viewType)
        }).then(view => (
          {
            draggedObj,
            factItem: objViews.find(v => v.viewType == view)
          }
        ));
      })
      .then(res => {
        const args: ObjectHolderBaseArgs = {
          obj: res.draggedObj,
          view: res.factItem.viewType
        };

        return res.factItem.createObject(args);
      })
      .then((holder: ObjectHolderBase) => {
        return (
          this.holder.createObject(holder)
          .then(() => holder)
        );
      })
      .then((holder: ObjectHolderBase) => {
        this.holders.push(holder);

        this.holders.holder.save();
        this.layout = clone(this.model.getLayout()) as LayoutCont;
        this.updateLayoutMap();
        this.holder.save();
        return { id: holder.holder.getID() };
      })
    );
  }

  notifyView = () => {
    this.holder.delayedNotify();
  }

  updateLayoutMap() {
    const map: {[id: string]: JSX.Element} = {};
    this.holders.getArray().forEach((holder: ObjectHolderBase) => {
      holder.setOwner(this);
      holder.holder.unsubscribe(this.notifyView);
      holder.holder.subscribe(this.notifyView);

      const id = holder.holder.getID();
      const jsx: JSX.Element = DocLayout.viewFactory.getView({
        classObj: OBJIOItem.getClass(holder.getObject()),
        viewType: holder.getView(),
        props: { model: holder }
      });

      map[id] = (
        <ObjHolderView key={id} layoutId={id} model={holder} docLayout={this}>
          {jsx}
        </ObjHolderView>
      );
    });

    this.model.setMap(map);
  }

  setSelect(holder: ObjectHolderBase) {
    if (this.select == holder)
      return;

    this.select = holder;
    this.holder.delayedNotify();
  }

  getSelect(): ObjectHolderBase {
    return this.select;
  }

  notifyObjects(notifyType?: string) {
    this.holders.getArray().forEach(obj => {
      obj.holder.notify(notifyType);
    });
  }

  delayedNotifyObjects(notifyType?: string) {
    this.holders.getArray().forEach(obj => {
      obj.holder.delayedNotify(notifyType ? { type: notifyType } : null);
    });
  }

  getLayout(): LayoutModel {
    return this.model;
  }

  remove(holder: ObjectHolderBase) {
    if (holder == this.select)
      this.select = null;

    const id = holder.holder.getID();
    this.model.remove(holder.holder.getID());
    this.layout = clone( this.model.getLayout() ) as LayoutCont;
    this.holder.save();
    const idx = this.holders.find(obj => obj.holder.getID() == id);
    this.holders.remove(idx);
    this.holders.holder.save();
  }

  renderConfig() {
    return (
      <PropsGroup label='layout'>
        <PropItem label='objects' value={this.holders.getLength()}/>
      </PropsGroup>
    );
  }

  renderSelectCommon() {
    if (!this.select)
      return null;

    return (
      <PropsGroup label='select'>
        <TextPropItem
          label='name'
          value={this.select.getName()}
          onEnter={name => {
            this.select.setName(name);
          }}
        />
        <PropItem label='holder id' value={this.select.holder.getID()}/>
        <PropItem label='holder version' value={this.select.holder.getVersion()}/>
        <PropItem label='object id' value={this.select.getObject().holder.getID()}/>
        <PropItem label='object version' value={this.select.getObject().holder.getVersion()}/>
      </PropsGroup>
    );
  }

  getAppComponents() {
    return [
      <AppComponent id='config' faIcon='fa fa-sliders'>
        <PropSheet>
          {this.renderConfig()}
          {this.renderSelectCommon()}
          {this.select && this.select.getProps()}
        </PropSheet>
      </AppComponent>
    ];
  }
}
