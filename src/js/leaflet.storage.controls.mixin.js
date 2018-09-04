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
        if (!!this.map.activeDatalayer && this.map.activeDatalayer.layer._type === 'Mapbx') {
            that.enabled ? datalayer.layer.appendFilter(that.condition) : datalayer.layer.removeFilter(that.condition);
        };
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
        // var cancel = L.DomUtil.create('a', 'button', buttonContainer);
        // cancel.href = '#';
        // cancel.innerHTML = L._('Cancel');
        // L.DomEvent
        //     .on(cancel, 'click', L.DomEvent.stop)
        //     .on(cancel, 'click', this.cancel, this);

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
            this.map.activeDataLayer.layer.updateFilter('time',_date);
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
})
;

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