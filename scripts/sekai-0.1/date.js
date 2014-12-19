// =================================================================
// sekai.js prototype 0.1
// module : date
// description : 日期类型处理、扩展、修复模块。
// =================================================================

sekai.define("__DATE__", ["__CORE__"], function(_c_){
	// alert("date"+_c_);
	// now
	if (!Date.now) {
		Date.now = function() {
			return +new Date;
		}
	};
	// ISO string
	if (!Date.prototype.toISOString) {
		function pad(number) {
			var r = String(number);
			if (r.length == 1) {
				r = '0' + r;
			};
			return r;
		};
		Date.prototype.toJSON = Date.prototype.toISOString = function () {
			return this.getUTCFullYear()
				+ '-' + pad(this.getUTCMonth() + 1)
				+ '-' + pad(this.getUTCDate())
				+ 'T' + pad(this.getUTCHours())
				+ ':' + pad(this.getUTCMinutes())
				+ ':' + pad(this.getUTCSeconds())
				+ '.' + String((this.getUTCMilliseconds()/1000).toFixed(3)).slice(2, 5)
				+ 'Z';
		};
	};
	// ie6,ie7 getYear和setYear存在bug
	if ((new Date).getYear() > 1900) {
		Date.prototype.getYear = function(){
			return this.getFullYear() - 1900;
		};
		Date.prototype.setYear = function(year) {
			return this.setFullYear(year); // +1900
		}
	};
	// 扩展TimeSpan
	function TimeSpan(m) {
		this.milliseconds = m;
		this.isTimeSpan = true;
	};
	TimeSpan.prototype.toSeconds = function() {
		return this.milliseconds / 1000;
	};
	TimeSpan.prototype.toMinutes = function() {
		return this.milliseconds / 1000 / 60;
	};
	TimeSpan.prototype.toHours = function() {
		return this.milliseconds / 1000 / 60 / 60;
	};
	TimeSpan.prototype.toDays = function() {
		return this.milliseconds / 1000 / 60 / 60 / 24;
	};
	window.TimeSpan = TimeSpan;
	// 一个时间加上一个间隔
	Date.prototype.add = function(span) {
		return new Date(this * 1 + span.milliseconds);
	};
	// 一个时间减去一个间隔或者一个时间减去一个时间
	Date.prototype.sub = function(item) {
		if (item.isTimeSpan) {
			// 时间减去间隔，返回时间
			return new Date(this * 1 - item.milliseconds);
		};
		if (sekai.isDate(item)) {
			// 时间减去时间，返回间隔
			return new TimeSpan(this * 1 - item * 1);
		};
	};
	// 时间定位扩展
	// 获得所在月第一天，当地时区
	Date.prototype.getFirstDayInMonth = function() {
		return new Date(this.getFullYear(), this.getMonth(), 1);
	};
	// 获得所在月最后一天，当地时区
	Date.prototype.getLastDayInMonth = function() {
		return new Date(this.getFullYear(), this.getMonth() + 1, 0);
	};
	// 获得所在季度第一天，当地时区
	Date.prototype.getFirstDayInQuarter = function() {
		return new Date(this.getFullYear(), ~~(this.getMonth() / 3)*3, 1);
	};
	// 获得所在季度最后一天，当地时区
	Date.prototype.getLastDayInQuarter = function() {
		return new Date(this.getFullYear(), ~~(this.getMonth() / 3)*3 + 3, 0);
	};
	// 判断是否为闰年，不要使用法则去判断，直接读取2月天数
	Date.prototype.isLeapYear = function() {
		return new Date(this.getFullYear(), 2, 0).getDate() == 29;
	};
	// 获取当月天数
	Date.prototype.getDaysInMonth = function() {
		return new Date(this.getFullYear(), this.getMonth()+1, 0).getDate();
	}
});
sekai.entity("__DATE__")();