let date = new Date()
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
let selectedDate = today()
let currentShift = 0
let copyTaskPrompt = document.getElementById('copyTaskPrompt')
const dateDisp = document.querySelector('.dateDisp')
const createBtn = document.getElementById('createBtn')
const saveBtn = document.getElementById('saveBtn')
const calendar = document.getElementById('calendar')
const createTaskBtn = document.getElementById('createTask')
const closeAddDetails = document.getElementById('closeAddDetails')
const hourSelection = document.getElementById('hourSelection')
const minuteSelection = document.getElementById('minuteSelection')
const titleField = document.querySelector('.titleField input#title')
const startTimeField = document.querySelector('.startTime')
const endTimeField = document.querySelector('.endTime')
const daySelectionFields = document.querySelectorAll('.daySelectionItem input')
const repeatFields = document.getElementsByName('every')
const everyNDay = document.getElementById('everynday')
const from = document.getElementById('from')
const to = document.getElementById('to')
let orientVertical = document.querySelector('.orientVertical')
let orientHorizontal = document.querySelector('.orientHorizontal')
const urgencySelectionFields = document.querySelectorAll('.typeSelectionItem input')
const definitionField = document.querySelector('.definitionText')
let sp = date.toString().split(' ').slice(0,3).join(', ')
dateDisp.textContent = sp
let emptyTask = { icon: "bi-pen-fill", title: "", startsAt: "", length: "0h0m", urgency: "blue", description: "", repeat: [], every: {days: 0, from: null, to: null}, subTasks: [], completed: false}
let taskData = {...emptyTask}

if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('/service-worker.js').then(reg=>console.log('Servise worker registered', reg)).catch(
      err=>console.error('Service Worker failed', err)
    )
  })
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e)=>{
  console.log("Web app prompt is available")
  e.preventDefault()
  deferredPrompt = e;
  const installBtn = document.getElementById('intallBtn');
  installBtn.style.display = 'block';
  installBtn.addEventListener('click', ()=>{
    installBtn.style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choiceResult =>{
      if(choiceResult.outcome === 'accepted'){
        console.log('User accepted the Prompt.');
      }
      else{
        console.log('User desmissed the Prompt')
      }
      deferredPrompt = null;
    })
  })
})

titleField.onselectionchange = (e)=>taskData.title=e.target.value
titleField.addEventListener('keydown', (e) => {
    taskData.title=e.target.value
})
startTimeField.onchange = () => {

    taskData.startsAt = startTimeField.getAttribute('value')
    
  
}
endTimeField.onchange = () => {
  let temp = endTimeField.getAttribute('value').split(':')
  taskData.length = parseInt(temp[0])+'h'+parseInt(temp[1])+'m'
}

for (let daySelectionField of daySelectionFields) {
daySelectionField.onchange = (e) => {
    let day = e.target.getAttribute('name')
    if (e.target.checked) {
      taskData.repeat.push(day)
    }else{
      let ind = taskData.repeat.indexOf(day)
      taskData.repeat.splice(ind,1)
    }
    
}
}
for (let repeatField of repeatFields) {
  repeatField.onchange = (e) => {
      taskData.every.days = e.target.getAttribute('num')
  }
}
everyNDay.onselectionchange = (e) => {
    taskData.every.days = e.target.value!=''?e.target.value:0
}
everyNDay.onkeydown = (e) => {
    taskData.every.days = e.target.value!=''?e.target.value:0
}
from.onchange = (e) => {
  
  taskData.every.from = e.target.value
  e.target.parentNode.querySelector('.from').textContent = e.target.value
}

to.onchange = (e) => {
  taskData.every.to = e.target.value
  e.target.parentNode.querySelector('.to').textContent = e.target.value

}

calendar.onchange = (e) => {
  let date = new Date(e.target.value)
  let d = dateTemp.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()
  
  let day = daysOfWeek[date.getDay()]
  document.querySelector('.dateSelection.currentSelection').classList.remove('currentSelection')
  updateTaskWithDate(d, day)
}
for (let urgencyField of urgencySelectionFields) {
  urgencyField.onchange = (e) => {
      taskData.urgency = e.target.getAttribute('id')
  }
}
definitionField.onselectionchange = (e)=>taskData.description=e.target.value

orientVertical.addEventListener('click', (e) => {document.body.classList.add('vertical'); updateTask(tasks);updateTimelineDisp()})
orientHorizontal.addEventListener('click', (e) => {document.body.classList.remove('vertical'); updateTask(tasks);updateTimelineDisp()})
copyTaskPrompt.addEventListener('click', () => {
    let pops = document.querySelector('.promptOptions').cloneNode(true)
    pops.style.display = 'flex'
    
    showPopup(pops)
    
})
saveBtn.addEventListener('click', saveTask)

initializeDateScroll()
let btnCalendar = document.getElementById('btnCalendar')
function initializeDateScroll(param) {
  const dateScroller = document.getElementById('dateScroller')
  let pages = [
    dateScroller.querySelector('.previousPage'), 
    dateScroller.querySelector('.currentPage'), 
    dateScroller.querySelector('.nextPage')]
  const currentDay = date.getDay()
  const currentDate = date.getDate()
  const currentMonth = (date.getMonth()+1)
  
  pages[1].scrollIntoView()
  let start = -7-currentDay
  let end = 14 - currentDay
  for (var i = start; i < end; i++) {
    let iNet = i - start
    let page = pages[parseInt(iNet/7)]
    let item = page.querySelectorAll('.dateSelection')[parseInt(iNet % 7)]
    const dateSelectionDay = item.querySelector('.dateSelectionDay')
    const dateSelectionDate = item.querySelector('.dateSelectionDate')
    let dateTemp = getDateFromNow(i)
    item.setAttribute('dateSelection', getPlanId(dateTemp))
    if(i==0){
      item.classList.add('currentSelection')
      item.classList.add('currentDate')
    }
      
    dateSelectionDay.textContent = days[dateTemp.getDay()]
    dateSelectionDate.textContent = dateTemp.getDate()
    item.setAttribute('date', dateTemp.getFullYear()+'-'+(dateTemp.getMonth()+1)+'-'+dateTemp.getDate())
    item.setAttribute('day', daysOfWeek[dateTemp.getDay()])
    item.querySelector('.actionCount').textContent = 0

  }
}
let dateSelectionDivs = document.querySelectorAll('.dateSelection')
for (let dateSelectionDiv of dateSelectionDivs) {
  dateSelectionDiv.addEventListener('click', (e) => {
      document.querySelector('.dateSelection.currentSelection')?.classList.remove('currentSelection')
      dateSelectionDiv.classList.add('currentSelection')
      selectedDate = dateSelectionDiv.getAttribute('date')
      updateTaskWithDate(selectedDate, dateSelectionDiv.getAttribute('day'))
  })
}
function clearForm() {
  for (let repeatField of repeatFields) {
  repeatField.checked = false
}
repeatFields[0].checked = true
for (let daySelectionField of daySelectionFields) {
  daySelectionField.checked = false
}
for (let urgencySelectionField of urgencySelectionFields) {
  urgencySelectionField.checked = false
}
urgencySelectionFields[0].checked = true
everyNDay.value = ''
from.value = ''
from.parentNode.querySelector('.from').textContent = ''
to.value = ''
to.parentNode.querySelector('.to').textContent = 'forever'
definitionField.value = ''
}

function getDateFromNow(days) {
  let date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  return date;
}

function getPlanId(d) {
  return d.toString().split(' ').slice(1,4).join('-')
}

btnCalendar.addEventListener('click', (e) => {
  btnCalendar.querySelector('#calendar').click()
})

createBtn.addEventListener('click',
(e) => {}
)


createTaskBtn.addEventListener('click', createTaskBtnClicked)
createTaskBtn.addEventListener('mousedown', createTaskBtnClicked)
function createTaskBtnClicked(e){
  let a = 
  document.
  querySelector('.plan .addDetails')
  a.classList.add('active')
  document.querySelector('.actionBtnWrapper').style.visibility = 'hidden'
  let fil = sortedTasks.filter(ele=>ele.completed!=undefined)
  let finalTask = fil[fil.length-1]
  let st
  if (!finalTask) {
    st = '06:00 AM'
  } else {
    st = calculateEndTime(finalTask.startsAt, finalTask.length)
  }

  setTime(startTimeField, st)
  setTime(endTimeField, '00:00')
  
}
closeAddDetails.addEventListener('click', (e) => {
    let a = 
    document.
    querySelector('.plan .addDetails')
    a.classList.remove('active')
    document.querySelector('.actionBtnWrapper').style.visibility = 'visible'
})


var elem = document.documentElement;

function setTime(timeF, val) {
    const hourSelection = timeF.querySelector('[type="hourInput"]')
    const minuteSelection = timeF.querySelector('[type="minuteInput"]')
    let [time, period] = val.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    
    let sh = hourSelection.querySelector(`[uid="hour-${hours}"]`)
    hourSelection.setAttribute('value', hours.toString().padStart(2,'0'))
    hourSelection.scrollTop = sh.offsetTop
    
    let sm = minuteSelection.querySelector(`[uid="min-${minutes}"]`)
    minuteSelection.setAttribute('value',  minutes.toString().padStart(2,'0'))
    minuteSelection.scrollTop = sm.offsetTop
    if (period) {
      let sp = timeF.querySelector(`[value="${period}"]`)
      timeF.querySelector('.timePeriodSelection').setAttribute('value', period)
      sp.parentNode.scrollTop = sp.offsetTop
    }
    timeF.setAttribute('value', val)
    timeF.onchange()
}

function saveTask() {
  
  if(taskData.title === ''){
    titleField.classList.add('error')
    showAlert(titleField, 'You need a title to every task')
    titleField.scrollIntoView()
  }
  else if (taskData.startsAt === '') {
    startTimeField.classList.add('error')
    showAlert(startTimeField, 'You need to select where the task will start.')
    startTimeField.scrollIntoView()
  }
  else if (taskData.every.days !=0 && taskData.every.from == null) {
      from.classList.add('error')
      showAlert(from, 'You need the day when this task start to repeat')
      
    }
  else {
    taskData.id = idGen.next().value
    tasks.push(taskData)
    if(taskData.repeat.length >=1){
      repeated.push(taskData)
      let rept = txtToObj(localStorage.getItem('repeated'))
      rept.push(taskData)
      localStorage.setItem('repeated', JSON.stringify(rept))
    } else if (taskData.every.days != '0') {
      every.push(taskData)
      let evet = txtToObj(localStorage.getItem('every'))
      evet.push(taskData)
      localStorage.setItem('every', JSON.stringify(every))
    }else{
      dailyTasks.push(taskData)
      localStorage.setItem(selectedDate, JSON.stringify(dailyTasks))
    }
    updateTask(tasks)
    
    titleField.value = ''
    clearForm()
    let fil = sortedTasks.filter(ele=>ele.completed!=undefined)
    let finalTask = fil[fil.length-1]
    let st = calculateEndTime(finalTask.startsAt, finalTask.length)
    taskData = {...emptyTask}
    taskData.startsAt = st
    setTime(startTimeField, st)
    setTime(endTimeField, '00:00')
    let a = 
    document.
    querySelector('.plan .addDetails')
    a.classList.remove('active')
    document.querySelector('.actionBtnWrapper').style.visibility = 'visible'
    updateTimelineDisp()
  }
}

function showAlert(f, m) {
  if(f.parentNode){
   let errs = document.querySelectorAll('.errorTxt')
   
   for (var i = 0; i < errs.length; i++) {
     
     errs[i].remove()
   }
   let field = document.createElement('span')
   field.classList.add('errorTxt')
   f.parentNode.style.position = 'relative'
   field.textContent = m
   f.parentNode.insertAdjacentElement('afterbegin', field)
   f.parentNode.scrollIntoView()
    }
   
  }

/* View in fullscreen */
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
}

openFullscreen()
function toggleSetup(container, conditional=(value)=>{}) {
  container.style.position = 'relative'
  container.addEventListener('scroll',
  (e) => {
    
    const sections = container.querySelectorAll(".containerItem");
    let snappedElement = sections[0];
    let minDistance = Infinity;
    
    sections.forEach((section) => {
      const distance = Math.abs(section.offsetTop - container.scrollTop)
      
      if (distance < minDistance) {
    
        minDistance = distance;
        snappedElement = section;
      }
    });
    
      let value = snappedElement.getAttribute('value')
      container.setAttribute('value', value)
      conditional(value)
  })
}
function scrollSetup(container, conditional=(value)=>{}) {
    container.addEventListener('scroll',
  (e) => {
    let last = container.lastElementChild
    
    if (container.offsetHeight + container.scrollTop > last.offsetTop) {
      let clone = container.firstElementChild.cloneNode(true)
      container.firstElementChild.remove()
      container.insertAdjacentElement('beforeend', clone)
     
    }
    if (container.scrollTop < 40) {
      let clone = container.lastElementChild.cloneNode(true)
      container.lastElementChild.remove()
      container.insertAdjacentElement('afterbegin', clone)
    }
    const sections = container.querySelectorAll(".containerItem");
    let snappedElement = null;
    let minDistance = Infinity;
    
    sections.forEach((section) => {
      const distance = Math.abs(section.offsetTop - container.scrollTop)
      if (distance < minDistance) {
        minDistance = distance;
        snappedElement = section;
      }
    });
    
      let value = snappedElement.getAttribute('value')
      container.setAttribute('value', value)
      conditional(value)
  })
  }
  
  
let timeInputFields = document.querySelectorAll('[type="timeInput"]')

timeInputFields.forEach((timeInputField) => {
    const hourSelection = timeInputField.querySelector('[type="hourInput"]')
    const minuteSelection = timeInputField.querySelector('[type="minuteInput"]')
    const periodSelection = timeInputField.querySelector('.timePeriodSelection')
    const maxHour = parseInt(hourSelection.getAttribute('maxHour'))
for (var hour = 0; hour <= maxHour; hour++) {
  let hourSelectionItem = document.createElement('span')
  hourSelectionItem.classList.add('containerItem')
  hourSelectionItem.setAttribute('uid', 'hour-' + hour)
  hourSelectionItem.setAttribute('value', hour)
  let num = hour.toString().padStart(2,'0')
  hourSelectionItem.insertAdjacentHTML('beforeend', `<g>${num[0]}</g><g>${num[1]}</g>`) 
  hourSelection.insertAdjacentElement("beforeend", hourSelectionItem)
}
for (var j = 0; j<2; j++) {
  for (var minute = 0; minute <= 59; minute++) {
  let minuteSelectionItem = document.createElement('span')
  
  minuteSelectionItem.classList.add('containerItem')
  minuteSelectionItem.setAttribute('uid', 'min-' + minute)
  minuteSelectionItem.setAttribute('value', minute)
  let num = minute.toString().padStart(2,'0')
  minuteSelectionItem.insertAdjacentHTML('beforeend', `<g>${num[0]}</g><g>${num[1]}</g>`) 
  minuteSelection.insertAdjacentElement("beforeend", minuteSelectionItem)
  minuteSelectionItem.addEventListener('click', (e) => {
    e.currentTarget.scrollIntoView()
  })
}
}
function cb(value) {
 let p = ''
 if(periodSelection)
   p = ' '+periodSelection.getAttribute('value')
 timeInputField.setAttribute('value',
 hourSelection.getAttribute('value')+':'+minuteSelection.getAttribute('value')+p)
 
 if(timeInputField.onchange)
 timeInputField.onchange()
}
scrollSetup(minuteSelection, cb)
scrollSetup(hourSelection, cb)
if (periodSelection)
  toggleSetup(periodSelection, cb)
})

function reduceCount(container, step) {
  if (!window.containerClone) {
    window.containerClone = new Map()
  }
  let clone = window.containerClone.get(container)
  if (!clone) {
    clone = container.cloneNode(true)
    window.containerClone.set(container, clone)
  }
  
  let elements = container.querySelectorAll('.minuteSelection .containerItem')
  
  elements.forEach(e=>e.remove())
  elements = clone.querySelectorAll('.containerItem')

  for (var i = 0; i < elements.length; i+=step) {
    
    container.insertAdjacentElement('beforeend', elements[i].cloneNode(true))
  }
}
let adjustables = document.querySelectorAll('[type="timeInput"].adjustable')

adjustables.forEach((adjustable) => {
  adjustable.setAttribute('step', 2)
  reduceCount(adjustable.querySelector('.minuteSelection'), 5)
  const stepUpBtn = adjustable.querySelector('button.stepUp')
  const stepDownBtn = adjustable.querySelector('button.stepDown')
  stepUpBtn.addEventListener('click',
   ()=>{
     let step = parseInt(adjustable.getAttribute('step'))
     if(step>=4)
      return
     step++
     adjustable.setAttribute('step', step)
     reduceCount(adjustable.querySelector('.minuteSelection'), (step-1)*5)
        }
  )
  stepDownBtn.addEventListener('click',
   ()=>{
     let step = parseInt(adjustable.getAttribute('step'))
     if(step<=1)
      return
     step--
     adjustable.setAttribute('step', step)
     reduceCount(adjustable.querySelector('.minuteSelection'), step==1?1:(step-1)*5)
   }
  )
})


function showConfirmationPopup(title, message,  action) { 
    
    return new Promise((resolve) => { // Create the overlay
    const overlay = document.createElement("div"); 
    overlay.style.position = "fixed"; 
    overlay.style.top = "0"; 
    overlay.style.left = "0"; 
    overlay.style.width = "100%"; 
    overlay.style.height = "100%"; 
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; 
    overlay.style.display = "flex"; 
    overlay.style.justifyContent = "center"; 
    overlay.style.alignItems = "center"; 
    overlay.style.zIndex = "1000";

// Create the popup container
    const popup = document.createElement("div");
    popup.style.background = "white";
    popup.style.padding = "20px";
    popup.style.borderRadius = "10px";
    popup.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    popup.style.textAlign = "center";
    popup.style.minWidth = "300px";
    popup.style.color = 'black'
    popup.classList.add('readable')

    // Title
    const titleEl = document.createElement("h2");
    titleEl.textContent = title;
    popup.appendChild(titleEl);

    // Message
    const messageEl = document.createElement("p");
    messageEl.textContent = message;
    popup.appendChild(messageEl);

    // Buttons container
    const buttonContainer = document.createElement("div");
    buttonContainer.style.marginTop = "20px";
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "space-between";

    // Cancel Button
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.padding = "10px 20px";
    cancelButton.style.marginRight = "10px";
    cancelButton.style.cursor = "pointer";
    cancelButton.onclick = () => {
        document.body.removeChild(overlay);
        resolve(false);
    };

    // Confirm Button
    const confirmButton = document.createElement("button");
    confirmButton.textContent = action;
    confirmButton.style.padding = "10px 20px";
    confirmButton.style.cursor = "pointer";
    confirmButton.style.color = "green";
    confirmButton.style.border = "none";
    confirmButton.style.borderRadius = "5px";
    confirmButton.onclick = () => {
        document.body.removeChild(overlay);
        resolve(true);
    };

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    popup.appendChild(buttonContainer);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
});

}

// Example usage: 
async function copyTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showAlert2('A prompt is generated. you can use this prompt on ai assistant')
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
}

function showPopup(contentElement) { // Create the popup container if it doesn't exist 
let popupContainer = document.getElementById("fullscreen-popup");
if (!popupContainer) { popupContainer = document.createElement("div");
popupContainer.id = "fullscreen-popup"; popupContainer.style.position = "fixed"; popupContainer.style.top = "0"; 
popupContainer.style.left = "0";
popupContainer.style.width = "100vw";
popupContainer.style.height = "100vh"; 
popupContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)"; 
popupContainer.style.display = "flex"; 
popupContainer.style.justifyContent = "center";
popupContainer.style.alignItems = "center";
popupContainer.style.zIndex = "1000";

// Close popup when clicked outside
    popupContainer.addEventListener("click", function(event) {
        if (event.target === popupContainer) {
            closePopup();
        }
    });

    document.body.appendChild(popupContainer);
}

// Clear previous content and add new content
popupContainer.innerHTML = "";
popupContainer.appendChild(contentElement);

}

function closePopup() { 
  const popupContainer = document.getElementById("fullscreen-popup"); 
  if (popupContainer) {
    popupContainer.remove(); 
    
  } }

