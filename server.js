const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const { getAllMessages, addMessage, removeMessage } = require('./model/messages');

const app = express();

/** Allow server to receive form data and json */
app.use(express.json());
app.use(express.urlencoded());

/** Allow client to reach /public folder */
app.use(express.static('public'));

/** Get all messages */
app.get('/api/messages', (_, res) => {
	res.json({ messages: getAllMessages() });
});

const server = http.createServer(app);

/** Setup web sockets */
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
	ws.on('message', (payload) => {
		const data = JSON.parse(payload);

		if (data.type === 'remove') {
			removeMessage(data.id);
		} else if (data.type === 'add') {
			addMessage(data.message);
		}

		wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(data));
			}
		});
	});

	ws.on('close', () => {
		console.log('WebSocket connection closed');
	});

	ws.on('error', (error) => {
		console.error('WebSocket error:', error);
	});
});

/** Spin up the server */
server.listen(3000, process.env.IP_ADDRESS, () => {
	console.log('Listening on', process.env.IP_ADDRESS);
});
