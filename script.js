// DOM Elements
let nameInput;
let emailInput;
let loginButton;
let routesSection;
let routesContainer;
let logoutButton;
let currentUserDisplay;

// QR Code Variables
let generateQRButton;
let saveQRButton;
let closeQRButton;
let qrCodeContainer;
let qrModal;
let closeModalButton;

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
    
    // Initialize QR code elements
    initQRCodeElements();
    
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
    { id: 2, name: '19th Street from Mission to Guerrero and 19th to 20th along Valencia', people: [] },
    { id: 3, name: '20th Street from Mission to Guerrero and 20th to 21st along Valencia', people: [] },
    { id: 4, name: '21st Street from Mission to Guerrero and 21st to 22nd along Valencia', people: [] },
    { id: 5, name: '22nd Street from Mission to Guerrero and 22nd to 23rd along Valencia', people: [] },
    { id: 6, name: '23rd Street from Mission to Guerrero and 23rd to 24th along Valencia', people: [] },
    { id: 7, name: '24th Street from Mission to Guerrero and 24th to 25th along Valencia', people: [] },
    { id: 8, name: 'Mission St from 19th to 23rd', people: [] },
    { id: 9, name: 'San Carlos Street from 19th to 21st; Lexington street from 19th to 21st', people: [] },
    { id: 10, name: 'Guerrero between 18th and Liberty Street; Liberty street from Guerrero to Valencia', people: [] },
    { id: 11, name: 'Guerrero between Liberty Street and 22nd; Hill Street from Guerrero to Valencia', people: [] },
];

// Firebase references
const routesRef = database.ref('routes');
const usersRef = database.ref('users');

// Initialize data in Firebase if it doesn't exist
function initializeFirebase() {
    routesRef.once('value', snapshot => {
        // Check if there are issues with the data structure
        let needsReset = false;
        
        if (!snapshot.exists()) {
            // If routes don't exist in Firebase, initialize them
            needsReset = true;
        } else {
            // Check if the existing data has valid structure
            const data = snapshot.val();
            if (Array.isArray(data)) {
                // Check if all routes have properly initialized people arrays
                data.forEach(route => {
                    if (!route.people || !Array.isArray(route.people)) {
                        console.warn(`Route ${route.id} (${route.name}) has invalid people data, needs reset`);
                        needsReset = true;
                    }
                });
            } else {
                // Data is not an array, needs reset
                console.warn('Firebase data is not in the expected format, needs reset');
                needsReset = true;
            }
        }
        
        if (needsReset) {
            console.log('Initializing Firebase with default routes');
            
            // Make sure each route has a properly initialized people array
            const defaultRoutes = [
                { id: 1, name: '18th Street from Mission to Guerrero and 18th to 19th along Valencia', people: [] },
                { id: 2, name: '19th Street from Mission to Guerrero and 19th to 20th along Valencia', people: [] },
                { id: 3, name: '20th Street from Mission to Guerrero and 20th to 21st along Valencia', people: [] },
                { id: 4, name: '21st Street from Mission to Guerrero and 21st to 22nd along Valencia', people: [] },
                { id: 5, name: '22nd Street from Mission to Guerrero and 22nd to 23rd along Valencia', people: [] },
                { id: 6, name: '23rd Street from Mission to Guerrero and 23rd to 24th along Valencia', people: [] },
                { id: 7, name: '24th Street from Mission to Guerrero and 24th to 25th along Valencia', people: [] },
                { id: 8, name: 'Mission St from 19th to 23rd', people: [] },
                { id: 9, name: 'San Carlos Street from 19th to 21st; Lexington street from 19th to 21st', people: [] },
                { id: 10, name: 'Guerrero between 18th and Liberty Street; Liberty street from Guerrero to Valencia', people: [] },
                { id: 11, name: 'Guerrero between Liberty Street and 22nd; Hill Street from Guerrero to Valencia', people: [] },
            ];
            
            // Set the routes in Firebase
            routesRef.set(defaultRoutes)
                .then(() => {
                    console.log('Firebase successfully initialized with default routes');
                })
                .catch(error => {
                    console.error('Error initializing Firebase:', error);
                });
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
                    console.log('Firebase data loaded as array with', routes.length, 'routes');
                } else if (typeof rawData === 'object' && rawData !== null) {
                    // Handle object format (keys might be indices or route IDs)
                    routes = Object.values(rawData);
                    console.log('Firebase data loaded as object with', routes.length, 'routes');
                } else {
                    console.error('Unexpected data format from Firebase:', rawData);
                    routes = [];
                }
                
                // Check if all routes have people arrays
                const missingPeopleArrays = routes.filter(r => !r.people || !Array.isArray(r.people));
                if (missingPeopleArrays.length > 0) {
                    console.warn(`${missingPeopleArrays.length} routes have missing or invalid people arrays, will fix`);
                }
                
                // Fix any invalid data structures
                fixInvalidRouteData();
                
                // Check for missing routes and add them
                syncMissingRoutes();
                
                // Render routes after fixing
                renderRoutes();
            } else {
                console.log('No data exists in Firebase, initializing with default routes');
                syncRoutesToFirebase(); // Use our current routes array to initialize Firebase
            }
        } catch (error) {
            console.error('Error processing Firebase data:', error);
            // Use default routes as fallback and push to Firebase to fix the issue
            console.log('Using default routes as fallback due to error');
            routes = [
                { id: 1, name: '18th Street from Mission to Guerrero and 18th to 19th along Valencia', people: [] },
                { id: 2, name: '19th Street from Mission to Guerrero and 19th to 20th along Valencia', people: [] },
                { id: 3, name: '20th Street from Mission to Guerrero and 20th to 21st along Valencia', people: [] },
                { id: 4, name: '21st Street from Mission to Guerrero and 21st to 22nd along Valencia', people: [] },
                { id: 5, name: '22nd Street from Mission to Guerrero and 22nd to 23rd along Valencia', people: [] },
                { id: 6, name: '23rd Street from Mission to Guerrero and 23rd to 24th along Valencia', people: [] },
                { id: 7, name: '24th Street from Mission to Guerrero and 24th to 25th along Valencia', people: [] },
                { id: 8, name: 'Mission St from 19th to 23rd', people: [] },
                { id: 9, name: 'San Carlos Street from 19th to 21st; Lexington street from 19th to 21st', people: [] },
                { id: 10, name: 'Guerrero between 18th and Liberty Street; Liberty street from Guerrero to Valencia', people: [] },
                { id: 11, name: 'Guerrero between Liberty Street and 22nd; Hill Street from Guerrero to Valencia', people: [] },
            ];
            syncRoutesToFirebase(); // Push routes to Firebase
            renderRoutes();
        }
    }, error => {
        console.error('Firebase data loading error:', error);
        alert('There was an error loading route data. Please try refreshing the page. If the issue persists, try adding ?debug=true to the URL to access repair tools.');
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
    
    // Add privacy notice about email usage
    const privacyNotice = document.createElement('div');
    privacyNotice.className = 'privacy-notice';
    privacyNotice.innerHTML = `
        <p>While your name is visible to everyone, your email is private and only visible to you.<br>
        Your name tag is highlighted for your reference.</p>
    `;
    
    // Insert after the header-with-logout div
    const headerElement = routesSection.querySelector('.header-with-logout');
    if (headerElement) {
        headerElement.parentNode.insertBefore(privacyNotice, headerElement.nextSibling);
    }
    
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
        
        // Count the number of anonymous people associated with the current user
        let anonymousCount = 0;
        if (isAssigned && currentUser) {
            const currentUserEntry = peopleObjects.find(person => 
                person.id === currentUser.id || 
                (person.email && person.email.toLowerCase() === currentUser.email.toLowerCase())
            );
            if (currentUserEntry && currentUserEntry.anonymousCount) {
                anonymousCount = currentUserEntry.anonymousCount;
            }
        }
        
        const peopleCount = peopleObjects.length + getAnonymousTotalForRoute(peopleObjects);
        
        // Check if route has reached or exceeded the recommended maximum
        const isAtMaximum = peopleCount >= 5;
        
        if (isAtMaximum) {
            routeCard.classList.add('route-at-maximum');
        }
        
        let assignButtonHtml = '';
        if (isAssigned) {
            assignButtonHtml = `
                <div class="assign-actions">
                    <div class="anonymous-group-controls ${isAssigned ? '' : 'hidden'}">
                        <span class="anonymous-label">Group Members: </span>
                        <button class="anonymous-button decrease-button" data-route-id="${route.id}">-</button>
                        <span class="anonymous-count">${anonymousCount}</span>
                        <button class="anonymous-button increase-button" data-route-id="${route.id}">+</button>
                    </div>
                    <button class="assign-button assigned" data-route-id="${route.id}">Unassign Me</button>
                </div>
            `;
        } else {
            assignButtonHtml = `
                <div class="assign-actions">
                    <button class="assign-button ${isAtMaximum && !isAssigned ? 'maximum-warning' : ''}" data-route-id="${route.id}">
                        ${isAtMaximum ? 'Assign Me (Full)' : 'Assign Me'}
                    </button>
                </div>
            `;
        }
        
        // Generate HTML for all people tags
        const peopleTagsHtml = peopleObjects.map(person => {
            // Only show email for the current user (for their own reference)
            let personText = `${person.name || person}`;
            
            // Add email for the current user only
            if (currentUser && person.email && person.id === currentUser.id) {
                personText += `<span class="person-email">(${person.email})</span>`;
            }
            
            // Add anonymous count if present
            if (person.anonymousCount && person.anonymousCount > 0) {
                personText += `<span class="person-group-count">+${person.anonymousCount}</span>`;
            }
            
            // Keep email in the title attribute for hover tooltip, but only for the current user
            const titleText = (currentUser && person.id === currentUser.id) ? person.email || '' : '';
            
            // Add a special class to highlight the current user's tag
            const isCurrentUser = currentUser && person.id === currentUser.id;
            const personClass = isCurrentUser ? 'person-tag current-user' : 'person-tag';
            
            return `<span class="${personClass}" title="${titleText}">${personText}</span>`;
        }).join('');
        
        routeCard.innerHTML = `
            <div class="route-header">
                <span class="route-name">${route.name} <span class="route-count-inline ${isAtMaximum ? 'maximum-reached' : ''}">(${peopleCount} ${peopleCount === 1 ? 'person' : 'people'})</span></span>
                <span class="route-count ${isAtMaximum ? 'maximum-reached' : ''}">${peopleCount} ${peopleCount === 1 ? 'person' : 'people'}</span>
            </div>
            <div class="route-people">
                ${peopleTagsHtml}
            </div>
            ${assignButtonHtml}
        `;
        
        routesContainer.appendChild(routeCard);
    });
    
    // Add event listeners to assign buttons
    document.querySelectorAll('.assign-button').forEach(button => {
        button.addEventListener('click', handleAssignment);
    });
    
    // Add event listeners to anonymous group buttons
    document.querySelectorAll('.anonymous-button').forEach(button => {
        button.addEventListener('click', handleAnonymousGroupChange);
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
        // Get the user entry to preserve any anonymous count
        const userEntry = peopleObjects.find(person =>
            person.id === currentUser.id ||
            (person.email && person.email.toLowerCase() === currentUser.email.toLowerCase())
        );
        
        // Store the anonymous count
        const anonymousCount = userEntry && userEntry.anonymousCount ? userEntry.anonymousCount : 0;
        
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
                // Find the current user entry to preserve any anonymous count
                const routePeople = ensurePeopleAreUserObjects(alreadyAssignedRoute.people);
                const userEntry = routePeople.find(person =>
                    person.id === currentUser.id ||
                    (person.email && person.email.toLowerCase() === currentUser.email.toLowerCase())
                );
                
                // Store the anonymous count
                const anonymousCount = userEntry && userEntry.anonymousCount ? userEntry.anonymousCount : 0;
                
                // Remove from previous route
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
                
                // Add to new route with the same anonymous count
                route.people.push({
                    name: currentUser.name,
                    email: currentUser.email,
                    id: currentUser.id,
                    anonymousCount: anonymousCount
                });
            }
        } else {
            // Assign user to route (no anonymous members initially)
            route.people.push({
                name: currentUser.name,
                email: currentUser.email,
                id: currentUser.id,
                anonymousCount: 0
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
            { id: 2, name: '19th Street from Mission to Guerrero and 19th to 20th along Valencia', people: [] },
            { id: 3, name: '20th Street from Mission to Guerrero and 20th to 21st along Valencia', people: [] },
            { id: 4, name: '21st Street from Mission to Guerrero and 21st to 22nd along Valencia', people: [] },
            { id: 5, name: '22nd Street from Mission to Guerrero and 22nd to 23rd along Valencia', people: [] },
            { id: 6, name: '23rd Street from Mission to Guerrero and 23rd to 24th along Valencia', people: [] },
            { id: 7, name: '24th Street from Mission to Guerrero and 24th to 25th along Valencia', people: [] },
            { id: 8, name: 'Mission St from 19th to 23rd', people: [] },
            { id: 9, name: 'San Carlos Street from 19th to 21st; Lexington street from 19th to 21st', people: [] },
            { id: 10, name: 'Guerrero between 18th and Liberty Street; Liberty street from Guerrero to Valencia', people: [] },
            { id: 11, name: 'Guerrero between Liberty Street and 22nd; Hill Street from Guerrero to Valencia', people: [] },
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
            <button id="sync-routes-button" class="debug-button">Force Sync Routes</button>
            <a href="?repair=true" class="debug-button repair-link">Full Database Repair</a>
        </div>
        <p class="debug-note">Use Full Database Repair if you're seeing errors with the data structure. This will attempt to preserve user assignments while rebuilding the database.</p>
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
    document.getElementById('sync-routes-button').addEventListener('click', () => {
        syncMissingRoutes();
        alert('Routes synchronized. The page will now reload.');
        window.location.reload();
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
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 10px;
        }
        .debug-button {
            background-color: #dc3545;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            font-size: 14px;
        }
        .debug-button:hover {
            background-color: #c82333;
        }
        .repair-link {
            background-color: #28a745;
        }
        .repair-link:hover {
            background-color: #218838;
        }
        .debug-note {
            font-size: 12px;
            color: #721c24;
            margin-top: 5px;
        }
    `;
    document.head.appendChild(style);
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    initDOMElements();
    
    // Check for automatic repair mode
    if (window.location.search.includes('repair=true')) {
        repairDatabase();
    } else {
        initializeFirebase();
        loadData();
    }
    
    addDebugButton(); // Add debug button if in debug mode
});

// Repair database function
function repairDatabase() {
    console.log('Automatic database repair initiated...');
    
    // Create a notification to show the user what's happening
    const repairNotification = document.createElement('div');
    repairNotification.className = 'repair-notification';
    repairNotification.innerHTML = `
        <h2>Database Repair in Progress</h2>
        <p>We detected an issue with the database structure and are automatically repairing it.</p>
        <p>This will reset any problematic route data to its default state while preserving user assignments when possible.</p>
        <p>Status: <span id="repair-status">Initializing...</span></p>
    `;
    document.querySelector('.container').appendChild(repairNotification);
    
    const statusElement = document.getElementById('repair-status');
    
    // Step 1: Get current data
    statusElement.textContent = 'Loading current data...';
    
    routesRef.once('value')
        .then(snapshot => {
            statusElement.textContent = 'Repairing route structure...';
            
            let currentData = [];
            let existingAssignments = {};
            
            // Gather existing assignments if possible
            if (snapshot.exists()) {
                const data = snapshot.val();
                
                // Try to extract user assignments from existing data
                if (Array.isArray(data)) {
                    currentData = data;
                } else if (typeof data === 'object' && data !== null) {
                    currentData = Object.values(data);
                }
                
                // Save existing people assignments
                currentData.forEach(route => {
                    if (route && route.id && route.people && Array.isArray(route.people)) {
                        existingAssignments[route.id] = route.people;
                    }
                });
            }
            
            // Create repaired routes with proper structure
            const defaultRoutes = [
                { id: 1, name: '18th Street from Mission to Guerrero and 18th to 19th along Valencia', people: [] },
                { id: 2, name: '19th Street from Mission to Guerrero and 19th to 20th along Valencia', people: [] },
                { id: 3, name: '20th Street from Mission to Guerrero and 20th to 21st along Valencia', people: [] },
                { id: 4, name: '21st Street from Mission to Guerrero and 21st to 22nd along Valencia', people: [] },
                { id: 5, name: '22nd Street from Mission to Guerrero and 22nd to 23rd along Valencia', people: [] },
                { id: 6, name: '23rd Street from Mission to Guerrero and 23rd to 24th along Valencia', people: [] },
                { id: 7, name: '24th Street from Mission to Guerrero and 24th to 25th along Valencia', people: [] },
                { id: 8, name: 'Mission St from 19th to 23rd', people: [] },
                { id: 9, name: 'San Carlos Street from 19th to 21st; Lexington street from 19th to 21st', people: [] },
                { id: 10, name: 'Guerrero between 18th and Liberty Street; Liberty street from Guerrero to Valencia', people: [] },
                { id: 11, name: 'Guerrero between Liberty Street and 22nd; Hill Street from Guerrero to Valencia', people: [] },
            ];
            
            statusElement.textContent = 'Restoring user assignments...';
            
            // Restore existing people assignments where possible
            defaultRoutes.forEach(route => {
                if (existingAssignments[route.id]) {
                    try {
                        // Validate each person entry
                        const validPeople = [];
                        existingAssignments[route.id].forEach(person => {
                            if (typeof person === 'string') {
                                // Convert string to object
                                validPeople.push({ 
                                    name: person, 
                                    id: person.toLowerCase().replace(/\s+/g, '_') 
                                });
                            } else if (person && typeof person === 'object') {
                                if (person.name) {
                                    // Ensure proper format
                                    const validPerson = {
                                        name: person.name,
                                        id: person.id || person.name.toLowerCase().replace(/\s+/g, '_')
                                    };
                                    
                                    if (person.email) {
                                        validPerson.email = person.email;
                                    }
                                    
                                    if (person.anonymousCount && !isNaN(person.anonymousCount)) {
                                        validPerson.anonymousCount = person.anonymousCount;
                                    }
                                    
                                    validPeople.push(validPerson);
                                }
                            }
                        });
                        route.people = validPeople;
                    } catch (e) {
                        console.error(`Error restoring assignments for route ${route.id}:`, e);
                        route.people = []; // Reset if restoration fails
                    }
                }
            });
            
            statusElement.textContent = 'Updating database...';
            
            // Update Firebase with repaired data
            return routesRef.set(defaultRoutes);
        })
        .then(() => {
            statusElement.textContent = 'Repair complete! Reloading...';
            console.log('Database repair completed successfully');
            
            // Reload the page without the repair parameter after a short delay
            setTimeout(() => {
                window.location.href = window.location.pathname;
            }, 3000);
        })
        .catch(error => {
            statusElement.textContent = `Error: ${error.message}`;
            console.error('Error during database repair:', error);
        });
}

// Sync any missing routes
function syncMissingRoutes() {
    const defaultRoutes = [
        { id: 1, name: '18th Street from Mission to Guerrero and 18th to 19th along Valencia', people: [] },
        { id: 2, name: '19th Street from Mission to Guerrero and 19th to 20th along Valencia', people: [] },
        { id: 3, name: '20th Street from Mission to Guerrero and 20th to 21st along Valencia', people: [] },
        { id: 4, name: '21st Street from Mission to Guerrero and 21st to 22nd along Valencia', people: [] },
        { id: 5, name: '22nd Street from Mission to Guerrero and 22nd to 23rd along Valencia', people: [] },
        { id: 6, name: '23rd Street from Mission to Guerrero and 23rd to 24th along Valencia', people: [] },
        { id: 7, name: '24th Street from Mission to Guerrero and 24th to 25th along Valencia', people: [] },
        { id: 8, name: 'Mission St from 19th to 23rd', people: [] },
        { id: 9, name: 'San Carlos Street from 19th to 21st; Lexington street from 19th to 21st', people: [] },
        { id: 10, name: 'Guerrero between 18th and Liberty Street; Liberty street from Guerrero to Valencia', people: [] },
        { id: 11, name: 'Guerrero between Liberty Street and 22nd; Hill Street from Guerrero to Valencia', people: [] },
    ];
    
    let routesChanged = false;
    
    // Check for missing routes by ID
    defaultRoutes.forEach(defaultRoute => {
        const existingRoute = routes.find(r => r.id === defaultRoute.id);
        if (!existingRoute) {
            console.log(`Adding missing route ID ${defaultRoute.id}: ${defaultRoute.name}`);
            routes.push({...defaultRoute, people: []});
            routesChanged = true;
        }
    });
    
    // Sort routes by ID
    routes.sort((a, b) => a.id - b.id);
    
    // If we added any routes, update Firebase
    if (routesChanged) {
        console.log('Updating Firebase with missing routes');
        syncRoutesToFirebase();
    }
}

// Sync all routes to Firebase
function syncRoutesToFirebase() {
    console.log('Syncing all routes to Firebase');
    routesRef.set(routes)
        .then(() => {
            console.log('Routes successfully synchronized with Firebase');
        })
        .catch(error => {
            console.error('Error syncing routes to Firebase:', error);
        });
}

// Get total anonymous people count for a route
function getAnonymousTotalForRoute(peopleObjects) {
    return peopleObjects.reduce((sum, person) => {
        return sum + (person.anonymousCount || 0);
    }, 0);
}

// Handle anonymous group member count changes
function handleAnonymousGroupChange(event) {
    const routeId = parseInt(event.target.getAttribute('data-route-id'));
    const route = routes.find(r => r.id === routeId);
    
    if (!route || !currentUser) return;
    
    // Initialize people array if it doesn't exist or is not an array
    if (!route.people || !Array.isArray(route.people)) {
        route.people = [];
    }
    
    // Convert people array to User objects if they're not already
    const peopleObjects = ensurePeopleAreUserObjects(route.people);
    
    // Find the current user in the people array
    const userIndex = peopleObjects.findIndex(person => 
        person.id === currentUser.id ||
        (person.email && person.email.toLowerCase() === currentUser.email.toLowerCase())
    );
    
    if (userIndex === -1) {
        console.error('User not found in route people array');
        return;
    }
    
    // Get the user object
    const userObject = peopleObjects[userIndex];
    
    // Initialize anonymous count if it doesn't exist
    if (!userObject.anonymousCount) {
        userObject.anonymousCount = 0;
    }
    
    // Increase or decrease the anonymous count
    if (event.target.classList.contains('increase-button')) {
        userObject.anonymousCount++;
    } else if (event.target.classList.contains('decrease-button')) {
        if (userObject.anonymousCount > 0) {
            userObject.anonymousCount--;
        }
    }
    
    // Update the route
    route.people[userIndex] = userObject;
    
    // Update the route in Firebase
    updateRouteInFirebase(route);
}

// Initialize QR Code DOM elements
function initQRCodeElements() {
    generateQRButton = document.getElementById('generate-qr-button');
    saveQRButton = document.getElementById('save-qr-button');
    closeQRButton = document.getElementById('close-qr-button');
    qrCodeContainer = document.getElementById('qr-code-container');
    qrModal = document.getElementById('qr-modal');
    closeModalButton = document.querySelector('.close-modal');
    
    // Set up QR code event listeners
    setupQRCodeEventListeners();
}

// Set up QR code event listeners
function setupQRCodeEventListeners() {
    if (generateQRButton) {
        generateQRButton.addEventListener('click', generateQRCode);
    }
    
    if (saveQRButton) {
        saveQRButton.addEventListener('click', saveQRCode);
    }
    
    if (closeQRButton) {
        closeQRButton.addEventListener('click', hideQRCode);
    }
    
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            qrModal.classList.add('hidden');
        });
    }
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === qrModal) {
            qrModal.classList.add('hidden');
        }
    });
}

// Generate QR Code
function generateQRCode() {
    const currentUrl = window.location.href.split('?')[0]; // Remove any query parameters
    const qrContainer = document.getElementById('qr-code');
    const qrModalContainer = document.getElementById('qr-modal-code');
    
    // Clear previous QR codes
    qrContainer.innerHTML = '';
    qrModalContainer.innerHTML = '';
    
    // Generate QR code options
    const qrOptions = {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 200,
        color: {
            dark: '#3498db',
            light: '#ffffff'
        }
    };
    
    // Generate QR code
    try {
        // Check if we're on a mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Show in modal for mobile
            QRCode.toCanvas(qrModalContainer, currentUrl, qrOptions, function (error) {
                if (error) {
                    console.error('Error generating QR code:', error);
                    alert('Error generating QR code. Please try again.');
                } else {
                    qrModal.classList.remove('hidden');
                    
                    // Make the QR code in modal tappable to save
                    const canvas = qrModalContainer.querySelector('canvas');
                    if (canvas) {
                        canvas.addEventListener('click', saveQRCode);
                    }
                }
            });
        } else {
            // Show inline for desktop
            QRCode.toCanvas(qrContainer, currentUrl, qrOptions, function (error) {
                if (error) {
                    console.error('Error generating QR code:', error);
                    alert('Error generating QR code. Please try again.');
                } else {
                    qrCodeContainer.classList.remove('hidden');
                }
            });
        }
    } catch (error) {
        console.error('Error generating QR code:', error);
        alert('Error generating QR code. Please try again.');
    }
}

// Save QR Code
function saveQRCode() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const canvas = isMobile ? 
        document.querySelector('#qr-modal-code canvas') : 
        document.querySelector('#qr-code canvas');
    
    if (!canvas) {
        alert('No QR code found to save. Please generate a QR code first.');
        return;
    }
    
    try {
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/png');
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'route_tracker_qr_code.png';
        
        // Append to the document and trigger a click
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        
        if (isMobile) {
            // Close the modal on mobile after saving
            qrModal.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error saving QR code:', error);
        alert('Error saving QR code: ' + error.message);
    }
}

// Hide QR Code
function hideQRCode() {
    qrCodeContainer.classList.add('hidden');
} 