import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import User from '../dao/models/user.model.js';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.signedCookies && req.signedCookies.currentUser) {
    token = req.signedCookies.currentUser;
  }
  return token;
};

const options = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: JWT_SECRET,
};

passport.use(
  new JwtStrategy(options, async (payload, done) => {
    try {
      const userId = payload.id || (payload.user && payload.user.id) || payload._id;
      if (!userId) return done(null, false);
      const user = await User.findById(userId);
      if (!user) return done(null, false);
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  })
);

export default passport;