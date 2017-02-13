L.Control.Embed.Mixin = {
    position: 'topright'
};
L.Control.Embed.include(L.Control.Embed.Mixin);


L.Storage.MoreControls.Mixin = {
    position: 'topright'
};
L.Storage.MoreControls.include(L.Storage.MoreControls.Mixin);


L.Storage.DataLayersControl.Mixin = {
    addDataLayer : function (container, datalayer, draggable) {
        var datalayerLi = L.DomUtil.create('li', '', container);
        if (draggable) L.DomUtil.element('i', {className: 'drag-handle', title: L._('Drag to reorder')}, datalayerLi);
        datalayer.renderToolbox(datalayerLi);
        var title = L.DomUtil.add('span', 'layer-title', datalayerLi, datalayer.options.name);
        title.id =  datalayer.options.laydescription;

        datalayerLi.id = 'browse_data_toggle_' + datalayer.storage_id;
        L.DomUtil.classIf(datalayerLi, 'off', !datalayer.isVisible());
        title.innerHTML = datalayer.options.name;
    }
};
L.Storage.DataLayersControl.include(L.Storage.DataLayersControl.Mixin);


L.Storage.TileLayerControl.Mixin = {
    addTileLayerElement: function (tilelayer, options) {
        var selectedClass = this._map.hasLayer(tilelayer) ? 'selected' : '',
            el = L.DomUtil.create('li', selectedClass, this._tilelayers_container),
                     img = L.DomUtil.create('img', '', el),
                     widget_f = L.DomUtil.create('div', 'mainclass', el);

        widget_f.id= tilelayer.options.attribution;
        widget_f.innerHTML = tilelayer.options.name;
        widget_f.title = "Легенда слоя";

        img.src = L.Util.template(tilelayer.options.url_template, this._map.demoTileInfos);

        L.DomEvent.on(img, 'click', function () {
            this._map.selectTileLayer(tilelayer);
            this._map.ui.closePanel();
        }, this);

        L.DomEvent.on(widget_f, 'click', function () {
            var namelayer = widget_f.id;
            if (namelayer != '')
            {
                $('#widget_legenda').children().children().children('img').attr('src', '/static/main/src/image/'  + namelayer + '.PNG');
                $('#widget_legenda').show();
            }
        }, this);
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
        return container;
    }
};
L.Storage.SearchControl.include(L.Storage.SearchControl.Mixin);