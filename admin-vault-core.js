let cachedTopics = [];

// Custom Colored Modal Functions
function showModal(title, message, type = 'success', onConfirm = null) {
    const modal = document.getElementById('custom-modal');
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');
    const iconEl = document.getElementById('modal-icon');
    const actionsEl = document.getElementById('modal-actions');

    titleEl.textContent = title;
    msgEl.textContent = message;

    if (type === 'success') {
        iconEl.textContent = '✨';
    } else if (type === 'error') {
        iconEl.textContent = '⚠️';
    } else if (type === 'confirm') {
        iconEl.textContent = '🗑️';
    }

    if (onConfirm) {
        actionsEl.innerHTML = `
            <button onclick="closeModal()" class="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition">Cancel</button>
            <button id="modal-confirm-btn" class="w-1/2 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-semibold text-white transition">Delete</button>
        `;
        document.getElementById('modal-confirm-btn').onclick = () => {
            closeModal();
            onConfirm();
        };
    } else {
        actionsEl.innerHTML = `
            <button onclick="closeModal()" class="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-xs font-semibold text-white uppercase shadow-lg">OK</button>
        `;
    }

    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('custom-modal').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('vault-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('vault-password').value;
        const unlockBtn = document.getElementById('unlock-btn');

        try {
            unlockBtn.textContent = 'Verifying...';
            unlockBtn.disabled = true;

            const res = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                document.getElementById('vault-login-container').classList.add('hidden');
                document.getElementById('admin-dashboard-container').classList.remove('hidden');
                document.getElementById('logout-nav-btn').classList.remove('hidden');
                loadActiveTopics();
            } else {
                showModal('Access Denied', 'Invalid security key provided.', 'error');
            }
        } catch (err) {
            console.error('Login error:', err);
            showModal('Connection Error', 'Server connection error during verification.', 'error');
        } finally {
            unlockBtn.textContent = 'Unlock Vault →';
            unlockBtn.disabled = false;
        }
    });

    document.getElementById('inject-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById('save-topic-btn');
        const editIndex = parseInt(document.getElementById('edit-index').value, 10);
        
        const category = document.getElementById('education-level').value;
        const subjectCode = document.getElementById('subject-code').value;
        const topicName = document.getElementById('topic-name').value;
        const moduleTitle = document.getElementById('module-title').value;
        const timeLimit = parseInt(document.getElementById('time-limit').value, 10);
        const rawJson = document.getElementById('questions-json').value;

        let questions;
        try {
            questions = JSON.parse(rawJson);
        } catch (err) {
            showModal('Invalid JSON', 'Please check your brackets and quotation marks in the Questions Array.', 'error');
            return;
        }

        const payload = { category, subjectCode, topicName, moduleTitle, timeLimit, questions };

        try {
            saveBtn.textContent = 'Processing Disk...';
            saveBtn.disabled = true;

            let res, result;
            if (editIndex >= 0) {
                res = await fetch(`/api/admin/topic/${editIndex}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch('/api/admin/save-topic', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            result = await res.json();
            if (res.ok && result.success) {
                showModal('Success!', editIndex >= 0 ? 'Topic updated successfully on disk.' : 'Topic pack successfully injected and saved to disk!', 'success');
                resetForm();
                loadActiveTopics();
            } else {
                showModal('Save Failed', result.error || 'Unknown server error.', 'error');
            }
        } catch (err) {
            console.error('Save error:', err);
            showModal('Network Error', 'Network connection error while saving data.', 'error');
        } finally {
            saveBtn.textContent = editIndex >= 0 ? 'Update Topic Pack →' : 'Save Topic Pack to Disk →';
            saveBtn.disabled = false;
        }
    });
});

function lockVault() {
    document.getElementById('admin-dashboard-container').classList.add('hidden');
    document.getElementById('logout-nav-btn').classList.add('hidden');
    document.getElementById('vault-login-container').classList.remove('hidden');
    document.getElementById('vault-password').value = '';
    resetForm();
}

function resetForm() {
    document.getElementById('edit-index').value = '-1';
    document.getElementById('save-topic-btn').textContent = 'Save Topic Pack to Disk →';
    document.getElementById('cancel-edit-btn').classList.add('hidden');
    document.getElementById('module-title').value = 'Unit Quiz';
    document.getElementById('topic-name').value = 'Programming Fundamentals';
}

async function loadActiveTopics() {
    const container = document.getElementById('active-topics-container');
    const countBadge = document.getElementById('topic-count');
    try {
        const res = await fetch('/api/topics');
        cachedTopics = await res.json();

        countBadge.textContent = `${cachedTopics.length} packs`;

        if (!Array.isArray(cachedTopics) || cachedTopics.length === 0) {
            container.innerHTML = '<p class="text-xs text-slate-500 text-center py-4">No active stored topics on disk.</p>';
            return;
        }

        container.innerHTML = cachedTopics.map((t, idx) => `
            <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                <div class="pr-2">
                    <span class="text-cyan-400 font-semibold">${t.moduleTitle || t.topicName || 'Module ' + (idx + 1)}</span>
                    <p class="text-slate-500 text-[11px] mt-0.5">${t.category || 'General'} | ${t.questions ? t.questions.length : 0} Qs | ${t.timeLimit || 45} mins</p>
                </div>
                <div class="flex space-x-1.5 flex-shrink-0">
                    <button onclick="editTopic(${idx})" class="px-2.5 py-1 bg-slate-800 text-cyan-300 rounded-lg hover:bg-slate-700 text-[11px] transition">Edit</button>
                    <button onclick="confirmDelete(${idx})" class="px-2.5 py-1 bg-red-950/60 border border-red-900/50 text-red-300 rounded-lg hover:bg-red-900/60 text-[11px] transition">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error loading topics:', err);
        container.innerHTML = '<p class="text-xs text-red-400 text-center py-4">⚠️ Failed to load active topics.</p>';
    }
}

function editTopic(index) {
    const topic = cachedTopics[index];
    if (!topic) return;

    document.getElementById('edit-index').value = index;
    document.getElementById('education-level').value = topic.category || 'Computer Science';
    document.getElementById('subject-code').value = topic.subjectCode || 'CS1101';
    document.getElementById('topic-name').value = topic.topicName || 'Programming Fundamentals';
    document.getElementById('module-title').value = topic.moduleTitle || 'Unit Quiz';
    document.getElementById('time-limit').value = topic.timeLimit || 45;
    document.getElementById('questions-json').value = JSON.stringify(topic.questions || [], null, 2);

    document.getElementById('save-topic-btn').textContent = 'Update Topic Pack →';
    document.getElementById('cancel-edit-btn').classList.remove('hidden');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function confirmDelete(index) {
    showModal('Confirm Deletion', 'Are you sure you want to permanently delete this question pack from disk?', 'confirm', async () => {
        try {
            const res = await fetch(`/api/admin/topic/${index}`, { method: 'DELETE' });
            const result = await res.json();
            if (res.ok && result.success) {
                showModal('Deleted', 'Question pack removed successfully.', 'success');
                loadActiveTopics();
            } else {
                showModal('Delete Failed', result.error || 'Unknown error.', 'error');
            }
        } catch (err) {
            console.error('Delete error:', err);
            showModal('Network Error', 'Network error during deletion.', 'error');
        }
    });
}
