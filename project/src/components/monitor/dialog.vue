<template>
	<el-dialog class="dialog-wrap" title="视频监控" size="large" :visible.sync="dialogVisible" :before-close="handleClose">
        <i class="open-icon icon icon-16 icon-openNew" @click="openNewPage"></i>
        <v-video :equipment-name="equipmentName" :equipment-id="equipmentId" :time="time" :type="type"></v-video>
    </el-dialog>
</template>

<script>
import Monitor from "components/monitor/monitor.vue"

export default {
    components: {
        "v-video": Monitor
    },
    props: {
        dialogVisible: {
            type: Boolean,
            default: false
        },
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
        }
    },
    created() { 
    },
    methods: {
        handleClose() {
            this.$emit('hideDialog')
        },
        // 打开新页面。
        openNewPage() {
            this.$emit("hideDialog")

            // 打开 页面。
            window.open(`monitor.html?equipmentName=${this.equipmentName}&equipmentId=${this.equipmentId}&time=${this.time}&type=${this.type}`, "_blank");
        }
    }
}
</script>

<style scoped>
    .open-icon {
        position: absolute;
        top: 20px;
        right: 54px;
        cursor: pointer
    }
</style>

