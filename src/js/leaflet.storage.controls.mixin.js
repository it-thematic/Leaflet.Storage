L.Storage.filterControl = L.Control.extend({
    options: {
        position: 'topleft'
    },

    initialize: function (map, condition, options) {
        this.map = map;
        this.condition = condition;
        this.enabled = false;
        L.Control.prototype.initialize.call(this, options);
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-filter storage-control');

        var link = L.DomUtil.create('a', '', container);
        link.href = '#';
        link.title = L._(this.condition.split('=')[1]);

        L.DomEvent
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', this.onClick, this)
            .on(link, 'dblclick', L.DomEvent.stopPropagation);

        return container;
    },

    onClick: function () {
        this.enabled = !this.enabled;
        L.DomUtil.classIf(this.getContainer(), 'dark', this.enabled);
        var that = this;
        this.map.eachDataLayer(function (datalayer) {
            if (!!this.map.activeDatalaye && this.map.activeDatalaye.layer._type === 'Mapbx') {
                that.enabled ? datalayer.layer.appendFilter(that.condition) : datalayer.layer.removeFilter(that.condition);
            }
        });
    }
});


L.Storage.FilterAction = L.Storage.BaseAction.extend({

    options: {
        helpMenu: true,
        className: 'leaflet-control-filter dark',
        tooltip: L._('')
    },

    condition: '',

    initialize: function (map) {
        this.enabled = false;
        L.Storage.BaseAction.prototype.initialize.call(this, map);
    },

    onClick: function() {
        this.enabled = !this.enabled;
        L.DomUtil.classIf(this._link, 'dark', !this.enabled);
        var that = this;
        this.map.eachDataLayer(function (datalayer) {
            if (!!that.map.activeDataLayer && that.map.activeDataLayer.layer._type === 'Mapbox') {
                !that.enabled ? datalayer.layer.removeFilter(that.condition) : datalayer.layer.appendFilter(that.condition);
            }
        });
    },

    addHooks: function () {
        this.onClick();
    }
});

L.Storage.FilterAction.Employee = L.Storage.FilterAction.extend({

    options: {
        helpMenu: true,
        className: 'leaflet-control-filter employee dark',
        tooltip: L._('Показать/скрыть персонал')
    },

    condition: 'type_name=Employee'
});

L.Storage.FilterAction.Vehicle = L.Storage.FilterAction.extend({

    options: {
        helpMenu: true,
        className: 'leaflet-control-filter vehicle dark',
        tooltip: L._('Показать/скрыть автотранспорт')
    },

    condition: 'type_name=Vehicle'
});

L.Storage.FilterToolbar = L.Toolbar.Control.extend({});