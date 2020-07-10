$(document).ready(function () {
  var clientid;
  var isIOS = ((/iphone|ipad/gi).test(navigator.appVersion));
  var inputDown = isIOS ? "touchstart" : "touchstart mousedown";
  var inputUp = isIOS ? "touchend" : "touchend mouseup";
  var w_width = $(window).width();
  var w_height = $(window).height();
  const assetPath = '/img/assets/';
  var socket = io();
  var titleLoaded = false;

  function clearUI() {

  }
  socket.emit('connected-title', lang);
  function resizeCheck() {
    w_width = $(window).width();
    w_height = $(window).height();
  }
  $(window).resize(function () {
    resizeCheck();
  });
  resizeCheck();
  socket.on('titles', function (data) {
    if (!titleLoaded) {
      $('#titles .titleList').html("");
      data.forEach(function (title) {
        var elem = $('<li class="title"></li>');
        elem.appendTo($(".titleList"));		  
        var info = $("#titleInfoTemplate").clone().removeClass('hidden').attr("id", "");
        Object.keys(title).forEach(function (key) {
          info.find('.' + key + ' span').text(title[key]);
        });
        elem.append(info);		  
        elem.on("click", function () {
            $(this).toggleClass("checked");
            titleChanged();
        });
      });

		
      var elem = ''
      for (i = 0; i < 14; i++) {
        elem += '<li class="title spookyStuff">';
      }

      $('#titles .titleList').append($(elem));
		var titleList = localStorage.getItem("titleList");
		if (titleList) {
		  setUnitList(titleList, 'title');
		}
      titleLoaded = true;
      updateTitleScore();
    }
  });

  $("#errMsg").on("click", function () {
    $(this).addClass('hidden');
  });
	
  $("#titles .btnFilter").on("click", function () {
    $(this).toggleClass('on');
    updateTitleFilter();
  });


  $("#btnListView").on("click", function () {
    $(this).toggleClass('on');
    $('body').toggleClass('listView');
  });

  $("#btnSave").on("click", function () {
	localStorage.setItem("titleList", getUnitList('title')); 	  
    $(this).removeClass("on");
    setTimeout(function () {
      $("#btnSave").addClass("on")
    }, 100);
  });
  $(".btnSelectAll").on("click", function () {
    if (!$(this).is('.on')) {
      $(this).siblings('.titleList').find('.title').not('.spookyStuff').not('.filtered').addClass('checked');
    } else {
      $(this).siblings('.titleList').find('.title').not('.spookyStuff').not('.filtered').removeClass('checked');
    }
	titleChanged();
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

  function setUnitList(titleList, type) {
    var titles = titleList.split(",")
    $(".checked").removeClass(".checked");
    titles.forEach(function (title) {
      $("#" + type + "-" + title).addClass("checked");
    });
    updateTitleScore();
  }

  function getUnitList(type) {
    var titles = [];
    $("#" + type + "s .checked").each(function () {
      var DevNicknames = $(this).data("DevNicknames");
      titles.push(DevNicknames);
    });
    return titles.join();
  }

  function titleChanged(){
	$("#btnSave").removeClass("on");
    updateTitleScore();
  }		
	
  function updateTitleScore() {
    var gTotal = 0;
    var gCount = 0;
    $('#titles .titleList').each(function () {
      const total = $(this).find(".title").not('.filtered').not('.spookyStuff').length;
      const count = $(this).find(".title.checked").not('.filtered').not('.spookyStuff').length;
      $(this).siblings('.score').text(count + '/' + total);
      gTotal += total;
      gCount += count;
      if (count == total) {
        $(this).siblings('.btnSelectAll').addClass('on').html(tls.DeselectAll);
      } else {
        $(this).siblings('.btnSelectAll').removeClass('on').html(tls.SelectAll);
      }
    });
    $("#titleGrandTotal .score").text(gCount + '/' + gTotal);
    if (gTotal > 0) {
      $("#titleGrandTotal .percentage").text((100 * gCount / gTotal).toFixed(0) + '%');
    } else {
      $("#titleGrandTotal .percentage").text('');
    }
  }


});
