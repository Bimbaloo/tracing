<!--自定义字段名称脚本-->
<template>
	<div class="content-factory">
    <el-menu
			class="side-menu"
      :default-active="activeKey"
			router
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b">
      <el-menu-item :index="list.route" v-for="(list,index) in customList" :key="index">
        <span slot="title">{{list.label}}</span>
      </el-menu-item>
    </el-menu>
		<keep-alive>
			<router-view></router-view>
		</keep-alive>
	</div>
</template>

<script>
export default {
  name: 'v-factory',
  data () {
    return {
      activeKey: '/factory/link'
    }
  },
  created () {},
  computed: {
    // 是否支持视频监控查看。
    camera () {
      return (
        this.$store.state.versionModule &&
        this.$store.state.versionModule.isVideoMonitorEnabled
      )
    },
    // 功能列表。
    customList () {
      let aoList = [
        {
          label: '外链页面(自制报表)',
          route: '/factory/link'
        }
      ]

      if (this.camera) {
        aoList.push({
          label: '视频监控',
          route: '/factory/camera'
        })
      }

      return aoList
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped>
// 引用基础定义。
@import "../../assets/css/base.less";

.content-factory {
  display: flex;
  width: 100%;

  .side-menu {
    flex-grow: 0;
  }
}
</style>
