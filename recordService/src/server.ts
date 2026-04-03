import app from './app';
import dotenv from 'dotenv';
import http from 'http';
import { initDB } from './config/initDb';

dotenv.config();

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  initDB();
});

export default server;
