let aoTestData = 
[{
	"parent":"",
	"code":"001",
	"showName":"开始",
	"name":"开始",
	"key": "开始",
	"type":"2",
	"outputInfo": []
},{
	"parent":"开始",
	"code":"006",
	"showName":"物料",
	"name":"物料",
	"key": "物料",
	"type":"1",
	"barcode": "1",
	"materialCode": "#1",
	"batchNo": "20160331A",
	"storageInfo": [{
		"batchNo": "20160331A",
		"quantity": 10
	}]
},{
	"parent":"物料",
	"code":"",	
	"showName":"产线工序2",
	"name":"产线工序2",
	"key": "产线工序2",
	"type":"2",
	"outputInfo": [
	{
      	"doCode": "D201603310017", 
      	"materialName": "ZC/SGE LFV 活塞总成/环销卡簧连杆/新型线/12667058", 
      	"equipmentId": 128, 
      	"equipmentName": "装配2.2线GP12", 
      	"batchNo": "20160331A", 
      	"quantity": 16, 
      	"shiftDate": "2016-03-31", 
      	"shiftName": "早班"
    }, 
    {
      	"doCode": "D201603310017", 
      	"materialName": "ZC/SGE LFV 活塞总成/环销卡簧连杆/新型线/12667058", 
      	"equipmentId": 128, 
      	"equipmentName": "装配2.2线GP12", 
      	"batchNo": "20160331A", 
      	"quantity": 16, 
      	"shiftDate": "2016-03-31", 
      	"shiftName": "早班"
    }
    ],
	"subProcess": [{
		"parent":"",
		"code":"007",	
		"showName":"工序21",
		"name":"工序21",
		"key": "工序21",
		"outputInfo": []
	},{
		"parent":"工序21",
		"code":"008",
		"showName":"工序22",
		"name":"工序22",
		"key": "工序22",
		"outputInfo": []
	}]
},{
	"parent":"开始",
	"code":"",
	"showName":"产线工序",
	"name":"产线工序",
	"key": "产线工序",
	"type":"2",
	"outputInfo": [],
	"subProcess": [{
		"parent":"",
		"code":"002",
		"showName":"工序1",
		"name":"工序1",
		"key": "工序1",
		"outputInfo": []
	},{
		"parent":"工序1",
		"code":"003",
		"showName":"工序2",
		"name":"工序2",
		"key":"工序2",
		"outputInfo": []	
	},{
		"parent":"工序2",
		"code":"004",
		"showName":"工序3",
		"name":"工序3",
		"key": "工序3",
		"outputInfo": []
	}]
},{
	"parent":"产线工序",
	"code":"005",
	"showName":"结束工序",
	"name":"结束工序",
	"key": "结束工序",
	"type":"2",
	"outputInfo": []
},{
	"parent":"结束工序",
	"code":"009",
	"showName":"产品",
	"name":"产品",
	"key": "产品",
	"type":"1",
	"barcode": "2",
	"batchNo": "20160331B",
	"storageInfo": []
}]


export {
	aoTestData
}