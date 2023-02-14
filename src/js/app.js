import TaskManager from './TaskManager';
import Storage from './Storage';

const storage = new Storage(localStorage);
const trello = new TaskManager(storage);
trello.init();
