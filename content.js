// content.js
//Show the Modal on Notification arrival

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SHOW_MODAL") {
        const { task, time } = message;

        // Check if a modal already exists, remove it
        const existingModal = document.getElementById("notlify-modal");
        if (existingModal) existingModal.remove();

        // Create the modal container
        const modal = document.createElement("div");
        modal.id = "notlify-modal";
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;

        // Create the modal content
        const modalContent = document.createElement("div");
        modalContent.style.cssText = `
            background-color: #1A1A1D;
            color: ghostwhite;
            border-radius: 8px;
            width: 90%;
            max-width: 400px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
            font-family: Arial, sans-serif;
        `;

        // Add the "Notlify" heading with logo
        const header = document.createElement("div");
        header.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
        `;
        const logo = document.createElement("img");
        logo.src = chrome.runtime.getURL("images/logo.png"); // images path
        logo.alt = "Notlify Logo";
        logo.style.cssText = `
            width: 50px;
            height: 50px;
            margin-right: 10px;
            border-radius: 50%;
        `;
        const title = document.createElement("h2");
        title.innerText = "Notlify";
        title.style.cssText = `
            font-size: 30px;
            font-weight: bold;
            margin: 0;
            color: ghostwhite;
        `;
        header.appendChild(logo);
        header.appendChild(title);

        // Add the task and time details
        const taskDetails = document.createElement("div");
        taskDetails.innerHTML = `
            <p style="margin: 10px 0; font-size: 18px;">You have a Reminder:</p>
            <p style="margin: 10px 0; font-size: 16px; color: #f0f0f0; line-height: 1.6;"><strong style = "color: #8a2be2; text-align: left">Task:</strong> ${task}</p>
            <p style="margin: 5px 0; font-size: 16px; color: #f0f0f0; line-height: 1.6;"><strong style = "color: #8a2be2;">Time:</strong> ${time}</p>
        `;

        // Add a close button
        const closeButton = document.createElement("button");
        closeButton.innerText = "Close";
        closeButton.style.cssText = `
            margin-top: 20px;
            background-color: #7A1CAC;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s;
        `;
        closeButton.addEventListener("mouseover", () => {
            closeButton.style.backgroundColor = "#661891";
        });
        closeButton.addEventListener("mouseout", () => {
            closeButton.style.backgroundColor = "#7A1CAC";
        });
        closeButton.addEventListener("click", () => {
            modal.remove();
        });

        // Append elements to modal content
        modalContent.appendChild(header);
        modalContent.appendChild(taskDetails);
        modalContent.appendChild(closeButton);

        // Append modal content to modal container
        modal.appendChild(modalContent);

        // Append modal to body
        document.body.appendChild(modal);
    }
});
