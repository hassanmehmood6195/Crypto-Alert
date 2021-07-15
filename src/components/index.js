const { ipcRenderer } = require('electron');

const notifyBtn = document.getElementById('notifyBtn');
const targetPriceSpan = document.getElementById('targetPrice');
const priceHeading = document.getElementById('price');

notifyBtn.addEventListener('click', function(event) {
    // this will ask main process to open notify popup
    ipcRenderer.send('openNotifyPopUp');
});

// this will get the response from main process
// then update the price heading based on the updated
// BTC value
ipcRenderer.on('updatedBTCPrice', function(event, data) {
    priceHeading.innerHTML = formatCurrency(data);
});

// this will get the response from main process
// then update the target price
ipcRenderer.on('updatedTargetPrice', function(event, data) {
    targetPriceSpan.innerHTML = formatCurrency(Number(data));
    
    // this will thanks main process and ask to
    // close the notify pop up
    event.sender.send('closeNotifyPopUp');
});

// this function will format the input
// with required currency format
function formatCurrency(price) {
    return '$' + price.toLocaleString('en');
}