# qStorage

Simple wrapper for saving & retrieving non-plain string data in HTML5 localStorage, basically built on top of JSON.stringify, and lodash's \_.get & \_.set

Useful when you just need to store arrays or objects and don't want to mess with IndexedDB or more complex libraries.

For more bullet-proof abstraction of client-side storage I recommend https://github.com/localForage/localForage which features async calls

# Dependencies

* JSON polyfill (copied from some Stack Overflow answer)
* Lodash

# Usage

```html
<!-- load deps -->
<script src="lodash.js"></script>
<script src="JSONpolyfill.js"></script>
<!-- load lib -->
<script src="qStorage.js"></script>
```

```javascript
qStorage.set("myObject", {
    nested: ["data1", "data2"]
});

qStorage.get("myObject.nested.1");  // returns "data2"

qStorage.set("myObject.nested.2", "data3")
qStorage.get("myObject.nested"); // returns ["data1", "data2", "data3"]

qStorage.set("myObject.newob.key", "lorem ipsum");
qStorage.get("myObject.newob"); // returns { key: "lorem ipsum" }
qStorage.get("myObject.newob.key"); // returns "lorem ipsum"
```
