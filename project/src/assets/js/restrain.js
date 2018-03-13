// 遏制页面的查询条件
const categories = [{
  'url': 'restrain',
  'key': 'suppress',
  'title': '新建遏制',
  'list': [{
    'groupOrder': '1',
    'title': '物料',
    'key': '1',
    'items': [{
      'name': '物料',
      'key': 'materialCode',
      'type': 'select',
      'placeholder': '请选择物料'
    }, {
      'name': '批次',
      'key': 'batchNo',
      'type': 'input',
      'placeholder': '请输入批次'
    }]
  }, {
    'groupOrder': '2',
    'title': '设备',
    'key': '2',
    'items': [{
      'name': '设备',
      'key': 'equipmentCode',
      'type': 'select',
      'placeholder': '请选择设备'
    }, {
      'name': '开始时间',
      'key': 'startTime',
      'type': 'datetime',
      'placeholder': '请输入开始时间'
    }, {
      'name': '结束时间',
      'key': 'endTime',
      'type': 'datetime',
      'placeholder': '请输入结束时间'
    }]
  }, {
    'groupOrder': '3',
    'title': '模号',
    'key': '3',
    'items': [{
      'name': '工序',
      'key': 'processCode',
      'type': 'select',
      'placeholder': '请选择工序'
    }, {
      'name': '模号',
      'key': 'moldCode',
      'type': 'input',
      'placeholder': '请输入模号'
    }, {
      'name': '开始时间',
      'key': 'startTime',
      'type': 'datetime',
      'placeholder': '请输入开始时间'
    }, {
      'name': '结束时间',
      'key': 'endTime',
      'type': 'datetime',
      'placeholder': '请输入结束时间'
    }]
  }, {
    'groupOrder': '4',
    'title': '质检单',
    'key': '4',
    'items': [{
      'name': '质检单',
      'key': 'batchNo',
      'type': 'input',
      'placeholder': '请输入质检单'
    }]
  }, {
    'groupOrder': '5',
    'title': '工单',
    'key': '5',
    'items': [{
      'name': '工单',
      'key': 'batchNo',
      'type': 'input',
      'placeholder': '请输入工单'
    }]
  }, {
    'groupOrder': '6',
    'title': '设备',
    'key': '6',
    'items': [{
      'name': '设备',
      'key': 'equipmentCode',
      'type': 'select',
      'placeholder': '请选择设备'
    }, {
      'name': '开始时间',
      'key': 'startTime',
      'type': 'datetime',
      'placeholder': '请输入开始时间'
    }, {
      'name': '结束时间',
      'key': 'endTime',
      'type': 'datetime',
      'placeholder': '请输入结束时间'
    }]
  }, {
    'groupOrder': '7',
    'title': '质检批次',
    'key': '7',
    'items': [{
      'name': '物料',
      'key': 'materialCode',
      'type': 'select',
      'placeholder': '请选择物料'
    }, {
      'name': '批次',
      'key': 'batchNo',
      'type': 'input',
      'placeholder': '请输入批次'
    }]
  }],
  'active': {
    'radio': '1',
    'keys': {}
  }
}, {
  'url': 'list',
  'key': 'suppressList',
  'title': '遏制列表',
  'list': [{
    'groupOrder': '1',
    'title': '遏制列表',
    'key': '1',
    'items': [{
      'name': '人员',
      'key': 'personCode',
      'type': 'select',
      'placeholder': '请选择人员'
    }, {
      'name': '开始时间',
      'key': 'startTime',
      'type': 'datetime',
      'placeholder': '请输入开始时间'
    }, {
      'name': '结束时间',
      'key': 'endTime',
      'type': 'datetime',
      'placeholder': '请输入结束时间'
    }]
  }],
  'active': {
    'radio': '1',
    'keys': {}
  }
}]
export default categories
