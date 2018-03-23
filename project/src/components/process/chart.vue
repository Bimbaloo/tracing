<!--设备列表-->
<template>
  <div class="router-content" id="router-echart">
    <div class="inner-content">
            <!-- <h2 class="content-title">
            	工序&nbsp;—&nbsp;{{processName}}
            </h2>			 -->
			<v-equipment v-if="bShowEq"
				:equipments-id="equipments"
				:process="processKey"
				:datetime="datetime">
			</v-equipment>
			<div v-else class="empty">{{empty}}</div>
		</div>
  </div>
</template>

<script>
import equipment from 'components/equipment/equipmentsChart'

export default {
  components: {
    'v-equipment': equipment
  },
  data () {
    return {
      // 点击的工序节点信息。
      node: {},
      equipments: [],
      datetime: {},
      empty: '暂无数据。',
      tag: this.$route.query._tag
    }
  },
  computed: {
    rawData () {
      return this.$store.state.rawData
    },
    detailInfos () {
      return this.$store.state.detailInfos
    },
    nodeType () {
      return (this.$route.query && this.$route.query.key) || ''
    },
    processKey () {
      return (this.$route.query && this.$route.query.code) || '' // key
    },
    processName () {
      return (this.$route.query && this.$route.query.name) || ''
    },
    bShowEq () {
      return (
        this.equipments.length &&
        this.equipments.some(o => o.shiftStartTime && o.shiftEndTime)
      )
    }
  },
  created () {
    // 组件创建完后获取数据，
    // 此时 data 已经被 observed 了
    this.setEquipmentList()
    this.setDateTime()
  },
  mounted () {},
  watch: {
    // 如果路由有变化，会再次执行该方法
    $route: function (to, from) {
      // 如果从tree上直接点击，需要更新数据. tag不同
      // 从其他页面中进入。from.meta.title不一样
      if (
        to.meta.title === 'chart' &&
        (from.meta.title === 'chart' ||
          (to.query._tag !== undefined && this.tag !== to.query._tag))
      ) {
        this.tag = to.query._tag
        this.setEquipmentList()
        this.setDateTime()
      }
    }
  },
  methods: {
    setDateTime () {
      let oQuery = this.$route.query || {}
      let start = oQuery.shiftStartTime
      let end = oQuery.shiftEndTime

      if (!start || !end) {
        // this.equipments.forEach((equipment, index) => {
        //   let sTemp = equipment.shiftStartTime
        //   let eTemp = equipment.shiftEndTime
        //   if (!index) {
        //     start = sTemp
        //     end = eTemp
        //   } else {
        //     if (start > sTemp) {
        //       start = sTemp
        //     }
        //     if (end < eTemp) {
        //       end = eTemp
        //     }
        //   }
        // })

        start = this.detailInfos.shiftStartTime
        end = this.detailInfos.shiftEndTime
      }

      if (start && start === end) {
        let date = start.split(' ')[0]
        start = date + ' 00:00:00'
        end = date + ' 23:59:59'
      }

      this.datetime = {
        start: start,
        initStart: start,
        end: end,
        initEnd: end,
        realStart: oQuery.startTime || start,
        realEnd: oQuery.endTime || end
      }
    },
    /**
     * 设置设备列表。
     * @return {void}
     */
    setEquipmentList () {
      this.equipments = []
      let oMap = this.detailInfos.equipmentOpIdMap
      Object.keys(oMap).forEach((sId) => {
        this.equipments.push({
          equipmentId: sId,
          equipmentName: '',
          shiftStartTime: this.detailInfos.shiftStartTime,
          shiftEndTime: this.detailInfos.shiftEndTime,
          operationIdList: oMap[sId]
        })
      })
    }
  }
}
</script>

<style lang="less">
#router-echart {
  overflow: hidden;

  .inner-content {
    height: 100%;
  }
}
</style>
