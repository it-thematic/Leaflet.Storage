L.Storage.FilterAction = L.Storage.BaseAction.extend({

    options: {
        helpMenu: true,
        className: 'dark',
        tooltip: L._('')
    },

    key: undefined,

    value: undefined,

    initialize: function (map) {
        this.enabled = false;
        L.Storage.BaseAction.prototype.initialize.call(this, map);
    },

    onClick: function () {
        this.enabled = !this.enabled;
        L.DomUtil.classIf(this._link, 'dark', !this.enabled);
        if (!!this.map.activeDataLayer && this.map.activeDataLayer.layer._type === 'Mapbox') {
            !!this.enabled ? this.map.activeDataLayer.layer.appendFilter(this.key + '=' + this.value) : this.map.activeDataLayer.layer.removeFilter(this.key + '=' + this.value);
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

    key: 'type_name',

    value: 'Employee'
});

L.Storage.FilterAction.Vehicle = L.Storage.FilterAction.extend({

    options: {
        helpMenu: true,
        className: 'leaflet-filter-vehicle dark',
        tooltip: L._('Показать/скрыть автотранспорт')
    },

    key: 'type_name',

    value: 'Vehicle'
});

var monthsNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

L.Storage.FilterAction.Datetime = L.Storage.FilterAction.extend({
    options: {
        helpMenu: true,
        className: 'leaflet-filter-datetime dark',
        tooltip: L._('Задать дату/время')
    },

    condition: undefined,
    previousDay: undefined,
    previousMonth: undefined,
    previousYear: undefined,
    previousHour: undefined,
    previousMinute: undefined,

    //для  info-desk  необходима  получение  временного интерва, если он задан  (вычисления будут производится по
    // LocationTrackPoint - огромная )), и чтобы повторно не вычислять utctime, будем  хранить  utctime в
    // localstorage
    localStorageHistoryKey: 'history-time',

    onClick: function () {
        this._openDatetime();
    },

    setState: function (value) {
        this.enabled = value;
        L.DomUtil.classIf(this._link, 'dark', !this.enabled);
    },

    _getDefultDate: function (){
        _check_date = localStorage.getItem(this.localStorageHistoryKey);
        if (_check_date !== null) {
            _date = new Date(_check_date*1000);
        }
        else {
            _date = new Date();
        }
        return _date;
    },
    _getDay: function () {
        // Выбор дня
        var container = L.DomUtil.create('span');
        var day_label = L.DomUtil.create('label', '', container);
        day_label.innerHTML = L._('Date').toLowerCase();
        day_label.for = 'дата';

        var day_select = L.DomUtil.create('input', '', container);
        day_select.id = 'date';
        day_select.type = 'date';
        day_select.name = 'date';
        day_select.valueAsDate = this._getDefultDate();

        this._day_select = day_select;
        var that = this;
        return container;
    },

    _getHour: function () {
        var container = L.DomUtil.create('span');
        var hour_label = L.DomUtil.create('label', '', container);
        hour_label.innerHTML = L._('Hour').toLowerCase();
        hour_label.for = 'hour';

        var hour_select = L.DomUtil.create('input', '', container);
        hour_select.type ="number";
        hour_select.min  ="1";
        hour_select.max="24";
        hour_select.id = 'hour';
        hour_select.name = 'hour';
        hour_select.value = this._getDefultDate().getHours();

        this._hour_select = hour_select;
        var that = this;
        return container;
    },

    _getMinute: function () {
        var container = L.DomUtil.create('span');
        var minute_label = L.DomUtil.create('label', '', container);
        minute_label.innerHTML = L._('Minute').toLowerCase();
        minute_label.for = 'minute';

        var minute_select = L.DomUtil.create('input', '', container);
        minute_select.id = 'minute';
        minute_select.name = 'minute';
        minute_select.type ="number";
        minute_select.min  ="1";
        minute_select.max="60";
        minute_select.value = this._getDefultDate().getMinutes();

        this._minute_select = minute_select;
        var that = this;
        return container;
    },

    _disableDate: function() {
        this._hour_select.disabled = 'disabled';
        this._minute_select.disabled = 'disabled';
        this._day_select.disabled= 'disabled';
        this.ok.setAttribute('style','pointer-events:none');
    },

    _enabledData: function() {
        this._hour_select.removeAttribute('disabled');
        this._minute_select.removeAttribute('disabled');
        this._day_select.removeAttribute('disabled');
        this.ok.setAttribute('style','pointer-events:all');
    },

    setStateEnbaledDate: function() {
        if (document.getElementById('mgs-chekbox-actual').checked) {
            this._disableDate();
            this.cancel();
        }
        else{
            this._enabledData();
        }
    },

    getContainer: function () {
        var container = L.DomUtil.create('div');
        var label_header = document.createElement('label');
        label_header.appendChild(document.createTextNode('ОБЪЕКТЫ МОНИТОРИНГА'));
        container.appendChild(label_header);

        var sub_container = L.DomUtil.create('div', 'mgs-swith', container);
        var label = document.createElement('label');
        label.appendChild(document.createTextNode('АКТУАЛЬНЫЕ/ИСТОРИЯ'));
        sub_container.appendChild(label);

        var state_switch = L.DomUtil.create('label', 'switch', sub_container);
        var label_act = document.createElement('label');
        label_act.appendChild(document.createTextNode(''));
        state_switch.appendChild(label_act);
        var checkbox = document.createElement('input');
        state_switch.appendChild(checkbox);
        var state_span = L.DomUtil.create('span','slider round', state_switch);
        checkbox.type = "checkbox";
        checkbox.name = "is_actual";
        checkbox.value = "value";
        checkbox.id = "mgs-chekbox-actual";
        checkbox.classname = 'mgs-check-actual';
        L.DomEvent
            .on(checkbox, 'change', L.DomEvent.stop)
            .on(checkbox, 'change', this.setStateEnbaledDate, this);


        var subcontainer = L.DomUtil.create('div', 'leaflet-filter-datetime-block', container);
        var hh_mm_label = L.DomUtil.create('label', '', subcontainer);
        hh_mm_label.innerHTML = L._('');
        subcontainer.appendChild(this._getDay());
        var hours_container = L.DomUtil.create('div','mgs-hours',subcontainer);
        hours_container.appendChild(this._getHour());
        var split_hour = L.DomUtil.create('span', ' mgs-hours-span', hours_container);
        split_hour.innerHTML = ':';
        hours_container.appendChild(this._getMinute());


        var buttonContainer = L.DomUtil.create('div', 'leaflet-filter-datetime-button', container);
        var apply = L.DomUtil.create('a', 'button', buttonContainer);
        apply.href = '#';
        apply.innerHTML = L._('Apply').toLowerCase();
        this.ok  = apply;
        L.DomEvent
            .on(apply, 'click', L.DomEvent.stop)
            .on(apply, 'click', this.apply, this);

        if (localStorage.getItem(this.localStorageHistoryKey) === null) {
            checkbox.checked = true;
            this._disableDate();
        };
        return container;
    },

    cancel: function() {
        if (!!this.map.activeDataLayer && this.map.activeDataLayer.layer._type === 'Mapbox') {
            this.map.activeDataLayer.layer.updateFilter('time');
        }
        this.setState(false);
        localStorage.removeItem(this.localStorageHistoryKey);
        this.map.startTimer();
    },

    apply: function() {
        _check_date = new Date(this._day_select.value);
        var _date = new Date(_check_date.getFullYear(), _check_date.getMonth(), _check_date.getDate(),
                             this._hour_select.value, this._minute_select.value);
        console.log(_date);
        _date = _date.getTime() / 1000;
        console.log(_date);
        if (!!this.map.activeDataLayer && this.map.activeDataLayer.layer._type === 'Mapbox') {
            this.map.activeDataLayer.layer.updateFilter('time', '=', _date);
            this.setState(true);
            localStorage.setItem(this.localStorageHistoryKey, _date);
        }
        this.map.stopTimer();
    },


    _openDatetime: function (options) {
        var that = this;
        // this._filter_container = L.DomUtil.create('div');
        // var filter_field = [
        //     ['datetime_filter', {
        //         handler: 'DateTimeInput', label: L._('DateTimeFilter'), className: 'active-filter-datetime',
        //         callback: function (field) {
        //             var value = field.helper.value();
        //             that.setState(!!value);
        //             if (!!value) {
        //                 if (!!that.map.activeDataLayer && that.map.activeDataLayer.layer._type === 'Mapbox') {
        //                     that.map.activeDataLayer.layer.updateFilter('datetime', value);
        //                 }
        //                 console.log(new Date(value).toISOString());
        //             } else {
        //                 that.map.activeDataLayer.layer.updateFilter('datetime', null);
        //             }
        //         },
        //         callbackContext: this
        //     }]
        // ];
        // var builder = new L.FormBuilder(this.map, filter_field);
        // this._filter_container.appendChild(builder.build());

        this.map.ui.openPanel({data: {html: this.getContainer()}, className: 'dark'});
    },
});

L.Storage.FilterAction.Voltage = L.Storage.FilterAction.extend({
    condition: 'voltage',

    // Доступные фильтры
    filters: {},

    values: [
        {label: '6 кВ', operation: '<=', value: 6},
        {label: '10 кВ', operation: '==', value: 10},
        {label: '20 кВ', operation: '==', value: 20},
        {label: '35 кВ', operation: '==', value: 35},
        {label: '110кВ', operation: '==', value: 110},
        {label: '220кВ', operation: '>=', value: 220}
    ],

    inputs: [],

    _getContainer: function() {
        var container = L.DomUtil.create('div'), fields = [], that = this;
        for (var i = 0; i < this.values.length; i++) {
            fields.push([
                'filters.voltage'+this.values[i].value+'.check'+this.values[i].value, {
                    handler: 'Switch',
                    label: this.values[i].label
                }
            ]);
        }
        var builder = new L.S.FormBuilder(this, fields, {
            callback: function (e) {
                var filter_mapbox_layer = ['any'], i = 0;
                for (var filter in that.filters) {
                    if (!that.filters.hasOwnProperty(filter)) { continue; }
                    var check = this.filters['voltage'+that.values[i].value]['check'+that.values[i].value];
                    var value = that.filters[filter].value;
                    i++;
                    if (!check) { continue; }
                    filter_mapbox_layer.push([that.values[value].operation, that.condition, that.values[value].value]);
                }
                that.map.eachDataLayer(function (datalayer) {
                    if (datalayer.layer._type === 'Mapbox') {
                        datalayer.layer.updateMapboxFilter(that.condition, filter_mapbox_layer);
                    }
                });
            }
        });
        container.appendChild(builder.build());

        var advancedButtons = L.DomUtil.create('div', 'button-bar', container);
        var cancelLink = L.DomUtil.create('a', 'button third storage-delete', advancedButtons);
        cancelLink.innerHTML = L._('Cancel');
        cancelLink.href = '#';
        L.DomEvent.on(cancelLink, 'click', L.DomEvent.stop)
                  .on(cancelLink, 'click', function () {
                      this.map.ui.closePanel();
                      this.cancel();
                      this.reset();
                  }, this);

        return container;
    },

    initialize: function(map) {
        L.Storage.FilterAction.prototype.initialize.call(this, map);
        for (var i = 0; i < this.values.length; i++) {
            this.filters['voltage'+this.values[i].value] = {};
            this.filters['voltage'+this.values[i].value]['check'+this.values[i].value] = true;
            this.filters['voltage'+this.values[i].value].value = i;
        }
    },

    onClick: function () {
        this.show();
    },

    getMap: function() {
        return this.map;
    },

    show: function () {
        this.map.ui.openPanel({data: {html: this._getContainer()}, className: 'dark'});
    },

    reset: function() {
        for (var i = 0; i < this.values.length; i++) {
            this.filters['voltage'+this.values[i].value]['check'+this.values[i].value] = true;
        }
    },

    cancel: function () {
        var that = this;
        this.map.eachDataLayer(function (datalayer) {
            if (datalayer.layer._type === 'Mapbox') {
                datalayer.layer.updateMapboxFilter(that.condition, undefined);
            }
        });
    }
});


L.Storage.FilterToolbar = L.Toolbar.Control.extend({
    onAdd: function (map) {
        L.Toolbar.Control.prototype.onAdd.call(this, map);
        L.DomUtil.addClass(this._container, 'storage-toolbar-enabled');
    },

    onRemove: function (map) {
        L.Toolbar.Control.prototype.onRemove.call(this, map);
        L.DomUtil.removeClass(this._container, 'storage-toolbar-enabled');
    }
});


L.Storage.ExitAction = L.Storage.FilterAction.extend({
    // exit to karta (modal popup)
    options: {
        helpMenu: true,
        className: 'leaflet-exit-map dark',
        tooltip: L._('Выйти')
    },

    onClick: function () {
        var _modal = document.querySelector(".mgs-modal");
        $.ajax({
            url : "/logout/",
            type: "GET",
          }).success(function(res) {
            var _content = document.querySelector(".mgs-modal-content > .mgs-content");
            _content.innerHTML = res;
            _modal.className ='mgs-show-modal';
          }).error(function(res) {
            console.log(res)
        });
    },
});

L.Storage.ExitToolbar = L.Toolbar.Control.extend({
     onAdd: function (map) {
        L.Toolbar.Control.prototype.onAdd.call(this, map);
        L.DomUtil.addClass(this._container, 'storage-toolbar-enabled');
    },

    onRemove: function (map) {
        L.Toolbar.Control.prototype.onRemove.call(this, map);
        L.DomUtil.removeClass(this._container, 'storage-toolbar-enabled');
    }
});