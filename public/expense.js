
// Global state variables
let expenses = [];
let editingIndex = -1;

// DOM Elements
const amountInput = document.getElementById('amount-input');
const descriptionInput = document.getElementById('description-input');
const categorySelect = document.getElementById('category-select');
const addExpenseButton = document.getElementById('add-expense');
const expenseList = document.getElementById('expense-list');
const purchasePremiumButton = document.getElementById('purchase-premium');
const leaderboardSection = document.getElementById('leaderboard-section');  // Assuming you have a section in your HTML to display the leaderboard
const leaderboardList = document.getElementById('leaderboard-list');  // Assuming there's a list in the HTML for leaderboard entries

// Utility function to get the auth token
function getAuthToken() {
  return localStorage.getItem('token');
}

// Function to render the expenses list
function renderExpenses() {
  expenseList.innerHTML = ''; // Clear the list before rendering
  expenses.forEach((expense, index) => {
    const newli = document.createElement('li');
    newli.className = 'expense-content';
    newli.textContent = `${expense.amount} - ${expense.description || 'No description'} - ${expense.category}`;

    const dltButton = document.createElement('button');
    dltButton.textContent = 'Delete';
    dltButton.classList.add('delete-btn');
    dltButton.setAttribute('data-id', expense.id);

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.classList.add('edit-btn');
    editButton.setAttribute('data-index', index);

    newli.appendChild(dltButton);
    newli.appendChild(editButton);
    expenseList.appendChild(newli);
  });
}

// Function to fetch expenses from the server
async function fetchExpenses() {
  try {
    const token = getAuthToken();
    if (!token) {
      console.error('No authorization token found.');
      return;
    }

    const response = await axios.get('http://localhost:3000/expenses', {
      headers: { Authorization: token }
    });
    expenses = response.data;
    renderExpenses();  // Only update UI after successful fetch
  } catch (error) {
    console.error('Error fetching expenses:', error);
    expenseList.innerHTML = '<li>Error loading expenses. Please try again.</li>';
  }
}

// Handle Add/Edit Expense action
addExpenseButton.addEventListener('click', async () => {
  const amount = amountInput.value;
  const description = descriptionInput.value;
  const category = categorySelect.value;

  if (amount && description && category) {
    const token = getAuthToken();
    if (!token) {
      alert('You need to be logged in to manage expenses');
      return;
    }

    const newExpense = { amount, description, category };
    try {
      if (editingIndex === -1) {
        // Add new expense
        const response = await axios.post('http://localhost:3000/expenses', newExpense, {
          headers: { Authorization: token }
        });
        expenses.push(response.data);  // Update local state
      } else {
        // Update existing expense
        const id = expenses[editingIndex].id;
        newExpense.id = id; // Retain the id for updating
        const response = await axios.put(`http://localhost:3000/expenses/${id}`, newExpense, {
          headers: { Authorization: token }
        });
        expenses[editingIndex] = response.data;  // Update local state
        editingIndex = -1;  // Reset editing index
      }
      renderExpenses();  // Update the UI after add/edit
    } catch (error) {
      console.error('Error adding/updating expense:', error);
      alert('An error occurred. Please try again.');
    } finally {
      // Reset form fields
      amountInput.value = '';
      descriptionInput.value = '';
      categorySelect.value = 'Food & Beverage';
    }
  } else {
    alert('Please fill in all the details');
  }
});

// Handle Delete Expense action
expenseList.addEventListener('click', async (event) => {
  const token = getAuthToken();
  if (!token) {
    alert('You need to be logged in to delete expenses');
    return;
  }

  if (event.target.classList.contains('delete-btn')) {
    const id = event.target.getAttribute('data-id');
    try {
      await axios.delete(`http://localhost:3000/expenses/${id}`, {
        headers: { Authorization: token }
      });
      expenses = expenses.filter(expense => expense.id !== parseInt(id));  // Update local state
      renderExpenses();  // Update the UI after deletion
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  }

  if (event.target.classList.contains('edit-btn')) {
    const index = event.target.getAttribute('data-index');
    const expense = expenses[index];

    amountInput.value = expense.amount;
    descriptionInput.value = expense.description;
    categorySelect.value = expense.category;

    editingIndex = index;  
  }
});
const isPremium = localStorage.getItem('isPremium');


// Function to handle the Premium Membership Purchase
async function handlePurchase(e) {
  e.preventDefault();

  const token = getAuthToken();
  if (!token) {
    alert('You need to be logged in to make a purchase');
    return;
  }

  try {
    const response = await axios.get('http://localhost:3000/premium/premiummembership', {
      headers: { Authorization: token }
    });
    const { order: { id: orderid }, key_id } = response.data;
    const options = {
      key: key_id,
      order_id: orderid,
      handler: async function(response) {
        const payment = {
          msg: 'successful',
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
        };

        try {
          await axios.post('http://localhost:3000/premium/updatetransactionstatus', payment, {
            headers: { Authorization: token }
          });
          alert('Payment successful! You are now a premium user.');
          if (isPremium === 'true') {
            document.getElementById('purchase').style.display = 'block'; // Show Premium message
            document.getElementById('purchase-premium').style.display = 'none'; // Hide Purchase button
          } else {
            document.getElementById('purchase').style.display = 'none'; // Hide Premium message
            document.getElementById('purchase-premium').style.display = 'block'; // Show Purchase button
          }
      
          
        } catch (err) {
          console.error('Error verifying payment:', err);
          alert('Payment verification failed, please contact support.');
        }
      },
      modal: {
        ondismiss: function() {
          alert('Payment was cancelled. Please try again.');
        }
      }
    };
    

    const rzp1 = new Razorpay(options);
    rzp1.open();
  } catch (error) {
    console.error('Error initiating purchase:', error);
    alert('Payment initiation failed. Please try again.');
  }
}

// Add event listener for the purchase button
purchasePremiumButton.addEventListener('click', handlePurchase);

// Function to handle showing the leaderboard
function showLeaderBoard() {
  const inputElement = document.getElementById('show-leaderboard-btn'); // Get the existing button from HTML

  // Define the handler for when the Show Leaderboard button is clicked
  inputElement.onclick = async () => {
    const token = localStorage.getItem('token');

    // Check if the token is available
    if (!token) {
      alert('You need to be logged in to view the leaderboard.');
      return;
    }

    try {
      const response = await axios.get('http://localhost:3000/premium/showLeaderBoard', {
        headers: { Authorization: token }
      });

      const userLeaderBoardArray = response.data;

      const leaderboardElem = document.getElementById('leaderboard-list');
      if (!leaderboardElem) {
        console.error('Leaderboard container element not found.');
        return;
      }

      leaderboardElem.innerHTML = ''; // Clear existing content

      // Loop through the leaderboard array to insert each user's data
      userLeaderBoardArray.forEach((userDetails, index) => {
        const formattedExpense = new Intl.NumberFormat('en-IN').format(userDetails.totalExpense); 
  leaderboardElem.innerHTML += `
           <tr>
            <td>${index + 1}</td>
            <td>${userDetails.username}</td>
            <td>₹${formattedExpense}</td> <!-- Display formatted rupee amount -->
          </tr>
        `;
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      alert('Failed to load leaderboard. Please try again.');
    }
  };
}

showLeaderBoard();

fetchExpenses();
