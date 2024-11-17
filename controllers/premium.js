
const User = require('../models/user');
const Expense = require('../models/expense');
const Sequelize = require('../util/database');

exports.getUserLeaderBoard = async (req, res) => {
    try {
      // Fetch total expenses for each user and sort them by total expense
      const leaderboard = await User.findAll({
        attributes: [
          'id', // Ensure we include the user's ID in the select statement
          'username',
          [Sequelize.fn('SUM', Sequelize.col('expenses.amount')), 'totalExpense']  // Calculate total expense dynamically
        ],
        include: [{
          model: Expense,
          attributes: [],  
        }],
        group: ['user-detail.id'],  
        order: [[Sequelize.fn('SUM', Sequelize.col('expenses.amount')), 'DESC']],  // Order by totalExpense
      });
  
      // Return leaderboard data to the client
      res.status(200).json(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ message: 'Failed to load leaderboard.' });
    }
  };
