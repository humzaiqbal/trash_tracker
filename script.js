// DOM Elements
let nameInput;
let emailInput;
let loginButton;
let routesSection;
let routesContainer;
let logoutButton;
let currentUserDisplay;

// Initialize DOM elements
function initDOMElements() {
    nameInput = document.getElementById('name-input');
    emailInput = document.getElementById('email-input');
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
    
    // Form inputs enter key
    if (nameInput && emailInput) {
        [nameInput, emailInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    login();
                }
            });
        });
    }
}

// User class to store user information
class User {
    constructor(name, email) {
        this.name = name;
        this.email = email;
        this.id = this.generateUserId();
    }
    
    generateUserId() {
        // Create a unique ID based on name and email
        return `${this.email.toLowerCase().replace(/[^a-z0-9]/g, '')}_${this.name.toLowerCase().replace(/\s+/g, '_')}`;
    }
    
    // For display purposes
    getDisplayName() {
        return this.name;
    }
    
    // For comparison purposes
    equals(otherUser) {
        return this.id === otherUser.id;
    }
}

// State
let currentUser = null;
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
            
            // Fix any invalid data structures
            fixInvalidRouteData();
            
            renderRoutes();
        }
    });
    
    // Check if user is already logged in
    const savedUserData = localStorage.getItem('currentUser');
    if (savedUserData) {
        try {
            const userData = JSON.parse(savedUserData);
            currentUser = new User(userData.name, userData.email);
            
            if (currentUser) {
                nameInput.value = currentUser.name;
                emailInput.value = currentUser.email;
                showRoutes();
            }
        } catch (e) {
            console.error('Error parsing saved user data:', e);
            localStorage.removeItem('currentUser');
        }
    }
}

// Fix invalid route data
function fixInvalidRouteData() {
    let hasInvalidData = false;
    
    routes.forEach(route => {
        // Fix missing or invalid people array
        if (!route.people || !Array.isArray(route.people)) {
            console.warn(`Fixing invalid people data for route ${route.id} (${route.name}):`, route.people);
            route.people = [];
            hasInvalidData = true;
        }
    });
    
    // If we found and fixed invalid data, update Firebase
    if (hasInvalidData) {
        console.log('Fixing invalid route data in Firebase');
        routesRef.set(routes);
    }
}

// Login functionality
function login() {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    
    if (name && email) {
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        currentUser = new User(name, email);
        localStorage.setItem('currentUser', JSON.stringify({
            name: currentUser.name,
            email: currentUser.email
        }));
        
        // Store user in Firebase
        usersRef.child(currentUser.id).set({
            name: currentUser.name,
            email: currentUser.email,
            id: currentUser.id
        });
        
        showRoutes();
    } else {
        alert('Please enter both your name and email');
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Logout functionality
function logout() {
    console.log('Logout function called');
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLogin();
}

// Show routes section
function showRoutes() {
    document.querySelector('.login-section').classList.add('hidden');
    routesSection.classList.remove('hidden');
    currentUserDisplay.textContent = `Logged in as: ${currentUser.getDisplayName()}`;
    renderRoutes();
}

// Show login section
function showLogin() {
    console.log('showLogin function called');
    document.querySelector('.login-section').classList.remove('hidden');
    routesSection.classList.add('hidden');
    nameInput.value = '';
    emailInput.value = '';
    nameInput.focus();
}

// Ensure people are User objects
function ensurePeopleAreUserObjects(people) {
    // Check if people is not an array or is null/undefined
    if (!people || !Array.isArray(people)) {
        console.warn('People is not an array:', people);
        return [];
    }
    
    return people.map(person => {
        if (typeof person === 'string') {
            // Legacy format - just a name string
            return { name: person, id: person.toLowerCase().replace(/\s+/g, '_') };
        } else if (typeof person === 'object' && person !== null) {
            // New format - user object with id
            if (person.id) {
                return person;
            }
            // New format - user object without id (need to generate one)
            else if (person.name && person.email) {
                const id = `${person.email.toLowerCase().replace(/[^a-z0-9]/g, '')}_${person.name.toLowerCase().replace(/\s+/g, '_')}`;
                return { ...person, id };
            }
            // Partial user object
            else if (person.name) {
                return { name: person.name, id: person.name.toLowerCase().replace(/\s+/g, '_') };
            }
        }
        // Fallback
        return { name: 'Unknown', id: 'unknown' };
    });
}

// Check if a user is assigned to a route
function isUserAssignedToRoute(user, routePeople) {
    if (!user || !routePeople) return false;
    
    // Ensure routePeople is an array
    if (!Array.isArray(routePeople)) {
        console.warn('routePeople is not an array:', routePeople);
        return false;
    }
    
    const peopleObjects = ensurePeopleAreUserObjects(routePeople);
    
    // First try to match by ID (most accurate)
    const matchById = peopleObjects.some(person => person.id === user.id);
    if (matchById) return true;
    
    // If no ID match, try to match by email (for backward compatibility)
    if (user.email) {
        const matchByEmail = peopleObjects.some(person => 
            person.email && person.email.toLowerCase() === user.email.toLowerCase()
        );
        if (matchByEmail) return true;
    }
    
    // No match found
    return false;
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
        // Ensure route has a people property and it's an array
        if (!route.people || !Array.isArray(route.people)) {
            console.warn(`Route ${route.id} (${route.name}) has invalid people data:`, route.people);
            route.people = [];
        }
        
        const routeCard = document.createElement('div');
        routeCard.className = 'route-card';
        
        // Convert people array to User objects if they're not already
        const peopleObjects = ensurePeopleAreUserObjects(route.people || []);
        
        // Check if current user is assigned to this route
        const isAssigned = currentUser && isUserAssignedToRoute(currentUser, peopleObjects);
        
        const peopleCount = peopleObjects.length;
        
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
                ${peopleObjects.map(person => `
                    <span class="person-tag" title="${person.email || ''}">
                        ${person.name || person}
                        ${person.email ? `<span class="person-email">(${person.email})</span>` : ''}
                    </span>
                `).join('')}
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
    
    if (!route || !currentUser) return;
    
    // Initialize people array if it doesn't exist or is not an array
    if (!route.people || !Array.isArray(route.people)) {
        route.people = [];
    }
    
    // Convert people array to User objects if they're not already
    const peopleObjects = ensurePeopleAreUserObjects(route.people);
    
    // Check if current user is assigned to this route
    const isAssigned = isUserAssignedToRoute(currentUser, peopleObjects);
    
    if (isAssigned) {
        // Unassign user - remove by ID, email, or name (in that order of preference)
        route.people = peopleObjects.filter(person => {
            // If we have IDs for both, compare IDs
            if (person.id && currentUser.id) {
                return person.id !== currentUser.id;
            }
            // If we have emails for both, compare emails
            else if (person.email && currentUser.email) {
                return person.email.toLowerCase() !== currentUser.email.toLowerCase();
            }
            // Fallback to name comparison
            else {
                return person.name !== currentUser.name;
            }
        });
    } else {
        // Check if user is already assigned to another route
        const alreadyAssignedRoute = routes.find(r => {
            if (!r.people || !Array.isArray(r.people)) return false;
            return isUserAssignedToRoute(currentUser, r.people);
        });
        
        if (alreadyAssignedRoute) {
            if (confirm(`You are already assigned to "${alreadyAssignedRoute.name}". Do you want to switch to "${route.name}"?`)) {
                // Remove from previous route
                const routePeople = ensurePeopleAreUserObjects(alreadyAssignedRoute.people);
                alreadyAssignedRoute.people = routePeople.filter(person => {
                    // If we have IDs for both, compare IDs
                    if (person.id && currentUser.id) {
                        return person.id !== currentUser.id;
                    }
                    // If we have emails for both, compare emails
                    else if (person.email && currentUser.email) {
                        return person.email.toLowerCase() !== currentUser.email.toLowerCase();
                    }
                    // Fallback to name comparison
                    else {
                        return person.name !== currentUser.name;
                    }
                });
                updateRouteInFirebase(alreadyAssignedRoute);
                
                // Add to new route
                route.people.push({
                    name: currentUser.name,
                    email: currentUser.email,
                    id: currentUser.id
                });
            }
        } else {
            // Assign user to route
            route.people.push({
                name: currentUser.name,
                email: currentUser.email,
                id: currentUser.id
            });
        }
    }
    
    updateRouteInFirebase(route);
}

// Update a route in Firebase
function updateRouteInFirebase(route) {
    // Ensure route.people is an array before saving
    if (!Array.isArray(route.people)) {
        route.people = [];
    }
    
    routesRef.child(route.id - 1).update(route);
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    initDOMElements();
    initializeFirebase();
    loadData();
}); 