$(document).ready(function () {
  var clientid;
  var isIOS = ((/iphone|ipad/gi).test(navigator.appVersion));
  var inputDown = isIOS ? "touchstart" : "touchstart mousedown";
  var inputUp = isIOS ? "touchend" : "touchend mouseup";
  var w_width = $(window).width();
  var w_height = $(window).height();
  const assetPath = '/img/assets/'
  var socket = io();
  var charLoaded = false;
  var equipLoaded = false;
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

  socket.on('url added', function (url) {
    const shareUrl = "http://eliya-bot.herokuapp.com/" + url.id
    copyToClipboard(shareUrl);
    $("#btnGetShareURL").text("Share URL Copied").addClass("on");

  });
  socket.on('url', function (url) {
    if (waitingForUrl) {
      if (url.url) {
        setUnitList(url.url, 'char');
        console.log("chars");
      }
      if (url.equips) {
        console.log("equips");
        setUnitList(url.equips, 'equip');
      }
      waitingForUrl = false;
    }
  });

  socket.on('chars', function (data) {
    if (!charLoaded) {
      $('#chars .charList').html("");
      data.forEach(function (unit) {
        var elem = $('<li id="char-' + unit.DevNicknames + '" class="Attribute' + unit.Attribute + ' Rarity' + unit.Rarity + ' Role' + unit.Role + ' char unit"></li>')
          .append($('<img src="' + assetPath + 'chars/' + unit.DevNicknames + '/square_0.png" class="main">'))
          .append($('<img src="' + assetPath + 'chars/' + unit.DevNicknames + '/square_1.png" class="alt">'));
		var races = unit.Race.split(' / ');
		for (i=0;i<races.length;i++){
			elem.addClass('Race'+races[i]);
		}
		  
        elem.appendTo($("#charRarity" + unit.Rarity + " .charList"));
        elem.data("DevNicknames", unit.DevNicknames);
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
              $(".planner .char.selected").html(elem.html());
			  $(".planner .char.selected").find('.charInfoBlock').remove();
              $(".planner .char.selected").data("DevNicknames", elem.data("DevNicknames"));
              $(".planner .char.selected").addClass(elem.attr("class"));
              $(".selected").removeClass("selected");
              $("#btnGetCompURL").text("Generate Image URL").removeClass("on");
            } else {
              $(".selected").not(this).removeClass("selected");
              $(this).toggleClass("selected");
            }
          } else {
            $(this).toggleClass("checked");
            var parent = $(this).parent();
            $("#btnSave").removeClass("on");
            updateCharScore();
          }
          var info = $("#charInfoTemplate").clone().removeClass('hidden').attr("id", "");
          Object.keys(unit).forEach(function (key) {
            info.find('.' + key + ' span').text(unit[key]);
          });
          info.find('.Art').html('<img src="' + assetPath + 'chars/' + unit.DevNicknames + '/full_shot_0.png" class="main"><img src="' + assetPath + 'chars/' + unit.DevNicknames + '/full_shot_1.png" class="alt">');
          info.find('.Attribute').removeClass().addClass("Attribute " + unit.Attribute);
          info.find('.Rarity').removeClass().addClass("Rarity Rarity" + unit.Rarity);
          info.find('.Role').removeClass().addClass("Role " + unit.Role);
          $("#info .infoWrapper").html("").append(info);
        });
        elem.on("mouseover", function (e) {
          $("#charNamePlate").show();
          $("#charNamePlate").find('.ENName').html(unit.ENName.replace(/\[(.+?)\]/g, ''))
          $("#charNamePlate").find('.JPName').html(unit.JPName);
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
        var unitList = Cookies.get('charList');
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
          .append($('<img src="' + assetPath + 'item/equipment/' + unit.DevNicknames + '.png">'));
        if (unit.Obtain != "Weapon Gacha") {
          elem.addClass('NoGacha')
        }
        elem.appendTo($("#equipRarity" + unit.Rarity + " .equipList"));
        elem.data("DevNicknames", unit.DevNicknames);
        var info = $("#equipInfoTemplate").clone().removeClass('hidden').attr("id", "");
        Object.keys(unit).forEach(function (key) {
          info.find('.' + key + ' span').text(unit[key]);
        });
		  var attr = '';
		  if (unit.Attribute=='All') attr='All';
        info.find('.Attribute').removeClass().addClass("Attribute " + unit.Attribute).html('<span>'+attr+'</span>');
        info.find('.Rarity').removeClass().addClass("Rarity Rarity" + unit.Rarity).html('<span></span>');
        elem.append(info);
        elem.on("click", function () {
          if ($("#info").is(".charinfo")) {
            $('.selected').removeClass('selected');
            $(this).addClass('selected');
          } else if ($("#info").is(".planner")) {
            if ($(".planner .equip.selected").length > 0) {
              $(".planner .equip.selected").html(elem.html());
              $(".planner .equip.selected").data("DevNicknames", elem.data("DevNicknames"));
              $(".planner .equip.selected").addClass(elem.attr("class"));
              $(".selected").removeClass("selected");
              $("#btnGetCompURL").text("Generate Image URL").removeClass("on");
            } else {
              $(".selected").not(this).removeClass("selected");
              $(this).toggleClass("selected");
            }
          } else {
            $(this).toggleClass("checked");
            var parent = $(this).parent();
            $("#btnSave").removeClass("on");
            updateEquipScore();
          }
          var info = $("#equipInfoTemplate").clone().removeClass('hidden').attr("id", "");
          Object.keys(unit).forEach(function (key) {
            info.find('.' + key + ' span').text(unit[key]);
          });
          info.find('.Art').html('<img src="' + assetPath + 'item/equipment/' + unit.DevNicknames + '.png">');
          info.find('.Attribute').removeClass().addClass("Attribute " + unit.Attribute);
          info.find('.Rarity').removeClass().addClass("Rarity Rarity" + unit.Rarity);
          $("#info .infoWrapper").html("").append(info);
        });

        elem.on("mouseover", function (e) {
          $("#charNamePlate").show();
          $("#charNamePlate").find('.ENName').html(unit.ENName.replace(/\[(.+?)\]/g, ''))
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
        var unitList = Cookies.get('equipList');
        if (unitList) {
          setUnitList(unitList, 'equip');
        }
      }
      equipLoaded = true;
      updateEquipScore();
    }
  });

  function copyToClipboard(str) {
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
  for (i = 0; i < 3; i++) {
    var html = '<li class="char unit"><img src="img/assets/chars/blank/square_0.png"></li>';
    $('#planner .charList').append($(html).data("DevNicknames", "blank"));
  }
  $("#switchUnits li").on("click", function () {
	  $("#switchUnits li").removeClass('on');
	  $(this).addClass('on');
	  $('body').removeClass('viewchar viewequip');
	  var target =$(this).data('type');
	  $('body').addClass('view'+target);
	  $('#'+target+'s').addClass('flash');
	  setTimeout(function () {
		 $("article").removeClass('flash');
	  }, 100);
	  updateEquipScore();
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
    if ($("#chars .char.selected").length > 0) {
      $(this).html($("#chars .char.selected").html());
      $(this).data("DevNicknames", $("#chars .char.selected").data("DevNicknames"));
      $(this).addClass($("#chars .char.selected").attr("class"));
      $(".selected").removeClass("selected");
      $("#btnGetCompURL").text("Generate Image URL").removeClass("on");
    } else {
      $(".selected").not(this).removeClass("selected");
      $(this).toggleClass("selected");
    }
  });
  $("#btnCharInfo").on("click", function () {
    $("#btnCharInfo").toggleClass("on");
    $("#btnPlanner").removeClass("on");
    $("#info").removeClass("planner");
    if ($("#btnCharInfo").is(".on")) {
      $("#info").addClass("charinfo");
      $("body").addClass("expanded");
    }
    if ($("#info .btnList .on").not("#btnAltArt").length <= 0) {
      $("#info").removeClass("charinfo");
      $("#info").removeClass("planner");
      $('.selected').removeClass('selected');
      $("body").removeClass("expanded");
    }
  });
  $("#btnPlanner").on("click", function () {
    $("#btnPlanner").toggleClass("on");
    $("#btnCharInfo").removeClass("on");
    $("#info").removeClass("charinfo");
    if ($("#btnPlanner").is(".on")) {
      $("#info").addClass("planner");
      $("body").addClass("expanded");
    }
    if ($("#info .btnList .on").not("#btnAltArt").length <= 0) {
      $("#info").removeClass("charinfo");
      $("#info").removeClass("planner");
      $('.selected').removeClass('selected');
      $("body").removeClass("expanded");
    }
  });

  $("#btnListView").on("click", function () {
    $(this).toggleClass('on');
    $('body').toggleClass('listView');

  });
  $("#btnSave").on("click", function () {
    Cookies.set('charList', getUnitList('char'), {
      expires: 60
    });
    Cookies.set('equipList', getUnitList('equip'), {
      expires: 60
    });
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
    $("#btnSave").removeClass("on");
    updateCharScore();
    updateEquipScore();
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
      units.push(DevNicknames);
    })
    const imageUrl = "http://eliya-bot.herokuapp.com/comp/" + units.join('-') + ".png";
    copyToClipboard(imageUrl);

    setTimeout(function () {
      $("#btnGetCompURL").text("Image URL Copied").addClass("on");
    }, 100);
  });

  $("#btnAltArt").on("click", function () {
    $("body").toggleClass("viewAlt");
    $(this).toggleClass("on");
    $(".charList").addClass('flash');
    setTimeout(function () {
      $(".charList").removeClass('flash');
    }, 100);
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
        $(this).siblings('.btnSelectAll').addClass('on').html("Deselect All");
      } else {
        $(this).siblings('.btnSelectAll').removeClass('on').html("Select All");
      }
    });
    $("#charGrandTotal .score").text(gCount + '/' + gTotal);
	if (gTotal>0){
		$("#charGrandTotal .percentage").text((100 * gCount / gTotal).toFixed(0) + '%');	
	}else{
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
        $(this).siblings('.btnSelectAll').addClass('on').html("Deselect All");
      } else {
        $(this).siblings('.btnSelectAll').removeClass('on').html("Select All");
      }
    });
    $("#equipGrandTotal .score").text(gCount + '/' + gTotal);
	if (gTotal>0){	  
    	$("#equipGrandTotal .percentage").text((100 * gCount / gTotal).toFixed(0) + '%');
	}else{
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

	
  function filterUnit(target){
      if ($('#filter'+target+' .btnFilter.on').length > 0) {
        $('.tempFilter').addClass('filtered');
        $('#filter'+target+' .btnFilter.on').each(function () {
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

});
