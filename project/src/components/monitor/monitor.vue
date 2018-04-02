<template>
  <div id="monitor">
    <el-form :inline="true" :model="monitorForm" class="form-inline" :rules="rules" ref="monitorForm">
        <el-form-item label="监控点：" prop="cameraId" class="parameter">
            <el-radio-group v-model="monitorForm.cameraId">
                <el-radio v-for="(item, index) in cameraPoints" :key="item" :label="item">{{index+1}}</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="监控时间：" required class="parameter" label-width="20%" style="width:80%">
            <el-col :span="11">
              <el-form-item prop="startDate" >
                <el-date-picker  type="datetime" @change.native="dateChange('startDate', $event)" @change="startClick" placeholder="选择开始时间" v-model="monitorForm.startDate" style="width: 100%;"></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col class="split" :span="2">-</el-col>
            <el-col :span="11">
              <el-form-item prop="endDate" >
                <el-date-picker type="datetime" @change.native="dateChange('endDate', $event)" @change="endClick" placeholder="选择结束时间" v-model="monitorForm.endDate" style="width: 100%;"></el-date-picker>
              </el-form-item>
            </el-col>
        </el-form-item>
        <el-form-item v-if="cameraPoints.length">
            <el-button type="primary" @click="submitForm('monitorForm')">查询</el-button>
        </el-form-item>
    </el-form>
    <!--div class="line"></div-->
    <div class="content-title">{{name}}&nbsp;&nbsp;{{poolTime}}&nbsp;&nbsp;{{serieName}}监控</div>
    <div class="camera" :style="{height: cameraHeight + 'px'}">
        <iframe v-if="cameraPoints.length" ref="video"></iframe>
        <div v-else class="error">暂无监控视频。</div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import axios from 'axios'

// 获取监控点接口地址。
// const CAMERA_POINT_URL = window.MI_HOST + '/api/commandCenter/camera/getCameraList'
// 向前推10s。
const PRE_TIME = 10
// 向后推10s。
const FORWARD_TIME = 10
// 视频最大播放时长，单位分钟。
const MAX_VIDEO_TIME = 60
// 视频地址传参可选。
const URL_PARAMETERS = ['cameraId', 'startDate', 'endDate']
// 获取视频监控点传参可选。
const INTERFACE_PARAMETERS = ['equipmentId']

export default {
  props: {
    equipmentName: {
      type: String,
      default: ''
    },
    equipmentId: {
      type: [String, Number],
      default: ''
    },
    /* time和 [startDate,endDate] 有且只有一个 */
    time: {
      type: String,
      default: ''
    },
    startDate: {
      type: String,
      default: ''
    },
    endDate: {
      type: String,
      default: ''
    },
    series: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      cameraHeight: 300,
      monitorForm: {
        cameraId: '',
        startDate: '',
        endDate: ''
      },
      // 监控点。
      cameraPoints: [],
      // 前一次查询条件。
      forwardForm: null
    }
  },
  computed: {
    // 视频监控相关数据。
    factoryCameraConfig () {
      return this.$store.state.factoryModule.factoryCameraConfig
    },
    // 监控地址。
    url () {
      return this.factoryCameraConfig.url
    },
    // 地址参数。
    parameters () {
      return this.factoryCameraConfig.parameters || []
    },
    // 接口地址。
    interfaceUrl () {
      return this.factoryCameraConfig.interface
    },
    // 地址参数。
    interfaceParameters () {
      return this.factoryCameraConfig.interfaceParameters || []
    },
    // 投产时间。
    poolTime () {
      return decodeURIComponent(this.time)
    },
    // 设备名称。
    name () {
      return decodeURIComponent(this.equipmentName)
    },
    // 系列名称。
    serieName () {
      return decodeURIComponent(this.series)
    },
    // 验证规则。
    rules () {
      // 用flag变量防止循环调用
      let flag = 0
      // 验证开始时间。
      let validateStartTime = (rule, value, callback) => {
        flag++
        if (flag % 3 !== 0) {
          this.$refs.monitorForm.validateField('endDate')
        } else {
          flag = 0
          return
        }
        let sEnd = this.monitorForm.endDate
        if (value instanceof Date) {
          value = value.Format()
        }
        if (sEnd instanceof Date) {
          sEnd = sEnd.Format()
        }
        let sTime = value && value.trim() || null
        let bIsFormat = window.Rt.utils.isDateTime(sTime)
        let bIsEndFormat = window.Rt.utils.isDateTime(sEnd)
        let nNow = +new Date()

        if (!sTime) {
          callback(new Error('请输入开始时间'))
        } else if (!bIsFormat) {
          callback(new Error('请输入正确的时间格式'))
        } else if (+new Date(sTime) > nNow) {
          callback(new Error('时间不能超过当前时间'))
        } else if (
            sEnd &&
            bIsEndFormat &&
            +new Date(sTime) > +new Date(sEnd)
          ) {
            // 如果开始时间存在，而且开始时间大于结束时间。
          callback(new Error('开始时间必须小于结束时间'))
        } else if (
            sEnd &&
            bIsEndFormat &&
            +new Date(sTime) + MAX_VIDEO_TIME * 60 * 1000 < +new Date(sEnd)
          ) {
            // 如果开始时间存在，而且开始时间与结束时间间隔超过MAX_VIDEO_TIME。
          callback(
              new Error(
                '开始时间与结束时间间隔不能超过' + MAX_VIDEO_TIME + '分钟'
              )
            )
        } else {
          callback()
        }
      }
        // 验证结束时间。
      let validateEndTime = (rule, value, callback) => {
        flag++
        if (flag % 3 !== 0) {
          this.$refs.monitorForm.validateField('startDate')
        } else {
          flag = 0
          return
        }
        let sStart = this.monitorForm.startDate
        if (value instanceof Date) {
          value = value.Format()
        }
        if (sStart instanceof Date) {
          sStart = sStart.Format()
        }
        let sTime = value && value.trim() || null
        let bIsFormat = window.Rt.utils.isDateTime(sTime)
        let bIsStartFormat = window.Rt.utils.isDateTime(sStart)
        let nNow = +new Date()

        if (!sTime) {
          callback(new Error('请输入结束时间'))
        } else if (!bIsFormat) {
          callback(new Error('请输入正确的时间格式'))
        } else if (+new Date(sTime) > nNow) {
          callback(new Error('时间不能超过当前时间'))
        } else if (
            sStart &&
            bIsStartFormat &&
            +new Date(sStart) > +new Date(sTime)
          ) {
            // 如果开始时间存在，而且开始时间大于结束时间。
          callback(new Error('结束时间必须大于开始时间'))
        } else if (
            sStart &&
            bIsStartFormat &&
            +new Date(sStart) + MAX_VIDEO_TIME * 60 * 1000 < +new Date(sTime)
          ) {
            // 如果开始时间存在，而且开始时间与结束时间间隔超过MAX_VIDEO_TIME。
          callback(
              new Error(
                '开始时间与结束时间间隔不能超过' + MAX_VIDEO_TIME + '分钟'
              )
            )
        } else {
          callback()
        }
      }

      return {
        startDate: [
          { validator: validateStartTime, trigger: 'change', required: true }
        ],
        endDate: [
          { validator: validateEndTime, trigger: 'change', required: true }
        ]
      }
    }
  },
  created () {
    // 设置监控时间。
    if (this.startDate !== '' && this.endDate !== '') {
      this.monitorForm.startDate = this.startDate
      this.monitorForm.endDate = this.endDate
    } else {
      this.setTime()
    }
    // 获取监控点。
    this.getCameraPoints()
  },
  mounted () {
    this.$nextTick(() => {
      this.setHeight()
    })
  },
  methods: {
    // 设置高度。
    setHeight () {
      let nHeight = window.document.documentElement.clientHeight
      let jWrap = $('.wrap')
      let jForm = $('.form-inline')
      let jTitle = $('.content-title')
      let jHeader = $('header')
      let jCamera = $('.camera')
      let nReturnHeight = 0

      // 获取页面中的可显示高度。
      nReturnHeight =
        nHeight -
        jHeader.outerHeight(true) -
        (jWrap.outerHeight(true) - jWrap.height()) -
        jForm.outerHeight(true) -
        jTitle.outerHeight(true) -
        (jCamera.outerHeight(true) - jCamera.height())

      this.cameraHeight = nReturnHeight
    },
    // 输入处理
    dateChange (key, event) {
      let sVal = event.target.value
      this.monitorForm[key] = sVal
    },
    // 选中确定处理
    startClick (value) {
      if (value !== undefined) {
        this.monitorForm.startDate = value
      } else {
        // 点击插件自动清空，返回是undefined
        this.monitorForm.startDate = ''
      }
    },
    // 选中确定处理
    endClick (value) {
      if (value !== undefined) {
        this.monitorForm.endDate = value
      } else {
        // 点击插件自动清空，返回是undefined
        this.monitorForm.endDate = ''
      }
    },
    // 设置监控时间。
    setTime () {
      if (this.poolTime) {
        this.monitorForm.startDate = new Date(
          +new Date(this.poolTime) - PRE_TIME * 1000
        )
        this.monitorForm.endDate = new Date(
          +new Date(this.poolTime) + FORWARD_TIME * 1000
        )
      }
    },
    // 提交。
    submitForm (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (
            !this.forwardForm ||
            (this.forwardForm &&
              !this.isEqual(this.forwardForm, this.monitorForm))
          ) {
            // 若条件发生改变。
            let sUrl = this.url
            let aParams = []
            if (this.parameters.length) {
              URL_PARAMETERS.forEach(sParameter => {
                if (this.parameters.indexOf(sParameter) > -1) {
                  if (sParameter === 'startDate' || sParameter === 'endDate') {
                    aParams.push(`${sParameter}=${encodeURIComponent(this.monitorForm[sParameter])}`)
                  } else {
                    aParams.push(`${sParameter}=${this.monitorForm[sParameter]}`)
                  }
                }
              })
              if (aParams.length) {
                sUrl += '?' + aParams.join('&')
              }
            }
            this.$refs.video.src = sUrl
          }
        } else {
          console.log('error submit!')
          return false
        }
      })
    },
    /**
     * 判断两个对象相等。
     * @param{Object} oCompare
     * @param{Object} oStandard
     * @return{Boolean}
     */
    isEqual (oCompare, oStandard) {
      let bEqual = true
      for (let p in oStandard) {
        if (this.oStandard[p] !== this.oCompare[p]) {
          bEqual = false
          break
        }
      }
      return bEqual
    },
    // 获取监控点。
    getCameraPoints () {
      let sUrl = this.interfaceUrl
      let aParams = []
      if (this.interfaceParameters.length) {
        INTERFACE_PARAMETERS.forEach(sParameter => {
          if (this.parameters.indexOf(sParameter) > -1) {
            aParams.push(`${sParameter}=${this[sParameter]}`)
          }
        })
        if (aParams.length) {
          sUrl += '?' + aParams.join('&')
        }
      }
      axios.get(sUrl)
        .then((oAjaxData) => {
          if (oAjaxData.status === 200) {
            if (oAjaxData.data.c === 1) {
              // 请求成功。
              this.requestSucess(oAjaxData.data.r.map(o => {
                return o.cameraId
              }))
            } else {
              console.log('请求失败。')
            }
          } else {
            console.log('请求失败。')
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },
    // 监控点请求成功。
    requestSucess (aoData) {
      if (aoData && aoData.length) {
        // 保存监控点。
        this.cameraPoints = aoData
        // 设置选中监控点id。
        this.monitorForm.cameraId = this.cameraPoints[0]
        // 提交。
        this.$nextTick(() => {
          this.submitForm('monitorForm')
        })
      }
    },
    // 请求失败。
    requestFail (sErrorMessage) {
      this.cameraPoints = []
      this.monitorForm.cameraId = ''
      console.warn(sErrorMessage)
    },
    // 请求错误。
    requestError (err) {
      this.cameraPoints = []
      this.monitorForm.cameraId = ''
      console.warn('请求错误。')
      console.log(err)
    }
  }
}
</script>

<style lang="less" scoped>
#monitor {
  height: 100%;
  background: #fff;
}

.form-inline {
  padding: 0 20px;
  border-bottom: 1px solid #ccc;

  .el-form-item.parameter {
    margin-right: 30px;
  }

  .el-form-item {
    margin-right: 0px;
    margin-bottom: 0px;
  }

  .el-button {
    border-radius: 0;
    width: 80px;
    height: 30px;
    padding: 0;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    font-size: 14px;
  }

  .split {
    text-align: center;
  }
}

.line {
  width: 100%;
  height: 1px;
  background-color: #cccccc;
}

.content-title {
  height: 16px;
  line-height: 16px;
  text-indent: 10px;
  border-left: 4px solid #42af8f;
  font-size: 16px;
  margin: 20px;
}

.camera {
  padding: 0 20px 20px;
}

iframe {
  border: none;
  width: 100%;
  height: 100%;
}

.error {
  color: red;
  border: 2px solid #42af8f;
  padding: 20px;
}
</style>
