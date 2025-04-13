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
  add_function_call(new_function_call) {
    const task_id = Math.floor(Math.random() * 10000)
    const id = "task_" + task_id
    
    new_function_call.id = id
    new_function_call.running = false;
    new_function_call.completed = false;
    new_function_call.type = 2
    new_function_call.stepsize = 0.0;

    let result = new_function_call.func.split(".")
    // get a reference to the function
    new_function_call.model = this._model_engine.models[result[0]]
    new_function_call.func = this._model_engine.models[result[0]][result[1]]

    // add the function call to the task list
    this._tasks[id] = new_function_call;
  }

  add_task(new_task) {
    // create task id
    const task_id = Math.floor(Math.random() * 10000)
    const id = "task_" + task_id
    new_task.id = id
    new_task.running = false;
    new_task.completed = false;

    new_task.model = this._model_engine.models[new_task.model]

    let current_value = new_task.model[new_task.prop1];
    if (new_task.prop2 !== null) {
      current_value = current_value[new_task.prop2];
    }
    new_task.current_value = current_value;

    if (typeof current_value === "number") {
      new_task.type = 0;
    } else if (typeof current_value === "boolean" || typeof current_value === "string"
    ) {
      new_task.type = 1;
    }

    // calculate the stepsize
    if (new_task.it > 0) {
      const stepsize =
        (new_task.t - current_value) /
        (new_task.it / this._task_interval);
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
        if (task.at < this._task_interval && !task.running) {
          task.at = 0;
          
          switch (task.type) {
            case 0:
              // start the task
              task.running = true
              break
            case 1:
              // boolean or string type
              task.current_value = task.t;
              this._set_value(task);
              task.completed = true;
              finished_tasks.push(id);
              break;
            case 2:
              task.func.apply(task.model, task.args)
              task.completed = true;
              finished_tasks.push(id);
              break;
          }

        } else {
          // decrease the time remaining
          task.at -= this._task_interval;
        }

        // for numerical tasks, adjust the value incrementally
        if (task.type < 1 && task.running) {
          if (Math.abs(task.current_value - task.t) < Math.abs(task.stepsize)) {
            task.current_value = task.t;
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
