# Deployment Guide for Route Assignment Tracker

This guide provides instructions for deploying the Route Assignment Tracker website so that multiple people can access it via a URL.

## Option 1: GitHub Pages (Recommended for Beginners)

GitHub Pages is a free hosting service provided by GitHub. It's perfect for static websites like this one.

### Steps:

1. **Create a GitHub account** if you don't have one already at [github.com](https://github.com)

2. **Create a new repository**:
   - Click the "+" icon in the top right corner and select "New repository"
   - Name your repository (e.g., "route-tracker")
   - Make it public
   - Click "Create repository"

3. **Push your code to GitHub**:
   ```bash
   # If you haven't already initialized the repository
   git init
   git add .
   git commit -m "Initial commit"
   
   # Add the remote repository (replace USERNAME and REPO_NAME)
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   
   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click "Settings"
   - Scroll down to the "GitHub Pages" section
   - Under "Source", select "main" branch
   - Click "Save"
   - Wait a few minutes for your site to be published
   - You'll see a message with your site's URL (typically https://USERNAME.github.io/REPO_NAME/)

5. **Share the URL** with others so they can access the website

## Option 2: Netlify (Also Free and Easy)

Netlify is another great option for hosting static websites with a generous free tier.

### Steps:

1. **Create a Netlify account** at [netlify.com](https://netlify.com) (you can sign up with your GitHub account)

2. **Deploy your site**:
   - Click "New site from Git"
   - Select GitHub as your Git provider
   - Authorize Netlify to access your GitHub account
   - Select your repository
   - Configure build settings (leave blank for this project)
   - Click "Deploy site"

3. **Customize your site URL** (optional):
   - By default, Netlify gives you a random subdomain (e.g., random-name-123456.netlify.app)
   - You can customize this by going to "Site settings" > "Domain management" > "Custom domains"
   - Click "Options" next to your Netlify subdomain and select "Edit site name"

4. **Share the URL** with others

## Option 3: Simple HTTP Server (For Local Network Only)

If you just want to share the website with people on the same network (e.g., in an office), you can use a simple HTTP server.

### Using Python (if installed):

```bash
# Navigate to your project directory
cd /path/to/route-tracker

# Start a simple HTTP server (Python 3)
python -m http.server 8000

# Or for Python 2
python -m SimpleHTTPServer 8000
```

Then share your local IP address with others on the same network: http://YOUR_LOCAL_IP:8000

## Important Note About Data Storage

Remember that this application uses localStorage, which means:

- Each user will have their own local copy of the data
- Users won't see each other's assignments
- Data is stored only on the user's device

If you need a truly multi-user experience where everyone sees the same data, you would need to implement a backend server with a database. 