<!--查出库路由-->
<template>
    <div class="stock">
        <div class="router-path">
            <span class="path-item" @click="checkStock">查出库</span>
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
	import fnP from "assets/js/public.js"
	
    export default {
        data () {
            return { 
                key: this.$route.params.key,
                storage: {},
                batch: {},
                restrain: {},
                batchIf: false,
                restrainIf: false    
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
                this.$router.replace({ path: `/stock/${this.key}`, query: this.storage})
            },
            // 同批出入库
            checkBatch(event) {
                if(event.target.parentNode.lastElementChild == event.target) {
                    // 若为最后一个节点，则不可点击。
                    return false;
                }
                this.$router.replace({ path: `/stock/${this.key}/batch`, query: this.batch})
            },
            setRouteQuery() {
                let aHref = this.$route.path.split("/"),
                    sType = aHref[aHref.length-1],
                    oQuery = fnP.parseQueryParam(this.$route.query);

                if(sType == "batch") {
                    this.batch = oQuery;
                }else if(sType == "restrain") {
                    this.restrain = oQuery;
                }else {
                    this.storage = oQuery;
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
	.stock {	
		height: 100%;
		display: flex;
		flex-direction: column;
		position: relative;

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
				position: absolute;
				right: 0;
				top: 15px;
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
