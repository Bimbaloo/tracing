<!--查出库路由-->
<template>
    <div class="material-stock" ref="stock">
        <div class="view-icon">
            <i class="icon icon-20 icon-fullScreen" v-if="!fullscreen" @click="fullScreenClick"  title="放大"></i>
            <i class="icon icon-20 icon-restoreScreen" v-else @click="restoreScreenClick"  title="缩小"></i>
        </div>
        <div class="router-path">
            <span class="path-item" @click="checkStock">仓储信息</span>
            <span class="path-item" @click="checkBatch" v-if="batchIf">>同批出入库</span>
            <span class="path-item" v-if="restrainIf">>遏制</span>
        </div> 
        <router-view></router-view>  
        <!--el-breadcrumb separator="/" class="router-path">
        <el-breadcrumb-item :to="{ path: activeKey, query: activeKeys }" class="path-item" ref="pathItem">{{activeName}}</el-breadcrumb-item>
        </el-breadcrumb-->
    </div>
</template>

<script>

    export default {
        data () {
            return { 
                // 右下详情内容区域全屏标识。
                key: this.$route.params.key,
                material: {},
                batch: {},
                restrain: {},
                batchIf: false,
                restrainIf: false    
            }
        },
        computed: {
			fullscreen () {
		    	return this.$store.state.fullscreen
		    }
		},
        created () {
            this.setRouteQuery();
        },
        watch: {
        },
        methods: {
            // 查出库
            checkStock(event) {
                if(event.target.parentNode.lastElementChild == event.target) {
                    // 若为最后一个节点，则不可点击。
                    return false;
                }
                this.$router.push({ path: `/stock`, query: this.material})
            },
            // 同批出入库
            checkBatch(event) {
                if(event.target.parentNode.lastElementChild == event.target) {
                    // 若为最后一个节点，则不可点击。
                    return false;
                }
                this.$router.push({ path: `/stock/batch`, query: this.batch})
            },
            setRouteQuery() {
                let aHref = location.href.split("?")[0].split("/"),
                    sType = aHref[aHref.length-1];

                if(sType == "batch") {
                    this.batch = this.$route.query;
                }else if(sType == "restrain") {
                    this.restrain = this.$route.query;
                }else {
                    this.material = this.$route.query;
                }
            },
            setPathVisible(to) {
                let aPath = to.path.split("/"),
                    sType = aPath[aPath.length - 1];

                if(sType == "batch") {
                    this.batchIf = true;
                    this.restrainIf = false;
                }else if(sType == "restrain") {
                    this.batchIf = true;
                    this.restrainIf = true;
                }else {
                    this.batchIf = false;
                    this.restrainIf = false;
                }   
            },
            fullScreenClick() {
                // 详情全屏按钮点击事件。
				this.$store.commit({
					type: "updateFullscreen",
					key: true
				});                
            },
            restoreScreenClick() {
                // 详情还原按钮点击事件。
  				this.$store.commit({
					type: "updateFullscreen",
					key: false
				});                 
            }
        }, 
        // beforeRouteEnter (to, from, next) {
        //     // 在渲染该组件的对应路由被 confirm 前调用
        //     // 不！能！获取组件实例 `this`
        //     // 因为当钩子执行前，组件实例还没被创建
        // },
        beforeRouteUpdate (to, from, next) {
            // 在当前路由改变，但是该组件被复用时调用
            // 举例来说，对于一个带有动态参数的路径 /foo/:id，在 /foo/1 和 /foo/2 之间跳转的时候，
            // 由于会渲染同样的 Foo 组件，因此组件实例会被复用。而这个钩子就会在这个情况下被调用。
            // 可以访问组件实例 `this`
//          console.log("to:");
//          console.log(to);
//          console.log("from:");
//          console.log(from);
//          console.log("next:");
//          console.log(next);

            this.key = this.$route.params.key;
            this.setRouteQuery();
            // 设置path可见性。
            this.setPathVisible(to);
            next();
        },
        // beforeRouteLeave (to, from, next) {
        //     // 导航离开该组件的对应路由时调用
        //     // 可以访问组件实例 `this`
        // }
    }  
</script>

<style lang="less">
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
				top: 65px;
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
