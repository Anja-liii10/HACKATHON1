

// API Base URL
const API_BASE = '';

// Permission Icons Mapping
const PERMISSION_ICONS = {
    'camera': 'fas fa-camera',
    'microphone': 'fas fa-microphone',
    'location': 'fas fa-map-marker-alt',
    'storage': 'fas fa-hdd',
    'contacts': 'fas fa-address-book',
    'files': 'fas fa-folder',
    'notifications': 'fas fa-bell',
    'calendar': 'fas fa-calendar'
};

// Current filter state
let currentFilter = 'all';
let currentSearch = '';



document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadLogs();
    
    // Auto-refresh logs every 5 seconds
    setInterval(loadLogs, 5000);
});



function initializeEventListeners() {
    // Form submission
    const logForm = document.getElementById('logForm');
    logForm.addEventListener('submit', handleLogSubmit);

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            loadLogs();
        });
    });

    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        loadLogs();
    });

    // Navbar links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}



async function handleLogSubmit(e) {
    e.preventDefault();
    
    const appName = document.getElementById('appName').value.trim();
    const permission = document.getElementById('permission').value.trim();

    if (!appName || !permission) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    showLoading(true);

    try {
        const response = await fetch(`${API_BASE}/log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                app_name: appName,
                permission: permission
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast(
                data.is_suspicious 
                    ? `⚠️ Suspicious access detected! ${data.reason}` 
                    : '✅ Access logged successfully',
                data.is_suspicious ? 'warning' : 'success'
            );
            
            // Reset form
            document.getElementById('logForm').reset();
            
            // Reload logs
            loadLogs();
        } else {
            showToast(data.error || 'Failed to log access', 'error');
        }
    } catch (error) {
        console.error('Error logging access:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}



async function loadLogs() {
    try {
        const params = new URLSearchParams();
        if (currentFilter !== 'all') {
            params.append('filter', currentFilter);
        }
        if (currentSearch) {
            params.append('search', currentSearch);
        }

        const response = await fetch(`${API_BASE}/data?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
            displayLogs(data.logs);
            updateStats(data.logs);
        } else {
            console.error('Error loading logs:', data.error);
        }
    } catch (error) {
        console.error('Error loading logs:', error);
    }
}



function displayLogs(logs) {
    const tbody = document.getElementById('logsTableBody');
    
    if (logs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="no-logs">No logs found. ${currentSearch ? 'Try a different search term.' : 'Start logging access events!'}</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = logs.map(log => {
        const iconClass = PERMISSION_ICONS[log.permission.toLowerCase()] || 'fas fa-key';
        const statusClass = log.is_suspicious ? 'suspicious' : 'normal';
        const rowClass = log.is_suspicious ? 'suspicious-row' : 'normal-row';
        
        return `
            <tr class="${rowClass}">
                <td>${formatTimestamp(log.timestamp)}</td>
                <td><strong>${escapeHtml(log.app_name)}</strong></td>
                <td>
                    <i class="${iconClass} permission-icon"></i>
                    ${escapeHtml(log.permission)}
                </td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${log.is_suspicious ? '⚠️ Suspicious' : '✓ Normal'}
                    </span>
                </td>
                <td>${escapeHtml(log.reason)}</td>
            </tr>
        `;
    }).join('');
}


function updateStats(logs) {
    const totalLogs = logs.length;
    const suspiciousLogs = logs.filter(log => log.is_suspicious).length;
    const normalLogs = totalLogs - suspiciousLogs;

    document.getElementById('totalLogs').textContent = totalLogs;
    document.getElementById('suspiciousLogs').textContent = suspiciousLogs;
    document.getElementById('normalLogs').textContent = normalLogs;

    // Animate number changes
    animateNumber('totalLogs', totalLogs);
    animateNumber('suspiciousLogs', suspiciousLogs);
    animateNumber('normalLogs', normalLogs);
}

function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    const currentValue = parseInt(element.textContent) || 0;
    
    if (currentValue === targetValue) return;

    const increment = targetValue > currentValue ? 1 : -1;
    const duration = 300;
    const steps = Math.abs(targetValue - currentValue);
    const stepDuration = duration / steps;

    let current = currentValue;
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current;
        
        if (current === targetValue) {
            clearInterval(timer);
        }
    }, stepDuration);
}



function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Format: "2 hours ago" or "2024-01-15 14:30"
    if (diff < 60000) { // Less than 1 minute
        return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diff < 86400000) { // Less than 1 day
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// ============================================
// EXPORT FOR TESTING (if needed)
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatTimestamp,
        escapeHtml
    };
}

