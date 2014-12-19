// =================================================================
// sekai.js prototype 0.1
// module : core
// description : 核心模块，提供最基础的几个函数，注册核心模块。
// =================================================================

(function() {
/**********************
* 成员
***********************/
	// 版本
	var __VERSION__ = {
		version : '0.1'
	};
	// 模块
	var __MODULES__ = {};
	// 文件
	var __FILE__ = {};
	// IE
	var __IE__ = !!window.VBArray;
	// 事件
	var DOC = document;
	var addListener = DOC.addEventListener || DOC.attachEvent;
	var removeListener = DOC.removeEventListener || DOC.detachEvent;
	var noop =  function(){};
	var html = DOC.html || DOC.getElementsByTagName('html')[0];


	// 保存先前框架
	var _sekai = window.sekai, _$$ = window.$$;

/**********************
* 内部方法
***********************/
	// 数组化
	var toArray = __IE__ ? function(nodes, start, end, res){
		if (!nodes.length) return [];
		var n = nodes.length || 0;
		start = start || 0;
		end = end || n;
		if (start < 0) start+= n;
		if (end < 0) end+= n;
		if (start > end) return [];
		var length = end - start;
		res = new Array(length);
		while (length--)
			res[length] = nodes[start + length];
		return res;
	} : function (nodes, start, end) {
		return [].slice.call(nodes, start, end);
	};
	// 杂糅对象, 杂糅一系列对象，最后一个参数如果为false，则不复写之前的对象值
	var mix =  function(target, source) {
		var args = toArray(arguments), i = 1, key, ride = typeof args[args.length - 1] == "boolean" ? args.pop() : true;
		if (args.length === 1) {
			target = !this.window ? this : {};
			i = 0;
		};
		while ((source = args[i++])) {
			for (key in source) {
				if (ride || !(key in target)) {
					target[key] = source[key];
				};
			}
		}
		return target;
	};
	// 模块工厂
	var fun_getModule = function (n, d, f) {
		var dd = {};
		if (sekai.getType(d) == "array") {
			for (var i = 0; i < d.length; i++) {
				dd[d[i]] = [];
			};
		} else {
			for (dep in d) {
				dd[dep] = d[dep];
			};
		};
		return {
			name : n,
			dependencies : dd,
			factory : f
		};
	};
	
/**********************
* Domready
***********************/
// domReady
	var readyList = [];
	var readyFn, ready = !__IE__ ? "DOMContentLoaded" : "readystatechange";
	var fireReady = function(){
		for (var i = 0, fn; fn = readyList[i++];) {
			fn();
		}
		readyList = null;
		fireReady = noop;
	};
	// for ie, using在readyState=complete之前
	var doScrollCheck = function(){
		try{ // ie
			html.doScroll("left");
			fireReady();
		} catch (e){
			setTimeout(doScrollCheck);
		}
	};
	// for w3c, using在DOMContentLoaded之后
	var doUsingCheck = function(){
		// console.log("------doUsingCheck-----");
		// console.log(__FILE__);
		for (var file in __FILE__) {
			if (!__FILE__[file]) {
				setTimeout(doUsingCheck);
				return;
			};
		};
		fireReady();
	};
	if (!DOC.readyState) {
		var readyState = DOC.readyState = DOC.body ? "complete" : "loading";
	};

	if (DOC.readyState === "complete") {
		fireReady(); // 在dom之后加载
	} else {
		addListener.call(DOC, ready, readyFn = function () {
			if (ready == "DOMContentLoaded" || DOC.readyState == "complete") {
				doUsingCheck();
				if (readyState) {
					DOC.readyState = "complete";
				};
			};
		}, false);
		if (html.doScroll) {
			try{
				if (self.eval === parent.eval) {
					doScrollCheck();
				};
			} catch(e) {
				doScrollCheck();
			}
		};
	};


/**********************
* 公共成员
***********************/
	var sekai = { 
		info: __VERSION__,

		noop: noop,
		// 交还$$符号和sekai符号的控制权
		noConflict: function(deep) {
			window.$$ = _$$;
			if (deep) {
				window.sekai = _sekai;
			};
			return sekai;
		},
		// 杂糅对象, 杂糅一系列对象，最后一个参数如果为false，则不复写之前的对象值
		mix: mix,
		toArray: toArray,
		getType : function(obj) {
			var _t;
			return ((_t = typeof(obj)) == "object" ? obj == null && "null" || Object.prototype.toString.call(obj).slice(8, -1) : _t).toLowerCase();
		},
		ready : function(fn) {
			if (readyList) {
				readyList.push(fn);
			} else {
				if(sekai.isFunction(fn)){
					fn();
				};
			};
		},
		// 注册模块
		define: function(name, dependencies, factory) { 
			if (!__MODULES__[name]) {
				var module = fun_getModule(name, dependencies, factory);
				__MODULES__[name] = module;
			};
			return __MODULES__[name];
		},
		// 实例化模块
		entity: function(name) {
			var module = __MODULES__[name];
			if (!module.entity) {
				var deps = [];
				for (key in module.dependencies) {
					deps.push({ entity : this.entity(key), name : key});
				};
				module.entity = function() {
					var args = [];
					for (var i = 0; i < deps.length; i++) {
						args.push(deps[i].entity.apply(sekai.noop, module.dependencies[deps[i].name]));
					};
					for (var i = 0; i < arguments.length; i++) {
						args.push(arguments[i]);
					};
					return module.factory.apply(sekai.noop, args);
				};
			};
			return module.entity;
		},
		// 异步加载js文件
		using: function(pathes, callback, remove) {
			for (var i = 0; i < pathes.length; i++) {
				var path = pathes[i];
				if (!__FILE__[path]) {
					var head = DOC.head || DOC.getElementsByTagName('head')[0];
					var file = DOC.createElement('script');
					file.type = 'text/javascript';
					file.async = 'true';
					file.src = path;
					file.onload = file.onreadystatechange = function () {
						__FILE__[this.attributes['src'].value] = true;
						if (remove) {
							head.removeChild(this);
						};
						checkAllFiles();
					};
					head.appendChild(file);
					__FILE__[path] = false;
				};
			};
			function checkAllFiles() {
				var allLoaded = true;
				for (var j = 0; j < pathes.length; j++) {
					allLoaded &= __FILE__[pathes[j]];
				};
				if (allLoaded && callback) {
					callback();
				};
			}
		},
	};
	// 注册核心模块
	sekai.define("__CORE__", [], function(){
		return sekai;
	});

	// 注册
	window.sekai = sekai;
	window.$$ = window.sekai;
})();

// =================================================================
// sekai.js prototype 0.1
// module : browser
// description : 浏览器嗅探模块。
// =================================================================

sekai.define("__BROWSER__", ["__CORE__"], function(_c_){
	// 浏览器版本嗅探
	var browserInfo = {
		ie : -1,
		firefox : -1,
		chrome : -1,
		safari : -1
	};

	// ie
	if (!!window.VBArray) {
		var ieV = eval("''+/*@cc_on" + " @_jscript_version@*/-0")*1;
		if (ieV != 0) {
			browserInfo.ie = (ieV - 5) * 10;
		} else {
			if (window.navigator.msPointerEnabled) {
				browserInfo.ie = 10;
			};
			if (!!window.MSInputMethodContext) {
				browserInfo.ie = 11;
			};
		}
	} else {
		if (!!window.updateCommands) {
			browserInfo.firefox = 1;
		};
		if (window.openDatabase && !window.chrome) {
			browserInfo.safari = 1;
		};
		if (!!window.chrome) {  // window.google 在版本 39.0.2171.65 m中无效
			browserInfo.chrome = 1;
		};
	};

	// 浏览器事件支持
	var eventInfo = {};
	// css支持，from mass
	var prefixes = ['', '-webkit-', '-o-', '-moz-', '-ms-'];
	var cssMap = {};
	_c_.mix(_c_, {
		browser : browserInfo,
		eventSupport : function(eventName, el) {
			el = el || document.documentElement;
			eventName = "on" + eventName;
			var ret = eventName in el;
			if (el.setAttribute &&  !ret) {
				el.setAttribute(eventName, "");
				ret = typeof el[eventName] === "function";
				el.removeAttribute(eventName);
			};
			el = null;
			return ret;
		},
		cssName : function(name, host, camelCase) {
			if (cssMap[name]) {
				return cssMap[name];
			};
			host = host || document.documentElement;
			for (var i = 0, n = prefixes.length; i < n; i++) {
				camelCase = prefixes[i] + _c_.toCamelize(name);
				if (camelCase in host) {
					return (cssMap[name] = camelCase);
				};
			};
			return null;
		}
	});
});
sekai.entity("__BROWSER__")();