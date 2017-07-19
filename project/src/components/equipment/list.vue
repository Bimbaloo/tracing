<!--设备-->
<template>
    <div :class="[{detailed: show}, 'content-list']" v-loading="loading">
		<div class="handle clear">
			<label>视窗时间：</label><el-input v-model="windowTime.interval" class="time" type="number" :min="windowTime.min" :max="windowTime.max" @blur="inputTimeBlur"></el-input><label>分钟</label>
			<span>{{windowTime.start}}</span><span class="split">~</span>
			<span>{{windowTime.end}}</span>
			<i class="icon icon-20 icon-show" v-if="show" @click="show=false"></i>
			<i class="icon icon-20 icon-hide" v-else @click="show=true"></i>
			<div class="legend">
				<span v-for="state in states" :key="state.key" :style="{backgroundColor: state.color}">{{state.name}}</span>
			</div>
		</div>
		<div class="analysis">
			<div class="name">
				<label @click="showEquipmentDetail(info)" v-for="info in equipments" v-show="equipmentData[info.equipmentId] && equipmentData[info.equipmentId].selected">{{info.equipmentName}}<i class="el-icon-d-arrow-right"></i></label>
			</div>
			<div v-if="sErrorMessage" class="empty">{{ sErrorMessage }}</div>
			<div v-else class="equipment">
				<v-equipmentLine 
					v-for="(info,index) in equipments" 
					v-show="equipmentData[info.equipmentId] && equipmentData[info.equipmentId].selected" 
					:key="info.equipmentId" 
					:visible="show"
					:euqipment-index="index" 
					:euqipment-status="equipmentData[info.equipmentId] && equipmentData[info.equipmentId].status" 
					:euqipment-work="equipmentData[info.equipmentId] && equipmentData[info.equipmentId].work" 
					:euqipment-quality="equipmentData[info.equipmentId] && equipmentData[info.equipmentId].quality" 
					:euqipment-event="equipmentData[info.equipmentId] && equipmentData[info.equipmentId].event" 
					:euqipment-repair="equipmentData[info.equipmentId] && equipmentData[info.equipmentId].repair" 
					:euqipment-tool="equipmentData[info.equipmentId] && equipmentData[info.equipmentId].tool" 
					:dimension-data="dimensionData" 
					:ratio="ratio" 
					:date-time="datetime" 
					:window-time="windowTime"></v-equipmentLine>
			</div>
		</div>
		<div class="timeline">
			<div class="line clear" @click="moveSlider" ref="line">
				<i class="icon icon-20 icon-start"></i>
				<i class="icon icon-20 icon-end"></i>
				<div class="slider" @mousedown="dragSlider" @click="preventMove" ref="slider" :style="{width: 100/ratio + '%', left: windowTime.left + '%'}"></div>
			</div>		
			<div class="setting clear">
				<div class="start">		    
					<span v-if="startIf" @dblclick="startIf=false">{{datetime.start}}</span>
					<div v-else class="edit">
						<v-datetime :form-data="datetime" key-data="start"></v-datetime>
						<span class="edit-icon">
							<i class="el-icon-circle-check" @click="saveStart"></i>
							<i class="el-icon-circle-cross" @click="cancelStart"></i>
						</span>
					</div>
				</div>
				<div class="end">
					<span v-if="endIf" @dblclick="endIf=false">{{datetime.end}}</span>
					<div v-else class="edit">
						<v-datetime :form-data="datetime" key-data="end"></v-datetime>
						<span class="edit-icon">
							<i class="el-icon-circle-check" @click="saveEnd"></i>
							<i class="el-icon-circle-cross" @click="cancelEnd"></i>
						</span>
					</div>
				</div>
			</div>					
		</div>   
    </div>      
</template>

<script>
	import DateTime from 'components/basic/dateTime.vue'
	import EquipmentLine from 'components/equipment/equipmentLine.vue'

    export default {
		props: {
			equipments: Array,
			checkedEquipments: Array,
			dimensionData: [Array, String],
			windowTime: Object,
			process: String
		},
		components: {
			'v-datetime': DateTime,
			'v-equipmentLine': EquipmentLine
		},
        data () {
            return {
				show: false,		
				oTest: {
					"1": [{
						"equipmentId": 175,
						"equipStatusList" : [{
							"startTime" : "2017-06-23 8:00:00",
							"endTime" : "2017-06-23 8:30:00",
							"type" : "close"
						},{
							"startTime" : "2017-06-23 8:30:00",
							"endTime" : "2017-06-23 14:00:00",
							"type" : "run"
						},{
							"startTime" : "2017-06-23 14:00:00",
							"endTime" : "2017-06-23 14:30:00",
							"type" : "debug"
						},{
							"startTime" : "2017-06-23 14:30:00",
							"endTime" : "2017-06-23 16:30:00",
							"type" : "stop"
						},{
							"startTime" : "2017-06-23 16:30:00",
							"endTime" : "2017-06-23 17:00:00",
							"type" : "close"
						}]
					}],
					"2": [{
						"equipmentId": 202,
						"startWorkList" : [{
							"groupId" : 1,
							"happenTime" : "2017-06-23 8:30:00",
							"doCode" : "D201603310017", 
							"personName" : "李瑞娇",
							"processName" : "GP12"
						}],
						"finishWorkList" : [{
							"groupId" : 1,
							"happenTime" : "2017-06-23 14:00:00",
							"doCode" : "D201603310017", 
							"personName" : "李瑞娇",
							"processName" : "GP12"
						}],
						"poolInList" : [{
							"groupId" : 3,
							"happenTime" : "2017-06-23 9:00:00",
							"doCode" : "D201603310017", 
							"materialName" : "ZC/SGE LFV 活塞总成/环销卡簧连杆/新型线/12667058", 
							"materialCode" : "10000515",
							"batchNo" : "20160331A",
							"quantity" : 20,
							"personName" : "李瑞娇"
						}],
						"poolOutList" :[{
							"groupId" : 3,
							"happenTime" : "2017-06-23 13:30:00",
							"doCode" : "D201603310017",
							"materialName" : "ZC/SGE LFV 活塞总成/环销卡簧连杆/新型线/12667058", 
							"materialCode" : "10000515",
							"batchNo" : "20160331A",
							"quantity" : 20,
							"goodNum" : 18,
							"badNum" : 1,
							"personName" : "李瑞娇"
						}]
					}],				
					"3": [{
						"equipmentId": 202,
						"qcList" :[{
							"startTime" : "2017-06-23 9:30:33",
							"endTime" : "2017-06-23 10:35:33",
							"personName" : "李瑞娇",
							"method" : "xxx",
							"result" : "bad"
						}],
						"submitQcList" :[{
							"happenTime" : "2017-06-23 12:00:00",
							"requestId" : "xxxxxxxx",
							"doCode" : "D201703310017",
							"materialName" : "ZC/SGE LFV 活塞总成/环销卡簧连杆/新型线/12667058", 
							"materialCode" : "10000515",
							"batchNo" : "20160331A",
							"type" : "化验",
							"quantity" : 20,
							"personName" : "李瑞娇",
							"method" : "xxx",
							"result" : "pass",
							"checkTime" : "2017-06-23 14:00:00",
							"checkPersonName" : "李瑞娇",
							"reportpath" : "\\192.168.1.2\report\XXXX\YYYY"
						}]
					}]
				},
				loading: false,
				sErrorMessage: "",
                url: HOST + "/api/v1/trace/equipments-events",	
				// 比例。
				ratio: 1,
				// 设备状态。
				states: [{
					key: "run",
					name: "加工",
					color: "#72b733"
				},{
					key: "stop",
					name: "停机",
					color: "#fac41b"
				},{
					key: "debug",
					name: "调试",
					color: "#009aff"
				},{
					key: "close",
					name: "关机",
					color: "#999"
				}],				
				startIf: true,
				endIf: true,
				eventData: {},
				equipmentData: {},
				datetime: {
					start: "",
					initStart: "",
					end: "",
					initEnd: ""
				}
            }
        },
        computed: {
			rawData () {
		    	return this.$store.state.rawData
		  	},
			// equipmentData () {				
			// 	let oData = {};
			// 	this.equipments.forEach(o => {
			// 		let sId = o.equipmentId;
			// 		oData[sId] = {
			// 			selected: this.checkedEquipments.indexOf(sId) > -1,
			// 			status: [],
			// 			// 加工
			// 			work: {},
			// 			// 质量
			// 			quality: {},
			// 			// 事件
			// 			event: {},
			// 			// 维护
			// 			repair: {},
			// 			// 工具
			// 			tool: {}
			// 		}
			// 	})	
			// 	return oData;			
			// },			
			// datetime () {
			// 	let start = "",
			// 		end = "";
			// 	this.checkedEquipments.forEach((id, index) => {
			// 		let equipment = this.equipments.filter(o => o.equipmentId == id)[0];
			// 		if(equipment) {
			// 			let sTemp = equipment.shiftStartTime,
			// 				eTemp = equipment.shiftEndTime
			// 			if(!index) {
			// 				start = sTemp;
			// 				end = eTemp;
			// 			}else{
			// 				if(start > sTemp) {
			// 					start = sTemp;
			// 				}
			// 				if(end < eTemp) {
			// 					end = eTemp;
			// 				}
			// 			} 									
			// 		}					
			// 	})

			// 	return {
			// 		start: start,
			// 		initStart: start,
			// 		end: end,
			// 		initEnd: end
			// 	}
			// },
        },
        created () {
            // 组件创建完后获取数据，
            // 此时 data 已经被 observed 了
			// 设置窗口时长。
			this.init();
        },
        mounted () {

        },
        watch: {
			// 选中维度变化。
			dimensionData: function() {
				this.getDimensionData();					
			},
			// 选中设备变化。
			checkedEquipments: function() {
				// debugger
				this.equipments.forEach(o => this.equipmentData[o.equipmentId] && (this.equipmentData[o.equipmentId].selected = this.checkedEquipments.indexOf(o.equipmentId) > -1))			
			},
			// 为了每次点击都会查询。
			"$route": function() {
				if(typeof this.dimensionData == "string") {
					// 设备列表页面。
					this.init();
				}			
			}
        },
        methods: {
			init() {
				this.setInitData();
				
				this.setWindowTime();

				if(typeof this.dimensionData == "string") {
					// 设备列表页面。
					// 查询设备状态。
					this.fetchData("1");
				}else {
					// 设备详情页面。
					// 获取所有数据。
					this.fetchAllData();
				}
			},
			// 初始化数据。
			setInitData() {
				// debugger
				this.show = false;
				this.ratio = 1;
				this.startIf = true;
				this.endIf = true;
				this.eventData = {};
					
				let oData = {};
				this.equipments.forEach(o => {
					let sId = o.equipmentId;
					oData[sId] = {
						selected: this.checkedEquipments.indexOf(sId) > -1,
						status: [],
						// 加工
						work: {},
						// 质量
						quality: {},
						// 事件
						event: {},
						// 维护
						repair: {},
						// 工具
						tool: {}
					}
				})	
				this.equipmentData = oData;

				let start = "",
					end = "";
				this.checkedEquipments.forEach((id, index) => {
					let equipment = this.equipments.filter(o => o.equipmentId == id)[0];
					if(equipment) {
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
					}					
				})

				this.datetime = {
					start: start,
					initStart: start,
					end: end,
					initEnd: end
				}


			},
			// 判断调用接口是否成功。
			judgeLoaderHandler(param,fnSu,fnFail) {
				let bRight = param.data.errorCode;
				
				// 判断是否调用成功。
				if(bRight != "0") {
					// 提示信息。
//					this.sErrorMessage = param.data.errorMsg.message;
//					this.showMessage();
					this.sErrorMessage = "暂无数据";
					console.log(param.data.errorMsg.message);
					// 失败后的回调函。
					fnFail && fnFail();
				}else {
					// 调用成功后的回调函数。
					fnSu && fnSu();
				}
			},
			// 显示提示信息。
			showMessage() {
				this.$message({
					message: this.sErrorMessage,
					duration: 3000
				});
			},
			getDimensionData () {
				if(typeof this.dimensionData == "string") {
					// 设备列表，单维度查看。
					if(this.dimensionData == 1 || this.dimensionData == 2 || this.dimensionData == 3) {
						this.fetchData(this.dimensionData);
					}
				}else {
					// 设备详情，多维度查看。
					this.dimensionData.forEach(dimension => {
						if(dimension == 1 || dimension == 2 || dimension == 3) {
							this.fetchData(dimension);
						}
						
					})
				}	
			},
			// 获取设备所有数据。
			fetchAllData() {
				this.loading = true;	

				// setTimeout(() => {
				// 	this.loading = false;
					
				// 	this.eventData = Object.assign({}, this.oTest);;
				// 	["1", "2", "3", "4", "5", "6"].forEach(type => this.formatEquipmentData(type, this.eventData[type]));
					
				// }, 1000)		
				// debugger		
				this.$post(this.url, {
					equipmentIdList: this.checkedEquipments.join(","),
					startTime: this.datetime.start,
					endTime: this.datetime.end,
					type: 0
				})
				.then((res) => {
					this.loading = false;
					this.judgeLoaderHandler(res, () => {
						// 保存数据。
						let oData = res.data.data[0];

						if(!oData) {
							return;
						}
						this.eventData["1"] = [{
							equipmentId: oData.equipmentId,
							equipStatusList: oData.equipStatusList
						}];	
						
						this.eventData["2"] = [{
							equipmentId: oData.equipmentId,
							startWorkList: oData.startWorkList,
							finishWorkList: oData.finishWorkList,
							poolInList: oData.poolInList,
							poolOutList: oData.poolOutList
						}];	

						this.eventData["3"] = [{
							equipmentId: oData.equipmentId,
							qcList: oData.qcList,
							submitQcList: oData.submitQcList
						}];

						this.eventData["4"] = [{
							equipmentId: oData.equipmentId,
							startEquipWarningList: oData.startEquipWarningList,
							endEquipWarningList: oData.endEquipWarningList
						}];

						this.eventData["5"] = [{
							equipmentId: oData.equipmentId,
							spotCheckList: oData.spotCheckList,
							startEquipRepairList: oData.startEquipRepairList,
							endEquipRepairList: oData.endEquipRepairList
						}];

						this.eventData["6"] = [{
							equipmentId: oData.equipmentId,
							installToolList: oData.installToolList,
							removeToolList: oData.removeToolList
						}];
				
						["1", "2", "3", "4", "5", "6"].forEach(type => {
							if(this.eventData[type]) {
								this.formatEquipmentData(type, this.eventData[type])
							}
						});					
					});
				})
				.catch((err) => {
					this.loading = false;
//				 	this.sErrorMessage = "查询出错";  
//				 	this.showMessage();
				 	this.sErrorMessage = "暂无数据";
					console.log("查询出错");
				})
			},
			/**
			 * 获取数据。
			 * @return {void}
			 */
            fetchData (type) {   
				if(this.eventData[type]) {
					// 若数据已加载。
					return;
				}
				this.loading = true;	
				// setTimeout(() => {
				// 	this.loading = false;
				// 	this.eventData[type] = Object.assign([], this.oTest[type]);
				// 	this.formatEquipmentData(type, this.eventData[type]);
				// }, 1000)

				this.$post(this.url, {
					equipmentIdList: this.checkedEquipments.join(","),
					startTime: this.datetime.start,
					endTime: this.datetime.end,
					type: type
				})
				.then((res) => {
					this.loading = false;
					this.judgeLoaderHandler(res,() => {
						// 保存数据。
						this.eventData[type] = res.data.data;				
						this.formatEquipmentData(type, this.eventData[type]);						
					});					
				})
				.catch((err) => {
					this.loading = false;
//				 	this.sErrorMessage = "查询出错";  
//				 	this.showMessage();
				 	this.sErrorMessage = "暂无数据";
					console.log("查询出错");
				})
           	},
			/**
			 * 格式化设备数据。
			 * @param {Stirng} sType
			 * @param {Array} aoData
			 * @return {void}
			 */
			formatEquipmentData(sType, aoData) {
				
				if(!aoData) {
					return;
				}
				
				switch(sType) {
					case "1":
						aoData.forEach(oData => this.equipmentData[oData.equipmentId] && (this.equipmentData[oData.equipmentId].status = oData.equipStatusList));
						break;
					case "2":
					 	aoData.forEach(oData => this.equipmentData[oData.equipmentId] && (this.equipmentData[oData.equipmentId].work = oData));
						break;
					case "3":
					 	aoData.forEach(oData => this.equipmentData[oData.equipmentId] && (this.equipmentData[oData.equipmentId].quality = oData));
						break;
					case "4":
					 	aoData.forEach(oData => this.equipmentData[oData.equipmentId] && (this.equipmentData[oData.equipmentId].event = oData));
						break;
					case "5":
					 	aoData.forEach(oData => this.equipmentData[oData.equipmentId] && (this.equipmentData[oData.equipmentId].repair = oData));
						break;
					case "6":
					 	aoData.forEach(oData => this.equipmentData[oData.equipmentId] && (this.equipmentData[oData.equipmentId].tool = oData));
						break;
					default:;
				}
			},
			// 保存开始时间。
			saveStart () {
				this.datetime.start = new Date(this.datetime.start).Format("yyyy-MM-dd hh:mm:ss");
				this.datetime.initStart = this.datetime.start;
				this.startIf=true;
				this.setWindowTime();
				this.refreshData();
			},
			// 取消保存开始时间。
			cancelStart () {
				this.datetime.start = this.datetime.initStart;
				this.startIf=true;
			},
			// 保存结束时间。
			saveEnd () {
				this.datetime.end = new Date(this.datetime.end).Format("yyyy-MM-dd hh:mm:ss");
				this.datetime.initEnd = this.datetime.end;
				this.endIf=true;
				this.setWindowTime();
				this.refreshData();
			},
			// 取消保存结束时间。
			cancelEnd () {
				this.datetime.end = this.datetime.initEnd;
				this.endIf=true;
			},
			// 设置窗口时长。
			setWindowTime () {
				this.windowTime.interval = (new Date(this.datetime.end).getTime() - new Date(this.datetime.start).getTime())/1000/60;

				this.windowTime.start = this.datetime.start;
				this.windowTime.max = this.formatData(this.windowTime.interval, 2);//Math.floor

				if(this.windowTime.interval > 30) {				
					this.ratio = this.windowTime.interval/30;
					this.windowTime.interval = 30;
					this.windowTime.min = 1;
					this.windowTime.end = new Date(new Date(this.windowTime.start).getTime() + this.windowTime.interval*60*1000).Format("yyyy-MM-dd hh:mm:ss");
				}else {
					this.ratio = 1;
					this.windowTime.end = this.datetime.end;
					this.windowTime.min = 0;
				}
				
			},
			
			/**
			 * 数据刷新。
			 * @return {void}
			 */
			refreshData () {
				if(typeof this.dimensionData == "string") {
					// 若为设备列表页面。				
					for(let p in this.equipmentData) {
						this.equipmentData[p].status = [];					
					}
					this.eventData["1"] = null;
					this.fetchData("1");

					if(this.dimensionData) {
						this.eventData[this.dimensionData] = null;
						this.fetchData(this.dimensionData);
					}
					
				}else {
					// 若为设备详情页面。
					let aType = ["1"];
					this.eventData["1"] = null;
					this.dimensionData.forEach(d => {
						this.eventData[d] = null;
						aType.push(d);
					})
				
					for(let p in this.equipmentData) {
						aType.forEach(s => {
							switch(s) {
								case "1": 
									this.equipmentData[p].status = [];
									break;
								case "2": 
									this.equipmentData[p].work = {};	
									break;
								case "3": 
									this.equipmentData[p].quality = {};
									break;
								case "4": 
									this.equipmentData[p].event = {};	
									break;
								case "5": 
									this.equipmentData[p].repair = {};
									break;
								case "6": 
									this.equipmentData[p].tool = {};	
									break;
							}
							
						})
											
					}

					this.fetchAllData();
				}
			},

			/**
			 * 跳转到单设备分析。
			 * @param {Object} oData
			 * @return {void}
			 */
			showEquipmentDetail (oData) {
				let self = this;				
				if(typeof this.dimensionData == "string") {
					// 若为设备列表页面。
					this.$router.push({ 
						path: `/process/detail`, 
						query: {
							equipmentId: oData.equipmentId,
							equipmentName: oData.equipmentName,
							shiftStartTime: oData.shiftStartTime,
							shiftEndTime: oData.shiftEndTime,
							process: this.process
						}
					})
				}
			},
			
			/**
			 * @param {Object} event
			 * @return {void}
			 */
			moveSlider (event) {
				// 设置滑块位置。
				let maxLeft = event.currentTarget.offsetWidth - this.$refs.slider.offsetWidth,				
					nRatio = 0;
				
				if(event.target.getAttribute("class").indexOf("icon-start") > -1) {
					this.$refs.slider.style.left = 0;
				}else if(event.target.getAttribute("class").indexOf("icon-end") > -1) {					
					nRatio = this.formatData(maxLeft*100/event.currentTarget.offsetWidth, 2);//Math.floor
				}else if(event.target.getAttribute("class").indexOf("slider") > -1){
					
					let left = event.offsetX + event.target.offsetLeft
					nRatio = this.formatData((left > maxLeft ? maxLeft : left)*100/event.currentTarget.offsetWidth, 2);//Math.floor
				}else {
					
					let left = event.offsetX + event.target.offsetLeft
					if(event.offsetX > maxLeft) {
						left = maxLeft;
					}else if(event.offsetX < 0) {
						left = 0;
					}else {
						left = event.offsetX;
					}
					nRatio = this.formatData(left*100/event.currentTarget.offsetWidth, 2);//Math.floor
				}	

				let nStart = new Date(this.datetime.start).getTime()*(1-nRatio/100) + nRatio/100*(new Date(this.datetime.end).getTime());
				this.windowTime.start = new Date(nStart).Format("yyyy-MM-dd hh:mm:ss");
				this.windowTime.end =  new Date(nStart + this.windowTime.interval*60*1000).Format("yyyy-MM-dd hh:mm:ss")
				this.windowTime.left = nRatio;
			},
			/**
			 * 格式化数据，保留特定小数位数。
			 */
			formatData (value, pos) {
				return Math.floor(value*Math.pow(10, pos))/Math.pow(10, pos);
			},
			// 滑块拖动事件。
			dragSlider (event) {
				// debugger
				// 阻止冒泡事件。
				event.stopPropagation();
				event.preventDefault();

				let self = this,
					slider = event.target,
					line = self.$refs.line,
					nLeft = parseFloat(slider.style.left.split("%")[0]),
					nMouseX = event.clientX,
					// nMax = (1 - slider.offsetWidth/line.offsetWidth)*100,
					nRatio = 0;
					
				// 鼠标移动事件。
				window.addEventListener("mousemove", _moveHandler);
				window.addEventListener("mouseup", _upHandler);

				/**
				 * @param {Object} e
				 * @return {void}
				 */
				function _moveHandler(e) {	
					e.stopPropagation();
					e.preventDefault();		

					
					// nRatio = nLeft + (e.clientX - nMouseX)*100/line.offsetWidth;
					// debugger
					
					// if(nRatio < 0) {
					// 	nRatio = 0;
					// }else if(nRatio > nMax) {
					// 	nRatio = Math.floor(nMax);//formatData
					// }
					// 移动后的位置。
					nRatio = nLeft*line.offsetWidth/100 + e.clientX - nMouseX;
					if(nRatio < 0) {
						nRatio = 0;
					}else if(nRatio  + slider.offsetWidth >  line.offsetWidth) {
						nRatio = line.offsetWidth - slider.offsetWidth;
					}
					nRatio = nRatio*100/line.offsetWidth;
					slider.style.left = nRatio + "%";

					_setWindowTime();
						
				}
				/**
				 * 设置视窗时间。
				 */
				function _setWindowTime() {
					let nStart = new Date(self.datetime.start).getTime()*(1-nRatio/100) + nRatio/100*(new Date(self.datetime.end).getTime());
					self.windowTime.start = new Date(nStart).Format("yyyy-MM-dd hh:mm:ss");
					self.windowTime.end =  new Date(nStart + self.windowTime.interval*60*1000).Format("yyyy-MM-dd hh:mm:ss")
					self.windowTime.left = nRatio;	
				}
				/**
				 * @param {Object} e
				 * @return {void}
				 */
				function _upHandler(e) {
					e.stopPropagation();
					e.preventDefault();

					window.removeEventListener("mousemove", _moveHandler);
					window.removeEventListener("mouseup", _upHandler);				
				}
			
			},
			// 阻止移动事件。
			preventMove (event) {
				// 阻止冒泡事件。
				event.stopPropagation();
				event.preventDefault();
			},
			// 输入框失去焦点事件,设置视窗。
			inputTimeBlur () {
				let nInterval = this.windowTime.interval*60*1000,
					nEnd = new Date(this.windowTime.start).getTime() + nInterval;

				if(window.Rt.utils.DateDiff(nEnd, this.datetime.end) < 0) {
					// 若超出结束时间。
					this.windowTime.end = this.datetime.end;
					this.windowTime.start = new Date(new Date(this.datetime.end).getTime()
											- nInterval).Format("yyyy-MM-dd hh:mm:ss");
					this.windowTime.left = this.formatData(window.Rt.utils.DateDiff(this.datetime.start, this.windowTime.start)*100
											/ window.Rt.utils.DateDiff(this.datetime.start, this.datetime.end), 2);//Math.floor
				}else {
					this.windowTime.end = new Date(nEnd).Format("yyyy-MM-dd hh:mm:ss");	
				}
				
				this.ratio = window.Rt.utils.DateDiff(this.datetime.start, this.datetime.end)/1000/60/this.windowTime.interval;		
				// this.$refs.slider.style.width = 100/this.ratio + "%";
			}
        }
    }  
</script>

<style lang="less">    
	.material-stock  {	  	
    	.content-list {
			padding-top: 30px;

			.handle {
				padding: 0 170px 0 0;

				.time {
					width: auto;
				}
				input {
					width: 40px;
					height: 30px;
					text-align: center;
					border-radius: 0;
					padding: 0;
				}
				label {
					display: inline-block;
					margin: 0 10px;
				}
				.split {
					padding: 0 5px;
				}
				.legend {
					float: right;
					span {
						display: inline-block;
						width: 60px;
						height: 30px;
						line-height: 30px;
						text-align: center;
						color: #fff;
						margin-left: 20px;
					}
				}
			}

			.analysis {
				display: flex;
				padding-right: 170px;
				margin-bottom: 50px;
				
				.name {
					width: 150px;
					flex: 0 150px;

					label {
						display: block;
						margin: 20px 0;
						cursor: pointer;

						&:first-child {
							margin-top: 40px;
						}

						&:hover {
							overflow: visible;	
							color: #42af8f;
						}

						i {
							display: inline-block;
							font-size: 12px;
							margin-left: 10px;
						}	
					}
				}
				.empty {
					margin-top: 20px;
				}
				.equipment {
					flex: 1 1;
					overflow: hidden;
					position: relative;
				}
			}

			.timeline {
				position: absolute;
				bottom: 10px;
				width: 100%;
				background-color: rgba(255,255,255,0.6);
				right: 8px; // 防止透明部分盖住滚动条 
				z-index: 1;
				.line {
					margin: 0 170px 0 150px;
					background: url(../../assets/img/line.png) repeat;
					position: relative;

					cursor: pointer;

					.icon-start {
						background-color: #fff;
						margin-left: -20px;
						top: 0;
					}
					.icon-end {
						float: right;
						background-color: #fff;
						margin-right: -20px;
						top: 0;
					}
				}
				// 滑块。
				.slider {
					position: absolute;
					border: 2px solid #42af8f;
					background-color: #fff;
					height: 20px;
					box-sizing: border-box;
					left: 0;
					top: 0;
					
					
					&:hover {
						background-color: #42af8f;
					}
				}
				.setting {
					height: 30px;
					line-height: 30px;
					padding: 0 100px 0 60px;

					.start,.end {
						width: 180px;
						text-align: center;
					}
					.start {
						float: left;
					}
					.end {
						float: right;
					}
					.edit {
						position: relative;

						.edit-icon {
							position: absolute;
							right: -40px;
							top: 0;
							i {
								cursor: pointer;
								color: #bfd9d4;
								&:hover {
									color: #42af8f;
								}
							}
							i + i {
								margin-left: 5px;
							}
						}
					}
					.el-input__inner {
						height: 30px;
						border-radius: 0;
					}

				}

			}
    	}
    }
</style>
