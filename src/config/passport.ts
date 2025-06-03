// src/config/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { client } from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails } = profile;
      const email = emails?.[0].value;

      try {
        let user = await client.query('SELECT * FROM users WHERE google_id = $1', [id]);

        if (user.rows.length === 0) {
          const newUser = await client.query(
            'INSERT INTO users (google_id, name, email) VALUES ($1, $2, $3) RETURNING *',
            [id, displayName, email]
          );
          return done(null, newUser.rows[0]);
        }

        return done(null, user.rows[0]);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  const user = await client.query('SELECT * FROM users WHERE id = $1', [id]);
  done(null, user.rows[0]);
});
 