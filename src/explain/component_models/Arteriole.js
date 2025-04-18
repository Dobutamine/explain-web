import { BloodVessel } from "../component_models/BloodVessel";

/*
Properties of Arterioles

Arterioles are small blood vessels with several distinctive properties that make them critical to cardiovascular function:

Structural Properties
    Size and Dimensions
        Diameter: typically 10-100 micrometers
        Wall thickness: relatively thick compared to their lumen
        Transition vessels between small arteries and capillaries
    Wall Composition
        Tunica intima: single layer of endothelial cells with minimal subendothelial layer
        Tunica media: 1-2 layers of smooth muscle cells arranged circularly
        Tunica adventitia: thin outer layer of connective tissue
        Internal elastic lamina present but thinner than in larger arteries
        External elastic lamina often absent

Functional Properties
    Resistance Vessels
        Primary site of vascular resistance in the circulatory system
        Control ~70% of systemic vascular resistance
        Small changes in diameter cause large changes in resistance (resistance ∝ 1/r⁴)
    Blood Pressure Regulation
        Maintain pressure gradient between arteries and capillaries
        Reduce pressure from ~85 mmHg in small arteries to ~30 mmHg at capillary entrance
        Critical for protecting delicate capillary beds from high pressure
    Blood Flow Distribution
        Regulate blood flow to specific tissues based on metabolic demands
        Can redirect blood through selective constriction and dilation
        Enable prioritization of blood flow to vital organs during stress
    Autoregulation
        Maintain relatively constant blood flow despite changes in perfusion pressure
        Myogenic response: contract in response to stretch (increased pressure)
        Metabolic response: dilate in response to local tissue needs

Physiological Control
    Rich Autonomic Innervation
        Extensive sympathetic adrenergic innervation
        Some beds also receive cholinergic vasodilator fibers
        Especially dense innervation in skin, skeletal muscle, and splanchnic regions
    Endothelial Influence
        Endothelium produces vasoactive substances (NO, prostacyclin, endothelin)
        Serves as an interface between blood and smooth muscle
        Involved in signal transduction of blood-borne vasoactive substances
    Responsiveness to Local Factors
        Highly sensitive to local metabolites (K⁺, H⁺, adenosine, lactate)
        Respond to changes in tissue oxygen tension
        React to local temperature changes
    Heterogeneity Across Vascular Beds
        Different organ systems have arterioles with specialized properties
        Cerebral arterioles: highly responsive to CO₂ levels
        Renal arterioles: specialized roles in glomerular filtration
        Pulmonary arterioles: constrict in response to hypoxia (unlike systemic arterioles)

    Vasoconstriction
      Sympathetic nervous system (Autonomic innervation)
        - a1 and a2 adrenergic receptors on smooth muscle cells stimulated by norepinephrine
      Renin-Angiotensin-Aldosterone System (RAAS)
        - AT1 receptors on smooth muscle cells stimulated by angiotensin-II
      Endothelin pathway
        - ETA receptors on smooth muscle cells stimulated by endothelin-I
      Vasopressin (ADH) Pathway
        - Vasopressin binds to V1 receptors on VSMCs
        - V1 receptors activate PLC via Gq proteins
        - This increases intracellular calcium and causes vasoconstriction

    Vasodilatation
      Nitric Oxide (NO) pathway
        - local endothelial cells produces eNOS through shear stress, acetylcholine on muscarine receptors, bradykinin on B2 receptors and substance P on NK1 receptors
        - eNOS converts L-arginine to NO
        - NO diffuses into the smooth muscle cells and activates guanylyl cyclase -> pathway -> vasodilation
      Prostacycline (PGI2) pathway
        - Arterial endothelial cells produce prostacyclin via cyclooxygenase (COX)
        - Prostacyclin binds to IP receptors on arterial smooth muscle
        - IP receptors activate adenylyl cyclase via Gs proteins. This increases cAMP, activating protein kinase A (PKA)
        - PKA inhibits myosin light chain kinase, promoting relaxation
      Endothelium-Derived Hyperpolarizing Factor (EDHF)
        - Various stimuli cause endothelial cells to release EDHFs
        - EDHFs open potassium channels in VSMCs
        - Potassium efflux causes membrane hyperpolarization
        - Hyperpolarization closes voltage-gated calcium channels
        - Reduced calcium influx leads to relaxation and vasodilation
      Local Metabolic Control
        - Adenosine Pathway
          - Low oxygen levels increase ADP/ATP ratio in tissues
          - ADP is converted to adenosine
          - Adenosine binds to A2A receptors on VSMCs
          - A2A receptors activate adenylyl cyclase via Gs proteins
          - This increases cAMP, activates PKA, and causes vasodilation
        - Carbon Dioxide and pH Effects
          - Increased CO2 levels produce carbonic acid (H2CO3)
          - H2CO3 dissociates to H+ and HCO3-
          - Decreased pH directly relaxes VSMCs
          - H+ also stimulates potassium channel opening, causing hyperpolarization
        - Hormonal Regulation
          - Epinephrine Effects
            - Low concentrations primarily activate β2-adrenergic receptors on smooth muscle cells
            - β2 receptors couple to Gs proteins and activate adenylyl cyclase
            - This increases cAMP and causes vasodilation
            - High concentrations activate α1-adrenergic receptors
            - α1 activation overrides β2 effects, causing vasoconstriction

These properties allow arterioles to serve as the primary control point for blood distribution throughout the body, 
making them essential for both moment-to-moment cardiovascular homeostasis and adaptation to changing physiological demands.
*/
export class Arteriole extends BloodVessel {
  // static properties
  static model_type = "Arteriole";

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize addtional independent properties
    this.alpha = 1.0                        // determines relation between resistance change and elastance change
    this.ans_sensitivity = 1.0;             // sensitivity for autonomic control (vasoconstriction/vasodilatation)
  }
}
