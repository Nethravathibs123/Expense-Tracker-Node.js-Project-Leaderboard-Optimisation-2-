const Expense = require('../models/expense');
const User = require('../models/user');
const sequelize = require('../util/database');

// Get all expenses for the current user
module.exports.getExpense = async (req, res, next) => {
  try {
    
    const expenses = await expenseService.getExpenses(req);
    
    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Add a new expense
module.exports.addExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.addExpense(req.user.id, req.body);
    res.status(201).json({ id: expense.id });
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Delete an expense
module.exports.deleteExpense = async (req, res, next) => {
  try {
    await expenseService.deleteExpense(req.user.id, req.params.id);
    res.status(203).json({ msg: "Expense removed successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ msg: "An error occurred while deleting the expense" });
  }
};

// Update an expense
module.exports.putExpense = async (req, res, next) => {
  try {
    await expenseService.updateExpense(req.user.id, req.params.id, req.body);
    res.status(203).json({ msg: "Expense updated successfully" });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ msg: "An error occurred while updating the expense" });
  }
};
