// 主页search数据转换。
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
var aPrev1 = [{
		"level": 0,
		"type": 1,
		"code": "99999999",
		"name": "开始",
		"parent": "",
		"groupCode": null,
		"groupName": null,
		"processSeq": null,
		"materialInfoList": [{
			"barcode": "020600003",
			"batchNo": "",
			"quantity": 20000,
			"iokey": "D201610110004_180_2016-10-11 14:48:11_0435_0"
		}],
		"processInfoList": null
	},{
		"level": 1,
		"type": 1,
		"code": "100",
		"name": "物料",
		"parent": "99999999",
		"groupCode": null,
		"groupName": null,
		"processSeq": null,
		"materialInfoList": [{
			"barcode": "1",
			"batchNo": "20160331A",
			"quantity": 10
		}],
	},{
		"level": 1,
		"type": 2,
		"code": "010",
		"name": "工序21",
		"parent": "99999999",
		"groupCode": "001",
		"groupName": "产线工序1",
		"processSeq": "01",
		"materialInfoList": null,
		"processInfoList": [{
			"materialName": "ZC/SGE LFV 活塞总成/环销卡簧连杆/新型线/12667058",
			"batchNo": "20160331A",
			"quantity": 283,
			"equipmentId": 180,
			"equipmentName": "装配2.2线GP1",
			"shiftDate": 1476288000000,
			"shiftName": "早班",
			"iokey": "D201610110004_180_2016-10-11 14:48:11_0435_0"
		}]
	},{
		"level": 2,
		"type": 2,
		"code": "020",
		"name": "工序22",
		"parent": "010",
		"groupCode": "001",
		"groupName": "产线工序1",
		"processSeq": "02",
		"materialInfoList": null,
		"processInfoList": [{
			"materialName": "ZC/SGE LFV 活塞总成/环销卡簧连杆/新型线/12667058",
			"batchNo": "20160331A",
			"quantity": 283,
			"equipmentId": 182,
			"equipmentName": "装配2.2线GP2",
			"shiftDate": 1476288000000,
			"shiftName": "早班",
			"iokey": "D201610120003_182_2016-10-14 03:59:35_7721_0"
		}]
	},{
		"level": 3,
		"type": 2,
		"code": "110",
		"name": "工序22",
		"parent": "020",
		"groupCode": null,
		"groupName": null,
		"processSeq": null,
		"materialInfoList": null,
		"processInfoList": null
	}
];

// 转换树数据。
var parseTreeData = function(aPrev) {

	// 转换后的数据。
	let aNew = [];
	
	// 先按level排序。
	aPrev.sort( (o1,o2) => o1.level-o2.level );
	
	// 增加元素的key值及showName值。
	aPrev.forEach( (o,index) => {
		// 新增其属性值。
		o.key = index+1+"";
		o.showName = o.name;

		if(!o.group) {
			o.group = "";
		}
	});
	
	aPrev.forEach( o => {
		// 元素合并处理。 -- 将元素加入数据中。
		// 判断类型。
		if(o.type == '1') {
			// 物料。
			if(!_isBeExist(o)) {
				// 不存在，修改parent值并加入。
				let sKey = _getParentNode(o),
					oCopy = Object.assign({}, o);
				
				// 加入数据。
				oCopy.parent = sKey;
				aNew.push(oCopy);
			}
		}else {
			// 工序。
			
			// 判断是否有group
			if(o.groupCode) {
				// 有grop。判断是否存在。-- 不存在则加入。
				let oGrop = {
					code: o.groupCode,
					name: o.groupName,
					showName: o.groupName,
					key: o.groupCode,
					type: "2",
					materialInfoList: null,
					processInfoList: null,
					subProcess: []
				};
				
				// 判断是否存在。
				if(!_isBeExist(oGrop)) {
					let aSub = _getSubGroupByName(oGrop.code),
						aCopySub = [];
					
					// 循环修改subProcess 的parent
					aCopySub = aSub.map( oSub => {
						let oCopy = Object.assign({}, oSub),
							sKey = _getParentNode(oCopy);
						// 修改parent
						oCopy.parent = sKey;
						return oCopy;
					});
					
					// 修改oGrop的parent 修改第一条数据的parent
					oGrop.parent = aCopySub[0].parent;
					aCopySub[0].parent = "";
					oGrop.subProcess = aCopySub;
					// 加入数据
					aNew.push(oGrop);
				}
				
			}else {
				// 没有grop 判读是存在，加入。
				// 修改parent
				if(!_isBeExist(o)) {
					// 不存在，修改parent值并加入。
					let sKey = _getParentNode(o),
						oCopy = Object.assign({}, o);
					
					// 加入数据。
					oCopy.parent = sKey;
					aNew.push(oCopy);
				}
			}
			
		}
	})
	
	console.log(aNew)
	
	// 返回数据。
	return aNew;
	
	
	// 通过group码获取group组数据并拍好序。
	function _getSubGroupByName(sGroup) {
		
		let aSubGroup = [];
		// 获取其子工序并排序。
		aSubGroup = aPrev.filter(o=>o.groupCode == sGroup)
						 .sort((o1,o2)=>o1.processSeq-o2.processSeq);
		
		// 返回子级数据。
		return aSubGroup;
	}
	
	// 获取父级元素处理。
	function _getParentNode(oNode) {
		// 获取元素的父级。
		let aParent = [],
			sParentKey = "";
		
		// 父级： 当前级的上级 且code为当前的parent
		aParent = aPrev.filter(o=> {
			if(oNode.type == '1') {
				return o.level == oNode.level && o.code == oNode.parent;
			}else {
				return o.level == oNode.level-1 && o.code == oNode.parent;
			}
		});
		
		// 返回父级元素。---判断当前元素是否含有group，
		if(aParent && aParent.length) {
			// 存在。
			if(aParent[0].groupCode && !oNode.groupCode) {
				// 存在code 并且当前元素没有group组。 父级指向组
				sParentKey = aParent[0].groupCode;
			}else {
				// 父级指向key
				sParentKey = aParent[0].key;
			}
		}
		
		return sParentKey;
	}
	
	// 判断元素是否已处理过。-- 根据key值判断是否存在。
	function _isBeExist(oJudge) {
		
		// 是否存在。
		let bExist = false;
		
		bExist = aNew.some(o => o.key == oJudge.key );
		
		// 返回数据。
		return bExist;
	}
}


export default {
	parseData,
	parseTreeData
}
