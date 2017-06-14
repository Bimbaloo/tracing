//openNewWindow()为新开一个页面
//openWindow()为弹窗

var nTimer = 0,
	oaLanguage = {
		en: ["Barcode", "Warehouse", "Stock" , "In-out Stock Type", "Batch No.", "Quantity",
		     "Handle Time", "Operator", "Customer", "Process Name", "Material Code", 
		     "Material Name", "Equipment", "Mold Code", "Shift", "Completion Time", "Operate", "Do code",
		     "In-out warehouse inventory of this batch.", "Incoming quality control.", "Query process parameters.",
		     "Single Track", "Batch Track", "Incoming Inspection", "Quick-access Report", "QC", "FGB Inspection",
		     "Submittal For Inspection", "No.", "Start time", "Cutter"],
		ch: ["条码", "仓库", "库位", "出入库", "批次", "总量", "处理时间", "操作人", "供应商/客户", "工序名称","物料编码","物料名称", "生产设备", "模号",
		     "班次", "完工时间", "操作", "工单号", "同批出入库", "查来料", "工艺参数", "单筐追踪", "批次追踪", "进货检验", "快速报告", "质检", "FGB检验",
		     "送检", "序号", "开始时间", "刀具"]
	};


/**
 * 选中节点事件。
 * @param {Object} oNode
 * @return {void}
 */
function onNodeSelectionChange(oNode){

}

/**
 * 
 * @param {Object} e
 * @param {Object} node
 */
function onClickCatalogNode(e, node) {
	
}


/**
 * 节点单击事件。
 * @param {event} e
 * @param {Object} node
 * @returns {void}
 */
function onClickNode(e, node, oTree, oCatalog) {
    oTree.nodes.each(obj => {
		obj.background = null;
    	obj.findObject("TB") && (obj.findObject("TB").stroke = "#333");
    });
	
	let nodeInmenutree = null;
	if(oCatalog) {
		nodeInmenutree = oCatalog.findNodeForKey(node.data.key);

		oCatalog.nodes.each(obj => {
			obj.isSelected = false;
	    	obj.background = null;
	    	obj.findObject("TB").stroke = "#fff";
	    });
	}
    
    if(node.isSelected){
//  	goPage.pageHandler.getVerboseInfo(node);
    	
    	if(nodeInmenutree) {
	    	nodeInmenutree.background = "white";
	    	nodeInmenutree.isSelected = true;
	    	nodeInmenutree.findObject("TB").stroke = "#333";    		
    	}

        node.background = "#40484a";
        node.findObject("TB") && (node.findObject("TB").stroke = "#fff");

    }else {    	
		node.background = null;
        
        if(nodeInmenutree) {
        	nodeInmenutree.isSelected = false;
        }
    }
}


/**
 * 节点右键点击事件。
 * @param e
 * @param node
 * @returns void
 */
function onContextClickNode(e, node) {
//	console.log("rightclick");
}



/**
 * 节点双击事件。
 * @param e
 * @param node
 * @returns void
 */
function onDoubleClickNode(e, node) {

	if (node.wasTreeExpanded) {
		node.wasTreeExpanded = false;
		node.expandTree();
	} else {
		node.wasTreeExpanded = true;
		node.collapseTree();
	}

}

/**
 * tooltip数据。
 * @param {Object} data
 * @return {String}
 */
function tooltipTextConverter(data) {
	return data.show_name;
}

/**
 * 双击背景放大缩小当前画布。
 * @returns {void}
 */
function zoomDiagram(oTree, bFlag) {
	if(bFlag) {
		oTree.zoomToFit();		
	}else {
		let oDiagram = document.getElementById("tree").querySelector(".canvas"),
			nHeight = oDiagram.clientHeight,
			nWidth = oDiagram.clientWidth;

    	oTree.zoomToRect({width:nWidth,height: nHeight}, go.Diagram.UniformToFill);
	}
}

export {
	onNodeSelectionChange, 
//	onClickCatalogNode,
	onClickNode, 
	onContextClickNode, 
	onDoubleClickNode, 
	tooltipTextConverter, 
	zoomDiagram
}