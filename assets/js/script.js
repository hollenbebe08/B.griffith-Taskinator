var taskIdCounter= 0;

var formEl = document.querySelector("#task-form");
var tasksToDoEl= document.querySelector("#tasks-to-do");
var tasksInProgressEl= document.querySelector("#tasks-in-progress");
var tasksCompletedEl= document.querySelector("#tasks-completed");
var pageContentE1= document.querySelector("#page-content");

//create array to hold tasks for saving to localStorage
var tasks = [];

var taskFormHandler = function(event) {
    event.preventDefault();
    var taskNameInput= document.querySelector("input[name='task-name']").value;
    var taskTypeInput=document.querySelector("select[name='task-type']").value;

    //check if input values are empty strings
    if(!taskNameInput || !taskTypeInput) {
        alert("You need to fill out the task form by entering both a task name AND a task type!");
        return false;
    };

    formEl.reset();

    //reset form fields for next task to be entered
    document.querySelector("input[name='task-name'").value= "";
    document.querySelector("select[name='task-type']").selectIndex= 0;

    //to show that a task is being edited
    var isEdit= formEl.hasAttribute("data-task-id");

    //has data attribute, so get task id and call function to complete and edit process
    if(isEdit) {
        var taskId= formEl.getAttribute("data-task-id");
        completedEditTask(taskNameInput, taskTypeInput, taskId);
    }
    //no data attribute, so create object as normal and pass to createTaskEl function
    else {
        var taskDataObj= {
            name: taskNameInput,
            type: taskTypeInput,
            status: "to do",
        };
        createTaskEl (taskDataObj);
    }
};

//createTaskEl function to hold the code that creates a new task HTML element
var createTaskEl= function(taskDataObj) {
    //create list item
    var listItemEl= document.createElement("li");
    listItemEl.className= "task-item";

    //add task id as a custom attribute
    listItemEl.setAttribute("data-task-id", taskIdCounter);

    //create div to hold task info and add to list item
    var taskInfoEl=document.createElement("div");

    //give it a class name
    taskInfoEl.className= "task-info";

    //add HTML content to div
    taskInfoEl.innerHTML= "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";
 
    listItemEl.appendChild(taskInfoEl);

    var taskActionsEl= createTaskActions(taskIdCounter);
    listItemEl.appendChild(taskActionsEl);

    switch (taskDataObj.status) {
        case "to do":
            taskActionsEl.querySelector("select[name='status-change']").selectIndex= 0,
            tasksToDoEl.append(listItemEl);
            break;
        case "in progress":
            taskActionsEl.querySelector("select[name='status-change']").selectIndex= 1,
            tasksInProgressEl.append(listItemEl);
            break;
        case "completed":
            taskActionsEl.querySelector("select[name='status-change']").selectIndex= 2,
            tasksCompletedEl.append(listItemEl);
            break;
        default:
            console.log("something went wrong!");
    }

    // save task as an object with name, type, status, and id properties then push it into tasks array
    taskDataObj.id= taskIdCounter;
    tasks.push(taskDataObj);

    //save tasks to localStorage
    saveTasks();

    //increase task counter for next unique id
    taskIdCounter++;
};

//function to create task actions
var createTaskActions = function(taskId) {
    //create container to hold elements
    var actionContainerEl= document.createElement("div");
    actionContainerEl.className= "task-actions";

    //create edit button
    var editButtonEl=document.createElement("button");
    editButtonEl.textContent= "Edit";
    editButtonEl.className= "btn edit-btn";
    editButtonEl.setAttribute("data-task-id", taskId);
    actionContainerEl.appendChild(editButtonEl);

    //create delete button
    var deleteButtonEl= document.createElement("button");
    deleteButtonEl.textContent= "Delete";
    deleteButtonEl.className= "btn delete-btn";
    deleteButtonEl.setAttribute("data-task-id", taskId);
    actionContainerEl.appendChild(deleteButtonEl);

    //create change status dropdown
    var statusSelectEl= document.createElement("select");
    statusSelectEl.className= "select-status";
    statusSelectEl.setAttribute("name", "status-change");
    statusSelectEl.setAttribute("data-task-id", taskId);

    //create status options
    var statusChoices= ["To Do", "In Progress", "Completed"];

    for (var i=0; i < statusChoices.length; i++) {
        //create option element
        var statusOptionEl= document.createElement("option");
        statusOptionEl.setAttribute("value", statusChoices[i]);
        statusOptionEl.textContent= statusChoices[i];
  
        //append to select
        statusSelectEl.appendChild(statusOptionEl);
    };

    return actionContainerEl;
};

//function to completeEditTask
var completedEditTask= function(taskName, taskType, taskId) {
    //find the matching task list item
    var taskSelected= document.querySelector(".task-item[data-task-id='" + taskId + "']");

    //set new values
    taskSelected.querySelector("h3.task-name").textContent= taskName;
    taskSelected.querySelector("span.task-type").textContent= taskType;

    //loop through tasks array and task objects with new content
    for(var i=0; i<tasks.length; i++){
        if(tasks[i].id === parseInt(taskId)) {
            tasks[i].name = taskName;
            tasks[i].type = taskType;
        }
    };

    alert("Task Updated!");

    //remove data attribute from form
    formEl.removeAttribute("data-task-id");
    //update formEl button to go back to saying "Add Task" instead of "Edit Task"
    document.querySelector("#save-task").textContent= "Add Task";
    //saveTasks call to action
    saveTasks();
};

//Event handler for button clicks
var taskButtonHandler= function(event){
    //get target element from event
    var targetEl= event.target;

    //edit button was clicked
    if(targetEl.matches(".edit-btn")) {
        var taskId= targetEl.getAttribute("data-task-id");
        editTask(taskId);
    }
    //delete button was clicked
    else if(targetEl.matches(".delete-btn")) {
        var taskId= targetEl.getAttribute("data-task-id");
        deleteTask(taskId);
    }
};

//Event handler for status changes
var taskStatusChangeHandler= function(event){
    //get the task item's id
    var taskId= event.target.getAttribute("data-task-id");

    //find the parent task item element based on the id
    var taskSelected= document.querySelector(".task-item[data-task-id='" + taskId + "']");

    //get the currently selected option's value and convert to lowercase
    var statusValue= event.target.value.toLowerCase();


    if(statusValue === "to do") {
        tasksToDoEl.appendChild(taskSelected);
    }
    else if (statusValue === "in progress") {
        tasksInProgressEl.appendChild(taskSelected);
    }
    else if (statusValue === "completed") {
        tasksCompletedEl.appendChild(taskSelected);
    };

    //update task's in tasks array
    for(var i=0; i < tasks.length; i++) {
        if(tasks[i].id === parseInt(taskId)) {
            tasks[i].status = statusValue;
        }
    }

    //call to saveTasks function
    saveTasks();
};

//edit task function
var editTask= function(taskId) {

    //get task list item element
    var taskSelected= document.querySelector(".task-item[data-task-id='" + taskId + "']");

    //get content from task name and type
    var taskName= taskSelected.querySelector("h3.task-name").textContent;

    var taskType= taskSelected.querySelector("span.task-type").textContent;

    //write value of taskname and tasktype to form to be edited
    document.querySelector("input[name='task-name']").value= taskName;
    document.querySelector("select[name='task-type']").value= taskType;

    //to show user that the task is being edited
    formEl.setAttribute("data-task-id", taskId);
    document.querySelector("#save-task").textContent= "Save Task";
};

//delete Task function
var deleteTask= function(taskId) {
    var taskSelected= document.querySelector(".task-item[data-task-id='" + taskId + "']");
    taskSelected.remove();

    //create new array to hold updated list of tasks
    var updatedTaskArr = [];

    //loop through current tasks
    for(var i=0; i<tasks.length; i++) {
        //if tasks[i].id doesn't match the value of taskId, let's keep that task and push it into the new array
        if(tasks[i].id !== parseInt(taskId)) {
            updatedTaskArr.push(tasks[i]);
        }
    }

    //reassign tasks array to be the same as updatedTaskArr
    tasks= updatedTaskArr;

    //call to saveTasks function
    saveTasks();
};

//Save Tasks function
var saveTasks= function() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
};

//load tasks function
var loadTasks = function() {
    //get task items from localStorage
    var savedTasks = localStorage.getItem("tasks");
    // if there are no tasks, set tasks to an empty array and return out of the function
    if(!savedTasks) {
    return false;
    }

    //parse into array of objects
    savedTasks=JSON.parse(savedTasks);
    
    //loop through savedTasks array
    for(var i=0; i < savedTasks.length; i++) {
        //pass each task object into the 'createTaskEl()' function
        createTaskEl(savedTasks[i]);
    }
};

//create a new task
formEl.addEventListener("submit", taskFormHandler);

//for edit and delete buttons
pageContentE1.addEventListener("click", taskButtonHandler);

//for changing the status
pageContentE1.addEventListener("change", taskStatusChangeHandler);

loadTasks();