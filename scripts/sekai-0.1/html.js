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
		var rxhtml = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig;
		var rcreate = sekai.support.noscope ? /(<(?:script|link|style|meta|noscript))/ig : /[^\d\D]/;
		var adjacent = "insertAdjacentHTML";
		var TAGS = "getElementsByTagName";
		var rtagName = /<([\w:]+)/;
		//////// parseHTML
		// 这部分源自mass，是从JQuery来的。
		var tagHooks = {
			area: [1, "<map>"],
			param: [1, "<object>"],
			col: [2, "<table><tbody></tbody><colgroup>", "</table>"],
			legend: [1, "<fieldset>"],
			option: [1, "<select multiple='multiple'>"],
			thead: [1, "<table>", "</table>"],
			tr: [2, "<table><tbody>"],
			td: [3, "<table><tbody><tr>"],
			//IE6-8在用innerHTML生成节点时，不能直接创建no-scope元素与HTML5的新标签
			_default: sekai.support.noscope ? [1, "X<div>"] : [0, ""] //div可以不用闭合
		};
		try {
            var range = sekai.DOC.createRange();
            range.selectNodeContents(body.firstChild || body); 
            //fix opera(9.2~11.51) bug,必须对文档进行选取，尽量只选择一个很小范围
            support.fastFragment = !! range.createContextualFragment("<a>");
            sekai.cachedRange = range;
        } catch(e) {};
		html.parseHTML = function(_html, doc){
			doc = doc || this.nodeType === 9 && this || document;
			_html = sekai.trim(_html.replace(rxhtml, "<$1></$2>"));
			//尝试使用createContextualFragment获取更高的效率
			//http://www.cnblogs.com/rubylouvre/archive/2011/04/15/2016800.html
			if (sekai.cachedRange && doc === document && !rcreate.test(_html) && !rnest.test(_html)) {
				return $.cachedRange.createContextualFragment(_html);
			}
			if (sekai.support.noscope) { //fix IE
				_html = _html.replace(rcreate, "<br class=fix_noscope>$1"); //在link style script等标签之前添加一个补丁
			}
			var tag = (rtagName.exec(_html) || ["", ""])[1].toLowerCase(),
			//取得其标签名
			wrap = tagHooks[tag] || tagHooks._default,
			fragment = doc.createDocumentFragment(),
			wrapper = doc.createElement("div"),
			firstChild;
			wrapper.innerHTML = wrap[1] + _html + (wrap[2] || "");
			var els = wrapper[TAGS]("script");
			if (els.length) { //使用innerHTML生成的script节点不会发出请求与执行text属性
				var script = doc.createElement("script"), neo;
				for (var i = 0, el; el = els[i++]; ) {
					if (!el.type || types[el.type]) { //如果script节点的MIME能让其执行脚本
						neo = script.cloneNode(false); //FF不能省略参数
						for (var j = 0, attr; attr = el.attributes[j++]; ) {
							if (attr.specified) { //复制其属性
								neo[attr.name] = attr.value;
							}
						}
						neo.text = el.text; //必须指定,因为无法在attributes中遍历出来
						el.parentNode.replaceChild(neo, el); //替换节点
					}
				}
			}
			//移除我们为了符合套嵌关系而添加的标签
			for (i = wrap[0]; i--; wrapper = wrapper.lastChild) {};
			html.fixParseHTML(wrapper, _html);
			while (firstChild = wrapper.firstChild) { // 将wrapper上的节点转移到文档碎片上！
				fragment.appendChild(firstChild);
			}
			return fragment;
		}
		html.fixParseHTML = function(wrapper, html) {
			if (sekai.support.noscope) { //移除所有br补丁
				for (els = wrapper["getElementsByTagName"]("br"), i = 0; el = els[i++];) {
					if (el.className && el.className === "fix_noscope") {
						el.parentNode.removeChild(el);
					}
				}
			}
			//当我们在生成colgroup, thead, tfoot时 IE会自作多情地插入tbody节点
			if (!sekai.support.insertTbody) {
				var noTbody = !rtbody.test(html),
					//矛:html本身就不存在<tbody字样
					els = wrapper["getElementsByTagName"]("tbody");
				if (els.length > 0 && noTbody) { //盾：实际上生成的NodeList中存在tbody节点
					for (var i = 0, el; el = els[i++];) {
						if (!el.childNodes.length) //如果是自动插入的里面肯定没有内容
						el.parentNode.removeChild(el);
					}
				}
			}
			//IE67没有为它们添加defaultChecked
			if (!sekai.support.appendChecked) {
				for (els = wrapper["getElementsByTagName"]("input"), i = 0; el = els[i++];) {
					if (el.type === "checkbox" || el.type === "radio") {
						el.defaultChecked = el.checked;
					}
				}
			}
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
				var fast = (name !== 'replace') && sekai.support[adjacent] && !rnest.test(item);
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
				handler(el, makeFragment(item, fragment, i > 0));
			};
		};
		function makeFragment (nodes, fragment, bool) {
			var ret = fragment.cloneNode(false);
			for (var i = 0, node; node = nodes[i]; i++) {
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
			// if (node.nodeType === 1) {
			if(false) {
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
	} else if (typeof proto === 'string') {
		this.dom = sekai.html.parseHTML(proto, sekai.DOC).childNodes[0];
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
					item = item.doms;
				};
				return sekai.html.manipulate([this.dom], method, item, this.dom.ownerDocument);
			};
			htmlNode.prototype[method + "To"] = function(item) {
				if (item.htmlNode || item.htmlNodeCollection) {
					item[method](this);
				} else if (item.nodeType) {
					sekai.html.manipulate(item, method, this.dom, this.dom.ownerDocument);
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
	this.doms = [];
	if (sekai.isArray(protos)) {
		for (var i = 0, proto; proto = protos[i]; i++) {
			this.push(new htmlNode(proto));
		};
	} else if(protos.nodeType) {
		this.push(new htmlNode(protos));
	} else if (typeof protos === 'string') {
		var fragment = sekai.html.parseHTML(protos, sekai.DOC).childNodes;
		for (var i = 0, proto; proto = fragment[i]; i++) {
			this.push(new htmlNode(proto));
		};
	};
	for (var i = 0, node; node = this[i]; i++) {
		this.doms.push(node.dom);
	};
};
sekai.define("htmlNodeCollection",[], function(protos) {
	return new htmlNodeCollection(protos);
}, {
	initialize: function(sekai){
		htmlNodeCollection.prototype = [];
		htmlNodeCollection.prototype.constructor = htmlNodeCollection;
		htmlNodeCollection.prototype.htmlNodeCollection = true;
		'append,prepend,before,after,replace'.replace(sekai.rword, function(method) {
			htmlNodeCollection.prototype[method] = function(item) {
				var doc = this.doms[0] ? this.doms[0].ownerDocument : document;
				if (item.htmlNode) {
					item = item.dom;
				} else if (item.htmlNodeCollection) {
					item = item.doms;
				};
				return sekai.html.manipulate(this.doms, method, item, doc);
			};
			htmlNodeCollection.prototype[method + "To"] = function(item) {
				var doc = this.doms[0] ? this.doms[0].ownerDocument : document;
				if (item.htmlNode || item.htmlNodeCollection) {
					item[method](this);
				} else if (item.nodeType) {
					sekai.html.manipulate(item, method, this.doms,doc);
				};
				return this;
			};
		});
	}
});