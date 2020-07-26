//=================================================================
//Universal variables and functions
//=================================================================

var dayOfWeek;
switch (new Date().getDay()) {
  case 0:
    dayOfWeek = "Sun";
    break;
  case 1:
    dayOfWeek = "Mon";
    break;
  case 2:
    dayOfWeek = "Tue";
    break;
  case 3:
    dayOfWeek = "Wed";
    break;
  case 4:
    dayOfWeek = "Thu";
    break;
  case 5:
    dayOfWeek = "Fri";
    break;
  case 6:
    dayOfWeek = "Sat";
    break;
}
function twentyFourToTwelve(timeInTwentyFour){
    hours = Number(timeInTwentyFour.slice(0, -3))
    if(hours > 12){
        hours = hours - 12
        return hours + timeInTwentyFour.slice(-3) + " PM"
    } else {
        return timeInTwentyFour + " AM"
    }
}
function convertDateToString(date){
    year = date.getFullYear().toString();
    month = (date.getMonth() + 1).toString();
    day = date.getDate().toString();
    if(month.length < 2){
        month = "0" + month
    }
    if(day.length < 2){
        day = "0" + day
    }
    dateString = year + "-" + month + "-" + day
    return dateString
}
function refreshAt(hours, minutes, seconds) {
    var now = new Date();
    var then = new Date();

    if(now.getHours() > hours ||
       (now.getHours() == hours && now.getMinutes() > minutes) ||
        now.getHours() == hours && now.getMinutes() == minutes && now.getSeconds() >= seconds) {
        then.setDate(now.getDate() + 1);
    }
    then.setHours(hours);
    then.setMinutes(minutes);
    then.setSeconds(seconds);

    var timeout = (then.getTime() - now.getTime());
    setTimeout(function() { window.location.reload(true); }, timeout);
}
function quarterHour(time){
    minutes = time.getMinutes()
    hours = time.getHours()
    if(minutes < 15){
        hours = hours - 1
        minutes = 45
    } else if(15 <= minutes && minutes < 45){
        minutes = 15
    } else{
        minutes = 45
    };
    return twentyFourToTwelve(hours + ":" + minutes)
}
function resetWaterTests(){
    $(".waterTestRows input[type='number']").val("")
    $(".waterTestRows input[type='checkbox']").prop("checked", false)
    $(".waterTestRows span").removeAttr("style")
}
function waterTestDisplay(time, waterTestTimes){
    currentHoursInMinutes = time.getHours() * 60
    currentMinutes = time.getMinutes()
    compareTime = currentHoursInMinutes + currentMinutes
        waterTestTimes.every((waterTestTime) => {
            testhoursInMinutes = Number(waterTestTime.slice(0,-3))*60
            testMinutes = Number(waterTestTime.slice(-2))
            testCompareTime = testhoursInMinutes + testMinutes
            if(testCompareTime - compareTime <= 30 && testCompareTime - compareTime >= -60){
                $(".waterTestRows").removeAttr("style")
                $("#waterTestDisplay").text("Water Tests For " + twentyFourToTwelve(waterTestTime))
                return false
            } else {
                $("#waterTestDisplay").text("Currently No Water Tests To Do!")
                resetWaterTests()
                $(".waterTestRows").attr("style", "display: none")
                return true
            }

    })
}


//=================================================================
// ONLY RUNS ON HOME.EJS
//=================================================================
if(document.querySelector(".time") != null){
    var openingTime
    var closingTime
    var waterTestTimes
    $.ajax({
        url: "/operating-hours",
        type: "GET",
        datatype: 'json',
        failure:(err) => {
            throw err
        },
        success: (data) => {
            data.forEach(entry => {
                if(dayOfWeek.toLowerCase() == entry.day){
                    if(entry.opncls == 'opn'){
                        openingTime = entry.time
                    } else {
                        closingTime = entry.time
                    }
                }
            }),
            waterTestTimes = WaterTestTimes(openingTime, closingTime)
            updateDate();
        }
    })
    function WaterTestTimes(openingTime, closingTime){
        var timesArray = []
        var opening = Number(("" + openingTime).slice(0, 2)) * 100 + Number(("" + openingTime).slice(3, 5)*100/60)
        var closing = Number(("" + closingTime).slice(0, 2)) * 100 + Number(("" + closingTime).slice(3, 5)*100/60)
        opening = opening/100 * 60
        closing = closing/100 * 60
        timesThatChange = opening
        loopVal = Math.floor((closing - opening)/180)
        for (let i = 0; i <= loopVal; i++) {
            var pushableTime = timesThatChange/60
            if(pushableTime % 1 != 0){
                pushableTime = (pushableTime*100).toString()
                var hours = pushableTime.slice(0, -2)
                var minutes = (Number(pushableTime.slice(-2)) * 60/100).toString()
                pushableTime = hours + minutes
            } else {
                pushableTime = pushableTime + "00"
            }
            pushableTime = pushableTime.slice(0, -2) + ":" + pushableTime.slice(-2)
            timesArray.push(pushableTime)
            timesThatChange += 180;
            
        }
        return(timesArray)
    }
    
    
    $(document).ready(function(){
        refreshAt(2, 0, 0);
        // var time = Number(("" + openingTime).slice(0, 2)) * 100 + Number(("" + openingTime).slice(3, 5))
        // console.log(time)'05:30:00'
    })
    function updateDate(){
        var ddate = document.querySelectorAll(".date")
        var now = new Date();
        var day = now.toString().slice(0,10);
        date = now.toLocaleDateString();
        ddate.forEach(display => {
            display.textContent = day;
        });
        waterTestDisplay(now, waterTestTimes)
        $("#waterTestTime").text()
        $(".time").text(quarterHour(now));
        $(".hourly").text(twentyFourToTwelve(now.getHours() + ":00"))

    }
    (function() {
        $('.waterTestRows input[type="number"').keyup(function() {
            var empty = false
            var poolname = $(this).attr("class").slice(0,-10)
            var poolclass = $(this).attr("class")
            $("." + poolclass).each(function() {
                if ($(this).val() == '') {
                    console.log(this.id + " is Empty")
                    empty = true;
                }
            });
    
    
            if (empty) {
                $('#employeeInput' + poolname).removeClass("inputsFilled") // updated according to http://stackoverflow.com/questions/7637790/how-to-remove-disabled-attribute-with-jquery-ie
            } else {
                $('#employeeInput' + poolname).addClass("inputsFilled"); // updated according to http://stackoverflow.com/questions/7637790/how-to-remove-disabled-attribute-with-jquery-ie
            }
            if(($('#employeeInput' + poolname).hasClass("inputsFilled") && $('#employeeInput' + poolname).hasClass("disable") == false) || $('#employeeInput' + poolname).hasClass("bothChecked")){
                $('#employeeInput' + poolname).removeAttr("disabled")
            } else {
                $('#employeeInput' + poolname).attr("disabled", "disabled")
            }
        });
        $('.waterTestRows input[type="checkbox"]').click(function() {
            var poolname = $(this).attr("class").slice(0,-10)
            var poolclass = $(this).attr("class")
                if(this.id == ("closure" + poolname)){
                    if($(this).is(":checked") && $("#dmNotified" + poolname).prop("checked") == false){
                        $("#dmSlider" + poolname).attr("style", "background-color: rgb(236, 41, 41)")
                        $('#employeeInput' + poolname).addClass("disable")
                        $('#employeeInput' + poolname).removeClass("bothChecked")
                        // alert("clicked")
                    } else if($(this).prop("checked") == false && $("#dmNotified" + poolname).prop("checked") == false) {
                        $("#dmSlider" + poolname).removeAttr("style")
                        $('#employeeInput' + poolname).removeClass("disable")
                        $('#employeeInput' + poolname).removeClass("bothChecked")
                    } else if($(this).prop("checked") == false && $("#dmNotified" + poolname).prop("checked") == true) {
                        $("#dmSlider" + poolname).removeAttr("style")
                        $('#employeeInput' + poolname).removeClass("disable")
                        $('#employeeInput' + poolname).removeClass("bothChecked")
                    } else {
                        $("#dmSlider" + poolname).removeAttr("style")
                        $('#employeeInput' + poolname).removeClass("disable")
                        $('#employeeInput' + poolname).addClass("bothChecked")
                    }
                }
                if(this.id == ("dmNotified" + poolname)){
                    if($(this).is(":checked") && $("#closure" + poolname).prop("checked") == false){
                        $("#dmSlider" + poolname).removeAttr("style")
                        $('#employeeInput' + poolname).removeClass("disable")
                        $('#employeeInput' + poolname).removeClass("bothChecked")
                    // alert("clicked")
                    } else if($(this).prop("checked") == false && $("#closure" + poolname).is(":checked")){
                        $("#dmSlider" + poolname).attr("style", "background-color: rgb(236, 41, 41)")
                        $('#employeeInput' + poolname).addClass("disable")
                        $('#employeeInput' + poolname).removeClass("bothChecked")
                        
                    } else if($(this).prop("checked") == true && $("#closure" + poolname).is(":checked")){
                        $('#employeeInput' + poolname).addClass("bothChecked")
                        $("#dmSlider" + poolname).removeAttr("style")
                        $('#employeeInput' + poolname).removeClass("disable")
                    } else{
                        $("#dmSlider" + poolname).removeAttr("style")
                        $('#employeeInput' + poolname).removeClass("disable")
                        $('#employeeInput' + poolname).removeClass("bothChecked")
                    }
                }
    
            if(($('#employeeInput' + poolname).hasClass("inputsFilled") && $('#employeeInput' + poolname).hasClass("disable") == false) || $('#employeeInput' + poolname).hasClass("bothChecked")){
                $('#employeeInput' + poolname).removeAttr("disabled")
            } else {
                $('#employeeInput' + poolname).attr("disabled", "disabled")
            }
    
            // if (empty) {
            //     $('#employeeInput' + poolname).attr('disabled', 'disabled'); // updated according to http://stackoverflow.com/questions/7637790/how-to-remove-disabled-attribute-with-jquery-ie
            // } else {
            //     $('#employeeInput' + poolname).removeAttr('disabled'); // updated according to http://stackoverflow.com/questions/7637790/how-to-remove-disabled-attribute-with-jquery-ie
            // }
        });
    })()
    

    setInterval("updateDate();", 60000);
    function refreshData(){
        date = new Date()
        dateString = convertDateToString(date) + "T07:00:00.000Z"
        $.ajax({
            url: "/tasks/done",
            type: "GET",
            datatype: 'json',
            success: (data) => {
                data.forEach(entry => {
                    if(dateString === entry.date){
                        var done = $("#" + entry.task_id)
                        done.val(entry.employee_id)
                        done.attr("disabled", true)
                        done.addClass("good")
                        done.closest("tr").addClass("good");
                    }
                })
            }
        })
    }
    refreshData();
    $('.emplnuminp').on('keyup', function(e) {
        var tasknum = this.id;
        var enterednum = $(this).val();
        var clicked = $(this);
        //alert(e.keyCode);
        if(e.keyCode == 13) {
            // if (clicked.hasClass("good") == true){
            //     return
            // }
            $.ajax({
                url: '/employees/',
                type: 'GET',
                dataType: 'json',
                error: function (xhr, status, errorThrown){
                    console.log(errorThrown)
                },
                success: (data) => {
                    data.every((employee, idx, arr) => {
                        if(employee.employee_id != enterednum){
                            if(idx === arr.length - 1){
                                alert('invalid id')
                            }
                        return true
                        } else {
                            data = {
                                task_weekday: dayOfWeek,
                                employee_id: enterednum,
                                task_id: tasknum
                            }
                            $.ajax({
                                url: '/tasks',
                                type: 'POST',
                                dataType:'text',
                                data: data,
                                error: function (xhr, status, errorThrown){
                                    console.log(errorThrown)
                                },
                                success: function(data) {
                                    console.log(data)
                                    clicked.addClass("good");
                                    clicked.attr("disabled", true)
                                    clicked.closest("tr").addClass("good");
                                }
                                
                            });
                            return false;
                        }
                       
                    })
                    
                }
            })
        }
    });
    $('.emplnumwatertest').on('keyup', function(e) {
        var enterednum = $(this).val();
        var clicked = $(this);
        var poolName = clicked.attr("id").slice(13)
        //alert(e.keyCode);
        if(e.keyCode == 13) {
            // if (clicked.hasClass("good") == true){
            //     return
            // }
            $.ajax({
                url: '/employees/',
                type: 'GET',
                dataType: 'json',
                error: function (xhr, status, errorThrown){
                    console.log(errorThrown)
                },
                success: (data) => {
                    data.every((employee, idx, arr) => {
                        if(employee.employee_id != enterednum){
                            if(idx === arr.length - 1){
                                alert('invalid id')
                            }
                        return true
                        } else {
                            var time = new Date()
                            if($(this).hasClass("inputsFilled")){
                                data = {
                                    watertestday: dayOfWeek,
                                    watertesttime: $("#waterTestDisplay").text().slice(16) ,
                                    employee_id: enterednum,
                                    poolName: poolName,
                                    fac: $("#fac" + poolName).val(),
                                    cc: $("#cc" + poolName).val(),
                                    tc: $("#tc" + poolName).val(),
                                    ph: $("#ph" + poolName).val(),
                                    temp: $("#temp" + poolName).val(),
                                    closure: $("#closure" + poolName).prop("checked"),
                                    dmnotified: $("#dmNotified" + poolName).prop("checked")
                                }
                            } else {
                                data = {
                                    watertestday: dayOfWeek,
                                    watertesttime: time.getHours() + ":" + time.getMinutes() ,
                                    employee_id: enterednum,
                                    poolName: poolName,
                                    closure: $("#closure" + poolName).prop("checked"),
                                    dmnotified: $("#dmNotified" + poolName).prop("checked")
                                } 
                            }
                            $.ajax({
                                url: '/waterTests',
                                type: 'POST',
                                dataType:'text',
                                data: data,
                                error: function (xhr, status, errorThrown){
                                    console.log(errorThrown)
                                },
                                success: function(data) {
                                    console.log(data)
                                    clicked.addClass("good");
                                    //disable all inputs in a row
                                    clicked.attr("disabled", true)
                                    clicked.closest("tr").addClass("good");
                                    clicked.closest("tr").children().children().addClass("good");
                                }
                                
                            });
                            return false;
                        }
                       
                    })
                    
                }
            })
        }
    })
    
    
}
//=================================================================
// ONLY RUNS ON THE ADMIN TASKS PAGE
//=================================================================
if($("#ModalLongTitle").length){
    jQuery(document).ready(function($) {
        $(".clickable-row").click(function() {
            taskId = this.id
            $("#ModalLongTitle").text("Update Task")
            $("#myform").attr("action", "/admin/tasks/"+taskId+"?_method=PUT")
            $.ajax({
                url: "/tasks/" + taskId,
                type: 'GET',
                dataType: 'json',
                success: (data) =>{
                    $("#task_name").val(data[0].task_name)
                    $("#task_desc").val(data[0].task_desc)
                    $("#createOpening").text("Update")
                    console.log(data[0].task_name)
                    $("#deleteButton").removeClass("hidden")
                    $("#delete").attr("action", "/admin/tasks/"+taskId+"?_method=DELETE")
                }
            })
        });
        $(".addnew").click(function() {
            task_time = this.id
            var title = ""
            $("#task_name").val("")
            $("#task_desc").val("")
            $("#myform").attr("action", "/admin/tasks")
            switch(task_time){
                case "opn":
                    title = "New Opening Task";
                    break;
                case "day":
                    title = "New Daily Task";
                    break;
                case "cls":
                    title = "New Closing Task";
                    break;
            }
            $("#ModalLongTitle").text(title)
            $("#task_time").val(task_time)
            $("#deleteButton").addClass("hidden")
        })
    });
}
if(document.querySelector(".dateFrom") != null){
    console.log(document.cookie)
}

// add to Url
// ?_method=PUT
