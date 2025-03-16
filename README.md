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

1. Open the `index.html` file in your web browser
2. Enter your name and click "Login" or press Enter
3. Browse the available routes
4. Click "Assign Me" to assign yourself to a route
5. If you're already assigned to a route and try to assign to another, you'll be asked if you want to switch
6. Click "Unassign Me" to remove yourself from a route

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

## License

This project is open source and available for anyone to use and modify. 