<template>
	<el-dialog title="修复产出信息" :visible.sync="dialogVisible" :close-on-click-modal="false" :before-close="closeForm">
		<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-position="right" label-width="100px">
			<el-form-item label="产出物料编码" prop="materialCode">
				<v-input disabled-data="true" key-data="materialCode" :form-data="ruleForm"></v-input>
			</el-form-item>
			<el-form-item label="产出批次号" prop="batchNo">
				<v-input disabled-data="true" key-data="batchNo" :form-data="ruleForm"></v-input>
			</el-form-item>
			<el-form-item label="产出工单号" prop="inDoCode">
				<v-select key-data="inDoCode" :form-data="ruleForm"></v-select>
			</el-form-item>
			<el-form-item label="产出工序" prop="inProcessCode">
				<v-select key-data="inProcessCode" :form-data="ruleForm"></v-select>
			</el-form-item>
			<el-form-item label="产出数量" prop="inQuantity">
				<!--<el-input-number v-model="ruleForm.inQuantity" :step="1" :min="0"></el-input-number>-->
				<el-input type="inQuantity" v-model.number="ruleForm.inQuantity" auto-complete="off"></el-input>
			</el-form-item>
			<el-form-item label="产出设备" prop="inEquipmentId">
				<v-select key-data="inEquipmentId" :form-data="ruleForm"></v-select>
			</el-form-item>
			<el-form-item label="产出操作人" prop="inPersonName">
				<v-select key-data="inPersonName" :form-data="ruleForm"></v-select>
			</el-form-item>
			<el-form-item label="产出班次" prop="inShiftName">
				<v-select key-data="inShiftName" :form-data="ruleForm"></v-select>
			</el-form-item>
			<el-form-item label="产出条码" prop="inBarcode">
				<v-select key-data="inBarcode" :form-data="ruleForm"></v-select>
			</el-form-item>
			<el-form-item label="产出时间" prop="inHappenTime">
				<v-dateTime key-data="inHappenTime" :form-data="ruleForm" placeholderData="请输入产出时间"></v-dateTime>
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
		props: ["popShow","popValue"],
		components: {
			"v-input": Input,
    		"v-select": Select,
    		"v-dateTime": DateTime,
    		"v-button": Button
		},
		data() {
			return {
				// 弹窗是否显示。
				dialogVisible: true,//this.popShow,
				// 测试数据。
				oValue: [{
					id: 1,
					materialCode: "1.3T402",
					batchNo: "320170327早班",
					inDoCode: "D201704190005",
					inProcessCode: "222222",
					inQuantity: 3,
					inEquipmentId: "4",
					inEquipmentName: "设备4",
					inPersonName: "张三",
					inShiftName: "白班"
				},{
					id: 2,
					inBarcode: "23333",
					inHappenTime: "2017-04-01 19:20:00"
				}],
				// 规则。
				rules: {
					inDoCode: [
						{required: true, message: "请选择工单号",trigger: "change"}
					],
					inProcessCode: [
						{required: true, message: "请选择工序",trigger: "change"}
					],
					inQuantity: [
						{required: true, message: "数量不能为空"},
      					{type: "number", message: "数量必须为数字值"}
					],
					inEquipmentId: [
						{required: true, message: "请选择设备",trigger: "change"}
					],
					inPersonName: [
						{required: true, message: "请选择操作人",trigger: "change"}
					],
					inShiftName: [
						{required: true, message: "请选择班次",trigger: "change"}
					],
					inBarcode: [
						{required: true, message: "请选择条码",trigger: "change"}
					],
					inHappenTime: [
						{required: true, message: "请选择时间",trigger: "change"}
					]
				}
			}
		},
		computed: {
			// 当前传入计算的值。
			ruleForm: function() {
				let oRuleForm = {};
				
				this.oValue.forEach(function(o) {
					oRuleForm = $.extend({},o,oRuleForm);
				});
				
				delete oRuleForm.id;
				
				// 返回数据。
				return oRuleForm;
			}
		},
		methods: {
			submitForm(formName) {
				// 提交。
				this.$refs[formName].validate((valid) => {
		          if (valid) {
//		            alert('submit!');
		            
		            // 将数据与传入的数据合并，并传到页面中去。保存起来。
		            let aNewValue = [],
		            	oRuleForm = this.ruleForm;
		            
		            // 需修改设备名称的值。
		            	
					// 设置新的值。		            
		            this.oValue.forEach(function(oBefore) {
		            	let oNew = {};
		            	
		            	for(var obj in oBefore) {
		            		if(obj == "id") {
		            			oNew[obj] = oBefore[obj];
		            		}else {
			            		oNew[obj] = oRuleForm[obj];
		            		}
		            	}
		            	
		            	// 加入数据。
		            	aNewValue.push(oNew);
		            });
		            
		            // 设置弹窗状态。
					this.dialogVisible = false;
					this.$emit("hideProducePop",aNewValue);
		            console.log(aNewValue)
		          }
		        });
			},
			closeForm() {
				// 取消操作。
				this.dialogVisible = false;
				this.$emit("hideProducePop");
			}
		}
	}
	
</script>

<style scoped lang="less">
</style>