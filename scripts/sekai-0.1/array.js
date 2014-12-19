// =================================================================
// sekai.js prototype 0.1
// module : array
// description : 数组处理、扩展、修复模块。
// =================================================================

sekai.define("__ARRAY__", ["__CORE__"], function(_c_){
	// alert("array:"+_c_);
	// 兼容ie6,7,8
	Array.prototype.indexOf = function (item, index) {
		var n = this.length, i = ~~index;
		if (i < 0) i += n;
		for (; i < n; i++) {
			if (this[i] === item) return i;
		};
		return -1;
	};

	// 兼容ie6,7,8
	Array.prototype.lastIndexOf = function (item, index) {
		var n = this.length, i = index == null ? n - 1 : index;
		if (i < 0 ) i = Math.max(0, n + i);
		for (; i >= 0; i--) {
			if (this[i] === item) return i;
		};
		return -1;
	};

	// http://www.cnblogs.com/iloveu/archive/2009/03/31/1426234.html
	function iterator (vars, body, ret) {
		var fun = 'for(var ' + vars + 'i=0,n=this.length;i<n;i++){' + body.replace('_', '((i in this)&&fn.call(scope,this[i],i,this))') + '}' + ret;
		return Function("fn,scope", fun);
	};
	Array.prototype.forEach = iterator("","_","");
	Array.prototype.filter = iterator("r=[],j=0,","if(_) r[j++]=this[i]","return r");
	Array.prototype.map = iterator("r=[],","r[i]=_", "return r");
	Array.prototype.some = iterator("","if(_) return true", "return false");
	Array.prototype.every = iterator("","if(!_) return false","return true");

	// reduce和reduceRight，后者是前者的反向遍历
	Array.prototype.reduce = function(fn, lastResult, scope) {
		if (this.length == 0) return lastResult;
		var i = lastResult !== undefined ? 0 : 1;
		var result = lastResult !== undefined ? lastResult : this[0];
		for (var n = this.length; i < n; i++) {
			result = fn.call(scope, result, this[i], i, this);
		};
		return result;
	};

	Array.prototype.reduceRight = function(fn, lastResult, scope) {
		var array = this.concat().reverse();
		return array.reduce(fn, lastResult, scope);
	};

	// 扩展方法
	// 是否包含元素
	Array.prototype.contains = function(item) {
		return this.indexOf(item) > -1;
	};
	// 删除指定下标元素
	Array.prototype.removeAt = function(index) {
		return !!this.splice(index, 1).length;
	};
	// 删除第一个匹配元素
	Array.prototype.remove = function(item) {
		var index = this.indexOf(item);
		if (~index) return this.removeAt(index);
		return false;
	};
	// 对数组重新洗牌
	Array.prototype.shuffle = function() {
		var j,x,i = this.length;
		for (; i > 0; j = parseInt(Math.random() * i), x=this[--i], this[i] = this[j], this[j] = x) {};
		return this;
	};
	// 随机取出一个元素
	Array.prototype.random = function() {
		return this[Math.floor(Math.random() * this.length)];
	};
	// 将所有子数组全部展开成一维数组
	Array.prototype.flatten = function() {
		var result = [];
		this.forEach(function(item){
			_c_.isArray(item) ? result = result.concat(item.flatten()) : result.push(item);
		});
		return result;
	};
	// 去重
	Array.prototype.unique = function() {
		var result = [];
		loop: for (var i = 0, n = this.length; i < n; i++) {
			for (var x = i + 1; x < n; x++) {
				if (this[x] == this[i]) continue loop;
			};
			result.push(this[i]);
		};
		return result;
	};
	// 过滤null和undefined，返回过滤后的数组
	Array.prototype.compact = function(){
		return this.filter(function(e) {
			return e != null;
		});
	};
	// 取得对象数组的每个元素的指定属性，返回其数组
	Array.prototype.pluck = function(name) {
		var result = [], prop;
		this.forEach(function(item) {
			prop = item[name];
			if (prop != null) result.push(prop);
		});
		return result;
	};
	// 分组聚合
	Array.prototype.groupBy = function(val) {
		var result = [];
		var iterator = _c_.isFunction(val) ? val : function(obj) {
			return obj[val];
		};
		this.forEach(function(value, index) {
			var key = iterator(value);
			(result[key] || (result[key] = [])).push(value);
		});
		return result;
	};
	// 排序
	Array.prototype.sortBy = function(fn, scope) {
		var array = this.map(function(item, index) {
			return {
				el : item,
				re : fn.call(scope, item, index)
			}
		});
		array =array.sort(function(left, right) {
			return left.re - right.re;
		});
		return array.pluck('el');
	};
	// 并集
	Array.prototype.union = function(other) {
		return this.concat(other).unique();
	};
	// 交集
	Array.prototype.intersect = function(other) {
		return this.filter(function(n) {
			return ~other.indexOf(n);
		}).unique();
	};
	// 差集
	Array.prototype.diff = function(other) {
		var result = this.slice();
		for (var i = 0; i < result.length; i++) {
			for (var j = 0; j < other.length; j++) {
				if (result[i] == other[j]) {
					result.splice(i, 1);
					i--;
					break;
				};
			};
			
		};
		return result;
	};
	// 最小值
	Array.prototype.min = function() {
		return Math.min.apply(0, this);
	};
	// 最大值
	Array.prototype.max = function() {
		return Math.max.apply(0, this);
	};

	// 修复
	// ie6,7 下unshift不返回数组长度
	if ([].unshift(1) !== 1) {
		var _unshift = Array.prototype.unshift;
		Array.prototype.unshift = function() {
			_unshift.apply(this, arguments);
			return this.length;
		};
	};
	// ie6,7,8下splice第二个参数不传为0，W3C方不传为数组长度
	if ([1,2,3].splice(1).length == 0) {
		var _splice = Array.prototype.splice;
		Array.prototype.splice = function(args) {
			//alert(arguments);
			if (arguments.length == 1) {
				return _splice.call(this, arguments[0], this.length);
			} else {
				return _splice.apply(this, arguments);
			};
		}
	};

	// 一组slice扩展
	var _slice = Array.prototype.slice;
	Array.prototype.pop = function() {
		return this.splice(this.length - 1, 1)[0];
	};
	Array.prototype.push = function() {
		this.splice.apply(this, [this.length, 0].concat(_slice.call(arguments)));
		return this.length;
	};
	Array.prototype.shift = function() {
		return this.splice(0,1)[0];
	};
	Array.prototype.unshift = function(){
		this.splice.apply(this, [0,0].concat(_slice.call(arguments)));
		return this.length;
	};

});
sekai.entity("__ARRAY__")();