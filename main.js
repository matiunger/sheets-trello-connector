// Sheets config
var ss = SpreadsheetApp.getActiveSpreadsheet();
var sheet = ss.getSheetByName("tareas");
var tasks = sheet.getDataRange().getValues();

// Trello config
var key = "[KEY]";
var secret = "[SECRET]";
var token = "[TOKEN]"
var user = "[USER]"
var board = "[BOARD]" // Destination board name
var list = "[LIST]" // Destination list name

//Mail config
var email = "[EMAIL]"

// Loop through tasks
function checkTasks() {
  var today = new Date();
  for(var i=3; i<tasks.length; i++) {
    var state = tasks[i][0];    
    var taskname = tasks[i][1];
    var frecuencia = tasks[i][3];
    var ultimavez = tasks[i][4];
    var proximavez = tasks[i][5];    
    if (state && compareDates(today, proximavez)) {
      task2trello(taskname) // Send this taks to Trello
      updateDates(frecuencia, proximavez, i) // Update dates in Sheets
      //sendMail(tarea)
    }
  }
}

function updateDates(frequency, nexttime, row) {
  var newprox = new Date(nexttime.getTime()+frequency*3600000*24);
  sheet.getRange(row+1, 5).setValue(nexttime);
  sheet.getRange(row+1, 6).setValue(newprox);
}

function sendMail(tarea) {
  var subject = "[New tasks] "+tarea;
  var message = "Do this ASAP:";
  MailApp.sendEmail(email, subject, message);
}

function editDoDate(e) {
    var activeSheet = e.source.getActiveSheet();
    var col = parseInt(e.range.getColumn());
    var row = parseInt(e.range.getRow());
    if (col == "5") {
      var newprox = new Date(tasks[row-1][4].getTime()+tasks[row-1][3]*3600000*24);
      sheet.getRange(row-1+1, 6).setValue(newprox);
      //Logger.log(tasks[row-1][4])
    }  
}


function compareDates(date1, date2){
  var d1 = date1.getDate();
  var m1 = date1.getMonth();
  var y1 = date1.getFullYear();
  var d2 = date2.getDate();
  var m2 = date2.getMonth();
  var y2 = date2.getFullYear();
  return (d1 == d2 && m1 == m2 && y1 == y2);
}

// Create payload and start request
function task2trello (tarea) { 
  var data = {
    'name': tarea,
    'idList': t_getListId (user, board, list),
    //'desc': 'Do this ASAP',
    //'due': '2020-02-01',
    //'idMembers': user,
    'idLabels': '58e1add1ced82109ff032717',
    'key': key,
    'token': token
  };
  t_createCard (data)
}


// Input: username, boardname
// Output: boardId       
function t_getBoardId (username, boardName) {
        var response = UrlFetchApp.fetch('https://api.trello.com/1/members/'+username+'/boards?key='+key+'&token='+token);
        var boards = JSON.parse(response.getContentText());
        for (var i=0 ; i < boards.length; i++) {
          if (boards[i]["name"] == boardName) {
            return boards[i]["id"]
          }
       }
}

// Input: username, boardname and listName
// Output: listId
function t_getListId (username, boardName, listName) {
  var boardId = t_getBoardId (username, boardName)  ; 
  var response = UrlFetchApp.fetch('https://api.trello.com/1/boards/'+boardId+'/lists?key='+key+'&token='+token);
        var listas = JSON.parse(response.getContentText());
        for (var i=0 ; i < listas.length; i++) {
          if (listas[i]["name"] == listName) {
            return listas[i]["id"]
          }
       }
}

// Create card in Trello
function t_createCard (data) {
  // Make a POST request with a JSON payload.
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    // Convert the JavaScript object to a JSON string.
    'payload' : JSON.stringify(data)
  };
  UrlFetchApp.fetch('https://api.trello.com/1/cards', options);
}  