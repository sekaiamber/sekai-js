// =================================================================
// sekai.js prototype 0.1
// module : string
// description : 字符串处理模块。
// =================================================================

sekai.define("__STRING__", ["__CORE__"], function(_c_){
	//alert("string" + _c_);
	_c_.mix(_c_, {
		contains : function(target, str, separator) {
			return separator ?
				(separator + target + separator).indexOf(separator + str + separator) > -1 :
				target.indexOf(str) > -1;
		},
		startsWith : function(target, str, ignorecase) {
			var sstr = target.substr(0, str.length);
			return ignorecase ? sstr.toLowerCase() === str.toLowerCase() :
				sstr === str;
		},
		endsWith : function(target, str, ignorecase) {
			var estr = target.substring(target.length - str.length);
			return ignorecase ? estr.toLowerCase() === str.toLowerCase() :
				estr === str;
		},
		repeat : function(target, n) {
			var s = target, total = "";
			while(n > 0) {
				if(n%2==1) total += s;
				if (n==1) break;
				s+=s;
				n=n>>1;
			}
			return total;
		},
		/*
		* http://www.alloyteam.com/2013/12/js-calculate-the-number-of-bytes-occupied-by-a-string
		*/
		byteLen : function(target, charset) {
			var total = 0, charCode, i, len;
			charset = charset ? charset.toLowerCase() : '';
			if (charset == 'utf-16' || charset == 'utf16') {
				for (i = 0; i < target.length; i++) {
					charCode = target.charCodeAt(i);
					total += charCode <= 0xffff ? 2 : 4;
				};
			} else {
				for (i = 0; i < target.length; i++) {
					charCode = target.charCodeAt(i);
					total += charCode <= 0x007f ? 1 : (charCode <= 0x07ff ? 2 : (charCode <= 0xffff ? 3 : 4));
				};
			};
			return total;
		},
		// 多余字符截断为...
		truncate : function(target, length, truncation) {
			if (!length || target.length < length) return target;
			truncation = truncation === void 0 ? '...' : truncation;
			return target.slice(0, length - truncation.length) + truncation;
		},
		/*
		* 一组格式化方法
		*/
		// 驼峰式 wordWordWord
		toCamelize : function(target){
			if (target.indexOf('-') < 0 && target.indexOf('_') <0) return target;
			return target.replace(/[-_][^-_]/g, function(m) {
				return m.charAt(1).toUpperCase();
			});
		},
		// 下划线 word_word_word
		toUnderscored : function(target) {
			return target.replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/\-/g, '_').toLowerCase();
		},
		// 横杆CSS word-word-word
		toDasherize : function(target) {
			return target.replace(/([a-z\d])([A-Z])/g, '$1-$2').replace(/_/g, '-').toLowerCase();	
		},
		// 首字母大写
		capitalize : function(target) {
			return target.charAt(0).toUpperCase() + target.substring(1).toLowerCase();
		},
		// 移除HTML中的script标签及内容
		stripScripts : function (target) {
			return String(target || "").replace(/<script[^>]*>([\S\s]*?)<\/script>/img, '');
		},
		// 移除HTML标签，除非保证其中没有script，不然要先运行stripScripts
		stripHtmlTags : function (target) {
			return String(target || "").replace(/<[^>]+>/g, '');
		},
		// 转义HTML标签
		escapeHTML : function (target) {
			return target.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
		},
		unescapeHTML : function (target) {
			return target.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");	
		},
		// 两端补齐，多数时候是补0，可以选择补全符号，是否是右补全，进制
		pad : function (target, n, filling, right, radix) {
			var num = target.toString(radix || 10);
			filling = filling || "0";
			while(num.length < n){
				if (!right) {
					num = filling + num;
				} else {
					num += filling;
				};
			}
			return num;
		},
		// 格式化输入，可以匹配%{n}%，也可以传入一个类，匹配%name%
		// 比如 format("%0%, %1%", '1st', '2nd')，也可以format("%name1%, %name2%", {name1:"1st", name2:"2nd"})
		format : function (target, obj) {
			var args = _c_.toArray(arguments, 1);

			return target.replace(/%{1}([^%]+)%{1}/gm, function(match, name) {
				var i = Number(name);
				console.log(i + "-" + args.length + "-" + (i >= 0 && i < args.length));
				if (i > 0) if(i < args.length) { return args[i] } else { return match };
				if (i = 0) if(String(args[i]).toLowerCase() != '[object object]') { return args[i] } else { return match };
				if (obj && obj[name] != void 0) return obj[name];
				console.log(match +":"+ name);
				return match;
			});
		},
		// 逆天版本的trim，值得收藏，from PHP.js
		trim : function (target, trimChars) {
			var white = trimChars != void 0 ? trimChars : ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
			for (var i = 0; i < target.length; i++) {
				if (white.indexOf(target.charAt(i)) === -1) {
					target = target.substring(i);
					break;
				};
			};
			for (var i = target.length - 1; i >= 0; i--) {
				if (white.indexOf(target.charAt(i)) === -1) {
					target = target.substring(0, i+1);
					break;
				};
			};
			return white.indexOf(target.charAt(0)) === -1 ? target : '';
		},
		trimEnd : function (target, trimChars) {
			var white = trimChars != void 0 ? trimChars : ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
			for (var i = 0; i < target.length; i++) {
				if (white.indexOf(target.charAt(i)) === -1) {
					target = target.substring(i);
					break;
				};
			};
			return white.indexOf(target.charAt(0)) === -1 ? target : '';
		},
		trimStart : function (target, trimChars) {
			var white = trimChars != void 0 ? trimChars : ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
			for (var i = target.length - 1; i >= 0; i--) {
				if (white.indexOf(target.charAt(i)) === -1) {
					target = target.substring(0, i+1);
					break;
				};
			};
			return white.indexOf(target.charAt(target.length - 1)) === -1 ? target : '';
		}
	});
});
sekai.entity("__STRING__")();