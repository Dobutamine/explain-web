export default class TaskScheduler {
  constructor(model_ref) {
    this._model_engine = model_ref; // object holding a reference to the model engine
    this._t = model_ref.modeling_stepsize; // setting the modeling stepsize
    this._is_initialized = false; // flag whether the model is initialized or not
    this.is_enabled = true; // flag to enable or disable the task scheduler

    // local properties
    this._tasks = {}; // dictionary holding the current tasks
    this._task_interval = 0.015; // interval at which tasks are evaluated
    this._task_interval_counter = 0.0; // counter
  }

  add_task(new_task) {
    const id = "task_" + new_task.id;
    delete new_task.id;
    new_task.running = false;
    new_task.completed = false;

    let current_value = new_task.model[new_task.prop1];
    if (new_task.prop2 !== null) {
      current_value = current_value[new_task.prop2];
    }
    new_task.current_value = current_value;

    if (typeof current_value === "number") {
      new_task.type = 0;
    } else if (
      typeof current_value === "boolean" ||
      typeof current_value === "string"
    ) {
      new_task.type = 1;
    }

    // calculate the stepsize
    if (new_task.in_time > 0) {
      const stepsize =
        (new_task.new_value - current_value) /
        (new_task.in_time / this._task_interval);
      new_task.stepsize = stepsize;
      if (stepsize !== 0.0) {
        this._tasks[id] = new_task;
      }
    } else {
      new_task.type = 1;
      new_task.stepsize = 0.0;
      this._tasks[id] = new_task;
    }

    if (new_task.type > 0) {
      // calculate the stepsize for boolean or string types
      new_task.stepsize = 0.0;
      this._tasks[id] = new_task;
    }
  }

  remove_task(task_id) {
    const id = "task_" + task_id;
    if (id in this._tasks) {
      delete this._tasks[id];
      return true;
    }
    return false;
  }

  remove_all_tasks() {
    this._tasks = {};
  }

  run_tasks() {
    if (this._task_interval_counter > this._task_interval) {
      const finished_tasks = [];
      // reset the counter
      this._task_interval_counter = 0.0;

      // run the tasks
      for (const id in this._tasks) {
        const task = this._tasks[id];

        // check if the task should be executed
        if (task.at_time < this._task_interval && !task.running) {
          task.at_time = 0;

          // for boolean or string types (immediate change)
          if (task.type > 0) {
            task.current_value = task.new_value;
            this._set_value(task);
            task.completed = true;
            finished_tasks.push(id);
          } else {
            // start the task
            task.running = true;
          }
        } else {
          // decrease the time remaining
          task.at_time -= this._task_interval;
        }

        // for numerical tasks, adjust the value incrementally
        if (task.type < 1 && task.running) {
          if (
            Math.abs(task.current_value - task.new_value) <
            Math.abs(task.stepsize)
          ) {
            task.current_value = task.new_value;
            this._set_value(task);
            task.stepsize = 0;
            task.completed = true;
            finished_tasks.push(id);
          } else {
            task.current_value += task.stepsize;
            this._set_value(task);
          }
        }
      }

      // remove completed tasks
      finished_tasks.forEach((ft) => {
        delete this._tasks[ft];
      });
    }

    if (this.is_enabled) {
      this._task_interval_counter += this._t;
    }
  }

  _set_value(task) {
    if (task.prop2 === null) {
      task.model[task.prop1] = task.current_value;
    } else {
      task.model[task.prop1][task.prop2] = task.current_value;
    }
  }
}
