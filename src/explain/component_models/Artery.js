import { BloodVessel } from "../component_models/BloodVessel";

export class Artery extends BloodVessel {
  // static properties
  static model_type = "Artery";

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize addtional independent properties
    this.alpha = 1.0                        // determines relation between resistance change and elastance change
    this.ans_sensitivity = 1.0;             // sensitivity for autonomic control (vasoconstriction/vasodilatation)
  }
}
