;(function(){
	/*模拟数据*/
var datas = new Array("");
var toolState="";
var stageOffset=[0,0];
function Queue() {
    var B = new Array();
    var A = 50;
    /*添加数据*/
    Queue.prototype.EnQueue = function(C) {
        if (C == null ) {
            return -1
        }
        if (B.length >= this.capacity) {
            B.remove(0)
        }
        B.push(C)
    };
    /*获取数据*/
    Queue.prototype.DeQueue = function() {
        if (B.length == 0) {
            return null 
        } else {
            return B;
			//B.shift()
        }
    }
    ;
    /*数据量*/
    Queue.prototype.GetSize = function() {
        return B.length
    }
    ;
    /*获取第一个*/
    Queue.prototype.GetHead = function() {
        if (B.length == 0) {
            return null 
        } else {
            return B[0]
        }
    }
    ;
    /*清空*/
    Queue.prototype.MakeEmpty = function() {
        B.length = 0
    }
    ;
    /*判断是否空*/
    Queue.prototype.IsEmpty = function() {
        if (B.length == 0) {
            return true
        } else {
            return false
        }
    }
}
var oQueue = new Queue();
/*合并数组*/
function Convert16Scale() {
    var A = datas.length;
    for (var C = 0; C < A; C++) {
        var B = datas[C];
        adddata(B, 1, 8, 128)
    }
}
/*入栈*/
function adddata(F, C, E, J) {
    if (F == null  || F.length < 4) {
        return
    } else {
        var I = new Array(F.length / 2 / C);
        if (C == 1) {
            I = F
        } else {
            for (var A = 0; A < I.length; A++) {
                var D = "";
                var H = F.substr(A * 2 * E * C, 2 * E * C);
                for (var B = 0; B < C; B++) {
                    D = parseInt(H.substr(B * 2, 2), 16) + D
                }
                I[A] = D
            }
        }
        for (var A = 0; A < I.length / 4 / E; A++) {
            if (E == 8) {
                var G = new Array(12);
                var H = I.substr(A * 32, 32);
                /*真实数据*/

                G[1] = parseInt(H.substr(0, 4), 16);		//II
                G[2] = parseInt(H.substr(4, 4), 16);		//III

                G[6] = parseInt(H.substr(8, 4), 16);		//V1
                G[7] = parseInt(H.substr(12, 4), 16);		//V2
                G[8] = parseInt(H.substr(16, 4), 16);		//V3
                G[9] = parseInt(H.substr(20, 4), 16);		//V4
                G[10] = parseInt(H.substr(24, 4), 16);		//V5
                G[11] = parseInt(H.substr(28, 4), 16);		//V6


                G[0] = G[1] - G[2] + 2048;					//I
                G[3] = 4096 - (G[0] + G[1] ) / 2;			//aVR
                G[4] = G[0] - (G[1] - 2048 ) / 2 ;			//aVL
                G[5] = G[1] - (G[0] - 2048 ) / 2 ;			//aVF
				/*
				通用公式－lx 2016-5-6

				I = II-III + 2048;
				aVR = 4096-(I+II)/2;
				aVL = I-(II-2048)/2;
				aVF = II-(I-2048)/2;
				*/


                oQueue.EnQueue(G)
            } else {
                var G = new Array(E);
                var H = I.substr(A * 16, 16);
                for (var B = 0; B < E; B++) {
                    G[B] = parseInt(H.substr(B * 2, 2), 16)
                }
                oQueue.EnQueue(G)
            }
        }
    }
}
/*全图缩放*/
var size = 0.48;
var offset = -2048-134;
/*平均数范围*/
var average = 1;
/*一次打多少个点*/
var oneTimePoint = 8;
/*行名*/
var layerName = new Array("I","II","III","aVR","aVL","aVF","V1","V2","V3","V4","V5","V6");
/* 一共打多少次 */
var maxTime = oQueue.GetSize() ;
/*打到第几次*/
var curTime = 0;
/*每点间隔*/
var pointWidth = 1*0.3125*2;
//125/128;
/*打印间隔*/
var reflashTime = 1;
/*跟电压有关的*/
var adu = 52;
/*电压档*/
var ecg_scope = 1*0.15;
var first = true;
var canvas, stage;
/*容器库*/
var container = [];
/*线库*/
var line = [];
/*蓝背景*/
var background=[];
/*鼠标点了*/
var mousedown = false;
/*画线上一点*/
var oldPoint = {
    x:0,
    y:0
};
/*尺子坐标*/
var rular=[[0,0],[0,0]];
var rularArray=[];
var rularPoint=[];
var rularMovePoint=[];
var dragPoint=[0,0];
var dragMovePoint=[0,0];
var pointArry=[
		[],[],[],[],[],[],[],[],[],[],[],[]
		];
canvas = document.getElementById("ecgCanvas");
stage = new createjs.Stage(canvas);
stage.scaleX = size ;
stage.scaleY = size ;
/*MouseOver敏感度*/
stage.enableMouseOver(200);
var toolArray={
		rular:{
				down:function(x,y){
					var rularId=rularArray.length;
					 rularArray[rularId] = new createjs.Container();
            		 rularArray[rularId].name = "rular_"+rularId;
                     stage.addChild(rularArray[rularId]);
					 rular[0]=[x,y];
					 rular[1]=[x,y];
					},
				up:function(x,y){
					rular=[[0,0],[0,0]];
					},
				move:function(x,y){
					if(!mousedown){
						return false;
						}
					var rularId=rularArray.length-1;
					rularArray[rularId].removeAllChildren();
					rular[1]=[x,y];
					var newRular=new createjs.Shape();
        			newRular.graphics.setStrokeStyle(1, "round", "round").beginStroke("blue");
        			newRular.graphics.moveTo(rular[0][0],rular[0][1]);
        			newRular.graphics.lineTo(rular[1][0],rular[1][1]);
        			newRular.name = "rularLine_"+rularId;
        			rularArray[rularId].addChild(newRular);
					var newRularH=new createjs.Shape();
        			newRularH.graphics.setStrokeStyle(1, "round", "round").beginStroke("blue");
        			newRularH.graphics.moveTo(rular[0][0],rular[0][1]);
        			newRularH.graphics.lineTo(rular[0][0],rular[0][1]-20);
        			newRularH.name = "rularLineH_"+rularId;
        			rularArray[rularId].addChild(newRularH);
					var newRularF=new createjs.Shape();
        			newRularF.graphics.setStrokeStyle(1, "round", "round").beginStroke("blue");
        			newRularF.graphics.moveTo(rular[1][0],rular[1][1]);
        			newRularF.graphics.lineTo(rular[1][0],rular[1][1]-20);
        			newRularF.name = "rularLineF_"+rularId;
        			rularArray[rularId].addChild(newRularF);
					var rularText = new createjs.Text("标尺"+ rularId + "\nv:"+Math.abs(((rular[1][1]-rular[0][1])/ecg_scope).toFixed(0))+"mv\nt:"+Math.abs((((rular[1][0]-rular[0][0])/(pointWidth*400))*1000).toFixed(0))+"ms\n","20px Arial","blue");
            		rularText.x = rular[1][0]+20;
            		rularText.y = rular[1][1]+20;
            		rularText.name = "numberText";
            		rularText.textBaseline = "alphabetic";
            		rularArray[rularId].addChild(rularText);
					}
			},
		move:{
				down:function(x,y){
					if(!rularArray.length){
						return false;
						}
					var point=rularArray[rularArray.length-1];
					rularPoint=[point.x,point.y];
					rularMovePoint=[x,y];
					},
				up:function(x,y){
					if(!rularArray.length){
						return false;
						}
					rularPoint=[0,0];
					rularMovePoint=[0,0];
					},
				move:function(x,y){
					if(!mousedown||!rularArray.length){
						return false;
						}
					var point=rularArray[rularArray.length-1];
					point.x=rularPoint[0]+(x-rularMovePoint[0]);
					point.y=rularPoint[1]+(y-rularMovePoint[1]);
					}
			},
		line:{
				down:function(x,y){
					oldPoint.x = x;
    				oldPoint.y = y;
					},
				up:function(x,y){},
				move:function(x,y){
					/*画线*/
						if(mousedown&&stage.getChildByName("drawLine")){
							stage.getChildByName("drawLine").graphics.setStrokeStyle(1, 'round', 'round').beginStroke("blue").moveTo(oldPoint.x, oldPoint.y).lineTo(x,y);
							oldPoint.x = x;
							oldPoint.y = y;
						}
					}
			},
		drag:{
			down:function(x,y){
				dragPoint=[stage.x,stage.y];
				dragMovePoint=[x,y];
				},
			up:function(x,y){
				dragPoint=[0,0];
				dragMovePoint=[0,0];
				},
			move:function(x,y){
				if(!mousedown){
					return false;
					}
				stageOffset[0]=dragPoint[0]+(x-dragMovePoint[0]);
				stageOffset[1]=dragPoint[1]+(y-dragMovePoint[1]);
				stage.x=stageOffset[0];
				stage.y=stageOffset[1];
				}
			}
	}
stage.addEventListener("stagemousedown", function(event) {
    mousedown=true;
	if(toolState){
		if(toolState=="drag"){
		toolArray[toolState].down(event.stageX/size,event.stageY/size)
		}else{
			toolArray[toolState].down((event.stageX-stageOffset[0])/size,(event.stageY-stageOffset[1])/size)
			}
		}
});
stage.addEventListener("stagemouseup", function(event) {
    mousedown=false;
	if(toolState){
		if(toolState=="drag"){
		toolArray[toolState].up(event.stageX/size,event.stageY/size)
		}else{
			toolArray[toolState].up((event.stageX-stageOffset[0])/size,(event.stageY-stageOffset[1])/size)
			}
		}
});
stage.addEventListener("stagemousemove", function(event) {
    /*红十字*/
    if(stage.getChildByName("redLine")){
        stage.getChildByName("redLine").x=(event.stageX-stageOffset[0])/size;
    }
    if(stage.getChildByName("redLine2")){
        stage.getChildByName("redLine2").y=(event.stageY-stageOffset[1])/size;
    }
	if(toolState){
		if(toolState=="drag"){
			toolArray[toolState].move(event.stageX/size,event.stageY/size)
			}else{
			toolArray[toolState].move((event.stageX-stageOffset[0])/size,(event.stageY-stageOffset[1])/size)
			}
		}
    stage.update();
})
w = canvas.width;
h = canvas.height;
/*分段提取数据，每次8个*/
var first = true
function loop() {
    curTime = curTime % maxTime;
	if(!curTime&&!first){
		return;
		}
	first = false;
    if (!curTime) {
        stage.removeAllChildren();
		/*容器库*/
		container = [];
		/*线库*/
		line = [];
		/*蓝背景*/
		background=[];
        /*左侧黑色背景*/
        var bgcon = new createjs.Container();
        stage.addChild(bgcon);
        var rect = new createjs.Shape();
        rect.graphics.beginFill("#808080").drawRect(0, 0, 55, 1450);
        bgcon.addChild(rect);
        /*底部秒数*/
		var totalLineTime=0;
		for(var i = 0; i <11*25 ;i ++){
			var lineColor=(i%5)?"#fb9fa1":"red";
			var lineX=(pointWidth*16*i)+52;
			var redLineV=new createjs.Shape();
			redLineV.graphics.setStrokeStyle(1, "round", "round").beginStroke(lineColor);
        	redLineV.graphics.moveTo(lineX,0);
        	redLineV.graphics.lineTo(lineX,1450);
        	redLineV.name = "redLineV_"+i;
            bgcon.addChild(redLineV);
			if(i%25==0){
				var timeText =  new createjs.Text(totalLineTime+"s","20px Arial","blue");
					totalLineTime++;
					timeText.textAlign = "center";
					timeText.y = 1270 ;
					timeText.x =  lineX;
					bgcon.addChild(timeText);
				}
        };
		for(var i = 0; i <1500 ;i+=pointWidth*16){
			var lineColor=((i/pointWidth)*16%5)?"#fb9fa1":"red";
			var lineY=i;
			var redLineU=new createjs.Shape();
			redLineU.graphics.setStrokeStyle(1, "round", "round").beginStroke(lineColor);
        	redLineU.graphics.moveTo(0,lineY);
        	redLineU.graphics.lineTo(maxTime*9,lineY);
        	redLineU.name = "redLineU_"+i;
            bgcon.addChild(redLineU);
        };
        /*竖线*/
        var redLine = new createjs.Shape();
        redLine.graphics.setStrokeStyle(1, "round", "round").beginStroke("green");
        redLine.graphics.moveTo(0,0);
        redLine.graphics.lineTo(0,1450);
        redLine.name = "redLine";
        stage.addChild(redLine);
        /*横线*/
        var redLine2 = new createjs.Shape();
        redLine2.graphics.setStrokeStyle(1, "round", "round").beginStroke("green");
        redLine2.graphics.moveTo(0,0);
        redLine2.graphics.lineTo(maxTime*9,0);
        redLine2.name = "redLine2";
        stage.addChild(redLine2);
    }
    ;
	draw();
    curTime++;
	stage.x = stageOffset[0] ;
	stage.y = stageOffset[1];
	stage.scaleX = size ;
	stage.scaleY = size ;
    stage.update();
}
;
/*画图*/
function draw() {
    for (var layer = 0; layer < 12; layer++) {
        if (!container[layer]) {
            container[layer] = new createjs.Container();
            container[layer].name = layerName[layer];
            stage.addChild(container[layer]);
            container[layer].y = 100 * layer - 58;
            /*背景半透明*/
            background[layer] = new createjs.Shape();
            background[layer].graphics.beginFill("blue").drawRect(55, 84, maxTime*9, 100);
            background[layer].name = "bg";
            background[layer].alpha = 0.01;
            container[layer].addChild(background[layer]);
            /* 左侧文字 */
            var text = new createjs.Text(layerName[layer],"20px Arial","#fff");
            text.textAlign = "right";
            text.x = 47;
            text.y = 140;
            text.textBaseline = "alphabetic";
            text.mouseEnabled = false;
            container[layer].addChild(text);
            /* 数值文字 */
            var numberText = new createjs.Text(layerName[layer] + "\nv:000\nt:000","40px Arial","#000");
            numberText.x = 10;
            numberText.y = 140;
            numberText.visible = false;
            numberText.name = "numberText";
            numberText.textBaseline = "alphabetic";
            container[layer].addChild(numberText);
            /* 红点 */
            var redPoint = new createjs.Shape();
            redPoint.graphics.setStrokeStyle(1);
            redPoint.graphics.beginStroke("#000000");
            redPoint.graphics.beginFill("red");
            redPoint.graphics.drawCircle(0,0,3);
            redPoint.visible = false;
            redPoint.mouseEnabled = false;
            redPoint.name = "redPoint";
            container[layer].addChild(redPoint);
            /*手动画线的*/
            var drawLine = new createjs.Shape();
            drawLine.name = "drawLine";
            stage.addChild(drawLine);
            /* 交互事件 */
            container[layer].addEventListener("mouseover", function(event) {
                if(event.target.name=="line"){
                    var target = event.currentTarget.getChildByName("numberText");
					//读数
					var showNumber = -(event.rawY-stageOffset[1])/size + event.currentTarget.y-offset-3;
					showNumber = ((showNumber-2048)/ecg_scope+2048).toFixed(2);
					//显示读数
                    target.text = event.currentTarget.name + "\nv:" + showNumber + "mv\nt:" + (((event.rawX-stageOffset[0])/size - 50) / (pointWidth*400) ).toFixed(2) + "s";
                    target.x = (event.rawX - stageOffset[0] + 20)/size;
                    target.y = (((event.rawY - stageOffset[1])/size) - event.currentTarget.y + (20/size));
                    target.visible = true;
					//显示红点
                    var targetRedPoint = event.currentTarget.getChildByName("redPoint");
                    targetRedPoint.x = (event.rawX - stageOffset[0] + 1)/size ;
                    targetRedPoint.y = ((event.rawY - stageOffset[1])/size) - event.currentTarget.y + (1/size);
                    targetRedPoint.visible = true;
                    event.currentTarget.getChildByName("bg").alpha = 0.1;
                }
                if(event.target.name=="bg"){
					for (var i = 0 ; i < background.length ; i++){
						background[i].alpha = 0.01;
						}
                    event.target.alpha = 0.1;
                }
                stage.update();
            }
            );
            container[layer].addEventListener("mouseout", function(event) {
                event.currentTarget.getChildByName("redPoint").visible = false;
                event.currentTarget.getChildByName("numberText").visible = false;
                if(event.target.name=="bg"){
                    event.target.alpha = 0.01;
                }
                stage.update();
            }
            );
        }
        /*线*/
        /*是否开始画*/
        var onceDraw = false;
        if (!line[layer]) {
            onceDraw = true;
            line[layer] = new createjs.Shape();
            line[layer].name = "line";
            line[layer].x = 50;
            line[layer].graphics.setStrokeStyle(3, "round", "round").beginStroke("#9d6003");
            container[layer].addChild(line[layer]);
        }
		
		canvas.width = (pointWidth * curTime*size + 100);
            var linePoint=0;
			linePoint = (pointArry[layer][curTime]-2048)*ecg_scope+2048;
			/*连线*/
            if (onceDraw) {
                line[layer].graphics.moveTo(pointWidth * curTime, -1*(linePoint+offset));
            } else {
                line[layer].graphics.lineTo(pointWidth * curTime, -1*(linePoint+offset));
            }
    }
}
/*外部接口*/
window.ecg = {
	setScope:function(data){/*改变增溢*/
		ecg_scope = data*0.15;
		curTime = 0;
		first = true;
		},
	setPointWidth:function(data){/*改变纸速*/
		pointWidth = data*0.3125*2;
		curTime = 0;
		first = true;
		},
	setData:function(data){
		datas = new Array(data);
		Convert16Scale();
			/*处理数据*/
		maxTime = oQueue.GetSize() ;
		var F = oQueue.DeQueue();
    	for (var i = 0 ; i<F.length ; i++){
		for (var j = 0 ; j<12 ;j++){
			pointArry[j].push(F[i][j])
			}
		}
		curTime = 0;
		first = true;
		},
	init:function(){
		/*定时刷新*/
			var reflash = setInterval(function() {
				loop();
			}
			, reflashTime);
		},
	tool:function(tool,state){
		if(state){
			toolState=tool;
			}else{
				toolState="";
				}
		},
	size:function(newSize){
		stageOffset=[0,0];
		stage.x=0;
		stage.y=0;
		stage.scaleX=newSize*0.48;
		stage.scaleY=newSize*0.48;
		size=newSize*0.48;
		canvas.height=newSize*627;
		canvas.width=newSize*1180;
		}
	}
	})();