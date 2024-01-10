chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'aiuw-sendTextContent') {
        sendToExternalAPI(request, sendResponse);
        return true;
    }
    else if (request.action === 'aiuw-login') {
        chrome.storage.local.set({ aiuwToken: request.token });
    }
});

function sendToExternalAPI({ question, answers, explanation, input }, sendResponse) {
    // Replace this URL with your external API endpoint
    const apiUrl = 'https://aiuw-summer-water-3105.fly.dev/query';
    chrome.storage.local.get(['aiuwToken'], (result) => {
        // Make an AJAX request to the external API
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': result.aiuwToken,
            },
            body: JSON.stringify({ question, answers, explanation, input }),
        })
            .then(response => response.json())
            .then(data => {
                // Handle the API response as needed
                sendResponse(data);
            })
            .catch(error => console.error('Error:', error));
    });
}
