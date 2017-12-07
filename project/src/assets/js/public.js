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
				id: oGroup.groupId+"",
				groupOrder: oGroup.groupOrder+'',
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
var parseTreeData = function(aTreeData) {

	// 转换后的数据
	let aPrev = JSON.parse(JSON.stringify(aTreeData)),
		nGroupIndex = aPrev.length;

	// 修改数据，添加group的数据，并将子工序增加group字段。
	aPrev.forEach(o => {
		// 判断是否为组。
		if(o.groupCode && !o.group) {
			// 新增组数据。
			let oGroup = {
				code: o.groupCode,
				name: o.groupName,
				key: "group" + (++nGroupIndex),
				parents: "",
				nodeType: 10001, // 节点类型-工序
				opType: 10001, // 动作类型-工序
				isGroup: true,
				groupCode: null,
				groupName: null,
				groupSeq: null,
				detailInfos: []
			};

			// 找到该组下的所有子节点，设置该组中子工序的group值。
			o.group = oGroup.key;
			let aSub = _getSubGroupNode(o);

			// 修改数据的组后面数据的parents值。获取最有一个数据的key值，将以改key为parents的数据替换。
			if(aSub.length) {
				// 设置parents。
				_setNewParent(aSub[aSub.length - 1].key, oGroup.key);
			}

			// 将新增的group组数据放入数组中。
			aPrev.push(oGroup);
		}

	});

	// 循环修改。group的parents为其第一个组的parents值。--- 没有和前一个方法合并，是为了处理不是按顺序的数据。
	aPrev.forEach((o, index) => {
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
	return aPrev

	/**
	 *  修改其parents值。
	 * @param {String} sParent
	 * @param {String} sNewParent
	 * @return {void}
	 */
	function _setNewParent(sParent, sNewParent) {
		// 循环获取修改。
		aPrev.forEach(o => {
			let aParent = o.parents.split(","),
				nIndex = aParent.indexOf(sParent);

			if(nIndex > -1) {
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
		aSub = aPrev.filter(o => o.group == sGroupKey).sort((o1, o2) => o1.key - o2.key > 0 ? 1 : -1);

		// 返回组的工序。
		return aSub;
	}

	/**
	 * 获取节点下的所有工序数据。
	 * @param {Object}
	 * @return {Array}
	 */
	function _getSubGroupNode(o) {
		let aSub = [];

		aSub.push(o);
		// 循环处理数据。获取该节点同组数据的集合。
		_getSubGroup(o);

		// 根据key值排序
		aSub = aSub.sort((o1, o2) => o1.key - o2.key > 0 ? 1 : -1)

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
				return aPrev.filter(o => {
					// 当前数据父级包含且属于同一个组。
					return o.groupCode == oLevel.groupCode && o.parents.split(",").includes(oLevel.key);
				})
			}

		}

	}

}

// 获取节点图标及显示模板
var getNodeIconAndTemp = function(sType) {
	let oIcon = {
		icon: "",
		temp: "",
		TempMerge: ""
	}
	
	switch(sType) {
		// 库存转储
		case 101:
			oIcon.temp = "warehouseDumpTemp"
			oIcon.icon = "warehouse"
			oIcon.TempMerge = "warehouseDump"
			break;
		// 库存调整
		case 112:
			oIcon.temp = "warehouseAdjustTemp"
			oIcon.icon = "warehouse"
			oIcon.TempMerge = "warehouseAdjust"
			break
		// 入库
		case 102:
			oIcon.temp = "warehouseTemp"
			oIcon.icon = "warehouse"
			oIcon.TempMerge = "warehouse"
			break
		// 出库
		case 103:
			oIcon.temp = "warehouseTemp"
			oIcon.icon = "warehouse"
			oIcon.TempMerge = "warehouse"
			break
		// 库存损益
		case 111:
			oIcon.temp = "warehouseTemp"
			oIcon.icon = "warehouse"
			oIcon.TempMerge = "warehouse"
			break
//		// 自动入库
//		case 116:
//			oIcon.icon = "warehouse"
//		// 自动出库
//		case 117:
//			oIcon.icon = "warehouse"
		// 投料
		case 1:
			oIcon.icon = "process"
			oIcon.TempMerge = "process"
			oIcon.temp = "processTemp"
			break
		// 产出
		case 6:
			oIcon.icon = "process"
			oIcon.TempMerge = "process"
			oIcon.temp = "processTemp"
			break
		// 工序-- 工序显示一个模板。
		case 10001:
			oIcon.icon = "process"
			oIcon.TempMerge = "process"
			oIcon.temp = "processTemp"
			break
		// 结转转入
		case 2:
			oIcon.icon = "workshop"
			oIcon.temp = "workshopCarryoverTemp"
			oIcon.TempMerge = "workshopCarryover"
			break
		// 结转转出
		case 7:
			oIcon.icon = "workshop"
			oIcon.temp = "workshopCarryoverTemp"
			oIcon.TempMerge = "workshopCarryover"
			break
		// 结转
		case 10002:
			oIcon.icon = "workshop"
			oIcon.temp = "workshopCarryoverTemp"
			oIcon.TempMerge = "workshopCarryover"
		// 退料
		case 8:
			oIcon.temp = "workshopReturnMateiralTemp"
			oIcon.icon = "workshop"
			oIcon.TempMerge = "workshopReturnMateiral"
			break
		// 车间调整
		case 11:
			oIcon.temp = "workshopTemp"
			oIcon.icon = "workshop"
			oIcon.TempMerge = "workshop"
			break
		// 返工入站
		case 14:
			oIcon.temp = "reworkTemp"
			oIcon.icon = "rework"
			oIcon.TempMerge = "rework"
			break
		// 返工出站
		case 15:
			oIcon.temp = "reworkTemp"
			oIcon.icon = "rework"
			oIcon.TempMerge = "rework"
			break
		// 条码绑定
		case 201:
			oIcon.temp = "barcodeManageTemp"
			oIcon.icon = "barcodeManage"
			oIcon.TempMerge = "barcodeManage"
			break
		// 补料
		case 203:
			oIcon.temp = "barcodeManageTemp"
			oIcon.icon = "barcodeManage"
			oIcon.TempMerge = "barcodeManage"
			break
		// 容器清空
		case 202:
			oIcon.temp = "barcodeManageTemp"
			oIcon.icon = "barcodeManage"
			oIcon.TempMerge = "barcodeManage"
			break
//		// 修改失效时间
//		case 204:
//			oIcon.icon = "barcodeManage"
		// 正常物料
		case 10003:
			oIcon.temp = "materialTemp"
			oIcon.icon = "material"
			oIcon.TempMerge = "material"
		// 废品
		case 10004:
			oIcon.temp = "materialTemp"
			oIcon.icon = "material"
			oIcon.TempMerge = "material"
		default:
			break
	}
	
	// 返回数据。
	return oIcon
}


/**
 * 树形数据修改。
 * 新增 sumList: [] 详细信息展示数据
 * 		detailType: 详细信息展示模板
 * 		detailTitle: 详细信息标题： -- 物料或其他组合
 * 		iconType: 	图标类型
 * @param {Object} oRowData
 * @param {String} sPageType 当前页面显示类型 trace|track
 * @param {Boolean} bIsOld 是否为老版本。  true-老版本  false-新版本
 */
var getTreeData = function(oRowData, sPageType, bIsOld) {
	let aoData = parseTreeData(oRowData),
		aoDiagramData = [],
		aoDiagramLinkData = [];

	// 循环处理数据。
	aoData.forEach(oData => {
		
		oData.category = "simple"
		// detailInfos按destSnapshotId去重处理。
		oData.detailInfos = window.Rt.utils.uniqueObject(oData.detailInfos, "destSnapshotId")
		
		// 根据节点类型，会哦在那个数据。 -- 增加sumList及明细模板字段 图形字段
		let oNodeType = getNodeIconAndTemp(oData.nodeType)
		
		// 设置icon类型和detailType
		oData.iconType = oNodeType.icon
		oData.detailType = oNodeType.temp
		
		// 根据节点的名称处理。
		switch(oNodeType.TempMerge) {
			/* 仓库操作 */
			// 库存转储
			case "warehouseDump" :
				// 设置详细信息。-- 仓库及库位
				oData.sumList = _sumDataList(oData.detailInfos, ["batchNo"], ["batchNo", "quantity", "remainQuantity", "srcWarehouse", "srcWarehouseLocation", "destWarehouse", "destWarehouseLocation"], ["quantity", "remainQuantity"])
				// 设置详细信息标题
				oData.detailTitle = oData.detailInfos.length ? oData.detailInfos[0].materialName : "" 
				// 设置表头。
				oData.headerList = [{
					name: "批次",
					minLen: 2,
					formatter: function(o) {
						return (o.batchNo || "").length
					}
				},{
					name: "滞留数/总数",
					minLen: 6,
					formatter: function(o) {
						return (o.remainQuantity+"/"+o.quantity).length
					}
				},{
					name: "仓库库位",
					minLen: 4,
					formatter: function(o) {
						return Math.max( ((o.srcWarehouse || "")+(o.srcWarehouseLocation||"")).length, ((o.destWarehouse||"")+(o.destWarehouseLocation||"")).length ) + 3	// 设置为目标:
					}
				}]
				
				// 设置数据显示的宽度。
				_setTemplateColumnWidth(oData.sumList, oData.headerList);
				
				break;
			// 库存调整
			case "warehouseAdjust" :
				// 设置详细信息标题
				oData.detailTitle = `${oData.detailInfos.length ? oData.detailInfos[0].materialName : ""}(${oData.detailInfos.length ? (oData.detailInfos[0].destWarehouse || "") : ""})`
				oData.sumList = _sumWorkShopData(oData)
				// 设置表头。
				oData.headerList = [{
					name: "源条码",
					minLen: 3,
					formatter: function(o) {
						return (o.srcBarcode||"").length
					}
				},{
					name: "调整数",
					minLen: 3,
					formatter: function(o) {
						return (o.destAdjustQuantity+"").length
					}
				},{
					name: "目标条码",
					minLen: 4,
					type: 1,
					formatter: function(o) {
						return (o.destBarcode||"").length
					}
				},{
					name: "滞留数/调整数",
					minLen: 7,
					type: 1,
					formatter: function(o) {
						return (o.remainQuantity+"/"+o.destAdjustQuantity).length
					}
				}]
				
				// 设置数据显示的宽度。
				_setTemplateColumnWidth(oData.sumList, oData.headerList);
				
				break;
				
			// 入库	
			// 出库
			// 库存损益
			case "warehouse":
				oData.sumList = _sumDataList(oData.detailInfos, ["batchNo", "destWarehouse", "destWarehouseLocation"], ["batchNo", "destWarehouse", "destWarehouseLocation", "quantity", "remainQuantity"], ["quantity", "remainQuantity"])
				// 设置详细信息标题
				oData.detailTitle = oData.detailInfos.length ? oData.detailInfos[0].materialName : ""
				// 设置表头。
				oData.headerList = [{
					name: "批次",
					minLen: 2,
					formatter: function(o) {
						return (o.batchNo||"").length
					}
				},{
					name: "滞留数/总数",
					minLen: 6,
					formatter: function(o) {
						return (o.remainQuantity + "/" + o.quantity).length
					}
				},{
					name: "仓库库位",
					minLen: 4,
					formatter: function(o) {
						return ((o.destWarehouse||"") + (o.destWarehouseLocation||"")).length
					}
				}]
				
				// 设置数据显示的宽度。
				_setTemplateColumnWidth(oData.sumList, oData.headerList);
				
				break;
			
			// 车间操作-工序
			case "process":
				// 如果是工序组时。
				if(oData.isGroup) {
					// 若为group
					let oLastGroupItem = aoData.filter(o => oData.key === o.group).sort((a, b) => a.key < b.key)[0]
					if(oLastGroupItem) {
						// 取最后一道工序的产出。-- 最后一道工序中的数据去重
						let oCopy = Object.assign({}, oLastGroupItem)
						oCopy.detailInfos = window.Rt.utils.uniqueObject(oCopy.detailInfos, "destSnapshotId")
						
						oData = Object.assign({}, oData, _sumProcessData(oCopy))
					}
				}else {
					oData = Object.assign({}, oData, _sumProcessData(oData))
				}
				
				// 设置表头。
				oData.headerList = [{
					name: "设备",
					minLen: 2,
					formatter: function(o) {
						return (o.equipmentName||"").length
					}
				},{
					name: "类型",
					minLen: 2,
					type: 1,
					formatter: function(o) {
						return o.type.length
					}
				},{
					name: "物料",
					type: 2,
					minLen: 2,
					maxLen: 15,
					formatter: function(o) {
						return (o.materialName||"").length
					}
				},{
					name: "批次",
					minLen: 2,
					type: 2,
					formatter: function(o) {
						return (o.batchNo||"").length
					}
				},{
					name: (( bIsOld || sPageType == "trace" ) ? "总数": "滞留数/总数"),
					minLen: (( bIsOld || sPageType == "trace" ) ? 2: 6),
					type: 2,
					formatter: function(o) {
						return (bIsOld || sPageType == "trace") ? (o.quantity+"").length : (o.remainQuantity + "/" + o.quantity).length
					}
				}]
				
				// 设置数据显示的宽度。
				_setTemplateColumnWidth(oData.sumList, oData.headerList);
				
				break;
			// 	结转
			case "workshopCarryover":
				oData.sumList = _sumDataList(oData.detailInfos, ["materialCode"], ["materialName", "quantity", "remainQuantity"], ["quantity", "remainQuantity"])
				
				// 获取源工单及目标工单。 源：操作==转出  目标： 操作==转出的快照==操作==转入的源快照
				let oOut = oData.detailInfos.filter( o => o.opType == "7")[0] || {},
					oIn = oData.detailInfos.filter( o => o.opType == "2" && o.srcSnapshotId == oOut.destSnapshotId)[0] || {}
				
				oData.detailTitle = `源:${oOut.doCode || ''} 目标:${oIn.doCode || ''}`
				
				oData.headerList = [{
					name: "物料",
					minLen: 2,
					maxLen: 15,
					formatter: function(o) {
						return (o.materialName||"").length
					}
				}, {
					name: "滞留数/总数",
					minLen: 6,
					formatter: function(o) {
						return (o.remainQuantity + "/" + o.quantity).length
					}
				}]
				
				// 设置数据显示的宽度。
				_setTemplateColumnWidth(oData.sumList, oData.headerList);
				
				break;
			// 	退料
			case "workshopReturnMateiral":
				oData.sumList = _sumDataList(oData.detailInfos, ["materialCode"], ["materialName", "quantity", "remainQuantity"], ["quantity", "remainQuantity"])
				// 工单
				oData.detailTitle = oData.detailInfos.length ? oData.detailInfos[0].doCode : ""
				
				oData.headerList = [{
					name: "物料",
					minLen: 2,
					maxLen: 15,
					formatter: function(o) {
						return (o.materialName||"").length
					}
				}, {
					name: "滞留数/总数",
					minLen: 6,
					formatter: function(o) {
						return (o.remainQuantity + "/" + o.quantity).length
					}
				}]
				
				// 设置数据显示的宽度。
				_setTemplateColumnWidth(oData.sumList, oData.headerList);
				
				break;
			//	车间调整
			case "workshop":
				oData.sumList = _sumWorkShopData(oData)
				oData.detailTitle = oData.detailInfos.length ? oData.detailInfos[0].materialName : "";
				
				// 设置表头。
				oData.headerList = [{
					name: "源条码",
					minLen: 3,
					formatter: function(o) {
						return (o.srcBarcode||"").length
					}
				},{
					name: "调整数",
					minLen: 3,
					formatter: function(o) {
						return (o.destAdjustQuantity+"").length
					}
				},{
					name: "目标条码",
					type: 1,
					minLen: 4,
					formatter: function(o) {
						return (o.destBarcode||"").length
					}
				},{
					name: "滞留数/调整数",
					type: 1,
					minLen: 7,
					formatter: function(o) {
						return (o.remainQuantity+"/"+o.destAdjustQuantity).length
					}
				}]
				
				// 设置数据显示的宽度。
				_setTemplateColumnWidth(oData.sumList, oData.headerList);
				
				break;
			// 返工入站 返工出站
			case "rework":
				oData.sumList = _sumDataList(oData.detailInfos, ["batchNo", "qualityTypeName"], ["batchNo", "qualityTypeName", "quantity", "remainQuantity"], ["quantity", "remainQuantity"])
				// 设置详细信息标题
				oData.detailTitle = oData.detailInfos.length ? oData.detailInfos[0].materialName : ""
				
				// 设置表头。
				oData.headerList = [{
					name: "批次",
					minLen: 2,
					formatter: function(o) {
						return (o.batchNo||"").length
					}
				},{
					name: "滞留数/总数",
					minLen: 7,
					formatter: function(o) {
						return (o.remainQuantity+"/"+o.quantity).length
					}
				},{
					name: "质量",
					minLen: 2,
					formatter: function(o) {
						return (o.qualityTypeName||"").length
					}
				}]
				
				// 设置数据显示的宽度。
				_setTemplateColumnWidth(oData.sumList, oData.headerList);
				
				break;
			
			// 条码绑定 补料 容器清空
			case "barcodeManage":
				oData.sumList = _sumDataList(oData.detailInfos, ["destBarcode", "batchNo"], ["destBarcode", "batchNo", "quantity", "remainQuantity"], ["quantity", "remainQuantity"])
				// 设置详细信息标题 -- 是否已设定（条码绑定）
				if(oData.nodeType == "201") {
					// 条码绑定
					// 设置详细信息标题 托码+物料名称
					oData.detailTitle = oData.detailInfos.length ? oData.detailInfos[0].materialName : ""
				}else {
					// 补料 容器清空
					oData.detailTitle = oData.detailTitle ? oData.detailTitle : (oData.detailInfos.length ? oData.detailInfos[0].materialName : "")
				}
				
				// 设置表头。
				oData.headerList = [{
					name: "条码",
					minLen: 2,
					formatter: function(o) {
						return (o.destBarcode||"").length
					}
				},{
					name: "批次",
					minLen: 2,
					formatter: function(o) {
						return (o.batchNo||"").length
					}
				},{
					name: "滞留数/总数",
					minLen: 6,
					formatter: function(o) {
						return (o.remainQuantity+"/"+o.quantity).length
					}
				}]
				
				// 设置数据显示的宽度。
				_setTemplateColumnWidth(oData.sumList, oData.headerList);
				
				break;
			
			// 正常物料 废品
			case "material":
				oData.sumList = _sumDataList(oData.detailInfos, ["batchNo"], ["batchNo", "quantity"], ["quantity"])
				// 设置详细信息标题
				oData.detailTitle = "";
				
				// 设置表头。
				oData.headerList = [{
					name: "批次",
					minLen: 2,
					formatter: function(o) {
						return (o.batchNo||"").length
					}
				},{
					name: "总数",
					minLen: 2,
					formatter: function(o) {
						return (""+o.quantity).length
					}
				}]
				
				// 设置数据显示的宽度。
				_setTemplateColumnWidth(oData.sumList, oData.headerList);
				
				break;
			default:
				break;
		}
		
		aoDiagramData.push(oData);
		let aoParents = oData.parents.split(",");
		aoParents.forEach(sParent => {
			aoDiagramLinkData.push({
				from: sParent,
				to: oData.key,
				fromPort: "FROM",
				toPort: "TO"
			});
		});
		
	})

	return {
		node: aoDiagramData,
		link: aoDiagramLinkData
	}
	
	/**
	 * 获取显示的最短长度名称。
	 * @param {String} sName
	 * @param {Number} limited
	 * @return {String}
	 */
	function _getShortedNum(sName, limited = 30) {
		if(sName.length < limited) {
			return sName
		}else {
			return  sName.substr(0, limited) + "..."
		}
	}

	/**
	 * 合并数据处理函数。合并的数量的值。
	 * @param {Array} 处理的数据。
	 * @param {Array} 合并的字段-- 分类
	 * @param {Array} 展示的字段。
	 * @param {Array} 汇总的字段
	 * @return {Object} 返回数据。
	 */
	function _sumDataList(aoList, aGroup, aDis, aSum) {
		let oFlag = {}

		aoList && aoList.forEach(o => {
			// 需合并的参数值。
			let sKey = ""

			aGroup.forEach(sGroup => {
				sKey += o[sGroup] + '+'
			})

			if(!oFlag[sKey]) {
				// 设置展示的值。
				oFlag[sKey] = {};

				aDis.forEach(sDis => oFlag[sKey][sDis] = (o[sDis] || 0) )
			} else {
				// 存在，在汇总数据。
				// 默认为quantity
				if(aSum && aSum.length) {
					aSum.forEach( sSum => oFlag[sKey][sSum] += (o[sSum] || 0) )
				}else {
					oFlag[sKey].quantity += (o.quantity || 0)
				}
			}
		})

		// 返回数据。
		return window.Rt.utils.getObjectValues(oFlag);
	}
	
	/**
	 * 工序节点数据处理。
	 * @param {Object}
	 * @return {}
	 */
	function _sumProcessData(oData) {
		// 返回的数据。
		let oReturn = {
				// 工序使用一个模板
//				detailType: "",
				detailTitle: "",
				sumList: []
			},
			aOutputMaterial = new Set(),
			aInputMaterial = new Set(),
			bIsSame = false
		
		if(oData.detailInfos.length) {
			
//			// 判断投产物料是否相同。 -- 根据operType合并。
//			oData.detailInfos.forEach( o => {
//				if(o.opType == "6") {	// 产出
//					aOutputMaterial.add(o.materialName)
//				}else if(o.opType == "1") {	// 投入
//					aInputMaterial.add(o.materialName)
//				}
//			})
//			
//			aOutputMaterial = [...aOutputMaterial]
//			aInputMaterial = [...aInputMaterial]
//			
//			let sOutMaterial = aOutputMaterial.join(","),
//				sInMaterial = aInputMaterial.join(",")
//			
//			// 投产物料相同-- 产出只有一个。
//			if(aOutputMaterial.length && sOutMaterial == sInMaterial) {
//				oReturn.detailType = "processSameMaterialTemp"
//				oReturn.detailTitle = _getShortedNum(sOutMaterial)
//				bIsSame = true
//				
//			}else if(aOutputMaterial.length && sOutMaterial != sInMaterial) {
//				// 投产物料不同
//				oReturn.detailType = "processDiffMaterialTemp"
//				oReturn.detailTitle = `投:${_getShortedNum(sInMaterial)} \n 产:${_getShortedNum(sOutMaterial)}`
//			}else {
//				oReturn.detailType = "processDiffMaterialTemp"
//				oReturn.detailTitle = `投:${_getShortedNum(sInMaterial)} \n 产:${_getShortedNum(sOutMaterial)}`
//			}
			
			// 按设备进行分类。
			let oFlag = {}
			oData.detailInfos.forEach( o => {
				// 需合并的参数值。
				let sKey = o.equipmentId
	
				if(!oFlag[sKey]) {
					oFlag[sKey] = {
						equipmentName: o.equipmentName,
						list: [o]
					}
				}else {
					oFlag[sKey].list.push(o)
				}
			})
			
			oReturn.sumList = window.Rt.utils.getObjectValues(oFlag);
			
			oReturn.sumList.forEach( o => {
				// 类型参数。
				oFlag = {}
				
				// 按类型分类（投入，产出，滞留）
				o.list.forEach(oType => {
					let sKey = oType.opType
				
					if(sKey == "1") {	// 投入
						// 投入。
						if(!oFlag["touru"]) {
							oFlag["touru"] = {
								type: "投入",
								list: [oType],
								order: 1
							}
						}else {
							oFlag["touru"].list.push(oType)
						}
					}else if(sKey == "6"){
						// 产出。
						if(!oFlag["chanchu"]) {
							oFlag["chanchu"] = {
								type: "产出",
								list: [oType],
								order: 2
							}
						}else {
							oFlag["chanchu"].list.push(oType)
						}
					}
				})
				
				let aType = window.Rt.utils.getObjectValues(oFlag)
				
				// 按照投入、产出、滞留顺序。
				aType.sort( (ot1, ot2) => ot1.order - ot2.order > 0 ? 1 : -1)
				
				// 各个分类中按批次合并。（投料不同时，投入按物料批次合并）
				aType.forEach(o1 => {
					// 按批次合并。
					let aMerge = ["batchNo", "materialCode"],
						aDis = ["batchNo", "quantity", "remainQuantity", "materialName"],
						aSum = ["quantity", "remainQuantity"]
						
					// trace 和 track展示不同。
					if(bIsOld || sPageType == "trace") {
						aDis = ["batchNo", "quantity", "materialName"]
						aSum = ["quantity"]
					}
					
					o1.list = _sumDataList(o1.list, aMerge, aDis, aSum)
				})
				
				// 重新设置类型数据。
				o.list = aType
			})
			
		}
		
		// 设置详细信息标题
		return oReturn
	}

	/**
	 * 合并车间调整数据。-- 调整数取destAdjustQuantity 滞留数取 remainQuantity
	 * @param {Object}
	 * @return {}
	 */
	function _sumWorkShopData(oData) {
		let oFlag = {}
		// 先按源条码合并。- 原条码的调整数量，为所有的目标条码和。
		oData.detailInfos.forEach( o => {
			let sKey = o.srcBarcode
			
			if(!oFlag[sKey]) {
				oFlag[sKey] = {
					srcBarcode: sKey,
					// 加入目标条码及调整数量。
					list: [{
						destBarcode: o.destBarcode,
						// 调整数
						destAdjustQuantity: o.destAdjustQuantity,
						// 滞留数
						remainQuantity: o.remainQuantity
					}]
				}
			}else {
				// 更改目标条码数据。
				oFlag[sKey].list.push({
					destBarcode: o.destBarcode,
					// 调整数
					destAdjustQuantity: o.destAdjustQuantity,
					// 滞留数
					remainQuantity: o.remainQuantity
				})
			}
		})
		
		// 合并目标条码数据。
		for( let sParam in oFlag) {
			let aList = oFlag[sParam].list
			oFlag[sParam].list = _sumDataList(aList, ["destBarcode"], ["destBarcode", "destAdjustQuantity", "remainQuantity"], ["destAdjustQuantity", "remainQuantity"])
			oFlag[sParam].destAdjustQuantity = oFlag[sParam].list.map( o => o.destAdjustQuantity).reduce(function(nPrev, nNext) {
				return nPrev + nNext
			}, 0)
		}
		
		return window.Rt.utils.getObjectValues(oFlag);
	}
	
	
	/**
	 * 设置内容的宽度。
	 * @param {Array} aoSum
	 * @param {Array} aoHeader
	 */
	function _setTemplateColumnWidth(aoSum, aoHeader) {
		
		// 循环表头数据。
		aoHeader.forEach( (o,i) => {
			
			let aData = [],
				// 是否为特殊处理的标识。-- sumList中有list列 调整 工序
				sType = o.type,
				nMaxLen = o.maxLen || 100,	// 默认为英文字符
				nMinLen = o.minLen || 0
			
			// 获取得到最大长度
			aoSum.forEach(oSum => {
				if(!sType) {
					// 直接获取数据
					aData.push( o.formatter(oSum) || 0 )
				}else if(sType == 1) {
					// 从list中获取数据。
					oSum.list.forEach( oLevel => aData.push( o.formatter(oLevel) || 0 ))
				}else if(sType == 2) {
					// 从list.list中获取数据。
					oSum.list.forEach( oLevel => {
						oLevel.list.forEach( oL => aData.push( o.formatter(oL) || 0 ))
					})
				}
			})
			
			let nWidth = Math.max.apply(null, aData)
			
			nWidth = nWidth < nMinLen ? nMinLen: nWidth
			nWidth = nWidth > nMaxLen ? nMaxLen : nWidth
			nWidth = nWidth*13
			
			// 设置当前列宽度
			o.width = nWidth
			
			// 设置所有数据中的长度 [{column0:,column1:},{...}]
			aoSum.forEach( oSum => {
				// 每条数据设置每列的宽度
				if(!sType) {
					oSum["column"+i] = nWidth
				}else if(sType == 1){
					oSum.list.forEach(oLevel => oLevel["column"+i] = nWidth)
				}else if(sType == 2) {
					oSum.list.forEach( oLevel => {
						oLevel.list.forEach( oL => oL["column"+i] = nWidth)
					})
				}
			})
		})
		
	}
	
}

// 判断是否是正常物料
var isMaterialNode = function(oData) {
	
	if(oData.nodeType == "10003" || oData.nodeType == "10004") {
		return true
	}else {
		return false
	}
}

// 第一个节点的parents值。
const SPARENTKEY = "0"

var getCatalogData = function(aoRowData, sType) {	
	let aoCatalogData = [],
		aoCopyData = JSON.parse(JSON.stringify(aoRowData)),
		aResult = [],
		// 追踪中新增的物料节点key值。
		sNewMateiralNodekey = "customerKey"
	
	// 追踪中，保存最后节点的key值。（除物料外）
	let aLastNodeKeys = []
	
	// 修改节点的类型值。
	aoCopyData.forEach(o => o.iconType = getNodeIconAndTemp(o.nodeType).icon)
	
	if(sType === "trace") {
		// 溯源。
		// 判断第一个节点是否为物料节点。 否则加一个虚构的物料节点。
		let aoFirstNode = aoCopyData.filter( o => o.parents == SPARENTKEY)
		
		if(aoFirstNode.length && !isMaterialNode(aoFirstNode[0])) {
			// 第一个节点不是物料。则增加一个虚拟节点。
			aoCopyData.push({
				code: "000",
				name: "虚构物料节点",
				key: SPARENTKEY,
				parents: SPARENTKEY,
				nodeType: 10003,
				opType: 0,
				iconType: "material",
				isCustom: true
			})
		}
		
		for(let i = aoCopyData.length - 1; i >= 0; i--) {
			let oData = aoCopyData[i];
	
			if(oData && isMaterialNode(oData) && oData.parents == SPARENTKEY) {
				oData.parent = "";
				aoCatalogData.push(oData);
	
				aoCopyData.splice(i, 1);
				_findChildrenData(aoCopyData, oData.key, oData.key)
			}
		}
	}else {
		// 追踪
		// 判断最后一个节点是否为物料节点，否则，创建一个虚拟的物料节点。-- 在最后创建，否则，会将其他节点加入
		aoCopyData.forEach( o => {
			if(!aoCopyData.some( o1 => o1.parents.split(",").includes(o.key)) && !isMaterialNode(o)) {
				// 当前节点没有子节点，并且不是物料节点
				aLastNodeKeys.push(o.key)
			}
		})
		
		// 创建一个物料节点，其parents为当前所有的key值。
		if(aLastNodeKeys.length) {
			// 第一个节点不是物料。则增加一个虚拟节点。
			aoCopyData.unshift({
				code: "000",
				name: "虚构物料节点",
				key: sNewMateiralNodekey,
				parents: aLastNodeKeys.join(","),
				nodeType: 10003,
				opType: 0,
				iconType: "material",
				isCustom: true
			})
		}
		
		for(let i = aoCopyData.length - 1; i >= 0; i--) {
			let oData = aoCopyData[i];
	
			if(oData && isMaterialNode(oData) && !aoCatalogData.some(o => o.key == oData.key)) {
	            oData.parent = "";
	  			aoCatalogData.push(oData);
	
	  			aoCopyData.splice(i, 1);
	
	  			_findParentsData(aoCopyData, oData.parents, oData.key)
	        }
		}
	}
	
	// 物料的合并
	for(let i = 0; i < aoCatalogData.length; i++) {
		let oData = aoCatalogData[i];
		let aKey = []
		if(isMaterialNode(oData) && !_isExist(oData)) {
			// 物料-找同名
			aKey = _getKeysOfSameName(oData).key
			aResult.push(Object.assign({}, oData, {
				name: (aKey.length-1) ? oData.name + "("+ aKey.length +")": oData.name,
				sublings: aKey
			}))
		}
	}

	// 获取同名同物料下的工序。
	for(let i = 0; i < aoCatalogData.length; i++) {
		let oData = aoCatalogData[i];
		if(!isMaterialNode(oData) && !_isExist(oData)) {
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
	 * 递归查找父节点。
	 * @param {Array} aoCopyData
	 * @param {String} sKey
	 * @param {String} sParentKey
	 * @return {void}
	 */
	function _findParentsData(aoCopyData, sKey, sParentKey) {
		for(let i = aoCopyData.length - 1; i >= 0; i--) {
			let oData = aoCopyData[i],
				sNewKey = "",
				oFlag = {};

			if(oData && sKey.split(",").includes(oData.key)) {
				// 当前元素的父级。
				if(isMaterialNode(oData)) {
					oData.parent = "";
					sNewKey = oData.key;
	
					oFlag = Object.assign({}, oData)
					aoCopyData.splice(i, 1);
					
				} else if(sParentKey != sNewMateiralNodekey && (!aoCatalogData.some(o => (o.linkKey || o.key) == oData.key && o.parent == sParentKey)) || (aLastNodeKeys.length && sParentKey == sNewMateiralNodekey && !aoCatalogData.some( o => (o.linkKey || o.key) == oData.key) ) ) {
					// 当不是自定义物料查询时的处理。
//				} else if(!aoCatalogData.some(o => (o.linkKey || o.key) == oData.key && o.parent == sParentKey)) {	
					// 存在最后节点不为物料的数据，且匹配改物料下的数据，且改数据没有被其他物料加载，则会创建该节点。
					sNewKey = sParentKey;
					// 判断该数据是否已加入到aoCatelogData中。
					if(oData.parent !== undefined) {
						// 复制该节点。
						oFlag = Object.assign({}, oData, {
							parent: sNewKey,
							// 当前节点的源节点。
							linkKey: oData.key,
							// 自定义改节点的key值。
							key: "new-" + _getLength(oData.key) + "-" + oData.key // 通过长度获取。
						})
					} else {
						oData.parent = sParentKey;
						oFlag = Object.assign({}, oData)
					}
	
				}
	
				// 判断是否已经重复加入。--- key相同且parent相同。
				if(!window.Rt.utils.isEmptyObject(oFlag) && !(aoCatalogData.some(o => o.key == oFlag.key && o.parent == oFlag.parent))) {
					aoCatalogData.push(oFlag);
	
					if(oFlag.parents != SPARENTKEY) {
						_findParentsData(aoCopyData, oFlag.parents, sNewKey)
					}
				}
	
			}
		}
	}
	
	/**
	 * 递归查找子级节点。
	 * @param {Array} aoCopyData
	 * @param {String} sKey
	 * @param {String} sParentKey
	 * @return {void}
	 */
	function _findChildrenData(aoCopyData, sKey, sParentKey) {
		for(let i = aoCopyData.length - 1; i >= 0; i--) {
			let oData = aoCopyData[i],
				sNewKey = "",
				oFlag = {};
	
			if(oData && oData.parents.split(",").includes(sKey)) {
				// 当前元素的父级。
				if(isMaterialNode(oData)) {
					oData.parent = "";
					sNewKey = oData.key;
	
					oFlag = Object.assign({}, oData)
					aoCopyData.splice(i, 1);
					
				} else if(!aoCatalogData.some(o => (o.linkKey || o.key) == oData.key && o.parent == sParentKey)) {
					sNewKey = sParentKey;
					// 判断该数据是否已加入到aoCatelogData中。
					if(oData.parent !== undefined) {
						// 复制该节点。
						oFlag = Object.assign({}, oData, {
							parent: sNewKey,
							// 当前节点的源节点。
							linkKey: oData.key,
							// 自定义改节点的key值。
							key: "new-" + _getLength(oData.key) + "-" + oData.key // 通过长度获取。
						})
					} else {
						oData.parent = sParentKey;
						oFlag = Object.assign({}, oData)
					}
	
				}
	
				// 判断是否已经重复加入。--- key相同且parent相同。
				if(!window.Rt.utils.isEmptyObject(oFlag) && !(aoCatalogData.some(o => o.key == oFlag.key && o.parent == oFlag.parent))) {
					aoCatalogData.push(oFlag);
	
					_findChildrenData(aoCopyData, (oFlag.linkKey || oFlag.key), sNewKey)
				}
	
			}
		}
	}
	
	
	/**
	 * 复制节点获取其key值。
	 * @param {String} sKey
	 * @return {String}
	 */
	function _getLength(sKey) {
	    return aoCatalogData.filter( o => (o.linkKey || o.key) == sKey).length
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
		
		for(let i = 0; i < aoCatalogData.length; i++) {
			let oData = aoCatalogData[i];

			if(isMaterialNode(oFilter)) {
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
				let sKey = oData.linkKey || oData.key
				
				// 如果该节点时复制节点，判断其原节点是否存在，（存在-不加入。 不存在-加入）
				if(oData.name === oFilter.name && oValue.bSame && !oResult.key.some(o => o.key == sKey)) {
					
					oResult.key.push({
						key: sKey,
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
			// key值相同  且节点的parent属于一样的。 || 物料只需判断key值
			return o.sublings.some( o1 => o1.key == (oData.linkKey || oData.key) && (isMaterialNode(oData) ||  _isExitCopy(o1, oData)) )
		})
	}
	
	function _isExitCopy(o1, o2) {
		return aResult.some(o3 => {
			return o3.sublings.some(o => o.key == o1.parent) && o3.sublings.some(o => o.key == o2.parent) 
		})
	}
	
	/**
	 * 判断工序是否是同一个合并后的父级。
	 */
	function _isSameLevel(oData, oValue) {
		let oR = {
			// 是否属于合并和、后的同一个显示的物料节点
			bSame: false,
			// 该显示的物料节点的key值。
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

// 获取追溯左侧导航数据。
var getCatalogData1 = function(aoRowData) {	
	let aoCatalogData = [],
		aoCopyData = JSON.parse(JSON.stringify(aoRowData)),
		aResult = []
	
	// 修改节点的类型值。
	aoCopyData.forEach(o => o.iconType = getNodeIconAndTemp(o.nodeType).icon)
	
	for(let i = aoCopyData.length - 1; i >= 0; i--) {
		let oData = aoCopyData[i];

		if(oData && oData.parents === SPARENTKEY) {
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
		if(isMaterialNode(oData) && !_isExist(oData)) {
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
		if(!(isMaterialNode(oData)) && !_isExist(oData)) {
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
				if(isMaterialNode(oData)) {
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

			if(isMaterialNode(oFilter)) {
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

// 处理追踪中树
var getTrackCatalogData = function(aoRowData) {	
	let aoCatalogData = [],
		aoCopyData = JSON.parse(JSON.stringify(aoRowData)),
		aResult = []
	
	// 修改节点的类型值。
	aoCopyData.forEach(o => o.iconType = getNodeIconAndTemp(o.nodeType).icon)
	
	for(let i = aoCopyData.length - 1; i >= 0; i--) {
		let oData = aoCopyData[i];

		if(oData && isMaterialNode(oData) && !aoCatalogData.some(o => o.key == oData.key)) {
            oData.parent = "";
  			aoCatalogData.push(oData);

  			aoCopyData.splice(i, 1);

  			_findParentsData(aoCopyData, oData.parents, oData.key)
        }
	}
	
	// 物料的合并
	for(let i = 0; i < aoCatalogData.length; i++) {
		let oData = aoCatalogData[i];
		let aKey = []
		if(isMaterialNode(oData) && !_isExist(oData)) {
			// 物料-找同名
			aKey = _getKeysOfSameName(oData).key
			aResult.push(Object.assign({}, oData, {
				name: (aKey.length-1) ? oData.name + "("+ aKey.length +")": oData.name,
				sublings: aKey
			}))
		}
	}

	// 获取同名同物料下的工序。
	for(let i = 0; i < aoCatalogData.length; i++) {
		let oData = aoCatalogData[i];
		if(!isMaterialNode(oData) && !_isExist(oData)) {
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
	 * 递归查找父节点。
	 * @param {Array} aoCopyData
	 * @param {String} sKey
	 * @param {String} sParentKey
	 * @return {void}
	 */
	function _findParentsData(aoCopyData, sKey, sParentKey) {
		for(let i = aoCopyData.length - 1; i >= 0; i--) {
			let oData = aoCopyData[i],
				sNewKey = "",
				oFlag = {};
	
			if(oData && sKey.split(",").includes(oData.key)) {
				// 当前元素的父级。
				if(isMaterialNode(oData)) {
					oData.parent = "";
					sNewKey = oData.key;
	
					oFlag = Object.assign({}, oData)
					aoCopyData.splice(i, 1);
					
				} else if(!aoCatalogData.some(o => (o.linkKey || o.key) == oData.key && o.parent == sParentKey)) {
					sNewKey = sParentKey;
					// 判断该数据是否已加入到aoCatelogData中。
					if(oData.parent !== undefined) {
						// 复制该节点。
						oFlag = Object.assign({}, oData, {
							parent: sNewKey,
							// 当前节点的源节点。
							linkKey: oData.key,
							// 自定义改节点的key值。
							key: "new-" + _getLength(oData.key) + "-" + oData.key // 通过长度获取。
						})
					} else {
						oData.parent = sParentKey;
						oFlag = Object.assign({}, oData)
					}
	
				}
	
				// 判断是否已经重复加入。--- key相同且parent相同。
				if(!window.Rt.utils.isEmptyObject(oFlag) && !(aoCatalogData.some(o => o.key == oFlag.key && o.parent == oFlag.parent))) {
					aoCatalogData.push(oFlag);
	
					if(oFlag.parents != SPARENTKEY) {
						_findParentsData(aoCopyData, oFlag.parents, sNewKey)
					}
				}
	
			}
		}
	}
	
	/**
	 * 复制节点获取其key值。
	 * @param {String} sKey
	 * @return {String}
	 */
	function _getLength(sKey) {
	    return aoCatalogData.filter( o => (o.linkKey || o.key) == sKey).length
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
		
		for(let i = 0; i < aoCatalogData.length; i++) {
			let oData = aoCatalogData[i];

			if(isMaterialNode(oFilter)) {
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
				let sKey = oData.linkKey || oData.key
				
				// 如果该节点时复制节点，判断其原节点是否存在，（存在-不加入。 不存在-加入）
				if(oData.name === oFilter.name && oValue.bSame && !oResult.key.some(o => o.key == sKey)) {
					
					oResult.key.push({
						key: sKey,
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
			// key值相同  且节点的parent属于一样的。 || 物料只需判断key值
			return o.sublings.some( o1 => o1.key == (oData.linkKey || oData.key) && (isMaterialNode(oData) ||  _isExitCopy(o1, oData)) )
		})
	}
	
	function _isExitCopy(o1, o2) {
		return aResult.some(o3 => {
			return o3.sublings.some(o => o.key == o1.parent) && o3.sublings.some(o => o.key == o2.parent) 
		})
	}
	
	/**
	 * 判断工序是否是同一个合并后的父级。
	 */
	function _isSameLevel(oData, oValue) {
		let oR = {
			// 是否属于合并和、后的同一个显示的物料节点
			bSame: false,
			// 该显示的物料节点的key值。
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

const needTableDatas = (pathMapping,nodeType,allColumns)=>{
	let tableData = {}
	tableData.filename = pathMapping[nodeType]
	tableData.columns = allColumns[nodeType]	
	tableData.data = []	

	return tableData
}

export default {
	parseData,
	parseTreeData,
	parseQueryParam,
	getTreeData,
	getCatalogData,
	getTrackCatalogData,
	SPARENTKEY
}

export { needTableDatas }
