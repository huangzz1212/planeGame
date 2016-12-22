//获取对象
var canvas = document.getElementById("mapCanvas");
var context = canvas.getContext('2d');
//加载
var loading = document.getElementById("loading");
//所得分数
var scoresSpan = document.querySelector("#currentScore span");
//结束菜单
var menu = document.getElementById("menu");
//游戏结束所得分数
var scoresEnd = document.getElementById("endScores");
//重新开始
var restart = document.getElementById("restart");
//设置canvas画布的大小和当前浏览器的宽高一致
//第一种方式：
//canvas.width = window.innerWidth;
//canvas.height = window.innerHeight;
//第二种方式
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;

//第一步：图片预加载:当前浏览器只会加载一次图片；
//创建一个数组
var namesImg = ['background.png','bullet1.png','bullet2.png','enemy1.png',
'enemy2.png','enemy3.png','herofly.png','loading.gif','prop.png'];
var imgs = [];
var count = 0;//记录图片的加载成功的张数
for (var i = 0; i < namesImg.length;i++) {
	//创建图片对象
	var img = new Image();
	img.src = 'img/' + namesImg[i];
	imgs.push(img);
	//图片加载成功时
	img.onload = function () {
		count++;
		//判断是否所有的图片都加载成功
		if (count == namesImg.length) {
//			alert('所有图片预加载完成');
			//处理音频预加载
			loadMusics();
		}
	}
}
//第二步：音频预加载
//创建一个数组，存储音频路径
var musicNames = ['bullet','enemy1_down','enemy2_down','enemy3_down','game_music',
'game_over'];
//记录加载音乐的数量
var musicCount = 0;
//创建一个数组，用来存储所有的音频对象
var musics = [];
function loadMusics () {
	for (var i = 0;i < musicNames.length;i++) {
		//创建音频对象
		var music = new Audio();
		music.src = 'audio/' + musicNames[i] +'.mp3';
		musics.push(music);//添加到数组中
		//音频加载成功之后调用的方法
		music.onloadedmetadata = function () {
			musicCount++;
			//所有音频加载完成之后
			if (musicCount == musicNames.length) {
//				alert('音频加载成功！')
				//首先，隐藏加载图片
				loading.style.display = 'none';
				//开启游戏背景音乐
				//设置音频音量0-1之间
				musics[4].volume = 0.6;
				//设置循环播放
				musics[4].loop = true;
				musics[4].play();
				//开始游戏  写成一个函数，里面调用执行的功能小函数
				beginGame();
			}
		}
	}
}

//第三步：绘制游戏的背景图片
var backgroundImg = imgs[0];
//创建一个背景图对象(只有一个)
var background = {
   	//属性
   	x:0,
   	y:0,
   	w:canvas.width,
   	h:canvas.height,
   	//方法
   	draw:function  () {
   		//如何在不改变原背景图像素的情况下,铺满整个屏幕绘制?
   		//获取最大列数和最大行数 方便绘制全屏幕
   		var row = Math.ceil(canvas.height / 568);
   		var col = Math.ceil(canvas.width / 320);
   		//使用for循环嵌套绘制背景图
   		for (var i = -row; i < row; i++) {
   			for (var j = 0; j < col; j++) {
   				//绘制图片
   				context.drawImage(backgroundImg,j * 320,i * 568 + this.y,320,568);
   			}
   		}	
   	},
   	//方法 背景移动
   	move:function  () {
   	    this.y++;
   	    //判断如果移动完一张背景图之后,需要重置this.y的位置
   	    var row = Math.ceil(canvas.height / 568);
   	    if (this.y == 568 * row) {
   	    	   this.y = 0;//重置
   	    	   
   	    }
   	    
   	    
   	} 
};
//第五步:绘制我方英雄飞机以及子弹(单排和双排子弹)
//创建需要绘制我方英雄飞机的对象
var heroImg = imgs[6];
//单排子弹
var bulletImg1 = imgs[1];
//双排子弹
var bulletImg2 = imgs[2];
//创建一个hero飞机类(只有一个)
var hero = {
	//属性
	x:canvas.width / 2 - 33,
	y:canvas.height - 82 - 80,
	w:66,
	h:82,
	i:0,//记录当前是第几种图片(下标从0开始)
	flagI:0,//记录切换图片的频率
	bullets:[],//记录发出的子弹
	flagshot:0,//记录发射子弹的频率
	weaponType:0,//记录武器类型(0:单排,1:双排)
	boom:false,//是否爆炸
	//方法 绘制飞机
	draw:function  () {
		//控制切换图片的频率
		this.flagI++;
		if (this.flagI == 10) {
			if (this.boom) {
				this.i++;//记录图片的下标加1
				if (this.i == 5) {
					//英雄over 游戏结束					
				  } 
				}else{
					this.i = (++this.i) % 2;					
				}
				//重置
				this.flagI = 0;							
			
		}
			//绘制飞机,把图片的某一部分绘制到canvas的某一部分中
			    context.drawImage(heroImg,this.i * this.w,0,this.w,this.h,
				this.x,this.y,this.w,this.h);
		
	},
	//方法:发射子弹
	shotBiu:function  () {
		//爆炸后,不需要继续发射子弹
//		if (this.boom) {
//			return;
//		}
		if (!this.boom) {
			this.flagshot++;			
		}
		if (this.flagshot == 5) {
			//播放发射子弹的音乐
			musics[0].play();
			//发射子弹之前需要创建子弹对象
			//判断武器类型
			if (this.weaponType == 1) {
				//创建双排子弹对象 x+(飞机的宽-子弹的宽)
				var bullet = new Bullet(this.x + (this.w - 48) / 2,this.y - 14,
				48,14,bulletImg2,2);
			}else{
				//创建单排子弹对象
				var bullet = new Bullet(this.x + (this.w - 6) / 2,this.y -14,
				6,14,bulletImg1,1);		
				
			}
			//记录创建的子弹对象,存储到数组中
			this.bullets.push(bullet);
			//重置
			this.flagshot = 0;
			
		}
		//移动子弹(每一颗子弹发射)
		for (var i = 0; i < this.bullets.length;i++) {
			if (this.bullets[i].y <= - this.bullets[i].h) {//如果子弹飞出屏幕,则删除数组中的子弹对象
				//删除出屏幕的子弹对象
				this.bullets.splice(i,1);
				
				
			}else{
				this.bullets[i].draw();//绘制子弹
			    this.bullets[i].move();//子弹移动
			}
		}
		
		
	}
}
//处理鼠标按住飞机移动事件
canvas.onmousedown = function  (e) {
	var event1 = e || window.event;
	//鼠标位置
	var x = event1.offsetX;
	var y = event1.offsetY;
	//判断鼠标按下操作时,是否按中飞机
	if (x >= hero.x && x <= hero.x + hero.w && y >= hero.y && y <= hero.y + hero.h) {
		//选中飞机,添加鼠标移动事件
		canvas.onmousemove = function  (e1) {
			var event2 = e1 || window.event;
			//将鼠标点设置为飞机的中心点
			hero.x = event2.offsetX - hero.w / 2;
			hero.y = event2.offsetY - hero.h / 2;
			
			
		}
		
	}
}
//在鼠标松开事件中,移除鼠标移动事件
canvas.onmouseup = function  () {
	canvas.onmousemove = null;	
}
//使用触摸屏 --- 处理移动端的触摸事件
//触摸开始
canvas.ontouchstart = function  (event) {
	//得到触摸点的坐标
	var x = event.touches[0].clientX;
	var y = event.touches[0].clientY;
	//判断触摸的点是否在飞机中
	if (x >= hero.x && x <= hero.x + hero.w && y >= hero.y && y <= hero.y + hero.h) {
		//让飞机跟着触摸点移动
		canvas.ontouchmove = function  (event) {
			hero.x = event.touches[0].clientX - hero.w / 2;
			hero.y = event.touches[0].clientY - hero.h / 2;
			//禁止系统自带的事件
			event.preventDefault();
			
			
		}	
	}
}
//触摸结束时,取消触摸移动事件
canvas.ontouchmove = function  () {
	canvas.ontouchmove = null;
}


//第六步:创建子弹类
function Bullet (x,y,w,h,img,hurt) {
	//属性
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.img = img;
	this.hurt = hurt;//伤害值
	
}
//方法
Bullet.prototype.draw = function  () {
	//绘制子弹
	context.drawImage(this.img,this.x,this.y,this.w,this.h);
}
//子弹发射
Bullet.prototype.move = function  () {
	this.y -= 5;
	
}
//第八步:绘制敌机
function Enemy (x,y,w,h,img,speed,hp,score,maxI) {
	//属性
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.img = img;//敌机类型的图片
	this.speed = speed;//速度
	this.hp = hp;//月亮
	this.score = score;//敌机所带分数(毁掉敌机所得分数)
	this.maxI = maxI;//播放的图片张数
	this.boom = false;//是否爆炸
	this.i = 0;//第几张图片
	this.isDied = false;// 记录敌机是否死亡
	this.flagI = 0;//图片切换的频率
}
//方法---写在原型中
//绘制敌机
Enemy.prototype.draw = function  () {
	//爆炸 切换图片
	if (this.boom) {
		this.flagI ++;
		if (this.flagI == 5) {
			this.i++;
			if (this.i == this.maxI) {
				//当图片切换到最后一张,则敌机死亡
				this.isDie = true;
				
			}
			//重置
			this.flagI = 0;
		}
	}
	//绘制敌机
	context.drawImage(this.img,this.i * this.w,0,
	this.w,this.h,this.x,this.y,this.w,this.h);
}
//方法 敌机移动
Enemy.prototype.move = function  () {
	this.y += this.speed;
	
}
//敌机图片对象
var enemyImg1 = imgs[3];//小型机
var enemyImg2 = imgs[4];//中型机
var enemyImg3 = imgs[5];//大型机
var enemies = [];//存储所有的敌机
//随机函数
function randomNum(m,n) {
	return Math.floor(Math.random() * (n - m + 1) + m);
}
//随机产生敌机对象
function randomEnemy () {
	var num = randomNum(1,1000);
	//设置一个产生敌机的概率
	if (num <= 60) {
		if (num <= 45) {//创建小飞机
			//随机小飞机产生时的位置 x
			var randomX = randomNum(0,canvas.width - 38);
			//随机速度
			var randomspeed = randomNum(2,6);
			//创建小飞机
			var enemy = new Enemy(randomX,-34,38,34,
			enemyImg1,randomspeed,1,100,5);
			//存储敌机到数组中
			enemies.push(enemy);
		}else if (num <= 55) {//中型机 num <= 55 && num > 45
			//随机中型机的位置
			var randomX = randomNum(0,canvas.width - 46);
			//随机速度
			var randomSpeed = randomNum(2,4);
			//创建中型机
			var enemy = new Enemy(randomX,-64,46,64,
			enemyImg2,randomSpeed,5,500,6);
			//存储敌机到数组中
			enemies.push(enemy);
		}else{//大型机
			var randomX = randomNum(0,canvas.width - 110);
			var randomSpeed = randomNum(1,3);
			var enemy = new Enemy(randomX,-164,100,164,
			enemyImg3,randomSpeed,10,1000,10);
			//存储敌机到数组中
			enemies.push(enemy);
		}
	}
	//移动敌机
	for (var i = 0; i <enemies.length; i++) {
		//如果敌机超出屏幕下边缘,则删除;或者敌机被攻击死亡,则删除
		if (enemies[i].y >= canvas.height || enemies[i].isDie) {//如果敌机超出屏幕下边界,则删除
			enemies.splice(i,1);
			//数组中删除某一个元素,为了保证相邻下一个元素依然能够遍历,需要-1
			i--;
		} else{
			enemies[i].draw();
			enemies[i].move();
		}
	}
}
//第十步:绘制道具
//道具图片
var propImg = imgs[8];
//道具类
function Prop (x,y,w,h,type,speed) {
	//属性
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.type = type;//道具类型(0:炸弹 1:双排子弹)
	this.speed = speed;
	this.isUsed = false;//道具有咩有被使用过
}
//方法:绘制道具
Prop.prototype.draw = function  () {
	context.drawImage(propImg,this.type * this.w,0,
	this.w,this.h,this.x,this.y,this.w,this.h);
}
//移动
Prop.prototype.move = function  () {
	this.y += this.speed;
	
}
var props = [];//存储所有的道具
//随机产生道具
function randomProp () {
	var num = randomNum(1,1000);
	if (num <= 10) {
		var randomX = randomNum(0,canvas.width - 38);
		var randomSpeed = randomNum(4,10);
		//随机炸弹概率 30% 双排子弹概率 70%
		var randomType = randomNum(1,10) > 3 ? 1 : 0;
		//创建道具对象
		var prop = new Prop(randomX,-68,38,68,randomType,randomSpeed);
		//存储到数组中
		props.push(prop);
	}
	//移动道具
	for (var i = 0;i < props.length;i++) {
		//当道具出屏幕,删除道具对象或者道具被使用过
		if (props[i].y >= canvas.height || props[i].isUsed) {
			//删除
			props.splice(i,1);
			i--;
			
		}else{
			props[i].draw();
			props[i].move();
		}	
	}
}

//第十二步:处理矩形碰撞(两个矩形)
function crash (obj1,obj2) {
	//获取两个对象的上下左右位置
	var left1 = obj1.x;
	var right1 = obj1.x + obj1.w;
	var top1 = obj1.y;
	var bottom1 = obj1.y + obj1.h;
	
	var left2 = obj2.x;
	var right2 = obj2.x + obj2.w;
	var top2 = obj2.y;
	var bottom2 = obj2.y + obj2.h;
	//判断是否发生碰撞
	if (right1 < left2 || left1 > right2 || 
	top1 > bottom2 || bottom1 < top2) {
		return false;//未碰撞
	}else{
		return true;//碰撞
	}
}
var timeOut;//存储用来控制双排子弹持续时间的延迟器

//检测是否碰撞
function heroAndEnemyCrash () {
	//道具和英雄飞机的碰撞检测以及处理
	for (var i = 0;i < props.length;i++) {
		//英雄死亡,不需要碰撞检测
		if (hero.boom) {
			continue;
		}
		//如果英雄和道具没有碰撞,则不需要处理
		if (!crash(hero,props[i])) {
			continue;
		}
		//英雄和道具的碰撞处理
		if (props[i].type) {//1-----双排子弹道具
			hero.weaponType = 1;//改变英雄飞机发射的子弹类型
			//清除之前的延迟器
			clearTimeout(timeOut);
			//设置双排子弹的发射时间
			setTimeout(function  () {
				hero.weaponType = 0;//换成单排子弹
				
			},6000)
			
			
		}else{
			//炸弹道具
			//所有的敌机销毁
			for (var j = 0;j < enemies.length;j++) {
				enemies[j].boom = true;//爆炸
				//处理所得分数 在此前分数的基础上加所有爆炸敌机的分数
				scoresSpan.innerHTML = parseInt(scoresSpan.innerHTML) + enemies[j].score;
			}
		}
		//修改道具使用状态 已经使用
		props[i].isUsed = true;
	}
//	2.子弹(hero.bullets)和敌机的碰撞检测
   for (var i = 0; i < enemies.length;i++) {
   	  for (var j = 0; j < hero.bullets.length;j++ ) {
   	  	 //敌机死亡,不需要检测
   	  	 if (enemies[i].boom) {
   	  	 	break;
   	  	 }
   	  	 //检测是否发生碰撞,如果没有碰撞,则不需要处理
   	  	 if (!crash(enemies[i],hero.bullets[j])) {
   	  	 	continue;
   	  	 }
   	  	 //碰撞的处理
   	  	 //1.敌机掉血
   	  	 enemies[i].hp -= hero.bullets[j].hurt;
   	  	 //计分 判断敌机是否死亡
   	  	 if (enemies[i].hp <= 0) {
   	  	 	//敌机死亡
// 	  	 	enemies[i].isDie = true;
   	  	 	enemies[i].boom = true;
   	  	 	//计分
   	  	 	scoresSpan.innerHTML = parseInt(scoresSpan.innerHTML) + enemies[i].score;
   	  	 	//判断飞机类型,处理死亡音乐
   	  	 	if (enemies[i].score == 100) {
   	  	 		musics[1].play();
   	  	 	}else if (enemies[i].score == 500) {
   	  	 		musics[2].play();
   	  	 	}else{
   	  	 	    musics[3].play();
   	  	 	}
   	  	 	
   	  	 }
   	  	 //只要碰上, 消除子弹
   	  	 hero.bullets.splice(j,1);
   	  	 j--;
   	  }
   }
   //3.敌机和英雄飞机碰撞检测的处理
   for (var i = 0; i < enemies.length;i++) {
   	   //不需要碰撞检测的情况
   	   //敌机爆炸,不需要检测
   	   if (enemies[i].boom) {
   	   	  continue;
   	   }
   	   //碰撞检测
   	   if (crash(hero,enemies[i])) {
   	   	//如果碰上,英雄死亡
   	   	hero.boom = true;
   	   	gameOver();
   	   	
   	   }
   }
   
}
//第十四步:游戏结束所调用的方法
function gameOver () {
	//暂停背景音乐
	musics[4].pause();
	//播放游戏结束音乐
	musics[5].play();
	//修改分数 结束菜单上的分数
	scoresEnd.innerHTML = scoresSpan.innerHTML;
	//显示菜单
	menu.style.display = "block";
	
}



//最后一步：定义一个用来调用所有功能函数的总函数 
function beginGame () {
	//清空之前的画布
	context.clearRect(0,0,canvas.width,canvas.height);
	//第四步:调用绘制背景图和移动背景图的方法
	background.draw();
	background.move();
	//第七步:绘制英雄
	hero.draw();
	hero.shotBiu();
	//第九步:滴啊用绘制敌机方法
	randomEnemy();
	//第十一步
	randomProp();
	//第十三步:调用碰撞检测的方法
	if (!hero.boom) {//英雄飞机没有死亡的情况下,检测
		heroAndEnemyCrash();
	}
	
	//刷新:调用方法
	window.requestAnimationFrame(beginGame);
}

//重新开始
	restart.onclick = function() {
		//刷新网页
		location.reload();
				
	}