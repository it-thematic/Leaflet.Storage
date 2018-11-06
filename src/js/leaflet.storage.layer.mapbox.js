L.S.Layer.Mapbox = L.S.Layer.Default.extend({
    _type: 'Mapbox',
    _styleJSON: null,
    filters: null,
    mapbox_layer_filters: null,
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

    eachMapboxSource: function (method, context) {
        if (!this._styleJSON) {
            return this;
        }
        for (var source in this._styleJSON.sources) {
            if (this._styleJSON.sources.hasOwnProperty(source)) {
                method.call(context || this, source, this._styleJSON.sources[source]);
            }
        }
        return this;
    },

    eachMapboxLayer: function (method, context) {
        if (!this._styleJSON) {
            return this;
        }
        for (var i = 0; i < this._styleJSON.layers.length; i++) {
            method.call(context || this, this._styleJSON.layers[i].id, this._styleJSON.layers[i]);
        }
        return this;
    },

    initialize: function (datalayer) {
        L.S.Layer.Default.prototype.initialize.call(this, datalayer);
        var styleID = null;
        this.filters = [];
        this.mapbox_layer_filters = {};
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
                        context: this,
                        callback: that.onLoadStyle
                    });
                }
            });
        }
        catch (e) {
            // Certainly IE8, which has a limited version of defineProperty
        }

        this.on('add', function (e) {
            if (that.styleID && that.styleID !== -1) {
                if (!that._styleJSON) {
                    return;
                }
                that.datalayer.map.MAPBOX.setStyle(that._styleJSON);
                that.updateSource();
            }
        });

        this.on('remove', function (e) {
            if (this.styleID && this.styleID !== -1) {
                this.datalayer.map.MAPBOX.removeStyle(this._styleJSON);
            }
        }, this);

        // Подписка за завершение события перемещения карты
        this.datalayer.map.on('moveend', function (e) {
            that.updateBboxFilter(true);
        });

        // Подписка за завершение события окончания изменения уровня отображения
        this.datalayer.map.on('zoomend', function (e) {
            that.updateZoomFilter(that.datalayer.map.getZoom());
        }, this.datalayer.map);

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

    onLoadStyle: function(data, response) {
        // TODO: Эта функция срабатывает только после получения стиля с сервера по его ID
        this.datalayer.map.MAPBOX.removeStyle(this._styleJSON);
        if (data) {
            // После загрузки фильтра запоминаем его во внутреннее поле
            this._styleJSON = data;
            this.datalayer.map.MAPBOX.setStyle(this.changeStyle(this._styleJSON));
            // После того как стиль загрузился вызываем событие окончания загрузки стиля с сервера
            this.fire('styleloaded', this);
        }
    },

    changeStyle: function(style) {
        var type_, url, filter, i;
        var new_style = JSON.parse(JSON.stringify(style));
        // Изменение источников в Mapbox-стиле
        for (var source in new_style.sources) {
            if (!new_style.sources.hasOwnProperty(source)) {
                continue;
            }

            // Получение базового адреса источника данных
            type_ = new_style.sources[source].type;
            switch (type_) {
                case 'geojson':
                    url = new_style.sources[source].data;
                    if (url.indexOf('?') === -1) {
                        url += '?';
                    }

                    // Добавление фильтра по умолчанию
                    if (!!this.default_filter) {
                        url += '&' + this.default_filter;
                    }

                    // Добавление фильтра по видимой области карты
                    url += '&' + 'in_bbox=' + this.datalayer.map.getBounds().toBBoxString();

                    // Добавление фильтра по уровню отображения
                    url += '&' + 'zoom=' + this.datalayer.map.getZoom();

                    // Добавление остальных динамических фильтров
                    filter = '';
                    for (i = 0; i < this.filters.length; i++) {
                        filter += '&' + this.filters[i];
                    }
                    new_style.sources[source].data = url + filter;
                    break;
            }
        }

        // Изменение слоёв в Mapbox-стиле
        for (i = 0; i < new_style.layers.length; i++) {
            delete new_style.layers[i].filter;

            var metadatas = new_style.layers[i].metadata;
            if (!metadatas) {
                continue;
            }
            for (var metadata in metadatas) {
                if (!metadatas.hasOwnProperty(metadata)) {
                    continue;
                }
                var metadata_array = metadata.split(':');
                // Если это поле по которому фильтровать, то фильтруем иначе нет
                if (metadata_array[1] !== 'filter') {
                    continue;
                }
                for (var mapbox_filter in this.mapbox_layer_filters) {
                    if (!this.mapbox_layer_filters.hasOwnProperty(mapbox_filter)) {
                        continue;
                    }
                    if (metadata_array[2] !== mapbox_filter) {
                        continue;
                    }
                    if (!!this.datalayer.map.MAPBOX.hasLayer(this._styleJSON.layers[i].id)) {
                        new_style.layers[i].filter = this.mapbox_layer_filters[mapbox_filter];
                    }
                }
            }
        }
        return new_style;
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

    updateZoomFilter: function(value) {
        !!value ? this.zoom_filter = 'zoom=' + this.datalayer.map.getZoom() : null;
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
            var _ok = true;
            for (var i = 0; i < this.filters.length; i++) {
                var filter = this.filters[i];
                var arr_filter = filter.split('=');
                if (arr_filter[0] === key) {
                    _ok = false;
                    if (!!value) {
                        this.filters[i] = key + operation + value;
                    } else {
                        this.filters.splice(i, 1);
                    }
                    break;
                }
            }
            if ((_ok) && (!!value)) {
                this.filters.push(key + operation + value);
            }
        }
        this.updateSource();
    },

    updateMapboxFilter: function (metadata_key, mapbox_layer_filter) {
        // filter: фильтр который принимает Mapbox
        if (!!mapbox_layer_filter) {
            this.mapbox_layer_filters[metadata_key] = mapbox_layer_filter;
        } else {
            delete this.mapbox_layer_filters[metadata_key];
        }

        this.updateSource();
        // for (var i = 0; i < this._styleJSON.layers.length; i++) {
        //     var metadatas = this._styleJSON.layers[i].metadata;
        //     if (!metadatas) { continue; }
        //     for (var metadata in metadatas) {
        //         if (!metadatas.hasOwnProperty(metadata)) { continue; }
        //         var metadata_array = metadata.split(':');
        //         Если это поле по которому фильтровать, то фильтруем иначе нет
        // if (metadata_array[1] !== 'filter') { continue; }
        // if (metadata_array[2] === metadata_key) {
        //     if (!!this.datalayer.map.MAPBOX.hasLayer(this._styleJSON.layers[i].id)) {
        //         this._styleJSON.layers[i].filter = this.mapbox_layer_filter;
        //         this.datalayer.map.MAPBOX.setFilter(this._styleJSON.layers[i].id, this.mapbox_layer_filter);
        //     }
        // }
        // }
        // }
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

                    if (!!this.zoom_filter) {
                        url += '&' + this.zoom_filter;
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
        }

        for (i = 0; i < this._styleJSON.layers.length; i++) {
            delete this._styleJSON.layers[i].filter;
            if (this.datalayer.map.MAPBOX.hasLayer(this._styleJSON.layers[i].id)) {
                this.datalayer.map.MAPBOX.setFilter(this._styleJSON.layers[i].id, undefined);
            }
            var metadatas = this._styleJSON.layers[i].metadata;
            if (!metadatas) {
                continue;
            }
            for (var metadata in metadatas) {
                if (!metadatas.hasOwnProperty(metadata)) {
                    continue;
                }
                var metadata_array = metadata.split(':');
                // Если это поле по которому фильтровать, то фильтруем иначе нет
                if (metadata_array[1] !== 'filter') {
                    continue;
                }
                for (var mapbox_filter in this.mapbox_layer_filters) {
                    if (!this.mapbox_layer_filters.hasOwnProperty(mapbox_filter)) {
                        continue;
                    }
                    if (metadata_array[2] === mapbox_filter) {
                        if (!!this.datalayer.map.MAPBOX.hasLayer(this._styleJSON.layers[i].id)) {
                            this._styleJSON.layers[i].filter = this.mapbox_layer_filters[mapbox_filter];
                            this.datalayer.map.MAPBOX.setFilter(this._styleJSON.layers[i].id, this.mapbox_layer_filters[mapbox_filter]);
                        }
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