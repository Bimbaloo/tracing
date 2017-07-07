var parseData = function(aoGet){
	// 每一项对应的跳转地址。
	let oTurnTo = {
		// 查出库。
		"stock": "detail",
		// 溯源。
		"trace": "detail",
		// 追踪。
		"track": "detail",
		// 遏制。
		"restrain": "restrain",
		// 履历。
		"resume": "resume",
		// 断链。
		"link": "chain"
	};
	
	// 类型判断处理。
	let oType = {
		"materialCode": "select",
		"equipmentId": "select",
		"processCode": "select",
		"personCode": "select",
		"startTime": "datetime",
		"endTime": "datetime"
	};

	// 数据转换。
	let aResult = aoGet.map(oModule => {
	
		let oItem = {
			url: oTurnTo[oModule.moduleCode],
			key: oModule.moduleCode,
			title: oModule.moduleName,
			list: []
		};
	
		// 修改list的值。
		oItem.list = oModule.groups.map( (oGroup,index) => {
			let oList = {
				title: oGroup.groupName,
				key: index+1+"",
				items: []
			};
			
			// 修改items的值。
			oList.items = oGroup.groupItems.map( o => {
				let sName = o.itemName,
					sPlaceHolderName = o.itemName;
						
				// 如果是履历的话固定名称。
				if(oModule.moduleCode === "resume") {
					sName = "成品条码";
					sPlaceHolderName = "成品条码或扫码";
				}
				
				return {
					name: sName,	
					key: o.itemCode,
					type: oType[o.itemCode] || "input",
					placeholder: (oType[o.itemCode]==="select"?"请选择":"请输入")+sPlaceHolderName
				};
			})
				
			return oList;
		})
		
		return oItem;
	});
	
	return aResult;
};

export default {
	parseData
}
