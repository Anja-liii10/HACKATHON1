from flask import Flask, render_template, request, jsonify
from datetime import datetime
import sqlite3
import os

app = Flask(__name__)

# Database file path
DB_FILE = 'database.db'

# Trusted apps list
TRUSTED_APPS = ['Chrome', 'Firefox', 'Safari', 'Edge', 'WhatsApp', 'Telegram', 'Gmail', 'Photos', 'Settings']

# Sensitive permissions
SENSITIVE_PERMISSIONS = ['camera', 'microphone', 'location', 'storage', 'contacts', 'files']

def init_db():
    """Initialize the database and create tables if they don't exist"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS access_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_name TEXT NOT NULL,
            permission TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            is_suspicious INTEGER DEFAULT 0,
            reason TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

def is_suspicious(app_name, permission, recent_logs):
    """Determine if an access is suspicious"""
    reasons = []
    
    # Check if app is not trusted
    if app_name not in TRUSTED_APPS:
        reasons.append("Untrusted app")
    
    # Check if permission is sensitive
    if permission.lower() in [p.lower() for p in SENSITIVE_PERMISSIONS]:
        reasons.append("Sensitive permission")
    
    # Check for repeated access in short time (within last 5 minutes)
    recent_count = sum(1 for log in recent_logs 
                      if log['app_name'] == app_name and log['permission'] == permission)
    if recent_count >= 3:
        reasons.append("Repeated access")
    
    return len(reasons) > 0, ", ".join(reasons) if reasons else "Normal access"

@app.route('/')
def index():
    """Render the main dashboard page"""
    return render_template('index.html')

@app.route('/log', methods=['POST'])
def log_access():
    """Log a new access event"""
    try:
        data = request.get_json()
        app_name = data.get('app_name', '').strip()
        permission = data.get('permission', '').strip()
        
        if not app_name or not permission:
            return jsonify({'success': False, 'error': 'App name and permission are required'}), 400
        
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Get recent logs for suspicious detection
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT app_name, permission, timestamp 
            FROM access_logs 
            WHERE timestamp >= datetime('now', '-5 minutes')
            ORDER BY timestamp DESC
        ''')
        recent_logs = [{'app_name': row[0], 'permission': row[1], 'timestamp': row[2]} 
                      for row in cursor.fetchall()]
        conn.close()
        
        # Check if suspicious
        suspicious, reason = is_suspicious(app_name, permission, recent_logs)
        
        # Insert into database
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO access_logs (app_name, permission, timestamp, is_suspicious, reason)
            VALUES (?, ?, ?, ?, ?)
        ''', (app_name, permission, timestamp, 1 if suspicious else 0, reason))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Access logged successfully',
            'is_suspicious': suspicious,
            'reason': reason
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/data', methods=['GET'])
def get_data():
    """Get all access logs"""
    try:
        filter_type = request.args.get('filter', 'all')  # all, suspicious, normal
        search_query = request.args.get('search', '').strip().lower()
        
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        query = 'SELECT id, app_name, permission, timestamp, is_suspicious, reason FROM access_logs'
        conditions = []
        params = []
        
        if filter_type == 'suspicious':
            conditions.append('is_suspicious = 1')
        elif filter_type == 'normal':
            conditions.append('is_suspicious = 0')
        
        if search_query:
            conditions.append('(LOWER(app_name) LIKE ? OR LOWER(permission) LIKE ?)')
            search_pattern = f'%{search_query}%'
            params.extend([search_pattern, search_pattern])
        
        if conditions:
            query += ' WHERE ' + ' AND '.join(conditions)
        
        query += ' ORDER BY timestamp DESC LIMIT 100'
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        
        logs = []
        for row in rows:
            logs.append({
                'id': row[0],
                'app_name': row[1],
                'permission': row[2],
                'timestamp': row[3],
                'is_suspicious': bool(row[4]),
                'reason': row[5] or 'Normal access'
            })
        
        return jsonify({'success': True, 'logs': logs})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    # Initialize database on startup
    init_db()
    print("🚀 EchoGuard server starting...")
    print("📊 Database initialized")
    print("🌐 Server running at http://127.0.0.1:5000")
    app.run(debug=True, host='127.0.0.1', port=5000)

