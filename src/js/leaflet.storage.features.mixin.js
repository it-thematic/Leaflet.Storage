L.Storage.Polyline.prototype.populate = function (feature) {
    for (var i in feature.properties) {
        if (!feature.properties[i]) {
            feature.properties[i] = '-';
        }
    }
    this.properties = L.extend({}, feature.properties);
    this.properties._storage_options = L.extend({}, this.properties._storage_options);
    // Retrocompat
    if (this.properties._storage_options.clickable === false) {
        this.properties._storage_options.interactive = false;
        delete this.properties._storage_options.clickable;
    }
};

L.Storage.Polygon.prototype.populate = function (feature) {
    for (var i in feature.properties) {
        if (!feature.properties[i]) {
            feature.properties[i] = '-';
        }
    }
    this.properties = L.extend({}, feature.properties);
    this.properties._storage_options = L.extend({}, this.properties._storage_options);
    // Retrocompat
    if (this.properties._storage_options.clickable === false) {
        this.properties._storage_options.interactive = false;
        delete this.properties._storage_options.clickable;
    }
};