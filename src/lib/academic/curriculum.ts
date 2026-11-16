// ============================================================
// Academic Engine — Curriculum Ingestion
// Workspace 3 Parts 51-57
// ============================================================

export interface CurriculumCourse {
  code: string;
  name: string;
  semester: number;
  credits: number;
  regulation?: string;
  description?: string;
  is_elective?: boolean;
  units?: {
    number: number;
    title: string;
    description?: string;
    topics?: string[];
  }[];
  cos?: {
    code: string;
    description: string;
  }[];
  prerequisites?: string[]; // course codes
}

export interface SemesterStructure {
  number: number;
  name: string;
  total_credits: number;
  is_current?: boolean;
  regulation?: string;
  courses: CurriculumCourse[];
}

// Sample ECE curriculum — 8 semesters, ~170 credits, labelled unofficial sample ingest
// Replace with official Anna University syllabus when available
export const sampleCurriculum: SemesterStructure[] = [
  {
    number: 1,
    name: "Semester 1",
    total_credits: 20,
    regulation: "R2021",
    courses: [
      {
        code: "HS3152",
        name: "Professional English I",
        semester: 1,
        credits: 3,
        description: "English for academic and professional communication",
        units: [
          { number: 1, title: "Introduction to Effective Communication", topics: ["Communication", "Listening", "Speaking"] },
          { number: 2, title: "Reading and Language Development", topics: ["Reading", "Vocabulary", "Grammar"] },
          { number: 3, title: "Writing", topics: ["Writing", "Paragraph", "Essay"] },
          { number: 4, title: "Professional Communication", topics: ["Presentation", "Group Discussion"] },
          { number: 5, title: "Workplace Communication", topics: ["Email", "Report", "Resume"] },
        ],
        cos: [
          { code: "CO1", description: "Use English effectively" },
          { code: "CO2", description: "Develop reading skills" },
          { code: "CO3", description: "Write effectively" },
        ],
      },
      {
        code: "MA3151",
        name: "Matrices and Calculus",
        semester: 1,
        credits: 4,
        description: "Matrices, differential and integral calculus",
        units: [
          { number: 1, title: "Matrices", topics: ["Eigenvalues", "Eigenvectors", "Diagonalization"] },
          { number: 2, title: "Differential Calculus", topics: ["Limits", "Derivatives", "Applications"] },
          { number: 3, title: "Functions of Several Variables", topics: ["Partial derivatives", "Jacobian"] },
          { number: 4, title: "Integral Calculus", topics: ["Multiple integrals", "Applications"] },
          { number: 5, title: "Vector Calculus", topics: ["Gradient", "Divergence", "Curl"] },
        ],
        cos: [
          { code: "CO1", description: "Use matrices" },
          { code: "CO2", description: "Apply differential calculus" },
          { code: "CO3", description: "Apply integral calculus" },
        ],
      },
      {
        code: "PH3151",
        name: "Engineering Physics",
        semester: 1,
        credits: 3,
        description: "Physics for engineers",
        units: [
          { number: 1, title: "Crystal Physics", topics: ["Crystal structure", "Defects"] },
          { number: 2, title: "Properties of Matter and Thermal Physics", topics: ["Elasticity", "Thermal"] },
          { number: 3, title: "Quantum Physics", topics: ["Schrodinger", "Particles"] },
          { number: 4, title: "Applied Optics", topics: ["Interference", "Diffraction"] },
          { number: 5, title: "Applied Quantum Mechanics", topics: ["Semiconductors", "Superconductors"] },
        ],
        cos: [{ code: "CO1", description: "Understand crystal physics" }],
      },
      {
        code: "CY3151",
        name: "Engineering Chemistry",
        semester: 1,
        credits: 3,
        description: "Chemistry for engineers",
        units: [
          { number: 1, title: "Water Technology", topics: ["Hard water", "Treatment"] },
          { number: 2, title: "Polymers", topics: ["Polymerization", "Types"] },
          { number: 3, title: "Electrochemistry", topics: ["Cells", "Corrosion"] },
        ],
        cos: [{ code: "CO1", description: "Understand water technology" }],
      },
      {
        code: "GE3151",
        name: "Problem Solving and Python Programming",
        semester: 1,
        credits: 3,
        description: "Python programming and problem solving",
        units: [
          { number: 1, title: "Algorithmic Problem Solving", topics: ["Algorithms", "Flowcharts"] },
          { number: 2, title: "Data, Expressions, Statements", topics: ["Variables", "Operators"] },
          { number: 3, title: "Control Flow, Functions", topics: ["If", "Loops", "Functions"] },
          { number: 4, title: "Lists, Tuples, Dictionaries", topics: ["Lists", "Tuples", "Dicts"] },
          { number: 5, title: "Files, Modules, Packages", topics: ["Files", "Modules"] },
        ],
        cos: [{ code: "CO1", description: "Develop algorithmic thinking" }],
      },
    ],
  },
  {
    number: 2,
    name: "Semester 2",
    total_credits: 20,
    regulation: "R2021",
    courses: [
      {
        code: "HS3252",
        name: "Professional English II",
        semester: 2,
        credits: 3,
        description: "Advanced English for academic and professional communication",
        prerequisites: ["HS3152"],
        units: [
          { number: 1, title: "Technical Vocabulary and Reading", topics: ["Technical terms", "Skimming", "Scanning"] },
          { number: 2, title: "Advanced Writing", topics: ["Reports", "Proposals", "Summaries"] },
          { number: 3, title: "Presentation Skills", topics: ["Structure", "Delivery", "Visual aids"] },
          { number: 4, title: "Group Communication", topics: ["Group discussion", "Negotiation", "Meetings"] },
          { number: 5, title: "Employability Communication", topics: ["Interview", "Cover letter", "Portfolio"] },
        ],
        cos: [
          { code: "CO1", description: "Read and interpret technical texts" },
          { code: "CO2", description: "Write structured technical reports" },
          { code: "CO3", description: "Communicate effectively in professional settings" },
        ],
      },
      {
        code: "MA3251",
        name: "Statistics and Numerical Methods",
        semester: 2,
        credits: 4,
        description: "Probability, statistics and numerical techniques for engineers",
        prerequisites: ["MA3151"],
        units: [
          { number: 1, title: "Testing of Hypothesis", topics: ["Sampling", "Z-test", "t-test", "Chi-square"] },
          { number: 2, title: "Design of Experiments", topics: ["ANOVA", "CRD", "RBD"] },
          { number: 3, title: "Numerical Solution of Equations", topics: ["Bisection", "Newton-Raphson", "Iteration"] },
          { number: 4, title: "Interpolation and Approximation", topics: ["Lagrange", "Newton forward", "Least squares"] },
          { number: 5, title: "Numerical Integration and ODEs", topics: ["Trapezoidal", "Simpson", "Runge-Kutta"] },
        ],
        cos: [
          { code: "CO1", description: "Apply statistical tests to engineering data" },
          { code: "CO2", description: "Solve equations numerically" },
        ],
      },
      {
        code: "PH3256",
        name: "Physics for Information Science",
        semester: 2,
        credits: 3,
        description: "Physics foundations for electronics and information science",
        prerequisites: ["PH3151"],
        units: [
          { number: 1, title: "Conducting Materials", topics: ["Free electron theory", "Fermi level", "Conductivity"] },
          { number: 2, title: "Semiconducting Materials", topics: ["Intrinsic", "Extrinsic", "Hall effect"] },
          { number: 3, title: "Magnetic Materials", topics: ["Dia", "Para", "Ferro", "Ferrites"] },
          { number: 4, title: "Optical Materials", topics: ["LED", "LASER", "Optical fibre"] },
          { number: 5, title: "Nanomaterials", topics: ["Quantum wells", "CNT", "Applications"] },
        ],
        cos: [
          { code: "CO1", description: "Explain electronic properties of materials" },
          { code: "CO2", description: "Relate material physics to device behaviour" },
        ],
      },
      {
        code: "BE3251",
        name: "Basic Electrical and Electronics Engineering",
        semester: 2,
        credits: 3,
        description: "Electrical circuits, machines and basic electronics",
        units: [
          { number: 1, title: "Electrical Circuits", topics: ["Ohm's law", "Kirchhoff", "AC fundamentals"] },
          { number: 2, title: "Electrical Machines", topics: ["DC machines", "Transformers", "Induction motor"] },
          { number: 3, title: "Semiconductor Devices", topics: ["Diode", "BJT", "Rectifiers"] },
          { number: 4, title: "Digital Electronics", topics: ["Logic gates", "Boolean algebra", "Flip-flops"] },
          { number: 5, title: "Communication and Measurements", topics: ["Modulation", "Sensors", "Instruments"] },
        ],
        cos: [
          { code: "CO1", description: "Analyse basic electrical circuits" },
          { code: "CO2", description: "Explain semiconductor devices and digital logic" },
        ],
      },
      {
        code: "GE3251",
        name: "Engineering Graphics",
        semester: 2,
        credits: 4,
        description: "Drawing conventions, projections and CAD fundamentals",
        units: [
          { number: 1, title: "Plane Curves and Freehand Sketching", topics: ["Conics", "Cycloids", "Sketching"] },
          { number: 2, title: "Projection of Points and Lines", topics: ["First angle", "Traces", "Inclinations"] },
          { number: 3, title: "Projection of Solids", topics: ["Prisms", "Pyramids", "Cylinders"] },
          { number: 4, title: "Section of Solids and Developments", topics: ["Sections", "Surface development"] },
          { number: 5, title: "Isometric and Computer Aided Drafting", topics: ["Isometric view", "CAD basics"] },
        ],
        cos: [
          { code: "CO1", description: "Construct orthographic projections" },
          { code: "CO2", description: "Produce isometric and CAD drawings" },
        ],
      },
      {
        code: "GE3252",
        name: "Tamils and Technology",
        semester: 2,
        credits: 1,
        description: "Tamil heritage and its connection to engineering technology",
        units: [
          { number: 1, title: "Tamil Language and Script", topics: ["Script evolution", "Literature"] },
          { number: 2, title: "Heritage Engineering", topics: ["Temple architecture", "Irrigation", "Metallurgy"] },
          { number: 3, title: "Traditional Technology", topics: ["Weaving", "Pottery", "Boat building"] },
          { number: 4, title: "Tamil in Modern Technology", topics: ["Computing in Tamil", "Digital archives"] },
          { number: 5, title: "Technology and Society", topics: ["Ethics", "Sustainability"] },
        ],
        cos: [{ code: "CO1", description: "Relate Tamil heritage to engineering practice" }],
      },
    ],
  },
  {
    number: 3,
    name: "Semester 3",
    total_credits: 22,
    regulation: "R2021",
    is_current: true,
    courses: [
      {
        code: "MA3354",
        name: "Discrete Mathematics",
        semester: 3,
        credits: 4,
        description: "Discrete math for ECE",
        prerequisites: ["MA3151"],
        units: [
          { number: 1, title: "Logic and Proofs", topics: ["Propositional logic", "Predicates", "Proofs"] },
          { number: 2, title: "Combinatorics", topics: ["Counting", "Pigeonhole", "Inclusion-exclusion"] },
          { number: 3, title: "Graphs", topics: ["Graphs", "Trees", "Connectivity"] },
          { number: 4, title: "Algebraic Structures", topics: ["Groups", "Rings", "Fields"] },
          { number: 5, title: "Lattices and Boolean Algebra", topics: ["Lattices", "Boolean algebra"] },
        ],
        cos: [
          { code: "CO1", description: "Apply logic and proofs" },
          { code: "CO2", description: "Apply combinatorics" },
        ],
      },
      {
        code: "CS3353",
        name: "C Programming and Data Structures",
        semester: 3,
        credits: 3,
        description: "C programming and data structures — core for ECE",
        prerequisites: ["GE3151"],
        units: [
          { number: 1, title: "C Programming Fundamentals", topics: ["Data types", "Operators", "Control flow"] },
          { number: 2, title: "Arrays, Strings, Functions", topics: ["Arrays", "Strings", "Functions", "Recursion"] },
          { number: 3, title: "Pointers and Structures", topics: ["Pointers", "Structures", "Unions", "Memory"] },
          { number: 4, title: "Linear Data Structures", topics: ["Linked lists", "Stacks", "Queues"] },
          { number: 5, title: "Non-linear Data Structures", topics: ["Trees", "Graphs", "Hashing"] },
        ],
        cos: [
          { code: "CO1", description: "Write C programs" },
          { code: "CO2", description: "Use pointers and structures" },
          { code: "CO3", description: "Implement data structures" },
        ],
      },
      {
        code: "EC3351",
        name: "Control Systems",
        semester: 3,
        credits: 3,
        description: "Control systems analysis",
        units: [
          { number: 1, title: "Systems and Representations", topics: ["Open loop", "Closed loop", "Transfer function"] },
          { number: 2, title: "Time Response", topics: ["Transient", "Steady state", "Error"] },
          { number: 3, title: "Frequency Response", topics: ["Bode", "Polar", "Nyquist"] },
          { number: 4, title: "Stability", topics: ["Routh", "Root locus"] },
          { number: 5, title: "Compensators and Controllers", topics: ["Lead", "Lag", "PID"] },
        ],
        cos: [{ code: "CO1", description: "Analyze control systems" }],
      },
      {
        code: "EC3352",
        name: "Digital Systems Design",
        semester: 3,
        credits: 3,
        description: "Digital electronics and design",
        units: [
          { number: 1, title: "Number Systems and Boolean Algebra", topics: ["Number systems", "Boolean algebra", "Gates"] },
          { number: 2, title: "Combinational Circuits", topics: ["K-Maps", "Adders", "Multiplexers"] },
          { number: 3, title: "Sequential Circuits", topics: ["Flip-flops", "Counters", "Registers"] },
          { number: 4, title: "Memory and Programmable Logic", topics: ["Memory", "PLD", "FPGA"] },
          { number: 5, title: "HDL and Design", topics: ["Verilog", "Design"] },
        ],
        cos: [{ code: "CO1", description: "Design digital circuits" }],
      },
      {
        code: "EC3353",
        name: "Electronic Devices",
        semester: 3,
        credits: 3,
        description: "Semiconductor devices",
        units: [
          { number: 1, title: "Semiconductor Physics", topics: ["Intrinsic", "Extrinsic", "PN junction"] },
          { number: 2, title: "Diodes", topics: ["PN diode", "Zener", "Applications"] },
          { number: 3, title: "BJT", topics: ["BJT operation", "Configurations", "Biasing"] },
          { number: 4, title: "FET", topics: ["JFET", "MOSFET", "Biasing"] },
          { number: 5, title: "Special Devices", topics: ["LED", "Photodiode", "SCR"] },
        ],
        cos: [{ code: "CO1", description: "Understand electronic devices" }],
      },
      {
        code: "EC3354",
        name: "Signals and Systems",
        semester: 3,
        credits: 4,
        description: "Signals and systems analysis",
        units: [
          { number: 1, title: "Classification of Signals and Systems", topics: ["Continuous", "Discrete", "Properties"] },
          { number: 2, title: "Analysis of Continuous Time Signals", topics: ["Fourier series", "Fourier transform"] },
          { number: 3, title: "Linear Time Invariant Continuous Time Systems", topics: ["Impulse response", "Convolution"] },
          { number: 4, title: "Analysis of Discrete Time Signals", topics: ["DTFT", "DFT", "Z-transform"] },
          { number: 5, title: "Linear Time Invariant Discrete Time Systems", topics: ["Difference equations", "Realization"] },
        ],
        cos: [{ code: "CO1", description: "Analyze signals and systems" }],
      },
    ],
  },
  // Semesters 4-8 as placeholders with total ~170 credits
  {
    number: 4,
    name: "Semester 4",
    total_credits: 22,
    regulation: "R2021",
    courses: [
      {
        code: "EC3401",
        name: "Networks and Security",
        semester: 4,
        credits: 3,
        description: "Computer networks, protocol layers and security fundamentals",
        units: [
          { number: 1, title: "Network Models", topics: ["OSI", "TCP/IP", "Topologies"] },
          { number: 2, title: "Data Link Layer", topics: ["Framing", "Error control", "MAC"] },
          { number: 3, title: "Network Layer", topics: ["IPv4", "IPv6", "Routing"] },
          { number: 4, title: "Transport Layer", topics: ["TCP", "UDP", "Congestion control"] },
          { number: 5, title: "Network Security", topics: ["Symmetric", "Asymmetric", "TLS", "Firewalls"] },
        ],
        cos: [
          { code: "CO1", description: "Explain layered network architecture" },
          { code: "CO2", description: "Apply security mechanisms to network traffic" },
        ],
      },
      {
        code: "EC3402",
        name: "Communication Systems",
        semester: 4,
        credits: 3,
        description: "Analog and digital communication systems",
        prerequisites: ["EC3354"],
        units: [
          { number: 1, title: "Amplitude Modulation", topics: ["AM", "DSB-SC", "SSB", "Demodulation"] },
          { number: 2, title: "Angle Modulation", topics: ["FM", "PM", "Bandwidth"] },
          { number: 3, title: "Noise and Receivers", topics: ["Noise figure", "Superheterodyne", "SNR"] },
          { number: 4, title: "Digital Modulation", topics: ["PCM", "ASK", "FSK", "PSK"] },
          { number: 5, title: "Information Theory", topics: ["Entropy", "Channel capacity", "Coding"] },
        ],
        cos: [
          { code: "CO1", description: "Analyse analog modulation schemes" },
          { code: "CO2", description: "Compare digital modulation and coding" },
        ],
      },
      {
        code: "EC3451",
        name: "Linear Integrated Circuits",
        semester: 4,
        credits: 3,
        description: "Operational amplifiers and linear integrated circuit applications",
        prerequisites: ["EC3353"],
        units: [
          { number: 1, title: "Op-Amp Fundamentals", topics: ["Ideal op-amp", "CMRR", "Slew rate"] },
          { number: 2, title: "Linear Applications", topics: ["Amplifiers", "Filters", "Buffers"] },
          { number: 3, title: "Non-linear Applications", topics: ["Comparator", "Clipper", "Precision rectifier"] },
          { number: 4, title: "Signal Generators and Timers", topics: ["Oscillators", "555 timer", "PLL"] },
          { number: 5, title: "Data Converters and Regulators", topics: ["ADC", "DAC", "Voltage regulators"] },
        ],
        cos: [
          { code: "CO1", description: "Design circuits using operational amplifiers" },
          { code: "CO2", description: "Select appropriate linear ICs for applications" },
        ],
      },
      {
        code: "EC3452",
        name: "Electromagnetic Fields",
        semester: 4,
        credits: 4,
        description: "Electrostatic and electromagnetic field theory",
        prerequisites: ["MA3151", "PH3151"],
        units: [
          { number: 1, title: "Electrostatic Fields", topics: ["Coulomb", "Gauss", "Potential"] },
          { number: 2, title: "Steady Magnetic Fields", topics: ["Biot-Savart", "Ampere", "Inductance"] },
          { number: 3, title: "Maxwell's Equations", topics: ["Faraday", "Displacement current", "Wave equation"] },
          { number: 4, title: "Electromagnetic Waves", topics: ["Plane waves", "Polarisation", "Poynting"] },
          { number: 5, title: "Transmission Lines and Waveguides", topics: ["Impedance", "Reflection", "Modes"] },
        ],
        cos: [
          { code: "CO1", description: "Apply vector calculus to electromagnetic problems" },
          { code: "CO2", description: "Analyse wave propagation in media" },
        ],
      },
      {
        code: "EC3403",
        name: "Electronic Circuits",
        semester: 4,
        credits: 3,
        description: "Bias circuits, amplifiers and feedback",
        prerequisites: ["EC3351"],
        units: [
          { number: 1, title: "Biasing and Small Signal Analysis", topics: ["BJT biasing", "MOSFET biasing", "h-parameters"] },
          { number: 2, title: "Multistage Amplifiers", topics: ["Cascode", "Darlington", "Frequency response"] },
          { number: 3, title: "Feedback Amplifiers", topics: ["Negative feedback", "Topologies", "Stability"] },
          { number: 4, title: "Oscillators", topics: ["RC", "LC", "Crystal"] },
          { number: 5, title: "Power Amplifiers", topics: ["Class A", "Class B", "Class AB"] },
        ],
        cos: [
          { code: "CO1", description: "Design biased transistor amplifiers" },
          { code: "CO2", description: "Analyse feedback and oscillator circuits" },
        ],
      },
    ],
  },
  {
    number: 5,
    name: "Semester 5",
    total_credits: 22,
    regulation: "R2021",
    courses: [
      {
        code: "EC3501",
        name: "Wireless Communication",
        semester: 5,
        credits: 3,
        description: "Cellular and wireless communication systems",
        prerequisites: ["EC3402"],
        units: [
          { number: 1, title: "Wireless Propagation", topics: ["Free space", "Multipath", "Fading"] },
          { number: 2, title: "Cellular Concepts", topics: ["Frequency reuse", "Handoff", "Capacity"] },
          { number: 3, title: "Multiple Access", topics: ["FDMA", "TDMA", "CDMA", "OFDMA"] },
          { number: 4, title: "Wireless Systems", topics: ["GSM", "LTE", "Wi-Fi", "Bluetooth"] },
          { number: 5, title: "Antennas", topics: ["Dipole", "Array", "Gain", "Link budget"] },
        ],
        cos: [
          { code: "CO1", description: "Model wireless channel behaviour" },
          { code: "CO2", description: "Compare multiple access and cellular standards" },
        ],
      },
      {
        code: "EC3551",
        name: "Transmission Lines and RF Systems",
        semester: 5,
        credits: 3,
        description: "Transmission line theory and RF circuit design",
        prerequisites: ["EC3452"],
        units: [
          { number: 1, title: "Transmission Line Theory", topics: ["Primary constants", "Characteristic impedance"] },
          { number: 2, title: "Impedance Matching", topics: ["Smith chart", "Stub matching", "Quarter wave"] },
          { number: 3, title: "RF Components", topics: ["Filters", "Couplers", "Mixers"] },
          { number: 4, title: "RF Amplifiers", topics: ["LNA", "Power amplifier", "Noise"] },
          { number: 5, title: "Microwave Measurements", topics: ["VSWR", "Network analyser"] },
        ],
        cos: [
          { code: "CO1", description: "Solve transmission line problems" },
          { code: "CO2", description: "Design basic RF matching networks" },
        ],
      },
      {
        code: "EC3552",
        name: "VLSI and Chip Design",
        semester: 5,
        credits: 3,
        description: "CMOS VLSI design flow from transistor to chip",
        prerequisites: ["EC3353"],
        units: [
          { number: 1, title: "MOS Transistor Theory", topics: ["Threshold", "I-V characteristics", "Short channel"] },
          { number: 2, title: "CMOS Logic Design", topics: ["Inverter", "NAND", "Pass transistor"] },
          { number: 3, title: "Layout and Fabrication", topics: ["Stick diagrams", "Design rules", "Latch-up"] },
          { number: 4, title: "Timing and Power", topics: ["Delay", "Clock distribution", "Low power"] },
          { number: 5, title: "Design Verification", topics: ["Simulation", "Testing", "DFT"] },
        ],
        cos: [
          { code: "CO1", description: "Design CMOS logic gates" },
          { code: "CO2", description: "Estimate delay, area and power" },
        ],
      },
    ],
  },
  {
    number: 6,
    name: "Semester 6",
    total_credits: 22,
    regulation: "R2021",
    courses: [
      {
        code: "EC3601",
        name: "Microwave and Optical Communication",
        semester: 6,
        credits: 3,
        description: "Microwave devices, optical fibre and photonic systems",
        prerequisites: ["EC3551"],
        units: [
          { number: 1, title: "Microwave Devices", topics: ["Klystron", "Magnetron", "Gunn diode"] },
          { number: 2, title: "Microwave Networks", topics: ["S-parameters", "Cavities", "Waveguides"] },
          { number: 3, title: "Optical Fibres", topics: ["Modes", "Attenuation", "Dispersion"] },
          { number: 4, title: "Optical Sources and Detectors", topics: ["LED", "LASER", "PIN", "APD"] },
          { number: 5, title: "Optical Systems", topics: ["WDM", "Link design", "OTDR"] },
        ],
        cos: [
          { code: "CO1", description: "Explain microwave device operation" },
          { code: "CO2", description: "Design basic optical fibre links" },
        ],
      },
      {
        code: "EC3602",
        name: "Embedded Systems and IoT",
        semester: 6,
        credits: 3,
        description: "Embedded firmware, RTOS and IoT architecture",
        prerequisites: ["CS3353"],
        units: [
          { number: 1, title: "Embedded Hardware", topics: ["Microcontrollers", "Memory", "Peripherals"] },
          { number: 2, title: "Embedded C and Firmware", topics: ["Registers", "Interrupts", "Timers"] },
          { number: 3, title: "RTOS", topics: ["Tasks", "Scheduling", "Semaphores"] },
          { number: 4, title: "IoT Architecture", topics: ["Edge", "Gateway", "Cloud", "MQTT"] },
          { number: 5, title: "IoT Security and Applications", topics: ["TLS", "OTA updates", "Smart systems"] },
        ],
        cos: [
          { code: "CO1", description: "Write firmware for microcontrollers" },
          { code: "CO2", description: "Architect an end-to-end IoT solution" },
        ],
      },
    ],
  },
  {
    number: 7,
    name: "Semester 7",
    total_credits: 22,
    regulation: "R2021",
    courses: [
      {
        code: "EC3701",
        name: "5G and Beyond",
        semester: 7,
        credits: 3,
        description: "5G NR architecture, mmWave and emerging 6G research",
        prerequisites: ["EC3501"],
        units: [
          { number: 1, title: "5G Requirements and Architecture", topics: ["eMBB", "URLLC", "mMTC", "Core network"] },
          { number: 2, title: "5G Radio Access", topics: ["NR numerology", "mmWave", "Massive MIMO"] },
          { number: 3, title: "Network Slicing and Edge", topics: ["Slicing", "MEC", "SDN/NFV"] },
          { number: 4, title: "Beyond 5G", topics: ["THz", "RIS", "AI-native air interface"] },
          { number: 5, title: "Deployment and Standards", topics: ["3GPP", "ORAN", "Testbeds"] },
        ],
        cos: [
          { code: "CO1", description: "Explain 5G NR architecture and use cases" },
          { code: "CO2", description: "Evaluate emerging 6G research directions" },
        ],
      },
      {
        code: "EC3711",
        name: "Summer Internship",
        semester: 7,
        credits: 2,
        description: "Industry internship with structured reflection and reporting",
        units: [
          { number: 1, title: "Internship Orientation", topics: ["Objectives", "Workplace ethics", "Safety"] },
          { number: 2, title: "Technical Work", topics: ["Tasks", "Tools", "Documentation"] },
          { number: 3, title: "Review and Presentation", topics: ["Weekly log", "Final report", "Viva"] },
        ],
        cos: [
          { code: "CO1", description: "Apply classroom knowledge in an industry setting" },
          { code: "CO2", description: "Document and present professional work" },
        ],
      },
    ],
  },
  {
    number: 8,
    name: "Semester 8",
    total_credits: 20,
    regulation: "R2021",
    courses: [
      {
        code: "EC3811",
        name: "Project Work",
        semester: 8,
        credits: 10,
        description: "Final year capstone project with report and viva",
        units: [
          { number: 1, title: "Problem Definition", topics: ["Literature survey", "Scope", "Objectives"] },
          { number: 2, title: "Design and Implementation", topics: ["Architecture", "Prototype", "Testing"] },
          { number: 3, title: "Evaluation", topics: ["Results", "Benchmarking", "Limitations"] },
          { number: 4, title: "Report and Publication", topics: ["Thesis", "Paper", "Plagiarism"] },
          { number: 5, title: "Defence", topics: ["Presentation", "Viva", "Demonstration"] },
        ],
        cos: [
          { code: "CO1", description: "Solve an open-ended engineering problem" },
          { code: "CO2", description: "Communicate results through report and viva" },
        ],
      },
      {
        code: "EC3001",
        name: "Elective",
        semester: 8,
        credits: 3,
        description: "Department elective — topic varies by offering",
        units: [
          { number: 1, title: "Elective Foundation", topics: ["Core concepts", "Terminology"] },
          { number: 2, title: "Techniques", topics: ["Methods", "Tools"] },
          { number: 3, title: "Applications", topics: ["Case studies", "Design examples"] },
          { number: 4, title: "Advanced Topics", topics: ["Recent research", "Trends"] },
          { number: 5, title: "Project Component", topics: ["Mini project", "Presentation"] },
        ],
        cos: [{ code: "CO1", description: "Apply elective concepts to practical problems" }],
      },
    ],
  },
];

// Helper functions

export function getSemester(number: number): SemesterStructure | undefined {
  return sampleCurriculum.find((s) => s.number === number);
}

export function getCourseByCode(code: string): CurriculumCourse | undefined {
  for (const sem of sampleCurriculum) {
    const course = sem.courses.find((c) => c.code === code);
    if (course) return course;
  }
  return undefined;
}

export function getAllCourses(): CurriculumCourse[] {
  return sampleCurriculum.flatMap((s) => s.courses);
}

export function getTotalCredits(): number {
  return sampleCurriculum.reduce((sum, sem) => sum + sem.total_credits, 0);
}

export function getPrerequisiteGraph(): Record<string, string[]> {
  const graph: Record<string, string[]> = {};

  for (const course of getAllCourses()) {
    graph[course.code] = course.prerequisites || [];
  }

  return graph;
}

// Curriculum ingestion from external file (e.g., PDF syllabus)
// This would parse official Anna University syllabus PDFs
// For now, placeholder that returns sample

export function ingestCurriculumFromText(text: string): CurriculumCourse[] {
  // Simple heuristic: Look for course codes like EC3401, CS3353, etc.
  const courseCodeRegex = /\b[A-Z]{2}\d{4}\b/g;
  const codes = text.match(courseCodeRegex) || [];

  // For each code, try to find name nearby
  // This is placeholder — real implementation would use more sophisticated parsing

  const courses: CurriculumCourse[] = codes.slice(0, 20).map((code) => ({
    code,
    name: `Course ${code} — Extracted from syllabus (verify official)`,
    semester: 3,
    credits: 3,
    description: `Extracted from uploaded syllabus text — labelled unofficial sample ingest. Verify with official Anna University syllabus.`,
  }));

  return courses;
}
