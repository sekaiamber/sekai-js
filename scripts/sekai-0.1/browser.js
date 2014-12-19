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
				camelCase = _c_.toCamelize(prefixes[i] + name);
				console.log(camelCase);
				if (camelCase in host) {
					return (cssMap[name] = camelCase);
				};
			};
			return null;
		}
	});
});
sekai.entity("__BROWSER__")();