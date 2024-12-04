
// Listener for alarm triggers
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name.startsWith("taskReminder_")) {
        // Extract task details from the alarm name
        const [, encodedTaskDetails, scheduledTimestamp] = alarm.name.split("_");
        const taskDetails = decodeURIComponent(encodedTaskDetails);
        const scheduledTime = new Date(parseInt(scheduledTimestamp));

        // Show notification
        chrome.notifications.create({
            type: "basic",
            iconUrl: "./images/icon.png", // Replace with your extension's icon
            title: "Notlify",
            message: `Reminder for Task: "${taskDetails}"\nScheduled Time: ${scheduledTime.toLocaleString()}`,
        });

        // Query active tabs
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];

            if (
                activeTab?.id &&
                activeTab.url &&
                !activeTab.url.startsWith("chrome://") &&
                !activeTab.url.startsWith("chrome-extension://") &&
                !activeTab.url.startsWith("about:")
            ) {
                // Inject content.js into the active tab
                chrome.scripting.executeScript(
                    {
                        target: { tabId: activeTab.id },
                        files: ["content.js"]
                    },
                    () => {
                        if (chrome.runtime.lastError) {
                            console.log("Script injection error:", chrome.runtime.lastError.message);
                        } else {
                            // Send message to display the modal
                            chrome.tabs.sendMessage(activeTab.id, {
                                type: "SHOW_MODAL",
                                task: taskDetails,
                                time: scheduledTime.toLocaleString()
                            });
                        }
                    }
                );
            } else {
                // Open a new tab to Google and inject the modal there
                chrome.tabs.create({ url: "https://www.google.com" }, (newTab) => {
                    // Wait for the tab to fully load before injecting the script
                    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                        if (tabId === newTab.id && changeInfo.status === "complete") {
                            chrome.tabs.onUpdated.removeListener(listener); // Remove listener to avoid duplicates

                            // Inject content.js into the new tab
                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: newTab.id },
                                    files: ["content.js"]
                                },
                                () => {
                                    if (chrome.runtime.lastError) {
                                        console.log("Script injection error:", chrome.runtime.lastError.message);
                                    } else {
                                        // Send message to display the modal
                                        chrome.tabs.sendMessage(newTab.id, {
                                            type: "SHOW_MODAL",
                                            task: taskDetails,
                                            time: scheduledTime.toLocaleString()
                                        });
                                    }
                                }
                            );
                        }
                    });
                });
            }
        });
    }
});





//To clear all Alarms
// chrome.alarms.clearAll(() => {
//     console.log("All alarms cleared.");
// });

//To get all Alarms
// chrome.alarms.getAll((alarms) => {
//     console.log("Active alarms:", alarms);
// });
