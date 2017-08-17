<template>
	<el-dialog class="processDialog" :model="form" :title="form.name" :visible.sync="dialogVisible" :type="popType" :close-on-click-modal="false" :before-close="handleClose">
		
		<!-- 投入时间，产出时间  -->
		<el-form label-position="left" label-width="100px" v-if="popType == 'inTime' || popType == 'outTime'">
			<el-form-item label="开始时间">
				<v-dateTime style="width: auto;" :form-data="form" key-data="startTime" placeholder-data="请输入开始时间"></v-dateTime>
			</el-form-item>
			<el-form-item label="结束时间">
				<v-dateTime style="width: auto;" :form-data="form" key-data="endTime"  placeholderData="请输入结束时间"></v-dateTime>
			</el-form-item>
		</el-form>
		
		<!-- 数据完整性  -->
		<el-form label-position="left" label-width="100px" v-if="popType == 'dataLine'">
			<el-form-item>
				<v-radio :form-data="form" key-data="value" :list-data="aRaidos" ></v-radio>
			</el-form-item>
		</el-form>
		
		<!-- 操作人，设备，工单 -->
		<el-form label-position="left" label-width="100px" v-if=" (popType == 'person') || (popType == 'equipment') || (popType == 'doCode')">
			<el-form-item :label="form.name">
				<!--<v-select style="width:auto;" :form-data="form" key-data="selected" placeholderData="请选择" :list-data="parseSelectFormat(form.value)"></v-select>-->
				<v-multiSelect style="width:80%;" :form-data="form" key-data="selected" placeholderData="请选择" :list-data="parseSelectFormat(form.value)"></v-multiSelect>
			</el-form-item>
		</el-form>
		
		<!-- 断链修复原因。 -->
		<el-form label-position="left" label-width="100px" v-if="popType == 'recoveredDes' || popType == 'unRecoveredDes'">
			<el-form-item label="修复的数据">
				<ul class="pop-list">
					<li v-for="item in popRecover">
						<p v-for="value in item">
							<span>{{ value.processName }}</span>
							<span>{{ value.equipmentName }}</span>
							<span>{{ value.happenTime }}</span>
							<span>{{ value.quantity }}</span>
						</p>
					</li>
				</ul>
			</el-form-item>
			<el-form-item label="断开的数据">
				<ul class="pop-list">
					<li v-for="item in popDel">
						<p v-for="value in item">
							<span>{{ value.processName }}</span>
							<span>{{ value.equipmentName }}</span>
							<span>{{ value.happenTime }}</span>
							<span>{{ value.quantity }}</span>
						</p>
					</li>
				</ul>
			</el-form-item>
			<el-form-item :label="form.name" prop="discription">
				<el-input type="textarea" :rows="2" placeholder="请输入原因" v-model="form.discription"></el-input>
			</el-form-item>
		</el-form>
		
		<div slot="footer" class="dialog-footer">
			<v-button text-data="取消" @query="closeModal"></v-button>
			<v-button text-data="确 定" @query="setFilter"></v-button>
		</div>
	</el-dialog>
</template>

<script>
	import $ from "jquery"
	import Input from "components/basic/input.vue"
	import Select from "components/basic/select.vue"
	import MultiSelect from "components/basic/multiSelect.vue"
	import Button from "components/basic/button.vue"
	import DateTime from "components/basic/dateTime.vue"
	import Radio from "components/basic/radio.vue"

	var aoRadioData = [{
		label:"1",
		text: "全部节点"
	},{
		label:"2",
		text: "投产信息完整节点"
	},{
		label:"3",
		text: "投产信息不完整节点"
	}];


	export default {
		props: {
			popShow: Boolean,
			popType: String,
			popValue: {
				type: Object,
			},
			popRecover: Array,
			popDel: Array
		},
		// 组件。
		components: {
			"v-input": Input,
    		"v-select": Select,
    		"v-multiSelect": MultiSelect,
    		"v-button": Button,
    		"v-dateTime": DateTime,
    		"v-radio": Radio
		},
		data() {
			return {
				// 当前传入的值
				type: this.popType,
				oProcess: this.popValue,
				dialogVisible: this.popShow,
				aRaidos: aoRadioData
			}
		},
		created() {
		},
		// 计算属性。
		computed: {
			form: function() {
		 		var oForm = $.extend(true, {}, this.popValue[this.popType]);
		 		return oForm;
			}
		},
		watch: {
			popType: function(sType) {
				this.dialogVisible = this.popShow;
				
				if(sType) {
					this.form = $.extend(true, {}, this.popValue[this.popType]);
				}
			}
		},
		// 方法。
		methods: {
			// 下拉框中格式处理函数。
			parseSelectFormat(aSelect) {
				var aNewData = [];
				
				if(aSelect && aSelect.length) {
					aSelect.forEach(function(sValue) {
						aNewData.push({
							label: sValue,
							value: sValue
						})
					});
				}
				// 返回数据。
				return aNewData;
			},
			// 弹窗筛选确定-- 重置筛选值。
			setFilter() {
				// 设置弹窗状态。
				this.$emit("hidePop", this.form);
			},
			// 关闭按钮。
			handleClose() {
				this.$emit("hidePop");
			},
			closeModal() {
				this.$emit("hidePop");
			}
		}
		
	};
</script>

<style lang="less">
	
	.processDialog {
		.el-dialog {
			max-width: 600px;
		}
		.pop-list {
			li {
				list-style: circle;
			}
		}
	}
	.el-radio-group .el-radio {
		display: block;
		margin: 5px 0;
		
		&:first-child {
			/*margin-left: 15px;*/
		}
	}
	
	.dialog-footer,
	.el-dialog__header {
		text-align: center;
	}
</style>