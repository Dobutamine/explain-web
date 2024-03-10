import { BloodCapacitance, BloodResistor } from "../ModelIndex";

export class Shunts {
  static model_type = "Shunts";
  static model_interface = [];

  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  viscosity = 6.0;
  fo_diameter = 2.0;
  fo_length = 2.0;
  fo_in = "LA";
  fo_out = "RA";
  fo_r_k = 1000;
  vsd_diameter = 2.0;
  vsd_length = 2.0;
  vsd_in = "LV";
  vsd_out = "RV";
  vsd_r_k = 1000;
  da_diameter = 2.0;
  da_length = 2.0;
  da_in = "AAR";
  da_in_res = 300;
  da_in_r_k = 1000;
  da_out = "PA";
  da_out_r_k = 1000;
  da_u_vol = 0.0002;
  da_el_base = 50000;
  da_el_k = 1000.0;
  ips_in = "PA";
  ips_out = "PV";
  ips_res = 30719;
  ips_r_k = 1000;
  viscosity = 6.0;

  // dependent parameters
  da_flow = 0.0;
  da_flow_lmin = 0.0;
  da_res = 10000000;
  da_velocity = 0.0;
  ips_flow = 0.0;
  ips_flow_lmin = 0.0;
  ips_velocity = 0.0;
  fo_flow = 0.0;
  fo_flow_lmin = 0.0;
  fo_velocity = 0.0;
  fo_res = 10000000;
  vsd_flow = 0.0;
  vsd_flow_lmin = 0.0;
  vsd_velocity = 0.0;
  vsd_res = 10000000;

  // // calculate the velocity = flow_rate (in m^3/s) / (pi * radius^2) in m/s
  // let area = Math.pow((this.diameter * 0.001) / 2.0, 2.0) * Math.PI; // in m^2
  // // flow is in l/s
  // if (area > 0) {
  //   this.velocity = (this.flow * 0.001) / area;
  //   this.velocity = this.velocity * 4.0;
  // }

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _ips = {};
  _da = {};
  _da_in = {};
  _da_out = {};
  _vsd = {};
  _fo = {};
  _shunts = [];

  // the constructor builds a bare bone modelobject of the correct type and with the correct name and stores a reference to the modelengine object
  constructor(model_ref, name = "", type = "") {
    // name of the model
    this.name = name;

    // model type
    this.model_type = type;

    // reference to the model engine
    this._model_engine = model_ref;
  }

  init_model(args) {
    // process the parameters
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // set the modeling step size
    this._t = this._model_engine.modeling_stepsize;

    // build the shunts
    this.build_da();
    this.build_fo();
    this.build_ips();
    this.build_vsd();

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    this.da_flow = this._da_out.flow;
    this.da_flow_lmin = this._da_out.flow * 60.0;

    this.ips_flow = this._ips.flow;
    this.ips_flow_lmin = this._ips.flow * 60.0;

    // do the model step of the ventilator parts
    this._shunts.forEach((_shunt) => _shunt.step_model());
  }

  set_fo_resistance() {}

  set_vsd_resistance() {}

  set_ips_resistance() {}

  set_da_resistance() {
    // calculate the duct resistance
    this.da_res = this.calc_resistance(
      this.da_diameter,
      this.da_length,
      this.viscosity
    );
    this._da_in.r_for = this.da_in_res;
    this._da_in.r_back = this.da_in_res;

    this._da_out.r_for = this.da_res;
    this._da_out.r_back = this.da_res;
  }

  build_da() {
    // define a blood capacitance which represents the ductus arteriosus
    this._da = new BloodCapacitance(
      this._model_engine,
      "_da",
      "BloodCapacitance"
    );

    this._da.init_model([
      { key: "is_enabled", value: true },
      { key: "fixed_composition", value: false },
      { key: "vol", value: this.da_u_vol },
      { key: "u_vol", value: this.da_u_vol },
      { key: "el_base", value: this.da_el_base },
      { key: "el_k", value: this.da_el_k },
    ]);
    // set the electrolytes
    this._da.solutes = { ...this._model_engine.models["AA"].solutes };
    this._da.aboxy = { ...this._model_engine.models["AA"].aboxy };
    // calculate the starting pressure
    this._da.calc_model();
    // add the shunt to the list
    this._shunts.push(this._da);

    // connect the ductus
    this._da_in = new BloodResistor(
      this._model_engine,
      "_da_in",
      "BloodResistor"
    );

    this._da_in.init_model([
      { key: "is_enabled", value: true },
      { key: "no_flow", value: false },
      { key: "no_back_flow", value: false },
      {
        key: "comp_from",
        value: this._model_engine.models[this.da_in],
      },
      { key: "comp_to", value: this._da },
      { key: "r_for", value: 100000 },
      { key: "r_back", value: 100000 },
      { key: "r_k", value: this.da_in_r_k },
    ]);
    // add the shunt to the list
    this._shunts.push(this._da_in);

    this._da_out = new BloodResistor(
      this._model_engine,
      "_da_out",
      "BloodResistor"
    );

    this._da_out.init_model([
      { key: "is_enabled", value: true },
      { key: "no_flow", value: false },
      { key: "no_back_flow", value: false },
      {
        key: "comp_from",
        value: this._da,
      },
      { key: "comp_to", value: this._model_engine.models[this.da_out] },
      { key: "r_for", value: 100000 },
      { key: "r_back", value: 100000 },
      { key: "r_k", value: this.da_out_r_k },
    ]);
    // add the shunt to the list
    this._shunts.push(this._da_out);

    // calculate the resistance of the duct
    this.set_da_resistance();
  }

  build_fo() {
    this._fo = new BloodResistor(this._model_engine, "_fo", "BloodResistor");
    this._fo.init_model([
      { key: "is_enabled", value: true },
      { key: "no_flow", value: false },
      { key: "no_back_flow", value: false },
      {
        key: "comp_from",
        value: this._model_engine.models[this.fo_in],
      },
      { key: "comp_to", value: this._model_engine.models[this.fo_out] },
      { key: "r_for", value: 100000 },
      { key: "r_back", value: 100000 },
      { key: "r_k", value: this.fo_r_k },
    ]);
    // add the shunt to the list
    this._shunts.push(this._fo);

    // calculate the resistance of the fo
    this.set_fo_resistance();
  }

  build_vsd() {
    this._vsd = new BloodResistor(this._model_engine, "_vsd", "BloodResistor");
    this._vsd.init_model([
      { key: "is_enabled", value: true },
      { key: "no_flow", value: false },
      { key: "no_back_flow", value: false },
      {
        key: "comp_from",
        value: this._model_engine.models[this.vsd_in],
      },
      { key: "comp_to", value: this._model_engine.models[this.vsd_out] },
      { key: "r_for", value: 100000 },
      { key: "r_back", value: 100000 },
      { key: "r_k", value: this.vsd_r_k },
    ]);
    // add the shunt to the list
    this._shunts.push(this._vsd);

    // calculate the resistance of the vsd
    this.set_vsd_resistance();
  }

  build_ips() {
    this._ips = new BloodResistor(this._model_engine, "_ips", "BloodResistor");
    this._ips.init_model([
      { key: "is_enabled", value: true },
      { key: "no_flow", value: false },
      { key: "no_back_flow", value: false },
      {
        key: "comp_from",
        value: this._model_engine.models[this.ips_in],
      },
      { key: "comp_to", value: this._model_engine.models[this.ips_out] },
      { key: "r_for", value: this.ips_res },
      { key: "r_back", value: this.ips_res },
      { key: "r_k", value: this.ips_r_k },
    ]);
    // add the shunt to the list
    this._shunts.push(this._ips);

    // calculate the resistance of the ips
    this.set_ips_resistance();
  }

  calc_resistance(diameter, length, viscosity = 6.0) {
    // resistance is calculated using Poiseuille's Law : R = (8 * n * L) / (PI * r^4)

    // we have to watch the units carefully where we have to make sure that the units in the formula are
    // resistance is in mmHg * s / l
    // L = length in meters from millimeters
    // r = radius in meters from millimeters
    // n = viscosity in centiPoise

    // convert viscosity from centiPoise to Pa * s
    let n_pas = viscosity / 1000.0;

    // convert the length to meters
    let length_meters = length / 1000.0;

    // calculate radius in meters
    let radius_meters = diameter / 2 / 1000.0;

    // calculate the resistance    Pa *  / m3
    let res =
      (8.0 * n_pas * length_meters) / (Math.PI * Math.pow(radius_meters, 4));

    // convert resistance of Pa/m3 to mmHg/l
    res = res * 0.00000750062;
    return res;
  }
}
