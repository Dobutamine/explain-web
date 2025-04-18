import { BloodCapacitance } from "../base_models/BloodCapacitance";

export class BloodPump extends BloodCapacitance {
  // static properties
  static model_type = "BloodPump";
  model_interface = [
    {
      caption: "unstressed volume (mL)",
      target: "u_vol",
      type: "number",
      delta: 0.1,
      factor: 1000.0,
      rounding: 3
    },
    {
      caption: "elastance pump (mmHg/mL)",
      target: "el_base",
      delta: 0.1,
      factor: 0.001,
      rounding: 3,
      type: "number"
    },
    {
      caption: "pump rpm",
      target: "pump_rpm",
      delta: 10,
      factor: 1,
      rounding: 1,
      type: "number"
    },
    {
      caption: "non linear elastance factor",
      target: "el_k",
      delta: 0.1,
      factor: 0.001,
      rounding: 3,
      type: "number"
    },
    {
      caption: "inlet blood resistor",
      target: "inlet",
      type: "list",
      options: ["BloodResistor", "BloodVesselResistor", "HeartValve"]
    },
    {
      caption: "outlet blood resistor",
      target: "outlet",
      type: "list",
      options: ["BloodResistor", "BloodVesselResistor", "HeartValve"]
    },
  ];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    this.pump_rpm = 0.0; // pump speed in rotations per minute
    this.pump_mode = 0; // pump mode (0=centrifugal, 1=roller pump)
    this.pump_pressure =  0.0

    // local properties
    this._inlet = null; // holds a reference to the inlet BloodResistor
    this._outlet = null; // holds a reference to the outlet BloodResistor

  }


  calc_pressure() {
    // find the inlet and outlet resistors
    this._inlet = this._model_engine.models[this.inlet];
    this._outlet = this._model_engine.models[this.outlet];

    // calculate the recoil pressure
    this.pres_in = this._el_k * Math.pow(this.vol - this._u_vol, 2) + this._el * (this.vol - this._u_vol);

    // calculate the total pressure by incorporating the external pressures
    this.pres = this.pres_in + this.pres_ext + this.pres_cc + this.pres_mus;

    // reset the external pressures
    this.pres_ext = 0.0;
    this.pres_cc = 0.0;
    this.pres_mus = 0.0;

    // calculate the pump pressure and apply the pump pressures to the connected resistors
    this.pump_pressure = -this.pump_rpm / 25.0;
    if (this.pump_mode === 0) {
      this._inlet.p1_ext = 0.0;
      this._inlet.p2_ext = this.pump_pressure;
    } else {
      this._outlet.p1_ext = this.pump_pressure;
      this._outlet.p2_ext = 0.0;
    }
  }
}
