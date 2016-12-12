/**
 * qStorage: simple query tool for HTML5's localStorage
 * allows to save & retrieve objects instead of only strings
 * @requires lodash
 * @requires JSON.parse & JSON.stringify
 * @TODO use module/constructor pattern
 */

var qStorage = {

    /**
     * need to wrap in this.storage if localStorage available
     */
    storage: (function() {
            var uid = new Date;
            var storage;
            var result;
            try {
                (storage = window.localStorage).setItem(uid, uid);
                result = storage.getItem(uid) == uid;
                storage.removeItem(uid);
                return result && storage;
            } catch (exception) {}
        }()
    ),

    /**
     * writes value to given path
     * @param {String} path
     * @param {mixed} value
     * @param {Object} options { merge: BOOLEAN  }
     */
    set: function(path, value) {
        var options = _.get(arguments, 2, {});
        var keysTree = path.split(".");
        var rootKey = _.first(keysTree);

        // detect simple/nested key
        var wrapData = [
            _.identity,
            _.partial(_.set, {}, _.tail(keysTree).join("."))
        ];
        var shouldWrap = keysTree.length > 1;
        value = wrapData[+shouldWrap].call(null, value);

        // if modifying nested value of existing tree, merge with previous
        var previousData = this.get(rootKey);
        var mergeData = [
            _.identity,
            _.partial(_.merge, previousData)
        ];
        var shouldMerge = _.isObject(previousData) && _.get(options, "merge", true);
        value = mergeData[+shouldMerge].call(null, value);

        // turn Object to string 'cause localStorage only keeps strings
        var prepareData = [
            _.identity,
            JSON.stringify
        ];
        var isObject = _.isObject(value);
        value = prepareData[+isObject].call(null, value);

        // then we are ready to save the whole tree into rootKey
        try {
            return this.storage.setItem(rootKey, value);
        } catch (e) {
            console.log("[qStorage] Error setting '" + path + "': " + e.message);
            return false;
        }
    },

    /**
     * @param {String} path
     */
    get: function(path) {
        var keysTree = path.split(".");
        var rootKey = _.first(keysTree);

        // first get rootKey from storage
        // then find the value under the rest of the path
        // from that JSONparsed value
        try {
            var value = this.storage.getItem(rootKey);
            try {
                value = JSON.parse(value);
            } catch (e) {
                value = value;
            }
        } catch (e) {
            console.log("[qStorage] Error getting '" + path + "': " + e.message);
            return false;
        }

        var shouldDive = keysTree.length > 1;
        var restPath = _.tail(keysTree).join(".");
        return [
            _.constant(value),
            _.partial(_.get, value, restPath, null)
        ][+shouldDive].call();

    },

    /**
     *
     */
    delete: function(path) {
        var keysTree = path.split(".");
        var rootKey = _.first(keysTree);
        if (keysTree.length === 1) {
            try {
                return this.storage.removeItem(rootKey);
            } catch (e) {
                console.log("[qStorage] Error deleting '" + path + "': " + e.message);
                return false;
            }
        }

        var parentPath = _.initial(keysTree).join(".");
        var parent = this.get(parentPath);
        var itemKey = _.last(keysTree);
        delete parent[itemKey];
        // call set with merge false to override whole tree
        // otherwise it would merge with previous deleted value
        return this.set(parentPath, parent, { merge: false });
    },

    /**
     * pushes value into stored array
     * @param {String} path : path to ARRAY stored element
     * @param {Mixed} value
     */
    append: function(path, value) {
        var previous = this.get(path);
        if (_.isArray(previous)) {
            previous.push(value);
            value = previous;
        } else {
            if (!_.isNull(previous)) {
                console.log("[qStorage] Error appending to '" + path + "': path not found");
                return false;
            }
            value = [value];
        }
        return this.set(path, value);
    },

    merge: function(path, value) {
        var previousData = this.get(path);
        if (!_.isObject(previousData)) {
            return false;
        }
        value = _.merge(previousData, value);
        return this.set(path, value);
    },

    clear: function() {
        return this.storage.clear();
    }
};
