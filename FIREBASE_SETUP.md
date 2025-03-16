# Firebase Setup Guide

This guide will walk you through the process of setting up Firebase for the Route Assignment Tracker application.

## Step 1: Create a Firebase Account

1. Go to [firebase.google.com](https://firebase.google.com/)
2. Click "Get Started" or "Sign In" (if you already have a Google account)
3. Sign in with your Google account

## Step 2: Create a New Firebase Project

1. Click "Add project" or "Create a project"
2. Enter a project name (e.g., "route-tracker")
3. Optionally, enable Google Analytics
4. Click "Create project"
5. Wait for the project to be created

## Step 3: Set Up the Realtime Database

1. In the Firebase console, click on "Build" in the left sidebar
2. Select "Realtime Database"
3. Click "Create Database"
4. Choose a location for your database (usually the default is fine)
5. Start in "Test mode" for development (we'll secure it later)
6. Click "Enable"

## Step 4: Get Your Firebase Configuration

1. Click on the gear icon (⚙️) next to "Project Overview" in the left sidebar
2. Select "Project settings"
3. Scroll down to the "Your apps" section
4. Click on the web icon (</>) to add a web app
5. Register your app with a nickname (e.g., "route-tracker-web")
6. Click "Register app"
7. Copy the Firebase configuration object (it looks like this):

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 5: Update Your Firebase Configuration File

1. Open the `firebase-config.js` file in your project
2. Replace the placeholder configuration with your actual Firebase configuration
3. Save the file

## Step 6: Deploy Your Application

1. Commit and push your changes to GitHub
2. Your application will now use Firebase for data storage and synchronization

## Step 7: Secure Your Database (Important for Production)

For a production application, you should secure your database with rules:

1. In the Firebase console, go to "Realtime Database"
2. Click on the "Rules" tab
3. Update the rules to something like this:

```json
{
  "rules": {
    "routes": {
      ".read": true,
      ".write": true
    },
    "users": {
      ".read": true,
      ".write": true
    }
  }
}
```

4. For a more secure setup, you might want to implement authentication and more specific rules

## Troubleshooting

- If you see errors related to Firebase in the browser console, double-check your Firebase configuration
- Make sure your Firebase project has the Realtime Database enabled
- Check that your database rules allow read and write access 