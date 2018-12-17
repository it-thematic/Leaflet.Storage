L.S.Layer.Mapbox = L.S.Layer.Default.extend({
    _type: 'Mapbox',
    _styleJSON: null,
    filters: null,
    mapbox_layer_filters: null,
    default_filter: null,
    selectOptions: [["-1", '------']],

    // Таймаут для событий обновления слоя
    updateTimeout: null,

    _update: function () {
        this.updateSource();
    },

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
                    that.datalayer.map.get(that._getStyleUrl(style_id), {
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
                that.datalayer.map.MAPBOX.setStyle(that.changeStyle(that._styleJSON));
            }
        });

        this.on('remove', function (e) {
            if (this.styleID && this.styleID !== -1) {
                this.datalayer.map.MAPBOX.removeStyle(this._styleJSON);
            }
        }, this);

        this.on('layer.update', function () {
            if (!!that.updateTimeout) {
                clearTimeout(that.updateTimeout);
            }
            that.updateTimeout = setTimeout(function tick() {
                that._update();
                clearTimeout(that.updateTimeout);
            }, 500);
        }, this);

        // Подписка за завершение события перемещения карты
        this.datalayer.map.on('moveend', function (e) {
            that.fire('layer.update');
        });

        // Подписка за завершение события окончания изменения уровня отображения
        this.datalayer.map.on('zoomend', function (e) {
            that.fire('layer.update');
        });

        // Инициализация параметров для слоя, если они переданы
        if (this.datalayer.options.mapbox) {
            if (this.datalayer.options.mapbox.active) {
                this.datalayer.map.activeDataLayer = this.datalayer;
            }

            // ID стиля должен назначаться в последнюю очередь, т.к. раньше должно пройти применение всех фильтров
            if (this.datalayer.options.mapbox.hasOwnProperty('style')) {
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

                    if (this.datalayer.options.hasOwnProperty('mapbox')) {
                        // Добавление фильтра по умолчанию
                        if (!!this.datalayer.options.mapbox.default_filter) {
                            url += '&' + this.datalayer.options.mapbox.default_filter;
                        }

                        // Добавление фильтра по видимой области карты
                        if (!!this.datalayer.options.mapbox.in_bbox) {
                            url += '&in_bbox=' + this.datalayer.map.getBounds().toBBoxString();
                        }
                    }

                    // Добавление фильтра по уровню отображения
                    url += '&zoom=' + this.datalayer.map.getZoom();

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
                this.fire('layer.update');
                break;
            case 'active':
                this.datalayer.map.activeDatalaye = this.datalayer;
                break;
            case 'default_filter':
                this.fire('layer.update');
                break;
        }
        L.S.Layer.Default.prototype.postUpdate.call(this, field);
    },

    appendFilter: function (filter) {
        if (this.filters.indexOf(filter) !== -1) {
            return;
        }
        this.filters.push(filter);
        this.fire('layer.update');
    },

    removeFilter: function (filter) {
        var index = this.filters.indexOf(filter);
        if (index === -1) {
            return;
        }
        this.filters.splice(index, 1);
        this.fire('layer.update');
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
        this.fire('layer.update');
    },

    updateMapboxFilter: function (metadata_key, mapbox_layer_filter) {
        // filter: фильтр который принимает Mapbox
        if (!!mapbox_layer_filter) {
            this.mapbox_layer_filters[metadata_key] = mapbox_layer_filter;
        } else {
            delete this.mapbox_layer_filters[metadata_key];
        }
        this.fire('layer.update');
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

                    if (this.datalayer.options.hasOwnProperty('mapbox')) {
                        // Добавление фильтра по умолчанию
                        if (!!this.datalayer.options.mapbox.default_filter) {
                            url += '&' + this.datalayer.options.mapbox.default_filter;
                        }

                        // Добавление фильтра по видимой области карты
                        if (!!this.datalayer.options.mapbox.in_bbox) {
                            url += '&in_bbox=' + this.datalayer.map.getBounds().toBBoxString();
                        }
                    }

                    // Фильтр по уровню отображения используем всегда, но он не вынесен в свойства
                    url += '&zoom=' + this.datalayer.map.getZoom();

                    // Применение дополнительных фильтров
                    filter = '';
                    for (i = 0; i < this.filters.length; i++) {
                        filter += '&' + this.filters[i];
                    }
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