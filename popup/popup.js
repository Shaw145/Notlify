const scheduleBtn = document.getElementById("scheduleBtn");
const modal = document.getElementById("scheduleModal");
const modalOverlay = document.getElementById("modalOverlay");
const save = document.querySelector(".bookmarkBtn");
const cancel = document.querySelector('.cancel');
const confirm = document.querySelector('.confirm');
let scheduledDate = document.querySelector('.scheduled-date');
let dateTime = document.getElementById("datetime");
let taskContent = document.getElementById("task-input");
let content = document.querySelector('.content');
let deleteTask = document.querySelector('.delete');
let deleteNode = document.querySelector('.delete i');
let selectedDate;
let selectedTime;




//To check changes of the input
dateTime.addEventListener('change', ()=>{

    const dateTimes = document.getElementById("datetime").value;
    const now = new Date();
    const selectedDateTime = new Date(dateTimes);

    if (selectedDateTime > now && dateTimes) {
        confirm.style.cursor = 'pointer';
        confirm.disabled = false;
    }
    else{
        confirm.style.cursor = 'not-allowed';
        confirm.disabled = true;
    }

})


// Open modal
scheduleBtn.addEventListener("click", () => {
    modal.classList.add("active");
    modalOverlay.classList.add("active");
});

// Close modal
function closeModal() {
    modal.classList.remove("active");
    modalOverlay.classList.remove("active");
    dateTime.value = "";
}


// Submit Schedule date and time
function scheduleDateTime() {

    const dateTimes = document.getElementById("datetime").value;

        // Assign to variables if needed
        [selectedDate, selectedTime] = SplitDateTime(dateTimes);
        dateTime = dateTimes;

        closeModal();

        //show scheduled date-time
        scheduledDate.classList.remove('hide');
        scheduledDate.style.color = 'ghostwhite';
        scheduledDate.innerText = `${selectedDate}, ${selectedTime}`;

}


function SplitDateTime(datetime){
    const [date, time] = datetime.split("T"); // Split value into date and time
    const [hours, minutes] = time.split(":").map(Number); // Extract hours and minutes as numbers

    // Determine AM/PM
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 0-23 hours to 1-12 format

    // Construct formatted time with AM/PM
    const formattedTime = `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;

    return [date, formattedTime];
}


//First Save the remainder in the local storage then displays it
function saveTask(){
    let dt = document.getElementById("datetime").value;
    let Actualtask = taskContent.value;

    //handling the input
    if(!dt || !Actualtask){
        showError();
    }

    else{
        scheduledDate.classList.add('hide');
        scheduledDate.innerText = "";


        SetData(Actualtask,dt);

        //After Saving Remove the inputs
        document.getElementById("datetime").value = "";
        taskContent.value = "";

    }

}


//Show Error
function showError(){
    scheduledDate.classList.remove('hide');
    scheduledDate.style.color = '#ff6262';
 
    const errormessage = scheduledDate.innerText;


    scheduledDate.innerText = "*Invalid Task/Schedule Time";


    // Hide the error message after 2 seconds and restore the previous message
    setTimeout(() => {
        scheduledDate.innerText = errormessage; // Restore the previous message
        console.log(scheduledDate.innerText)
        scheduledDate.style.color = 'ghostwhite';
        scheduledDate.style.display = "block"; // Ensure it's visible
    }, 2000); // 2000ms = 2 seconds

}


//Set the data to local storage
function SetData(task, dt){

    chrome.storage.local.get(['userTasks'], (res)=>{
        let userData = res.userTasks ?? [];

        const userDatas = [...userData, {'date' : selectedDate, 'time' : selectedTime, 'task' : task}];

        chrome.storage.local.set({"userTasks" : userDatas});
        display();
    })

    setTaskReminder(task,dt);

}


//For sending the notification
function setTaskReminder(task,dt){
    const now = new Date();
    const scheduledDate = new Date(dt);

    // Calculate the delay in minutes
    let timeDifference = scheduledDate - now; // in milliseconds

    // Ensure the delay is at least 30 seconds
    if (timeDifference < 30000) {
        timeDifference = 30000; // Set to 30 seconds minimum
    }

    // Convert to minutes
    let delayInMinutes = timeDifference / (1000 * 60);

 
    // Set the alarm
    // Create a unique alarm name using task details
     const alarmName = `taskReminder_${encodeURIComponent(task)}_${scheduledDate.getTime()}`;
    chrome.alarms.create(alarmName, { delayInMinutes });
}



//First get all the values from Local Storage, remove the expired tasks after 24 hours then Displays it
function display() {
    const now = new Date();

    chrome.storage.local.get(['userTasks'], (res) => {
        let userData = res.userTasks ?? [];

        // Filter tasks that are not expired for more than 24 hours
        const validTasks = userData.filter((task) => {
            const scheduledTime = new Date(task.date + ' ' + task.time).getTime(); // Parse task's date and time

            const expiryTime = scheduledTime + 24 * 60 * 60 * 1000; // 24 hours after scheduled time
            //const expiryTime = scheduledTime + 1 * 60 * 1000; // 1 min after scheduled time (for testing)
            
            return expiryTime > now; // Keep tasks within 24 hours of expiry
        });

        // Update the local storage with valid tasks
        chrome.storage.local.set({ userTasks: validTasks }, () => {
            console.log("Expired tasks removed.");
        });

        // Clear the UI and render the valid tasks
        content.innerHTML = ""; // Clear existing tasks
        validTasks.forEach((data) => {
            let newTask = document.createElement("div");
            newTask.classList.add('task');
            newTask.innerHTML = `
                <div class="dateTime">
                    <p class="date">${data.date}</p>
                    <p class="time">${data.time}</p>
                </div>
                <div class="fullTask">
                    <p class="mainTask">${data.task}</p>
                    <button class="delete">
                        <i class='bx bx-trash'></i>
                    </button>
                </div>
            `;
            // Add at the first position (Not working for now)
            //content.insertBefore(newTask, content.firstChild);

            //Add at last
            content.appendChild(newTask);
        });
    });
}


// To Completely clear the local storage. All items will be removed.
// chrome.storage.local.clear(() => {
//     console.log('Everything is removed');
// });


//To display all the remainders for the first time
display();



// Delete Remainder
// Function to delete a task
function deleteRemainder(event) {
    if (event.target.closest('.delete')) {
        const task = event.target.closest('.task'); // Get the task element
        if (task) {
            // Find the index of the task in the content
            const tasks = Array.from(content.children);
            const index = tasks.indexOf(task); // Identify task index

            if (index > -1) {
                // Remove the task from the DOM/UI
                task.remove();

                // Fetch and update local storage
                chrome.storage.local.get(['userTasks'], (res) => {
                    let storedTasks = res.userTasks ?? [];

                    if (index < storedTasks.length) {

                        const deletedTask = storedTasks[index];                       
                        // Construct the alarm name using the same encoding method
                        const alarmName = `taskReminder_${encodeURIComponent(deletedTask.task)}_${new Date(deletedTask.date + ' ' + deletedTask.time).getTime()}`;

                        // Remove the task from local storage
                        storedTasks.splice(index, 1);

                        // Clear the associated alarm
                        chrome.alarms.clear(alarmName, (wasCleared) => {
                            if (wasCleared) {
                                console.log(`Alarm ${alarmName} cleared.`);
                            } else {
                                console.log(`Failed to clear alarm ${alarmName}.`);
                            }
                        });

                        // Update the local storage with the modified array
                        chrome.storage.local.set({ userTasks: storedTasks }, () => {

                        });
                    }
                });
            }
        }
    }
}



// Event delegation: Listen for delete clicks on the #content div
content.addEventListener('click', deleteRemainder);




cancel.addEventListener("click", () => {
    closeModal();
});
confirm.addEventListener("click", () => {
    scheduleDateTime();
});

save.addEventListener('click', () =>{
    saveTask();
})
