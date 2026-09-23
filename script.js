// Cinematic Book Loader & Page Flipping Sequence
const loaderScreen = document.getElementById('loaderScreen');
const devNameScreen = document.getElementById('devNameScreen');
const pageFlipScreen = document.getElementById('pageFlipScreen');
const loaderCounter = document.getElementById('loaderCounter');

// Step 1: Show Developer Name for 2 seconds inside the book
setTimeout(() => {
    if(devNameScreen && pageFlipScreen) {
        devNameScreen.classList.add('hidden');
        pageFlipScreen.classList.remove('hidden');
    }

    // Step 2: Start Page Flipping Percentage Counter
    let counterVal = 0;
    const loadInterval = setInterval(() => {
        counterVal += 4;
        if(loaderCounter) loaderCounter.textContent = counterVal + '%';
        
        if(counterVal >= 100) {
            clearInterval(loadInterval);
            if(loaderScreen) {
                loaderScreen.style.opacity = '0';
                setTimeout(() => loaderScreen.style.display = 'none', 1000);
            }
        }
    }, 40);

}, 2000);

// Set Current Date & Day Display
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const todayDateStr = new Date().toLocaleDateString('en-US', options);
const dateDisplayEl = document.getElementById('currentDateDisplay');
if(dateDisplayEl) dateDisplayEl.textContent = `Today: ${todayDateStr}`;

// Attendance State
let students = JSON.parse(localStorage.getItem('bca_attendance_v3')) || [];
let historyLogs = JSON.parse(localStorage.getItem('bca_attendance_history')) || [];

const studentForm = document.getElementById('studentForm');
const studentNameInput = document.getElementById('studentName');
const rollNoInput = document.getElementById('rollNo');
const studentTableBody = document.getElementById('studentTableBody');
const totalCount = document.getElementById('totalCount');
const presentCount = document.getElementById('presentCount');
const absentCount = document.getElementById('absentCount');
const historyContainer = document.getElementById('historyContainer');

// Live Clock
setInterval(() => {
    const now = new Date();
    const clockEl = document.getElementById('liveClock');
    if(clockEl) clockEl.textContent = now.toLocaleTimeString();
}, 1000);

function updateStats() {
    if(totalCount) totalCount.textContent = students.length;
    const present = students.filter(s => s.status === 'Present').length;
    if(presentCount) presentCount.textContent = present;
    if(absentCount) absentCount.textContent = students.length - present;
}

// Save Daily Record to History
function saveDailyHistory() {
    if(students.length === 0) return;
    const presentCountVal = students.filter(s => s.status === 'Present').length;
    const absentCountVal = students.length - presentCountVal;

    const record = {
        date: todayDateStr,
        total: students.length,
        present: presentCountVal,
        absent: absentCountVal,
        studentsList: [...students]
    };

    const existingIndex = historyLogs.findIndex(h => h.date === todayDateStr);
    if(existingIndex >= 0) {
        historyLogs[existingIndex] = record;
    } else {
        historyLogs.unshift(record);
    }
    localStorage.setItem('bca_attendance_history', JSON.stringify(historyLogs));
    renderHistory();
}

function renderHistory() {
    if(!historyContainer) return;
    historyContainer.innerHTML = '';

    if(historyLogs.length === 0) {
        historyContainer.innerHTML = `<p class="text-xs font-mono text-slate-500">No past attendance logs stored yet.</p>`;
        return;
    }

    historyLogs.forEach(log => {
        const div = document.createElement('div');
        div.className = "bg-black/50 border border-blue-500/10 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 font-mono text-xs";
        div.innerHTML = `
            <div>
                <span class="text-blue-400 font-bold">${log.date}</span>
                <span class="text-slate-400 ml-3">Total: ${log.total}</span>
            </div>
            <div class="space-x-3">
                <span class="text-emerald-400">Present: ${log.present}</span>
                <span class="text-blue-500">Absent: ${log.absent}</span>
            </div>
        `;
        historyContainer.appendChild(div);
    });
}

function renderTable() {
    if(!studentTableBody) return;
    studentTableBody.innerHTML = '';
    updateStats();

    if (students.length === 0) {
        studentTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="p-12 text-center text-slate-500 font-mono text-xs">
                    No active student records. Use the admin panel above to add students.
                </td>
            </tr>
        `;
        return;
    }

    students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.className = "hover:bg-white/[0.02] transition group";
        
        row.innerHTML = `
            <td class="p-6 font-mono text-xs text-slate-400">${student.roll}</td>
            <td class="p-6 font-bold text-white tracking-wide">${student.name}</td>
            <td class="p-6 text-center">
                <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold ${
                    student.status === 'Present' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }">
                    <span class="w-1.5 h-1.5 rounded-full ${student.status === 'Present' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}"></span>
                    ${student.status}
                </span>
            </td>
            <td class="p-6 text-right space-x-2 font-mono text-xs">
                <button onclick="toggleStatus(${index})" class="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl transition text-slate-300">
                    Toggle Status
                </button>
                <button onclick="deleteStudent(${index})" class="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-600/20 px-4 py-2 rounded-xl transition">
                    Remove
                </button>
            </td>
        `;
        studentTableBody.appendChild(row);
    });

    localStorage.setItem('bca_attendance_v3', JSON.stringify(students));
    saveDailyHistory();
}

if(studentForm) {
    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = studentNameInput.value.trim();
        const roll = rollNoInput.value.trim();

        if (name && roll) {
            students.push({ name, roll, status: 'Present' });
            studentNameInput.value = '';
            rollNoInput.value = '';
            renderTable();
        }
    });
}

function toggleStatus(index) {
    students[index].status = students[index].status === 'Present' ? 'Absent' : 'Present';
    renderTable();
}

function markAll(status) {
    students.forEach(s => s.status = status);
    renderTable();
}

function deleteStudent(index) {
    students.splice(index, 1);
    renderTable();
}

function resetAll() {
    if (confirm("Are you sure you want to clear all student records?")) {
        students = [];
        renderTable();
    }
}

renderTable();
renderHistory();