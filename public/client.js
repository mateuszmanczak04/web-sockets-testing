const messagesWrapperElement = document.querySelector('#messages');
const form = document.querySelector('#form');
const contentInput = document.querySelector('#content');
const senderInput = document.querySelector('#sender');

let messages = [];

/** Creates a message element and adds it to the DOM */
const createNewMessage = (content, sender) => {
	const messageElement = document.createElement('div');
	messageElement.classList.add('message');

	const contentElement = document.createElement('p');
	contentElement.classList.add('message-content');
	contentElement.innerText = content;

	const senderElement = document.createElement('small');
	senderElement.classList.add('message-sender');
	senderElement.innerText = sender;

	messageElement.appendChild(contentElement);
	messageElement.appendChild(senderElement);

	messagesWrapperElement.appendChild(messageElement);
};

/** Loads initial messages */
fetch('/api/messages')
	.then((res) => res.json())
	.then(({ messages }) => {
		messages.forEach((message) => {
			createNewMessage(message.content, message.sender);
		});
	});

/** Setting up web sockets */
const socket = new WebSocket('ws://127.0.0.1:3000');

socket.addEventListener('open', () => {
	console.log('Connected to WebSocket server');
});

/** Receive messages from the server */
socket.addEventListener('message', async (event) => {
	try {
		const message = JSON.parse(event.data);
		createNewMessage(message.content, message.sender);
	} catch (error) {
		console.error('Error parsing message:', error);
	}
});

/** Sending message */
form.addEventListener('submit', (e) => {
	e.preventDefault();
	const content = contentInput.value;
	const sender = senderInput.value;

	/** Send web socket message to the server */
	socket.send(JSON.stringify({ content, sender }));

	/** Clear form state */
	contentInput.value = '';
	senderInput.value = '';
});
