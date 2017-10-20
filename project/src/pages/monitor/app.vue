<template>
    <div id="app">
        <v-header :config="false" :back="false" :tool="false"></v-header>
        <div class="wrap">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
import header from "components/header/header.vue"

export default {
    components: {
        'v-header': header
    },
    data() {
        return {}
    },
    computed: {
        oParams() {
            return window.Rt.utils.getParams();
        }
    },
    created() {
        this.$router.push({ path: '/camera', query: { 
            equipmentId: this.oParams.equipmentId || '',  
            equipmentName: this.oParams.equipmentName || '', 
            time: this.oParams.time || '', 
            type: this.oParams.type || '' 
        }});
    }
}
</script>

<style lang="less" scoped>
    #app {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    header {
        flex: 0 0;
    }
    .wrap {
        flex: 1 1;
        margin: 20px;
    }
</style>

