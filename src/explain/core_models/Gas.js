import { calc_gas_composition } from "../helpers/GasComposition";

export class Gas {
  static model_type = "Gas";
  static model_interface = [];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];

  // dependent parameters

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _gas_constant = 62.36367;

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
        // calculate the pressure
        model.calc_model();

        // calculate the gas composition
        let result = calc_gas_composition(
          model,
          this.fio2,
          model.temp,
          model.humidity
        );

        // set the attributes
        for (let [att, value] of Object.entries(result)) {
          model[att] = value;
        }
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

  calc_model() {}

  get_total_gas_volume() {
    let total_volume = 0.0;
    for (let [model_name, model] of Object.entries(this._model_engine.models)) {
      if (model.model_type === "GasCapacitance") {
        if (model.is_enabled) {
          total_volume += model.vol;
        }
      }
    }
    return total_volume;
  }

  set_atmospheric_pressure() {
    for (let [model_name, model] of Object.entries(this._model_engine.models)) {
      if (model.model_type === "GasCapacitance") {
        model.pres_atm = this.pres_atm;
      }
    }
  }

  set_temperatures() {
    for (let [model_name, temp] of Object.entries(this.temp_settings)) {
      this._model_engine.models[model_name].temp = temp;
      this._model_engine.models[model_name].target_temp = temp;
    }
  }

  set_humidity() {
    for (let [model_name, humidity] of Object.entries(this.humidity_settings)) {
      this._model_engine.models[model_name].humidity = humidity;
    }
  }
}
