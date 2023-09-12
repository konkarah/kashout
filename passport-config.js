const localstartegy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialise(passport, getuserbyemail, getuserbyid){
    const authenticateUser = async (email, password, done) => {
        try {
            console.log(email, password);
            const user = getuserbyemail(email);  
            if(user == null){
                return done(null, false, {message: 'No user with that email'});
            }
            const match = await bcrypt.compare(password, user.password);
            if(match){
                return done(null, user);
            } else {
                return done(null, false, {message: 'Password incorrect'});
            }
        } catch (error) {
            console.log(error);
        }
    }

    passport.use(new localstartegy({usernameField: 'email'}, authenticateUser));
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
       return done(null, getuserbyid(id));
    }); 
}

module.exports = initialise;