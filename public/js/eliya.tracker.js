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
		const shareUrl = "http://eliya-bot.herokuapp.com/"+url.id
		copyToClipboard(shareUrl);
		$("#btnGetShareURL").text("Share URL Copied").addClass("on");

	});
	socket.on('url',function(url){
		if(waitingForUrl){
			setUnitList(url.url);	
			waitingForUrl = false;
		}
	});		

	socket.on('chars', function (data) {
		if(!loaded){
			$('#chars .charList').html("");
			data.forEach(function(unit){
				var elem = $('<li id="char-'+unit.DevNicknames+'" class="'+unit.Attribute+' char"></li>')
					.append($('<img src="'+assetPath+'chars/'+unit.DevNicknames+'/square_0.png" class="main">'))
					.append($('<img src="'+assetPath+'chars/'+unit.DevNicknames+'/square_1.png" class="alt">'));
				elem.appendTo($("#charRarity"+unit.Rarity));
				elem.data("DevNicknames", unit.DevNicknames);
				elem.on("click",function(){
					if($("#info").is(".charinfo")){
						$('.selected').removeClass('selected');
						$(this).addClass('selected');						
					}else if($("#info").is(".planner")){
						if($(".planner .char.selected").length>0){
							$(".planner .char.selected").html(elem.html());
							$(".planner .char.selected").data("DevNicknames", elem.data("DevNicknames"));
							$(".planner .char.selected").addClass(elem.attr("class"));
							$(".selected").removeClass("selected");
							$("#btnGetCompURL").text("Generate Image URL").removeClass("on");
						}else{
							$(".selected").not(this).removeClass("selected");
							$(this).toggleClass("selected");		
						}
					}else{
						$(this).toggleClass("checked");
						var parent = $(this).parent();
						$("#btnSave").removeClass("on");						
						updateScore();
					}
					var info = $("#charInfoTemplate").clone().removeClass('hidden').attr("id","");
					Object.keys(unit).forEach(function(key) {
					   info.find('.'+key+' span').text(unit[key]);
					});
					info.find('.Art').html('<img src="'+assetPath+'chars/'+unit.DevNicknames+'/full_shot_0.png" class="main"><img src="'+assetPath+'chars/'+unit.DevNicknames+'/full_shot_1.png" class="alt">');
					$("#info .infoWrapper").html("").append(info);							
				});
				elem.on("mouseover",function(e){
					$("#charNamePlate").find('.ENName').html(unit.ENName.replace(/\[(.+?)\]/g, ''))
					$("#charNamePlate").find('.JPName').html(unit.JPName);
					$("#charNamePlate").css({"left":elem.offset().left+elem.outerWidth()/2, "top":elem.offset().top+elem.height()});
				});
			});
			var elem = ''
			for (i=0; i<14; i++){
				elem+='<li class="char spookyStuff">';
			}

			$('#chars .charList').append($(elem));
			if(listid){
				waitingForUrl = true;
				socket.emit('get url', listid);
			}else if(window.location.hash) {
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
			updateScore();
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
	for (i=0; i<3; i++){
		var html='<li class="char"><img src="img/assets/chars/blank/square_0.png"></li>';
		$('#planner .charList').append($(html).data("DevNicknames","blank"));
	}
	$("#planner .char").on("click", function(){
		if($("#chars .char.selected").length > 0){
			$(this).html($("#chars .char.selected").html());
			$(this).data("DevNicknames", $("#chars .char.selected").data("DevNicknames"));
			$(this).addClass($("#chars .char.selected").attr("class"));
			$(".selected").removeClass("selected");
			$("#btnGetCompURL").text("Generate Image URL").removeClass("on");
		}else{
			$(".selected").not(this).removeClass("selected");
			$(this).toggleClass("selected");		
		}
	});
	$("#btnCharInfo").on("click", function(){
		$("#btnCharInfo").toggleClass("on");
		$("#btnPlanner").removeClass("on");
		$("#info").removeClass("planner");
		if ($("#btnCharInfo").is(".on")){
			$("#info").addClass("charinfo");
			$("body").addClass("expanded");
		}
		if($("#info .btnList .on").not("#btnAltArt").length<=0){
			$("#info").removeClass("charinfo");
			$("#info").removeClass("planner");
			$('.selected').removeClass('selected');
			$("body").removeClass("expanded");
		}	
	});	
	$("#btnPlanner").on("click", function(){
		$("#btnPlanner").toggleClass("on");
		$("#btnCharInfo").removeClass("on");
		$("#info").removeClass("charinfo");		
		if ($("#btnPlanner").is(".on")){
			$("#info").addClass("planner");
			$("body").addClass("expanded");
		}
		if($("#info .btnList .on").not("#btnAltArt").length<=0){
			$("#info").removeClass("charinfo");
			$("#info").removeClass("planner");
			$('.selected').removeClass('selected');
			$("body").removeClass("expanded");
		}			
	});		

	$("#btnSave").on("click", function(){
		Cookies.set('unitList', getUnitList(), { expires: 60 });
		$(this).removeClass("on");	
		setTimeout(function(){
			$("#btnSave").addClass("on")
		},100);
	});
	$(".btnSelectAll").on("click", function(){
		if (!$(this).is('.on')){
			$(this).siblings('.charList').find('.char').not('.spookyStuff').addClass('checked');
		}else{
			$(this).siblings('.charList').find('.char').not('.spookyStuff').removeClass('checked');
		}
		$("#btnSave").removeClass("on");						
		updateScore();
	});
	
	
	$("#btnGetShareURL").on("click", function(){
		$(this).removeClass("on");
		socket.emit('add url', getUnitList());
	});
	$("#btnGetCompURL").on("click", function(){
		$(this).removeClass("on");
		var units = [];
		$(".planner .char").each(function(){
			var DevNicknames = $(this).data("DevNicknames");
			units.push(DevNicknames);
		})
		const imageUrl= "http://eliya-bot.herokuapp.com/comp/"+units.join('-')+".png";
		copyToClipboard(imageUrl);

		setTimeout(function(){
			$("#btnGetCompURL").text("Image URL Copied").addClass("on");
		},100);		
	});	
	
	$("#btnAltArt").on("click", function(){
		$("body").toggleClass("viewAlt");
		$(this).toggleClass("on");
	});

	function setUnitList(unitList){
		var units = unitList.split(",")
		$(".checked").removeClass(".checked");
		units.forEach(function(unit){
			$("#char-"+unit).addClass("checked");
		});
		updateScore();
	}
	function getUnitList(){
		var units = [];
		$(".checked").each(function(){
			var DevNicknames = $(this).data("DevNicknames");
			units.push(DevNicknames);
		});
		return units.join();
	}
	function updateScore(){
		var gTotal=0;
		var gCount =0;
		$('#chars .charList').each(function(){
			const total = $(this).find(".char:not(.spookyStuff)").length;
			const count = $(this).find(".char.checked").length;
			$(this).siblings('.score').text(count+'/'+total);
			gTotal+=total;
			gCount+=count;
			if (count == total){
				$(this).siblings('.btnSelectAll').addClass('on').html("Deselect All");			
			}else{
				$(this).siblings('.btnSelectAll').removeClass('on').html("Select All");			
			}
		});
		$("#grandTotal .score").text(gCount+'/'+gTotal);
		$("#grandTotal .percentage").text((100*gCount/gTotal).toFixed(0)+'%');
	}

});
