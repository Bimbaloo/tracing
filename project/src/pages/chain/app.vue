<template>
	
	<div id="app">
		<v-header :config="true" :back="'search.html'"></v-header>
		<div class="content" ref="content">
			<!-- 参数信息。 -->
			<div class="container-filter" :class="{hide: fullscreen}" ref="containerFilter">
				<v-form 
					v-if="category.list"
        			:tab="category.key"
        			:sub-tab="category.list[0].key"
        			:active="category.active"
        			label-width="70px"
        			:handle-submit="handleSubmit"
        			:keys="keys"
        			:show-reset-button="false"
        			:items="category.list[0].items" >
        		</v-form>
				<div class="line"></div>
			</div>
			
			<div class="container-main" v-loading="loading" element-loading-text="拼命加载中">
				<!-- 详细信息。 -->
				<div class="main-info" :class="{hide: fullscreen}" ref="mainInfo">
					<div class="info-title">断链数据分析</div>
					<div class="info-content">
						<div class="legend-title">
							<span class="legend-icon"></span>
							<span class="legend-name">基本信息</span>							
						</div> 
						<div class="legend-main">
							<div class="info-detail">
								<span class="detail-item">物料名称: {{ pageData.basicInfoDto.materialName }} </span>
								<span class="detail-item">物料编码: {{ pageData.basicInfoDto.materialCode }} </span>
								<span class="detail-item">批次: {{ pageData.basicInfoDto.batchNo }} </span>
								<span class="detail-item">主生产计划号: {{ pageData.basicInfoDto.orderCode }} </span>
								<!--<span class="detail-item">派工单号: {{  }}</span>-->
								<span class="detail-item">工艺路线编码: {{ pageData.basicInfoDto.manuProcessCode }} </span>
							</div>
						</div>
					</div>
					<div class="info-filter">
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
				</div>
				<v-node
					v-loading="refresh"
					element-loading-text="正在更新..."
					:node-height="treeHeight" 
					:process-data="processAllData" 
					:filter-data="filterParam" 
					:style="{height: treeHeight + 'px'}"
					@showProducePop="showProduce"
					:produce-data="produceData"
					@showSavePop="showSave"
					:process-node-filter="processFilterData"
					@showFilterPop="showFilter"
				></v-node>
			</div>
		</div>
		
		<!-- 修复数据弹窗 -->
		<v-pProduce
			v-if="bProduce"
			:pop-show="bProduce"
			:pop-value="oProduceData"
			@hideProducePop="hideProduce" 
		></v-pProduce>
		<!-- 保存弹窗 -->
		<v-pModal
			v-if="bSave"
			:pop-show="bSave" 
			:pop-data="oSave"
			@hideSavePop="hideSave"
		></v-pModal>
		<!-- 工序过滤弹窗 -->
		<v-pFilter
			v-if="bFilter"
			:pop-show="bFilter"
			:pop-data="oFilter"
			@hideFilterPop="hideFilter"
		></v-pFilter>
	</div>
	
</template>

<script>
	import header from 'components/header/header.vue'
	import Input from "components/basic/input.vue"
    import Select from "components/basic/select.vue"
    import MultiSelect from "components/basic/multiSelect.vue"
    import Button from "components/basic/button.vue"
    import DateTime from "components/basic/dateTime.vue"
    import Node from 'components/chain/node.vue'
    import ProcessProduct from "components/chain/processProduceInfo.vue"
    import ProcessModal from "components/chain/processModal.vue"
    import ProcessFilter from "components/chain/processFilter.vue"
    import form from 'components/form/form.vue'
    
    import fnP from "assets/js/public.js"
	
	 // 节点类型数据。
    var aoNodeType = [{
    	value: '1',
    	label: '正常节点'
    }, {
    	value: '2',
    	label: '断链节点'
    }, {
    	value: '3',
    	label: '已修复节点'
    }, {
    	value: '4',
    	label: '投入可修复'
    }, {
    	value: '5',
    	label: '产出可修复'
    }];
    
    var sMultiValue = "全部"// "all";
	
	// 获取参数名称
	const MODULE_ITEM_URL = HOST + "/api/v1/customized/modules";
	const LINK_NODE_URL = HOST + '/api/v1/linkrepair/links';
	const LINK_NODE_REPAIR_URL = HOST + "/api/v1/linkrepair/repair"
	
	export default {
		components: {
			'v-header': header,
			'v-input': Input,
    		'v-select': Select,
    		'v-multiSelect': MultiSelect,
    		'v-button': Button,
    		'v-dateTime': DateTime,
    		'v-node': Node,
    		'v-pProduce': ProcessProduct,
    		'v-pModal': ProcessModal,
    		'v-pFilter': ProcessFilter,
    		'v-form': form
		},
		data() {
			let that = this;
		           	           
			return {
				loading: false,
				// 更新操作
				refresh: false,
				filterParam: {
					// 节点类型。
    				"nodeType": [sMultiValue],
    				// 需过滤出工序值。
    				"aFilterProcess": [sMultiValue]
				},
				// 多选全部的提示字段。
    			multiAll: sMultiValue,
    			// 页面数据
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
    			contentHeight: null,
    			otherHeight: null,
    			treeHeight: 300,
    			tag: "",
    			// 所有节点类型值。
				nodeData: aoNodeType,
				// 所有工序
				processAllData: [],
				handleSubmit: this.queryHandler,
    			category: {},
    			keys: {},
    			radio: '1',
    			item: {},
				// 修复弹窗
				bProduce: false,
				line: {},
				oProduceData: {},
				produceData: {},
				// 保存弹窗。
    			bSave: false,
    			oSave: {},
    			// 工序过滤弹窗。
    			bFilter: false,
    			oFilter: {},
				processFilterData: {},
				myLocalStorage: []
			}
		},
		computed: {
			// 是否编辑。
			edit() {
				return this.$store.state.edit
			},
			// 是否全屏。
			fullscreen() {
				return this.$store.state.fullscreen
			},
			// 数据。
			rawData() {
				return this.$store.state.rawData
			}
		},
		watch: {
			fullscreen: function() {
				this.getHeight()
			}
		},
		created() {
			// 登录判断。
			this.$register.login(this.$store);

			// 获取配置数据。
			this.$store.dispatch('getConfig');
			
			// 获取所需的查询参数。
      		this.tag = window.Rt.utils.getParam("tag", location.search);
          	let	oData = sessionStorage.getItem("searchConditions-" + this.tag),
				  categories = [];
			// 用于保存查询记录	  
			let history = localStorage.getItem("history")
			if(history){
				this.myLocalStorage = JSON.parse(history)
			}else {
				this.myLocalStorage = []
			}	  

			// 断链模块。
		    if(oData) {
		        oData = JSON.parse(oData);
		    }
		    
		    // 获取参数名
		    this.$register.sendRequest(this.$store, this.$ajax, MODULE_ITEM_URL, "get", null, (oResult) => {
	         	 // 请求成功。
	         	categories = fnP.parseData(oResult).filter(o=> o.key == "link");
	
			  	if(categories.length) {
			  		// 存在断链。
			  		this.category = Object.assign({}, categories[0])
			  		let oActive = {}
			  		
			  		if(oData && oData.tab == categories[0].key) {
			  			oActive = oData
			  		}else {
			  			oActive = {
			  				radio: "1",
	                		keys: {}
			  			}
			  		}
			  		
			  		this.category = Object.assign({}, this.category, {
			  			active: oActive
			  		})
			  	}
			  	
			  	let initData = this.category.list.filter(o => o.key == this.radio)[0];    
            	this.keys = this.getKeys(initData);
				this.item = this.category.list[0];
				
	          this.$nextTick(() => {
	            if(oData && oData.tab == 'link') {
	              this.fetchData(oData);
	            }            
	          })
	        }, this.requestFail, this.requestError);
		    
    		// 默认查询。
//  		this.fetchData();
		},
		mounted() {},
		methods: {
			// 请求失败。
		    requestFail(sErrorMessage) {
		        // 提示信息。
		        this.$message.error(sErrorMessage)
		    },
		      // 请求错误。
		    requestError(err) {
		        console.log(err);
		    },
		    getKeys(oData) {
                let oKey = {};
                
                if(oData) {
	                oData.items.forEach(o => oKey[o.key] = '');
                }

                return oKey;
            },
			// 数据初始化。
			initData() {
				this.refresh = false;
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
    			this.processAllData = []
				this.filterParam.nodeType = [sMultiValue]
				this.filterParam.aFilterProcess = [sMultiValue]
				this.contentHeight = null,
    			this.otherHeight = null,
    			this.treeHeight = 300,
    			// 所有节点类型值。
				this.nodeData = aoNodeType;
				// 所有工序
				this.processAllData = [];
				// 修复弹窗
				this.bProduce = false;
				this.line = {};
				this.oProduceData = {};
				this.produceData = {};
				// 保存弹窗。
    			this.bSave = false;
    			this.oSave = {};
    			// 工序过滤弹窗。
    			this.bFilter = false;
    			this.oFilter = {};
    			this.processFilterData = {}
    			// 退出编辑操作。
		   		this.$store.commit({
					type: "updateEdit",
					key: false
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
			// 数据查询操作。
			queryHandler(oParam) {
				// 设置初始化显示的值。
				oParam.tab = "link"
				this.updateRecord(oParam)
		    	this.initData();
				this.fetchData(oParam);
			},
    		// 获取数据。
    		fetchData(oParam) {
    			let that = this;
    			// 根据输入值，获取页面中的所有数据。
			   	this.loading = true;
				   
				this.$register.sendRequest(this.$store, this.$ajax, LINK_NODE_URL, "post", fnP.parseQueryParam(oParam.keys), (oData) => {
					that.loading = false;
					// 数据保存。
					this.$store.commit({
						type: "updateData",
						data: oData
					});
					
					// 格式化数据。
					that.pageData = oData;
					that.processAllData = that.getProcessData();
					
					that.$nextTick(() => {
						that.getHeight()           
					})					
				}, (sErrorMessage) => {
					that.loading = false;
					// 提示信息。
					this.$message.error(sErrorMessage);
				}, (err) => {
					that.loading = false;
					that.getHeight();
					that.$message.error('查询出错');
				})
			},
			// 获取工序的数据。
			getProcessData() {
    			// 返回数据。
    			let aoProcess = this.pageData.basicInfoDto.processArr.map( o => {
    				return {
    					label: o.processName,
    					value: o.processCode,
    					seq: o.processSeq
    				}
    			});
    			
    			aoProcess = aoProcess.sort( (oA, oB) => oA.seq-oB.seq)
    			// 返回工序转换后的数据。
    			return aoProcess;
    		},
    		// 获取高度。
    		getHeight() {
    			let vContent =  this.$refs.content,
    				vFilter = this.$refs.containerFilter,
    				vInfo = this.$refs.mainInfo;
				
				if(vContent) {
					if(this.contentHeight === null) {
						this.contentHeight = vContent.clientHeight;
						this.otherHeight = vFilter.clientHeight + vInfo.clientHeight;
					}
					if(this.fullscreen) {
						this.treeHeight =  this.contentHeight - 80		// 60
					}else {
						this.treeHeight =  this.contentHeight - this.otherHeight - 80		// 60
					}
				}else {
					this.treeHeight = 300
				}
    		},
    		// 显示修复弹窗。
    		showProduce(value) {
    			this.bProduce = true;
    			this.line = value.line;
    			this.oProduceData = value.data
    		},
    		// 隐藏修复弹窗。
    		hideProduce(oData) {
    			this.bProduce = false;
    			
    			// 修复返回的数据，返回到node.vue中
    			this.produceData = {
    				line: this.line,
    				data: oData
    			}
    		},
    		// 显示过滤弹窗。
    		showFilter(oData) {
    			this.bFilter = true;
    			this.oFilter = JSON.parse(oData) //Object.assign({}, oData);
    		},
    		// 隐藏工序过滤弹窗。
    		hideFilter(oData) {
    			this.bFilter = false;
    			
    			// 选中返回的值。
				if(oData) {
					// 修改的数据。
					this.processFilterData = oData
				}
    		},
    		// 显示保存数据弹窗。
    		showSave(oSaveData) {
    			this.bSave = true;
//  			console.log(oSaveData)
    			this.oSave = oSaveData
    		},
    		// 关闭保存数据弹窗。
    		hideSave(sDes) {
    			let that = this;
    			
    			this.bSave = false
    			
    			if(sDes !== undefined) {
    				// 点击的确定操作，将数据传给后台。
					this.refresh = true;
					this.$register.sendRequest(this.$store, this.$ajax, LINK_NODE_REPAIR_URL, "put", Object.assign({
						repairDesc: sDes
					}, this.oSave.save), (oData) => {
						this.refresh = false;
						// 更新数据。
						that.updatePageData(oData);
					}, (sErrorMessage) => {
						this.refresh = false;	
						// 提示信息。
						this.$message.error(sErrorMessage);
					}, (err) => {
						this.refresh = false;
						that.$message.error("保存出错")
					})
					// this.$ajax.put(LINK_NODE_REPAIR_URL, Object.assign({
					// 	repairDesc: sDes
					// }, this.oSave.save)).then((res) => {
					// 	this.refresh = false;
						
					// 	that.judgeLoaderHandler(res, (data) => {
			  		// 		console.log(data)
					//         // 更新数据。
					//         that.updatePageData(data);
					// 	});
					// })
					// .catch((err) => {
					// 	this.refresh = false;
					// 	that.$message.error("保存出错")
					// })			
    			}
    			
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
    		// 更新数据。
    		updatePageData(aNewData) {
    			var that = this;
    			// 循环更新数据。
    			aNewData.forEach(function(oNewNode) {
					let nIndex = that.getNodeIndexById(oNewNode.id);
					// 修改数据。
					that.$set(that.pageData.doInOuts, nIndex, oNewNode)
				});
				
				// 数据保存。
		   		this.$store.commit({
					type: "updateData",
					data: this.pageData
				});
				// 退出编辑操作。
		   		this.$store.commit({
					type: "updateEdit",
					key: false
				});
			},
			// 生产随机数函数
			guid() {
				function S4() {
				return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
				}
				return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
			},
			// 保存查询记录
			updateRecord(oConditions) {
				//debugger
				delete(oConditions.keys._tag)
				let oData = oConditions
				let isRepetition = true //默认不重复
				let n //记录和第几个重复
				this.myLocalStorage.forEach(data=>{
				delete(data.oData.keys._tag)
				})
				isRepetition = this.myLocalStorage.some((el,j)=>{
				if(JSON.stringify(el.oData) === JSON.stringify(oConditions)){
					n = j
				}
				return JSON.stringify(el.oData) === JSON.stringify(oConditions)
				})
				if(!isRepetition){
				let obj = {
					"id": this.guid(),
					"dateTime": new Date().Format(),
					oData
				}
				delete(obj.oData.keys._tag)
				this.myLocalStorage.unshift(obj)
				this.myLocalStorage.forEach(data=>{
					delete(data.oData.keys._tag)
				})
				localStorage.setItem("history",JSON.stringify(this.myLocalStorage))
				}else {
				//debugger
				let olddata = this.myLocalStorage.splice(n,1)[0]
				olddata.id = this.guid()
				let newTime = new Date().Format()
				olddata.dateTime = newTime
				delete(olddata.oData.keys._tag)
				this.myLocalStorage.unshift(olddata)
				this.myLocalStorage.forEach(data=>{
					delete(data.oData.keys._tag)
				})
				localStorage.setItem("history",JSON.stringify(this.myLocalStorage))
				}
			}
		}
	}
	
</script>

<style lang="less">
	@green: #42af8f;
	
	html, body {
		height: 100%;
	}
	
	body {
		background-color: #f2f2f2;
		font-family: 微软雅黑;
		color: #333;
		font-size: 14px;
		overflow: hidden;
	}
	
	#app {
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		
		.hide {
			display: none;
		}
		
		.content {
			flex: 1;
			margin: 20px;
			padding: 20px;
			background-color: #FFFFFF;
			
			.container-filter {
				.el-form-item,
				.form-button {
					display: inline-block;
					margin-right: 40px;
					
					.filter-name {
						display: inline-block;
						margin-right: 10px;
						text-align: left;
					}
					
					.el-select, .el-input {
						display: inline-block;
						width: 200px;
					}
				}
				.form-conditions {
					display: inline;
				}
				.form-button {
					margin-top: 0;
					margin-bottom: 19px;
				}
				.line {
					width: 100%;
					height: 1px;
					background-color: #CCCCCC;
				}
			}
			
			.container-main {
				
				.main-info {
					margin: 20px 0;	
					// 标题
					.info-title {
						font-size: 16px;
						font-weight: bold;
						color: #333333;
						margin-bottom: 20px;
					}
					// 信息
					.info-content,
					.info-filter {
						font-size: 14px;
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
					// 	
					.info-filter {
						margin-bottom: 0;
						
						.legend-main {
							padding: 0;
						}
						.filter-item {
							display: inline-block;
							/*margin-right: 40px;*/
							margin: 20px;
							
							&:last-child {
								margin-right: 0;
							}
						}
						
					}
				}
				
				// 节点
				.main-nodes {
				}
			}
		}
	}
	
</style>