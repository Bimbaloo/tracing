<template>
	<div class="dialog-progress-tree">
		<div class="loader">
	        <div class="loader-inner ball-pulse">
	          	<span class="ball-text">追溯树生成中</span><div></div><div></div><div></div>
	        </div>
		</div>
		<v-tree
			v-loading="loading"
			element-loading-text="加载中..."
			:tree-id="treeId"
			:tree-data="treeData"
			:is-dialog-tree="true"
			:style="{height: treeHeight + 'px'}"></v-tree>
	</div>
</template>

<script>
import tree from 'components/tree/tree.vue'
import fnP from 'assets/js/public.js'

export default {
  props: {
    dialogVisible: {
      type: Boolean
    },
    // 当前进程id
    progressId: {
      type: String
    }
  },
  components: {
    'v-tree': tree
  },
  data () {
    return {
      getProgressUrl: window.HOST + '/api/v1/request/state/trace-down/', // 获取进度
      cancelProgressUrl: window.HOST + '/api/v1/request/kill/', // 取消进度
      treeData: {},
      loading: false
    }
  },
  computed: {
    // 版本信息数据。
    isOpDbBeforeRefact () {
      return (
        this.$store.state.versionModule &&
        this.$store.state.versionModule.isOpDbBeforeRefact
      )
    },
    treeHeight () {
      return document.querySelector('.router').clientHeight - 80
    },
    treeId () {
      return 'dialogTree' + this.progressId
    }
  },
  created () {
    // 显示时，开启定时器
    this.setIntervalHandle()
  },
  methods: {
    // 关闭进程。
    setProgressEndHandle () {
      // 调用接口。
      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        this.cancelProgressUrl + this.progressId,
        'post',
        null
      )
    },
    // 显示数据。
    showTreeData () {
      this.$register.sendRequest(
        this.$store,
        this.$ajax,
        this.getProgressUrl + this.progressId,
        'post',
        null,
        data => {
          // 成功处理。更新loading加载文字
					let oParsedData = fnP.parseTreeData(data.data, 'track', this.isOpDbBeforeRefact)
          this.treeData = fnP.getTreeData(
            oParsedData,
            'track',
            this.isOpDbBeforeRefact
          )

          this.loading = false
          setTimeout(() => {
            this.$nextTick(() => {
              document.querySelector('.dialog-progress-tree') && this.showTreeData()
            })
          }, 3000)
        },
        () => {
          // 加载失败后处理。
          this.loading = true
        }
      )
    },
    // 设置定时器：获取当前进度。
    setIntervalHandle () {
      this.loading = true

      setTimeout(() => {
        this.showTreeData()
      }, 2000)
    }
  }
}
</script>

<style lang="less" scoped>
.dialog-progress-tree {
  position: relative;
  z-index: 1001;
  width: 100%;
  height: 100%;
  background-color: #fff;

  .loader {
    text-align: center;
    padding: 10px 0;
  }
}

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

.ball-pulse > div:nth-child(0) {
  -webkit-animation: scale 0.75s 0s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08);
  animation: scale 0.75s 0s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08);
}

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

.ball-pulse > div:nth-child(0) {
  -webkit-animation: scale 0.75s 0s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08);
  animation: scale 0.75s 0s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08);
}

.ball-pulse > div:nth-child(1) {
  -webkit-animation: scale 0.75s 0.12s infinite
    cubic-bezier(0.2, 0.68, 0.18, 1.08);
  animation: scale 0.75s 0.12s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08);
}

.ball-pulse > div:nth-child(2) {
  -webkit-animation: scale 0.75s 0.24s infinite
    cubic-bezier(0.2, 0.68, 0.18, 1.08);
  animation: scale 0.75s 0.24s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08);
}

.ball-pulse > div:nth-child(3) {
  -webkit-animation: scale 0.75s 0.36s infinite
    cubic-bezier(0.2, 0.68, 0.18, 1.08);
  animation: scale 0.75s 0.36s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08);
}

.ball-pulse > div {
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
