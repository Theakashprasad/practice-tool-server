import { Router } from "express";
import { loginUser, registerUser } from "../controllers/authController";
import passport from 'passport';

const router = Router();

router.post('/register', registerUser)
router.post('/login',loginUser)

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failure', 
    successRedirect: '/api/auth/success',
  })
);

router.get('/success', (req, res) => {
  res.send('Login successful');
}); 

router.get('/failure', (req, res) => {
  res.send('Login failed');
});

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

export default router