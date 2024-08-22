// brent constants
const brent_accuracy = 1e-6;
const max_iterations = 100;
const gas_constant = 62.36367;
let steps = 0.0;

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
let dpg = 0.0;
let temp = 0.0;
let tco2 = 0.0;
let sid = 0.0;
let albumin = 0.0;
let phosphates = 0.0;
let uma = 0.0;

export function set_blood_composition(bc) {
  // calculate the acidbase and oxygenation
  let aboxy = bc.aboxy;
  let sol = bc.solutes;

  // calculate the apparent SID
  let sid = sol.na + sol.k + 2 * sol.ca + 2 * sol.mg - sol.cl - sol.lact;

  let bg = get_blood_composition(
    aboxy.to2,
    aboxy.tco2,
    sid,
    aboxy.albumin,
    aboxy.phosphates,
    aboxy.uma,
    aboxy.hemoglobin,
    aboxy.dpg,
    aboxy.temp
  );

  if (bg.valid_ab) {
    aboxy.ph = bg.ph;
    aboxy.pco2 = bg.pco2;
    aboxy.hco3 = bg.hco3;
    aboxy.be = bg.be;
  }

  if (bg.valid_o2) {
    aboxy.po2 = bg.po2;
    aboxy.so2 = bg.so2;
  }
}

function get_blood_composition(
  _to2,
  _tco2,
  _sid,
  _albumin,
  _phosphates,
  _uma,
  _hemoglobin,
  _dpg,
  _temp
) {
  // declare a struct holding the result
  let result = {
    valid_o2: false,
    valid_ab: false,
  };

  // get the independent parameters for the acidbase routine
  tco2 = _tco2;
  sid = _sid;
  albumin = _albumin;
  phosphates = _phosphates;
  uma = _uma;

  // now try to find the hydrogen concentration at the point where the net charge of the plasma is zero within limits of the brent accuracy
  let hp = Brent(
    net_charge_plasma,
    left_hp,
    right_hp,
    max_iterations,
    brent_accuracy
  );

  // check whether there is a valid result
  if (!hp.Error) {
    result.valid_ab = true;
    // process the result (hp is in mmol/l -> convert to mol/l)
    ph = -Math.log10(hp.Result / 1000);
    result.ph = ph;
    result.pco2 = pco2;
    result.hco3 = hco3;
    result.be = be;
    result.steps_ab = hp.Iterations;
  } else {
    // as the acidbase is not valid try to calculate the po2 and so2 assuming normal acidbase values
    result.valid_ab = false;
    ph = 7.4;
    pco2 = 40.0;
    hco3 = 25.0;
    be = 0.0;
  }

  // get the independent parameters for the oxygenation routine
  to2 = _to2;
  hemoglobin = _hemoglobin;
  dpg = _dpg;
  temp = _temp;

  // calculate the po2 from the to2 using a brent root finding function and oxygen dissociation curve
  po2 = Brent(
    oxygen_content,
    left_o2,
    right_o2,
    max_iterations,
    brent_accuracy
  );

  result.steps_o2 = steps;
  if (!po2.Error > 0) {
    result.valid_o2 = true;
    result.po2 = po2.Result;
    result.steps_o2 = po2.Iterations;
    result.so2 = so2 * 100.0;
  }

  return result;
}

function net_charge_plasma(hp_estimate) {
  // Calculate the pH based on the current hp estimate
  let ph = -Math.log10(hp_estimate / 1000.0);

  // Calculate the plasma co2 concentration based on the total co2 in the plasma, hydrogen concentration, and the constants Kc and Kd
  let cco2p =
    tco2 / (1.0 + kc / hp_estimate + (kc * kd) / Math.pow(hp_estimate, 2.0));

  // Calculate the plasma hco3(-) concentration (bicarbonate)
  let hco3p = (kc * cco2p) / hp_estimate;

  // Calculate the plasma co3(2-) concentration (carbonate)
  let co3p = (kd * hco3p) / hp_estimate;

  // Calculate the plasma OH(-) concentration (water dissociation)
  let ohp = kw / hp_estimate;

  // Calculate the pco2 of the plasma
  let pco2p = cco2p / alpha_co2p;

  // Calculate the weak acids (albumin and phosphates)
  let a_base =
    albumin * (0.123 * ph - 0.631) + phosphates * (0.309 * ph - 0.469);

  // Calculate the net charge of the plasma
  let netcharge = hp_estimate + sid - hco3p - 2.0 * co3p - ohp - a_base - uma;

  // Calculate the base excess according to the van Slyke equation
  be =
    (hco3p - 25.1 + (2.3 * hemoglobin + 7.7) * (ph - 7.4)) *
    (1.0 - 0.023 * hemoglobin);

  // Store the calculated values
  pco2 = pco2p;
  hco3 = hco3p;

  // Return the net charge
  return netcharge;
}

function oxygen_content(po2_estimate) {
  // calculate the saturation from the current po2 from the current po2 estimate
  so2 = oxygen_dissociation_curve(po2_estimate);

  // calculate the to2 from the current po2 estimate
  // INPUTS: po2 in mmHg, so2 in fraction, hemoglobin in mmol/l
  // convert the hemoglobin unit from mmol/l to g/dL  (/ 0.6206)
  // convert to output from ml O2/dL blood to ml O2/l blood (* 10.0)
  let to2_new_estimate =
    (0.0031 * po2_estimate + 1.36 * (hemoglobin / 0.6206) * so2) * 10.0;

  // conversion factor for converting ml O2/l to mmol/l
  let mmol_to_ml = (gas_constant * (273.15 + temp)) / 760.0;

  // convert the ml O2/l to mmol/l
  to2_new_estimate = to2_new_estimate / mmol_to_ml;

  // calculate the difference between the real to2 and the to2 based on the new po2 estimate and return it to the brent root finding function
  let dto2 = to2 - to2_new_estimate;

  return dto2;
}

function oxygen_dissociation_curve(po2_estimate) {
  // calculate the saturation from the po2 depending on the ph,be, temperature and dpg level.
  let a = 1.04 * (7.4 - ph) + 0.005 * be + 0.07 * (dpg - 5.0);
  let b = 0.055 * (temp + 273.15 - 310.15);
  let x0 = 1.875 + a + b;
  let h0 = 3.5 + a;
  let x = Math.log(po2_estimate * 0.1333); // po2 in kPa
  let y = x - x0 + h0 * Math.tanh(0.5343 * (x - x0)) + 1.875;

  // return the o2 saturation in fraction so 0.98
  return 1.0 / (Math.exp(-y) + 1.0);
}

function Brent(func, lowerLimit, upperLimit, maxIter, errorTol) {
  let a = lowerLimit;
  let b = upperLimit;
  let c = a;
  let fa = func(a);
  let fb = func(b);
  let fc = fa;
  let s = 0;
  let fs = 0;
  let tol_act; // Actual tolerance
  let new_step; // Step at this iteration
  let prev_step; // Distance from the last but one to the last approximation
  let p; // Interpolation step is calculated in the form p/q; division is delayed until the last moment
  let q;

  // define a result object
  let result = {
    Result: 10,
    Iterations: 0,
    Error: false,
  };

  let set_max_iterations = maxIter;

  errorTol = errorTol || 0;
  maxIter = maxIter || 1000;

  while (maxIter-- > 0) {
    prev_step = b - a;

    if (Math.abs(fc) < Math.abs(fb)) {
      // Swap data for b to be the best approximation
      (a = b), (b = c), (c = a);
      (fa = fb), (fb = fc), (fc = fa);
    }

    tol_act = 1e-15 * Math.abs(b) + errorTol / 2;
    new_step = (c - b) / 2;

    if (Math.abs(new_step) <= tol_act || fb === 0) {
      result.Result = b;
      result.Error = false;
      result.Iterations = set_max_iterations - maxIter;
      return result; // Acceptable approx. is found
    }
    // Decide if the interpolation can be tried
    if (Math.abs(prev_step) >= tol_act && Math.abs(fa) > Math.abs(fb)) {
      // If prev_step was large enough and was in true direction, Interpolatiom may be tried
      var t1, cb, t2;
      cb = c - b;
      if (a === c) {
        // If we have only two distinct points linear interpolation can only be applied
        t1 = fb / fa;
        p = cb * t1;
        q = 1.0 - t1;
      } else {
        // Quadric inverse interpolation
        (q = fa / fc), (t1 = fb / fc), (t2 = fb / fa);
        p = t2 * (cb * q * (q - t1) - (b - a) * (t1 - 1));
        q = (q - 1) * (t1 - 1) * (t2 - 1);
      }

      if (p > 0) {
        q = -q; // p was calculated with the opposite sign; make p positive
      } else {
        p = -p; // and assign possible minus to q
      }

      if (
        p < 0.75 * cb * q - Math.abs(tol_act * q) / 2 &&
        p < Math.abs((prev_step * q) / 2)
      ) {
        // If (b + p / q) falls in [b,c] and isn't too large it is accepted
        new_step = p / q;
      }

      // If p/q is too large then the bissection procedure can reduce [b,c] range to more extent
    }

    if (Math.abs(new_step) < tol_act) {
      // Adjust the step to be not less than tolerance
      new_step = new_step > 0 ? tol_act : -tol_act;
    }

    (a = b), (fa = fb); // Save the previous approx.
    (b += new_step), (fb = func(b)); // Do step to a new approxim.

    if ((fb > 0 && fc > 0) || (fb < 0 && fc < 0)) {
      (c = a), (fc = fa); // Adjust c for it to have a sign opposite to that of b
    }
  }

  // configure the return object if not within range
  result.Result = -1;
  result.Error = true;
  result.Iterations = set_max_iterations - maxIter;
  return result.Result; // No acceptable approximation. is found
}
