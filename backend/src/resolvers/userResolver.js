const bcrypt = require('bcryptjs');
const { User, Loan } = require('../models');

const userResolver = {
  Query: {
    users: async () => {
      try {
        return await User.findAll();
      } catch (error) {
        throw new Error(`Failed to fetch users: ${error.message}`);
      }
    },
  },

  Mutation: {
    registerUser: async (_, { name, email, password, phone }) => {
      try {
        const existing = await User.findOne({ where: { email } });
        if (existing) {
          throw new Error(`A user with email "${email}" already exists`);
        }

        if (!password || password.length < 4) {
          throw new Error('Password must be at least 4 characters');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
          name,
          email,
          password: hashedPassword,
          role: 'user',
          phone,
        });

        return {
          user,
          message: `User "${name}" registered successfully`,
        };
      } catch (error) {
        throw new Error(`Failed to register user: ${error.message}`);
      }
    },

    loginUser: async (_, { email, password }) => {
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
          throw new Error('Invalid email or password');
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          throw new Error('Invalid email or password');
        }

        return {
          user,
          message: `Welcome back, ${user.name}!`,
        };
      } catch (error) {
        throw new Error(`Login failed: ${error.message}`);
      }
    },
  },

  User: {
    loans: async (parent) => {
      try {
        return await Loan.findAll({ where: { userId: parent.id } });
      } catch (error) {
        throw new Error(`Failed to fetch loans for user: ${error.message}`);
      }
    },
  },
};

module.exports = userResolver;
