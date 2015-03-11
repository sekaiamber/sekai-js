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
		rword: /[^, ]+/g,

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
		define: function(name, dependencies, factory, args) { 
			if (args) {
				if (args.initialize && typeof args.initialize == 'function') {
					args.initialize(this);
				};
			};
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

sekai.define("__BROWSER__", ["__CORE__"], function(_c_){}, {
	initialize : function(sekai) {
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
		var DOC = document;
		var eventInfo = {};
		var W3C = !!DOC.dispatchEvent;
		// css支持，from mass
		var prefixes = ['', '-webkit-', '-o-', '-moz-', '-ms-'];
		var cssMap = {};
		var support = {};
		sekai.mix(sekai, {
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
					camelCase = sekai.toCamelize(prefixes[i] + name);
					console.log(camelCase);
					if (camelCase in host) {
						return (cssMap[name] = camelCase);
					};
				};
				return null;
			}
		});

/////////////////////////////
// 以下support集成自mass
/////////////////////////////
	var DOC = document, div = DOC.createElement('div'), TAGS = "getElementsByTagName";
	div.setAttribute("className", "t");
	div.innerHTML = ' <link/><a href="/nasami"  style="float:left;opacity:.25;">d</a>' + '<object><param/></object><table></table><input type="checkbox" checked/>';
	var a = div[TAGS]("a")[0], style = a.style, select = DOC.createElement("select"), input = div[TAGS]("input")[0], opt = select.appendChild(DOC.createElement("option"));
	//true为正常，false为不正常
	var support = {
		//标准浏览器只有在table与tr之间不存在tbody的情况下添加tbody，而IE678则笨多了,即在里面为空也乱加tbody
		insertTbody: !div[TAGS]("tbody").length,
		// 在大多数游览器中checkbox的value默认为on，唯有chrome返回空字符串
		checkOn: input.value === "on",
		//当为select添加一个新option元素时，此option会被选中，但IE与早期的safari却没有这样做,需要访问一下其父元素后才能让它处于选中状态（bug）
		optSelected: !! opt.selected,
		//IE67，无法取得用户设定的原始href值
		attrInnateHref: a.getAttribute("href") === "/nasami",
		//IE67，无法取得用户设定的原始style值，只能返回el.style（CSSStyleDeclaration）对象(bug)
		attrInnateStyle: a.getAttribute("style") !== style,
		//IE67, 对于某些固有属性需要进行映射才可以用，如class, for, char，IE8及其他标准浏览器不需要
		attrInnateName: div.className !== "t",
		//IE6-8,对于某些固有属性不会返回用户最初设置的值
		attrInnateValue: input.getAttribute("checked") == "",
		//http://www.cnblogs.com/rubylouvre/archive/2010/05/16/1736535.html
		//是否能正确返回opacity的样式值，IE8返回".25" ，IE9pp2返回0.25，chrome等返回"0.25"
		cssOpacity: style.opacity == "0.25",
		//某些浏览器不支持w3c的cssFloat属性来获取浮动样式，而是使用独家的styleFloat属性
		cssFloat: !! style.cssFloat,
		//IE678的getElementByTagName("*")无法遍历出Object元素下的param元素（bug）
		traverseAll: !! div[TAGS]("param").length,
		//https://prototype.lighthouseapp.com/projects/8886/tickets/264-ie-can-t-create-link-elements-from-html-literals
		//IE678不能通过innerHTML生成link,style,script节点（bug）
		noscope: !div[TAGS]("link").length ,
		//IE6789由于无法识别HTML5的新标签，因此复制这些新元素时也不正确（bug）
		cloneHTML5: DOC.createElement("nav").cloneNode(true).outerHTML !== "<:nav></:nav>",
		//在标准浏览器下，cloneNode(true)是不复制事件的，以防止循环引用无法释放内存，而IE却没有考虑到这一点，把事件复制了（inconformity）
		//        noCloneEvent: true,
		//现在只有firefox不支持focusin,focus事件,并且它也不支持DOMFocusIn,DOMFocusOut,并且此事件无法通过eventSupport来检测
		focusin : !W3C,
		//IE肯定支持
		//IE6789的innerHTML对于table,thead,tfoot,tbody,tr,col,colgroup,html,title,style,frameset是只读的（inconformity）
		innerHTML: false,
		//IE的insertAdjacentHTML与innerHTML一样，对于许多元素是只读的，另外FF8之前是不支持此API的
		insertAdjacentHTML: false,
		//是否支持createContextualFragment API，此方法发端于FF3，因此许多浏览器不支持或实现存在BUG，但它是将字符串转换为文档碎片的最高效手段
		fastFragment: false,
		//IE67不支持display:inline-block，需要通过hasLayout方法去模拟（bug）
		inlineBlock: true,
		//http://w3help.org/zh-cn/causes/RD1002
		//在IE678中，非替换元素在设置了大小与hasLayout的情况下，会将其父级元素撑大（inconformity）
		//        keepSize: true,
		//getComputedStyle API是否能支持将left, top的百分比原始值自动转换为像素值
		pixelPosition: true,
		transition: false
	};
	//IE6789的checkbox、radio控件在cloneNode(true)后，新元素没有继承原来的checked属性（bug）
	input.checked = true;
	support.cloneChecked = (input.cloneNode(true).checked === true);
	support.appendChecked = input.checked;
	//添加对optDisabled,cloneAll,insertAdjacentHTML,innerHTML,fastFragment的特征嗅探
	//判定disabled的select元素内部的option元素是否也有diabled属性，没有才是标准
	//这个特性用来获取select元素的value值，特别是当select渲染为多选框时，需要注意从中去除disabled的option元素，
	//但在Safari中，获取被设置为disabled的select的值时，由于所有option元素都被设置为disabled，会导致无法获取值。
	select.disabled = true;
	support.optDisabled = !opt.disabled;
	//IE下对div的复制节点设置与背景有关的样式会影响到原样式,说明它在复制节点对此样式并没有深拷贝,还是共享一份内存
	div.style.backgroundClip = "content-box";
	div.cloneNode(true).style.backgroundClip = "";
	support.cloneBackgroundStyle = div.style.backgroundClip === "content-box";
	var table = div[TAGS]("table")[0];
	try { //检测innerHTML与insertAdjacentHTML在某些元素中是否存在只读（这时会抛错）
		table.innerHTML = "<tr><td>1</td></tr>";
		support.innerHTML = true;
		table.insertAdjacentHTML("afterBegin", "<tr><td>2</td></tr>");
		support.insertAdjacentHTML = true;
	} catch(e) {};
	
	a = select = table = opt = style = null;
    // require("ready", function() {
    //     var body = DOC.body;
    //     if(!body) //frameset不存在body标签
    //     return;
    //     try {
    //         var range = DOC.createRange();
    //         range.selectNodeContents(body.firstChild || body); 
    //         //fix opera(9.2~11.51) bug,必须对文档进行选取，尽量只选择一个很小范围
    //         support.fastFragment = !! range.createContextualFragment("<a>");
    //         $.cachedRange = range;
    //     } catch(e) {};
    //     div.style.cssText = "position:absolute;top:-1000px;left:-1000px;";
    //     body.insertBefore(div, body.firstChild);
    //     var a = '<div style="height:20px;display:inline-block"></div>';
    //     div.innerHTML = a + a; //div默认是block,因此两个DIV会上下排列0,但inline-block会让它们左右排列
    //     support.inlineBlock = div.offsetHeight < 40; //检测是否支持inlineBlock
    //     if(window.getComputedStyle) {
    //         div.style.top = "1%";
    //         var computed = window.getComputedStyle(div, null) || {};
    //         support.pixelPosition = computed.top !== "1%";
    //     }
    //     //http://stackoverflow.com/questions/7337670/how-to-detect-focusin-support
    //     div.innerHTML = "<a href='#'></a>";
    //     if(!support.focusin) {
    //         a = div.firstChild;
    //         a.addEventListener('focusin', function() {
    //             support.focusin = true;
    //         }, false);
    //         a.focus();
    //     }
    //     div.style.width = div.style.paddingLeft = "10px"; //检测是否支持盒子模型
    //     support.boxModel = div.offsetWidth === 20;
    //     body.removeChild(div);
    //     div = null;
    // });

		sekai.support = support;
	} 
});