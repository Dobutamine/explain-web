export default class DataCollector {
  collected_data = [];
  collected_data_slow = [];
  sample_interval = 0.005;
  sample_interval_slow = 1.0;
  watch_list = {};
  watch_list_complex = {};
  watch_list_slow = {};
  ncc_ventricular = {};
  ncc_atrial = {};

  // local parameters
  _model_engine = {};
  _interval_counter = 0;
  _interval_counter_slow = 0;

  constructor(model_ref) {
    // store a reference to the model instance
    this._model_engine = model_ref;

    // define the watch list
    this.watch_list = {};

    // define the data sample interval
    this.sample_interval = 0.005;
    this._interval_counter = 0;

    // get the modeling stepsize from the model
    this._t = this._model_engine.modeling_stepsize;

    // try to add two always needed ecg properties to the watchlist
    this.ncc_ventricular = {
      label: "Heart.ncc_ventricular",
      model: this._model_engine.models["Heart"],
      prop1: "ncc_ventricular",
    };
    this.ncc_atrial = {
      label: "Heart.ncc_atrial",
      model: this._model_engine.models["Heart"],
      prop1: "ncc_atrial",
    };
    this.ncc_breathing_insp = {
      label: "Breathing.ncc_insp",
      model: this._model_engine.models["Breathing"],
      prop1: "ncc_insp",
    };
    this.ncc_breathing_exp = {
      label: "Breathing.ncc_exp",
      model: this._model_engine.models["Breathing"],
      prop1: "ncc_exp",
    };
    this.ncc_ventilator_insp = {
      label: "Ventilator.ncc_insp",
      model: this._model_engine.models["Ventilator"],
      prop1: "ncc_insp",
    };
    this.ncc_ventilator_exp = {
      label: "Ventilator.ncc_exp",
      model: this._model_engine.models["Ventilator"],
      prop1: "ncc_exp",
    };

    // add the two always there
    this.watch_list[this.ncc_atrial["label"]] = this.ncc_atrial;
    this.watch_list[this.ncc_ventricular["label"]] = this.ncc_ventricular;
    this.watch_list[this.ncc_breathing_insp["label"]] = this.ncc_breathing_insp;
    this.watch_list[this.ncc_breathing_exp["label"]] = this.ncc_breathing_exp;
    this.watch_list[this.ncc_ventilator_insp["label"]] =
      this.ncc_ventilator_insp;
    this.watch_list[this.ncc_ventilator_exp["label"]] = this.ncc_ventilator_exp;

    // define the data list
    this.collected_data = [];
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
    this.watch_list = {};

    // add the two always there
    this.watch_list[this.ncc_atrial["label"]] = this.ncc_atrial;
    this.watch_list[this.ncc_ventricular["label"]] = this.ncc_ventricular;
    this.watch_list[this.ncc_breathing_insp["label"]] = this.ncc_breathing_insp;
    this.watch_list[this.ncc_breathing_exp["label"]] = this.ncc_breathing_exp;
    this.watch_list[this.ncc_ventilator_insp["label"]] =
      this.ncc_ventilator_insp;
    this.watch_list[this.ncc_ventilator_exp["label"]] = this.ncc_ventilator_exp;
  }

  clear_watchlist_slow() {
    // first clear all data
    this.clear_data_slow();

    // empty the watch list
    this.watch_list_slow = {};
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

  set_sample_interval(new_interval) {
    if (new_interval > 0.0005) {
      this.sample_interval = new_interval;
    }
  }

  set_sample_interval_slow(new_interval) {
    if (new_interval > 0.5) {
      this.sample_interval_slow = new_interval;
    }
  }

  add_to_watchlist(properties) {
    // first clear all data
    this.clear_data();

    if (typeof properties === "string") {
      properties = [properties];
    }

    // add all the desired properties
    properties.forEach((prop) => {
      // split the property
      let p = prop.split(".");
      let watch_list_item = {
        label: "",
        model: "",
        prop1: "",
        prop2: "",
      };
      try {
        if (this._model_engine.models[p[0]]) {
          switch (p.length) {
            case 2:
              watch_list_item = {
                label: prop,
                model: this._model_engine.models[p[0]],
                prop1: p[1],
              };
              this.watch_list[prop] = watch_list_item;
              // enable the analysis if it's min/max/mean/flow_min
              if (
                [
                  "pres_min",
                  "pres_max",
                  "pres_mean",
                  "pres_min_avg",
                  "pres_max_avg",
                  "pres_mean_avg",
                  "flow_lmin",
                  "flow_lmin_avg",
                  "flow_lmin_forward",
                  "flow_lmin_backward",
                  "vol_min",
                  "vol_max",
                  "vol_sv",
                  "vol_min_svg",
                  "vol_max_svg",
                  "vol_sv_svg",
                ].includes(p[1])
              ) {
                this._model_engine.models[p[0]].analysis_enabled = true;
              }

              break;
            case 3:
              watch_list_item = {
                label: prop,
                model: this._model_engine.models[p[0]],
                prop1: p[1],
                prop2: p[2],
              };
              this.watch_list[prop] = watch_list_item;
              break;
          }
        }
      } catch {}
    });
  }

  add_to_watchlist_slow(properties) {
    // first clear all data
    this.clear_data_slow();

    if (typeof properties === "string") {
      properties = [properties];
    }

    // add all the desired properties
    properties.forEach((prop) => {
      // split the property
      let p = prop.split(".");
      let watch_list_item = {
        label: "",
        model: "",
        prop1: "",
        prop2: "",
      };
      try {
        if (this._model_engine.models[p[0]]) {
          switch (p.length) {
            case 2:
              watch_list_item = {
                label: prop,
                model: this._model_engine.models[p[0]],
                prop1: p[1],
              };
              // enable the analysis if it's min/max/mean/flow_min
              if (
                [
                  "pres_min",
                  "pres_max",
                  "pres_mean",
                  "pres_min_avg",
                  "pres_max_avg",
                  "pres_mean_avg",
                  "flow_lmin",
                  "flow_lmin_avg",
                  "flow_lmin_forward",
                  "flow_lmin_backward",
                  "vol_min",
                  "vol_max",
                  "vol_sv",
                  "vol_min_svg",
                  "vol_max_svg",
                  "vol_sv_svg",
                ].includes(p[1])
              ) {
                this._model_engine.models[p[0]].analysis_enabled = true;
              }
              this.watch_list_slow[prop] = watch_list_item;

              break;
            case 3:
              watch_list_item = {
                label: prop,
                model: this._model_engine.models[p[0]],
                prop1: p[1],
                prop2: p[2],
              };
              this.watch_list_slow[prop] = watch_list_item;
              break;
          }
        }
      } catch {
        console.log("error adding to watchlist slow");
      }
    });
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
    let disabledModels = [];

    Object.entries(this.watch_list_slow).forEach(([dc_name, dc_item]) => {
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

  collect_data(model_clock) {
    if (this._interval_counter >= this.sample_interval) {
      // reset the counter
      this._interval_counter = 0;

      // define a data object
      let data_object = { time: parseFloat(model_clock.toFixed(3)) };

      // iterate over the watchlist
      Object.values(this.watch_list).forEach((fast_item) => {
        let value = fast_item.model[fast_item.prop1];

        if (fast_item.prop2) {
          value = fast_item.model[fast_item.prop1][fast_item.prop2];
        }

        if (!fast_item.model["is_enabled"]) {
          value = NaN;
        }

        // complete the data_object
        data_object[fast_item.label] = value;
      });
      this.collected_data.push(data_object);
    }

    if (this._interval_counter_slow >= this.sample_interval_slow) {
      // reset the counter
      this._interval_counter_slow = 0;

      // define a data object
      let data_object = { time: parseFloat(model_clock.toFixed(3)) };

      // iterate over the watchlist
      Object.values(this.watch_list_slow).forEach((slow_item) => {
        let value = slow_item.model[slow_item.prop1];

        if (slow_item.prop2) {
          value = slow_item.model[slow_item.prop1][slow_item.prop2];
        }

        // complete the data_object
        data_object[slow_item.label] = value;
      });
      this.collected_data_slow.push(data_object);
    }

    this._interval_counter += this._t;
    this._interval_counter_slow += this._t;
  }
}
