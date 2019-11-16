var api_url = "https://api.jsonbin.io/b/5dcf457bad0335638b1187f2";
var secret_key = "$2b$10$/CieLe5LVOy6wHapnEfYiu33.OAAvNvEwEa/rrrRCIMG8GG9k1Csy";
var initial_click_color = "#A66077";

var switch_win = 0;
var switch_lose = 0;
var stay_win = 0;
var stay_lose = 0;

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

var reset_button = document.querySelector("#reset-button");
var message = document.querySelector("#message");
var win_message = "You win!";
var lose_message = "You lose.";
var initial_message = "Choose a door...";

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
function insertPercentage (parent_element, top_value, bottom_value, status_string) {
    if (bottom_value == 0 || isNaN(bottom_value)) {
        var fraction = 0;
    }
    else {
        var fraction = top_value/bottom_value; 
    }
    if ( fraction != 0 ) {
        parent_element.style.height = (80*(fraction)).toString() + '%';
    }
    parent_element.innerHTML = status_string + " percent: " + (Math.round(fraction*100)).toString() + "%";

}
function updateStats() {
    insertPercentage(document.querySelector('#current-bar-stay-win'), stay_win, stay_win+stay_lose, "Win");
    insertPercentage(document.querySelector('#current-bar-stay-lose'), stay_lose, stay_win+stay_lose, "Lose");
    insertPercentage(document.querySelector('#current-bar-switch-win'), switch_win, switch_win+switch_lose, "Win");
    insertPercentage(document.querySelector('#current-bar-switch-lose'), switch_lose, switch_win+switch_lose, "Lose");
}


function updateGraph() {
    fetch(api_url, {"headers" : { "secret-key" : secret_key }
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        var g_switch_win_count = data["switch_win_count"];
        var g_switch_lose_count = data["switch_lose_count"];
        var g_stay_win_count = data["stay_win_count"];
        var g_stay_lose_count = data["stay_lose_count"];
        var g_total_switch = g_switch_win_count + g_switch_lose_count;
        var g_total_stay = g_stay_win_count + g_stay_lose_count;
        insertPercentage(document.querySelector('#bar-stay-win'), g_stay_win_count, g_total_stay, "Win");
        insertPercentage(document.querySelector('#bar-stay-lose'), g_stay_lose_count, g_total_stay, "Lose");
        insertPercentage(document.querySelector('#bar-switch-win'), g_switch_win_count, g_total_switch, "Win");
        insertPercentage(document.querySelector('#bar-switch-lose'), g_switch_lose_count, g_total_switch, "Lose");
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
function postSession(increase_key) {
    fetch(api_url, { headers: {"secret-key": secret_key} 
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        data[increase_key] += 1;
        fetch(api_url, { method: 'PUT',
                         headers: { 'Content-Type': 'application/json',
                                    "versioning" : "false",
                                    "secret-key" : secret_key
                                   },
                         body: JSON.stringify(data)
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
                postSession("stay_win_count");
            }
            else {
                switch_win++;
                postSession("switch_win_count");
            }
        }
        else {
            message.innerHTML = lose_message;
            result = 'lose';
            if (initial_door_number == door_number) {
                stay_lose++;
                postSession("stay_lose_count");
            }
            else {
                switch_lose++;
                postSession("switch_lose_count");
            }
        }
        updateStats();
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
        num1.style.color = initial_click_color;
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
        num2.style.color = initial_click_color;
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
        num3.style.color = initial_click_color;
        reveal_alien(option1, option2, door1, door2);
        initial_click = false;
        initial_door_number = 3;
    }
};

function initializeGame() {
    updateGraph();
    updateStats();
    message.innerHTML = initial_message;
    reset_button.style.display = "none";
   
    end_game = false;
    initial_click = true;
    money_set = false;
    num_aliens = 0;
    
    for (var i = 0; i < doors.length; i++) {
        options[i].style.display = 'none';
        options[i].className = '';
        doors[i].classList.remove("door-open");
        nums[i].style.color = 'black';
    }
    fillDoors();
}
initializeGame();
