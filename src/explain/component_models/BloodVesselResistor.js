import { Resistor } from "../base_models/Resistor";

export class BloodVesselResistor extends Resistor {
  // static properties
  static model_type = "BloodVesselResistor";

  constructor(model_ref, name = "") {
    super(model_ref, name);

    this.ans_sensitivity = 0.0;
    this.r_ans_factor = 1.0;
    this.r_circ_factor = 1.0;             
    this.r_drug_factor = 1.0;
    this.r_mob_factor = 1.0;

  }


    // calculate resistance
    calc_resistance() {
      // incorporate all factors influencing this resistor
      this._r_for = this.r_for + 
        (this.r_factor - 1) * this.r_for + 
        (this.r_ans_factor - 1) * this.r_for * this.ans_sensitivity +
        (this.r_circ_factor - 1) * this.r_for + 
        (this.r_drug_factor - 1) * this.r_for + 
        (this.r_mob_factor - 1) * this.r_for

      this._r_back = this.r_back + 
        (this.r_factor - 1) * this.r_back +
        (this.r_ans_factor - 1) * this.r_back * this.ans_sensitivity +
        (this.r_circ_factor - 1) * this.r_back + 
        (this.r_drug_factor - 1) * this.r_back + 
        (this.r_mob_factor - 1) * this.r_back

      this._r_k = this.r_k + (this.r_k_factor - 1) * this.r_k
  
      // make the resistances flow dependent
      this._r_for += this._r_k * this.flow * this.flow;
      this._r_back += this._r_k * this.flow * this.flow;
 }


}







