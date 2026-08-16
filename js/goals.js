const goalsList = document.getElementById("goalsList");

const goalModal = document.getElementById("goalModal");
const goalModalOverlay = document.getElementById("goalModalOverlay");

const openGoalModal = document.getElementById("openGoalModal");
const closeGoalModal = document.getElementById("closeGoalModal");
const cancelGoal = document.getElementById("cancelGoal");

const goalForm = document.getElementById("goalForm");

const goalTitle = document.getElementById("goalTitle");
const goalDescription = document.getElementById("goalDescription");
const goalProgress = document.getElementById("goalProgress");

const userAvatar = document.getElementById("userAvatar");
const logoutButton = document.getElementById("logoutButton");

// ========================================
// State
// ========================================

let editingGoalId = null;

// ========================================
// Auth
// ========================================

function checkAuth() {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    window.location.href = "./login.html";

    return false;
  }

  return true;
}

// ========================================
// Load Profile
// ========================================

async function loadProfile() {
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
// Load Goals
// ========================================

async function loadGoals() {
  try {
    const response = await window.apiRequest("/goals");

    const goals = response.data;

    renderGoals(goals);
  } catch (error) {
    console.error("Failed to load goals:", error);

    goalsList.innerHTML = `
      <div class="empty-goals">

        <div class="empty-goals-icon">
          ⚠️
        </div>

        <h3>
          دریافت هدف‌ها ناموفق بود
        </h3>

        <p>
          دوباره تلاش کن.
        </p>

      </div>
    `;
  }
}

// ========================================
// Render Goals
// ========================================

function renderGoals(goals) {
  if (!goals || goals.length === 0) {
    goalsList.innerHTML = `
      <div class="empty-goals">

        <div class="empty-goals-icon">
          🎯
        </div>

        <h3>
          هنوز هدفی نداری
        </h3>

        <p>
          اولین هدفت رو بساز و مسیرت رو شروع کن.
        </p>

      </div>
    `;

    return;
  }

  goalsList.innerHTML = goals.map((goal) => createGoalCard(goal)).join("");
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
// Goal Card
// ========================================

function createGoalCard(goal) {
  const progress = Math.min(Math.max(Number(goal.progress) || 0, 0), 100);

  const progressClass = getProgressClass(progress);

  return `
    <article
      class="goal-card"
      data-id="${goal.id}"
    >

      <div class="goal-card-header">

        <h3 class="goal-card-title">
          ${escapeHtml(goal.title)}
        </h3>

        <div class="goal-menu">

          <button
            type="button"
            class="edit-goal"
            data-id="${goal.id}"
            title="ویرایش"
          >
            ✎
          </button>

          <button
            type="button"
            class="delete-goal"
            data-id="${goal.id}"
            title="حذف"
          >
            ×
          </button>

        </div>

      </div>


      <p class="goal-card-description">

        ${goal.description ? escapeHtml(goal.description) : "بدون توضیحات"}

      </p>


      <div class="goal-progress-header">

        <span class="goal-progress-label">
          پیشرفت
        </span>

        <span class="goal-progress-value">
          ${progress}٪
        </span>

      </div>


      <div class="goal-progress-bar">

        <div
          class="goal-progress-fill ${progressClass}"
          style="width: ${progress}%"
        ></div>

      </div>

    </article>
  `;
}

// ========================================
// Create / Update Goal
// ========================================

async function saveGoal(event) {
  event.preventDefault();

  const title = goalTitle.value.trim();

  const description = goalDescription.value.trim();

  const progress = Number(goalProgress.value);

  if (!title) {
    return;
  }

  const submitButton = goalForm.querySelector(".save-goal-btn");

  submitButton.disabled = true;

  submitButton.textContent = editingGoalId
    ? "در حال ذخیره..."
    : "در حال ساخت...";

  try {
    const payload = {
      title,
      description,
      progress,
    };

    // Update

    if (editingGoalId) {
      await window.apiRequest(`/goals/${editingGoalId}`, {
        method: "PATCH",

        body: JSON.stringify(payload),
      });
    }

    // Create
    else {
      await window.apiRequest("/goals", {
        method: "POST",

        body: JSON.stringify(payload),
      });
    }

    closeModal();

    resetForm();

    await loadGoals();
  } catch (error) {
    console.error("Failed to save goal:", error);

    alert(editingGoalId ? "ویرایش هدف انجام نشد." : "ساخت هدف انجام نشد.");
  } finally {
    submitButton.disabled = false;

    submitButton.textContent = "ساخت هدف";
  }
}

// ========================================
// Edit Goal
// ========================================

async function editGoal(id) {
  try {
    const response = await window.apiRequest(`/goals/${id}`);

    const goal = response.data;

    editingGoalId = goal.id;

    goalTitle.value = goal.title ?? "";

    goalDescription.value = goal.description ?? "";

    goalProgress.value = goal.progress ?? 0;

    goalModal.querySelector(".modal-label").textContent = "ویرایش هدف";

    goalModal.querySelector("h2").textContent = "هدف خودت رو به‌روزرسانی کن";

    goalModal.querySelector(".save-goal-btn").textContent = "ذخیره تغییرات";

    goalModal.classList.remove("hidden");

    document.body.style.overflow = "hidden";

    setTimeout(() => {
      goalTitle.focus();
    }, 100);
  } catch (error) {
    console.error("Failed to load goal:", error);

    alert("اطلاعات هدف دریافت نشد.");
  }
}

// ========================================
// Delete Goal
// ========================================

async function deleteGoal(id) {
  const confirmed = confirm("آیا از حذف این هدف مطمئنی؟");

  if (!confirmed) {
    return;
  }

  try {
    await window.apiRequest(`/goals/${id}`, {
      method: "DELETE",
    });

    await loadGoals();
  } catch (error) {
    console.error("Failed to delete goal:", error);

    alert("حذف هدف انجام نشد.");
  }
}

// ========================================
// Modal
// ========================================

function openModal() {
  resetForm();

  goalModal.classList.remove("hidden");

  document.body.style.overflow = "hidden";

  setTimeout(() => {
    goalTitle.focus();
  }, 100);
}

function closeModal() {
  goalModal.classList.add("hidden");

  document.body.style.overflow = "";
}

function resetForm() {
  goalForm.reset();

  goalProgress.value = 0;

  editingGoalId = null;

  goalModal.querySelector(".modal-label").textContent = "هدف جدید";

  goalModal.querySelector("h2").textContent = "یک هدف جدید بساز";

  goalModal.querySelector(".save-goal-btn").textContent = "ساخت هدف";
}

// ========================================
// Escape HTML
// ========================================

function escapeHtml(value) {
  const div = document.createElement("div");

  div.textContent = value ?? "";

  return div.innerHTML;
}

// ========================================
// Logout
// ========================================

function logout() {
  localStorage.removeItem("accessToken");

  window.location.href = "./login.html";
}

// ========================================
// Events
// ========================================

openGoalModal.addEventListener("click", openModal);

closeGoalModal.addEventListener("click", closeModal);

cancelGoal.addEventListener("click", closeModal);

goalModalOverlay.addEventListener("click", closeModal);

goalForm.addEventListener("submit", saveGoal);

logoutButton.addEventListener("click", logout);

// ========================================
// Goal Actions
// ========================================

goalsList.addEventListener("click", async (event) => {
  const editButton = event.target.closest(".edit-goal");

  const deleteButton = event.target.closest(".delete-goal");

  if (editButton) {
    const id = Number(editButton.dataset.id);

    await editGoal(id);

    return;
  }

  if (deleteButton) {
    const id = Number(deleteButton.dataset.id);

    await deleteGoal(id);
  }
});

// ========================================
// Escape Key
// ========================================

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !goalModal.classList.contains("hidden")) {
    closeModal();
  }
});

// ========================================
// Init
// ========================================

async function init() {
  if (!checkAuth()) {
    return;
  }

  await loadProfile();

  await loadGoals();
}

init();
