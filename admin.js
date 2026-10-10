let adminToken = sessionStorage.getItem('adminToken') || '';

document.addEventListener('DOMContentLoaded', () => {
  if (adminToken) {
    document.getElementById('lockOverlay').style.display = 'none';
    loadAdminModules();
  }
});

async function authenticateAdmin() {
  const password = document.getElementById('adminPasswordInput').value.trim();
  const authError = document.getElementById('authError');

  try {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      adminToken = password;
      sessionStorage.setItem('adminToken', password);
      document.getElementById('lockOverlay').style.display = 'none';
      authError.style.display = 'none';
      loadAdminModules();
    } else {
      authError.style.display = 'block';
    }
  } catch (err) {
    authError.textContent = 'Server connection failed.';
    authError.style.display = 'block';
  }
}

function logoutAdmin() {
  sessionStorage.removeItem('adminToken');
  location.reload();
}

async function injectModule() {
  const course = document.getElementById('courseInput').value.trim();
  const title = document.getElementById('titleInput').value.trim();
  const timeLimit = document.getElementById('timeLimitInput').value.trim();
  const jsonText = document.getElementById('jsonInput').value.trim();

  if (!jsonText) {
    alert('Please paste a JSON question array.');
    return;
  }

  try {
    const questions = JSON.parse(jsonText);
    if (!Array.isArray(questions)) {
      alert('JSON must be an array of questions [ {...}, {...} ].');
      return;
    }

    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-password': adminToken
      },
      body: JSON.stringify({ course, title, timeLimit, questions })
    });

    const result = await res.json();
    if (res.ok && result.success) {
      alert('Module and questions saved successfully to SQLite!');
      document.getElementById('jsonInput').value = '';
      loadAdminModules();
    } else {
      alert('Error: ' + (result.error || 'Failed to save module.'));
    }
  } catch (err) {
    alert('Invalid JSON format: ' + err.message);
  }
}

async function loadAdminModules() {
  const container = document.getElementById('modulesContainer');
  if (!container) return;

  try {
    const res = await fetch('/api/questions');
    const modules = await res.json();

    if (modules.length === 0) {
      container.innerHTML = `<p style="color: #94a3b8;">No modules available in database.</p>`;
      return;
    }

    container.innerHTML = modules.map(m => `
      <div style="background: rgba(10, 15, 30, 0.9); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <div>
            <span style="background: #38bdf8; color: #060913; font-weight: 800; font-size: 0.75rem; padding: 2px 8px; border-radius: 4px;">${escapeHtml(m.course)}</span>
            <h3 style="color: #fff; margin-top: 6px;">${escapeHtml(m.title)}</h3>
            <small style="color: #94a3b8;">⏱️ ${m.timeLimit} Mins | 📋 ${m.questions.length} Questions</small>
          </div>
          <button class="btn-sm btn-del" onclick="deleteModule('${m.id}')">Delete Whole Module</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${m.questions.map((q, idx) => `
            <div class="q-item-card">
              <div class="q-item-header">
                <span class="q-item-title">Q${idx + 1}:${escapeHtml(q.q)}</span>
                <div>
                  <button class="btn-sm btn-edit" onclick="editQuestion(${q.id}, '${escapeJs(q.q)}', '${escapeJs(q.a)}', '${escapeJs(q.b)}', '${escapeJs(q.c)}', '${escapeJs(q.d)}', '${escapeJs(q.correct)}', '${escapeJs(q.explanation)}')">Edit</button>
                  <button class="btn-sm btn-del" onclick="deleteQuestion(${q.id})">Delete</button>
                </div>
              </div>
              <div style="font-size: 0.8rem; color: #94a3b8;">
                A: ${escapeHtml(q.a)} \vert{} B:${escapeHtml(q.b)} | C: ${escapeHtml(q.c)} \vert{} D:${escapeHtml(q.d)} | Correct: <b style="color: #34d399;">${q.correct.toUpperCase()}</b>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load admin modules:', err);
  }
}

async function deleteQuestion(id) {
  if (!confirm('Are you sure you want to delete this specific question?')) return;
  try {
    const res = await fetch(`/api/questions/item/${id}`, { 
      method: 'DELETE',
      headers: { 'x-admin-password': adminToken }
    });
    if (res.ok) {
      loadAdminModules();
    }
  } catch (err) {
    alert('Error deleting question: ' + err.message);
  }
}

async function editQuestion(id, q, a, b, c, d, correct, explanation) {
  const newQ = prompt('Update Question Text:', q);
  if (!newQ) return;
  const newA = prompt('Update Option A:', a);
  const newB = prompt('Update Option B:', b);
  const newC = prompt('Update Option C:', c);
  const newD = prompt('Update Option D:', d);
  const newCorrect = prompt('Update Correct Answer (a/b/c/d):', correct);
  const newExp = prompt('Update Explanation:', explanation);

  try {
    const res = await fetch(`/api/questions/item/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-password': adminToken
      },
      body: JSON.stringify({
        q: newQ, a: newA, b: newB, c: newC, d: newD, correct: newCorrect, explanation: newExp
      })
    });
    if (res.ok) {
      loadAdminModules();
    }
  } catch (err) {
    alert('Error updating question: ' + err.message);
  }
}

async function deleteModule(modId) {
  if (!confirm('Are you sure you want to delete this entire exam module?')) return;
  try {
    const res = await fetch(`/api/questions/${encodeURIComponent(modId)}`, { 
      method: 'DELETE',
      headers: { 'x-admin-password': adminToken }
    });
    if (res.ok) {
      loadAdminModules();
    }
  } catch (err) {
    alert('Error deleting module: ' + err.message);
  }
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}

function escapeJs(str) {
  return String(str || '').replace(/'/g, "\\'").replace(/"/g, '\\"');
}
