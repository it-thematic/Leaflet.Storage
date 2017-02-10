DataLayerMixin = {
    _tilelay: null
};

L.Storage.DataLayer.prototype.fetchRemoteData = function () {
    var from = parseInt(this.options.remoteData.from, 10),
        to = parseInt(this.options.remoteData.to, 10);
    if ((!isNaN(from) && this.map.getZoom() < from) ||
        (!isNaN(to) && this.map.getZoom() > to) ) {
        this.clear();
        return;
    }
    var self = this,
        url = this.map.localizeUrl(this.options.remoteData.url);
    if (this.options.remoteData.proxy) url = this.map.proxyUrl(url);

    this._tilelay = new L.TileLayer(this.options.remoteData.url);
    this._tilelay.options.attribution = '-';
    if (this.map.hasLayer(this.layer)){
        this.map.addLayer(this._tilelay);
    }
    console.log('Datalayer fetchRemoteData Mixin')
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

L.Storage.DataLayer.include(DataLayerMixin);