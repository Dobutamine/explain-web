export class Lungs {
  static model_type = "Lungs";
  static model_interface = [];

  constructor(model_ref, name = "") {
      // Independent properties
      this.name = name;
      this.description = "";
      this.is_enabled = false;
      this.dependencies = [];
      this.upper_airways = [];
      this.dead_space = [];
      this.thorax = [];
      this.chestwall = [];
      this.alveolar_spaces = [];
      this.lower_airways = [];
      this.gas_exchangers = [];
      this.lung_shunts = [];

      // Dependent properties
      this.dif_o2_change = 1.0;
      this.dif_co2_change = 1.0;
      this.dead_space_change = 1.0;
      this.lung_comp_change = 1.0;
      this.chestwall_comp_change = 1.0;
      this.thorax_comp_change = 1.0;
      this.upper_aw_res_change = 1.0;
      this.lower_aw_res_change = 1.0;
      this.lung_shunt_change = 1.0;
      this.atelectasis_change = 1.0;

      // Local properties
      this._model_engine = model_ref;
      this._is_initialized = false;
      this._t = model_ref.modeling_stepsize;
      this._upper_airways = [];
      this._dead_space = [];
      this._thorax = [];
      this._chestwall = [];
      this._alveolar_spaces = [];
      this._lower_airways = [];
      this._gas_exchangers = [];
      this._lung_shunts = [];
  }

  init_model(args) {
      // set the values of the properties as passed in the arguments
      args.forEach((arg) => {
        this[arg["key"]] = arg["value"];
      });

      // Store a reference to the necessary models
      this.upper_airways.forEach(target => {
          this._upper_airways.push(this._model_engine.models[target]);
      });

      this.dead_space.forEach(target => {
          this._dead_space.push(this._model_engine.models[target]);
      });

      this.lower_airways.forEach(target => {
          this._lower_airways.push(this._model_engine.models[target]);
      });

      this.chestwall.forEach(target => {
          this._chestwall.push(this._model_engine.models[target]);
      });

      this.alveolar_spaces.forEach(target => {
          this._alveolar_spaces.push(this._model_engine.models[target]);
      });

      this.gas_exchangers.forEach(target => {
          this._gas_exchangers.push(this._model_engine.models[target]);
      });

      this.lung_shunts.forEach(target => {
          this._lung_shunts.push(this._model_engine.models[target]);
      });

      this.thorax.forEach(target => {
          this._thorax.push(this._model_engine.models[target]);
      });

      // Flag that the model is initialized
      this._is_initialized = true;
  }

  step_model() {
      if (this.is_enabled && this._is_initialized) {
          this.calc_model();
      }
  }

  calc_model() {
      // The core model calculations would be implemented here
  }

  change_lung_shunt(change_forward, change_backward = -1) {
      if (change_forward > 0.0) {
          this.lung_shunt_change = change_forward;
          this._lung_shunts.forEach(target => {
              target.r_for_factor = change_forward;
              target.r_back_factor = change_backward >= 0.0 ? change_backward : change_forward;
          });
      }
  }

  change_atelectasis(change) {
      if (change > 0.0) {
          this.atelectasis_change = change;
      }
  }

  change_dead_space(change) {
      if (change > 0.0) {
          this.dead_space_change = change;
          this._dead_space.forEach(target => {
              target.u_vol_factor = change;
          });
      }
  }

  change_dif(change) {
      if (change > 0.0) {
          this.dif_o2_change = change;
          this.dif_co2_change = change;
          this._gas_exchangers.forEach(target => {
              target.dif_o2_factor = change;
              target.dif_co2_factor = change;
          });
      }
  }

  change_dif_o2(change) {
      if (change > 0.0) {
          this.dif_o2_change = change;
          this._gas_exchangers.forEach(target => {
              target.dif_o2_factor = change;
          });
      }
  }

  change_dif_co2(change) {
      if (change > 0.0) {
          this.dif_co2_change = change;
          this._gas_exchangers.forEach(target => {
              target.dif_co2_factor = change;
          });
      }
  }

  change_lower_airway_resistance(change_forward, change_backward = -1) {
      if (change_forward > 0.0) {
          this.lower_aw_res_change = change_forward;
          this._lower_airways.forEach(target => {
              target.r_for_factor = change_forward;
              target.r_back_factor = change_backward >= 0.0 ? change_backward : change_forward;
          });
      }
  }

  change_upper_airway_resistance(change_forward, change_backward = -1) {
      if (change_forward > 0.0) {
          this.upper_aw_res_change = change_forward;
          this._upper_airways.forEach(target => {
              target.r_for_factor = change_forward;
              target.r_back_factor = change_backward >= 0.0 ? change_backward : change_forward;
          });
      }
  }

  change_thorax_compliance(change) {
      if (change > 0.0) {
          this.thorax_comp_change = change;
          this._thorax.forEach(target => {
              target.el_base_factor = 1.0 / change;
          });
      }
  }

  change_lung_compliance(change) {
      if (change > 0.0) {
          this.lung_comp_change = change;
          this._alveolar_spaces.forEach(target => {
              target.el_base_factor = 1.0 / change;
          });
      }
  }

  change_chestwall_compliance(change) {
      if (change > 0.0) {
          this.chestwall_comp_change = change;
          this._chestwall.forEach(target => {
              target.el_base_factor = 1.0 / change;
          });
      }
  }
}
