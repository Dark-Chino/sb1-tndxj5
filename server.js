import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Get local IP address
const networkInterfaces = os.networkInterfaces();
const localIP = Object.values(networkInterfaces)
  .flat()
  .find(details => details?.family === 'IPv4' && !details.internal)?.address || 'localhost';

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", `http://${localIP}:5173`],
    methods: ["GET", "POST"]
  }
});

const timers = new Map();
const timerTimes = new Map();

io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send existing timers to new client
  socket.emit('init-timers', Array.from(timers.values()));

  socket.on('add-timer', (timer) => {
    timers.set(timer.id, timer);
    timerTimes.set(timer.id, {
      timeLeft: timer.section === 1 ? 30 * 60 : timer.section === 2 ? 15 * 60 : 10 * 60,
      lastUpdate: Date.now()
    });
    socket.broadcast.emit('timer-added', timer);
  });

  socket.on('request-time', ({ id }) => {
    const timerData = timerTimes.get(id);
    if (timerData) {
      const currentTime = Date.now();
      const elapsed = Math.floor((currentTime - timerData.lastUpdate) / 1000);
      const timeLeft = Math.max(0, timerData.timeLeft - elapsed);
      socket.emit(`timer-sync-${id}`, { timeLeft });
    }
  });

  socket.on('timer-update', ({ id, timeLeft }) => {
    timerTimes.set(id, {
      timeLeft,
      lastUpdate: Date.now()
    });
    socket.broadcast.emit(`timer-sync-${id}`, { timeLeft });
  });

  socket.on('move-timer', ({ id, section }) => {
    const timer = timers.get(id);
    if (timer) {
      timer.section = section;
      timers.set(id, timer);
      // Reset timer for new section
      const newTimeLeft = section === 1 ? 30 * 60 : section === 2 ? 15 * 60 : 10 * 60;
      timerTimes.set(id, {
        timeLeft: newTimeLeft,
        lastUpdate: Date.now()
      });
      socket.broadcast.emit('timer-moved', { id, section });
      io.emit(`timer-sync-${id}`, { timeLeft: newTimeLeft });
    }
  });

  socket.on('timer-deleted', (id) => {
    timers.delete(id);
    timerTimes.delete(id);
    io.emit('timer-deleted', id);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`WebSocket server running on:`);
  console.log(`  - http://localhost:${PORT}`);
  console.log(`  - http://${localIP}:${PORT}`);
});