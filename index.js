months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  mon = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  activeMonth = "";
function addZero(a){
    if(a<10)a="0"+a;
    return a;
  }

  function removeZero(a){
    if(a.length > 1 && a.substr(0, 1) == "0")a=a.substr(1);
    return a;
  }

  function firstInMonth(dateStr){
      //dd = new Date(dateStr);
      first = dateStr.substr(0,8)+"01";
      return first;
  }

  function dateToString(date){
    return date.getFullYear()+"-"+addZero(date.getMonth()+1)+"-"+addZero(date.getDate());
  }

  function addMonth(dateStr, months = 1){
    dd = new Date(dateStr);
    y = dd.getFullYear();
    m = dd.getMonth();
    d = dd.getDate();
    m = m+months;
    if(m>11){
        m -= 12;
        y += 1;
      }

      if(m<0){
        m += 12;
        y -= 1;
      }
    newDate = new Date(y,m,d);
    return newDate.getFullYear()+"-"+addZero(newDate.getMonth()+1)+"-"+addZero(newDate.getDate());
}

function getDaysBefore(dateStr){
    first = new Date(firstInMonth(dateStr)).getDay();
    db = first-1;
    if(db==-1)db=6;
    return(db);
}

function daysInMonth(dateStr){
    nextMonth = addMonth(dateStr);
    nextMonth = firstInMonth(nextMonth);
    dd = new Date(nextMonth);
    ee = new Date(dd.valueOf()-(24*3600*1000));
    return ee.getDate();
}

function getMonthName(dateStr){
    dd = new Date(dateStr);
    return months[dd.getMonth()];
}

function drawGridDay(id, dateStr, inactive = false){
    thisClass = "";
    if(todayStr==dateStr){thisClass="today";}
    if(inactive){thisClass="inactive";}
    document.getElementById(id).setAttribute("data-date", dateStr);
    document.getElementById(id).innerHTML = "<span class='"+thisClass+"'>"+removeZero(dateStr.substr(8))+"</span>";
    //document.getElementById(id).innerHTML += "<div class='gridEvent'>"+dateStr+"</div>";
    for(j=0;j<data.events.length;j++){
        if(data.events[j].date == dateStr){
            document.getElementById(id).innerHTML += "<div class='gridEvent'><span class='gridEventHeading'>"+data.events[j].type+"</span></div>";
            if(data.events[j].type == "Midweek Meeting" || data.events[j].type == "Weekend Meeting")document.getElementById(id).lastChild.classList = "gridEvent meeting";
            if(data.events[j].type == "Meeting for Field Service"){
                document.getElementById(id).lastChild.classList = "gridEvent fieldService";
                document.getElementById(id).lastChild.innerHTML += "<br><span class='gridEventSubheading'>"+data.events[j].items[0].name+"</span>";
            }
        }
        
    }
}

function drawMonth(dateStr){
    console.log("Drawing month: "+dateStr);
    activeMonth = dateStr;

    document.getElementById("activeMonth").innerHTML = getMonthName(dateStr).toUpperCase();
    document.getElementById("activeMonthYear").innerHTML = new Date(dateStr).getFullYear();
    daysThisMonth = daysInMonth(dateStr);
    daysLastMonth = daysInMonth(addMonth(dateStr, -1));
    daysNextMonth = daysInMonth(addMonth(dateStr, 1));
    daysBefore = getDaysBefore(dateStr);
    daysAfter = 42-daysBefore-daysThisMonth;

    document.getElementById("main").innerHTML = "";

    for(i=0;i<42;i++){
        document.getElementById("main").innerHTML += "<div data-date='' onclick='clickDay(this);' class='gridDay' id='d"+i+"'>"+i+"</div>"
    }

    for(i=0;i<daysBefore;i++){
        drawGridDay("d"+i, addMonth(dateStr, -1).substr(0,8)+addZero(daysLastMonth-daysBefore+i+1), true);
    }

    for(i=daysBefore;i<daysBefore+daysThisMonth;i++){
        drawGridDay("d"+i, dateStr.substr(0,8)+addZero(i-daysBefore+1));
    }

    for(i=daysBefore+daysThisMonth;i<42;i++){
        drawGridDay("d"+i, addMonth(dateStr, 1).substr(0,8)+addZero(i-daysBefore-daysThisMonth+1), true);
    }
}

function clickDay(gridDay){
    console.log(gridDay.getAttribute("data-date"));
    dateStr = gridDay.getAttribute("data-date");
    dd = new Date(dateStr);
    document.getElementById("topOverlay").innerHTML = "<span onclick='hideDay();'><<</span> "+weekdays[dd.getDay()]+", "+months[dd.getMonth()]+ " "+dd.getDate();
    document.getElementById("topOverlay").style.display = "block";
    document.getElementById("overlay").innerHTML = "";
    document.getElementById("overlay").style.display = "block";
    eventsToday = 0;
    for(i=0;i<data.events.length;i++){
        if(data.events[i].date == dateStr){
            drawDayEvent(data.events[i]);
            eventsToday++;
        }
    }
    if(eventsToday==0)document.getElementById("overlay").innerHTML = "<div style='text-align:center; margin-top:1vh;'>NO EVENTS THIS DAY</div>";
}

function hideDay(){
    document.getElementById("topOverlay").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

function drawDayEvent(event){
    str = "<div class='dayEvent";
    if(event.type == "Midweek Meeting" || event.type == "Weekend Meeting")str+=" meeting";
    if(event.type == "Meeting for Field Service")str+=" fieldService";
    str+="'>";
    str += "<div style='text-align:center'>"+event.time + " <span style='font-weight:bold;'>" + event.type+"</span></div><div class='dayEventGrid'>";
    for(j=0;j<event.items.length;j++){
        str += "<div>"+event.items[j].type+"</div><div>"+event.items[j].name;
        if(typeof event.items[j].name2 !== 'undefined'){
            str += "<br>("+event.items[j].name2+")";
        }
        str+="</div>";
    }
    str += "</div></div>";
    document.getElementById("overlay").innerHTML += str;
}

function previousMonth(){
    drawMonth(addMonth(activeMonth, -1));
}

function comingMonth(){
    drawMonth(addMonth(activeMonth, 1));
}

window.addEventListener("load", () =>{    
    registerSW();
    data = JSON.parse(localStorage.getItem("eventDatabase"));
      if(data != null){
        init();
      }
    loadJSON();
});

function send_message_to_sw(msg){
    navigator.serviceWorker.controller.postMessage(msg);
    setTimeout(function() {window.location.reload(true);}, 1000);
}

async function registerSW(){
    if("serviceWorker" in navigator){
        try{
            await navigator.serviceWorker.register("sw.js");
        }catch(e){
            console.log("SW registration failed");
        }
    }
}

function loadJSON(){
    var url = "https://isak.pythonanywhere.com?action=read";
    fetch(url)
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    data = myJson;
    localStorage.setItem("eventDatabase", JSON.stringify(data));
    console.log("Data fetched. Initializing...");
    init();
  });
  }

  function init(){
    today = new Date();
    todayStr = dateToString(today);
    clickTime = today.valueOf();
    /*var mc = new Hammer(document.getElementById("main"));
    mc.on("swipeleft", function(ev) {
        if(new Date().valueOf()-clickTime > 100){
        comingMonth();
        clickTime = new Date().valueOf();
        }
        
    });
    
    mc.on("swiperight", function(ev) {
        if(new Date().valueOf()-clickTime > 100){
            previousMonth();
            clickTime = new Date().valueOf();
            }
    });*/
    
    drawMonth(todayStr);
    //console.log(data.events[0]);
  }