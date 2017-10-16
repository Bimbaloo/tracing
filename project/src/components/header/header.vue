<template>
    <header>
        <img :src="logo" @click="goSearch"/>
        <v-tooltip :config="config" :back="back" :tool="tool"></v-tooltip>
    </header>
    
</template>
<script>

    import logo from 'assets/img/kssp-logo.png'
    import tooltip from 'components/header/tooltip.vue'
    
    export default {
        components: {
            'v-tooltip': tooltip
        },
        props: {
            // 是否需要设置链接。
            config: Boolean,
            // 是否需要返回链接。
            back: [Boolean, String],
            // 是否需要小工具链接。
            tool: {
            	required: false,
            	type: Boolean,
            	default: true
            }
        },
        data () {
            return {
                logo
            }
        },
        methods: {
        	goSearch() {
        		window.open("search.html", "_self");
        	}
        }
    }
</script>
<style lang="less" scoped>
    header{
        height: 68px;
        line-height: 68px;
        background-color: #333;
        /*padding-left: 40px;*/
        padding: 0 20px 0 40px;
        color: #fff;
        font-size: 16px;
        font-family: 微软雅黑;
        position: relative;

        img {
            // height: 48px;
            vertical-align: middle;
            cursor: pointer;
        }
    }

    // .header-icon {
    // 	float: right;
    	
    //     .icon-back, .icon-config {
    //         cursor: pointer;
    //     }
    //     .icon-config {
    //         margin-left: 10px;
    //     }
    // }
</style>
