import app from './app';
import dotenv from 'dotenv';
import http from 'http';
import connectDB from './connectDb/connectDb'

dotenv.config();

const PORT = process.env.PORT as string;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});

export default server;
