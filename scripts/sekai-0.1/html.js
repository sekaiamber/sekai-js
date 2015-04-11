// =================================================================
// sekai.js prototype 0.1
// module : html
// description : 负责html文档处理的模块。
// =================================================================

sekai.define("html", ["__CORE__"], function(_c_){}, {
	initialize: function(sekai){
		var html = {};
		html.supportAdjacent = false;
		var rnest = html.rnest = /<(?:tb|td|tf|th|tr|col|opt|leg|cap|area)/;
		var rxhtml = html.rxhtml = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig;
		var rcreate = html.rcreate = sekai.support.noscope ? /(<(?:script|link|style|meta|noscript))/ig : /[^\d\D]/;
		var adjacent = "insertAdjacentHTML";
		var TAGS = html.TAGS = "getElementsByTagName";
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
			if ( sekai.support.cloneHTML5 && //====TODO====增加判定是否支持cloneHTML5
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

		/////// Clean node
		html.cleanNode = function(node) {
			// ====TODO====移除数据及属性

		};

		/////// innerHtml, innerText, outerHTML等，凡是需要逐个检索node元素的函数的共同入口
		html.accessNode = function(elems, callback, directive, args) {
			//用于统一配置多态方法的读写访问，涉及方法有text, html, outerHTML,data, attr, prop, val, css
			var length = elems.htmlNode ? 1 : elems.length,
				key = args[0],
				value = args[1];
			//读方法
			if (args.length === 0 || args.length === 1 && typeof directive === "string") {
				var first = elems.htmlNode ? elems : elems[0];//由于只有一个回调，我们通过this == $判定读写
				return first && first.dom.nodeType === 1 ? callback.call(sekai, first, key) : void 0;
			} else {
			//写方法
				if (directive === null) {
					callback.call(elems, args);
				} else {
					if (typeof key === "object") {
						for (var k in key) { //为所有元素设置N个属性
							for (var i = 0; i < length; i++) {
								callback.call(elems, elems[i], k, key[k]);
							}
						}
					} else {
						for (i = 0; i < length; i++) {
							callback.call(elems, elems[i], key, value);
						}
					}
				}
			}
			return elems;//返回自身，链式操作
		};
		// 兼容XML
		html.innerHTML = function(el) { 
			for (var i = 0, c, ret = []; c = el.childNodes[i++]; ) {
				ret.push(outerHTML(c));
			}
			return ret.join("");
		};
		html.getText = function(els) {
			for(var i = 0, ret = "", node; node = els[i++];) {
				// 处理文本结点与CDATA内容
				if (node.nodeType === 3 || node.nodeType === 4) {
					ret += node.nodeValue;
				} else if (node.nodeType !== 8) {
					ret += getText(node.childNodes);
				};
			}
			return ret;
		};
		html.outerHTML = function(el) {
			switch (el.nodeType + "") {
				case "1":
				case "9":
					return "xml" in el ? el.xml : new XMLSerializer().serializeToString(el);
				case "3":
				case "4":
					return el.nodeValue;
				default:
					return "";
			}
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
		'remove,empty,detach'.replace(sekai.rword, function(method) {
			htmlNode.prototype[method] = function() {
				var isRemove = method !== "empty";
				if (this.dom.nodeType === 1) {
					var array = sekai.toArray(this.dom[sekai.html.TAGS]("*")).concat(isRemove ? this.dom : []);
					if (method !== "detach") {
						array.forEach(sekai.html.cleanNode);
					};
				};
				if (isRemove) {
					if (this.dom.parentNode) {
						this.dom.parentNode.removeChild(this.dom);
						this.dom = null;
					};
				} else {
					while(this.dom.firstChild) {
						this.dom.removeChild(this.dom.firstChild);
					}
				};
				return this;
			}
		});
		//取得或设置节点的innerHTML属性
		htmlNode.prototype.html = function(item) { 
			return sekai.html.accessNode(this, function(el, value) {
				if (this === sekai) { //getter 这里兼容XML
					return "innerHTML" in el.dom ? el.dom.innerHTML : sekai.html.innerHTML(el);
				} else { //setter
					value = item == null ? "" : item + ""; //如果item为null, undefined转换为空字符串，其他强制转字符串
					//接着判断innerHTML属性是否符合标准,不再区分可读与只读
					//用户传参是否包含了script style meta等不能用innerHTML直接进行创建的标签
					//及像col td map legend等需要满足套嵌关系才能创建的标签, 否则会在IE与safari下报错
					if (sekai.support.innerHTML && (!sekai.html.rcreate.test(value) && !sekai.html.rnest.test(value))) {
						try {
							el.dom.innerHTML = value;
							return;
						} catch (e) {	};
					}
					this.empty().append(value);
				}
			}, null, arguments);
		};
		// 取得或设置节点的text或innerText或textContent属性
		htmlNode.prototype.text = function(item) {
			return sekai.html.accessNode(this, function(el) {
				el = el.dom ? el.dom : el.doms ? el.doms : el;
				var tar = this.dom ? this.dom.ownerDocument : this.doms ? this.doms[0].ownerDocument : this;
				if (this === sekai) { //getter
					if (el.tagName === "SCRIPT") {
						return el.text;//IE6-8下只能用innerHTML, text获取内容
					}
					return el.textContent || el.innerText || sekai.html.getText([el]);
				} else { //setter
					this.empty().append(tar.createTextNode(item));
				}
			}, null, arguments);
		};
		// 取得或设置节点的outerHTML
		htmlNode.prototype.outerHTML = function(item) { 
			return sekai.html.accessNode(this, function(el) {
				el = el.dom ? el.dom : el.doms ? el.doms : el;
				if (this === sekai) { //getter
					return "outerHTML" in el ? el.outerHTML : sekai.html.outerHTML(el);
				} else { //setter
					this.empty().replace(item);
				}
			}, null, arguments);
		}
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
		'remove,empty,detach'.replace(sekai.rword, function(method) {
			htmlNodeCollection.prototype[method] = function() {
				for(var i = 0, node; node = this[i++];) {
					node[method]();
				};
				return this;
			}
		});
		htmlNodeCollection.prototype.html = function(item) { //取得或设置节点的innerHTML属性
			return sekai.html.accessNode(this, function(el, value) {
				if (this === sekai) { //getter 这里兼容XML
					return "innerHTML" in el.dom ? el.dom.innerHTML : sekai.html.innerHTML(el);
				} else { //setter
					value = item == null ? "" : item + ""; 
					if (sekai.support.innerHTML && (!sekai.html.rcreate.test(value) && !sekai.html.rnest.test(value))) {
						try {
							for (var i = 0; el = this[i++]; ) {
								el.dom.innerHTML = value;
							};
							return;
						} catch (e) {	};
					}
					this.empty().append(value);
				}
			}, null, arguments);
		};
		htmlNodeCollection.prototype.text = function(item) {
			if (item) {
				return htmlNode.prototype.text.call(this, item);	
			} else {
				return htmlNode.prototype.text.call(this);
			};
		};
		htmlNodeCollection.prototype.outerHTML = function(item) {
			if (item) {
				return htmlNode.prototype.outerHTML.call(this, item);	
			} else {
				return htmlNode.prototype.outerHTML.call(this);
			};
		};

	}
});