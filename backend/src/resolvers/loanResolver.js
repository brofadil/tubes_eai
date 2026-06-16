const { Loan, Book, User } = require('../models');

const loanResolver = {
  Query: {
    loans: async () => {
      try {
        return await Loan.findAll({
          include: [
            { model: User, as: 'user' },
            { model: Book, as: 'book' },
          ],
        });
      } catch (error) {
        throw new Error(`Failed to fetch loans: ${error.message}`);
      }
    },
  },

  Mutation: {
    borrowBook: async (_, { userId, bookId }) => {
      try {
        const user = await User.findByPk(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} not found`);
        }

        const book = await Book.findByPk(bookId);
        if (!book) {
          throw new Error(`Book with ID ${bookId} not found`);
        }

        // Check stock
        const activeLoansCount = await Loan.count({ where: { bookId: bookId, status: ['BORROWED', 'RETURN_REQUESTED'] } });
        if (activeLoansCount >= book.stock) {
          throw new Error(`Book "${book.title}" is out of stock`);
        }

        const loanDate = new Date();
        const dueDate = new Date(loanDate.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Create the loan record
        const loan = await Loan.create({
          userId: parseInt(userId),
          bookId: parseInt(bookId),
          loanDate: loanDate,
          dueDate: dueDate,
          returnDate: null,
          status: 'BORROWED'
        });

        // We don't update book.available here anymore, it's computed dynamically

        // Return loan with associations
        return await Loan.findByPk(loan.id, {
          include: [
            { model: User, as: 'user' },
            { model: Book, as: 'book' },
          ],
        });
      } catch (error) {
        throw new Error(`Failed to borrow book: ${error.message}`);
      }
    },

    requestReturn: async (_, { loanId }) => {
      try {
        const loan = await Loan.findByPk(loanId, { include: [{ model: User, as: 'user' }, { model: Book, as: 'book' }] });
        if (!loan) throw new Error(`Loan with ID ${loanId} not found`);
        if (loan.status !== 'BORROWED') throw new Error('You can only request return for active borrows');
        
        await loan.update({ status: 'RETURN_REQUESTED' });
        return await Loan.findByPk(loan.id, { include: [{ model: User, as: 'user' }, { model: Book, as: 'book' }] });
      } catch (error) {
        throw new Error(`Failed to request return: ${error.message}`);
      }
    },

    approveReturn: async (_, { loanId }) => {
      try {
        const loan = await Loan.findByPk(loanId, { include: [{ model: User, as: 'user' }, { model: Book, as: 'book' }] });
        if (!loan) throw new Error(`Loan with ID ${loanId} not found`);
        if (loan.status !== 'RETURN_REQUESTED') throw new Error('Return has not been requested for this loan');

        await loan.update({ 
          status: 'RETURNED', 
          returnDate: new Date() 
        });

        return await Loan.findByPk(loan.id, { include: [{ model: User, as: 'user' }, { model: Book, as: 'book' }] });
      } catch (error) {
        throw new Error(`Failed to approve return: ${error.message}`);
      }
    },

    rejectReturn: async (_, { loanId }) => {
      try {
        const loan = await Loan.findByPk(loanId, { include: [{ model: User, as: 'user' }, { model: Book, as: 'book' }] });
        if (!loan) throw new Error(`Loan with ID ${loanId} not found`);
        if (loan.status !== 'RETURN_REQUESTED') throw new Error('Return has not been requested for this loan');

        await loan.update({ status: 'BORROWED' });
        return await Loan.findByPk(loan.id, { include: [{ model: User, as: 'user' }, { model: Book, as: 'book' }] });
      } catch (error) {
        throw new Error(`Failed to reject return: ${error.message}`);
      }
    },
  },

  Loan: {
    user: async (parent) => {
      try {
        if (parent.user) return parent.user;
        return await User.findByPk(parent.userId);
      } catch (error) {
        throw new Error(`Failed to fetch user for loan: ${error.message}`);
      }
    },
    book: async (parent) => {
      try {
        if (parent.book) return parent.book;
        return await Book.findByPk(parent.bookId);
      } catch (error) {
        throw new Error(`Failed to fetch book for loan: ${error.message}`);
      }
    },
    status: (parent) => {
      if (parent.status) return parent.status;
      return parent.returnDate ? 'RETURNED' : 'BORROWED';
    },
    isOverdue: (parent) => {
      const currentStatus = parent.status || (parent.returnDate ? 'RETURNED' : 'BORROWED');
      if (currentStatus === 'RETURNED') return false;
      if (!parent.dueDate) return false;
      return new Date() > new Date(parent.dueDate);
    }
  },
};

module.exports = loanResolver;
