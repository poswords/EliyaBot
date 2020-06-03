$(document).ready(function () {
	var clientid;
	var isIOS = ((/iphone|ipad/gi).test(navigator.appVersion));
	var inputDown = isIOS ? "touchstart" : "touchstart mousedown";
	var inputUp = isIOS ? "touchend" : "touchend mouseup";
	var w_width = $(window).width();
	var w_height = $(window).height();
	const assetPath = './img/assets/'
	var socket = io();
	var loaded = false;
	var waitingForUrl = false;
	function clearUI() {

	}

	function resizeCheck() {
		w_width = $(window).width();
		w_height = $(window).height();
	}
	$(window).resize(function () {
		resizeCheck();
	});
	resizeCheck();

	socket.on('url added',function(url){
		const shareUrl = "http://eliya-bot.herokuapp.com/#list="+url.id
		copyToClipboard(shareUrl);
		$("#btnGetShareURL").text("Share URL Copied").addClass("on");

	});
	socket.on('url',function(url){
		if(waitingForUrl){
			setUnitList(url.url);	
			waitingForUrl = false;
		}
	});		

	socket.on('data', function (data) {
		if(!loaded){
			$('.charList').html("");
			data.forEach(function(unit){
				var elem = $('<li id="char-'+unit.DevNicknames+'" class="'+unit.Attribute+'"></li>')
					.append($('<img src="'+assetPath+'chars/'+unit.DevNicknames+'/square_0.png">'));
				elem.appendTo($("#charRarity"+unit.Rarity));
				elem.data("DevNicknames", unit.DevNicknames);
				elem.on("click",function(){
					$(this).toggleClass("checked");
					$("#btnSave").removeClass("on");
				});
				elem.on("mouseover",function(e){
					var info = $("#charInfoTemplate").clone().removeClass('hidden').attr("id","");
					Object.keys(unit).forEach(function(key) {
					   info.find('.'+key+' span').text(unit[key]);
					});
					info.find('.Art').html('<img src="'+assetPath+'chars/'+unit.DevNicknames+'/full_shot_0.png">');
					$("#info .infoWrapper").html("").append(info);						
				});
			});
			var elem = ''
			for (i=0; i<13; i++){
				elem+='<li class="spookyStuff">';
			}
			$('.charList').append($(elem));
			if(window.location.hash) {
				var id= window.location.hash.replace("#list=","");
				waitingForUrl = true;
				socket.emit('get url', id);
			}else{
				var unitList = Cookies.get('unitList');
				if(unitList){
					setUnitList(unitList);
				}
			}
			loaded=true;
		}					
	});

	function copyToClipboard(str){
		nstr = str;
		//nstr = shrinkUrl(nstr);
		console.log(nstr);
		const el = document.createElement('textarea');
		el.value = nstr;
		document.body.appendChild(el);
		el.select();
		document.execCommand('copy');
		document.body.removeChild(el);
	}

	$("#btnExpand").on("click", function(){
		$("#info").addClass("expanded");
	});
	$("#btnClose").on("click", function(){
		$("#info").removeClass("expanded");
	});		
	$("#btnSave").on("click", function(){
		Cookies.set('unitList', getUnitList(), { expires: 60 });
		$(this).removeClass("on");	
		setTimeout(function(){
			$("#btnSave").addClass("on")
		},100);
	});

	$("#btnGetShareURL").on("click", function(){
		$(this).removeClass("on");
		var units = [];
		$(".checked").each(function(){
			var DevNicknames = $(this).data("DevNicknames");
			units.push(DevNicknames);
		})
		socket.emit('add url', getUnitList());
	});

	function setUnitList(unitList){
		var units = unitList.split(",")
		$(".checked").removeClass(".checked");
		units.forEach(function(unit){
			$("#char-"+unit).addClass("checked");
		});
	}
	function getUnitList(){
		var units = [];
		$(".checked").each(function(){
			var DevNicknames = $(this).data("DevNicknames");
			units.push(DevNicknames);
		});
		return units.join();
	}

});