L.S.Layer.Mapbox = L.S.Layer.Default.extend({
    _type: 'Mapbox',
    _styleJSON: null,
    filters: null,
    bbox_filter: null,
    default_filter: null,
    selectOptions: [["-1", '------']],

    _getStylesUrl: function() {
        var template = '/styles/datalayer/{id}/styles';
        return L.Util.template(template, {id: this.datalayer.storage_id});
    },

    _getStyleUrl: function (id) {
        var template = '/styles/datalayer/{storage_id}/styles/{id}';
        return L.Util.template(template, {storage_id: this.datalayer.storage_id, id: id});
    },

    _getStyle: function (id) {
        if (!this.datalayer.storage_id) { return; }
        var that = this;
        this.datalayer.map.get(this._getStylesUrl(), {
            async: false,
            callback: function(response) {
                if (response.data.length) {
                    that.selectOptions = that.selectOptions.concat(response.data);
                    if (that.datalayer.options.mapbox.style) {
                        that.styleID = that.datalayer.options.mapbox.style;
                    } else {
                        if (that.selectOptions.length) {
                            that.styleID = that.selectOptions[1][0];
                        }
                    }
                }
            }
        });
    },

    initialize: function (datalayer) {
        L.S.Layer.Default.prototype.initialize.call(this, datalayer);
        var styleID = null;
        this.filters = [];
        var that = this;
        try {
            Object.defineProperty(this, 'styleID', {
                get: function () {
                    return styleID;
                },
                set: function (style_id) {
                    if (Number(style_id) === -1) { return; }
                    if (styleID === style_id) { return; }
                    styleID  = style_id;
                    this.datalayer.map.get(this._getStyleUrl(style_id), {
                        callback: function(response) {
                            that.datalayer.map.MAPBOX.removeStyle(that._styleJSON);
                            if (response) {
                                that._styleJSON = response;
                                that.datalayer.map.MAPBOX.setStyle(response);
                                that.fire('styleloaded', that);
                            }
                        }
                    });
                }
            });
        }
        catch (e) {
            // Certainly IE8, which has a limited version of defineProperty
        }

        this.on('add', function (e) {
            if (this.styleID && this.styleID !== -1) {
                this.datalayer.map.MAPBOX.setStyle(this._styleJSON);
            }
        }, this);

        this.on('remove', function (e) {
            if (this.styleID && this.styleID !== -1) {
                this.datalayer.map.MAPBOX.removeStyle(this._styleJSON);
            }
        }, this);

        this.datalayer.map.on('moveend', function (e) {
            that.updateBboxFilter(true);
        });

        this.on('styleloaded', function () {
            that.updateBboxFilter(that.datalayer.options.mapbox.in_bbox);
            that.updateSource();
        }, this);

        // Инициализация параметров для слоя, если они переданы
        if (this.datalayer.options.mapbox) {
            if (this.datalayer.options.mapbox.active) {
                this.datalayer.map.activeDataLayer = this.datalayer;
            }

            this.default_filter = this.datalayer.options.mapbox.default_filter;

            if (this.datalayer.options.mapbox.style) {
                this.styleID = this.datalayer.options.mapbox.style;
            }
        }
        this._getStyle(this.datalayer.storage_id);
    },

    getEditableOptions: function () {
        if (!L.Util.isObject(this.datalayer.options.mapbox)) {
            this.datalayer.options.mapbox = {};
        }
        var that = this;
        return [
            ['options.mapbox.style', {handler: 'Select', label: L._('Default style'), selectOptions: this.selectOptions,
                callback: function (field) {
                    that.styleID = field.helper.value();
                }
            }],
            ['options.mapbox.in_bbox', {handler: 'Switch', label: L._('In bbox map')}],
            ['options.mapbox.active', {handler: 'Switch', label: L._('Active')}],
            ['options.mapbox.default_filter', {label: L._('Default Filter')}]
        ];
    },

    postUpdate: function (field) {
        switch (field.helper.name) {
            case 'in_bbox':
                this.updateBboxFilter(field.helper.value());
                break;
            case 'active':
                this.datalayer.map.activeDatalaye = this.datalayer;
                break;
            case 'default_filter':
                this.default_filter = field.helper.value();
                this.updateSource();
                break;
        }
        L.S.Layer.Default.prototype.postUpdate.call(this, field);
    },

    updateBboxFilter: function(value) {
        !!value ? this.bbox_filter = 'in_bbox=' + this.datalayer.map.getBounds().toBBoxString() : null;
        this.updateSource();
    },

    appendFilter: function (filter) {
        if (this.filters.indexOf(filter) !== -1) { return; }
        this.filters.push(filter);
        this.updateSource();
    },

    removeFilter: function (filter) {
        var index = this.filters.indexOf(filter);
        if (index === -1) { return; }
        this.filters.splice(index, 1);
        this.updateSource();
    },

    updateSource: function () {
        if (!this._styleJSON) { return; }
        var source_type, url, filter, i;
        for (var source in this._styleJSON.sources) {
            if (!this._styleJSON.sources.hasOwnProperty(source)) {
                continue;
            }
            // Получение базово адреса источника данных
            source_type = this._styleJSON.sources[source].type;
            if (source_type !== 'geojson') {
                continue;
            }
            url = this._styleJSON.sources[source].data.split('?')[0];
            if (this.filters.length >=0 ) {
                url += '?';
            }

            // Добавление фильтра по умолчанию
            if (!!this.default_filter) {
                url += '&' + this.default_filter;
            }

            // Добавление фильтра по видимой области карты
            if (!!this.bbox_filter) {
                url += '&' + this.bbox_filter;
            }

            filter = '';
            for (i = 0; i < this.filters.length; i++) {
                filter += '&' + this.filters[i];
            }
            this._styleJSON.sources[source].data = url + filter;
            this.datalayer.map.MAPBOX.setSource(source, url + filter);
            this.datalayer.map.fire('update-source', {map: this.datalayer.map, layer: this});
        }
    }
});