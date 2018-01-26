<template>
	<el-dialog 
		class="progress-dialog-wrap" 
		fullscreen
		size="full"
		:visible.sync="dialogVisible" 
		:close-on-click-modal="false"
		:show-close="false"
		:close-on-press-escape="false">
		
		<div class="loader">
	        <div class="loader-inner ball-pulse">
	          	<span class="ball-text">追溯树生成中</span><div></div><div></div><div></div>
	        </div>
		</div>
		<v-tree 
			v-loading="loading"
			element-loading-text="加载中..."
			tree-id="dialogTree"
			:tree-data="treeData" 
			:is-dialog-tree="true"
			:style="{height: treeHeight + 'px'}"></v-tree>
	</el-dialog>
</template>

<script>
	import tree from 'components/tree/tree.vue'	
	import fnP from "assets/js/public.js"
	
	export default {
		props: {
			// 弹窗显示。
			dialogVisible: {
	            type: Boolean,
	            default: false
	       },
	       // 当前进程id
	       progressId: {
	       	 	type: String
	       }
		},
		components: {
			'v-tree': tree
		},
		data() {
			return {
				getProgressUrl: HOST + "/api/v1/request/state/",	// 获取进度
				cancelProgressUrl: HOST + "/api/v1/request/kill/", // 取消进度
				treeData: {},
				loading: false
			}
		},
		computed: {
			// 版本信息数据。
			isOpDbBeforeRefact() {
				return this.$store.state.versionModule && this.$store.state.versionModule.isOpDbBeforeRefact
			},
			treeHeight() {
				return document.body.clientHeight - 40
			}
		},
		created () {
			// 显示时，开启定时器
			this.setIntervalHandle()
		},
		methods: {
			// 关闭进程。
			setProgressEndHandle() {
				// 调用接口。
				this.$register.sendRequest(this.$store, this.$ajax, this.cancelProgressUrl+this.progressId, "post", null)	
			},
			// 显示数据。
			showTreeData () {
				this.$register.sendRequest(this.$store, this.$ajax, this.getProgressUrl+this.progressId, "post", null, (data) => {
					this.loading = false;
					// 成功处理。更新loading加载文字
					this.treeData = fnP.getTreeData(data.traceGraphNodeDtoList, "track", this.isOpDbBeforeRefact)
					
					setTimeout(() => {
						this.$nextTick(() => {							
							this.showTreeData()
						})
					}, 3000)
				}, () => {
					this.loading = false;
					// 失败处理，清空定时
//					this.clearIntervalHandle()
				})
			},
			// 设置定时器：获取当前进度。
			setIntervalHandle() {
				this.loading = true
				
				setTimeout(() => {
					this.showTreeData()
				}, 1000)
			}
		}
	}
</script>

<style>
  
    @-webkit-keyframes scale {
    	0% {
    		-webkit-transform: scale(1);
    		transform: scale(1);
    		opacity: 1;
    	}
    	45% {
    		-webkit-transform: scale(0.1);
    		transform: scale(0.1);
    		opacity: 0.7;
    	}
    	80% {
    		-webkit-transform: scale(1);
    		transform: scale(1);
    		opacity: 1;
    	}
    }
    
    @keyframes scale {
    	0% {
    		-webkit-transform: scale(1);
    		transform: scale(1);
    		opacity: 1;
    	}
    	45% {
    		-webkit-transform: scale(0.1);
    		transform: scale(0.1);
    		opacity: 0.7;
    	}
    	80% {
    		-webkit-transform: scale(1);
    		transform: scale(1);
    		opacity: 1;
    	}
    }
    
    .ball-pulse .ball-text {
    	color: #42af8f;
    	font-size: 16px;
    }
    
    .ball-pulse>div:nth-child(0) {
    	-webkit-animation: scale 0.75s 0s infinite cubic-bezier(.2, .68, .18, 1.08);
    	animation: scale 0.75s 0s infinite cubic-bezier(.2, .68, .18, 1.08);
    }
    
    .ball-pulse>div:nth-child(1) {
    	-webkit-animation: scale 0.75s 0.12s infinite cubic-bezier(.2, .68, .18, 1.08);
    	animation: scale 0.75s 0.12s infinite cubic-bezier(.2, .68, .18, 1.08);
    }
    
    .ball-pulse>div:nth-child(2) {
    	-webkit-animation: scale 0.75s 0.24s infinite cubic-bezier(.2, .68, .18, 1.08);
    	animation: scale 0.75s 0.24s infinite cubic-bezier(.2, .68, .18, 1.08);
    }
    
    .ball-pulse>div:nth-child(3) {
    	-webkit-animation: scale 0.75s 0.36s infinite cubic-bezier(.2, .68, .18, 1.08);
    	animation: scale 0.75s 0.36s infinite cubic-bezier(.2, .68, .18, 1.08);
    }
    
    .ball-pulse>div {
    	background-color: #42af8f;
    	width: 3px;
    	height: 3px;
    	border-radius: 100%;
    	margin: 2px;
    	-webkit-animation-fill-mode: both;
    	animation-fill-mode: both;
    	display: inline-block;
    }
</style>