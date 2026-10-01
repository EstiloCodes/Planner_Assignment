// 1. HTML 요소를 가져옵니다.
const form = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const dateInput = document.getElementById("task-date");
const dateConfirm = document.getElementById("date-confirm");
const dateStatus = document.getElementById("date-status");
const categoryInput = document.getElementById("task-category");
const taskList = document.getElementById("task-list");
const template = document.getElementById("task-template");
const remainingCount = document.getElementById("remaining-count");
const totalCount = document.getElementById("total-count");
const emptyMessage = document.getElementById("empty-message");
const storageMessage = document.getElementById("storage-message");

// 2. 저장된 일정이 있으면 읽어옵니다.
let tasks = [];
try {
  tasks = JSON.parse(localStorage.getItem("daynote-tasks")) || [];
} catch (error) {
  storageMessage.textContent = "저장한 일정을 읽지 못했습니다. 새 일정을 등록해 주세요.";
}

// 3. 배열을 브라우저에 저장합니다.
function saveTasks() {
  try {
    localStorage.setItem("daynote-tasks", JSON.stringify(tasks));
    storageMessage.textContent = "일정은 이 브라우저에 자동으로 저장됩니다.";
  } catch (error) {
    storageMessage.textContent = "자동 저장을 사용할 수 없습니다. 이 창에서만 일정을 관리할 수 있습니다.";
  }
}

// 4. HTML의 카드 틀을 복사해서 목록을 만듭니다.
function showTasks() {
  taskList.replaceChildren();
  let remaining = 0;

  // 1회차는 중요한 일정, 2회차는 일반 일정만 표시합니다.
  for (let priority = 1; priority >= 0; priority--) {
    for (let i = 0; i < tasks.length; i++) {
      if (priority === 1 && !tasks[i].important) continue;
      if (priority === 0 && tasks[i].important) continue;

      const card = template.content.firstElementChild.cloneNode(true);
      const checkbox = card.querySelector(".task-check");
      const starButton = card.querySelector(".star-button");
      const deleteButton = card.querySelector(".delete-button");

      card.querySelector(".task-title").textContent = tasks[i].title;
      card.querySelector(".category-tag").textContent = tasks[i].category;
      card.querySelector(".task-date").textContent = tasks[i].date;
      card.querySelector(".task-date").dateTime = tasks[i].date;
      checkbox.checked = tasks[i].done;
      checkbox.id = "check-" + i;
      starButton.id = "star-" + i;
      checkbox.setAttribute("aria-label", tasks[i].title + " 완료");
      starButton.setAttribute("aria-label", tasks[i].title + " 중요 표시");
      deleteButton.setAttribute("aria-label", tasks[i].title + " 삭제");

      if (tasks[i].important) {
        card.classList.add("important");
        starButton.textContent = "★";
        starButton.setAttribute("aria-pressed", "true");
        card.querySelector(".important-label").hidden = false;
      }

      if (tasks[i].done) {
        card.classList.add("completed");
        card.querySelector(".done-label").hidden = false;
      } else {
        remaining++;
      }

      // 완료 여부를 바꾼 후 다시 저장하고 표시합니다.
      checkbox.addEventListener("change", function () {
        tasks[i].done = checkbox.checked;
        saveTasks();
        showTasks();
        document.getElementById("check-" + i).focus();
      });

      // 별을 누르면 중요 여부를 바꾸고 중요한 일정을 먼저 표시합니다.
      starButton.addEventListener("click", function () {
        tasks[i].important = !tasks[i].important;
        saveTasks();
        showTasks();
        document.getElementById("star-" + i).focus();
      });

      // splice(i, 1)은 i번째 일정을 한 개 삭제합니다.
      deleteButton.addEventListener("click", function () {
        tasks.splice(i, 1);
        saveTasks();
        showTasks();
        titleInput.focus();
      });

      taskList.appendChild(card);
    }
  }

  remainingCount.textContent = remaining;
  totalCount.textContent = tasks.length;
  emptyMessage.hidden = tasks.length > 0;
}

// 5. 추가 버튼을 누르면 일정 객체를 배열에 넣습니다.
form.addEventListener("submit", function (event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (title === "") {
    titleInput.setCustomValidity("할 일을 입력해 주세요.");
    titleInput.reportValidity();
    return;
  }

  tasks.push({
    title: title,
    date: dateInput.value,
    category: categoryInput.value,
    done: false,
    important: false
  });

  saveTasks();
  showTasks();
  form.reset();
  dateStatus.hidden = true;
  titleInput.focus();
});

titleInput.addEventListener("input", function () {
  titleInput.setCustomValidity("");
});

// 날짜 확인은 선택한 날짜를 표시하며 일정을 추가하지는 않습니다.
dateConfirm.addEventListener("click", function () {
  if (!dateInput.reportValidity()) return;
  dateStatus.textContent = "선택한 날짜: " + dateInput.value;
  dateStatus.hidden = false;
  dateInput.blur();
});

dateInput.addEventListener("input", function () {
  dateStatus.hidden = true;
});

// 페이지를 열었을 때 저장된 목록을 표시합니다.
showTasks();
