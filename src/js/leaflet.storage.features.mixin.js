L.Storage.FeatureForestMixin = {
    confirmCancel: function () {
        if (confirm(L._('Are you sure you want to cancel your changes in this feature?'))) {
            this.cancel();
            return true;
        }
        return false;
    },

    cancel: function() {
        this.isDirty = false;
        this.map.closePopup();
        if (this.datalayer) {
            this.datalayer.cancelLayer(this);
            this.disconnectFromDataLayer(this.datalayer);
        }
    },

    _onPropertySave: function(e) {
        if ('id' in this.options) {
            this.options['id'] = e.target.id
        }
        if (this.state && this.state === '')
        L.DomEvent.stop(e);
    },

    getActionUrl: function (feature) {
        if (!feature.properties.id || !feature.state) { return; }
        if (feature.state === 'insert') {
            template = '/row_create/{layer}/';
        } else {
            template = '/row_edit/{layer}/{id}/';
        }
        return L.Util.template(template, {'layer': feature.datalayer.options.laydescription, 'id': feature.properties.id})
    },

    edit: function (e) {
        if(this.map.editEnabled) {
            if (!this.editEnabled()) this.enableEdit();
            if (this.datalayer.isWFSTLayer()) {
                this.datalayer.layer.editLayer(this);
            }

            if (!this.map.editEnabled || this.isReadOnly()) {
                return;
            }
            var form_url = this.getActionUrl(this);
            if (!form_url) {
                return;
            }

            var that = this;
            this.map.ajax({
                verb: 'GET',
                uri: form_url,
                callback: function (data, response) {
                    var container = L.DomUtil.create('div');
                    L.DomUtil.addClass(container, 'storage-edit-container');
                    var cancel = L.DomUtil.get('cancel');
                    container.innerHTML = data;
                    that.map.ui.openPanel({data: {html: container}, className: 'dark'});
                    that.map.editedFeature = that;
                    if (!that.isOnScreen()) that.bringToCenter(e);
                }
            })
        }
    },

    isReadOnly: function () {
        return this.datalayer && this.datalayer.isRemoteLayer() && !this.datalayer.isWFSTLayer();
    },
};


L.Storage.Marker.include(L.Storage.FeatureForestMixin);
L.Storage.Polyline.include(L.Storage.FeatureForestMixin);
L.Storage.Polygon.include(L.Storage.FeatureForestMixin);
