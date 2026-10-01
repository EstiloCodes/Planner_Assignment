// 1. HTML 요소를 가져옵니다.
const form = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const dateInput = document.getElementById("task-date");
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

  for (let i = 0; i < tasks.length; i++) {
    const card = template.content.firstElementChild.cloneNode(true);
    const checkbox = card.querySelector(".task-check");
    const deleteButton = card.querySelector(".delete-button");

    card.querySelector(".task-title").textContent = tasks[i].title;
    card.querySelector(".category-tag").textContent = tasks[i].category;
    card.querySelector(".task-date").textContent = tasks[i].date;
    card.querySelector(".task-date").dateTime = tasks[i].date;
    checkbox.checked = tasks[i].done;
    checkbox.setAttribute("aria-label", tasks[i].title + " 완료");
    deleteButton.setAttribute("aria-label", tasks[i].title + " 삭제");

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
      taskList.children[i].querySelector(".task-check").focus();
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
    done: false
  });

  saveTasks();
  showTasks();
  form.reset();
  titleInput.focus();
});

titleInput.addEventListener("input", function () {
  titleInput.setCustomValidity("");
});

// 페이지를 열었을 때 저장된 목록을 표시합니다.
showTasks();
