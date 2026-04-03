import app from './app';
import dotenv from 'dotenv';
import http from 'http';
import { initDB } from './config/initDb';

dotenv.config();

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Record Service is running on port ${PORT}`);
    });
});
export default server;
