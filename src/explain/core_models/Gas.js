import { set_gas_composition } from "../helpers/GasComposition";

export class Gas {
  static model_type = "Gas";
  static model_interface = [
    {
      target: "set_new_fio2",
      caption: "set gas fio2",
      type: "function",
      optional: false,
      args: [
        {
          target: "fio2",
          type: "number",
          default: 0.21,
          factor: 1,
          delta: 0.01,
          rounding: 2,
          ul: 1.0,
          ll: 0.02,
        },
        {
          target: "site",
          type: "multiple-list",
          default: "MOUTH",
          options: ["GasCapacitance"],
          options_default: [],
        },
      ],
    },
    {
      target: "set_new_atmospheric_pressure",
      caption: "atmospheric pressure (mmHg)",
      type: "function",
      optional: false,
      args: [
        {
          target: "pres_atm",
          type: "number",
          default: 760.0,
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 10000.0,
          ll: 0.0,
        },
      ],
    },
    {
      target: "set_new_temperature",
      caption: "set gas temperature (dgs C)",
      type: "function",
      optional: false,
      args: [
        {
          target: "temp",
          type: "number",
          default: 37.0,
          factor: 1,
          delta: 1,
          rounding: 1,
          ul: 100000.0,
          ll: 0.0,
        },
        {
          target: "site",
          type: "list",
          default: "MOUTH",
          options: ["GasCapacitance"],
          options_default: [],
        },
      ],
    },
    {
      target: "set_new_humidity",
      caption: "set gas humidity",
      type: "function",
      optional: false,
      args: [
        {
          target: "humidity",
          type: "number",
          default: 0.5,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 1.0,
          ll: 0.0,
        },
        {
          target: "site",
          type: "list",
          default: "MOUTH",
          options: ["GasCapacitance"],
          options_default: [],
        },
      ],
    },
    {
      target: "set_total_gas_volume",
      caption: "set total gas volume (l)",
      type: "function",
      optional: false,
      args: [
        {
          target: "total_gas_volume",
          type: "number",
          default: 0.5,
          factor: 1,
          delta: 0.001,
          rounding: 3,
          ul: 1.0,
          ll: 0.0,
        },
      ],
    },
  ];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  total_gas_volume = 0.0;
  gas_containing_components = [];
  pres_atm = 760;
  fio2 = 0.21;
  humidity = 0.5;
  temp = 20;
  humidity_settings = {
    OUT: 0.5,
    MOUTH: 0.5,
    DS: 1,
    ALL: 1,
    ALR: 1,
  };
  temp_settings = {
    OUT: 20,
    MOUTH: 20,
    DS: 32,
    ALL: 37,
    ALR: 37,
  };

  // dependent parameters
  po2_alv = 0.0;
  pco2_alv = 0.0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _gas_constant = 62.36367;
  _update_interval = 2.0;
  _update_counter = 0.0;

  // the constructor builds a bare bone modelobject of the correct type and with the correct name and stores a reference to the modelengine object
  constructor(model_ref, name = "", type = "") {
    // name of the model
    this.name = name;

    // model type

    this.model_type = type;
    // reference to the model engine

    this._model_engine = model_ref;
  }

  init_model(args) {
    // process the parameters
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // set the modeling step size
    this._t = this._model_engine.modeling_stepsize;

    // set the atmospheric pressure, temperatures and humidities of the gas capacitances
    for (let [_, model] of Object.entries(this._model_engine.models)) {
      if (model.model_type === "GasCapacitance") {
        model.pres_atm = this.pres_atm;
      }
    }

    // as the baseline state already has all the settings we do not need to reinitialize the model except when the values are 0
    for (let [model_name, temp] of Object.entries(this.temp_settings)) {
      if (
        !this._model_engine.models[model_name].temp ||
        this._model_engine.models[model_name].temp == 0.0
      ) {
        console.log("setting temp");
        this._model_engine.models[model_name].temp = temp;
        this._model_engine.models[model_name].target_temp = temp;
      }
    }

    for (let [model_name, humidity] of Object.entries(this.humidity_settings)) {
      if (
        !this._model_engine.models[model_name].humidity ||
        this._model_engine.models[model_name].humidity == 0.0
      ) {
        console.log("setting humidity");
        this._model_engine.models[model_name].humidity = humidity;
      }
    }

    //  we need a pressure to calculate the composition of the gas in the gas capacitances
    for (let [model_name, model] of Object.entries(this._model_engine.models)) {
      if (model.model_type === "GasCapacitance") {
        if (
          !this._model_engine.models[model_name].co2 ||
          this._model_engine.models[model_name].co2 == 0.0
        ) {
          console.log("setting gas composition");
          // calculate the gas composition
          set_gas_composition(model, this.fio2, model.temp, model.humidity);
        }
      }
    }

    // get the total gas volume
    this.get_total_gas_volume();

    // set the flag to model is initialized
    this._is_initialized = true;
  }
  set_gas_properties(model_name) {
    this._model_engine.models[model_name].pres_atm = this.pres_atm;
    console.log("setting gas composition on: ", model_name);
    set_gas_composition(
      this._model_engine.models[model_name],
      this._model_engine.models[model_name].fo2,
      this._model_engine.models[model_name].temp,
      this._model_engine.models[model_name].humidity
    );
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    if (this._update_counter > this._update_interval) {
      this._update_counter = 0.0;

      this.temp = this._model_engine.models["OUT"].temp;
      this.humidity = this._model_engine.models["OUT"].humidity;

      this.get_total_gas_volume();
    }

    this._update_counter += this._t;
  }

  set_total_gas_volume(new_gas_volume) {
    let current_gas_volume = this.get_total_gas_volume();
    let gas_volume_change = new_gas_volume / current_gas_volume;

    this.gas_containing_components.forEach((c) => {
      if (
        this._model_engine.models[c].is_enabled &&
        !this._model_engine.models[c].fixed_composition
      ) {
        this._model_engine.models[c].vol =
          this._model_engine.models[c].vol * gas_volume_change;
        this._model_engine.models[c].u_vol =
          this._model_engine.models[c].u_vol * gas_volume_change;
      }
    });
    this.total_gas_volume = this.get_total_gas_volume();
  }

  get_total_gas_volume() {
    let total_volume = 0.0;
    this.gas_containing_components.forEach((c) => {
      if (
        this._model_engine.models[c].is_enabled &&
        !this._model_engine.models[c].fixed_composition
      ) {
        total_volume += this._model_engine.models[c].vol;
      }
    });
    this.total_gas_volume = total_volume;

    return total_volume;
  }

  set_new_atmospheric_pressure(new_p_atm) {
    if (new_p_atm > 0.0) {
      this.pres_atm = new_p_atm;
      this.set_atmospheric_pressure();
    }
  }

  set_atmospheric_pressure() {
    for (let [_, model] of Object.entries(this._model_engine.models)) {
      if (model.model_type === "GasCapacitance") {
        model.pres_atm = this.pres_atm;
      }
    }
  }

  set_new_temperature(new_temp, sites = ["OUT", "MOUTH"]) {
    if (new_temp >= 0.0 && new_temp <= 100.0) {
      sites.forEach((site) => {
        if (this._model_engine.models[site].model_type == "GasCapacitance") {
          this.temp_settings[site] = new_temp;
          this._model_engine.models[site].temp = new_temp;
          this._model_engine.models[site].target_temp = new_temp;
          set_gas_composition(
            this._model_engine.models[site],
            this.fio2,
            new_temp,
            this._model_engine.models[site].humidity
          );
        }
      });
    }
  }

  set_temperatures() {
    for (let [model_name, temp] of Object.entries(this.temp_settings)) {
      this._model_engine.models[model_name].temp = temp;
      this._model_engine.models[model_name].target_temp = temp;
    }
  }

  set_new_fio2(new_fio2, sites = ["OUT", "MOUTH"]) {
    if (typeof sites === "string") {
      sites = [sites];
    }
    if (new_fio2 >= 0.2 && new_fio2 <= 1.0) {
      this.fio2 = new_fio2;
      sites.forEach((site) => {
        if (this._model_engine.models[site].model_type == "GasCapacitance") {
          this.fio2 = new_fio2;
          set_gas_composition(
            this._model_engine.models[site],
            this.fio2,
            this._model_engine.models[site].temp,
            this._model_engine.models[site].humidity
          );
        }
      });
    }
  }

  set_new_humidity(new_humidity, sites = ["OUT", "MOUTH"]) {
    if (typeof sites === "string") {
      sites = [sites];
    }
    if (new_humidity >= 0.0 && new_humidity <= 1.0) {
      this.humidity = new_humidity;
      sites.forEach((site) => {
        if (this._model_engine.models[site].model_type == "GasCapacitance") {
          this.humidity_settings[site] = new_humidity;
          this._model_engine.models[site].humidity = new_humidity;
          set_gas_composition(
            this._model_engine.models[site],
            this.fio2,
            this._model_engine.models[site].temp,
            new_humidity
          );
        }
      });
    }
  }

  set_humidity() {
    for (let [model_name, humidity] of Object.entries(this.humidity_settings)) {
      this._model_engine.models[model_name].humidity = humidity;
    }
  }
}
