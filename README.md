# Instagram Followers Checker

A simple web application to find Instagram users who aren't following you back.

## Features

- Upload .txt files or paste usernames directly
- Compare following list with followers list
- Display users who aren't following you back
- Copy results to clipboard
- Modern, responsive UI

## Deployment to Netlify

1. Push this repository to GitHub (or your preferred Git hosting service)
2. Go to [Netlify](https://www.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Connect your Git repository
5. Build settings:
   - Build command: (leave empty)
   - Publish directory: `/` (root)
6. Click "Deploy site"

Alternatively, you can drag and drop the entire folder to Netlify's deploy area.

## Usage

1. Get your Instagram following and followers lists (you can export them from Instagram's settings)
2. Either:
   - Upload .txt files containing the usernames (one per line)
   - Or paste the usernames directly into the text areas
3. Click "Find Non-Followers"
4. View the results and copy if needed

## File Format

The application accepts usernames in the following formats:
- One username per line
- Usernames can include common formatting (e.g., "username (Name)" will be parsed as "username")

Example:
```
username1
username2
username3
```

