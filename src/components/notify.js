const { ipcRenderer } = require('electron');

const closeBtn = document.getElementById('closeBtn');
const updateBtn = document.getElementById('updateBtn');
const notifyValInput = document.getElementById('notifyVal');

closeBtn.addEventListener('click', function(event) {
    // this will ask main process to close notify popup
    ipcRenderer.send('closeNotifyPopUp');
});

updateBtn.addEventListener('click', function() {
    // this will send price from notifyVal input field(present in notfiy.html) to main process
    // and ask main process to update target price span(present in index.html)
    ipcRenderer.send('updateTargetPrice', notifyValInput.value);
});

ipcRenderer.on('currentNotifyVal', function(event, data) {
    // this will get the current notify value from
    // main process and set it in noify val input
    if(typeof data != "undefined" && data != '') {
        notifyValInput.value = data;
    }
});