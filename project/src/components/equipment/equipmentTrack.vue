<template>
	<el-dialog class="dialog-track-wrap" title="追踪配置" width='30%' :visible.sync="dialogVisible" :close-on-click-modal="false" :before-close="closeForm">
    	<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-position="right">
    		
    		<el-form-item label="设备" prop="equipmentId">
    			<v-select :get-by-ajax="false" :list-data="equipmentsList" :form-data="ruleForm" placeholder-data="请选择设备" key-data="equipmentId"></v-select>
    		</el-form-item>
    		<el-form-item label="开始时间" prop="startTime">
    			<v-dateTime :form-data="ruleForm" placeholder-data="请选择开始时间" key-data="startTime"></v-dateTime>
    		</el-form-item>
    		<el-form-item label="结束时间" prop="endTime">
    			<v-dateTime :form-data="ruleForm" placeholder-data="请选择结束时间" key-data="endTime"></v-dateTime>
    		</el-form-item>
    		
    		<el-form-item class="button-item">
			    <v-button text-data="取消" @query="closeForm"></v-button>
				<v-button text-data="追踪" @query="submitForm('ruleForm')"></v-button>
			 </el-form-item>
    	</el-form>
	</el-dialog>
</template>

<script>
import Select from 'components/basic/select.vue'
import Button from 'components/basic/button.vue'
import DateTime from 'components/basic/dateTime.vue'

export default {
  props: {
    // 弹窗显示。
    dialogVisible: {
      type: Boolean,
      default: false
    },
    // 设备列表。
    equipmentList: {
      type: Array,
      default: []
    },
    // 初始化显示的值。
    initData: {
      type: Object,
      default: {
        equipmentId: '',
        startTime: '',
        endTime: ''
      }
    }
  },
  components: {
    'v-select': Select,
    'v-dateTime': DateTime,
    'v-button': Button
  },
  data () {
    // 验证设备不为空
    let validateEquipment = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请选择设备'))
      } else {
        callback()
      }
    }

    // 开始时间验证
    let validateStartTime = (rule, value, callback) => {
      let sTime = value.trim()
      let nNow = +new Date()

      if (!sTime) {
        callback(new Error('请输入开始时间'))
      } else if (!window.Rt.utils.isDateTime(sTime)) {
        callback(new Error('请输入正确的时间格式'))
      } else if (+new Date(value) > nNow) {
        callback(new Error('时间不能超过当前时间'))
      } else {
        callback()
      }
    }

    // 结束时间验证
    let validateEndTime = (rule, value, callback) => {
      let sStart = this.ruleForm.startTime
      let sTime = value.trim()
      let bIsFormat = window.Rt.utils.isDateTime(sTime)
      let bIsStartFormat = window.Rt.utils.isDateTime(sStart)
      let nNow = +new Date()

      if (!sTime) {
        callback(new Error('请输入结束时间'))
      } else if (!bIsFormat) {
        callback(new Error('请输入正确的时间格式'))
      } else if (+new Date(sTime) > nNow) {
        callback(new Error('时间不能超过当前时间'))
      } else if (
        sStart &&
        bIsStartFormat &&
        +new Date(sStart) > +new Date(sTime)
      ) {
        // 如果开始时间存在，而且开始时间大于结束时间。
        callback(new Error('结束时间必须大于开始时间'))
      } else {
        callback()
      }
    }

    return {
      // 验证规则。
      rules: {
        equipmentId: [{ validator: validateEquipment, trigger: 'change' }],
        startTime: [{ validator: validateStartTime, trigger: 'change' }],
        endTime: [{ validator: validateEndTime, trigger: 'change' }]
      }
    }
  },
  computed: {
    // 所有设备的数据。
    equipmentsList () {
      return this.equipmentList.map(o => {
        return {
          label: o.equipmentName,
          value: o.equipmentId
        }
      })
    },
    // 当前选中的值。
    ruleForm () {
      let { equipmentId, startTime, endTime } = this.initData
      return {
        equipmentId,
        startTime,
        endTime
      }
    }
  },
  created () {},
  methods: {
    // 追踪操作。
    submitForm (formName) {
      // 提交.
      this.$refs[formName].validate(valid => {
        if (valid) {
          let { equipmentId, startTime, endTime } = this.ruleForm

          let oTrack = {
            equipmentId: equipmentId.split(':')[0],
            equipmentName: equipmentId.split(':')[1],
            startTime,
            endTime
          }

          // 通过验证后，提交事件。并将传回的参数
          this.$emit('hideDialog', oTrack)
        }
      })
    },
    // 取消追踪操作。
    closeForm () {
      // 取消操作。
      this.$emit('hideDialog')
    }
  }
}
</script>

<style lang="less">
.dialog-track-wrap {
  .el-dialog {
    top: 25% !important;
    width: 500px;

    .el-dialog__body {
      padding: 20px 20px 0;

      .el-form-item {
        .el-form-item__content {
          margin-left: 80px;
        }
      }
      .button-item {
        text-align: center;

        .el-form-item__content {
          margin-left: 0;
        }
      }
    }
  }
}
</style>
