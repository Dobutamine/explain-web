export class DuctusArteriosus {
  static model_type = "DuctusArteriosus";
  static model_interface = [
    {
      name: "open_ductus",
      caption: "set ductus arteriosus diameter",
      type: "function",
      target: "diameter",
      args: [
        {
          name: "diameter",
          caption: "new diameter(mm)",
          type: "number",
          required: true,
          value: 0.0,
          factor: 1.0,
          delta: 0.1,
          rounding: 1,
          ul: 10.0,
          ll: 0.0,
        },
        {
          name: "in_time",
          caption: "in time(s)",
          type: "number",
          required: false,
          value: 5.0,
          factor: 1.0,
          delta: 1,
          rounding: 0,
          ul: 360.0,
          ll: 0,
        },
        {
          name: "at_time",
          caption: "at time(s)",
          type: "number",
          required: false,
          value: 0.0,
          factor: 1.0,
          delta: 1,
          rounding: 0,
          ul: 360.0,
          ll: 0,
        },
      ],
    },
    {
      name: "set_length",
      caption: "set ductus arteriosus length",
      type: "function",
      target: "length",
      args: [
        {
          name: "length",
          caption: "new length (mm)",
          type: "number",
          required: true,
          value: 10.0,
          factor: 1.0,
          delta: 0.1,
          rounding: 1,
          ul: 100,
          ll: 0.1,
        },
      ],
    },
    {
      name: "set_non_linear_factor",
      caption: "non linear factor",
      type: "function",
      target: "non_lin_factor",
      args: [
        {
          name: "non_lin_factor",
          caption: "new non linear factor",
          type: "number",
          required: true,
          value: 0.0,
          factor: 1.0,
          delta: 10,
          rounding: 1,
          ul: 1000000,
          ll: 0.0,
        },
      ],
    },
  ];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  da_model = "DA";
  da_connectors = ["AAR_DA", "DA_PA"];
  no_flow = true;
  diameter = 1.2;
  length = 10.0;
  viscosity = 6.0;
  non_lin_factor = 1.0;

  // dependent parameters
  flow = 0.0;
  velocity = 0.0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _pda = {};
  _pda_in = {};
  _pda_out = {};
  _current_diameter = 0.0;
  _target_diameter = 0.0;
  _diameter_stepsize = 0.0;
  _in_time = 5.0;
  _at_time = 0.0;

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

    // get a reference to the models
    this._pda = this._model_engine.models[this.da_model];
    this._pda_in = this._model_engine.models[this.da_connectors[0]];
    this._pda_out = this._model_engine.models[this.da_connectors[1]];

    // set the current diameter
    this._current_diameter = this.diameter;

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    // open the connectors when the model is enabled
    this._pda_in.no_flow = this.no_flow;
    this._pda_out.no_flow = this.no_flow;

    // enable the pda components
    let res = 1000000;
    if (this.diameter > 0.1) {
      this._pda.is_enabled = this.is_enabled;
      this._pda_in.is_enabled = this.is_enabled;
      this._pda_out.is_enabled = this.is_enabled;

      // calculate the resistance
      res = this.calc_resistance(this.diameter, this.length, this.viscosity);
    } else {
      this._pda_in.no_flow = false;
      this._pda_out.no_flow = false;
    }

    // set the resistances
    this._pda_out.r_for = res;
    this._pda_out.r_back = res;

    // set the non linear factors
    this._pda_out.r_k = this.non_lin_factor;

    // get the flow
    this.flow = this._pda_out.flow;

    // calculate the velocity = flow_rate (in m^3/s) / (pi * radius^2) in m/s
    let area = Math.pow((this.diameter * 0.001) / 2.0, 2.0) * Math.PI; // in m^2
    // flow is in l/s
    if (area > 0) {
      this.velocity = (this.flow * 0.001) / area;
      this.velocity = this.velocity * 4.0;
    }

    if (this._at_time >= 0) {
      this._at_time -= this._t;
    } else {
      if (this._diameter_stepsize != 0) {
        this._current_diameter += this._diameter_stepsize;
        this._in_time -= this._t;
        if (
          Math.abs(this._current_diameter - this._target_diameter) <
          Math.abs(this._diameter_stepsize)
        ) {
          this._diameter_stepsize = 0.0;
          this._current_diameter = this._target_diameter;
          if (this._target_diameter < 0.11) {
            this.no_flow = true;
          }
        }
      }
    }
    this.diameter = this._current_diameter;
  }

  open_ductus(new_diameter = 2.5, in_time = 5.0, at_time = 0.0) {
    if (new_diameter > 15.0) {
      console.log(
        "Error! De ductus arteriosus diameter can't be higher then 5.0 mm"
      );
      return;
    }
    if (new_diameter < 0.1) {
      this.close_ductus(in_time, at_time);
    }
    this.no_flow = false;
    this._target_diameter = new_diameter;
    this._current_diameter = this.diameter;
    this._in_time = in_time;
    this._at_time = at_time;
    this._diameter_stepsize =
      ((this._target_diameter - this._current_diameter) / this._in_time) *
      this._t;
  }

  close_ductus(in_time = 5.0, at_time = 0.0) {
    this._target_diameter = 0.1;
    this._in_time = in_time;
    this._at_time = at_time;
    this._diameter_stepsize =
      ((this._target_diameter - this._current_diameter) / this._in_time) *
      this._t;
  }

  set_diameter(new_diameter) {
    this.diameter = new_diameter;
  }

  set_length(new_length) {
    this.length = new_length;
  }

  set_non_linear_factor(new_nonlink) {
    this.non_lin_factor = new_nonlink;
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
