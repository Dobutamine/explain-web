import { BaseModelClass } from "./BaseModelClass";

export class Respiration extends BaseModelClass {
  /*
    The Respiration class is not a model but houses methods that influence groups of models. 
    These groups contain models related to the respiratory tract. For example, the method 
    `change_lower_airway_resistance` influences the resistance of the lower airways by 
    setting the `r_factor` of the `DS_ALL` and `DS_ALR` gas resistors stored in a list 
    called `lower_airways`.
    */
  constructor(model_ref, name = "") {
    super(model_ref, name);

    // -----------------------------------------------
    // initialize independent properties
    this.dif_o2_factor = 1.0; // o2 diffusion constant factor
    this.dif_co2_factor = 1.0; // co2 diffusion constant factor
    this.dead_space_u_vol_factor = 1.0; // dead space unstressed volume factor
    this.lung_el_factor = 1.0; // lungs elastance factor
    this.chestwall_el_factor = 1.0; // chestwall elastance factor
    this.thorax_el_factor = 1.0; // thorax elastance factor
    this.upper_aw_res_factor = 1.0; // upper airway resistance factor
    this.lower_aw_res_factor = 1.0; // lower airway resistance factor
    this.lung_shunt_res_factor = 1.0; // lung shunt resistance factor

    this.upper_airways = []; // names of the upper airways
    this.dead_space = []; // names of the dead spaces
    this.thorax = []; // names of the thorax
    this.chestwall = []; // names of the chestwalls
    this.alveolar_spaces = []; // names of the alveolar spaces
    this.lower_airways = []; // names of the lower airways
    this.gas_exchangers = []; // names of the pulmonary gas exchangers
    this.lung_shunts = []; // names of the lung shunts

    // -----------------------------------------------
    // local properties
    this._upper_airways = []; // references to the upper airways
    this._dead_space = []; // references to the dead space
    this._thorax = []; // references to the thorax
    this._chestwall = []; // references to the chestwall
    this._alveolar_spaces = []; // references to the alveolar spaces
    this._lower_airways = []; // references to the lower airways
    this._gas_exchangers = []; // references to the gas exchangers
    this._lung_shunts = []; // references to the lung shunts
    this._update_interval = 0.015; // update interval (s)
    this._update_counter = 0.0; // update interval counter (s)
  }

  init_model(args = {}) {
    // set the properties of this model
    Object.keys(args).forEach((key) => {
      this[key] = args[key];
    });

    // store all references
    this.upper_airways.forEach((t) => {
      this._upper_airways.push(this._model_engine.models[t]);
    });
    this.dead_space.forEach((t) => {
      this._dead_space.push(this._model_engine.models[t]);
    });
    this.thorax.forEach((t) => {
      this._thorax.push(this._model_engine.models[t]);
    });
    this.chestwall.forEach((t) => {
      this._chestwall.push(this._model_engine.models[t]);
    });
    this.alveolar_spaces.forEach((t) => {
      this._alveolar_spaces.push(this._model_engine.models[t]);
    });
    this.lower_airways.forEach((t) => {
      this._lower_airways.push(this._model_engine.models[t]);
    });
    this.gas_exchangers.forEach((t) => {
      this._gas_exchangers.push(this._model_engine.models[t]);
    });
    this.lung_shunts.forEach((t) => {
      this._lung_shunts.push(this._model_engine.models[t]);
    });

    // flag that the model is initialized
    this._is_initialized = true;
  }

  calc_model() {
    // Placeholder for calculations
  }

  change_intrapulmonary_shunting(change) {
    if (change > 0.0) {
      this.lung_shunt_res_factor = change;
      this._lung_shunts.forEach((t) => {
        t.r_factor = this.lung_shunt_res_factor;
      });
    }
  }

  change_dead_space(change) {
    if (change > 0.0) {
      this.dead_space_u_vol_factor = change;
      this._dead_space.forEach((t) => {
        t.u_vol_factor = this.dead_space_u_vol_factor;
      });
    }
  }

  change_upper_airway_resistance(change) {
    if (change > 0.0) {
      this.upper_aw_res_factor = change;
      this._upper_airways.forEach((t) => {
        t.r_factor = this.upper_aw_res_factor;
      });
    }
  }

  change_lower_airway_resistance(change) {
    if (change > 0.0) {
      this.lower_aw_res_factor = change;
      this._lower_airways.forEach((t) => {
        t.r_factor = this.lower_aw_res_factor;
      });
    }
  }

  change_thoracic_elastance(change) {
    if (change > 0.0) {
      this.thorax_el_factor = change;
      this._thorax.forEach((t) => {
        t.el_base_factor = this.thorax_el_factor;
      });
    }
  }

  change_lung_elastance(change) {
    if (change > 0.0) {
      this.lung_el_factor = change;
      this._alveolar_spaces.forEach((t) => {
        t.el_base_factor = this.lung_el_factor;
      });
    }
  }

  change_chestwall_elastance(change) {
    if (change > 0.0) {
      this.chestwall_el_factor = change;
      this._chestwall.forEach((t) => {
        t.el_base_factor = this.chestwall_el_factor;
      });
    }
  }

  change_diffusion_capacity(change) {
    if (change > 0.0) {
      this.dif_o2_factor = change;
      this.dif_co2_factor = change;
      this._gas_exchangers.forEach((t) => {
        t.dif_o2_factor = this.dif_o2_factor;
        t.dif_co2_factor = this.dif_co2_factor;
      });
    }
  }
}
