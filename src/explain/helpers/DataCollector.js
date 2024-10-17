export default class Datacollector {
  constructor(model) {
    // store a reference to the model instance
    this.model = model;

    // define the watch list
    this.watch_list = [];

    // define the data sample interval
    this.sample_interval = 0.005;
    this._interval_counter = 0;

    // get the modeling stepsize from the model
    this.modeling_stepsize = this.model.modeling_stepsize;

    // try to add two always-needed ecg properties to the watchlist
    this.ncc_ventricular = {
      label: "Heart.ncc_ventricular",
      model: this.model.models["Heart"],
      prop1: "ncc_ventricular",
      prop2: null,
    };
    this.ncc_atrial = {
      label: "Heart.ncc_atrial",
      model: this.model.models["Heart"],
      prop1: "ncc_atrial",
      prop2: null,
    };

    // add the two always there
    this.watch_list.push(this.ncc_atrial);
    this.watch_list.push(this.ncc_ventricular);

    // define the data list
    this.collected_data = [];
  }

  clear_data() {
    this.collected_data = [];
  }

  clear_watchlist() {
    // first clear all data
    this.clear_data();

    // empty the watch list
    this.watch_list = [];

    // add the two always present
    this.watch_list.push(this.ncc_atrial);
    this.watch_list.push(this.ncc_ventricular);
  }

  set_sample_interval(new_interval = 0.005) {
    this.sample_interval = new_interval;
  }

  add_to_watchlist(properties) {
    // define a return object
    let success = true;

    // first clear all data
    this.clear_data();

    // check whether property is a string
    if (typeof properties === "string") {
      // convert string to a list
      properties = [properties];
    }

    // add to the watchlist
    properties.forEach((prop) => {
      // check whether the property is already in the watchlist
      let duplicate = this.watch_list.some((wl_item) => wl_item.label === prop);

      // if the property is not yet present then process it
      if (!duplicate) {
        // process the property as it has shape MODEL.prop1.prop2
        let processed_prop = this.find_model_prop(prop);

        // check whether the property is found and if so, add it to the watchlist
        if (processed_prop !== null) {
          this.watch_list.push(processed_prop);
        } else {
          success = false;
        }
      }
    });

    return success;
  }

  find_model_prop(prop) {
    // split the model from the prop
    const t = prop.split(".");

    // if only 1 property is present
    if (t.length === 2) {
      // try to find the parameter in the model
      if (t[0] in this.model.models) {
        if (t[1] in this.model.models[t[0]]) {
          const r = this.model.models[t[0]][t[1]];
          return {
            label: prop,
            model: this.model.models[t[0]],
            prop1: t[1],
            prop2: null,
            ref: r,
          };
        }
      }
    }

    // if 2 properties are present
    if (t.length === 3) {
      // try to find the parameter in the model
      if (t[0] in this.model.models) {
        if (t[1] in this.model.models[t[0]]) {
          return {
            label: prop,
            model: this.model.models[t[0]],
            prop1: t[1],
            prop2: t[2],
          };
        }
      }
    }

    return null;
  }

  collect_data(model_clock) {
    // collect data at specific intervals set by the sample_interval
    if (this._interval_counter >= this.sample_interval) {
      // reset the interval counter
      this._interval_counter = 0;

      // declare a data object holding the current model time
      const data_object = { time: Math.round(model_clock * 10000) / 10000 };

      // process the watch_list
      this.watch_list.forEach((parameter) => {
        // get the value of the model variable as stated in the watchlist
        let value = parameter.model[parameter.prop1];
        if (parameter.prop2 !== null) {
          value = value[parameter.prop2] || 0;
        }

        // add the value to the data object
        data_object[parameter.label] = value;
      });

      // add the data object to the collected data list
      this.collected_data.push(data_object);
    }

    // increase the interval counter
    this._interval_counter += this.modeling_stepsize;
  }
}
