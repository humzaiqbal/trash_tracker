# Route Assignment Tracker

A simple web application that allows users to assign themselves to various routes.

## Live Demo

Access the live website at: https://humzaiqbal.github.io/trash_tracker/

## Features

- User login with name
- View available routes
- Assign yourself to a route
- Unassign yourself from a route
- See who is assigned to each route
- View the number of people assigned to each route
- Real-time data synchronization across all users
- Data is stored in Firebase Realtime Database

## How to Use

1. Access the website via the GitHub Pages URL
2. Enter your name and click "Login" or press Enter
3. Browse the available routes
4. Click "Assign Me" to assign yourself to a route
5. If you're already assigned to a route and try to assign to another, you'll be asked if you want to switch
6. Click "Unassign Me" to remove yourself from a route

## Technical Details

This is a web application built with:
- HTML
- CSS
- JavaScript
- Firebase Realtime Database

The application uses Firebase to store and synchronize data in real-time across all users.

## Setup Instructions

To set up your own instance of this application:

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Enable the Realtime Database in your Firebase project
3. Copy your Firebase configuration from the Firebase console
4. Update the `firebase-config.js` file with your Firebase configuration
5. Deploy the application to GitHub Pages or any other hosting service

## Customizing Routes

To add or modify routes, edit the `routes` array in the `script.js` file:

```javascript
let routes = [
    { id: 1, name: 'Downtown Route', people: [] },
    { id: 2, name: 'Riverside Path', people: [] },
    // Add more routes here
];
```

After modifying the routes, you'll need to reset the Firebase database or manually update it.

## Deployment Instructions

### GitHub Pages

1. Create a GitHub repository
2. Push this code to the repository
3. Go to the repository settings
4. Scroll down to the GitHub Pages section
5. Select the main branch as the source
6. Click Save
7. Your site will be published at `https://[your-username].github.io/[repository-name]/`

## License

This project is open source and available for anyone to use and modify. 