// Toggle chatbox visibility
const chatToggleBtn = document.getElementById('chat-toggle-btn');
const chatbox = document.getElementById('chatbox');
const minimizeBtn = document.getElementById('minimize-btn');

chatToggleBtn.addEventListener('click', () => {
  chatbox.style.display = chatbox.style.display === 'none' || chatbox.style.display === '' ? 'block' : 'none';
  chatToggleBtn.style.display = 'none';
});

minimizeBtn.addEventListener('click', () => {
  chatbox.style.display = 'none';
  chatToggleBtn.style.display = 'block';
});

// Sending messages
const sendButton = document.getElementById('send-button');
const chatInput = document.getElementById('chat-input');
const chatBody = document.getElementById('chat-body');

sendButton.addEventListener('click', () => {
  const userInput = chatInput.value;
  if (userInput.trim()) {
    // Append user message
    const userMessage = `<div class="message user"><p>${userInput}</p></div>`;
    chatBody.innerHTML += userMessage;
    chatInput.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;

    // Send request to server via AJAX
    $.ajax({
      type: 'POST',
      url: '/', // The POST request to the Flask server
      data: { prompt: userInput },
      success: function (data) {
        // Append bot response
        const botMessage = `<div class="message bot"><p>${data}</p></div>`;
        chatBody.innerHTML += botMessage;
        chatBody.scrollTop = chatBody.scrollHeight;
      },
      error: function () {
        const botMessage = `<div class="message bot"><p>Error: Could not contact server.</p></div>`;
        chatBody.innerHTML += botMessage;
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    });
  }
});