<template>
	<el-dialog width='80%' top='10vh' class="dialog-wrap" title="产出记录" :visible.sync="dialogVisible" :close-on-click-modal="false" :before-close="handleClose">
		<!-- 新窗口打开按钮 -->
		<!--<i class="open-icon icon icon-16 icon-openNew" @click="openNew"></i>-->
		<v-output @hideDialog="handleClose" :page-size="false" :page-height="contentHeight"></v-output>
	</el-dialog>
</template>

<script>
		
import OutputRecord from 'components/outputRecord/record.vue'

export default {
		  props: {
		    dialogVisible: {
		      default: true
		    }
		  },
		  components: {
		    'v-output': OutputRecord
		  },
		  data () {
		    return {
		      contentHeight: 600
		    }
		  },
		  computed: {
		  },
		  mounted () {
		    this.contentHeight = document.querySelector('body').clientHeight * 0.8 - document.querySelector('.el-dialog__header').clientHeight - 60
		  },
		  methods: {
		    handleClose () {
		      this.$emit('hideDialog')
		    }
		  }
}

</script>

<style lang="less">

	.dialog-wrap {
		line-height: 20px;
		.el-dialog {
			height: 80%;
			display: flex;
    	flex-direction: column;
			.el-dialog__header {
				.el-dialog__headerbtn {
					.el-icon-close {
						font-size: 22px;
						margin-top: 2px;
						color: #42af8f6e;
					}
				}
			}
			.el-dialog__body {
				padding-bottom: 20px;
				flex: 1;
				.output-main {
					height: 100%;
				}
			}
			.open-icon {
				position: absolute;
				top: 20px;
				right: 54px;
				cursor: pointer
			}
		}
	}
</style>
