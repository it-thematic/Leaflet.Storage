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
        className: 'dark',
        tooltip: L._('')
    },

    condition: '',

    initialize: function (map) {
        this.enabled = false;
        L.Storage.BaseAction.prototype.initialize.call(this, map);
    },

    onClick: function () {
        this.enabled = !this.enabled;
        L.DomUtil.classIf(this._link, 'dark', !this.enabled);
        if (!!this.map.activeDataLayer && this.map.activeDataLayer.layer._type === 'Mapbox') {
            !this.enabled ? this.map.activeDataLayer.layer.removeFilter(this.condition) : this.map.activeDataLayer.layer.appendFilter(this.condition);
        }
    },

    addHooks: function () {
        this.onClick();
    }
});

L.Storage.FilterAction.Employee = L.Storage.FilterAction.extend({

    options: {
        helpMenu: true,
        className: 'leaflet-filter-employee dark',
        tooltip: L._('Показать/скрыть персонал')
    },

    condition: 'type_name=Employee'
});

L.Storage.FilterAction.Vehicle = L.Storage.FilterAction.extend({

    options: {
        helpMenu: true,
        className: 'leaflet-filter-vehicle dark',
        tooltip: L._('Показать/скрыть автотранспорт')
    },

    condition: 'type_name=Vehicle'
});

L.Storage.FilterAction.Datetime = L.Storage.FilterAction.extend({
    options: {
        helpMenu: true,
        className: 'leaflet-filter-datetime dark',
        tooltip: L._('Задать дату/время')
    },

    condition: undefined,

    onClick: function () {
        this._openDatetime();
    },

    setState: function (value) {
        this.enabled = value;
        L.DomUtil.classIf(this._link, 'dark', !this.enabled);
    },

    _openDatetime: function (options) {
        var that = this;
        this._filter_container = L.DomUtil.create('div');
        var filter_field = [
            ['datetime_filter', {
                handler: 'DateTimeInput', label: L._('DateTimeFilter'), className: 'active-filter-datetime',
                callback: function (field) {
                    var value = field.helper.value();
                    that.setState(!!value);
                    if (!!value) {
                        if (!!that.map.activeDataLayer && that.map.activeDataLayer.layer._type === 'Mapbox') {
                            that.map.activeDataLayer.layer.updateFilter('datetime', value);
                        }
                        console.log(new Date(value).toISOString());
                    } else {
                        that.map.activeDataLayer.layer.updateFilter('datetime', null);
                    }
                },
                callbackContext: this
            }]
        ];
        var builder = new L.FormBuilder(this.map, filter_field);
        this._filter_container.appendChild(builder.build());
        this.map.ui.openPanel({data: {html: this._filter_container}, className: 'dark'});
    }
});

L.Storage.FilterToolbar = L.Toolbar.Control.extend({
	onAdd: function(map) {
		L.Toolbar.Control.prototype.onAdd.call(this, map);
        L.DomUtil.addClass(this._container, 'storage-toolbar-enabled');
	},

	onRemove: function(map) {
		L.Toolbar.Control.prototype.onRemove.call(this, map);
        L.DomUtil.removeClass(this._container, 'storage-toolbar-enabled');
	}
});