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
		"equipmentCode": "select",
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
var parseTreeData1 = function(aPrev) {

	// 转换后的数据。
	let aNew = [],
		nIndex = aPrev.length;
	
	// 先按level排序。
//	aPrev.sort( (o1,o2) => o1.level-o2.level );
	
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
//					key: o.groupCode,
					key: (++nIndex) +"",
					type: "2",
					materialInfoList: null,
					processInfoList: null,
					subProcess: []
				};
				
				// 判断是否存在。
				if(!_isBeExist(o)) {		//oGrop
					o.groupKey = oGrop.key;
					
					let aSub = _getSubGroupByName(o),
						aCopySub = [];
					
					// 循环修改subProcess 的parent
					aCopySub = aSub.map( oSub => {
						let oCopy = Object.assign({}, oSub),
							sKey = _getParentNode(oCopy);
						// 修改parent
						oCopy.parent = sKey;
						// 新增groupdekey
						oCopy.groupKey = oGrop.key;
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
	/**
	 * 获取该工序- 组下的所有工序数据。并排序。
	 * @param {Object} sGroup
	 */
	function _getSubGroupByName(o) {
		
		let aSubGroup = [],
			sGropCode = o.groupCode;
			
		// 不能直接通过groupCode获取，还得通过当前节点子级。
		aSubGroup.push(o);
		_getChild(o);
		
		// 获取其子工序并排序。 --- 
		
		aSubGroup = aSubGroup.sort((o1,o2)=>o1.processSeq-o2.processSeq);
		
		// 返回子级数据。
		return aSubGroup;
		console.log(aSubGroup)
		
		/**
		 * 获取元素的同组子级。
		 */
		function _getChild(oNode) {
			// 工序
			let aReuslt = [];
			aReuslt = _get(oNode);
			
			if(aReuslt.length) {
//				aSubGroup = aSubGroup.concat(aReuslt)
				aReuslt.forEach(o=> {
					o.groupKey = oNode.groupKey;
					aSubGroup.push(o);
					_getChild(o);
				})
			}
			
			function _get(oLevel) {
				return aPrev.filter( o => {
						if(o.type == '2') {
							return o.level == oNode.level+1 && o.parent == oNode.code && o.groupCode == oNode.groupCode
						}
					});
			}
			
		}
		
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
				sParentKey = aParent[0].groupKey;  // groupCode
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
		
		// 没有group则在aNew中判断，有group则在group的subProcess中判断
		
		bExist = aNew.some(o => {
			if(oJudge.groupCode) {
				return o.key == oJudge.groupKey
			}else {
				return o.key == oJudge.key
			}
		});
		
		
		// 返回数据。
		return bExist;
	}
}
var parseTreeData = function(aTreeData) {
	// 转换后的数据。
	let aPrev = JSON.parse(JSON.stringify(aTreeData)),
		nIndex = aPrev.length;

	// 修改数据。 将group中的

	// 先修改数据，添加group的数据，并将其子工序增加group字段。
	aPrev.forEach( o => {
		// 如果是工序。  物料没有组。
		if(!o.isMaterialNode && o.groupCode && !o.group) {
			// 当前元素存在，且没有分组。
			let oGroup = {
				code: o.groupCode,
				name: o.groupName,
				key: (++nIndex) +"",
				parents: "",
				isMaterialNode: false,
				isGroup: true,
				groupCode: null,
				groupName: null,
				processSeq: null,
				materialInfoList: [],
				processInfoList: []
			};
			
			// 找到改组的所有子节点。 设置改组中子工序的group值。
			o.group = oGroup.key;
			let aSub = _getSubGroupNode(o);
			
			// 修改数据的组后面数据的parents值。获取最有一个数据的key值，将以改key为parents的数据替换。
			if(aSub.length) {
				// 设置parents。
				_setNewParent(aSub[aSub.length-1].key, oGroup.key);
			}
			
			// 将新增的group组数据放入数组中。
			aPrev.push(oGroup);
		}
		
	});
	
	// 循环修改。group的parents为其第一个组的parents值。--- 没有和前一个方法合并，是为了处理不是按顺序的数据。
	aPrev.forEach( (o,index) => {
		// 处理组。
		if(o.isGroup) {
			let aChild = _getGroupChild(o.key);
			if(aChild.length) {
				console.log(aChild)
				o.parents = aChild[0].parents;
				aChild[0].parents = "";
			}
		}
	})
	
	// 返回数据。
	return aPrev;
	
	/**
	 *  修改其parents值。
	 * @param {String} sParent
	 * @param {String} sNewParent
	 * @return {void}
	 */
	function _setNewParent(sParent, sNewParent) {
		// 循环获取修改。
		aPrev.forEach( o => {
			let aParent = o.parents.split(","),
				nIndex = aParent.indexOf(sParent);
				
			if(nIndex >-1 ) {
				// 修改并替换。
				aParent.splice(nIndex, 1);
				aParent.push(sNewParent);
				
				o.parents = aParent.join(",");
			}
		})
	}
	
	
	/**
	 * 获取组的子工序。
	 * @param {String}
	 */
	function _getGroupChild(sGroupKey) {
		let aSub = [];
		
		// 获取组下的子工序，并排序。
		aSub = aPrev.filter( o => o.group == sGroupKey).sort( (o1,o2) => o1.processSeq-o2.processSeq );
		
		// 返回组的工序。
		return aSub;
	}
	
	
	
	/**
	 * 获取节点下的所有工序数据。
	 * @param {Object} 
	 */
	function _getSubGroupNode(o) {
		let aSub = [];
		
		aSub.push(o);
		// 循环处理数据。获取该节点同组数据的集合。
		_getSubGroup(o);
		
		aSub = aSub.sort((o1,o2)=>o1.processSeq-o2.processSeq);
		
		return aSub;
		
		/**
		 * 获取该节点的同组数据。
		 * @param {Object}
		 * @return {NULL}
		 */
		function _getSubGroup(oNode) {
			// 工序
			let aReuslt = [];
			aReuslt = _get(oNode);
			
			if(aReuslt.length) {
				aReuslt.forEach(oSub => {
					oSub.group = oNode.group;
					aSub.push(oSub)
					_getSubGroup(oSub);
				})
			}
			
			function _get(oLevel) {
				return aPrev.filter( o => {
					// 当前数据父级包含且属于同一个组。
					return o.groupCode == oLevel.groupCode && o.parents.split(",").includes(oLevel.key);
				})
			}
			
		}
			
	}
	
}

// 物料，设备等下拉框数据改变，查询时参数处理。
var parseQueryParam = function(oQuery, index) {
	let oParam = Object.assign({}, oQuery);
	
	// 修改下拉框显示的值。
	for(let sParam in oParam) {
		// 下拉数据
		if(['materialCode', 'equipmentCode', 'processCode', 'personCode'].includes(sParam)) {
			oParam[sParam] = oParam[sParam].split(":")[index || 0];
		}
	}
	
	// 返回需要查询的参数。
	return oParam;
};

export default {
	parseData,
	parseTreeData,
	parseQueryParam
}
