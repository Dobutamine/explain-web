import { GasCapacitance } from "../base_models/GasCapacitance";

export class Airway extends GasCapacitance {
  // static properties
  static model_type = "Airway";


  constructor(model_ref, name = "") {
    super(model_ref, name);
  }

  calc_model() {
    this.calc_resistances();
    this.calc_elastances();
    this.calc_volumes();
    this.calc_pressure();
  }
  calc_resistances() {

  }
}
