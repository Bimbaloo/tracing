<template>
	<el-dialog title="修复产出信息" :visible.sync="dialogVisible" :close-on-click-modal="false" :before-close="closeForm">
		<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-position="right" label-width="100px">
			<el-form-item :label="item.label" :prop="item.key" v-for="item in aList" :key="item.key"> 
            	<component :is="`v-${item.type}`" :disabled-data="item.disabled" :form-data="ruleForm" :placeholder-data="item.placeholder" :key-data="item.key"></component> 
	        </el-form-item>
	        
			<el-form-item>
			    <v-button text-data="取消" @query="closeForm"></v-button>
				<v-button text-data="确 定" @query="submitForm('ruleForm')"></v-button>
			 </el-form-item>
		</el-form>
	</el-dialog>
</template>

<script>
	import $ from "jquery"
	import Input from "components/basic/input.vue"
	import Select from "components/basic/select.vue"
	import MultiSelect from "components/basic/multiSelect.vue"
	import Button from "components/basic/button.vue"
	import DateTime from "components/basic/dateTime.vue"
	
	export default {
		props: {
			popShow: Boolean,
			popValue: Object
		},
		components: {
			"v-input": Input,
    		"v-select": Select,
    		"v-dateTime": DateTime,
    		"v-button": Button
		},
		data() {
			let validateTime = (rule, value, callback) => {
				let sTime = value.trim(),
        			nNow = +new Date();
        		
        		if(!sTime) {
        			callback(new Error("请输入时间"))
        		}else if(!window.Rt.utils.isDateTime(sTime)) {
        			callback(new Error("请输入正确的时间格式"));
        		}else if(+new Date(value) > nNow) {
        			callback(new Error("时间不能超过当前时间"));
        		}else {
        			callback();
        		}
        	    
			};
			
			return {
				aList: [{
					key: "materialCode",
					type: "input",
					label: "产出物料编码",
					disabled: true
				},{
					key: "batchNo",
					type: "input",
					label: "产出批次号",
					disabled: true
				},{
					key: "processCode",
					type: "input",
					label: "产出工序",
					disabled: true
				},{
					key: "doCode",
					type: "input",
					label: "产出工单号",
					placeholder: "请输入工单号"
				},{
					key: "quantity",
					type: "input",
					label: "产出数量",
					placeholder: "请输入数量"
				},{
					key: "equipmentCode",
					type: "select",
					label: "产出设备",
					placeholder: "请选择设备"
				},{
					key: "personCode",
					type: "select",
					label: "产出操作人",
					placeholder: "请选择操作人"
				},{
					key: "shiftName",
					type: "select",
					label: "产出班次",
					placeholder: "请选择班次"
				},{
					key: "barcode",
					type: "input",
					label: "产出条码",
					placeholder: "请输入条码"
				},{
					key: "happenTime",
					type: "dateTime",
					label: "产出时间",
					placeholder: "请选择时间"
				}],
				// 弹窗是否显示。
				dialogVisible: this.popShow,
				// 规则。
				rules: {
					doCode: [
						{required: true, message: "请选择工单号",trigger: "change"}
					],
					quantity: [
						{required: true, message: "数量不能为空"},
      					{type: "number", message: "数量必须为数字值"}
					],
					equipmentCode: [
						{required: true, message: "请选择设备",trigger: "change"}
					],
					personCode: [
						{required: true, message: "请选择操作人",trigger: "change"}
					],
					shiftName: [
						{required: true, message: "请选择班次",trigger: "change"}
					],
					barcode: [
						{required: true, message: "请输入条码",trigger: "change"}
					],
					happenTime: [
						{validator: validateTime, trigger: "change"}
					]
				}
			}
		},
		computed: {
			// 当前传入计算的值。
			ruleForm: function() {
				return this.getForm();
			}
		},
		watch: {
			popShow: function() {
				this.dialogVisible = this.popShow;
				this.ruleForm = this.getForm()
			}
		},
		methods: {
			// 获取显示的值。
			getForm() {
				let oRuleForm = {};
				
				if(this.popValue) {
					
					oRuleForm = $.extend({}, true, this.popValue)
				}
				
				// 返回数据。
				return oRuleForm;
			},
			submitForm(formName) {
				// 提交。
				this.$refs[formName].validate((valid) => {
		          if (valid) {
		            
		            // 将数据与传入的数据合并，并传到页面中去。保存起来。
		            let oNewValue = {},
		            	oRuleForm = this.ruleForm;
		            
		            // 需修改设备名称的值.人员名称及编码。时间，后台取值处理
		            	
					// 设置新的值。		            
		            oNewValue = $.extend(true, {}, oRuleForm);
		            
		          	this.aList.forEach(function(oParam) {
		          		let sKey = oParam.key,
		          			sParam = "out" + sKey.substring(0,1).toUpperCase()+ sKey.substring(1);	// sKey.charAt(0).toUpperCase() + sKey.slice(1)
						
						oNewValue[sParam] = oRuleForm[sKey]
						
						if(['equipmentCode', 'personCode'].includes(sKey)) {
							oNewValue[sParam] = oNewValue[sParam].split(":")[0]
						}
						
						// 删除。
						delete oNewValue[sKey]
		          	})
		            
		            // 设置弹窗状态。
					this.$emit("hideProducePop", oNewValue);
		          }
		        });
			},
			closeForm() {
				// 取消操作。
				this.$emit("hideProducePop");
			}
		}
	}
	
</script>

<style scoped lang="less">
</style>