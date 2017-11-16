<!--仓库操作-->
<template>
    <div class="material-stock" ref="stock">
        <div class="view-icon">
            <i class="icon icon-20 icon-fullScreen" v-if="!fullscreen" @click="fullScreenClick(true)"  title="放大"></i>
            <i class="icon icon-20 icon-restoreScreen" v-else @click="fullScreenClick(false)"  title="缩小"></i>
        </div>
        <div class="path-btn">
        	<el-button class="btn btn-plain btn-restrain" @click="showSuspiciousList" v-if="batchIf && !restrainIf">可疑品</el-button>
            <el-button class="btn btn-plain btn-restrain" @click="showRestrain" v-if="btnShowRestrain && restrainIf">遏制</el-button>
        </div>
        <div class="router-path">
            <span class="path-item" v-if="true">库存转储</span>
            <span class="path-item" v-if="true">库存收货</span>
            <span class="path-item" v-if="true">库存发货</span>
            <span class="path-item" v-if="true">生产入库</span>
			<span class="path-item" v-if="true">生产发料</span>
            <span class="path-item" v-if="true">生产退料</span>
            <span class="path-item" v-if="true">销售退库</span>
			<span class="path-item" v-if="true">销售出库</span>
            <span class="path-item" v-if="true">采购入库</span>
            <span class="path-item" v-if="true">采购退库</span>
            <span class="path-item" v-if="true">库存损益</span>
			<span class="path-item" v-if="true">库存调整</span>
			<span class="path-item" v-if="true">调拨入库</span>
            <span class="path-item" v-if="true">调拨出库</span>
			<span class="path-item" v-if="true">成品发货</span>
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
					101:"stockTransfer", 			//库存转储
					102:"varastoonotto",			//库存收货
					103:"inventoryShipment",		//库存发货
					104:"producedStorage",			//生产入库
					105:"produceShipment",			//生产发料
					106:"productionWithdrawal",		//生产退料
					107:"saleRefunding",			//销售退库
					108:"saleOutWarehouse",			//销售出库
					109:"purchaseStorage",			//采购入库
					110:"purchasingWithdrawal",		//采购退库
					111:"stockGains",				//库存损益
					112:"stockAdjustment",			//库存调整
					113:"transferStorage",			//调拨入库
					114:"transferOutWarehouse",		//调拨出库
					115:"productDelivery",			//成品发货
				}
            }
        },
        computed: {
			fullscreen () {
		    	return this.$store.state.fullscreen
			},
			opType () {
		    	return this.$store.state.opType
			},
			operationIdList() {
		    	return this.$store.state.operationIdList
			},
		},
        created () {
            this.setRouteQuery();
        },
        watch: {
        },
        methods: {
			// 根据获取的 op_type 默认路由跳转
			setRouteQuery() {
				this.$router.replace({ 
					path: "/"+this.routerPath[this.opType],
					query: {
						"operationIdList":operationIdList,
						"_tag":  new Date().getTime().toString().substr(-5)
					},
					// query:{
					// 	"operationIdList":[
					// 		"78CBF5D3-77C3-4C9A-8534-44887F3AC35A",
					// 		"D4E60478-47B4-4CD4-BFE5-FA1A09A48FF7"
					// 	]
					// }										
				})

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
