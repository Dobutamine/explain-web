import { BaseModelClass } from "../base_models/BaseModelClass";

export class Respiration extends BaseModelClass {
  // static properties
  static model_type = "Respiration";
  static model_interface = [
    // {
    //   caption: "o2 diffusion factor",
    //   target: "dif_o2_factor",
    //   type: "number",
    //   factor: 1.0,
    //   delta: 0.01,
    //   rounding: 2,
    // },
  ];

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

}
