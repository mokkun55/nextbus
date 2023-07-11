var timetable = [
    "5:30", "5:55",
    "6:08", "6:21",
    "7:05", "7:15", "7:21", "7:29", "7:46", "7:59",
    "8:12", "8:16", "8:48",
    "9:14", "9:40",
    "10:00", "10:20", "10:40",
    "11:00", "11:20", "11:40",
    "12:02", "12:22", "12:40",
    "13:02", "13:22", "13:40",
    "14:02", "14:22", "14:40", "14:54",
    "15:10", "15:30", "15:44",
    "16:04", "16:20", "16:30", "16:44",
    "17:04", "17:20", "17:39", "17:54",
    "18:10", "18:29", "18:44",
    "19:04", "19:20", "19:34", "19:44", "19:54",
    "20:14", "20:29",
    "21:29", "21:54",
    "22:47"
  ];
  
  // 現在時刻に最も近い時刻を取得する
  function getNearestTime() {
    var currentTime = new Date();
    var currentHour = currentTime.getHours();
    var currentMinute = currentTime.getMinutes();
    var currentSecond = currentTime.getSeconds();
    var currentTimeString = padZero(currentHour) + ":" + padZero(currentMinute);
    var nowtime = padZero(currentHour) + ":" + padZero(currentMinute) + ":" + padZero(currentSecond);
    document.getElementById('nowtime').innerHTML = "現在時刻: " + nowtime;

    var nearestTime = "";
    var nearestDiff = Infinity;
  
    for (var i = 0; i < timetable.length; i++) {
      var time = timetable[i];
      var diff = getTimeDifference(currentTimeString, time);
  
      if (diff >= 0 && diff < nearestDiff) {
        nearestTime = time;
        nearestDiff = diff;
      }
    }
  
    return nearestTime;
  }
  
  // 時刻の差分を取得する関数
  function getTimeDifference(time1, time2) {
    var time1Array = time1.split(":");
    var time2Array = time2.split(":");
    var hour1 = parseInt(time1Array[0]);
    var minute1 = parseInt(time1Array[1]);
    var hour2 = parseInt(time2Array[0]);
    var minute2 = parseInt(time2Array[1]);
  
    var diffHour = hour2 - hour1;
    var diffMinute = minute2 - minute1;
    var diffTotal = diffHour * 60 + diffMinute;
  
    return diffTotal;
  }
  
  // 数字を0埋めする関数
  function padZero(num) {
    return (num < 10 ? "0" : "") + num;
  }
  
  // 最も近い時刻を表示する関数
  function displayNearestTime() {
    var nearestTime = getNearestTime();
  
    if (nearestTime) {
      var nearestTimeElement = document.getElementById("nearest-time");
      nearestTimeElement.textContent = "次のバス: " + nearestTime;
    } else {
      console.log("No timetable available.");
    }
  }
  
  // 1秒ごとに最も近い時刻を更新
  setInterval(function () {
    displayNearestTime();
  }, 1000);
  