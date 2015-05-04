function onLoad() {
    var storedBuilding = localStorage.getItem("storedBuilding");

    if (storedBuilding != "undefined") {
		$("#buildings").val(storedBuilding);
		collectInfo();
	}
}

function getDayofWeek() {
    var d = new Date();
    var weekday = new Array(7);
    weekday[0] = "S";
    weekday[1] = "M";
    weekday[2] = "T";
    weekday[3] = "W";
    weekday[4] = "Th";
    weekday[5] = "F";
    weekday[6] = "S";

    var n = weekday[d.getDay()];
    return n;
}

function getHourPlusMinutes() {
    var d = new Date();
    var hours = (d.getHours()-8)*6;
	var minutes = Math.floor(d.getMinutes()/10);
    return hours+minutes;
}

function HplusM_to_12hr(i) {
	var outputString = "";
	
	// don't change to 12 hour until at least 1pm
	if (i<30) { outputString+=(Math.floor(i/6)+8)+":"+i%6+"0"; }
	else { outputString+=(Math.floor(i/6)+8)%12+":"+i%6+"0"; }
	
	if (i<=23) { outputString+=" am"; }
	else { outputString+=" pm"; }
	
	return outputString;
}

function UrlExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404;
}

function collectInfo() {
    var building = $("#buildings option:selected").val();
    localStorage.setItem("storedBuilding", building);

	var roomNumber =  document.getElementById('room').value;
	var dayOfWeek =  document.getElementById('dayOfWeek').value;
	var urlFull = "schedules/"+building+"_"+roomNumber+".json";
	var roomSchedule;
	
	var curr_dayOfWeek = getDayofWeek();
	var curr_hourMin = getHourPlusMinutes();
	
	// hide keyboard on mobile
	document.activeElement.blur();
	$("#displayOpenTimes").slideUp();
	$("#displayStatus").slideUp();
	$("#displayTimes").slideUp();

	// show currently open rooms in building
	if (roomNumber == "" && curr_hourMin >=3 && curr_hourMin <84 && curr_dayOfWeek!="S") {
		urlFull = "open_times/"+building+".json";
	
		$.getJSON(urlFull, function(data) {
			var outputString = "";

			outputString+="<ul>";
			for (var i in data) {
				// if a room in the building is open for current day of week and hour
				if (data[i][curr_dayOfWeek][curr_hourMin]==0) { 
					outputString+="<li><strong>";
					outputString+="<a href=\"javascript:showRm('"+data[i].roomNumber+"','"+curr_dayOfWeek+"')\">";
					outputString+=building+" "+data[i].roomNumber;
					outputString+="</a></strong>: now - "; 
					
					var j = curr_hourMin;
					var foundOccupiedTime=0;
					
					while (!foundOccupiedTime) {
						j++;
						
						if (j==84) { 
							foundOccupiedTime=1;
							outputString+="building closes</li>"; 	
						}
						
						else if (data[i][curr_dayOfWeek][j]==1) {
							foundOccupiedTime=1;
							outputString+=HplusM_to_12hr(j);
							outputString+="</li>";
						}
					}
				}
			}
			
			outputString+="</ul>";
			outputString+="<i>Rooms are built off of a list of rooms that sections of classes are held in and may not always be accessible.</i>"
			document.getElementById("displayStatus").innerHTML="<strong>Rooms with no classes scheduled:</strong>";
			document.getElementById("displayTimes").innerHTML=outputString;
			
			$("#displayStatus").slideDown(800);
			$("#displayTimes").slideDown(800);
		});
	}
	
	else if (roomNumber == "") {
		urlFull = "open_times/"+building+".json";
		
		$.getJSON(urlFull, function(data) {
			var outputString = "";

			// output all rooms used as classrooms
			outputString+="<ul>";
			for (var i in data) {
				outputString+="<li><strong>";
				outputString+="<a href=\"javascript:showRm('"+data[i].roomNumber+"','"+curr_dayOfWeek+"')\">";
				outputString+=building+" "+data[i].roomNumber;
				outputString+="</a></strong></li>";
			}
			
			outputString+="</ul>";
			outputString+="<i>Rooms are built off of a list of rooms that sections of classes are held in and may not always be accessible.</i>"
			document.getElementById("displayTimes").innerHTML=outputString;
			document.getElementById("displayStatus").innerHTML="<strong>Building has no classes scheduled at this time, these rooms may be available:</strong>";
			
			$("#displayStatus").slideDown(800);
			$("#displayTimes").slideDown(800);
		});
	}
	
	// process the room schedule if the room exists
	else if (UrlExists(urlFull)) {
		$.getJSON(urlFull, function(data) {
			roomSchedule = data.data;
			
			document.getElementById("displayStatus").innerHTML="<strong>Room has classes scheduled:</strong>";
			var output = [];
			var timeArray = [];
			var showCoursesChk = document.getElementById('showCourses');
			var showDaysChk = document.getElementById('showDays');
			var showInstrChk = document.getElementById('showInstr');
			var showEnrollChk = document.getElementById('showEnroll');
			
			// only keep track of time in 10 minute intervals from 8:00-22:00
			for (var i=0; i<=85; i++) { timeArray[i]=0; }
			
			for (var i in data.data) {
				var whichDays = data.data[i].weekdays;
				var startTime = data.data[i].start_time;
				var endTime = data.data[i].end_time;
				var courseSub = data.data[i].subject;
				var courseNum = data.data[i].catalog_number;
				var courseSec = data.data[i].section;
				var courseTitle = data.data[i].title;
				var courseInstr = data.data[i].instructors;
				var courseEnroll = data.data[i].enrollment_total;
				var outputStr = "";

				if (whichDays.indexOf(dayOfWeek) > -1) {
					if (dayOfWeek=="T" && whichDays!="Th"){
						outputStr+="<li>" + startTime+" - "+endTime+" "+courseSub+" "+courseNum+" "+courseSec;
						if (showDaysChk.checked) { outputStr+=" "+whichDays; }
						if (showCoursesChk.checked) { outputStr+=" - "+courseTitle; }
						if (showInstrChk.checked) { outputStr+=" - "+courseInstr; }
						if (showEnrollChk.checked) { outputStr+=" - Enrollment: "+courseEnroll; }
						outputStr+="</li>";
						output.push(outputStr);
						
						// calculate times
						var startTimeInt = (startTime.split(":")[0]-8)*6+(startTime.split(":")[1]/10);
						var endTimeInt = (endTime.split(":")[0]-8)*6+(endTime.split(":")[1]/10);
						
						// set the time array to occupied
						for (var i=startTimeInt; i<endTimeInt; i++) { timeArray[i]=1; }
					}

					else if (dayOfWeek!="T"){
						outputStr+="<li>" + startTime+" - "+endTime+" "+courseSub+" "+courseNum+" "+courseSec;
						if (showDaysChk.checked) { outputStr+=" "+whichDays; }
						if (showCoursesChk.checked) { outputStr+=" - "+courseTitle; }
						if (showInstrChk.checked) { outputStr+=" - "+courseInstr; }
						if (showEnrollChk.checked) { outputStr+=" - Enrollment: "+courseEnroll; }
						outputStr+="</li>";
						output.push(outputStr);
						
						// calculate times
						var startTimeInt = (startTime.split(":")[0]-8)*6+(startTime.split(":")[1]/10);
						var endTimeInt = (endTime.split(":")[0]-8)*6+(endTime.split(":")[1]/10);
						
						// set the time array to occupied
						for (var i=startTimeInt; i<endTimeInt; i++) { timeArray[i]=1; }
					}
				}
			}
			
			// sort the output in terms of time, input is unordered
			output.sort();
			var outputString = "";
			outputString+="<ul>";
			for (var i in output) {
				outputString+=output[i];
			}
			outputString+="</ul>";
			outputString+="<strong><a href=\"javascript:showRm('','')\">";
			outputString+="Search for empty rooms</a></strong>"; 
			document.getElementById("displayTimes").innerHTML=outputString;
			
			// output open times
			outputString = "<strong>No classes scheduled for: </strong>";
			outputString+="<ul>";
			var lastTimeOccupied=0;
			
			for (var i=3; i<84; i++) {
				if (timeArray[i]==0 && timeArray[i+1]==0 && lastTimeOccupied==0) {
					outputString+="<li>";
					outputString+=HplusM_to_12hr(i);
					outputString+=" - "
					lastTimeOccupied=1;
				}
				else if (timeArray[i]==1 && lastTimeOccupied==1) {
					outputString+=HplusM_to_12hr(i);
					outputString+="</li>";
					lastTimeOccupied=0;
				}
			}
			outputString+="building closes</li>"
			outputString+="</ul>";
			document.getElementById("displayOpenTimes").innerHTML=outputString;
			
			$("#displayOpenTimes").slideDown(800);
			$("#displayStatus").slideDown(800);
			$("#displayTimes").slideDown(800);
		});
	}

	else {
		// if input returns no information
		document.getElementById("displayStatus").innerHTML="<strong>Room selected has no classes scheduled or does not exist.<br><a href=\"javascript:showRm('','')\">Search for empty rooms</a></strong>";
		$("#displayStatus").slideDown(800);
	}
}

function showRm(rmNum, day) {
	if (rmNum=="") {document.getElementById('room').value="";}
	else {
		document.getElementById('room').value=rmNum;
		document.getElementById('dayOfWeek').value=day;
	}
	
	collectInfo();
}

$( "#buildings" ).change(function() {
	showRm('','');
});
