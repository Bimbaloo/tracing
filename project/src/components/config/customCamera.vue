<!--自定义字段名称脚本-->
<template>
	<div class="content-camera">
		<div class="legend-list">
			<span class="item-title">维度:</span>
			<div class="item-legend" v-for="item in aoDimension" v-if="item.show" :key="item.value">
				<span :class="['item-block', `${item.value}`]"></span>
				<span class="item-name">{{ item.name }}</span>
			</div>
		</div>
		<el-form ref="form" :model="form" label-width="120px" label-position="left" class="form" :rules="rules">
			<el-form-item label="视频地址" prop="url">
				<el-input v-model="form.url" placeholder="请输入视频地址以http://或https://开头" :disabled="!edit" style="width:60%;"></el-input>
			</el-form-item>
      <el-form-item label="视频地址参数" prop="parameters">
        <el-checkbox-group v-model="form.parameters">
          <el-checkbox 
          :disabled="!edit"
          v-for="oParameter in aoParameter" 
          :label="oParameter.value" 
          :key="oParameter.value">{{oParameter.name}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="接口地址" prop="interface">
				<el-input v-model="form.interface" placeholder="请输入获取监控点的接口地址以http://或https://开头" :disabled="!edit" style="width:60%;"></el-input>
			</el-form-item>
      <el-form-item label="接口地址参数" prop="interfaceParameters">
        <el-checkbox-group v-model="form.interfaceParameters">
          <el-checkbox 
          :disabled="!edit"
          v-for="oParameter in aoInterfaceParameter" 
          :label="oParameter.value" 
          :key="oParameter.value">{{oParameter.name}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="维度" prop="dimensions">
        <el-checkbox-group v-model="form.dimensions">
          <el-checkbox 
          :disabled="!edit"
          v-for="oDimension in aoDimension" 
          :label="oDimension.value" 
          :key="oDimension.value">{{oDimension.name}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
			<!-- <el-form-item :label="item.name" :prop="item.value" v-for="item in aoDimension" v-if="item.show" :key="item.value">
				<el-switch v-model="form[item.value]" :disabled="!edit"></el-switch>
			</el-form-item> -->
      
			<div class="tip">注：维度开关，开启即设置该维度事件可查询关联设备视频监控。</div>
			<el-form-item>
				<el-button type="primary" @click="edit=true" v-if="!edit" class="btn-plain">设置</el-button>
				<el-button @click="submitForm" v-if="edit" class="btn-plain">保存</el-button>
				<el-button @click="resetForm" v-if="edit" class="btn-plain">取消</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
// import $ from 'jquery'
// 获取、保存配置。
const MONITOR_DATA_URL = window.HOST + '/api/v1/customized/equipment-analysis/video-monitor/config'

export default {
  name: 'v-camera',
  data () {
    return {
      // 是否处于编辑状态。
      edit: false,
      // 提示信息。
      sErrorMessage: '',
      form: {
        url: '',
        parameters: ['cameraId', 'startDate', 'endDate'],
        interface: '',
        interfaceParameters: ['equipmentId'],
        dimensions: []
      },
      oldForm: {},
      // 参数
      aoParameter: [{
        name: '监控点(cameraId)',
        value: 'cameraId'
      }, {
        name: '开始时间(startDate)',
        value: 'startDate'
      }, {
        name: '结束时间(endDate)',
        value: 'endDate'
      }],
      // 接口参数。
      aoInterfaceParameter: [{
        name: '设备id(equipmentId)',
        value: 'equipmentId'
      }]
    }
  },
  computed: {
    // 验证规则。
    rules () {
      let aoDimension = Object.keys(this.form).filter(skey => skey !== 'url')
      // 验证地址。
      let validateUrl = (rule, value, callback) => {
        if (!value.trim()) {
          // 若为空。
          if (aoDimension.some(sKey => this.form[sKey])) {
            // 若某一个维度开启了视频。
            callback(new Error('请输入视频地址。'))
          } else {
            callback()
          }
        } else {
          if (
            value.search(/http:\/\//i) === 0 ||
            value.search(/https:\/\//i) === 0
          ) {
            callback()
          } else {
            callback(
              new Error('输入的视频地址格式需以http://或https://开头。')
            )
          }
        }
      }

      return {
        url: [{ validator: validateUrl, trigger: 'blur' }]
      }
    },
    // 是否支持工具。
    toolManagement () {
      return (
        this.$store.state.versionModule &&
        this.$store.state.versionModule.toolManagement
      )
    },
    // 是否支持工艺。
    processParameter () {
      return (
        this.$store.state.versionModule &&
        this.$store.state.versionModule.processParameter
      )
    },
    // 是否支持维护
    equipmentMaintenance () {
      return (
        this.$store.state.versionModule &&
        this.$store.state.versionModule.equipmentMaintenance
      )
    },
    // 维度信息。
    aoDimension () {
      return [
        {
          name: '质量',
          value: 'quality',
          show: true
        },
        {
          name: '投产',
          value: 'pool',
          show: true
        },
        {
          name: '工单',
          value: 'work',
          show: true
        },
        {
          name: '事件',
          value: 'event',
          show: true
        },
        {
          name: '工具',
          value: 'tool',
          show: this.toolManagement
        },
        {
          name: '维护',
          value: 'repair',
          show: this.equipmentMaintenance
        },
        {
          name: '工艺',
          value: 'parameter',
          show: this.processParameter
        }
      ]
    }
  },
  created () {
    // this.initForm()
    // 获取模块数据 GET_DATA_URL
    this.$register.sendRequest(this.$store, this.$ajax, MONITOR_DATA_URL, 'get', null, (oData) => {
      // 保存工厂定制数据。

      //   api_url: 'http:// 192.168.118.220:801/api/commandCenter/camera/getCameraList',
      //   url: 'http://192.168.118.220:801/page/commandCenter/camera-iframe-flv.html',

      this.form.url = oData.url
      this.form.parameters = oData.parameters || []
      this.form.interface = oData.interface || ''
      this.form.interfaceParameters = oData.interfaceParameters || []
      this.form.dimensions = oData.dimensions || []
      // oData.dimensions_config.forEach(o => {
      //   this.form[o.name] = o.enabled
      // })
      this.oldForm = JSON.parse(JSON.stringify(this.form))
    }, (sErrorMessage) => {
      this.sErrorMessage = sErrorMessage
      this.showMessage('error')
    })
  },
  methods: {
    // 初始化维度数据。
    initForm () {
      this.aoDimension.forEach(o => {
        this.$set(this.form, o.value, false)
      })
    },
    // 显示提示信息。
    showMessage (sType, sMessage) {
      this.$message({
        message: sMessage || this.sErrorMessage,
        duration: 3000,
        type: sType
      })
    },
    // 保存。
    submitForm () {
      this.$refs.form.validateField('url', valid => {
        if (!valid) {
          // 验证成功。
          this.edit = false
          // 保存模块数据。
          // let oPostData = {
          //   url: this.form.url,
          //   dimensions_config: []
          // }

          // this.aoDimension.forEach(o => {
          //   oPostData.dimensions_config.push({
          //     name: o.value,
          //     enabled: !!this.form[o.value]
          //   })
          // })

          this.$register.sendRequest(this.$store, this.$ajax, MONITOR_DATA_URL, 'post', this.form, (oData) => {
          // 保存工厂定制数据。
            this.showMessage('success', '保存成功！')
            this.oldForm = JSON.parse(JSON.stringify(this.form))
          }, (sErrorMessage) => {
            this.sErrorMessage = sErrorMessage
            this.showMessage('error')
          })
        }
      })
    },
    // 取消。
    resetForm () {
      this.edit = false
      this.form = JSON.parse(JSON.stringify(this.oldForm))
      // this.$refs.form.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
// 引用基础定义。
@import "../../assets/css/base.less";

.dimension-color(@color) {
  background-color: @color;
}
.content-camera {
  padding: 10px;
  flex-grow: 1;
  overflow: auto;

  .legend-list {
    padding: 10px 0 0 20px;

    .item-title {
      display: inline-block;
      vertical-align: middle;
      font-size: 12px;
    }
    .item-legend {
      text-align: center;
      vertical-align: middle;
      display: inline-block;
      padding: 0 10px;

      .item-block {
        display: inline-block;
        width: 20px;
        height: 10px;

        &.quality {
          .dimension-color(@quality);
        }
        &.pool {
          .dimension-color(@pool);
        }
        &.work {
          .dimension-color(@work);
        }
        &.event {
          .dimension-color(@event);
        }
        &.repair {
          .dimension-color(@repair);
        }
        &.tool {
          .dimension-color(@tool);
        }
        &.parameter {
          .dimension-color(@parameter);
        }
      }

      .item-name {
        font-size: 12px;
      }
    }
  }
  .form {
    padding: 20px;
  }
  .tip {
    font-size: 12px;
    color: #666;
    font-weight: bold;
  }
  .btn-plain {
    border: 2px solid #42af8f;
    color: #42af8f;
    border-radius: 0;
    padding: 5px 15px;
    margin-top: 20px;
    &:hover {
      color: #fff;
    }
    &:focus {
      background-color: #fff;
      color: #42af8f;
    }
  }
  /deep/ .el-form-item__content {
    height: 56px;
    line-height: 56px;
  }
  /deep/ .el-form-item__label {
    line-height: 56px;
  }
}
</style>
