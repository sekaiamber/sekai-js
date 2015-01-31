// =================================================================
// sekai.js prototype 0.1
// module : html
// description : 负责html文档处理的模块。
// =================================================================

sekai.define("html", ["__CORE__"], function(_c_){

});
sekai.entity("html")();

function htmlNode(proto) {
	this.dom = proto;
};
function manipulate(nodes, name, item, doc){
	console.log(name);
};
htmlNode.prototype.methods = ['append','prepend','before','after','replace'];
htmlNode.prototype.htmlNode = true;
for (var i = 0; i < htmlNode.prototype.methods.length; i++) {
	var mt = htmlNode.prototype.methods[i];
	htmlNode.prototype[mt] = function(item) {
		item = item.htmlNode ? item.dom : item;
		return manipulate(this.dom, mt, item, this.dom.ownerDocument);
	};
	htmlNode.prototype[mt + "To"] = function(item) {
		if (this.htmlNode) {
			item[mt](this);
		} else {
			var selector = sekai.entity("selector")();
			manipulate(selector(item, this.dom.ownerDocument), mt, this.dom, this.dom.ownerDocument);
		};
		return this;
	};
};


sekai.define("htmlNode", ["__CORE__"], function(_c_){
	
});
sekai.entity("html")();