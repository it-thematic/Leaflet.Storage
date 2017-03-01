L.Storage.Map.include({

    editedLayer: null,

    editLayer: function (onSelectCallback) {
        var container = L.DomUtil.create('div');

        var builder = new L.S.FormBuilder(this, ['datalayers']);  // removeLayer step will close the edit panel, let's reopen it
        container.appendChild(builder.build());
        if (builder.helpers.datalayers.select.length == 0) {
            var msg = 'Нет загруженных слоёв';
            this.ui.alert({content: msg, level: 'error', duration: 100000});
            return;
        }
        var editLink = L.DomUtil.create('a', 'button storage-edit', container);
        editLink.href = '#';
        editLink.innerHTML = L._('Edit');
        L.DomEvent
            .on(editLink, 'click', L.DomEvent.stop)
            .on(editLink, 'click', function (e) {
                L.DomEvent.stop(e);
                    this.ui.closePanel();
                    if (!this.editedLayer) {this.editedLayer = builder.helpers['datalayers'].toJS()}
                    onSelectCallback();
            }, this);

        this.ui.openPanel({data: {html: container}, className: 'dark'})
    }
});

L.Storage.Map.addInitHook(function(){
    var editedLayer = null;
    var that = this;
    try {
        Object.defineProperty(this, 'editedLayer', {
            get: function () {
                return editedLayer;
            },
            set: function (datalayer) {
                if (editedLayer && editedLayer !== datalayer) {
                    editedLayer.clear();
                }
                editedLayer = datalayer;
                that.fire('seteditedlayer');
            }
        });
    }
    catch (e) {
        // Certainly IE8, which has a limited version of defineProperty
    }
});

L.Storage.Map.prototype.defaultDataLayer = function(){
    if (this.editedLayer) return this.editedLayer;

    var datalayer, fallback;
    datalayer = this.lastUsedDataLayer;
    if (datalayer && (!datalayer.isRemoteLayer() || (datalayer.isRemoteLayer() && datalayer.isWFSTLayer())) && datalayer.canBrowse() && datalayer.isVisible()) {
        return datalayer;
    }
    datalayer = this.findDataLayer(function (datalayer) {
        if ((!datalayer.isRemoteLayer() || (datalayer.isRemoteLayer() && datalayer.isWFSTLayer())) && datalayer.canBrowse()) {
            //fallback = datalayer;
            if (datalayer.isVisible()) return true;
        }
    });
    if (datalayer) return datalayer;
    if (fallback) {
        // No datalayer visible, let's force one
        this.addLayer(fallback.layer);
        return fallback;
    }
    return this.createDataLayer();
};

L.Storage.Map.prototype.enableEdit = function() {
    var that = this;
    this.editLayer(function() {
        if (!that.editedLayer) return;
        L.DomUtil.addClass(document.body, 'storage-edit-enabled');
        that.editEnabled = true;
        that.fire('edit:enabled');
    })
};

L.Storage.Map.prototype.disableEdit = function() {
    if (this.isDirty) return;
    L.DomUtil.removeClass(document.body, 'storage-edit-enabled');
    this.editedFeature = null;
    this.editedLayer = null;
    this.editEnabled = false;
    this.fire('edit:disabled');
};