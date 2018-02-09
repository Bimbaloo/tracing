<template>
    <header>
        <img :src="logo" @click="goSearch"/>&nbsp;&nbsp;—&nbsp;&nbsp;追溯分析平台
        <v-tooltip :config="config" :back="back" :tool="tool"></v-tooltip>
    </header>
    
</template>
<script>
import logo from '../../static/logo.png' // 'assets/img/logo-w.png'
import tooltip from 'components/header/tooltip.vue'

export default {
  components: {
    'v-tooltip': tooltip
  },
  props: {
    // 是否需要设置链接。
    config: Boolean,
    // 是否需要返回链接。
    back: [Boolean, String],
    // 是否需要小工具链接。
    tool: {
      required: false,
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      logo
    }
  },
  computed: {
    // // 工厂配置数据。
    // configData() {
    //     return this.$store.state.customModule.config
    // },
    // // 配置图标。
    // logo() {
    //     return this.configData && this.configData.logo
    // }
  },
  methods: {
    goSearch () {
      window.open('search.html', '_self')
    }
  }
}
</script>
<style lang="less" scoped>
header {
  height: 68px;
  line-height: 68px;
  background-color: #333;
  /*padding-left: 40px;*/
  padding: 0 20px 0 40px;
  color: #fff;
  font-size: 18px;
  font-family: 微软雅黑;
  position: relative;

  img {
    // height: 48px;
    vertical-align: middle;
    cursor: pointer;
  }
}

// .header-icon {
// 	float: right;

//     .icon-back, .icon-config {
//         cursor: pointer;
//     }
//     .icon-config {
//         margin-left: 10px;
//     }
// }
</style>
