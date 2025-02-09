class StockPortfolio {
    constructor() {
        this.stocks = {
            trending: [
                { symbol: 'AAPL', name: 'Apple Inc.', price: 180.25, change: 2.5 },
                { symbol: 'MSFT', name: 'Microsoft', price: 390.15, change: -1.2 },
                // Add more stocks
            ],
            gainers: [
                { symbol: 'NVDA', name: 'NVIDIA', price: 550.75, change: 8.5 },
                { symbol: 'AMD', name: 'AMD', price: 175.30, change: 6.2 },
                // Add more stocks
            ],
            losers: [
                { symbol: 'TSLA', name: 'Tesla', price: 180.20, change: -5.8 },
                { symbol: 'META', name: 'Meta', price: 390.45, change: -3.2 },
                // Add more stocks
            ]
        };
        
        this.news = [
            {
                title: 'Market Rally Continues Amid Strong Earnings',
                source: 'Financial Times',
                time: '2 hours ago',
                url: '#'
            },
            // Add more news items
        ];
        
        this.stockList = [];
        this.stockListElement = document.getElementById('stockTableBody');
        
        if (!this.stockListElement) {
            console.error('Could not find stockTableBody element');
            return;
        }
        
        this.totalPortfolioValue = 0;
        this.dailyChange = 0;
        
        this.init();
    }

    init() {
        try {
            this.loadStocksFromStorage();
            this.renderStockLists();
            this.setupEventListeners();
            this.renderMarketIndices();
            this.renderStockLists('trending');
            this.renderNews();
            this.startLiveUpdates();
            this.updatePortfolioSummary();
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }

    loadStocksFromStorage() {
        try {
            const savedStocks = localStorage.getItem('stocks');
            this.stockList = savedStocks ? JSON.parse(savedStocks) : [];
        } catch (error) {
            console.error('Error loading stocks from storage:', error);
            this.stockList = [];
        }
    }

    renderStockLists(listType) {
        const container = document.getElementById('stockLists');
        container.innerHTML = '';

        this.stocks[listType].forEach(stock => {
            const stockCard = document.createElement('a');
            stockCard.href = `/stock.html?symbol=${stock.symbol}`;
            stockCard.className = 'stock-card';
            stockCard.innerHTML = `
                <div class="stock-info">
                    <strong>${stock.symbol}</strong>
                    <div>${stock.name}</div>
                </div>
                <div class="stock-price">$${stock.price}</div>
                <div class="stock-change ${stock.change > 0 ? 'positive-change' : 'negative-change'}">
                    ${stock.change > 0 ? '+' : ''}${stock.change}%
                </div>
            `;
            container.appendChild(stockCard);
        });
    }

    renderNews() {
        const container = document.getElementById('newsContainer');
        container.innerHTML = '';

        this.news.forEach(item => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            newsItem.innerHTML = `
                <h3>${item.title}</h3>
                <div class="meta">
                    <span>${item.source}</span> • 
                    <span>${item.time}</span>
                </div>
            `;
            newsItem.addEventListener('click', () => window.open(item.url, '_blank'));
            container.appendChild(newsItem);
        });
    }

    startLiveUpdates() {
        // This will be replaced with real API data updates
        setInterval(() => {
            this.renderMarketIndices();
            this.renderStockLists(document.querySelector('.tab-btn.active').dataset.list);
        }, 5000);
    }

    setupEventListeners() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderStockLists(e.target.dataset.list);
            });
        });

        // Assuming this is part of your setupEventListeners method
        const addStockButton = document.getElementById('addStock');
        const stockSymbolInput = document.getElementById('stockSymbol');
        const stockQuantityInput = document.getElementById('stockQuantity');
        const stockTableBody = document.getElementById('stockTableBody');
        const totalPortfolioValue = document.getElementById('totalPortfolioValue');
        const dailyChange = document.getElementById('dailyChange');
        
        const BASE_URL = "https://finnhub.io/api/v1";
        const API_KEY = "YOUR_API_KEY"; // Replace with your actual API key
        let stockList = [];
        
        // Load portfolio from localStorage on page load
        document.addEventListener("DOMContentLoaded", () => {
            loadPortfolio();
        });
        
        // Add Stock Event Listener
        if (addStockButton) {
            addStockButton.addEventListener('click', async () => {
                const symbol = stockSymbolInput.value.trim().toUpperCase();
                const quantity = parseInt(stockQuantityInput.value);
        
                if (!symbol || isNaN(quantity) || quantity <= 0) {
                    alert('Please enter a valid stock symbol and quantity.');
                    return;
                }
        
                try {
                    const stockData = await fetchStockData(symbol);
                    if (stockData) {
                        addStock(symbol, quantity, stockData);
                        savePortfolio(); // Save portfolio after adding
                        stockSymbolInput.value = '';
                        stockQuantityInput.value = '';
                    }
                } catch (error) {
                    console.error('Error adding stock:', error);
                    alert('Error fetching stock data. Please check the symbol and try again.');
                }
            });
        }
        
        // Fetch Stock Data from API
        async function fetchStockData(symbol) {
            try {
                const response = await fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Fetched stock data:', data);
                return data;
            } catch (error) {
                console.error('Error fetching stock data:', error);
                throw error;
            }
        }
        
        // Add Stock to Portfolio
        function addStock(symbol, quantity, stockData) {
            const existingStock = stockList.find(s => s.symbol === symbol);
            const currentPrice = stockData.c;
            const change = stockData.dp;
        
            if (existingStock) {
                existingStock.quantity += quantity;
                existingStock.price = currentPrice;
            } else {
                stockList.push({
                    symbol,
                    quantity,
                    price: currentPrice,
                    change: change
                });
            }
        
            updateStockTable();
            updatePortfolioSummary();
        }
        
        // Update Stock Table UI
        function updateStockTable() {
            stockTableBody.innerHTML = '';
        
            stockList.forEach(stock => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${stock.symbol}</td>
                    <td>${stock.quantity}</td>
                    <td>$${stock.price.toFixed(2)}</td>
                    <td>$${(stock.price * stock.quantity).toFixed(2)}</td>
                    <td>${stock.change.toFixed(2)}%</td>
                    <td><button class="delete-btn" data-symbol="${stock.symbol}">Delete</button></td>
                `;
                stockTableBody.appendChild(row);
            });
        }
        
        // Event Delegation for Deleting Stocks
        stockTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const symbol = e.target.dataset.symbol;
                removeStock(symbol);
            }
        });
        
        // Remove Stock from Portfolio
        function removeStock(symbol) {
            stockList = stockList.filter(stock => stock.symbol !== symbol);
            updateStockTable();
            updatePortfolioSummary();
            savePortfolio();
        }
        
        // Save Portfolio to Local Storage
        function savePortfolio() {
            localStorage.setItem('portfolio', JSON.stringify(stockList));
        }
        
        // Load Portfolio from Local Storage
        function loadPortfolio() {
            const storedData = localStorage.getItem('portfolio');
            if (storedData) {
                stockList = JSON.parse(storedData);
                updateStockTable();
                updatePortfolioSummary();
            }
        }
        
        // Update Portfolio Summary
        function updatePortfolioSummary() {
            let totalValue = 0;
            let totalChange = 0;
        
            stockList.forEach(stock => {
                totalValue += stock.price * stock.quantity;
                totalChange += stock.change;
            });
        
            totalPortfolioValue.textContent = `$${totalValue.toFixed(2)}`;
            dailyChange.textContent = `${totalChange.toFixed(2)}%`;
        }
        
        // Auto-Update Stock Prices Every 60 Seconds
        setInterval(async () => {
            try {
                for (let stock of stockList) {
                    const stockData = await fetchStockData(stock.symbol);
                    stock.price = stockData.c;
                    stock.change = stockData.dp;
                }
                updateStockTable();
                updatePortfolioSummary();
                savePortfolio();
            } catch (error) {
                console.error('Error updating stock prices:', error);
            }
        }, 60000);
    }

    removeStock(symbol) {
        this.stockList = this.stockList.filter(stock => stock.symbol !== symbol);
        this.saveStocksToStorage();
        this.renderStockLists();
    }

    saveStocksToStorage() {
        localStorage.setItem('stocks', JSON.stringify(this.stockList));
    }

    renderMarketIndices() {
        // This will be replaced with real API data
        const indices = {
            sp500: { value: '4,890.25', change: '+0.52' },
            nasdaq: { value: '15,628.95', change: '+0.89' },
            djia: { value: '38,109.43', change: '+0.35' }
        };

        Object.keys(indices).forEach(index => {
            const element = document.getElementById(index);
            if (element) {
                element.querySelector('.value').textContent = indices[index].value;
                element.querySelector('.change').textContent = `${indices[index].change}%`;
            }
        });
    }
}

// Initialize everything after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize stock portfolio
        window.portfolio = new StockPortfolio();
        
        // Initialize market data and news
        fetchMarketMovers();
        fetchMarketNews();
        
        // Set up refresh intervals
        setInterval(fetchMarketMovers, 60000);
        setInterval(fetchMarketNews, 300000);
        
        // Initialize authentication
        const auth = new AuthManager();
    } catch (error) {
        console.error('Error during application initialization:', error);
    }
});

// Time filter functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Loaded');
    const timeFilters = document.querySelectorAll('.time-filter');
    const chart = document.getElementById('performanceChart');
    
    // Sample data for different time periods
    const chartData = {
        day: {
            labels: ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM'],
            data: [150, 152, 151, 153, 152, 154, 153, 155]
        },
        week: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            data: [150, 152, 154, 153, 156, 158, 157]
        },
        month: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            data: [150, 154, 158, 160]
        },
        year: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            data: [150, 152, 155, 158, 160, 162, 165, 168, 170, 172, 175, 178]
        },
        '5year': {
            labels: ['2019', '2020', '2021', '2022', '2023'],
            data: [150, 160, 170, 180, 190]
        },
        all: {
            labels: ['2019', '2020', '2021', '2022', '2023'],
            data: [150, 160, 170, 180, 190]
        }
    };

    let myChart = null;

    function updateChart(timeframe) {
        const data = chartData[timeframe];
        
        // Destroy existing chart if it exists
        if (myChart) {
            myChart.destroy();
        }

        // Create new chart
        myChart = new Chart(chart, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Portfolio Value',
                    data: data.data,
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#b3b3b3'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#b3b3b3'
                        }
                    }
                }
            }
        });
    }

    // Add click event listeners to time filters
    timeFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Remove active class from all filters
            timeFilters.forEach(f => f.classList.remove('active'));
            
            // Add active class to clicked filter
            this.classList.add('active');
            
            // Get the time period from data-time attribute
            const timePeriod = this.getAttribute('data-time');
            
            // Update the chart
            updateChart(timePeriod);
        });
    });

    // Initialize chart with day data
    updateChart('day');
});

// API Configuration
const API_KEY = 'cuk649hr01qgs48296ugcuk649hr01qgs48296v0';
const BASE_URL = 'https://finnhub.io/api/v1';
const STOCK_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'JPM', 'BAC', 'AMD', 'INTC', 'NFLX', 'DIS', 'PYPL', 'UBER'];

// Add these functions to your existing app.js
async function initializeMarketData() {
    // List of popular stocks to track
    const popularStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'BAC', 'DIS'];
    const stocksData = [];

    // Fetch data for each stock
    for (const symbol of popularStocks) {
        try {
            const data = await fetchStockData(symbol);
            const companyData = await fetchCompanyProfile(symbol);
            
            stocksData.push({
                symbol: symbol,
                currentPrice: data.c,
                change: data.dp,
                companyName: companyData.name || symbol
            });
        } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error);
        }
    }

    // Sort stocks for different categories
    const gainers = [...stocksData].sort((a, b) => b.change - a.change);
    const losers = [...stocksData].sort((a, b) => a.change - b.change);
    const trending = [...stocksData].sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    updateMarketMovers(gainers.slice(0, 4), losers.slice(0, 4), trending.slice(0, 4));
}

async function fetchCompanyProfile(symbol) {
    try {
        const response = await fetch(`${BASE_URL}/stock/profile2?symbol=${symbol}&token=${API_KEY}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching company profile:', error);
        return { name: symbol };
    }
}

function updateMarketMovers(gainers, losers, trending) {
    // Update HTML structure for market movers
    const marketMoversHTML = `
        <section class="market-data-section">
            <div class="market-category">
                <h2>Top Gainers</h2>
                <div class="stocks-grid">
                    ${gainers.map(stock => createStockCard(stock)).join('')}
                </div>
            </div>

            <div class="market-category">
                <h2>Top Losers</h2>
                <div class="stocks-grid">
                    ${losers.map(stock => createStockCard(stock)).join('')}
                </div>
            </div>

            <div class="market-category">
                <h2>Trending</h2>
                <div class="stocks-grid">
                    ${trending.map(stock => createStockCard(stock)).join('')}
                </div>
            </div>
        </section>
    `;

    // Insert the market movers section after the portfolio section
    const portfolioSection = document.querySelector('.portfolio-section');
    portfolioSection.insertAdjacentHTML('afterend', marketMoversHTML);
}

function createStockCard(stock) {
    return `
        <div class="stock-box">
            <div class="stock-info">
                <h3>${stock.symbol}</h3>
                <p class="company-name">${stock.companyName}</p>
                <div class="stock-details">
                    <span class="price">$${stock.currentPrice.toFixed(2)}</span>
                    <span class="change ${stock.change >= 0 ? 'positive' : 'negative'}">
                        ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%
                    </span>
                </div>
            </div>
        </div>
    `;
}

// Add these news functions
async function fetchMarketNews() {
    try {
        console.log('Starting to fetch market news...');
        // Use a different news endpoint that might work better
        const response = await fetch(`${BASE_URL}/news?category=general&minId=0&token=${API_KEY}`);
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const news = await response.json();
        console.log('Raw news data:', news);
        
        if (!Array.isArray(news)) {
            throw new Error('Invalid news data format');
        }
        
        if (news.length === 0) {
            throw new Error('No news articles available');
        }
        
        // Take only the first 6 valid news items
        const validNews = news
            .filter(item => item.headline && item.summary)
            .slice(0, 6);
            
        console.log('Filtered news items:', validNews);
        
        if (validNews.length > 0) {
            updateNewsSection(validNews);
        } else {
            throw new Error('No valid news items found');
        }
    } catch (error) {
        console.error('Detailed error in fetchMarketNews:', error);
        handleNewsError();
    }
}

function updateNewsSection(newsItems) {
    const newsContainer = document.getElementById('newsContainer');
    console.log('Updating news container:', newsContainer);
    console.log('With news items:', newsItems);
    
    if (!newsContainer) {
        console.error('News container element not found!');
        return;
    }
    
    try {
        const newsHTML = newsItems.map(news => {
            console.log('Processing news item:', news);
            return `
                <div class="news-card" onclick="window.open('${news.url}', '_blank')">
                    <div class="news-content">
                        <h3 class="news-title">${news.headline || 'No headline available'}</h3>
                        <p class="news-summary">${(news.summary || 'No summary available').slice(0, 150)}...</p>
                        <div class="news-meta">
                            <span class="news-source">${news.source || 'Unknown source'}</span>
                            <span class="news-time">${formatNewsDate(news.datetime)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log('Generated HTML:', newsHTML);
        newsContainer.innerHTML = newsHTML;
    } catch (error) {
        console.error('Error in updateNewsSection:', error);
        handleNewsError();
    }
}

function handleNewsError() {
    const newsContainer = document.getElementById('newsContainer');
    if (newsContainer) {
        newsContainer.innerHTML = `
            <div class="news-error">
                <p>Unable to load market news. Please try again later.</p>
            </div>
        `;
    }
}

function formatNewsDate(timestamp) {
    try {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Date unavailable';
    }
}

// Add this function to calculate market statistics
function calculateMarketStats(stocksData) {
    const totalValue = stocksData.reduce((sum, stock) => sum + stock.price, 0);
    const averageChange = stocksData.reduce((sum, stock) => sum + stock.change, 0) / stocksData.length;
    
    // Update the stats in the UI
    document.getElementById('totalMarketValue').textContent = 
        `$${totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    
    const changeElement = document.getElementById('totalMarketChange');
    changeElement.textContent = `${averageChange >= 0 ? '+' : ''}${averageChange.toFixed(2)}%`;
    changeElement.className = `stat-value ${averageChange >= 0 ? 'positive' : 'negative'}`;
    
    document.getElementById('activeStocks').textContent = stocksData.length;
}

// Update your existing fetchMarketMovers function
async function fetchMarketMovers() {
    try {
        console.log('Fetching market data...');
        const stocksData = await Promise.all(
            STOCK_SYMBOLS.map(async (symbol) => {
                const response = await fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`);
                const data = await response.json();
                return {
                    symbol,
                    price: data.c,
                    change: data.dp
                };
            })
        );

        calculateMarketStats(stocksData);
    } catch (error) {
        console.error('Error fetching market data:', error);
        handleMarketDataError();
    }
}

function calculateMarketStats(stocksData) {
    const totalValue = stocksData.reduce((sum, stock) => sum + stock.price, 0);
    const averageChange = stocksData.reduce((sum, stock) => sum + stock.change, 0) / stocksData.length;
    
    updateMarketStats(totalValue, averageChange, stocksData.length);
}

function updateMarketStats(totalValue, averageChange, activeStocks) {
    document.getElementById('totalMarketValue').textContent = 
        `$${totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    
    const changeElement = document.getElementById('totalMarketChange');
    changeElement.textContent = `${averageChange >= 0 ? '+' : ''}${averageChange.toFixed(2)}%`;
    changeElement.className = `stat-value ${averageChange >= 0 ? 'positive' : 'negative'}`;
    
    document.getElementById('activeStocks').textContent = activeStocks;
}

function handleMarketDataError() {
    const elements = ['totalMarketValue', 'totalMarketChange', 'activeStocks'];
    elements.forEach(id => {
        document.getElementById(id).textContent = 'N/A';
    });
}

// Add this to your existing JavaScript
class AuthManager {
    constructor() {
        this.modal = document.getElementById('signInModal');
        this.signInBtn = document.getElementById('signInBtn');
        this.signOutBtn = document.getElementById('signOutBtn');
        this.userInfo = document.getElementById('userInfo');
        this.userNameSpan = document.getElementById('userName');
        this.closeBtn = document.querySelector('.close');
        this.signInForm = document.getElementById('signInForm');
        this.emailInput = document.getElementById('email');
        this.emailError = document.getElementById('emailError');
        
        this.init();
    }

    init() {
        this.checkAuthState();
        
        // Event listeners
        this.signInBtn.addEventListener('click', () => this.openModal());
        this.signOutBtn.addEventListener('click', () => this.signOut());
        this.closeBtn.addEventListener('click', () => this.closeModal());
        this.signInForm.addEventListener('submit', (e) => this.handleSignIn(e));
        
        // Real-time email validation
        this.emailInput.addEventListener('input', () => this.validateEmail());
        
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    validateEmail() {
        const email = this.emailInput.value;
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        
        if (!emailRegex.test(email)) {
            this.emailError.textContent = 'Please enter a valid email address';
            this.emailError.style.display = 'block';
            this.emailInput.classList.add('invalid');
            return false;
        } else {
            this.emailError.style.display = 'none';
            this.emailInput.classList.remove('invalid');
            return true;
        }
    }

    handleSignIn(e) {
        e.preventDefault();
        
        if (!this.validateEmail()) {
            // Shake the email input to indicate error
            this.emailInput.classList.add('shake');
            setTimeout(() => this.emailInput.classList.remove('shake'), 500);
            return;
        }
        
        const name = document.getElementById('name').value;
        const email = this.emailInput.value;
        
        // Save to localStorage
        const userData = { name, email };
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Update UI
        this.updateUI(name);
        this.closeModal();
    }

    checkAuthState() {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const { name } = JSON.parse(userData);
            this.updateUI(name);
        }
    }

    openModal() {
        this.modal.style.display = 'block';
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.signInForm.reset();
    }

    signOut() {
        localStorage.removeItem('userData');
        this.signInBtn.style.display = 'block';
        this.userInfo.style.display = 'none';
    }

    updateUI(name) {
        this.userNameSpan.textContent = name;
        this.signInBtn.style.display = 'none';
        this.userInfo.style.display = 'flex';
    }
}

async function fetchMarketData() {
    try {
        const response = await fetch('YOUR_API_ENDPOINT'); // Replace with your API endpoint
        const data = await response.json();

        // Assuming the data contains an array of stocks with price and time
        const labels = data.map(stock => stock.time); // Adjust according to your data structure
        const prices = data.map(stock => stock.price); // Adjust according to your data structure

        createMarketChart(labels, prices);
    } catch (error) {
        console.error('Error fetching market data:', error);
    }
}

function createMarketChart(labels, prices) {
    const ctx = document.getElementById('marketChart').getContext('2d');
    const marketChart = new Chart(ctx, {
        type: 'line', // You can change this to 'bar', 'pie', etc.
        data: {
            labels: labels,
            datasets: [{
                label: 'Stock Prices Today',
                data: prices,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Call fetchMarketData to load the data and create the chart
fetchMarketData();

