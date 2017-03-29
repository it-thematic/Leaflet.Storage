L.Control.Embed.Mixin = {
    position: 'topright'
};
L.Control.Embed.include(L.Control.Embed.Mixin);


L.Storage.MoreControls.Mixin = {
    position: 'topright'
};
L.Storage.MoreControls.include(L.Storage.MoreControls.Mixin);


L.Storage.DataLayersControl.Mixin = {
    addDataLayer: function (container, datalayer, draggable) {
        var datalayerLi = L.DomUtil.create('li', '', container);
        if (draggable) L.DomUtil.element('i', {className: 'drag-handle', title: L._('Drag to reorder')}, datalayerLi);
        datalayer.renderToolbox(datalayerLi);


        var title = L.DomUtil.add('span', 'layer-title', datalayerLi, datalayer.options.name);
        //TODO: ForestMap : назначение обозначения для открытия табличного представления
        title.id =  datalayer.options.laydescription;

        datalayerLi.id = 'browse_data_toggle_' + datalayer.storage_id;

        L.DomUtil.classIf(datalayerLi, 'off', !datalayer.isVisible());
        title.innerHTML = datalayer.options.name;
    }
};
L.Storage.DataLayersControl.include(L.Storage.DataLayersControl.Mixin);


L.Storage.TileLayerControl.Mixin = {
    //TODO: ForestMap  - добавление на нижний толбар открытия легенды
    //TODO:  замена  слоя происходит при нажатии  только на картинку
    addTileLayerElement: function (tilelayer, options) {
        var selectedClass = this._map.hasLayer(tilelayer) ? 'selected' : '',
            el = L.DomUtil.create('li', selectedClass, this._tilelayers_container),
                     img = L.DomUtil.create('img', '', el),
                     // name = L.DomUtil.create('div', 'mainclass', el),
                     widget_f = L.DomUtil.create('div', 'mainclass', el);


        widget_f.id= tilelayer.options.attribution;
        widget_f.innerHTML = tilelayer.options.name;
        widget_f.title = "Легенда слоя";

        img.src = L.Util.template(tilelayer.options.url_template, this._map.demoTileInfos);

        // name.innerHTML = tilelayer.options.name ;
        L.DomEvent.on(img, 'click', function () {
            this._map.selectTileLayer(tilelayer);
            this._map.ui.closePanel();
        }, this);

        //TODO:ForestMap  отображение легенды
        L.DomEvent.on(widget_f, 'click', function () {
            var namelayer = widget_f.id;
            if (namelayer != '')
            {
                $('#widget_legenda').children().children().children('img').attr('src', '/static/main/src/image/'  + namelayer + '.PNG');
                $('#widget_legenda').show();
            }
        }, this);
    },

    openSwitcher: function (options) {
        var container = L.DomUtil.get('tile_layer_container');
        if (container) {
            if (L.DomUtil.hasClass(container, 'leaflet-control-tilelayers')) {
                this._tilelayers_container = L.DomUtil.create('ul', 'storage-tilelayer-switcher-container');
                this.buildList(options);
                L.DomUtil.removeClass(container, 'leaflet-control-tilelayers');
                L.DomUtil.addClass(container, 'leaflet-control-tilelayers-enable');
            } else {
                L.DomUtil.removeClass(container, 'leaflet-control-tilelayers-enable');
                L.DomUtil.addClass(container, 'leaflet-control-tilelayers');
                this._map.ui.closePanel();
            }
        }
    }
};
L.Storage.TileLayerControl.include(L.Storage.TileLayerControl.Mixin);


L.Storage.LocateControl.Mixin = {
    position: 'topright'
};
L.Storage.LocateControl.include(L.Storage.LocateControl.Mixin);


L.Storage.SearchControl.Mixin = {
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-search storage-control'),
            self = this;

        L.DomEvent.disableClickPropagation(container);
        var link = L.DomUtil.create('a', 'findForestMap', container);
        link.href = '#';

        // TODO: ForestMap закрытие выезжающей панели для поиска
            // L.DomEvent.on(link, 'click', function (e) {
            //     L.DomEvent.stop(e);
            //     self.openPanel(map);
            // });
        // TODO: ForestMap закрытие выезжающей панели для поиска
        return container;
    },

    openPanel: function (map) {
        // var options = {
        //     limit: 10,
        //     noResultLabel: L._('No results'),
        // }
        // if (map.options.photonUrl) options.url = map.options.photonUrl;
        // var container = L.DomUtil.create('div', '');
        //
        // var title = L.DomUtil.create('h3', '', container);
        // title.textContent = L._('Search location');
        // var input = L.DomUtil.create('input', 'photon-input', container);
        //
        // /*
		 //  ForestMap : Для  вставки списка лесничеств
        // */
        // var input1 = L.DomUtil.create('div', 'listForesteryMap', container);
        //
        // var resultsContainer = L.DomUtil.create('div', 'photon-autocomplete', container);
        // this.search = new L.S.Search(map, input, options);
        // var id = Math.random();
        // this.search.on('ajax:send', function () {
        //     map.fire('dataloading', {id: id});
        // });
        // this.search.on('ajax:return', function () {
        //     map.fire('dataload', {id: id});
        // });
        // this.search.resultsContainer = resultsContainer;
        // mainZamena();
        // map.ui.once('panel:ready', function () {
        //
        //     input.focus();
        //
        // });
        // map.ui.openPanel({data: {html: container}});

    }
};
L.Storage.SearchControl.include(L.Storage.SearchControl.Mixin);

L.Storage.DrawToolbar.prototype.initialize = function (options) {
    L.Toolbar.Control.prototype.initialize.call(this, options);
    this.map = this.options.map;
    this.map.on('seteditedlayer', this.redraw, this);
};
L.Storage.DrawToolbar.prototype.appendToContainer = function (container) {
    this.options.actions = [];
    if (this.map.editedLayer) {
        if (this.map.options.enableMarkerDraw) {
            this.options.actions.push(L.S.DrawMarkerAction);
        }
        if (this.map.options.enablePolylineDraw) {
            this.options.actions.push(L.S.DrawPolylineAction);
            if (this.map.editedFeature && this.map.editedFeature instanceof L.S.Polyline) {
                this.options.actions.push(L.S.AddPolylineShapeAction);
            }
        }
        if (this.map.options.enablePolygonDraw) {
            this.options.actions.push(L.S.DrawPolygonAction);
            if (this.map.editedFeature && this.map.editedFeature instanceof L.S.Polygon) {
                this.options.actions.push(L.S.AddPolygonShapeAction);
            }
        }
    }
    L.Toolbar.Control.prototype.appendToContainer.call(this, container);
};

// =====================================================================================================================
// New stroage actions
// =====================================================================================================================

L.Storage.CancelFeatureAction = L.S.BaseFeatureAction.extend({

    options: {
        toolbarIcon: {
            className: 'storage-cancel-one',
            tooltip: L._('Cancel edits')
        }
    },

    onClick: function (e) {
        this.feature.confirmCancel(e);
    }
});

L.Storage.EnableEditLayerAction = L.Storage.BaseAction.extend({

    options: {
        helpMenu: true,
        className: 'edit-layer dark',
        tooltip: L._('Enable editing layer')
    },

    addHooks: function () {
        this.map.editLayer();
    }
});

L.Storage.DisableEditLayerAction = L.Storage.BaseAction.extend({

    options: {
        helpMenu: true,
        className: 'disable-edit-layer',
        tooltip: L._('Disable editing layer')
    },

    addHooks: function () {
        this.map.disableEditLayer();
    }
});

L.Storage.SaveAction = L.Storage.BaseAction.extend({
    options: {
        helpMenu: true,
        className: 'leaflet-control-edit-save button',
        html: L._('Save current edits') + ' (Ctrl-S)',
        tooltip: L._('Save current edits') + ' (Ctrl-S)'
    },

    addHooks: function () {
        this.map.save()
    }
});

L.Storage.CancelAction = L.Storage.BaseAction.extend({
    options: {
        helpMenu: true,
        className: 'leaflet-control-edit-cancel button',
        html: L._('Cancel'),
        tooltip: L._('Cancel edits')
    },

    addHooks: function () {
        this.map.askForReset()
    }
});

L.Storage.DisabeAction = L.Storage.BaseAction.extend({
    options: {
        helpMenu: true,
        className: 'leaflet-control-edit-disable',
        html: L._('Disable editing'),
        tooltip: L._('Disable editing')
    },

    addHooks: function () {
        this.map.disableEdit();
        this.map.ui.closePanel();
    }
});

L.Storage.EditingLayerToolbar = L.Toolbar.Control.extend({

    initialize: function (options) {
        L.Toolbar.Control.prototype.initialize.call(this, options);
        this.map = this.options.map;
        this.map.on('seteditedlayer', this.redraw, this);
    },

    appendToContainer: function (container) {
        this.options.actions = [L.S.SaveAction, L.S.CancelAction, L.S.DisabeAction];
        if (!this.map.editedLayer) {
            this.options.actions.push(L.S.EnableEditLayerAction);
        } else {
            this.options.actions.push(L.S.DisableEditLayerAction);
        }
        L.Toolbar.Control.prototype.appendToContainer.call(this, container);
    },

    redraw: function () {
        var container = this._control.getContainer();
        container.innerHTML = '';
        this.appendToContainer(container);
    }
});

L.Storage.EditLayerControl = L.Control.extend({

    options: {
        position: 'topright'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-edit-layer-enable storage-control', map._buttonscontainer),
            edit = L.DomUtil.create('a', '', container);
        edit.href = '#';
        edit.title = L._('Enable editing layer');

        L.DomEvent
            .addListener(edit, 'click', L.DomEvent.stop)
            .addListener(edit, 'click', this.toogleEditing, map);
        return container;
    },

    toogleEditing: function () {
        if (!this.editedLayer) {
            this.editLayer()
        } else {
            this.map.disableEditLayer()
        }
    }

});


L.Storage.pkkControl = L.Control.extend({
    options: {
        position: 'topleft'
    },

    initialize: function (map, options) {
        this.map = map;
        L.Control.prototype.initialize.call(this, options);
        var rosr = L.tileLayer.wms("http://pkk5.rosreestr.ru/arcgis/services/Cadastre/CadastreWMS/MapServer/WMSServer", {
            wmsid: "rosr",
            attribution: "rosr",
            layers: "22,21,20,19,18,16,15,14,13,11,10,9,7,6,4,3,2,1",
            format: "image/png",
            version: "1.3.0",
            transparent: "TRUE",
            detectRetina: true
        });
        try {
            Object.defineProperty(this, 'rosr', {
                get: function () {
                return rosr;
                }
            });
        }
        catch (e) {
        // Certainly IE8, which has a limited version of defineProperty
        }
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-pkk storage-control dark');

        var link = L.DomUtil.create('a', '', container);
        link.href = '#';
        link.title = L._('PKK');

        L.DomEvent
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', this.onClick, this)
            .on(link, 'dblclick', L.DomEvent.stopPropagation);

        return container;
    },

    onClick: function () {
        if (this.map.hasLayer(this.rosr)) {
            this.map.removeLayer(this.rosr)
        } else {
            this.map.addLayer(this.rosr)
        }
    }
});

L.Storage.printControl = L.Control.extend({
    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-print storage-control dark');

        var link = L.DomUtil.create('a', '', container);
        link.href = '#';
        link.title = L._('Print map');

        L.DomEvent
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', this.onClick, this)
            .on(link, 'dblclick', L.DomEvent.stopPropagation);

        return container;
    },

    onClick: function () {
        window.print();
    }
});

L.Storage.SaveControl = L.Control.extend({
    options: {
        position: 'topright'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-edit-save storage-control');

        var link = L.DomUtil.create('a', '', container);
        link.href = '#';
        // link.title = L._('Save current edits') + ' (Ctrl-S)';
        // link.innerHTML = L._('Save');

        L.DomEvent
            .addListener(link, 'click', L.DomEvent.stop)
            .addListener(link, 'click', map.save, this);

        return container;
    }
});

L.Storage.CancelControl = L.Control.extend({
    options: {
        position: 'topright'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-edit-cancel storage-control');

        var link = L.DomUtil.create('a', '', container);
        link.href = '#';
        // link.title = L._('Cancel edits');
        // link.innerHTML = L._('Cancel');

        L.DomEvent
            .addListener(link, 'click', L.DomEvent.stop)
            .addListener(link, 'click', map.askForReset, this);

        return container;
    }
});

L.Storage.DisableControl = L.Control.extend({
    options: {
        position: 'topright'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-edit-disable storage-control');

        var link = L.DomUtil.create('a', '', container);
        link.href = '#';
        // link.title = L._('Disable editing');
        // link.innerHTML = L._('Disable editing');

        L.DomEvent
            .addListener(link, 'click', L.DomEvent.stop)
            .addListener(link, 'click', function (e) {
                map.disableEdit(e);
                map.ui.closePanel();
            }, map);

        return container;
    }
});

