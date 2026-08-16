// ========================================
// Elements
// ========================================

const habitForm = document.getElementById("habitForm");
const habitInput = document.getElementById("habitInput");
const habitList = document.getElementById("habitList");
const habitCount = document.getElementById("habitCount");

const logoutButton = document.getElementById("logoutButton");
const userAvatar = document.getElementById("userAvatar");

// ========================================
// Load Profile
// ========================================

async function loadProfile() {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    window.location.href = "./login.html";
    return;
  }

  try {
    const response = await window.apiRequest("/users/me");

    const user = response.data;

    userAvatar.textContent = user.name.charAt(0);
  } catch (error) {
    console.error("Failed to load profile:", error);

    logout();
  }
}

// ========================================
// Load Habits
// ========================================

async function loadHabits() {
  try {
    const response = await window.apiRequest("/habits");

    const habits = response.data;

    renderHabits(habits);
  } catch (error) {
    console.error("Failed to load habits:", error);

    habitList.innerHTML = `
            <div class="empty-habits">
                دریافت عادت‌ها ناموفق بود.
            </div>
        `;
  }
}

// ========================================
// Render Habits
// ========================================

function renderHabits(habits) {
  habitList.innerHTML = "";

  if (!habits || habits.length === 0) {
    habitList.innerHTML = `
            <div class="empty-habits">
                هنوز عادتی اضافه نکردی.
            </div>
        `;

    if (habitCount) {
      habitCount.textContent = "0";
    }

    return;
  }

  // Active habits count

  const activeCount = habits.filter((habit) => habit.isActive).length;

  if (habitCount) {
    habitCount.textContent = `${activeCount} فعال`;
  }

  habits.forEach((habit) => {
    const habitItem = document.createElement("div");

    habitItem.className = "habit-item";

    // Status

    const statusClass = habit.isActive ? "active" : "inactive";

    const statusText = habit.isActive ? "فعال" : "غیرفعال";

    // Toggle

    const toggleClass = habit.isActive ? "deactivate" : "activate";

    const toggleText = habit.isActive ? "غیرفعال کردن" : "فعال کردن";

    habitItem.innerHTML = `

            <div class="habit-info">

                <h3 class="habit-title">
                    ${escapeHtml(habit.title)}
                </h3>

                <div class="habit-status ${statusClass}">

                    <span class="habit-status-dot"></span>

                    <span>
                        ${statusText}
                    </span>

                </div>

            </div>


            <div class="habit-actions">

                <button
                    type="button"
                    class="habit-toggle ${toggleClass}"
                    data-id="${habit.id}"
                >
                    ${toggleText}
                </button>


                <button
                    type="button"
                    class="habit-delete"
                    data-id="${habit.id}"
                    title="حذف عادت"
                >
                    ×
                </button>

            </div>
        `;

    habitList.appendChild(habitItem);
  });
}

// ========================================
// Add Habit
// ========================================

async function addHabit(event) {
  event.preventDefault();

  const title = habitInput.value.trim();

  if (!title) {
    return;
  }

  try {
    await window.apiRequest("/habits", {
      method: "POST",

      body: JSON.stringify({
        title,
      }),
    });

    habitInput.value = "";

    await loadHabits();
  } catch (error) {
    console.error("Failed to add habit:", error);

    alert("اضافه کردن عادت ناموفق بود.");
  }
}

// ========================================
// Toggle Habit
// ========================================

async function toggleHabit(id) {
  try {
    const habit = await window.apiRequest(`/habits/${id}`);

    const currentHabit = habit.data;

    await window.apiRequest(`/habits/${id}`, {
      method: "PATCH",

      body: JSON.stringify({
        isActive: !currentHabit.isActive,
      }),
    });

    await loadHabits();
  } catch (error) {
    console.error("Failed to toggle habit:", error);

    alert("تغییر وضعیت عادت ناموفق بود.");
  }
}

// ========================================
// Delete Habit
// ========================================

async function deleteHabit(id) {
  const confirmed = confirm("آیا از حذف این عادت مطمئنی؟");

  if (!confirmed) {
    return;
  }

  try {
    await window.apiRequest(`/habits/${id}`, {
      method: "DELETE",
    });

    await loadHabits();
  } catch (error) {
    console.error("Failed to delete habit:", error);

    alert("حذف عادت ناموفق بود.");
  }
}

// ========================================
// Click Events
// ========================================

habitList.addEventListener("click", (event) => {
  const toggleButton = event.target.closest(".habit-toggle");

  const deleteButton = event.target.closest(".habit-delete");

  if (toggleButton) {
    const id = toggleButton.dataset.id;

    toggleHabit(id);

    return;
  }

  if (deleteButton) {
    const id = deleteButton.dataset.id;

    deleteHabit(id);
  }
});

// ========================================
// Add Habit Form
// ========================================

habitForm.addEventListener("submit", addHabit);

// ========================================
// Escape HTML
// ========================================

function escapeHtml(value) {
  const div = document.createElement("div");

  div.textContent = value;

  return div.innerHTML;
}

// ========================================
// Logout
// ========================================

function logout() {
  localStorage.removeItem("accessToken");

  window.location.href = "./login.html";
}

logoutButton.addEventListener("click", logout);

// ========================================
// Initialize
// ========================================

loadProfile();

loadHabits();
