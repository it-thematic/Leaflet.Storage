L.Storage.FeatureForestMixin = {
    confirmCancel: function () {
        if (confirm(L._('Are you sure you want to cancel your changes in this feature?'))) {
            this.cancel();
            return true;
        }
        return false;
    },

    cancel: function() {
        // TODO: forest убрал изменение свойства isDirty, т.к. при его смене на False меняется аналогичное свойство и у
        // DataLayer
        // this.isDirty = false;
        this.map.closePopup();
        if (this.datalayer) {
            this.datalayer.cancelLayer(this);
            this.disconnectFromDataLayer(this.datalayer);
        }
    },

    _onPropertySave: function(e) {
        if (this.datalayer.isWFSTLayer() && this.state != 'update') {
            this.properties.id = e.id;
            this.feature.properties.id = e.id;
            // TODO: для Filter GMLObjectID при записи транзакции, но не обязательно
            this.feature.id = this.datalayer.options.laydescription + '.' + e.id;
        }
    },

    getActionUrl: function (feature) {
        if (!this.datalayer.isWFSTLayer()) { return; }
        var template,
            url;
        if (!!feature.properties.id) {
            template = '/row_edit/{layer}/{id}/';
            url = L.Util.template(template, {'layer': feature.datalayer.options.laydescription, 'id': feature.properties.id})
        } else {
            template = '/row_create/{layer}/';
            url = L.Util.template(template, {'layer': feature.datalayer.options.laydescription})
        }
        return url
    },

    edit: function (e) {
        if (this.map.editEnabled) {
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
                    var sub = L.DomUtil.create('div', 'storage-edit-subcontainer', container);
                    sub.innerHTML = data;
                    that.map.ui.openPanel({data: {html: container}, className: 'dark'});
                    that.map.editedFeature = that;
                }
            });
            if (!this.isOnScreen()) this.bringToCenter(e);
        }
    },

    isReadOnly: function () {
        return this.datalayer && this.datalayer.isRemoteLayer() && !this.datalayer.isWFSTLayer();
    }
};


L.Storage.Marker.include(L.Storage.FeatureForestMixin);
L.Storage.Polyline.include(L.Storage.FeatureForestMixin);
L.Storage.Polygon.include(L.Storage.FeatureForestMixin);
