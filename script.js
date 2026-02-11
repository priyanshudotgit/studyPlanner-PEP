window.onload = () => {
    // initial data
    displayDashboard();

    // apply saved theme
    let settings = getFromStorage('settings');
    if (settings.theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }
};

// get the data from local storage //done
function getFromStorage(key) {
    var data = localStorage.getItem(key);
    if (data) {
        return JSON.parse(data);
    }
    return null;
}

// set the data to local storage //done
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// section changer //done
function showSection(sectionName, clickedElement) {
    let navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((nav) => 
        nav.classList.remove('active')
    )

    let sections = document.querySelectorAll('.content-section');
    sections.forEach((section) => section.classList.remove('active'));

    clickedElement?.classList.add('active');

    let selectedSection = document.getElementById(sectionName);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    if (sectionName === 'dashboard') {
        displayDashboard();
    } else if (sectionName === 'subjects') {
        displaySubjects();
    } else if (sectionName === 'schedule') {
        displaySchedule();
    } else if (sectionName === 'tasks') {
        displayTasks();
    } else if (sectionName === 'analytics') {
        updateAnalytics();
    } else if (sectionName === 'settings') {
        displaySettings();
    }
}

// functions for Dashboard Section
// dashboard display //done
function displayDashboard() {
    let today = new Date();
    let dateString = today.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('current-date').textContent = dateString;

    let subjects = getFromStorage('subjects') || [];
    let tasks = getFromStorage('tasks') || [];
    let schedules = getFromStorage('schedules') || [];

    // number of subjects
    document.getElementById('total-subjects').textContent = subjects.length;

    // count pending tasks and update dashboard
    let pendingTasks = 0;
    for (let i = 0; i < tasks.length; i++) {
        if (!tasks[i].completed) {
            pendingTasks++;
        }
    }
    document.getElementById('pending-tasks').textContent = pendingTasks;
    
    // Calculate completion rate
    var completionRate = 0;
    if (tasks.length > 0) {
        var completedTasks = 0;
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].completed) {
                completedTasks++;
            }
        }
        completionRate = Math.round((completedTasks / tasks.length) * 100);
    }
    document.getElementById('completion-rate').textContent = completionRate + '%';
    
    // Display today's schedule
    displayTodaySchedule();
    
    // Display upcoming deadlines
    displayUpcomingDeadlines();
}

// display today's schedule //done
function displayTodaySchedule() {
    let container = document.getElementById('today-schedule');
    let schedules = getFromStorage('schedules') || [];
    let subjects = getFromStorage('subjects') || [];
    
    let today = new Date().toLocaleDateString('en-IN', { weekday: 'long' }).toLowerCase();

    // schedules for today
    let todaySchedules = [];
    for (let i = 0; i < schedules.length; i++) {
        if (schedules[i].day === today) {
            todaySchedules.push(schedules[i]);
        }
    }

    // Display schedules
    if (todaySchedules.length === 0) {
        container.innerHTML = '<p class="empty-state">No sessions scheduled for today</p>';
    } else {
        let html = '';
        for (let i = 0; i < todaySchedules.length; i++) {
            console.log(todaySchedules[i]);
            let schedule = todaySchedules[i];
            let subject = findSubjectById(schedule.subjectId, subjects);
            let subjectName = subject ? subject.name : 'Unknown Subject';
            let subjectColor = subject ? subject.color : '#495d7c';
            
            html += '<div class="schedule-item" style="border-left-color: ' + subjectColor + '">';
            html += '<h4>' + subjectName + '</h4>';
            html += '<p>' + schedule.startTime + ' - ' + schedule.endTime + ' • ' + schedule.type + '</p>';
            html += '</div>';
        }
        container.innerHTML = html;
    }
}

// display upcoming deadlines //done
function displayUpcomingDeadlines() {
    let container = document.getElementById('upcoming-deadlines');
    let tasks = getFromStorage('tasks') || [];
    let subjects = getFromStorage('subjects') || [];
    let now = new Date();

    let upcomingTasks = [];
    for (let i = 0; i < tasks.length; i++) {
        if (!tasks[i].completed) {
            let deadline = new Date(tasks[i].deadline);
            if (deadline > now) {
                upcomingTasks.push(tasks[i]);
            }
        }
    }
    
    // Sort by deadline
    upcomingTasks.sort(function(a, b) {
        return new Date(a.deadline) - new Date(b.deadline);
    });
    
    // Show only first 5
    upcomingTasks = upcomingTasks.slice(0, 5);
    
    // display deadlines
    if (upcomingTasks.length === 0) {
        container.innerHTML = '<p class="empty-state">No upcoming deadlines</p>';
    } else {
        let html = '';
        for (let i = 0; i < upcomingTasks.length; i++) {
            let task = upcomingTasks[i];
            let subject = findSubjectById(task.subjectId, subjects);
            let subjectName = subject ? subject.name : 'Unknown';
            let subjectColor = subject ? subject.color : '#3b82f6';
            
            let deadline = new Date(task.deadline).toLocaleString();
            
            html += '<div class="deadline-item" style="border-left-color: ' + subjectColor + '">';
            html += '<h4>' + task.title + '</h4>';
            html += '<p>' + subjectName + ' • Due on ' + deadline + '</p>';
            html += '</div>';
        }
        container.innerHTML = html;
    }
}

// functions for Subject Section
// display all subjects //done
function displaySubjects() {
    let container = document.getElementById('subjects-grid');
    let subjects = getFromStorage('subjects') || [];
    
    if (subjects.length === 0) {
        container.innerHTML = '<p class="empty-state">No subjects added yet. Click "Add Subject" to get started.</p>';
        return;
    }
    
    let html = '';
    for (let i = 0; i < subjects.length; i++) {
        let subject = subjects[i];
        html += '<div class="subject-card" style="--subject-color: ' + subject.color + '">';
        html += '<div class="subject-header">';
        html += '<h3 class="subject-name">' + subject.name + '</h3>';
        html += '<p class="subject-code">' + (subject.code || '') + '</p>';
        html += '</div>';
        html += '<span class="priority-badge priority-' + subject.priority + '">' + subject.priority.toUpperCase() + '</span>';
        html += '<div class="subject-info">';
        if (subject.notes) {
            html += '<span>📝 ' + subject.notes + '</span>';
        }
        html += '</div>';
        html += '<div class="subject-actions">';
        html += '<button class="btn-icon" onclick="openSubjectModal(\'' + subject.id + '\')">✏️</button>';
        html += '<button class="btn-icon" onclick="deleteSubject(\'' + subject.id + '\')">🗑️</button>';
        html += '</div>';
        html += '</div>';
    }
    
    container.innerHTML = html;
    // updateSubjectDropdowns();
}

// open subject form //done
let currentEditingId = null;
function openSubjectModal(subjectId) {
    currentEditingId = subjectId || null;
    let modal = document.getElementById('subject-modal');
    let form = document.getElementById('subject-form');

    form.reset();

    if (subjectId) {
        // Edit Subject
        document.getElementById('subject-modal-title').textContent = 'Edit Subject';
        let subjects = getFromStorage('subjects') || [];
        let subject = findSubjectById(subjectId, subjects);
        
        if (subject) {
            document.getElementById('subject-name').value = subject.name;
            document.getElementById('subject-code').value = subject.code || '';
            document.getElementById('subject-color').value = subject.color;
            document.getElementById('subject-priority').value = subject.priority;
            document.getElementById('subject-notes').value = subject.notes || '';
        }
    } else {
        // Add Subject
        document.getElementById('subject-modal-title').textContent = 'Add Subject';
    }
    
    modal.classList.add('active');
}

// save subject (add or edit) //done
function saveSubject(event) {
    event.preventDefault();

    let subjects = getFromStorage('subjects') || [];

    let subjectData = {
        name: document.getElementById('subject-name').value,
        code: document.getElementById('subject-code').value,
        color: document.getElementById('subject-color').value,
        priority: document.getElementById('subject-priority').value,
        notes: document.getElementById('subject-notes').value
    };
    
    if (currentEditingId) {
        // Update existing subject
        for (let i = 0; i < subjects.length; i++) {
            if (subjects[i].id === currentEditingId) {
                subjects[i] = Object.assign(subjects[i], subjectData);
                break;
            }
        }
        alert('Subject updated successfully!');
    } else {
        // Add new subject
        subjectData.id = 'subj_' + Date.now();
        subjectData.createdAt = new Date().toISOString();
        subjects.push(subjectData);
        alert('Subject added successfully!');
    }
    
    saveToStorage('subjects', subjects);
    closeModal('subject-modal');
    displaySubjects();
}

// delete subject //done
function deleteSubject(subjectId) {
    if (!confirm('Delete this subject?')) {
        return;
    }

    let subjects = getFromStorage('subjects') || [];
    let schedules = getFromStorage('schedules') || [];
    let tasks = getFromStorage('tasks') || [];
    
    // Remove subject
    subjects = subjects.filter((subject) => {
        return subject.id !== subjectId;
    });
    
    // Remove related schedules
    schedules = schedules.filter((s) => {
        return s.subjectId !== subjectId;
    });
    
    // Remove related tasks
    tasks = tasks.filter((t) => {
        return t.subjectId !== subjectId;
    });

    saveToStorage('subjects', subjects);
    saveToStorage('schedules', schedules);
    saveToStorage('tasks', tasks);
    
    alert('Subject deleted');
    displaySubjects();
    // displayDashboard();
}

// functions for Tasks Section
// display tasks
let currentFilter = 'all';
function displayTasks(filter) {
    updateSubjectDropdowns();

    filter = filter || currentFilter;
    currentFilter = filter;

    let container = document.getElementById('tasks-container');
    let tasks = getFromStorage('tasks') || [];
    let subjects = getFromStorage('subjects') || [];

    // tasks filter
    let filteredTasks = [];
    for (let i = 0; i < tasks.length; i++) {
        if (filter === 'all' || tasks[i].type === filter) {
            filteredTasks.push(tasks[i]);
        }
    }

    // Sort by deadline
    filteredTasks.sort(function(a, b) {
        return new Date(a.deadline) - new Date(b.deadline);
    });

    if (filteredTasks.length === 0) {
        container.innerHTML = '<p class="empty-state">No tasks found.</p>';
        return;
    }

    let html = '';
    let now = new Date();

    for (let i = 0; i < filteredTasks.length; i++) {
        let task = filteredTasks[i];
        let subject = findSubjectById(task.subjectId, subjects);
        let subjectName = subject ? subject.name : 'Unknown';
        let subjectColor = subject ? subject.color : '#3b82f6';

        let deadline = new Date(task.deadline);
        let isUrgent = (deadline - now) < (24 * 60 * 60 * 1000);
        
        html += '<div class="task-card ' + (task.completed ? 'completed' : '') + '" style="--subject-color: ' + subjectColor + '">';
        html += '<input type="checkbox" class="task-checkbox" ' + (task.completed ? 'checked' : '') + ' onchange="toggleTask(\'' + task.id + '\')">';
        html += '<div class="task-content">';
        html += '<div class="task-header">';
        html += '<h3 class="task-title">' + task.title + '</h3>';
        html += '</div>';
        html += '<div class="task-meta">';
        html += '<span class="task-badge priority-' + task.priority + '">' + task.priority + '</span>';
        html += '<span class="task-badge">Type:' + task.type + '</span>';
        html += '<span>Subject:' + subjectName + '</span>';
        html += '</div>';
        if (task.description) {
            html += '<p class="task-description">' + task.description + '</p>';
        }
        let deadlineString = deadline.toLocaleString('en-IN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        html += '<p class="task-deadline ' + (isUrgent ? 'urgent' : '') + '">Due: ' + deadlineString + '</p>';
        html += '</div>';
        html += '<div class="task-actions">';
        html += '<button class="btn-icon" value="edit" onclick="openTaskModal(\'' + task.id + '\')">✏️</button>';
        html += '<button class="btn-icon" onclick="deleteTask(\'' + task.id + '\')">🗑️</button>';
        html += '</div>';
        html += '</div>';
    }

    container.innerHTML = html;
}

// filter tasks //done
function filterTasks(filter) {
    let buttons = document.querySelectorAll('.filter-btn');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
    }
    event.target.classList.add('active');
    
    displayTasks(filter);
}

// open task modal //done
function openTaskModal(taskId) {
    currentEditingId = taskId || null;
    let modal = document.getElementById('task-modal');
    let form = document.getElementById('task-form');
    
    form.reset();
    
    if (taskId) {
        // Edit mode
        document.getElementById('task-modal-title').textContent = 'Edit Task';
        let tasks = getFromStorage('tasks') || [];
        let task = findTaskById(taskId, tasks);
        
        if (task) {
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-subject').value = task.subjectId;
            document.getElementById('task-type').value = task.type;
            document.getElementById('task-deadline').value = task.deadline;
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-description').value = task.description || '';
        }
    } else {
        // Add mode
        document.getElementById('task-modal-title').textContent = 'Add Task';
    }
    
    modal.classList.add('active');
}

// save task //done
function saveTask(event) {
    event.preventDefault();
    
    let tasks = getFromStorage('tasks') || [];
    
    var taskData = {
        title: document.getElementById('task-title').value,
        subjectId: document.getElementById('task-subject').value,
        type: document.getElementById('task-type').value,
        deadline: document.getElementById('task-deadline').value,
        priority: document.getElementById('task-priority').value,
        description: document.getElementById('task-description').value
    };
    
    if (currentEditingId) {
        // Update existing task
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].id === currentEditingId) {
                tasks[i] = Object.assign(tasks[i], taskData);
                break;
            }
        }
        alert('Task updated successfully!');
    } else {
        // Add new task
        taskData.id = 'task_' + Date.now();
        taskData.completed = false;
        taskData.createdAt = new Date().toISOString();
        tasks.push(taskData);
        alert('Task added successfully!');
    }
    
    saveToStorage('tasks', tasks);
    closeModal('task-modal');
    displayTasks();
    // displayDashboard();
}

// toggle task completion //done
function toggleTask(taskId) {
    let tasks = getFromStorage('tasks') || [];

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === taskId) {
            tasks[i].completed = !tasks[i].completed;
            break;
        }
    }

    saveToStorage('tasks', tasks);
    displayTasks();
}

// delete task //done
function deleteTask(taskId) {
    if (!confirm('Delete this task?')) {
        return;
    }
    
    let tasks = getFromStorage('tasks') || [];
    tasks = tasks.filter((task) => {
        return task.id !== taskId;
    });
    
    saveToStorage('tasks', tasks);
    alert('Task deleted!');
    displayTasks();
    // displayDashboard();
}

// functions for Settings Section
// theme //done
function displaySettings() {
    let settings = getFromStorage('settings');
    document.getElementById('theme-select').value = settings.theme;
}

// toggle theme //done
function changeTheme() {
    let theme = document.getElementById('theme-select').value;
    
    if (theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.removeAttribute('data-theme');
    }

    let settings = {
        theme: document.getElementById('theme-select').value
    };
    saveToStorage('settings', settings);
    alert('Settings saved!');
}

// export local storage json data //done
function exportData() {
    let data = {
        subjects: getFromStorage('subjects'),
        schedules: getFromStorage('schedules'),
        tasks: getFromStorage('tasks'),
        settings: getFromStorage('settings')
    };
    
    let json = JSON.stringify(data);
    
    let a = document.createElement('a');
    a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
    a.download = 'study-planner-backup.json';
    a.click();
}

// import data //done
function importData(event) {
    let file = event.target.files[0];
    if (!file) return;
    
    let reader = new FileReader();
    reader.onload = function(e) {
        try {
            let data = JSON.parse(e.target.result);
            
            if (data.subjects) saveToStorage('subjects', data.subjects);
            if (data.schedules) saveToStorage('schedules', data.schedules);
            if (data.tasks) saveToStorage('tasks', data.tasks);
            if (data.settings) saveToStorage('settings', data.settings);
            
            alert('Data imported successfully!');
        } catch (error) {
            alert('Invalid file format');
        }
    };
    reader.readAsText(file);
    window.location.reload();
}

// reset all data //done
function resetData() {
    if (!confirm('Are you sure you want to delete all data?')) {
        return;
    }
    
    localStorage.clear();
    alert('All data has been reset');
    window.location.reload();
}

// find subject by ID
function findSubjectById(id, subjects) {
    subjects = subjects || getAllSubjects();
    for (var i = 0; i < subjects.length; i++) {
        if (subjects[i].id === id) {
            return subjects[i];
        }
    }
    return null;
}

// schedule by ID
function findScheduleById(id, schedules) {
    schedules = schedules || getFromStorage('schedules');
    for (var i = 0; i < schedules.length; i++) {
        if (schedules[i].id === id) {
            return schedules[i];
        }
    }
    return null;
}

// find task by ID
function findTaskById(id, tasks) {
    tasks = tasks || getAllTasks();
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) {
            return tasks[i];
        }
    }
    return null;
}

// update subject dropdowns
function updateSubjectDropdowns() {
    let subjects = getFromStorage('subjects') || [];
    let selects = ['session-subject', 'task-subject'];
    
    for (let s = 0; s < selects.length; s++) {
        let select = document.getElementById(selects[s]);
        if (select) {
            let currentValue = select.value;
            let html = '<option value="">Select a subject</option>';
            
            for (let i = 0; i < subjects.length; i++) {
                html += '<option value="' + subjects[i].id + '">' + subjects[i].name + '</option>';
            }
            
            select.innerHTML = html;
            if (currentValue) {
                select.value = currentValue;
            }
        }
    }
}

// close modal //done
function closeModal(modalId) {
    let modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
    currentEditingId = null;
}

// update schedule page
function displaySchedule() {
    if (typeof updateSubjectDropdowns === 'function') updateSubjectDropdowns(); 
    renderScheduleList();
}

// schedule list display
function renderScheduleList() {
    const container = document.getElementById('schedule-list');
    const schedules = getFromStorage('schedules') || [];
    const subjects = getFromStorage('subjects') || [];
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let html = '';

    days.forEach(day => {
        const dayKey = day.toLowerCase();
        
        const daySchedules = schedules.filter((s) => s.day === dayKey);
        
        daySchedules.sort((a, b) => a.startTime.localeCompare(b.startTime));

        if (daySchedules.length > 0) {
            html += `<div class="day-group">`;
            html += `<div class="day-header">${day}</div>`;
            
            daySchedules.forEach(schedule => {
                const subject = findSubjectById(schedule.subjectId, subjects);
                const color = subject?.color || '#3b82f6';
                const name = subject?.name || 'Unknown Subject';

                html += `
                    <div class="schedule-card" 
                            style="border-left-color: ${color};" 
                            onclick="editSchedule('${schedule.id}')">
                        <div>
                            <strong>${name}</strong>
                            <div style="font-size: 0.85em; margin-top: 4px;">
                                ${schedule.type}
                            </div>
                        </div>
                        <div style="font-weight: 500;">
                            ${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        }
    });

    if (html === '') {
        html = '<p style="text-align:center; color:#888; margin-top:30px;">No schedules added yet.</p>';
    }

    container.innerHTML = html;
}

// Helper to make time look nice (09:00 -> 9:00 AM)
// If you prefer 24h, you can remove this.
function formatTime(timeStr) {
    const [hour, minute] = timeStr.split(':');
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minute} ${ampm}`;
}

// Keep your existing Save/Edit logic, just update the render call
function saveSchedule(event) {
    event.preventDefault();
    
    // ... (Your existing logic for collecting form data) ...
    // ... (Your existing logic for conflict checking) ...

    // AFTER saving/updating data:
    closeModal('schedule-modal');
    displaySchedule(); // This now calls the new List renderer
    
    // Optional: Update dashboard if needed
    if (typeof displayDashboard === 'function') displayDashboard();
}

// Keep your existing open/close modal functions
// Keep your existing checkScheduleConflict function

// Function to generate time slots from 8 AM to 8 PM
function generateTimeSlots() {
    var slots = [];
    for (var hour = 8; hour <= 20; hour++) {
        slots.push(hour.toString().padStart(2, '0') + ':00');
    }
    return slots;
}

// Function to get sessions for a specific day and time
function getSessionsForDayAndTime(day, time, schedules, subjects) {
    var html = '';
    var hour = parseInt(time.split(':')[0]);
    
    for (var i = 0; i < schedules.length; i++) {
        var schedule = schedules[i];
        if (schedule.day === day) {
            var startHour = parseInt(schedule.startTime.split(':')[0]);
            if (startHour === hour) {
                var subject = findSubjectById(schedule.subjectId, subjects);
                var subjectName = subject ? subject.name : 'Unknown';
                var subjectColor = subject ? subject.color : '#3b82f6';
                
                html += '<div class="session-block" style="border-color: ' + subjectColor + '; background: ' + subjectColor + '20" onclick="editSchedule(\'' + schedule.id + '\')">';
                html += '<div class="session-title">' + subjectName + '</div>';
                html += '<div class="session-time">' + schedule.startTime + '-' + schedule.endTime + '</div>';
                html += '<button class="btn-icon" value="edit" onclick="openTaskModal(\'' + task.id + '\')">✏️</button>';
                html += '<button class="btn-icon" onclick="deleteTask(\'' + task.id + '\')">🗑️</button>';
                html += '</div>';
            }
        }
    }
    
    return html;
}

// Function to open schedule modal
function openScheduleModal(scheduleId) {
    currentEditingId = scheduleId || null;
    var modal = document.getElementById('schedule-modal');
    var form = document.getElementById('schedule-form');
    
    form.reset();
    document.getElementById('conflict-warning').style.display = 'none';
    
    if (scheduleId) {
        // Edit mode
        var schedules = getFromStorage('schedules');
        var schedule = findScheduleById(scheduleId, schedules);
        
        if (schedule) {
            document.getElementById('session-subject').value = schedule.subjectId;
            document.getElementById('session-day').value = schedule.day;
            document.getElementById('session-start').value = schedule.startTime;
            document.getElementById('session-end').value = schedule.endTime;
            document.getElementById('session-type').value = schedule.type;
        }
    }
    
    modal.classList.add('active');
}

// Function to save schedule
function saveSchedule(event) {
    event.preventDefault();
    
    var schedules = getFromStorage('schedules') || [];
    
    var scheduleData = {
        subjectId: document.getElementById('session-subject').value,
        day: document.getElementById('session-day').value,
        startTime: document.getElementById('session-start').value,
        endTime: document.getElementById('session-end').value,
        type: document.getElementById('session-type').value
    };
    
    // Check for conflicts
    // var hasConflict = checkScheduleConflict(scheduleData.day, scheduleData.startTime, scheduleData.endTime, currentEditingId);
    
    // if (hasConflict) {
    //     document.getElementById('conflict-warning').textContent = 'Warning: This session conflicts with an existing schedule!';
    //     document.getElementById('conflict-warning').style.display = 'block';
    //     return;
    // }
    
    if (currentEditingId) {
        // Update existing schedule
        for (var i = 0; i < schedules.length; i++) {
            if (schedules[i].id === currentEditingId) {
                schedules[i] = Object.assign(schedules[i], scheduleData);
                break;
            }
        }
        alert('Schedule updated successfully!');
    } else {
        // Add new schedule
        scheduleData.id = 'sch_' + Date.now();
        schedules.push(scheduleData);
        alert('Schedule added successfully!');
    }
    
    saveToStorage('schedules', schedules);
    closeModal('schedule-modal');
    displaySchedule();
}

// Function to check for schedule conflicts
function checkScheduleConflict(day, startTime, endTime, excludeId) {
    var schedules = getFromStorage('schedules') || [];
    
    for (var i = 0; i < schedules.length; i++) {
        var schedule = schedules[i];
        
        // Skip if it's the same schedule we're editing
        if (excludeId && schedule.id === excludeId) {
            continue;
        }
        
        // Check if same day
        if (schedule.day !== day) {
            continue;
        }
        
        // Convert times to minutes for comparison
        var scheduleStart = timeToMinutes(schedule.startTime);
        var scheduleEnd = timeToMinutes(schedule.endTime);
        var newStart = timeToMinutes(startTime);
        var newEnd = timeToMinutes(endTime);
        
        // Check for overlap
        if (newStart < scheduleEnd && newEnd > scheduleStart) {
            return true;
        }
    }
    
    return false;
}

// Function to edit schedule
function editSchedule(scheduleId) {
    openScheduleModal(scheduleId);
}