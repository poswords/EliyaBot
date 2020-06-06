$(document).ready(function () {
  var clientid;
  var isIOS = ((/iphone|ipad/gi).test(navigator.appVersion));
  var inputDown = isIOS ? "touchstart" : "touchstart mousedown";
  var inputUp = isIOS ? "touchend" : "touchend mouseup";
  var w_width = $(window).width();
  var w_height = $(window).height();
  const assetPath = './img/assets/'
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
	  if(url.url){
      	setUnitList(url.url,'char');		  
		  console.log("chars");
	  }
      if(url.equips){
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
        var elem = $('<li id="char-' + unit.DevNicknames + '" class="' + unit.Attribute + ' char unit"></li>')
          .append($('<img src="' + assetPath + 'chars/' + unit.DevNicknames + '/square_0.png" class="main">'))
          .append($('<img src="' + assetPath + 'chars/' + unit.DevNicknames + '/square_1.png" class="alt">'));
        elem.appendTo($("#charRarity" + unit.Rarity + " .charList"));
        elem.data("DevNicknames", unit.DevNicknames);
        elem.on("click", function () {
          if ($("#info").is(".charinfo")) {
            $('.selected').removeClass('selected');
            $(this).addClass('selected');
          } else if ($("#info").is(".planner")) {
            if ($(".planner .char.selected").length > 0) {
              $(".planner .char.selected").html(elem.html());
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
		  info.find('.Attribute').removeClass().addClass("Attribute "+unit.Attribute);
		  info.find('.Role').removeClass().addClass("Role "+unit.Role);
          $("#info .infoWrapper").html("").append(info);
        });
        elem.on("mouseover", function (e) {
          $("#charNamePlate").find('.ENName').html(unit.ENName.replace(/\[(.+?)\]/g, ''))
          $("#charNamePlate").find('.JPName').html(unit.JPName);
		  $("#charNamePlate").find('.Obtain').html('').addClass('hidden');			
          $("#charNamePlate").css({
            "left": elem.offset().left + elem.outerWidth() / 2,
            "top": elem.offset().top + elem.height()
          });
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
		if (!unitList){
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
        var elem = $('<li id="equip-' + unit.DevNicknames + '" class="' + unit.Attribute + ' equip unit"></li>')
          .append($('<img src="' + assetPath + 'item/equipment/' + unit.DevNicknames + '.png">'))
        elem.appendTo($("#equipRarity" + unit.Rarity + " .equipList"));
        elem.data("DevNicknames", unit.DevNicknames);
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
		  info.find('.Attribute').removeClass().addClass("Attribute "+unit.Attribute);
          $("#info .infoWrapper").html("").append(info);
        });
        elem.on("mouseover", function (e) {
          $("#charNamePlate").find('.ENName').html(unit.ENName.replace(/\[(.+?)\]/g, ''))
          $("#charNamePlate").find('.JPName').html(unit.JPName);
		  $("#charNamePlate").find('.Obtain').html(unit.Obtain).removeClass('hidden');
          $("#charNamePlate").css({
            "left": elem.offset().left + elem.outerWidth() / 2,
            "top": elem.offset().top + elem.height()
          });
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
          setUnitList(unitList,'equip');
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
      $(this).siblings('.unitList').find('.unit').not('.spookyStuff').addClass('checked');
    } else {
      $(this).siblings('.unitList').find('.unit').not('.spookyStuff').removeClass('checked');
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
  });

  function setUnitList(unitList, type) {
    var units = unitList.split(",")
    $(".checked").removeClass(".checked");
    units.forEach(function (unit) {
      $("#"+type+"-" + unit).addClass("checked");
    });
    updateCharScore();
  }

  function getUnitList(type) {
    var units = [];
    $("#"+type+"s .checked").each(function () {
      var DevNicknames = $(this).data("DevNicknames");
      units.push(DevNicknames);
    });
    return units.join();
  }

  function updateCharScore() {
    var gTotal = 0;
    var gCount = 0;
    $('#chars .unitList').each(function () {
      const total = $(this).find(".char").length;
      const count = $(this).find(".char.checked").length;
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
    $("#charGrandTotal .percentage").text((100 * gCount / gTotal).toFixed(0) + '%');
  }

  function updateEquipScore() {
    var gTotal = 0;
    var gCount = 0;
    $('#equips .unitList').each(function () {
      const total = $(this).find(".equip").length;
      const count = $(this).find(".equip.checked").length;
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
    $("#equipGrandTotal .percentage").text((100 * gCount / gTotal).toFixed(0) + '%');
  }	

});
