<template>
    <div class="equipment-line" :style="{width: ratio*100 + '%', left: (-windowTime.left)*ratio + '%', 'padding-top': (top-14) + 'px', 'padding-bottom': (bottom-14) + 'px'}" ref="wrap">
        <!--div v-for="(info,index) in status" :key="index" :data-type="info.type" class="status" :style="{left: Rt.utils.DateDiff(info.startTime, datetime.start)*100/Rt.utils.DateDiff(datetime.endTime, datetime.start) + "%", width: Rt.utils.DateDiff(info.endTime, info.startTime)*100/Rt.utils.DateDiff(datetime.endTime, datetime.start) + "%"}">
            <div>{{info.startTime}}~{{info.endTime}}</div>
        </div-->
        <div class="status-line" ref="line"></div>
        <div v-for="info in dimension" v-show="selectedDimension.indexOf(info.type)>-1" :ref="info.key"></div>
    </div>
</template>

<script>
    import Vue from 'vue'

    const statusHeight = 14;

    export default{
        props: {
			euqipmentStatus: Array,
            euqipmentWork: Object,
            euqipmentQuality: Object,
            equipmentEvent: Object,
            equipmentRepair: Object,
            equipmentTool: Object,
			dimensionData: [Array, String],
            ratio: Number,
            dateTime: Object,
            windowTime: Object,
            euqipmentIndex: Number
		},
        data() {
            return {         
                top: statusHeight,
                bottom: statusHeight,
                labelNode: null,
				dimension: [{
					name: "质量",
                    key: "quality",
					type: "3",
                    top: statusHeight,
                    bottom: statusHeight,
                    node: []
				}, {
					name: "加工",
                    key: "work",
					type: "2",
                    top: statusHeight,
                    bottom: statusHeight,
                    node: []
				}, {
					name: "事件",
                    key: "event",
					type: "4",
                    top: statusHeight,
                    bottom: statusHeight,
                    node: []
				}, {
					name: "维护",
                    key: "repair",
					type: "5",
                    top: statusHeight,
                    bottom: statusHeight,
                    node: []
				}, {
					name: "工具",
                    key: "tool",
					type: "6",
                    top: statusHeight,
                    bottom: statusHeight,
                    node: []
				}],
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
            selectedDimension: function() {
                if(typeof this.dimensionData == "string") {
                    return [this.dimensionData];
                }else {
                    return this.dimensionData;
                }
            }
        },
        created() {
        },
        mounted() {
            let nodes = this.$refs.wrap.parentElement.previousElementSibling.querySelectorAll("label");
            this.labelNode = nodes[this.euqipmentIndex];            
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
            },
            selectedDimension: function() {
                console.log("change")
                
                this.$nextTick(() => {
                    this.setPanelPadding();
                })
            }
        },
        methods: {
            getDiffTime() {
                return Rt.utils.DateDiff(this.dateTime.start, this.dateTime.end);
            },
            // 设置状态。
            setStatus() {
                // console.log(JSON.stringify(this.status));
                // this.status = [{"startTime":"2016-03-31 8:30:33","endTime":"2016-03-31 14:35:33","type":"run"},{"startTime":"2016-03-31 14:30:33","endTime":"2016-03-31 16:35:33","type":"stop"}]

                let self = this;
                
                this.$refs.line.innerHTML = "";

                if(!this.status) {
                    return;
                }
                this.status.map(item => {
                    let MyComponent = Vue.extend({
                        render: function (createElement) {                    
                            return createElement("div", {
                                class: ["status"],
                                style: {
                                    left: Rt.utils.DateDiff(self.dateTime.start, item.startTime)*100/self.getDiffTime() + "%",
                                    width: Rt.utils.DateDiff(item.startTime, item.endTime)*100/self.getDiffTime() + "%"
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
                        }
                    }) 

                    var component = new MyComponent().$mount()
                    this.$refs.line.appendChild(component.$el);                     
                })        
            },
            setWork: function() {
                // console.log(this.work);
                
                let oNode = this.$refs.work;

                if(this.$refs.work instanceof Array) {
                    oNode = oNode[0];
                }
                
                oNode.innerHTML = "";

                let oWork = this.work,
                    aoSortData = [];
                
                if(!oWork) {
                    return;
                }
                for(let p in oWork) {
                    if(p == "startWorkList") {
                        // 加工。
                        oWork[p].forEach(o => {
                            o.type = "startWorkList";
                            o.startTime = o.happenTime;
                        })
                        aoSortData = aoSortData.concat(oWork[p]);

                    }else if(p == "finishWorkList") {
                        // 完工。
                        oWork[p].forEach(o => {
                            o.type = "finishWorkList";
                            o.startTime = o.happenTime;
                        })
                        aoSortData = aoSortData.concat(oWork[p]);
                    }else if(p == "poolInList") {
                        // 投料。
                        oWork[p].forEach(o => {
                            o.type = "poolInList";
                            o.startTime = o.happenTime;
                        })
                        aoSortData = aoSortData.concat(oWork[p]);
                    }else if(p == "poolOutList") {
                        // 产出。
                        oWork[p].forEach(o => {
                            o.type = "poolOutList";
                            o.startTime = o.happenTime;
                        })
                        aoSortData = aoSortData.concat(oWork[p]);
                    }
                    
                }

                // 按照开始时间排序。
                aoSortData.sort((a, b) => {
                    return a.startTime < b.startTime;
                });
           
                aoSortData.map((o, index) => {
                    if(o.type == "startWorkList") {
                        // 加工。
                        this.setDimensionConfig("work", this._createNode(o, index, "work", "加工", {
                            happenTime: "发生时间",                      
                            personName: "操作人",
                            doCode: "工单号",
                            processName: "工序"
                        }, o.groupId));
                    }else if(o.type == "finishWorkList") {
                        // 完工。
                        this.setDimensionConfig("work", this._createNode(o, index, "work", "完工", {
                            happenTime: "发生时间",
                            personName: "操作人"
                        }, o.groupId));
                    }else if(o.type == "poolInList") {
                        // 投料。
                        this.setDimensionConfig("work", this._createNode(o, index, "work", "投料", {
                            happenTime: "发生时间",
                            personName: "操作人",
                            doCode: "工单号",
                            materialName : "物料", 
						    batchNo : "批次",
							quantity : "数量"
                        }, o.groupId));
                    }else if(o.type == "poolOutList") {
                        // 产出。
                        this.setDimensionConfig("work", this._createNode(o, index, "work", "产出", {
                            happenTime: "发生时间",
                            personName: "操作人",
                            doCode: "工单号",
                            materialName : "物料", 
						    batchNo : "批次",
							quantity : "数量",
                            goodNum : "合格数",
							badNum : "不合格数",
                        }, o.groupId));
                    }
                })

                this.setPanelPadding()   
            },
            /**
             * 设置面板padding高度。
             * @param {String} sType
             * @return {void}
             */            
            setPanelPadding () {     
                let oDimension = {};

                if(!this.selectedDimension.length || (this.selectedDimension.length == 1 && !this.selectedDimension[0])) {
                    // 若无选中。
                    this.top = statusHeight;
                    this.bottom = statusHeight;
                }else if(this.selectedDimension.length == 1) {
                    // 若当前只显示一个维度的数据。              
                    let sType = this.selectedDimension[0];
                    oDimension = this.getDimensionConfig(sType);
                    this.top = oDimension.top;
                    this.bottom = oDimension.bottom;
                }else {
                    // 若有多个维度的数据。
                    this.selectedDimension.map(sDimension => {
                        oDimension = this.getDimensionConfig(sDimension);
                        // 设置最大值。
                        if(this.top < oDimension.top) {
                            this.top = oDimension.top;
                        }
                        if(this.bottom < oDimension.bottom) {
                            this.bottom = oDimension.bottom;
                        }
                    })
                }
                
                this.labelNode.style.paddingTop =  (this.top-statusHeight) + "px";
                this.labelNode.style.paddingBottom =  (this.bottom-statusHeight) + "px";

                this.selectedDimension.map(sDimension => {
                    if(!sDimension) {
                        return;
                    }
                    // 获取维度配置数据。
                    oDimension = this.getDimensionConfig(sDimension);
                    oDimension.node.map(oData => {
                        let com = oData.node;
                        if(oData.class == "up") {
                            // 若分布在状态轴上方。
                            com.style.top = (this.top - com.offsetHeight) + "px";
                        }else {
                            // 若分布在状态轴下方。
                            com.style.bottom = (this.bottom - com.offsetHeight) + "px";
                        }
                        
                    })
                })

            },
            /**
             * 设置维度配置数据。
             * @param {String} sType
             * @param {Object} oData
             * @return {void}
             */
            setDimensionConfig (sType, oData) {
                let aoDimension = this.dimension,
                    sLength = aoDimension.length,
                    // 事件节点。
                    oNode = oData.node,
                    // 节点内容高度。
                    nHeight = oNode.offsetHeight;

                for(let i = 0; i < sLength; i ++) {
                    if(aoDimension[i].key == sType) {
                        // 若初始值小于高度值，更新初始值。
                        aoDimension[i].node.push(oData);

                        if(oData.class == "up") {
                            // 若在状态上方
                            if(aoDimension[i].top < nHeight) {
                                // 若小于当前节点高度值。
                                aoDimension[i].top = nHeight;
                            }

                        }else {
                            // 若在状态下方
                            if(aoDimension[i].bottom < nHeight) {
                                // 若小于当前节点高度值。
                                aoDimension[i].bottom = nHeight;
                            }                            
                        }
        
                        break;
                    }
                }
            },
            /**
             * 获取维度设置。
             * @param {String} sType
             * @return {Object}
             */
            getDimensionConfig (sType) {
                return this.dimension.filter(o => o.type == sType)[0];
            },
            // 设置质量。
            setQuality () {
                // console.log(JSON.stringify(this.quality));
                let oNode = this.$refs.quality;

                if(this.$refs.quality instanceof Array) {
                    oNode = oNode[0];
                }
                
                oNode.innerHTML = "";

                let oQuality = this.quality,
                    aoSortData = [];

                if(!oQuality) {
                    return;
                }

                for(let p in oQuality) {
                    if(p == "qcList") {
                        // 质检。
                        oQuality[p].forEach(o => {
                            o.type = "qcList";
                        })
                        aoSortData = aoSortData.concat(oQuality[p]);

                    }else if(p == "submitQcList") {
                        // 送检。
                        oQuality[p].forEach(o => {
                            o.type = "submitQcList";
                            o.startTime = o.happenTime;
                        })
                        aoSortData = aoSortData.concat(oQuality[p]);
                    }                    
                }

                aoSortData.sort((a, b) => {
                    return a.startTime < b.startTime;
                });

                aoSortData.map((o, index) => {
                    if(o.type == "qcList") {
                        this.setDimensionConfig("quality", this._createNode(o, index, "quality", "质检", {
                            startTime: "开始时间",
                            endTime: "结束时间",                         
                            personName: "操作人",
                            method: "三检类型",
                            result: "质检结果"
                        }));
                    }else if(o.type == "submitQcList") {
                        this.setDimensionConfig("quality", this._createNode(o, index, "quality", "送检", {
                            happenTime: "送检时间",
                            checkTime: "检验时间",
                            checkPersonName: "检验人",
                            doCode: "工单号",
                            materialName: "物料",
                            batchNo: "批次",
                            result: "送检结果"
                        }));
                    }
                })

                this.setPanelPadding()               
            },
            /**
             * 创建列表节点。
             * @param {Object} item
             * @param {String} sType
             * @param {String} sTitle
             * @param {Object} oList
             * @param {Number} groupId
             * @return {void} 
             */
            _createNode (item, index, sType, sTitle, oList, groupId) {
                let self = this,
                    sClass = "up";

                if(index % 2) {
                    sClass = "down";
                }

                let MyComponent = Vue.extend({
                    render: function (createElement) {                        
                        return createElement("div", {
                            class: ["dimension-list", sType, sClass],
                            style: {
                                left: Rt.utils.DateDiff(self.dateTime.start, item.startTime)*100/self.getDiffTime() + "%"
                            },
                            attrs: {
                                "group-id": groupId
                            },
                            on: {
                                // 鼠标移入事件。
                                mouseenter: function (event) {
                                    let sGroup =  event.target.getAttribute("group-id");
                                    if(!sGroup) {
                                        return;
                                    }
                                    // 获取groupId相同的节点。
                                    let aoNode = Array.prototype.filter.call(event.target.parentElement.querySelectorAll(".dimension-list"), node =>{
                                        return node.getAttribute("group-id") == sGroup && node != event.target;
                                    });
                                    // 设置激活样式。
                                    aoNode.forEach(o => {
                                        if(o.className.indexOf("actived") < 0) {
                                            o.className += " actived";
                                        }
                                    })
                                },
                                // 鼠标移出事件。
                                mouseleave: function (event) {
                                    let sGroup =  event.target.getAttribute("group-id");
                                    if(!sGroup) {
                                        return;
                                    }
                                    // 获取groupId相同的节点。
                                    let aoNode = Array.prototype.filter.call(event.target.parentElement.querySelectorAll(".dimension-list"), node =>{
                                        return node.getAttribute("group-id") == sGroup && node != event.target;
                                    });
                                    // 取消激活样式。
                                    aoNode.forEach(o => {
                                        if(o.className.indexOf("actived") > -1) {
                                            o.className = o.className.split(" ").filter(sClass => sClass != "actived").join(" ");
                                        }
                                    })
                                }
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

                let component = new MyComponent().$mount(),
                    oNode = this.$refs[sType];

                if(this.$refs[sType] instanceof Array) {
                    oNode = oNode[0];
                }
                // 将节点添加到页面中。
                oNode.appendChild(component.$el);

                return {
                    node: component.$el,
                    class: sClass
                }
            },     
            setEvent () {
                console.log(this.event)
                let oNode = this.$refs.event;

                if(this.$refs.event instanceof Array) {
                    oNode = oNode[0];
                }

                let oEvent = this.event;

                if(!oEvent) {
                    return;
                }
            },
            setRepair () {
                console.log(this.repair)
                let oNode = this.$refs.repair;

                if(this.$refs.repair instanceof Array) {
                    oNode = oNode[0];
                }
            },
            setTool: function() {
                console.log(this.tool);
                let oNode = this.$refs.tool;

                if(this.$refs.tool instanceof Array) {
                    oNode = oNode[0];
                }
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

        &:hover, &.actived {
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
                background-position: -@px20 -20*@px20;
            }

            // 事件。
            .icon-event {
                background-position: -@px20 -17*@px20;
            }

            // 维护。
            .icon-repair {
                background-position: -@px20 -18*@px20;
            }
            
            // 工具。
            .icon-tool {
                background-position: -@px20 -19*@px20;
            }

        }
    }
</style>