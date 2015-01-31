// =================================================================
// sekai.js prototype 0.1
// module : lambda
// description : lambda表达式模块。
// =================================================================

sekai.define("__LAMBDA__", ["__CORE__"], function(_c_){}, {
	initialize : function(_c_) {
		var lambdaFuncs = {};

		Array.prototype.select = function(fun) {
			var fc = void 0;
			if (_c_.isFunction(fun)) fc = fun;
			if (_c_.isString(fun)) fc = _c_.lambda(fun);
			if (fc == void 0) return this;
			var ret = [];
			for (var i = 0; i < this.length; i++) {
				ret[i] = fc(this[i]);
			};
			return ret;
		};
		Array.prototype.where = function(fun) {
			var fc = void 0;
			if (_c_.isFunction(fun)) fc = fun;
			if (_c_.isString(fun)) fc = _c_.lambda(fun);
			if (fc == void 0) return this;
			var ret = [];
			for (var i = 0; i < this.length; i++) {
				if(fc(this[i])) ret[ret.length] = this[i];
			};
			return ret;
		};

		_c_.mix(_c_, {
			lambda : function (exp) {
				var e1 = exp.match(/(.+)=>(.+)/);
				var args = e1[1];
				var exp = e1[2];
				args = args.replace(/[\s\(\)]/g, "");
				exp = exp.trim();
				//args = args.split(",");
				exp = "return (" + exp + ")";
				return Function(args, exp);
				//console.log(args + "-" + exp);
			},
			convertAll : function(target, fun) {
				var fc = void 0;
				if (_c_.isFunction(fun)) fc = fun;
				if (_c_.isString(fun)) fc = _c_.lambda(fun);
				if (fc == void 0) return target;
				var ret = [];
				for (var i = 0; i < target.length; i++) {
					ret[i] = fc(target[i]);
				};
				return ret;
			}
		});
	}
});
// sekai.entity("__LAMBDA__")();