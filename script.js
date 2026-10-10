let onPopupCloseCallback = null;

function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function showCustomPopup(title, message, callback = null) {
    document.getElementById('popupTitle').innerText = title;
    document.getElementById('popupBody').innerHTML = message;
    onPopupCloseCallback = callback;
    document.getElementById('customPopup').style.display = 'flex';
}

function closePopup() {
    document.getElementById('customPopup').style.display = 'none';
    if (onPopupCloseCallback) {
        onPopupCloseCallback();
        onPopupCloseCallback = null;
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullName').value.trim();
    
    const q1 = document.querySelector('input[name="q1"]:checked');
    const q2 = document.querySelector('input[name="q2"]:checked');
    const q3 = document.querySelector('input[name="q3"]:checked');
    const q4 = document.querySelector('input[name="q4"]:checked');
    const q5 = document.querySelector('input[name="q5"]:checked');

    if (!q1 || !q2 || !q3 || !q4 || !q5) {
        showCustomPopup(
            'INTEGRITY ALERT',
            'You must agree to all 5 academic pledge questions to proceed.'
        );
        return;
    }

    if (!fullName) {
        showCustomPopup(
            'VALIDATION ERROR',
            'Please enter your original full name.'
        );
        return;
    }

    sessionStorage.setItem('ezrelyn_active_user', fullName);
    
    closeLoginModal();

    showCustomPopup(
        'INTEGRITY PLEDGE VERIFIED',
        `<strong>Welcome, ${fullName}.</strong><br><br>` +
        `• No session history or personal data is stored.<br>` +
        `• Ezrelyn AI proctoring active.<br><br>` +
        `Click proceed to open the exam vault.`,
        function() {
            window.location.href = 'dashboard.html';
        }
    );
}

window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        closeLoginModal();
    }
};
