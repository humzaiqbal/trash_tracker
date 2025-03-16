# Route Assignment Tracker

A simple web application that allows users to assign themselves to various routes.

## Features

- User login with name
- View available routes
- Assign yourself to a route
- Unassign yourself from a route
- See who is assigned to each route
- View the number of people assigned to each route
- Data is saved in the browser's local storage

## How to Use

1. Access the website via the GitHub Pages URL (once set up)
2. Enter your name and click "Login" or press Enter
3. Browse the available routes
4. Click "Assign Me" to assign yourself to a route
5. If you're already assigned to a route and try to assign to another, you'll be asked if you want to switch
6. Click "Unassign Me" to remove yourself from a route

## Important Note About Data Storage

This application uses the browser's localStorage to store data. This means:

- Each user will have their own local copy of the data
- Data is stored only on the user's device
- Users won't see each other's assignments unless they're using the same device and browser
- To create a truly multi-user experience where everyone sees the same data, a backend server would be needed

## Technical Details

This is a simple web application built with:
- HTML
- CSS
- JavaScript

No server or database is required as all data is stored in the browser's local storage.

## Customizing Routes

To add or modify routes, edit the `routes` array in the `script.js` file:

```javascript
let routes = [
    { id: 1, name: 'Downtown Route', people: [] },
    { id: 2, name: 'Riverside Path', people: [] },
    // Add more routes here
];
```

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