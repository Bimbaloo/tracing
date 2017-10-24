<!--查出库路由-->
<template>
    <div class="material-stock" ref="stock">
        <div class="view-icon" v-if="!bRestrain">
            <i class="icon icon-20 icon-fullScreen" v-if="!fullscreen" @click="fullScreenClick"  title="放大"></i>
            <i class="icon icon-20 icon-restoreScreen" v-else @click="restoreScreenClick"  title="缩小"></i>
        </div>
        <div class="path-btn">
        	<el-button class="btn btn-plain btn-restrain" @click="showRestrain" v-if="btnShowRestrain && restrainIf">遏制</el-button>
        </div>
        <div class="router-path">
            <router-link 
                class="path-item" 
                v-for="(oRoute,index) in aoRoute" 
                :key="index" 
                :to="{path: oRoute.path, query: oRoute.query}" 
                replace><span v-if="index">></span>{{oRoute.name}}</router-link>
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
                // 是否为遏制页面。
                bRestrain: location.pathname.indexOf("restrain") > -1,
                // 右下详情内容区域全屏标识。
                key: this.$route.params.key,
                oQuery: {},
                operations: {
                    "process":"设备分析",
                    "product":"投产表",
                    "qtReport":"质检",
                    "qcReport":"送检",
                    "fgbReport":"fgb检验",
                    "tool":"工具记录",
                    "event":"事件记录",
                    "repair":"维修记录",
                    "spotReport":"点检记录",
                    "restrain":"可疑品",
                    "parameter":"工艺参数"
                },
                aoRoute: [],
                restrainIf: false,
                btnShowRestrain: false,		// 临时屏蔽遏制
                description: "",
				url: "/trace/v1/materialbatchsuppress"
            }
        },
        computed: {
			fullscreen () {
		    	return this.$store && this.$store.state.fullscreen
            }
		},
        created () {
            this.initRoute()
        },
        watch: {
        },
        methods: {
            // 初始化路由设置。
            initRoute() {
                
                let sRoute = this.$route.path,
                    aPath = sRoute.split("/"),
                    sType = aPath[aPath.length -1]
                
                this.aoRoute = []
                this.oQuery = {}
                
                // 保存查询条件。
                this.oQuery[sType] = this.$route.query

                // 设置面包屑路由。
                this.aoRoute.push({
                    name: this.operations[sType],
                    path: sRoute,
                    query: this.oQuery[sType]
                })
            },
            setPathVisible(to) {
                let aPath = to.path.split("/"),
                    sType = aPath[aPath.length - 1];
				
				// 遏制
               	if(sType == "restrain") {
                    this.restrainIf = true;
                }else {
                	this.restrainIf = false;
                }
            },
            // 设置路由。
            setRouteQuery(from, to) {
                
                if(from.fullPath === to.fullPath) {
                    // 已跳转成功。
                    return
                }
                let sFromRoute = from.path,
                    sToRoute = to.path,
                    aFromPath = sFromRoute.split("/"),
                    aToPath = sToRoute.split("/"),
                    sFromType = aFromPath[aFromPath.length -1],
                    sToType = aToPath[aToPath.length -1]
                    
                // 保存查询条件。
                this.oQuery[sToType] = to.query//this.$route.query
                
                if(sToType === "process" && to.query.key && !to.query.startTime) {
                    // 树节点跳转。
                    this.oQuery = {}
                    this.oQuery[sToType] = to.query
                    this.aoRoute = []

                    this.aoRoute.push({
                        name: this.operations[sToType],
                        path: sToRoute,
                        query: this.oQuery[sToType]
                    })                  
                }else if(sFromType === "process") {
                    // 从设备分析跳转到其他页面。
                    // 添加开始时间，结束时间。因为可以跳转到设备分析的时候，开始时间结束时间有修改。
                    Object.assign(this.oQuery[sFromType], {
                        startTime: to.query.startTime,
                        endTime: to.query.endTime,
                        shiftStartTime: to.query.shiftStartTime,
                        shiftEndTime: to.query.shiftEndTime
                    })
                    
                    // 保存跳转的时间。
                    this.aoRoute[0].query = this.oQuery[sFromType]
                    
                    this.aoRoute.push({
                        name: this.operations[sToType],
                        path: sToRoute,
                        query: this.oQuery[sToType]
                    })

                }else if(sToType === "process") {
                    // 从其他页面跳回设备分析。
                    let oRoute = this.aoRoute.shift()
                    this.aoRoute = []
                    this.aoRoute.push(oRoute)
                }else if(sFromType === "product") {
                    // 从投产表跳到其他页面。
                    this.aoRoute.push({
                        name: this.operations[sToType],
                        path: sToRoute,
                        query: this.oQuery[sToType]
                    }) 
                }else if(sToType === "product") {
                    // 从其他页面跳到投产表
                    this.aoRoute.pop()
                }

            },
            showRestrain() {
		        const h = this.$createElement;
		        let bSucess = false;
		        let self = this;
		        this.$msgbox({
		          title: "提示",
		          message: h("el-input", {
		          	  	attrs: {
		          	  		type: "textarea",
		          			rows: 4,
		          			placeholder: "请输入遏制描述信息"
					  	},
					  	class: {
						    message: true
						},
						domProps: {
					      	value: self.description
					    },
					    on: {
						    blur: function (event) {
						        self.description = event.target.value
						    }
					    }
		          }),
		          showCancelButton: true,
		          confirmButtonText: '确定',
		          cancelButtonText: '取消',
		          beforeClose: (action, instance, done) => {   
		
		            if (action === 'confirm') {
		              	instance.confirmButtonLoading = true;
		              	instance.confirmButtonText = '执行中...';
		     		
		     			let oConditions = Object.assign({description: self.description}, this.$route.query);
		     			
		              	//this.$post(this.url, oConditions)
		        		//.then((res) => { 		        			
		        			done();
		        			instance.confirmButtonLoading = false;
		        			//if(!res.errorCode) {			
		        				bSucess = true;
		        				// 隐藏遏制按钮。
		        				self.restrainIf = false;
		        				let sSerializion = "";
		        				for(let p in oConditions) {
		        					sSerializion += `&${p}=${oConditions[p]}`;
		        				}
		        				sSerializion = sSerializion.substring(1);
		        				// 遏制成功，打开到遏制报告。
		        				window.open("/restrain/report.html?" +　sSerializion);
		        				
		        		//	}
		        		//})
		        		//.catch((err) => {        
		        		//	done();
		        		//	instance.confirmButtonLoading = false;
		        		//});
		
		            } else {            
		              	done();
		            //	instance.$slots.default[0].elm.children[0].value = "";
		            }
		            
		          }
		        }).then(action => {
		        	if(action == 'confirm') {
		        		if(bSucess) {
		        			this.$message.success('提交成功！');
		        		}else {
		        			this.$message.error('提交失败！');
		        		}
		        	}
		      //	self.description = "";
		        })
    
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
            this.key = this.$route.params.key;
            this.setRouteQuery(from, to);
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
			//	top: 65px;
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
