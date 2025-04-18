import { Resistor } from "../base_models/Resistor";

export class BloodVesselResistor extends Resistor {
  // static properties
  static model_type = "BloodVesselResistor";
  model_interface = [
    {
      caption: "no flow allowed",
      target: "no_flow",
      type: "boolean",
      delta: 1,
      factor: 1.0,
      rounding: 0
    },
    {
      caption: "no back flow allowed",
      target: "no_back_flow",
      type: "boolean",
      delta: 1,
      factor: 1.0,
      rounding: 0
    },
    {
      caption: "forward resistance",
      target: "r_for",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0
    },
    {
      caption: "backward resistance",
      target: "r_back",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0
    },
    {
      caption: "non linear resistance factor",
      target: "r_k",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0
    },
    {
      caption: "forward resistance factor",
      target: "r_for_factor",
      type: "factor"
    },
    {
      caption: "backward resistance factor",
      target: "r_back_factor",
      type: "factor"
    },
    {
      caption: "blood compartment from",
      target: "comp_from",
      type: "list",
      options: [
        "BloodCapacitance", 
        "BloodTimeVaryingElastance", 
        "BloodPump", "BloodVessel", 
        "Artery", 
        "Arteriole", 
        "CapillaryBed", 
        "CoronaryVessel", 
        "HeartChamber", 
        "Vein", 
        "Venule"
      ]
    },
    {
      caption: "blood compartment to",
      target: "comp_to",
      type: "list",
      options: [
        "BloodCapacitance", 
        "BloodTimeVaryingElastance", 
        "BloodPump", "BloodVessel", 
        "Artery", 
        "Arteriole", 
        "CapillaryBed", 
        "CoronaryVessel", 
        "HeartChamber", 
        "Vein", 
        "Venule"
      ]
    },
    
  ]

  constructor(model_ref, name = "") {
    super(model_ref, name);

    this.ans_sensitivity = 0.0;
    this.r_ans_factor = 1.0;
    this.r_circ_factor = 1.0;
  }

    // calculate resistance
    calc_resistance() {
      // incorporate all factors influencing this resistor
      this._r_for = this.r_for + 
        (this.r_factor - 1) * this.r_for + 
        (this.r_ans_factor - 1) * this.r_for * this.ans_sensitivity +
        (this.r_circ_factor - 1) * this.r_for

      this._r_back = this.r_back + 
        (this.r_factor - 1) * this.r_back +
        (this.r_ans_factor - 1) * this.r_back * this.ans_sensitivity +
        (this.r_circ_factor - 1) * this.r_back

      this._r_k = this.r_k + (this.r_k_factor - 1) * this.r_k
  
      // make the resistances flow dependent
      this._r_for += this._r_k * this.flow * this.flow;
      this._r_back += this._r_k * this.flow * this.flow;
 }


}







