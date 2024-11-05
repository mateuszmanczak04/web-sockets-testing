const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();

/** Allow server to receive form data and json */
app.use(express.json());
app.use(express.urlencoded());

/** Allow client to reach /public folder */
app.use(express.static('public'));

/** A simulation of our database */
let messages = [];

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

const server = http.createServer(app);

/** Setup web sockets */
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
	console.log('New client connected');

	ws.on('message', (message) => {
		const parsedMessage = JSON.parse(message);
		messages.push(parsedMessage);
		wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(parsedMessage));
			}
		});
	});
});

/** Spin up the server */
server.listen(3000, '127.0.0.1', () => {
	console.log('Listening on http://127.0.0.1:3000');
});
