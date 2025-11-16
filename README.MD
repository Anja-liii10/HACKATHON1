# 🛡️ EchoGuard — Personal Data Defense Interface

A complete web application that monitors and logs app permissions, detects suspicious or abnormal access patterns, and displays all logs in a responsive, modern UI dashboard.

## 🚀 Features

### ✔️ Permission Monitoring
- Manually log which app accessed which permission
- Track app names and permissions (camera, mic, location, contacts, files, etc.)

### ✔️ Suspicious Access Detection
The system automatically marks an access as **Suspicious** if:
- App is not in the trusted list
- Permission is sensitive (camera, microphone, location, storage)
- Access happens repeatedly in short time (3+ times in 5 minutes)

### ✔️ Dashboard Display
- Clean, modern, animated dashboard
- Recent access logs with timestamps
- Suspicious access highlighted in **red**
- Normal access highlighted in **green**
- Filters: All / Suspicious / Normal
- Search bar for logs
- Real-time statistics

### ✔️ UI Features
- Fully responsive design
- Smooth animations
- Glassmorphism effects
- Icons for each permission
- Cyber-security theme (Blue, purple, neon colors)
- Dark mode default
- Professional font & layout

## 📁 Project Structure

```
project/
│── app.py                 # Flask backend application
│── database.db            # SQLite database (auto-created)
│── requirements.txt       # Python dependencies
│── README.md             # This file
│
├── templates/
│    └── index.html       # Main HTML template
│
└── static/
     ├── style.css        # CSS styles with glassmorphism
     └── script.js        # Frontend JavaScript
```

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Step 1: Install Dependencies

Open your terminal/command prompt in the project directory and run:

```bash
pip install -r requirements.txt
```

This will install Flask and all required dependencies.

### Step 2: Run the Backend Server

```bash
python app.py
```

You should see:
```
🚀 EchoGuard server starting...
📊 Database initialized
🌐 Server running at http://127.0.0.1:5000
```

### Step 3: Access the Frontend

Open your web browser and navigate to:
```
http://127.0.0.1:5000
```

The dashboard will load automatically!

## 🎯 How to Use

### Logging Access Events

1. **Enter App Name**: Type the name of the app (e.g., "Chrome", "UnknownApp", "SpyWareX")
2. **Select Permission**: Choose from the dropdown (Camera, Microphone, Location, etc.)
3. **Click "Log Access"**: The system will log the event and check if it's suspicious

### Viewing Logs

- **All Logs**: Click "All" filter button (default)
- **Suspicious Only**: Click "Suspicious" filter button
- **Normal Only**: Click "Normal" filter button
- **Search**: Type in the search box to filter by app name or permission

### Understanding Status

- **🟢 Normal**: Trusted app with safe permissions
- **🔴 Suspicious**: Untrusted app, sensitive permission, or repeated access

## 🔧 Technical Details

### Backend (Flask)

**Endpoints:**
- `GET /` - Renders the main dashboard page
- `POST /log` - Logs a new access event
  - Request body: `{"app_name": "AppName", "permission": "camera"}`
  - Response: `{"success": true, "is_suspicious": false, "reason": "..."}`
- `GET /data` - Retrieves all access logs
  - Query parameters: `?filter=all|suspicious|normal&search=query`
  - Response: `{"success": true, "logs": [...]}`

**Database:**
- SQLite database (`database.db`)
- Table: `access_logs`
- Columns: `id`, `app_name`, `permission`, `timestamp`, `is_suspicious`, `reason`
- Auto-created on first run

**Trusted Apps:**
- Chrome, Firefox, Safari, Edge, WhatsApp, Telegram, Gmail, Photos, Settings

**Sensitive Permissions:**
- camera, microphone, location, storage, contacts, files

### Frontend (HTML + CSS + JavaScript)

- **No frameworks required** - Pure HTML, CSS, and JavaScript
- **Responsive design** - Works on desktop, tablet, and mobile
- **Auto-refresh** - Logs update every 5 seconds
- **Real-time stats** - Statistics update automatically

### Suspicious Detection Logic

An access is marked as suspicious if ANY of these conditions are met:

1. **Untrusted App**: App name is not in the trusted list
2. **Sensitive Permission**: Permission is in the sensitive list
3. **Repeated Access**: Same app + permission accessed 3+ times in the last 5 minutes

## 🎨 Design Features

- **Glassmorphism**: Frosted glass effect on cards
- **Neon Glow**: Blue and purple neon accents
- **Smooth Animations**: Hover effects, transitions, and loading spinners
- **Dark Theme**: Cyber-security inspired dark mode
- **Icons**: Font Awesome icons for better visual representation

## 🐛 Troubleshooting

### Port Already in Use
If port 5000 is already in use, edit `app.py` and change:
```python
app.run(debug=True, host='127.0.0.1', port=5000)
```
to a different port (e.g., `port=5001`)

### Database Errors
If you encounter database errors, delete `database.db` and restart the server. It will be recreated automatically.

### CORS Issues
If you're accessing from a different origin, you may need to add CORS headers in `app.py`:
```python
from flask_cors import CORS
CORS(app)
```

## 📝 Example Usage

1. **Log a normal access:**
   - App: "Chrome"
   - Permission: "notifications"
   - Result: ✅ Normal access

2. **Log a suspicious access:**
   - App: "UnknownApp"
   - Permission: "camera"
   - Result: ⚠️ Suspicious (Untrusted app, Sensitive permission)

3. **Log repeated access:**
   - Log "SpyWareX" + "location" 3 times quickly
   - Result: ⚠️ Suspicious (Repeated access)

## 🔐 Security Notes

- This is a demonstration application
- For production use, add authentication and authorization
- Implement rate limiting for API endpoints
- Use environment variables for sensitive configuration
- Consider using a more robust database (PostgreSQL, MySQL) for production

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Support

If you encounter any issues or have questions, please check:
1. Python version (3.7+)
2. All dependencies installed correctly
3. Port 5000 is available
4. Browser console for JavaScript errors

---

**Built with ❤️ for Privacy & Security**

*EchoGuard — Your Personal Data Defense Interface*

