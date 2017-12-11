<template>
    <div id="app">
        <v-header :config="false" :back="false" :tool="false"></v-header>
        <div class="wrap">
            <!--router-view></router-view-->
            <v-video :equipment-id="equipmentId" :equipment-name="equipmentName" :time="time" :type="type" v-if="camera"></v-video>
        </div>
    </div>
</template>

<script>
import header from "components/header/header.vue"
import Monitor from "components/monitor/monitor.vue"

export default {
    components: {
        'v-header': header,
        'v-video': Monitor
    },
    data() {
        return {}
    },
    computed: {
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
        type() {
            return this.oParams.type || '';
        },
        camera() {
            return this.$store.state.versionModule &&　this.$store.state.versionModule.camera
        }
    },
    created() {
        // this.$router.push({ path: '/camera', query: { 
        //     equipmentId: this.oParams.equipmentId || '',  
        //     equipmentName: this.oParams.equipmentName || '', 
        //     time: this.oParams.time || '', 
        //     type: this.oParams.type || '' 
        // }});   
        this.$register.login(this.$store);

		// 获取配置数据。
		// this.$store.dispatch('getVersion').then(() => {
		// 	if(!this.camera) {
		// 		// 若不支持视频监控。
		// 		this.$message.error('暂无权限。');
		// 	}
			
		// });//getConfig
        // this.fetchData(); //获取数据  
        
        // 获取配置数据。
        // this.$store.dispatch('getConfig')
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

