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
  var blank_elem = $('<li class="unit blank"><img src="/img/assets/chars/blank/square_0.png"></li>');
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    $("body").addClass("darktheme");
  }
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
  $(".btnCopy").on("click", function () {
    var str = $("#" + $(this).data("target")).val();
    if (!window.module.exports(str)) { setStatus(false); } else {
      $(this).addClass("on");
    }
  });

  socket.on('url added', function (url) {
    var shareUrl = "https://eliya-bot.herokuapp.com/gl/" + url.id
    $("#txtShareURL").val(shareUrl);
    if (!copyToClipboard(shareUrl)) {
      $('.body').addClass("showShareURL");
    } else {
      $("#btnGetShareURL").text(tls.ShareURLCopied).addClass("on");
    }
  });

  socket.on('url', function (url) {
    if (waitingForUrl) {
      if (url) {
        if (url.url) {
          setUnitList(url.url, 'char');
        }
        if (url.equips) {
          setUnitList(url.equips, 'equip');
        }
      } else {
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
          .append($('<img src="' + assetPath + 'chars/' + unit.DevNicknames + '/square_0.png" class="mainArt">'));
        var races = unit.Race.split(' / ');
        for (i = 0; i < races.length; i++) {
          elem.addClass('Race' + races[i]);
        }
        elem.appendTo($("#charRarity" + unit.Rarity + " .charList"));
        elem.data("DevNicknames", unit.DevNicknames);
        var skillWait;
        if (unit.SkillWait) {
          skillWait = unit.SkillWait
        } else {
          skillWait = 0;
        }
        if (unit.Ability4) {
          elem.addClass("ManaBoard2")
        }
        if (unit.Obtain) {
          if (unit.Obtain.includes(getTls("Limited"))) {
            elem.addClass("Limited")
          } else {
            elem.addClass("NoLimited")
          }
        } else {
          elem.addClass("NoLimited")
        }
        elem.data("SkillWait", skillWait);
        elem.data("Gauges", unit.Gauges);
        elem.data("MaxGauges", unit.MaxGauges);
        unit.SkillWait = skillWait;
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
            unitChanged();
          }
          var info = $("#charInfoTemplate").clone().removeClass('hidden').attr("id", "");
          Object.keys(unit).forEach(function (key) {

            if (key == "Race") {
              var races = unit.Race.split(' / ');
              var tls = [];
              for (i = 0; i < races.length; i++) {
                tls.push(getTls("Race" + races[i]));
              }
              info.find('.' + key + ' span').text(tls.join(' / '));
            } else if (key == "Stance" || key == "Attribute" || key == "Role" || key == "Gender") {
              var tl = getTls(key + unit[key]);
              if (tl) info.find('.' + key + ' span').text(tl);
            } else {
              info.find('.' + key + ' span').text(unit[key]);
            }

          });
          info.find('.Art').html('<a href="' + assetPath + 'chars/' + unit.DevNicknames + '/full_shot_0.png" target="_blank"><img src="' + assetPath + 'chars/' + unit.DevNicknames + '/full_shot_0.png" class="mainArt"></a><a href="' + assetPath + 'chars/' + unit.DevNicknames + '/full_shot_1.png" target="_blank"><img src="' + assetPath + 'chars/' + unit.DevNicknames + '/full_shot_1.png" class="altArt"></a>');
          info.find('.Attribute').removeClass().addClass("Attribute " + unit.Attribute);
          info.find('.Rarity').removeClass().addClass("Rarity Rarity" + unit.Rarity);
          info.find('.Role').removeClass().addClass("Role " + unit.Role);
          $("#info .infoWrapper").html("").append(info);
        });
        elem.on("mouseover", function (e) {
          $("#charNamePlate").show();
          $("#charNamePlate").find('.ENName').html(unit.ENName.replace(/\[(.+?)\]/g, ''))
          $("#charNamePlate").find('.JPName').html(unit.JPName);
          if (unit.ZHName) {
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
        var unitList = localStorage.getItem("charListGl");
        if (unitList) {
          setUnitList(unitList, 'char');
        }
      }
      charLoaded = true;
      updateCharFilter();
      setSkillWait();
    }
  });
  socket.on('equips', function (data) {
    if (!equipLoaded) {
      $('#equips .equipList').html("");
      data.forEach(function (unit) {
        var elem = $('<li id="equip-' + unit.DevNicknames + '" class="Attribute' + unit.Attribute + ' Rarity' + unit.Rarity + ' equip unit"></li>')
          .append($('<img src="' + assetPath + 'item/equipment/' + unit.DevNicknames + '.png" class="weaponArt">'));
        if (unit.Obtain != tls.WeaponGacha) {
          elem.addClass('NoGacha')
        } else {
          elem.addClass('Gacha')
        }
        if (unit.AwakenLv3) {
          elem.addClass("HasAwakenLv3")
        }
        if (unit.AwakenLv5) {
          elem.addClass("HasAwakenLv5")
        }
        if (unit.Obtain) {
          if (unit.Obtain.includes(getTls("Limited"))) {
            elem.addClass("Limited")
          } else {
            elem.addClass("NoLimited")
          }
        } else {
          elem.addClass("NoLimited")
        }
        elem.appendTo($("#equipRarity" + unit.Rarity + " .equipList"));
        elem.data("DevNicknames", unit.DevNicknames);
        elem.data("Gauges", unit.Gauges);
        elem.data("MaxGauges", unit.MaxGauges);
        var info = $("#equipInfoTemplate").clone().removeClass('hidden').attr("id", "");
        Object.keys(unit).forEach(function (key) {
          info.find('.' + key + ' span').text(unit[key]);
        });
        var attr = '';
        if (unit.Attribute == 'All') { attr = getTls('AttributeAll'); }
        info.find('.Attribute').removeClass().addClass("Attribute " + unit.Attribute).html('<span>' + attr + '</span>');
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
            unitChanged();
          }
          var info = $("#equipInfoTemplate").clone().removeClass('hidden').attr("id", "");
          Object.keys(unit).forEach(function (key) {
            if (lang != "en") {
              if (key == "Attribute") {
                var tl = getTls(key + unit[key]);
                if (tl) info.find('.' + key + ' span').text(tl);
              } else {
                info.find('.' + key + ' span').text(unit[key]);
              }
            } else {
              info.find('.' + key + ' span').text(unit[key]);
            }
          });
          info.find('.Art').html('<img src="' + assetPath + 'item/equipment/' + unit.DevNicknames + '.png"><img src="' + assetPath + 'item/equipment/' + unit.DevNicknames + '_soul.png" class="soulArt">');
          info.find('.Attribute').removeClass().addClass("Attribute " + unit.Attribute);
          info.find('.Rarity').removeClass().addClass("Rarity Rarity" + unit.Rarity);
          $("#info .infoWrapper").html("").append(info);
        });

        elem.on("mouseover", function (e) {
          $("#charNamePlate").show();
          $("#charNamePlate").find('.ENName').html(unit.ENName.replace(/\[(.+?)\]/g, ''))
          if (lang == "zh-TW") {
            $("#charNamePlate").find('.ZHName').html(unit.ZHName);
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
        var unitList = localStorage.getItem("equipListGl");
        if (unitList) {
          setUnitList(unitList, 'equip');
        }
      }
      equipLoaded = true;
      updateEquipFilter();
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
  function getTls(skey) {
    for (const [key, value] of Object.entries(tls)) {
      if (skey == key) return value;
    }
  }

  for (i = 1; i < 4; i++) {
    const skillwait = '<div class="SkillWait">0</div><div class="mb2s">- / - / -</div>';
    const sliders = '<div class="sliders"><input type="range" class="abi4" min="0" max="6" value="0"><input type="range" class="abi5" min="0" max="6" value="0"><input type="range" class="abi6" min="0" max="6" value="0"></div>';
    $('#unison' + i)
    .append($(sliders).addClass('mainSliders'))
      .append(blank_elem.clone().append(skillwait).addClass('char main').data("mb2s", [0, 0, 0]))
      .append(blank_elem.clone().addClass('equip weapon'))
      .append(blank_elem.clone().append(skillwait).addClass('char sub').data("mb2s", [0, 0, 0]))
      .append(blank_elem.clone().addClass('equip soul'))
      .append($(sliders).addClass('subSliders'))
      .append($('<li class="totalSkillWait">' + tls.Wait + ': <span>0</span></li>'))
      .append($('<li class="totalSkillGauge"><span>0%/100%</span></li>'));
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
    if ($(this).is(".btnLimitedToggle")) {
      if ($(this).is(".off")) {
        $(this).removeClass("off").addClass("show");
        $("#chars .btnNoLimited").removeClass("on");
        $("#chars .btnShowLimited").addClass("on");
      } else if ($(this).is(".show")) {
        $(this).removeClass("show").addClass("no");
        $("#chars .btnNoLimited").addClass("on");
        $("#chars .btnShowLimited").removeClass("on");
      } else if ($(this).is(".no")) {
        $(this).removeClass("no").addClass("off");
        $("#chars .btnNoLimited").removeClass("on");
        $("#chars .btnShowLimited").removeClass("on");
      }
    } else {
      $(this).toggleClass('on');
    }


    updateCharFilter();
  });
  $("#equips .btnFilter").on("click", function () {
    if ($(this).is(".btnGachaToggle")) {
      if ($(this).is(".off")) {
        $(this).removeClass("off").addClass("show");
        $("#equips .btnNoGacha").removeClass("on");
        $("#equips .btnShowGacha").addClass("on");
      } else if ($(this).is(".show")) {
        $(this).removeClass("show").addClass("no");
        $("#equips .btnNoGacha").addClass("on");
        $("#equips .btnShowGacha").removeClass("on");
      } else if ($(this).is(".no")) {
        $(this).removeClass("no").addClass("off");
        $("#equips .btnNoGacha").removeClass("on");
        $("#equips .btnShowGacha").removeClass("on");
      }
    } else if ($(this).is(".btnLimitedToggle")) {
      if ($(this).is(".off")) {
        $(this).removeClass("off").addClass("show");
        $("#equips .btnNoLimited").removeClass("on");
        $("#equips .btnShowLimited").addClass("on");
      } else if ($(this).is(".show")) {
        $(this).removeClass("show").addClass("no");
        $("#equips .btnNoLimited").addClass("on");
        $("#equips .btnShowLimited").removeClass("on");
      } else if ($(this).is(".no")) {
        $(this).removeClass("no").addClass("off");
        $("#equips .btnNoLimited").removeClass("on");
        $("#equips .btnShowLimited").removeClass("on");
      }
    } else {
      $(this).toggleClass('on');
    }

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
  $(".sliders input").on("input", function () {
    setSkillWait();
  });

  $("#btnUnset").on("click", function (e) {
    e.stopPropagation();
    $("#btnUnset").appendTo($("#planner"));
    var target = $('.selected');
    if (target.is('.main') || target.is('.sub')) {
      setCharSlot(target, "blank");
    }
    if (target.is('.weapon') || target.is('.soul')) {
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
    localStorage.setItem("charListGl", getUnitList('char'));
    localStorage.setItem("equipListGl", getUnitList('equip'));
    window.history.pushState("saved", "", "https://eliya-bot.herokuapp.com/");
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
    var mb2s = [];
    $(".planner .char").each(function () {
      var DevNicknames = $(this).data("DevNicknames");
      if (!DevNicknames) DevNicknames = "blank";
      units.push(DevNicknames);
      mb2s.push($(this).find(".mb2s").text().replaceAll(' / ', ''));
    })
    $(".planner .equip").each(function () {
      var DevNicknames = $(this).data("DevNicknames");
      if (!DevNicknames) DevNicknames = "blank";
      units.push(DevNicknames);
    })
    var lngcode = '';
    if (lang != "en" && lang != "gl") lngcode += '.' + lang;
    var advanced = '';
    if ($("#info").is(".advanced")) {
      advanced = '@' + mb2s.join(',');
      var exs = []
    }

    const imageUrl = "https://eliya-bot.herokuapp.com/comp/" + units.join('-') + advanced + lngcode + ".png";
    $("#txtCompURL").val(imageUrl);
    if (!copyToClipboard(imageUrl)) {
      $('.body').addClass("showCompURL");
    } else {
      setTimeout(function () {
        $("#btnGetCompURL").text(tls.ImageURLCopied).addClass("on");
      }, 100);
    }
  });
  $("#btnAdvanced").on("click", function () {
    $(this).toggleClass('on');
    $("#btnGetCompURL").text(tls.GenerateImageURL).removeClass("on");
    $('#info').toggleClass('advanced');
  });
  $("#btnAltArt").on("click", function () {
    $("body").toggleClass("viewAlt");
    $(".char").each(function () {
      if (!$(this).is('.blank') && ($(this).find('.altArt').length == 0)) {
        const path = $(this).find('.mainArt').attr('src').replace('square_0', 'square_1');
        $('<img src="' + path + '" class="altArt">').insertAfter($(this).find('.mainArt'));
      }
    });
    $(this).toggleClass("on");
  });

  $("#btnViewSoul").on("click", function () {
    $("body").toggleClass("viewSoul");
    $(".equip").each(function () {
      if (!$(this).is('.blank') && ($(this).find('.soulArt').length == 0)) {
        const path = $(this).find('.weaponArt').attr('src').replace('.png', '_soul.png');
        $('<img src="' + path + '" class="soulArt">').insertAfter($(this).find('.weaponArt'));
      }
    });
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
    if ($(this).is(".on")) {
      $(".btnShowNotOwned").removeClass("on");
      $("#" + type + "s").removeClass("viewNotOwned");
    }
  });
  $(".btnShowNotOwned").on("click", function () {
    var type = $(this).data("type");
    $("#" + type + "s").toggleClass("viewNotOwned");
    $(this).toggleClass("on");
    $("." + type + "List").addClass('flash');
    setTimeout(function () {
      $("." + type + "List").removeClass('flash');
    }, 100);
    if ($(this).is(".on")) {
      $(".btnShowOwned").removeClass("on");
      $("#" + type + "s").removeClass("viewOwned");
    }
  });

  $("#listLang").on("click", function () {
    $(this).toggleClass("on");
    $(this).find('.active').prependTo($(this));
  });

  $("#listServer").on("click", function () {
    $(this).toggleClass("on");
  });
  $("#listServer li").on("click", function () {
    if ($("#listServer").is('.on')) {
      $("#listServer li").removeClass('active');
      $(this).addClass('active');
      server = $(this).data('server');
      updateCharFilter();
      updateEquipFilter();
    }
  });

  function getSkillWait(DevNickname) {
    if (DevNickname == "blank") {
      return 0;
    } else {
      return $("#char-" + DevNickname).data("SkillWait");
    }
  }
  function getGauges(DevNickname, type, max) {
    if (DevNickname == "blank") {
      return 0;
    } else {
      return $("#" + type + "-" + DevNickname).data((max ? "Max" : "") + "Gauges");
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
    var mb2s = slot.find(".mb2s");
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
      slot.removeClass('sub filtered')
    } else {
      slot.addClass('unit sub char');
      slot.removeClass('main filtered');
    }
    slot.append($('<div class="SkillWait">' + getSkillWait(DevNickname) + '</div>'));
    slot.append(mb2s);
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
      slot.removeClass('soul filtered')
    } else {
      slot.addClass('unit soul equip');
      if (DevNickname !== "blank") {
        const path = unit.find('.weaponArt').attr('src');
        slot.html('<img src="' + path + '" class="weaponArt"><img src="' + path.replace('.png', '_soul.png') + '" class="soulArt">');
      } else {
        const path = unit.find('img').attr('src');
        slot.html('<img src="' + path + '" class="weaponArt"><img src="' + path + '" class="soulArt">');
      }

      slot.removeClass('weapon filtered');
    }
    $(".selected").removeClass("selected");
    setSkillWait();    
    $("#btnGetCompURL").text(tls.GenerateImageURL).removeClass("on");
    $('body').removeClass("showCompURL");
  }
  function unitChanged() {
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
    updateCharFilter();
    updateEquipFilter();
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

  function filterServer() {

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
      filterUnit('AltArt');
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
    filterServer();
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
        if ($('#equips .btnNoGacha').is('.on')) {
          $("#equips .equip").not('.NoGacha').addClass('filtered');
        }
        if ($('#equips .btnShowGacha').is('.on')) {
          $("#equips .equip").not('.Gacha').addClass('filtered');
        }
        if ($('#equips .btnNoLimited').is('.on')) {
          $("#equips .equip").not('.NoLimited').addClass('filtered');
        }
        if ($('#equips .btnShowLimited').is('.on')) {
          $("#equips .equip").not('.Limited').addClass('filtered');
        }
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
    filterServer();
    updateEquipScore();
  }

  function setSkillWait() {
    $(".unison").data("TotalGauge", 0);
    $(".unison").data("TotalMaxGauge", 100);
    $(".unison").each(function (i) {
      if ($("#char-" + $(this).find('.main').data('DevNicknames')).is(".ManaBoard2")) {
        $(this).find(".mainSliders").removeClass("disabled");
        var mainabis = [$(this).find(".mainSliders .abi4").val(), $(this).find(".mainSliders .abi5").val(), $(this).find(".mainSliders .abi6").val()];
      } else {
        $(this).find(".mainSliders .abi4").val(0);
        $(this).find(".mainSliders .abi5").val(0);
        $(this).find(".mainSliders .abi6").val(0);
        $(this).find(".mainSliders").addClass("disabled");
        var mainabis = [0, 0, 0];
      }
      if ($("#char-" + $(this).find('.sub').data('DevNicknames')).is(".ManaBoard2")) {
        $(this).find(".subSliders").removeClass("disabled");
        var subabis = [$(this).find(".subSliders .abi4").val(), $(this).find(".subSliders .abi5").val(), $(this).find(".subSliders .abi6").val()];
      } else {
        $(this).find(".subSliders .abi4").val(0);
        $(this).find(".subSliders .abi5").val(0);
        $(this).find(".subSliders .abi6").val(0);
        $(this).find(".subSliders").addClass("disabled");
        var subabis = [0, 0, 0];
      }
      $(this).find('.main').data("mb2s", mainabis);
      $(this).find('.sub').data("mb2s", subabis);
      $(this).find('.main .mb2s').html(((mainabis[0] != 0) ? mainabis[0] - 1 : '-') + ' / ' + ((mainabis[1] != 0) ? mainabis[1] - 1 : '-') + ' / ' + ((mainabis[2] != 0) ? mainabis[2] - 1 : '-'));
      $(this).find('.sub .mb2s').html(((subabis[0] != 0) ? subabis[0] - 1 : '-') + ' / ' + ((subabis[1] != 0) ? subabis[1] - 1 : '-') + ' / ' + ((subabis[2] != 0) ? subabis[2] - 1 : '-'));
      calcGauge($(this).find('.main').data('DevNicknames'), 'main', i + 1);
      calcGauge($(this).find('.sub').data('DevNicknames'), 'sub', i + 1);
      calcGauge($(this).find('.weapon').data('DevNicknames'), 'weapon', i + 1);
      calcGauge($(this).find('.soul').data('DevNicknames'), 'soul', i + 1);
    });
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
      var gauge = $(this).data("TotalGauge");
      var maxgauge = $(this).data("TotalMaxGauge");
      if (maxgauge > 200) maxgauge = 200;
      $(this).find(".totalSkillGauge span").text(Math.floor(gauge) + '%/' + Math.floor(maxgauge) + '%');

    });
  }
  function calcGauge(DevNickname, slot, index) {
    if (slot == 'main' || slot == 'sub') {
      var gauges = getGauges(DevNickname, "char");
      var maxgauges = getGauges(DevNickname, "char", true);
    } else {
      var gauges = getGauges(DevNickname, "equip");
      var maxgauges = getGauges(DevNickname, "equip", true);
    }
    var mains = [$("#unison1").find('.main').data('DevNicknames'), $("#unison2").find('.main').data('DevNicknames'), $("#unison3").find('.main').data('DevNicknames')];
    if (gauges) {
      for (const [key, gauge] of Object.entries(gauges)) {
        if (key == 'LeaderBuff' && (index !== 1 || slot !== 'main')) continue;
        if ((slot != 'soul' && key == 'AbilitySoul') || (slot == 'soul' && key != 'AbilitySoul')) continue;
        if (gauge.IsMain && slot == 'sub') continue;
        var mult = 1;
        if (key == 'Ability4' || key == 'Ability5' || key == 'Ability6') {
          var abilv = $("#unison" + index).find("." + slot).data("mb2s")[parseInt(key.replace('Ability', '')) - 4];
          if (abilv == 0) continue;
          mult = 1 - (0.5 * (6 - abilv) / 5);
        }
        if (gauge.Every > 0) {
          var targetNum = $(".unison .char.Attribute" + gauge.EveryCond).length + $(".unison .char.Race" + gauge.EveryCond).length;
          mult = 0 + Math.floor(targetNum / gauge.Every);
        }
        switch (gauge.Target) {
          case "own":
            if ((gauge.Condition == '') || checkCondition(mains[index - 1], gauge.Condition)) {
              $('#unison' + index).data("TotalGauge", $('#unison' + index).data("TotalGauge") + parseFloat(gauge.Amount) * mult);
            }
            break;
          case "leader":
            if ((gauge.Condition == '') || checkCondition(mains[0], gauge.Condition)) {
              $('#unison1').data("TotalGauge", $('#unison1').data("TotalGauge") + parseFloat(gauge.Amount) * mult);
            }
            break;
          case "party":
            for (i = 1; i < 4; i++) {
              if ((gauge.Condition == '') || checkCondition(mains[i - 1], gauge.Condition)) {
                $('#unison' + i).data("TotalGauge", $('#unison' + i).data("TotalGauge") + parseFloat(gauge.Amount) * mult);
              }
            }
            break;
          case "other":
            for (i = 1; i < 4; i++) {
              if ((gauge.Condition == '') || checkCondition(mains[i - 1], gauge.Condition) && (!$('#unison' + i).is("#unison" + index))) {
                $('#unison' + i).data("TotalGauge", $('#unison' + i).data("TotalGauge") + parseFloat(gauge.Amount) * mult);
              }
            }
            break;
        }
      }
    }
    if (maxgauges) {
      for (const [key, gauge] of Object.entries(maxgauges)) {
        if (key == 'LeaderBuff' && (index !== 1 || slot !== 'main')) continue;
        if ((slot != 'soul' && key == 'AbilitySoul') || (slot == 'soul' && key != 'AbilitySoul')) continue;
        if (gauge.IsMain && slot == 'sub') continue;
        var mult = 1;
        if (key == 'Ability4' || key == 'Ability5' || key == 'Ability6') {
          var abilv = $("#unison" + index).find("." + slot).data("mb2s")[parseInt(key.replace('Ability', '')) - 4];
          if (abilv == 0) continue;
          mult = 1 - (0.5 * (6 - abilv) / 5);
        }
        if (gauge.Every > 0) {
          var targetNum = $(".unison .char.Attribute" + gauge.EveryCond).length + $(".unison .char.Race" + gauge.EveryCond).length;
          mult = 0 + Math.floor(targetNum / gauge.Every);
        }
        switch (gauge.Target) {
          case "own":
            if ((gauge.Condition == '') || checkCondition(mains[index - 1], gauge.Condition)) {
              $('#unison' + index).data("TotalMaxGauge", $('#unison' + index).data("TotalMaxGauge") + parseFloat(gauge.Amount) * mult);
            }
            break;
          case "leader":
            if ((gauge.Condition == '') || checkCondition(mains[0], gauge.Condition)) {
              $('#unison1').data("TotalMaxGauge", $('#unison1').data("TotalMaxGauge") + parseFloat(gauge.Amount) * mult);
            }
            break;
          case "party":
            for (i = 1; i < 4; i++) {
              if ((gauge.Condition == '') || checkCondition(mains[i - 1], gauge.Condition)) {
                $('#unison' + i).data("TotalMaxGauge", $('#unison' + i).data("TotalMaxGauge") + parseFloat(gauge.Amount) * mult);
              }
            }
            break;
          case "other":
            for (i = 1; i < 4; i++) {
              if ((gauge.Condition == '') || checkCondition(mains[i - 1], gauge.Condition) && (!$('#unison' + i).is("#unison" + index))) {
                $('#unison' + i).data("TotalMaxGauge", $('#unison' + i).data("TotalMaxGauge") + parseFloat(gauge.Amount) * mult);
              }
            }
            break;
        }
      }
    }
  }
  function checkCondition(DevNickname, c) {
    if (DevNickname) {
      if (DevNickname == "blank") {
        return false;
      } else {
        if ($("#char-" + DevNickname).is('.Attribute' + c) || $("#char-" + DevNickname).is('.Race' + c)) {
          return true
        }
      }
    }
  }
});
