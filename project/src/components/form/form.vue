<template>
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" :label-width="labelWidth">
        <el-form-item :label="item.name" :prop="item.key" v-for="item in items" :key="item.key" :class="[Object.keys(keys).includes(item.key) ? '': 'hide']"> 
            <component :is="`v-${item.type}`" :form-data="ruleForm" :placeholder-data="item.placeholder" :key-data="item.key"></component> 
        </el-form-item>
        <div  :class="['form-button', { 'form-button-last': active.radio === '4' && items.length > 10 }]">
            <el-button class="btn" type="primary" @click="submitForm('ruleForm')">查询</el-button>
            <el-button class="btn" type="primary" @click="resetForm('ruleForm')">重置</el-button>
        </div>
    </el-form>
</template>

<script>
    import Input from 'components/basic/input.vue'
    import Select from 'components/basic/select.vue'
    import DateTime from 'components/basic/dateTime.vue'

    export default {
        props: {
            labelWidth: String,
            active: Object,
            keys: Object,
            items: Array,
            tab: String,
            subTab: String,
            handleSubmit: Function          
        },
        components: {
            'v-input': Input,
            'v-select': Select,
            'v-datetime': DateTime
        },
        data() {
        	let oFormData = {};
            this.items.forEach(o => {
            	if(this.subTab == this.active.radio) {
                    oFormData[o.key] = this.active.keys[o.key] || "";
            	}else {
            		oFormData[o.key] = "";
            	}
            });
            
            return {
            	ruleForm: oFormData
            };
        },
        watch: {
        	keys: {
        		handler: function() {
        			this.$nextTick(() => {
        				if(Rt.utils.getObjectValues(this.ruleForm).every(o=>!o)) {
	        				this.resetForm('ruleForm')
        				}
        			});
        		},
        		deep: true
        	}
        },
        mounted () {
        },
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
	            	if(Rt.utils.getObjectValues(oJudge).some(o=>o)) {
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
        methods: {
            getNameByKey(sKey) {
            	let aItem = this.items.filter(o => o.key === sKey);
            	
            	if(aItem && aItem.length) {
            		return aItem[0].name;
            	}else {
            		return "";
            	}
            },
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        // 保存搜索条件。
                        let oKeys = {};
                        for (let key in this.keys){
//                          this.keys[key] = this.ruleForm[key];
                            oKeys[key] = this.ruleForm[key];
                        }
                       
                        let oConditions = {
                            keys: oKeys, // this.keys,
                            radio: this.active.radio
                        };
                        
                        this.active.keys = oKeys; //this.keys;
                        this.handleSubmit(oConditions);
                        
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            resetForm(formName) {
            	// 清空所有数据。
                this.$refs[formName].resetFields();
//          	for(let key in this.ruleForm) {
//          		this.ruleForm[key] = "";
//          	}
            }
        }    
    }
   
</script>

<style lang="less">
    .hide {
        display: none;
    }
    .form-button {
        text-align: center;
    }

    .el-form-item {
        margin-bottom: 19px;
    }

    .el-form-item__label {
        padding: 8px 10px 8px 0;
    }

    .el-form-item__content {
        line-height: 30px;
        white-space: nowrap;
    }

    .el-input__inner {
        height: 30px;
        border-radius: 0;
        border-color: #ddd;
    }
    .form-button {
        margin-top: 50px
    }
    .form-button-last {
        margin-top: 30px;
        margin-bottom: 30px;
    }
</style>