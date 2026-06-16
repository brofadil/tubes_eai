const { Book, Loan } = require('../models');

const bookResolver = {
  Query: {
    books: async () => {
      try {
        return await Book.findAll();
      } catch (error) {
        throw new Error(`Failed to fetch books: ${error.message}`);
      }
    },

    book: async (_, { id }) => {
      try {
        const book = await Book.findByPk(id);
        if (!book) {
          throw new Error(`Book with ID ${id} not found`);
        }
        return book;
      } catch (error) {
        throw new Error(`Failed to fetch book: ${error.message}`);
      }
    },
  },

  Mutation: {
    addBook: async (_, { title, author, isbn, year, coverUrl, stock }) => {
      try {
        const existing = await Book.findOne({ where: { isbn } });
        if (existing) {
          throw new Error(`A book with ISBN "${isbn}" already exists`);
        }
        const book = await Book.create({ 
          title, author, isbn, year, coverUrl, 
          stock: stock || 1,
          available: true // we can keep it true, but actual availability is computed dynamically
        });
        return book;
      } catch (error) {
        throw new Error(`Failed to add book: ${error.message}`);
      }
    },
    
    updateBook: async (_, { id, title, author, isbn, year, coverUrl, stock }) => {
      try {
        const book = await Book.findByPk(id);
        if (!book) throw new Error(`Book with ID ${id} not found`);

        if (isbn && isbn !== book.isbn) {
          const existing = await Book.findOne({ where: { isbn } });
          if (existing) throw new Error(`A book with ISBN "${isbn}" already exists`);
        }

        await book.update({
          title: title || book.title,
          author: author || book.author,
          isbn: isbn || book.isbn,
          year: year || book.year,
          stock: stock !== undefined ? stock : book.stock,
          coverUrl: coverUrl !== undefined ? coverUrl : book.coverUrl,
        });

        return book;
      } catch (error) {
        throw new Error(`Failed to update book: ${error.message}`);
      }
    },

    deleteBook: async (_, { id }) => {
      try {
        const book = await Book.findByPk(id);
        if (!book) throw new Error(`Book with ID ${id} not found`);

        // Check if there are active loans
        const activeLoans = await Loan.findOne({ where: { bookId: id, returnDate: null } });
        if (activeLoans) {
          throw new Error(`Cannot delete book: It is currently borrowed by a user.`);
        }

        // Delete loan history first (cascade simulation if needed, but here we just delete history to avoid constraint errors)
        await Loan.destroy({ where: { bookId: id } });
        await book.destroy();
        
        return true;
      } catch (error) {
        throw new Error(`Failed to delete book: ${error.message}`);
      }
    },
  },

  Book: {
    loans: async (parent) => {
      try {
        return await Loan.findAll({ where: { bookId: parent.id } });
      } catch (error) {
        throw new Error(`Failed to fetch loans for book: ${error.message}`);
      }
    },
    availableStock: async (parent) => {
      try {
        const activeLoansCount = await Loan.count({ where: { bookId: parent.id, returnDate: null } });
        return Math.max(0, parent.stock - activeLoansCount);
      } catch (error) {
        return 0;
      }
    },
    available: async (parent) => {
      try {
        const activeLoansCount = await Loan.count({ where: { bookId: parent.id, returnDate: null } });
        return (parent.stock - activeLoansCount) > 0;
      } catch (error) {
        return false;
      }
    }
  },
};

module.exports = bookResolver;
