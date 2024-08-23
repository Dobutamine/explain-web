import { set_gas_composition } from "../helpers/GasComposition";

export class Gas {
  static model_type = "Gas";
  static model_interface = [];

  constructor(model_ref, name = "") {
      // Independent properties
      this.name = name;
      this.description = "";
      this.is_enabled = false;
      this.dependencies = [];
      this.gas_containing_components = [];
      this.humidity_settings = null;
      this.temp_settings = null;
      this.pres_atm = 760.0;
      this.fio2 = 0.21;
      this.humidity = 0.5;
      this.temp = 20.0;

      // Dependent properties
      this.total_gas_volume = 0.0;
      this.po2_alv = 0.0;
      this.pco2_alv = 0.0;

      // Local properties
      this._model_engine = model_ref;
      this._is_initialized = false;
      this._t = model_ref.modeling_stepsize;
      this._gas_constant = 62.36367;
      this._update_interval = 2.0;
      this._update_counter = 0.0;
  }

  init_model(args) {
      // set the values of the properties as passed in the arguments
      args.forEach((arg) => {
        this[arg["key"]] = arg["value"];
      });

      // Set the atmospheric pressure in all gas capacitances
      this.gas_containing_components.forEach(model_name => {
          this._model_engine.models[model_name].pres_atm = this.pres_atm;
      });

      // Set the temperatures
      Object.entries(this.temp_settings).forEach(([model_name, temp]) => {
          if (this._model_engine.models[model_name].temp === 0.0) {
              this._model_engine.models[model_name].temp = temp;
              this._model_engine.models[model_name].target_temp = temp;
          }
      });

      // Set the humidity
      Object.entries(this.humidity_settings).forEach(([model_name, humidity]) => {
          if (this._model_engine.models[model_name].humidity === 0.0) {
              this._model_engine.models[model_name].humidity = humidity;
          }
      });

      // Calculate the gas composition if not set already
      this.gas_containing_components.forEach(model_name => {
          if (this._model_engine.models[model_name].co2 === 0.0) {
              set_gas_composition(
                  this._model_engine.models[model_name],
                  this.fio2,
                  this._model_engine.models[model_name].temp,
                  this._model_engine.models[model_name].humidity
              );
          }
      });

      // Get the current total gas volume
      this.total_gas_volume = this.get_total_gas_volume();

      // Flag that the model is initialized
      this._is_initialized = true;
  }

  // This method is called during every model step by the model engine
  step_model() {
      if (this.is_enabled && this._is_initialized) {
          this.calc_model();
      }
  }

  // Actual model calculations are done here
  calc_model() {
      if (this._update_counter > this._update_interval) {
          this._update_counter = 0.0;

          this.temp = this._model_engine.models["OUT"].temp;
          this.humidity = this._model_engine.models["OUT"].humidity;

          this.get_total_gas_volume();
      }

      this._update_counter += this._t;
  }

  // Calculate the total gas volume
  get_total_gas_volume() {
      let total_volume = 0.0;
      this.gas_containing_components.forEach(model_name => {
          if (this._model_engine.models[model_name].is_enabled) {
              total_volume += this._model_engine.models[model_name].vol;
          }
      });

      return total_volume;
  }

  set_total_gas_volume(new_gas_volume) {
      const current_volume = this.get_total_gas_volume();
      const gas_volume_change = new_gas_volume / current_volume;

      this.gas_containing_components.forEach(model => {
          const m = this._model_engine.models[model];
          if (m.is_enabled && !m.fixed_composition) {
              m.vol *= gas_volume_change;
              m.u_vol *= gas_volume_change;
          }
      });
  }

  set_new_atmospheric_pressure(new_p_atm) {
      if (new_p_atm > 0.0) {
          this.pres_atm = new_p_atm;
          this.gas_containing_components.forEach(model => {
              this._model_engine.models[model].pres_atm = this.pres_atm;
          });
      }
  }

  set_new_temperature(new_temp, sites = ["OUT", "MOUTH"]) {
      if (typeof sites === 'string') {
          sites = [sites];
      }

      if (new_temp >= 0.0 && new_temp <= 100.0) {
          sites.forEach(site => {
              this.temp_settings[site] = new_temp;
              this._model_engine.models[site].temp = this.temp;
              this._model_engine.models[site].target_temp = this.temp;
              set_gas_composition(
                  this._model_engine.models[site],
                  this.fio2,
                  new_temp,
                  this._model_engine.models[site].humidity
              );
          });
      }
  }

  set_new_fio2(new_fio2, sites = ["OUT", "MOUTH"]) {
      if (typeof sites === 'string') {
          sites = [sites];
      }

      if (new_fio2 >= 0.21 && new_fio2 <= 1.0) {
          sites.forEach(site => {
              this.fio2 = new_fio2;
              set_gas_composition(
                  this._model_engine.models[site],
                  this.fio2,
                  this._model_engine.models[site].temp,
                  this._model_engine.models[site].humidity
              );
          });
      }
  }

  set_new_humidity(new_humidity, sites = ["OUT", "MOUTH"]) {
      if (typeof sites === 'string') {
          sites = [sites];
      }

      if (new_humidity >= 0.0 && new_humidity <= 1.0) {
          sites.forEach(site => {
              this.humidity_settings[site] = new_humidity;
              this._model_engine.models[site].humidity = new_humidity;
              set_gas_composition(
                  this._model_engine.models[site],
                  this.fio2,
                  this._model_engine.models[site].temp,
                  new_humidity
              );
          });
      }
  }
}
