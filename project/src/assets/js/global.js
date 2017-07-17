(function(window, document, undefined){
	// 函数扩展
	// 日期函数
	Date.prototype.Format = function(fmt){ 
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


	window.Rt = {};

	window.Rt.utils = {};
	/**
	 * 计算时间差。
	 * @param {String || Date || Number} start
	 * @param {String || Date || Number} end
	 * @return {Number}
	 */
	window.Rt.utils.DateDiff = function(start, end) {
		let dStart = start,
			dEnd = end;

		if(!(start instanceof Date)) {
			dStart = new Date(start);
		}

		if(!(end instanceof Date)) {
			dEnd = new Date(end);
		}

		return dEnd.getTime() - dStart.getTime();
	}

	/**
	 * 获取对象的键值。
	 * @param {Object} oParam
	 * @return {Array}
	 */
	window.Rt.utils.getObjectValues = function(oParam) {
		let aValues = [];
		
		for(let sParam in oParam) {
			aValues.push(oParam[sParam]);
		}
		
		// 返回键值。
		return aValues;
	}


	/**
	 * 判断对象是否为空对象。
	 * @param {Object} e
	 * @return {Boolean}
	 */
	window.Rt.utils.isEmptyObject = function(e) {  
		var t;  
		for (t in e)  
			return !1;  
		return !0  
	}  

	/**
	 * 导出Json为excel。依赖xlsx、blob、file-saver。
	 * @param {Array || Object} oData
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
	window.Rt.utils.exportJson2Excel = function(XLSX, Blob, FileSaver, oTableData) {
		let oData = Object.assign({}, oTableData);

		let aoTableJson = [];

		if(oData instanceof Array ) {
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
					oNewData[col.name] = o[col.prop]==undefined ? '':o[col.prop];
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

		let sFileName = oData.filename || "table";

		// 下载表格。
		FileSaver.saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), sFileName + ".xlsx");            	
	}

	/**
	 * 导出Table为excel。依赖xlsx、blob、file-saver。
	 * @param {Element} oElement table节点
	 * @param {String} sFileName 文件名
	 * @return {void}
	 */
	window.Rt.utils.exportTable2Excel = function(XLSX, Blob, FileSaver, oElement, sFileName) {
		// 根据table节点生产表。
		let wb = XLSX.utils.table_to_book(oElement);
		let wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

		// 下载表格。
		FileSaver.saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), (sFileName || "table") + ".xlsx");  
			
	}

	/**
	 * 数据转换
	 * @param {blob} s 
	 * @return {Buffer} buf
	 */
	function s2ab (s) {
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
	}  

	/**
	 * 页面节点内容打印。依赖html2Canvas。
	 * @param {Element} element
	 * @param {Object} option
	 * @param {Boolean} isClear 是否清空，默认不清空 -- 查出库中的表格print内容是复制的内容需清空
	 * @return {void}
	 */
	window.Rt.utils.printHtml = function(element, option, isClear) {
		// 将页面转换为图片。
		html2canvas(element, Object.assign(option || {}, {
			onrendered: function(canvas) {
				var sImg = canvas.toDataURL("image/png");
					
				// 打印
				var w = window.open("about:blank","image from cancas");
				w.document.write("<img src='"+sImg+"' alt='from canvas'>")
			
				setTimeout(function() {
					// 打印图片。
					w.print();
					
					w.close();
				},200)
				
				if(isClear) {
					element.innerHTML = "";
				}
			}
		})); 
	}


	/**
	 * 页面转化为图片并下载。依赖html2Canvas。
	 * @param {Element} element
	 * @param {Object} option
	 * @return {void}
	 */
	window.Rt.utils.downloadHtml = function(element, filename, option) {
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
	}

})(window,document);