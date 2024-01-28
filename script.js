let fileContent; // ファイルの内容を保存するため
let tripfile = `trips.txt`;
let stopfile = `stop_times.txt`;
let heijitu = `5_1_20231101`; // 平日パターン
let kyujitu = `5_2_20231101`; // 休日パターン
// let youbi = heijitu; // ここをボタンで切り替えれるように
let tripid; // tripid をグローバルに宣言
let train_kirikae_num = 0;
let bus_kirikae_num = 0;

let train_houkou = '名古屋方面' //初期設定
let bus_houkou = '名張駅行' //初期設定

let station_id = '5736_2' //初期設定 → 駅行
// let station_id = '5803_1' //初期設定 → 学校行

let over_view = `時刻表凡例<br>

[区準]:区間準急 [特急]:近鉄特急 [V]:ビスタカー [快急]:快速急行 [UL■]:アーバンライナー:車いす対応車両 [ISL■]:伊勢志摩ライナー:車いす対応車両 [普通]:普通 [急行]:急行 [準急]:準急<br>

位･･･五位堂 京･･･京都 高･･･高安 上･･･上本町 難･･･難波<br>

下線:当駅始発
`
//曜日の判定
var date = new Date();
var dayOfWeek = date.getDay();
// console.log(dayOfWeek); 
if (dayOfWeek == 0 || dayOfWeek == 6) {
    youbi = kyujitu;
    console.log('休日');
    day = '休日';
} else {
    youbi = heijitu;
    console.log('平日');
    day = '平日';
}


function main() {
    // 既存のテーブルを削除
    const tableBody = document.querySelector("#timeTable tbody");
    tableBody.innerHTML = "";

    // バス切り替え判定
    // if (bus_kirikae_num % 2 == 1) {
    //     console.log('駅行')

    //     bus_houkou = '名古屋'
    //     station_id = '5803_1'
    // } else {
    //     console.log('学校行')
    //     bus_houkou = '大阪'
    //     station_id = '5736_2'
    // }


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
        // console.log(tripid)
        return tripid;
    })
    
    .then(tripid => {
        fetch(stopfile)
            .then(response => response.text())
            .then(data => {
                let cleanedData = data.replace(/"/g, '');
                let lines = cleanedData.split('\n');
                let arrivalTimes = [];
                console.log(station_id)
                for (let line of lines) {
                    let [trip_id, arrival_time, departure_time, stop_id, stop_sequence, stop_headsign, pickup_type, drop_off_type, shape_dist_traveled] = line.split(',');
                    if (tripid.includes(trip_id) && stop_id === station_id) {
                        arrivalTimes.push(arrival_time);
                    }
                }

                console.log(arrivalTimes);

                const times = arrivalTimes;

                const updateTimes = function () {
                    const [closestFutureTime, secondClosestTime] = findClosestFutureTimes(times);
                    const nextTime = addMinutes(closestFutureTime, 10); // closestFutureTime に 10 分追加
                    const secondnextTime = addMinutes(secondClosestTime, 10); // secondClosestTime に 10 分追加
                    document.getElementById('closestTime').textContent = closestFutureTime;
                    document.getElementById('secondClosestTime').textContent = secondClosestTime;
                    document.getElementById('nextTime').textContent = nextTime;
                    document.getElementById('secondnextTime').textContent = secondnextTime;
                    const now = new Date();
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
    if (train_kirikae_num % 2 == 1) {
        console.log('大阪方面')
        train_houkou = '大阪'
        over_view = `時刻表凡例<br>[区準]:区間準急 [特急]:近鉄特急 [V]:ビスタカー [快急]:快速急行 [UL■]:アーバンライナー:車いす対応車両 [ISL■]:伊勢志摩ライナー:車いす対応車両 [普通]:普通 [急行]:急行 [準急]:準急<br>位･･･五位堂 京･･･京都 高･･･高安 上･･･上本町 難･･･難波<br>下線:当駅始発`
        if (youbi == heijitu){
            train_csvfile = 'day_osaka.csv'
        } else {
            train_csvfile = 'holiday_osaka.csv'
        }
        
    } else {
        console.log('名古屋方面')
        train_houkou = '名古屋'
        over_view = `時刻表凡例<br>[特急]:近鉄特急 [V]:ビスタカー [快急]:快速急行 [UL■]:アーバンライナー:車いす対応車両 [ISL■]:伊勢志摩ライナー:車いす対応車両 [普通]:普通 [急行]:急行<br>中･･･伊勢中川 宇･･･宇治山田 賢･･･賢島 五･･･五十鈴川 松･･･松阪 青･･･青山町 鳥･･･鳥羽 名･･･名古屋 明･･･明星<br>下線:当駅始発`
        if (youbi == heijitu){
            train_csvfile = 'day_ise.csv'
        } else {
            train_csvfile = 'holiday_ise.csv'
        }
    }
    document.getElementById('train').innerHTML = `本日[${day}]のダイア<br>名張駅→${train_houkou}方面` ;
    document.getElementById('train_overview').innerHTML = over_view ;
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
function addMinutes(time, minutes) {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
}
// ページがロードされたら 
window.onload = function(){
    main();
    document.getElementById('train').innerHTML = `本日[${day}]のダイア<br>名張駅→${train_houkou}方面` ;
    document.getElementById('train_overview').innerHTML = over_view ;
}

function train_kirikae(){
    train_kirikae_num ++;
    main();
}

function bus_kirikae(){
    bus_kirikae_num ++;
    main();
}