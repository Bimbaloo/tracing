<!--遏制——设备分析-->
<template>
    <div class="router-content" id="router-echart">
        <div class="innner-content">			
			<v-equipment 
				:equipments-code="equipments"
				:datetime="datetime">
			</v-equipment>
			<!--div v-else class="empty">{{empty}}</div-->
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
      equipments: {},
      datetime: {},
      empty: '暂无数据。'
    }
  },
  computed: {
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
    this.setData()
  },
  mounted () {},
  watch: {
    // 如果路由有变化，会再次执行该方法
    '$route': 'setData'  // 按设备遏制的时候需要：路由变化重新设置查询条件
  },
  methods: {
    /**
     * 设置设备列表。
     * @return {void}
     */
    setData () {
      let oQuery = this.$route.query
      let start = oQuery.shiftStartTime
      let end = oQuery.shiftEndStartTime

      if (oQuery.startTime && !oQuery.shiftStartTime) {
        // 若只有开始时间，没有班次开始时间
        start = oQuery.startTime
      }
      if (oQuery.endTime && !oQuery.shiftEndStartTime) {
        // 若只有结束时间，没有班次结束时间
        end = oQuery.endTime
      }

      this.equipments = {
        equipmentCode: oQuery.equipmentCode.split(':')[0],
        shiftStartTime: start,
        shiftEndTime: end
      }

      this.datetime = {
        start: start,
        initStart: start,
        end: end,
        initEnd: end,
        realStart: oQuery.startTime || start,
        realEnd: oQuery.endTime || end
      }
    }
  }
}
</script>

<style lang="less">
#router-echart {
  overflow: hidden;
  height: 100%;
}
</style>
