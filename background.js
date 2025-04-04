chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === "install") {
    fetch(chrome.runtime.getURL("defaultSettings.json"))
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(defaultSettings => {
        chrome.storage.sync.set(defaultSettings, function() {
          console.log("InstaUtilities => Default settings loaded successfully!");
        });
      })
      .catch(error => {
        console.error("InstaUtilities => Failed to load default settings:", error);
      });
  }
});