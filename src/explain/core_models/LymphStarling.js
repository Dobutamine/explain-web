export class LymphStarling {
  static model_type = "LymphStarling";
  static model_interface = [];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  L = 0.9788e-9; // hydraulic conductivity
  S = 50.0; // capillary surface area
  sigma = 0.7; //  osmotic reflection coefficient
  comp_from = "";
  comp_to = "";

  i = 1.0; // van 't Hoff's factor, 1 for plasma
  R = 0.08206; // ideal gass constant [L*atm/mol*K]
  T = 37; // temperature in degrees Celcius
  mm = 66500; // molar mass in g/mol

  // #PSt = 0.0202        # permeability surface product albumin [ml/s]
  // #alphaLP = 0.05
  // #alphaSP = 0.6

  // dependent parameters
  flow = 0.0;

  // local parameters
  _model_engine = {};
  _model_comp_from = {};
  _model_comp_to = {};
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

    // get a reference to the connected components
    if (typeof this.comp_from == "string") {
      this._model_comp_from = this._model_engine.models[this.comp_from];
    } else {
      this._model_comp_from = this.comp_from;
    }

    if (typeof this.comp_from == "string") {
      this._model_comp_to = this._model_engine.models[this.comp_to];
    } else {
      this._model_comp_to = this.comp_to;
    }

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    // hydrostatic pressure
    let hP1 = this._model_comp_from.pres;
    let hP2 = this._model_comp_to.pres;

    // calculate oncotic pressure
    let oP1 =
      this.i *
      (this._model_comp_from.aboxy["albumin"] / this.mm) *
      this.R *
      (273.15 + this.T) *
      760; // concentration albumin in g/L to mol/L, multiply by 760 from atmosphere to mmHg
    let oP2 =
      this.i *
      (this._model_comp_to.aboxy["albumin"] / this.mm) *
      this.R *
      (273.15 + this.T) *
      760;

    this._model_comp_from.pres_osm = oP1;
    this._model_comp_to.pres_osm = oP2;

    // calculate transcapillary flow
    this.flow = this.L * this.S * (hP1 - hP2 - this.sigma * (oP1 - oP2));

    this.flow_h = this.L * this.S * (hP1 - hP2);
    this.flow_o = -(this.L * this.S * this.sigma * (oP1 - oP2));
  }
}
