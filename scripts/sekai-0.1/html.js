// =================================================================
// sekai.js prototype 0.1
// module : html
// description : 负责html文档处理的模块。
// =================================================================

sekai.define("html", ["__CORE__"], function(_c_){}, {
	initialize: function(sekai){
		var html = {};
		html.supportAdjacent = false;
		var rnest = /<(?:tb|td|tf|th|tr|col|opt|leg|cap|area)/;
		var adjacent = "insertAdjacentHTML";
		var TAGS = "getElementsByTagName";
		//////// parseHTML
		var _table = document.createElement('table');
		var _tr = document.createElement('tr');
		var _select = document.createElement('select');
		var tagHooks = {
			option: _select,
			thead: _table,
			tfoot: _table,
			tbody: _table,
			td: _tr,
			th: _tr,
			tr: document.createElement('tbody'),
			col: document.createElement('colgroup'),
			legend: document.createElement('fieldset'),
			"*": document.createElement('div')
		};
		html.parseHTML = function(html, tag){
			var parent;
			if (tag == null) {
				tag = '*';
			} else if (!(tag in tagHooks)) {
				tag = '*';
			};
			parent = tagHooks[tag];
			parent.innerHTML = ""+html;
			return [].slice.call(parent.childNodes);
		}
		//////// manipulate
		html.manipulate = function (nodes, name, item, doc){
			// 将元素转化为纯正的元素结点集合
			var elems = nodes.filter(function(el){
				return el.nodeType === 1;
			});
			var handler = insertHooks[name];
			if (item.nodeType) {
				// 如果传入的是元素结点，文本节点，或者文档碎片
				insertAdjacentNode(elems, item, handler);
			} else if(typeof item === 'string') {
				// 传入字符串片段
				// 如果方法不是replace，并且不存在嵌套关系的标签
				var fast = (name !== 'replace' && !rnest.test(item));
				if (!fast) {
					item = html.parseHTML(item, doc);
				};
				insertAdjacentHTML(elems, item, insertHooks[name+"2"], handler);
			} else if (item.length) {
				// 如果传入的是HTMLCollection nodeList
				insertAdjacentFragment(elems, item, doc, handler);
			};
		};
		function insertAdjacentNode (elems, item, handler) {
			for (var i = 0, el; el = elems[i]; i++) {
				handler(el, i ? html.cloneNode(item, true, true) : item); // 第一个不用复制
			};	
		};
		function insertAdjacentHTML (elems, item, fastHandler, handler){
			for (var i = 0, el; el=elems[i] ; i++) {
				if (item.nodeType) {
					handler(el, item.cloneNode(true));
				} else {
					fastHandler(el, item);
				};
			};
		};
		function insertAdjacentFragment (elems, item, doc, handler) {
			var fragment = doc.createDocumentFragment();
			for (var i = 0, el; el = elems[i]; i++) {
				handler(el, makeFragment(item, fragment, i > 1));
			};
		};
		function makeFragment (nodes, fragment, bool) {
			var ret = fragment.cloneNode(false);
			var go = !node.item;
			for (var i = 0, node; node = nodes[i]; go && i++) {
				ret.appendChild(bool && html.cloneNode(node, true, true) || node);
			};
			return ret;
		};
		var insertHooks = {
			prepend: function(el, node){
				el.insertBefore(node, el.firstChild);
			},
			append: function(el, node){
				el.appendChild(node);
			},
			before: function(el, node){
				el.parentNode.insertBefore(node, el);
			},
			after: function(el, node){
				el.parentNode.insertBefore(node, el.nextSibling);
			},
			replace: function(el, node){
				el.parentNode.replaceChild(node, el);
			},
			prepend2: function(el, html){
				el[adjacent]("afterBegin", html);
			},
			append2: function(el, html){
				el[adjacent]("beforeEnd", html);
			},
			before2: function(el, html){
				el[adjacent]("beforeBegin", html);
			},
			after2: function(el, html){
				el[adjacent]("afterEnd", html);
			}
		};

		//////// cloneNode
		html.cloneNode = function(node, dataAndEvents, deepDataAndEvents) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
			if (node.nodeType === 1) {
				var neo = html.fixCloneNode(node), // 复制attributes
					src, neos, i;
				//====TODO====
				if (dataAndEvents) {
					sekai.data.mergeData(neo, node); // 复制数据
					if (deepDataAndEvents) { // 复制子孙
						var src = node[TAGS]("*");
						var neos = neo[TAGS]("*");
						for (var i = 0; i < src[i]; i++) {
							sekai.data.mergeData(neos[i], src[i]);
						};
					};
				};
				src = neos = null;
				//====ENDTODO====
				return neo;
			} else {
				return node.cloneNode(true);
			};
		};
		function fixNode (clone, src) {
			if (src.nodeType == 1) {
				var nodeName = clone.nodeName.toLowerCase();
				clone.clearAttributes(); // 清除所有style, class, attachEvent
				clone.mergeAttributes(); // 复制除了事件，ID，NAME，uniqueNumber之外的所有属性
				// IE6-IE8
				if (nodeName === "object") {
					clone.outerHTML = src.outerHTML;
				} else if (nodeName === "input" && (src.type==="checkbox"||src.type==="radio")) {
					// IE6-8无法复制checkbox值，IE6，7中defaultChecked属性也漏掉了
					if (src.checked) {
						clone.defaultChecked = clone.checked = src.checked;
					};
					// 除Chrome之外的浏览器会给没有value的checkbox一个默认的"on"
					if (clone.value !== src.value) {
						clone.value = src.value;
					};
				} else if (nodeName === "option") {
					clone.selected = src.defaultChecked; // IE6-8无法保持默认值
				} else if (nodeName === "input" || nodeName === "textarea") {
					clone.defaultValue = src.defaultValue; // IE6-8无法保持默认值
				} else if (nodeName === "script" && clone.text !== src.text) {
					clone.text = src.text; // IE6-8不复制script的text属性
				};
			};	
		};
		// 缓存临时div，对于HTML5元素，我们只能通过outerHTML赋值到一个div中，作为他的innerHTML，然后再取出来
		var shim = document.createElement("div"); 
		function shimCloneNoe (outerHTML, tree) {
			tree.appendChild(shim);
			shim.innerHTML = outerHTML;
			tree.removeChild(shim);
			return shim.firstChild;
		};
		var unknownTag = "<?XML:NAMESPACE";
		html.fixCloneNode = function(node) {
			if ( // sekai.support.cloneHTML5 && //====TODO====增加判定是否支持cloneHTML5
				node.outerHTML) {
				var outerHTML = document.createElement(node.nodeName).outerHTML;
				var bool = outerHTML.indexOf(unknownTag);
			};
			// 参考：各浏览器内部cloneNode实现差异
			// http://www.cnblogs.com/snandy/archive/2012/05/06/2473936.html
			var neo = !bool ? shimCloneNoe(node.outerHTML, document.documentElement):node.cloneNode(true);
			fixNode(neo, node);
			var src = node[TAGS]("*");
			var neos = neo[TAGS]("*");
			for (var i = 0; i < src[i]; i++) {
				fixNode(neos[i], src[i]);
			};
		};

		sekai.mix(sekai, {
			html: html
		});
	}
});

//////////////////////////////////
// htmlNode
//////////////////////////////////
function htmlNode(proto) {
	if (proto.nodeType) {
		this.dom = proto;
	} else if (sekai.isArray(proto) && proto[0] && proto[0].nodeType) {
		this.dom = proto[0];
	};
};
sekai.define("htmlNode", [], function(proto) {
	return new htmlNode(proto);
}, {
	initialize: function(sekai){
		htmlNode.prototype.htmlNode = true;
		'append,prepend,before,after,replace'.replace(sekai.rword, function(method) {
			htmlNode.prototype[method] = function(item) {
				if (item.htmlNode) {
					item = item.dom;
				} else if (item.htmlNodeCollection) {
					item = htmlNodeCollection.doms;
				};
				return sekai.html.manipulate([this.dom], method, item, this.dom.ownerDocument);
			};
			htmlNode.prototype[method + "To"] = function(item) {
				if (this.htmlNode) {
					item[method](this);
				} else {
					// var selector = sekai.entity("selector")();
					// sekai.html.manipulate(selector(item, this.dom.ownerDocument), method, this.dom, this.dom.ownerDocument);
				};
				return this;
			};
		});
		window.htmlNode = htmlNode;
	}
});

//////////////////////////////////
// htmlNodeCollection
//////////////////////////////////
function htmlNodeCollection(protos) {
	if (sekai.isArray(protos)) {
		for (var i = 0, proto; proto = protos[i]; i++) {
			this[i] = new htmlNode(protos[i]);
		};
	} else {
		this[0] = new htmlNode(protos);
	};
	this.doms = protos;
};
sekai.define("htmlNodeCollection",[], function(protos) {
	console.log(protos);
	return new htmlNodeCollection(protos);
}, {
	initialize: function(sekai){
		htmlNodeCollection.prototype = [];
		htmlNodeCollection.prototype.constructor = htmlNodeCollection;
		htmlNodeCollection.prototype.htmlNodeCollection = true;
	}
});