<template>
  <div id="monitor">
    <el-form :inline="true" :model="form" class="form-inline">
        <el-form-item label="监控点：" prop="cameraId" required>
            <el-radio-group v-model="form.cameraId">
                <el-radio v-for="(item, index) in cameraPoints" :key="item" :value="item" :label="item">{{index+1}}</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="监控时间：" required>
            <el-col :span="11">
                <el-form-item prop="startDate">
                    <el-date-picker type="datetime" placeholder="选择开始时间" v-model="form.startDate" style="width: 100%;"></el-date-picker>
                </el-form-item>     
            </el-col>
            <el-col class="split" :span="2">-</el-col>
            <el-col :span="11">
                <el-form-item prop="endDate">
                    <el-date-picker type="datetime" placeholder="选择结束时间" v-model="form.endDate" style="width: 100%;"></el-date-picker>
                </el-form-item> 
            </el-col>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="onSubmit">查询</el-button>
        </el-form-item>
    </el-form>
    <!--div class="line"></div-->
    <div class="content-title">{{equipmentName}}&nbsp;&nbsp;{{time}}&nbsp;&nbsp;{{type=="1"?"投料":"产出"}}监控</div>
    <div class="camera">
        <iframe v-if="cameraPoints.length"></iframe>
        <div v-else class="error">无监控视频。</div>
    </div> 
  </div>
</template>

<script>

// 获取监控点接口地址。
const CAMERA_POINT_URL = HOST + "";
// 向前推10s。
const PRE_TIME = 10;
// 向后推10s。
const FORWARD_TIME = 10;

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
            // 监控点。
            cameraPoints: [],
            // 前一次查询条件。
            forwardForm: null,
            // 验证规则。
            rules: {
                name: [
                    { required: true, message: '请输入活动名称', trigger: 'blur' },
                    { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
                ],
                region: [
                    { required: true, message: '请选择活动区域', trigger: 'change' }
                ],
                date1: [
                    { type: 'date', required: true, message: '请选择日期', trigger: 'change' }
                ],
                date2: [
                    { type: 'date', required: true, message: '请选择时间', trigger: 'change' }
                ],
                type: [
                    { type: 'array', required: true, message: '请至少选择一个活动性质', trigger: 'change' }
                ],
                resource: [
                    { required: true, message: '请选择活动资源', trigger: 'change' }
                ],
                desc: [
                    { required: true, message: '请填写活动形式', trigger: 'blur' }
                ]
            }
        } 
    },
    computed: {
        // 监控视频传参。
        form() {
            return {
                cameraId: "",
                startDate: (+new Date(this.time) - PRE_TIME*1000).Format("yyyy-MM-dd hh:mm:ss"),
                endDate: (+new Date(this.time) + FORWARD_TIME*1000).Format("yyyy-MM-dd hh:mm:ss")
            }
        }
    },
    created() {
        // 获取监控点。
        this.getCameraPoints();
    },
    methods: {
        onSubmit() {
            
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
            // 保存监控点。
            cameraPoints = aoData;
            // 设置选中监控点id。
            form.cameraId = cameraPoints[0]; 
            
            // 查询。
            this.onSubmit();
        },
        // 请求失败。
        requestFail(sErrorMessage) {
            cameraPoints = [];
            console.warn(sErrorMessage);
        },
        // 请求错误。
        requestError(err) {
            cameraPoints = [];
            console.warn('请求错误。'); 
        }
    }
}
</script>

<style lang="less" scoped>
    #monitor {
        height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
 
        background: #fff;
    }

    .form-inline {
        box-sizing: border-box;
        padding: 20px 20px 0;
        flex: 0 0;
        border-bottom: 1px solid #ccc;

        .el-form-item {
            margin-right: 30px;
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
        flex: 0 0;
    }

    .content-title {
        height: 16px;
        line-height: 16px;
        text-indent: 10px;
        border-left: 4px solid #42af8f;
        font-size: 16px;
        margin: 20px;   
        flex: 0 0;         
    }

    .camera {
        flex: 1 1; 
        padding: 20px;
    }

    iframe {
        border: none;
        width: 100%;
        height: 100%;
    }
</style>


