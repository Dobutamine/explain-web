import { BaseModelClass } from "./BaseModelClass";

export class Circulation extends BaseModelClass {
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
    this.syst_art_res_factor = 1.0; // systemic arteries resistance factor
    this.syst_ven_res_factor = 1.0; // systemic veins resistance factor
    this.syst_art_el_factor = 1.0; // systemic arteries elastance factor
    this.syst_ven_el_factor = 1.0; // systemic veins elastance factor
    this.syst_art_u_vol_factor = 1.0; // systemic arteries unstressed volume factor
    this.syst_ven_u_vol_factor = 1.0; // systemic veins unstressed volume factor

    this.pulm_art_res_factor = 1.0; // pulmonary arteries resistance factor
    this.pulm_ven_res_factor = 1.0; // pulmonary veins resistance factor
    this.pulm_art_el_factor = 1.0; // pulmonary arteries elastance factor
    this.pulm_ven_el_factor = 1.0; // pulmonary veins elastance factor
    this.pulm_art_u_vol_factor = 1.0; // pulmonary arteries unstressed volume factor
    this.pulm_ven_u_vol_factor = 1.0; // pulmonary veins unstressed volume factor

    this.syst_art_res_ans_factor = 1.0; // systemic arteries resistance ans factor
    this.syst_ven_res_ans_factor = 1.0; // systemic veins resistance ans factor
    this.syst_art_el_ans_factor = 1.0; // systemic arteries elastance ans factor
    this.syst_ven_el_ans_factor = 1.0; // systemic veins elastance ans factor
    this.syst_art_u_vol_ans_factor = 1.0; // systemic arteries unstressed volume ans factor
    this.syst_ven_u_vol_ans_factor = 1.0; // systemic veins unstressed volume ans factor

    this.pulm_art_res_ans_factor = 1.0; // pulmonary arteries resistance ans factor
    this.pulm_ven_res_ans_factor = 1.0; // pulmonary veins resistance ans factor
    this.pulm_art_el_ans_factor = 1.0; // pulmonary arteries elastance ans factor
    this.pulm_ven_el_ans_factor = 1.0; // pulmonary veins elastance ans factor
    this.pulm_art_u_vol_ans_factor = 1.0; // pulmonary arteries unstressed volume ans factor
    this.pulm_ven_u_vol_ans_factor = 1.0; // pulmonary veins unstressed volume ans factor

    // -----------------------------------------------
    // dependent properties
    this.total_blood_volume = 0.0; // holds the current total blood volume

    // -----------------------------------------------
    // local properties
    this._blood_containing_modeltypes = [
      "BloodCapacitance",
      "BloodTimeVaryingElastance",
    ];
    this._update_interval = 0.015; // update interval (s)
    this._update_counter = 0.0; // update interval counter (s)
  }

  calc_model() {
    this._update_counter += this._t;
    if (this._update_counter > this._update_interval) {
      this._update_counter = 0.0;

      // update the ans factors
      this._model_engine.model_groups["syst_arteries"].forEach((t) => {
        t.el_base_ans_factor = this.syst_art_el_ans_factor;
        t.u_vol_ans_factor = this.syst_art_u_vol_ans_factor;
      });

      this._model_engine.model_groups["syst_art_resistors"].forEach((t) => {
        t.r_ans_factor = this.syst_art_res_ans_factor;
      });

      this._model_engine.model_groups["syst_veins"].forEach((t) => {
        t.el_base_ans_factor = this.syst_ven_el_ans_factor;
        t.u_vol_ans_factor = this.syst_ven_u_vol_ans_factor;
      });

      this._model_engine.model_groups["syst_ven_resistors"].forEach((t) => {
        t.r_ans_factor = this.syst_ven_res_ans_factor;
      });

      this._model_engine.model_groups["pulm_arteries"].forEach((t) => {
        t.el_base_ans_factor = this.pulm_art_el_ans_factor;
        t.u_vol_ans_factor = this.pulm_art_u_vol_ans_factor;
      });

      this._model_engine.model_groups["pulm_art_resistors"].forEach((t) => {
        t.r_ans_factor = this.pulm_art_res_ans_factor;
      });

      this._model_engine.model_groups["pulm_veins"].forEach((t) => {
        t.el_base_ans_factor = this.pulm_ven_el_ans_factor;
        t.u_vol_ans_factor = this.pulm_ven_u_vol_ans_factor;
      });

      this._model_engine.model_groups["pulm_ven_resistors"].forEach((t) => {
        t.r_ans_factor = this.pulm_ven_res_ans_factor;
      });
    }
  }

  change_pulm_art_elastance(change) {
    if (change > 0.0) {
      this.pulm_art_el_factor = change;
      this._model_engine.model_groups["pulm_arteries"].forEach((t) => {
        t.el_base_ans_factor = this.pulm_art_el_factor;
      });
    }
  }

  change_pulm_art_u_vol(change) {
    if (change > 0.0) {
      this.pulm_art_u_vol_factor = change;
      this._model_engine.model_groups["pulm_arteries"].forEach((t) => {
        t.r_ans_factor = this.pulm_art_u_vol_factor;
      });
    }
  }

  change_pulm_art_resistance(change) {
    if (change > 0.0) {
      this.pulm_art_res_factor = change;
      this._model_engine.model_groups["pulm_art_resistors"].forEach((t) => {
        t.r_factor = this.pulm_art_res_factor;
      });
    }
  }

  change_pulm_ven_elastance(change) {
    if (change > 0.0) {
      this.pulm_ven_el_factor = change;
      this._model_engine.model_groups["pulm_veins"].forEach((t) => {
        t.el_base_ans_factor = this.pulm_ven_el_factor;
      });
    }
  }

  change_pulm_ven_u_vol(change) {
    if (change > 0.0) {
      this.pulm_ven_u_vol_factor = change;
      this._model_engine.model_groups["pulm_veins"].forEach((t) => {
        t.r_ans_factor = this.pulm_ven_u_vol_factor;
      });
    }
  }

  change_pulm_ven_resistance(change) {
    if (change > 0.0) {
      this.pulm_ven_res_factor = change;
      this._model_engine.model_groups["pulm_ven_resistors"].forEach((t) => {
        t.r_factor = this.pulm_ven_res_factor;
      });
    }
  }

  change_syst_art_elastance(change) {
    if (change > 0.0) {
      this.syst_art_el_factor = change;
      this._model_engine.model_groups["syst_arteries"].forEach((t) => {
        t.el_base_ans_factor = this.syst_art_el_factor;
      });
    }
  }

  change_syst_art_u_vol(change) {
    if (change > 0.0) {
      this.syst_art_u_vol_factor = change;
      this._model_engine.model_groups["syst_arteries"].forEach((t) => {
        t.r_ans_factor = this.syst_art_u_vol_factor;
      });
    }
  }

  change_syst_art_resistance(change) {
    if (change > 0.0) {
      this.syst_art_res_factor = change;
      this._model_engine.model_groups["syst_art_resistors"].forEach((t) => {
        t.r_factor = this.syst_art_res_factor;
      });
    }
  }

  change_syst_ven_elastance(change) {
    if (change > 0.0) {
      this.syst_ven_el_factor = change;
      this._model_engine.model_groups["syst_veins"].forEach((t) => {
        t.el_base_ans_factor = this.syst_ven_el_factor;
      });
    }
  }

  change_syst_ven_u_vol(change) {
    if (change > 0.0) {
      this.syst_ven_u_vol_factor = change;
      this._model_engine.model_groups["syst_veins"].forEach((t) => {
        t.r_ans_factor = this.syst_ven_u_vol_factor;
      });
    }
  }

  change_syst_ven_resistance(change) {
    if (change > 0.0) {
      this.syst_ven_res_factor = change;
      this._model_engine.model_groups["syst_ven_resistors"].forEach((t) => {
        t.r_factor = this.syst_ven_res_factor;
      });
    }
  }

  get_total_blood_volume() {
    let total_volume = 0.0;
    // iterate over all blood containing models
    Object.values(this._model_engine.models).forEach((m) => {
      if (this._blood_containing_modeltypes.includes(m.model_type)) {
        if (m.is_enabled) {
          total_volume += m.vol;
        }
      }
    });

    this.total_blood_volume = total_volume;
    return this.total_blood_volume;
  }

  set_total_blood_volume(new_blood_volume) {
    // first get the current volume
    const current_blood_volume = this.get_total_blood_volume();
    // calculate the change in total blood volume
    const blood_volume_change = new_blood_volume / current_blood_volume;

    // iterate over all blood containing models
    Object.values(this._model_engine.models).forEach((m) => {
      if (this._blood_containing_modeltypes.includes(m.model_type)) {
        if (m.is_enabled) {
          m.vol *= blood_volume_change;
          m.u_vol *= blood_volume_change;
        }
      }
    });

    // store the new total blood volume
    this.total_blood_volume = this.get_total_blood_volume();
  }
}
