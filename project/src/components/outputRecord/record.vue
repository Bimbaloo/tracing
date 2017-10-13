<template>
	
	<div class="output-main">
		<i v-if="!pageSize" class="open-icon icon icon-16 icon-openNew" @click="openNewPage"></i>
		<div class="output-filter" ref="outputFilter">
			<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-position="right" label-width="80px">
				<el-form-item :label="item.label" :prop="item.key" v-for="item in aFilter" :key="item.key"> 
	            	<component :style="{width: pageSize?'400px':'auto'}" :is="`v-${item.type}`" :form-data="ruleForm" :placeholder-data="item.placeholder" :key-data="item.key" :all-data="multiAll" :all-data-label="multiAllLabel" :get-by-ajax="item.ajax" :list-data="item.value"></component> 
		        </el-form-item>
		        <el-form-item>
		            <!--<el-button class="btn" type="primary" @click="submitForm('ruleForm')">查询</el-button>-->
					<v-button class="btn" text-data="查询" @query="submitForm('ruleForm')"></v-button>
		        </el-form-item>
			</el-form>
			<div v-if="pageSize" class="line"></div>
		</div>
		<div class="output-content">
			<!-- 详细信息 -->
			<div v-if="pageSize" class="item-info" ref="outputTitle">
				<div class="item-title">产出记录</div>
			</div>
			<div v-if="outputData.error" class="error">
				{{ outputData.error }}
			</div>
			<div v-else class="content-table" ref="instockTable">
				<v-table :table-data="outputData" :heights="outputData.height" :loading="outputData.loading"></v-table>
			</div>
		</div>
	</div>
	
</template>

<script>
	import Select from "components/basic/select.vue"
	import MultiSelect from "components/basic/multiSelect.vue"
	import Button from "components/basic/button.vue"
	import DateTime from "components/basic/dateTime.vue"
	import table from "components/basic/table.vue"
	
	import fnP from "assets/js/public.js"
	
	const sMultiValue = "全部";	// all
	const sMultiLabel = "全部"
	
	export default {
		props: {
			// 当前显示的位置。 false-弹窗 true-页面
			pageSize: {
				type: Boolean,
				default: false
			},
			pageHeight: {
				required: false
			}
		},
		components: {
    		"v-select": Select,
    		"v-dateTime": DateTime,
    		"v-button": Button,
    		"v-multiSelect": MultiSelect,
    		"v-table": table
		},
		data() {
			return {
				// filter参数列表。
				aFilter: [{
					key: "processCodeList",
					type: "multiSelect",
					label: "工序",
					placeholder: "请选择工序",
					ajax: true
				}, {
					key: "materialCodeList",
					type: "multiSelect",
					label: "物料",
					placeholder: "请选择物料",
					ajax: true
				}, {
					key: "equipmentCodeList",
					type: "multiSelect",
					label: "设备",
					placeholder: "请选择设备",
					ajax: true
				}, {
					key: "startTime",
					type: "dateTime",
					label: "开始时间",
					placeholder: "请选择开始时间"
				}, {
					key: "endTime",
					type: "dateTime",
					label: "结束时间",
					placeholder: "请选择结束时间"
				}, {
					key: "num",
					type: "select",
					label: "记录数",
					placeholder: "请选择显示数量",
					ajax: false,
					value: [{
						value: "100",
						label: "100"
					}, {
						value: "200",
						label: "200"
					}, {
						value: "300",
						label: "300"
					}, {
						value: "400",
						label: "400"
					}, {
						value: "500",
						label: "500"
					}]
				}],
				multiAll: sMultiValue,
				multiAllLabel: sMultiLabel,
				ruleForm: {
					materialCodeList: [sMultiValue],
					equipmentCodeList: [sMultiValue],
					processCodeList: [sMultiValue],
					startTime: "",
					endTime: "",
					num: "100"
				},
				// 是否自动查询
				bAutoSearch: false,
				outputData: {
					url: HOST + "/api/v1/trace/out/latest-info",
					loading: false,
					error: null,
					height: 400,
					columns: [{
						prop: "happenTime",
						name: "时间",
						width: 160
					}, {
						prop: "barcode",
						name: "条码"
					}, {
						prop: "materialName",
						name: "物料",
						formatter: function(row, column, cellValue) {
							return row.materialCode + ":" + row.materialName
						},
						width: 200
					}, {
						prop: "batchNo",
						name: "批次"
					}, {
						prop: "processName",
						name: "工序",
						formatter: function(row, column, cellValue) {
							return row.processCode + ":" + row.processName
						}
					}, {
						prop: "equipmentName",
						name: "设备",
						formatter: function(row, column, cellValue) {
							return row.equipmentCode + ":" + row.equipmentName
						}
					}, {
						prop: "shiftName",
						name: "班次"
					}, {
						prop: "personName",
						name:"人员",
						formatter: function(row, column, cellValue) {
							return row.personCode + ":" + row.personName
						}
					}, {
						prop: "quantity",
						name: "数量",
						width:　50
					}, {
						prop: "quality",
						name: "质量",
						width: 50
					}],
					data: []
				}
			}
		},
		created() {
			// 获取参数。
			let tag = window.Rt.utils.getParam("tag", location.search);
		
			if(tag) {
				let	oData = sessionStorage.getItem("outputDataSearchCondition-" + tag);
				if(oData) {
					this.bAutoSearch = true;
					this.ruleForm = JSON.parse(oData)
				}
			}
		},
		mounted() {
			this.outputData.height = this.adjustHeight()
			
			// 是否自动查询
			this.bAutoSearch && this.submitForm('ruleForm')
		},
		watch: {
			pageHeight: function() {
				this.outputData.height = this.adjustHeight() - 40
			}
		},
		computed: {
			rules: function() {
				var oForm = this.ruleForm,
				// 验证物料。
            	validateMaterialcode = (rule, value, callback) => {
            		if(!(value && value.length)) {
            			callback(new Error("请选择物料"));
            		}else {
            			callback();
            		}
            	},
            	// 验证工序。
            	validateProcesscode = (rule, value, callback) => {
            		if(!(value && value.length)) {
            			callback(new Error("请选择工序"));
            		}else {
            			callback();
            		}
            	},
            	// 验证设备。
            	validateEquipmentcode = (rule, value, callback) => {
            		if(!(value && value.length)) {
            			callback(new Error("请选择设备"));
            		}else {
            			callback();
            		}
            	},
				validateStart = (rule, value, callback) => {
	            	let sTime = value.trim(),
	            		bIsFormat = window.Rt.utils.isDateTime(sTime),
        	    		nNow = +new Date();
        	    	
        	    	if(sTime) {
	            		if(!bIsFormat) {
	            			callback(new Error("请输入正确的时间格式"));
	            		}else if(+new Date(value) > nNow) {
	            			callback(new Error("时间不能超过当前时间"));
	            		}else {
	            			callback();
	            		}
        	    	}else {
	            		callback();
	            	}
	            },
	            // 结束时间。
	            validateTime = (rule, value, callback) => {
	            	let sStart = oForm.startTime,
	            		sTime = value.trim(),
            			bIsFormat = window.Rt.utils.isDateTime(sTime),
            			bIsStartFormat = window.Rt.utils.isDateTime(sStart),
        	    		nNow = +new Date();
					
        	    	if(sTime) {
						// 存在时间。
	        	    	if(!bIsFormat) {
	            			callback(new Error("请输入正确的时间格式"));
	            		}else if(+new Date(sTime) > nNow) {
	            			callback(new Error("时间不能超过当前时间"));
	            		}else if(bIsStartFormat && +new Date(sStart) > +new Date(sTime)) {
	            			// 如果开始时间存在，而且开始时间大于结束时间。
	            			callback(new Error("结束时间必须大于开始时间"));
	            		}else {
	            			callback();
	            		}
        	    	}else {
        	    		callback();
        	    	}
	            },
	            validateNum = (rule, value, callback) => {
	            	if(!value) {
            			callback(new Error("请选择记录数"));
            		}else {
            			callback();
            		}	
	            };
	            
				return {
					"materialCodeList": [{validator: validateMaterialcode, trigger: "change"}],
            		"equipmentCodeList": [{validator: validateEquipmentcode, trigger: "change"}],
            		"processCodeList": [{validator: validateProcesscode, trigger: "change"}],
            		"startTime": [{validator: validateStart, trigger: "change"}],
        			// 结束时间。
        			"endTime": [{validator: validateTime, trigger: "change"}],
        			//记录数
        			"num": [{validator: validateNum, trigger: "change"}]
				}
			}
		},
		methods: {
			submitForm(formName) {
				// 提交。
				this.$refs[formName].validate((valid) => {
		          	if (valid) {
		            	// 参数处理。
		            	this.fetchData(this.outputData)
//		            	 console.log(this.getQueryParam())
		          	}
		        });
			},
			adjustHeight() {
				return this.pageHeight - this.$refs.outputFilter.clientHeight - (this.pageSize ? this.$refs.outputTitle.clientHeight + 20:0) - 20
			},
			getQueryParam() {
				let oParam = fnP.parseQueryParam(this.ruleForm)
				
				// 处理全部。
				for(let sParam in oParam) {
					if(oParam[sParam].includes(this.multiAll)) {
						// 全部时，传[]
						oParam[sParam] = []
					}
				}
				
				return oParam 
			},
			fetchData(oData) {
				oData.error = null;
				oData.data = [];
//				oData.height = this.adjustHeight();
				oData.loading = true;

				let sPath = oData.url;

				this.$register.sendRequest(this.$store, this.$ajax, sPath, "post", this.getQueryParam(), (oResult) => {
					// 请求成功。
					oData.loading = false;			
					oData.data = oResult;        
				}, (sErrorMessage) => {
					// 请求失败。
					oData.loading = false;
					oData.error = "查无数据"
					// 提示信息。
					console.log(sErrorMessage);
				}, (err) => {
					// 请求错误。
					oData.loading = false;
					oData.error = "查询出错"
					console.log("接口查询出错。");
				})
			},
			// 打开新页面。
			openNewPage() {
				// 保存数据。
				let sTag = (+new Date()).toString().substr(-5);

          		sessionStorage.setItem('outputDataSearchCondition-' + sTag, JSON.stringify(this.ruleForm));
				// 打开 页面。
				window.open("outputRecord.html?tag="+sTag, "_self");
			}
		}
	}
	
</script>

<style lang="less" scoped>
	
	.output-main {
		.output-filter {
			.el-form-item {
				display: inline-block;
			}
			.line {
				width: 100%;
				height: 1px;
				background-color: #CCCCCC;
			}
		}
		.output-content {
			.item-info {
				margin: 10px 0;
				
				.item-title {
					margin-top: 20px;
					font-size: 16px;
					border-left: solid 4px #42af8f; 
					padding-left: 10px;
				}
			}
			
			.content-table {
				margin: 0;
			}
		}
	}
	
</style>