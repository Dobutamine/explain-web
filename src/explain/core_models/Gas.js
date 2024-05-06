import { set_gas_composition } from "../helpers/GasComposition";

export class Gas {
  static model_type = "Gas";
  static model_interface = [
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
          target: "new_temp",
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
          target: "new_humidity",
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
  ];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  total_gas_volume = 0.0;
  gas_containing_components = [];

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
    this.set_atmospheric_pressure();
    this.set_temperatures();
    this.set_humidity();

    //  we need a pressure to calculate the composition of the gas in the gas capacitances
    for (let [model_name, model] of Object.entries(this._model_engine.models)) {
      if (model.model_type === "GasCapacitance") {
        // calculate the gas composition
        set_gas_composition(model, this.fio2, model.temp, model.humidity);
      }
    }

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    if (this._update_counter > this._update_interval) {
      this._update_counter = 0.0;
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
    for (let [model_name, model] of Object.entries(this._model_engine.models)) {
      if (model.model_type === "GasCapacitance") {
        model.pres_atm = this.pres_atm;
      }
    }
  }

  set_new_temperature(new_temp, site) {
    if (new_temp >= 0.0 && new_temp <= 100.0) {
      if (this._model_engine.models[site].model_type == "GasCapacitance") {
        this._model_engine.models[site].temp = new_temp;
        this._model_engine.models[site].target_temp = new_temp;
      }
    }
  }

  set_temperatures() {
    for (let [model_name, temp] of Object.entries(this.temp_settings)) {
      this._model_engine.models[model_name].temp = temp;
      this._model_engine.models[model_name].target_temp = temp;
    }
  }

  set_new_humidity(new_humdity, site) {
    if (new_humdity >= 0.0 && new_humdity <= 1.0) {
      if (this._model_engine.models[site].model_type == "GasCapacitance") {
        this._model_engine.models[site].humidity = new_humdity;
      }
    }
  }

  set_humidity() {
    for (let [model_name, humidity] of Object.entries(this.humidity_settings)) {
      this._model_engine.models[model_name].humidity = humidity;
    }
  }
}
