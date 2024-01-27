let fileContent; // ファイルの内容を保存するための変数を定義します
let tripfile = `trips.txt`;
let stopfile = `stop_times.txt`;
let heijitu = `5_1_20231101`; // 平日パターン
let kyujitu = `5_2_20231101`; // 休日パターン
// let youbi = heijitu; // ここをボタンで切り替えれるように
let tripid; // tripid をグローバルに宣言
let kirikae = 0;

//曜日の判定
var date = new Date();
var dayOfWeek = date.getDay();
console.log(dayOfWeek); //
if (dayOfWeek == 0 || dayOfWeek == 6) {
    youbi = kyujitu;
    console.log('休日');
} else {
    youbi = heijitu;
    console.log('平日');
}

function main() {
    console.log('あいうえお');
    
    // 既存のテーブルを削除
    const tableBody = document.querySelector("#timeTable tbody");
    tableBody.innerHTML = "";

    fetch(tripfile)
    .then(response => response.text())
    .then(data => {
        let cleanedData = data.replace(/"/g, '');
        let lines = cleanedData.split('\n');
        tripid = [];
        for (let line of lines) {
            let [route_id, service_id, trip_id, trip_headsign, trip_short_name, direction_id, block_id, shape_id, jp_trip_desc, jp_trip_desc_symbol, jp_office_id, wheelchair_accessible] = line.split(',');
            if (service_id === youbi) {
                tripid.push(trip_id);
            }
        }
        tripid.sort();
        return tripid;
    })
    .then(tripid => {
        fetch(stopfile)
            .then(response => response.text())
            .then(data => {
                let cleanedData = data.replace(/"/g, '');
                let lines = cleanedData.split('\n');
                let arrivalTimes = [];
                for (let line of lines) {
                    let [trip_id, arrival_time, departure_time, stop_id, stop_sequence, stop_headsign, pickup_type, drop_off_type, shape_dist_traveled] = line.split(',');
                    if (tripid.includes(trip_id) && stop_id === '5736_2') {
                        arrivalTimes.push(arrival_time);
                    }
                }

                console.log(arrivalTimes);

                const times = arrivalTimes;

                const updateTimes = function () {
                    const [closestFutureTime, secondClosestTime] = findClosestFutureTimes(times);
                    document.getElementById('closestTime').textContent = closestFutureTime;
                    document.getElementById('secondClosestTime').textContent = secondClosestTime;

                    const now = new Date();
                    // document.getElementById('currentTime').textContent = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
                    
                    // 再帰的に setInteval を呼び出す
                    setTimeout(updateTimes, 1000);
                };

                // 初回実行
                updateTimes();
            })
            .catch(error => console.error('エラー:', error));
    })
    .catch(error => console.error('エラー:', error));


    //ここから時刻表表示プログラム

    //大阪 名古屋 切り替え判定
    if (kirikae % 2 == 1) {
        console.log('大阪')
        train_csvfile = 'day_osaka.csv'
    } else {
        console.log('名古屋')
        train_csvfile = 'day_nagoya.csv'
    }


    fetch(train_csvfile)
    .then(response => response.text())
    .then(data => {
        let parsedCSV = data.split('\n').slice(1).map(row => row.split(','));
        let tableBody = document.querySelector("#timeTable tbody");
        let currentHour = new Date().getHours();
        parsedCSV.forEach((row, index) => {
            let htmlRow = document.createElement('tr');
            if (index === currentHour - 5) {
                htmlRow.style.backgroundColor = 'orange';
            }
            row.forEach(cell => {
                let htmlCell = document.createElement('td');
                htmlCell.textContent = cell;
                htmlRow.appendChild(htmlCell);
            });
            tableBody.appendChild(htmlRow);
        });
    });
};
//ここまでダイア表示

function timeToSeconds(time) {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return (hours * 3600) + (minutes * 60) + seconds;
}

function findClosestFutureTimes(timeArray) {
    const now = new Date();
    const nowInSeconds = timeToSeconds(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
    let closestTime = null;
    let secondClosestTime = null;
    let smallestDifference = null;
    let secondSmallestDifference = null;

    for (let i = 0; i < timeArray.length; i++) {
        const timeInSeconds = timeToSeconds(timeArray[i]);
        if (timeInSeconds > nowInSeconds) {
            const difference = timeInSeconds - nowInSeconds;
            if (smallestDifference === null || difference < smallestDifference) {
                secondSmallestDifference = smallestDifference;
                secondClosestTime = closestTime;
                smallestDifference = difference;
                closestTime = timeArray[i];
            } else if (secondSmallestDifference === null || difference < secondSmallestDifference) {
                secondSmallestDifference = difference;
                secondClosestTime = timeArray[i];
            }
        }
    }

    if (closestTime !== null) {
        closestTime = closestTime.substring(0, closestTime.lastIndexOf(":"));
    }

    if (secondClosestTime !== null) {
        secondClosestTime = secondClosestTime.substring(0, secondClosestTime.lastIndexOf(":"));
    }

    return [closestTime, secondClosestTime];

}

// ページがロードされたら main 関数を実行
window.onload = main;

function train_kirikae(){
    kirikae ++;
    main();
}
