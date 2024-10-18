import { BaseModelClass } from "./BaseModelClass";

export class Gas extends BaseModelClass {
  // static properties
  static model_type = "Gas";
  static model_interface = [];

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
    this._gas_containing_modeltypes = ["GasCapacitance"];
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
        this.set_gas_composition(model, this.fio2, model.temp, model.humidity);
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
      this.set_gas_composition(m, this.fio2, m.temp, m.humidity);
    });
  }

  set_gas_composition(
    gc,
    fio2 = 0.205,
    temp = 37,
    humidity = 1.0,
    fico2 = 0.000392
  ) {
    const _fo2_dry = 0.205;
    const _fco2_dry = 0.000392;
    const _fn2_dry = 0.794608;
    const _fother_dry = 0.0;
    const _gas_constant = 62.36367;

    // calculate the dry gas composition depending on the supplied fio2
    let new_fo2_dry = fio2;
    let new_fco2_dry = fico2;
    let new_fn2_dry =
      (_fn2_dry * (1.0 - (fio2 + fico2))) / (1.0 - (_fo2_dry + _fco2_dry));
    let new_fother_dry =
      (_fother_dry * (1.0 - (fio2 + fico2))) / (1.0 - (_fo2_dry + _fco2_dry));

    // make sure the latest pressure is available
    gc.calc_model();

    // get the gas capacitance pressure
    let pressure = gc.pres;

    // calculate the concentration at this pressure and temperature in mmol/l using the gas law
    gc.ctotal = (pressure / (_gas_constant * (273.15 + temp))) * 1000.0;

    // calculate the water vapor pressure, concentration, and fraction for this temperature and humidity (0 - 1)
    gc.ph2o = Math.exp(20.386 - 5132 / (temp + 273)) * humidity;
    gc.fh2o = gc.ph2o / pressure;
    gc.ch2o = gc.fh2o * gc.ctotal;

    // calculate the o2 partial pressure, fraction, and concentration
    gc.po2 = new_fo2_dry * (pressure - gc.ph2o);
    gc.fo2 = gc.po2 / pressure;
    gc.co2 = gc.fo2 * gc.ctotal;

    // calculate the co2 partial pressure, fraction, and concentration
    gc.pco2 = new_fco2_dry * (pressure - gc.ph2o);
    gc.fco2 = gc.pco2 / pressure;
    gc.cco2 = gc.fco2 * gc.ctotal;

    // calculate the n2 partial pressure, fraction, and concentration
    gc.pn2 = new_fn2_dry * (pressure - gc.ph2o);
    gc.fn2 = gc.pn2 / pressure;
    gc.cn2 = gc.fn2 * gc.ctotal;

    // calculate the other gas partial pressure, fraction, and concentration
    gc.pother = new_fother_dry * (pressure - gc.ph2o);
    gc.fother = gc.pother / pressure;
    gc.cother = gc.fother * gc.ctotal;
  }
}
