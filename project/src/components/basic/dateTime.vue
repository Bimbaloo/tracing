<template>
    <el-date-picker
      v-model="formData[keyData]"
      :type="dateType"
      :placeholder="hint"
      :disabled="disabled"
      style="width: 100%;"
      @change.native = "dateChange"
      @change = "dateClick"
      value-format="yyyy-MM-dd HH:mm:ss">
    </el-date-picker>
</template>

<script>
export default {
  props: {
    formData: Object,
    placeholderData: String,
    keyData: String,
    dateType: {
      required: false,
      default: 'datetime'
    },
    disabled: {
      required: false,
      default: false
    },
    tab: {
      required: false,
      default: null
    },
    subTab: {
      required: false,
      default: null
    }
  },
  data () {
    return {
      form: this.formData,
      hint: this.placeholderData || '',
      key: this.keyData
    }
  },
  created () {},
  methods: {
    // 输入处理
    dateChange (event) {
      let sVal = event.target.value
      this.formData[this.keyData] = sVal
    },
    // 选中确定处理
    dateClick (value) {
      if (value !== undefined) {
        this.formData[this.keyData] = value
      } else {
        // 点击插件自动清空，返回是undefined
        this.formData[this.keyData] = ''
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-date-editor {
  width: 180px;
}
</style>
