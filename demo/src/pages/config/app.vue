<template>
    <div id="app">
        <v-header></v-header>
        <div class="pbody">
            <div class="sidebar">
                <div class="sidebar-item" v-for="(item,index) in sidebarItems" :class="{active: isActive==index}" @click="turnTo(item.src,index)">
                    <div class="logo-item" :class="item.img"></div>
                    <span class="logo-item-text">{{item.text}}</span>
                </div>
            </div>

            <div class="content-bg">
                <div class="content">
                    <router-view></router-view>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import header  from 'components/header/header.vue';

    export default {
        components: {
            'v-header' : header
        },
        data() {
            return {
                isActive: 0,
                sidebarItems:[{
                    text:'自定义查询入口',
                    img: '',
                    src:'/query'
                },{
                    text:'自定义条件名称',
                    img: 'field',
                    src:'/field'
                }],
            }
        },
        created() {
            this.$router.push('query');
        },
        methods: {
            turnTo(routerLink,index){
                this.isActive=index;
                this.$router.push({path:routerLink});
            }
        }
    }
</script>

<style lang="less">
    html,body {
        height: 100%;
    }
    #app{
        display: flex;
        flex-direction: column;
        height:100%;
    .pbody{
        display: flex;
        flex:1;
        flex-direction: row;
    }
        .sidebar{
            display: flex;
            flex-direction: column;
            flex:0 0 180px;
            background: #ffffff;
            .sidebar-item{
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height:100px;
                text-align: center;
                cursor: pointer;
                &:hover,&.active{
                    background: #42af8f;
                    color: #ffffff;
                    .logo-item{
                        background-position: 0 0;
                        &.field{
                            background-position: 0 -30px;
                         }
                    }
                 }
                 .logo-item{
                     height:30px;
                     width: 30px;
                     margin:20px auto 0;
                     background: url("../../assets/img/img01.png")no-repeat;
                     background-position: -30px 0;
                     &.field{
                        background-position: -30px -30px;
                      }
                 }
                .logo-item-text {
                	line-height: 40px;
                }
            }
        }
        .content-bg{
            width: 100%;
            background: #cccccc;
            padding: 20px;
            .content{
                width: 100%;
                height: 100%;
                background: #ffffff;
            }
        }
    }


</style>
