console.log('This is the background page.');
console.log('Put the background scripts here.');

chrome.runtime.onInstalled.addListener(() => {
  console.log('install');
  const url = chrome.runtime.getURL('urls.json');
  fetch(url)
    .then((res) => res.json())
    .then((list) => chrome.storage.local.set({ urls: list }));
});
