DataLayerMixin = {
    _tilelay: null,

    getLocalId: function () {
        return this.storage_id || 'tmp' + L.Util.stamp(this);
    },

    isWFSTLayer: function () {
        return this.isRemoteLayer() && this.options.remoteData.wfst;
    }
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

    this._tilelay = new L.TileLayer(this.options.remoteData.url);
    this._tilelay.options.attribution = '-';
    if (this.map.hasLayer(this.layer)){
        this.map.addLayer(this._tilelay)
    }
    var that = this;

    if (this.options.remoteData.wfst) {
        if (!this._loaded) {
            this.layer.once('load', function (responce) {
                that.clear();
                that.addData(JSON.parse(responce.responseText));
                console.log(that.layer.getBounds().toBBoxString());
            });
        this.layer.requestFeatures(undefined,function(rt) {
                var pd = JSON.parse(rt);
                for (var i = 0; i < pd.features.length; i++) {
                    pd.features[i].state = 'exist';
                }
                that.addData(pd);
            }
        );
        }
    }
    console.log('DataLayer fetchRemoteData Mixin')
};

L.Storage.DataLayer.prototype.show = function() {
    if(!this.isLoaded()) this.fetchData();
    if (this._tilelay){
          this.map.addLayer(this._tilelay);
    }
    this.map.addLayer(this.layer);
    this.fire('show');
    console.log('Datalayer show Mixin')
    };

L.Storage.DataLayer.prototype.hide = function() {
    if (this._tilelay) {
        this.map.removeLayer(this._tilelay);
    }
    this.map.removeLayer(this.layer);
    this.fire('hide');
    console.log('Datalayer hide Mixin')
    };

L.Storage.DataLayer.prototype.fromUmapGeoJSON = function (geojson) {
    if (geojson._storage) {
        var st = geojson._storage;
        if (this.options.laydescription) st.laydescription = this.options.laydescription;
        this.setOptions(st);
    }
    if (this.isRemoteLayer()) this.fetchRemoteData();
    else this.fromGeoJSON(geojson);
    this._loaded = true;
    console.log('Datalayer fromUmapGeoJSON Mixin')
};

L.Storage.DataLayer.prototype.getHidableClass = function () {
    return 'show_with_datalayer_' + this.getLocalId();
};

L.Storage.DataLayer.include(DataLayerMixin);


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