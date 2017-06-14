/**
 * 溯源页面逻辑脚本。
 * 
 * @since 2016-04-29
 * @version 1.0
 * @author Jenny
 */

	/**
	 * 点击左侧树节点。
	 * @param {Object} e
	 * @param {Object} node
	 * @return {void}
	 */
	function onClickTreeNode(e, node){

	    _expandAllTreeInCavas(node.data);
	    var nodeInMyShowInTable = myDiagram.findNodeForKey(node.data.key);
	    nodeInMyShowInTable.isSelected = true;
	
	    var validNode = _findValidNode(node);
	    
	    if(validNode){
	        var nodeInMy = myDiagram.findNodeForKey(validNode.data.key);
	        _showAllNode();
	        _hiddenParent(nodeInMy);
	    }
	
	    menutree.nodes.each(function(obj) {
	    	obj.background = null;
	    	obj.findObject("TB").stroke = "#fff";
	    });
	    
		if(node.isSelected){
	        node.background = "white";
	        node.findObject("TB").stroke = "#333";
	    }else{
	        node.background = null;
	        node.findObject("TB").stroke = "#fff";
	    }
	}
	
	/**
	 * 找到可用的节点。
	 * @param {Object} node
	 * @return {Object}
	 */
	function _findValidNode(node){
	    if(node.data.type == 1){
	        return node;
	    }
	
	    var parentNode = node;
	    
	    while(1){
	        var nodeTmp = parentNode.findTreeParentNode();
	        if(!nodeTmp){
	            return parentNode;
	        }
	        if(nodeTmp.data.type == 1){
	            return nodeTmp;
	        }
	        parentNode = nodeTmp;
	    }
	}
	
	/**
	 * 展开右侧节点。
	 * @param {Object} oData
	 * @return {void}
	 */
	function _expandAllTreeInCavas(oData){
//	    var root = myDiagram.findTreeRoots();
//	    root.each(function(obj){
//	        _expandAllChildren(obj,oData.key);
//	    });
		var oRoot = {},
			aoNewData = [],
			aoNewLinkData = [],
			aoCopyData = $.extend(true, [], aoDiagramData);
			oGroup = {};
		
		// 找到根节点。
		_findRoot(oData.key);
		
		if(oRoot.key != sRootKey) {
			// 若根节点改变，重新找到链路数据。
			aoNewData.push(oRoot);
			
			_spliceData(aoCopyData, oRoot.key);
			
			var sGroup = oRoot.group;
			if(sGroup && !oGroup[sGroup]) {
				oGroup[sGroup] = 1;
				aoNewData.push(aoCopyData.filter(function(oData) {
					return oData.key == sGroup
				})[0]);
				_spliceData(aoCopyData, sGroup);
			}
			_findChildren(oRoot.key);
	
			myDiagram.model = new go.GraphLinksModel(aoNewData, aoDiagramLinkData);		
			
			sRootKey = oData.key;
		}else {
			myDiagram.nodes.each(function(node){
				if(node.isSelected) {
					// 若选中。
					node.isSelected = false;
				}
			})
		}
		
		if(oData.group) {
			// 若节点在组合中。
			if(!myDiagram.findNodeForKey(oData.group).isSubGraphExpanded) {
				myDiagram.findNodeForKey(oData.group).expandSubGraph();
			}
		}
		
		/**
		 * 移除已使用的数据。
		 * @param {Object} aoCopyData
		 * @param {Object} sKey
		 * @return {void}
		 */
		function _spliceData(aoCopyData, sKey) {
			for(var i = aoCopyData.length - 1; i >= 0; i--) {
				if(aoCopyData[i].key == sKey) {
					aoCopyData.splice(i, 1);
					return;
				}
			}
		}
		
		/**
		 * 找到根节点。
		 * @param {Object} sKey
		 * @return {void}
		 */
		function _findRoot(sKey) {
			var oFilter = aoDiagramData.filter(function(oData) {
				return oData.key == sKey
			})[0];
			
			if(oFilter.type == "1" || oFilter.parent == "") {
				// 若为物料或为根节点。
				oRoot = oFilter;
			}else {
				_findRoot(oFilter.parent);
			}
		}
		
		/**
		 * 递归查找子节点。
		 * @param {Object} sKey
		 * @return {void}
		 */
		function _findChildren(sKey) {
			
			var aoFilter = aoCopyData.filter(function(oData) {
				return oData.parent == sKey
			});
			
			aoFilter.forEach(function(oFilter){
				aoNewData.push(oFilter);
				_spliceData(aoCopyData, sKey);
				
				var sGroup = oFilter.group;
				if(sGroup && !oGroup[sGroup]) {
					oGroup[sGroup] = 1;
					aoNewData.push(aoCopyData.filter(function(oData) {
						return oData.key == sGroup
					})[0]);
					
					_spliceData(aoCopyData, sGroup);
				}
				
				_findChildren(oFilter.key);				
			})
		}
	}
	
	/**
	 * 展开所有子节点。
	 * @param {Object} obj
	 * @param {Object} key
	 * @return {void}
	 */
	function _expandAllChildren(obj,key){
	    if(!obj.isTreeExpanded){
	        obj.expandTree();
	    }
	    if(obj.isSelected && key!=obj.data.key){
	        obj.isSelected = false;
	    }
	    var children = obj.findTreeChildrenNodes();
	    if(!children){
	        return;
	    }
	    children.each(function(node){
	        _expandAllChildren(node,key);
	    });
	}
	
	
	/**
	 * 展示所有节点。
	 * @return {void}
	 */
	function _showAllNode(){
	    var root = myDiagram.findTreeRoots();
	    root.each(function(obj){
	        _showllAllChildren(obj);
	    });
	}
	
	/**
	 * 展示所有子节点。
	 * @param {Object} parentNode
	 * @return {void}
	 */
	function _showllAllChildren(parentNode){
	    if(parentNode.visible){
	        return;
	    }
	    var children = parentNode.findTreeChildrenNodes();
	    children.each(function(obj){
	        _showllAllChildren(obj);
	    });
	    parentNode.visible = true;
	}
	
	/**
	 * 隐藏父级节点。
	 * @param {Object} node
	 * @return {void}
	 */
	function _hiddenParent(node){
	    var parent = node.findTreeParentNode();
	    if(parent){
	        parent.visible = false;
	        _hiddenParent(parent);
	        _hiddenParentChildren(parent,node);
	    }else{
	        return;
	    }
	}
	
	/**
	 * 隐藏父级节点的子节点。
	 * @param {Object} node
	 * @param {Object} currentNode
	 * @return {void}
	 */
	function _hiddenParentChildren(node,currentNode){
	    var childrens = node.findTreeChildrenNodes();
	    childrens.each(function(obj){
	        if(obj != currentNode) {
	            obj.visible = false;
	            _hiddenParentChildren(obj);
	        }
	    });
	}
	
	/**
	 * 页面事件监听。
	 * @return {void}
	 */
	function _addEventListeners() {		        
        window.onresize = _resize;	
        
		
		jLayout.find(".layout-split-west").resizable({
//  		onStopResize:function(e){
//  			console.log(e);
//			}
		});

        // 添加页面公共事件。
        addPublicEvent();
	}
	
	/**
	 * 自适应高度。
	 * @return {void}
	 */
	function _resize() {
		var clientheight = document.documentElement.clientHeight,
			clientwidth = document.documentElement.clientWidth,
			headHeight = jHeader.outerHeight(true),
			mainHeight = Math.floor(clientheight-headHeight),
			paddingHeight = jMain.outerHeight(true) - jMain.height(),
			nTableHeight = (parseInt(mainHeight-jInfo.outerHeight(true)-paddingHeight)*45)/100-3;
		
		jMain.css("height", mainHeight);

		jMenuTree.css("height", mainHeight-paddingHeight-3);
		jDiagram.css("height", (parseInt(mainHeight-jInfo.outerHeight(true)-paddingHeight) * 55) / 100);

        jTable.css("height",nTableHeight);
        
        jTable.find(".scroll").css("height", nTableHeight-30);
		
    	jCover.css("width",$("body").width()+"px")
    			   .css("height",$("body").height()+"px");

		setTimeout(function() {
			setTableWidth();
		}, 500);	
	}
	

	/**
	 * 获取详细信息。
	 * @param {Object} node
	 * @return {void}
	 */
	function getVerboseInfo(node) {
		var sRequestUrl = "",		
			oUrlData = {};		
			
		$(".data-head").empty();
		$(".data-table").empty();
		$(".info-table").empty();
	//	$(".tablediv").attr('style', $("#tablediv").attr('style').replace("overflow-y: scroll;", ""));
		$(".tablediv").addClass("loading");

		if (oUrlParam.batchpage) {
			// 批次明细。
			sRequestUrl = oAjaxUrl.retrospectBatchDetail;
			oUrlData = {
				"batch_no": oUrlParam.batch,
				"material_code": oUrlParam.material,
				"process": oUrlParam.process,
				"shift": oUrlParam.shift,
				"s_date": oUrlParam.start,
				"e_date": oUrlParam.end,
				"code": node.data.code,
				"type": node.data.type,
				"level": node.data.level
			};
		}else {
			// 单件明细。
			sRequestUrl = oAjaxUrl.retrospectDetail;
			oUrlData = {
				"barcode": oUrlParam.barcode,
				"process": oUrlParam.process,
				"shift": oUrlParam.shift,
				"s_date": oUrlParam.start,
				"e_date": oUrlParam.end,
				"type": node.data.type,
				"level": node.data.level,
				"code": node.data.code
			};
		}
		
		if(!goPage.oAjax) {
			goPage.oAjax = {
				getVerboseInfo: {bIsSending: false}
			}
		}
		
		if(!goPage.oAjax.getVerboseInfo) {
			goPage.oAjax.getVerboseInfo = {bIsSending: false}
		}
	
		ajaxRequest(sRequestUrl, oUrlData, _fnSuccess, _fnComplete, goPage.oAjax.getVerboseInfo);
		
		
		/**
		 * 数据请求成功后的回调。
		 * @param {Array} aoResult
		 * 
		 */
		function _fnSuccess(aoResult) {
			aoResult = [{"equipment_name":"装配2.2线GP12","do_code":"D201603310017","batch_no":"20160331A","quantity":"16","process_level":"1","mold_code":"","person_name":"李瑞娇","shift_name":"","person_code":"11756","e_time":"2016-03-31 14:28:33","process_code":"210","process_name":"GP12","bucket_no":"128_D201603310017_20160331142826730","s_time":"2016-03-31 14:26:22","material_name":"ZC/SGE LFV 活塞总成/环销卡簧连杆/新型线/12667058","barcode":"UN#65457437520007057","material_code":"10000515","equipment_id":"128"}];
			
			if (aoResult && aoResult.length) {
				setTableValue(aoResult, node.data.type);
			}else {
				// 隐藏导出excel图标。
				$(".btn-excel").hide();
				$(".btn-printtable").hide();
			}			
		}
			
		/**
		 * 数据请求完成后的回调。
		 * @param {Object} XMLHttpRequest
		 * @param {Object} textStatus
		 */
		function _fnComplete(XMLHttpRequest, textStatus) {
			$(".tablediv").removeClass("loading");
		}

	}

