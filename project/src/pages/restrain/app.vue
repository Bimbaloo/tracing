<template>
	<div id="app">
		<v-header></v-header>
		<div class="panel">
			<div class='panel-title'>
				<el-tabs  element-loading-text="拼命加载中" :rules="rules"  class="search-tab" @tab-click="handleClick">
					<el-tab-pane label="新建遏制"  activeName="first">
						<el-radio-group v-model="radioNumber">
							<div class='radio'>
								<el-radio :label="radio.key" v-for="radio in radioList">{{radio.groupName}}</el-radio>
							</div>
							<el-form :inline="true" ref="radioRuleForm" :model="ruleForm"  :class="[ 'demo-form-inline','form-inline']">
								 <el-form-item v-for="(item,index) in groupItems" :label="item.placeholder" v-show="item.key === radioNumber" :key="groupItems[index].itemCode" :prop="groupItems[index].itemCode">
									 <component :is="`v-${item.type}`" :form-data="ruleForm" :placeholder-data="item.placeholder" :key-data="item.itemCode"></component>  
								</el-form-item> 
								<el-form-item>
									<el-button type="primary" class='btn' @click="submitForm('radioRuleForm')">查询</el-button>
								</el-form-item>
							</el-form>
						</el-radio-group>
					</el-tab-pane>
					<el-tab-pane label="遏制列表" activeName="second">
					</el-tab-pane>
				</el-tabs>
			</div>
			<div class="panel-content">
				<div class="router-container" >
					<router-view></router-view>
				</div>
			</div>
		</div>
	</div>
</template>


<script>
	import header from "components/header/header.vue"

	import Input from 'components/basic/input.vue'
    import Select from 'components/basic/select.vue'
    import DateTime from 'components/basic/dateTime.vue'


//	const URL = HOST + "/api/v1/suppress/list";   // 正式
	
	const URL = "http://rapapi.org/mockjsdata/21533/list?";   // 测试获取遏制列表数据

	//const URL_JOIN = "http://rapapi.org/mockjsdata/21533/ssss??"    // 测试获取刚进来的数据

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
				radioList:[
				// {
				// 	key:'0',
				// 	groupName:'物料'
				// },
				// {
				// 	key:'1',
				// 	groupName:'人员',
				// }
				],
				groupItems: [
                        // {
						// 	key:'1',
                        //     itemCode: "personCode",
						// 	itemName: "人员",
						// 	type: "select",
						// 	placeholder:"请选择人员"
                        // }
                        // {
						// 	key:'1',
                        //     itemCode: "startTime",
						// 	itemName: "开始时间",
						// 	type: "datetime",
						// 	placeholder:"请选择开始时间"
                        // },
                        // {
						// 	key:'1',
                        //     itemCode: "endTime",
						// 	itemName: "结束时间",
						// 	type: "datetime",
						// 	placeholder:"请选择结束时间"
						// },
						// {
						// 	key:'0',
                        //     itemCode: "materialCode",
						// 	itemName: "物料",
						// 	type: "select",
						// 	placeholder:"请选择物料"
                        // },
                        // {
						// 	key:'0',
                        //     itemCode: "batchNo",
						// 	itemName: "批次",
						// 	type: "input",
						// 	placeholder:"请输入批次"
                        // }
				],

				ruleForm:{
					// personCode:'',
					// startTime:'',
					// endTime:'',
					// materialCode:'',
					// batchNo: ''
				},
				activeName: 'first',
				radioNumber: '0'
				
			}
		},
		// 计算属性。
		computed: {
            // ruleForms: function() {
            //     let oFormData = {};
            //     this.items.forEach(o => {
            //     	oFormData[o.key] = this.active.keys[o.key] || '';
            //     });
            //     return oFormData;
            // },
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
		created() {

			/* 根据传入数据 */
			this.$ajax.get('../static/2.json').then((res) => {
				this.judgeLoaderHandler(res,() => {
				let datas = res.data.data
				let _radioList = []
				let _groupItems = []
				datas.forEach(o => {
					if(o.moduleCode === "restrain"){
						
						(o.groups).forEach((group,index) => {
						
							_radioList.push({
								key: `${index}`,
								groupName: `${group.groupName}`
							})
							var groupItems = group.groupItems
							groupItems.forEach(function(item){
								//debugger
								if(item.itemCode === "personCode" || item.itemCode === "materialCode" ){  //查询条件如果是'物料'或'人员'
									item.type = 'select'
									item.placeholder = `请选择${item.itemName}`
								}else if(item.itemCode === "batchNo"){			//查询条件如果是'批次'
									item.type = 'input'
									item.placeholder = `请输入${item.itemName}`
								}else{											//查询条件如果是'时间'
									item.type = 'datetime'						
									item.placeholder = `请选择${item.itemName}`
								}
								console.log(`${index}`)
							
								_groupItems.push({
									key: `${index}`,
									itemCode: `${item.itemCode}`,
									groupName: `${item.groupName}`,
									type: `${item.type}`,
									placeholder: `${item.placeholder}`
								})
							})						
						})
						this.radioList = _radioList
						this.groupItems = _groupItems
						_groupItems.forEach(item => {
							this.ruleForm[item.itemCode] = ''
						})
					}
				})

			 	});
			})
		},
		// 页面方法。
		methods: {
			submitForm(formName) {
			  this.$refs[formName].validate((valid) => {
					if (valid) {
						console.log(this.ruleForm)
					}
				});
			},
			// 判断调用接口是否成功。
			judgeLoaderHandler(param,fnSu,fnFail) {
				let bRight = param.data.errorCode;
				
				// 判断是否调用成功。
				if(bRight != "0") {
					// 提示信息。
					this.sErrorMessage = param.data.errorMsg.message;
					this.showMessage();
					// 失败后的回调函。
					fnFail && fnFail();
				}else {
					// 调用成功后的回调函数。
					fnSu && fnSu();
				}
			},
			// 显示提示信息。
			showMessage() {
				this.$message({
					message: this.sErrorMessage,
					duration: 3000
				});
			},
			// 切换tab
			handleClick(tab) {
				if(tab.index === '1'){
					this.$router.push({ path: 'list'})
				}else{
					this.$router.push({ path: '/'})
				}
			},

			
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
<style scoped lang="less">
	#app {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items:stretch;
		
		.panel {
			flex: 1;
			display: flex;
			flex-direction: column;
		}
		.panel-content {
			flex: 1;
			padding-left: 28px;
        	padding-right: 28px;
			.router-container {
				height: 100%;
			}
		}
	}
</style>