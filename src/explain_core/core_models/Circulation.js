export class Circulation {
  static model_type = "Circulation";
  static model_interface = [];

  constructor(model_ref, name = "") {
      // Independent properties
      this.name = name;
      this.description = "";
      this.is_enabled = false;
      this.dependencies = [];
      this.blood_containing_components = [];
      this.pulmonary_arteries = [];
      this.pulmonary_veins = [];
      this.systemic_arteries = [];
      this.systemic_veins = [];
      this.venpool_targets = [];
      this.svr_targets = [];
      this.pvr_targets = [];
      this.pvr_change = 1.0;
      this.svr_change = 1.0;
      this.venpool_change = 1.0;
      this.pulmartcomp_change = 1.0;
      this.systartcomp_change = 1.0;
      this.coarc_change = 1.0;
      this.vencomp_change = 1.0;
      this.svr_ans_factor = 1.0;
      this.pvr_ans_factor = 1.0;
      this.venpool_ans_factor = 1.0;
      this.total_blood_volume = 0.0;

      // Local properties
      this._model_engine = model_ref;
      this._is_initialized = false;
      this._t = model_ref.modeling_stepsize;
      this._svr_targets = [];
      this._pvr_targets = [];
      this._venpool_targets = [];
      this._update_counter = 0.0;
      this._update_window = 0.015;
  }

  init_model(args) {
    // set the values of the properties as passed in the arguments
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

      // Reference the ans models
      this._svr_targets = this.svr_targets.map(m => this._model_engine.models[m]);
      this._pvr_targets = this.pvr_targets.map(m => this._model_engine.models[m]);
      this._venpool_targets = this.venpool_targets.map(m => this._model_engine.models[m]);

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
      this._update_counter += this._t;
      if (this._update_counter > this._update_window) {
          this._update_counter = 0.0;

          // Apply the ans factors
          this._svr_targets.forEach(svrt => svrt.r_ans_factor = this.svr_ans_factor);
          this._pvr_targets.forEach(pvrt => pvrt.r_ans_factor = this.pvr_ans_factor);
          this._venpool_targets.forEach(vpt => vpt.u_vol_ans_factor = this.venpool_ans_factor);
      }
  }

  change_pvr(change_forward, change_backward = -1.0) {
      if (change_forward > 0.0) {
          this.pvr_change = change_forward;
          this._pvr_targets.forEach(pvrt => {
              pvrt.r_for_factor = change_forward;
              pvrt.r_back_factor = change_backward > 0.0 ? change_backward : change_forward;
          });
      }
  }

  change_svr(change_forward, change_backward = -1.0) {
      if (change_forward > 0.0) {
          this.svr_change = change_forward;
          this._svr_targets.forEach(svrt => {
              svrt.r_for_factor = change_forward;
              svrt.r_back_factor = change_backward > 0.0 ? change_backward : change_forward;
          });
      }
  }

  change_venpool(change) {
      if (change > 0.0) {
          this.venpool_change = change;
          this._venpool_targets.forEach(vpt => vpt.u_vol_factor = change);
      }
  }

  change_coarc(change_forward) {
      if (change_forward > 0.0) {
          this.coarc_change = change_forward;
          this._model_engine.models["AA_AAR"].r_for_factor = change_forward;
          this._model_engine.models["AA_AAR"].r_back_factor = change_forward;
      }
  }

  change_syst_arterial_elastance(change) {
      if (change > 0.0) {
          this.systartcomp_change = change;
          this.systemic_arteries.forEach(target => {
              this._model_engine.models[target].el_base_factor = change;
          });
      }
  }

  change_pulm_arterial_elastance(change) {
      if (change > 0.0) {
          this.pulmartcomp_change = change;
          this.pulmonary_arteries.forEach(target => {
              this._model_engine.models[target].el_base_factor = change;
          });
      }
  }

  change_venous_elastance(change) {
      if (change > 0.0) {
          this.vencomp_change = change;
          this.systemic_veins.forEach(target => {
              this._model_engine.models[target].el_base_factor = change;
          });
      }
  }

  get_total_blood_volume() {
      let total_volume = 0.0;
      this.blood_containing_components.forEach(target => {
          if (this._model_engine.models[target].is_enabled) {
              total_volume += this._model_engine.models[target].vol;
          }
      });
      this.total_blood_volume = total_volume;
      return total_volume;
  }

  set_total_blood_volume(new_blood_volume) {
      let current_blood_volume = this.get_total_blood_volume();
      let blood_volume_change = new_blood_volume / current_blood_volume;
      this.blood_containing_components.forEach(target => {
          if (this._model_engine.models[target].is_enabled) {
              this._model_engine.models[target].vol *= blood_volume_change;
              this._model_engine.models[target].u_vol *= blood_volume_change;
          }
      });
      this.total_blood_volume = this.get_total_blood_volume();
  }
}
