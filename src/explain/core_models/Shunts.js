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
  fo_el_k = 1000;
  vsd_diameter = 2.0;
  vsd_length = 2.0;
  vsd_in = "LV";
  vsd_out = "RV";
  vsd_el_k = 1000;
  da_diameter = 2.0;
  da_length = 2.0;
  da_in = "AAR";
  da_out = "PA";
  da_u_vol = 0.0002;
  da_el_base = 50000;
  da_el_k = 1000.0;
  ips_in = "PA";
  ips_out = "PV";
  ips_r_for = 30719;
  ips_r_back = 30719;
  ips_r_k = 1000;
  viscosity = 6.0;

  // dependent parameters
  // FO res 2457 both sides
  // VSD 2457
  // IPS 30719  resk 1000
  // PDA

  // // calculate the velocity = flow_rate (in m^3/s) / (pi * radius^2) in m/s
  // let area = Math.pow((this.diameter * 0.001) / 2.0, 2.0) * Math.PI; // in m^2
  // // flow is in l/s
  // if (area > 0) {
  //   this.velocity = (this.flow * 0.001) / area;
  //   this.velocity = this.velocity * 4.0;
  // }

  /*
          "DA": {
            "name": "DA",
            "description": "ductus arteriosus",
            "model_type": "BloodCapacitance",
            "is_enabled": true,
            "category": "arteries",
            "dependencies": [],
            "vol": 0.0001925987499367087,
            "u_vol": 0.0001925987499367087,
            "el_base": 50000,
            "el_k": 0.0,
            "solutes": {
                "na": 138.0,
                "k": 3.5,
                "ca": 1.0,
                "cl": 108.0,
                "lact": 1.0,
                "mg": 0.75
            },
            "aboxy": {
                "tco2": 27.18,
                "to2": 7.0,
                "ph": 7.4,
                "po2": 0.0,
                "pco2": 35.0,
                "hco3": 25.0,
                "be": 0.0,
                "so2": 98.0,
                "sid": 35.9,
                "albumin": 25.0,
                "phosphates": 1.64,
                "uma": 0.0,
                "dpg": 5.0,
                "hemoglobin": 8.0,
                "temp": 37.0
            },
            "drugs": {},
            "act_factor": 0.0,
            "ans_activity_factor": 1.0,
            "u_vol_factor": 1.0,
            "u_vol_ans_factor": 1.0,
            "u_vol_drug_factor": 1.0,
            "u_vol_scaling_factor": 1.0,
            "el_base_factor": 1.0,
            "el_base_ans_factor": 1.0,
            "el_base_drug_factor": 1.0,
            "el_base_scaling_factor": 1.0,
            "el_k_factor": 1.0,
            "el_k_ans_factor": 1.0,
            "el_k_drug_factor": 1.0,
            "el_k_scaling_factor": 1.0,
            "fixed_composition": false,
            "pres": 0.0,
            "pres_in": 0.0,
            "pres_out": 0.0,
            "pres_tm": 0.0,
            "pres_ext": 0.0,
            "pres_cc": 0.0,
            "pres_atm": 0.0,
            "pres_mus": 0.0
        },
    */

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;

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

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {}

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
