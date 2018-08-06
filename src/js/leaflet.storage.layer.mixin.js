DataLayerMixin = {
    wfs_options: {
        crs: L.CRS.EPSG4326,
        showExisting: false,
        geometryField: 'geometry'
    },

    getLocalId: function () {
        return this.storage_id || 'tmp' + L.Util.stamp(this);
    },

    setWFSOptions: function (options) {
        if (this._wfs) {
            delete this._wfs;
        }
        L.Util.extend(this.wfs_options, options);
        this._wfs = L.wfs(
            this.wfs_options,
            new L.Format.GeoJSON({
            crs: L.CRS.EPSG4326,
            geometryField: 'geometry'
        })
        );
        this._wfs.on('load', function (response) {
            this.geojsonToFeatures(JSON.parse(response.responseText));
            this.eachFeature(function (feature) {
                feature.view();
            }, this);
        }, this);
    },

    showLegend: function () {
        if (this.layer._type !== 'Mapbox') { return; }
        this.layer.legend();

    }
};

L.Storage.DataLayer.addInitHook(function () {
    this.map.on('edit:enabled', function (e) {
        if (this._wfs) {
            this.clear();
        }
    }, this);
});

L.Storage.DataLayer.include(DataLayerMixin);

L.Storage.DataLayer.prototype.fromUmapGeoJSON = function (geojson) {
    if (geojson._storage) {
        var st = geojson._storage;
        if (this.options.laydescription) st.laydescription = this.options.laydescription;
        if (st.wfs) {
            this.setWFSOptions(st.wfs);
        }
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

L.Storage.DataLayer.prototype.edit = function () {
    if(!this.map.editEnabled || !this.isLoaded()) {return;}
    var container = L.DomUtil.create('div'),
        metadataFields = [
            'options.name',
            'options.description',
            ['options.type', {handler: 'LayerTypeChooser', label: L._('Type of layer')}],
            ['options.displayOnLoad', {label: L._('Display on load'), handler: 'Switch'}],
            ['options.browsable', {label: L._('Data is browsable'), handler: 'Switch', helpEntries: 'browsable'}]
        ];
    var title = L.DomUtil.add('h3', '', container, L._('Layer properties'));
    var builder = new L.S.FormBuilder(this, metadataFields, {
        callback: function (e) {
            this.map.updateDatalayersControl();
            if (e.helper.field === 'options.type') {
                this.resetLayer();
                this.edit();
            }
        }
    });
    container.appendChild(builder.build());

    var shapeOptions = [];
    if (this.layer._type !== 'Mapbox') {
        shapeOptions = shapeOptions.concat([
            'options.color',
            'options.iconClass',
            'options.iconUrl',
            'options.opacity',
            'options.stroke',
            'options.weight',
            'options.fill',
            'options.fillColor',
            'options.fillOpacity',
        ]);
    }

    shapeOptions = shapeOptions.concat(this.layer.getEditableOptions());

    var redrawCallback = function (field) {
        this.hide();
        this.layer.postUpdate(field);
        this.show();
    };

    builder = new L.S.FormBuilder(this, shapeOptions, {
        id: 'datalayer-shape-properties',
        callback: redrawCallback
    });
    var shapeProperties = L.DomUtil.createFieldset(container, L._('Shape properties'));
    shapeProperties.appendChild(builder.build());

    var optionsFields = [
        'options.smoothFactor',
        'options.dashArray',
        'options.zoomTo',
        'options.labelKey'
    ];

    builder = new L.S.FormBuilder(this, optionsFields, {
        id: 'datalayer-advanced-properties',
        callback: redrawCallback
    });
    var advancedProperties = L.DomUtil.createFieldset(container, L._('Advanced properties'));
    advancedProperties.appendChild(builder.build());

    var popupFields = [
        'options.popupTemplate',
        'options.popupContentTemplate',
        'options.showLabel',
        'options.labelDirection',
        'options.labelHover',
        'options.labelInteractive',
    ];
    builder = new L.S.FormBuilder(this, popupFields, {callback: redrawCallback});
    var popupFieldset = L.DomUtil.createFieldset(container, L._('Interaction options'));
    popupFieldset.appendChild(builder.build());

    if (!L.Util.isObject(this.options.remoteData)) {
        this.options.remoteData = {};
    }
    var remoteDataFields = [
        ['options.remoteData.url', {handler: 'Url', label: L._('Url'), helpEntries: 'formatURL'}],
        ['options.remoteData.format', {handler: 'DataFormat', label: L._('Format')}],
        ['options.remoteData.from', {label: L._('From zoom'), helpText: L._('Optionnal.')}],
        ['options.remoteData.to', {label: L._('To zoom'), helpText: L._('Optionnal.')}],
        ['options.remoteData.dynamic', {handler: 'Switch', label: L._('Dynamic'), helpEntries: 'dynamicRemoteData'}],
        ['options.remoteData.licence', {label: L._('Licence'), helpText: L._('Please be sure the licence is compliant with your use.')}]
    ];
    if (this.map.options.urls.ajax_proxy) {
        remoteDataFields.push(['options.remoteData.proxy', {handler: 'Switch', label: L._('Proxy request'), helpEntries: 'proxyRemoteData'}]);
    }

    var remoteDataContainer = L.DomUtil.createFieldset(container, L._('Remote data'));
    builder = new L.S.FormBuilder(this, remoteDataFields);
    remoteDataContainer.appendChild(builder.build());

    // параметры подключения WFS(-T)
    if (!L.Util.isObject(this.options.wfs)) {
        this.options.wfs = {};
    }
    var wfstFields = [
        ['options.wfs.url', {handler: 'Url', label: L._('Url'), helpEntries: 'formatURL'}],
        ['options.wfs.typeName', {label: L._('Layer')}]
    ];
    var wfsContainer = L.DomUtil.createFieldset(container, L._('WFS Data'));
    builder = new L.S.FormBuilder(this, wfstFields);
    wfsContainer.appendChild(builder.build());


    if (this.map.options.urls.datalayer_versions) this.buildVersionsFieldset(container);

    var advancedActions = L.DomUtil.createFieldset(container, L._('Advanced actions'));
    var advancedButtons = L.DomUtil.create('div', 'button-bar', advancedActions);
    var deleteLink = L.DomUtil.create('a', 'button third delete_datalayer_button storage-delete', advancedButtons);
    deleteLink.innerHTML = L._('Delete');
    deleteLink.href = '#';
    L.DomEvent.on(deleteLink, 'click', L.DomEvent.stop)
              .on(deleteLink, 'click', function () {
                this._delete();
                this.map.ui.closePanel();
            }, this);
    if (!this.isRemoteLayer()) {
        var emptyLink = L.DomUtil.create('a', 'button third storage-empty', advancedButtons);
        emptyLink.innerHTML = L._('Empty');
        emptyLink.href = '#';
        L.DomEvent.on(emptyLink, 'click', L.DomEvent.stop)
                  .on(emptyLink, 'click', this.empty, this);
    }
    var cloneLink = L.DomUtil.create('a', 'button third storage-clone', advancedButtons);
    cloneLink.innerHTML = L._('Clone');
    cloneLink.href = '#';
    L.DomEvent.on(cloneLink, 'click', L.DomEvent.stop)
              .on(cloneLink, 'click', function () {
                var datalayer = this.clone();
                datalayer.edit();
            }, this);
    this.map.ui.openPanel({data: {html: container}, className: 'dark'});
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