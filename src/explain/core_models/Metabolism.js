import { BaseModelClass } from "./BaseModelClass";

export class Metabolism extends BaseModelClass {
  /*
    The Metabolism class models the oxygen use and carbon dioxide production in various blood-containing models.
    It calculates the changes in to2 and tco2 based on the oxygen use and respiratory quotient for metabolic activity.
    */
  constructor(model_ref, name = "") {
    super(model_ref, name);

    // Initialize independent properties
    this.met_active = true; // flag indicating if metabolism is active
    this.vo2 = 8.1; // oxygen use in ml/kg/min
    this.vo2_factor = 1.0; // factor modulating oxygen use by outside models
    this.vo2_scaling_factor = 1.0; // scaling factor for oxygen use
    this.resp_q = 0.8; // respiratory quotient for CO2 production
    this.resp_q_scaling_factor = 1.0; // scaling factor for respiratory quotient for CO2 production
    this.metabolic_active_models = {}; // dictionary of models with fractional oxygen use
  }

  calc_model() {
    // Translate the VO2 in ml/kg/min to VO2 in mmol for this step size (assuming 37 degrees temperature and atmospheric pressure)
    const vo2_step =
      ((0.039 *
        this.vo2 *
        this.vo2_factor *
        this.vo2_scaling_factor *
        this._model_engine.weight) /
        60.0) *
      this._t;

    // Iterate over each metabolic active model
    for (const [model, fvo2] of Object.entries(this.metabolic_active_models)) {
      // Get the volume, tco2, and to2 from the blood compartment
      const compartment = this._model_engine.models[model];
      const vol = compartment.vol;
      let to2 = compartment.to2;
      let tco2 = compartment.tco2;

      if (vol === 0.0) {
        return;
      }

      // Calculate the change in oxygen concentration in this step
      const dto2 = vo2_step * fvo2;

      // Calculate the new oxygen concentration in blood
      let new_to2 = (to2 * vol - dto2) / vol;

      // Guard against negative values
      if (new_to2 < 0) {
        new_to2 = 0;
      }

      // Calculate the change in CO2 concentration in this step
      const dtco2 = vo2_step * fvo2 * this.resp_q * this.resp_q_scaling_factor;

      // Calculate the new CO2 concentration in blood
      let new_tco2 = (tco2 * vol + dtco2) / vol;

      // Guard against negative values
      if (new_tco2 < 0) {
        new_tco2 = 0;
      }

      // Store the new to2 and tco2 in the compartment
      compartment.to2 = new_to2;
      compartment.tco2 = new_tco2;
    }
  }
}
