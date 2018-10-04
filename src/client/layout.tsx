import * as React from 'react';
import { DocLayout as Base, DataSourceHolder } from '../server/layout';
import { LayoutModel, clone, LayoutCont } from 'ts-react-ui/model/layout';
import { OBJIOItem } from 'objio';
import { LayoutContView } from '../view/layout-cont-view';
import { ObjectBase } from 'objio-object/client/object-base';
import { select } from 'ts-react-ui/prompt';

export class DocLayout extends Base {
  private model = new LayoutModel();
  private edit: DataSourceHolder;

  constructor() {
    super();

    this.holder.addEventHandler({
      onObjChange: () => {
        this.model.setLayout( clone(this.layout) as LayoutCont );
        this.model.delayedNotify();
      },
      onLoad: () => {
        this.objects.holder.addEventHandler({
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
      this.holder.getObject(this.model.getLastDrop().id)
      .then((obj: ObjectBase) => {
        const views = DataSourceHolder.findAllViews( OBJIOItem.getClass(obj) );

        if (views.length == 1)
          return views[0].object({source: obj, layout: this, viewType: views[0].viewType});

        return select({
          items: views.map(view => view.viewType)
        }).then(view => {
          return (
            views.find(v => v.viewType == view)
            .object({source: obj, layout: this, viewType: view})
          );
        });
      })
      .then((holder: DataSourceHolder) => {
        return (
          this.holder.createObject(holder)
          .then(() => holder)
        );
      })
      .then((holder: DataSourceHolder) => {
        this.model.getLastDrop().id = holder.holder.getID();
        this.objects.push(holder);

        this.objects.holder.save();
        this.layout = clone(this.model.getLayout()) as LayoutCont;
        this.updateLayoutMap();
        this.holder.save();
      }).catch(e => {
        console.log(e);
        this.model.remove(this.model.getLastDrop().id);
        this.holder.save();
      });
    }, 'drop');

    this.model.subscribe(() => {
      this.layout = clone(this.model.getLayout()) as LayoutCont;
      this.holder.save();
    }, 'change');
  }

  updateLayoutMap() {
    const map: {[id: string]: JSX.Element} = {};
    this.objects.getArray().forEach((obj: DataSourceHolder) => {
      const id = obj.holder.getID();
      const jsx: JSX.Element = (obj.getView() || (
        <React.Fragment>
          <div>object {this.holder.getID()}</div>
          <div>data object {obj.get().holder.getID()}</div>
          <div>type {OBJIOItem.getClass(obj.get()).TYPE_ID}</div>
        </React.Fragment>
      ));

      const owner = {
        onRemove: () => {
          this.model.remove(id);
          this.layout = clone( this.model.getLayout() ) as LayoutCont;
          this.holder.save();
          const idx = this.objects.find(obj => obj.holder.getID() == id);
          this.objects.remove(idx);
          this.objects.holder.save();
        },
        onEdit: () => {
          this.edit = obj;
          obj.holder.delayedNotify();
        },
        setName: (name: string) => {
          obj.setName(name);
          this.edit = null;
          obj.holder.delayedNotify();
        },
        isEdit: () => {
          return this.edit == obj;
        }
      };
      map[id] = (
        <LayoutContView model={obj} owner={owner}>
          {jsx}
        </LayoutContView>
      );
    });
    this.model.setMap(map);
  }

  notifyObjects(notifyType?: string) {
    this.objects.getArray().forEach(obj => {
      obj.holder.notify(notifyType);
    });
  }

  delayedNotifyObjects(notifyType?: string) {
    this.objects.getArray().forEach(obj => {
      obj.holder.delayedNotify(notifyType ? { type: notifyType } : null);
    });
  }

  getLayout(): LayoutModel {
    return this.model;
  }
}
