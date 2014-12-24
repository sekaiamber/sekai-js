// DEBUG
// 启用其他周边模块
sekai.using([
	'./scripts/sekai-0.1/types.js',	// 判定类型模块
	'./scripts/sekai-0.1/array.js',	// 数组扩展修复模块
	'./scripts/sekai-0.1/string.js',	// 字符串处理模块
	'./scripts/sekai-0.1/number.js',	// 数字扩展修复模块
	'./scripts/sekai-0.1/function.js',	// 函数扩展修复模块
	'./scripts/sekai-0.1/lambda.js',	// lambda模块
	'./scripts/sekai-0.1/date.js',	// 日期扩展修复模块
	'./scripts/sekai-0.1/selector.js',	// 选择器模块
], function(){
	/*
	$$.noConflict();
	console.log($$.info);
	*/
	/*
	$$.define("D", ["A", "B", "C"], function(B, A, C) {
		return B + A + C;
	});
	$$.define("A", [], function() {
		return "a";
	});
	$$.define("B", [], function() {
		return "b";
	});
	$$.define("C", [], function() {
		return "c";
	});
	var D = $$.entity("D");
	alert(D);
	*/
	/*
	$$.using(['scripts/helloWorld.js', 'scripts/alert.js'], function(){
		alert('finish.');
	}, true);
	*/
	/*
	var t = sekai.mix({
		name : 'Li Lei',
		age : 12,
		sex : 'm'
	},{
		age : 13,
		school : 'UJ'
	}, {
		company : 'hik'
	});
	var t2 = $$.toArray([0,1,2,3,4,5], 3, -1);
	console.log(t);
	*/
	/*
	var aaa = "class1Class2_Class3";
	var bbb = "<script src='asfsaf'>asfsafasf</script> <div>1111</div>";
	var ccc = "&lt;script src=&#39;asfsaf&#39;&gt;asfsafasf&lt;/script&gt; &lt;div&gt;1111&lt;/div&gt;";
	var ddd = 45;
	var eee = "this is a %0%, %1%, %name%";
	var fff = "     123456    ";
	console.log($$.trim(fff));
	*/

	// var a = [1,2,3,4,2,3,4];
	// console.log(a.forEach(function(e,i,aaa){
	// 	console.log(e);
	// 	console.log(i);
	// 	console.log(aaa);
	// }));
	// console.log(a.filter(function(e,i,aaa){
	// 	return e % 2 == 0;
	// }));
	// console.log(a.map(function(e,i,aaa){
	// 	return e*2;
	// }));
	// console.log(a.some(function(e,i,aaa){
	// 	return e==3;
	// }));
	// console.log(a.every(function(e,i,aaa){
	// 	return e>0;
	// }));
	// console.log(a.reduce(function(res, e, i, a) {
	// 	console.log(res);
	// 	console.log(e);
	// 	console.log(i);
	// 	console.log(a);
	// 	return res + e;
	// }));
	// console.log(a.contains(6));
	// console.log(a.removeAt(3));
	// console.log(a);
	// var b = [
	// 	[1,2,3],
	// 	[4,5,6],
	// 	[
	// 		[7,8,9],
	// 		[10,11,12]
	// 	]
	// ];
	// console.log(b.flatten());
	//console.log(a.unique());
	// var c = [1,2,null,3, undefined,6];
	// console.log(c.compact());
	// var e = [
	// 	{name:"Li Lei", age:16, sex:"M"},
	// 	{name:"Tom", age:8, sex:"M"},
	// 	{name:"Lily", age:2, sex:"F"},
	// 	{name:"Han Meimei", age:18, sex:"F"},
	// ];
	// console.log(e.pluck("sex"));
	// console.log(e.groupBy("sex"));
	// console.log(e.sortBy(function(item, index) {
	// 	return item.age;
	// }))
	// var f = [2,4, 99];
	// console.log(a.union(f));
	// console.log(a.intersect(f));
	// console.log(a.diff(f));
	// console.log(a.min());
	// console.log(a.max());
	// console.log(a.max());
	
	// var a = [
	// 	{name:"Li Lei", age:16, sex:"M"},
	// 	{name:"Tom", age:8, sex:"M"},
	// 	{name:"Lily", age:2, sex:"F"},
	// 	{name:"Han Meimei", age:18, sex:"F"},
	// ];
	// //console.log($$.convertAll(a, "m=>   m * 2"));
	// console.log(a.where("m=>m.sex=='F'").select("m=>m.name"));

	// var a = new Date(Date.now());
	// console.log(a.toISOString());
	// var b = a.add(new TimeSpan(1000));
	// console.log(b.toISOString());
	// var c = b.sub(a);
	// console.log(c.milliseconds);
	// var d = b.sub(new TimeSpan(2000));
	// console.log(d.toISOString());
	// console.log(a.getFirstDayInMonth().toISOString());
	// console.log(a.getLastDayInMonth().toISOString());
	// console.log(a.getFirstDayInQuarter().toISOString());
	// console.log(a.getLastDayInQuarter().toISOString());
	// console.log(a.isLeapYear());
	// console.log(a.getDaysInMonth());

	// console.log($$.eventSupport("click"));
	// console.log($$.cssName("font"));


});
