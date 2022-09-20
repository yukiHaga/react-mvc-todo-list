class TodoListModel {
  constructor() {
    this.idCounter = 0;
    this.todos = new Map();
  }

  // 追加メソッド
  addTodo(task) {
    this.idCounter += 1;
    this.todos.set(this.idCounter, {
      id: this.idCounter,
      task,
      checked: false,
    });
    return this.idCounter;
  }

  // 取得メソッド
  getTodo(id) {
    return this.todos.get(id);
  }

  // 削除メソッド
  removeTodo(id) {
    this.todos.delete(id);
  }

  checkTodo(id, isCheck) {
    const todo = this.todos.get(id);
    todo.checked = isCheck;
    return todo;
  }

  getTodos() {
    return Array.from(this.todos.values());
  }
}

const todoList = new TodoListModel();

class View {
  // todoをUIに追加する
  addTodo(todo) {
    const todosEl = document.getElementById("todos");
    const todoEl = this._createTodoElement(todo);
    todosEl.appendChild(todoEl);
  }

  // fragmentでまとめてDOM要素を追加できる
  render(todos) {
    const todosEl = document.getElementById("todos");
    todosEl.innerHTML = "";
    const fragment = document.createDocumentFragment();
    todos.forEach((todo) => {
      const todoEl = this._createTodoElement(todo);
      fragment.appendChild(todoEl);
    });
    todosEl.appendChild(fragment);
  }

  // todo要素を作る
  _createTodoElement(todo) {
    const { id, task } = todo;

    const todoEl = document.createElement("div");
    todoEl.className = "content";
    todoEl.id = `todo-${id}`;

    const label = document.createElement("label");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `checkbox-${id}`;

    const span = document.createElement("span");
    span.className = "check-span";
    span.textContent = `${task}`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "delete-button";
    button.id = `button-${id}`;
    button.textContent = "削除";

    label.appendChild(checkbox);
    label.appendChild(span);
    todoEl.appendChild(label);
    todoEl.appendChild(button);

    return todoEl;
  }

  // 更新処理
  check(id) {
    const todoEl = document.getElementById(`todo-${id}`);
    todoEl.className = "checked";
  }

  unCheck(id) {
    const todoEl = document.getElementById(`todo-${id}`);
    todoEl.className = "";
  }

  // 削除処理
  removeTodo(id) {
    const todoEl = document.getElementById(`todo-${id}`);
    todoEl.remove();
  }

  // 入力フォームのリセット
  resetTodo() {
    const inputEl = document.getElementById("input-form");
    inputEl.value = "";
  }
}

const view = new View();

// 良くないところ
// 1. DOMを全更新している
// 2. データを変えるたびにUIを更新する関数(flash)を呼び出している
// 3. イベントハンドラを手動でつけ直す必要がある
class Controller {
  setup() {
    this.handleSubmitForm();
  }

  flash() {
    const todos = todoList.getTodos();
    view.render(todos);

    // イベントハンドラの付け直し
    todos.forEach((todo) => {
      const id = todo.id;
      this.handleCheckTask(id);
      this.handleClickDeleteTask(id);
    });
  }

  handleSubmitForm() {
    const registerButton = document.getElementById("register");
    registerButton.addEventListener("click", (e) => {
      e.preventDefault();

      const input = document.getElementById("input-form");
      const task = input.value;
      if (!task.length > 0) {
        alert("テキストを1文字以上入力してください");
        return;
      }
      // モデルで生成したインスタンスを更新した後に、UIを更新している。
      // こうすることで、データとして新しいTodoを保存して、それをUIに反映できる。
      // ユーザーからのフォーム送信イベントをコントローラからモデルとビューへと反映している。

      // modelにTodoを追加
      const addedTodoId = todoList.addTodo(task);
      this.flash();
    });
  }

  handleCheckTask(id) {
    const checkBoxEl = document.getElementById(`checkbox-${id}`);
    checkBoxEl.onchange = function (e) {
      const checked = e.target.checked;
      todoList.checkTodo(id, checked);
      this.flash();
    };
  }

  handleClickDeleteTask(id) {
    todoList.removeTodo(id);
    const buttonEl = document.getElementById(`button-${id}`);
    buttonEl.onclick = function () {
      todoList.removeTodo(id);
      this.flash();
    };
  }
}

const formController = new Controller();
formController.setup();
