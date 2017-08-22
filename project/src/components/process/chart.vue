<!--设备列表-->
<template>
    <div class="router-content" id="router-echart">
        <div class="innner-content">
            <h2 class="content-title">
            	工序&nbsp;—&nbsp;{{node.name}}
            </h2>			
			<v-equipment v-if="bShowEq" 
				:equipments="equipments"
				:process="node.code"  
				:datetime="datetime">
			</v-equipment>
			<div v-else class="empty">{{empty}}</div>
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
                styleObject: {
                    "min-width": "1000px"
                },
                // 点击的工序节点信息。
                node: {},
				equipments: [],
				datetime:{},
				empty: "暂无数据。"
            }
        },
        computed: {
			rawData () {
		    	return this.$store.state.rawData
		    },
			processKey () {
				return (this.$route.query && this.$route.query.key) || ''
			},
			bShowEq() {
				return this.equipments.length && this.equipments.some(o=>o.shiftStartTime && o.shiftEndTime)
			}			
        },
        created () {
            // 组件创建完后获取数据，
            // 此时 data 已经被 observed 了
			this.setEquipmentList();
			this.setDateTime();
        },
        mounted () {
            
        },
        watch: {
            // 如果路由有变化，会再次执行该方法
            '$route': function() {
				this.setEquipmentList();
				this.setDateTime();			
			}
        },
        methods: {
			setDateTime () {
				let oQuery = this.$route.query || {},
					start = oQuery.shiftStartTime,
					end = oQuery.shiftEndTime	

				if(!start || !end) {
					this.equipments.forEach((equipment, index) => {

						let sTemp = equipment.shiftStartTime,
							eTemp = equipment.shiftEndTime
						if(!index) {
							start = sTemp;
							end = eTemp;
						}else{
							if(start > sTemp) {
								start = sTemp;
							}
							if(end < eTemp) {
								end = eTemp;
							}
						} 									
									
					})

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
				
				this.equipments = [];
				
				let aoData = this.rawData,
					oNode = null;
				// 提取选中的工序节点数据。
				let aoFilter = this.rawData.filter(o => o.key == this.processKey);
				if(aoFilter.length) {
					oNode = aoFilter[0];
				// }else {
				// 	// 节点在子工序中。
				// 	this.rawData.map(o => {
				// 		if(o.subProcess) {
				// 			let aoNode = o.subProcess.filter(item => item.key == this.processKey);
				// 			if(aoNode.length) {
				// 				oNode = aoNode[0];
				// 			}
				// 		}			
									
				// 	})
				}
				
				this.node = oNode || {};	

				let oEquipments = {}; 	
				
				this.node.processInfoList && this.node.processInfoList.forEach(o => {
					if(!oEquipments[o.equipmentId]) {
						oEquipments[o.equipmentId] = [];
					}
					// if(o.equipmentId == 234) {
					// 	o.inHappenTimeList = ["2017-06-12 21:18:00", "2017-06-12 09:01:09"]
					// 	o.outHappenTimeList = ["2017-06-12 21:39:16", "2017-06-12 09:20:10"]
					// }else {
					// 	o.inHappenTimeList = ["2017-06-13 06:22:08"]
					// 	o.outHappenTimeList = ["2017-06-13 06:41:10"]
					// }
					oEquipments[o.equipmentId].push(o);
				})

				for(let p in oEquipments) {
					let sStart = "",
						sEnd = "";

					oEquipments[p].sort((a, b) => a.shiftStartTime > b.shiftStartTime);
					// 最早班次开始时间。
					sStart = oEquipments[p][0].shiftStartTime;
					oEquipments[p].sort((a, b) => a.shiftEndTime < b.shiftEndTime);
					// 最晚班次结束时间。
					sEnd = oEquipments[p][0].shiftEndTime;

					let aoPoolInTime = [],
						aoPoolOutTime = []

					oEquipments[p].forEach(o => {
						aoPoolInTime = aoPoolInTime.concat(o.inHappenTimeList)
						aoPoolOutTime = aoPoolOutTime.concat(o.outHappenTimeList)
					})
					
					// 去重。
					aoPoolInTime = [...new Set(aoPoolInTime)]
					aoPoolOutTime = [...new Set(aoPoolOutTime)]

					this.equipments.push({
						equipmentId: oEquipments[p][0].equipmentId,
						equipmentName: oEquipments[p][0].equipmentName,
						shiftStartTime: sStart,
						shiftEndTime:　sEnd,
						poolInTime:	aoPoolInTime,
						poolOutTime: aoPoolOutTime
					})
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
