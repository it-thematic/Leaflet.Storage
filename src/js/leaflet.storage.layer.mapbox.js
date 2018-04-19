L.S.Layer.Mapbox = L.S.Layer.Default.extend({
    _type: 'Mapbox',
    _styleJSON: null,
    selectOptions: [["-1", '------']],

    _getStylesUrl: function() {
        var template = '/styles/datalayer/{id}/styles';
        return L.Util.template(template, {id: this.datalayer.storage_id});
    },

    _getStyleUrl: function (id) {
        var template = '/styles/datalayer/{storage_id}/styles/{id}';
        return L.Util.template(template, {storage_id: this.datalayer.storage_id, id: id});
    },

    _getStyle: function (id) {
        if (!this.datalayer.storage_id) { return; }
        var that = this;
        this.datalayer.map.get(this._getStylesUrl(), {
            async: false,
            callback: function(response) {
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

        try {
            Object.defineProperty(this, 'styleID', {
                get: function () {
                    return styleID;
                },
                set: function (style_id) {
                    if (Number(style_id) === -1) return;
                    if (styleID === style_id) return;
                    styleID  = style_id;

                    var that = this;
                    this.datalayer.map.get(this._getStyleUrl(style_id), {
                        callback: function(response) {
                            that.datalayer.map.vl.removeStyle(that._styleJSON);
                            if (response) {
                                that._styleJSON = response;
                                that.datalayer.map.vl.setStyle(response);
                            }
                        }
                    });
                }
            });
        }
        catch (e) {
            // Certainly IE8, which has a limited version of defineProperty
        }

        this.on('add', function (e) {
            if (this.styleID && this.styleID !== -1) {
                this.datalayer.map.vl.setStyle(this._styleJSON);
            }
        }, this);

        this.on('remove', function (e) {
            if (this.styleID && this.styleID !== -1) {
                this.datalayer.map.vl.removeStyle(this._styleJSON);
            }
        }, this);
        if (this.datalayer.options.mapbox && this.datalayer.options.mapbox.style) {
            this.styleID = this.datalayer.options.mapbox.style;
        }
        this._getStyle(this.datalayer.storage_id);
    },

    getEditableOptions: function () {
        if (!L.Util.isObject(this.datalayer.options.mapbox)) {
            this.datalayer.options.mapbox = {};
        }
        var that = this;
        return [
            ['options.mapbox.style', {
                handler: 'Select',
                label: L._('Default style'),
                selectOptions: this.selectOptions,
                callback: function (field) {
                    that.styleID = field.helper.value();
                }
            }]
        ];
    }    
});