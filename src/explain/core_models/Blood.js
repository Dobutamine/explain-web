import { BaseModelClass } from "./BaseModelClass";

export class Blood extends BaseModelClass {
  // static properties
  static model_type = "Blood";
  static model_interface = [];

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
      "BloodPump",
    ];
    this._update_interval = 1.0; // interval at which the calculations are done
    this._update_counter = 0.0; // update counter intermediate
    this._ascending_aorta = null; // reference to ascending aorta model
    this._descending_aorta = null; // reference to descending aorta model
    this._right_atrium = null; // reference to right atrium

    // blood composition constants
    this._brent_accuracy = 1e-6;
    this._max_iterations = 100;
    this._kw = 0.000000000025119;
    this._kc = 0.000794328235;
    this._kd = 0.000000060255959;
    this._alpha_co2p = 0.03067;
    this._left_hp = 0.000005848931925;
    this._right_hp = 0.000316227766017;
    this._left_o2 = 0.01;
    this._right_o2 = 800.0;
    this._gas_constant = 62.36367;
    this._dpg = 5.0;

    // acid base and oxygenation intermediates
    this._tco2 = 0.0;
    this._sid = 0.0;
    this._albumin = 0.0;
    this._phosphates = 0.0;
    this._uma = 0.0;
    this._ph = 0.0;
    this._pco2 = 0.0;
    this._hco3 = 0.0;
    this._be = 0.0;
    this._to2 = 0.0;
    this._temp = 0.0;
    this._po2 = 0.0;
    this._so2 = 0.0;
  }

  init_model(args = {}) {
    // set the values of the independent properties
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // set the solutes and temperature of the blood containing components
    Object.values(this._model_engine.models).forEach((model) => {
      if (this._blood_containing_modeltypes.includes(model.model_type)) {
        model.to2 = this.to2;
        model.tco2 = this.tco2;
        model.solutes = { ...this.solutes };
        model.temp = this.temp;
        model.viscosity = this.viscosity;
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
      this.calc_blood_composition(this._ascending_aorta);
      this.preductal_art_bloodgas = {
        ph: this._ascending_aorta.ph,
        pco2: this._ascending_aorta.pco2,
        po2: this._ascending_aorta.po2,
        hco3: this._ascending_aorta.hco3,
        be: this._ascending_aorta.be,
        so2: this._ascending_aorta.so2,
      };

      // postductal arterial bloodgas
      this.calc_blood_composition(this._descending_aorta);
      this.art_bloodgas = {
        ph: this._descending_aorta.ph,
        pco2: this._descending_aorta.pco2,
        po2: this._descending_aorta.po2,
        hco3: this._descending_aorta.hco3,
        be: this._descending_aorta.be,
        so2: this._descending_aorta.so2,
      };

      // venous bloodgas
      this.calc_blood_composition(this._right_atrium);
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

  calc_blood_composition(bc) {
    let sol = bc.solutes;

    this._tco2 = bc.tco2;
    this._to2 = bc.to2;
    this._sid =
      sol["na"] +
      sol["k"] +
      2 * sol["ca"] +
      2 * sol["mg"] -
      sol["cl"] -
      sol["lact"];
    this._albumin = sol["albumin"];
    this._phosphates = sol["phosphates"];
    this._uma = sol["uma"];
    this._hemoglobin = sol["hemoglobin"];
    this._temp = bc.temp;

    let hp = this.brent_root_finding(
      this.net_charge_plasma,
      this._left_hp,
      this._right_hp,
      this._max_iterations,
      this._brent_accuracy
    );

    if (hp > 0) {
      this._be =
        (this._hco3 -
          25.1 +
          (2.3 * this._hemoglobin + 7.7) * (this._ph - 7.4)) *
        (1.0 - 0.023 * this._hemoglobin);
      bc.ph = this._ph;
      bc.pco2 = this._pco2;
      bc.hco3 = this._hco3;
      bc.be = this._be;
    }

    let po2 = this.brent_root_finding(
      this.oxygen_content,
      this._left_o2,
      this._right_o2,
      this._max_iterations,
      this._brent_accuracy
    );

    if (po2 > -1) {
      bc.po2 = this._po2;
      bc.so2 = this._so2 * 100.0;
    }
  }

  net_charge_plasma(hp_estimate) {
    this._ph = -Math.log10(hp_estimate / 1000.0);

    let cco2p =
      this._tco2 /
      (1.0 +
        this._kc / hp_estimate +
        (this._kc * this._kd) / Math.pow(hp_estimate, 2.0));

    this._hco3 = (this._kc * cco2p) / hp_estimate;

    let co3p = (this._kd * this._hco3) / hp_estimate;
    let ohp = this._kw / hp_estimate;

    this._pco2 = cco2p / this._alpha_co2p;

    let a_base =
      this._albumin * (0.123 * this._ph - 0.631) +
      this._phosphates * (0.309 * this._ph - 0.469);

    return (
      hp_estimate +
      this._sid -
      this._hco3 -
      2.0 * co3p -
      ohp -
      a_base -
      this._uma
    );
  }

  oxygen_content(po2_estimate) {
    this._so2 = this.oxygen_dissociation_curve(po2_estimate);

    let to2_new_estimate =
      (0.0031 * po2_estimate + 1.36 * (this._hemoglobin / 0.6206) * this._so2) *
      10.0;

    let mmol_to_ml = (this._gas_constant * (273.15 + this._temp)) / 760.0;

    to2_new_estimate = to2_new_estimate / mmol_to_ml;

    this._po2 = po2_estimate;

    return this._to2 - to2_new_estimate;
  }

  oxygen_dissociation_curve(po2_estimate) {
    let a =
      1.04 * (7.4 - this._ph) + 0.005 * this._be + 0.07 * (this._dpg - 5.0);
    let b = 0.055 * (this._temp + 273.15 - 310.15);
    let x0 = 1.875 + a + b;
    let h0 = 3.5 + a;
    let x = Math.log(po2_estimate * 0.1333);
    let y = x - x0 + h0 * Math.tanh(0.5343 * (x - x0)) + 1.875;

    return 1.0 / (Math.exp(-y) + 1.0);
  }

  brent_root_finding (f, x0, x1, max_iter, tolerance) {
    let fx0 = f(x0);
    let fx1 = f(x1);

    if (fx0 * fx1 > 0) {
      return -1;
    }

    if (Math.abs(fx0) < Math.abs(fx1)) {
      [x0, x1] = [x1, x0];
      [fx0, fx1] = [fx1, fx0];
    }

    let x2 = x0,
      fx2 = fx0,
      d = 0,
      mflag = true,
      steps_taken = 0;

    try {
      while (steps_taken < max_iter) {
        if (Math.abs(fx0) < Math.abs(fx1)) {
          [x0, x1] = [x1, x0];
          [fx0, fx1] = [fx1, fx0];
        }

        let new_point;
        if (fx0 !== fx2 && fx1 !== fx2) {
          let L0 = (x0 * fx1 * fx2) / ((fx0 - fx1) * (fx0 - fx2));
          let L1 = (x1 * fx0 * fx2) / ((fx1 - fx0) * (fx1 - fx2));
          let L2 = (x2 * fx1 * fx0) / ((fx2 - fx0) * (fx2 - fx1));
          new_point = L0 + L1 + L2;
        } else {
          new_point = x1 - (fx1 * (x1 - x0)) / (fx1 - fx0);
        }

        if (
          new_point < (3 * x0 + x1) / 4 ||
          new_point > x1 ||
          (mflag && Math.abs(new_point - x1) >= Math.abs(x1 - x2) / 2) ||
          (!mflag && Math.abs(new_point - x1) >= Math.abs(x2 - d) / 2) ||
          (mflag && Math.abs(x1 - x2) < tolerance) ||
          (!mflag && Math.abs(x2 - d) < tolerance)
        ) {
          new_point = (x0 + x1) / 2;
          mflag = true;
        } else {
          mflag = false;
        }

        let fnew = f(new_point);
        d = x2;
        x2 = x1;

        if (fx0 * fnew < 0) {
          x1 = new_point;
          fx1 = fnew;
        } else {
          x0 = new_point;
          fx0 = fnew;
        }

        steps_taken += 1;

        if (Math.abs(fnew) < tolerance) {
          return new_point;
        }
      }
    } catch {
      return -1;
    }

    return -1;
  }
}
