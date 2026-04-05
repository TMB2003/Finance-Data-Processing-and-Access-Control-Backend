import express from 'express';
import register from '../controllers/register';
import login from '../controllers/login';
import logout from '../controllers/logout';
import update from '../controllers/update';
import useAuth from '../middleware/useAuth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.patch('/update', useAuth, update);


export default router;