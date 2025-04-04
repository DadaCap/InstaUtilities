async function fetchSettings() {
    try {
        const settings = await new Promise((resolve, reject) => {
            chrome.storage.sync.get(null, function(settings) {
                if (chrome.runtime.lastError) {
                    console.error("Error fetching settings:", chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                    return;
                }
                resolve(settings);
            });
        });
        return settings;
    } catch (error) {
        console.error("Error fetching settings:", error);
        throw error;
    }
}

function saveSettings(newSettings) {
    chrome.storage.sync.set(newSettings, function() {
        if (chrome.runtime.lastError) {
            console.error("Error saving the new settings...:", chrome.runtime.lastError);
            return;
        }
    })
}

async function getEmojisInnerHTML() {
    const settings = await fetchSettings();
    const emojis = settings["emojis"];
    let text = "";
    text += `<div class="emojiBox main" data-key="null" title="Toggles for the whole emoji replacing functionality">`;
    text += `<img class="emojiPicture main" src="${chrome.runtime.getURL("assets/switch.png")}">`;
    text += `<input type="text" class="emojiTextBox main" placeholder="Replacement" value="Replace Emojis" disabled>`;
    text += `<label class="emojiSwitch main"><input type="checkbox" class="emojiSwitchInput main" ${emojis["allEnabled"] ? "checked" : ""}><span class="emojiSlider main"></span></label>`;
    text += "</div>";
    for (const [key, value] of Object.entries(emojis)) {
        if (key != "allEnabled") {
            text += `<div class="emojiBox" data-key="${key}" title="Toggles the functionality for this emoji">`;
            text += `<img class="emojiPicture" src="${value["link"]}" alt="${key}">`;
            text += `<input type="text" class="emojiTextBox" placeholder="Replacement" value="${value["replacement"]}">`;
            text += `<label class="emojiSwitch"><input type="checkbox" class="emojiSwitchInput" ${value["enabled"] ? "checked" : ""}><span class="emojiSlider"></span></label>`;
            text += "</div>";
        }
    }
    text += "</p>";
    return text;
}
async function getVoiceMessagesInnerHTML() {
    let text = "<p class=\"VMText\">";
    text += "yes?"
    text += "</p>";
    return text;
}

async function changeText(tabText, content, tabBG, switching) {
    if (switching) {
        switch_bg(tabText, tabBG)
        await content.animate([{opacity: 1}, {opacity: 0}], {duration: 300, fill: "forwards"}).finished;
    }
    if (tabText === "Emojis") {
        const text = await getEmojisInnerHTML();
        const settings = await fetchSettings();
        let tabs = await chrome.tabs.query({active:true, lastFocusedWindow:true});
        const tab = tabs[0];
        const tabID = tab.id;
        const tabURL = tab.url;
        const emojis = settings["emojis"];
        content.innerHTML = text;
        const checkboxes = content.querySelectorAll(".emojiSwitchInput");
        const textboxes = content.querySelectorAll(".emojiTextBox")
        checkboxes.forEach(checkbox => {
            const emojiBox = checkbox.closest(".emojiBox");
            const key = emojiBox.getAttribute("data-key");
            if (key != "null") {
                checkbox.addEventListener("change", function() {
                    emojis[key]["enabled"] = this.checked;
                    saveSettings(settings);
                    if (tabURL.startsWith("https://www.instagram.com")) {
                        chrome.tabs.reload(tabID);
                    }
                });
            } else {
                checkbox.addEventListener("change", function() {
                    emojis["allEnabled"] = this.checked;
                    saveSettings(settings);
                    if (tabURL.startsWith("https://www.instagram.com")) {
                        chrome.tabs.reload(tabID);
                    }
                });
            }
        });
        textboxes.forEach(textbox => {
            const emojiBox = textbox.closest(".emojiBox");
            const key = emojiBox.getAttribute("data-key");
            textbox.addEventListener("input", function() {
                if (emojis[key].replacement === textbox.value) {

                } else {

                }
            });
        });
    } else if (tabText === "Voice Messages") {
        const text = await getVoiceMessagesInnerHTML();
        content.innerHTML = text;
    }
    if (switching) {
        content.animate([{opacity: 0}, {opacity: 1}], {duration: 300, fill: "forwards"});
    }
}

function switch_bg (text, bg) {
    switch (text) {
        case ("Emojis"): {
            bg.animate([
                {opacity:100, transform:"translateX(195px)"},
                {opacity:0, transform:"translateX(195px)"},
                {opacity:0, transform:"translateX(0px)"}, 
                {opacity:100, transform:"translateX(0px)"}
            ], {
                duration: 300,
                fill: "forwards"
            })
            break;
        }
        case ("Voice Messages"): {
            bg.animate([
                {opacity:100, transform:"translateX(0px)"},
                {opacity:0, transform:"translateX(0px)"},
                {opacity:0, transform:"translateX(195px)"},
                {opacity:100, transform:"translateX(195px)"}
            ], {
                duration: 300,
                fill: "forwards"
            })
            break;
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const tabs = document.querySelectorAll(".tab");
    const toolsBackground = document.querySelector(".tools-background");
    const mainContent = toolsBackground.querySelector(".tools");
    const tabBackground = document.querySelector(".top-bar").querySelector(".tab-background");

    tabs.forEach(tab => {
        if (tab.classList.contains("selected")){
            changeText(tab.textContent, mainContent, tabBackground, false);
        }
        tab.addEventListener("click", () => {
            if (!tab.classList.contains("selected")) {
                tabs.forEach(t => t.classList.remove("selected"));
                tab.classList.add("selected");
                changeText(tab.textContent, mainContent, tabBackground, true);
            }
        })
    })
})