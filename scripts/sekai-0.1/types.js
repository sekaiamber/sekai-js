// sekai.js prototype 0.1
// module : types
// description : 类型判定模块。

sekai.define("__TYPES__", ["__CORE__"], function(_c_){
	//alert("types" + _c_);
	_c_.mix(_c_, {
		isUndefined : function(obj) {
			return obj === void 0;
		},
		isNull : function(obj) {
			return obj === null;
		},
		isNaN : function(obj) {
			return obj !== obj;
		},
		isString : function(obj) {
			return _c_.getType(obj) == "string";
		},
		isBool : function(obj) {
			return _c_.getType(obj) == "boolean";
		},
		isNumber : function(obj) {
			return _c_.getType(obj) == "number";
		},
		isDate : function(obj) {
			return _c_.getType(obj) == "date";
		},
		isArray : function(obj) {
			return _c_.getType(obj) == "array";
		},
		isFunction : function(obj) {
			return typeof obj == "function";
		},
		isWindow : function(obj) {
			var t = _c_.getType(obj);
			if(t == "window" || t == "domwindow" || t == "global") return true;
			if (t == "object") {
				// ie 6,7,8
				return obj == document && !(document == obj);
			};
			return false;
		}
	});
});
sekai.entity("__TYPES__")();