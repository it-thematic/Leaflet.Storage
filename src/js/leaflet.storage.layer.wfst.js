L.S.Layer.WFST= L.WFST.extend({
    _type: 'WFST',

    includes: [L.S.Layer],

    initialize: function (datalayer) {
        this.datalayer = datalayer;
        L.WFST.prototype.initialize.call(this,
        {
            url: datalayer.options.remoteData.url_wfst,
            typeName: datalayer.options.laydescription,
            showExisting: false,
            maxFeatures: 100,
            crs: L.CRS.EPSG4326,
            geometryField: 'geometry',
            style: {
                color: 'red',
                weight: 2
            }
        }, new L.Format.GeoJSON({crs: L.CRS.EPSG4326, geometryField: 'geometry'})
        )},
    addLayer: function (layer) {
        L.FeatureGroup.prototype.addLayer.call(this, layer);

        if (layer.options.geojson){
          layer.feature = layer.options.geojson;
          layer.state = layer.options.geojson.state
        }
        if (!layer.feature) {
          layer.feature = {properties: {}};
        }

        if (!layer.state) {
          layer.state = this.state.insert;
          var id = this.getLayerId(layer);
          this.changes[id] = layer;
        }
        return this;
    }
});
