let tasks, repeated, every, dailyTasks;

dailyTasks = txtToObj(localStorage.getItem(today()))
let day = getDay()
repeated = txtToObj(localStorage.getItem('repeated'))
every = txtToObj(localStorage.getItem('every'))

if(!dailyTasks){
  dailyTasks = []
  localStorage.setItem(today(), '[]')
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
    
      let difference = dayDifference(ele.every.from, 'today')
      if (ele.every.to) {
        let difference2 = dayDifference(ele.every.to, 'today')
       return difference%parseInt(ele.every.days) == 0 && difference>=0 &&  difference2<=0
   
      }
      return difference%parseInt(ele.every.days) == 0 && difference>=0
      })


tasks = dailyTasks.concat(repeated).concat(every)
function today() {
  let d = new Date()
  return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()
}

function getDay() {
 return (new Date()).getDay()
}

function txtToObj(txt) {
  return JSON.parse(txt)
}

function dayDifference(date1, date2) {
  if(date2 == 'today')
   date2 = new Date()
  else 
   date2 = new Date(date2)
  date1 = new Date(date1)
  date2.setHours(0)
  date1.setHours(0)
  let timeDiff = date2.getTime()-date1.getTime()
  let extra = timeDiff%(24*3600*1000)
  timeDiff -= extra
  return timeDiff/(24*3600*1000)
}


