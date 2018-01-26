<template>
    <div id="app">
        <v-header :config="false" :back="false" :tool="false"></v-header>
        <div class="wrap">
            <v-video :equipment-id="equipmentId" :equipment-name="equipmentName" :time="time" :series="series" v-if="camera"></v-video>
        </div>
    </div>
</template>

<script>
import header from "components/header/header.vue"
import Monitor from "components/monitor/monitor.vue"

// 工厂定制地址。
const MODULE_DATA_URL = HOST + "/api/v1/customized/equipment-analysis/items"

export default {
    components: {
        'v-header': header,
        'v-video': Monitor
    },
    data() {
        return {}
    },
    computed: {
        // 工厂定制内容是否获取到的标志判断。
        factoryDataFecthed() {
            return this.$store.state.factoryModule.fetched
        },
        // 视频监控工厂定制。
        factoryCameraConfig() {
            return this.$store.state.factoryModule.factoryCameraConfig
        },
        oParams() {
            return window.Rt.utils.getParams();
        },
        equipmentId() {
            return this.oParams.equipmentId || '';
        },
        equipmentName() {
            return this.oParams.equipmentName || '';
        },
        time() {
            return this.oParams.time || '';
        },
        series() {
            return this.oParams.series || '';
        },
        camera() {
            return this.$store.state.versionModule &&　this.$store.state.versionModule.camera
        }
    },
    created() {
        this.$register.login(this.$store)

        // 获取配置数据。
        // 获取版本信息配置
		this.$register.getVersion(this.$store, this.$ajax, () => {
			if(!this.camera) {
				// 若不支持视频监控。
				this.$message.error('暂无权限。');
			}else {
                // 组件创建完后获取数据，
                // 此时 data 已经被 observed 了
                if (!this.factoryDataFecthed) {
                    // 若未获取工厂定制数据。
                    // 获取数据。
                    this.getFactoyData()
                }
            }
			
        })
        
    },
    methods: {
        // 获取工厂定制数据。
        getFactoyData() {
            // 获取配置数据。
            this.$register.getBeforeDispatchData(
                "getFactoryConfig",
                this.$store,
                this.$ajax,
                null,
                MODULE_DATA_URL
            )
        }
    }
}
</script>

<style lang="less" scoped>
    #app {
        height: 100%;
        // display: flex;
        // flex-direction: column;
    }
    header {
        // flex: 0 0;
    }
    .wrap {
        // flex: 1 1;
        margin: 20px;
    }
</style>

