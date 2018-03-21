<template>
	<el-dialog class="dialog-wrap" title="视频监控" :visible.sync="dialogVisible" :before-close="handleClose">
        <i class="open-icon icon icon-16 icon-openNew" @click="openNewPage"></i>
        <v-video :equipment-name="equipmentName" :equipment-id="equipmentId" :time="time" :startDate="startDate" :endDate="endDate" :series="series"></v-video>
    </el-dialog>
</template>

<script>
import Monitor from 'components/monitor/monitor.vue'

export default {
  components: {
    'v-video': Monitor
  },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    equipmentName: {
      type: String,
      default: ''
    },
    equipmentId: {
      type: [String, Number],
      default: ''
    },
    /* timeh 和 [startDate,endDate]有且仅有一个 */
    time: {
      type: String,
      default: ''
    },
    startDate: {
      type: String,
      default: ''
    },
    endDate: {
      type: String,
      default: ''
    },
    series: {
      type: String,
      default: ''
    }
  },
  data () {
    return {}
  },
  created () {},
  methods: {
    handleClose () {
      this.$emit('hideDialog')
    },
    // 打开新页面。
    openNewPage () {
      this.$emit('hideDialog')
      // 打开 页面。
      if (this.time !== '') {
        window.open(
          `monitor.html?equipmentName=${this.equipmentName}&equipmentId=${this.equipmentId}&time=${this.time}&series=${this.series}`, '_blank'
        )
      } else if (this.startDate !== '' && this.endDate !== '') {
        window.open(
          `monitor.html?equipmentName=${this.equipmentName}&equipmentId=${this.equipmentId}&startDate=${this.startDate}&endDate=${this.endDate}&series=${this.series}`, '_blank'
        )
      }
    }
  }
}
</script>

<style scoped>
.open-icon {
  position: absolute;
  top: 20px;
  right: 54px;
  cursor: pointer;
}
</style>
