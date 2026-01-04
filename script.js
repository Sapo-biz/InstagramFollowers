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

function parseList(input) {
    // Split by newlines and filter out empty lines
    return input
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            // Remove common Instagram list formatting
            // Handles cases like "username", "username (name)", etc.
            return line.split(' ')[0].replace(/[^\w._-]/g, '');
        })
        .filter(username => username.length > 0);
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

