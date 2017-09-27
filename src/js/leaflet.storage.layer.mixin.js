DataLayerMixin = {
    _tilelay: null,
    _vectorStyle: null,
    // Список значений для элемента select выбора доступных стилей
    _styleSelect: [["-1", '------']],

    _getStyleSelect: function (id) {
        if (!id) { return; }
        var _template = L.Util.template('/datalayer/{layer_id}/styles', {layer_id: id});
        this.map.get(_template, {
            async: false,
            callback: (response) => {
                if (response.data.length) {
                    this._styleSelect = this._styleSelect.concat(response.data);
                    if (this._styleSelect.length) {
                        if (this.isRemoteLayer() && this.options.remoteData.style_id) {
                            this.vectorStyleID = this.options.remoteData.style_id;
                        } else {
                            this.vectorStyleID = this._styleSelect[0][0];
                        }
                    }
                }
            }
        });
    },

    _objectUrl: function(e, layer){
        var template = './api_identify?lat={lat}&lng={lng}&f=json&lay={lay}';
        return L.Util.template(template, {'lat': e.latlng.lat, 'lng': e.latlng.lng, 'lay': layer})
    },

    _importUrl: function () {
        var template = './api_import';
        return L.Util.template(template, {});
    },

    _changeFormat: function (format) {
        // Удаление таловой подложки
        if (this._tilelay) {
            if (this.map.hasLayer(this.layer)) {
                this.map.removeLayer(this._tilelay);
            }
        }

        delete this._tilelay;

        if (this._vectorStyle) {
            this.map.vl.removeStyle(this._vectorStyle);
        }

        switch (format) {
            case "osm":
                this._tilelay = L.tileLayer(this.options.remoteData.url, {attribution: '-', zIndex: 0});
                if (this.map.hasLayer(this.layer)) { this.map.addLayer(this._tilelay); }
                break;

            case "pbf":
                if (this._vectorStyle) {
                    if (this.map.hasLayer(this.layer)) {
                        this.map.vl.setStyle(this._vectorStyle);
                    }
                }
        }
    },

    _changeURL: function (url) {
        if ((typeof url !== "string") || (!this._tilelay)) { return; }

        if (url.match('(\/{[xyz]})(\/{[xyz]})(\/{[xyz]})(\.(png|jpg))+$')) {
            this._tilelay.setUrl(url);
        }
    },

    _createBackground: function (format) {
        switch (format) {
            case 'osm':
                if (this._tilelay) {
                    if (this.map.hasLayer(this.layer)) {
                        this.map.removeLayer(this._tilelay);
                    }
                }
                delete this._tilelay;
                this._tilelay = L.tileLayer(this.options.remoteData.url, {attribution: '-', zIndex: 0});
                if (this.map.hasLayer(this.layer)) { this.map.addLayer(this._tilelay); }
                break;

            case 'pbf':
                // Если стиль ещё не скачан
                if (!this._vectorStyle) {
                    // И не выбран стиль для отображения
                    if (!this.vectorStyleID) {
                        // И не назначен слить по умолчанию в настройках слоя
                        if (!this.options.remoteData.style_id) {
                            // То выходим
                            return;
                        } else {
                            // А если назначен по умолчанию, то выбираем его для отображения
                            this.vectorStyleID = this.options.remoteData.style_id;
                        }
                    }

                    // Запрашиваем стиль с сервера
                    this.map.get(L.Util.template('/styles/{style_id}/', {style_id: this.vectorStyleID}), {
                        callback: (data) => {
                            // Кэшируем стиль чтобы не запрашивать потом повторно
                            this._vectorStyle = data;
                            // Назначаем стиль (смешивание стилей разрешено по умолчанию
                            // т.к. у может быть включено несколько растровых основ
                            // Если слой уже отображен на карте, то добавляем и его для отображения
                            if (this.map.hasLayer(this.layer)) { this.map.vl.setStyle(this._vectorStyle); }
                        }
                    });
                } else {
                    // А если стиль уже закэширован, то назначаем его в слой
                    // Если слой уже отображен на карте, то добавляем и его для отображения
                    if (this.map.hasLayer(this.layer)) { this.map.vl.setStyle(this._vectorStyle); }
                }
            break;
        }
    },

    _changeBakcground: function (vectorStyle) {
        if (this._vectorStyle) {
            this.map.vl.removeStyle(this._vectorStyle);
        }

        if (vectorStyle) {
            this.map.vl.setStyle(vectorStyle);
        }
    },

    _hideBackground: function () {
        // Удаление тайловой подложки
        if (this._tilelay) {
            this.map.removeLayer(this._tilelay);
        }

        // Удаление векторной подложки
        if (this.isRemoteLayer() && this.options.remoteData.format === 'pbf') {
            if (this._vectorStyle) {
                this.map.vl.removeStyle(this._vectorStyle);
            }
        }
    },

    _showBackground: function () {
        // Отображение тайловой подложки
        if (this._tilelay) {
            if (this.map.hasLayer(this.layer) && !this.map.hasLayer(this._tilelay)) {
                this.map.addLayer(this._tilelay);
            }
        }

        // Отображение векторной подложки
        if (this.isRemoteLayer() && this.options.remoteData.format === 'pbf') {
            if (this._vectorStyle) {
                this.map.vl.setStyle(this._vectorStyle);
            }
        }
    },

    getLocalId: function () {
        return this.storage_id || 'tmp' + L.Util.stamp(this);
    },

    isWFSTLayer: function () {
        return this.options.type === 'WFST';
    },

    featuresToRemoteData: function () {
        if (!this.isRemoteLayer()) return [];
        if (!this.isWFSTLayer()) return [];
        if (this.options.type === 'WFST') this.layer.save();
        return [];
    },

    cancelLayer: function (feature) {
        var id = L.stamp(feature);
        feature.disconnectFromDataLayer(this);
        this._index.splice(this._index.indexOf(id), 1);
        delete this._layers[id];
        this.layer.cancelLayer(feature);
        if (this.hasDataLoaded()) this.fire('datachanged');
    },

    allowEdit: function () {
        return !this.isRemoteLayer() ||
            (this._vectorStyle && this.map.vl.hasStyle(this._vectorStyle)) ||
            (this.isRemoteLayer() && this.isWFSTLayer() && this.layer.isValid);
    },

    cancel: function() {
        if (this.isWFSTLayer()) {
            this.eachLayer(function (layer) {
                this.layer.removeLayer(layer)
            });
        }
        this.reset();
    }
};

L.Storage.DataLayer.include(DataLayerMixin);

L.Storage.DataLayer.addInitHook(function(){

    
    var vectorStyleID = null;
   
    try {
        Object.defineProperty(this, 'vectorStyleID', {
            get: function () {
                return vectorStyleID;
            },
            set: function (style_id) {
                if (Number(style_id) === -1) return;
                if (vectorStyleID === style_id) return;
                vectorStyleID  = style_id;
                if (!this.isRemoteLayer()) return;
                if (this.options.remoteData.format !== 'pbf') return;
    
                let _template = L.Util.template('/styles/{style_id}/', {style_id: style_id});
                this.map.get(_template,{
                    callback: (response) => {
                        if (response) {
                            this._changeBakcground(response);
                            this._vectorStyle = response;
                        }
                    }
                });
            }
        });
    }
    catch (e) {
        // Certainly IE8, which has a limited version of defineProperty
    }
    this._getStyleSelect(this.storage_id);
});

L.Storage.DataLayer.prototype.umapGeoJSON = function () {
    return {
        type: 'FeatureCollection',
        features: this.isRemoteLayer() ? this.featuresToRemoteData() : this.featuresToGeoJSON(),
        _storage: this.options
    };
};

L.Storage.DataLayer.prototype.fetchRemoteData = function () {
    if (!this.isRemoteLayer()) return;
    var from = parseInt(this.options.remoteData.from, 10),
        to = parseInt(this.options.remoteData.to, 10);
    if ((!isNaN(from) && this.map.getZoom() < from) ||
        (!isNaN(to) && this.map.getZoom() > to) ) {
        this.clear();
        return;
    }
    if (!this.options.remoteData.dynamic && this.hasDataLoaded()) return;
    if (!this.isVisible()) return;
    var self = this,
        url = this.map.localizeUrl(this.options.remoteData.url);
    if (this.options.remoteData.proxy) url = this.map.proxyUrl(url);

    this._createBackground(this.options.remoteData.format);
};

L.Storage.DataLayer.prototype.show = function() {
    if(!this.isLoaded()) this.fetchData();
    this.map.addLayer(this.layer);
    this._showBackground();
    this.fire('show');
};

L.Storage.DataLayer.prototype.hide = function() {
    this._hideBackground();
    this.map.removeLayer(this.layer);
    this.fire('hide');
};

L.Storage.DataLayer.prototype.fromUmapGeoJSON = function (geojson) {
    if (geojson._storage) {
        var st = geojson._storage;
        if (this.options.laydescription) st.laydescription = this.options.laydescription;
        // TODO: сохранение id стиля для отображения векторных тайлов.
        // Если слой не локальный, то после загрузки параметров из базы грузятся параметры из json-файла
        // и полностью перетирают старые параметры. А id стиля грузится из базы
        if (this.options.style_id) st.style_id = this.options.style_id;
        this.setOptions(st);
    }
    if (this.isRemoteLayer()) this.fetchRemoteData();
    else this.fromGeoJSON(geojson);
    this._loaded = true;
};

L.Storage.DataLayer.prototype.getHidableClass = function () {
    return 'show_with_datalayer_' + this.getLocalId();
};

L.Storage.DataLayer.prototype.save = function () {
    if (this.isDeleted) return this.saveDelete();
    if (!this.isLoaded()) {return;}
    var geojson = this.umapGeoJSON();
    var formData = new FormData();
    formData.append('name', this.options.name);
    formData.append('description', this.options.laydescription);
    formData.append('display_on_load', !!this.options.displayOnLoad);
    formData.append('rank', this.getRank());
    // Filename support is shaky, don't do it for now.
    var blob = new Blob([JSON.stringify(geojson)], {type: 'application/json'});
    formData.append('geojson', blob);
    var that = this;
    this.map.post(this.getSaveUrl(), {
        data: formData,
        callback: function (data, response) {
            this._geojson = geojson;
            this._etag = response.getResponseHeader('ETag');
            this.setStorageId(data.id);
            this.updateOptions(data);
            this.backupOptions();
            this.connectToMap();
            this._loaded = true;
            this.redraw();  // Needed for reordering features
            this.isDirty = false;
            this.map.continueSaving();
        },
        context: this,
        headers: {'If-Match': this._etag || ''}
    });
};

// L.Storage.DataLayer.prototype.importFromFile = function (f, type, clear) {
//     var reader = new FileReader(),
//         that = this;
//     var type = type || L.Util.detectFileType(f);
//     reader.onload = function (e) {
//         var rawData = e.target.result;
//         var formData = new FormData();
//         formData.append('layer', that.options.laydescription);
//         formData.append('data', rawData);
//         formData.append('clear', !!clear);
//         formData.append('type', type);
//         that.map.post(that._importUrl(), {
//             data: formData,
//             responseType: 'Blob',
//
//             callback: function (data, response) {
//                 if (data.status !== 'success') {
//                     this.map.ui.alert({content: data.note, level: 'error', duration: 30000});
//                 } else {
//                     that.isDirty = true;
//                     that.zoomTo();
//                     if (data.note) {
//                         this.map.ui.alert({content: data.note, level: 'info', duration: 30000});
//                     }
//                 }
//             },
//             context: that
//         });
//     };
//     reader.readAsText(f);
// };

L.Storage.DataLayer.prototype.importFromFile = function (f, type, clear) {
    var reader = new FileReader(),
        that = this;
    var type = type || L.Util.detectFileType(f);
    reader.onload = function (e) {

        var hex = function(arrayBuffer) {
            var i, x, hex_tab = "0123456789abcdef",
              res = [],
              binarray = new Uint8Array(arrayBuffer);
            for (i = 0; i < binarray.length; i++) {
              x = binarray[i];
              res[i] = hex_tab.charAt((x >> 4) & 0xF) +
                hex_tab.charAt((x >> 0) & 0xF);
            }
            return res.join('');
          };

        var arr = new Uint8Array(e.target.result);
        var rawData = hex(arr)
        var formData = new FormData();
        formData.append('layer', that.options.laydescription);
        formData.append('data', rawData);
        formData.append('clear', !!clear);
        formData.append('type', type);
        that.map.post(that._importUrl(), {
            data: formData,
            callback: function (data, response) {
                if (data.status !== 'success') {
                    this.map.ui.alert({content: data.note, level: 'error', duration: 30000});
                } else {
                    if (that.isWFSTLayer()) { that.isDirty = true; }
                    that.zoomTo();
                    if (data.note) {
                        this.map.ui.alert({content: data.note, level: 'info', duration: 30000});
                    }
                }
            },
            context: that
        });
    };
    reader.readAsArrayBuffer(f);
};


L.Storage.Map.prototype.selectTileLayer = function (tilelayer) {
    //--forest
    if (tilelayer === this.selected_tilelayer) {return;}
    // if (this.tilelayers_showing.indexOf(tilelayer)!=-1) {
    //     this.tilelayers_showing.pop(tilelayer);
    //     //this.fire('baselayerchange', {layer: tilelayer});
    //     this.removeLayer(tilelayer);
    //     return;
    // };
    //forest--


    try {
        this.addLayer(tilelayer);
        this.fire('baselayerchange', {layer: tilelayer});
        //--forest
        tilelayer.bringToBack();
        //this.tilelayers_showing.push(tilelayer);
        if (this.selected_tilelayer) {
            this.removeLayer(this.selected_tilelayer);
        }
        //forest--
        this.selected_tilelayer = tilelayer;
        if (!isNaN(this.selected_tilelayer.options.minZoom) && this.getZoom() < this.selected_tilelayer.options.minZoom) {
            this.setZoom(this.selected_tilelayer.options.minZoom);
        }
        if (!isNaN(this.selected_tilelayer.options.maxZoom) && this.getZoom() > this.selected_tilelayer.options.maxZoom) {
            this.setZoom(this.selected_tilelayer.options.maxZoom);
        }
    } catch (e) {
        this.removeLayer(tilelayer);
        this.ui.alert({content: L._('Error in the tilelayer URL') + ': ' + tilelayer._url, level: 'error'});
        // Users can put tilelayer URLs by hand, and if they add wrong {variable},
        // Leaflet throw an error, and then the map is no more editable
    }
};