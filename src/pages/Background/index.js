import { get_data } from './get_data';

async function checkAlarmState() {
  const alarm = await chrome.alarms.get('fetchAndStoreData');

  if (!alarm) {
    await chrome.alarms.create('fetchAndStoreData', {
      periodInMinutes: 720,
    });
  }

  get_data().then((data) => {
    console.log(data);
    chrome.storage.local.set({ urls: data });
  });
}

checkAlarmState();

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'fetchAndStoreData') {
    get_data().then((data) => {
      chrome.storage.local.set({ urls: data });
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'refresh_data') {
    get_data().then((data) => {
      console.log(data);
      chrome.storage.local.set({ urls: data });
    });
  }
});
