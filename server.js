const express = require('express');
const path = require('path');
const net = require('net');

const createSocket = (socket) => {
	const s = socket || new net.Socket();
};

const app = express();
/** Allow server to receive form data and json */
app.use(express.json());
app.use(express.urlencoded());

/** Allow client to reach /public folder */
app.use(express.static('public'));

/** A simulation of our database */
let messages = [
	{
		content: 'ABC',
		sender: 'Mateusz',
	},
	{
		content: 'ABC',
		sender: 'Mateusz',
	},
	{
		content: 'ABC',
		sender: 'Mateusz',
	},
];

/** Send message request */
app.post('/api/messages', async (req, res) => {
	const { content, sender } = req.body;
	messages.push({ content, sender });
	res.json(messages);
});

/** Get all messages */
app.get('/api/messages', (req, res) => {
	res.json({ messages });
});

/** Start the server */
app.listen(3000, '127.0.0.1', () => {
	console.log('listening');
});
