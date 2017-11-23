<!--车间操作-->
<template>
    <div class="material-stock" ref="stock">
        <div class="view-icon">
            <i class="icon icon-20 icon-fullScreen" v-if="!fullscreen" @click="fullScreenClick(true)"  title="放大"></i>
            <i class="icon icon-20 icon-restoreScreen" v-else @click="fullScreenClick(false)"  title="缩小"></i>
        </div>
        <div class="router-path">
            <span class="path-item" v-if="routerName['newProcess']">工序</span>
            <span class="path-item" v-if="routerName['carryOver']">结转</span>
            <span class="path-item" v-if="routerName['returnMaterial']">退料</span>
            <span class="path-item" v-if="routerName['adjustableShop']">车间调整</span>
			<span class="path-item" v-if="routerName['reworkInbound']">返工入站</span>
            <span class="path-item" v-if="routerName['reworkOutbound']">返工出站</span>
        </div> 
        <keep-alive>
	        <router-view></router-view>  
        </keep-alive>
    </div>
</template>

<script>	

    export default {
        data () {
            return { 
                // 右下详情内容区域全屏标识。
				key: this.$route.params.key,    	//全屏标志
				routerPath:{
					10001:"newProcess", 				//工序
					10002:"carryOver",					//结转
					8:"returnMaterial",					//退料	  完成
					11:"adjustableShop",				//车间调整  待参数更新
					14:"reworkInbound",					//返工入站  暂无数据
					15:"reworkOutbound"					//返工出站	暂无数据
				},
				urls:[
					HOST + "/api/v1/trace/operation-detail/workshop/by-id", 	// 车间接口
					HOST + "/api/v1/trace/operation-detail/workshop/by-id", 	// 结转接口
					HOST + "/api/v1/trace/operation-detail/inout/by-id", 		// 投产接口				
				],
				routerName: {
					"newProcess":false,					//工序
					"carryOver":false,					//结转
					"returnMaterial":false,				//退料  
					"adjustableShop":false,				//车间调整
					"reworkInbound":false,				//返工入站
					"reworkOutbound":false,				//返工出站
				}
            }
        },
        computed: {
			fullscreen () {
		    	return this.$store.state.fullscreen
			},
			detailInfos () {
		    	return this.$store.state.detailInfos
			},
			nodeType () {
				return this.$store.state.nodeType
			},
			url() {
				if(this.nodeType === 10002){			//结转
					return this.urls[1]
				}else if(this.nodeType === 11) {		//车间调整
					return this.urls[0]
				}else {									//投产
					return this.urls[2]
				}
			}
		},
        created () {
            this.setRouteQuery();
        },
        watch: {
			"detailInfos": "setRouteQuery"
        },
        methods: {
			// 根据获取的 op_type 默认路由跳转
			setRouteQuery() {
				let operationIdList = []
				let traceInOutQueryDtoList = []
				if(this.nodeType === 10002){			//结转
					this.detailInfos.forEach(el => {
						operationIdList.push(el.opId)
					})
				}else if(this.nodeType === 11) {		//车间调整
					this.detailInfos.forEach(el => {
						operationIdList.push(el.opId)
					})
				}else {									//投产
					this.detailInfos.forEach(el => {
						let obj = {
							"opId": el.opId,
							"opType": el.opType,							
						}
						traceInOutQueryDtoList.push(obj)
					})
				}
				
				this.$router.replace({ 
					path: "workshop/"+this.routerPath[this.nodeType],
					query: {
						"operationIdList":operationIdList,
						"_tag":  new Date().getTime().toString().substr(-5),
						"url": this.url
					},									
				})

				this.routerName[this.routerPath[this.nodeType]] = true
			},
			// 详情全屏按钮点击事件
            fullScreenClick(isTrue) { 
				this.$store.commit({
					type: "updateFullscreen",
					key: isTrue // true:全屏
				});                
            }
        }
    }  
</script>

<style lang="less" scoped>
	.material-stock  {
		height: 100%;
		display: flex;
		flex-direction: column;
		position: relative;
							
        .view-icon {
            position: absolute;
            cursor: pointer;
            top: 15px;
            right: 10px;
            z-index: 10;
        }
        
		.path-btn {
        	position: absolute;
            top: 10px;
            right: 50px;
            z-index: 10;
        }
		.router-path {
			flex: 0 50px;
			height: 50px;
			line-height: 50px;
			border-bottom: 1px solid #ccc;
			font-size: 16px;
			box-sizing: border-box;
		}
		
		.router-content {
			flex: 1 1;
			overflow: auto;

			.btn-restrain {
				right: 10px;
                z-index: 10;
			}
			
			.table {
	    	    .batch {
	    	    	cursor: pointer;
		            color: #f90;
		            .cell {
		                font-weight: 600;
		            } 
		        }         
	    	   
	    	}    	
		}
	}
</style>
