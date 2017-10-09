document.getElementById("searchbutton").addEventListener("click", function(){
	if(!document.getElementById("steamID").value){
		return null;
	}

	if($("#error").is(":visible")){ $("#error").animate({height:"toggle"},300);}

	$("#steamID").animate({width:"toggle"},300);
	$("#searchbutton").animate({width:"toggle"},300).delay(300).queue(function(){
		$("#updatebutton").animate({width:"toggle", display:"inline-flex"},300);
		$("#newSearch").stop(true, true).animate({width:"toggle", display:"inline-flex"},300);
	});
	var columns = $('.column');
	columnCleaner(columns, 500, function(){
		$("#spinner").fadeIn(500);

		time = parseTimeInput(document.getElementById("time").value, document.getElementById("unit").textContent);

		httpGetAsync('/user/' + document.getElementById("steamID").value, function(response){
			try{
				var json = JSON.parse(response);
			}
			catch(err){
				return errorHandler("Error: bad request");
			}
			if(json.err){
				return errorHandler("Error: " + json.err);
			}
			if(!document.getElementById("faCSS")){
				var head = document.getElementsByTagName("head")[0];
				var link = document.createElement('link');
				link.id = "faCSS";
				link.setAttribute("href", "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css");
				link.setAttribute("rel", "stylesheet");
				link.setAttribute("integrity", "sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN");
				link.setAttribute("crossorigin", "anonymous");
				head.appendChild(link);
			}
			var games = json.games;
			var counter = 0;
			$("#spinner").fadeOut(500, function(){
				for(i = 0; i<games.length; i++){
					var div = document.createElement("div");
					div.className += "game-wrapper";
					div.setAttribute("playtime", json.games[i].playtime_forever);

					var a = document.createElement("a");
					a.href = "steam://run/" + json.games[i].appid;

					var img = document.createElement("img");
					img.src = "http://cdn.akamai.steamstatic.com/steam/apps/" + json.games[i].appid + "/header.jpg";
					img.alt = json.games[i].name + " header image";
					img.onerror = function(){this.onerror=null;this.src=`http://www.playitems.com/img/game/steam.jpg`;};

					a.appendChild(img);
					div.appendChild(a);

					var titlediv = document.createElement("div");
					titlediv.className += "game-text game-title";
					var titlep = document.createElement("p");
					var name = document.createTextNode(json.games[i].name);
					titlep.appendChild(name);
					titlediv.appendChild(titlep);
					div.appendChild(titlediv);

					var timediv = document.createElement("div");
					timediv.className += "game-text game-time";
					var timep = document.createElement("p");
					var timeplayed = document.createTextNode(parseTimeLong(json.games[i].playtime_forever));
					timep.appendChild(timeplayed);
					timediv.appendChild(timep);
					div.appendChild(timediv);

					var clockdiv = document.createElement("div");
					clockdiv.className += "game-text game-time game-time-clock";
					var clockp = document.createElement("p");
					var clocktime = document.createTextNode(parseTimeClock(json.games[i].playtime_forever) + " ");
					clockp.appendChild(clocktime);
					var clockicon = document.createElement("i");
					clockicon.className += "fa fa-clock-o";
					clockicon.setAttribute("aria-hidden", "true");
					clockp.appendChild(clockicon);
					clockdiv.appendChild(clockp);
					div.appendChild(clockdiv);

					if(json.games[i].playtime_forever < time){
						columns[counter%columns.length].appendChild(div);
						counter++;
					}

				}
			})

		});
	})
});

document.getElementById("newSearch").addEventListener("click", function(){
	if($("#error").is(":visible")){ $("#error").animate({height:"toggle"},300);}
	$("#updatebutton").animate({width:"toggle"},300);
	$("#newSearch").animate({width:"toggle"},300).delay(300).queue(function(){
		$("#steamID").animate({width:"toggle", display:"inline-flex"},300);
		$("#searchbutton").stop(true, true).animate({width:"toggle", display:"inline-flex"},300);
	});
});

document.getElementById("updatebutton").addEventListener("click", function(){
	if($("#error").is(":visible")){ $("#error").animate({height:"toggle"},300);}
	var columns = $('.column');
	time = parseTimeInput(document.getElementById("time").value, document.getElementById("unit").textContent);
	$(columns[0]).parent().fadeOut(500, function(){
		$("#spinner").fadeIn(500,function(){
			var games = $(".game-wrapper");
			games.detach();
			$(columns[0]).parent().fadeIn(1, function(){
				var counter = 0;
				$("#spinner").fadeOut(500,function(){
					for(i = 0; i<games.length; i++){
						if($(games[i]).attr("playtime") < time){
							columns[counter%columns.length].appendChild(games[i]);
							counter++;
						}
					}
				});
			})
		});

	})
});

document.getElementById("unit").addEventListener("click", function(){
	var unit = document.getElementById("unit").textContent;
	if(unit=="Hours"){
		document.getElementById("unit").textContent = "Minutes";
	}else{
		document.getElementById("unit").textContent = "Hours";
	}
});

$("#brand").mouseenter("mouseover", function(){
	if(!document.getElementById("faCSS")){
		var head = document.getElementsByTagName("head")[0];
		var link = document.createElement('link');
		link.id = "faCSS";
		link.setAttribute("href", "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css");
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("integrity", "sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN");
		link.setAttribute("crossorigin", "anonymous");
		head.appendChild(link);
	}

	if($("#menu").not(":visible")){
		if($("#menu:animated").length>0){
			$("#menu").stop().animate({width:"toggle", display:"inline-flex"},500);
		}else{
			$("#menu").animate({width:"toggle", display:"inline-flex"},500);
		}
	}
});

$("#brand").mouseleave("mouseout", function(){
	if($("#menu").is(":visible")){
		if($("#menu:animated").length>0){
			$("#menu").stop().animate({width:"toggle"},500);
		}else{
			$("#menu").animate({width:"toggle"},500);
		}
	}
});

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
}

function parseTimeLong(time){
	if(time > 120){
		return Math.round(time/60) + " hours played";
	}else if(time == 0){
		return "Not played";
	}else if(time == 1){
		return time + " minute played";
	}else{
		return time + " minutes played";
	}
}

function parseTimeClock(time){
	if(time > 120){
		return Math.round(time/60) + "H";
	}else if(time == 0){
		return "-";
	}else{
		return time + "M";
	}
}

function parseTimeInput(number, unit){
	if(unit=="Hours"){
		number *= 60;
	}
	return number;
}

function columnCleaner(columns, timing, callback){
	var dirty = false;
	for(i = 0; i<columns.length; i++){
		if(columns[i].innerHTML){
			dirty = true;
		}
	}
	if(dirty){
		$(columns[0]).parent().fadeOut(timing, function(){
			$(".game-wrapper").remove();
			$(columns[0]).parent().fadeIn(1, function(){
				callback();
			})
		})
	}else{
		$(".game-wrapper").remove();
		callback();
	}
}

function errorHandler(error){
	var spinner = $("#spinner");
	if(spinner.is(":visible")){
		spinner.fadeOut(500);
	}
	var errorbox = $("#error");
	if(errorbox.is(":visible")){
		errorbox.animate({height:"toggle"},300,function(){
			errorbox.html(error);
			return errorbox.animate({height:"toggle"},300);
		})
	}else{
		errorbox.html(error);
		return errorbox.animate({height:"toggle"},300);
	}
}
