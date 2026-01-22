// Storage key for saving expenses
const STORAGE_KEY = 'budgetTrackerExpenses';

// Load expenses from local storage
let expenses = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// Get DOM elements
const expenseForm = document.getElementById('expenseForm');
const expensesList = document.getElementById('expensesList');
const totalAmountEl = document.getElementById('totalAmount');
const monthAmountEl = document.getElementById('monthAmount');
const clearAllBtn = document.getElementById('clearAll');
const categoryStatsEl = document.getElementById('categoryStats');

// Set today's date as default
document.getElementById('date').valueAsDate = new Date();

// Initialize the app
function init() {
    renderExpenses();
    updateSummary();
    updateCategoryStats();
}

// Add new expense
expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    const expense = {
        id: Date.now(),
        description,
        amount,
        category,
        date
    };

    expenses.unshift(expense); // Add to beginning of array
    saveExpenses();
    renderExpenses();
    updateSummary();
    updateCategoryStats();

    // Reset form
    expenseForm.reset();
    document.getElementById('date').valueAsDate = new Date();

    // Show success feedback
    showNotification('Expense added successfully!');
});

// Delete expense
function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        expenses = expenses.filter(expense => expense.id !== id);
        saveExpenses();
        renderExpenses();
        updateSummary();
        updateCategoryStats();
        showNotification('Expense deleted!');
    }
}

// Clear all expenses
clearAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete ALL expenses? This cannot be undone!')) {
        expenses = [];
        saveExpenses();
        renderExpenses();
        updateSummary();
        updateCategoryStats();
        showNotification('All expenses cleared!');
    }
});

// Render expenses list
function renderExpenses() {
    if (expenses.length === 0) {
        expensesList.innerHTML = '<p class="no-expenses">No expenses yet. Add one above!</p>';
        return;
    }

    expensesList.innerHTML = expenses.map(expense => `
        <div class="expense-item">
            <div class="expense-info">
                <div class="expense-description">${expense.description}</div>
                <div class="expense-details">
                    <span class="expense-category category-${expense.category}">
                        ${getCategoryEmoji(expense.category)} ${expense.category}
                    </span>
                    <span>${formatDate(expense.date)}</span>
                </div>
            </div>
            <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
            <button class="btn-delete" onclick="deleteExpense(${expense.id})">Delete</button>
        </div>
    `).join('');
}

// Update summary totals
function updateSummary() {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalAmountEl.textContent = `$${total.toFixed(2)}`;

    // Calculate current month total
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthTotal = expenses
        .filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth &&
                   expenseDate.getFullYear() === currentYear;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

    monthAmountEl.textContent = `$${monthTotal.toFixed(2)}`;
}

// Update category statistics
function updateCategoryStats() {
    const categoryTotals = {};
    const categories = ['food', 'entertainment', 'bills', 'shopping', 'transport', 'health', 'other'];

    // Initialize all categories
    categories.forEach(cat => categoryTotals[cat] = 0);

    // Calculate totals per category
    expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    // Get max amount for percentage calculation
    const maxAmount = Math.max(...Object.values(categoryTotals), 1);

    // Filter out categories with 0 spending
    const activeCategories = Object.entries(categoryTotals)
        .filter(([_, amount]) => amount > 0)
        .sort((a, b) => b[1] - a[1]); // Sort by amount descending

    if (activeCategories.length === 0) {
        categoryStatsEl.innerHTML = '<p class="no-expenses">No expenses to show breakdown.</p>';
        return;
    }

    categoryStatsEl.innerHTML = activeCategories.map(([category, amount]) => {
        const percentage = (amount / maxAmount) * 100;
        return `
            <div class="category-stat">
                <div class="category-stat-label">
                    ${getCategoryEmoji(category)} ${category.charAt(0).toUpperCase() + category.slice(1)}
                </div>
                <div class="category-stat-bar">
                    <div class="category-stat-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="category-stat-amount">$${amount.toFixed(2)}</div>
            </div>
        `;
    }).join('');
}

// Get category emoji
function getCategoryEmoji(category) {
    const emojis = {
        food: '🍔',
        entertainment: '🎬',
        bills: '📄',
        shopping: '🛍️',
        transport: '🚗',
        health: '❤️',
        other: '📦'
    };
    return emojis[category] || '📦';
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Save expenses to local storage
function saveExpenses() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

// Show notification
function showNotification(message) {
    // Simple alert for now - you could make this fancier later!
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Initialize when page loads
init();
