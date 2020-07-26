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



document.getElementById("fanny").addEventListener('keyup',function(e){
//document.querySelectorAll("taskSheet").addEventListener('keyup',function(e){
    
    if (e.keyCode === 13) {
        //check if employee id is valid, if it is run...
        this.parentElement.parentElement.style.display = "none"
        //else ask for valid ID
  }
});





