const messagesWrapperElement = document.querySelector('#messages');
const form = document.querySelector('#form');
const contentInput = document.querySelector('#content');
const senderInput = document.querySelector('#sender');
const fileInput = document.querySelector('#file');

/** Setting up web sockets */
const socket = new WebSocket('ws://' + window.location.host);

socket.addEventListener('open', () => {
	console.log('Connected to WebSocket server');
});

/** Creates a message element and adds it to the DOM */
const createNewMessage = ({ content, sender, id, imageUrl }) => {
	const messageElement = document.createElement('div');
	messageElement.classList.add('message');

	const contentElement = document.createElement('p');
	contentElement.classList.add('message-content');
	contentElement.innerText = content;

	const senderElement = document.createElement('small');
	senderElement.classList.add('message-sender');
	senderElement.innerText = sender;

	const removeButton = document.createElement('button');
	removeButton.classList.add('remove-button');
	removeButton.innerText = 'Remove';

	removeButton.addEventListener('click', () => {
		socket.send(
			JSON.stringify({
				type: 'remove',
				id,
			}),
		);
	});

	messageElement.appendChild(contentElement);
	messageElement.appendChild(senderElement);
	if (imageUrl) {
		const imageElement = document.createElement('img');
		imageElement.src = imageUrl;
		imageElement.alt = content;
		imageElement.classList.add('message-image');
		messageElement.appendChild(imageElement);
	}
	messageElement.appendChild(removeButton);

	messagesWrapperElement.appendChild(messageElement);
};

let messages = [];
const rerenderMessages = () => {
	messagesWrapperElement.innerHTML = '';
	messages.forEach((message) => {
		createNewMessage(message);
	});
};

/** Loads initial messages */
fetch('/api/messages')
	.then((res) => res.json())
	.then(({ messages: newMessages }) => {
		messages = newMessages;
		rerenderMessages();
	});

/** Receive messages from the server */
socket.addEventListener('message', async (event) => {
	const data = JSON.parse(event.data);

	if (data.type === 'remove') {
		messages = messages.filter((message) => message.id !== data.id);
		rerenderMessages();
	} else if (data.type === 'add') {
		messages.push(data.message);
		rerenderMessages();
	}
});

socket.addEventListener('close', () => {
	console.log('Socket closed');
});

/** Sending message */
form.addEventListener('submit', (e) => {
	e.preventDefault();
	const loadingElement = document.querySelector('#loading');
	loadingElement.classList.remove('hidden');

	const content = contentInput.value;
	const sender = senderInput.value;
	const file = fileInput.files[0];

	if (file) {
		const reader = new FileReader();

		reader.onload = (event) => {
			const base64String = event.target.result;

			/** Send web socket message to the server */
			socket.send(
				JSON.stringify({
					type: 'add',
					message: {
						content,
						sender,
						id: Math.random().toString(),
						image: {
							name: file.name,
							data: base64String.split(',')[1], // Remove "data:image/jpeg;base64,"
						},
					},
				}),
			);

			/** Clear form state */
			contentInput.value = '';
			contentInput.focus();
			senderInput.disabled = true;
			loadingElement.classList.add('hidden');
		};

		// Trigger file reading
		reader.readAsDataURL(file);
	} else {
		/** Send web socket message to the server */
		socket.send(
			JSON.stringify({
				type: 'add',
				message: {
					content,
					sender,
					id: Math.random().toString(),
				},
			}),
		);

		/** Clear form state */
		contentInput.value = '';
		contentInput.focus();
		senderInput.disabled = true;
		loadingElement.classList.add('hidden');
	}
});
