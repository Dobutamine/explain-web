import { Resistor } from "../base_models/Resistor";

export class HeartValve extends Resistor {
  // static properties
  static model_type = "HeartValve";
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
        "BloodPump", 
        "BloodVessel", 
        "CapillaryBed", 
        "CoronaryVessel", 
        "HeartChamber"
      ]
    },
    {
      caption: "blood compartment to",
      target: "comp_to",
      type: "list",
      options: [
        "BloodCapacitance", 
        "BloodTimeVaryingElastance", 
        "BloodPump", 
        "BloodVessel",
        "CapillaryBed", 
        "CoronaryVessel", 
        "HeartChamber"
      ]
    },
    
  ]
}







