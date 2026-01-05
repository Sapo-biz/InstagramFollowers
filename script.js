// File input handlers
document.getElementById('following-file').addEventListener('change', function(e) {
    handleFileUpload(e, 'following-input');
});

document.getElementById('followers-file').addEventListener('change', function(e) {
    handleFileUpload(e, 'followers-input');
});

function handleFileUpload(event, textareaId) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        document.getElementById(textareaId).value = content;
        // Show success feedback
        const textarea = document.getElementById(textareaId);
        textarea.style.borderColor = '#28a745';
        setTimeout(() => {
            textarea.style.borderColor = '';
        }, 2000);
    };
    reader.onerror = function() {
        showError('Error reading file. Please try again.');
    };
    reader.readAsText(file);
}

// Submit button handler
document.getElementById('submit-btn').addEventListener('click', function() {
    processLists();
});

// Enter key handler for textareas
document.getElementById('following-input').addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        processLists();
    }
});

document.getElementById('followers-input').addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        processLists();
    }
});

function processLists() {
    const followingInput = document.getElementById('following-input').value.trim();
    const followersInput = document.getElementById('followers-input').value.trim();

    // Hide previous results and errors
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('error-message').classList.add('hidden');

    // Validation
    if (!followingInput && !followersInput) {
        showError('Please provide both following and followers lists.');
        return;
    }

    if (!followingInput) {
        showError('Please provide your following list.');
        return;
    }

    if (!followersInput) {
        showError('Please provide your followers list.');
        return;
    }

    // Parse the lists
    const followingList = parseList(followingInput);
    const followersList = parseList(followersInput);

    if (followingList.length === 0) {
        showError('Following list is empty. Please check your input.');
        return;
    }

    if (followersList.length === 0) {
        showError('Followers list is empty. Please check your input.');
        return;
    }

    // Find people not following back
    const notFollowingBack = findNonFollowers(followingList, followersList);

    // Display results
    displayResults(notFollowingBack);
}

function isTimestamp(line) {
    const trimmedLine = line.trim();
    
    // Check for AM/PM indicators (case insensitive)
    const hasAmPm = /\b(AM|PM|am|pm)\b/i.test(trimmedLine);
    
    // Check for month names (abbreviated and full)
    const monthPattern = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\b/i;
    const hasMonth = monthPattern.test(trimmedLine);
    
    // Check for 4-digit year (2020-2030 range for Instagram timestamps)
    const hasYear = /\b(20[2-3][0-9])\b/.test(trimmedLine);
    
    // Check for time pattern (e.g., "1:23", "11:45", "12:30")
    const timePattern = /\b\d{1,2}:\d{2}\b/;
    const hasTime = timePattern.test(trimmedLine);
    
    // Check for common date patterns with commas
    const datePatternWithComma = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/i;
    const hasDatePattern = datePatternWithComma.test(trimmedLine);
    
    // If it has AM/PM AND (month OR year), it's likely a timestamp
    if (hasAmPm && (hasMonth || hasYear)) {
        return true;
    }
    
    // If it has month, year, and time pattern, it's likely a timestamp
    if (hasMonth && hasYear && hasTime) {
        return true;
    }
    
    // If it matches the full date pattern with comma, it's likely a timestamp
    if (hasDatePattern) {
        return true;
    }
    
    // If it has AM/PM and time pattern, likely a timestamp
    if (hasAmPm && hasTime) {
        return true;
    }
    
    return false;
}

function extractUsernameFromInstagramUrl(line) {
    const trimmedLine = line.trim();
    
    // Comprehensive Instagram URL patterns:
    // - https://www.instagram.com/username
    // - http://www.instagram.com/username
    // - https://instagram.com/username (without www)
    // - http://instagram.com/username
    // - www.instagram.com/username (without protocol)
    // - instagram.com/username
    // - m.instagram.com/username (mobile)
    // - With trailing slashes
    // - With query parameters (?utm_source=...)
    
    // Pattern to match Instagram URLs and extract username
    // Matches: protocol (optional) + www. (optional) + instagram.com/ + username + optional trailing slash + optional query params
    const instagramUrlPattern = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?instagram\.com\/([a-zA-Z0-9._]+)/i;
    const match = trimmedLine.match(instagramUrlPattern);
    
    if (match && match[1]) {
        return match[1]; // Return extracted username
    }
    
    return null;
}

function isInstagramUrl(line) {
    const trimmedLine = line.trim();
    
    // Check if line starts with or is primarily an Instagram URL
    // Patterns checked:
    // 1. Starts with http://www.instagram.com/ or https://www.instagram.com/
    // 2. Starts with http://instagram.com/ or https://instagram.com/
    // 3. Starts with www.instagram.com/ or instagram.com/
    // 4. Contains instagram.com/ (for lines that are mostly URLs)
    
    // Check if it starts with an Instagram URL pattern
    const startsWithUrl = /^(https?:\/\/)?(www\.)?(m\.)?instagram\.com\//i.test(trimmedLine);
    
    // Check if the line is primarily an Instagram URL (no other meaningful content)
    // This handles cases where there might be whitespace or the URL is the main content
    const urlOnlyPattern = /^\s*(https?:\/\/)?(www\.)?(m\.)?instagram\.com\/[a-zA-Z0-9._]+\/?(\?.*)?\s*$/i;
    const isUrlOnly = urlOnlyPattern.test(trimmedLine);
    
    // Check if line contains an Instagram URL (for filtering HTML/mixed content)
    const containsUrl = /(https?:\/\/)?(www\.)?(m\.)?instagram\.com\//i.test(trimmedLine);
    
    return startsWithUrl || isUrlOnly || containsUrl;
}

function parseList(input) {
    // Split by newlines and filter out empty lines
    return input
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .filter(line => !isTimestamp(line)) // Filter out timestamps
        .map(line => {
            // Check if line contains an Instagram URL - extract username if so
            const usernameFromUrl = extractUsernameFromInstagramUrl(line);
            if (usernameFromUrl) {
                // Successfully extracted username from URL - use it
                return usernameFromUrl;
            }
            
            // If line contains Instagram URL pattern but extraction failed, filter it out
            // (likely HTML/metadata/other content that we don't want)
            if (/instagram\.com/i.test(line)) {
                return null;
            }
            
            // Remove common Instagram list formatting
            // Handles cases like "username", "username (name)", etc.
            return line.split(' ')[0].replace(/[^\w._-]/g, '');
        })
        .filter(username => username && username.length > 0);
}

function findNonFollowers(followingList, followersList) {
    // Convert to Sets for faster lookup
    const followersSet = new Set(followersList.map(u => u.toLowerCase()));
    
    // Find people in following list who are not in followers list
    return followingList.filter(username => 
        !followersSet.has(username.toLowerCase())
    );
}

function displayResults(results) {
    const resultsSection = document.getElementById('results-section');
    const resultsList = document.getElementById('results-list');
    const resultsCount = document.getElementById('results-count');

    resultsSection.classList.remove('hidden');

    if (results.length === 0) {
        resultsList.innerHTML = '<div class="empty-results">🎉 Everyone is following you back!</div>';
        resultsCount.textContent = '0 people not following you back';
    } else {
        resultsCount.textContent = `${results.length} ${results.length === 1 ? 'person' : 'people'} not following you back`;
        
        resultsList.innerHTML = results
            .map(username => `<div class="result-item">${escapeHtml(username)}</div>`)
            .join('');
    }

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Copy button handler
document.getElementById('copy-btn').addEventListener('click', function() {
    const results = Array.from(document.querySelectorAll('.result-item'))
        .map(item => item.textContent.trim())
        .filter(item => item.length > 0);

    if (results.length === 0) {
        showError('No results to copy.');
        return;
    }

    const textToCopy = results.join('\n');
    
    navigator.clipboard.writeText(textToCopy).then(function() {
        const copyBtn = document.getElementById('copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    }).catch(function(err) {
        showError('Failed to copy to clipboard. Please try again.');
        console.error('Copy error:', err);
    });
});

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    
    // Scroll to error
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

