<template>
	<div id="app">
		<a href="" id="downloadImage" v-show="false"></a>
		<div class="domDown"></div>
		
		<!-- header 部分-->
		<v-header ref="headers" v-show="!bFullScreen"></v-header>
		<div class="resume-wraps">
			<div class="resume-content-wrap" :class="{full:bFullScreen}">
				<div class="clone"></div>
				<div class="resume-content">
					<el-form v-show="!bFullScreen" class="filters" :model="ruleForm" :rules="rules" ref="ruleForm" label-position="left" label-width="80px">
						<el-form-item class="filters-code" label="成品条码:" prop="barcode">
							<v-input placeholder-data="请输入条码或扫码" key-data="barcode" :form-data="ruleForm"></v-input>
						</el-form-item>
						<el-form-item>
							<v-button text-data="查询" @query="submitForm('ruleForm')"></v-button>
						</el-form-item>
					</el-form>
					
					<div v-show="!bFullScreen" class="line"></div>
					<div class="resume-main" :class="{showDiff:sCurrentTab === 'lines' }">
						<div class="resume-handler" v-show="!bCarousel">
							<div class="resume-tabs">
								<v-button text-data="BOM表" tab-data="tables" :type-data="sBomType"  @query="changeTab('tables')"></v-button>
								<v-button text-data="时间轴" tab-data="lines"  :type-data="sTimeLineType" @query="changeTab('lines')"></v-button>
							</div>
							<div class="resume-icons">
								<i class="resume-icon icon icon-20 icon-print" @click.stop="onPrintHandler"></i>
								<i class="resume-icon icon icon-20 icon-download" @click.stop="onDownLoadHandler"></i>
								<i class="resume-icon icon icon-20 icon-fullScreen" v-show="!bFullScreen" @click.stop="openFullScreen"></i>
							</div>
						</div>
						<!-- 表格 -->
						<div v-show="sCurrentTab === 'tables'" class="resume-table" ref="table">
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
								style="width: 100%;"
								v-loading="oTab.loading"
								element-loading-text="拼命加载中"
								row-class-name="table-item">
								<el-table-column
									v-for="(column,index) in oTab.columns"
									:align="index?'center':'left'"
									:fixed="!index?true:false"
									:min-width="column.width"
									:label="column.name">
									<template scope="props">
										<div class="cell-content" v-if="!index" :style="{paddingLeft:props.row.level*nLevelDis+nFirstDis+(props.row.bHasNext?0:nIconDis)+'px'}">
											<i class="icon-down el-icon-arrow-down" v-show="props.row.bHasNext"  @click.stop="expandOrCollapseTr"></i>
											<span>{{ props.row.name }}</span>
										</div>
										<div v-else :class="[{isVis: !props.row.data[column.prop]}, 'cell-content']">
											{{ column.formatter(props.row.data[column.prop]) }}
										</div>
									</template>
								</el-table-column>
							</el-table>
						</div>
						
						<!-- 表格的复制 -->
						<div v-show="false" class="resume-table-clone">
							<div class="table-title">
								<span class="title-text">{{ oTitle.materialName }} 产品履历</span>
								<span class="title-subText">条码: {{ oTitle.barcode }}</span>
								<span class="title-subText">批次: {{ oTitle.batchNo }}</span>
							</div>
							<el-table 
								class="table-main" 
								:data="aParsedData" 
								stripe
								style="width: 100%;"
								row-class-name="table-item">
								<el-table-column
									v-for="(column,index) in oTab.columns"
									:align="index?'center':'left'"
									:min-width="column.width"
									:label="column.name">
									<template scope="props">
										<div class="cell-content" v-if="!index" :style="{paddingLeft:props.row.level*nLevelDis+nFirstDis+(props.row.bHasNext?0:nIconDis)+'px'}">
											<i class="icon-down el-icon-arrow-down" v-show="props.row.bHasNext"  @click.stop="expandOrCollapseTr"></i>
											<span>{{ props.row.name }}</span>
										</div>
										<div v-else :class="[{isVis: !props.row.data[column.prop]}, 'cell-content']">
											{{ column.formatter(props.row.data[column.prop]) }}
										</div>
									</template>
								</el-table-column>
							</el-table>
						</div>
						
						<!-- 时间轴 -->
						<div 
							v-loading="oTab.loading"
							element-loading-text="拼命加载中"
							v-show="sCurrentTab === 'lines'" class="resume-timeLine" :style="{height: oTab.timelineHeight +'px'}" ref="timeLine">
							
							<div v-if="oTab.error" class="error">
								{{ oTab.error }}
							</div>
							<div v-else class="time-line-content">
								<div 
									class="time-line-wrap"
									v-for="(timeItem, index) in aoTimeLineData">
									
									<div class="line-item">
										<span class="item-date">{{ timeItem.date }}</span>
										<div class="item-node" :class="{bigSize:!index}"><v-node :class="{bigSize:!index}" color-type="blue"></v-node></div>
										<span class="item-title" v-if="!index">产品履历</span>
									</div>
									<div class="item-line"></div>
									<div class="line-list">
										<div class="list-sub" :class="{first:!itemIndex}"
											v-for="(item,itemIndex) in timeItem.resumes">
											<div v-show="!(index==aoTimeLineData.length-1&&itemIndex==timeItem.resumes.length-1)" class="node-line"></div>
											<span class="sub-date" :class="{last:index==aoTimeLineData.length-1&&itemIndex==timeItem.resumes.length-1}">{{ new Date(item.time).Format("hh:mm:ss") }}</span>
											<div class="sub-node">
												<v-node :color-type="getTimeLineTypeInfo(item.type).color"></v-node>
											</div>
											<div class="sub-info" :class="getTimeLineTypeInfo(item.type).color">
												<div class="sub-item" v-if="getTimeLineTypeInfo(item.type).type==1">
													<div class="item-type">{{getTimeLineTypeInfo(item.type).text}} :</div>
													<div class="item-info">
														<span class="tips">{{ item.personName || "-" }}</span> 
														将条码 <span class="tips">{{ item.barcode || "-" }}</span>
														，批次 <span class="tips">{{ item.batchNo || "-" }}</span> 
														的 <span class="tips">{{ item.materialName || "-" }}</span>
														<span class="tips">{{ item.quantity || "-" }}</span> 件，入库到
														<span class="tips">{{ item.warehouse || "-" }}</span>
														<span class="tips">{{ item.reservoir || "-" }}</span>
													</div>
												</div>
												<div class="sub-item" v-else-if="getTimeLineTypeInfo(item.type).type==2">
													<div class="item-type">{{ item.processName+getTimeLineTypeInfo(item.type).text }} :</div>
													<div class="item-info">
														<span class="tips">{{ item.personName || "-" }}</span> 在
														<span class="tips">{{ item.equipmentName || "-" }}</span> 设备上
														将条码 <span class="tips">{{ item.barcode || "-" }}</span> 
														，批次 <span class="tips">{{ item.batchNo || "-" }}</span> 
														的 <span class="tips">{{ item.materialName || "-" }}</span> 物料
														{{ getTimeLineTypeInfo(item.type).text }}
													</div>
												</div>
												<div class="sub-item" v-else>
													<div class="item-type">{{ getTimeLineTypeInfo(item.type).text }} :</div>
													<div class="item-info">
														<span class="tips">{{ item.personName || "-" }}</span> 
														将条码 <span class="tips">{{ item.barcode || "-" }}</span> 
														，批次 <span class="tips">{{ item.batchNo || "-" }}</span> 
														，在<span class="tips">{{ item.equipmentName || "-" }}</span> 设备上产出的
														<span class="tips">{{ item.materialName || "-" }}</span> 物料
														{{ getTimeLineTypeInfo(item.type).text }}，共计
														<span class="tips">{{ item.quantity || "-" }}</span> 件，结果为
														<span class="tips">{{ item.checkResult || "-" }}</span>
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
				// 查询标记。
				tag: "",
				// 默认测试数据。
				sText: "a",
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
						width: 450,
						formatter: function(sValue) {
							return sValue || self.sText
						}
					},{
						prop: "type",
						name: "类型",
						width: 120,
						formatter: function(sValue) {
							return self.getTimeLineTypeInfo(sValue).text || self.sText
						}
					},{
						prop: "time",
						name: "时间",
						width: 120,
						formatter: function(sValue) {
							return self._parseTimeFormat(sValue) || self.sText
						}
					},{
						prop: "location",
						name: "地点",
						width: 250,
						formatter: function(sValue) {
							return sValue || self.sText
						}
					},{
						prop: "batchNo",
						name: "批次",
						width: 300,
						formatter: function(sValue) {
							return sValue || self.sText
						}
					},{
						prop: "barcode",
						name: "条码",
						width: 300,
						formatter: function(sValue) {
							return sValue || self.sText
						}
					},{
						prop: "quantity",
						name: "数量",
						width: 120,
						formatter: function(sValue) {
							return sValue || self.sText
						}
					},{
						prop: "shiftName",
						name: "班次",
						width: 180,
						formatter: function(sValue) {
							return sValue || self.sText
						}
					},{
						prop: "personName",
						name: "人员",
						width: 120,
						formatter: function(sValue) {
							return sValue || self.sText
						}
					},{
						prop: "moldCode",
						name: "模号",
						width: 120,
						formatter: function(sValue) {
							return sValue || self.sText
						}
					},{
						prop: "vendorName",
						name: "供应商/客户",
						width: 120,
						formatter: function(sValue) {
							return sValue || self.sText
						}
					},{
						prop: "checkResult",
						name: "检验结果",
						width: 120,
						formatter: function(sValue) {
							return sValue || self.sText
						}
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
				}
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
			}
		},
		// 创建时处理。mounted
		created() {
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
				// 获取数据。-- 根据当前显示的tab创建数据。
				this.oTab.loading = true;
				// 设置barcode。
				this.oTitle.barcode = this.ruleForm.barcode;
				// 需要调用接口，才将错误信息去掉
				this.oTab.error = "";
				
				this.$ajax.post(this.oTab.url, this.ruleForm).then((res) => {
					this.oTab.loading = false;
					
					if(!res.data.errorCode) {
						// 显示标题。
						this.bShowTitle = true;
					    this.oTitle.materialName = res.data.data.materialName;
					    this.oTitle.batchNo = res.data.data.batchNo;
						
						// 数据修改。
					    this.aoTable = res.data.data.bomResumes;
					    this.aParsedData = this.parseTableData();
						this.aoTimeLineData = res.data.data.timeLineResumes;
						
						if(this.bCarousel) {
							this.$nextTick(function() {
								// 设置滚动。
								this.setScroll();
							})						
						}
					}else{
						this.bShowTitle = false;
					    // 根据errorCode 错误时设置。error
						this.oTab.error = res.data.errorMsg.message;
					}
					
					// 设置内容的高度。
					this.getHeight();
					
			    }).catch((err)=> {
			    	console.log(err)
			    	this.oTab.loading = false;
					this.oTab.error = "查询出错";
					// 设置内容的高度。
					this.getHeight();
			    });
				
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
			 * 表格数据处理函数。
			 */
			parseTableData() {
				var	_that = this,
				    aoNew = [];
				    
				_getData(null, 0);
				
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
				
				// 排序处理。
				aResult = this.setDataOrder(aResult);
				
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
					type: "",
					data: []
				}, {
					type: "5,6",
					data: []
				}, {
					type: "4",
					data: []
				}, {
					type: "3",
					data: []
				}, {
					type: "1,2",
					data: []
				}],
				aReturn = [];
				
				if(aData.length > 1) {
					
					aData.forEach( o=> {
						if(o.data) {
							// 存在数据。
							aOrder[_getIndexByType(o.data.type)].data.push(o);
						}else {
							// 不存在数据。
							aOrder[0].data.push(o);
						}
					})
					
					// 数据排序后。
					aOrder.forEach( (o, index) => {
						if(index && o.data.length > 1) {
							// data存在，非第一条数据 进行排序处理。
							o.data = o.data.sort( (oA, oB) => +new Date(oA.data.time) < +new Date(oB.data.time) )
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
			// 将时间数据转换为页面显示格式的值。
			_parseTimeFormat(sTime) {
				//2016-12-21 13:30:25
				let sResult = "";
				
				if(sTime) {
					sResult = new Date(sTime).Format("MM-dd hh:mm");	
				}
				
				// 返回数据。
				return sResult;
			},
			// 设置表格样式。
			tableRowStyleName(row,index) {
				if(index%2 == 1) {
					return {
						backgroundColor: "#f0f0f0"
					}
				}
			},
			setTableRowKey(row) {
				return row.level;
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
			// 展开或折叠表格显示列。
			expandOrCollapseTr(ev) {
				var _that = this,
					jItem = $(ev.target).closest(".table-item"),
					// 当前行的索引值。
					nIndex = jItem.index(),
					// 图表。
					jIcon = jItem.find(".icon-down"),
					// 展示的表格。
					jDisTr = jItem.parents(".el-table").find(".el-table__body-wrapper tbody tr.table-item"),
					jAllItem = jItem.add(jDisTr.eq(nIndex)),
					// 数据列表。
					jList = jAllItem.find(".cell .cell-info"),
					jAllIcon = jAllItem.find(".icon-down"),
					// 当前元素的子级索引值。--- 默认是需要展开或折叠。
					aChildrenIndex = this.getChildrenIndexArrByParentIndex(nIndex),
					// 是否折叠。-- 默认是展开的。
					bCollapsed = false,
					// 在操作过程中过滤掉的数据。
					aFilterIndex = [],
					// 保存需要操作的tr列。
					jATr = [];		
				
				// 判断状态。
				if(!jIcon.hasClass("actived")) {
					bCollapsed = true;
				}
				
				// 子级内容隐藏。
				jItem.parents(".el-table").find("tbody").each(function() {
					let jTbody = $(this);
					// 重置数据。
					jATr = [];
					aFilterIndex = [];
					
					jTbody.find("tr.table-item").each(function(index) {
						let jTr = $(this),
							jArrow = jTr.find(".icon-down");
							
						// 如果当前索引存在于其子级中，则处理状态。
						if(aChildrenIndex.indexOf(index) > -1) {
							// 判断当前是否为展开的。
							jATr.push(jTr);
							
							// 只有展开时处理，有的节点是不需展示，隐藏都可以隐藏。
							if(jArrow.hasClass("actived")) {
								// 当前及其子级是隐藏的。
								aFilterIndex = aFilterIndex.concat(_that.getChildrenIndexArrByParentIndex(index));
							}
							
							if(bCollapsed) {
								jTr.fadeOut(500);
							}else {
								// 显示的判断。
								if(aFilterIndex.indexOf(index) < 0) {
									jTr.fadeIn(500);
								}
							}
						}
					})
				});

//				jItem.parent("tbody").find("tr.table-item").each(function(index) {
//					let jTr = $(this),
//						jArrow = jTr.find(".icon-down");
//					
//					// 如果当前索引存在于其子级中，则处理状态。
//					if(aChildrenIndex.indexOf(index) > -1) {
//						// 判断当前是否为展开的。
//						jATr.push(jTr);
//						
//						// 只有展开时处理，有的节点是不需展示，隐藏都可以隐藏。
//						if(jArrow.hasClass("actived")) {
//							// 当前及其子级是隐藏的。
//							aFilterIndex = aFilterIndex.concat(_that.getChildrenIndexArrByParentIndex(index));
//						}
//						
//						if(bCollapsed) {
//							jTr.fadeOut(500);
//						}else {
//							// 显示的判断。
//							if(aFilterIndex.indexOf(index) < 0) {
//								jTr.fadeIn(500);
//							}
//						}
//					}
//				});
				
				// 内容展开或折叠。
				if(bCollapsed) {
					jList.slideUp();
				}else {
					jList.slideDown();
				}
				
				jAllIcon.toggleClass("actived");		// jIcon
			},
			// 创建表格。
			createTable(aData) {
				console.log(aData)
			},
			// 获取时间轴的数据类型。
			getTimeLineTypeInfo(sType) {
				var oReturn = {};
				
				switch(sType) {
					// 出库。
					case "1":
						oReturn = {
							color: "yellow",
							text: "出库",
							type: "1"
						};
						break;
					// 入库。
					case "2":
						oReturn = {
							color: "yellow",
							text: "入库",
							type: "1"
						};
						break;
					// 投入。
					case　"3":
						oReturn = {
							color: "green",
							text: "投入",
							type: "2"
						};
						break;
					// 产出。
					case "4":
						oReturn = {
							color: "green",
							text: "产出",
							type: "2"
						};
						break;
					// 送检。
					case "5":
						oReturn = {
							color: "red",
							text: "送检",
							type: "3"
						};
						break;
					// 质检。
					case "6":
						oReturn = {
							color: "red",
							text: "质检",
							type: "3"
						};
						break;
				}
				
				// 返回数据。
				return oReturn;
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
					jTableClone = $(".resume-table-clone"),
					sFileName = "",
					jNow = null,
					isTable = false;
				
				 if(this.sCurrentTab === "tables"){
				 	// 表格。
				 	jClone.html(jTableClone.html());
				 	sFileName = "BOM表格";
				 	jNow = jClone;
				 	isTable = true;
				 }else {
				 	// 时间轴。
				 	jClone.html(jTimeLine.html());
				 	sFileName = "时间轴";
					jNow = jClone;
				 }
					
				// 时间轴。
				html2canvas(jNow.get(0),{
					height: jNow.outerHeight(true) + 100,
					background: isTable?"#fff":"#1d272f",
					onrendered:function(canvas) {
						var sImg = canvas.toDataURL("image/png");
							
						jDown.attr({
							"href":sImg,
							"download": sFileName +".png"
						}).get(0).click()
						// 重置复制内容。
						jClone.html("");
					}
				});
			},
			// 打印功能。。
			onPrintHandler() {
				var jDown = $("#downloadImage"),
					jTimeLine = $(".time-line-content"),
					jClone = $(".clone"),
					jTableClone = $(".resume-table-clone"),
					jNow = null,
					isTable = false;
					
				if(this.sCurrentTab === "tables"){
				 	// 表格。
				 	isTable = true;
				 	jClone.html(jTableClone.html());
				 	jNow = jClone;
				}else {
				 	// 时间轴。
				 	jClone.html(jTimeLine.html());
					jNow = jClone;
				}
				
				
				// 时间轴。
				window.Rt.utils.printHtml(html2canvas, jNow.get(0),{
					height: jNow.outerHeight(true) + 200,
					background: isTable?"#fff":"#1d272f"
                },true);
			}
		}
		
	}
	
</script>
    					
<style lang="less">
	@green: #42af8f;
	@blue: #0099ff;
	@yellow: #fcc433;
	@red: #e86b59;
	@inVent: #00a656;
	
	body {
		background-color: #f2f2f2;
		font-size: 14px;
		overflow: hidden;
	}
	
	.el-button--text {
		border: 1px solid #42af8f;
		padding: 10px 15px;
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
	
	.domDown {
		position: absolute;
		z-index: 0;
	}
	.clone {
		position: absolute;
		z-index: -1;
		/*padding: 0 20px;*/
		
		.isVis {
			// 不显示占位符. - 的话打印会错位
			color: transparent;
			/*visibility: hidden;*/
		}
		
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
							
							.isVis {
								/*visibility: hidden;*/
								color: transparent;
								
								&::selection {
									color: transparent;
								}
							}
							
							.cell-content {
								line-height: 40px;
							}
							
							.icon-down {
									transition: transfrom 1s linear;
									
								&.actived {
									transform: rotate(-180deg);
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
					}
				}
			}
		}
						
		
	}
	
</style>
