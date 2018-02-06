<template>
    <el-button :type="type" @click.stop.prevent="clickHandler">{{ text }}</el-button>
</template>

<script>
export default {
  props: ['textData', 'typeData'],
  data () {
    return {
      text: this.textData
    }
  },
  computed: {
    // 当前节点的类型，默认为primary。
    type: function () {
      return this.typeData || 'primary'
    }
  },
  methods: {
    // 不是直接更新值，而是使用此方法来对输入值进行格式化和位数限制
    clickHandler: function (event) {
      // 触发到父组件中。
      this.$emit('query')
    }
  }
}
</script>
