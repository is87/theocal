months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
mon = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
activeMonth = "";
function addZero(a) {
    if (a < 10) a = "0" + a;
    return a;
}

function removeZero(a) {
    if (a.length > 1 && a.substr(0, 1) == "0") a = a.substr(1);
    return a;
}

function firstInMonth(dateStr) {
    //dd = new Date(dateStr);
    first = dateStr.substr(0, 8) + "01";
    return first;
}

function dateToString(date) {
    return date.getFullYear() + "-" + addZero(date.getMonth() + 1) + "-" + addZero(date.getDate());
}

function addMonth(dateStr, months = 1) {
    dd = new Date(dateStr);
    y = dd.getFullYear();
    m = dd.getMonth();
    //d = dd.getDate();
    m = m + months;
    if (m > 11) {
        m -= 12;
        y += 1;
    }

    if (m < 0) {
        m += 12;
        y -= 1;
    }
    newDate = new Date(y, m, 1);
    return newDate.getFullYear() + "-" + addZero(newDate.getMonth() + 1) + "-" + addZero(newDate.getDate());
}

function getDaysBefore(dateStr) {
    first = new Date(firstInMonth(dateStr)).getDay();
    db = first - 1;
    if (db == -1) db = 6;
    return (db);
}

function daysInMonth(dateStr) {
    nextMonth = addMonth(dateStr);
    nextMonth = firstInMonth(nextMonth);
    dd = new Date(nextMonth);
    ee = new Date(dd.valueOf() - (24 * 3600 * 1000));
    return ee.getDate();
}

function getMonthName(dateStr) {
    dd = new Date(dateStr);
    return months[dd.getMonth()];
}

function drawGridDay(id, dateStr, inactive = false) {
    thisClass = "";
    if (todayStr == dateStr) {
        thisClass = "today";
        //document.getElementById(id).style.backgroundColor = "#ffffff";
    } else {
        //document.getElementById(id).style.backgroundColor = "#f9f9f9";
    }
    if (inactive) {
        //thisClass="inactive";
        document.getElementById(id).style.opacity = 0.6;
    }
    document.getElementById(id).setAttribute("data-date", dateStr);
    document.getElementById(id).innerHTML = "<div style='margin-bottom:1vh;' class='" + thisClass + "'>" + removeZero(dateStr.substr(8)) + "</div>";
    //document.getElementById(id).innerHTML += "<div class='gridEvent'>"+dateStr+"</div>";
    for (j = 0; j < data.events.length; j++) {
        if (data.events[j].date == dateStr) {
            document.getElementById(id).innerHTML += "<div class='gridEvent'><span class='gridEventHeading'>" + data.events[j].time + "</span></div>";
            if (JSON.stringify(data.events[j]).indexOf(myName) != -1 && myName != "") document.getElementById(id).lastChild.style.borderBottom = "2px solid #328b8c";
            if (data.events[j].type == "Midweek Meeting" || data.events[j].type == "Weekend Meeting") document.getElementById(id).lastChild.classList = "gridEvent meeting";
            if (data.events[j].type == "Meeting for Field Service") {
                document.getElementById(id).lastChild.classList = "gridEvent fieldService";
                namn = data.events[j].items[0].name;
                a = namn.indexOf(" ");
                namn = namn.substr(0, 1) + "." + namn.substr(a);
                document.getElementById(id).lastChild.innerHTML += "<br><span class='gridEventSubheading'>" + namn + "</span>";
            }
        }

    }
}

function drawMonth(dateStr) {
    console.log("Drawing month: " + dateStr);
    activeMonth = dateStr;

    document.getElementById("activeMonth").innerHTML = getMonthName(dateStr).toUpperCase();
    document.getElementById("activeMonthYear").innerHTML = new Date(dateStr).getFullYear();
    daysThisMonth = daysInMonth(dateStr);
    daysLastMonth = daysInMonth(addMonth(dateStr, -1));
    daysNextMonth = daysInMonth(addMonth(dateStr, 1));
    daysBefore = getDaysBefore(dateStr);
    daysAfter = 42 - daysBefore - daysThisMonth;

    document.getElementById("main").innerHTML = "";

    for (i = 0; i < 42; i++) {
        document.getElementById("main").innerHTML += "<div data-date='' onclick='clickDay(this);' class='gridDay' id='d" + i + "'>" + i + "</div>"
    }

    for (i = 0; i < daysBefore; i++) {
        drawGridDay("d" + i, addMonth(dateStr, -1).substr(0, 8) + addZero(daysLastMonth - daysBefore + i + 1), true);
    }

    for (i = daysBefore; i < daysBefore + daysThisMonth; i++) {
        drawGridDay("d" + i, dateStr.substr(0, 8) + addZero(i - daysBefore + 1));
    }

    for (i = daysBefore + daysThisMonth; i < 42; i++) {
        drawGridDay("d" + i, addMonth(dateStr, 1).substr(0, 8) + addZero(i - daysBefore - daysThisMonth + 1), true);
    }
}

function clickDay(gridDay, override = "") {
    //console.log(gridDay.getAttribute("data-date"));
    if (override != "") {
        dateStr = override;
    } else {
        dateStr = gridDay.getAttribute("data-date");
    }
    console.log(dateStr);
    dd = new Date(dateStr);
    document.getElementById("topOverlay").innerHTML = "<span onclick='hideDay();'><<</span> " + weekdays[dd.getDay()] + ", " + months[dd.getMonth()] + " " + dd.getDate();
    document.getElementById("topOverlay").style.display = "block";
    document.getElementById("overlay").innerHTML = "";
    document.getElementById("overlay").style.display = "block";
    eventsToday = 0;
    for (i = 0; i < data.events.length; i++) {
        if (data.events[i].date == dateStr) {
            drawDayEvent(data.events[i]);
            eventsToday++;
        }
    }
    if (eventsToday == 0) document.getElementById("overlay").innerHTML = "<div style='text-align:center; margin-top:1vh;'>NO EVENTS THIS DAY</div>";
}

function hideDay() {
    document.getElementById("topOverlay").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

function drawDayEvent(event) {
    str = "<div class='dayEvent";
    if (event.type == "Midweek Meeting" || event.type == "Weekend Meeting") str += " meeting";
    if (event.type == "Meeting for Field Service") str += " fieldService";
    str += "'>";
    str += "<div style='text-align:center'>" + event.time + " <span style='font-weight:bold;'>" + event.type + "</span></div><div class='dayEventGrid'>";
    for (j = 0; j < event.items.length; j++) {
        str += "<div>" + event.items[j].type + "</div><div>";
        if (event.items[j].name.indexOf(myName) != -1 && myName != "") {
            str += "<b>" + event.items[j].name + "</b>";
        } else {
            str += event.items[j].name;
        }
        if (typeof event.items[j].name2 !== 'undefined') {
            if (event.items[j].name2.indexOf(myName) != -1 && myName != "") {
                str += "<br><b>(" + event.items[j].name2 + ")</b>";
            } else {
                str += "<br>(" + event.items[j].name2 + ")";
            }
        }
        str += "</div>";
    }
    str += "</div></div>";
    document.getElementById("overlay").innerHTML += str;
}

function previousMonth() {
    drawMonth(addMonth(activeMonth, -1));
}

function comingMonth() {
    drawMonth(addMonth(activeMonth, 1));
}

window.addEventListener("load", () => {
    registerSW();
    data = JSON.parse(localStorage.getItem("eventDatabase"));
    if (data != null) {
        init();
    }
    loadJSON();
});

function send_message_to_sw(msg) {
    navigator.serviceWorker.controller.postMessage(msg);
    setTimeout(function () { window.location.reload(true); }, 1000);
}

async function registerSW() {
    if ("serviceWorker" in navigator) {
        try {
            await navigator.serviceWorker.register("sw.js");
        } catch (e) {
            console.log("SW registration failed");
        }
    }
}

function loadJSON() {
    var url = "https://isak.pythonanywhere.com?action=read";
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            data = myJson;
            localStorage.setItem("eventDatabase", JSON.stringify(data));
            console.log("Data fetched. Initializing...");
            init();
        });
}

function init() {
    myName = "";
    if (localStorage.getItem("name") != null){
        myName = localStorage.getItem("name");
    }else{
        localStorage.setItem("name", "");
    }
    document.documentElement.style.setProperty("--meeting-color", "#ec2c2c");
    document.documentElement.style.setProperty("--service-color", "#eca02c");
    document.documentElement.style.setProperty("--special-color", "#881f9b");
    if (localStorage.getItem("meetingColor") != null)document.documentElement.style.setProperty("--meeting-color", localStorage.getItem("meetingColor"));
    if (localStorage.getItem("serviceColor") != null)document.documentElement.style.setProperty("--service-color", localStorage.getItem("serviceColor"));
    if (localStorage.getItem("specialColor") != null)document.documentElement.style.setProperty("--special-color", localStorage.getItem("specialColor"));
    
    today = new Date();
    todayStr = dateToString(today);
    timeStr = addZero(today.getHours()) + ":" + addZero(today.getMinutes());
    nextEvent = findNextEvent(todayStr, timeStr);
    if(nextEvent != -1)getTimeDifference(Date.parse(data.events[nextEvent].date + "T" + data.events[nextEvent].time), today);
    clickTime = today.valueOf();
    var mc = new Hammer(document.getElementById("main"));
    mc.on("swipeleft", function (ev) {
        if (new Date().valueOf() - clickTime > 100) {
            comingMonth();
            clickTime = new Date().valueOf();
        }

    });

    mc.on("swiperight", function (ev) {
        if (new Date().valueOf() - clickTime > 100) {
            previousMonth();
            clickTime = new Date().valueOf();
        }
    });

    drawMonth(todayStr);
}

function findNextEvent(dateStr, timeStr) {
    found = -1;
    for (i = 0; i < data.events.length; i++) {
        if ((dateStr + timeStr) < (data.events[i].date + data.events[i].time)) {
            if (found == -1) { found = i; console.log(data.events[i].date + data.events[i].time); }
        }
        //if(dateStr < data.events[i].date || (dateStr == data.events[i].date && timeStr <  ) ) 
    }
    return found;
}

function getTimeDifference(a, b) {
    mins = Math.ceil((a - b) / 60000);
    hs = Math.floor(mins / 60);
    mins = mins % 60;
    document.getElementById("bottom").innerHTML = "<span onclick='clickDay(null, \""+data.events[nextEvent].date+"\");'>Next event in " + hs + " hours and " + mins + " minutes</span>";
    setTimeout(function(){ document.getElementById("bottom").innerHTML = ""; }, 10000);
    //console.log("Next event in " + hs + " hours and " + mins + " minutes");
}

function showSettings(){
    document.getElementById("settingsBack").style.display = "block";
    document.getElementById("settingsName").value = localStorage.getItem("name");
    document.getElementById("meetingColor").value = document.documentElement.style.getPropertyValue("--meeting-color");
    document.getElementById("serviceColor").value = document.documentElement.style.getPropertyValue("--service-color");
    document.getElementById("specialColor").value = document.documentElement.style.getPropertyValue("--special-color");
}

function saveSettings(){
    localStorage.setItem("name", document.getElementById("settingsName").value);
    myName = document.getElementById("settingsName").value;
    localStorage.setItem("meetingColor", document.getElementById("meetingColor").value);
    localStorage.setItem("serviceColor", document.getElementById("serviceColor").value);
    localStorage.setItem("specialColor", document.getElementById("specialColor").value);
    document.documentElement.style.setProperty("--meeting-color", document.getElementById("meetingColor").value);
    document.documentElement.style.setProperty("--service-color", document.getElementById("serviceColor").value);
    document.documentElement.style.setProperty("--special-color", document.getElementById("specialColor").value);
    document.getElementById("settingsBack").style.display = "none";
    drawMonth(activeMonth);
}

function hideSettings(){
    document.getElementById("settingsBack").style.display = "none";
}

function resetColors(){
    document.getElementById("meetingColor").value = "#ec2c2c";
    document.getElementById("serviceColor").value = "#eca02c";
    document.getElementById("specialColor").value = "#881f9b";
}