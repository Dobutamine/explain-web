// brent constants
const brent_accuracy = 1e-6;
const max_iterations = 100;
const gas_constant = 62.36367;

// acidbase and oxygenation constants
const kw = 0.000000000025119;
const kc = 0.000794328235;
const kd = 0.000000060255959;
const alpha_co2p = 0.03067;
const left_hp = 0.000005848931925; // 0.000015848931925;
const right_hp = 0.000316227766017; // 0.000316227766017;
const left_o2 = 0.01;
const right_o2 = 800.0;

// state variables
let ph = 0.0;
let po2 = 0.0;
let so2 = 0.0;
let pco2 = 0.0;
let hco3 = 0.0;
let be = 0.0;
let to2 = 0.0;
let hemoglobin = 0.0;
let dpg = 5.0;
let temp = 0.0;
let tco2 = 0.0;
let sid = 0.0;
let albumin = 0.0;
let phosphates = 0.0;
let uma = 0.0;

export function calc_blood_composition(bc) {
  let sol = bc.solutes;

  tco2 = bc.tco2;
  to2 = bc.to2;
  sid = sol["na"] + sol["k"] + 2 * sol["ca"] + 2 * sol["mg"] - sol["cl"] - sol["lact"];
  albumin = sol["albumin"];
  phosphates = sol["phosphates"];
  uma = sol["uma"];
  hemoglobin = sol["hemoglobin"];
  temp = bc.temp;

  let hp = brent_root_finding(net_charge_plasma, left_hp, right_hp, max_iterations, brent_accuracy);

  if (hp > 0) {
    be =(hco3 - 25.1 + (2.3 * hemoglobin + 7.7) * (ph - 7.4)) * (1.0 - 0.023 * hemoglobin);
    bc.ph = ph;
    bc.pco2 = pco2;
    bc.hco3 = hco3;
    bc.be = be;
  }

  let po2 = brent_root_finding(oxygen_content, left_o2, right_o2, max_iterations, brent_accuracy);

  if (po2 > -1) {
    bc.po2 = po2;
    bc.so2 = so2 * 100.0;
  }
}

function net_charge_plasma(hp_estimate) {
  ph = -Math.log10(hp_estimate / 1000.0);

  let cco2p = tco2 / (1.0 + kc / hp_estimate + (kc * kd) / Math.pow(hp_estimate, 2.0));

  hco3 = (kc * cco2p) / hp_estimate;

  let co3p = (kd * hco3) / hp_estimate;
  let ohp = kw / hp_estimate;

  pco2 = cco2p / alpha_co2p;

  let a_base = albumin * (0.123 * ph - 0.631) + phosphates * (0.309 * ph - 0.469);

  return (hp_estimate + sid - hco3 - 2.0 * co3p - ohp - a_base - uma);
}

function oxygen_content(po2_estimate) {
  so2 = oxygen_dissociation_curve(po2_estimate);

  let to2_new_estimate = (0.0031 * po2_estimate + 1.36 * (hemoglobin / 0.6206) * so2) * 10.0;

  let mmol_to_ml = (gas_constant * (273.15 + temp)) / 760.0;

  to2_new_estimate = to2_new_estimate / mmol_to_ml;

  po2 = po2_estimate;

  return to2 - to2_new_estimate;
}

function oxygen_dissociation_curve(po2_estimate) {
  let a = 1.04 * (7.4 - ph) + 0.005 * be + 0.07 * (dpg - 5.0);
  let b = 0.055 * (temp + 273.15 - 310.15);
  let x0 = 1.875 + a + b;
  let h0 = 3.5 + a;
  let x = Math.log(po2_estimate * 0.1333);
  let y = x - x0 + h0 * Math.tanh(0.5343 * (x - x0)) + 1.875;

  return 1.0 / (Math.exp(-y) + 1.0);
}

function brent_root_finding(f, x0, x1, max_iter, tolerance) {
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
