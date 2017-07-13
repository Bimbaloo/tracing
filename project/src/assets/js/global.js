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

// 全局变量，命名空间
Rt = {};

Rt.utils = {};

Rt.utils.DateDiff = function(start, end) {
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


Rt.utils.isEmptyObject = function(e) {  
    var t;  
    for (t in e)  
        return !1;  
    return !0  
}  