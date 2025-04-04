let idGen = idGenerator()
let colors = {blue: 'hsl(230, 100%, 80%)',
green : 'hsl(110, 100%, 80%)',
yellow  : 'hsl(50, 100%, 80%)',
orange : 'hsl(15, 100%, 80%)',
red : 'hsl(0, 100%, 80%)',
 }
    let moreText = document.getElementsByClassName('moreText')
    let timelineEle = document.getElementById('timeline')
    let tasksContainer = document.querySelector('.tasks')
    let tasksContainerClone = tasksContainer.cloneNode(true)
    let width = tasksContainer.scrollWidth
    let height = tasksContainer.scrollHeight
    let sortedTasks = tasks
    function drawTimeLine(width, height){
      timelineEle.querySelector('#timelineRange').setAttribute('d', `M0 ${height}L${width} ${height} L ${width} ${height -2} L0 ${height -2} Z `)
      timelineEle.querySelector('#timelineRangeV').setAttribute('d', `M19 0L19 ${height} L 21 ${height} L21 0Z `)
    }
    
tasksContainer.addEventListener('click', (e) => {
    updateTimelineDisp()
    alert()
})
function updateTaskWithDate(date, day) {
  dailyTasks = txtToObj(localStorage.getItem(date))
  repeated = txtToObj(localStorage.getItem('repeated'))
  every = txtToObj(localStorage.getItem('every'))
    if(!dailyTasks){
      dailyTasks = []
      localStorage.setItem(date, '[]')
    }
    
    
    if(!repeated){
      repeated = []
      localStorage.setItem('repeated', '[]')
    }
    
    if(!every){
    every = []
    localStorage.setItem('every', '[]')
    }
    
    repeat = repeated.filter(
       (ele) => {
          return ele.repeat.indexOf(day)
      })
    
    every = every.filter(
      (ele) => {
         
          let difference = dayDifference(ele.every.from, date)
          if (ele.every.to) {
            let difference2 = dayDifference(ele.every.to, date)
            return difference % parseInt(ele.every.days) == 0 && difference >= 0 && difference2 <= 0
          }
          return difference % parseInt(ele.every.days) == 0 && difference >= 0
          })
    tasks = dailyTasks.concat(repeated).concat(every)
    console.log(date)
    updateTask(tasks)
}
updateTask(tasks)
function updateTask(tasks) {
let freeSlots = findFreeTime(tasks)
let overlapSlots = findOverlappingSlots(tasks)
let totC = tasks.concat(freeSlots).concat(overlapSlots)
sortedTasks = sortTasksByStartTime(totC);
let ind = 0
tasksContainer.replaceWith(tasksContainerClone.cloneNode(true))
tasksContainer = document.querySelector('.tasks')
for(let task of sortedTasks) {
  if(task.overlapLength)
   tasksContainer.insertAdjacentHTML('beforeend', `<p class="readable nowordwrap freeTimeAlert" >${task.overlapLength} multiple tasks</p>`)
  else if(task.freetimeEnds)
   tasksContainer.insertAdjacentHTML('beforeend', `<p class="readable nowordwrap freeTimeAlert"><span>Free time</span><span> ${task.startsAt} - ${task.freetimeEnds}</span></p>`)
  else{
  let length = lengthInMinutes(task.length)
  let linear = (factor, x)=>factor*x
  let fc = linear(1440, 1/1440)-linear(length, 1/1400)+1
  let logL = Math.log(length+1)
  
  let translateY = ((logL**3)*fc)/Math.pow(Math.log(1440), 3)
  translateY*=(height*.8)
  let padding = parseInt(length/30)*10
  padding = padding +'px'
  translateY = (translateY +10)+'px'
  tasksContainer.insertAdjacentHTML('beforeend', getTaskTemplate(task.id, task.icon, task.title, task.startsAt, task.length, `--rmr:${padding};--ytr:${translateY};`, task.urgency, ind))
  }
  ind++
}
width = tasksContainer.scrollWidth
height = tasksContainer.scrollHeight
timelineEle = document.getElementById('timeline')
timelineEle.setAttribute('width', width)
timelineEle.setAttribute('height', height)
tasksContainer.style.setProperty('--min-h', height+'px')  
drawTimeLine(width, height)
let taskElements = tasksContainer.children
for (let taskElement of taskElements) {
  let icon = taskElement.querySelector('.icon')
    if (icon){
      
      let rect = taskElement.getBoundingClientRect()
      let d = parseInt(taskElement.style.getPropertyValue('--ytr').split('px')[0])
      
      timelineEle.insertAdjacentHTML('beforeend', `<circle class="${icon.classList[1]}" r='4' cx='${taskElement.offsetLeft+4}' cy='${height-10}'></circle>`)
      timelineEle.insertAdjacentHTML('beforeend', `<path class="horizon clr-${icon.classList[1].split('-')[1]}" stroke-width='3' d='M${taskElement.offsetLeft+4} ${height-10} L${taskElement.offsetLeft+4} ${height -15- d}'></path>`)
      
      }
}

} 

for (let ele of moreText) {
  ele.addEventListener('dblclick', showFullText)
}
function showFullText(e) {
  showAlert2(e.target.parentNode.getAttribute('aria-label'))
}
function updateTimelineDisp() {
  let definition = document.getElementById('timelineStrokeClr')
  let definitionV = document.getElementById('timelineStrokeClrV')
  for (let child of definition.querySelectorAll('stop')) {
  child.remove()
}for (let child of definitionV.querySelectorAll('stop')) {
  child.remove()
}
  let min = Infinity, max = 0;
  let minStart ='00:00 AM'
  let maxEnd = '11:59 PM'
  for (var i = 0; i < tasks.length; i++) {
    let task = tasks[i]
    let endTime = calculateEndTime(task.startsAt, task.length)
    let temp = toMinutes(task.startsAt)
    let temp2 = toMinutes(endTime)
    if(temp<min){
      minStart = task.startsAt
      min = temp
    }
    if (temp2>max) {
      maxEnd = endTime
      max = temp2
    }
    
    definition.insertAdjacentHTML('beforeend', `<stop offset="${((i)/tasks.length)*100}%" stop-color="${colors[task.urgency]}" />`)
    definitionV.insertAdjacentHTML('beforeend', `<stop offset="${((i)/tasks.length)*100}%" stop-color="${colors[task.urgency]}" />`)
  }
  let date = new Date()
  let hoursL = date.getHours()
  let minutesL = date.getMinutes()
  let periodL = hoursL>12?'PM':'AM'
  let timeInMin = toMinutes(`${hoursL%12}:${minutesL} ${periodL}`)
  let diff = timeInMin-toMinutes(minStart)
  let percent = (diff-min)/(max-min)
  let currentTask = tasks.filter((a) => {
      let startsAt = toMinutes(a.startsAt)
      let endsAt = toMinutes(calculateEndTime(a.startsAt, a.length))
      return startsAt < timeInMin && endsAt > timeInMin
  })[0]
  let currentPoint = document.getElementById('currentPoint')
  if (currentTask) {
   let currentTaskEle = document.querySelector(`[taskId="${currentTask.id}"]`)
   let rect = currentTaskEle.getBoundingClientRect()
   let per = (timeInMin-toMinutes(currentTask.startsAt))/lengthInMinutes(currentTask.length)
   currentPoint.style.left = (per*rect.width+currentTaskEle.offsetLeft)+'px'
   //currentPoint.style.top = height-16+'px'
  }
  currentPoint.textContent = `${hoursL%12}:${minutesL} ${periodL}`
}
updateTimelineDisp()
setInterval(updateTimelineDisp, 1000)
function getTaskTemplate(id, icon, title, startsAt, length, style, clr, ind) {
let endTime
if(length == '0h0m'){
  length = ''
  endTime = ''
} else {
  endTime = '-'+calculateEndTime(startsAt, length)
}

return `
 <div taskId="${id}" index="${'task-'+ind}" style="${style}" class="taska">
        <div class="icon bgclr-${clr}">
          <i class="${icon}"></i>
          <span></span>
        </div>
        <div>
          <div class="title">
            <p aria-label="${title}" class="moreText clr-${clr}">${title.length>20?title.substr(0,20)+'<span onclick="showFullText(event)">...</span>':title}</p>
            
          </div>
          <div class="timeHint">
             <span onclick="editTask('${id}')" class="editBtn clr-${clr}">edit</span>
              <span class="startTime">${startsAt}</span>
              <span></span>
              <span class="endTime">${endTime}</span>
              <span style="margin-left: 1rem" class="timeLength">${length}</span>
          </div>
        </div>
    </div>
`
}

function calculateEndTime(startsAt, length) {
    // Convert startsAt to Date object
    let [time, period] = startsAt.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    
    // Convert 12-hour format to 24-hour format
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    // Extract hours and minutes from length (supports "2h", "30m", "1h23m", etc.)
    let addHours = 0, addMinutes = 0;
    let hourMatch = length.match(/(\d+)h/);
    let minuteMatch = length.match(/(\d+)m/);

    if (hourMatch) addHours = parseInt(hourMatch[1]);
    if (minuteMatch) addMinutes = parseInt(minuteMatch[1]);

    // Calculate new time
    let date = new Date();
    date.setHours(hours, minutes, 0);
    date.setMinutes(date.getMinutes() + addHours * 60 + addMinutes);

    // Convert back to 12-hour format
    let endHours = date.getHours();
    let endMinutes = date.getMinutes();
    let endPeriod = endHours >= 12 ? "PM" : "AM";
    
    endHours = endHours % 12 || 12; // Convert 24-hour to 12-hour format
    let formattedMinutes = endMinutes.toString().padStart(2, "0");

    return `${endHours.toString().padStart(2,'0')}:${formattedMinutes} ${endPeriod}`;
}
// Sort tasks
function lengthInMinutes(length) {
    let addHours = 0, addMinutes = 0;
    let hourMatch = length.match(/(\d+)h/);
    let minuteMatch = length.match(/(\d+)m/);

    if (hourMatch) addHours = parseInt(hourMatch[1]);
    if (minuteMatch) addMinutes = parseInt(minuteMatch[1]);
    return addHours*60+addMinutes
}
function toMinutes(timeStr) {
   let [time, period] = timeStr.split(" ");
   let [hours, minutes] = time.split(":").map(Number);
   
   // Convert 12-hour to 24-hour format
   if (period === "PM" && hours !== 12) hours += 12;
   if (period === "AM" && hours === 12) hours = 0;
   
   return hours * 60 + minutes; // Total minutes from 00:00
 };
function sortTasksByStartTime(tasks) {
    return tasks.sort((a, b) => {
        
        return toMinutes(a.startsAt) - toMinutes(b.startsAt);
    });
}
function findFreeTime(tasks) {
    // Sort tasks by start time
    tasks = sortTasksByStartTime(tasks)
    
    // Function to calculate end time
    
    let freeTimeSlots = [];
    for (let i = 0; i < tasks.length - 1; i++) {
        let currentEndTime = calculateEndTime(tasks[i].startsAt, tasks[i].length);
        let nextStartTime = tasks[i + 1].startsAt;

        // Convert to minutes for comparison
        

        if (toMinutes(currentEndTime) < toMinutes(nextStartTime)) {
            freeTimeSlots.push({ startsAt: currentEndTime, freetimeEnds: nextStartTime });
        }
    }

    return freeTimeSlots;
}
function findOverlappingSlots(tasks) {
    function formatTime(minutes) {
        let hours = Math.floor(minutes / 60);
        let mins = minutes % 60;
        let period = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `${hours}:${mins.toString().padStart(2, "0")} ${period}`;
    }
    if(tasks.length == 0)
      return []

    // Function to calculate end time
    

    // Sort tasks by start time
    tasks.sort((a, b) => toMinutes(a.startsAt) - toMinutes(b.startsAt));

    let overlaps = [];
    let latestEndTime = toMinutes(tasks[0].startsAt); // Track the latest end time

    for (let i = 0; i < tasks.length; i++) {
        let currentStartTime = toMinutes(tasks[i].startsAt);
        let currentEndTime = toMinutes(calculateEndTime(tasks[i].startsAt, tasks[i].length));

        // Check if the current task starts before the latest end time (overlap)
        if (currentStartTime < latestEndTime) {
            let overlapDuration = latestEndTime - currentStartTime;
            overlaps.push({
                startsAt: formatTime(currentStartTime),
                overlapLength: `${Math.floor(overlapDuration / 60)}h${overlapDuration % 60}m`
            });
        }

        // Update latest end time to the max of current or previous task
        latestEndTime = Math.max(latestEndTime, currentEndTime);
    }

    return overlaps;
}
function loadRoutines() {
  let tasks = {'date': []}
  let routine = {'day': []}
  let repeat = []
}

    function showAlert2(message) {
      const alertDiv = document.getElementById("customAlert");
      const alertContent = document.querySelector(".alert-content p");
      const closeButton = document.getElementById("closeAlert");

      alertContent.textContent = message; // Set the message
      alertDiv.style.display = "block"; // Show the alert

      closeButton.addEventListener("click", () => {
        alertDiv.style.display = "none"; // Hide the alert
      });
    }
    
    
  function *idGenerator() {
    let i = parseInt(localStorage.getItem('idPoint'))
    if (!i) {
      i = 0
      localStorage.setItem('idPoint', i)
    }
    while (true) {
      localStorage.setItem('idPoint', i+1)
      yield i++;
      
    }
  }
  
  function editTask(id) {
    showEditPopup(id)
  }
  
  function showEditPopup(id) {
    
    let editEle = document.getElementById('editOptions')
    editEle.classList.add('active')
    let deleteBtn = editEle.querySelector('.delete')
    let updateBtn = editEle.querySelector('.update')
    let copyBtn = editEle.querySelector('.copy')
    let closeBtn = editEle.querySelector('.close')
    deleteBtn.onclick = ()=>{
      showConfirmationPopup("Delete Task", "Are you sure you want to delete this task?", 'Delete').then((confirmed) => { if (confirmed) { 
        deletTask(id)
        editEle.classList.remove('active')
      } else { 
        editEle.classList.remove('active')
      } });

    }
    updateBtn.onclick = ()=>updateTask(id)
    copyBtn.onclick = ()=>copyTask(id)
    closeBtn.onclick = () => {
          editEle.classList.remove('active')
    }
  }
  
  function deletTask(id) {
    let task = tasks.filter(a=>a.id==id)[0]
    if(task.repeat.length >=1){
      repeated = repeated.filter(a=>a.id!=id)
      let rept = txtToObj(localStorage.getItem('repeated'))
      rept = rept.filter(a=>a.id!=id)
      localStorage.setItem('repeated', JSON.stringify(rept))
    } else if (task.every.days != '0') {
      every = every.filter(a=>a.id!=id)
      let evet = txtToObj(localStorage.getItem('every'))
      evet = evet.filter(a=>a.id!=id)
      localStorage.setItem('every', JSON.stringify(every))
    }else{
      dailyTasks = dailyTasks.filter(a=>a.id!=id)
      localStorage.setItem(selectedDate, JSON.stringify(dailyTasks))
    }
    tasks = tasks.filter(a=>a.id!=id)
    updateTask(tasks)
  }
  
  function copyPrompt(e) {
    let order = e.target.textContent
    copyTextToClipboard( order+', use task app for notification and clock app for alarm : '+JSON.stringify(tasks))
    closePopup()
  }