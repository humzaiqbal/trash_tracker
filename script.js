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
        try {
            if (snapshot.exists()) {
                console.log('Raw Firebase data:', snapshot.val());
                
                // Convert to array safely
                const rawData = snapshot.val();
                if (Array.isArray(rawData)) {
                    routes = rawData;
                } else if (typeof rawData === 'object' && rawData !== null) {
                    // Handle object format (keys might be indices or route IDs)
                    routes = Object.values(rawData);
                } else {
                    console.error('Unexpected data format from Firebase:', rawData);
                    routes = [];
                }
                
                // Fix any invalid data structures
                fixInvalidRouteData();
                
                // Render routes after fixing
                renderRoutes();
            } else {
                console.log('No data exists in Firebase, initializing with default routes');
                routesRef.set(routes);
            }
        } catch (error) {
            console.error('Error processing Firebase data:', error);
            // Use default routes as fallback
            routes = [
                { id: 1, name: '18th Street from Mission to Guerrero and 18th to 19th along Valencia', people: [] },
                { id: 2, name: '19th Street from Mission and 19th to 20th along Valencia', people: [] },
                { id: 3, name: '20th Street from Mission and 20th to 21st along Valencia', people: [] },
                { id: 4, name: '21st Street from Mission and 21st to 22nd along Valencia', people: [] },
                { id: 5, name: '22nd Street from Mission and 22nd to 23rd along Valencia', people: [] },
                { id: 6, name: '23rd Street from Mission and 23rd to 24th along Valencia', people: [] },
                { id: 7, name: '24th Street from Mission and 24th to 25th along Valencia', people: [] },
                { id: 8, name: 'Mission St from 19th to 23rd', people: [] },
                {id: 9, name: 'San Carlos Street from 19th to 21st; Lexington street from 19th to 21st', people: []},
                {id: 10, name: 'Guerrero between 18th and Liberty Street; Liberty street from Guerrero to Valencia', people: [] },
                {id: 11, name: 'Guerrero between Liberty Street and 22nd; Hill Street from Guerrero to Valencia', people: []},
            ];
            renderRoutes();
        }
    }, error => {
        console.error('Firebase data loading error:', error);
        alert('There was an error loading route data. Please try refreshing the page.');
    });
    
    // Check if user is already logged in
    const savedUserData = localStorage.getItem('currentUser');
    if (savedUserData) {
        try {
            const userData = JSON.parse(savedUserData);
            if (userData && userData.name && userData.email) {
                currentUser = new User(userData.name, userData.email);
                
                if (currentUser) {
                    nameInput.value = currentUser.name;
                    emailInput.value = currentUser.email;
                    showRoutes();
                }
            } else {
                console.warn('Invalid user data in localStorage:', userData);
                localStorage.removeItem('currentUser');
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
    
    // First, ensure routes is an array
    if (!Array.isArray(routes)) {
        console.error('Routes is not an array:', routes);
        routes = [];
        hasInvalidData = true;
    }
    
    // Check each route
    routes.forEach((route, index) => {
        // Check if route is a valid object
        if (!route || typeof route !== 'object') {
            console.error(`Invalid route at index ${index}:`, route);
            routes[index] = { 
                id: index + 1, 
                name: `Route ${index + 1}`, 
                people: [] 
            };
            hasInvalidData = true;
            return;
        }
        
        // Ensure route has an id
        if (!route.id) {
            console.warn(`Route at index ${index} missing id:`, route);
            route.id = index + 1;
            hasInvalidData = true;
        }
        
        // Ensure route has a name
        if (!route.name) {
            console.warn(`Route ${route.id} missing name:`, route);
            route.name = `Route ${route.id}`;
            hasInvalidData = true;
        }
        
        // Fix missing or invalid people array
        if (!route.people || !Array.isArray(route.people)) {
            console.warn(`Fixing invalid people data for route ${route.id} (${route.name}):`, route.people);
            route.people = [];
            hasInvalidData = true;
        } else {
            // Check each person in the people array
            const validPeople = [];
            route.people.forEach((person, personIndex) => {
                if (!person) {
                    console.warn(`Null or undefined person at index ${personIndex} in route ${route.id}`);
                    return; // Skip this person
                }
                
                if (typeof person === 'string') {
                    // Convert string to object
                    validPeople.push({ 
                        name: person, 
                        id: person.toLowerCase().replace(/\s+/g, '_') 
                    });
                } else if (typeof person === 'object') {
                    // Ensure person has at least a name
                    if (!person.name) {
                        console.warn(`Person missing name in route ${route.id}:`, person);
                        person.name = 'Unknown User';
                    }
                    
                    // Ensure person has an id
                    if (!person.id) {
                        if (person.email) {
                            person.id = `${person.email.toLowerCase().replace(/[^a-z0-9]/g, '')}_${person.name.toLowerCase().replace(/\s+/g, '_')}`;
                        } else {
                            person.id = person.name.toLowerCase().replace(/\s+/g, '_');
                        }
                    }
                    
                    validPeople.push(person);
                } else {
                    console.warn(`Invalid person data type at index ${personIndex} in route ${route.id}:`, person);
                }
            });
            
            // Replace the people array with the validated one
            if (validPeople.length !== route.people.length) {
                console.warn(`Fixed people array for route ${route.id}, removed ${route.people.length - validPeople.length} invalid entries`);
                route.people = validPeople;
                hasInvalidData = true;
            }
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

// Reset Firebase database to default values
function resetFirebaseDatabase() {
    if (confirm('WARNING: This will reset all route data to default values and remove all user assignments. Are you sure?')) {
        const defaultRoutes = [
            { id: 1, name: '18th Street from Mission to Guerrero and 18th to 19th along Valencia', people: [] },
            { id: 2, name: '19th Street from Mission and 19th to 20th along Valencia', people: [] },
            { id: 3, name: '20th Street from Mission and 20th to 21st along Valencia', people: [] },
            { id: 4, name: '21st Street from Mission and 21st to 22nd along Valencia', people: [] },
            { id: 5, name: '22nd Street from Mission and 22nd to 23rd along Valencia', people: [] },
            { id: 6, name: '23rd Street from Mission and 23rd to 24th along Valencia', people: [] },
            { id: 7, name: '24th Street from Mission and 24th to 25th along Valencia', people: [] },
            { id: 8, name: 'Mission St from 19th to 23rd', people: [] },
        ];
        
        // Reset routes in Firebase
        routesRef.set(defaultRoutes)
            .then(() => {
                console.log('Firebase database reset successfully');
                alert('Database reset successfully. The page will now reload.');
                window.location.reload();
            })
            .catch(error => {
                console.error('Error resetting Firebase database:', error);
                alert('Error resetting database: ' + error.message);
            });
    }
}

// Add debug button to UI
function addDebugButton() {
    // Only add in development or if there's a URL parameter
    const isDebugMode = window.location.search.includes('debug=true');
    if (!isDebugMode) return;
    
    const container = document.querySelector('.container');
    if (!container) return;
    
    const debugSection = document.createElement('div');
    debugSection.className = 'debug-section';
    debugSection.innerHTML = `
        <h3>Debug Tools</h3>
        <div class="debug-buttons">
            <button id="reset-database-button" class="debug-button">Reset Database</button>
            <button id="fix-data-button" class="debug-button">Fix Data Structure</button>
            <button id="show-data-button" class="debug-button">Show Raw Data</button>
        </div>
    `;
    
    container.appendChild(debugSection);
    
    // Add event listeners
    document.getElementById('reset-database-button').addEventListener('click', resetFirebaseDatabase);
    document.getElementById('fix-data-button').addEventListener('click', () => {
        fixInvalidRouteData();
        alert('Data structure check completed. Check console for details.');
    });
    document.getElementById('show-data-button').addEventListener('click', () => {
        console.log('Current routes data:', routes);
        routesRef.once('value', snapshot => {
            console.log('Raw Firebase data:', snapshot.val());
        });
        alert('Raw data has been logged to the console. Press F12 to view.');
    });
    
    // Add debug styles
    const style = document.createElement('style');
    style.textContent = `
        .debug-section {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
        }
        .debug-section h3 {
            color: #721c24;
            margin-bottom: 10px;
        }
        .debug-buttons {
            display: flex;
            gap: 10px;
        }
        .debug-button {
            background-color: #dc3545;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
        }
        .debug-button:hover {
            background-color: #c82333;
        }
    `;
    document.head.appendChild(style);
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    initDOMElements();
    initializeFirebase();
    loadData();
    addDebugButton(); // Add debug button if in debug mode
}); 