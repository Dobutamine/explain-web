export default class Datacollector {
  constructor(model) {
    // store a reference to the model instance
    this.model = model;

    // define the watch list
    this.watch_list = [];

    // define the watch list
    this.watch_list_slow = [];

    // define the data sample interval
    this.sample_interval = 0.005;
    this.sample_interval_slow = 1.0;

    this._interval_counter = 0;
    this._interval_counter_slow = 0;


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
    this.collected_data_slow = [];
  }

  clear_data() {
    this.collected_data = [];
  }

  clear_data_slow() {
    this.collected_data_slow = [];
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

  clear_watchlist_slow() {
    // first clear all data
    this.clear_data_slow();

    // empty the watch list
    this.watch_list_slow = [];
  }

  get_model_data() {
    // make a copy of the current data object
    let data = [...this.collected_data];
    // clear the current collection
    this.collected_data = [];
    // return the data object
    return data;
  }

  get_model_data_slow() {
    // make a copy of the current data object
    let data = [...this.collected_data_slow];
    // clear the current collection
    this.collected_data_slow = [];
    // return the data object
    return data;
  }

  set_sample_interval(new_interval = 0.005) {
    this.sample_interval = new_interval;
  }

  set_sample_interval_slow(new_interval = 0.005) {
    this.sample_interval_slow = new_interval;
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
        let processed_prop = this._find_model_prop(prop);

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

  add_to_watchlist_slow(properties) {
    // define a return object
    let success = true;

    // first clear all data
    this.clear_data_slow();

    // check whether property is a string
    if (typeof properties === "string") {
      // convert string to a list
      properties = [properties];
    }

    // add to the watchlist
    properties.forEach((prop) => {
      // check whether the property is already in the watchlist
      let duplicate = this.watch_list_slow.some((wl_item) => wl_item.label === prop);

      // if the property is not yet present then process it
      if (!duplicate) {
        // process the property as it has shape MODEL.prop1.prop2
        let processed_prop = this._find_model_prop(prop);

        // check whether the property is found and if so, add it to the watchlist
        if (processed_prop !== null) {
          this.watch_list_slow.push(processed_prop);
        } else {
          success = false;
        }
      }
    });

    return success;
  }

  clean_up() {
    let disabledModels = [];

    Object.entries(this.watch_list).forEach(([dc_name, dc_item]) => {
      if (!dc_item.model.is_enabled) {
        // remove this item from the data-collector
        disabledModels.push(dc_name);
      }
    });

    // remove the disabled models
    disabledModels.forEach((dm) => {
      delete this.watch_list[dm];
    });
  }

  clean_up_slow() {
    let disabledModels_slow = [];

    Object.entries(this.watch_list_slow).forEach(([dc_name, dc_item]) => {
      if (!dc_item.model.is_enabled) {
        // remove this item from the data-collector
        disabledModels_slow.push(dc_name);
      }
    });

    // remove the disabled models
    disabledModels_slow.forEach((dm) => {
      delete this.watch_list_slow[dm];
    });

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

    if (this._interval_counter_slow >= this.sample_interval_slow) {
      // reset the interval counter
      this._interval_counter_slow = 0;

      // declare a data object holding the current model time
      const data_object_slow = { time: Math.round(model_clock * 10000) / 10000 };

      // process the watch_list
      this.watch_list_slow.forEach((parameter) => {
        // get the value of the model variable as stated in the watchlist
        let value = parameter.model[parameter.prop1];
        if (parameter.prop2 !== null) {
          value = value[parameter.prop2] || 0;
        }

        // add the value to the data object
        data_object_slow[parameter.label] = value;
      });

      // add the data object to the collected data list
      this.collected_data_slow.push(data_object_slow);
    }

    // increase the interval counter
    this._interval_counter += this.modeling_stepsize;
    this._interval_counter_slow += this.modeling_stepsize;
  }

  _find_model_prop(prop) {
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
}
