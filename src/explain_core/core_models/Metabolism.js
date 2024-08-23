export class Metabolism {
  static model_type = "Metabolism";
  static model_interface = [];

  constructor(model_ref, name = "") {
      // Independent properties
      this.name = name;
      this.description = "";
      this.is_enabled = false;
      this.dependencies = [];
      this.vo2 = 6.5;
      this.vo2_factor = 1.0;
      this.vo2_scaling_factor = 1.0;
      this.resp_q = 0.8;
      this.resp_q_scaling_factor = 1.0;
      this.body_temp = 37;
      this.metabolic_active_models = {
          "RLB": 0.15,
          "INT": 0.15,
          "LS": 0.1,
          "KID": 0.1,
          "RUB": 0.1,
          "AA": 0.005,
          "AD": 0.01,
          "BR": 0.453,
      };

      // Local properties
      this._model_engine = model_ref;
      this._is_initialized = false;
      this._t = model_ref.modeling_stepsize;
  }

  init_model(args) {
      // set the values of the properties as passed in the arguments
      args.forEach((arg) => {
        this[arg["key"]] = arg["value"];
      });

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
      // Translate the VO2 in ml/kg/min to VO2 in mmol for this stepsize (assumption is 37 degrees and atmospheric pressure)
      const vo2_step = (
          (0.039 * this.vo2 * this.vo2_factor * this.vo2_scaling_factor * this._model_engine.weight)
          / 60.0
      ) * this._t;

      for (const [model, fvo2] of Object.entries(this.metabolic_active_models)) {
          // Get the vol, tco2, and to2 from the blood compartment
          const vol = this._model_engine.models[model].vol;
          const to2 = this._model_engine.models[model].aboxy["to2"];
          const tco2 = this._model_engine.models[model].aboxy["tco2"];

          // Calculate the change in oxygen concentration in this step
          const dto2 = vo2_step * fvo2;

          // Calculate the new oxygen concentration in blood
          let new_to2 = (to2 * vol - dto2) / vol;
          if (new_to2 < 0) new_to2 = 0;

          // Calculate the change in co2 concentration in this step
          const dtco2 = vo2_step * fvo2 * this.resp_q * this.resp_q_scaling_factor;

          // Calculate the new co2 concentration in blood
          let new_tco2 = (tco2 * vol + dtco2) / vol;
          if (new_tco2 < 0) new_tco2 = 0;

          // Store the new to2 and tco2
          this._model_engine.models[model].aboxy["to2"] = new_to2;
          this._model_engine.models[model].aboxy["tco2"] = new_tco2;
      }
  }

  set_body_temp(new_temp) {
      this.body_temp = new_temp;
      for (const model of Object.values(this._model_engine.models)) {
          if (
              model.model_type === "BloodCompartment" ||
              model.model_type === "BloodTimeVaryingElastance"
          ) {
              model.temp = new_temp;
          }
      }
  }
}
