if(document.querySelector("#time") != null){
    updateDate();

    function updateDate(){
        var ddate = document.querySelectorAll(".date")
        var now = new Date();
        var time = now.toLocaleTimeString().slice(0,-6) + now.toLocaleTimeString().slice(-3);
        var day = now.toString().slice(0,10);
        
        date = now.toLocaleDateString();//now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
        ddate.forEach(display => {
            display.textContent = day;
        });
        document.querySelector("#time").textContent = time;
        if (now.getHours() >= 21){
            console.log("it's still pretty late");
        }
    }

    setInterval("updateDate();", 60000);
}
function refreshData(){
    if($("#empl").length){
        $(".tasks").html('<tbody><tr><th id="empl">Employee #</th><th>Task</th><th>Description</th></tr></tbody>')
    } else {
        $(".tasks").html('<tbody><tr><th>Task</th><th>Description</th></tr></tbody>')
    }
    
    $.ajax({
        url: 'tasks/',
        type: 'GET',
        dataType: 'json',
        success: (data) => {
            data.forEach(task => {
                if(task.task_time == 'opn'){
                    if($("#empl").length){
                        $("#opening-tasks").append('<tr><td><input type="number" id="'+ task.id +'"></td><td>'
                        + task.task_name + '</td><td>' + task.task_desc + '</td></tr>');
                        return
                    }
                    $("#opening-tasks").append('<tr><td>'+ task.task_name + 
                    '</td><td>' + task.task_desc + '</td></tr>')

                } else if (task.task_time == 'day'){
                if($("#empl").length){
                    $("#daily-tasks").append('<tr><td><input type="number" id="'+ task.id +'"></td><td>'
                    + task.task_name + '</td><td>' + task.task_desc + '</td></tr>');
                    return
                    }
                    $("#daily-tasks").append('<tr><td>'+ task.task_name + 
                    '</td><td>' + task.task_desc + '</td></tr>')
                }else{
                if($("#empl").length){
                    $("#cls-tasks").append('<tr><td><input type="number" id="'+ task.id +'"></td><td>'
                    + task.task_name + '</td><td>' + task.task_desc + '</td></tr>');
                    return
                    }
                    $("#cls-tasks").append('<tr><td>'+ task.task_name + 
                    '</td><td>' + task.task_desc + '</td></tr>')
                }
            });
        }
    })
}
refreshData();    
$(".new-task").on("click", function(){
    if(this.id === 'createOpening'){
        data = {
            task_name: $("#InputNameOpen").val(),
            task_time: "opn",
            task_desc: $("#InputDescOpen").val()
        }
    }
    console.log(data)
    $.ajax({
        url: '/tasks',
        type: 'POST',
        dataType:'text',
        data: data,
        error: function (xhr, status){
            console.log(arguments);
        },
        success: function(data) {
            $(".close").click()
            refreshData();
        }
        
    });
})


// document.getElementById("fanny").addEventListener('keyup',function(e){
// //document.querySelectorAll("taskSheet").addEventListener('keyup',function(e){
    
//     if (e.keyCode === 13) {
//         //check if employee id is valid, if it is run...
//         this.parentElement.parentElement.style.display = "none"
//         //else ask for valid ID
//   }
// });





