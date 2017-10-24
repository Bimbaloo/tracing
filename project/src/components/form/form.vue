<template>
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" :label-width="labelWidth" @keyup.enter.native="submitForm('ruleForm')" >
		<div class='form-conditions' :style="{maxHeight: conditionHeight}">
			<el-form-item :label="item.name" :prop="item.key" v-for="item in items" :key="item.key" :class="[Object.keys(keys).includes(item.key) ? '': 'hide']"> 
            	<component :is="`v-${item.type}`" :form-data="ruleForm" :placeholder-data="item.placeholder" :key-data="item.key" :tab="tab" :sub-tab="subTab"></component> 
				<input id="hiddenText" type="text" style="display:none" />    <!-- 为了阻止form里面只有一个input时回车会自动触发submit事件  -->
        	</el-form-item>
		</div>
        <div  class="form-button">
            <el-button class="btn" type="primary" @click="submitForm('ruleForm')">查询</el-button>
            <el-button v-show="showResetButton" class="btn" type="primary" @click="resetForm('ruleForm')">重置</el-button>
        </div>
    </el-form>
</template>

<script>
    import Input from 'components/basic/input.vue'
    import Select from 'components/basic/select.vue'
	import DateTime from 'components/basic/dateTime.vue'
	import { bus } from "assets/js/bus.js"

    export default {
        props: {
            labelWidth: String,
            active: Object,
            keys: Object,
            items: Array,
            tab: String,
            subTab: String,
            handleSubmit: Function,
            showResetButton: {
            	required: false,
            	default: true
            },
            formHeight: {
            	required: false
            }
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
            	ruleForm: oFormData,
            	conditionHeight: 'auto',
            	nBottomHeight: 10
            };
        },
        watch: {
        	keys: {
        		handler: function() {
        			this.$nextTick(() => {
        				if(window.Rt.utils.getObjectValues(this.ruleForm).every(o=>!o)) {
//	        				this.resetForm('ruleForm')
							// 只重置切换的判断。
							this.$refs["ruleForm"].resetFields();
        				}
        			});
        		},
        		deep: true
        	},
        	formHeight: function() {
        		this.setHeight();
        	},
        	tab: function() {
        		this.setHeight()
        	}
        },
        mounted () {
		},
		created() {
			let _that = this
            bus.$on('id-selected', function (obj) {
				if(_that.tab === obj.tab && _that.subTab === obj.radio){
					let datas = obj.keys
					for(let i in datas){
						_that.ruleForm[i] = datas[i]
						if(i === "startTime" || i === "endTime") {
							bus.$emit('timeChange', obj)
						}else{
							_that.ruleForm[i] = datas[i]
						}
					}
				}
				
            })
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
	            		if(!value.trim()) {
	            			callback(new Error("请输入条码"));
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
	            	// 验证物料。
	            	validateMaterialcode = (rule, value, callback) => {
	            		if(!value) {
	            			callback(new Error("请选择物料"));
	            		}else {
	            			callback();
	            		}
	            	},
            		// 验证开始时间。
            	    validateStartTime = (rule, value, callback) => {
	            		let sTime = value.trim(),
	            			nNow = +new Date();
	            		console.log(sTime)
	            		if(!sTime) {
	            			callback(new Error("请输入开始时间"))
	            		}else if(!window.Rt.utils.isDateTime(sTime)) {
	            			callback(new Error("请输入正确的时间格式"));
	            		}else if(+new Date(value) > nNow) {
	            			callback(new Error("时间不能超过当前时间"));
	            		}else {
	            			callback();
	            		}
	            	},
            		// 验证结束时间。
            		validateEndTime = (rule, value, callback) => {
	            		let sStart = oForm.startTime,
	            			sTime = value.trim(),
	            			bIsFormat = window.Rt.utils.isDateTime(sTime),
	            			bIsStartFormat = window.Rt.utils.isDateTime(sStart),
            	    		nNow = +new Date();
            	    		
	            		if(!sTime) {
	            			callback(new Error("请输入结束时间"))
	            		}else if(!bIsFormat) {
	            			callback(new Error("请输入正确的时间格式"));
	            		}else if(+new Date(sTime) > nNow) {
	            			callback(new Error("时间不能超过当前时间"));
	            		}else if(sStart && bIsStartFormat && +new Date(sStart) > +new Date(sTime) ){
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
            			"startTime": [{validator: validateStart, trigger: "change"}],
            			// 结束时间。
            			"endTime": [{validator: validateTime, trigger: "change"}]
            		},
            		// 追踪。
            		"track": {
            			"barcode": [{validator: validateParam,trigger: "change"}],
            			"materialCode": [{validator: validateParam,trigger: "change"}],
            			"equipmentCode": [{validator: validateParam,trigger: "change"}],
            			"doCode": [{validator: validateParam,trigger: "change"}],
            			"startTime": [{validator: validateStart, trigger: "change"}],
            			// 结束时间。
            			"endTime": [{validator: validateTime, trigger: "change"}]
            		},
            		// 履历。
            		"resume": {
            			"barcode": [{validator: validateBarcode, trigger: "change"}]
            		},
            		// 断链
            		"link": {
            			"batchNo": [{validator: validateBatch,trigger: "change"}],
	                	"materialCode": [{validator: validateMaterialcode,trigger: "change"}],
	                	"startTime": [{validator: validateStart, trigger: "change"}],
            			// 结束时间。
            			"endTime": [{validator: validateTime, trigger: "change"}]
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
        	setHeight() {
        		if(this.formHeight && Number(this.formHeight)) {
	        		this.conditionHeight = this.formHeight - this.nBottomHeight + 'px'
        		}
        	},
        	outerHeight(el) {
	            var height = el.offsetHeight;
	            var style = el.currentStyle || getComputedStyle(el);
	
	            height += parseInt(style.marginTop) + parseInt(style.marginBottom);
	            return height;
	        },
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
                // 清空数据。
            	for(let key in this.ruleForm) {
            		this.ruleForm[key] = "";
            	}
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
	.el-form-item__content {
		.el-input {
			width: 100%
		}
	}
	
</style>