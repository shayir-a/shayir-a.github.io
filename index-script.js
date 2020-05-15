function openSidebar() {
    //document.getElementById("main").style.marginLeft = "25%";
    document.getElementById("sidebar").style.width = "25%";
    document.getElementById("sidebar").style.display = "block";
    document.getElementById("openSidebar").style.display = "none"; 
}

function closeSidebar() {
    //document.getElementById("main").style.marginLeft = "0%";
    document.getElementById("sidebar").style.display = "none";
    document.getElementById("openSidebar").style.display = "inline-block"; 
}