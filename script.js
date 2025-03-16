// DOM Elements
const nameInput = document.getElementById('name-input');
const loginButton = document.getElementById('login-button');
const routesSection = document.getElementById('routes-section');
const routesContainer = document.getElementById('routes-container');

// State
let currentUser = '';
let routes = [
    { id: 1, name: 'Downtown Route', people: [] },
    { id: 2, name: 'Riverside Path', people: [] },
    { id: 3, name: 'Mountain Trail', people: [] },
    { id: 4, name: 'Beach Cleanup', people: [] },
    { id: 5, name: 'Park Route', people: [] }
];

// Save data to localStorage
function saveData() {
    localStorage.setItem('routes', JSON.stringify(routes));
    localStorage.setItem('currentUser', currentUser);
}

// Load data from localStorage
function loadData() {
    const savedRoutes = localStorage.getItem('routes');
    if (savedRoutes) {
        routes = JSON.parse(savedRoutes);
    }
    
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        if (currentUser) {
            nameInput.value = currentUser;
            showRoutes();
        }
    }
}

// Login functionality
function login() {
    const name = nameInput.value.trim();
    if (name) {
        currentUser = name;
        saveData();
        showRoutes();
        
        // Show local storage notification
        showLocalStorageNotification();
    } else {
        alert('Please enter your name');
    }
}

// Show local storage notification
function showLocalStorageNotification() {
    // Create notification element if it doesn't exist
    if (!document.getElementById('storage-notification')) {
        const notification = document.createElement('div');
        notification.id = 'storage-notification';
        notification.className = 'notification';
        notification.innerHTML = `
            <p>Note: Data is stored only on your device. Other users won't see your assignments unless they use the same device.</p>
            <button id="close-notification">✕</button>
        `;
        
        document.body.appendChild(notification);
        
        // Add event listener to close button
        document.getElementById('close-notification').addEventListener('click', () => {
            notification.style.display = 'none';
            localStorage.setItem('notification-dismissed', 'true');
        });
        
        // Check if notification was previously dismissed
        if (localStorage.getItem('notification-dismissed') === 'true') {
            notification.style.display = 'none';
        }
    }
}

// Show routes section
function showRoutes() {
    document.querySelector('.login-section').classList.add('hidden');
    routesSection.classList.remove('hidden');
    renderRoutes();
}

// Render all routes
function renderRoutes() {
    routesContainer.innerHTML = '';
    
    routes.forEach(route => {
        const routeCard = document.createElement('div');
        routeCard.className = 'route-card';
        
        // Check if current user is assigned to this route
        const isAssigned = route.people.includes(currentUser);
        
        routeCard.innerHTML = `
            <div class="route-header">
                <span class="route-name">${route.name}</span>
                <span class="route-count">${route.people.length} people</span>
            </div>
            <div class="route-people">
                ${route.people.map(person => `<span class="person-tag">${person}</span>`).join('')}
            </div>
            <button class="assign-button ${isAssigned ? 'assigned' : ''}" data-route-id="${route.id}">
                ${isAssigned ? 'Unassign Me' : 'Assign Me'}
            </button>
        `;
        
        routesContainer.appendChild(routeCard);
    });
    
    // Add event listeners to assign buttons
    document.querySelectorAll('.assign-button').forEach(button => {
        button.addEventListener('click', handleAssignment);
    });
}

// Handle assignment/unassignment
function handleAssignment(event) {
    const routeId = parseInt(event.target.getAttribute('data-route-id'));
    const route = routes.find(r => r.id === routeId);
    
    if (!route) return;
    
    const isAssigned = route.people.includes(currentUser);
    
    if (isAssigned) {
        // Unassign user
        route.people = route.people.filter(person => person !== currentUser);
    } else {
        // Check if user is already assigned to another route
        const alreadyAssignedRoute = routes.find(r => r.people.includes(currentUser));
        if (alreadyAssignedRoute) {
            if (confirm(`You are already assigned to "${alreadyAssignedRoute.name}". Do you want to switch to "${route.name}"?`)) {
                // Remove from previous route
                alreadyAssignedRoute.people = alreadyAssignedRoute.people.filter(person => person !== currentUser);
                // Add to new route
                route.people.push(currentUser);
            }
        } else {
            // Assign user to route
            route.people.push(currentUser);
        }
    }
    
    saveData();
    renderRoutes();
}

// Event Listeners
loginButton.addEventListener('click', login);
nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        login();
    }
});

// Initialize
loadData(); 