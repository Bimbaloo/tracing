<template>
	<el-dialog class="transfer-dialog" title="条件组合" :visible.sync="dialogVisable" :close-on-click-modal="false" :before-close="closeModal">
        <el-form label-position="left" label-width="60px" :model="ruleForm" :rules="rules" ref="ruleForm">
        	<el-form-item label="名称" prop="name">
			    <el-input v-model="titleName" placeholder="请输入条件组合名称"></el-input>
					<input id="hiddenText" type="text" style="display:none" />    <!-- 为了阻止form里面只有一个input时回车会自动触发submit事件  -->
			</el-form-item>
			
			<el-form-item prop="value">
				<el-transfer
		                v-model="aCheckedParam"
		                :titles="['所有条件', '选择条件']"
		                :button-texts="['', '']"
		                :format="{
		                  noChecked: '0/${total}',
		                  hasChecked: '${checked}/${total}'
		                }"
		                @change="handleChange"
		                :data="transferData">
		        </el-transfer>
			</el-form-item>
        </el-form>
        
        <!--<el-transfer
                v-model="aCheckedParam"
                :titles="['所有条件', '选择条件']"
                :button-texts="['', '']"
                :footer-format="{
                  noChecked: '${total}',
                  hasChecked: '${checked}/${total}'
                }"
                @change="handleChange"
                :data="transferData">
        </el-transfer>-->
        
        <div slot="footer" class="dialog-footer">
            <el-button @click="closeModal" size="small">取 消</el-button>
            <el-button type="primary" @click="okModal('ruleForm')" size="small">确 定</el-button>
        </div>
    </el-dialog>
</template>

<script>
export default {
  props: {
    // 是否显示。
    dialogShow: {
      type: Boolean,
      default: false
    },
    // 所有条件数据。
    transferData: {
      type: Array,
      default: []
    },
    // 选中的数据。
    checkedData: {
      type: Array,
      default: []
    },
    // 当前条件的标题。
    title: {
      type: String,
      default: ''
    },
    // 当前选中的模块。
    moduleCode: String,
    category: {
      required: false
    },
    nModuleIndex: {
      required: false
    }
  },
  data () {
    let aRequiredParam = ['barcode', 'materialCode', 'doCode', 'equipmentCode']
    // 溯源与追踪的配置限制，  条码，物料，设备，工单必须有一项。
    var validateChecked = (rule, value, callback) => {
      if (!value.length) {
        callback(new Error('条件不能为空，请选择条件'))
      } else {
        // 如果是溯源与追踪，则判断条件是否正确。
        if (this.moduleCode === 'stock') {
          // 只要存在就行。
          callback()
        } else {
          // 其他要判断条件。
          let bRight = value.some(o => {
            return aRequiredParam.includes(o)
          })

          let bHasTrace = value.some(o => {
            return ['traceCode'].includes(o)
          })

          // 溯源中只有物流码tab需添加物流码筛选条件，其他不需要。
          if (this.moduleCode === 'trace_up' && value.length === 1 && bHasTrace) {
            callback()
          } else if (bHasTrace) {
            callback(new Error('不需要增加物流码查询条件'))
          } else if (!bRight) {
            callback(new Error('条码，物料，设备，工单必须存在一项'))
          } else {
            callback()
          }
        }
      }
    }
    var validateName = (rule, value, callback) => {
      let sName = value.trim()
      if (!sName) {
        callback(new Error('请输入正确的名称'))
      } else {
        callback()
      }
    }
    return {
      // 初始不能获取数据----
      aCheckedParam: this.checkedData,
      rules: {
        name: [
          {
            validator: validateName,
            trigger: 'blur'
          }
        ],
        value: [
          {
            validator: validateChecked,
            trigger: 'blur'
          }
        ]
      },
      conditionTitle: this.title
    }
  },
  watch: {
    // 需要监听数据，当变化后直接更新，获取最新值。
    checkedData: function () {
      this.aCheckedParam = this.checkedData
    },
    title: function () {
      this.conditionTitle = this.title
    }
  },
  computed: {
    dialogVisable: {
      get: function () {
        let bVisable = this.dialogShow
        return bVisable
      },
      set: function (e) {
        let bVisable = e
        return bVisable
      }
    },
    ruleForm: function () {
      return {
        name: this.titleName,
        value: this.aCheckedParam
      }
    },
    titleName: {
      get: function () {
        let value = this.conditionTitle
        return value
      },
      set: function (e) {
        this.conditionTitle = e
      }
    }
  },
  methods: {
    // 穿梭框修改按钮点击事件
    handleChange (value, direction, movedKeys) {
      console.log(value, direction, movedKeys)
    },
    // 关闭弹窗。
    closeModal () {
      this.dialogVisable = false
      // 重置内容
      this.$refs['ruleForm'].resetFields()
      // 传递给父级。
      this.$emit('hideModal')
    },
    // 显示弹窗。
    okModal (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.dialogVisable = false

          let oResult = {
            title: this.ruleForm.name,
            aItem: this.aCheckedParam
          }
          // debugger
          let isOnlyName = this.category[this.nModuleIndex].groups.some(e => {
            return e.groupName === this.titleName && this.title === ''
          })
          if (isOnlyName) {
            // 重名了
            this.$message('该名称以存在，请重新命名')
          } else {
            // 传递给父级。
            this.$emit('hideModal', oResult)
          }
        }
      })
    }
  }
}
</script>

<style lang="less">
.transfer-dialog {
  .el-dialog {
    width: 860px;

    .el-form {
      margin: 0 30px;
    }
    .el-transfer {
      margin-left: 0; /*30px;*/
    }
    .el-transfer-panel {
      width: 320px;
    }
    .el-dialog__header,
    .dialog-footer {
      text-align: center;
    }
  }
}
</style>
