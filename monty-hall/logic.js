var api_url = "https://api.jsonbin.io/b/5dcb023889c6ec4147889637"
var secret_key = "$2b$10$/CieLe5LVOy6wHapnEfYiu33.OAAvNvEwEa/rrrRCIMG8GG9k1Csy"

var total_switch = 0;
var switch_win = 0;
var switch_lose = 0;
var total_stay = 0;
var stay_win = 0;
var stay_lose = 0;

session_outcome = {'switch' : "false", 'switch_win' : "false",
                  'switch_lose' : "false", 'stay' : "false",
                  'stay_win' : "false", 'stay_lose' : "false"}

var stay_win_percent = document.querySelector("#stay-win");
var stay_lose_percent = document.querySelector("#stay-lose");
var switch_win_percent = document.querySelector("#switch-win");
var switch_lose_percent = document.querySelector("#switch-lose");

var door1 = document.querySelector('#door1');
var door2 = document.querySelector('#door2');
var door3 = document.querySelector('#door3');
var doors = [door1, door2, door3];

var num1 = document.querySelector('#door1 div');
var num2 = document.querySelector('#door2 div');
var num3 = document.querySelector('#door3 div');
var nums = [num1, num2, num3];

var option1 = document.querySelector('#option1');
var option2 = document.querySelector('#option2');
var option3 = document.querySelector('#option3');
var options =[option1, option2, option3];

var bar_switch_win = document.querySelector('#bar-switch-win');
var bar_stay_win = document.querySelector('#bar-stay-win');
var bar_switch_lose = document.querySelector('#bar-switch-lose');
var bar_stay_lose = document.querySelector('#bar-stay-lose');


var reset_button = document.querySelector("#reset-button");
var message = document.querySelector("#message");
var win_message = "YOU WIN";
var lose_message = "YOU LOSE";
var initial_message = "CHOOSE A DOOR";


var money_set;
var num_aliens;
var initial_click;
var initial_door_number;
var end_game;
var result;

function randomClass() {
    var random_number = Math.floor(Math.random()*2);
    if (random_number == 1) {
        class_name = 'alien';
    }
    else {
        class_name = 'money';
    }
    return class_name
}
function setOption(option, class_name) {
    if (class_name == 'alien' && num_aliens != 2) {
        option.className = 'alien';
        num_aliens++;
    }
    if (class_name == 'money' && !money_set) {
        option.className = 'money';
        money_set = true;
    }
}
function fillDoors() {
    var class_name;
    while (option1.className == '') {
        class_name = randomClass();
        setOption(option1, class_name);
    }
    while (option2.className == '') {
        class_name = randomClass();
        setOption(option2, class_name);
    }
    while (option3.className == '') {
        class_name = randomClass();
        setOption(option3, class_name);
    }
}
function updateStats() {
    stay_win_percent.innerHTML = (Math.round((stay_win/total_stay)*1000)/10).toString();
    stay_lose_percent.innerHTML = (Math.round((stay_lose/total_stay)*1000)/10).toString();
    switch_win_percent.innerHTML = (Math.round((switch_win/total_switch)*1000)/10).toString();
    switch_lose_percent.innerHTML = (Math.round((switch_lose/total_switch)*1000)/10).toString();
}
function insertPercentage (parent_element, top_value, bottom_value, status_string) {
    parent_element.style.height = (100*(top_value/bottom_value)).toString() + '%';
    parent_element.innerHTML = "<p style='color:black; font-weight:bold;'>" + status_string + " percentage: " + (Math.round((top_value/bottom_value)*1000)/10).toString() + "%" + "</p>";

}

function updateGraph() {
    fetch(api_url, {"headers" : { "secret-key" : secret_key }
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        var entries = data["entries"];
        var total_switchS = 0;
        var switch_winS = 0;
        var switch_loseS = 0;
        var total_stayS = 0;
        var stay_winS = 0;
        var stay_loseS = 0;
        for (var i = 0; i < entries.length; i++) {
            if (entries[i]['stay'] == "true") {
                total_stayS += 1;
            }
            if (entries[i]['switch'] == "true") {
                total_switchS += 1;
            }
            if (entries[i]['stay_win'] == "true") {
                stay_winS += 1;
            }
            if (entries[i]['switch_win'] == "true") {
                switch_winS += 1;
            }
            if (entries[i]['stay_lose'] == "true") {
                stay_loseS += 1;
            }
            if (entries[i]['switch_lose'] == "true") {
                switch_loseS += 1;
            }
        }
        insertPercentage(bar_stay_win, stay_winS, total_stayS, "Win");
        insertPercentage(bar_stay_lose, stay_loseS, total_stayS, "Lose");
        insertPercentage(bar_switch_win, switch_winS, total_switchS, "Win");
        insertPercentage(bar_switch_lose, switch_loseS, total_switchS, "Lose");
    });
}
  
function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    else {
        var error = new Error(response.statusText);
        error.response = response.clone();
        throw error;
    }
}
function postSession() {
    fetch(api_url, { headers: {"secret-key": secret_key} 
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        data["entries"].push(session_outcome);
        data = JSON.stringify(data);
        fetch(api_url, { method: 'PUT',
                         headers: { 'Content-Type': 'application/json',
                                    'versioning' : 'false',
                                    "secret-key" : secret_key
                                   },
                         body: data
        }).then(checkStatus).catch(function(error) {
            console.log(error);	
        }).then(function() {
            updateGraph();
        });
    });
}

var reveal_alien = function(element1, element2, door_a, door_b) {
    var alien_found = false;
    if (element1.className == 'alien'){
        element1.style.display = 'block';
        door_a.classList.add("door-open");
        alien_found = true;
    }
    if (element2.className == 'alien' && !alien_found){
        element2.style.display = 'block';
        door_b.classList.add("door-open");
    }
};
var statusCheck = function(option, door_number) {
    if (!end_game) {
        if (option.className == 'money') {
            message.innerHTML = win_message;
            result = 'win';
            if (initial_door_number == door_number) {
                stay_win++;
                total_stay++;
                session_outcome['stay_win'] = "true";
                session_outcome['stay'] = "true";
            }
            else {
                switch_win++;
                total_switch++;
                session_outcome['switch_win'] = "true";
                session_outcome['switch'] = "true";
            }
        }
        else {
            message.innerHTML = lose_message;
            result = 'lose';
            if (initial_door_number == door_number) {
                stay_lose++;
                total_stay++;
                session_outcome['stay_lose'] = "true";
                session_outcome['stay'] = "true";
            }
            else {
                switch_lose++;
                total_switch++;
                session_outcome['switch_lose'] = "true";
                session_outcome['switch'] = "true";
            }
        }
        updateStats();
        postSession();
        updateGraph();
        reset_button.style.display = "inline";
        end_game = true;
    }
};

reset_button.onclick = initializeGame;

door1.onclick = function() {
    if (!initial_click) {
        door1.classList.add("door-open");
        option1.style.display = 'block';
        statusCheck(option1, 1);
    }
    if (initial_click) {
        num1.style.color = '#88090B';
        reveal_alien(option2, option3, door2, door3);
        initial_click = false;
        initial_door_number = 1;
    } 
};
door2.onclick = function() {
    if (!initial_click) {
        door2.classList.add("door-open");
        option2.style.display = 'block';
        statusCheck(option2, 2);
    }
    if (initial_click) {
        num2.style.color = '#88090B';
        reveal_alien(option1, option3, door1, door3);
        initial_click = false;
        initial_door_number = 2;
    }
};
door3.onclick = function() {
    if (!initial_click) {
        door3.classList.add("door-open");
        option3.style.display = 'block';
        statusCheck(option3, 3);
    }
    if (initial_click) {
        num3.style.color = '#88090B';
        reveal_alien(option1, option2, door1, door2);
        initial_click = false;
        initial_door_number = 3;
    }
};

function initializeGame() {
    message.innerHTML = initial_message;
    reset_button.style.display = "none";
    
    for (key in session_outcome) {
        session_outcome[key] = "false";
    }
    
    end_game = false;
    initial_click = true;
    money_set = false;
    num_aliens = 0;
    
    for (var i = 0; i < doors.length; i++) {
        options[i].style.display = 'none';
        options[i].className = '';
        options[i].style.backgroundImage = '';
        doors[i].classList.remove("door-open");
        nums[i].style.color = 'black';
    }
    fillDoors();
}
initializeGame();
updateGraph();
