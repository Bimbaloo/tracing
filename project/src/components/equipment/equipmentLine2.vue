<template>
    <div class="analysis">
        <div class="name">
            <label @click="showEquiomentDetail(info)" v-for="info in equipments" v-if="equipmentData[info.equipmentId].selected">{{info.equipmentName}}<i class="el-icon-d-arrow-right"></i></label>
        </div>
        <div class="equipment">
            <div class="equipment-line" :style="{width: ratio*100 + '%', left: (-windowTime.left)*ratio + '%', 'padding-top': (this.top-14) + 'px', 'padding-bottom': (this.bottom-14) + 'px'}" ref="line" v-for="info in equipments" v-if="equipmentData[info.equipmentId].selected" :key="info.equipmentId">
                <div v-for="(status,index) in info.status" :key="index" :data-type="status && status.type" class="status" :style="{left: Rt.utils.DateDiff(status && status.startTime, datetime.start)*100/Rt.utils.DateDiff(datetime.endTime, datetime.start) + '%', width: Rt.utils.DateDiff(status && status.endTime, status && status.startTime)*100/Rt.utils.DateDiff(datetime.endTime, datetime.start) + '%'}">
                    <div>{{status && status.startTime}}~{{status && status.endTime}}</div>
                </div>                   
            </div>       
        </div>
    </div>
</template>

<script>
    import Vue from 'vue'
    
    export default{
        props: {
            equipments: Array,
            equipmentData: Object,
			// euqipmentStatus: Array,
            // euqipmentWork: Object,
            // euqipmentQuality: Object,
            // equipmentEvent: Object,
            // equipmentRepair: Object,
            // equipmentTool: Object,
			dimensionData: [Array, String],
            ratio: Number,
            dateTime: Object,
            windowTime: Object
		},
        data() {
            return {
                top: 0,
                bottom: 0
            }
        },
        computed: {
            status: function() {
                return this.euqipmentStatus;
            },
            work: function() {
                return this.euqipmentWork;
            },
            quality: function() {
                return this.euqipmentQuality;
            },
            event: function() {
                return this.euqipmentEvent;
            },
            repair: function() {
                return this.equipmentRepair;
            },
            tool: function() {
                return this.equipmentTool;
            },
            diffTime: function() {
                return Rt.utils.DateDiff(this.dateTime.start, this.dateTime.end);
            }
        },
        created() {
        },
        watch: {
            status: function() {
                this.setStatus();
            },
            work: function() {
                this.setWork();
            },
            quality: function() {
                this.setQuality();
            },
            event: function() {
                this.setEvent();
            },
            repair: function() {
                this.setRepair();
            },
            tool: function() {
                this.setTool();
            }
        },
        methods: {
            // 设置状态。
            setStatus: function() {
                // console.log(JSON.stringify(this.status));
                // this.status = [{"startTime":"2016-03-31 8:30:33","endTime":"2016-03-31 14:35:33","type":"run"},{"startTime":"2016-03-31 14:30:33","endTime":"2016-03-31 16:35:33","type":"stop"}]
                let self = this;
    
                this.$refs.line.innerHTML = "";
                // 动态添加状态。
                let MyComponent = Vue.extend({
                    render: function (createElement) {
                        return createElement("div", {
                            class: ["status-line"]
                        }, self.status.map(item => {
                            return createElement("div", {
                                class: ["status"],
                                style: {
                                    left: Rt.utils.DateDiff(self.dateTime.start, item.startTime)*100/self.diffTime + "%",
                                    width: Rt.utils.DateDiff(item.startTime, item.endTime)*100/self.diffTime + "%"
                                },
                                attrs: {
                                    "data-type": item.type
                                }
                            }, [
                                self.$createElement('div', {
                                    class: {
                                        period: true
                                    }
                                }, item.startTime + "~" + item.endTime),
                                self.$createElement('div', {
                                    class: {
                                        "period-line": true
                                    }
                                }, [
                                    self.$createElement('i', {
                                        class: {
                                            icon: true,
                                            "icon-period": true
                                        }
                                    })
                                ]),
                            ])
                        }))
                    }
                });

                var component = new MyComponent().$mount()
                this.$refs.line.appendChild(component.$el);        
            },
            setWork: function() {
                console.log(this.work)
            },
            // 设置质量。
            setQuality: function() {
                console.log(JSON.stringify(this.quality));
                let oQuality = this.quality,
                    self = this,
                    aoSortData = [];

                for(let p in oQuality) {
                    if(p == "shortQcList") {
                        // 质检。
                        oQuality[p].forEach(o => {
                            o.type = "shortQcList";
                        })
                        aoSortData = aoSortData.concat(oQuality[p]);

                    }else if(p == "longQcList") {
                        // 送检。
                        oQuality[p].forEach(o => {
                            o.type = "longQcList";
                            o.startTime = o.happenTime;
                        })
                        aoSortData = aoSortData.concat(oQuality[p]);
                    }
                    
                }

                // 按照开始时间排序。
                aoSortData.sort((a, b) => {
                    return a.startTime < b.startTime;
                });

                aoSortData.map((o, index) => {
                    if(o.type == "shortQcList") {
                        this._createNode(o, index, "quality", "质检", {
                            startTime: "开始时间",
                            endTime: "结束时间",                         
                            personName: "操作人",
                            method: "三检类型",
                            result: "质检结果"
                        });
                    }else if(o.type == "longQcList") {
                        this._createNode(o, index, "quality", "送检", {
                            happenTime: "送检时间",
                            checkTime: "检验时间",
                            checkPersonName: "检验人",
                            doCode: "工单号",
                            materialName: "物料",
                            batchNo: "批次",
                            result: "送检结果"
                        });
                    }
                })
            },
            /**
             * @param {Object} item
             * @param {String} sType
             * @param {String} sTitle
             * @param {Object} oList
             * @return {void} 
             */
            _createNode: function(item, index, sType, sTitle, oList) {
                let self = this,
                    sClass = "up";

                if(index % 2) {
                    sClass = "down";
                }

                let MyComponent = Vue.extend({
                    render: function (createElement) {
                        return createElement("div", {
                            class:["dimension-list", sType, sClass],
                            style: {
                                left: Rt.utils.DateDiff(self.dateTime.start, item.startTime)*100/this.diffTime + "%"
                                // height: this.height + "px"
                            }
                        }, [
                            self.$createElement('div', {
                                class: ["circle"]
                            }),
                            self.$createElement('div', {
                                class: ["dimension-content"]
                            }, [
                                self.$createElement('h2', {}, [
                                    self.$createElement('i', {
                                        class: ["icon", "icon-20", "icon-" + sType]
                                    }),
                                
                                    self.$createElement('span', {}, sTitle)
                                ]),
                                self.$createElement('ul', {
                                    class: ["content"]
                                }, Object.keys(oList).map(p => {
                                    return self.$createElement('li', {}, oList[p] + "：" + item[p])
                                }))
                            ]),                                                                
                            self.$createElement('div', {
                                class: ["circle"]
                            })
                        ])
                    }
                });

                var component = new MyComponent().$mount();
                this.$refs.line.appendChild(component.$el);
                debugger
                if(sClass == "up") {
                    if(this.top < component.$el.clientHeight) {
                        this.top = component.$el.clientHeight;
                    }                 
                }else {
                    if(this.bottom < component.$el.clientHeight) {
                        this.bottom = component.$el.clientHeight;
                    }
                }
            },     
            setEvent: function() {
                console.log(this.event)
            },
            setRepair: function() {
                console.log(this.repair)
            },
            setTool: function() {
                console.log(this.tool);
            }
        }
        
    }
</script>

<style lang="less">
    @import "../../assets/css/base.less";
    .equipment-line {
        width: 100%;
        // border: 1px solid #ccc;
        background-color: transparent;
        // height: 14px;
        box-sizing: border-box;
        margin: 20px 0;
        position: relative;
        // padding: 200px 0;

        &:first-child {
            margin-top: 40px;
        }
    }
   
    .icon.icon-period {
        width: 30px;
        height: 30px;
        background-image: url(../../assets/img/icon-period.png);
    }

    .status-line {
        height: 14px;
        position: relative;
    }

    .status {
        position: absolute;
        height: 100%;
        display: inline-block;
        top: 0;
        
        &[data-type="run"] {
            background-color: #72b733;
            .icon-period {
                background-position: 0 0;
            }
        }
        &[data-type="stop"] {
            background-color: #fac41b;
            .icon-period {
                background-position: 0 -60px;
            }
        }
        &[data-type="debug"] {
            background-color: #009aff;
            .icon-period {
                background-position: 0 -30px;
            }
        }
        &[data-type="close"] {
            background-color: #cccccc;
            .icon-period {
                background-position: 0 -90px;
            }
        }

        .period {
            position: absolute;
            width: 100%;
            text-align: center;
            top: -34px;
            left: 0;
            display: none;
            white-space: nowrap;
        }
        .period-line {
            position: absolute;
            width: 100%;
            text-align: center;
            top: -19px;
            left: 0;
            height: 30px;
            display: none;
        }

        &:hover {
            .period,.period-line {
                display: block;
            }
        }
    }

    .dimension-list {
        position: absolute;
        
        
        &.up {
            top: 0px;
            .circle:last-child {
                background-color: #fff;
                margin: 3px 0;
            }
        }
        &.down {
            bottom: 0px;
            .circle:first-child {
                background-color: #fff;
                margin: 3px 0;
            }

        }     

        .circle {
            width: 8px;
            height: 8px;
            border-radius: 4px;
            background-color: #42af8f;
        }

        .dimension-content {
            margin-left: 3px;
            border-left: 2px solid #42af8f;

            h2 {
                height: 30px;
                line-height: 30px;
                padding-left: 10px;
                
                span {
                    font-weight: 600;
                }

            }

            .content {
                padding: 5px 0;
                li {
                    padding: 5px 10px;
                }
            }
        }

        h2 {
            font-size: 18px;
            color: #42af8f;
            i {
                margin-right: 10px;
            }
        }

        &:hover {
            h2 {
                background-color: #42af8f;
                color: #fff;
            }    

            // 质量。
            .icon-quality {
                background-position: -@px20 -16*@px20;
            }

            // 加工。
            .icon-work {
                background-position: -@px20 -17*@px20;
            }

            // 事件。
            .icon-event {
                background-position: -@px20 -18*@px20;
            }

            // 维护。
            .icon-repair {
                background-position: -@px20 -19*@px20;
            }
            
            // 工具。
            .icon-tool {
                background-position: -@px20 -20*@px20;
            }

        }
    }
</style>