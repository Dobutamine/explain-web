import { BaseModelClass } from "../base_models/BaseModelClass";
import { calc_blood_composition } from "../helpers/BloodComposition"

export class Blood extends BaseModelClass {
  // static properties
  static model_type = "Blood";
  static model_interface = [
    {
      caption: "set temperature (C)",
      target: "set_temperature",
      type: "function",
      args:[
        {
          caption: "new temperature",
          target: "temp",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 45.0,
          ll: 25.0,
        }
      ]
    },
    {
      caption: "set viscosity (cP)",
      target: "set_viscosity",
      type: "function",
      args:[
        {
          caption: "new new viscosity",
          target: "viscosity",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 12,
          ll: 0.1,
        }
      ]
    },
    {
      caption: "set solute concentration",
      target: "set_solute",
      type: "function",
      args:[
        {
          target: "solute_name",
          caption: "solute name",
          type: "list",
          custom_options: true,
          options: ["na", "k"]
        },
        {
          target: "solute_value",
          caption: "solute value",
          type: "number",
          default: 0.0,
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 1000.0,
          ll: 0.0,
        },
        {
          target: "site",
          caption: "change in site",
          type: "list",
          options: ["BloodCapacitance", "BloodTimeVaryingElastance"]
        },
      ]
    },
  ];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.viscosity = 6.0; // blood viscosity (centiPoise = Pa * s)
    this.temp = 37.0; // temperature (dgs C)
    this.to2 = 0.0; // total oxygen concentration (mmol/l)
    this.tco2 = 0.0; // total carbon dioxide concentration (mmol/l)
    this.solutes = {}; // dictionary holding the initial circulating solutes

    // initialize dependent properties
    this.preductal_art_bloodgas = {}; // dictionary containing the preductal arterial bloodgas
    this.art_bloodgas = {}; // dictionary containing the (postductal) arterial bloodgas
    this.ven_bloodgas = {}; // dictionary containing the venous bloodgas
    this.art_solutes = {}; // dictionary containing the arterial solute concentrations

    // initialize local properties (preceded with _)
    this._blood_containing_modeltypes = [
      "BloodCapacitance",
      "BloodTimeVaryingElastance",
      "BloodVessel",
      "HeartChamber",
      "CapillaryBed",
      "CoronaryVessel",
      "BloodPump",
    ];
    this._update_interval = 1.0; // interval at which the calculations are done
    this._update_counter = 0.0; // update counter intermediate
    this._ascending_aorta = null; // reference to ascending aorta model
    this._descending_aorta = null; // reference to descending aorta model
    this._right_atrium = null; // reference to right atrium
  }

  init_model(args = {}) {
    // set the values of the independent properties
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // set the solutes and temperature of the blood containing components
    Object.values(this._model_engine.models).forEach((model) => {
      if (this._blood_containing_modeltypes.includes(model.model_type)) {
        if (model.to2 == 0.0 && model.tco2 == 0.0) {
          model.to2 = this.to2;
          model.tco2 = this.tco2;
          model.solutes = { ...this.solutes };
          model.temp = this.temp;
          model.viscosity = this.viscosity;
        }
      }
    });

    // get the components where we measure the bloodgases
    this._ascending_aorta = this._model_engine.models["AA"];
    this._descending_aorta = this._model_engine.models["AD"];
    this._right_atrium = this._model_engine.models["RA"];

    // copy the initial arterial solutes
    this.art_solutes = { ...this.solutes };

    // flag that the model is initialized
    this._is_initialized = true;
  }

  calc_model() {
    this._update_counter += this._t;
    if (this._update_counter >= this._update_interval) {
      this._update_counter = 0.0;

      // preductal arterial bloodgas
      calc_blood_composition(this._ascending_aorta);
      this.preductal_art_bloodgas = {
        ph: this._ascending_aorta.ph,
        pco2: this._ascending_aorta.pco2,
        po2: this._ascending_aorta.po2,
        hco3: this._ascending_aorta.hco3,
        be: this._ascending_aorta.be,
        so2: this._ascending_aorta.so2,
      };

      // postductal arterial bloodgas
      calc_blood_composition(this._descending_aorta);
      this.art_bloodgas = {
        ph: this._descending_aorta.ph,
        pco2: this._descending_aorta.pco2,
        po2: this._descending_aorta.po2,
        hco3: this._descending_aorta.hco3,
        be: this._descending_aorta.be,
        so2: this._descending_aorta.so2,
      };

      // venous bloodgas
      calc_blood_composition(this._right_atrium);
      this.ven_bloodgas = {
        ph: this._right_atrium.ph,
        pco2: this._right_atrium.pco2,
        po2: this._right_atrium.po2,
        hco3: this._right_atrium.hco3,
        be: this._right_atrium.be,
        so2: this._right_atrium.so2,
      };

      // arterial solute concentrations
      this.art_solutes = { ...this._descending_aorta.solutes };
    }
  }

  set_temperature(new_temp) {
    this.temp = new_temp;
    Object.values(this._model_engine.models).forEach((model) => {
      if (this._blood_containing_modeltypes.includes(model.model_type)) {
        model.temp = new_temp;
      }
    });
  }

  set_viscosity(new_viscosity) {
    this.viscosity = new_viscosity;
    Object.values(this._model_engine.models).forEach((model) => {
      if (this._blood_containing_modeltypes.includes(model.model_type)) {
        model.viscosity = new_viscosity;
      }
    });
  }

  set_to2(new_to2, bc_site = "") {
    if (bc_site) {
      this._model_engine.models[bc_site].to2 = new_to2;
    } else {
      Object.values(this._model_engine.models).forEach((model) => {
        if (this._blood_containing_modeltypes.includes(model.model_type)) {
          model.to2 = new_to2;
        }
      });
    }
  }

  set_tco2(new_tco2, bc_site = "") {
    if (bc_site) {
      this._model_engine.models[bc_site].tco2 = new_tco2;
    } else {
      Object.values(this._model_engine.models).forEach((model) => {
        if (this._blood_containing_modeltypes.includes(model.model_type)) {
          model.tco2 = new_tco2;
        }
      });
    }
  }

  set_solute(solute, solute_value, bc_site = "") {
    if (bc_site) {
      this._model_engine.models[bc_site].solutes[solute] = solute_value;
    } else {
      Object.values(this._model_engine.models).forEach((model) => {
        if (this._blood_containing_modeltypes.includes(model.model_type)) {
          model.solutes = { ...this.solutes };
        }
      });
    }
  }
}
