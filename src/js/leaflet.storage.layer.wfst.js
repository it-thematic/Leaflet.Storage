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
        );
        var that = this;
        this.on('save:success', function() {
            that.datalayer.clear();
            that.fire('viewreset');
        })
    },

    searchLayer: function (e) {
        this.datalayer.map.get(this.datalayer._objectUrl(e, this.datalayer.options.laydescription), {
            callback: function (data, response) {
                var id = data.id;
                if (!id) return;
                var filter_id = new L.Filter.GmlObjectID();
                filter_id.append(id);
                var that = this;
                this.requestFeatures(filter_id,function(rt) {
                    var pd = JSON.parse(rt);
                    for (var i = 0; i < pd.features.length; i++) {
                        pd.features[i].state = 'exist';
                    }
                    that.datalayer.addData(pd);
                    that.datalayer.map.fitBounds(that.getBounds())
                })},
            context: this
        });
    },

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
