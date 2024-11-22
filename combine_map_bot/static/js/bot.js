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
const fileUpload = document.getElementById('file-upload');

sendButton.addEventListener('click', () => {
  const userInput = chatInput.value;
  const file = fileUpload.files[0];

  const formData = new FormData();
  if (userInput.trim()) formData.append('prompt', userInput);
  if (file) formData.append('image', file);

  if (userInput.trim() || file) {
    // Append user message
    const userMessage = `<div class="message user"><p>${userInput || 'Image Uploaded'}</p></div>`;
    chatBody.innerHTML += userMessage;
    chatInput.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;

    // Show the uploaded image in the chat
    if (file) {
      const imageMessage = `<div class="message user">
        <p>Image Uploaded:</p>
        <img src="${URL.createObjectURL(file)}" class="uploaded-image" 
            style="
            max-width: 100%; 
            max-height: 200px; 
            margin: 5px 0;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            display: block;"> 
        </div>`;
      chatBody.innerHTML += imageMessage;
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Append bot typing status
    const typingStatus = `<div id="bot-typing" class="message bot"><p>Bot is typing...</p></div>`;
    chatBody.innerHTML += typingStatus;
    chatBody.scrollTop = chatBody.scrollHeight;

    // Send request to server via AJAX
    $.ajax({
      type: 'POST',
      url: '/',
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        const typingElement = document.getElementById('bot-typing');
        if (typingElement) typingElement.remove();

        const botMessage = `<div class="message bot"><p>${data}</p></div>`;

        function replaceWithUpper(str) {
          return str.replace(/\*(.*?)\*\*/g, (match, word) => word.toUpperCase());
        }

        chatBody.innerHTML += replaceWithUpper(botMessage).replace(/\*\*/g, '\*').replace(/\*/g, '<br>');
        chatBody.scrollTop = chatBody.scrollHeight;
      },
      error: function () {
        const typingElement = document.getElementById('bot-typing');
        if (typingElement) typingElement.remove();

        const botMessage = `<div class="message bot"><p>Error: Could not contact server.</p></div>`;
        chatBody.innerHTML += botMessage;
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    });
  }
});