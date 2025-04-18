import { BloodCapacitance } from "../base_models/BloodCapacitance";

export class CapillaryBed extends BloodCapacitance {
  // static properties
  static model_type = "CapillaryBed";
  model_interface = [
    {
      caption: "current volume (mL)",
      target: "vol",
      type: "number",
      delta: 0.1,
      factor: 1000.0,
      rounding: 3,
    },
    {
      caption: "unstressed volume (mL)",
      target: "u_vol",
      type: "number",
      delta: 0.1,
      factor: 1000.0,
      rounding: 3,
    },
    {
      caption: "elastance (mmHg/mL)",
      target: "el_base",
      delta: 0.1,
      factor: 0.001,
      rounding: 3,
      type: "number",
    },
    {
      caption: "non linear elastace factor",
      target: "el_k",
      delta: 0.1,
      factor: 0.001,
      rounding: 3,
      type: "number",
    },
  ];
}
