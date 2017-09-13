    
<template>

    <div class="tooltip-info" @mouseenter="showList=true" @mouseleave="showList=true">
        <div v-if="back" class="back" @click="goBack">返回</div>
        <div v-if="back" class="division">|</div>
        <el-tooltip class="item" effect="light" content="Bottom Right" placement="bottom-end">
            <ul slot="content" class="info-list">
                <li @click="goToConfig" v-if="config">设置</li>
                <li @click="logout" v-if="userId">退出</li>
            </ul>     
            <div class="user-name" :style="{cursor: nickname?'default':'pointer'}" @click="login">{{nickname || "登录"}}<i class="el-icon-arrow-down"></i></div>
        </el-tooltip>
    </div>
</template>

<script>
    // 登录。
    const LOGIN_URL = HOST + "/api/v1/sso/get-login-info";
    // 退出。
    const LOGOUT_URL = HOST + "/api/v1/sso/logout";

    export default {
        props: {
            // 是否需要设置链接。
            config: Boolean,
            // 是否需要返回链接。
            back: [Boolean, String]
        },
        data () {
            return {
                showList: true
            }
        },
        computed: {
            token() {
                return this.$store.state.loginModule.token
            },
            userId() {
                return this.$store.state.loginModule.userId
            },
            username() {
                return this.$store.state.loginModule.username
            },
            nickname() {
                return this.$store.state.loginModule.nickname
            },
        },
        methods: {
        	// 跳转到配置页面。
        	goToConfig() {
        		window.open("config.html", "_self");
            },
            // 回退。
            goBack() {
                window.open(this.back, "_self");
            },
            // 登录。
            login() {
                if(this.userId) {
                    return;
                }

                this.$ajax.get(LOGIN_URL).then((res) => {
                    if(res.data.errorCode === 0) {
                        // 登录成功。
                        this.$register.loginFail(res.data.data.loginUrl)
                    }else {
                        // 提示信息。
                        console.log(res.data.errorMsg)
					    this.$message.error("登录失败。");
                    }
                }).catch((err) => {
                    console.log(err);
                    this.$message.error("登录失败。");
                })
            },
            // 退出。
            logout() {
                this.$register.beforeRequest(this.$store, this.$ajax).post(LOGOUT_URL).then((res) => {
                    // 清cookie。
                    this.$register.clearLoginCookie();
                    // 更新数据。
                    this.$store.commit({
                        type: "updateLoginInfo"
                    });  

                    // 跳转到search。
                    window.open("search.html", "_self");
                })
            },
        }
    }
</script>
<style lang="less">

    .el-tooltip__popper.is-light {
        padding: 0;   
        border: none;
    }

    .tooltip-info {
        position: absolute;
        right: 20px;
        top: 27px;
        height: 14px;
        line-height: 14px;
        font-size: 14px;
        color: #fff;
        height: auto;

        .el-icon-arrow-down {
            display: inline-block;
            padding-left: 10px; 
        }

        .back,.division,.item {
            display: inline-block;
        }
        
        .back {
            cursor: pointer;
        }
        .division {
            padding: 0 10px;
        }
    }

    // 设置相关列表。
    .info-list {
        width: 90px;
        // border: 1px solid #ccc;
        background: #fff;
        border-radius: 4px;
        box-shadow: 0px 3px 3px #888;
        padding: 10px 0;

        li {
            color: #999;
            text-align: center;
            padding: 10px 0;

            &:hover {
                background: #dedede;
                color: #666;
                cursor: pointer;
            }
        }
    }
</style>