L.S.Layer.Mapbox = L.S.Layer.Default.extend({
    _type: 'Mapbox',
    _styleJSON: null,
    filters: null,
    mapbox_layer_filter: null,
    bbox_filter: null,
    default_filter: null,
    selectOptions: [["-1", '------']],

    _getStylesUrl: function () {
        var template = '/styles/datalayer/{id}/styles';
        return L.Util.template(template, {id: this.datalayer.storage_id});
    },

    _getStyleUrl: function (id) {
        var template = '/styles/datalayer/{storage_id}/styles/{id}';
        return L.Util.template(template, {storage_id: this.datalayer.storage_id, id: id});
    },

    _getLegendUrl: function (id) {
        var template = '/styles/datalayer/legend/{id}';
        return L.Util.template(template, {id: id});
    },

    _getStyle: function (id) {
        if (!this.datalayer.storage_id) {
            return;
        }
        var that = this;
        this.datalayer.map.get(this._getStylesUrl(), {
            async: false,
            callback: function (response) {
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

    eachMapboxSource: function(method, context) {
        if (!this._styleJSON) { return this; }
        for (var source in this._styleJSON.sources) {
            if (this._styleJSON.sources.hasOwnProperty(source)) {
                method.call(context || this, this._styleJSON.sources[source]);
            }
        }
        return this;
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
                    if (Number(style_id) === -1) {
                        return;
                    }
                    if (styleID === style_id) {
                        return;
                    }
                    styleID = style_id;
                    this.datalayer.map.get(this._getStyleUrl(style_id), {
                        callback: function (response) {
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
                if (!this._styleJSON) { return; }
            //     var style = this._styleJSON;
            //     for (var source in style.sources) {
            //         if (!style.sources.hasOwnProperty(source)) {
            //             continue;
            //         }
            //         Получение базово адреса источника данных
                    // var source_type = style.sources[source].type;
                    // if (source_type !== 'geojson') {
                    //     continue;
                    // }
                    //
                    // if (!!this.default_filter) {
                    //     var url = style.sources[source].data;
                    //     if (url.indexOf('?') === -1) {
                    //         url += '?' + this.default_filter;
                    //     } else {
                    //         url += this.default_filter;
                    //     }
                    //     url = style.sources[source].data = url;
                    // }
                // }
                // this.datalayer.map.MAPBOX.setStyle(style);
                this.datalayer.map.MAPBOX.setStyle(this._styleJSON);
                this.updateSource();
            }
        });

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
            ['options.mapbox.style', {
                handler: 'Select', label: L._('Default style'), selectOptions: this.selectOptions,
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

    updateBboxFilter: function (value) {
        !!value ? this.bbox_filter = 'in_bbox=' + this.datalayer.map.getBounds().toBBoxString() : null;
        this.updateSource();
    },

    appendFilter: function (filter) {
        if (this.filters.indexOf(filter) !== -1) {
            return;
        }
        this.filters.push(filter);
        this.updateSource();
    },

    removeFilter: function (filter) {
        var index = this.filters.indexOf(filter);
        if (index === -1) {
            return;
        }
        this.filters.splice(index, 1);
        this.updateSource();
    },

    updateFilter: function (key, operation, value) {
        if (this.filters.length === 0) {
            if (!!value) {
                this.filters.push(key + operation + value);
            }
        } else {
            for (var i = 0; i < this.filters.length; i++) {
                var filter = this.filters[i];
                var arr_filter = filter.split(operation);
                if (arr_filter[0] === key) {
                    if (!!value) {
                        this.filters[i] = key + operation + value;
                    } else {
                        this.filters.splice(i, 1);
                    }
                }
            }
        }
        this.updateSource();
    },

    updateMapboxFilter: function (metadata_key, mapbox_layer_filter) {
        // filter: фильтр который принимает Mapbox
        this.mapbox_layer_filter = mapbox_layer_filter;
        for (var i = 0; i < this._styleJSON.layers.length; i++) {
            var metadatas = this._styleJSON.layers[i].metadata;
            if (!metadatas) { continue; }
            for (var metadata in metadatas) {
                if (!metadatas.hasOwnProperty(metadata)) { continue; }
                var metadata_array = metadata.split(':');
                // Если это поле по которому фильтровать, то фильтруем иначе нет
                if (metadata_array[1] !== 'filter') { continue; }
                if (metadata_array[2] === metadata_key) {
                    if (!!this.datalayer.map.MAPBOX.hasLayer(this._styleJSON.layers[i].id)) {
                        this._styleJSON.layers[i].filter = this.mapbox_layer_filter;
                        this.datalayer.map.MAPBOX.setFilter(this._styleJSON.layers[i].id, this.mapbox_layer_filter);
                    }
                }
            }
        }
    },

    updateSource: function () {
        if (!this._styleJSON) {
            return;
        }
        var source_type, url, filter, i;
        for (var source in this._styleJSON.sources) {
            if (!this._styleJSON.sources.hasOwnProperty(source)) {
                continue;
            }
            // Получение базово адреса источника данных
            source_type = this._styleJSON.sources[source].type;
            switch (source_type) {
                case 'geojson':
                    url = this._styleJSON.sources[source].data; //.split('?')[0];
                    if (url.indexOf('?') === -1) {
                        url += '?';
                    }
                    // if (this.filters.length >=0 ) {
                    //     url += '?';
                    // }

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
                    // this._styleJSON.sources[source].data = url + filter;
                    this.datalayer.map.MAPBOX.setSource(source, url + filter);
                    this.datalayer.map.fire('update-source', {map: this.datalayer.map, layer: this});
                    break;
            }
            // Добавление Mapbox-фильтра ко всем слоям в этом Datalayer не зависимо от источника
            for (var j = 0; j < this._styleJSON.layers.length; j++) {
                if (this._styleJSON.layers[j].source === source) {
                    if (!!this.mapbox_layer_filter) {
                        this._styleJSON.layers[j].filter = this.mapbox_layer_filter;
                        this.datalayer.map.MAPBOX.setFilter(this._styleJSON.layers[j].id, this.mapbox_layer_filter);
                    }
                }
            }
        }
    },

    reloadData: function () {
        if (!!this._styleJSON && this._styleJSON.hasOwnProperty('sources')) {
            this.datalayer.map.MAPBOX.reloadSource(this._styleJSON.sources);
        }
    },

    legend: function () {
        if (!this.datalayer.storage_id) {
            return;
        }
        var that = this;
        this.datalayer.map.ajax({
            verb: 'GET',
            uri: this._getLegendUrl(this.styleID),
            async: true,
            callback: function (response) {
                that.datalayer.map.ui.openPanel({data: {html: response}, className: 'dark'});
            }
        });
    }
});