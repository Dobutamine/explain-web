import { BloodCapacitance, BloodResistor } from "../ModelIndex";

export class Shunts {
  static model_type = "Shunts";
  static model_interface = [
    {
      target: "da_enabled",
      caption: "ductus arteriosus enabled",
      type: "boolean",
      optional: false,
    },
    {
      target: "da_el_base",
      caption: "ductus arteriosus elastance base (mmHg/ml)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 100000000.0,
      ll: 0.1,
    },
    {
      target: "da_u_vol",
      caption: "ductus arteriosus unstressed volume (l)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.0001,
      rounding: 4,
      ul: 10000.0,
      ll: 0.0,
    },
    {
      target: "da_el_k",
      caption: "ductus arteriosus non-linear elastance factor",
      type: "number",
      optional: false,
      factor: 1,
      delta: 10,
      rounding: 0,
      ul: 100000000000.0,
      ll: 0.0,
    },
    {
      target: "da_in_res",
      caption: "ductus arteriosus inlet resistance (mmHg*sec/l)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 1000000000.0,
      ll: 20.0,
    },
    {
      target: "da_in_r_k",
      caption: "ductus inlet non-linear resistance factor",
      type: "number",
      optional: false,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 1000000000.0,
      ll: 0.0,
    },
    {
      target: "da_diameter",
      caption: "ductus arteriosus diameter (mm)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 10.0,
      ll: 0.1,
    },
    {
      target: "da_length",
      caption: "ductus arteriosus length (mm)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 1000.0,
      ll: 0.1,
    },
    {
      target: "da_out_r_k",
      caption: "ductus outlet non-linear resistance factor",
      type: "number",
      optional: false,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 1000000000.0,
      ll: 0.0,
    },

    {
      target: "fo_enabled",
      caption: "foramen ovale enabled",
      type: "boolean",
      optional: false,
    },
    {
      target: "fo_diameter",
      caption: "foramen ovale diameter (mm)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 10.0,
      ll: 0.1,
    },
    {
      target: "fo_length",
      caption: "foramen ovale length (mm)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 10000.0,
      ll: 0.1,
    },
    {
      target: "fo_res_backflow_factor",
      caption: "foramen ovale backflow resistance factor",
      type: "number",
      optional: false,
      relative: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 10000000.0,
      ll: 0.1,
    },
    {
      target: "fo_r_k",
      caption: "foramen ovale non-linear resistance factor",
      type: "number",
      optional: false,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 1000000000.0,
      ll: 0.0,
    },
    {
      target: "ips_enabled",
      caption: "intrapulmonary shunt enabled",
      type: "boolean",
      optional: false,
    },
    {
      target: "ips_res",
      caption: "intrapulmonary shunt resistance (mmHg*sec/l)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 100000000.0,
      ll: 1.0,
    },
    {
      target: "ips_res_backflow_factor",
      caption: "intrapulmonary shunt backflow resistance factor",
      type: "number",
      optional: false,
      relative: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 100000000.0,
      ll: 0.1,
    },
    {
      target: "ips_r_k",
      caption: "foramen ovale non-linear resistance factor",
      type: "number",
      optional: false,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 1000000000.0,
      ll: 0.0,
    },

    {
      target: "vsd_enabled",
      caption: "vsd enabled",
      type: "boolean",
      optional: false,
    },
    {
      target: "vsd_diameter",
      caption: "vsd diameter (mm)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 10.0,
      ll: 0.1,
    },
    {
      target: "vsd_length",
      caption: "vsd length (mm)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 10000.0,
      ll: 0.1,
    },
    {
      target: "vsd_res_backflow_factor",
      caption: "vsd backflow resistance factor",
      type: "number",
      optional: false,
      relative: false,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 100000000.0,
      ll: 0.1,
    },
    {
      target: "vsd_r_k",
      caption: "vsd non-linear resistance factor",
      type: "number",
      optional: false,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 1000000000.0,
      ll: 0.0,
    },
  ];

  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  viscosity = 6.0;
  fo_enabled = true;
  fo = "FO";
  fo_diameter = 3.0;
  fo_length = 2.0;
  fo_res_backflow_factor = 10.0;
  fo_res_forwardflow_factor = 1.0;
  fo_r_k = 1000;
  vsd = "VSD";
  vsd_enabled = false;
  vsd_diameter = 2.0;
  vsd_length = 2.0;
  vsd_res_backflow_factor = 1.0;
  vsd_r_k = 1000;
  da = "DA";
  da_in = "DA_IN";
  da_out = "DA_OUT";
  da_enabled = true;
  da_vol = 0.0002;
  da_u_vol = 0.0002;
  da_el_base = 100000;
  da_el_k = 1000.0;
  da_diameter = 0.1;
  da_length = 10.0;
  da_in_res = 300;
  da_in_res_backflow_factor = 1.0;
  da_in_r_k = 1000;
  da_out_res = 10000000;
  da_out_res_backflow_factor = 1.0;
  da_out_r_k = 1000;
  ips_enabled = true;
  ips = "IPS";
  ips_res = 30719;
  ips_res_factor = 1.0;
  ips_r_k = 1000;
  ips_res_backflow_factor = 1.0;

  // dependent parameters
  da_vol = 0.0;
  da_in_res = 300;
  da_out_res = 10000000;

  da_flow = 0.0;
  da_flow_lmin = 0.0;
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

  // local paramets
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
    this.init_da();
    this.init_fo();
    this.init_ips();
    this.init_vsd();

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    // set the enabled flows
    this._da_in.no_flow = !this.da_enabled;
    this._da_out.no_flow = !this.da_enabled;
    this._da_in.is_enabled = this.da_enabled;
    this._da_out.is_enabled = this.da_enabled;
    this._da.is_enabled = this.da_enabled;

    this._ips.is_enabled = this.ips_enabled;
    this._ips.no_flow = !this.ips_enabled;

    this._vsd.is_enabled = this.vsd_enabled;
    this._vsd.no_flow = !this.vsd_enabled;

    this._fo.is_enabled = this.fo_enabled;
    this._fo.no_flow = !this.fo_enabled;

    if (this._model_engine.models["Blood"]) {
      this.viscosity = this._model_engine.models["Blood"].viscosity;
    }

    // set the shunts properties
    if (this.da_enabled) {
      this.da_out_res = this.calc_resistance(
        this.da_diameter,
        this.da_length,
        this.viscosity
      );

      this._da.el_base = this.da_el_base;
      this._da.u_vol = this.da_u_vol;
      this._da.el_k = this.da_el_k;
      this._da_in.r_for = this.da_in_res;
      this._da_in.r_back = this.da_in_res;
      this._da_in.r_k = this.da_in_r_k;
      this._da_out.r_for = this.da_out_res;
      this._da_out.r_back = this.da_out_res;
      this._da.r_k = this.da_out_r_k;
    } else {
      this._da.flow = 0.0;
      this._da.flow_lmin = 0.0;
      this.da_velocity = 0.0;
    }

    if (this.fo_enabled) {
      this.fo_res = this.calc_resistance(
        this.fo_diameter,
        this.fo_length,
        this.viscosity
      );
      this._fo.r_for = this.fo_res * this.fo_res_forwardflow_factor; // RA -> LA
      this._fo.r_back = this.fo_res * this.fo_res_backflow_factor; // LA -> RA
      this._fo.r_k = this.fo_r_k;
    } else {
      this._fo.flow = 0.0;
      this._fo.flow_lmin = 0.0;
      this.fo_velocity = 0.0;
    }

    if (this.vsd_enabled) {
      this.vsd_res = this.calc_resistance(
        this.vsd_diameter,
        this.vsd_length,
        this.viscosity
      );
      this._vsd.r_for = this.vsd_res;
      this._vsd.r_back = this.vsd_res * this.vsd_res_backflow_factor;
      this._vsd.r_k = this.vsd_r_k;
    } else {
      this._vsd.flow = 0.0;
      this._vsd.flow_lmin = 0.0;
      this.vsd_velocity = 0.0;
    }

    if (this.ips_enabled) {
      this._ips_r_for = this.ips_res;
      this._ips.r_back = this.ips_res;
      this._ips.r_for_factor = this.ips_res_factor;
      this._ips.r_back_factor = this.ips_res_backflow_factor;
      this._ips.r_k = this.ips_r_k;
    } else {
      this._ips.flow = 0.0;
      this._ips.flow_lmin = 0.0;
    }

    this.da_flow = this._da_out.flow;
    this.da_flow_lmin = this._da_out.flow_lmin;
    // calculate the velocity = flow_rate (in m^3/s) / (pi * radius^2) in m/s
    let da_area = Math.pow((this.da_diameter * 0.001) / 2.0, 2.0) * Math.PI; // in m^2
    // flow is in l/s
    if (da_area > 0) {
      this.da_velocity = ((this.da_flow * 0.001) / da_area) * 1.4;
    }

    this.ips_flow = this._ips.flow;
    this.ips_flow_lmin = this._ips.flow_lmin;

    this.fo_flow = this._fo.flow;
    this.fo_flow_lmin = this._fo.flow_lmin;
    // calculate the velocity = flow_rate (in m^3/s) / (pi * radius^2) in m/s
    let fo_area = Math.pow((this.fo_diameter * 0.001) / 2.0, 2.0) * Math.PI; // in m^2
    // flow is in l/s
    if (fo_area > 0) {
      this.fo_velocity = (this.fo_flow * 0.001) / fo_area;
    }

    this.vsd_flow = this._vsd.flow;
    this.vsd_flow_lmin = this._vsd.flow_lmin;
    // calculate the velocity = flow_rate (in m^3/s) / (pi * radius^2) in m/s
    let vsd_area = Math.pow((this.vsd_diameter * 0.001) / 2.0, 2.0) * Math.PI; // in m^2
    // flow is in l/s
    if (vsd_area > 0) {
      this.vsd_velocity = (this.vsd_flow * 0.001) / vsd_area;
    }
  }

  init_da() {
    // define a blood capacitance which represents the ductus arteriosus
    this._da = this._model_engine.models[this.da];
    this._da.is_enabled = this.da_enabled;
    this._da.fixed_composition = false;
    this._da.vol = this.da_vol;
    this._da.u_vol = this.da_u_vol;
    this._da.el_base = this.da_el_base;
    this._da.el_k = this.da_el_k;

    // set the electrolytes
    this._da.solutes = { ...this._model_engine.models["AA"].solutes };
    this._da.aboxy = { ...this._model_engine.models["AA"].aboxy };
    // calculate the starting pressure
    this._da.calc_model();
    // add the shunt to the list
    this._shunts.push(this._da);

    // connect the ductus
    this._da_in = this._model_engine.models[this.da_in];
    this._da_in.is_enabled = this.da_enabled;
    this._da_in.no_flow = false;
    this._da_in.no_back_flow = false;
    this._da_in.r_for = this.da_in_res;
    this._da_in.r_back = this.da_in_res * this.da_in_res_backflow_factor;
    this._da_in.r_k = this.da_in_r_k;
    // add the shunt to the list
    this._shunts.push(this._da_in);

    this._da_out = this._model_engine.models[this.da_out];
    this._da_out.is_enabled = this.da_enabled;
    this._da_out.no_flow = false;
    this._da_out.no_back_flow = false;
    this._da_out.r_for = this.da_out_res;
    this._da_out.r_back = this.da_out_res * this.da_out_res_backflow_factor;
    this._da_out.r_k = this.da_out_r_k;
    // add the shunt to the list
    this._shunts.push(this._da_out);
  }

  init_fo() {
    this._fo = this._model_engine.models[this.fo];
    this._fo.is_enabled = this.fo_enabled;
    this._fo.no_flow = false;
    this._fo.no_back_flow = false;
    this._fo.r_for = this.fo_res;
    this._fo.r_back = this.fo_res * this.fo_res_backflow_factor;
    this._fo.r_k = this.ips_r_k;
    // add the shunt to the list
    this._shunts.push(this._fo);
  }

  init_vsd() {
    this._vsd = this._model_engine.models[this.vsd];
    this._vsd.is_enabled = this.vsd_enabled;
    this._vsd.no_flow = false;
    this._vsd.no_back_flow = false;
    this._vsd.r_vsdr = this.vsd_res;
    this._vsd.r_back = this.vsd_res * this.vsd_res_backflow_factor;
    this._vsd.r_k = this.ips_r_k;
    // add the shunt to the list
    this._shunts.push(this._vsd);
  }

  init_ips() {
    this._ips = this._model_engine.models[this.ips];
    this._ips.is_enabled = this.ips_enabled;
    this._ips.no_flow = false;
    this._ips.no_back_flow = false;
    this._ips.r_for = this.ips_res * this.ips_res_factor;
    this._ips.r_back = this.ips_res * this.ips_res_backflow_factor;
    this._ips.r_k = this.ips_r_k;
    // add the shunt to the list
    this._shunts.push(this._ips);
  }

  calc_resistance(diameter, length, viscosity = 6.0) {
    if (diameter > 0.0 && length > 0.0) {
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
    return 100000000;
  }
}
