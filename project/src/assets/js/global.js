(function (window, document) {
	// 函数扩展
	// 日期函数
	Date.prototype.Format = function(fmt){ 
		if(fmt == null) {
			// 若未设置格式。
			fmt = "yyyy-MM-dd hh:mm:ss"
		}
		var o = {   
			"M+" : this.getMonth()+1,                 //月份   
			"d+" : this.getDate(),                    //日   
			"h+" : this.getHours(),                   //小时   
			"m+" : this.getMinutes(),                 //分   
			"s+" : this.getSeconds(),                 //秒   
			"q+" : Math.floor((this.getMonth()+3)/3), //季度   
			"S"  : this.getMilliseconds()             //毫秒   
		};
		
		if(/(y+)/.test(fmt)) {	
			fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
		}
		
		for(var k in o) {		
			if(new RegExp("("+ k +")").test(fmt)) {	    	
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
			}
		}
		
		return fmt;   
	}



	let oRt = {
		/**
		 * 计算时间差。
		 * @param {String || Date || Number} start
		 * @param {String || Date || Number} end
		 * @return {Number}
		 */
		DateDiff:　function(start, end) {
			let dStart = start,
				dEnd = end;

			if(!(start instanceof Date)) {
				dStart = new Date(start);
			}

			if(!(end instanceof Date)) {
				dEnd = new Date(end);
			}

			return dEnd.getTime() - dStart.getTime();
		},


		/**
		 * 获取对象的键值。
		 * @param {Object} oParam
		 * @return {Array}
		 */
		getObjectValues: function(oParam) {
			let aValues = [];
			
			for(let sParam in oParam) {
				aValues.push(oParam[sParam]);
			}
			
			// 返回键值。
			return aValues;
		},


		/**
		 * 判断对象是否为空对象。
		 * @param {Object} e
		 * @return {Boolean}
		 */
		isEmptyObject: function(e) {  
			var t;  
			for (t in e)  
				return !1;  
			return !0  
		},


		/**
		 * 导出Json为excel。依赖xlsx、blob、file-saver。
		 * @param {Array || Object} oTableData
		 * # type 1 
		 * # [{add: "ann", age: 1}]
		 * # type 2
		 * # {data: [{add: "ann", age: 1}]}
		 * # type 3
		 * # {
		 * #	columns: [{name: "地址", prop: "add"},{name: "年龄", prop: "age"}],
		 * #	data: [{add: "ann", age: 1}, {add: "bbb", age: 2}]
		 * #	filename: "下载"
		 * # }
		 * @return {void}
		 */
		exportJson2Excel: function(XLSX, Blob, FileSaver, oTableData) {	
			let aoTableJson = this.parseTableData(oTableData);

			if (!aoTableJson.length) {
				return;
			}
			// 创建表格。
			let wb = {
					SheetNames: ["Sheet1"],
					Sheets: {
						// 创建sheet
						Sheet1: XLSX.utils.json_to_sheet(aoTableJson)
					}
			}
		
			let wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
	
			let sFileName = (oTableData && oTableData.filename) || "table";
	
			// 下载表格。
			FileSaver.saveAs(new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' }), sFileName + ".xlsx");            	
		},

		/**
		 * 导出带合并单元格的表格为excel。依赖xlsx、blob、file-saver。
		 * @param {Array || Object} oTableData
		 * # type 1 
		 * # [{add: "ann", age: 1}]
		 * # type 2
		 * # {data: [{add: "ann", age: 1}]}
		 * # type 3
		 * # {
		 * #	columns: [{name: "地址", prop: "add"},{name: "年龄", prop: "age"}],
		 * #	data: [{add: "ann", age: 1}, {add: "bbb", age: 2}]
		 * #	filename: "下载"
		 * # }
		 * @return {void}
		 */
		exportMergeTable2Excel: function (XLSX, Blob, FileSaver, oTableData, oElement) { 
			let aoTableJson = this.parseTableData(oTableData);
			
			if (!aoTableJson.length) {
				return;
			}
			// 创建表格。
			let jsonSheet = XLSX.utils.json_to_sheet(aoTableJson),
				wb = XLSX.utils.table_to_book(oElement),
				sheet = wb.Sheets[wb.SheetNames[0]];
			
			for(let p in sheet)	{
				if(jsonSheet[p] && sheet[p]) {
					sheet[p] = jsonSheet[p]
				}			
			}

			let wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
			
			let sFileName = (oTableData && oTableData.filename) || "table";
	
			// 下载表格。
			FileSaver.saveAs(new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' }), sFileName + ".xlsx");            	
			
		},
		/**
		 * 数据转换。
		 * @param{Object} oTableData
		 * @return{Array}
		 */
		parseTableData: function(oTableData) {
			let oData = Object.assign({}, oTableData);
			
			let aoTableJson = [];
	
			if(oTableData instanceof Array ) {
				// 若为数组。
				aoTableJson = oData;
			}else if(!oData.columns || !oData.columns.length) {
				// 若无表头配置数据
				aoTableJson = oData.data || [];
			}else if(oData.data && oData.data.length){
				// 若有表头配置数据,且有数据。
				if(oData.filteredData && oData.filteredData.length) {
					// 若有过滤数据，打印过滤数据。
					oData.data = oData.filteredData;
				}
	
				oData.data.map(o => {
					let oNewData = {};
	
					oData.columns.map(col => {
						oNewData[col.name] = o[col.prop]==undefined ? (col.type==='number' ? 0 : '') :(col.formatter ? col.formatter(o) : o[col.prop]);
					})
	
					aoTableJson.push(oNewData);
				})
	
			}else if(oData.columns) {
				// 若有表头数据。
				let oNewData = {};
	
				oData.columns.map(col => {
					oNewData[col.name] = '';
				})
	
				aoTableJson.push(oNewData);			
			}

			return aoTableJson;
		},
		/**
		 * 导出Table为excel。依赖xlsx、blob、file-saver。
		 * @param {Element} oElement table节点
		 * @param {String} sFileName 文件名
		 * @return {void}
		 */
		exportTable2Excel: function (XLSX, Blob, FileSaver, oElement, sFileName, oFormat) {
			// 根据table节点生产表。
			let wb = XLSX.utils.table_to_book(oElement),
				sheet = wb.Sheets[wb.SheetNames[0]];

			if(oFormat.date) {
				for(let p in sheet) {
					if(sheet[p].t == "n" && sheet[p].z == "m/d/yy") {
						// 若为日期，则改变格式为"yyyy/mm/dd HH:MM:ss"
						sheet[p].z = oFormat.date;
					}
				}
			}
	
			let wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
	
			// 下载表格。
			FileSaver.saveAs(new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' }), (sFileName || "table") + ".xlsx");  
				
		},


		/**
		 * 数据转换
		 * @param {blob} s 
		 * @return {Buffer} buf
		 */
		s2ab: function (s) {
			if(typeof ArrayBuffer !== 'undefined') {
				let buf = new ArrayBuffer(s.length);
				let view = new Uint8Array(buf);
				for (let i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
				return buf;
			} else {
				let buf = new Array(s.length);
				for (let i=0; i!=s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
				return buf;
			}
		},
		

		/**
		 * 页面节点内容打印。依赖html2Canvas。
		 * @param {Element} element
		 * @param {Object} option
		 * @param {Boolean} isClear 是否清空，默认不清空 -- 查出库中的表格print内容是复制的内容需清空
		 * @return {void}
		 */		
		printHtml: function(html2canvas,element, option, isClear) {
			// 将页面转换为图片。
			html2canvas(element, Object.assign(option || {}, {
				onrendered: function(canvas) {
					var sImg = canvas.toDataURL("image/png");
						
					// 打印
					var w = window.open("","image from cancas");

					var oImg = new Image()
					
					oImg.addEventListener("load", () => {
						// 等图片加载完成，再打印。
						// 打印图片。
						w.print();
						
						w.close();
					}, false)
					
					oImg.src = sImg
					w.document.body.appendChild(oImg)
					// w.document.write("<img src='"+sImg+"' alt='from canvas'>")
					
					// 解决打印弹窗不出来问题
					// w.document.close()
					w.focus()
					
//					setTimeout(function() {
						// 打印图片。
						// w.print();
						
						// w.close();
//					},200)
					
					if(isClear) {
						element.innerHTML = "";
					}
				}
			})); 
		},


		/**
		 *  将页面中的数据下载。 rasterizeHTML
		 *  @param {Element} sHtml	 需打印的内容
		 *  @param {Object} option
		 *  @return {void}
		 */
		rasterizeHTML: function(rasterizeHTML,sHtml, option) {
			let canvas = document.createElement("canvas");
			
			rasterizeHTML.drawHTML(sHtml, canvas, option || {}).then(function(res) {
				var w = window.open("","image from cancas");
				
				w.document.body.appendChild(res.image);
				
				// 解决打印弹窗不出来问题
				w.document.close()
				w.focus()
				
//				setTimeout(function() {
					// 打印图片。
					w.print();
					
					w.close();
//				},200)
			})
		},


		/**
		 * 页面转化为图片并下载。依赖html2Canvas。
		 * @param {Element} element
		 * @param {Object} option
		 * @return {void}
		 */
		downloadHtml: function(html2canvas, element, filename, option) {
			// 将页面转换为图片。
			html2canvas(element, Object.assign(option || {}, {
				onrendered: function(canvas) {
					var sImg = canvas.toDataURL("image/png"),
						oLink = document.createElement("a");
	
					oLink.style.display = "none";
					oLink.setAttribute("href",sImg); 
					oLink.setAttribute("download", filename || "page" + ".png"); 
					element.parentNode.appendChild(oLink);
					oLink.click();
					oLink.remove();
				}
			}));
		},


		/**
		 * 从 URL 中读成某个参数值。
		 *
		 * @method getParam
		 * @param {String} sName
		 * @param {String|undefined} sUrl ({location.href})
		 * @return {String}
		 */
		getParam: function(sName, sUrl) {
			return this.getParams(sUrl)[sName] || "";
		},


		/**
		 * 获取 URL 中所有参数信息。
		 * 
		 * @param {String|undefined} sUrl ({location.href})
		 * @return {Object}
		 */
		getParams: function(sUrl) {
			// 参数与默认当前页面地址检测。
			sUrl = sUrl || location.href;
			// 过滤后面的锚点。
			sUrl = sUrl.replace(/#.*/g, "");
			// 取出 ? 后面的参数串。
			sUrl = sUrl.split("?")[1] || "";
//			sUrl = sUrl.substr(sUrl.indexOf("?")+1) || "";

			// 分解成参数对象。
			var aoParams = this.unparam(sUrl);


			return aoParams;
		},
		

		/**
		 * 将字数符反参数解决成对象。
		 * 
		 * @method
		 * @param {String} sParams
		 * @return {Object}
		 */
		unparam: function(sParams) {
			var asParams = (sParams || "").split("&"),
				oParams = {},
				asSplitedParam = []
			;

			for (var i = asParams.length - 1; i >= 0; i--) {
				asSplitedParam = asParams[i].split("=");
				oParams[asSplitedParam[0]] = asSplitedParam[1] || "";
			}

			return oParams;
		},
		

		/**
		 * 将对象转化成字符串。
		 * 
		 * @method
		 * @param {Object} oParams
		 * @return {String}
		 */
		param: function(oParams) {
			let sParams = ""

			for(let p in oParams) {
				sParams += `${p}=${oParams.p}&`
			}

			if(sParams) {
				sParams = sParams.substr(0, sParams.length - 1)
			}

			return sParams
		},

		/**
		 * 设置 URL 的参数。
		 * 
		 * @public
		 * @param {Object} oData 键值对对象。
		 * @param {String|undefined} sUrl ({locaiton.href})
		 * @return {String} 返回设置好的新 URL。
		 */
		setParams: function(oData, sUrl) {
			// 检测 URL 参数，如果没有传则使用当前页面地址。
			if (!sUrl) {
				sUrl = location.href;
			}
			
			
			// 设置各参数。
			if (oData) {
				for (var p in oData) {
					sUrl = this.setParam(p, oData[p], sUrl);
				}
			}
			
			
			return sUrl;
		},


		/**
		 * 设置 URL 的参数值。
		 * 
		 * 参数方式：
		 * 1、String, String[, String]
		 * 2、Object[String]
		 *
		 * @method setParam
		 * @param {String|Object} sName
		 * @param {String} sValue
		 * @param {String|undefined} sUrl ({location.href})
		 * @return {String} 返回设置好的新 URL。
		 */
		setParam: function(sName, sValue, sUrl) {
			// 要更新的参数数据。
			var oData = {};


			// 判断传入参数类型。
			if (typeof sName === "string") {
				// sName 为字符串类型，传参方式 1。

				oData[sName] = sValue;
			} else if (typeof sName === "object") {
				// sName 为对象类型，传参方式 2。

				sUrl = sValue;
				oData = sName;
			}
			
			
			// 检测 URL 参数，如果没有传则使用当前页面地址。
			if (!sUrl) {
				sUrl = location.href;
			}


			// 检测 URL 中的锚点，如果有锚点就先从 URL 中切割出来保留，后面只对没有锚点的 URL 进行处理。
			var nPoundIndex = sUrl.indexOf("#");
			var sPoundValue = "";
			if (nPoundIndex > -1) {
				sPoundValue = sUrl.substring(nPoundIndex + 1);
				sUrl = sUrl.substring(0, nPoundIndex);
			}


			// 获取 URL 的参数。
			var asHref = (sUrl || location.href).split("?"),
				oParams = asHref[1] ? this.unparam(asHref[1]) : {}
			;


			// 将传入的参数覆盖给 URL 参数。
			Object.assign(oParams, oData);


			// 组成新的 URL。
			var sNewHref = asHref[0] + "?" + this.param(oParams) + (sPoundValue ? "#" + sPoundValue : "");


			return sNewHref;
		},


		/**
		 * 删除 URL 中的参数项。
		 *
		 * @method removeParam
		 * @param {String} sName
		 * @param {String|undefined} sHref ({location.href})
		 * @return {String} 返回新的 URL。
		 */
		removeParam: function(sName, sHref) {
			var REMOVE_VALUE = "remove";

			return this.setParam(sName, REMOVE_VALUE, sHref)
				.replace(new RegExp("([\?&]?)" + sName + "=" + REMOVE_VALUE + "[&]?", "g"), "$1") // 过滤对应的参数项。
				.replace(/&$/, "") // 过滤最后一个多的 & 符号。
			;
		},


		/**
		 * 检测是否包含某参数项。
		 * 如果仅有参数名没有值，也算有。
		 * 
		 * @param {String} sName
		 * @param {String|undefined} sHref
		 * @return {Boolean}
		 */
		hasParam: function(sName, sHref) {
			return this.getParams(sUrl)[sName] != null;
		},
		
		/**
		 * 判断是否为正确的时间格式.
		 * @param {String} sTime
		 * @return {Boolean}
		 */
		isDateTime: function(sTime) {
			var sReg = /^(\d+)-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/,
				sRs = (sTime || "").match(sReg)
			
			// 返回判断是否为正确的格式结果.
			if(sRs == null) {
				return false
			}else {
				return true
			}
		},
		
		/**
		 * 判断是否为正确的日期格式.
		 * @param {String} sDate
		 * @return {Boolean}
		 */
		isDate: function(sDate) {
			var sReg = /^(\d+)-(\d{1,2})-(\d{1,2})$/,
				sRs = (sDate || "").match(sReg)
		
			// 返回判断是否为正确的格式结果.
			if(sRs == null) {
				return false
			}else {
				return true
			}
		},

		/**
		 * Get the value of a cookie with the given name.
		 *
		 * @example Rt.utils.cookie('the_cookie');
		 * @desc Get the value of a cookie.
		 *
		 * @param String name The name of the cookie.
		 * @return The value of the cookie.
		 * @type String
		 *
		 * @name Rt.utils.cookie
		 * @cat Plugins/Cookie
		 * @author Klaus Hartl/klaus.hartl@stilbuero.de
		 */
		cookie: function(name, value, options) {
			if (typeof value != 'undefined') { // name and value given, set cookie
				options = options || {};
				if (value === null) {
					value = '';
					options.expires = -1;
				}
				var expires = '';
				if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
					var date;
					if (typeof options.expires == 'number') {
						date = new Date();
						date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
					} else {
						date = options.expires;
					}
					expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
				}
				var path = options.path ? '; path=' + options.path : '';
				var domain = options.domain ? '; domain=' + options.domain : '';
				var secure = options.secure ? '; secure' : '';
				document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
			} else { // only name given, get cookie
				var cookieValue = null;
				if (document.cookie && document.cookie != '') {
					var cookies = document.cookie.split(';');
					for (var i = 0; i < cookies.length; i++) {
						var cookie = cookies[i].trim();
						// Does this cookie string begin with the name we want?
						if (cookie.substring(0, name.length + 1) == (name + '=')) {
							cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
							break;
						}
					}
				}
				return cookieValue;
			}
		},
		
		/*
		 * 去除对象中重复的项
		 * @public
		 * @param {Array} aoData
		 * @param {String} sAttr
		 * @return {Array} aoNewData
		 */
		uniqueObject: function(aoData, sAttr){
			
			// 检测数据有效性，如果无效则直接返回一个空数组。
			if (!aoData) {
				return [];
			}

			// 获取所有项，存到一个对象中，可以过滤重复的。
			var oItems = {};
			for (var i = aoData.length - 1; i >= 0; i--) {
				oItems[aoData[i][sAttr]] = aoData[i];
			}

			// 将所有项再依次放入新数组，完成过滤。
			var aoNewData = [];
			for (var p in oItems) {
				aoNewData.push(oItems[p]);
			}

			return aoNewData;
		}

	}

	window.Rt = {};
	
	window.Rt.utils = oRt;

})(window,document);