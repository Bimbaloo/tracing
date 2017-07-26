<template>
	<div id="app">
		<v-header></v-header>
		<div class="panel">
			<div class='panel-title'>
				<el-tabs element-loading-text="拼命加载中"  class="search-tab" >
					<el-tab-pane label="新建遏制"  activeName="first">
						<el-radio-group v-model="radioa">
							<div class='radio'>
								<el-radio :label="radio.key" v-for="radio in radioList">{{radio.groupName}}</el-radio>
							</div>
							<el-form :inline="true" ref="radio.ruleForm" :model="radio.ruleForm"  :class="[{ hide: radioa === radio.key }, 'demo-form-inline','form-inline']" v-for="radio in radioList">
								 <el-form-item v-for="item in radio.groupItems" :label="item.placeholder">
									 <component :is="`v-${item.type}`" :form-data="radio.ruleForm" :placeholder-data="item.placeholder" :key-data="item.itemCode"></component>  
								</el-form-item> 
								<el-form-item>
									<el-button type="primary" class='btn' @click="submitForm(radio.ruleForm)">查询</el-button>
								</el-form-item>
							</el-form>
						</el-radio-group>
					</el-tab-pane>
					<el-tab-pane label="遏制列表" activeName="second">遏制列表</el-tab-pane>
				</el-tabs>
			</div>
			<div class="panel-content">
				
			</div>
		</div>
	</div>
</template>


<script>
	import header from "components/header/header.vue"

	import Input from 'components/basic/input.vue'
    import Select from 'components/basic/select.vue'
    import DateTime from 'components/basic/dateTime.vue'

	
	export default {
		// 页面组件。
		components: {
			"v-header": header,
			'v-input': Input,
            'v-select': Select,
            'v-datetime': DateTime
		},
		// 页面数据。
		data() {
			return {
				radioList:[{
					key:'1',
					groupName:'物料',
					groupItems: [
                        {
                            itemCode: "materialCode",
							itemName: "物料",
							type: "select",
							placeholder:"请选择物料"
                        },
                        {
                            itemCode: "batchNo",
							itemName: "批次",
							type: "input",
							placeholder:"请输入批次"
                        }
					],
					ruleForm:{
						materialCode:'',
						batchNo:''
					}
				},
				{
					key:'2',
					groupName:'设备',
					groupItems: [
                        {
                            itemCode: "personCode",
							itemName: "人员",
							type: "select",
							placeholder:"请选择人员"
                        },
                        {
                            itemCode: "startTime",
							itemName: "开始时间",
							type: "datetime",
							placeholder:"请选择开始时间"
                        },
                        {
                            itemCode: "endTime",
							itemName: "结束时间",
							type: "datetime",
							placeholder:"请选择结束时间"
                        }
					],
					ruleForm:{
						personCode:'',
						startTime:'',
						endTime:''
					}
				}],

				activeName: 'first',
				radioa: '1'
				
			}
		},
		// 计算属性。
		computed: {
            ruleForms: function() {
                let oFormData = {};
                this.items.forEach(o => {
                	oFormData[o.key] = this.active.keys[o.key] || '';
                });
                return oFormData;
            },
            rules: function() {
            	// 验证条码。
            	let _that = this,
            		oForm = this.ruleForm,
            		oKeys = this.keys,
            		// 溯源及追踪的参数。
            		aParams = ["barcode","materialCode","equipmentCode","doCode"],
            		// 验证条码
	            	validateBarcode = (rule, value, callback) => {
	            		if(!value) {
	            			callback(new Error("请输入条码"));
	            		}else {
	            			callback();
	            		}
	            	},
	            	// 验证批次。
	            	validateBatch = (rule, value, callback) => {
	            		if(!value) {
	            			callback(new Error("请输入批次"));
	            		}else {
	            			callback();
	            		}
	            	},
	            	// 验证物料。
	            	validateMaterialcode = (rule, value, callback) => {
	            		if(!value) {
	            			callback(new Error("请输入物料"));
	            		}else {
	            			callback();
	            		}
	            	},
            		// 验证开始时间。
            	    validateStartTime = (rule, value, callback) => {
	            		if(!value) {
	            			callback(new Error("请输入开始时间"));
	            		}else {
	            			callback();
	            		}
	            	},
            		// 验证结束时间。
            		validateEndTime = (rule, value, callback) => {
	            		let sStart = oForm.startTime;
	            		if(!value) {
	            			callback(new Error("请输入结束时间"));
	            		}else if(sStart && sStart > value) {
	            			// 如果开始时间存在，而且开始时间大于结束时间。
	            			callback(new Error("结束时间必须大于开始时间"));
	            		}else {
	            			callback();
	            		}
	            	};
	            	
	            // 验证是否存在
	            var validateParam = (rule, value, callback) => {
	            	// 当前筛选条件中需判断的参数。
	            	let oJudge = {},
	            		aJudgeName = [];
	            	
	            	// 循环处理。
	            	for (let param in oKeys) {
	            		// 当前参数存在。
	            		if(aParams.includes(param)) {
	            			oJudge[param] = oForm[param];
	            			aJudgeName.push(_that.getNameByKey(param));
	            		}
	            	}
	            	
	            	// 如果judge的参数中所有的都为空。则提示
	            	if(window.Rt.utils.getObjectValues(oJudge).some(o=>o)) {
	            		// 只要一个有数据。
	            		callback();
	            	}else {
	            		// 否则。
	            		callback(new Error(aJudgeName.join(",")+(aJudgeName.length == 1?"不能为空":"必填其中一项")));
	            	}
	            	
	            },
	            // 结束时间。
	            validateTime = (rule, value, callback) => {
	            	if(value && oForm.startTime && value < oForm.startTime) {
	            		// 开始时间和结束时间都存在,且结束时间小。
	            		callback(new Error("结束时间要大于开始时间"));
	            	}else {
	            		callback();
	            	}
	            };
            	
            	// 所有规则。
            	var oAllRules =  {
            		// 查出库。
            		"stock": {
	                	"barcode": [{validator: validateBarcode, trigger: "change"}],
	                	"batchNo": [{validator: validateBatch,trigger: "change"}],
	                	"materialCode": [{validator: validateMaterialcode,trigger: "change"}],
	                	// 开始时间。
	                	"startTime": [{validator: validateStartTime, trigger: "change"}],
	                	// 结束时间。
	                	"endTime": [{validator: validateEndTime, trigger: "change"}]
            		},
            		// 溯源。
            		"trace": {
            			"barcode": [{validator: validateParam, trigger: "change"}],
            			"materialCode": [{validator: validateParam, trigger: "change"}],
            			"equipmentCode": [{validator: validateParam, trigger: "change"}],
            			"doCode": [{validator: validateParam, trigger: "change"}],
            			// 结束时间。
            			"endTime": [{validator: validateTime, trigger: "change"}]
            		},
            		// 追踪。
            		"track": {
            			"barcode": [{validator: validateParam,trigger: "change"}],
            			"materialCode": [{validator: validateParam,trigger: "change"}],
            			"equipmentCode": [{validator: validateParam,trigger: "change"}],
            			"doCode": [{validator: validateParam,trigger: "change"}],
            			// 结束时间。
            			"endTime": [{validator: validateTime, trigger: "change"}]
            		},
            		// 履历。
            		"resume": {
            			"barcode": [{validator: validateBarcode, trigger: "change"}]
            		}
                };
                
            	// 根据当前配的返回对应的规则。
            	let oRule = {};
				for(let key in this.keys) {
					if(oAllRules[this.tab][key]) {
						oRule[key] = oAllRules[this.tab][key];
					}
				}
				
				// 为了将页面中*都不存在。
                return oRule;
            }
        },
		// 创建时处理。mounted
		created() {},
		// 页面方法。
		methods: {
			submitForm(formName) {
                console.log(formName)
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

		.panel {
			padding: 20px;
    		box-sizing: border-box;
			.panel-title {
				background-color: #fff;
				.el-radio-group {
					display:block;
					text-align: left;
					.radio {
						margin-bottom:15px;
					}
					.form-inline {
						border-bottom:1px solid #ccc
					}
				}
			}
			.el-form-item {
				margin-right: 40px;
				.el-select>.el-input {
					width:180px;
				}
				.btn {
					border-radius: 0;
					width: 80px;
					height: 30px;
					padding: 0;
					box-sizing: border-box;
					font-size: 14px;
				}
			}
			.el-form-item:last-child {
				margin-left:60px;
			}
			
			.panel-content {
				background-color: #fff;
			}
		}
	}
	
</style>

<style lang="less">  
    .el-radio {
        &:hover {
            color: #42af8f;

            .el-radio__inner {
                border-color: #42af8f;
            }  
        }
    }

    .el-radio__inner {
        border: 2px solid #999;
        width: 14px;
        height: 14px;

        &::after {
            background-color: #42af8f;
        }
    }

    .el-radio__input.is-checked .el-radio__inner {
        border-color: #42af8f;
        background: #fff;
    }

    .el-radio__label {
        padding-left: 10px;
    }

    .panel-title {
        text-align: center;
        padding-left: 28px;
        padding-right: 28px;
    }
    .panel-content {
    	overflow: auto;
    	
    	.panel-content-wrap {
    		padding:  0 28px;
    	}
    }
    .hide {
    	display: none;
    }
	.search-tab {
		padding-top: 20px;
		.el-tabs__header {
			border-bottom:none;
			.el-tabs__item {
				border-radius: 0;
				width: 90px;
				height: 30px;
				padding: 0;
				box-sizing: border-box;
				font-size: 14px;
				border: 2px solid #42af8f;
				line-height: 26px;
				margin-right: 20px;
			}
			.el-tabs__active-bar {
				display:none
			}
			.is-active {
				background-color: #42af8f;
				color: #fff;
			}
		}
	}
	
	
</style>