const { hashPassword, comparePassword } = require('./utils/bcrypt');
const { Types } = require('enmapi/database/utils');
const { todayPlusNDays } = require('enmapi/common/timeDate');

module.exports = {
  User: {
    Schema: {
      email: {
        type: String,
        required: true,
        unique: true
      },
      password: {
        type: String,
        required: true
      },
      activeTokens: [
        {
          type: Types.ObjectId,
          ref: 'Token'
        }
      ]
    },
    Hooks: User => {
      User.pre('save', async function handlePreSaveHooks(next) {
        try {
          const user = this;

          // If email is modified
          if (user.isModified('email')) {
            // make sure email is all lower case
            user.email = user.email.toLowerCase();
          }

          // If password is modified
          if (user.isModified('password')) {
            // Hash new password value
            user.password = await hashPassword(user.password);
          }

          // Finished
          return next();
        } catch (error) {
          throw new Error(error);
        }
      });
    },
    Methods: User => {
      User.methods.checkPassword = async function handleCheckPasswordMethod(
        password
      ) {
        try {
          const user = this;
          const passwordMatch = await comparePassword(password, user.password);
          return passwordMatch;
        } catch (error) {
          throw new Error(error);
        }
      };
    }
  },
  Token: {
    Schema: {
      created_date: {
        type: Date,
        required: true,
        default: Date.now()
      },
      source: {
        type: Object,
        required: true
      },
      user: {
        type: Types.ObjectId,
        ref: 'User'
      },
      token: {
        type: String,
        required: true,
        unique: true
      },
      expire_date: {
        type: Date,
        required: true,
        default: todayPlusNDays(2)
      }
    }
  }
};
