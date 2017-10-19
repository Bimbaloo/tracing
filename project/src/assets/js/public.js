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
		aSub = aPrev.filter( o => o.group == sGroupKey).sort( (o1,o2) => o1.key - o2.key> 0? 1: -1 );	//o1.processSeq-o2.processSeq
		
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
		
//		aSub = aSub.sort((o1,o2)=>o1.processSeq-o2.processSeq);
		// 根据key值排序
		aSub = aSub.sort( (o1, o2) => o1.key - o2.key>0 ? 1: -1)
		
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


var getTreeData = function(oRowData) {
	let aoData = parseTreeData(oRowData),	
		aoDiagramData = [],
		aoDiagramLinkData = [];
	
	aoData.forEach(oData => {	
		// 树节点。		
		if(oData.isMaterialNode) {
			// 若为物料节点。
			oData.category = "simple";
			// 按批次汇总物料。
			oData.sumList = _sumMaterailList(oData.materialInfoList);
		}else {
			// 按设备、批次汇总物料。
			oData.sumList = _sumProcessList(oData.processInfoList);
			// 若为工序节点。
			if(oData.isGroup) {
				// 若为group
				let oLastGroupItem = aoData.filter(o => oData.key === o.group).sort((a, b) => a.processSeq < b.processSeq)[0]
				if(oLastGroupItem) {
					// 取最后一道工序的产出。
					oData.sumList = _sumProcessList(oLastGroupItem.processInfoList);
					// oData.processInfoList = oLastGroupItem.processInfoList
				}
			}
			if(oData.processInfoList.length) {
				// 有数据。
				oData.materialName = oData.processInfoList[0].materialName;
			}
			oData.category = "simple";		
		}	
		
		aoDiagramData.push(oData);
		let aoParents = oData.parents.split(",");
		aoParents.forEach( sParent => {
			aoDiagramLinkData.push({
				from: sParent,
				to: oData.key,
				fromPort: "FROM",
				toPort: "TO"
			});
		});
	});

	return {
		node: aoDiagramData,
		link: aoDiagramLinkData
	}

	/**
	 * 物料：按照批次汇总。
	 * @param {Array} aoList
	 * @return {Array}
	 */
	function _sumMaterailList(aoList) {
		let oSumMaterial = {}; 

		aoList && aoList.forEach(o => {
			let sKey = o.batchNo;

			if(!oSumMaterial[sKey]) {
				oSumMaterial[sKey] = {
					sumQuantity: o.sumQuantity,
					batchNo: o.batchNo
				}
			}else {
				oSumMaterial[sKey].sumQuantity += o.sumQuantity;
			}
										
		});

		return window.Rt.utils.getObjectValues(oSumMaterial);
	}

	/**
	 * 工序：按照设备+批次汇总。
	 * @param {Array} aoList
	 * @return {Array}
	 */
	function _sumProcessList(aoList) {
		let oSumProcess = {}; 

		aoList && aoList.forEach(o => {
			let sKey = o.batchNo + o.equipmentId;

			if(!oSumProcess[sKey]) {
				oSumProcess[sKey] = {
					sumQuantity: o.sumQuantity,
					batchNo: o.batchNo,
					equipmentName: o.equipmentName
				}
			}else {
				oSumProcess[sKey].sumQuantity += o.sumQuantity;
			}
										
		});

		return window.Rt.utils.getObjectValues(oSumProcess);
	}
}

// 获取追溯左侧导航数据。
var getCatalogData = function(aoRowData) {	
	let aoCatalogData = [],
		aoCopyData = JSON.parse(JSON.stringify(aoRowData)),
		aResult = []
		
	for(let i = aoCopyData.length - 1; i >= 0; i--) {
		let oData = aoCopyData[i];

		if(oData && oData.parents === "") {
			oData.parent = "";
			aoCatalogData.push(oData);

			aoCopyData.splice(i, 1);
			_findChildrenData(aoCopyData, oData.key, oData.key)
		}
	}
	
	// 物料的合并
//	for(let i = aoCatalogData.length - 1; i >= 0; i--) {
	for(let i = 0; i < aoCatalogData.length; i++) {
		let oData = aoCatalogData[i];
		let aKey = []
		if(oData.isMaterialNode && !_isExist(oData)) {
			// 物料-找同名
			aKey = _getKeysOfSameName(oData).key
			aResult.push(Object.assign({}, oData, {
				name: (aKey.length-1) ? oData.name + "("+ aKey.length +")": oData.name,
				sublings: aKey
			}))
		}
	}
	
	// 获取同名同物料下的工序。
//	for(let i = aoCatalogData.length - 1; i >= 0; i--) {
	for(let i = 0; i < aoCatalogData.length; i++) {
		let oData = aoCatalogData[i];
		if(!oData.isMaterialNode && !_isExist(oData)) {
			// 工序-找同名
			let oValue = _getKeysOfSameName(oData)
			aResult.push(Object.assign({}, oData, {
				name: (oValue.key.length-1) ? oData.name + "("+ oValue.key.length +")": oData.name,
				sublings: oValue.key,
				parent: oValue.parent
			}))
		}
	}
	
	// 返回数据。
	return aResult;
	
	/**
	 * 递归查找子节点。
	 * @param {Array} aoCopyData
	 * @param {String} sKey
	 * @param {String} sParentKey
	 * @return {void}
	 */
	function _findChildrenData(aoCopyData, sKey, sParentKey) {
		for(let i = aoCopyData.length - 1; i >= 0; i--) {
			let oData = aoCopyData[i],
				sNewKey = "";

			if(oData && oData.parents.split(",").includes(sKey)) {
				// 当前元素的子级。
				if(oData.isMaterialNode) {
					oData.parent = "";
					sNewKey = oData.key;
				}else {
					sNewKey = sParentKey;
					oData.parent = sParentKey;
				}
				
				aoCopyData.splice(i, 1);
				aoCatalogData.push(oData);
				
				if(aoCopyData.length) {
					_findChildrenData(aoCopyData, oData.key, sNewKey)
				}
			}
		}
	}
	
	/**
	 * 通过名称获取相同的名称的数据的key中。
	 * @param {Object} oFilter
	 * @return {Array}
	 */
	function _getKeysOfSameName(oFilter) {
		let oResult = {
			key: [],
			parent: ""
		};
		
//		for(let i = aoCatalogData.length - 1; i >= 0; i--) {
		for(let i = 0; i < aoCatalogData.length; i++) {
			let oData = aoCatalogData[i];

			if(oFilter.isMaterialNode) {
				// 物料-找同名
				if(oData.name === oFilter.name) {
					oResult.key.push({
						key:oData.key,
						parent: oData.parent
					})
				}
			}else {
				// 工序，找同parent
				// 找到在aResulte中通存在的subling的值。
				let oValue = _isSameLevel(oData, oFilter)
				if(oData.name === oFilter.name && oValue.bSame) {
					oResult.key.push({
						key: oData.key,
						parent: oData.parent
					})
					oResult.parent = oValue.parent
				}
			}
		}
		
		// 返回数据。
		return oResult
	}
	
	/**
	 * 判断元素是否存在已存在。
	 * @param {Object} oData
	 */
	function _isExist(oData) {
//		return aResult.some( o => o.sublings.includes(oData.key) )
		return aResult.some( o => {
			return o.sublings.some( o1 => o1.key == oData.key)
		})
	}
	
	/**
	 * 判断工序是否是同一个合并后的父级。
	 */
	function _isSameLevel(oData, oValue) {
		let oR = {
			bSame: false,
			parent: ''
		}
		
		aResult.forEach( o => {
//			if(!oR.bSame && o.sublings.includes(oData.parent) && o.sublings.includes(oValue.parent)) {
//				oR.bSame = true
//				oR.parent = o.key
//			}
			
			if(!oR.bSame && o.sublings.some(o1 => o1.key == oData.parent) && o.sublings.some(o1 => o1.key == oValue.parent)) {
				oR.bSame = true
				oR.parent = o.key
			}
		})
		
		return oR
	}
}


/**
 * 物料，设备等下拉框数据改变，查询时参数处理。
 * @param {Object} oQuery 需拆分的对象
 * @param {Object} index 获取的字段
 * @param {Object} bSplit	是否需要拆分，当参数不存在于判断的字段中
 */
var parseQueryParam = function(oQuery, index, bSplit) {
	let oParam = Object.assign({}, oQuery);
	
	// 修改下拉框显示的值。
	for(let sParam in oParam) {
		// 下拉数据
		if(['materialCode', 'equipmentCode', 'processCode', 'personCode', 'materialCodeList', 'equipmentCodeList', 'processCodeList'].includes(sParam) || bSplit) {
			if(oParam[sParam] instanceof Array) {
				// 数组处理。
				oParam[sParam] = oParam[sParam].map( o => o.split(":")[index || 0])
			}else {
				oParam[sParam] = oParam[sParam].split(":")[index || 0];
			}
		}
	}
	
	// 返回需要查询的参数。
	return oParam;
};


export default {
	parseData,
	parseTreeData,
	parseQueryParam,
	getTreeData,
	getCatalogData
}
