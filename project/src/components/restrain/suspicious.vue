<template>
	<div class="router-content">
		<!--<el-button class="btn btn-plain btn-restrain" @click="restrain" v-if="isRestrained">遏制</el-button>-->
		<div class="innner-content" :style="styleObject">
			<!--h2 class="title">遏制详情</h2-->
			<!-- <h2 class="content-title" v-if="!isrestrainHtml">查询条件</h2> -->
			<div class="condition" v-if="'materialCode' in $route.query && !isrestrainHtml">
				<span>物料编码：{{$route.query.materialCode}}</span><span>批次：{{$route.query.batchNo}}</span>
			</div>
			<div class="condition" v-if="'equipmentId' in $route.query">
				<span>设备名称：{{$route.query.equipmentName}}</span><span>开始时间：{{$route.query.startTime}}</span><span>结束时间：{{$route.query.endTime}}</span>
			</div>
			<h2 class="title">可疑品列表</h2>
			<!-- 遏制中，只当显示的是可疑品列表，才会在监听路由时调用接口 -->
			<v-report v-if="$route.meta.title=='restrain'" :hasData="setWidth" :noData="removeWidth" ></v-report> 
		</div>
	</div>

</template>

<script>
	import report from "components/report/report.vue"

	export default {
		components: {
			'v-report': report
		},
		data() {
			return {
				isRestrained: true,
				description: "",
				url: "/trace/v1/materialbatchsuppress",
				styleObject: {
					"min-width": "1200px"
				}
			}
		},
		computed: {
			isrestrainHtml (){
				return window.location.pathname.includes("restrain")
			}
		},
		created() {
			// 组件创建完后获取数据，
			// 此时 data 已经被 observed 了
			// this.fetchData();
		},
		watch: {
			// 如果路由有变化，会再次执行该方法
//			 '$route': 'fetchData'
		},
		methods: {	

			// 可疑品列表。
			restrain() {
 
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
		        				self.isRestrained = false;
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
					// 	instance.$slots.default[0].elm.children[0].value = "";
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
					//self.description = "";
		        })
    
			},
			setWidth() {
				this.styleObject.minWidth = "1200px";
			},
			removeWidth() {
				this.styleObject.minWidth = 0;
			}
		}
	}
</script>

<style lang="less">
	.el-message-box {
		.el-textarea__inner {
			border-radius: 0;
		}
		.el-button {
			border-radius: 0;
			padding: 7px 15px;
		}
		.el-message-box__headerbtn {
			padding: 0;
			border: none;
		}
		.el-message-box__content {
			padding: 0 20px;
		}
	}

	.router-content {
		flex: 1 1;
		overflow: auto;
		position: relative;
		
		.btn-restrain {
			position: absolute;
			right: 0;
		//	top: 45px;
		}
		
		.condition {
			border: 2px solid #42AF8F;
			padding: 20px 12px;
			margin-bottom: 30px;
			
			span {
				display: inline-block;
				&+span {
					margin-left: 60px;
				}
			}
		}
	}
	
	.message {
		textarea {
			font-family: "微软雅黑";
		}
	}
</style>