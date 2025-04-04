async function fetchSettings() {
    try {
        const settings = await new Promise((resolve, reject) => {
            chrome.storage.sync.get(null, (settings) => {
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

try {
    const emojiObserver = new MutationObserver((mutationsList) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.tagName.toLowerCase() === "div") {
                            const images = node.querySelectorAll("img");
                            images.forEach(img => {
                                fetchSettings().then((settings) => {
                                    const emojis = settings["emojis"];
                                    const src = img.getAttribute("src");
                                    const emojiKey = Object.keys(emojis).find(key => emojis[key].link === src);
                                    if (emojis.allEnabled && emojiKey && emojis[emojiKey].enabled) {
                                        const textNode = document.createTextNode(emojis[emojiKey].replacement);
                                        img.parentNode.parentNode.insertBefore(textNode, img.parentNode);
                                        img.parentNode.parentNode.removeChild(img.parentNode);
                                    }
                                });
                            });
                        }
                    }
                }
            }
        }
    });
    emojiObserver.observe(document.body, { subtree: true, childList: true });
} catch (error) {
    console.error("Error setting up emoji observer:", error);
}