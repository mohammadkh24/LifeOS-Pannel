const userAvatar = document.getElementById("userAvatar");
const logoutButton = document.getElementById("logoutButton");

const todayTitle = document.getElementById("todayTitle");
const todayDate = document.getElementById("todayDate");

const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");

const habitList = document.getElementById("habitList");
const habitCount = document.getElementById("habitCount");

const goalList = document.getElementById("goalList");
const goalCount = document.getElementById("goalCount");


// ========================================
// Load Today
// ========================================

async function loadToday() {

  const token =
    localStorage.getItem("accessToken");

  if (!token) {

    window.location.href =
      "./login.html";

    return;
  }


  try {

    const response =
      await window.apiRequest(
        "/daily/today"
      );

    const daily =
      response.data;


    todayDate.textContent =
      formatDate(daily.date);

    todayTitle.textContent =
      "امروزت";


    renderTasks(
      daily.tasks || []
    );

    renderHabits(
      daily.habits || []
    );

    renderGoals(
      daily.goals || []
    );

  } catch (error) {

    console.error(
      "Failed to load today:",
      error
    );


    todayDate.textContent =
      "دریافت اطلاعات امروز ناموفق بود.";


    renderTasks([]);

    renderHabits([]);

    renderGoals([]);
  }
}


// ========================================
// Render Tasks
// ========================================

function renderTasks(tasks) {

  taskList.innerHTML = "";

  taskCount.textContent =
    tasks.length;


  if (!tasks.length) {

    taskList.innerHTML = `
      <div class="empty-state">
        هنوز کاری برای امروز نداری.
      </div>
    `;

    return;
  }


  tasks.forEach(task => {

    const item =
      document.createElement(
        "div"
      );

    item.className =
      "today-item";


    if (task.isCompleted) {

      item.classList.add(
        "completed"
      );
    }


    item.innerHTML = `
      <button
        class="today-check"
        data-task-id="${task.id}"
        type="button"
        title="تغییر وضعیت"
      >
        ${task.isCompleted ? "✓" : ""}
      </button>

      <span class="today-item-title">
        ${escapeHtml(task.title)}
      </span>
    `;


    taskList.appendChild(item);
  });
}


// ========================================
// Toggle Task
// ========================================

async function toggleTask(
  taskId,
  currentStatus
) {

  try {

    await window.apiRequest(
      `/tasks/${taskId}`,
      {
        method: "PATCH",

        body: JSON.stringify({
          isCompleted:
            !currentStatus
        })
      }
    );


    await loadToday();

  } catch (error) {

    console.error(
      "Failed to toggle task:",
      error
    );

    alert(
      "تغییر وضعیت کار ناموفق بود."
    );
  }
}


// ========================================
// Task Click
// ========================================

taskList.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        ".today-check"
      );


    if (!button) {
      return;
    }


    const taskId =
      button.dataset.taskId;


    const item =
      button.closest(
        ".today-item"
      );


    const currentStatus =
      item.classList.contains(
        "completed"
      );


    toggleTask(
      taskId,
      currentStatus
    );
  }
);


// ========================================
// Render Habits
// ========================================

function renderHabits(habits) {

  habitList.innerHTML = "";

  habitCount.textContent =
    habits.length;


  if (!habits.length) {

    habitList.innerHTML = `
      <div class="empty-state">
        هنوز عادتی برای امروز نداری.
      </div>
    `;

    return;
  }


  habits.forEach(habit => {

    const item =
      document.createElement(
        "div"
      );

    item.className =
      "today-item";


    item.innerHTML = `
      <span class="habit-status"></span>

      <span class="today-item-title">
        ${escapeHtml(habit.title)}
      </span>
    `;


    habitList.appendChild(item);
  });
}


// ========================================
// Get Progress Color
// ========================================

function getProgressClass(progress) {

  if (progress < 50) {
    return "progress-red";
  }

  if (progress < 100) {
    return "progress-yellow";
  }

  return "progress-green";
}


// ========================================
// Render Goals
// ========================================

function renderGoals(goals) {

  goalList.innerHTML = "";

  goalCount.textContent =
    goals.length;


  if (!goals.length) {

    goalList.innerHTML = `
      <div class="empty-state">
        هنوز هدفی اضافه نکردی.
      </div>
    `;

    return;
  }


  goals.forEach(goal => {

    const progress =
      Math.min(
        Math.max(
          Number(goal.progress) || 0,
          0
        ),
        100
      );


    const progressClass =
      getProgressClass(progress);


    const item =
      document.createElement(
        "div"
      );

    item.className =
      "today-item";


    if (goal.isCompleted) {

      item.classList.add(
        "completed"
      );
    }


    item.innerHTML = `
      <span class="today-item-title">
        ${escapeHtml(goal.title)}
      </span>

      <div class="goal-progress">

        <div
          class="goal-progress-bar ${progressClass}"
          style="width: ${progress}%"
        ></div>

      </div>

      <span class="goal-progress-text">
        ${progress}%
      </span>
    `;


    goalList.appendChild(item);
  });
}


// ========================================
// Format Date
// ========================================

function formatDate(date) {

  const dateObject =
    new Date(
      `${date}T00:00:00`
    );


  return dateObject.toLocaleDateString(
    "fa-IR",
    {
      weekday: "long",
      day: "numeric",
      month: "long"
    }
  );
}


// ========================================
// Escape HTML
// ========================================

function escapeHtml(value) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    value ?? "";

  return div.innerHTML;
}


// ========================================
// Logout
// ========================================

function logout() {

  localStorage.removeItem(
    "accessToken"
  );

  window.location.href =
    "./login.html";
}


logoutButton.addEventListener(
  "click",
  logout
);


// ========================================
// Initialize
// ========================================

loadToday();