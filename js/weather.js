/*************************************************************************************

Shoaib Khan
MAD9014
Weather Forecast widget

Notes: 
This widget uses the api and data from forecast.io.
The location hard-coded to the Algonquin College co-ordinates. This can be easily changed to detect location from gps data.


**************************************************************************************/


var live_data;

$(document).ready(init);

function init(){

	loadCSS();
	
	$.ajax({

		// Default plact - algonquin college, ottawa
		url: "https://api.forecast.io/forecast/0752ac2fead158066947a7994c293e81/45.3484,-75.7570",
		// some other place, for testing
		// url: "https://api.forecast.io/forecast/0752ac2fead158066947a7994c293e81/-0.3484,-69.7570",

		dataType: "jsonp",
		data: "units=ca&exclude=minutely,flags",
		data: "units=ca",
		crossDomain: true,
		xhrFields: {
			withCredentials: true
		}
	}).done( gotData ).fail( badStuff );
}

function gotData( data ){
	live_data = data;

	//set the background gradient according to the time of day. daytime blue, nighttime purple
	var backgroundColor = setBackground(live_data.currently.time);
	$("div.weather-forecast").append("<div class='weather-data'></div>");
	$("div.weather-data").append("<div class='location'></div>").css({
		background: backgroundColor
	});

	// create the Location Div
	var p1 = "<p class='location-name'><span style='color:rgb(143, 221, 143)'>A</span>lgonquin</p>";
	var p2 = "<p class='location-name'><span style='color:rgb(143, 221, 143)'>C</span>ollege</p>";
	var px = "<p class='location-city'>Ottawa</p>";
	var current_date = getDateString(live_data.currently.time);
	var current_hour = getHourString(live_data.currently.time);
	var p3 = "<p class='location-time'>" + current_date + "</p>";
	var p4 = "<p>" + current_hour + "</p>";
	$('div.location').append(p1, p2, px, p3, p4);

	// create the Summary Div
	var summary_text = live_data.currently.summary.toLowerCase();
	var summary_icon = "img/" + live_data.currently.icon + ".png";
	var $div_summary = $("<div class='summary'>" + 
		"<img src='" + summary_icon + "'class='summary-icon'>" + 
		"<p class='summary-text'>Currently: " + summary_text + "</p>" +
		"<p class='summary-text-today'>" + deleteLastPeriod(live_data.hourly.summary) + "</p>" + //the period at the end of the summary is annoying. 
		"</div>");

	$('div.weather-data').append($div_summary);

	// create Temperature Div
	var current_temp = Math.round(live_data.currently.temperature);
	var current_temp_feelslike = Math.round(live_data.currently.apparentTemperature);
	var p_feelslike;
	// if temperature and feels-like (apparent) temperature are the same, dont show the feels-like. Otherwise, show it.
	if(Math.abs(current_temp_feelslike - current_temp) < 1) {
		p_feelslike = "<p class='current-temp-feelslike'></p>";
	} else {
		p_feelslike = "<p class='current-temp-feelslike'>Feels like: " + current_temp_feelslike + "&deg;</p>";
	}

	$('div.weather-data').append("<div class='current-temp'>" + 
		"<p class='current-temp-big'>" + current_temp + "<span class='current-temp-big-deg'>&deg;</span></p>" +
		p_feelslike + 
		"</div>");

	// create the Table 
	$('div.weather-data').append("<div class='table-wrap'>" +
		"<table>" +
		createTableRow("th", "thead", "TIME", live_data.hourly.data, "time") +
		"<tbody>" +
		createTableRow("td", "tr", "Outlook", live_data.hourly.data, "icon") +
		createTableRow("td", "tr", "Summary", live_data.hourly.data, "summary") +
		createTableRow("td", "tr", "&deg;C", live_data.hourly.data, "temperature") +
		createTableRow("td", "tr", "Humidity", live_data.hourly.data, "humidity") +
		createTableRow("td", "tr", "Wind", live_data.hourly.data, "windSpeed") +
		createTableRow("td", "tr", "Cloud", live_data.hourly.data, "cloudCover") +
		"</tbody></table></div>"
		);

	$('div.weather-data').append("<footer>powered by <a href='http://forecast.io'>forecast.io</a></footer>");
}

/*********************************************
	Input: time_second - int - unix time
	returns: string in format like "Saturday Nov 3"
*********************************************/
function getDateString(time_second) {
	var time = new Date(time_second * 1000);
	var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
	var dateString = days[time.getDay()] + " " + months[time.getMonth()] + " " + time.getDate();
	//console.log(dateString);
	return dateString;
}

/*********************************************
	Input: time_second - int - unix time
	returns: Hour:Minute string in format like "3:03 pm"
*********************************************/
function getHourString(time_second) {
	var time = new Date(time_second * 1000);
	var hour = time.getHours();
	var minute = time.getMinutes();
	var minuteString = (minute < 10) ? ("0" + minute) : minute;
	var hourString = "";
	if(hour > 12) {
		hourString = hour - 12;
		hourString += ":" + minuteString +  " pm";
	} else if(hour < 12) {
		if(hour == 0) hour = 12;
		hourString += hour;
		hourString += ":" + minuteString + " am";
	} else {
		// special case for 12pm
		hourString = hour + ":" + minuteString + "pm";
	}
	return hourString;
}

/*********************************************
	Input: time_second - int - unix time
	returns: Hour string in format like "3 PM"
*********************************************/

function getHourStringWithoutMinute(time_second) {
	var time = new Date(time_second * 1000);
	var hour = time.getHours();
	var hourString = "";
	if(hour > 12) {
		hourString = hour - 12 + " PM";
	} else if (hour < 12) {
		if(hour == 0) hour = 12;
		hourString += hour;
		hourString += " AM";
	} else {
	//special case for 12pm	
		hourString = hour + " PM";
	}
	return hourString;
}

/*********************************************
	Input: time_second - int - unix time
	returns: background color gradient 

	The color depends on the time of the day. During 
	daytime, color will be blueish. during nighttime, color
	will be purpleish
*********************************************/

function setBackground(time_second) {
	var time = new Date(time_second * 1000);
	var hour = time.getHours();
	var backgroundColor;
	if(hour > 6 && hour < 18) {
		backgroundColor = "-webkit-linear-gradient(top, #0B3F73 0%, #009BE3 100%)";
	} else {
		backgroundColor = "-webkit-linear-gradient(top left, #332929 0%, #A64CA3 100%)";
	} 

	return backgroundColor;
}

function getTemperatureString(temperature) {
	return Math.round(temperature) + "&deg;";
}

function getWindSpeedString(windSpeed) {
	return Math.round(windSpeed) + " km/h";
}

function getHumidityString(humidity) {
	return Math.round(humidity * 100) + "%";
}

function getCloudCoverage(cloudCover) {
	return Math.round(cloudCover * 100) + "%";
}

/*********************************************
	Creates one row of the html data table 
	Input: 
	tag: td or th
	parentTag: thead or tr
	rowTitle: title of the row
	dataRow: hourly data obtained from the ajax call to forecast.io.
	field: the name of the parameter, e.g. {temperature: 12} => field = "temperature"
	returns: string in format like "3:03 pm"
*********************************************/

function createTableRow (tag, parentTag, rowTitle, dataRow, field){

	var row = "<" + parentTag + ">";
	row += "<" + tag + ">" + rowTitle + "</" + tag + ">";
	var datafield;

	for(var i = 1; i < dataRow.length; i++) {
		if (field === "temperature" || field ==="apparentTemperature") {
			datafield = getTemperatureString(dataRow[i][field]);
		} else if (field === "windSpeed") {
			datafield = getWindSpeedString(dataRow[i][field]);
		} else if (field === "humidity") {
			datafield = getHumidityString(dataRow[i][field]);
		} else if(field === "cloudCover") {
			datafield = getCloudCoverage(dataRow[i][field]);
		} else if(field === "time") {
			datafield = getHourStringWithoutMinute(dataRow[i][field]);
			// datafield = getHourString(dataRow[i][field]);
		} else if (field === "icon") {
			datafield = "<img src='img/" + dataRow[i][field] +".png'>";
		} else if (field === "summary") {
			datafield = dataRow[i][field].toLowerCase();
		} else {
			datafield = dataRow[i][field];
			console.log("Wrong data type!");
		}
		row += "<" + tag + ">" + datafield +  "</" + tag + ">";
		if (i == 24) break;
	}

	row += "</" + parentTag + ">";
	return row;
}

function badStuff(jqxhr, status, err){
	console.log("Something went wrong");
}

/*********************************************
	Input: string of sentence
	returns: the same string, less the trailing period, if any
*********************************************/
function deleteLastPeriod(str) {
	if(str[str.length - 1] === ".")str = str.slice(0, str.length - 1);
	return str;
}

function loadCSS() {
	// load the css and font files
	$('head').append('<link rel="stylesheet" href="css/style.css" type="text/css" />');
	$('head').append("<link href='http://fonts.googleapis.com/css?family=Droid+Sans' rel='stylesheet' type='text/css'>");
	$('head').append("<link href='http://fonts.googleapis.com/css?family=Josefin+Slab' rel='stylesheet' type='text/css'");
	$('head').append("<link href='http://fonts.googleapis.com/css?family=Antic+Slab' rel='stylesheet' type='text/css'>");
}

