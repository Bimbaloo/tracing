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
						<div class="resume-handler">
							<div class="resume-tabs" v-show="false">
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
						<div v-show="sCurrentTab === 'tables'" class="resume-table">
							<div class="table-title">
								<span class="title-text">xxxxx产品履历</span>
								<span class="title-subText">条码:xxxxxxxx</span>
								<span class="title-subText">批次:xxxxxxxx</span>
							</div>
							<!--:row-style="tableRowStyleName"-->
							<div v-if="oTab.tables.error" :style="{height:getHeight()+'px'}" class="error">
								{{ oTab.tables.error }}
							</div>
							<el-table
								v-else
								class="table-main" 
								:data="aParsedData" 
								:height="getHeight()" 
								stripe
								style="width: 100%;"
								v-loading="oTab.tables.loading"
								element-loading-text="拼命加载中"
								row-class-name="table-item">
								<!-- 工序 -->
								<el-table-column min-width="200px">
									<template scope="props">
										<div :style="{marginLeft:props.row.level*nLevelDis+'px'}">
											<i class="icon-down el-icon-arrow-down" @click.stop="expandOrCollapseTr"></i>
											<span>{{ props.row.name }}</span>
										</div>
										<div class="cell-info" :style="{marginLeft:((props.row.level+1)*nLevelDis+nIconDis)+'px'}">
											<p
												v-for="item in props.row.data"
												:class="{isVis: !item.material_name}"
											>{{ item.material_name || sText }}</p>
										</div>
									</template>
								</el-table-column >
								
								<!-- 类型 type -->
								<el-table-column label="类型" align="center" width="120px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
											<p 
												v-for="item in props.row.data"
												:class="{isVis: !item.type}"
											> {{ item.type || sText }} </p></div>
									</template>
								</el-table-column>
								
								<!-- 时间 time -->
								<el-table-column label="时间" align="center" width="120px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
											<p
												v-for="item in props.row.data"
												:class="{isVis: !item.time}"
											> {{ _parseTimeFormat(item.time) || sText }} </p></div>
									</template>
								</el-table-column>
								
								<!-- 地点 location -->
								<el-table-column label="地点" align="center" width="120px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
											<p 
												v-for="item in props.row.data"
												:class="{isVis: !item.location}"
											> {{ item.location || sText }} </p></div>
									</template>
								</el-table-column>
								
								<!-- 批次 batch_no -->
								<el-table-column label="批次" align="center" width="120px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
											<p 
												v-for="item in props.row.data"
												:class="{isVis: !item.batch_no}"
											> {{ item.batch_no || sText }} </p></div>
									</template>
								</el-table-column>
								
								<!-- 条码 barcode -->
								<el-table-column label="条码" align="center" width="180px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
											<p 
												v-for="item in props.row.data"
												:class="{isVis: !item.barcode}"
											> {{ item.barcode || sText }} </p></div>
									</template>
								</el-table-column>
								
								<!-- 数量 quantity -->
								<el-table-column label="数量" align="center" width="120px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
											<p 
												v-for="item in props.row.data"
												:class="{isVis: !item.quantity}"
											> {{ item.quantity || sText }} </p></div>
									</template>
								</el-table-column>
								
								<!-- 班次 shift -->
								<el-table-column label="班次" align="center" width="120px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
											<p 
												v-for="item in props.row.data"
												:class="{isVis: !item.shift}"
											> {{ item.shift || sText }} </p></div>
									</template>
								</el-table-column>
								
								<!-- 人员 person_name -->
								<el-table-column label="人员" align="center" width="120px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
											<p
												v-for="item in props.row.data"
												:class="{isVis: !item.person_name}"
											> {{ item.person_name || sText }} </p></div>
									</template>
								</el-table-column>
								
								<!-- 模号 mold_code -->
								<el-table-column label="模号" align="center" width="120px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
											<p 
												v-for="item in props.row.data"
												:class="{isVis: !item.mold_code}"
											> {{ item.mold_code || sText }} </p></div>
									</template>
								</el-table-column>
								
								<!-- 供应商/客户 vendor_name -->
								<el-table-column label="供应商/客户" align="center" width="120px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
											<p 
												v-for="item in props.row.data"
												:class="{isVis: !item.vendor_name}"
											>{{ item.vendor_name || sText }} </p></div>
									</template>
								</el-table-column>
								
								<!-- 检验结果 check_result -->
								<el-table-column label="检验结果" align="center" width="120px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
										<p 
											v-for="item in props.row.data"
											:class="{isVis: !item.check_result}"
										> {{ item.check_result || sText }} </p></div>
									</template>
								</el-table-column>
							</el-table>
						</div>
						
						
						<!-- 表格的复制 -->
						<div v-show="false" class="resume-table-clone">
							<div class="table-title">
								<span class="title-text">xxxxx产品履历</span>
								<span class="title-subText">条码:xxxxxxxx</span>
								<span class="title-subText">批次:xxxxxxxx</span>
							</div>
							<el-table 
								class="table-main" 
								:data="aParsedData" 
								stripe
								style="width: 100%;"
								row-class-name="table-item"
							>
								<!-- 工序 -->
								<el-table-column min-width="200px">
									<template scope="props">
										<div :style="{marginLeft:props.row.level*nLevelDis+'px'}">
											<i class="icon-down el-icon-arrow-down" @click.stop="expandOrCollapseTr"></i>
											<span>{{ props.row.name }}</span>
										</div>
										<div class="cell-info" :style="{marginLeft:((props.row.level+1)*nLevelDis+nIconDis)+'px'}">
											<p
												v-for="item in props.row.data"
												:class="{isVis: !item.material_name}"
											>{{ item.material_name || sText }}</p>
										</div>
									</template>
								</el-table-column >
								
								<!-- 类型 type -->
								<el-table-column label="类型" align="center" width="120px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
											<p 
												v-for="item in props.row.data"
												:class="{isVis: !item.type}"
											> {{ item.type || sText }} </p></div>
									</template>
								</el-table-column>
								
								<!-- 时间 time -->
								<el-table-column label="时间" align="center" width="120px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
											<p
												v-for="item in props.row.data"
												:class="{isVis: !item.time}"
											> {{ _parseTimeFormat(item.time) || sText }} </p></div>
									</template>
								</el-table-column>
								
								<!-- 地点 location -->
								<el-table-column label="地点" align="center" width="120px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
											<p 
												v-for="item in props.row.data"
												:class="{isVis: !item.location}"
											> {{ item.location || sText }} </p></div>
									</template>
								</el-table-column>
								
								<!-- 批次 batch_no -->
								<el-table-column label="批次" align="center" width="120px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
											<p 
												v-for="item in props.row.data"
												:class="{isVis: !item.batch_no}"
											> {{ item.batch_no || sText }} </p></div>
									</template>
								</el-table-column>
								
								<!-- 条码 barcode -->
								<el-table-column label="条码" align="center" width="180px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
											<p 
												v-for="item in props.row.data"
												:class="{isVis: !item.barcode}"
											> {{ item.barcode || sText }} </p></div>
									</template>
								</el-table-column>
								
								<!-- 数量 quantity -->
								<el-table-column label="数量" align="center" width="120px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
											<p 
												v-for="item in props.row.data"
												:class="{isVis: !item.quantity}"
											> {{ item.quantity || sText }} </p></div>
									</template>
								</el-table-column>
								
								<!-- 班次 shift -->
								<el-table-column label="班次" align="center" width="120px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
											<p 
												v-for="item in props.row.data"
												:class="{isVis: !item.shift}"
											> {{ item.shift || sText }} </p></div>
									</template>
								</el-table-column>
								
								<!-- 人员 person_name -->
								<el-table-column label="人员" align="center" width="120px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
											<p
												v-for="item in props.row.data"
												:class="{isVis: !item.person_name}"
											> {{ item.person_name || sText }} </p></div>
									</template>
								</el-table-column>
								
								<!-- 模号 mold_code -->
								<el-table-column label="模号" align="center" width="120px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
											<p 
												v-for="item in props.row.data"
												:class="{isVis: !item.mold_code}"
											> {{ item.mold_code || sText }} </p></div>
									</template>
								</el-table-column>
								
								<!-- 供应商/客户 vendor_name -->
								<el-table-column label="供应商/客户" align="center" width="120px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
											<p 
												v-for="item in props.row.data"
												:class="{isVis: !item.vendor_name}"
											>{{ item.vendor_name || sText }} </p></div>
									</template>
								</el-table-column>
								
								<!-- 检验结果 check_result -->
								<el-table-column label="检验结果" align="center" width="120px">
									<template scope="props">
										<div class="isVis">{{ sText }}</div>
										<div class="cell-info">
										<p 
											v-for="item in props.row.data"
											:class="{isVis: !item.check_result}"
										> {{ item.check_result || sText }} </p></div>
									</template>
								</el-table-column>
							</el-table>
						</div>
						
						<!-- 时间轴 -->
						<div 
							v-loading="oTab.lines.loading"
							element-loading-text="拼命加载中"
							v-show="sCurrentTab === 'lines'" class="resume-timeLine" :style="{height:getHeight()+'px'}">
							
							<div v-if="oTab.lines.error" class="error">
								{{ oTab.lines.error }}
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
														<span class="tips">{{ item.personName }}</span> 将条码
														<span class="tips">{{ item.barcode }}</span> ，批次
														<span class="tips">{{ item.batchNo }}</span> 的
														<span class="tips">{{ item.materialName }}</span>
														<span class="tips">{{ item.quantity }}</span> 件，入库到
														<span class="tips">{{ item.warehouse }}</span>
														<span class="tips">{{ item.reservoir }}</span>
													</div>
												</div>
												<div class="sub-item" v-else-if="getTimeLineTypeInfo(item.type).type==2">
													<div class="item-type">{{ item.processName+getTimeLineTypeInfo(item.type).text }} :</div>
													<div class="item-info">
														<span class="tips">{{ item.personName }}</span> 在
														<span class="tips">{{ item.equipmentName }}</span> 上将条码
														<span class="tips">{{ item.barcode }}</span> ，批次
														<span class="tips">{{ item.batchNo }}</span> 的
														<span class="tips">{{ item.materialName }}</span>
														{{ getTimeLineTypeInfo(item.type).text }}
													</div>
												</div>
												<div class="sub-item" v-else>
													<div class="item-type">{{ getTimeLineTypeInfo(item.type).text }} :</div>
													<div class="item-info">
														<span class="tips">{{ item.personName }}</span> 将条码
														<span class="tips">{{ item.barcode }}</span> ，批次
														<span class="tips">{{ item.batchNo }}</span> ，在
														<span class="tips">{{ item.equipmentName }}</span> 上产出
														<span class="tips">{{ item.materialName }}</span> 物料，共计
														<span class="tips">{{ item.quantity }}</span> 件，结果为
														<span class="tips">{{ item.checkResult }}</span>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div v-show="false" class="time-line-content-clone">
								<div 
									class="time-line-wrap"
									v-for="(timeItem, index) in aoTimeLineData">
									
									<div class="line-item">
										<span class="item-date">{{ timeItem.date }}</span>
										<div class="item-node" :class="{bigSize:!index}"><v-node :is-border="false" :class="{bigSize:!index}" color-type="blue"></v-node></div>
										<span class="item-title" v-if="!index">产品履历</span>
									</div>
									<div class="item-line"></div>
									<div class="line-list">
										<div class="list-sub" :class="{first:!itemIndex}"
											v-for="(item,itemIndex) in timeItem.resumes">
											<div v-show="!(index==aoTimeLineData.length-1&&itemIndex==timeItem.resumes.length-1)" class="node-line"></div>
											<span class="sub-date" :class="{last:index==aoTimeLineData.length-1&&itemIndex==timeItem.resumes.length-1}">{{ new Date(item.time).Format("hh:mm:ss") }}</span>
											<div class="sub-node">
												<v-node :is-border="false" :color-type="getTimeLineTypeInfo(item.type).color"></v-node>
											</div>
											<div class="sub-info" :class="getTimeLineTypeInfo(item.type).color">
												<div class="sub-item" v-if="getTimeLineTypeInfo(item.type).type==1">
													<div class="item-type">{{getTimeLineTypeInfo(item.type).text}} :</div>
													<div class="item-info">
														<span class="tips">{{ item.personName }}</span> 将条码
														<span class="tips">{{ item.barcode }}</span> ,批次
														<span class="tips">{{ item.batchNo }}</span> 的
														<span class="tips">{{ item.materialName }}</span>
														<span class="tips">{{ item.quantity }}</span> 件,入库到
														<span class="tips">{{ item.warehouse }}</span>
														<span class="tips">{{ item.reservoir }}</span>
													</div>
												</div>
												<div class="sub-item" v-else-if="getTimeLineTypeInfo(item.type).type==2">
													<div class="item-type">{{ item.processName+getTimeLineTypeInfo(item.type).text }} :</div>
													<div class="item-info">
														<span class="tips">{{ item.personName }}</span> 在
														<span class="tips">{{ item.equipmentName }}</span> 上将条码
														<span class="tips">{{ item.barcode }}</span> ,批次
														<span class="tips">{{ item.batchNo }}</span> 的
														<span class="tips">{{ item.materialName }}</span>
														{{ getTimeLineTypeInfo(item.type).text }}
													</div>
												</div>
												<div class="sub-item" v-else>
													<div class="item-type">{{ getTimeLineTypeInfo(item.type).text }} :</div>
													<div class="item-info">
														<span class="tips">{{ item.personName }}</span> 将条码
														<span class="tips">{{ item.barcode }}</span> ,批次
														<span class="tips">{{ item.batchNo }}</span> ,在
														<span class="tips">{{ item.equipmentName }}</span> 上产出
														<span class="tips">{{ item.materialName }}</span> 物料,共计
														<span class="tips">{{ item.quantity }}</span> 件,结果为
														<span class="tips">{{ item.result }}</span>
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
        	var validateBarcode = (rule, value, callback) => {
        		if(!value) {
        			callback(new Error("请输入条码或扫码"));
        		}else {
        			callback();
        		}
        	};
			return {
				// 默认测试数据。
				sText: "a",
				// 默认工序层级的间距。
				nLevelDis: 10,
				// 工序收缩图标宽度
				nIconDis: 14,
				// 是否全屏显示。
				bFullScreen: bFull,
				// 变量是否点击过查询。
				bSubmit: bFull?true:false,
				// 查询搜索值。
				ruleForm: {
					barcode: ""
				},
				// 当前tab值。
				sCurrentTab: "lines",
				// 当前表格中的数据。
				aoTable: [],
				// 创建表格数据，处理后的数据。
				aParsedData: [],
				// 当前时间轴数据。
				aoTimeLineData: [],
				// 类型。
				oTab: {
					"tables": {
						url: "static/resume_demo.json",
						bCreated: false,
						loading: false,
						error: ""
					},
					"lines": {
						url: HOST + "/api/v1/resume/timeline",
//						url: "static/resume_timeLine.json",
						bCreated: false,
						loading: false,
						error: ""
					}
				},
				// 规则。
				rules: {
					barcode: [
						{validator: validateBarcode,trigger: "blur"}
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
			let oData = sessionStorage.getItem("searchConditions");

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
		    }
		    
			// 如果是全屏，则默认创建。
//			if(this.bFullScreen) {
//				this.getPageData();
//			}
			// 默认查询。--- created()
			this.getPageData();
//			this.submitForm('ruleForm')
		},
		// 页面方法。
		methods: {
			// 初始化数据。
			initData() {
				// 当前表格中的数据。
				this.aoTable = [];
				// 创建表格数据，处理后的数据。
				this.aParsedData = [];
				// 当前时间轴数据。
				this.aoTimeLineData = [];
				// 默认都未创建。
				this.oTab.tables.bCreated = false;
				this.oTab.tables.loading = false;
				this.oTab.tables.error = "";
				this.oTab.lines.bCreated = false;
				this.oTab.lines.loading = false;
				this.oTab.lines.error = "";
			},
			// 获取页面的高度。
			getHeight() {
				var nHeight = window.document.documentElement.clientHeight,
					jWrap = $(".resume-content-wrap"),
					jForm = $(".filters"),
					jLine = $(".line"),
					nReturnHeight = 0;
				
				nReturnHeight = nHeight
							- (this.bFullScreen?0:$("header").outerHeight(true))
							-  (jWrap.outerHeight(true) - jWrap.height())
							- (this.bFullScreen?0:jForm.outerHeight(true))
							- (this.bFullScreen?0:jLine.outerHeight(true))
							- ($(".resume-main").outerHeight(true) - $(".resume-main").height())
							- $(".resume-handler").outerHeight(true)
							- 20;
				// 返回数据。
				return nReturnHeight;
			},
			// 查询操作处理 函数。
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if (valid) {
						// 重置数据。----
						this.initData();
//						this.bSubmit = true;
						
						// 更新form中的值。--直接设置值。
//						let oData = sessionStorage.getItem("searchConditions");
//
//						// 履历模块。
//					    if(oData) {
//					        oData = JSON.parse(oData);
//					        if(oData.tab === "resume") {
//						        oData.keys.barcode = this.ruleForm.barcode;
//						        sessionStorage.setItem("searchConditions", JSON.stringify(oData));
//					        }
//					    }
						
						// 根据当前tab类型创建数据。
						this.getPageData();
					}
				});
			},
			// 修改页面中的显示tab。
			changeTab(sTab) {
				// 修改当前的tab值。
				let _that = this,
					sCurrent = _that.sCurrentTab;
				if(sTab != sCurrent) {
					// 当前是切换。
					_that.sCurrentTab = sTab;
					
					// 初始化数据处理
					this.getPageData();
				}
			},
			// 获取数据。
			getPageData() {
				// 获取数据。-- 根据当前显示的tab创建数据。
				this.oTab[this.sCurrentTab].loading = true;
				this.oTab[this.sCurrentTab].error = "";
				
				if(!this.oTab[this.sCurrentTab].bCreated) { // && this.bSubmit
					this.$ajax.post(this.oTab[this.sCurrentTab].url, this.ruleForm).then((res) => {
						this.oTab[this.sCurrentTab].loading = false;
						// 设置为已创建。
					    this.oTab[this.sCurrentTab].bCreated = true;
					    
						if(!res.data.errorCode) {
							// 保存数据。
							if(this.sCurrentTab == "tables") {
							    this.aoTable =res.data.data;
							    this.aParsedData = this.parseTableData();
							}else {
								this.aoTimeLineData =res.data.data;
							}
						}else {
						    // 根据errorCode 错误时设置。error
							this.oTab[this.sCurrentTab].error = res.data.errorMsg.message;
						}
						
					    
				    }).catch((err)=> {
				    	this.oTab[this.sCurrentTab].loading = false;
						this.oTab[this.sCurrentTab].error = "查询出错";
				    });
				}else {
					this.oTab[this.sCurrentTab].loading = false;
				}
			},
			// 表格数据转换成可用于创建的数据。
			parseTableData() {
				var	_that = this,
				    aoNew = [];
				
				_getData("", 0);
				
				// [{name,parent,data,level}]
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
							aoNew.push({
								name: oData.name,
								parent: oData.parent,
								data: oData.data,
								level: nLevel
							});
							// 循环获取数据。
							_getData(oData.name,nLevel+1);
						});
					}
					
				}
			},
			// 获取元素的当前子节点数据。
		    _getTableChildDataById(sId) {
				var _that = this,
					aResult = [];
					
				// 遍历数据。
				aResult = _that.aoTable.filter(function(oData) {
					return oData.parent == sId;
				});
				
				// 返回数据。
				return aResult;
			},
			// 将时间数据转换为页面显示格式的值。
			_parseTimeFormat(sTime) {
				//2016-12-21 13:30:25
				let sResult = "";
				if(sTime) {
					sResult = new Date(sTime).Format("MM-dd hh:mm");	
				}
//				let nFirstIndex = sTime.indexOf("-"),
//					nLastIndex = sTime.lastIndexOf(":"),
//					sResult = "";
//				
//				// 如果存在。
//				if(nFirstIndex >-1 && nLastIndex>-1) {
//					sResult = sTime.substring(nFirstIndex+1,nLastIndex);
//				}
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
					// 图表。
					jIcon = jItem.find(".icon-down"),
					// 数据列表。
					jList = jItem.find(".cell .cell-info"),
					// 当前行的索引值。
					nIndex = jItem.index(),
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
				jItem.parent("tbody").find("tr.table-item").each(function(index) {
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
				});
				
				// 内容展开或折叠。
				if(bCollapsed) {
					jList.slideUp();
				}else {
					jList.slideDown();
				}
				
				jIcon.toggleClass("actived");
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
				window.open("resume.html?barcode="+this.ruleForm.barcode+"#full");
			},
			// 下载功能。
			onDownLoadHandler() {
				var jDown = $("#downloadImage"),
					jTimeLine = $(".time-line-content"),
					jClone = $(".clone"),
					jTableClone = $(".resume-table-clone"),
					jNow = null;
				
				 if(this.sCurrentTab === "tables"){
				 	// 表格。
				 	jClone.html(jTableClone.html());
				 	jNow = jClone;
				 }else {
				 	// 时间轴。
				 	jClone.html($(".time-line-content-clone").html());
//				 	jNow = jTimeLine;
					jNow = jClone;
				 }
					
				// 时间轴。
				html2canvas(jNow.get(0),{
					height: jNow.outerHeight(true) + 100,
					background: "#1d272f",
					onrendered:function(canvas) {
						var sImg = canvas.toDataURL("image/png");
							
						jDown.attr({
							"href":sImg,
							"download": new Date().getTime() +".png"
						}).get(0).click()
						// 重置复制内容。
						jClone.html("");
					}
				});
			},
			// 打印功能。。
			onPrintHandler() {
//				alert("打印。");
				
				var jDown = $("#downloadImage"),
					jTimeLine = $(".time-line-content"),
					jClone = $(".clone"),
					jTableClone = $(".resume-table-clone"),
					jNow = null;
					
				 if(this.sCurrentTab === "tables"){
				 	// 表格。
				 	jClone.html(jTableClone.html());
				 	jNow = jClone;
				 }else {
				 	// 时间轴。
				 	jClone.html($(".time-line-content-clone").html());
//				 	jNow = jTimeLine;
					jNow = jClone;
				 }
					
				// 时间轴。
				html2canvas(jNow.get(0),{
					height: jNow.outerHeight(true) + 100,
					background: "#1d272f",
					onrendered:function(canvas) {
						var sImg = canvas.toDataURL("image/png");
							
						// 打印
						var w = window.open("about:blank","image from cancas");
						w.document.write("<img src='"+sImg+"' alt='from canvas'>")
					
						setTimeout(function() {
							w.print();
							
							w.close();
						},200)
						// 重置复制内容。
						jClone.html("");
					}
				});
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
	
	.el-icon-upload2 {
		transform: rotate(180deg);
	}
	
	.domDown {
		position: absolute;
		z-index: 0;
	}
	.clone {
		position: absolute;
		z-index: -1;
		
		.isVis {
			visibility: hidden;
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
						.resume-tabs {}
						.resume-icons {
							text-align: right;
							/*margin-top: -26px;*/
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
							margin: -25px 25px 25px;
							
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
								visibility: hidden;
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
						margin-top: 25px;
						color: #FFFFFF;
						/*height: 730px;*/
						overflow: auto;
						
						.time-line-content,
						.time-line-content-clone {
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