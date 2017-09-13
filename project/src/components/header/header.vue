<template>
    <header>
        <img :src="logo"/>
        <!--——&nbsp;&nbsp;追溯系统-->
        <!--div class="header-icon">
	        <i v-if="bShowSearch" class="icon icon-24 icon-back" @click="goToSearch"></i>
	        <i v-if="bShowConfig" class="icon icon-24 icon-config" @click="goToConfig"></i>
        </div-->
        <v-tooltip :config="config" :back="back"></v-tooltip>
    </header>
</template>
<script>

    import logo from 'assets/img/kssp-logo.png'
    // import 'assets/css/icon.less'
    import tooltip from 'components/header/tooltip.vue'
    // const pathName = window.location.pathname;
    
    export default {
        components: {
            'v-tooltip': tooltip
        },
        props: {
            // 是否需要设置链接。
            config: Boolean,
            // 是否需要返回链接。
            back: [Boolean, String]
        },
        data () {
            return {
                logo,
                // bShowSearch: pathName.indexOf("trace")<0 && pathName.indexOf("track")<0,
                // bShowConfig: pathName.indexOf("config.html")<0 && pathName.indexOf("trace")<0 && pathName.indexOf("track")<0
            }
        },
        methods: {
        	// 跳转到搜索页。
        	// goToSearch() {
        	// 	window.open("search.html", "_self");
        	// 	// 返回上一级目录。
        	// },
        	// // 跳转到配置页面。
        	// goToConfig() {
        	// 	window.open("config.html", "_self");
        	// }
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
