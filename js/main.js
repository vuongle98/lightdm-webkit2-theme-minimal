let current_session = "greeter:config:session";
let blank_session = "select desktop:";

function get_date_time() {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  var now = new Date();
  var year = now.getFullYear();
  var month = monthNames[now.getMonth()];
  var day = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();

  if (day.toString().length == 1) {
    day = "0" + day;
  }
  if (hour.toString().length == 1) {
    hour = "0" + hour;
  }
  if (minute.toString().length == 1) {
    minute = "0" + minute;
  }
  if (second.toString().length == 1) {
    second = "0" + second;
  }

  return (
    day + " " + month + " " + year + ", " + hour + ":" + minute + ":" + second
  );
}

function clear_messages() {
  let messages = document.getElementById("messages");
  messages.innerHTML = "";
  messages.style.visibility = "hidden";
}

function init_session_menu() {
  var x, i, j, l, ll, selElmnt, a, b, c;
  x = document.getElementsByClassName("custom-select");
  l = x.length;
  for (i = 0; i < l; i++) {
    selElmnt = x[i].getElementsByTagName("select")[0];
    ll = selElmnt.length;
    a = document.createElement("DIV");
    a.setAttribute("class", "select-selected");
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    x[i].appendChild(a);
    b = document.createElement("DIV");
    b.setAttribute("class", "select-items select-hide");
    for (j = 1; j < ll; j++) {
      c = document.createElement("DIV");
      c.innerHTML = selElmnt.options[j].innerHTML;
      c.addEventListener("click", function (e) {
        var y, i, k, s, h, sl, yl;
        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        sl = s.length;
        h = this.parentNode.previousSibling;
        for (i = 0; i < sl; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = this.innerHTML;
            y = this.parentNode.getElementsByClassName("same-as-selected");
            yl = y.length;
            for (k = 0; k < yl; k++) {
              y[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }
        h.click();
        update_current_session();
      });
      b.appendChild(c);
    }
    x[i].appendChild(b);
    a.addEventListener("click", function (e) {
      e.stopPropagation();
      close_all_select(this);
      this.nextSibling.classList.toggle("select-hide");
      this.classList.toggle("select-arrow-active");
    });
  }
}

function close_all_select(elmnt) {
  var x,
    y,
    i,
    xl,
    yl,
    arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i);
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

function add_session_options() {
  session_names = [];
  max_session_name_len = 0;
  session_menu = document.getElementById("session-menu");

  if (window.lightdm !== undefined && lightdm.sessions !== undefined) {
    var i;
    for (i = 0; i < lightdm.sessions.length; i++) {
      session_names.push(lightdm.sessions[i].name);
    }
  } else {
    show_message(
      "Unable to get the list of available sessions / desktop enviroments",
      "error"
    );
  }

  if (
    localStorage.getItem(current_session) !== null &&
    session_names.includes(localStorage.getItem(current_session))
  ) {
    session_menu.innerHTML = `<option value="0">${localStorage.getItem(
      current_session
    )}</option>`;
    max_session_name_len = localStorage.getItem(current_session).length;
  } else {
    session_menu.innerHTML = `<option value="0" id="session-blank">${blank_session}</option>`;
    max_session_name_len = blank_session.length;
  }

  for (session_num in session_names) {
    session_name = session_names[session_num];
    session_menu.innerHTML += `<option value="${
      session_num + 1
    }">${session_name}</option>`;
    if (session_name.length > max_session_name_len) {
      max_session_name_len = session_name.length;
    }
  }
  font_size =
    (parseFloat(
      window
        .getComputedStyle(document.getElementById("main_nav"), null)
        .getPropertyValue("font-size")
    ) *
      3) /
    4;
  session_menu_width = font_size * max_session_name_len;
  document.getElementById("custom-select-div").style.width =
    session_menu_width + "px";
}

function update_current_session() {
  console.log("Trying to update current session");
  selected_session =
    document.getElementsByClassName("select-selected")[0].textContent;
  if (selected_session !== blank_session) {
    console.log("Updating current session");
    localStorage.setItem(current_session, selected_session);
  }
}

window.show_prompt = function (text, type) {
  password = document.getElementById("password");
  if (type === "password") {
    lightdm.respond(password.value);
  }
};

function show_message(text, type = "error") {
  const container = document.getElementById("message-container");

  const message = document.createElement("div");
  message.className = `message-card ${type}`;

  // Create text node and close button
  const messageText = document.createTextNode(text);
  const closeBtn = document.createElement("span");
  closeBtn.className = "close-btn";
  closeBtn.innerHTML = "✖";

  // Remove message on click
  closeBtn.addEventListener("click", () => {
    message.remove();
  });

  message.appendChild(messageText);
  message.appendChild(closeBtn);
  container.appendChild(message);

  // Auto remove after 4 seconds
  setTimeout(() => {
    message.remove();
  }, 31000);
}

window.authentication_complete = function () {
  if (
    lightdm.is_authenticated &&
    localStorage.getItem(current_session) !== null &&
    lightdm.sessions !== undefined
  ) {
    choosen_session = null;
    for (i = 0; i < lightdm.sessions.length; i++) {
      if (lightdm.sessions[i].name === localStorage.getItem(current_session)) {
        choosen_session = lightdm.sessions[i];
      }
    }
    lightdm.start_session_sync(choosen_session.key);
  } else {
    show_message("Authentication Failed", "error");
  }
};

window.start_authentication = function (username) {
  clear_messages();
  lightdm.authenticate(username);
};

window.handle_input = function (e) {
  if (e !== undefined) e.preventDefault();

  let username = document.getElementById("username");
  const loginButton = document.querySelector("#submit-button");

  if (localStorage.getItem(current_session) === null) {
    show_message("Choose a proper session/desktop enviroment", "error");
    return;
  }

  loginButton.disabled = true;
  loginButton.classList.add("loading");
  loginButton.textContent = "Logging in...";

  start_authentication(username.value);
};

// Check Caps Lock state on key events
window.handleCapsLock = function (e) {
  const capsTag = document.getElementById("caps-lock-indicator");
  const isCaps = e.getModifierState && e.getModifierState("CapsLock");
  capsTag.style.display = isCaps ? "inline" : "none";
};

document.addEventListener("click", close_all_select);

document.addEventListener("DOMContentLoaded", function () {
  time = document.getElementById("time");
  setInterval(() => {
    time.innerHTML = get_date_time();
  }, 1000);
  document.getElementById("time").innerHTML = get_date_time();

  if (window.lightdm !== undefined && lightdm.hostname !== undefined) {
    document.getElementById("pagetitle").innerText = lightdm.hostname;
  }

  if (window.lightdm !== undefined && lightdm.users.length === 1) {
    document.getElementById("username").value = lightdm.users[0].username;
    document.getElementById("password").focus();
  }

  add_session_options();
  init_session_menu();
});
