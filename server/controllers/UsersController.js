import jwt from 'jsonwebtoken';
import { Users, ExpiredTokens } from '../models';


const userRecordDetail = newUser => ({
  id: newUser.id,
  username: newUser.username,
  fullName: newUser.fullName,
  email: newUser.email,
  roleId: newUser.roleId,
  createdAt: newUser.createdAt,
  updatedAt: newUser.updatedAt
});


/**
 * Users Controller class that handles all User's requests
 */
class UsersController {

  /**
   * login - Login in the user with the credentials supplied
   *
   * @param  {Object} req - Request Object
   * @param  {Object} res - Response Object
   */
  static login(req, res) {
    // find if record exists in the database
    Users.findOne({
      where: {
        $or: [
          { email: req.body.email },
          { username: req.body.username }]
      }
    }).then((user) => {
      // compare password to check if it matched
      if (user && user.validPassword(req.body.password)) {
        const token = jwt.sign({
          userId: user.id,
          roleId: user.roleId,
          fullName: user.fullName,
          email: user.email
        }, req.secret, { expiresIn: '3 days' });
        res.status(200)
         .send({ user: userRecordDetail(user), token, expiresIn: '3 days' });
      } else {
        res.status(400)
          .send({ message: 'Invalid credentials supplied!' });
      }
    });
  }

  /**
   * logout - Logs out a user
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   */
  static logout(req, res) {
    ExpiredTokens.create({ token: req.headers['x-access-token']
    || req.headers.authorization });
    ExpiredTokens.destroy({ where: {
      createdAt: { $lt: new Date() - (48 * 60 * 60 * 1000) } } });
    return res.status(200).send({ message:
      'User logged out' });
  }

  /**
  * signUp - Create a user
  * @param {Object} req - Request Object
  * @param {Object} res - Response Object
  */
  static signUp(req, res) {
    Users.findOne({
      where: {
        email: req.body.email
      }
    })
       .then((userExist) => {
         // Notify user if account has been created before
         if (userExist) {
           return res.status(409)
             .send({
               message: `This email is in existence please choose a new one or login`
             });
         }
         const { username, fullName, email, password } = req.body;
         // Reject non admin creating an admin account
         if (req.body.roleId === 1) {
           return res.status(403)
             .send({
               message: 'You can\'t create an admin account yourself'
             });
         } else {
           const userToCreate = { username,
             fullName,
             email,
             password
           };
           Users.create(userToCreate)
               .then((newUser) => {
                 const token = jwt.sign({
                   userId: newUser.id,
                   roleId: newUser.roleId,
                   fullName: newUser.fullName,
                   email: newUser.email,
                 }, req.secret, {
                   expiresIn: '3 days'
                 });
                 const user = userRecordDetail(newUser);
                 res.status(201)
                   .send({
                     user,
                     token,
                     expiresIn: '3 days'
                   });
               })
               .catch((err) => {
                 res.status(400)
                 .send({
                   message: 'Error creating user account'
                 });
               });
         }
       }).catch(() => res.status(500).send('Erorr occurred'));
  }

  /**
   * getUser - Get a single user based on email or username
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   */
  static getUser(req, res) {
    Users.findOne({
      where: {
        $or: [{ email: req.params.id },
          { username: req.params.id }
        ]
      }
    }).then((user) => {
      if (!user) {
        return res.status(404)
        .send({ message: `User with ${req.params.id} does not exists` });
      }

      res.status(200).send(user);
    }).catch(() => res.status(500).send({ message: 'Error occurred' }));
  }

  /**
   * updateUser - Update user details
   * @param {Object} req - Request Object
   * @param {Object} res - Response Object
   * @returns {void} Returns void
   */
  static updateUser(req, res) {
    Users.find({ where: {
      id: req.params.id } })
        .then((user) => {
          user.update(req.body)
            .then(updatedUser => res
              .status(200).send({ message: `${req.params.id} updated`,
                data: userRecordDetail(updatedUser)
              }));
        })
        .catch(() => {
          res.status(404).send({
            message: `${req.params.id} does not meet any record`
          });
        });
  }

  /**
   * searchUsers - Search list of user where the search term
   * matches the fullName
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   */
  static searchUsers(req, res) {
    const query = req.query.q;
    Users.findAndCountAll({
      order: '"createdAt" DESC',
      where: { fullName: { $iLike: `%${query}%` } }
    })
    .then((result) => {
      res.status(200)
       .send({ result: result.rows,
         metadata: {
           count: result.count,
           searchTerm: query
         }
       });
    })
    .catch(() => {
      res.status(404)
        .send({ message: `${query} does not meet any record in the database` });
    });
  }

  /**
   * getAllUsers - Gets all user details in the databae
   * @param {Object} req - Request Object
   * @param {Object} res - Response Object
   */
  static getAllUsers(req, res) {
    Users.findAll({ attributes: [
      'id',
      'username',
      'fullName',
      'email',
      'roleId',
      'createdAt',
      'updatedAt'
    ] })
      .then(Allusers => res.status(200).send(Allusers))
      .catch(() => res.status(500).send({ message: 'Error fetching users' }));
  }

  /**
   * deleteUser - Delete a user
   * @param {Object} req Request Object
   * @param {Object} res Response Object
   */
  static deleteUser(req, res) {
    Users.findById(req.params.id)
      .then((user) => {
        if (user.id === req.decoded.userId &&
          req.decoded.roleId === user.roleId) {
          res.status(401)
            .send({ message: 'You cant delete yourself' });
        } else {
          user.destroy()
            .then(() => {
              res.status(200).send({ message: `${req.params.id} has been deleted` });
            });
        }
    }).catch(() => {
      res.status(400).send({ message: 'Bad request' })
    });
  }

}

export default UsersController;
