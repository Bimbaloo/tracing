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
import { bus } from 'assets/js/bus.js'

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
    },
    title: {
      required: false
    }
  },
  components: {
    'v-input': Input,
    'v-select': Select,
    'v-datetime': DateTime
  },
  data () {
    return {
      ruleForm: {},
      conditionHeight: 'auto',
      nBottomHeight: 10
    }
  },
  watch: {
    keys: {
      handler: function () {
        this.$nextTick(() => {
          if (window.Rt.utils.getObjectValues(this.ruleForm).every(o => !o)) {
            // this.resetForm('ruleForm')
            // 只重置切换的判断。
            this.resetForm('ruleForm')
          }
        })
      },
      deep: true
    },
    formHeight: function () {
      this.setHeight()
    },
    tab: function () {
      this.setHeight()
    }
  },
  mounted () {},
  created () {
    let oFormData = {}
    this.items.forEach(o => {
      if (this.subTab === this.active.radio) {
        oFormData[o.key] = this.active.keys[o.key] || ''
      } else {
        oFormData[o.key] = ''
      }
    })
    this.ruleForm = oFormData

    let _that = this
    bus.$on('formItemChange', function (obj) {
      if (_that.tab === obj.tab && _that.subTab === obj.radio) {
        _that.$nextTick(() => {
          let datas = obj.keys
          for (let i in datas) {
            _that.ruleForm[i] = datas[i]
          }
        })
      }
    })
  },
  computed: {
    ruleForms: function () {
      let oFormData = {}
      this.items.forEach(o => {
        oFormData[o.key] = this.active.keys[o.key] || ''
      })
      return oFormData
    },
    rules: function () {
      // 验证条码。
      let _that = this
      let oForm = this.ruleForm
      let oKeys = this.keys
        // 溯源及追踪的参数。
      let aParams = ['barcode', 'materialCode', 'equipmentCode', 'doCode', 'personCode'] // 增加人员可追溯项。
        // 验证条码
      let validateBarcode = (rule, value, callback) => {
        if (!value.trim()) {
          callback(new Error('请输入条码'))
        } else {
          callback()
        }
      }
        // 验证批次。
      let validateBatch = (rule, value, callback) => {
        if (!value.trim()) {
          callback(new Error('请输入批次'))
        } else {
          callback()
        }
      }
        // 验证物料。
      let validateMaterialcode = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请选择物料'))
        } else {
          callback()
        }
      }
        // 验证设备。
      let validatEquipmentCode = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请选择设备'))
        } else {
          callback()
        }
      }
        // 验证工序
      let validatProcessCode = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请选择工序'))
        } else {
          callback()
        }
      }
        // 验证模号
      let validatMoldCode = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入模号'))
        } else {
          callback()
        }
      }
        // 无需验证，可以为null。
      let validateNull = (rule, value, callback) => {
        callback()
      }
        // 验证开始时间。
      let validateStartTime = (rule, value, callback) => {
        let sTime = value ? value.trim() : ''
        let nNow = +new Date()
        const isMoldCode = Object.keys(oForm).includes('moldCode') // 是否遏制模号查询
        if (!sTime && !isMoldCode) {
            // 遏制模号状态下可以没有时间
          callback(new Error('请输入开始时间'))
        } else if (!window.Rt.utils.isDateTime(sTime) && !isMoldCode) {
          callback(new Error('请输入正确的时间格式'))
        } else if (+new Date(value) > nNow) {
          callback(new Error('时间不能超过当前时间'))
        } else {
          callback()
        }
      }
        // 验证结束时间。
      let validateEndTime = (rule, value, callback) => {
        let sStart = oForm.startTime
        let sTime = value ? value.trim() : ''
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
        // 验证结束时间。(遏制可以没有结束时间)
      let validateSuppressEndTime = (rule, value, callback) => {
        let sStart = oForm.startTime
        let sTime = value ? value.trim() : ''
        let bIsFormat = window.Rt.utils.isDateTime(sTime)
        let bIsStartFormat = window.Rt.utils.isDateTime(sStart)
        let nNow = +new Date()

        const isMoldCode = Object.keys(oForm).includes('moldCode') // 是否遏制模号查询
        if (!bIsFormat && !isMoldCode) {
            // 遏制模号状态下可以没有时间
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

      // 验证是否存在
      let validateParam = (rule, value, callback) => {
          // 当前筛选条件中需判断的参数。
        let oJudge = {}
        let aJudgeName = []

          // 循环处理。
        for (let param in oKeys) {
            // 当前参数存在。
          if (aParams.includes(param)) {
            oJudge[param] = oForm[param]
            aJudgeName.push(_that.getNameByKey(param))
          }
        }
          // 如果judge的参数中所有的都为空。则提示
        if (window.Rt.utils.getObjectValues(oJudge).some(o => o)) {
            // 只要一个有数据。
          callback()
        } else {
            // 否则。
          callback(
              new Error(
                aJudgeName.join(',') +
                  (aJudgeName.length === 1 ? '不能为空' : '必填其中一项')
              )
            )
        }
      }
      let validateStart = (rule, value, callback) => {
        let sTime = value ? value.trim() : ''
        let bIsFormat = window.Rt.utils.isDateTime(sTime)
        let nNow = +new Date()

        if (sTime) {
          if (!bIsFormat) {
            callback(new Error('请输入正确的时间格式'))
          } else if (+new Date(value) > nNow) {
            callback(new Error('时间不能超过当前时间'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }
        // 结束时间。
      let validateTime = (rule, value, callback) => {
        let sStart = oForm.startTime
        let sTime = value ? value.trim() : ''
        let bIsFormat = window.Rt.utils.isDateTime(sTime)
        let bIsStartFormat = window.Rt.utils.isDateTime(sStart)
        let nNow = +new Date()
        if (sTime) {
            // 存在时间。
          if (!bIsFormat) {
            callback(new Error('请输入正确的时间格式'))
          } else if (+new Date(sTime) > nNow) {
            callback(new Error('时间不能超过当前时间'))
          } else if (bIsStartFormat && +new Date(sStart) > +new Date(sTime)) {
              // 如果开始时间存在，而且开始时间大于结束时间。
            callback(new Error('结束时间必须大于开始时间'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }
        // 物流码判断。
      let validateTraceCode = (rule, value, callback) => {
        if (!value.trim()) {
          callback(new Error('请输入物流码'))
        } else {
          callback()
        }
      }

      // 所有规则。
      let oAllRules = {
        // 查出库。
        stock: {
          barcode: [{ validator: validateBarcode, trigger: 'change' }],
          batchNo: [{ validator: validateBatch, trigger: 'change' }],
          materialCode: [
            { validator: validateMaterialcode, trigger: 'change' }
          ],
          // 开始时间。
          startTime: [{ validator: validateStartTime, trigger: 'change' }],
          // 结束时间。
          endTime: [{ validator: validateEndTime, trigger: 'change' }]
        },
        // 溯源。
        trace_up: {
          barcode: [{ validator: validateParam, trigger: 'change' }],
          traceCode: [{ validator: validateTraceCode, trigger: 'change' }],
          materialCode: [{ validator: validateParam, trigger: 'change' }],
          equipmentCode: [{ validator: validateParam, trigger: 'change' }],
          doCode: [{ validator: validateParam, trigger: 'change' }],
          personCode: [{validator: validateParam, trigger: 'change'}],
          startTime: [{ validator: validateStart, trigger: 'change' }],
          // 结束时间。
          endTime: [{ validator: validateTime, trigger: 'change' }]
        },
        // 追踪。
        trace_down: {
          barcode: [{ validator: validateParam, trigger: 'change' }],
          materialCode: [{ validator: validateParam, trigger: 'change' }],
          equipmentCode: [{ validator: validateParam, trigger: 'change' }],
          doCode: [{ validator: validateParam, trigger: 'change' }],
          personCode: [{validator: validateParam, trigger: 'change'}],
          startTime: [{ validator: validateStart, trigger: 'change' }],
          // 结束时间。
          endTime: [{ validator: validateTime, trigger: 'change' }]
        },
        // 履历。
        resume: {
          barcode: [{ validator: validateBarcode, trigger: 'change' }]
        },
        // （新建）遏制
        suppress: {
          materialCode: [
            { validator: validateMaterialcode, trigger: 'change' }
          ],
          batchNo: [{ validator: validateBatch, trigger: 'change' }],
          equipmentCode: [
            { validator: validatEquipmentCode, trigger: 'change' }
          ],
          processCode: [{ validator: validatProcessCode, trigger: 'change' }],
          moldCode: [{ validator: validatMoldCode, trigger: 'change' }],
          startTime: [{ validator: validateStartTime, trigger: 'change' }],
          // 结束时间。
          endTime: [{ validator: validateSuppressEndTime, trigger: 'change' }]
        },
        // （质检）遏制
        qtSuppress: {
          materialCode: [
            { validator: validateMaterialcode, trigger: 'change' }
          ],
          batchNo: [{ validator: validateBatch, trigger: 'change' }],
          equipmentCode: [
            { validator: validatEquipmentCode, trigger: 'change' }
          ],
          processCode: [{ validator: validatProcessCode, trigger: 'change' }],
          moldCode: [{ validator: validatMoldCode, trigger: 'change' }],
          startTime: [{ validator: validateStartTime, trigger: 'change' }],
          // 结束时间。
          endTime: [{ validator: validateSuppressEndTime, trigger: 'change' }]
        },
        // 遏制列表
        suppressList: {
          personCode: [{ validator: validateNull, trigger: 'change' }],
          startTime: [{ validator: validateNull, trigger: 'change' }],
          // 结束时间。
          endTime: [{ validator: validateNull, trigger: 'change' }]
        },
        // 断链
        link_repair: {
          batchNo: [{ validator: validateBatch, trigger: 'change' }],
          materialCode: [
            { validator: validateMaterialcode, trigger: 'change' }
          ],
          startTime: [{ validator: validateStart, trigger: 'change' }],
          // 结束时间。
          endTime: [{ validator: validateTime, trigger: 'change' }]
        }
      }

      // 根据当前配的返回对应的规则。
      let oRule = {}
      for (let key in this.keys) {
        if (oAllRules[this.tab][key]) {
          oRule[key] = oAllRules[this.tab][key]
        }
      }

      // 为了将页面中*都不存在。
      return oRule
    }
  },
  methods: {
    setHeight () {
      if (this.formHeight && Number(this.formHeight)) {
        this.conditionHeight = this.formHeight - this.nBottomHeight + 'px'
      }
    },
    outerHeight (el) {
      var height = el.offsetHeight
      var style = el.currentStyle || getComputedStyle(el)

      height += parseInt(style.marginTop) + parseInt(style.marginBottom)
      return height
    },
    getNameByKey (sKey) {
      let aItem = this.items.filter(o => o.key === sKey)

      if (aItem && aItem.length) {
        return aItem[0].name
      } else {
        return ''
      }
    },
    submitForm (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          // 保存搜索条件。
          let oKeys = {}
          for (let key in this.keys) {
            //                          this.keys[key] = this.ruleForm[key];
            oKeys[key] = this.ruleForm[key]
          }

          let oConditions = {
            keys: oKeys, // this.keys,
            radio: this.active.radio,
            title: this.title
          }

          this.active.keys = oKeys // this.keys;
          this.handleSubmit(oConditions)
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm (formName) {
      // 清空所有数据。
      this.$refs[formName].resetFields()
      // 清空数据。
      // debugger
      for (let key in this.ruleForm) {
        this.ruleForm[key] = ''
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
  line-height: 14px;
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
  margin-top: 50px;
}
.el-form-item__content {
  .el-input {
    width: 100%;
  }
}
</style>
