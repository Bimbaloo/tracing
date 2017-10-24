<template>
  <div id="monitor">
    <el-form :inline="true" :model="monitorForm" class="form-inline" :rules="rules" ref="monitorForm">
        <el-form-item label="监控点：" prop="cameraId" class="parameter">
            <el-radio-group v-model="monitorForm.cameraId">
                <el-radio v-for="(item, index) in cameraPoints" :key="item" :label="item">{{index+1}}</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="监控时间：" required class="parameter">
            <el-col :span="11">
                <el-form-item prop="startDate">
                    <el-date-picker type="datetime" @change.native="dateChange('startDate', $event)" @change="startClick" placeholder="选择开始时间" v-model="monitorForm.startDate" style="width: 100%;"></el-date-picker>
                </el-form-item>     
            </el-col>
            <el-col class="split" :span="2">-</el-col>
            <el-col :span="11">
                <el-form-item prop="endDate">
                    <el-date-picker type="datetime" @change.native="dateChange('endDate', $event)" @change="endClick" placeholder="选择结束时间" v-model="monitorForm.endDate" style="width: 100%;"></el-date-picker>
                </el-form-item> 
            </el-col>
        </el-form-item>
        <el-form-item v-if="cameraPoints.length">
            <el-button type="primary" @click="submitForm('monitorForm')">查询</el-button>
        </el-form-item>
    </el-form>
    <!--div class="line"></div-->
    <div class="content-title">{{name}}&nbsp;&nbsp;{{poolTime}}&nbsp;&nbsp;{{type=="1"?"投料":"产出"}}监控</div>
    <div class="camera" :style="{height: cameraHeight + 'px'}">
        <iframe v-if="cameraPoints.length" ref="video"></iframe>
        <div v-else class="error">暂无监控视频。</div>
    </div> 
  </div>
</template>

<script>
import $ from 'jquery'  
  
// 获取监控点接口地址。
const CAMERA_POINT_URL = HOST + "";
// 向前推10s。
const PRE_TIME = 10;
// 向后推10s。
const FORWARD_TIME = 10;
// 视频最大播放时长，单位分钟。
const MAX_VIDEO_TIME = 60;
// 视频地址。
const VIDEO_URL = "/page/commandCenter/camera/history.html";

export default {
    props: {
        equipmentName: {
            type: String,
            default: ""
        },
        equipmentId: {
            type: [String, Number],
            default: ""
        },
        time: {
            type: String,
            default: ""
        },
        // 1-投料；2-产出
        type: {
            type: [String, Number],
            default: ""
        }
    },
    data() {
        return {
            cameraHeight: 300,
            monitorForm: { 
                cameraId: "",
                startDate: "",
                endDate: ""
            },
            // 监控点。
            cameraPoints: [],
            // 前一次查询条件。
            forwardForm: null
        } 
    },
    computed: {
        // 投产时间。
        poolTime() {
            return decodeURIComponent(this.time);
        },
        // 设备名称。
        name() {
            return decodeURIComponent(this.equipmentName);
        },
        // 验证规则。
        rules() {
            // 验证开始时间。
            let validateStartTime = (rule, value, callback) => {
                    let sEnd = this.monitorForm.endDate,
                        sTime = value.trim(),
                        bIsFormat = window.Rt.utils.isDateTime(sTime),
                        bIsEndFormat = window.Rt.utils.isDateTime(sEnd),
                        nNow = +new Date();
                        
                    if(!sTime) {
                        callback(new Error("请输入开始时间"))
                    }else if(!bIsFormat) {
                        callback(new Error("请输入正确的时间格式"));
                    }else if(+new Date(sTime) > nNow) {
                        callback(new Error("时间不能超过当前时间"));
                    }else if(sEnd && bIsEndFormat && +new Date(sTime) > +new Date(sEnd) ){
                        // 如果开始时间存在，而且开始时间大于结束时间。
                        callback(new Error("开始时间必须小于结束时间"));
                    }else if(sEnd && bIsEndFormat && +new Date(sTime) + MAX_VIDEO_TIME*60*1000 < +new Date(sEnd) ){
                        // 如果开始时间存在，而且开始时间与结束时间间隔超过MAX_VIDEO_TIME。
                        callback(new Error("开始时间与结束时间间隔不能超过" + MAX_VIDEO_TIME + "分钟"));
                    }else {
                        callback();
                    }  
                },
                // 验证结束时间。
                validateEndTime = (rule, value, callback) => {
                    let sStart = this.monitorForm.startDate,
                        sTime = value.trim(),
                        bIsFormat = window.Rt.utils.isDateTime(sTime),
                        bIsStartFormat = window.Rt.utils.isDateTime(sStart),
                        nNow = +new Date();
                        
                    if(!sTime) {
                        callback(new Error("请输入结束时间"))
                    }else if(!bIsFormat) {
                        callback(new Error("请输入正确的时间格式"));
                    }else if(+new Date(sTime) > nNow) {
                        callback(new Error("时间不能超过当前时间"));
                    }else if(sStart && bIsStartFormat && +new Date(sStart) > +new Date(sTime) ){
                        // 如果开始时间存在，而且开始时间大于结束时间。
                        callback(new Error("结束时间必须大于开始时间"));
                    }else if(sStart && bIsStartFormat && +new Date(sStart) + MAX_VIDEO_TIME*60*1000 < +new Date(sTime) ){
                        // 如果开始时间存在，而且开始时间与结束时间间隔超过MAX_VIDEO_TIME。
                        callback(new Error("开始时间与结束时间间隔不能超过" + MAX_VIDEO_TIME + "分钟"));
                    }else {
                        callback();
                    }
                    
                };

                return {
                    startDate: [{validator: validateStartTime, trigger: "change", required: true}],
                    endDate: [{validator: validateEndTime, trigger: "change", required: true}]
                };
            }
    },
    created() {
        // 设置监控时间。
        this.setTime();
        // 获取监控点。
        this.getCameraPoints();
    },
    mounted() {
        this.$nextTick(()=>{
            this.setHeight();
        });
    },
    methods: {
        // 设置高度。
        setHeight() {
            var nHeight = window.document.documentElement.clientHeight,
                jWrap = $(".wrap"),
                jForm = $(".form-inline"),
                jTitle = $(".content-title"),
                jHeader = $("header"),
                jCamera = $(".camera"),
                nReturnHeight = 0;
            
            // 获取页面中的可显示高度。
            nReturnHeight = nHeight
                        - jHeader.outerHeight(true)
                        - (jWrap.outerHeight(true) - jWrap.height())
                        - jForm.outerHeight(true)
                        - jTitle.outerHeight(true)
                        - (jCamera.outerHeight(true) - jCamera.height());

            this.cameraHeight = nReturnHeight;
        },
        // 输入处理
        dateChange(key, event) {
            let sVal = event.target.value;
            this.monitorForm[key] = sVal;
        },
        // 选中确定处理
        startClick(value) {
            if(value != undefined) {
                this.monitorForm.startDate = value;
            }else {
                // 点击插件自动清空，返回是undefined 
                this.monitorForm.startDate = '';
            }
        },
        // 选中确定处理
        endClick(value) {
            if(value != undefined) {
                this.monitorForm.endDate = value;
            }else {
                // 点击插件自动清空，返回是undefined 
                this.monitorForm.endDate = '';
            }
        },
        // 设置监控时间。
        setTime() {
            if(this.poolTime) {
                this.monitorForm.startDate = new Date(+new Date(this.poolTime) - PRE_TIME*1000).Format();
                this.monitorForm.endDate = new Date(+new Date(this.poolTime) + FORWARD_TIME*1000).Format();
            }      
        },
        // 提交。
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    if(!this.forwardForm || (this.forwardForm && !this.isEqual(this.forwardForm, this.monitorForm))) {
                        // 若条件发生改变。
                        this.$refs["video"].src = `${VIDEO_URL}?cameraId=${this.monitorForm.cameraId}&startDate=${encodeURIComponent(this.monitorForm.startDate)}&endDate=${encodeURIComponent(this.monitorForm.endDate)}`
                    }
                } else {
                    console.log('error submit!');
                    return false;
                }
            });
        },
        /**
         * 判断两个对象相等。
         * @param{Object} oCompare
         * @param{Object} oStandard
         * @return{Boolean} 
         */
        isEqual(oCompare, oStandard) {
            let bEqual = true;
            for(let p in oStandard) {
                if(this.oStandard[p] !== this.oCompare[p]) {
                    bEqual = false;
                    break;
                }  
            }
            return bEqual;
        },
        // 获取监控点。
        getCameraPoints() {
            // this.$register.sendRequest(this.$store, this.$ajax, this.url, "get", {
            //     equipmentId: equipmentId,
            //     type: type
            // }, this.requestSucess, this.requestFail, this.requestError);    
            this.requestSucess(["001", "002"]);     
        },
        // 监控点请求成功。
        requestSucess(aoData) {
            if(aoData && aoData.length) {
                // 保存监控点。
                this.cameraPoints = aoData;
                // 设置选中监控点id。
                this.monitorForm.cameraId = this.cameraPoints[0]; 
                // 提交。
                this.$nextTick(() => {
                    this.submitForm('monitorForm');
                })  
            }  
        },
        // 请求失败。
        requestFail(sErrorMessage) {
            this.cameraPoints = [];
            this.monitorForm.cameraId = "";
            console.warn(sErrorMessage);
        },
        // 请求错误。
        requestError(err) {
            this.cameraPoints = [];
            this.monitorForm.cameraId = "";
            console.warn('请求错误。'); 
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
        padding: 20px 20px 0;
        border-bottom: 1px solid #ccc;

        .el-form-item.parameter {
            margin-right: 30px;
        }

        .el-form-item {
            margin-right: 0px;
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
        background-color: #CCCCCC;
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


