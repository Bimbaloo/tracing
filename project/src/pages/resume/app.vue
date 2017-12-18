<template>
	<div id="app">
		<a href="" id="downloadImage" v-show="false"></a>
		<div class="domDown"></div>
		
		<!-- header 部分-->
		<v-header ref="headers" v-show="!bFullScreen" :back="'search.html'" :config="false"></v-header>
		<div class="resume-wraps" v-loading="downLoading" element-loading-text="图片生成中">
			<div class="resume-content-wrap" :class="{full:bFullScreen}">
				<div class="clone"></div>
				<div class="resume-content">
					<el-form v-show="!bFullScreen" class="filters" :model="ruleForm" :rules="rules" ref="ruleForm" label-position="left" label-width="80px" @keyup.enter.native="submitForm('ruleForm')">
						<el-form-item class="filters-code" label="成品条码:" prop="barcode">
							<v-input placeholder-data="请输入条码或扫码" key-data="barcode" :form-data="ruleForm"></v-input>
							<input id="hiddenText" type="text" style="display:none" />    <!-- 为了阻止form里面只有一个input时回车会自动触发submit事件  -->
						</el-form-item>
						<el-form-item>
							<v-button text-data="查询" @query="submitForm('ruleForm')"></v-button>
						</el-form-item>
					</el-form>
					
					<div v-show="!bFullScreen" class="line"></div>
					<div class="resume-main" :class="{showDiff:sCurrentTab === 'lines' }">
						<div class="resume-handler" v-show="!bCarousel">
							<div class="resume-tabs">
								<v-button 
								v-if="!!BOMConfig.switch"
								:text-data="BOMConfig.name" 
								tab-data="tables" 
								:type-data="sBomType"  
								@query="changeTab('tables')"></v-button>
								<v-button 
								v-if="!!timelineConfig.switch"
								:text-data="timelineConfig.name" 
								tab-data="lines"  
								:type-data="sTimeLineType" 
								@query="changeTab('lines')"></v-button>
							</div>
							<div class="resume-icons">
								<i class="resume-icon icon icon-20 icon-print" @click.stop="onPrintHandler"></i>
								<i :class="['resume-icon', 'icon', 'icon-20', {'icon-excel': sCurrentTab === 'tables','icon-download': sCurrentTab === 'lines'}]" @click.stop="onDownLoadHandler"></i>
								<i class="resume-icon icon icon-20 icon-fullScreen" v-show="!bFullScreen" @click.stop="openFullScreen"></i>
							</div>
						</div>
						<!-- 表格 -->
						<div 
						v-if="!!BOMConfig.switch"
						v-show="sCurrentTab === 'tables'" 
						class="resume-table" 
						ref="table">
							<div class="table-title" v-show="bShowTitle">
								<span class="title-text">{{ oTitle.materialName }} 产品履历</span>
								<span class="title-subText">条码: {{ oTitle.barcode }}</span>
								<span class="title-subText">批次: {{ oTitle.batchNo }}</span>
							</div>
							
							<div v-if="oTab.error" :style="{height:oTab.tableHeight+'px'}" class="error">
								{{ oTab.error }}
							</div>
							<el-table
								v-else
								class="table-main" 
								:data="aParsedData" 
								:height = "oTab.tableHeight"
								stripe
								border
								style="width: 100%;"
								v-loading="oTab.loading"
								element-loading-text="拼命加载中"
								row-class-name="table-item">
								<el-table-column
									v-for="(column,index) in oTab.columns"
									:align="index?'center':'left'"
									:fixed="!index?true:false"
									:resizable="true"
									:min-width="column.width"
									:label="column.name"
									:key="index">
									<template scope="props">
										<div class="cell-content" v-if="!index" :style="{paddingLeft:props.row.level*nLevelDis+nFirstDis+(props.row.bHasNext?0:nIconDis)+'px'}">
											<i class="icon-down el-icon-arrow-down" v-show="props.row.bHasNext"  @click.stop="expandOrCollapseTr(props.$index, props)"></i>
											<span>{{ props.row.name }}</span>
										</div>
										<div v-else class="cell-content">
											{{ column.formatter ? column.formatter(props.row.data): props.row.data[column.prop] }}
										</div>
									</template>
								</el-table-column>
							</el-table>
						</div>
						
						<!-- 时间轴 -->
						<div 
							v-if="!!timelineConfig.switch"
							v-loading="oTab.loading"
							element-loading-text="拼命加载中"
							v-show="sCurrentTab === 'lines'" 
							class="resume-timeLine" 
							:style="{height: oTab.timelineHeight +'px'}" 
							ref="timeLine">
							
							<div v-if="oTab.error" class="error">
								{{ oTab.error }}
							</div>
							<div v-else class="time-line-content">
								<div 
									class="time-line-wrap"
									v-for="(timeItem, index) in aoTimeLineData"
									:key="index">
									
									<div class="line-item">
										<span class="item-date">{{ timeItem.date }}</span>
										<div class="item-node" :class="{bigSize:!index}"><v-node :class="{bigSize:!index}" color-type="blue"></v-node></div>
										<span class="item-title" v-if="!index">产品履历</span>
									</div>
									<div class="item-line"></div>
									<div class="line-list">
										<div class="list-sub" :class="{first:!itemIndex}"
											v-for="(item,itemIndex) in timeItem.resumes"
											:key="itemIndex">
											<div v-show="!(index==aoTimeLineData.length-1&&itemIndex==timeItem.resumes.length-1)" class="node-line"></div>
											<span class="sub-date" :class="{last:index==aoTimeLineData.length-1&&itemIndex==timeItem.resumes.length-1}">{{ new Date(item.opTime).Format("hh:mm:ss") }}</span>
											<div class="sub-node">
												<v-node :color-type="getNodeColor(item.opType)"></v-node>
											</div>
											<div class="sub-info" :class="getNodeColor(item.opType)">
												<div class="sub-item" v-html="getNodeTextByType(item)"></div>
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
</template>


<script>
	import $ from "jquery"
	import Header  from 'components/header/header.vue'
	import Input from "components/basic/input.vue"
	import Button from "components/basic/button.vue"
	import TimeNode from "components/resume/time-node.vue"
	import html2canvas from 'html2canvas'
	import rasterizeHTML from 'rasterizehtml'
	import XLSX from 'xlsx'
	import Blob from 'blob'
	import FileSaver from 'file-saver'

	var bFull = window.location.hash.indexOf("full")>-1?true:false;
	
	export default {
		// 页面组件。
		components: {
			"v-header": Header,
			"v-input": Input,
    		"v-button": Button,
    		"v-node": TimeNode
		},
		// 页面数据。
		data() {
			// 验证条码。
			let self = this;
        	var validateBarcode = (rule, value, callback) => {
        		if(!value.trim()) {
        			callback(new Error("请输入条码或扫码"));
        		}else {
        			callback();
        		}
        	};
			return {
				BOMConfig: {
					switch: 1,
					name: "BOM表"
				},
				timelineConfig: {
					switch: 1,
					name: "时间轴"
				},
				// 查询标记。
				tag: "",
				// 默认测试数据。
				sText: "",
				// 默认工序层级的间距。
				nLevelDis: 10,
				// 工序收缩图标宽度
				nIconDis: 19,
				// 首项默认的距离。
				nFirstDis : 5,
				// 是否全屏显示。
				bFullScreen: bFull,
				// 变量是否点击过查询。
				bSubmit: bFull?true:false,
				// 是否大屏轮播。
				bCarousel: window.location.hash.indexOf("carousel")>-1?true:false,
				// 是否显示标题。  只有当调用成功后才显示。
				bShowTitle: false,
				// 查询搜索值。
				ruleForm: {
					barcode: ""
				},
				// 当前tab值。
				sCurrentTab: "tables",
				// 当前表格中的数据。
				aoTable: [],
				// 创建表格数据，处理后的数据。
				aParsedData: [],
				// 当前时间轴数据。
				aoTimeLineData: [],
				// 当前数据标题。
				oTitle: {
					materialName: "",
					batchNo: "",
					barcode: ""
				},
				// 类型。
				oTab: {
					url: HOST + "/api/v1/resume/search",
					columns: [{
						prop: "materialName",
						name: "",
						width: 300
					},{
						prop: "opTypeName",
						name: "类型",
						width: 140,
						formatter: function(row) {
							// 出库、入库  条码绑定
							if(row.opType == 102 || row.opType == 103) {
								// 出库、入库
								return `${row.opTypeName}(${row.stockTypeName})`
							}else if(row.opType == 205) {
								// 条码绑定
								return `${row.opTypeName}(绑定)`
							}else if(row.opType == 206){
								// 解绑
								return `${row.opTypeName}(解绑)`
							}else {
								// 其他
								return row.opTypeName
							}
						}
					},{
						prop: "barcode",
						name: "条码",
						width: 240,
						formatter: function(row) {
							if(row.srcBarcode) {
								return `源条码:${row.srcBarcode}\n目标条码:${row.barcode}`
							}else {
								return row.barcode
							}
						}
					},{
						prop: "opTime",
						name: "时间",
						width: 160
					},{
						prop: "equipmentName",
						name: "地点",
						width: 160,
						formatter: function(row) {
							if(row.srcWarehouse) {
								return `源仓库:${row.srcWarehouse+"仓库"+row.srcReservoir+"库位"}\n目标仓库:${row.warehouse+"仓库"+row.reservoir+"库位"}`
							}else if(row.warehouse) {
								return `${row.warehouse+"仓库"+row.reservoir+"库位"}`
							}else {
								return row.equipmentName	
							}
						}
					},{
						prop: "batchNo",
						name: "批次",
						width: 160
					},{
						prop: "quantity",
						name: "数量",
						width: 80
					},{
						prop: "shiftName",
						name: "班次",
						width: 130
					},{
						prop: "doCode",
						name: "工单",
						width: 120,
						formatter: function(row) {
							if(row.srcDoCode) {
								return `源工单:${row.srcDoCode}\n目标工单:${row.doCode}`
							}else {
								return row.doCode
							}
						}
					},{
						prop: "personName",
						name: "人员",
						width: 80
					},{
						prop: "moldCode",
						name: "模号",
						width: 80
					},{
						prop: "contactName",
						name: "供应商/客户",
						width: 80
					},{
						prop: "checkResult",
						name: "检验结果",
						width: 80
//					},{
//						prop: "expiryTime",
//						name: "生效时间/失效时间",
//						width: 180,
//						formatter: function(row) {
//							if(row.effectiveTime || row.expiryTime) {
//								return `生效时间:${row.effectiveTime}\n失效时间:${row.expiryTime}`
//							}else {
//								return ""
//							}
//						}
					}],
					bCreated: false,
					loading: false,
					error: "",
					tableHeight: "",
					timelineHeight: ""
				},
				// 规则。
				rules: {
					barcode: [
						{validator: validateBarcode, trigger: "change"}
					]
				},
				myLocalStorage: [],
				downLoading: false
			}
		},
		// 计算属性。
		computed: {
			// BOM表状态。
			sBomType: function() {
				// 返回数据。
				return this.sCurrentTab=="tables"?"primary":"text";
			},
			// 时间轴状态。
			sTimeLineType: function() {
				// 返回数据。
				return this.sCurrentTab=="lines"?"primary":"text";
			},
			// 工厂配置数据。
			// configData() {
			// 	return this.$store.state.customModule.config
			// },
			// // 配置模块。
			// modulesConfig() {
			// 	return this.configData.modules
			// },
            // // 履历的配置项。
            // currentModule() {
            //     return this.modulesConfig.filter(o => o.key === "resume")[0]
            // },
		},
		created() {
			this.$register.login(this.$restore);
			let history = localStorage.getItem("history")
			if(history){
				this.myLocalStorage = JSON.parse(history)
			}else {
				this.myLocalStorage = []
			}

			// 获取配置数据。
			// this.$store.dispatch('getConfig').then(() => {
			// 	// 设置是否创建BOM表和时间轴。
			// 	let aoSubmodules = this.currentModule && this.currentModule.submodules

			// 	if(aoSubmodules) {
			// 		this.BOMConfig = aoSubmodules.find(o => o.key === "BOM")
			// 		this.timelineConfig = aoSubmodules.find(o => o.key === "timeline")
			// 	}

			// 	if(!this.BOMConfig.switch) {
			// 		this.sCurrentTab = "lines"
			// 	}
			// })
		},
		// 创建时处理。mounted
		mounted() {
			
			// 获取所需的查询参数。
			this.tag = location.search.split("=")[1]

          	let oData = sessionStorage.getItem("searchConditions-" + this.tag)

			// 履历模块。
		    if(oData) {
		        oData = JSON.parse(oData);
		        if(oData.tab === "resume") {
			        this.ruleForm.barcode = oData.keys.barcode;
		        }
		    }else {
		    	this.ruleForm.barcode = "";
		    }
		    
		    // 如果是全屏，则取参数值。--- 通过url获取。
		    if(this.bFullScreen) {
		    	let url = location.search; //获取url中"?"符后的字串 
				let oRequest = {}; 
				if (url.indexOf("?") != -1) { 
					let strs = url.substr(1).split("&"); 
					
					for(let i = 0; i < strs.length; i ++) { 
						oRequest[strs[i].split("=")[0]]=decodeURIComponent(strs[i].split("=")[1]); 
					} 
				}
				this.ruleForm.barcode = oRequest.barcode;
				this.sCurrentTab = oRequest.type;
		    }
		    
			// 默认查询。--- created()
			this.getPageData();
		},
		// 页面方法。
		methods: {
			// 初始化数据。
			initData() {
				// 标题值重置。
				for(let param in this.oTitle) {
					this.oTitle[param] = "";
				}
				// 当前表格中的数据。
				this.aoTable = [];
				// 创建表格数据，处理后的数据。
				this.aParsedData = [];
				// 当前时间轴数据。
				this.aoTimeLineData = [];
				// 默认不显示标题
				this.bShowTitle = false;
				// 默认都未创建。
				this.oTab.loading = false;
				this.oTab.error = "";
			},
			// 获取页面的高度。
			getHeight() {
				var nHeight = window.document.documentElement.clientHeight,
					jWrap = $(".resume-content-wrap"),
					jForm = $(".filters"),
					jLine = $(".line"),
					nReturnHeight = 0;
				
				// 获取页面中的可显示高度。
				nReturnHeight = nHeight
							- (this.bFullScreen?0:$("header").outerHeight(true))
							-  (jWrap.outerHeight(true) - jWrap.height())
							- (this.bFullScreen?0:jForm.outerHeight(true))
							- (this.bFullScreen?0:jLine.outerHeight(true))
							- ($(".resume-main").outerHeight(true) - $(".resume-main").height())
							- $(".resume-handler").outerHeight(true);

				// 设置表格及时间轴的高度。
				this.oTab.timelineHeight = nReturnHeight;
				this.oTab.tableHeight = nReturnHeight - (this.bShowTitle?$(".resume-table .table-title").outerHeight(true):0)
			},
			// 查询操作处理 函数。
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if (valid) {
						let obj = {
							"keys": {
								"barcode": this.ruleForm.barcode
							},
							"radio": "1",
							"tab": "resume"
						}
						this.updateRecord(obj)

						// 重置数据。----
						this.initData();
						
						// 根据当前tab类型创建数据。
						this.getPageData();
					}
				});
			},
			// 修改页面中的显示tab。
			changeTab(sTab) {
				// 修改当前的tab值。
				if(sTab != this.sCurrentTab) {
					// 修改当前的tab项。
					this.sCurrentTab = sTab;
				}
			},
			// 获取数据。
			getPageData() {
				// 设置内容的高度。
				this.getHeight();
				// 获取数据。-- 根据当前显示的tab创建数据。
				this.oTab.loading = true;
				// 设置barcode。
				this.oTitle.barcode = this.ruleForm.barcode;
				// 需要调用接口，才将错误信息去掉
				this.oTab.error = "";
				
				this.$register.sendRequest(this.$store, this.$ajax, this.oTab.url, "post", this.ruleForm, this.requestSucess, this.requestFail, this.requestError)
				
			},
			// 请求成功。
			requestSucess(oData) {
				this.oTab.loading = false;
				// 显示标题。
				this.bShowTitle = true;
				this.oTitle.materialName = oData.productMaterialName;
				this.oTitle.batchNo = oData.productBatchNo;
				
				// 数据修改。
				this.aoTable = oData.bomResumes;
				this.aParsedData = this.parseTableData();
				this.aoTimeLineData = this.parseTimeLineData(oData.timeLineDateResumes);
				
				if(this.bCarousel) {
					this.$nextTick(function() {
						// 设置滚动。
						this.setScroll();
					})						
				}	
				// 设置内容的高度。
				this.getHeight();			
			},
			// 请求失败。
			requestFail(sErrorMessage) {
				this.oTab.loading = false;
				this.bShowTitle = false;
				// 根据errorCode 错误时设置。error
				this.oTab.error = sErrorMessage;
				// 设置内容的高度。
				this.getHeight();

			},
			// 请求错误。
			requestError(err) {
				console.log(err)
				this.oTab.loading = false;
				this.oTab.error = "查询出错";
				// 设置内容的高度。
				this.getHeight();
			},
			// 设置滚动。
			setScroll () {
				// 时间轴
				let node = this.$refs.timeLine,
					bEnd = false;

				if(this.sCurrentTab == "tables") {
					// 表格
					node = this.$refs.table.querySelector(".el-table__body-wrapper");
				}
				
				if(node.scrollHeight > node.clientHeight) {
					
					setInterval(function() {
						if(bEnd) {					
							node.scrollTop = 0;
							bEnd = false;
						}else if(node.scrollTop + 100 + node.clientHeight > node.scrollHeight) {
							node.scrollTop = node.scrollHeight - node.clientHeight;
							bEnd = true;
						}else {
							node.scrollTop += 100;
						}
					}, 1000)
				}				
			},
			/**
			 * 时间轴数据处理。
			 * @param {Array} aoData
			 * @return {Array}
			 */
			parseTimeLineData(aoData) {
				// 按照日期排序。
				let aoNewData = aoData.sort( (oA, oB) => +new Date(oA.date) - +new Date(oB.date) < 0? 1:-1 )
				
				// 按时间排序。
				aoNewData.forEach( o => o.resumes = o.resumes.sort( ( oA, oB ) => +new Date(oA.opTime) - +new Date(oB.opTime) < 0? 1:-1 ) )
				
				// 返回数据。
				return aoNewData
			},
			/**
			 * 表格数据处理函数。
			 */
			parseTableData() {
				var	_that = this,
				    aoNew = [];
				    
				_getData(-1, 0);
				
				return aoNew;
				/**
				 * 获取表格中的数据。
				 * @param {String} sParent  当前显示的parent值。
				 * @param {Number} nLevel 当前数据的层级
				 */
				function _getData(sParent,nLevel) {
					var aInvialid = [];
					// 获取元素的子级数据。
					aInvialid = _that._getTableChildDataById(sParent);
					
					// 返回元素的子集。
					if(aInvialid.length) {
						aInvialid.forEach(function(oData) {
							// 获取每一级中其上级所有数据的总和。
							let oPrev = aoNew[aoNew.length-1],
								// 是否还有下一个level。-- 如果当前数据的level大于上一次数据的level，则表示是上条数据的子集。
								bHasNext = false;
							
							// 判断是否有子级。
							if(oPrev && (nLevel - oPrev.level) == 1) {
								oPrev.bHasNext = true;
							}
							
							aoNew.push({
								id: oData.nodeId,
								name: oData.nodeName,					// name
								parent: oData.parentNodeId,				// parent
								data: oData.data || {},					//data
								level: nLevel,
								bHasNext: bHasNext
							});
							// 循环获取数据。
							_getData(oData.nodeId, nLevel+1);
						});
					}
					
				}
			},
			// 获取元素的当前子节点数据。
		    _getTableChildDataById(sId) {
				var _that = this,
					aResult = [];
					
				// 遍历数据，并按照检验，产出，投入，出入库； 时间倒序排
				aResult = _that.aoTable.filter(function(oData) {
					return oData.parentNodeId == sId;
				})
				
//				aResult = aResult.sort( (oA, oB) => +new Date( oA.data ? oA.data.opTime || 0 : 0 ) - +new Date( oB.data ? oB.data.opTime || 0 : 0) < 0? 1:-1 )
				
				// 排序处理。 或者按产出投入处理排序
				aResult = aResult.sort( (oA, oB) => {
					let oATime = +new Date( oA.data ? oA.data.opTime || 0 : 0 )
					let oBTime = +new Date( oB.data ? oB.data.opTime || 0 : 0 )
					
					let nDis = oATime - oBTime
					
					let oAType = oA.data ? oA.data.opType || '' : ''
					let oBType = oB.data ? oB.data.opType || '' : ''
					
					if(nDis < 0) {
						return 1
					}else if(nDis > 0) {
						return -1
					}else {
						// 时间相等，根据类型排  只排产出及投入. 产出6在投入1前。
						if(oAType == 1 && oBType == 6) {
							return 1
						}else if(oAType == 6 && oBType == 1) {
							return -1
						}else {
							return 1
						}
					}
					
				})
				
//				aResult = this.setDataOrder(aResult);
				
				// 返回数据。
				return aResult;
			},
			/**
			 * 数据排序处理。
			 * @param {Array}
			 * @return {Array}
			 */
			setDataOrder(aData) {
				let aOrder = [{
					// 送检
					type: "5,6",
					data: []
				}, {
					// 产出
					type: "4",
					data: []
				}, {
					// 投入
					type: "3",
					data: []
				}, {
					// 出入库
					type: "1,2",
					data: []
				}, {
					type: "",
					data: []
				}],
				aReturn = [];
				
				if(aData.length > 1) {
					
					aData.forEach( o => {
						if(o.data) {
							// 存在数据。
							aOrder[_getIndexByType(o.data.type)].data.push(o);
						}else {
							// 不存在数据。
							aOrder[aOrder.length-1].data.push(o);
						}
					})
					
					// 数据排序后。
					aOrder.forEach( (o, index) => {
						if(index!= aOrder.length-1 && o.data.length > 1) {
							// data存在，非第一条数据 进行排序处理。
//							o.data = o.data.sort( (oA, oB) =>  oA.data.time < oB.data.time ? 1:-1 )
							o.data = o.data.sort( (oA, oB) => +new Date(oA.data.time) - +new Date(oB.data.time) < 0? 1:-1)
						}
						aReturn = aReturn.concat(o.data);
					})
					
				}else {
					aReturn = aData;
				}
				
				// 返回数据。
				return aReturn;
				
				// 获取数据的索引。
				function _getIndexByType(sType) {
					let nIndex = -1;
					
					aOrder.filter( (o,index) => {
						if(o.type.includes(sType)) {
							nIndex = index;
						}
					})
					
					// 返回索引
					return nIndex;
				}
			},
			// 获取时间轴显示颜色。
			getNodeColor(nType) {
				let sDefault = "green"
				
				switch(nType) {
					// 仓库操作
					case 102:
					case 103:
					case 101:
					case 112:
						sDefault = "yellow"
						break
					// 车间操作
					case 1:
					case 6:
					case 2:
					case 8:
					case 11:
					case 14:
					case 15:
						sDefault = "green"
						break
					// 条码管理
					case 205:
					case 206:
					case 203:
					case 204:
						sDefault = "purple"
						break
					// 检验
					case 1001:
					case 1002:
						sDefault = "red"
						break
					default:
						break
				}
				
				// 返回当前显示颜色类。
				return sDefault
			},
			// 获取时间轴内容显示
			getNodeTextByType(o) {
				// 节点类型
				let opType = o.opType
				
				// 条码绑定： 1:绑定	 -1: 解绑
				let	nBusinessType = o.businessType 
				
				let sDom = null
				
				// 获取当前显示的文本。
				switch(opType) {
					// 投入
					case 1:
					// 产出
					case 6:
						sDom = `<div class="item-type">${o.processName + o.opTypeName}:</div>
								<div class="item-info">
									<span class="tips">${o.personName||"-"}</span>在
									<span class="tips">${o.equipmentName||"-"}</span> 设备上
									将条码 <span class="tips">${o.barcode||"-"}</span> 
									${o.batchNo ? `,批次 <span class="tips">${o.batchNo}</span> `:""}
									的 <span class="tips">${o.materialName||"-"}</span> 物料,
									<span class="tips">${o.opTypeName}</span>
									${o.quantity}件
								</div>`
					
						break
					// 结转
					case 2:
						sDom = `<div class="item-type">${o.processName + o.opTypeName}:</div>
								<div class="item-info">
									<span class="tips">${o.personName||"-"}</span>在
									<span class="tips">${o.equipmentName||"-"}</span> 设备上
									将条码 <span class="tips">${o.barcode||"-"}</span> 
									,批次 <span class="tips">${o.batchNo||"-"}</span>
									,工单号<span class="tip">${o.srcDoCode}</span>
									的 <span class="tips">${o.materialName||"-"}</span> 物料,
									<span class="tips">${o.opTypeName}</span>
									${o.quantity}件
									到工单号<span class="tips">${o.doCode}</span>
								</div>`
						
						break
					// 退料
					case 8:
						sDom = `<div class="item-type">${o.processName + o.opTypeName}:</div>
								<div class="item-info">
									<span class="tips">${o.personName||"-"}</span>在
									<span class="tips">${o.equipmentName||"-"}</span> 设备上
									将条码 <span class="tips">${o.srcBarcode||"-"}</span> 
									,批次 <span class="tips">${o.batchNo||"-"}</span>
									的 <span class="tips">${o.materialName||"-"}</span> 物料,
									<span class="tips">${o.opTypeName}</span>
									${o.quantity}件
									${(o.srcBarcode != o.barcode) ? ` 到新条码<span class="tips">${o.barcode}</span> `: ''}
								</div>`
					
						break
					// 车间调整
					case 11:
					// 返工入站
					case 14:
					// 返工出站
					case 15:
						sDom = `<div class="item-type">${o.opTypeName}:</div>
								<div class="item-info">
									<span class="tips">${o.personName||"-"}</span>
									将条码 <span class="tips">${o.srcBarcode||"-"}</span> 
									,批次 <span class="tips">${o.batchNo||"-"}</span>
									的 <span class="tips">${o.materialName||"-"}</span> 物料,
									<span class="tips">${o.opTypeName}</span>
									${o.quantity}件
									${(o.srcBarcode != o.barcode) ? ` 到新条码<span class="tips">${o.barcode}</span> `: ''}
								</div>`
								
						break
					// 条码绑定
					case 205:
						// 绑定类型
						sDom = `<div class="item-type">${o.opTypeName}:</div>
								<div class="item-info">
									<span class="tips">${o.personName||"-"}</span>
									将条码 <span class="tips">${o.srcBarcode||"-"}</span> 
									,批次 <span class="tips">${o.batchNo||"-"}</span>
									的 <span class="tips">${o.materialName||"-"}</span> 物料,
									${o.quantity}件
									绑定到容器条码<span class="tips">${o.barcode}</span>
								</div>`
						
						break
					// 条码解绑
					case 206:
						sDom = `<div class="item-type">${o.opTypeName}:</div>
								<div class="item-info">
									<span class="tips">${o.personName||"-"}</span>
									将条码 <span class="tips">${o.srcBarcode||"-"}</span> 
									,批次 <span class="tips">${o.batchNo||"-"}</span>
									的 <span class="tips">${o.materialName||"-"}</span> 物料,
									${o.quantity}件
									与容器条码<span class="tips">${o.barcode}</span>解绑
								</div>`
						break
					// 补料
					case 203:
							sDom = `<div class="item-type">${o.opTypeName}:</div>
								<div class="item-info">
									<span class="tips">${o.personName||"-"}</span>
									将条码 <span class="tips">${o.barcode||"-"}</span> 
									,批次 <span class="tips">${o.batchNo||"-"}</span>
									的容器添加物料<span class="tips">${o.materialName||"-"}</span>,
									${o.quantity}件
								</div>`
						
						break
					// 修改失效时间
					case 204:
						sDom = `<div class="item-type">${o.opTypeName}:</div>
								<div class="item-info">
									<span class="tips">${o.personName||"-"}</span>
									修改条码 <span class="tips">${o.barcode||"-"}</span> 
									的生效时间为 <span class="tips">${o.effectiveTime||"-"}</span>,
									失效时间为<span class="tips">${o.expiryTime||"-"}</span>
								</div>`
								
						break
					// 入库
					case 102:
						sDom = `<div class="item-type">${o.opTypeName}:</div>
								<div class="item-info">
									<span class="tips">${o.personName||"-"}</span>将
									供应商<span class="tips">${o.contactName||"-"}</span>,
									条码 <span class="tips">${o.barcode||"-"}</span>,
									批次<span class="tips">${o.batchNo||"-"}</span>
									的物料<span class="tips">${o.materialName||"-"}</span>
									${o.quantity}件,
									<span class="tips">${o.stockTypeName}</span>到
									<span class="tips">${o.warehouse}</span>仓库
									<span class="tips">${o.reservoir}</span>库位
								</div>`
								
						break
					// 出库
					case 103:
						sDom = `<div class="item-type">${o.opTypeName}:</div>
								<div class="item-info">
									<span class="tips">${o.personName||"-"}</span>将
									<span class="tips">${o.srcWarehouse}</span>仓库
									<span class="tips">${o.srcReservoir}</span>库位
									条码 <span class="tips">${o.barcode||"-"}</span>,
									批次<span class="tips">${o.batchNo||"-"}</span>
									的<span class="tips">${o.materialName||"-"}</span>物料
									${o.quantity}件,
									<span class="tips">${o.stockTypeName}</span>
									给联系人<span class="tips">${o.contactName}</span>
								</div>`
								
						break
					// 库存转储
					case 101:
						sDom = `<div class="item-type">${o.opTypeName}:</div>
								<div class="item-info">
									<span class="tips">${o.personName||"-"}</span>将
									<span class="tips">${o.srcWarehouse}</span>仓库
									<span class="tips">${o.srcReservoir}</span>库位
									条码 <span class="tips">${o.srcBarcode||"-"}</span>,
									批次<span class="tips">${o.batchNo||"-"}</span>
									的<span class="tips">${o.materialName||"-"}</span>物料
									${o.quantity}件,转储到
									<span class="tips">${o.warehouse}</span>仓库
									<span class="tips">${o.reservoir}</span>库位
								</div>`
						
						break
					// 库存调整
					case 112:
						sDom = `<div class="item-type">${o.opTypeName}:</div>
								<div class="item-info">
									<span class="tips">${o.personName||"-"}</span>将
									<span class="tips">${o.srcWarehouse}</span>仓库
									<span class="tips">${o.srcReservoir}</span>库位
									条码 <span class="tips">${o.srcBarcode||"-"}</span>,
									批次<span class="tips">${o.batchNo||"-"}</span>
									的<span class="tips">${o.materialName||"-"}</span>物料
									${o.quantity}件,调整到新条码
									<span class="tips">${o.barcode}</span>
								</div>`
								
						break
					// 送检
					case 1001:
						sDom = `<div class="item-type">${o.opTypeName}:</div>
								<div class="item-info">
									<span class="tips">${o.personName||"-"}</span>将
									条码 <span class="tips">${o.barcode||"-"}</span>,
									批次<span class="tips">${o.batchNo||"-"}</span>
									,在<span class="tips">${o.equipmentName||"-"}</span>上产出
									的<span class="tips">${o.materialName||"-"}</span>物料
									${o.quantity}件进行
									<span class="tips">${o.opTypeName}</span>
									,结果为<span class="tips">${o.checkResult}</span>
								</div>`
						
						break;
					// 质检
					case 1002:
						sDom = `<div class="item-type">${o.opTypeName}:</div>
								<div class="item-info">
									<span class="tips">${o.personName||"-"}</span>将
									条码 <span class="tips">${o.barcode||"-"}</span>,
									批次<span class="tips">${o.batchNo||"-"}</span>
									,在<span class="tips">${o.equipmentName||"-"}</span>上产出
									的<span class="tips">${o.materialName||"-"}</span>物料进行
									<span class="tips">${o.opTypeName}</span>
									,结果为<span class="tips">${o.checkResult}</span>
								</div>`
								
						break
					default:
						break
				}
				
				// 返回html
				return sDom
			},
			// 根据列表索引，获取当前行的子集的索引列表。
			getChildrenIndexArrByParentIndex(nIndex) {
				let aIndex = [],
					// 格式转换后的数据。
					aoTableData = this.aParsedData,
					bFounded = false;
					
				if(nIndex != -1) {
					
					var oNow = aoTableData[nIndex],
						nLevel = oNow.level;
					
					aoTableData.forEach(function(oData, index) {
						if(index > nIndex && !bFounded) {
							// 从这个索引开始。
							var nVal = oData.level;
							if(nVal>nLevel) {
								// 层级是当前点击的层级的子集。
								aIndex.push(index);
							}else {
								// 当前点击的所有层级遍历完成。
								bFounded = true;
							}
						}
					});
					
				}
				
				// 返回数据。
				return aIndex;
			},
			// 根据列表索引，获取当前行的子集的索引列表。
			getChildIndexArrByParentIndex(nIndex) {
				let aIndex = [],
					// 格式转换后的数据。
					aoTableData = this.aParsedData,
					bFounded = false;
					
				if(nIndex != -1) {
					
					var oNow = aoTableData[nIndex],
						nLevel = oNow.level;
					
					aoTableData.forEach(function(oData, index) {
						if(index > nIndex && !bFounded) {
							// 从这个索引开始。
							var nVal = oData.level;
							if(nVal-nLevel == 1) {
								// 层级是当前点击的层级的子集。
								aIndex.push(index);
							}else {
								// 当前点击的所有层级遍历完成。
								bFounded = true;
							}
						}
					});
					
				}
				
				// 返回数据。
				return aIndex;
			},
			// 获取某个level下，其所有子级的rowIndex 值。
			getChildrenLenByData(oData) {
				let sId = oData.id,
					nLevel = oData.level;
					
				let bStart = false
				let bEnd = false
	            let num = 0
	            
	            // 循环数据获取当前level下子level的长度。
	            this.aParsedData.forEach( o => {
	            	
	            	if(bStart && !bEnd) {
	            		if( o.level > nLevel) {
		            		num++
	            		}else {
	            			bEnd = true
	            		}
	            	}
	            	
	            	if(o.id === sId) {
	            		// 从当前列开始
	            		bStart = true
	            	}
	            })
					
				// 返回数据。
				return num
			},
			expandOrCollapseTr(index, props) {
				let elArr = []
				let nLevel = props.row.level
				
				// 当前点击列的所有子列的个数。
	            let num = this.getChildrenLenByData(props.row)
	            
	            const trs = document.querySelectorAll(".el-table__body-wrapper")[0].querySelectorAll("tr")
	            const trsFix = document.querySelectorAll(".el-table__fixed-body-wrapper")[0].querySelectorAll("tr")
	            for (let i = 0; i < num; i++) {
	                elArr.push(trs[index + i + 1])
	                elArr.push(trsFix[index + i + 1])
	            }
	            const icon = trsFix[index].querySelectorAll(".icon-down")[0]
	            if (icon.classList.contains("actived")) {  // 判断是否隐藏
	            	// 展开。
	            	let aFilteredRowIndex = [];
	                elArr.forEach((el) => {
	                	// 判断该列子级是否隐藏。
	                	
	                	let nRowIndex = el.rowIndex
	                	let iconArrow = el.querySelectorAll(".icon-down")[0].classList
	                	let oData = this.aParsedData[nRowIndex]
	                	
	                	if(iconArrow.contains("actived")) {
	                		// 该列的子级应该隐藏。 获取其子级的rowIndex
	                		for(let i = 0; i< this.getChildrenLenByData(oData); i++) {
	                			aFilteredRowIndex.push(nRowIndex + i + 1)
	                		}
	                	}
	                	
	                	// 不在过滤的数据中需显示。
	                	if(!aFilteredRowIndex.includes(nRowIndex)) {
		                    el.classList.remove('hide');
	                	}
	                })
	                
	                icon.classList.remove('actived');
	            } else {
	            	// 隐藏。
	                elArr.forEach((el) => {
	                    return el.classList.add('hide');
	                })
	                icon.classList.add('actived');
	            }
			},
			// 全屏展示。
			openFullScreen(ev) {
				// 新打开一个页面。
				window.open("resume.html?barcode="+this.ruleForm.barcode+"&type="+this.sCurrentTab+"#full");
			},
			// 下载功能。
			onDownLoadHandler() {
				var jDown = $("#downloadImage"),
					jTimeLine = $(".time-line-content"),
					jClone = $(".clone"),
					sFileName = "",
					jNow = null,
					isTable = false,
					self = this;
				
				 if(this.sCurrentTab === "tables"){
				 	// 表格。
				 	isTable = true;
				 }else {
				 	// 时间轴。
				 	this.downLoading = true
				 	jClone.html(jTimeLine.html());
				 	sFileName = "时间轴";
					jNow = jClone;
				 }
					
				if(isTable) {
					// 表格下载
					this.onTableExportExcel()
				}else {
					// 时间轴。
					html2canvas(jNow.get(0),{
						height: jNow.outerHeight(true) + 100,
						background: isTable?"#fff":"#1d272f",
						onrendered:(canvas) => {
							
							self.onDownloadPic(sFileName +".png", canvas.toDataURL("image/png"))
							
//							const webpUrl = canvas.toDataURL("image/webp");
//							console.log(webpUrl.length)
//							if(webpUrl.length > 1950000 || webpUrl.length === 6){  //生成的base64长度大于200W会自动转成6，且无法打印
//								this.$message({
//									message: '抱歉，生成图片过大，无法下载',
//									type: 'warning'
//								});
//							}else{
//								jDown.attr({
//									"href":webpUrl,
//									"download": sFileName +".png"
//								}).get(0).click()
//							}
							// 重置复制内容。
							jClone.html("");
							this.downLoading = false
						}

					});
				}
			},
			// 图片下载。
			onDownloadPic(fileName, content) {
				let blob = base64Img2Blob(content); //new Blob([content]);
                let evt = document.createEvent("HTMLEvents");
                let aLink = document.querySelector('#downloadImage')
                
                evt.initEvent("click", false, false);//initEvent 不加后两个参数在FF下会报错
                aLink.download = fileName;
                aLink.href = URL.createObjectURL(blob);
         		aLink.click()
                aLink.dispatchEvent(evt);
                
                // 数据转换。
				function base64Img2Blob(code){
	                let parts = code.split(';base64,');
	                let contentType = parts[0].split(':')[1];
	                let raw = window.atob(parts[1]);
	                let rawLength = raw.length;
	
	                let uInt8Array = new Uint8Array(rawLength);
	
	                for (let i = 0; i < rawLength; ++i) {
	                  uInt8Array[i] = raw.charCodeAt(i);
	                }
	
	                return new Blob([uInt8Array], {type: contentType}); 
	            }
			},
			// 打印功能。。
			onPrintHandler() {
				var jDown = $("#downloadImage"),
					jTimeLine = $(".time-line-content"),
					jClone = $(".clone"),
					jNow = null,
					isTable = false;
					
				if(this.sCurrentTab === "tables"){
				 	// 表格。
				 	isTable = true;
				}else {
				 	// 时间轴。
				 	jClone.html(jTimeLine.html());
					jNow = jClone;
				}
				
				if(isTable) {
					this.onTablePrint()
				}else {
					// 时间轴。
					window.Rt.utils.printHtml(html2canvas, jNow.get(0),{
						height: jNow.outerHeight(true) + 200,
						background: "#1d272f"
	                },true);
				}
				
			},
			// 表格下载。
			onTableExportExcel() {
				let aoData = [],
					oData = {
						filename: "BOM表",
						columns: this.oTab.columns,
						data: []
					}
				
				// 更新数据。
				aoData = this.aParsedData.map( o => {
					if(window.Rt.utils.isEmptyObject(o.data)) {
						return {
							materialName: o.name
						}
					}else {
						return o.data
					}
				})
				
				oData.data = aoData
				// 下载表格。
            	window.Rt.utils.exportJson2Excel(XLSX, Blob, FileSaver, oData);
			},
			// 表格打印。
			onTablePrint() {
				let oTable = this.$refs.table
                
                if(!oTable) {
                    return;
                }
				
				let sHtml = `
					<div class="table-title">
						${oTable.querySelector(".table-title").innerHTML}
					</div>
	        		<div class="table el-table">
						<div class="el-table__header-wrapper">
							${oTable.querySelector(".el-table__header-wrapper").innerHTML}
						</div>
						<div class="el-table__body-wrapper">
							${oTable.querySelector(".el-table__body-wrapper").innerHTML}
						</div>
	        			<style>
		        			.table-title {
		        				text-align: center;
		        			}
		        			.table-title .title-text {
		        				font-size: 24px;
								margin-right: 10px;
		        			}
		        			.table-title .title-subText {
		        				font-size: 16px;
								margin-left: 10px;
		        			}
	            			.el-table td.is-center, .el-table th.is-center {
	        					text-align: center;
	            			}
	        				.table thead th {
	        					height: 36px;
								background-color: #42af8f;
	        				}
	        				.table thead th .cell {
	        					color: #fff;
	        				}
	        				.el-table__body-wrapper tr:nth-child(even) {
	        				 	background-color: #fafafa;
	        				}
	        				.el-table__body-wrapper tr:nth-child(odd) {
	        				 	background-color: #fff;
	        				}
	        				.el-table__body-wrapper td {
	                        	white-space: normal;
	    						word-break: break-all;
	                        }
	        				.el-table__body-wrapper .cell {
	        					min-height: 30px;
	        					line-height: 30px;
	        					// 边框设置，会导致时间列换行，如果使用复制的元素，则不会换行
								//  border: 1px solid #e4efec;
	        					box-sizing: border-box;
	        				}
	        				.el-table__empty-block {
	        					text-align: center;	
	        				}
	        			</style>
	        		</div>
	        	`;
				
                window.Rt.utils.rasterizeHTML(rasterizeHTML, sHtml);
			},
			/* 生成随机数函数 */
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
	@green: #42af8f;	/*主题色*/
	/* 时间轴颜色 */
	@blue: #0099ff;
	@yellow: #fcc433;
	@red: #e86b59;
	@inVent: #00a656;
	@purple: #999cf9;
	
	body {
		background-color: #f2f2f2;
		font-size: 14px;
		overflow: hidden;
	}
	
	.el-input__inner {
		height: 30px;
		border-radius: 0;
	}

	.el-button--text {
		border: 1px solid #42af8f;
		padding: 10px 15px;
		border-radius: 0;
	}
	.el-button {
		border-radius: 0;
		width: 80px;
		height: 30px;
		padding: 0;
		box-sizing: border-box;
		font-size: 14px;
	}
	
	.el-table .el-table__header thead tr th {
		background-color: @green;
		.cell {
			background-color: @green;
			color: #FFFFFF;
		}	
	}
	
	.el-table .cell {
		padding: 0;
	}	
	.show {
	    transition: display 400ms;
	}
	
	.hide {
	    opacity: 0;
	    display: none
	}
	
	.domDown {
		position: absolute;
		z-index: 0;
	}
	.clone {
		position: absolute;
		z-index: -1;
		/*padding: 0 20px;*/
		
		
		.cell-content {
			line-height: 40px;
		}
		
		.table-title {
			text-align: center;
			/*margin: -25px 25px 25px;*/
			
			.title-text {
				font-size: 24px;
				margin-right: 10px;	
			}
			.title-subText {
				font-size: 16px;
				margin-left: 10px;
			}
		}
		.time-line;
	}
	
	
	.resume-wraps {
		background-color: #F2F2F2;
		
		.resume-content-wrap {
			background-color: #FFFFFF;
			margin: 20px;
			
			&.full {
				margin: 0;
			}
			
			.resume-content {
				
				.filters {
					padding: 20px 20px 0;
					
					.el-form-item {
						display: inline-block;
						
						&.filters-code {
							width: 600px;
						}
					}
					
					.el-input {
						width: 500px;
					}
				}
				
				.line {
					width: 100%;
					height: 1px;
					background-color: #CCCCCC;
				}
				
				.resume-main {
					padding: 20px;
					
					.error {
						text-align: center;
					}
					
					.resume-handler {
						margin-bottom: 20px;
						
						.resume-tabs {}
						.resume-icons {
							text-align: right;
							margin-top: -26px;
							color: @green;
							
							.resume-icon {
								cursor: pointer;
								margin-right: 10px;
								
								&:last-child {
									margin-right: 0;
								}
							}
						}
					}
					
					
					.resume-table,
					.resume-table-clone {
						
						.table-title {
							text-align: center;
							margin: 15px 25px 25px;
							
							.title-text {
								font-size: 24px;
								margin-right: 10px;	
							}
							.title-subText {
								font-size: 16px;
								margin-left: 10px;
							}
						}
						
						.table-main {
							
							.cell-content {
								line-height: 40px;
							}
							
							.icon-down {
									transition: transfrom 1s linear;
									
								&.actived {
									transform: rotate(-90deg);
								}
							}
							.cell-info {
								&.actived {
									display: none;
								}
							}
							.table-item {
								padding: 10px;
								
								&.actived {
									display: none;
								}
							}
							
						}
					}
					
					.resume-timeLine {
						/*margin-top: 25px;*/
						color: #FFFFFF;
						overflow: auto;
						
						.time-line-content {
							.time-line;
						}
						
					}
					
					&.showDiff {
						background-image: url(../../assets/img/bg.jpg);
						/*background-color: #1d272f;*/
					}
					
				}
				
			}
			
		}
	}
	
	.time-line {
		padding: 20px 30px;
		
		.time-line-wrap {
			
			.line-item {
				color: @blue;
				font-size: 20px;
				/*display: flex;*/
				
				.item-date {
					display: inline-block;
					vertical-align: middle;
					/*width: 180px;*/
					padding: 0 25px;
					line-height: 40px;
					background: rgba(0,153,255,.3);
					border-radius: 20px;
				}
				.item-node {
					display: inline-block;
					vertical-align: middle;
					margin: 0 40px;
					
					&.bigSize {
						margin: 0 20px;
					}
				}
				.item-title {
					display: inline-block;
					vertical-align: middle;
					font-size: 24px;
				}
			}
			.item-line {
				width: 4px;
				height: 40px;
				background: @blue;
				position: relative;
				left: 216px;
				top: 0px;
			}
			.line-list {
				font-size: 18px;
				
				.list-sub {
					margin: 50px 0;
					display: flex;
					line-height: 24px;
					
					&.first {
						margin-top: 10px;
					}
					
					.sub-date {
						color: #CCCCCC;
						font-size: 16px;
						margin-left: 70px;
						
						&.last {
							margin-left: 74px;
						}
					}
					.sub-node {
						margin: 0 36px 0 70px;
					}
					.node-line {
						width: 4px;
						background: @blue;
						position: relative;
						left: 216px;
						top: 35px;
					}
					.sub-info {
						.sub-item {
							display: flex;
							
							.item-type {
								color: #fff;
								white-space: nowrap;
								margin-right: 4px;
								font-size: 20px;
							}
							.item-info {
								color: #e5e5e5;
							}
						}
						&.blue {
							.tips {
								color: @blue;
							}
						}
						&.yellow {
							.tips {
								color: @yellow;
							}
						}
						&.red {
							.tips {
								color: @red;
							}
						}
						&.green {
							.tips {
								color: @inVent;
							}
						}
						&.purple {
							.tips {
								color: @purple
							}
						}
					}
				}
			}
		}
						
		
	}
	
</style>
