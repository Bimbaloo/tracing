<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
    data() {
        return {}
    },
    created() {

    },
    mounted() {
        this.$router.push({ 
            path: '/parameter', 
            query: { equipmentName: "设备1", equipmentId: 216, startTime: '2017-07-01 02:00:00', endTime: '2017-07-01 04:00:00' }
        })
    }
}
</script>

<style lang="less" scoped>
    #app {
        height: 100%;
    }
</style>


