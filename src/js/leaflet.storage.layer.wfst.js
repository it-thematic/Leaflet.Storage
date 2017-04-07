L.S.Layer.WFST= L.WFST.extend({
    _type: 'WFST',

    includes: [L.S.Layer],

    initialize: function (datalayer) {
        this.datalayer = datalayer;

        var isValid = true;
        try {
            Object.defineProperty(this, 'isValid', {
                get: function () {
                    return isValid;
                },
                set: function (value) {
                    isValid = value;
                }
            });
        }
        catch (e) {
            // Certainly IE8, which has a limited version of defineProperty
        }

        var showExisting = false;
        try {
            Object.defineProperty(this, 'showExisting', {
                get: function () {
                    return showExisting;
                },
                set: function (value) {
                    showExisting = value;
                    this.options.showExisting = showExisting;
                    if (showExisting) {
                        this.loadFeatures(this.options.filter)
                        // var that = this;
                        // this.requestFeatures(this.options.filter, function(rt) {
                        //     var pd = JSON.parse(rt);
                        //     for (var i = 0; i < pd.features.length; i++) {
                        //         pd.features[i].state = 'exist';
                        //     }
                        //     that.datalayer.addData(pd);
                        //     that.datalayer.map.fitBounds(that.getBounds())
                        // })
                    }
                }
            })
        }
        catch (e) {

        }
        var options = {
            url: datalayer.options.remoteData.url_wfst,
            typeName: datalayer.options.laydescription,
            showExisting: this.showExisting,
            maxFeatures: 100,
            crs: L.CRS.EPSG4326,
            geometryField: 'geometry',
            style: {
                color: datalayer.getColor(),
                weight: 2
            }
        };

        // if (this.datalayer.options.remoteData.url) {
        //     if (this.datalayer.options.remoteData.url.match('/*\/{[xyz]}\/{[xyz]}\/{[xyz]}*')) {
        //         if (!this.datalayer._tilelay) {
        //             this.datalayer._tilelay = L.tileLayer(this.datalayer.options.remoteData.url, {attribution: '-'});
        //         }
        //     }
        // }

        L.WFST.prototype.initialize.call(this, options, new L.Format.GeoJSON(options)
        );

        var that = this;
        this.on('save:success', function() {
            if (that.datalayer._tilelay) {
                that.datalayer._tilelay.redraw();
            }
            that.fire('viewreset');
        });
        this.on('error', function(error) {
            that.isValid = false;
        });
    },

    postUpdate: function () {
        this.options.url = this.datalayer.options.remoteData.url_wfst;
        this.options.typeName = this.datalayer.options.laydescription;
        this.isValid = true;
        this.describeFeatureType();
        if (this.datalayer.options.remoteData.url) {
            if (this.datalayer.options.remoteData.url.match('/*\/{[xyz]}\/{[xyz]}\/{[xyz]}*')) {
                if (this.datalayer._tilelay) {
                    this.datalayer._tilelay.setUrl(this.datalayer.options.remoteData.url, false)
                }
                if (!this.datalayer._tilelay) {
                    this.datalayer._tilelay = L.tileLayer(this.datalayer.options.remoteData.url, {attribution: '-'});
                }
            }
        }
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
    },

    save: function(reload) {
        this.datalayer.eachLayer(function (layer) {
            if (!!layer.properties.id && layer.state == 'insert') {
                layer.state = 'update';
            }
        });
        L.WFST.prototype.save.call(this, reload);
    },

    removeLayer: function (layer) {
        if (!!layer.properties.id && layer.state === this.state.insert) {
            var form_url = this.datalayer._objectDeleteUrl(layer);
            if (!form_url) {
                return;
            }
            var that = this;
            this.datalayer.map.post(form_url, {
                data: '',
                callback: function (data) {
                    if (data.success) console.log(data)
                }
            })
        }
        L.WFST.prototype.removeLayer.call(this, layer);
    }
});
