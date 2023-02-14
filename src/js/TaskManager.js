import DragAndDrop from './DragAndDrop';

export default class TaskManager {
  constructor(storage) {
    this.storage = storage;
    this.draggedEl = null;
    this.ghostEl = null;
    this.draggedElWidth = null;
    this.draggedElHeight = null;
    this.elLeftPos = null;
    this.elTopPos = null;
    this.todo = document.getElementById('todo');
    this.progress = document.getElementById('progress');
    this.done = document.getElementById('done');
    this.taskContainer = document.querySelector('.task_container');
    this.todoList = [];
    this.progressList = [];
    this.doneList = [];
    this.taskList = {
      todo: [],
      progress: [],
      done: [],
    };
    this.addButtons = document.querySelectorAll('.input_add_btn');
    this.openFormButtons = document.querySelectorAll('.add_btn');
    this.resetButtons = document.querySelectorAll('.input_reset');
    this.draggedItems = document.querySelectorAll('.task_list');
  }

  init() {
    const archiveData = this.storage.load();
    if (archiveData) {
      for (const item of archiveData.todo) {
        this.drawItem(item, this.todo.querySelector('.task_list'));
      }

      for (const item of archiveData.progress) {
        this.drawItem(item, this.progress.querySelector('.task_list'));
      }

      for (const item of archiveData.done) {
        this.drawItem(item, this.done.querySelector('.task_list'));
      }
    }

    this.draggedItems.forEach((element) => {
      element.addEventListener('mousedown', (evt) => {
        evt.preventDefault();
        if (!evt.target.classList.contains('list_item')) {
          return;
        }
        this.draggedEl = evt.target;
        this.ghostEl = evt.target.cloneNode(true);

        const { top, left } = evt.target.getBoundingClientRect();
        this.elLeftPos = evt.pageX - left;
        this.elTopPos = evt.pageY - top;

        this.draggedElWidth = this.draggedEl.offsetWidth;
        this.draggedElHeight = this.draggedEl.offsetHeight;

        this.ghostEl.style.width = `${this.draggedElWidth}px`;

        this.ghostEl.classList.add('dragged');

        document.querySelector('.task_list').appendChild(this.ghostEl);

        this.ghostEl.style.left = `${evt.pageX - this.elLeftPos}px`;
        this.ghostEl.style.top = `${evt.pageY - this.elTopPos}px`;
        this.draggedEl.style.opacity = 30;

        /* this.ghostEl.innerHTML = ''; */
        this.ghostEl.style.height = `${this.draggedElHeight}px`;
        this.draggedEl.classList.add('dragged');
        evt.target.parentNode.insertBefore(this.ghostEl, evt.target.nextElementSibling);

        this.draggedEl.style.width = `${this.draggedElWidth}px`;
        this.draggedEl.style.height = `${this.draggedElHeight}px`;
      });
    });

    this.taskContainer.addEventListener('mousemove', (event) => {
      if (this.draggedEl) {
        event.preventDefault();
        DragAndDrop(event, this.ghostEl);
        this.draggedEl.style.left = `${event.pageX - this.elLeftPos}px`;
        this.draggedEl.style.top = `${event.pageY - this.elTopPos}px`;
      }
    });

    this.taskContainer.addEventListener('mouseup', (event) => {
      if (this.draggedEl) {
        DragAndDrop(event, this.draggedEl);
        this.ghostEl.parentNode.removeChild(this.ghostEl);
        this.draggedEl.classList.remove('dragged');
        this.draggedEl.style = '';
        this.ghostEl = null;
        this.draggedEl = null;
        this.saveData();
      }
    });

    this.openFormButtons.forEach((element) => {
      element.addEventListener('click', ((event) => {
        event.preventDefault();
        element.parentNode.querySelector('.input_container').classList.remove('none');
        element.classList.add('none');
      }));
    });

    this.addButtons.forEach((element) => {
      element.addEventListener('click', ((event) => {
        event.preventDefault();
        const newTask = element.parentNode.querySelector('.input_task').value;
        const targetColumn = element.closest('.column').querySelector('.task_list');
        this.drawItem(newTask, targetColumn);
        element.parentNode.classList.add('none');
        element.closest('.input_container').closest('.column').querySelector('.add_btn').classList.remove('none');
        element.parentNode.querySelector('.input_task').value = '';
        this.saveData();
      }));
    });

    this.resetButtons.forEach((element) => {
      element.addEventListener('click', ((event) => {
        event.preventDefault();
        element.parentNode.querySelector('.input_task').value = '';
        element.parentNode.classList.add('none');
        element.closest('.input_container').closest('.column').querySelector('.add_btn').classList.remove('none');
        this.saveData();
      }));
    });
  }

  drawItem(inputText, targetEl) {
    const item = document.createElement('li');
    item.classList.add('list_item');
    item.innerHTML = `
    ${inputText}<span class="task_item_del">&#x2716;</span>
`;
    targetEl.append(item);
    const itemDeletetBtn = item.querySelector('.task_item_del');

    itemDeletetBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.target.parentNode.remove();
      this.saveData();
    });
  }

  saveData() {
    this.todoList = this.todo.querySelectorAll('.list_item');
    this.progressList = this.progress.querySelectorAll('.list_item');
    this.doneList = this.done.querySelectorAll('.list_item');

    for (const item of this.todoList) {
      let tasktext = item.textContent;
      const deleteIndex = tasktext.indexOf('✖');
      tasktext = tasktext.slice(0, deleteIndex);
      this.taskList.todo.push(tasktext);
    }

    for (const item of this.progressList) {
      let tasktext = item.textContent;
      const deleteIndex = tasktext.indexOf('✖');
      tasktext = tasktext.slice(0, deleteIndex);
      this.taskList.progress.push(tasktext);
    }

    for (const item of this.doneList) {
      let tasktext = item.textContent;
      const deleteIndex = tasktext.indexOf('✖');
      tasktext = tasktext.slice(0, deleteIndex);
      this.taskList.done.push(tasktext);
    }
    this.storage.save(this.taskList);
    this.taskList = {
      todo: [],
      progress: [],
      done: [],
    };
  }
}
