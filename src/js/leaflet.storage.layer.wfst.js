L.S.Layer.WFSTLayer = L.WFST.extend({
    _type: 'WFST',
    _wfst: null,

    includes: [L.S.Layer],

    initialize: function (datalayer) {
        this.datalayer = datalayer;
        L.WFST.prototype.initialize.call(this, {
            typeName: datalayer.options.laydescription,
            showExisting: false,
            maxFeatures: 100,
            crs: L.CRS.EPSG4326,
            geometryField: 'geometry',
            style: {
              color: 'red',
              weight: 2
            }
        });
    },

    fetchRemoteData: function () {
        if (!this.isRemoteLayer()) return;
        var from = parseInt(this.options.remoteData.from, 10),
            to = parseInt(this.options.remoteData.to, 10);
        if ((!isNaN(from) && this.map.getZoom() < from) ||
            (!isNaN(to) && this.map.getZoom() > to)) {
            this.clear();
            return;
        }
        if (!this.options.remoteData.dynamic && this.hasDataLoaded()) return;
        if (!this.isVisible()) return;
        var self = this,
            url = this.map.localizeUrl(this.options.remoteData.url);
        if (this.options.remoteData.proxy) url = this.map.proxyUrl(url);

        if (!this._wfst) {
            this._wfst = L.wfst({
                url: this.options.remoteData.url,
                typeNS: '',
                typeName: this.options.laydescription,
                showExisting: !!this.options.displayOnLoad,
                maxFeatures: this.options.remoteData.to || 100,
                crs: L.CRS.EPSG4326,
                geometryField: 'geometry',
                style: {
                    color: 'red',
                    weight: 2
                }
            });
        }
        this._wfst.options.attribution = this.options.attribution || '-';
        if (this.map.hasLayer(this.layer)) {
            this.map.addLayer(this._wfst);
        }
        // TODO: фрагмент исходного DataLayer в котором происходит загрузка данных с удаленного сервера
        // this.map.ajax({
        //     uri: url,
        //     verb: 'GET',
        //     callback: function (raw) {
        //         self.clear();
        //         self.rawToGeoJSON(raw, self.options.remoteData.format, function (geojson) {self.fromGeoJSON(geojson);});
        //     }
        // });
    },

    fromUmapGeoJSON: function (geojson) {
    if (geojson._storage) {
        var st = geojson._storage;
        if (this.options.laydescription) st.laydescription = this.options.laydescription;
        if (this.options.wfst) st.wfst = this.options.wfst;
        this.setOptions(st);
    }
    if (this.isRemoteLayer()) this.fetchRemoteData();
    else this.fromGeoJSON(geojson);
    this._loaded = true;
    console.log('Datalayer fromUmapGeoJSON Mixin')
    },

    show: function() {
        if(!this.isLoaded()) this.fetchData();
        if (this._wfst){
            this.map.addLayer(this._wfst);
        }
        this.map.addLayer(this.layer);
        this.fire('show');
        console.log('WFST show Mixin')
    },

    hide: function() {
        if (this._wfst) {
            this.map.removeLayer(this._wfst);
        }
        this.map.removeLayer(this.layer);
        this.fire('hide');
        console.log('WFST hide Mixin')
        },

    save: function () {
        if (this.isDeleted) return this.saveDelete();
        if (!this.isLoaded()) {return;}
        var geojson = this.umapGeoJSON();
        var formData = new FormData();
        formData.append('name', this.options.name);
        formData.append('display_on_load', !!this.options.displayOnLoad);
        formData.append('rank', this.getRank());
        formData.append('wfst', this.options.wfst);
        // Filename support is shaky, don't do it for now.
        var blob = new Blob([JSON.stringify(geojson)], {type: 'application/json'});
        formData.append('geojson', blob);
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
            headers: {'If-Match': this._etag || ''}
        });
    }
});
