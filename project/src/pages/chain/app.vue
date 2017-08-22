<template>
	<div id="app">
		<!--@click.stop="showProcessFilter('')"-->
		<div class="strand-wraps">
			<!-- header 部分-->
			<v-header></v-header>
			<!-- 内容部分 -->
			<div class="strand-content-wrap">
				<div class="strand-content">
					<el-form class="filters content-filters" :model="searchParam" :rules="rules" ref="searchParam" label-position="left" label-width="80px">
						<el-form-item class="filter-item filter-item-inline content-filter" label="物料:" prop="materialCode">
							<v-select placeholder-data="请选择物料" key-data="materialCode" :form-data="searchParam"></v-select>
						</el-form-item>
						<el-form-item class="filter-item filter-item-inline content-filter" label="批次:" prop="batchNo">
							<v-input placeholder-data="请输入批次" key-data="batchNo" :form-data="searchParam"></v-input>
						</el-form-item>
						<el-form-item class="filter-item filter-item-inline content-filter" label="开始时间:" prop="startTime">
							<v-dateTime style="width: auto;" date-type="date" placeholder-data="请输入开始时间" key-data="startTime" :form-data="searchParam"></v-dateTime>
						</el-form-item>
						<el-form-item class="filter-item filter-item-inline content-filter" label="结束时间:" prop="endTime">
							<v-dateTime style="width: auto;" date-type="date" placeholder-data="请输入结束时间" key-data="endTime" :form-data="searchParam"></v-dateTime>
						</el-form-item>
						<el-form-item class="filter-item filter-item-inline content-filter">
							<v-button text-data="查询" @query="queryHandler('searchParam')"></v-button>
						</el-form-item>
					</el-form>
					
					<div class="line"></div>
					<!-- 内容区域 -->
					<div class="content-main" v-loading="bLoading">
						<div class="content-title">断链数据分析</div>
						
						<div class="main-container">
							<!-- 基本信息 -->
							<div class="content-legend content-info">
								<div class="legend-title">
									<span class="legend-icon"></span>
									<span class="legend-name">基本信息</span>							
								</div> 
								<div class="legend-main">
									<div class="info-detail">
										<span class="detail-item">物料名称: {{ pageData.basicInfoDto.materialName }}</span>
										<span class="detail-item">物料编码: {{ pageData.basicInfoDto.materialCode }}</span>
										<span class="detail-item">批次: {{ pageData.basicInfoDto.batchNo }}</span>
										<span class="detail-item">主生产计划号: {{ pageData.basicInfoDto.orderCode }}</span>
										<!--<span class="detail-item">派工单号: {{ pageData.basicInfoDto.doCode }}</span>-->
										<span class="detail-item">工艺路线编码: {{ pageData.basicInfoDto.manuProcessCode }}</span>
									</div>
								</div>
							</div>
							<!-- 显示设置 -->
							<div class="content-legend node-filter">
								<div class="legend-title">
									<span class="legend-icon"></span>
									<span class="legend-name">显示设置</span>
								</div>
								<div class="legend-main">
									<div class="filters info-filters">
										<div class="filter-item filter-item-inline info-filter">
											<label class="filter-name">链路类型:</label>
											<v-multiSelect style="width:400px;" :form-data="filterParam" :list-data="nodeData" placeholder-data="请选择节点" key-data="nodeType" :all-data="multiAll"></v-multiSelect>
										</div>
										<div class="filter-item filter-item-inline info-filter">
											<label class="filter-name">工序:</label>
											<v-multiSelect style="width:400px;" :form-data="filterParam" :list-data="processAllData" placeholder-data="请选择工序" key-data="aFilterProcess" :all-data="multiAll"></v-multiSelect>
										</div>
									</div>
								</div>
							</div>
							
							<!-- 操作处理 -->
							<div class="content-handler">
								<!--<v-button v-show="!bEdit" text-data="编辑" @query="editHandler"></v-button>
								<v-button v-show="bEdit" :class="{exitButtomMargin:bEdit}" text-data="退出" @query="exitHandler"></v-button>
								<v-button v-show="bEdit" text-data="保存" @query="saveHandler"></v-button>
								<v-button v-show="bEdit && aAClickLineAllData.length" text-data="删除" @query="delHandler"></v-button>-->
							
								<v-button v-show="true" class="editBtn" text-data="编辑" @query="editHandler"></v-button>
								<v-button v-show="false" class="exitBtn" text-data="退出" @query="exitHandler"></v-button>
								<v-button v-show="false" class="saveBtn" text-data="保存" @query="saveHandler"></v-button>
								<v-button v-show="false" class="delBtn" text-data="删除" @query="delHandler"></v-button>
							
							</div>
							
							<!-- 节点链 -->
							<div class="content-nodeWraps">
								<div class="nodesWrap">
									
									<div v-scrolls class="nodes-list">
										<div class="process-title">
											<!--<div class="process-item" v-for="(item,itemIndex) in orderProcess">
												<div class="item-name" 
													:class="{itemActivated:!bEdit && item == sCurrentProcess}" 
													:process="item" 
													@click.stop ="showProcessFilter(item, itemIndex, $event)">
													<span>{{ getProcessInfoByCode(item).processName }}</span>
													<i class="el-icon-arrow-down"></i>
												</div>
												<div v-show="!bEdit && item == sCurrentProcess" class="item-pop-filter">
													<v-pFilter :process-data="processFilter[item]" @showPop="showPopModal"></v-pFilter>
												</div>
											</div>-->
											<div class="process-item" v-for="(item,itemIndex) in orderProcess">
												<div class="item-name" 
													:process="item" 
													@click.stop ="showProcessFilter(item, itemIndex, $event)">
													<span>{{ getProcessInfoByCode(item).processName }}</span>
													<i class="el-icon-arrow-down"></i>
												</div>
												<div v-show="false" class="item-pop-filter">
													<v-pFilter :process-data="processFilter[item]" @showPop="showPopModal"></v-pFilter>
												</div>
											</div>
										</div>
										<div class="process-nodes">
											<div class="process-lines">
												<v-pLine 
													:node-po="oNodePositon" 
													v-for="line in showNodeLine"
													:line-type="getNodeLineType(line)"
													:line-data="line"
													@nodeLineClick="nodeLineClickHandler"
												></v-pLine>
											</div>
											<div class="item-nodes" v-for="(item,column) in orderProcess">
												<div class="item-node" :node-id="node" v-for="(node,row) in getFilterNodeByProcessCode(item)">
													
													<!-- :disabled="bEdit" -->
													<el-tooltip placement="top">
														<div slot="content">
															<v-pTip :node-id="node" :node-tip="getNodeTipInfoById(node)"></v-pTip>
														</div>
														<v-pNode
															:value="setNodePosition(node,row,column)"
															:class="{normal: getNodeType(node)=='normal', broken: getNodeType(node)=='broken',recovered: getNodeType(node)=='recovered', canDo: isNodeCanBeRecovered(node)}" 
															:node-id="node" 
															:node-value="getNodeInfoById(node)"
															@nodeClick="nodeClickEvent">
														</v-pNode>
													</el-tooltip>
																										
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<v-pModal
			:pop-show="bProcessFilterModalShow" 
			:pop-type="sProcessFilterModalType"
			:pop-recover="aRecoverInfo"
			:pop-del="aRemoveInfo"
			:pop-value="popValue"
			@hidePop = "hidePopModal"
		></v-pModal>
		<v-pProduce
			:pop-show="bRecoveredProduceModalShow"
			:pop-value="getRecoveredProducePopData()"
			@hideProducePop="hideProducePopModal"
		></v-pProduce>
	</div>
</template>

<script>
	import $ from "jquery" 
    import Header  from 'components/header/header.vue'
	import Input from "components/basic/input.vue"
    import Select from "components/basic/select.vue"
    import MultiSelect from "components/basic/multiSelect.vue"
    import Button from "components/basic/button.vue"
    import DateTime from "components/basic/dateTime.vue"
    import ProcessFilter from "components/chain/processFilter.vue"
    import ProcessModal from "components/chain/processModal.vue"
    import ProcessTips from "components/chain/processTips.vue"
    import ProcessNode from "components/chain/processNode.vue"
    import ProcessLine from "components/chain/processLine.vue"
    import ProcessProduct from "components/chain/processProduceInfo.vue"
    import fnP from "assets/js/public.js"
    
    // 节点类型数据。
    var aoNodeType = [{
    	value: "1",
    	label: "正常节点"
    },{
    	value: "2",
    	label: "断链节点"
    },{
    	value: "3",
    	label: "修复节点"
    }];
    
    const LINK_NODE_URL = HOST + "/api/v1/linkrepair/links";
    const LINK_NODE_REPAIR_URL = HOST + "/api/v1/linkrepair/repair"
    
    export default {
    	components: {
    		"v-header": Header,
    		"v-input": Input,
    		"v-select": Select,
    		"v-multiSelect": MultiSelect,
    		"v-button": Button,
    		"v-dateTime": DateTime,
    		"v-pFilter": ProcessFilter,
    		"v-pModal": ProcessModal,
    		"v-pTip": ProcessTips,
    		"v-pNode": ProcessNode,
    		"v-pLine": ProcessLine,
    		"v-pProduce": ProcessProduct
    	},
    	data() {
    		let // 验证物料。
            	validateMaterialcode = (rule, value, callback) => {
            		if(!value) {
            			callback(new Error("请输入物料"));
            		}else {
            			callback();
            		}
            	},
            	// 验证批次。
            	validateBatch = (rule, value, callback) => {
            		if(!value.trim()) {
            			callback(new Error("请输入批次"));
            		}else {
            			callback();
            		}
            	},
        		// 验证结束时间。
        		validateEndTime = (rule, value, callback) => {
            		let sStart = this.searchParam.startTime;
            		
            		if(sStart && value && sStart > value) {
            			// 如果开始时间存在，而且开始时间大于结束时间。
            			callback(new Error("结束时间必须大于开始时间"));
            		}else {
            			callback();
            		}
            	};
            	
            let sMultiValue = "all";
            
    		return {
				// 查询标记。
				tag: "",
    			// 获取页面数据。
    			pageData: {
    				"doInOuts":[],
    				"basicInfoDto":{
    					"materialName": "",
						"materialCode": "",
						"batchNo": "",							
						"doCode": "",			
						"orderCode": "",						
						"manuProcessCode": "",
						"processArr": []
    				}
    			},
    			// 是否编辑。
    			bEdit: false,
    			// 编辑时选中的断链节点。
    			aBrokenNode: [],
    			// 记录编辑过程中所有的值。这个是顺序的 上-下---断链节点链接的值。[[1,2],[2,3]]
    			aAClickNodeAllData: [],
    			// 记录编辑过程中需删除的已存在的值。
    			aAClickLineBeforeData: [],
    			// 记录编辑过程中所有选中线的值。 这个是顺序的 上-下-- [[1,2]]
    			aAClickLineAllData: [],
    			// 节点类型值
    			nodeData: aoNodeType,
    			// 所有物料数据。
    			materialData: [],
    			// 所有工序值。
    			processAllData: [],
    			// 显示当前工序过滤的项。 -- 具体过滤哪道工序。
    			sCurrentProcess: "",
    			// 当前过滤弹窗显示的类型。 -- 投入时间，产出时间。。。
    			sProcessFilterModalType: "",
    			// 当前弹窗是否显示。默认不显示。
    			bProcessFilterModalShow: false,
    			// 当前弹窗是否显示。 默认不显示--- 修复的产出信息弹窗。
    			bRecoveredProduceModalShow: false,
    			// 记录编辑修复过程中保存的产出信息弹窗。
    			oAClickNodeProduceData: {},
    			// node节点的位置。
    			oNodePositon: {},
    			// 多选全部的提示字段。
    			multiAll: sMultiValue,
    			// 提示信息。
    			sInfo: "",
    			// 修复时的数据。
    			aRecoverInfo: [],
    			aRemoveInfo: [],
    			bLoading: false,
    			// 弹窗保存的修复节点的数据。
    			savePopFilter: {
    				"recoveredDes": {
    					"name": "断链修复原因",
    					"discription": "",
    					"list": []
    				},
    				"unRecoveredDes": {
    					"name": "取消修复原因",
    					"discription": "",
    					"list": []
    				}
    			},
    			filterParam: {
    				// 节点类型。
    				"nodeType": [sMultiValue],
    				// 需过滤出工序值。
    				"aFilterProcess": [sMultiValue]
    			},
    			// 当前查询的值。
    			searchParam: {
    				"materialCode": "20000256:MP/SGE LFV 活塞毛坯/074189",
    				"batchNo": "20160420b",		//"23620170215夜班",
    				"startTime": "",
    				"endTime": ""
    			},
    			// 查询规则。
				rules: {
					// 物料。
					materialCode: [{validator: validateMaterialcode, trigger: "change"}],
					// 批次
					batchNo: [{validator: validateBatch, trigger: "change"}],
					// 结束时间。
					endTime: [{validator: validateEndTime, trigger: "change"}]
				}
    		}
    	},
    	// 计算属性。
    	computed: {
			// 获取所有的节点线。 [ [1,2,3,4],[1,3,5] ]
			allNodeLine: function() {
				return this.getAllNodeLines();
			},
			// 获取所有可连线的节点 [1,2,3,4,5]
			allFilterNode: function() {
				return this.getFilterNode();
			},
			// 获取当前节点显示的所有线。
			displayNodeLine: function() {
				return this.getNodeLine();
			},
			// 获取显示的线。--- 包括编辑时：增加和删除的
			showNodeLine: function() {
				return this.getNodeLines()
			},
			// 弹窗数据。
			popValue: function() {
				if(this.bProcessFilterModalShow) {
					return this.sProcessFilterModalType =='recoveredDes'||this.sProcessFilterModalType=='unRecoveredDes'?this.savePopFilter:this.processFilter[this.sCurrentProcess]
				}else {
					return {}
				}
			},
			// 排序后工序。
			orderProcess: function() {
				return this.getOrderProcess();
			},
    		// 获取每道工序的过滤筛选值。
    		processFilter: function() {
    			// 当前所有的工序过滤值。
    			var oReturnFilter = {},
    				_that = this;
    				
    			// 根据工序值过滤
    			this.pageData.basicInfoDto.processArr.forEach(function(oProcess) {
    				// 当前工序过滤所需参数。
    				let sProcessCode = oProcess.processCode,
    					// 投入时间。
    					aInTime = _that.getProcessNodesParam(sProcessCode, "inHappenTime"),
    					// 产出时间。
    					aOutTime = _that.getProcessNodesParam(sProcessCode, "outHappenTime"),
    					// 操作人。
    					aPerson = _that.getDataUnique(oProcess.personNames),
    					// 设备。
    					aEquipment = _that.getDataUnique(oProcess.equipmentNames),
    					// 工单。
    					aDoCode = _that.getDataUnique(oProcess.doCodes);
    				
    				// 返回的是每道工序筛选过滤的参数值。
	    			let oData = {
	    				// 投入时间
	    				"inTime": {
	    					"name": "投入时间",
							"checked": false,
							"startTime": aInTime.length ? aInTime[0] : "",
							"endTime": aInTime.length ? aInTime[aInTime.length-1] : ""
	    				},
	    				// 产出时间
	    				"outTime": {
	    					"name": "产出时间",
							"checked": false,
							"startTime": aOutTime.length ? aOutTime[0] : "",
							"endTime": aOutTime.length ? aOutTime[aOutTime.length-1] : ""
	    				},
	    				// 数据完整性。
	    				"dataLine": {
	    					"name": "数据完整性",
							"checked": false,
							"value": "1"
	    				},
	    				// 操作人。
	    				"person": {
	    					"name": "操作人",
							"checked": false,
							// 默认选中第一个。
							"selected": [_that.multiAll],	//aPerson,  //aPerson.length ? aPerson[0]: "",
							"value": aPerson
	    				},
	    				// 设备。
	    				"equipment": {
	    					"name": "设备",
							"checked": false,
							"selected": [_that.multiAll],		//aEquipment,	//aEquipment.length? aEquipment[0]: "",
							"value": aEquipment
	    				},
	    				// 工单。
	    				"doCode": {
	    					"name": "工单",
							"checked": false,
							"selected": [_that.multiAll],		// aDoCode,	//aDoCode.length ? aDoCode[0]: "",
							"value":  aDoCode
	    				}
	    			};
    				
    				// 保存每道工序的筛序值。
    				oReturnFilter[sProcessCode] = oData;
    			});
    			
    			// 返回过滤的数据。
    			return oReturnFilter;
    		}
    	},
    	watch: {
    		aAClickLineAllData: function(value) {
    			if(this.bEdit && value.length) {
    				$(".delBtn").show();
    			}else {
    				$(".delBtn").hide()
    			}
    		}
    	},
    	// 创建
    	created() {
    		// 获取所需的查询参数。
      		this.tag = location.search.split("=")[1]

          	let	oData = sessionStorage.getItem("searchConditions-" + this.tag)

			// 断链模块。
		    if(oData) {
		        oData = JSON.parse(oData);
		        if(oData.tab === "chain") {
		        	this.searchParam = oData.keys;
		        }
		    }
		    
    		// 默认查询。
    		this.getPageData();
    	},
		directives: {
			"scrolls" : {
				inserted: function(el) {
					$(el).on("scroll", function(){
						let jProcessTitle = $(this).find(".process-title");
						jProcessTitle.css("left", ("-"+this.scrollLeft)+"px");
					});
				}
			}
		},
		mounted() {
			let _that = this;
			
			window.onresize = () => {
		        _that.setHeight();
		    }
		},
    	// 方法
    	methods: {
    		// 设置内容的高度。
    		setHeight() {
    			let nContentHeight = $(".strand-content").height(),
    				nHeight = 0;
    				
    			nHeight = document.body.clientHeight
    					- $("header").outerHeight(true)
    					- ($(".strand-content-wrap").outerHeight(true) - $(".strand-content-wrap").height())
    					- 40
    					- $(".content-filters").outerHeight(true)
    					- $(".line").outerHeight(true)
    					- $(".content-main .content-title").outerHeight(true)
    					- $(".content-info").outerHeight(true)
    					- $(".node-filter").outerHeight(true)
    					- $(".content-handler").outerHeight(true)
    					- ($(".content-nodeWraps").outerHeight(true) - $(".content-nodeWraps").height())
    			
    			$(".nodes-list").height(nHeight)
//  			return nHeight
    		},
    		// 初始化数据。恢复页面数据为初始化显示的值。
    		initData() {
    			// 获取页面数据。
    			this.pageData = {
    				"doInOuts":[],
    				"basicInfoDto":{
    					"materialName": "",
						"materialCode": "",
						"batchNo": "",							
						"doCode": "",			
						"orderCode": "",						
						"manuProcessCode": "",
						"processArr": []
    				}
    			};
    			this.bEdit = false;
				
    			this.aBrokenNode = [];
    			this.aAClickNodeAllData = [];
    			this.aAClickLineBeforeData = [];
    			this.aAClickLineAllData = [];
    			this.nodeData = aoNodeType;
    			this.processAllData = [];
    			this.sCurrentProcess = "";
    			this.sProcessFilterModalType = "",
    			this.bProcessFilterModalShow = false;
    			this.bRecoveredProduceModalShow = false;
    			this.oAClickNodeProduceData = {};
    			this.oNodePositon = {};
    			this.sInfo = "";
    			this.aRecoverInfo = [];
    			this.aRemoveInfo = [];
    			this.savePopFilter = {
    				"recoveredDes": {
    					"name": "断链修复原因",
    					"discription": "",
    					"list": []
    				},
    				"unRecoveredDes": {
    					"name": "取消修复原因",
    					"discription": "",
    					"list": []
    				}
    			};
    			
    			this.filterParam.nodeType = [this.multiAll];
    		},
    		// 设置节点的位置。
    		setNodePosition(sNode,row,column) {
    			this.oNodePositon[sNode] = [row,column]
    		},
    		// 显示提示信息。
    		showMessage() {
    			this.$message(this.sInfo);
    		},
    		/**
    		 * 获取工序节点的工序值。
    		 * @param {Object} oNode
    		 * @return {String} sProcessCode
    		 */
    		getNodeProcessCode(oNode) {
    			let sProcessCode = "";
    			
    			sProcessCode = oNode.parentProcessCode || oNode.inProcessCode;
    			
    			// 返回工序节点的工序值。
    			return sProcessCode;
    		},
    		// 获取修复时的数据信息。
    		getRecoveredInfo(aRcover) {
    			var _that = this,
    				aNew = [];
    			
    			// 修复的数据。
    			aRcover.forEach(function(aNode) {
    				var aData = [];
    				console.log(aNode)
    				aNode.forEach(function(sNode, nIndex) {
    					// 根据索引判别上、下工序。
    					console.log(sNode)
    					let oValue = _that.getNodeInfoById(sNode),
    						sKey = (nIndex == 0) ?"in": "out";
    						
    					aData.push({
    						processName: oValue.parentProcessName||oValue.inProcessName,
    						equipmentName: oValue[sKey+"EquipmentName"],
    						happenTime: oValue[sKey+"HappenTime"],
    						quantity: oValue[sKey+"Quantity"]
    					});
    				});
    				// 加入数据。
    				aNew.push(aData);
    			});
    			
    			// 返回数据。
    			return aNew;
    		},
    		// 获取显示的线。
    		getNodeLines() {
    			console.log("--000")
    			let aLines = this.displayNodeLine,	//this.getNodeLine(),
    				aAdd = this.aAClickNodeAllData,
    				aDel = this.aAClickLineBeforeData,
    				aNew = [],
    				bFlag = false;
    	
    			// 添加线。
    			aNew = aLines.concat(aAdd);
    			// 删除线。
    			// 判断是否存在，两个 数组中存在的数据都是顺序的。
    			aDel.forEach(function(aRemove) {
    				let bFlag = false,
    					nIndex = -1;
    					
    				bFlag = aNew.some(function(aNode,n) {
    					nIndex = n;
    					return aNode.join(",") == aRemove.join(",");
    				});
    				
    				if(bFlag && nIndex > -1) {
    					aNew.splice(nIndex,1);
    				}
    			});
    			
    			// 初始化创建的值，及过程中增加的值。及过程中删除的值。
    			return aNew;
    		},
    		// 返回节点的类型-- normal，broken，recovered
    		getNodeType(sNode) {
    			let oNode = this.getNodeInfoById(sNode),
    				// 修复
    				nIsRecovered = oNode.repairType,
    				// 断链。
    				nIsBroken = oNode.isBroke,
    				// 返工。
    				nIsRework = oNode.isRework,
    				sType = "";
    			
    			if(!nIsBroken && !nIsRecovered) {
    				// 正常节点。
    				sType = "normal"
    			}else if(nIsBroken) {
    				// 断链节点。
    				sType = "broken";
    			}else if(nIsRecovered) {
    				// 修复节点。
    				sType = "recovered";
    			}
    			
    			// 返回节点的类型。
    			return sType;
    		},
    		// 判断节点是否可以修复
    		isNodeCanBeRecovered(sNode) {
    			let oNode = this.getNodeInfoById(sNode),
    				bFlag = false;
    			
    			// 投入修复 或产出修复。
    			if(oNode.isInCanRepair || oNode.isOutCanRepair) {
    				bFlag = true;
    			}
    			
    			// 返回节点的类型。
    			return bFlag;
    		},
    		// 判断节点之间的连线类型。
    		getNodeLineType(aLine) {
    			console.log("22222")
    			let bFlag = false,
    				_that = this,
    				sType = "normal";
    				
    			// 已经是顺序的。
    			aLine = _that.setNodeOrder(aLine);
    			
    			// 上道工序修复为2，3，或下道工序修复为1，3
    			aLine.forEach( function(sNode, nIndex) {
    				let sValue = _that.getNodeInfoById(sNode).repairType;
    				
    				if( sValue == "3" || (!nIndex && sValue == "2") || (nIndex && sValue == "1")) {
    					sType = "recovered";
    				}
    			});
    			
    			// 返回节点的类型。
    			return sType;
    		},
    		// 获取工序数据。
    		getProcessData() {
    			// 返回数据。
    			return this.parseProcessFormat(this.pageData.basicInfoDto.processArr);
    		},
    		getInitProcessData() {
    			let _that = this,
    				aReturn = [],
    				aNow = _that.getProcessData()
    			
    			aNow.forEach(function(oData) {
    				aReturn.push(oData.value);
				});
				return aReturn;
    		},
    		// 工序数据格式转换。
    		parseProcessFormat(aoData) {
    			var aoNewData = [];
    			
    			// 工序数据格式处理。 select显示-- label value
    			aoData.forEach((oData) => {
    				aoNewData.push({
    					label: oData.processName,
    					value: oData.processCode
    				});
    			});
    			// 返回工序转换后的数据。
    			return aoNewData;
    		},
			// 根据工序编码获取当前工序的详细信息。
			getProcessInfoByCode(sCode) {
				// 当前节点信息。
    			let aProcess = [];
    			
    			aProcess = this.pageData.basicInfoDto.processArr.filter(function(oNode) {
    				return oNode.processCode == sCode;
    			});
    			
    			// 返回数据。
    			if(aProcess.length) {
    				return aProcess[0];
    			}else {
    				return {};
    			}
			},
			// 根据工序编码获取当前工序下所有投入或产出节点。
			getProcessNodesByCode(sCode) {
				// 当前数据。
				let aMatchData = [],
					_that = this;
				
				// 获取匹配的数据。
				aMatchData = this.pageData.doInOuts.filter(function(oProcess) {
					return _that.getNodeProcessCode(oProcess) == sCode;
//					return oProcess.parentProcessCode == sCode || oProcess.inProcessCode == sCode;
				});
				
				// 返回数据。
				return aMatchData;
			},
			// 根据工序编码获取当前工序下所有节点的某个参数的集合。
			getProcessNodesParam(sCode,sParam) {
				let aoNode = this.getProcessNodesByCode(sCode),
					aReturn = [];
				
				// 循环遍历数据。
				aoNode.forEach(function(oNode) {
					aReturn.push(oNode[sParam]);
				});
				
				// 数据排序处理。
				aReturn.sort(function(sA,sB) {
					if(!isNaN(Number(sA))) {
	                    // 数字。
	                    return sA - sB;
	                }else {
	                    // 字符串。
	                    return sA > sB ? 1:-1;
	                }
				});
				
				// 返回匹配后的数据。
				return aReturn;
			},
    		// 根据投产表中id，获取其索引值。
    		getNodeIndexById(sId) {
    			let aNode = [],
    				nIndex = -1;
    			
    			aNode = this.pageData.doInOuts.filter(function(oNode,n) {
    				if(oNode.id == sId) {
	    				nIndex = n;
	    				return true;
    				}else {
    					return false;
    				}
    			});
    			
    			// 返回索引值。
    			return nIndex;
    		},
    		// 根据投产变中id，获取该节点投产记录的详细数据。
    		getNodeInfoById(sId) {
    			// 当前节点信息。
    			let aNode = [],
    				nIndex = this.getNodeIndexById(sId);
    				
    			// 返回数据。
    			if(nIndex == -1) {
    				return {};
    			}else {
    				return this.pageData.doInOuts[nIndex];
    			}
    		},
    		// 获取节点投产信息的提示数据。
    		getNodeTipInfoById(sId) {
    			let oNode = this.getNodeInfoById(sId),
    				aTipParam = ["HappenTime","Quantity","DoCode"],
    				oTimPre = {
    					"doInId": "in",
    					"doOutId": "out"
    				},
    				aTimPre = [],
    				oTip = {};
    			
    			// 循环获取参数。
    			for(var obj in oTimPre) {
    				// 判断是否有投入或产出记录。
    				if(oNode[obj] != "") {
    					aTimPre.push(oTimPre[obj]);
    				}
    			}
    			
    			// 循环获取节点提示信息值。
    			aTimPre.forEach(function(sPre) {
    				// 如果有记录。-- 通过条件判断是否有投入 或产出记录
    				oTip[sPre] = {};
    				
    				// 获取提示的值。
    				aTipParam.forEach(function(sParam) {
    					oTip[sPre][sParam] = oNode[sPre+sParam];
    				});
    			});
    			
    			// 返回提示信息数据。
    			return oTip;
    		},
    		// 获取过滤后需显示的所有节点。
    		getFilterNode() {
    			console.log("====1")
				var aNode = [],
					_that = this,
					aDisplayNodeType = this.filterParam.nodeType,
					aAllLine = this.allNodeLine;	//this.getAllNodeLines();
				
				// 类型节点中的过滤。--- 这是含有线的节点的判断。
				aAllLine.forEach(function(aLine) {
					// 判断是否合法。
					let bFlag = false;
					
					// 如果节点时全部，则不用判断。
					if(aDisplayNodeType.includes(_that.multiAll)) {
						bFlag = true;
					}else {
						bFlag = aDisplayNodeType.some(function(sType) {
							return _isLineAble(aLine,sType);
						});
					}
					
					if(bFlag) {
						// 合法，将节点加加入。
						aNode = aNode.concat(aLine);
					}
				});
				
				// 单个节点，是断链的状态，判断当前节点类型是否含有断链。
				if(aDisplayNodeType.includes(this.multiAll) || aDisplayNodeType.indexOf("2")>-1) {
					// 含有断链。
					aNode = aNode.concat(this.getAllNodeNoneLine());
				}
				
				aNode = this.getDataUnique(aNode);

				// 工序中的节点过滤数据。
				for(var i=0; i<aNode.length; i++) {
					let sNodeId = aNode[i],
						oNode = _that.getNodeInfoById(sNodeId),
						sProcessCode =  _that.getNodeProcessCode(oNode),	// oNode.parentProcessCode || oNode.inProcessCode,
						aFilterProcess = _that.filterParam.aFilterProcess;
					
					// 当前节点存在于aFilter中 
					// oFilter中的过滤循环于当前节点不匹配-- 如果是所有节点，则不用过滤。
					if(!( (aFilterProcess.includes(_that.multiAll) || aFilterProcess.indexOf(sProcessCode) >-1) && _isFilterProcessAble(oNode,sProcessCode)) ) {
						aNode.splice(i,1);
						i--;
					}
				}
				console.log("=------"+aNode)
				// 返回数据。
				return aNode;
				
				/**
				 * 判断每条节点线是否和标准。
				 * @param {Array} 节点线链
				 * @param {String} sType
				 * @return {Boolean} 是否合法
				 */
				function _isLineAble(aJudgeNode, sType) {
					let bFlag = false;
					
					switch(sType) {
						case "1":
							// 正常节点。
							bFlag = aJudgeNode.every(function(sNode) {
								// 正常节点的判断，每一项都是正常的。
								return _that.getNodeType(sNode) == "normal";
							});
							
							break;
						case "2":
							// 断链节点。
							bFlag = aJudgeNode.some(function(sNode) {
								// 断链节点的判断，含有断链。
								return _that.getNodeType(sNode) == "broken";
							});
							break;
						case "3":
							// 修复节点。
							bFlag = aJudgeNode.some(function(sNode) {
								// 修复节点的判断，含有修复。
								return _that.getNodeType(sNode) == "recovered";
							});
							break;
					}
					
					// 返回数据。
					return bFlag;
				}
				
				/**
				 * 当前节点是否存在于每道工序中的过滤。
				 * @param {String} oNode  当前节点的数据。 --- 只要有一个不符合，则都舍去。
				 * @param {String} sCode
				 */
				function _isFilterProcessAble(oNode,sCode) {
					let // 默认合格。
						bFlag = true,
						oProcessFilter = _that.processFilter[sCode],
						sParam = "";
					
					for(sParam in oProcessFilter) {
						var oParam = oProcessFilter[sParam];
						if(oParam.checked && bFlag) {
							switch(sParam) {
								case "inTime": 
									// 当节点的投入时间在配置时间之间。
									if(!(oNode.inHappenTime>=oParam.startTime && oNode.inHappenTime<=oParam.endTime)) {
										bFlag = false;
									}
									break;
								case "outTime":
									// 当前节点的产出时间在配置时间之间。
									if(!(oNode.outHappenTime>=oParam.startTime && oNode.outHappenTime<=oParam.endTime)) {
										bFlag = false;
									}
									break;
								case "dataLine":
									// 当前节点是否是1不用过虑，2-完整节点，3-不完整
									let sDataLine = oParam.value;
									if(sDataLine == "2") {
										// 完整节点。
										if(!(oNode.doInId != "" && oNode.doOutId != "")) {
											bFlag = false;
										}
									}else if(sDataLine == "3") {
										// 不完整节点。
										if(!(oNode.doInId == "" || oNode.doOutId == "")) {
											bFlag = false;
										}
									}
									break;
								case "person":
									// 当前操作人是否在选中之中。
									let aSelectedPerson = oParam.selected;
									
									// 操作人是否在选中之中。 没有选中全部，且开始和结束都不包含。
									if(!aSelectedPerson.includes(_that.multiAll) && !(aSelectedPerson.indexOf(oNode.inPersonName) >-1 || aSelectedPerson.indexOf(oNode.outPersonName) > -1)) {
										bFlag = false;
									}
									
									break;
								case "equipment":
									// 当前设备是否在选中之中。
									let aSelectedEquipment = oParam.selected;
									
									if(!aSelectedEquipment.includes(_that.multiAll) && !(aSelectedEquipment.indexOf(oNode.inEquipmentName) >-1 || aSelectedEquipment.indexOf(oNode.outEquipmentName) > -1)) {
										bFlag = false;
									}
									
									break;
								case "doCode":
									// 当前工单是否在选中之中。
									let aSelectedCode = oParam.selected;
									
									if(!aSelectedCode.includes(_that.multiAll) && !(aSelectedCode.indexOf(oNode.inDoCode) >-1 || aSelectedCode.indexOf(oNode.outDoCode) > -1)) {
										bFlag = false;
									}
									
									break;
								default:
									break;
							}
						}
					}
					
					// 返回数据。
					return bFlag;
				}
			
				
    		},
    		// 获取目标工序下需显示的所有过滤后的节点。
    		getFilterNodeByProcessCode(sCode) {
    			console.log("====01")
    			var aNodes = this.allFilterNode,		//this.getFilterNode(),
    				_that = this,
    				aNow = [];
    				
    			// 获取该工序下的所有节点。
    			aNow = aNodes.filter(function(sNode) {
    				let oNode = _that.getNodeInfoById(sNode);
    				return _that.getNodeProcessCode(oNode) == sCode;
    			});
    			
    			// 节点的排序。
    			aNow.sort(function(sPrev,sNext) {
    				let sPrevInTime = _that.getNodeInfoById(sPrev).inHappenTime,
    					sNextInTime = _that.getNodeInfoById(sNext).inHappenTime;
    				
    				return sPrevInTime > sNextInTime ? 1:-1;
    			});
    			
    			console.log(sCode + ":"+aNow)
    			// 返回数据。
    			return aNow;
    		},
    		// 获取显示的工序-- 会根据工序顺序排序。
    		getOrderProcess() {
    			console.log("fsfsf")
    			let _that = this,
    				aProcess = this.filterParam.aFilterProcess,
    				aOrderProcess = [];
    			
    			// 如果是all，则获取所有数据。
    			if(aProcess.includes(this.multiAll)) {
    				aProcess = this.getInitProcessData();
    			}
    			
    			aOrderProcess = $.extend(true, [], aProcess);
    			// 根据工序排序。
    			aOrderProcess.sort(function(sPrev,sNext) {
    				let sPrevSeq = _that.getProcessInfoByCode(sPrev).processSeq,
    					sNextSeq = _that.getProcessInfoByCode(sNext).processSeq;
    				return sPrevSeq - sNextSeq; 
    			});
    			
    			// 返回数据。
    			return aOrderProcess;
    		},
    		// 判断节点是否是其他节点的上道工序。
    		isHasTheLastLine(sNode) {
    			let aAllData = this.pageData.doInOuts,
    				// 默认不存在。
    				bFlag = false;
    				
    			// 存在某个节点的上个工序为此节点。
				bFlag = aAllData.some(function(oData) {
					let aSource = [];
					if(oData.sourceIds) {
						aSource = oData.sourceIds.split(",");
					}
					return aSource.indexOf(sNode) > -1;
				});
    			
    			// 返回数据。
    			return bFlag;
    		},
    		// 获取所有没有线的节点。
    		getAllNodeNoneLine() {
    			let aNode = [],
    				aAllData = this.pageData.doInOuts,
    				_that = this;
    				
    			// 所有单个节点。 sourceIds为空且没有数据的sourceIds为其id。
    			aAllData.forEach(function(oData) {
    				var sPrevId = oData.sourceIds,
    					sCurrentId = oData.id;
    			    
    				if(!sPrevId) {
    					// 没有上道工序。
    					let bFlag = false;
    					
    					bFlag = _that.isHasTheLastLine(sCurrentId);
    					
    					if(!bFlag) {
    						aNode.push(sCurrentId);
    					}
    				}
    			});
    			
    			// 返回没有连线的节点。
    			return aNode;
    		},
    		// 获取所有链节点。
    		getAllNodeLines() {
    			// 获取所有节点的线。
    			var aLine = [],
    				aNewLine = [];
    			
    			console.log("=====2")
    			// 获取所有的单线。
    			this.pageData.doInOuts.forEach(function(oData) {
    				var sPrevId = oData.sourceIds,
    					sCurrentId = oData.id+"";
    			    				
    				if(sPrevId) {
    					// 存在上级工序。
    					let aPrev = sPrevId.split(",");
    					
    					// 如果存在多个投入工序，则拆分。
    					aPrev.forEach(function(sId) {
	    					aLine.push([sId,sCurrentId]);
    					});
    				}
    			});
    			
    			for(var i=0; i<aLine.length; i++) {
					var aNow = aLine[i];
					// 获取当前同等级的数据。
					// 如果当前数据存在，则不需要再算一遍。
					if(_isBeCalcu(aNow)) {
						aNewLine = aNewLine.concat(_getLine(aNow));
					}
				}
    			
    			// 返回链式节点。
    			return aNewLine;
    			
    			// 是否需要计算
				function _isBeCalcu(aNow) {
					// 默认需要计算。
					var bFlag = true;
					
					aNewLine.forEach(function(aValue) {
						var sTemp = aValue.toString(),
							sNow = aNow.toString();
						
						if(sTemp.indexOf(sNow) > -1) {
							bFlag = false;
						}
					});
					
					// 返回数据。
					return bFlag;
				}
				
				// 获取当前节点的
				function _getLine(aNow) {
					var sPrev = aNow[0],
						sNext = aNow[aNow.length-1],
						aCurrent = [],
						aNext = getNodeNext(sPrev),
					    aStart = getNodePrev(sNext);
					
					if(aNext.length || aStart.length) {
						// 获取向上的数据。
						if(aNext.length) {
							// 存在
							aNext.forEach(function(oData) {
								var sId = oData[0],
									aTemp = $.extend(true, [], aNow);
								aTemp.unshift(sId);
								aCurrent.push(aTemp);
							});
						}else {
							aCurrent.push(aNow);
						}
						
						// 获取向下的数据。
						if(aStart.length) {
							// 存在。
							var aTemp = [];
							aCurrent.forEach(function(aId) {
								aStart.forEach(function(oData) {
									var sId = oData[1],
										aTem = $.extend(true,[],aId);
									aTemp.push(aTem.concat([sId]));
								});
							});
							aCurrent = aTemp;
						}
						
						var aNew = [];
						
						// 出口。
						// 合并数据。
						aCurrent.forEach(function(a) {
						 	aNew = aNew.concat(_getLine(a));
						});
						
						aCurrent = aNew;
					}else {
						aCurrent.push(aNow);
					}
					
					// 返回数据。
					return aCurrent;
				}
				
				// 获取所需前节点。以1开头的几点。
				function getNodePrev(sId) {
					var aResult = [];
					
					aLine.forEach(function(oData) {
						var sPrev = oData[0];
						if(sId == sPrev) {
							aResult.push(oData);
						}
					});
					
					// 返回数据。
					return aResult;
				}
				
				// 获取所需后节点。 以1结尾的节点
				function getNodeNext(sId) {
					var aResult = [];
					
					aLine.forEach(function(oData) {
						var sNext = oData[1];
						if(sId == sNext) {
							aResult.push(oData);
						}
					});
					
					// 返回数据。
					return aResult;
				}
    			
    		},
    		// 数据转换，获取所有的链接线值。
    		getNodeLine() {
    			console.log("---02")
    			// 获取所有节点连线的值。
    			var aLine = [],
    				aDisplayNode = this.allFilterNode,	//this.getFilterNode(),
    				_that = this;
    				
    			// 获取所有节点的线。
    			aDisplayNode.forEach(function(sNodeId) {
    				let oData = _that.getNodeInfoById(sNodeId),
    					sPrevId = oData.sourceIds,
    					sCurrentId = sNodeId;
    			    				
    				if(sPrevId) {
    					// 存在上级工序。
    					let aPrev = sPrevId.split(",");
    					
    					// 如果存在多个投入工序，则拆分。
    					aPrev.forEach(function(sId) {
    						if(aDisplayNode.indexOf(sId) > -1) {
		    					aLine.push([sId,sCurrentId]);
    						}
    					});
    				}
    			});
    			// 返回数据。
    			return aLine;
    		},
    		// 数组排序处理。
    		// 数组去重处理函数。
    		getDataUnique(aData) {
    			// 数组去重处理。。
    			let oTemp = {},  
				 	aNewData = [];  
				  
				aData.forEach(function(sValue) {
					if(!oTemp[sValue]) {
						oTemp[sValue] = true;
						aNewData.push(sValue);
					}
				});
    			
    			// 返回数据。
    			return aNewData;
    		},
    		// 物料查询操作。
    		queryHandler(formName) {
    			let _that = this;
    			this.$refs[formName].validate((valid) => {
    				if (valid) {
		    			// 设置初始化显示的值。
		    			_that.initData();
		    			
		    			// 更新form中的值。
//						let oData = sessionStorage.getItem("searchConditions-" + this.tag);
//		
//						// 断链模块。
//					    if(oData) {
//					        oData = JSON.parse(oData);
//					        if(oData.tab === "chain") {
//						        oData.keys = this.searchParam;
//        						sessionStorage.setItem('searchConditions-' + this.tag, JSON.stringify(oConditions));
//					        }
//					    }
					    
					    // 获取创建数据。
						this.getPageData();
    				}
    			});
    		},
    		// 判断调用接口是否成功。
			judgeLoaderHandler(param, fnSu, fnFail) {
				let bRight = param.data.errorCode;
				
				// 判断是否调用成功。
				if(!bRight) {
					// 调用成功后的回调函数。
					fnSu && fnSu(param.data.data);
				}else {
					// 提示信息。
					this.$message.error(param.data.errorMsg.message);
					// 失败后的回调函。
					fnFail && fnFail();
				}
			},
    		// 获取数据。
    		getPageData() {
    			let _that = this;
    			// 根据输入值，获取页面中的所有数据。
			   	this.bLoading = true;
			   	
//			   	this.$ajax.get("static/chain.json").then( (res) => {
//			   		_that.bLoading = false;
//			   		_that.pageData = res.data.data;
//			        _that.processAllData = _that.getProcessData();
//			        
//			        _that.$nextTick(() => {
//			          _that.setHeight()           
//			        })
//			   	})
			   	
			   	this.$ajax.post(LINK_NODE_URL, fnP.parseQueryParam(this.searchParam)).then((res) => {
			   		_that.bLoading = false;
					_that.judgeLoaderHandler(res, (data) => {
						// 格式化数据。
						_that.pageData = data;
				        _that.processAllData = _that.getProcessData();
				        
				        _that.$nextTick(() => {
				          _that.setHeight()           
				        })
					})
				})
				.catch((err) => {
					_that.setHeight();
					_that.bLoading = false;
					_that.$message.error('查询出错');
				})
    		},
    		// 点击是否显示当前显示工序的下拉框 -- 更改sCurrentProcess的值
    		showProcessFilter(sNow, index, ev) {
    			// 根据sNow，即当前点击的值，判断是否显示。
    			var sPrev = this.sCurrentProcess,
    				jProcessItem = $(".nodes-list .process-item");
    			
    			if(!this.bEdit) {
    				// 非编辑状态中才处理
					if(sNow == sPrev) {
						// 如果当前点击是显示的那个，则将其隐藏处理。
						this.sCurrentProcess = "";
						jProcessItem.eq(index).find(".item-pop-filter").hide()
												.siblings(".item-name").removeClass("itemActivated")
					}else{
						this.sCurrentProcess = sNow;
						// 隐藏其他的。
						jProcessItem.find(".item-name.itemActivated").removeClass("itemActivated")
										.siblings(".item-pop-filter").hide();
						// 显示当前的。
						jProcessItem.eq(index).find(".item-pop-filter").show()
												.siblings(".item-name").addClass("itemActivated")
					}
    			}
    			
    			// 显示
				
    		},
    		// 根据编辑的筛选项显示弹窗。
    		showPopModal(sType) {
				// 设置弹窗的显示类型。
				// 显示弹窗。
				this.bProcessFilterModalShow = true;
				this.sProcessFilterModalType = sType;
    		},
    		// 隐藏弹窗。
    		hidePopModal(data) {
    			// 隐藏弹窗。
				this.bProcessFilterModalShow = false;
				
				if(data) {
					//　断链修改保存弹窗。
					if(this.sProcessFilterModalType == "recoveredDes") {
						// 保存弹窗中的类型。 -- 保存断链修复的操作。
						this.saveNodeHandler(data);
					}else　{
						//　工序过滤弹窗。
						// 数据存在，表示是保存的处理，会将数据都设置。更新数据。
						this.$set(this.processFilter[this.sCurrentProcess], this.sProcessFilterModalType, data)
					}
				}
				
				this.sProcessFilterModalType = "";
    		},
    		// 隐藏修复时弹窗数据。
    		hideProducePopModal(aData) {
    			var _that = this,
    				aRecoveredNode = _that.aBrokenNode,
    				sKey = aRecoveredNode+"";
    			
    			// 隐藏修复时产出信息的弹窗。
    			_that.bRecoveredProduceModalShow = false;
    			
    			if(aData) {
    				// 存在数据 --- 确定后的事件。
    				
    				// 将返回的数据加入到保存的数据值中。
    				_that.oAClickNodeProduceData[sKey] = aData;
					// 保存记录的值。链接成线。 --- 这个是顺序的 上-下
					_that.aAClickNodeAllData.push(aRecoveredNode);
					// 并将选中去掉
					_that.removeNodeEditState(aRecoveredNode);
					// 重置值。
					_that.aBrokenNode = [];
    			}else{
    				// 取消的操作。 -- 两点之间没有连成线。 修改当前记录的值，最后一个不能显示。
    				_that.removeNodeEditState([_that.aBrokenNode[1]]);
    				_that.aBrokenNode.pop();
    				
    				// 删除当前记录的值。
    				delete _that.oAClickNodeProduceData[sKey];
    			}
    		},
    		// 判断两个节点是否在同一道工序中。
    		// 节点编辑时，判断点击的节点是否已经连接成线。 --- 即是否已经与其他点匹配。
    		isNodeBeLined(sNode) {
    			// 默认不存在。
    			let bFlag = false;
    			
    			this.aAClickNodeAllData.forEach(function(aLineNode) {
    				if(aLineNode.indexOf(sNode) > -1) {
    					bFlag = true;
    				}
    			});
    			
    			// 返回参数。
    			return bFlag;
    		},
    		// 判断当前的节点是否存在于新创建的链接线的起始节点。
    		isNodeIsTheStartInCustomLine(sNode){
    			let bFlag = false;
    			
    			// 是否存在已连成线的节点的起点是该节点。
    			bFlag = this.aAClickNodeAllData.some(function(aNode) {
    				return aNode[0] == sNode;
    			});
    			
    			// 返回数据。
    			return bFlag;
    		},
    		// 判断当前的节点是否存在于新创建的链接线的结束节点。
    		isNodeIsTheEndInCustomLine(sNode) {
    			let bFlag = false;
    			
    			// 是否存在已连成线的节点的起点是该节点。
    			bFlag = this.aAClickNodeAllData.some(function(aNode) {
    				return aNode[1] == sNode;
    			});
    			
    			// 返回数据。
    			return bFlag;
    		},
    		// 判断是否可以增加该节点，（点击时）--- 两个点在同一个工序 或 上道工序存在产出，下道工序存在投入。
    		/**
    		 * 节点点击时，判断是否可以连接线
    		 * 不在同一道工序 且 上道工序产出 | 下道工序投入 可修复
    		 * @param {String} sNodeId
    		 * @return {Boolean}
    		 */
    		setNodeData(sNodeId) {
    			let bResult = true,
    				// 获取如果加入时的顺序值。
    				aNode = this.setNodeOrder([this.aBrokenNode[0],sNodeId]),
    				_that = this;
    			
    			// 当要完成连线时。
    			if(this.aBrokenNode.length == 1) {
	    			// 判断是否可以增加。即当前已存在的一个与需增加的一个在同一个工序中。
	    			let sPrev = aNode[0],
	    				sNext = aNode[1],
	    				oPrev = this.getNodeInfoById(sPrev),
	    				oNext = this.getNodeInfoById(sNext);
	    			
	    			// 两个节点不在统一道工序 且 （上产 或下投）可修复
	    			
	    			// 两个节点在同一道工序中。
	    			if(this.getNodeProcessCode(oPrev) == this.getNodeProcessCode(oNext)) {
	    				this.sInfo = "两个节点不能在一道工序中。"
	    				bResult = false;
	    			}else if(!oPrev.isOutCanRepair && !oNext.isInCanRepair) {
	    				this.sInfo = "上道节点产出源或下道节点投入源不可修复";
	    				bResult = false;
	    			}
	    			
    				// 判断当前要连线的节点是否存在多次投入修复或产出修复。
    				if(bResult) {
	    				this.aAClickNodeAllData.forEach(function(aExistNode) {
	    					if(aExistNode[0] == sPrev || aExistNode[1] == sNext) {
	    						_that.sInfo = "节点不能多次投入或产出修复";
	    						bResult = false;
	    					}
	    				});
    				}
	    			
    			}
    			
    			// 返回操作是否成功。
    			return bResult;
    		},
    		/**
    		 * 设置修复时产出信息弹窗中的数据。
    		 * @param {Array} aNode
    		 * @return {void}
    		 */
    		setRecoveredProducePopData(aNode) {
    			let sKey = aNode+"",
    				aNodeProduce = [],
    				oPrev = this.getNodeInfoById(aNode[0]),
    				oNext = this.getNodeInfoById(aNode[1]);
    			
    			// 获取数据。
				let oProduce = {
					id: oPrev.id,
					doOutId: null,
					outProcessId: oPrev.inProcessId,
					outProcessName: oPrev.inProcessName,
					outProcessSeq: oPrev.inProcessSeq,
					outMaterialName: oNext.inMaterialName,
					outMaterialSpec: oNext.inMaterialSpec,
					outMaterialUnit: oNext.inMaterialUnit,
					outEquipmentId: oPrev.inEquipmentId,
					outEquipmentName: oPrev.inEquipmentName,
					outEquipmentType: oPrev.inEquipmentType,
					outShiftDate: oPrev.inShiftDate,
					outShiftStartTime: oPrev.inShiftStartTime,
					outShiftEndTime: oPrev.inShiftEndTime,
					outPersonName: oPrev.inPersonName,
					outType: 1,
					outIokey: oPrev.inIokey,
					outBucketNo: "",
					outProcessUid: oPrev.inProcessUid,
					moldCode: "",
					doCode: oPrev.inDoCode,
					processCode: oPrev.inProcessCode,
					materialCode: oNext.inMaterialCode,
					batchNo: oNext.inBatchNo,
					barcode: oNext.inBarcode,
					quantity: oPrev.inQuantity,
					equipmentCode: oPrev.inEquipmentCode,
					personCode: oPrev.inPersonCode,
					happenTime: oNext.inHappenTime,
					shiftName: oPrev.inShiftName
				}
				
    			// 设置数据。
    			this.oAClickNodeProduceData[sKey] = oProduce;//	aNodeProduce;
    		},
    		// 获取值。
    		getRecoveredProducePopData() {
    			let sKey = this.aBrokenNode+"";
    			
    			if(sKey) {
    				return this.oAClickNodeProduceData[sKey];
    			}
    		},
    		// 判断是否设置线
    		setNodeLine() {
    			var _that = this;
    			
    			// 判断，如果当前有两个选中，并设置成线。
    			if(_that.aBrokenNode.length == 2) {
    				
    				// 数据顺序显示。
    				_that.aBrokenNode =  _that.setNodeOrder(_that.aBrokenNode);
    				
    				let oPrev = _that.getNodeInfoById(_that.aBrokenNode[0]);
    				
    				
    				// 判断当前点是否是多次在上道工序或下道工序修复。
    				
    				// 判断是否需要显示产出弹窗。
    				// 上道工序isRework为0 且doOutId为空  或 上道工序isRework 且reDoOutId为空
    				if( (!oPrev.isRework && !oPrev.doOutId) || (oPrev.isRework && !oPrev.reDoOutId) )  {
    					// 显示修复产出信息弹窗框。
    					_that.bRecoveredProduceModalShow = true;
    					// 设置数据。
    					_that.setRecoveredProducePopData(_that.aBrokenNode);
    				}else {
    					// 不显示弹窗。 -- 直接保存数据
    					// 保存记录的值。链接成线。 --- 这个是顺序的 上-下
    					
						_that.aAClickNodeAllData.push(_that.aBrokenNode);
						// 并将选中去掉
						_that.removeNodeEditState(_that.aBrokenNode);
						// 重置值。
						_that.aBrokenNode = [];
    				}
    			}
    		},
    		// 节点点击事件处理函数。 
    		nodeClickEvent(ev) {
    			// 判断当前元素是否是断链节点，如果是则作处理。
    			var jNode = $(ev.target).closest(".node-outter"),
    				sNodeId = jNode.attr("node-id"),
    				_that = this;
    			
    			// 只有断链的节点才能点击。并且当前节点不在新增的连线中。---- 当前节点可以存在已点击的点中。
    			if(this.bEdit) {
    				if(jNode.hasClass("edited")) {
    					// 取消选中 。删除当前值。
    					jNode.removeClass("edited");
    					// 删除当前的数据。
    					_that.aBrokenNode.splice(_that.aBrokenNode.indexOf(sNodeId), 1);
    				}else {
    					// 选中。新增当前值。-- 如果当前不是在统一道工序中，则可以增加
    					if(_that.setNodeData(sNodeId)) {
		    				jNode.addClass("edited");
		    				_that.aBrokenNode.push(sNodeId);
//		    				 如果选中的节点大于2个，则将
		    				_that.setNodeLine();
	    				}else {
	    					// 不能连线，提示。
	    					_that.showMessage();
	    				}
    				}
    			}
    		},
    		// 节点链接线点击事件。  
    		nodeLineClickHandler(ev,aLineData) {
    			var jTarget = $(ev.target);
    			// 将数据转成顺序。 -- 已经是拍好序的。
    			aLineData = this.setNodeOrder(aLineData);
    			// 如果是修复线，才能点击。
    			if(this.bEdit) {
    				if(jTarget.hasClass("edited")) {
    					// 取消选中- 并删除记录的值。
    					this.aAClickLineAllData.splice(this.aAClickLineAllData.indexOf(aLineData),1);
    				}else {
    					// 选中。 - 并增加记录的值。
    					this.aAClickLineAllData.push(aLineData);
    				}
    				jTarget.toggleClass("edited");
    			}
    		},
    		// 取消节点的选中状态。
    		removeNodeEditState(aNode) {
    			// 取消节点的选中状态。
    			aNode.forEach(function(sNode) {
    				$(".nodes-list [node-id="+sNode+"]").removeClass("edited");
    			});
    		},
    		removeLineEditState(aNode) {
    			// 取消节点线的选中状态。
    			$(".node-line").removeClass("edited");
    		},
    		/**
    		 * 节点线上节点的排序。
    		 * @param {Array} aLine
    		 * @return {Array} 排序后的节点线
    		 */
    		setNodeOrder(aLine) {
    			// 节点的排序。
    			var aNewLine = $.extend(true, [], aLine),
    				sPrev = aNewLine[0],
    				sNext = aNewLine[1],
    				oPrev = this.getNodeInfoById(sPrev),
    				oNext = this.getNodeInfoById(sNext);

				// 默认是顺序显示，
				if(oPrev.inProcessSeq-oNext.inProcessSeq>0) {
					aNewLine = aNewLine.reverse();
				}
    			
    			// 返回数据。
    			return aNewLine;
    		},
    		// 获取删除节点连线的流水号值。
    		getDelNodeLineBuNo(aLine) {
    			let  // 获取排序后的节点。--- 本身是排好序的。
//  				aOrderLine = this.setNodeOrder(aLine),
    				sButNo = this.getNodeInfoById(aLine[1]).bucketNo1;	// aOrderLine[0].bucketNo2
    			
    			// 返回流水号值。
    			return sButNo;
    		},
    		// 编辑处理操作。
    		editHandler(ev) {
    			// 编辑按钮点击后，页面处理点击状态。
    			this.bEdit = true;
				
				// 编辑时，隐藏工序弹窗。
				$(".nodes-list .process-item")
					.find(".item-name.itemActivated")
							.removeClass("itemActivated")
						.siblings(".item-pop-filter")
							.hide();
				
				// 隐藏编辑按钮，显示保存退出按钮。
				$(".editBtn, .delBtn").hide();
				$(".exitBtn, .saveBtn").show();
				$(".exitBtn").addClass("exitButtomMargin");
				
    		},
    		// 退出处理操作。
    		exitHandler() {
    			// 退出编辑模式，修改编辑值。
    			this.bEdit = false;
    			
    			// 显示编辑按钮，隐藏保存退出按钮。
				$(".editBtn").show();
				$(".exitBtn, .delBtn,  .saveBtn").hide();
				$(".exitBtn").removeClass("exitButtomMargin")
    			
    			// 恢复原样。 -- 设置过的编辑状态恢复,点击过的节点，线等都清空。
    			if(this.aAClickLineAllData.length) {
	    			this.aAClickLineAllData = [];
    			}
    			if(this.aAClickNodeAllData.length) {
	    			this.aAClickNodeAllData = [];
    			}
    			if(this.aAClickLineBeforeData.length) {
	    			this.aAClickLineBeforeData = [];
    			}
    			if(this.aBrokenNode.length) {
	    			this.aBrokenNode = [];
    			}
    			if(!window.Rt.utils.isEmptyObject(this.oAClickNodeProduceData)) {
	    			this.oAClickNodeProduceData = {};
    			}
    			
    			// 节点及线取消了选中状态。
    			$(".nodes-list .edited").removeClass("edited");
    		},
    		// 保存处理操作。
    		saveHandler() {
    			// 断链修改函数调用处理。 --- 将已形成的锻炼保存。
    			// 保存 aAClickNodeAllData中自己创建的节点线。
    			
    			// 需要调用接口才会调用。- 又保存的或删除的。
    			if(this.aAClickNodeAllData.length || this.aAClickLineBeforeData.length) {
	    			// 显示弹窗。
	    			this.bProcessFilterModalShow = true;
	    			this.sProcessFilterModalType = "recoveredDes";
	    			this.aRecoverInfo = this.getRecoveredInfo(this.aAClickNodeAllData);
	    			this.aRemoveInfo = this.getRecoveredInfo(this.aAClickLineBeforeData);
    			}else {
    				this.sInfo="没有提交的操作";
    				this.showMessage();
    			}
    		},
    		// 弹窗确定后的操作。
    		saveNodeHandler(oSave) {
    			var _that = this,
    				oSaveData = {
	    				"repairDesc": oSave.discription,
	    				// 删除的数据。
	    				"cancelList": function() {
	    					// 获取连接线的bactNo值。
	    					let aList = [];
	    					
	    					// 循环获取当前值。
	    					_that.aAClickLineBeforeData.forEach(function(aLine) {
	    						let aValue = [];
	    						
	    						aLine.forEach(function(sNodeId) {
	    							aValue.push(_that.getNodeInfoById(sNodeId));
	    						});
	    						
	    						aList.push(aValue);
	    					});
	    					// 返回值。
	    					return aList;
	    				}(),
	    				// 修复新增的数据。
	    				"repairList": function() {
	    					let aList = [];
	    					
	    					// 循环数据。
	    					_that.aAClickNodeAllData.forEach(function(aNode) {
	    						let aValue = [],
	    							sKey = aNode+"";
	    						
	    						aNode.forEach(function(sNodeId, nIndex) {
	    							// 还需与弹窗中的数据合并。-- 存在合并，不存在，不处理。
	    							let oNode = _that.getNodeInfoById(sNodeId),
	    								oProduce = _that.oAClickNodeProduceData[sKey],
	    								oNew = {};
	    							
	    							// 修复数据，只修复上道工序。
	    							
	    							if(!nIndex &&　oProduce) {
	    								oNew = $.extend({}, oNode, oProduce);
	    							}else {
	    								oNew = oNode;
	    							}
	    							
	    							aValue.push(oNew);
	    						});
	    						
	    						aList.push(aValue);
	    					});
	    					
	    					// 返回数据。
	    					return aList;
	    				}()
	    			};
    			
    			console.log(oSaveData);
    			
	  			this.$ajax.put(LINK_NODE_REPAIR_URL, oSaveData).then((res) => {
					_that.judgeLoaderHandler(res, (data) => {
				        
		  				console.log(data)
				        // 更新数据。
				        _that.updatePageData(data);
				        // 清空记录数据。
		  				_that.aAClickNodeAllData = [];
		  				_that.oAClickNodeProduceData = {};
		  				_that.aAClickLineBeforeData = [];
					});
				})
				.catch((err) => {
					_that.$message.error("保存出错")
				})
	  			
    		},
    		// 保存或删除接口后更新数据。 [{},{}]
    		updatePageData(aNewData) {
    			var _that = this;
    			// 循环更新数据。
    			aNewData.forEach(function(oNewNode) {
					let nIndex = _that.getNodeIndexById(oNewNode.id);
					// 修改数据。
//					_that.pageData.doInOuts[nIndex] = oNewNode;
					_that.$set(_that.pageData.doInOuts, nIndex, oNewNode)
				});
				console.log(_that.pageData)
    		},
    		// 删除节点链确定后的操作。
    		delNodeLineHandler(oDel) {},
    		// 删除处理操作。
    		delHandler() {
    			// 选中修复的断链进行删除操作处理。 线- 点击节点链接（改值）+已修复的（调接口）。
    			var _that = this;
    			
    			// 先删除自己创建的节点线，
    			_that.aAClickLineAllData.forEach(function(aNodeLine,nLineIndex) {
    				let bFlag = false,
    					nNodeIndex = -1;
    				
    				// 判断是否存在，两个 数组中存在的数据都是顺序的。
    				bFlag = _that.aAClickNodeAllData.some(function(aTest,n) {
    					nNodeIndex = n;
						return aTest.join(",") == aNodeLine.join(",");
    				});
    				
    				if(bFlag && nNodeIndex > -1) {
    					// 通过节点点击创建的。 删除数据。
    					_that.aAClickLineAllData.splice(nLineIndex,1);
    					_that.aAClickNodeAllData.splice(nNodeIndex,1);
    					delete _that.oAClickNodeProduceData[aNodeLine+""];
    				}
    			});
				
				if(this.aAClickLineAllData.length) {
					// 删除线的选中状态。
					this.removeLineEditState(this.aAClickLineAllData);
					// 再将已存在的数据保存。
					this.aAClickLineBeforeData = this.aAClickLineBeforeData.concat(this.aAClickLineAllData);
					this.aAClickLineAllData = [];
				}
    		}
    		
    	}
    }
    
</script>

<style lang="less">
	@green: #42af8f;
	
	html,body {
		height: 100%;
	}
	body {
		background-color: #f2f2f2;
		font-size: 14px;
	}
	.strand-wraps {
		.strand-content-wrap {
			background-color: #FFFFFF;
			margin: 20px;
			
			.strand-content {
				padding: 20px;
				
				/* 当编辑时，退出按钮不设置左边距 */
				.exitButtomMargin {
					margin-left: 0;
				}
				
				.filters {
					.filter-item {
						&.filter-item-inline {
							display: inline-block;
							margin-right: 40px;
						}
						
						.filter-name {
							display: inline-block;
							/*width: 80px;*/
							margin-right: 10px;
							text-align: left;
						}
						
						.el-select, .el-input {
							/*width: auto;*/
							display: inline-block;
						}
					}
				}
				.line {
					width: 100%;
					height: 1px;
					background-color: #CCCCCC;
					margin: 0px 0px 20px;
				}
				.content-filters {
				}
				
				.content-main {	
								
					.content-title {
						font-size: 16px;
						font-weight: bold;
						color: #333333;
						margin-bottom: 20px;
					}
					
					.main-container {
						
						.content-legend {
							margin-bottom: 30px;
							
							.legend-title {
								margin-bottom: 20px;
								
								.legend-icon {
									display: inline-block;
									vertical-align: middle;
									width: 4px;
									height: 12px;
									background-color: @green;
									margin-right: 4px;
								}
								.legend-name {}
							}
							
							.legend-main {
								border: 2px solid @green;
								padding: 20px;
								
								.info-detail {
									.detail-item {
										margin-right: 20px;
										line-height: 20px;
									}
								}
							}
							
						}
						
						.content-nodeWraps {
							min-height: 300px;
							margin-top: 20px;
							
							.nodesWrap {
								position: relative;
								overflow: hidden;
								
								.nodes-list {
									/*height: 230px;*/
									overflow: auto;
								
									.process-title {
										display: flex;
										/* 滚动条时工序不变 */
										position: absolute;  
										background-color: #FFFFFF;
										z-index: 6;
										/*margin-bottom: 20px;*/
										
										.process-item {
											display: inline-block;
											margin-right: 10px;
											min-width: 200px;
											text-align: center;
											cursor: pointer;
											position: relative;
											
											.item-name {
												font-size: 16px;
												
												&.itemActivated {
													color: @green;
												}
											}
											.item-pop-filter {
												position: absolute;
												top: 30px;
											}
											
											&:last-child {
												margin-right: 0;
											}
										}
									}
									.process-nodes {
										display: flex;
										position: relative;
										/*height: 300px;*/
										
										.item-nodes {
											display: inline-block;
											min-width: 200px;
											margin-right: 10px;
											
											.item-node {
												margin: 30px 0;
												/*cursor: pointer;*/
											}
											
											&:last-child {
												margin-right: 0px;
											}
										}
										
									}
								}
							}
							
						}
					}
				}
			}
		}
	}
	
</style>