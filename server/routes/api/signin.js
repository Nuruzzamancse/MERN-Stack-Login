const User = require('../../models/user');
const UserSession = require('../../models/userSession');

module.exports = (app) => {
  // app.get('/api/counters', (req, res, next) => {
  //   Counter.find()
  //     .exec()
  //     .then((counter) => res.json(counter))
  //     .catch((err) => next(err));
  // });
  //
  // app.post('/api/counters', function (req, res, next) {
  //   const counter = new Counter();
  //
  //   counter.save()
  //     .then(() => res.json(counter))
  //     .catch((err) => next(err));
  // });

  // Sign Up

  app.post('/api/account/signup', (req, res, next)=>{
    const { body } = req;
    var {
      firstName,
      lastName,
      email,
      password
    } = body;

    console.log('IN the upper');

    if(!firstName){
      return res.send({
        success: false,
        message: 'Error First name can mot ne blank'
      });
    }

    if(!lastName){
      return res.send({
        success: false,
        message: 'Error last name can mot ne blank'
    });
    }
    if(!email){
      return res.send({
        success: false,
        message: 'Error Email can mot ne blank'
    });
    }

    if(!password){
      return res.send({
        success: false,
        message: 'Error Password can mot ne blank'
      });
    }

    email = email.toLowerCase();

    console.log('In the middle');

    User.find({
      email: email
    },(err, previousUsers)=>{
      if(err){
        return res.send('Error: Server error');
      }else if(previousUsers.length > 0){
        res.end('Error: Account already exist.');
      }

      console.log('Down middle');

      const newUser = new User();

      newUser.email = email;
      newUser.firstName = firstName;
      newUser.lastName = lastName;
      newUser.password = newUser.generateHash(password);

      console.log('Here');

      newUser.save((err, user) =>{
        if(err){
          return res.send({
            success: false,
            message: 'Error: Server error'
          });
        }
        return res.send({
          success: true,
          message: 'Signed up'
        })
      })
    })

  })

  app.post('/api/account/signin', (req, res, next)=>{
    const { body } = req;
    var {
      email,
      password
    } = body;

    if(!email){
      return res.send({
        success: false,
        message: 'Error Email can mot ne blank'
      });
    }

    if(!password){
      return res.send({
        success: false,
        message: 'Error: Password can mot ne blank'
      });
    }

    email = email.toLowerCase();


    User.find({
      email: email
    }, (err, users) =>{
      if(err){
        console.log('Here the err: ' + err);
        return res.send({
          success: false,
          message: 'Error: server error'
        })
      }

      if(users.length !=1){
        return res.send({
          success: false,
          message: 'Error: Invalid email'
        })
      }

      const user = users[0];

      if(!user.validPassword(password)){
        return res.send({
          success: false,
          message: 'Error: Invalid Password'
        })
      }
      //Otherwise correct user

    const userSession = new UserSession();
      userSession.userId = user._id;
      userSession.save((err, doc)=>{
        if(err){
          console.log(err);
          return res.send({
            success: false,
            message: 'Error: Server error'
          })
        }

        return res.send({
          success: true,
          message: 'Valid sign in',
          token: doc._id
        })
      })

    })

  })

  app.get('/api/account/verify', (req, res, next)=>{
    const { query } = req;
    const { token } = query;

    UserSession.find({
      _id: token,
      isDeleted: false
    },(err, sessions)=>{
      if(err){
        console.log(err);

        return res.send({
          success: false,
          message: 'Error: Server error'
        })
      }

      if(sessions.length !=1){
        console.log('In length : ' +err);
        return res.send({
          success: false,
          message: 'Error: Server error'
        })
      }else{
        return res.send({
          success: true,
          message: 'Good'
        })
      }
    })
  })

  app.get('/api/account/logout', (req, res, next)=>{
    const { query } = req;
    const { token } = query;


    UserSession.findOneAndUpdate({
      _id: token,
      isDeleted: false
    },{
      $set:
        {isDeleted:true}
      },null, (err, sessions)=>{
      if(err){
        console.log(err);

        return res.send({
          success: false,
          message: 'Error: Server error'
        })
      }
        return res.send({
          success: true,
          message: 'Good'
        })

    })
  })

};
