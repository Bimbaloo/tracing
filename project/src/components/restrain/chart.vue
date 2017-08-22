<!--设备列表-->
<template>
    <div class="router-content" id="router-echart">
        <div class="innner-content">			
			<v-equipment
				:equipments="equipments"
				:process="node.process"  
				:datetime="datetime">
			</v-equipment>
		</div>
		
    </div>      
</template>

<script>
	import equipment from "components/equipment/equipmentsChart"

    export default {
		components: {
			'v-equipment': equipment
		},
        data () {
            return {
                // 点击的工序节点信息。
                node: {},
				equipments: [],
				datetime:{},
				empty: "暂无数据。"
            }
        },
        computed: {		
        },
        created () {
            // 组件创建完后获取数据，
            // 此时 data 已经被 observed 了
			this.setEquipmentList();
        },
        mounted () {       
        },
        watch: {
            // 如果路由有变化，会再次执行该方法
            '$route': 'setEquipmentList'
        },
        methods: {
			/**
			 * 设置设备列表。
			 * @return {void}
			 */
			setEquipmentList () {
				
				this.equipments = [];

				let oQuery = this.$route.query || {},
					equipmentId = oQuery.equipmentId,
					start = oQuery.startTime,
					end = oQuery.endTime;

				this.equipments.push({
					equipmentId: oequipmentId,
					shiftStartTime: start,
					shiftEndTime:end
				})

				this.datetime = {
					start: start,
					initStart: start,
					end: end,
					initEnd: end
				}
			}
        }
    }  
</script>

<style lang="less"> 

	#router-echart	{
		overflow: hidden;
	}
</style>
