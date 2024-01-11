function waitForElementToLoad(elementId, callback) {
  var checkExist = setInterval(function () {
    var element = document.getElementById(elementId);
    if (element) {
      clearInterval(checkExist);
      callback(element);
    }
  }, 1000); // check every 1000ms
}

function injectButton() {
  const aiuwDiv = document.createElement('div');
  aiuwDiv.style.display = 'flex';
  aiuwDiv.style.flexDirection = 'column';
  aiuwDiv.style.padding = '16px;'

  const inputRowDiv = document.createElement('div');
  inputRowDiv.style.display = 'flex';
  inputRowDiv.style.flexDirection = 'row';
  inputRowDiv.style.padding = '8px;'

  const askQuestionInput = document.createElement('input');
  askQuestionInput.id = 'aiuw-ask-question-input';
  askQuestionInput.type = 'text';
  askQuestionInput.placeholder = 'Ask the AI a question...';
  askQuestionInput.style.flexGrow = '1';

  const button = document.createElement('button');
  button.innerText = 'Submit';
  button.addEventListener('click', function () {
    button.disabled = true;
    responseArea.innerText = 'Loading...';
    chrome.runtime.sendMessage({
      action: 'aiuw-sendTextContent',
      question: document.getElementById('questionText')?.innerText,
      answers: document.getElementById('answerContainer')?.innerText,
      explanation: document.getElementById('explanation')?.innerText,
      input: document.getElementById('aiuw-ask-question-input')?.value,
    }).then(res => {
      responseArea.innerText = '' + res.message + (res.credits ? `\n\n${res.credits} credits remaining` : '');
      button.disabled = false;
    }).catch(() => {
      responseArea.innerText = 'An error occurred';
      button.disabled = false;
    });
  });

  const responseArea = document.createElement('p');
  responseArea.innerText = ' ';

  // Append the button to the body or a specific container
  inputRowDiv.appendChild(askQuestionInput);
  inputRowDiv.appendChild(button);
  aiuwDiv.appendChild(inputRowDiv);
  aiuwDiv.appendChild(responseArea);
  document.getElementById('explanation-container').appendChild(aiuwDiv);
}

// Inject the button when the page is loaded
waitForElementToLoad('explanation-container', injectButton);
