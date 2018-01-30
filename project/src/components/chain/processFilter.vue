<template>
	
	<el-dialog class="process-filter" :model="form" :title="title" :visible.sync="popShow"  :close-on-click-modal="false" :before-close="handleClose">
		
		<el-form label-position="left" label-width="80px">
			
			<el-checkbox v-model="form.inTime.checked">投入时间</el-checkbox>
			<div class="filter-item">
				<el-form-item label="开始时间">
					<v-dateTime style="width: auto;" :disabled="!form.inTime.checked" :form-data="form.inTime" key-data="startTime" placeholder-data="请输入开始时间"></v-dateTime>
				</el-form-item>
				<el-form-item label="结束时间">
					<v-dateTime style="width: auto;" :disabled="!form.inTime.checked" :form-data="form.inTime" key-data="endTime"  placeholderData="请输入结束时间"></v-dateTime>
				</el-form-item>
			</div>
		
			<el-checkbox v-model="form.outTime.checked">产出时间</el-checkbox>
			<div class="filter-item">
				<el-form-item label="开始时间">
					<v-dateTime style="width: auto;" :disabled="!form.outTime.checked" :form-data="form.outTime" key-data="startTime" placeholder-data="请输入开始时间"></v-dateTime>
				</el-form-item>
				<el-form-item label="结束时间">
					<v-dateTime style="width: auto;" :disabled="!form.outTime.checked" :form-data="form.outTime" key-data="endTime"  placeholderData="请输入结束时间"></v-dateTime>
				</el-form-item>
			</div>
			
			<el-checkbox v-model="form.dataLine.checked">数据完整性</el-checkbox>
			<div class="filter-item">
				<el-form-item>
					<el-radio-group :disabled="!form.dataLine.checked" v-model="form.dataLine.selected">
						<el-radio :label="1" >全部节点</el-radio>
						<el-radio :label="2">投产信息完整节点</el-radio>
						<el-radio :label="3">投产信息不完整节点</el-radio>
					</el-radio-group>
				</el-form-item>
			</div>
		
			<el-checkbox v-model="form.person.checked">操作人</el-checkbox>
			<div class="filter-item">
				<el-form-item label="操作人">
					<v-multiSelect :disabled="!form.person.checked" :form-data="form.person" key-data="selected" :list-data="parseSelectFormat(form.person.value)" placeholderData="请选择操作人"></v-multiSelect>
				</el-form-item>
			</div>
			
			<el-checkbox v-model="form.equipment.checked">设备</el-checkbox>
			<div class="filter-item">
				<el-form-item label="设备">
					<v-multiSelect :disabled="!form.equipment.checked" :form-data="form.equipment" key-data="selected" :list-data="parseSelectFormat(form.equipment.value)" placeholderData="请选择设备"></v-multiSelect>
				</el-form-item>
			</div>
			
			<el-checkbox v-model="form.doCode.checked">工单</el-checkbox>
			<div class="filter-item">
				<el-form-item label="工单">
					<v-multiSelect :disabled="!form.doCode.checked" :form-data="form.doCode" key-data="selected" :list-data="parseSelectFormat(form.doCode.value)" placeholderData="请选择工单"></v-multiSelect>
				</el-form-item>
			</div>
			
		</el-form>
		
		<div slot="footer" class="dialog-footer">
			<v-button text-data="取消" @query="closeModal"></v-button>
			<v-button text-data="确 定" @query="setFilter"></v-button>
		</div>
		
	</el-dialog>
	
</template>

<script>
	import Button from 'components/basic/button.vue'
	import MultiSelect from 'components/basic/multiSelect.vue'
	import DateTime from 'components/basic/dateTime.vue'
	
	export default {
	  props: {
	    popShow: Boolean,
	    popData: Object
	  },
    // 组件
	  components: {
    'v-button': Button,
    'v-multiSelect': MultiSelect,
    'v-dateTime': DateTime
	  },
	  data () {
	    return {}
	  },
	  computed: {
	    form () {
     // console.log(this.popData)
	      return Object.assign({}, this.popData)
	    },
	    title () {
	      return this.popData.name + '过滤'
	    }
	  },
	  methods: {
    // 下拉框中格式处理函数。
	    parseSelectFormat (aSelect) {
	      var aNewData = []
	
	      if (aSelect && aSelect.length) {
	        aSelect.forEach(function (sValue) {
	          aNewData.push({
	            label: sValue,
	            value: sValue
	          })
	        })
	      }
      // 返回数据。
	      return aNewData
	    },
	    handleClose () {
      // 设置弹窗状态。
	      this.$emit('hideFilterPop')
	    },
	    closeModal () {
      // 设置弹窗状态。
	      this.$emit('hideFilterPop')
	    },
	    setFilter () {
      // 设置弹窗状态。
	      this.$emit('hideFilterPop', this.form)
	    }
	  }
	}
	
</script>

<style lang="less" scoped>
	.process-filter {
		.el-dialog {
			
			.filter-item {
				.el-form-item {
					display: inline-block;
					margin-left: 20px;
				}
			}
		}
		
	}
</style>
