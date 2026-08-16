const welcomeMessage = document.getElementById("welcomeMessage");
const userAvatar = document.getElementById("userAvatar");
const currentDate = document.getElementById("currentDate");
const logoutButton = document.getElementById("logoutButton");

const dailyTitle = document.getElementById("dailyTitle");
const dailyDescription = document.getElementById("dailyDescription");

const goalCount = document.getElementById("goalCount");
const goalDescription = document.getElementById("goalDescription");

const habitCount = document.getElementById("habitCount");
const habitDescription = document.getElementById("habitDescription");

// ========================================
// Today Progress Elements
// ========================================

const welcomeCard =
  document.querySelector(".welcome-card");

const todayProgressPercent =
  document.getElementById("todayProgressPercent");

const todayProgressFill =
  document.getElementById("todayProgressFill");

const todayProgressText =
  document.getElementById("todayProgressText");

const todayProgressStatus =
  document.getElementById("todayProgressStatus");

// ========================================
// Task Elements
// ========================================

const taskForm =
  document.getElementById("taskForm");

const taskInput =
  document.getElementById("taskInput");

const taskList =
  document.getElementById("taskList");

const taskCount =
  document.getElementById("taskCount");

// ========================================
// Load Profile
// ========================================

async function loadProfile() {

  const token =
    localStorage.getItem("accessToken");

  if (!token) {

    window.location.href =
      "./login.html";

    return;
  }

  try {

    const response =
      await window.apiRequest("/users/me");

    const user =
      response.data;

    const hour =
      new Date().getHours();

    let greeting;

    if (hour >= 5 && hour < 12) {

      greeting = "صبح بخیر";

    } else if (hour >= 12 && hour < 17) {

      greeting = "ظهر بخیر";

    } else {

      greeting = "شب بخیر";
    }

    welcomeMessage.textContent =
      `${greeting} ${user.name} 👋`;

    userAvatar.textContent =
      user.name.charAt(0);

  } catch (error) {

    console.error(
      "Failed to load profile:",
      error
    );

    logout();
  }
}

// ========================================
// Load Today
// ========================================

async function loadToday() {

  try {

    const response =
      await window.apiRequest("/daily/today");

    console.log(
      "Today API:",
      response
    );

    const daily =
      response.data;

    if (!daily) {

      throw new Error(
        "Daily data is empty"
      );
    }

    // ========================================
    // Daily Header
    // ========================================

    dailyTitle.textContent =
      "روزت رو شروع کن ✨";

    dailyDescription.textContent =
      `امروز ${formatDate(daily.date)} است.`;

    // ========================================
    // Today Tasks
    // ========================================

    const tasks =
      Array.isArray(daily.tasks)
        ? daily.tasks
        : [];

    // ========================================
    // Today Habits
    // ========================================

    const habits =
      Array.isArray(daily.habits)
        ? daily.habits
        : [];

    // ========================================
    // Today Goals
    // ========================================

    const goals =
      Array.isArray(daily.goals)
        ? daily.goals
        : [];

    // ========================================
    // Update Progress
    // ========================================

    updateTodayProgress(
      tasks,
      goals,
      habits
    );

  } catch (error) {

    console.error(
      "Failed to load daily:",
      error
    );

    dailyTitle.textContent =
      "خطا در دریافت اطلاعات";

    dailyDescription.textContent =
      "اطلاعات امروز دریافت نشد.";

    if (todayProgressPercent) {

      todayProgressPercent.textContent =
        "—";
    }

    if (todayProgressFill) {

      todayProgressFill.style.width =
        "0%";
    }

    if (todayProgressText) {

      todayProgressText.textContent =
        "دریافت اطلاعات ناموفق بود";
    }

    if (todayProgressStatus) {

      todayProgressStatus.textContent =
        "خطا";
    }
  }
}

// ========================================
// Update Today Progress
// Tasks + Goals
// Habits = Display Only
// ========================================

function updateTodayProgress(
  tasks,
  goals,
  habits
) {

  const taskItems =
    Array.isArray(tasks)
      ? tasks
      : [];

  const goalItems =
    Array.isArray(goals)
      ? goals
      : [];

  const habitItems =
    Array.isArray(habits)
      ? habits
      : [];

  // ========================================
  // Tasks
  // ========================================

  const totalTasks =
    taskItems.length;

  const completedTasks =
    taskItems.filter(
      task => task.isCompleted
    ).length;

  // ========================================
  // Goals
  // ========================================

  const totalGoals =
    goalItems.length;

  const goalProgress =
    goalItems.reduce(
      (total, goal) => {

        const progress =
          Math.min(
            Math.max(
              Number(goal.progress) || 0,
              0
            ),
            100
          );

        return total + progress;

      },
      0
    );

  // ========================================
  // Habits
  // ========================================

  const totalHabits =
    habitItems.length;

  // ========================================
  // Total Progress Items
  // ========================================
  //
  // فعلاً فقط Task + Goal
  // چون Habit هنوز completion روزانه ندارد.
  //
  // ========================================

  const totalItems =
    totalTasks +
    totalGoals;

  // ========================================
  // Calculate Progress
  // ========================================

  let progress = 0;

  if (totalItems > 0) {

    const taskProgress =
      completedTasks * 100;

    const totalProgress =
      taskProgress +
      goalProgress;

    progress =
      Math.round(
        totalProgress /
        totalItems
      );
  }

  // ========================================
  // Update Percentage
  // ========================================

  if (todayProgressPercent) {

    todayProgressPercent.textContent =
      `${progress}%`;
  }

  // ========================================
  // Update Progress Bar
  // ========================================

  if (todayProgressFill) {

    todayProgressFill.style.width =
      `${progress}%`;
  }

  // ========================================
  // Remove Previous States
  // ========================================

  if (welcomeCard) {

    welcomeCard.classList.remove(
      "progress-low",
      "progress-medium",
      "progress-high",
      "progress-complete"
    );
  }

  // ========================================
  // Progress State
  // ========================================

  if (
    progress === 100 &&
    totalItems > 0
  ) {

    if (welcomeCard) {

      welcomeCard.classList.add(
        "progress-complete"
      );
    }

    if (todayProgressStatus) {

      todayProgressStatus.textContent =
        "امروز کامل شد 🎉";
    }

  } else if (progress > 50) {

    if (welcomeCard) {

      welcomeCard.classList.add(
        "progress-high"
      );
    }

    if (todayProgressStatus) {

      todayProgressStatus.textContent =
        "عالی پیش می‌ری 🔥";
    }

  } else if (progress >= 50) {

    if (welcomeCard) {

      welcomeCard.classList.add(
        "progress-medium"
      );
    }

    if (todayProgressStatus) {

      todayProgressStatus.textContent =
        "خوبه، ادامه بده 💪";
    }

  } else {

    if (welcomeCard) {

      welcomeCard.classList.add(
        "progress-low"
      );
    }

    if (todayProgressStatus) {

      todayProgressStatus.textContent =
        "شروع کن 🚀";
    }
  }

  // ========================================
  // Progress Description
  // ========================================

  if (totalItems === 0) {

    if (todayProgressText) {

      if (totalHabits > 0) {

        todayProgressText.textContent =
          `${totalHabits} عادت فعال داری`;

      } else {

        todayProgressText.textContent =
          "هنوز کاری یا هدفی برای امروز نداری";
      }
    }

    return;
  }

  const parts = [];

  // ========================================
  // Task Description
  // ========================================

  if (totalTasks > 0) {

    parts.push(
      `${completedTasks} از ${totalTasks} کار`
    );
  }

  // ========================================
  // Goal Description
  // ========================================

  if (totalGoals > 0) {

    const averageGoalProgress =
      Math.round(
        goalProgress /
        totalGoals
      );

    parts.push(
      `${averageGoalProgress}% از هدف‌ها`
    );
  }

  // ========================================
  // Habit Description
  // ========================================

  if (totalHabits > 0) {

    parts.push(
      `${totalHabits} عادت`
    );
  }

  // ========================================
  // Final Description
  // ========================================

  if (todayProgressText) {

    todayProgressText.textContent =
      parts.join(" · ");
  }
}

// ========================================
// Load Goal Count
// ========================================

async function loadGoalCount() {

  try {

    const response =
      await window.apiRequest("/goals");

    const goals =
      Array.isArray(response.data)
        ? response.data
        : [];

    const count =
      goals.length;

    if (goalCount) {

      goalCount.textContent =
        count;
    }

    if (goalDescription) {

      if (count === 0) {

        goalDescription.textContent =
          "هنوز هدفی اضافه نکردی";

      } else if (count === 1) {

        goalDescription.textContent =
          "یک هدف فعال داری";

      } else {

        goalDescription.textContent =
          `${count} هدف فعال داری`;
      }
    }

  } catch (error) {

    console.error(
      "Failed to load goals:",
      error
    );

    if (goalCount) {

      goalCount.textContent =
        "—";
    }

    if (goalDescription) {

      goalDescription.textContent =
        "دریافت اطلاعات ناموفق بود";
    }
  }
}

// ========================================
// Load Habit Count
// ========================================

async function loadHabitCount() {

  try {

    const response =
      await window.apiRequest("/habits");

    console.log(
      "Habits API:",
      response
    );

    const habits =
      Array.isArray(response.data)
        ? response.data
        : [];

    const count =
      habits.length;

    if (habitCount) {

      habitCount.textContent =
        count;
    }

    if (habitDescription) {

      if (count === 0) {

        habitDescription.textContent =
          "هنوز عادتی اضافه نکردی";

      } else if (count === 1) {

        habitDescription.textContent =
          "یک عادت فعال داری";

      } else {

        habitDescription.textContent =
          `${count} عادت فعال داری`;
      }
    }

  } catch (error) {

    console.error(
      "Failed to load habits:",
      error
    );

    if (habitCount) {

      habitCount.textContent =
        "—";
    }

    if (habitDescription) {

      habitDescription.textContent =
        "دریافت اطلاعات ناموفق بود";
    }
  }
}

// ========================================
// Load Tasks
// ========================================

async function loadTasks() {

  try {

    const response =
      await window.apiRequest(
        "/tasks/today"
      );

    const tasks =
      Array.isArray(response.data)
        ? response.data
        : [];

    renderTasks(tasks);

  } catch (error) {

    console.error(
      "Failed to load tasks:",
      error
    );

    taskList.innerHTML = `
      <div class="empty-tasks">
        دریافت کارهای امروز ناموفق بود.
      </div>
    `;

    if (taskCount) {

      taskCount.textContent =
        "0";
    }
  }
}

// ========================================
// Render Tasks
// ========================================

function renderTasks(tasks) {

  taskList.innerHTML = "";

  // ========================================
  // Empty State
  // ========================================

  if (
    !tasks ||
    tasks.length === 0
  ) {

    taskList.innerHTML = `
      <div class="empty-tasks">
        هنوز کاری برای امروز نداری.
      </div>
    `;

    if (taskCount) {

      taskCount.textContent =
        "0";
    }

    return;
  }

  // ========================================
  // Remaining Tasks
  // ========================================

  const remainingTasks =
    tasks.filter(
      task => !task.isCompleted
    ).length;

  if (taskCount) {

    taskCount.textContent =
      remainingTasks;
  }

  // ========================================
  // Render Tasks
  // ========================================

  tasks.forEach(task => {

    const taskItem =
      document.createElement("div");

    taskItem.className =
      "task-item";

    // ========================================
    // Completed
    // ========================================

    if (task.isCompleted) {

      taskItem.classList.add(
        "completed"
      );
    }

    taskItem.innerHTML = `
      <button
        type="button"
        class="task-check"
        data-id="${task.id}"
        title="تغییر وضعیت"
      >
        ${
          task.isCompleted
            ? "✓"
            : ""
        }
      </button>

      <span class="task-title">
        ${escapeHtml(task.title)}
      </span>

      <button
        type="button"
        class="task-delete"
        data-id="${task.id}"
        title="حذف"
      >
        ×
      </button>
    `;

    taskList.appendChild(
      taskItem
    );
  });
}

// ========================================
// Add Task
// ========================================

async function addTask(event) {

  event.preventDefault();

  const title =
    taskInput.value.trim();

  if (!title) {

    return;
  }

  try {

    await window.apiRequest(
      "/tasks",
      {
        method: "POST",

        body: JSON.stringify({
          title
        })
      }
    );

    taskInput.value = "";

    await loadTasks();

    await loadToday();

  } catch (error) {

    console.error(
      "Failed to add task:",
      error
    );

    alert(
      "اضافه کردن کار ناموفق بود."
    );
  }
}

// ========================================
// Toggle Task
// ========================================

async function toggleTask(
  id,
  isCompleted
) {

  try {

    await window.apiRequest(
      `/tasks/${id}`,
      {
        method: "PATCH",

        body: JSON.stringify({
          isCompleted:
            !isCompleted
        })
      }
    );

    await loadTasks();

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
// Delete Task
// ========================================

async function deleteTask(id) {

  try {

    await window.apiRequest(
      `/tasks/${id}`,
      {
        method: "DELETE"
      }
    );

    await loadTasks();

    await loadToday();

  } catch (error) {

    console.error(
      "Failed to delete task:",
      error
    );

    alert(
      "حذف کار ناموفق بود."
    );
  }
}

// ========================================
// Task Click Events
// ========================================

taskList.addEventListener(
  "click",
  event => {

    const checkButton =
      event.target.closest(
        ".task-check"
      );

    const deleteButton =
      event.target.closest(
        ".task-delete"
      );

    // ========================================
    // Toggle
    // ========================================

    if (checkButton) {

      const taskItem =
        checkButton.closest(
          ".task-item"
        );

      const id =
        checkButton.dataset.id;

      const isCompleted =
        taskItem.classList.contains(
          "completed"
        );

      toggleTask(
        id,
        isCompleted
      );

      return;
    }

    // ========================================
    // Delete
    // ========================================

    if (deleteButton) {

      const id =
        deleteButton.dataset.id;

      deleteTask(id);
    }
  }
);

// ========================================
// Add Task Form Event
// ========================================

taskForm.addEventListener(
  "submit",
  addTask
);

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
// Set Current Date
// ========================================

function setDate() {

  const today =
    new Date();

  const date =
    today.toLocaleDateString(
      "fa-IR",
      {
        weekday: "long",
        day: "numeric",
        month: "long"
      }
    );

  currentDate.textContent =
    date;
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
// Initialize Dashboard
// ========================================

async function initDashboard() {

  const token =
    localStorage.getItem(
      "accessToken"
    );

  if (!token) {

    window.location.href =
      "./login.html";

    return;
  }

  setDate();

  await Promise.all([
    loadProfile(),
    loadToday(),
    loadGoalCount(),
    loadHabitCount(),
    loadTasks()
  ]);
}

initDashboard();