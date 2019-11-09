var api_url = "https://afternoon-brushlands-28790.herokuapp.com/";

function hide(e) { e.style.display = "none"; }
function show(e) { e.style.display = "block"; }

var opaque_background = document.querySelector("#opaque-background");
var todo_interaction = document.querySelector("#todo-interaction");
var todo_list = document.querySelector("#todolist");
var incomplete_section = todo_list.querySelector("#incomplete");
var complete_section = todo_list.querySelector("#complete");
var submission_form = document.querySelector("#submission-form");
var completed_toggle = document.querySelector("#completed-toggle");
var log_reg_div = document.querySelector("#login-register");
var log_display_btn = document.querySelector("#log-display-btn");
var log_form = document.querySelector("#log-form");
var reg_display_btn = document.querySelector("#reg-display-btn");
var reg_form = document.querySelector("#reg-form");
var log_error = document.querySelector("#log-error");
var reg_error = document.querySelector("#reg-error");
var account_created = document.querySelector("#account-created");
var login_title = document.querySelector("#login-title");
var log_button = document.querySelector("#log-button");
var reg_button = document.querySelector("#reg-button");
var log_password_field = document.querySelector("#log-password");

log_display_btn.addEventListener("click", function() {
    log_error.innerHTML = "";
    clearAuthForms();
    hide(reg_form);
    show(log_form);
});
reg_display_btn.addEventListener("click", function() {
    hide(log_form);
    show(reg_form);
});
log_button.addEventListener("click", function() {
    createAuth("sessions");
    clearAuthForms();
});
reg_button.addEventListener("click", function() {
    createAuth("users");
    clearAuthForms();
});
log_password_field.addEventListener("keypress", function(event) {
    if (event.keyCode == 13) {
        log_button.click();
        clearAuthForms("sessions");
    }
});
completed_toggle.addEventListener("click", function() {
    var display = complete_section.style.display;
    if (display == "block") {
        complete_section.style.display = "none";
    }
    else {
        complete_section.style.display = "block";
    }
});

function displayAuth() {
    show(opaque_background);
    hide(reg_form);
    show(log_form);
    show(log_reg_div);
}
function hideAuth() {
    hide(opaque_background);
    hide(reg_form);
    hide(log_form);
    hide(log_reg_div);
}
function displayTODOList() {
    hide(opaque_background);
    hide(submission_form);
    show(todo_list);
    show(todo_interaction);
}

function displayDetails(todo) {
    show(opaque_background);
    show(submission_form);
    hide(todo_list);
    var input_fields = submission_form.getElementsByClassName("input");
    for (var i = 0; i < input_fields.length; i++) {
        var input_field = input_fields[i];
        var field_type = input_field.type;
        var field_id = input_field.name;
        if (field_type != "radio") {
        input_field.value = todo[field_id];  
        }
        else {
            if (todo[field_id] == input_field.value) {
                input_field.checked = true;
            }
        }
    }
}

function createTODOItem(todo) {
    var todo_item = document.createElement("div");
    var todo_title = document.createElement("div");
    var complete_button = document.createElement("div");
    var delete_button = document.createElement("div");
    var clear = document.createElement("div");
    var save_button = document.createElement("button");

    todo_item.className = "todo-item";
    todo_title.className = "todo-title";
    complete_button.className = "complete-button";
    delete_button.className = "delete-button";
    clear.className = "clear";
    
    complete_button.title = "Complete";
    delete_button.title = "Delete";

    todo_title.innerHTML = todo["short_description"];
    todo_title.addEventListener("click", function() {
        document.querySelector("#save-container").innerHTML = "";
        document.querySelector("#save-container").appendChild(save_button);
        displayDetails(todo);
    });

    todo_item.appendChild(complete_button);
    todo_item.appendChild(todo_title);
    todo_item.appendChild(delete_button);
    todo_item.appendChild(clear);

    if (todo["completion_status"] == "False") {
        incomplete_section.appendChild(todo_item);
    }
    else {
        complete_section.appendChild(todo_item);
        todo_item.removeChild(complete_button);
    }

    delete_button.addEventListener("click", function() {
        if (confirm("Please confirm item deletion.")) {
            deleteTODO(todo["rowid"]);
            todo_item.remove();
        }
    });

    complete_button.addEventListener("click", function() {
        var query_string = "completion_status=True";
        replaceTODO(todo["rowid"], query_string);            
    });

    save_button.id = "save-button";
    save_button.innerHTML = "Save";
    save_button.className = "input-button";
    save_button.addEventListener("click", function() {
        var encoded_string = grabFormValues();
        replaceTODO(todo["rowid"], encoded_string);
    });
}
function addTODOCreationSection() {
    var clear = document.createElement("div");
    clear.className = "clear";
    var creation_wrapper = document.createElement("div");
    creation_wrapper.id = "creation-wrapper";

    var create_button = document.createElement("div");
    create_button.id = "create-button";
    create_button.title = "Create";

    var title_input = document.createElement("div");
    title_input.id = "title-input";
    title_input.contentEditable = "true";

    create_button.addEventListener("click", function() {
        if (title_input.innerHTML) {
            createTODO(title_input.innerHTML);
        }
    });
    title_input.addEventListener("keypress", function(event) {
        if (event.keyCode == 13) {
            create_button.click();
        }
    });
    creation_wrapper.appendChild(create_button);
    creation_wrapper.appendChild(title_input);
    creation_wrapper.appendChild(clear);
    incomplete_section.appendChild(creation_wrapper);
}

function loadTODOList() {
    incomplete_section.innerHTML = "";
    complete_section.innerHTML = "";
    fetch(api_url+"todos", {credentials: 'include'
    }).then(function(response) {
        return response.json();
    }).then(function(todos) {
        todos["tasks"].forEach(function (todo) {
            createTODOItem(todo);
        });
        addTODOCreationSection();
        displayTODOList();
    });
}

function grabFormValues() {
    encoded_body = "";
    var input_fields = submission_form.getElementsByClassName("input");
    for (var i = 0; i < input_fields.length; i++) {
        var input_field = input_fields[i];
        var type = input_field.type;
        if (type != "radio") {
            var key = input_field.name;
            var value = input_field.value;
            if (value) {
                var encoded_pair = key + "=" + encodeURIComponent(value);
                encoded_body += encoded_pair + "&";
            }
        }
        else {
            if (input_field.checked) {
                var key = input_field.name;
                var value = input_field.value;
                if (value) {
                    var encoded_pair = key + "=" + encodeURIComponent(value);
                    encoded_body += (encoded_pair + "&");
                }
            }
        }
    }
    return encoded_body.slice(0,-1);
}

function retrieveTODO(ID) {
    fetch(api_url+"todos/" + ID.toString(), {credentials: 'include'
    }).then(function(response) {
        return response.json();
    });
}
function createTODO(title) {
    var default_todo = "short_description=" + title + "&completion_status=False";
    fetch(api_url+"todos", {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: default_todo
    }).then(function() {
        loadTODOList();
    });
}
function replaceTODO(ID, encoded_string) {
    fetch(api_url+"todos/" + ID.toString(), {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: encoded_string
    }).then(function() {
        loadTODOList();
    });
}
function deleteTODO(ID) {
    fetch(api_url+"todos/" + ID.toString(), {
        method: 'DELETE',
        credentials: 'include',
    });
}

function createAuth(userOrSession) {
    var query_string = getAuthQueryString(userOrSession);
    fetch(api_url + userOrSession, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: query_string
    }).then(function(response) {
        if (response.status == 401) {
            log_error.innerHTML = "Invalid email or password.";
        }
        else if (response.status == 422) {
            reg_error.innerHTML = "Email already taken.";
        } 
        else if (response.status == 201) {
            if (userOrSession == "sessions") {
                clearAuthForms();
                hideAuth();
                loadTODOList();
            }
            else {
                account_created.innerHTML = "Account created";
                login_title.innerHTML = "Please login";
                displayAuth();
            }
        }
        return response.json();
    });
}

function getAuthQueryString(userOrSession) {
    if (userOrSession == "users") {
        var input_list = reg_form.getElementsByTagName("input");
    }
    else {
        var input_list = log_form.getElementsByTagName("input");
    }
    var query_string = "";
    for (var i = 0; i < input_list.length; i++) {
        query_string += (input_list[i].name + "=" + input_list[i].value + "&");
    }
    return query_string.slice(0, -1);
}

function clearAuthForms() {
    var input_list = reg_form.getElementsByTagName("input");
    for (var i = 0; i < input_list.length; i++) {
        input_list[i].value = "";
    }
    input_list = log_form.getElementsByTagName("input");
    for (var i = 0; i < input_list.length; i++) {
        input_list[i].value = "";
    }
}

function onPageLoad() {
    fetch(api_url+"todos", {credentials: 'include'} ).then(function(response) {
        if (response.status == 200) {
            loadTODOList();
        }
        else {
            displayAuth();
        }
    })
}
onPageLoad();