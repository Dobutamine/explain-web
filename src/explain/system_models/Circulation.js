import { BaseModelClass } from "../base_models/BaseModelClass";

export class Circulation extends BaseModelClass {
  // static properties
  static model_type = "Circulation";
  static model_interface = [
    // {
    //   caption: "syst arterial resistance factor",
    //   target: "syst_art_res_factor",
    //   type: "number",
    //   factor: 1.0,
    //   delta: 0.01,
    //   rounding: 2,
    // },
  ];

  /*
    The Circulation class is not a model but houses methods that influence groups of models. In case
    of the circulation class, these groups contain models related to blood circulation.
    For example, the method `change_systemic_vascular_resistance` influences systemic vascular resistance
    by setting the `r_for_factor`, `r_back_factor`, and `el_base_factor` of the BloodResistors and BloodCapacitances
    stored in a list called `svr_targets`.
    */
  constructor(model_ref, name = "") {
    super(model_ref, name);

    // -----------------------------------------------
    // independent properties
    this.syst_art_capacitances = [],
    this.syst_art_resistors = [],
    this.syst_ven_capacitances = [],
    this.syst_ven_resistors = [],
    this.pulm_art_capacitances = [],
    this.pulm_art_resistors = [],
    this.pulm_ven_capacitances = [],
    this.pulm_ven_resistors = [],
    this.cap_capacitances = []

    this.sar_factor = 1.0; // systemic arterial resistance factor
    this.par_factor = 1.0; // pulmonary arterial resistance factor
    this.sae_factor = 1.0; // systemic arterial elastance factor
    this.pae_factor = 1.0; // pulmonary arterial elastance factor
    this.svr_factor = 1.0; // systemic venous resistance factor
    this.sve_factor = 1.0; // systemic venous elastance factor
    this.pvr_factor = 1.0; // pulmonary venous resistance factor
    this.pve_factor = 1.0; // pulmonary venous elastance factor
    this.cape_factor = 1.0; // capillary elastance factor
    // -----------------------------------------------
    // dependent properties

    // -----------------------------------------------
    // local properties
    this._update_interval = 0.015; // update interval (s)
    this._update_counter = 0.0; // update interval counter (s)
  }

  calc_model() {
    this._update_counter += this._t;
    if (this._update_counter > this._update_interval) {
      this._update_counter = 0.0;
    }
  }

  // ELASTANCES
  // change systemic arterial elastance
  change_systemic_arterial_elastance(factor) {
    if (!isNaN(factor)) {
      if (factor > 0.0) {
        this.syst_art_capacitances.forEach((capacitance) => {
          this._model_engine.models[capacitance].el_base_circ_factor = factor;
        });
      }
    }
  }
  // change pulmonary arterial elastance
  change_pulmonary_arterial_elastance(factor) {
    if (!isNaN(factor)) {
      if (factor > 0.0) {
        this.pulm_art_capacitances.forEach((capacitance) => {
          this._model_engine.models[capacitance].el_base_circ_factor = factor;
        });
      }
    }
  }
  // change systemic venous elastance
  change_systemic_venous_elastance(factor) {
    if (!isNaN(factor)) {
      if (factor > 0.0) {
        this.syst_ven_capacitances.forEach((capacitance) => {
          this._model_engine.models[capacitance].el_base_circ_factor = factor;
        });
      }
    }
  }
  // change pulmonary venous elastance
  change_pulmonary_venous_elastance(factor) {
    if (!isNaN(factor)) {
      if (factor > 0.0) {
        this.pulm_ven_capacitances.forEach((capacitance) => {
          this._model_engine.models[capacitance].el_base_circ_factor = factor;
        });
      }
    }
  }
  // change capillaries elastance
  change_capillary_elastance(factor) {
    if (!isNaN(factor)) {
      if (factor > 0.0) {
        this.cap_capacitances.forEach((capacitance) => {
          this._model_engine.models[capacitance].el_base_circ_factor = factor;
        });
      }
    }
  }

  // RESISTANCES
  // change systemic vascular resistance
  change_systemic_arterial_resistance(factor) {
    if (!isNaN(factor)) {
      if (factor > 0.0) {
        this.syst_art_resistors.forEach((resistor) => {
          this._model_engine.models[resistor].r_circ_factor = factor;
        });
      }
    }
  }
  // change pulmonary vascular resistance
  change_pulmonary_arterial_resistance(factor) {
    if (!isNaN(factor)) {
      if (factor > 0.0) {
        this.pulm_art_resistors.forEach((resistor) => {
          this._model_engine.models[resistor].r_circ_factor = factor;
        });
      }
    }
  }
  // change systemic venous resistance
  change_systemic_venous_resistance(factor) {
    if (!isNaN(factor)) {
      if (factor > 0.0) {
        this.syst_ven_resistors.forEach((resistor) => {
          this._model_engine.models[resistor].r_circ_factor = factor;
        });
      }
    }
  }
  // change pulmonary venous resistance
  change_pulmonary_venous_resistance(factor) {
    if (!isNaN(factor)) {
      if (factor > 0.0) {
        this.pulm_ven_resistors.forEach((resistor) => {
          this._model_engine.models[resistor].r_circ_factor = factor;
        });
      }
    }
  }
}
