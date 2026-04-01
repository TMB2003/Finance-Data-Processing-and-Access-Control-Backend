import express from 'express';
import register from '../controllers/register';
import login from '../controllers/login';
import logout from '../controllers/logout';
import useAuth from '../middleware/useAuth';
import getProfile from '../controllers/getProfile';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/profile', useAuth, getProfile);


export default router;