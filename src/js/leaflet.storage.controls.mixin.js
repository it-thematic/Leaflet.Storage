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

var monthsNames = ['January', 'February', 'February', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

L.Storage.FilterAction.Datetime = L.Storage.FilterAction.extend({
    options: {
        helpMenu: true,
        className: 'leaflet-filter-datetime dark',
        tooltip: L._('Задать дату/время')
    },

    condition: undefined,
    previousDay: undefined,

    onClick: function () {
        this._openDatetime();
    },

    setState: function (value) {
        this.enabled = value;
        L.DomUtil.classIf(this._link, 'dark', !this.enabled);
    },

    _populateDays: function (daySelectContainer, month, year) {
        // Добавление количества дней
        while (daySelectContainer.firstChild) {
            daySelectContainer.removeChild(daySelectContainer.firstChild);
        }


        var dayNum, i;

        // 31 or 30 days?
        if (month === L._('January') || month === L._('March') || month === L._('May') || month === L._('July') ||
            month === L._('August') || month === L._('October') || month === L._('December')) {
            dayNum = 31;
        } else if (month === L._('April') || month === L._('June') || month === L._('September') ||
            month === L._('November')) {
            dayNum = 30;
        } else {
            // If month is February, calculate whether it is a leap year or not
            (year - 2000) % 4 === 0 ? dayNum = 29 : dayNum = 28;
        }

        // inject the right number of new <option> elements into the day <select>
        for (i = 1; i <= dayNum; i++) {
            var option = L.DomUtil.create('option', '', daySelectContainer);
            option.textContent = i;
        }

        if (previousDay) {
            daySelectContainer.value = previousDay;

            // If the previous day was set to a high number, say 31, and then
            // you chose a month with less total days in it (e.g. February),
            // this part of the code ensures that the highest day available
            // is selected, rather than showing a blank daySelect
            if (daySelectContainer.value === "") {
                daySelectContainer.value = previousDay - 1;
            }

            if (daySelectContainer.value === "") {
                daySelectContainer.value = previousDay - 2;
            }

            if (daySelectContainer.value === "") {
                daySelectContainer.value = previousDay - 3;
            }
        }
    },

    _populateYears: function (yearSelectContainer) {
        // get this year as a number
        var date = new Date();
        var year = date.getFullYear();

        // Make this year, and the 100 years before it available in the year <select>
        for (var i = 0; i <= 100; i++) {
            var option = L.DomUtil.create('option', '', yearSelectContainer);
            option.textContent = year - i;
        }
    },

    _populateHours: function (hourSelectContainer) {
        // populate the hours <select> with the 24 hours of the day
        for (var i = 0; i <= 23; i++) {
            var option = document.createElement('option');
            option.textContent = (i < 10) ? ("0" + i) : i;
            hourSelectContainer.appendChild(option);
        }
    },

    _populateMinutes: function (minuteSelectContainer) {
        // populate the minutes <select> with the 60 hours of each minute
        for (var i = 0; i <= 59; i++) {
            var option = L.DomUtil.create('option', '', minuteSelectContainer);
            option.textContent = (i < 10) ? ("0" + i) : i;
        }
    },

    _getDay: function () {
        // Выбор дня
        var container = L.DomUtil.create('span');
        var day_label = L.DomUtil.create('label', '', container);
        day_label.innerHTML = L._('Day');
        day_label.for = 'day';

        var day_select = L.DomUtil.create('select', '', container);
        day_select.id = 'day';
        day_select.name = 'day';

        this._day_select = day_select;
        var date = new Date();
        this._populateDays(day_select, L._(monthsNames[date.getMonth()]), date.getFullYear());
        var that = this;
        day_select.onchange = function () {
            this.previousDay = that._day_select.value;
        };

        return container;
    },

    _getMonth: function () {
        var container = L.DomUtil.create('span');
        var month_label = L.DomUtil.create('label', '', container);
        month_label.innerHTML = L._('Mounth');
        month_label.for = 'month';

        var month_select = L.DomUtil.create('select', '', container);
        month_select.id = 'month';
        month_select.name = 'month';


        for (var i = 0; i < monthsNames.length; i++) {
            var month_options = L.DomUtil.create('option', '', month_select);
            month_options.innerHTML = L._(monthsNames[i]);
        }
        this._month_select = month_select;
        var that = this;
        month_select.onchange = function () {
            that._populateDays(that._day_select, that._month_select.value, that._year_select.value);
        };
        return container;
    },

    _getYear: function () {
        // Выбор года
        var container = L.DomUtil.create('span');
        var year_label = L.DomUtil.create('label', '', container);
        year_label.innerHTML = L._('Year');
        year_label.for = 'year';

        var year_select = L.DomUtil.create('select', '', container);
        year_select.id = 'year';
        year_select.name = 'year';
        this._year_select = year_select;
        var that = this;
        year_select.onchange = function () {
            that._populateDays(that._day_select, that._month_select.value, that._year_select.value);
        };

        return container;
    },

    _getHour: function () {
        var container = L.DomUtil.create('span');


        var hour_label = L.DomUtil.create('label', '', container);
        hour_label.innerHTML = L._('Hour');
        hour_label.for = 'hour';

        var hour_select = L.DomUtil.create('select', '', container);
        hour_select.id = 'hour';
        hour_select.name = 'hour';

        this._hour_select = hour_select;
        var that = this;
        return container;
    },

    _getMinute: function () {
        var container = L.DomUtil.create('span');
        var minute_label = L.DomUtil.create('label', '', container);
        minute_label.innerHTML = L._('Minute');
        minute_label.for = 'hour';

        var minute_select = L.DomUtil.create('select', '', container);
        minute_select.id = 'minute';
        minute_select.name = 'minute';

        this._minute_select = minute_select;
        var that = this;
        return container;
    },

    getContainer: function () {
        var container = L.DomUtil.create('div');
        var subcontainer = L.DomUtil.create('div', 'leaflet-filter-datetime-block', container);
        var title = L.DomUtil.create('h4', '', subcontainer);
        title.innerHTML = L._('Edit map properties');

        subcontainer.appendChild(this._getDay());
        subcontainer.appendChild(this._getMonth());
        subcontainer.appendChild(this._getYear());
        this._populateYears(this._year_select);
        subcontainer.appendChild(this._getHour());
        this._populateHours(this._hour_select);
        subcontainer.appendChild(this._getMinute());
        this._populateMinutes(this._minute_select);
        return container;

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
    }
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