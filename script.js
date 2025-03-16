// DOM Elements
let nameInput;
let loginButton;
let routesSection;
let routesContainer;
let logoutButton;
let currentUserDisplay;

// Initialize DOM elements
function initDOMElements() {
    nameInput = document.getElementById('name-input');
    loginButton = document.getElementById('login-button');
    routesSection = document.getElementById('routes-section');
    routesContainer = document.getElementById('routes-container');
    logoutButton = document.getElementById('logout-button');
    currentUserDisplay = document.getElementById('current-user-display');
    
    // Debug DOM elements
    console.log('Logout button element:', logoutButton);
    
    // Set up event listeners
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    // Login button
    if (loginButton) {
        loginButton.addEventListener('click', login);
    }
    
    // Logout button
    if (logoutButton) {
        console.log('Adding event listener to logout button');
        logoutButton.addEventListener('click', function() {
            console.log('Logout button clicked');
            logout();
        });
    } else {
        console.error('Logout button not found in the DOM');
    }
    
    // Name input enter key
    if (nameInput) {
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                login();
            }
        });
    }
}

// State
let currentUser = '';
let routes = [
    { id: 1, name: '18th Street from Mission to Guerrero and 18th to 19th along Valencia', people: [] },
    { id: 2, name: '19th Street from Mission and 19th to 20th along Valencia', people: [] },
    { id: 3, name: '20th Street from Mission and 20th to 21st along Valencia', people: [] },
    { id: 4, name: '21st Street from Mission and 21st to 22nd along Valencia', people: [] },
    { id: 5, name: '22nd Street from Mission and 22nd to 23rd along Valencia', people: [] },
    { id: 6, name: '23rd Street from Mission and 23rd to 24th along Valencia', people: [] },
    { id: 7, name: '24th Street from Mission and 24th to 25th along Valencia', people: [] },
    { id: 8, name: 'Mission St from 19th to 23rd', people: [] },
    
];

// Firebase references
const routesRef = database.ref('routes');
const usersRef = database.ref('users');

// Initialize data in Firebase if it doesn't exist
function initializeFirebase() {
    routesRef.once('value', snapshot => {
        if (!snapshot.exists()) {
            // If routes don't exist in Firebase, initialize them
            routesRef.set(routes);
        }
    });
}

// Load data from Firebase
function loadData() {
    // Get routes from Firebase
    routesRef.on('value', snapshot => {
        if (snapshot.exists()) {
            routes = Object.values(snapshot.val());
            renderRoutes();
        }
    });
    
    // Check if user is already logged in
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
        localStorage.setItem('currentUser', currentUser);
        showRoutes();
    } else {
        alert('Please enter your name');
    }
}

// Logout functionality
function logout() {
    console.log('Logout function called');
    currentUser = '';
    localStorage.removeItem('currentUser');
    showLogin();
}

// Show routes section
function showRoutes() {
    document.querySelector('.login-section').classList.add('hidden');
    routesSection.classList.remove('hidden');
    currentUserDisplay.textContent = `Logged in as: ${currentUser}`;
    renderRoutes();
}

// Show login section
function showLogin() {
    console.log('showLogin function called');
    document.querySelector('.login-section').classList.remove('hidden');
    routesSection.classList.add('hidden');
    nameInput.value = '';
    nameInput.focus();
}

// Render all routes
function renderRoutes() {
    routesContainer.innerHTML = '';
    
    // Add a reminder about the recommended maximum
    const reminderElement = document.createElement('div');
    reminderElement.className = 'route-reminder';
    reminderElement.innerHTML = '<p>Routes with <span class="full-route">5 or more people</span> have reached the recommended maximum.</p>';
    routesContainer.appendChild(reminderElement);
    
    routes.forEach(route => {
        const routeCard = document.createElement('div');
        routeCard.className = 'route-card';
        
        // Check if current user is assigned to this route
        const isAssigned = route.people && route.people.includes(currentUser);
        const peopleCount = route.people ? route.people.length : 0;
        
        // Check if route has reached or exceeded the recommended maximum
        const isAtMaximum = peopleCount >= 5;
        
        if (isAtMaximum) {
            routeCard.classList.add('route-at-maximum');
        }
        
        routeCard.innerHTML = `
            <div class="route-header">
                <span class="route-name">${route.name} <span class="route-count-inline ${isAtMaximum ? 'maximum-reached' : ''}">(${peopleCount} ${peopleCount === 1 ? 'person' : 'people'})</span></span>
                <span class="route-count ${isAtMaximum ? 'maximum-reached' : ''}">${peopleCount} ${peopleCount === 1 ? 'person' : 'people'}</span>
            </div>
            <div class="route-people">
                ${route.people ? route.people.map(person => `<span class="person-tag">${person}</span>`).join('') : ''}
            </div>
            <button class="assign-button ${isAssigned ? 'assigned' : ''} ${isAtMaximum && !isAssigned ? 'maximum-warning' : ''}" data-route-id="${route.id}">
                ${isAssigned ? 'Unassign Me' : isAtMaximum ? 'Assign Me (Full)' : 'Assign Me'}
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
    
    // Initialize people array if it doesn't exist
    if (!route.people) {
        route.people = [];
    }
    
    const isAssigned = route.people.includes(currentUser);
    
    if (isAssigned) {
        // Unassign user
        route.people = route.people.filter(person => person !== currentUser);
    } else {
        // Check if user is already assigned to another route
        const alreadyAssignedRoute = routes.find(r => r.people && r.people.includes(currentUser));
        if (alreadyAssignedRoute) {
            if (confirm(`You are already assigned to "${alreadyAssignedRoute.name}". Do you want to switch to "${route.name}"?`)) {
                // Remove from previous route
                alreadyAssignedRoute.people = alreadyAssignedRoute.people.filter(person => person !== currentUser);
                updateRouteInFirebase(alreadyAssignedRoute);
                
                // Add to new route
                route.people.push(currentUser);
            }
        } else {
            // Assign user to route
            route.people.push(currentUser);
        }
    }
    
    updateRouteInFirebase(route);
}

// Update a route in Firebase
function updateRouteInFirebase(route) {
    routesRef.child(route.id - 1).update(route);
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    initDOMElements();
    initializeFirebase();
    loadData();
}); 