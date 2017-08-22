<template>
    <div class="equipment-line" :style="{width: ratio*100 + '%', left: (-windowTime.left)*ratio + '%', 'padding-top': (top-14) + 'px', 'padding-bottom': (bottom-14) + 'px'}" ref="wrap">
        <!--div v-for="(info,index) in status" :key="index" :data-type="info.type" class="status" :style="{left: window.Rt.utils.DateDiff(info.startTime, datetime.start)*100/window.Rt.utils.DateDiff(datetime.endTime, datetime.start) + "%", width: window.Rt.utils.DateDiff(info.endTime, info.startTime)*100/window.Rt.utils.DateDiff(datetime.endTime, datetime.start) + "%"}">
            <div>{{info.startTime}}~{{info.endTime}}</div>
        </div-->
        <div class="status-line" ref="line"></div>
        <div v-for="info in dimension" v-show="selectedDimension.indexOf(info.type)>-1" :ref="info.key" :class="info.key"></div>
    </div>
</template>

<script>
    import Vue from 'vue'
    import $ from "jquery"

    const statusHeight = 14;

    export default{
        props: {
            visible: Boolean,
			equipmentStatus: Array,
            equipmentWork: Object,
            equipmentQuality: Object,
            equipmentEvent: Object,
            equipmentRepair: Object,
            equipmentTool: Object,
			dimensionData: [Array, String],
            ratio: Number,
            dateTime: Object,
            windowTime: Object,
            equipmentIndex: Number
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
                return this.equipmentStatus;
            },
            work: function() {
                return this.equipmentWork;
            },
            quality: function() {
                return this.equipmentQuality;
            },
            event: function() {
                return this.equipmentEvent;
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
            this.labelNode = nodes[this.equipmentIndex];
            // 初始设置位置。
            this.setPanelPadding();
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
                this.$nextTick(() => {
                    this.setPanelPadding();
                })
            },
            visible: 'setVisible'
        },
        methods: {
            //  设置可见性。
            setVisible() {
                if(this.visible) {
                    // 若可见。
                    $(".dimension-content").show();
                }
            },
            getDiffTime() {
                return window.Rt.utils.DateDiff(this.dateTime.start, this.dateTime.end);
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
                    // 创建状态区间。
                    let MyComponent = Vue.extend({
                        render: function (createElement) {                    
                            return createElement("div", {
                                class: ["status"],
                                style: {
                                    left: window.Rt.utils.DateDiff(self.dateTime.start, item.startTime)*100/self.getDiffTime() + "%",
                                    width: window.Rt.utils.DateDiff(item.startTime, item.endTime)*100/self.getDiffTime() + "%"
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
            // 设置加工事件。
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
                    if(!oWork[p]) {
                        continue;
                    }
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
                    return (new Date(a.startTime).getTime() -  new Date(b.startTime).getTime());
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
  
                this.top = 14;
                this.bottom = 14;
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
                
                // 设置设备名称的问题。
                this.labelNode.style.paddingTop =  (this.top-statusHeight) + "px";
                this.labelNode.style.paddingBottom =  (this.bottom-statusHeight) + "px";

                // 选中的维度。
                this.selectedDimension.map(sDimension => {
                    if(!sDimension) {
                        return;
                    }
                    // 获取维度配置数据。
                    oDimension = this.getDimensionConfig(sDimension);
                    // 不同维度下的事件节点都要重置位置。
                    oDimension.node.map(oData => {
                        let com = oData.node;
                        if(oData.class == "up") {
                            // 若分布在状态轴上方。
                            com.style.top = (this.top - com.offsetHeight - 3) + "px";
                        }else {
                            // 若分布在状态轴下方。
                            com.style.bottom = (this.bottom - com.offsetHeight - 3) + "px";
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

                oNode.style.height = nHeight + "px";

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

                if(!this.visible) {
                    oNode.querySelector(".dimension-content").style.display = "none";           
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
                    if(!oQuality[p]) {
                        continue;
                    }
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

                // 按照开始时间排序。
                aoSortData.sort((a, b) => {
                    return (new Date(a.startTime).getTime() -  new Date(b.startTime).getTime());
                });

                aoSortData.map((o, index) => {
                    if(o.type == "qcList") {
                        this.setDimensionConfig("quality", this._createNode(o, index, "quality", "质检", {
                            startTime: "质检时间",
                            // endTime: "结束时间",                         
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
                                left: window.Rt.utils.DateDiff(self.dateTime.start, item.startTime)*100/self.getDiffTime() + "%"
                            },
                            attrs: {
                                "group-id": groupId
                            },
                            on: {
                                // 鼠标移入事件。
                                mouseenter: function (event) {
                                    
                                    let sGroup =  event.target.getAttribute("group-id"),
                                        aoNode = [];
                                    if(sGroup) {
                                        // 获取groupId相同的节点。
                                        aoNode = Array.prototype.filter.call(event.target.parentElement.querySelectorAll(".dimension-list"), node =>{
                                            if(node ==  event.target) {
                                                node.setAttribute("data-level", "top");
                                            }
                                            return node.getAttribute("group-id") == sGroup;
                                        });                                        
                                    }else {
                                        aoNode.push(event.target);
                                    }

                                    // 设置激活样式。
                                    aoNode.forEach(o => {
                                        if(o.className.indexOf("actived") < 0) {
                                            o.className += " actived";
                                        }

                                        if(!self.visible) {
                                            o.querySelector(".dimension-content").style.display = "block";
                                        }

                                    })

                                },
                                // 鼠标移出事件。
                                mouseleave: function (event) {
                                    let sGroup =  event.target.getAttribute("group-id"),
                                        aoNode = [];

                                    if(sGroup) {
                                    // 获取groupId相同的节点。
                                        aoNode = Array.prototype.filter.call(event.target.parentElement.querySelectorAll(".dimension-list"), node =>{
                                            if(node ==  event.target) {
                                                node.removeAttribute("data-level");
                                            }
                                            return node.getAttribute("group-id") == sGroup;
                                        });
                                    }else {
                                        aoNode.push(event.target);
                                    }
                                    // 取消激活样式。
                                    aoNode.forEach(o => {
                                        if(o.className.indexOf("actived") > -1) {
                                            o.className = o.className.split(" ").filter(sClass => sClass != "actived").join(" ");
                                        }

                                        if(!self.visible) {
                                            o.querySelector(".dimension-content").style.display = "none";
                                        }
                                    })
                                }
                            }
                        }, [
                            self.$createElement('div', {
                                class: ["circle"]
                            }),
                            self.$createElement('div', {
                                class: ["dimension-content"],
                                style: {
                                    display: "block"
                                }
                            }, [
                                self.$createElement('h2', {}, [
                                    self.$createElement('i', {
                                        class: ["icon", "icon-20", "icon-" + sType]
                                    }),
                                
                                    self.$createElement('span', {}, sTitle)
                                ]),
                                self.$createElement('ul', {
                                    class: ["ul-content"]
                                }, Object.keys(oList).map(p => {
                                    return self.$createElement('li', {}, oList[p] + '：' + (item[p] == undefined ? '':item[p]))
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
            // 设置异常事件。
            setEvent () {
                // console.log(this.event)
                let oNode = this.$refs.event;

                if(this.$refs.event instanceof Array) {
                    oNode = oNode[0];
                }

                let oEvent = this.event,
                    aoSortData = [];

                if(!oEvent) {
                    return;
                }

                for(let p in oEvent) {
                    if(!oEvent[p]) {
                        continue;
                    }
                    if(p == "startEquipWarningList") {
                        // 事件开始时间。
                        oEvent[p].forEach(o => {
                            o.type = "startEquipWarningList";
                        })
                        aoSortData = aoSortData.concat(oEvent[p]);

                    }else if(p == "endEquipWarningList") {
                        // 事件结束时间。
                        oEvent[p].forEach(o => {
                            o.type = "endEquipWarningList";
                            o.startTime = o.endTime;
                        })
                        aoSortData = aoSortData.concat(oEvent[p]);
                    }                    
                }

                // 按照开始时间排序。
                aoSortData.sort((a, b) => {
                    return (new Date(a.startTime).getTime() -  new Date(b.startTime).getTime());
                });
                
                aoSortData.map((o, index) => {
                    if(o.type == "startEquipWarningList") {
                        this.setDimensionConfig("event", this._createNode(o, index, "event", "事件开始", {
                            startTime: "发生时间",  
                            reportTime: "上报时间",                    
                            reportName: "上报人",
                            eventType: "事件类型",
                            reason: "事件原因",
                            status: "状态"
                        }, o.groupId));
                    }else if(o.type == "endEquipWarningList") {
                        this.setDimensionConfig("event", this._createNode(o, index, "event", "事件结束", {
                            endTime: "结束时间"
                        }, o.groupId));
                    }
                })

                this.setPanelPadding()                   
            },
            // 设置维护事件。
            setRepair () {
                // console.log(this.repair)
                let oNode = this.$refs.repair;

                if(this.$refs.repair instanceof Array) {
                    oNode = oNode[0];
                }

                let oRepair = this.repair,
                    aoSortData = [];

                if(!oRepair) {
                    return;
                }

                for(let p in oRepair) {
                    if(!oRepair[p]) {
                        continue;
                    }
                    if(p == "spotCheckList") {
                        // 设备点击。
                        oRepair[p].forEach(o => {
                            o.type = "spotCheckList";
                            o.startTime = o.happenTime;
                        })
                        aoSortData = aoSortData.concat(oRepair[p]);

                    }else if(p == "startEquipRepairList") {
                        // 设备维护开始。
                        oRepair[p].forEach(o => {
                            o.type = "startEquipRepairList";
                        })
                        aoSortData = aoSortData.concat(oRepair[p]);
                    }else if(p == "endEquipRepairList") {
                        // 设备维护结束。
                        oRepair[p].forEach(o => {
                            o.type = "endEquipRepairList";
                            o.startTime = o.endTime;
                        })
                        aoSortData = aoSortData.concat(oRepair[p]);
                    }                     
                }

                // 按照开始时间排序。
                aoSortData.sort((a, b) => {
                    return (new Date(a.startTime).getTime() -  new Date(b.startTime).getTime());
                });

                aoSortData.map((o, index) => {
                    if(o.type == "spotCheckList") {
                        this.setDimensionConfig("repair", this._createNode(o, index, "repair", "设备点检", {
                            happenTime: "发生时间",                      
                            personName: "操作人",
                            result: "点检结果"
                        }));
                    }else if(o.type == "startEquipRepairList") {
                        this.setDimensionConfig("repair", this._createNode(o, index, "repair", "设备维护开始", {
                            startTime: "开始时间",
                            personName: "操作人",
                            reason: "维护原因"
                        }, o.groupId));
                    }else if(o.type == "endEquipRepairList") {
                        this.setDimensionConfig("repair", this._createNode(o, index, "repair", "设备维护结束", {
                            endTime: "结束时间"
                        }, o.groupId));
                    }
                })

                this.setPanelPadding()                  
            },
            // 设置工具事件。
            setTool: function() {
                // console.log(this.tool);
                let oNode = this.$refs.tool;

                if(this.$refs.tool instanceof Array) {
                    oNode = oNode[0];
                }

                let oTool = this.tool,
                    aoSortData = [];               

                if(!oTool) {
                    return;
                }

                for(let p in oTool) {
                    if(!oTool[p]) {
                        continue;
                    }
                    if(p == "installToolList") {
                        // 上刀/上模。
                        oTool[p].forEach(o => {
                            o.type = "installToolList";
                            o.startTime = o.happenTime;
                        })
                        aoSortData = aoSortData.concat(oTool[p]);

                    }else if(p == "removeToolList") {
                        // 下刀/下模。
                        oTool[p].forEach(o => {
                            o.type = "removeToolList";
                            o.startTime = o.happenTime;
                        })
                        aoSortData = aoSortData.concat(oTool[p]);
                    }                   
                }

                // 按照开始时间排序。
                aoSortData.sort((a, b) => {
                    return (new Date(a.startTime).getTime() -  new Date(b.startTime).getTime());
                });

                aoSortData.map((o, index) => {
                    let sTitle = "";
                    if(o.type == "installToolList") {
                        
                        if(o.toolType == "刀具") {
                            sTitle = "上刀";
                        }else  {
                            sTitle = "上模";
                        }
                        this.setDimensionConfig("tool", this._createNode(o, index, "tool", sTitle, {
                            happenTime: "发生时间",                      
                            personName: "操作人",
                            toolType: "工具类型",
                            toolCode: "工具编码",
                            reason: "原因"
                        }, o.groupId));
                    }else if(o.toolType == "removeToolList") {
                        if(o.toolType == "刀具") {
                            sTitle = "下刀";
                        }else  {
                            sTitle = "下模";
                        }
                        this.setDimensionConfig("tool", this._createNode(o, index, "tool", sTitle, {
                            happenTime: "发生时间",                      
                            personName: "操作人",
                            toolType: "工具类型",
                            toolCode: "工具编码",
                            reason: "原因"
                        }, o.groupId));
                    }
                })

                this.setPanelPadding()
            }
        }
        
    }
</script>

<style lang="less">
    @import "../../assets/css/base.less";

    .line-color(@color) {
        .dimension-list {
             border-left-color: @color;

            .circle {
                background-color: @color;
            }

            .dimension-content {
                h2 {
                    color: @color;
                }
            }
            
            &:hover, &.actived {
                h2 {
                    color: #fff;
                    background-color: @color;
                } 
            }
            &:hover, &.actived {
                .dimension-content {
                    border-color: @color;
                }
            }
        }        
    }
    // 展示详情。
    .detailed {
        .dimension-content {
            display: block;					
        }
    }
    .dimension-content {
        display: none;					
    }

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
        background-color: #dedede;
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
            background-color: #999;
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

    .work {
        .line-color(@work);
    }
    .quality {
        .line-color(@quality);
    }
    .event {
        .line-color(@event);
    }
    .repair {
        .line-color(@repair);
    }
    .tool {
        .line-color(@tool);
    }

    .dimension-list {
        position: absolute;
        border-left: 2px solid #42af8f;
        
        &.up {
            top: 0px;
            .circle:first-child {
                top: 0px;
            }
            .circle:last-child {
                bottom: 0px;
                background-color: #fff;
                margin: 3px 0 0;
            }
        }
        &.down {
            bottom: 0px;
            .circle:first-child {
                top: 0px;
                background-color: #fff;
                margin:  0 0 3px;
            }
            .circle:last-child {
                bottom: 0px;
            }
        }     

        .circle {
            position: absolute;
            left: -5px;
            width: 8px;
            height: 8px;
            border-radius: 4px;
            background-color: #42af8f;
        }

        .dimension-content {
            // margin-left: 3px;
            // border-left: 2px solid #42af8f;
            border: 1px solid transparent;
            border-left-width: 0;
            margin: 8px 0;

            h2 {
                height: 30px;
                line-height: 30px;
                padding-left: 10px;
                
                span {
                    font-weight: 600;
                }

            }

            .ul-content {
                // display: block;
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

        &[data-level=top] {
            &:hover, &.actived {
                z-index: 1001;
            }
        }
        &:hover, &.actived {
            z-index: 1000;
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
            
            .dimension-content {
                background-color: #fff;

            }
        }
    }
</style>