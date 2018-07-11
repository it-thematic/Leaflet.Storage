L.Storage.pkkControl = L.Control.extend({
    options: {
        position: 'topleft'
    },

    initialize: function (map, options) {
        this.map = map;
        L.Control.prototype.initialize.call(this, options);
        var rosr = L.tileLayer.wms("http://pkk5.rosreestr.ru/arcgis/services/Cadastre/CadastreWMS/MapServer/WMSServer", {
            wmsid: "rosr",
            attribution: "pkk5.rosreestr.ru",
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
        var container = L.DomUtil.create('div', 'leaflet-control-pkk storage-control');

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
        L.DomUtil.classIf(this.getContainer(), 'dark', this.map.hasLayer(this.rosr))
    }
});


L.Storage.TyeKartControl = L.Control.extend({

    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-show-type-kart storage-control'),
            show_kart = L.DomUtil.create('a', '', container);

        show_kart.id='show_kart_s';
        show_kart.title = L._('Показать тематические карты');
        L.DomEvent.on(show_kart, 'click', function (e) {
            L.DomEvent.stop(e);
            document.getElementById("show-kart-div").style.display = 'block';
        }, this);

        return container;
    }
});


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