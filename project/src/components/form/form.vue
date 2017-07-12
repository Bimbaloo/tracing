<template>
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" :label-width="labelWidth">
        <el-form-item :label="item.name" :prop="item.key" v-for="item in items" :key="item.key" :class="[Object.keys(keys).includes(item.key) ? '': 'hide']"> 
            <component :is="`v-${item.type}`" :form-data="ruleForm" :placeholder-data="item.placeholder" :key-data="item.key"></component> 
        </el-form-item>
        <div  :class="['form-button', { 'form-button-last': active.radio === '4' && items.length > 10 }]">
        <!--<div :class="[active.radio == '4' ? 'form-button-last' : '', 'form-button']">-->
        <!--<div class="form-button">-->
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
            handleSubmit: Function          
        },
        components: {
            'v-input': Input,
            'v-select': Select,
            'v-datetime': DateTime
        },
        data() {
            return {
            };
        },
        watch: {
        	keys: {
        		handler: function() {
        			this.$nextTick(() => this.resetForm('ruleForm'));
        		},
        		deep: true
        	}
        },
        mounted () {
            // 数据初始化。
            // this.$nextTick(() => {
            //     this._init();
            // })
        },
        computed: {
            ruleForm: function() {
                let oFormData = {};
                this.items.forEach(o => {
                    oFormData[o.key] = this.active.keys[o.key] || '';
                });
                return oFormData;
            },
            rules: function() {
            	// 验证条码。
            	var validateBarcode = (rule, value, callback) => {
            		if(!value) {
            			callback(new Error("请输入条码"));
            		}else {
            			callback();
            		}
            	},
            	validateBatch = (rule, value, callback) => {
            		if(!value) {
            			callback(new Error("请输入批次"));
            		}else {
            			callback();
            		}
            	},
            	validateMaterialcode = (rule, value, callback) => {
            		if(!value) {
            			callback(new Error("请输入物料"));
            		}else {
            			callback();
            		}
            	};
            	// 验证开始时间。
            	var validateStartTime = (rule, value, callback) => {
            		if(!value) {
            			callback(new Error("请输入开始时间"));
            		}else {
            			callback();
            		}
            	};
            	// 验证结束时间。
            	var validateEndTime = (rule, value, callback) => {
            		let sStart = this.ruleForm.startTime;
            		if(!value) {
            			callback(new Error("请输入结束时间"));
            		}else if(sStart && sStart > value) {
            			// 如果开始时间存在，而且开始时间大于结束时间。
            			callback(new Error("结束时间必须大于开始时间"));
            		}else {
            			callback();
            		}
            	};
            	// 所有规则。
            	var oAllRules =  {
                	"barcode": [{validator: validateBarcode, trigger: "change"}],
                	"batchNo": [{validator: validateBatch,trigger: "change"}],
                	"materialCode": [{validator: validateMaterialcode,trigger: "change"}],
                	// 开始时间。
                	"startTime": [{validator: validateStartTime, trigger: "change"}],
                	// 结束时间。
                	"endTime": [{validator: validateEndTime, trigger: "change"}]
                };
                
            	// 根据当前配的返回对应的规则。
            	let oRule = {};
				for(let key in this.keys) {
					if(oAllRules[key]) {
						oRule[key] = oAllRules[key];
					}
				}
				
				// 为了将页面中*都不存在。
                return oRule;
            }
        },
        methods: {
            // _init() {
            //     for(let k in this.keys) {
            //         this.ruleForm[k] = this.keys[k];          
            //     }
            //     debugger
            // },
            getRules(sKey) {
            	// 验证开始时间。
            	var validateStartTime = (rule, value, callback) => {
            		if(!value) {
            			callback(new Error("请输入开始时间"));
            		}else {
            			callback();
            		}
            	};
            	// 验证结束时间。
            	var validateEndTime = (rule, value, callback) => {
            		let sStart = this.ruleForm.startTime;
            		if(!value) {
            			callback(new Error("请输入结束时间"));
            		}else if(sStart && sStart > value) {
            			// 如果开始时间存在，而且开始时间大于结束时间。
            			callback(new Error("结束时间必须大于开始时间"));
            		}else {
            			callback();
            		}
            	};
            	// 所有规则。
            	var oAllRules =  {
                	"barcode": [{required: true, message: "请输入条码", trigger: "change"}],
                	"batchNo": [{required: true, message: "请输入批次",trigger: "change"}],
                	"materialCode": [{required: true, message: "请输入物料编码",trigger: "change"}],
                	// 开始时间。
                	"startTime": [{required: true,validator: validateStartTime, trigger: "change"}],
                	// 结束时间。
                	"endTime": [{required: true, validator: validateEndTime, trigger: "change"}]
                };
                
            	// 根据当前配的返回对应的规则。
//          	let oRule = {};
//				for(let key in this.keys) {
//					if(oAllRules[key]) {
//						oRule[key] = oAllRules[key];
//					}
//				}
				if(Object.keys(this.keys).includes(sKey)) {
	                return oAllRules[sKey];
				}else {
					return [];
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
                this.$refs[formName].resetFields();
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