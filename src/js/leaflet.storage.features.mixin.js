L.Storage.UrlMixin = {
    getActionUrl: function (feature) {
        if (!feature.properties.id || !feature.state) { return; }
        if (feature.state === 'insert') {
            template = '/row_create/{layer}/';
        } else {
            template = '/row_edit/{layer}/{id}/';
        }
        return L.Util.template(template, {'layer': feature.datalayer.options.laydescription, 'id': feature.properties.id})
    }
};


L.Storage.FeatureMixin.edit = function (e) {
    if (!this.map.editEnabled || this.isReadOnly()) {
        return;
    }
    var form_url = L.Storage.UrlMixin.getActionUrl(this);
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
            container.innerHTML = data;
            that.map.ui.openPanel({data: {html: container}, className: 'dark'});
            that.map.editedFeature = that;
            if (!that.isOnScreen()) that.bringToCenter(e);
        }
    })
};



