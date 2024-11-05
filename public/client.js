console.log('Hi terminal');

const messagesWrapperElement = document.querySelector('#messages');
const form = document.querySelector('#form');
const contentInput = document.querySelector('#content');
const senderInput = document.querySelector('#sender');

let messages = [];

/** Loading initial messages */
fetch('/api/messages')
	.then((res) => res.json())
	.then(({ messages }) => {
		console.log(messages);
		messages.forEach((message) => {
			const messageElement = document.createElement('div');
			messageElement.classList.add('message');

			const contentElement = document.createElement('p');
			contentElement.classList.add('message-content');
			contentElement.innerText = message.content;

			const senderElement = document.createElement('small');
			senderElement.classList.add('message-sender');
			senderElement.innerText = message.sender;

			messageElement.appendChild(contentElement);
			messageElement.appendChild(senderElement);

			messagesWrapperElement.appendChild(messageElement);
		});
	});

/** Sending message */
form.addEventListener('submit', (e) => {
	e.preventDefault();
	const content = contentInput.value;
	const sender = senderInput.value;

	fetch('/api/messages', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			content,
			sender,
		}),
	})
		.then((res) => res.json())
		.then(() => {
			contentInput.value = '';
			senderInput.value = '';
		});
});
