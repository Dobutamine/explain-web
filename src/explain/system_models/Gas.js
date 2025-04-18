import { BaseModelClass } from "../base_models/BaseModelClass";
import { calc_gas_composition } from "../helpers/GasComposition"

export class Gas extends BaseModelClass {
  // static properties
  static model_type = "Gas";
  static model_interface = [
    {
      caption: "atmospheric pressure (mmHg)",
      target: "set_atmospheric_pressure",
      type: "function",
      args:[
        {
          caption: "new atmospheric pressure",
          target: "pres_atm",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 5000.0,
          ll: 100.0,
        }
      ]
    },
    {
      caption: "temperature (C)",
      target: "set_temperature",
      type: "function",
      args:[
        {
          caption: "new temperature",
          target: "temp",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100.0,
          ll: -100.0,
        },
        {
          target: "site",
          caption: "change in site",
          type: "list",
          custom_options: false,
          options: ["GasCapacitance"]
        },
      ]
    },
    {
      caption: "humidity factor",
      target: "set_humidity",
      type: "function",
      args:[
        {
          caption: "new humidity",
          target: "humidity",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 1.0,
          ll: 0.0,
        },
        {
          target: "site",
          caption: "change in site",
          type: "list",
          custom_options: false,
          options: ["GasCapacitance"]
        },
      ]
    },
    {
      caption: "fio2",
      target: "set_fio2",
      type: "function",
      args:[
        {
          caption: "new fio2",
          target: "fio2",
          type: "number",
          factor: 1,
          delta: 0.01,
          rounding: 2,
          ul: 1.0,
          ll: 0.0,
        },
        {
          target: "site",
          caption: "change in site",
          type: "list",
          custom_options: false,
          options: ["GasCapacitance"]
        },
      ]
    },
  ];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.pres_atm = 760.0; // atmospheric pressure in mmHg
    this.fio2 = 0.21; // fractional O2 concentration
    this.temp = 20.0; // global gas temperature (dgs C)
    this.humidity = 0.5; // global gas humidity (fraction)
    this.humidity_settings = {}; // dictionary holding the initial humidity settings of gas containing models
    this.temp_settings = {}; // dictionary holding the initial temperature settings of gas containing models

    // local properties
    this._gas_containing_modeltypes = ["GasCapacitance", "Airway", "Bronchus", "AlveolarSpace", "Bronchiole"];
  }

  init_model(args = {}) {
    // set the values of the independent properties
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // set the atmospheric pressure and global gas temperature in all gas containing models
    Object.values(this._model_engine.models).forEach((model) => {
      if (this._gas_containing_modeltypes.includes(model.model_type)) {
        model.pres_atm = this.pres_atm;
        model.temp = this.temp;
        model.target_temp = this.temp;
      }
    });

    // set the temperatures of the different gas containing components
    Object.keys(this.temp_settings).forEach((model_name) => {
      let temp = this.temp_settings[model_name];
      this._model_engine.models[model_name].temp = temp;
      this._model_engine.models[model_name].target_temp = temp;
    });

    // set the humidity of the different gas containing components
    Object.keys(this.humidity_settings).forEach((model_name) => {
      let humidity = this.humidity_settings[model_name];
      this._model_engine.models[model_name].humidity = humidity;
    });

    // calculate the gas composition of the gas containing model types
    Object.values(this._model_engine.models).forEach((model) => {
      if (this._gas_containing_modeltypes.includes(model.model_type)) {
        calc_gas_composition(model, this.fio2, model.temp, model.humidity);
      }
    });

    // flag that the model is initialized
    this._is_initialized = true;
  }

  calc_model() {
    // empty for now
  }

  set_atmospheric_pressure(new_pres_atm) {
    this.pres_atm = new_pres_atm;

    // set the atmospheric pressure in all gas containing models
    Object.values(this._model_engine.models).forEach((model) => {
      if (this._gas_containing_modeltypes.includes(model.model_type)) {
        model.pres_atm = this.pres_atm;
      }
    });
  }

  set_temperature(new_temp, sites = ["OUT", "MOUTH"]) {
    // adjust the temperature in components stored in the sites parameter
    sites.forEach((site) => {
      this.temp_settings[site] = parseFloat(new_temp);
    });

    // set the temperatures of the different gas containing components
    Object.keys(this.temp_settings).forEach((model_name) => {
      let temp = this.temp_settings[model_name];
      this._model_engine.models[model_name].temp = temp;
      this._model_engine.models[model_name].target_temp = temp;
    });
  }

  set_humidity(new_humidity, sites = ["OUT", "MOUTH"]) {
    // adjust the humidity in components stored in the sites parameter
    sites.forEach((site) => {
      this.humidity_settings[site] = parseFloat(new_humidity);
    });

    // set the humidities of the different gas containing components
    Object.keys(this.humidity_settings).forEach((model_name) => {
      let humidity = this.humidity_settings[model_name];
      this._model_engine.models[model_name].humidity = humidity;
    });
  }

  set_fio2(new_fio2, sites = ["OUT", "MOUTH"]) {
    this.fio2 = new_fio2;

    // calculate the gas composition for the gas containing models
    sites.forEach((site) => {
      let m = this._model_engine.models[site];
      calc_gas_composition(m, this.fio2, m.temp, m.humidity);
    });
  }
}
