<!--条码管理-->
<template>
    <div class="material-stock" ref="stock">
        <div class="view-icon">
            <i class="icon icon-20 icon-fullScreen" v-if="!fullscreen" @click="fullScreenClick(true)"  title="放大"></i>
            <i class="icon icon-20 icon-restoreScreen" v-else @click="fullScreenClick(false)"  title="缩小"></i>
        </div>
        <div class="router-path">
            <span class="path-item" v-if="routerName['barcodeBind']">条码绑定</span>
            <span class="path-item" v-if="routerName['supplementaryMaterial']">补料</span>
            <span class="path-item" v-if="routerName['emptyContainer']">容器清空</span>
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
					201:"barcodeBind", 					//条码绑定
					203:"supplementaryMaterial",		//补料
					202:"emptyContainer"				//容器清空
				},
				url: HOST + "/api/v1/trace/operation-detail/barcode-management/by-id",
				routerName: {
					"barcodeBind":false,				//条码绑定
					"supplementaryMaterial":false,		//补料
					"emptyContainer":false,				//容器清空  
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
				this.detailInfos.forEach(el => {
					operationIdList.push(el.opId)
				})
				this.$router.replace({ 
					path: "barcodeManage/"+this.routerPath[this.nodeType],
					query: {
						"operationIdList":operationIdList,
						"_tag":  new Date().getTime().toString().substr(-5),
						"url": this.url
					},										
				})

				/* 显示路由 */
				for(let i in this.routerName){
					if(i !== this.routerPath[this.nodeType]){
						this.routerName[i] = false
					}else{
						this.routerName[i] = true
					}
				}
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
		
		/deep/.router-content {
			flex: 1 1;
			overflow: auto;
			.table-title {
				display: flex;
    			align-items: center;
			}
			.innner-content {
				.tableData {
					display: flex;
					margin-top: 0;
					margin-bottom: -20px;
				    flex-direction: row;
    				justify-content: space-between;
					.table-handle {
						margin-right: 5px;
						display: flex;
						&>i {
							margin: 7.5px;
							cursor: pointer;
						}
					}
				}
			} 	
		}
	}
</style>
