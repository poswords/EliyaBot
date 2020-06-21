$(document).ready(function () {
  var clientid;
  var isIOS = ((/iphone|ipad/gi).test(navigator.appVersion));
  var inputDown = isIOS ? "touchstart" : "touchstart mousedown";
  var inputUp = isIOS ? "touchend" : "touchend mouseup";
  var w_width = $(window).width();
  var w_height = $(window).height();
  const assetPath = '/img/assets/';
  var socket = io();
  var charLoaded = false;
  var equipLoaded = false;
  var waitingForUrl = false;
  var blank_elem = $('<li class="unit"><img src="img/assets/chars/blank/square_0.png"></li>');

  function clearUI() {

  }
  socket.emit('connected', lang);
  function resizeCheck() {
    w_width = $(window).width();
    w_height = $(window).height();
  }
  $(window).resize(function () {
    resizeCheck();
  });
  resizeCheck();
  $(".btnCopy").on("click",function(){
	 var str = $("#"+$(this).data("target")).val();
	 if (!window.module.exports(str)){setStatus(false);}else{
		 $(this).addClass("on");
	 }
  }); 

  socket.on('url added', function (url) {
    const shareUrl = "http://eliya-bot.herokuapp.com/" + url.id
	$("#txtShareURL").val(shareUrl);
	  console.log(shareUrl);
    if (!copyToClipboard(shareUrl)){
		$('.body').addClass("showShareURL");	
	}else{
		$("#btnGetShareURL").text(tls.ShareURLCopied).addClass("on");
	}
  });

  socket.on('url', function (url) {
    if (waitingForUrl) {
	  if (url){
		  if (url.url) {
			setUnitList(url.url, 'char');
		  }
		  if (url.equips) {
			setUnitList(url.equips, 'equip');
		  }
	  }else{
		  $("#errMsg").removeClass('hidden');
		  $("#errMsg").html(tls.URLExpired);
	  }
      waitingForUrl = false;
    }
  });

  socket.on('chars', function (data) {
    if (!charLoaded) {
      $('#chars .charList').html("");
      data.forEach(function (unit) {
        var elem = $('<li id="char-' + unit.DevNicknames + '" class="Attribute' + unit.Attribute + ' Rarity' + unit.Rarity + ' Role' + unit.Role + ' char unit"></li>')
          .append($('<img src="' + assetPath + 'chars/' + unit.DevNicknames + '/square_0.png" class="mainArt">'))
          .append($('<img src="' + assetPath + 'chars/' + unit.DevNicknames + '/square_1.png" class="altArt">'));
        var races = unit.Race.split(' / ');
        for (i = 0; i < races.length; i++) {
          elem.addClass('Race' + races[i]);
        }
        elem.appendTo($("#charRarity" + unit.Rarity + " .charList"));
        elem.data("DevNicknames", unit.DevNicknames);
		var skillWaitHtml, skillWait;
		if(unit.SkillWait){
			skillWait = unit.SkillWait
		}else{
			skillWaitHtml = unit.Skill.match(/\s\(Skill Cost\: (\d+)\)/g)[0];
			skillWait = parseInt(skillWaitHtml.replace(/\D/g, "")) || 0;
			unit.Skill = '['+unit.Skill.replace(skillWaitHtml,']');			
		}
        elem.data("SkillWait", skillWait);
		unit.SkillWait=skillWait;
        var info = $("#charInfoTemplate").clone().removeClass('hidden').attr("id", "");
        Object.keys(unit).forEach(function (key) {
          info.find('.' + key + ' span').text(unit[key]);
        });
        info.find('.ENName').html(unit.ENName.replace(/\[(.+?)\]/g, '').replace(/\((.+?)\)/g, ''));
        info.find('.Attribute').removeClass().addClass("Attribute " + unit.Attribute).html('<span></span>');
        info.find('.Rarity').removeClass().addClass("Rarity Rarity" + unit.Rarity).html('<span></span>');
        info.find('.Role').removeClass().addClass("Role " + unit.Role);
        elem.append(info);
        elem.on("click", function () {
          if ($("#info").is(".charinfo")) {
            $('.selected').removeClass('selected');
            $(this).addClass('selected');
          } else if ($("#info").is(".planner")) {
            if ($(".planner .char.selected").length > 0) {
              setCharSlot($(".planner .char.selected"), unit.DevNicknames);
            } else {
              $(".selected").not(this).removeClass("selected");
              $(this).toggleClass("selected");
            }
          } else {
            $(this).toggleClass("checked");
            var parent = $(this).parent();
            unitChanged();
          }
          var info = $("#charInfoTemplate").clone().removeClass('hidden').attr("id", "");
          Object.keys(unit).forEach(function (key) {
			if (lang != "en"){
				if (key == "Race"){
					var races = unit.Race.split(' / ');
					var tls =[];
					for (i=0;i<races.length;i++){
						tls.push(getTls("Race"+races[i]));
					}
					console.log(tls);
					info.find('.' + key + ' span').text(tls.join(' / '));	
				}else if(key=="Attribute" || key =="Role" || key=="Gender"){
					var tl = getTls(key+unit[key]);
					if (tl) info.find('.' + key + ' span').text(tl);
				}else{
					info.find('.' + key + ' span').text(unit[key]);	
				}
			}else{
				info.find('.' + key + ' span').text(unit[key]);	
			}
          });
          info.find('.Art').html('<img src="' + assetPath + 'chars/' + unit.DevNicknames + '/full_shot_0.png" class="mainArt"><img src="' + assetPath + 'chars/' + unit.DevNicknames + '/full_shot_1.png" class="altArt">');
          info.find('.Attribute').removeClass().addClass("Attribute " + unit.Attribute);
          info.find('.Rarity').removeClass().addClass("Rarity Rarity" + unit.Rarity);
          info.find('.Role').removeClass().addClass("Role " + unit.Role);
          $("#info .infoWrapper").html("").append(info);
        });
        elem.on("mouseover", function (e) {
          $("#charNamePlate").show();
          $("#charNamePlate").find('.ENName').html(unit.ENName.replace(/\[(.+?)\]/g, ''))
          $("#charNamePlate").find('.JPName').html(unit.JPName);
		  if(unit.ZHName){
			$("#charNamePlate").find('.ZHName').html(unit.ZHName);  
		  }
          $("#charNamePlate").find('.Obtain').html('').addClass('hidden');
          $("#charNamePlate").css({
            "left": elem.offset().left + elem.outerWidth() / 2,
            "top": elem.offset().top + elem.height()
          });
        });
        elem.on("mouseleave", function (e) {
          $("#charNamePlate").hide();
        });
      });
      var elem = ''
      for (i = 0; i < 14; i++) {
        elem += '<li class="unit spookyStuff">';
      }

      $('#chars .charList').append($(elem));
      if (listid) {
        waitingForUrl = true;
        socket.emit('get url', listid);
      } else if (window.location.hash) {
        var id = window.location.hash.replace("#list=", "");
        waitingForUrl = true;
        socket.emit('get url', id);
      } else {
        var unitList = localStorage.getItem("charList");
        if (!unitList) {		  
		  unitList = Cookies.get('charList');
		}
        if (!unitList) {
          unitList = Cookies.get('unitList');
        }
        if (unitList) {
          setUnitList(unitList, 'char');
        }
      }
      charLoaded = true;
      updateCharScore();
    }
  });
  socket.on('equips', function (data) {
    if (!equipLoaded) {
      $('#equips .equipList').html("");
      data.forEach(function (unit) {
        var elem = $('<li id="equip-' + unit.DevNicknames + '" class="Attribute' + unit.Attribute + ' Rarity' + unit.Rarity + ' equip unit"></li>')
          .append($('<img src="' + assetPath + 'item/equipment/' + unit.DevNicknames + '.png" class="weaponArt">'))
          .append($('<img src="' + assetPath + 'item/equipment/' + unit.DevNicknames + '_soul.png" class="soulArt">'));
        if (unit.Obtain != tls.WeaponGacha) {
          elem.addClass('NoGacha')
        }
        elem.appendTo($("#equipRarity" + unit.Rarity + " .equipList"));
        elem.data("DevNicknames", unit.DevNicknames);
        var info = $("#equipInfoTemplate").clone().removeClass('hidden').attr("id", "");
        Object.keys(unit).forEach(function (key) {
          info.find('.' + key + ' span').text(unit[key]);
        });
        var attr = '';
        if (unit.Attribute == 'All') attr = getTls('AttributeAll');
        info.find('.Attribute').removeClass().addClass("Attribute " + unit.Attribute).html('<span>' + +attr + '</span>');
        info.find('.Rarity').removeClass().addClass("Rarity Rarity" + unit.Rarity).html('<span></span>');
        elem.append(info);
        elem.on("click", function () {
          if ($("#info").is(".charinfo")) {
            $('.selected').removeClass('selected');
            $(this).addClass('selected');
          } else if ($("#info").is(".planner")) {
            if ($(".planner .equip.selected").length > 0) {
              setEquipSlot($(".planner .equip.selected"), unit.DevNicknames);
            } else {
              $(".selected").not(this).removeClass("selected");
              $(this).toggleClass("selected");
            }
          } else {
            $(this).toggleClass("checked");
            var parent = $(this).parent();
            unitChanged();
          }
          var info = $("#equipInfoTemplate").clone().removeClass('hidden').attr("id", "");
          Object.keys(unit).forEach(function (key) {
            info.find('.' + key + ' span').text(unit[key]);
          });
          info.find('.Art').html('<img src="' + assetPath + 'item/equipment/' + unit.DevNicknames + '.png"><img src="' + assetPath + 'item/equipment/' + unit.DevNicknames + '_soul.png" class="soulArt">');
          info.find('.Attribute').removeClass().addClass("Attribute " +  getTls("Attribute"+unit.Attribute));
          info.find('.Rarity').removeClass().addClass("Rarity Rarity" + unit.Rarity);
          $("#info .infoWrapper").html("").append(info);
        });

        elem.on("mouseover", function (e) {
          $("#charNamePlate").show();
          $("#charNamePlate").find('.ENName').html(unit.ENName.replace(/\[(.+?)\]/g, ''))
		  if(lang=="zh-TW"){
			$("#charNamePlate").find('.ZHName').html("");  
		  }			
          $("#charNamePlate").find('.JPName').html(unit.JPName);
          $("#charNamePlate").find('.Obtain').html(unit.Obtain).removeClass('hidden');
          $("#charNamePlate").css({
            "left": elem.offset().left + elem.outerWidth() / 2,
            "top": elem.offset().top + elem.height()
          });
        });
        elem.on("mouseleave", function (e) {
          $("#charNamePlate").hide();
        });
      });
      var elem = ''
      for (i = 0; i < 14; i++) {
        elem += '<li class="unit spookyStuff">';
      }

      $('#equips .equipList').append($(elem));
      if (listid) {
        waitingForUrl = true;
        socket.emit('get url', listid);
      } else if (window.location.hash) {
        var id = window.location.hash.replace("#list=", "");
        waitingForUrl = true;
        socket.emit('get url', id);
      } else {
		var unitList = localStorage.getItem("equipList");
		if (!unitList) {  
          unitList = Cookies.get('equipList');
		}
        if (unitList) {
          setUnitList(unitList, 'equip');
        }
      }
      equipLoaded = true;
      updateEquipScore();
    }
  });

  function copyToClipboard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    var success = document.execCommand('copy');
    document.body.removeChild(el);
	return success;
  }
  function getTls(skey){
	for (const [key, value] of Object.entries(tls)) {
	  if(skey == key) return value;
	}
  }	

  for (i = 1; i < 4; i++) {
    const skillwait = '<div class="SkillWait">0</div>';
    $('#unison' + i).append(blank_elem.clone().append(skillwait).addClass('char main'))
      .append(blank_elem.clone().addClass('equip weapon'))
      .append(blank_elem.clone().append(skillwait).addClass('char sub'))
      .append(blank_elem.clone().addClass('equip soul'))
      .append($('<li class="totalSkillWait">'+tls.Wait+': <span>0</span></li>'));
  }

  $(".btnSwitchUnit").on("click", function () {
    $(".btnSwitchUnit").removeClass('on');
    $(this).addClass('on');
    $('body').removeClass('viewchar viewequip');
    var target = $(this).data('type');
    $('body').addClass('view' + target);
    $('#' + target + 's').addClass('flash');
    setTimeout(function () {
      $("article").removeClass('flash');
    }, 100);
    updateEquipScore();
  });
  $("#errMsg").on("click", function () {
    $(this).addClass('hidden');
  });
	
  $("#btnShowRole").on("click", function () {
    $(this).toggleClass('on');
    $('body').toggleClass('showRole');
  });
  $("#chars .btnFilter").on("click", function () {
    $(this).toggleClass('on');
    updateCharFilter();
  });
  $("#equips .btnFilter").on("click", function () {
    $(this).toggleClass('on');
    updateEquipFilter();
  });
  $("#planner .char").on("click", function () {
    if (!$("#btnShowChar").is('.on')) {
      $("#btnShowChar").trigger("click");
    }
    if ($("#chars .char.selected").length > 0) {
      setCharSlot($(this), $("#chars .char.selected").data("DevNicknames"));
    } else if ($(this).is('.selected')) {
      $(this).removeClass("selected");
    } else if ($("#planner .char.selected").length > 0) {
      var source = $("#planner .char.selected");
      var target = $(this);
      var sourceDevNicknames = getDevNicknames(source);
      var targetDevNicknames = getDevNicknames(target);
      if (sourceDevNicknames == "blank") {
        $(".selected").removeClass("selected");
        $(this).toggleClass("selected");
      } else {
        setCharSlot(target, sourceDevNicknames);
        setCharSlot(source, targetDevNicknames);
      }
    } else {
      $(".selected").not(this).removeClass("selected");
      $(this).toggleClass("selected");
      if ($(this).is(".selected") && $(this).data("DevNicknames") != 'blank') {
        $("#btnUnset").appendTo($(this));
      }
    }
  });

  $("#planner .equip").on("click", function () {
    if (!$("#btnShowEquip").is('.on')) {
      $("#btnShowEquip").trigger("click");
    }
    if ($("#equips .equip.selected").length > 0) {
       setEquipSlot($(this), $("#equips .equip.selected").data("DevNicknames"));
    } else if ($(this).is('.selected')) {
      $(this).removeClass("selected");
    } else if ($("#planner .equip.selected").length > 0) {
      var source = $("#planner .equip.selected");
      var target = $(this);
      var sourceDevNicknames = getDevNicknames(source);
      var targetDevNicknames = getDevNicknames(target);
      if (sourceDevNicknames == "blank") {
        $(".selected").removeClass("selected");
        $(this).toggleClass("selected");
      } else {
        setEquipSlot(target, sourceDevNicknames);
        setEquipSlot(source, targetDevNicknames);
      }
    } else {
      $(".selected").not(this).removeClass("selected");
      $(this).toggleClass("selected");
      if ($(this).is(".selected") && $(this).data("DevNicknames") != 'blank') {
        $("#btnUnset").appendTo($(this));
      }
    }
  });
  $("#btnUnset").on("click", function (e) {
    e.stopPropagation();
    $("#btnUnset").appendTo($("#planner"));
    var target = $('.selected');
    if (target.is('.main')||target.is('.sub')) {
      setCharSlot(target, "blank");
    }
    if (target.is('.weapon')||target.is('.soul')) {
      setEquipSlot(target, "blank");
    }
    $(".selected").removeClass("selected");
  });
  $("#btnCharInfo").on("click", function () {
    $("#btnCharInfo").toggleClass("on");
    $("#btnPlanner").removeClass("on");
    $("#info").removeClass("planner");
    if ($("#btnCharInfo").is(".on")) {
      $("#info").addClass("charinfo");
      $("body").addClass("expanded");
    }
    checkInfoPanel();
  });
  $("#btnPlanner").on("click", function () {
    $("#btnPlanner").toggleClass("on");
    $("#btnCharInfo").removeClass("on");
    $("#info").removeClass("charinfo");
    if ($("#btnPlanner").is(".on")) {
      $("#info").addClass("planner");
      $("body").addClass("expanded");
    }
    checkInfoPanel();
  });

  function checkInfoPanel() {
    if ($("#infoButtons .on").length <= 0) {
      $("#info").removeClass("charinfo");
      $("#info").removeClass("planner");
      $('.selected').removeClass('selected');
      $("body").removeClass("expanded");
    }
  }

  $("#btnListView").on("click", function () {
    $(this).toggleClass('on');
    $('body').toggleClass('listView');
  });

  $("#btnSave").on("click", function () {
	localStorage.setItem("charList", getUnitList('char'));	 
    localStorage.setItem("equipList", getUnitList('equip'));	 	  
    $(this).removeClass("on");
    setTimeout(function () {
      $("#btnSave").addClass("on")
    }, 100);
  });
  $(".btnSelectAll").on("click", function () {
    if (!$(this).is('.on')) {
      $(this).siblings('.unitList').find('.unit').not('.spookyStuff').not('.filtered').addClass('checked');
    } else {
      $(this).siblings('.unitList').find('.unit').not('.spookyStuff').not('.filtered').removeClass('checked');
    }
	unitChanged();
  });


  $("#btnGetShareURL").on("click", function () {
    $(this).removeClass("on");
    socket.emit('add url', {
      chars: getUnitList('char'),
      equips: getUnitList('equip')
    });
  });
  $("#btnGetCompURL").on("click", function () {
    $(this).removeClass("on");
    var units = [];
    $(".planner .char").each(function () {
      var DevNicknames = $(this).data("DevNicknames");
      if (!DevNicknames) DevNicknames = "blank";
      units.push(DevNicknames);
    })
    $(".planner .equip").each(function () {
      var DevNicknames = $(this).data("DevNicknames");
      if (!DevNicknames) DevNicknames = "blank";
      units.push(DevNicknames);
    })
	var lngcode = '';
	if (lang!="en") lngcode+='.'+lang;
    const imageUrl = "http://eliya-bot.herokuapp.com/comp/" + units.join('-') +lngcode+ ".png";
    $("#txtCompURL").val(imageUrl);		  
    if (!copyToClipboard(imageUrl)){
		$('.body').addClass("showCompURL");
	}else{
		setTimeout(function () {
		  $("#btnGetCompURL").text(tls.ImageURLCopied).addClass("on");
		}, 100);
	}
  });
  $("#btnShowSkillWait").on("click", function () {
    $(this).toggleClass('on');
    $('#info').toggleClass('showSkillWait');
  });
  $("#btnAltArt").on("click", function () {
    $("body").toggleClass("viewAlt");
    $(this).toggleClass("on");
  });

  $("#btnViewSoul").on("click", function () {
    $("body").toggleClass("viewSoul");
    $(this).toggleClass("on");
  });


  $(".btnShowOwned").on("click", function () {
    var type = $(this).data("type");
    $("#" + type + "s").toggleClass("viewOwned");
    $(this).toggleClass("on");
    $("." + type + "List").addClass('flash');
    setTimeout(function () {
      $("." + type + "List").removeClass('flash');
    }, 100);
  });
  $("#listLang").on("click",function(){
	  $(this).toggleClass("on");
	  $(this).find('.active').prependTo($(this));
  });

  function getSkillWait(DevNickname) {
    if (DevNickname == "blank") {
      return 0;
    } else {
      return $("#char-" + DevNickname).data("SkillWait");
    }
  }

  function getDevNicknames(unit) {
    if ($(unit).data("DevNicknames")) {
      return $(unit).data("DevNicknames");
    } else {
      return "blank";
    }
  }

  function setCharSlot(slot, DevNickname) {
    $("#btnUnset").appendTo($("#planner"));
    var unit;
    if (DevNickname == "blank") {
      unit = blank_elem.clone();
      slot.data("DevNicknames", "blank");
    } else {
      unit = $("#char-" + DevNickname);
      slot.data("DevNicknames", DevNickname);
    }
    slot.html(unit.html());
    slot.find('.charInfoBlock').remove();
    slot.find('.skillWait').remove();
    var ismain = true;
    if (slot.is('.sub')) {
      ismain = false;
    }
    slot.removeClass().addClass(unit.attr("class"));
    if (ismain) {
      slot.addClass('unit main char');
      slot.removeClass('sub')
    } else {
      slot.addClass('unit sub char');
      slot.removeClass('main');
    }
    slot.append($('<div class="SkillWait">' + getSkillWait(DevNickname) + '</div>'));
    $(".selected").removeClass("selected");
    setSkillWait();
    $("#btnGetCompURL").text(tls.GenerateImageURL).removeClass("on");
	$('body').removeClass("showCompURL"); 
  }

  function setEquipSlot(slot, DevNickname) {
    $("#btnUnset").appendTo($("#planner"));
    if (DevNickname == "blank") {
      unit = blank_elem.clone();
      slot.data("DevNicknames", "blank");
    } else {
      unit = $("#equip-" + DevNickname);
      slot.data("DevNicknames", DevNickname);
    }
    slot.html(unit.html());
    slot.find('.equipInfoBlock').remove();
    var isweapon = true;
    if (slot.is('.soul')) {
      isweapon = false;
    }	  
    slot.removeClass().addClass(unit.attr("class"));
    if (isweapon) {
      slot.addClass('unit weapon equip');
      slot.removeClass('soul')
    } else {
      slot.addClass('unit soul equip');
      slot.removeClass('weapon');
    }	  
    $(".selected").removeClass("selected");
    $("#btnGetCompURL").text(tls.GenerateImageURL).removeClass("on");
	$('body').removeClass("showCompURL");   
  }
  function unitChanged(){
	$("#btnSave").removeClass("on");
	$("#btnGetShareURL").text(tls.GenerateShareURL).removeClass("on");
	$("#btnUrlCopy").removeClass("on");
	$('body').removeClass("showShareURL"); 
    updateCharScore();
    updateEquipScore();
  }	

  function setUnitList(unitList, type) {
    var units = unitList.split(",")
    $(".checked").removeClass(".checked");
    units.forEach(function (unit) {
      $("#" + type + "-" + unit).addClass("checked");
    });
    updateCharScore();
  }

  function getUnitList(type) {
    var units = [];
    $("#" + type + "s .checked").each(function () {
      var DevNicknames = $(this).data("DevNicknames");
      units.push(DevNicknames);
    });
    return units.join();
  }

  function updateCharScore() {
    var gTotal = 0;
    var gCount = 0;
    $('#chars .unitList').each(function () {
      const total = $(this).find(".char").not('.filtered').length;
      const count = $(this).find(".char.checked").not('.filtered').length;
      $(this).siblings('.score').text(count + '/' + total);
      gTotal += total;
      gCount += count;
      if (count == total) {
        $(this).siblings('.btnSelectAll').addClass('on').html(tls.DeselectAll);
      } else {
        $(this).siblings('.btnSelectAll').removeClass('on').html(tls.SelectAll);
      }
    });
    $("#charGrandTotal .score").text(gCount + '/' + gTotal);
    if (gTotal > 0) {
      $("#charGrandTotal .percentage").text((100 * gCount / gTotal).toFixed(0) + '%');
    } else {
      $("#charGrandTotal .percentage").text('');
    }
  }

  function updateEquipScore() {
    var gTotal = 0;
    var gCount = 0;
    $('#equips .unitList').each(function () {
      const total = $(this).find(".equip").not('.filtered').length;
      const count = $(this).find(".equip.checked").not('.filtered').length;
      $(this).siblings('.score').text(count + '/' + total);
      gTotal += total;
      gCount += count;
      if (count == total) {
        $(this).siblings('.btnSelectAll').addClass('on').html(tls.DeselectAll);
      } else {
        $(this).siblings('.btnSelectAll').removeClass('on').html(tls.SelectAll);
      }
    });
    $("#equipGrandTotal .score").text(gCount + '/' + gTotal);
    if (gTotal > 0) {
      $("#equipGrandTotal .percentage").text((100 * gCount / gTotal).toFixed(0) + '%');
    } else {
      $("#equipGrandTotal .percentage").text('');
    }
  }

  function updateCharFilter() {
    if ($('.btnFilter.on').length <= 0) {
      $("#chars .char").removeClass('filtered');
      $("#chars section").removeClass('hidden');
    } else {
      $("#chars .char").addClass('filtered');
      if ($('#filterCharAttribute .btnFilter.on').length > 0) {
        $('#filterCharAttribute .btnFilter.on').each(function () {
          var filter = $(this).data('filter');
          $("#chars ." + filter).removeClass('filtered');
        });
      } else {
        $("#chars .char").removeClass('filtered');
      }

      $("#chars .char").not('.filtered').addClass('tempFilter');

      filterUnit('CharRarity');
      filterUnit('CharRole');
      filterUnit('CharRace');

      $('.tempFilter').removeClass('tempFilter');

      $(".charList").each(function () {
        if ($(this).find('.char').not('.filtered').length == 0) {
          $(this).parent().addClass('hidden')
        } else {
          $(this).parent().removeClass('hidden');
        }
      });
    }
    $(".charList").addClass('flash');
    setTimeout(function () {
      $(".charList").removeClass('flash');
    }, 100);
    updateCharScore();
  }

  function filterUnit(target) {
    if ($('#filter' + target + ' .btnFilter.on').length > 0) {
      $('.tempFilter').addClass('filtered');
      $('#filter' + target + ' .btnFilter.on').each(function () {
        var filter = $(this).data('filter');
        $('.tempFilter.' + filter).removeClass('filtered');
      });
      $('.tempFilter').removeClass('tempFilter');
      $("#chars .char").not('.filtered').addClass('tempFilter');
      $("#equips .equip").not('.filtered').addClass('tempFilter');
    }
  }

  function updateEquipFilter() {
    if ($('.btnFilter.on').length <= 0) {
      $("#equips .equip").removeClass('filtered');
      $("#equips section").removeClass('hidden');
    } else {
      $("#equips .equip").addClass('filtered');
      if ($('#filterEquipAttribute .btnFilter.on').length > 0) {
        $('#filterEquipAttribute .btnFilter.on').each(function () {
          var filter = $(this).data('filter');
          $("#equips ." + filter).removeClass('filtered');
        });
      } else {
        $("#equips .equip").removeClass('filtered');
      }
      $("#equips .equip").not('.filtered').addClass('tempFilter');

      if ($('#filterEquipRarity .btnFilter.on').length > 0) {
        $('.tempFilter').addClass('filtered');
        $('#filterEquipRarity .btnFilter.on').each(function () {
          var filter = $(this).data('filter');
          $('.tempFilter.' + filter).removeClass('filtered');
        });
      }
      $('.tempFilter').removeClass('tempFilter');

      if ($('#filterEquipObtain .btnFilter.on').length > 0) {
        $("#equips .equip").not('.NoGacha').addClass('filtered');
      }
      $(".equipList").each(function () {
        if ($(this).find('.equip').not('.filtered').length == 0) {
          $(this).parent().addClass('hidden')
        } else {
          $(this).parent().removeClass('hidden');
        }
      });


    }
    $(".equipList").addClass('flash');
    setTimeout(function () {
      $(".equipList").removeClass('flash');
    }, 100);
    updateEquipScore();
  }

  function setSkillWait() {
    $(".unison").each(function () {
      var main = parseInt($(this).find('.main .SkillWait').text()) || 0;
      var sub = parseInt($(this).find('.sub .SkillWait').text()) || 0;
      var wait = 0;
      if (main == 0 || sub == 0) {
        wait = (main * 2 + sub * 2) / 2
      } else {
        wait = (main + sub) / 2
      }
      $(this).find(".totalSkillWait span").text(wait);
    });

  }
});
