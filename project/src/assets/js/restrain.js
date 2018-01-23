// 遏制页面的查询条件
const categories = [{
  "url": "restrain",
  "key": "suppress",
  "title": "新建遏制",
  "list": [{
    "groupOrder": "1",
    "title": "物料",
    "key": "1",
    "items": [{
      "name": "物料",
      "key": "materialCode",
      "type": "select",
      "placeholder": "请选择物料"
    }, {
      "name": "批次",
      "key": "batchNo",
      "type": "input",
      "placeholder": "请输入批次"
    }]
  }, {
    "groupOrder": "2",
    "title": "设备",
    "key": "2",
    "items": [{
      "name": "设备",
      "key": "equipmentCode",
      "type": "select",
      "placeholder": "请选择设备"
    }, {
      "name": "开始时间",
      "key": "startTime",
      "type": "datetime",
      "placeholder": "请输入开始时间"
    }, {
      "name": "结束时间",
      "key": "endTime",
      "type": "datetime",
      "placeholder": "请输入结束时间"
    }]
  }],
  "active": {
    "radio": "1",
    "keys": {}
  }
}, {
  "url": "list",
  "key": "suppressList",
  "title": "遏制列表",
  "list": [{
    "groupOrder": "1",
    "title": "遏制列表",
    "key": "1",
    "items": [{
      "name": "人员",
      "key": "personCode",
      "type": "select",
      "placeholder": "请选择人员"
    }, {
      "name": "开始时间",
      "key": "startTime",
      "type": "datetime",
      "placeholder": "请输入开始时间"
    }, {
      "name": "结束时间",
      "key": "endTime",
      "type": "datetime",
      "placeholder": "请输入结束时间"
    }]
  }],
  "active": {
    "radio": "1",
    "keys": {}
  }
}]
export default categories
