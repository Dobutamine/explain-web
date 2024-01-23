export default class TaskScheduler {
  // define an object which has reference to the model
  model = {};

  // define a array holding a list with tasks which should run
  tasks = [];
  tasks_ready = false;

  _completed_tasks = [];

  _update_interval = 0.015;
  _update_counter = 0.0;

  // local parameters
  _model_engine = {};
  _t = 0.0005;

  constructor(_model_engine) {
    // get a reference to the whole model
    this._model_engine = _model_engine;

    // store the modeling stepsize
    this._t = _model_engine.modeling_stepsize;
  }

  update_tasks() {
    if (this._update_counter >= this._update_interval) {
      this._update_counter = 0;
      this.do_tasks();
    }
    this._update_counter += this._t;
  }

  clean_up() {
    this._completed_tasks.forEach((id) => {
      let index = -1;
      this.tasks.forEach((task, i) => {
        if (task.id == id) {
          index = i;
        }
      });
      if (index > -1) {
        console.log("Removed completed task with id: ", this.tasks[index].id);
        this.tasks.splice(index, 1);
      }
    });
  }

  do_tasks() {
    // is there a completed task
    let completed = false;
    this.tasks.forEach((task, index) => {
      if (task.status !== "completed") {
        if (task.at > 0) {
          task.status = "waiting";
          task.at -= this._update_interval;
        } else {
          task.at = 0;
          task.status = "running";
          task.it -= this._update_counter;
          switch (task.type) {
            case "number":
              if (Math.abs(task.v - task.t) < Math.abs(task.step)) {
                task.v = parseFloat(task.t);
                task.status = "completed";
                completed = true;
                this.tasks_ready = true;
                this._completed_tasks.push(task.id);
              } else {
                task.v += task.step;
              }

              // update the property
              try {
                task.m[task.p] = parseFloat(task.v);
              } catch {
                task.status = "completed";
                completed = true;
                task.it = 0;
                task.at = 0;
                this.tasks_ready = true;
                this._completed_tasks.push(task.id);
              }

              break;

            case "boolean":
              if (task.it <= 0) {
                task.v = task.t;
                task.status = "completed";
                completed = true;
                this.tasks_ready = true;
                // update the property
                task.m[task.p] = task.v;
                this._completed_tasks.push(task.id);
              }
              break;

            case "string":
              if (task.it <= 0) {
                task.v = task.t;
                task.status = "completed";
                completed = true;
                this.tasks_ready = true;
                // update the property
                task.m[task.p] = task.v;
                this._completed_tasks.push(task.id);
              }
              break;

            case "function":
              if (task.it <= 0) {
                task.status = "completed";
                completed = true;
                this.tasks_ready = true;
                // update the property
                task.m[task.p](...task.t);
                this._completed_tasks.push(task.id);
              }
              break;
          }
        }
      } else {
        completed = true;
      }
    });
    if (completed) {
      this.clean_up();
    }
  }

  add_task(new_prop_value) {
    // first cleanup
    this.clean_up();

    // build task
    let new_task = {
      id: Math.floor(Math.random() * 1000),
      m: {},
      p: {},
      o: {},
      t: new_prop_value.t,
      at: parseFloat(new_prop_value.at),
      it: parseFloat(new_prop_value.it),
      type: new_prop_value.type,
      ct: new_prop_value.ct,
      status: "scheduled",
      step: 0.0,
      v: 0.0,
    };

    let t = new_prop_value.prop.split(".");
    switch (t.length) {
      case 2:
        new_task.m = this._model_engine.models[t[0]];
        new_task.p = t[1];
        new_task.o = this._model_engine.models[t[0]][t[1]];
        new_task.v = this._model_engine.models[t[0]][t[1]];
        break;
      case 3:
        new_task.m = this._model_engine.models[t[0]][t[1]];
        new_task.p = t[2];
        new_task.o = this._model_engine.models[t[0]][t[1]][t[2]];
        new_task.v = this._model_engine.models[t[0]][t[1]][t[2]];
        break;
    }

    if (new_prop_value.type === "number") {
      if (new_prop_value.ct === "rel") {
        new_task.t = new_task.o * new_prop_value.t;
      }
      if (new_task.it > 0.0) {
        new_task.step =
          (new_task.t - new_task.o) / (new_task.it / this._update_interval);
      }
    }
    // push the task onto the list
    console.log("Added new task: ", new_task);
    this.tasks.push(new_task);
  }
}
