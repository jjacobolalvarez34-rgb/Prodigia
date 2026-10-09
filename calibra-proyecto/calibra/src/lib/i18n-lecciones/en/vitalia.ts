import type { TraduccionLeccion } from "../traducir";
import { VITALIA_CLASES_EN } from "./vitaliaClases";

// Vitalia (Biology) — 26 Técnicas (this file) and 34 Clases (vitaliaClases.ts) in English.
// Spanish mnemonics are replaced by the usual English ones: "Dear King Philip Came Over For
// Good Soup" (taxonomic ranks) and "Apples in the Tree, Car in the Garage" (A-T, C-G). PMAT
// works the same in English. Moneras = Monera, Protistas = Protists, Hongos = Fungi.
export const VITALIA_EN: Record<string, TraduccionLeccion> = {
  "vitalia-animal-o-vegetal": {
    nombre: "Animal or plant in 3 clues",
    descripcion: "A wall, chloroplasts and a big vacuole: it's a plant cell.",
    pasos: [
      "Animal and plant cells share almost everything: membrane, nucleus, mitochondria, ribosomes, endoplasmic reticulum and Golgi.",
      "To tell them apart, look for three clues. 1) A rigid **cell wall** outside the membrane. 2) Green **chloroplasts**.",
      "3) A huge **vacuole** in the center, which pushes everything else against the edges.",
      "If you see all three, it's a plant cell. If it's rounded, with no wall or chloroplasts and with tiny vacuoles, it's an animal cell.",
    ],
    quiz: [
      { pregunta: "A cell has a cell wall and chloroplasts. What is it?", opciones: ["A plant cell", "An animal cell", "A bacterium", "A virus"], respuesta: 0, explicacion: "A wall and chloroplasts are clues of a plant cell." },
      { pregunta: "Which of these parts does an animal cell have?", opciones: ["Mitochondria", "Cell wall", "Chloroplasts", "A huge central vacuole"], respuesta: 0, explicacion: "Mitochondria are in animals and plants; the other three belong to the plant cell." },
    ],
    visuales: ["The three clues of the plant cell"],
  },
  "vitalia-cada-organelo-un-oficio": {
    nombre: "Each organelle, a job",
    descripcion: "Think of the cell as a city: each part has a job.",
    pasos: [
      "**Nucleus**: city hall, it keeps the DNA and gives the orders. **Mitochondrion**: the power plant, it gets energy out of glucose.",
      "**Ribosome**: the protein factory. **Endoplasmic reticulum**: the streets where things are made and transported.",
      "**Golgi apparatus**: the post office, it packs and delivers. **Lysosome**: recycling, it digests what's no longer useful.",
      "**Membrane**: the border, it decides what comes in and what goes out.",
    ],
    quiz: [
      { pregunta: "Which organelle builds proteins?", opciones: ["Ribosome", "Lysosome", "Mitochondrion", "Vacuole"], respuesta: 0, explicacion: "Ribosomes are the protein factory." },
      { pregunta: "Which organelle packs and delivers what the cell makes?", opciones: ["Golgi apparatus", "Nucleus", "Ribosome", "Mitochondrion"], respuesta: 0, explicacion: "The Golgi works as the cell's post office." },
    ],
    visuales: ["Each part of the animal cell and its job"],
  },
  "vitalia-osmosis-sin-confundirse": {
    nombre: "Osmosis without getting confused",
    descripcion: "Water goes toward where there's more salt.",
    pasos: [
      "In osmosis, what moves is **water**, through the membrane. Salt can't get through.",
      "One rule: **water goes toward where there's more salt** (more solutes), as if to dilute it.",
      "**Hypotonic** medium (less salt outside): water goes in and the cell swells. **Hypertonic** medium (more salt outside): water goes out and the cell shrivels.",
      "That's why salted vegetables release water, and a raisin in water swells up.",
    ],
    quiz: [
      { pregunta: "You put a red blood cell in very salty water. What happens to it?", opciones: ["It loses water and shrivels", "It swells and may burst", "It stays the same", "It absorbs the salt"], respuesta: 0, explicacion: "There's more salt outside: water leaves the cell." },
      { pregunta: "In osmosis, what crosses the membrane?", opciones: ["Water", "Salt", "Proteins", "The nucleus"], respuesta: 0, explicacion: "Osmosis is the movement of water toward where there are more solutes." },
    ],
    visuales: ["More salt outside: water goes out", "Less salt outside: water goes in"],
  },
  "vitalia-biomoleculas-por-su-ladrillo": {
    nombre: "Biomolecules by their building block",
    descripcion: "Glucose: carbohydrates. Amino acid: proteins. Nucleotide: DNA.",
    pasos: [
      "The four big families of the molecules of life are built from repeated pieces, like a wall made of bricks.",
      "**Carbohydrates** (starch, cellulose): their brick is **glucose**. **Proteins**: their brick is the **amino acid**.",
      "**Nucleic acids** (DNA, RNA): their brick is the **nucleotide**. **Lipids** (fats): fatty acids and glycerol.",
      "Trick: if you're told the brick, you already know the family.",
    ],
    quiz: [
      { pregunta: "What is the building block of proteins?", opciones: ["The amino acid", "Glucose", "The nucleotide", "The fatty acid"], respuesta: 0, explicacion: "Proteins are chains of amino acids." },
      { pregunta: "Starch is made of many glucose units. What is it?", opciones: ["A carbohydrate", "A protein", "A lipid", "A nucleic acid"], respuesta: 0, explicacion: "Carbohydrates are built from sugars like glucose." },
    ],
    visuales: ["Glucose + glucose + glucose…", "Amino acid + amino acid + …", "Nucleotide + nucleotide + …", "Fatty acids + glycerol"],
  },
  "vitalia-fotosintesis-y-respiracion-espejo": {
    nombre: "Photosynthesis and respiration are mirror images",
    descripcion: "What one takes in, the other gives out.",
    pasos: [
      "**Photosynthesis**: $6\\,CO_2 + 6\\,H_2O + \\text{light} \\to C_6H_{12}O_6 + 6\\,O_2$. It happens in the chloroplast.",
      "**Cellular respiration**: $C_6H_{12}O_6 + 6\\,O_2 \\to 6\\,CO_2 + 6\\,H_2O + \\text{ATP}$. It happens in the mitochondrion.",
      "It's the same equation turned around: the products of one are the ingredients of the other.",
      "Careful: plants do both. Photosynthesis during the day; respiration, all the time.",
    ],
    quiz: [
      { pregunta: "Which gas do plants give off when they do photosynthesis?", opciones: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"], respuesta: 0, explicacion: "Photosynthesis produces glucose and $O_2$." },
      { pregunta: "What does cellular respiration produce for the cell to use?", opciones: ["ATP", "Glucose", "Oxygen", "Light"], respuesta: 0, explicacion: "Respiration gets the energy out of glucose in the form of ATP." },
    ],
    visuales: ["The cycle closes between chloroplast and mitochondrion"],
  },
  "vitalia-pmat-mitosis": {
    nombre: "PMAT: the order of mitosis",
    descripcion: "Prophase, metaphase, anaphase, telophase.",
    pasos: [
      "The four phases of mitosis, in order: **P**rophase, **M**etaphase, **A**naphase, **T**elophase. \"PMAT\".",
      "**Prophase**: the chromosomes condense. **Metaphase**: they line up in the **M**iddle.",
      "**Anaphase**: the chromatids move **A**part toward the poles. **Telophase**: two nuclei form and the cell divides.",
      "Before all of it comes **interphase**, when the cell grows and copies its DNA.",
    ],
    quiz: [
      { pregunta: "In which phase do the chromosomes line up in the middle of the cell?", opciones: ["Metaphase", "Prophase", "Anaphase", "Telophase"], respuesta: 0, explicacion: "Metaphase: M for Middle." },
      { pregunta: "Which phase comes right after metaphase?", opciones: ["Anaphase", "Prophase", "Telophase", "Interphase"], respuesta: 0, explicacion: "PMAT: after the M comes the A." },
    ],
    visuales: ["The four phases, one by one"],
  },
  "vitalia-contar-cromosomas": {
    nombre: "Counting chromosomes",
    descripcion: "Mitosis keeps 2n; meiosis leaves n.",
    pasos: [
      "Body cells have their chromosomes in pairs: **2n**. In humans, $2n = 46$.",
      "**Mitosis** (growing, repairing): you get **2** cells identical to the mother cell, with **2n**. Humans: $46 \\to 46$.",
      "**Meiosis** (making gametes): you get **4** cells with half, **n**. Humans: $46 \\to 23$.",
      "When an egg ($n$) and a sperm ($n$) join, you're back to $2n$: $23 + 23 = 46$.",
    ],
    quiz: [
      { pregunta: "A dog has $2n = 78$. How many chromosomes does a female dog's egg have?", opciones: ["39", "78", "156", "19"], respuesta: 0, explicacion: "Gametes have $n$: half, 39." },
      { pregunta: "A human skin cell ($46$) does mitosis. How many chromosomes does each daughter cell have?", opciones: ["46", "23", "92", "12"], respuesta: 0, explicacion: "Mitosis keeps the number: $2n = 46$." },
    ],
    visuales: ["Meiosis: from $2n$ to four $n$ cells"],
  },
  "vitalia-con-oxigeno-o-sin": {
    nombre: "With oxygen or without?",
    descripcion: "Respiration: about 36 ATP. Fermentation: 2 ATP.",
    pasos: [
      "The cell gets energy out of glucose in two ways, depending on whether there's oxygen or not.",
      "**With oxygen** (aerobic respiration, in the mitochondrion): about **36 ATP** per glucose, and $CO_2$ and water come out.",
      "**Without oxygen** (fermentation, in the cytoplasm): only **2 ATP**. Lactic acid comes out (tired muscle, yogurt) or alcohol and $CO_2$ (bread, beer).",
      "That's why respiration is about 18 times more efficient.",
    ],
    quiz: [
      { pregunta: "A muscle works so hard that it runs short of oxygen. What does it do?", opciones: ["Lactic fermentation", "Photosynthesis", "Alcoholic fermentation", "It stops using glucose"], respuesta: 0, explicacion: "Without oxygen, the muscle ferments and produces lactic acid." },
      { pregunta: "How many ATP does fermentation give for each glucose?", opciones: ["2", "36", "6", "0"], respuesta: 0, explicacion: "Only 2 ATP, against about 36 from respiration." },
    ],
    visuales: ["With oxygen: about 36 ATP", "Without oxygen: 2 ATP"],
  },
  "vitalia-hebra-complementaria": {
    nombre: "The complementary strand in a flash",
    descripcion: "A with T, G with C; in RNA, A with U.",
    pasos: [
      "In DNA the bases always pair the same way: **A with T** and **G with C**.",
      "To write the complementary strand, swap letter by letter: $ATGC \\to TACG$.",
      "When going to **RNA** (transcription) there's no T: **A** pairs with **U**. So, $TACG \\to AUGC$.",
      "Trick: \"**A**pples in the **T**ree, **C**ar in the **G**arage\", and in RNA the T is swapped for U.",
    ],
    quiz: [
      { pregunta: "What is the complementary DNA strand of $AATGC$?", opciones: ["TTACG", "UUACG", "AATGC", "GCATT"], respuesta: 0, explicacion: "A→T, A→T, T→A, G→C, C→G." },
      { pregunta: "What messenger RNA comes from transcribing $TACG$?", opciones: ["AUGC", "ATGC", "UACG", "TACG"], respuesta: 0, explicacion: "T→A, A→U, C→G, G→C." },
    ],
    visuales: ["Each base with its partner"],
  },
  "vitalia-punnett-30-segundos": {
    nombre: "Punnett in 30 seconds",
    descripcion: "Set up the square, fill in the boxes and count them.",
    pasos: [
      "1) Separate each parent's alleles: $Aa$ gives gametes $A$ and $a$.",
      "2) Put one parent's on top and the other's on the left. 3) Each box combines the letter of its row with the one of its column.",
      "4) Count: $Aa \\times Aa$ gives $AA$, $Aa$, $Aa$, $aa$. Phenotypes: 3 with the dominant trait and 1 recessive: **3 : 1**.",
      "Each box is worth 25%: $aa$ shows up in 25% of cases.",
    ],
    quiz: [
      { pregunta: "You cross $Aa \\times aa$. What percentage of the offspring is $aa$?", opciones: ["50 %", "25 %", "75 %", "0 %"], respuesta: 0, explicacion: "Boxes: $Aa$, $Aa$, $aa$, $aa$: 2 out of 4." },
      { pregunta: "You cross $AA \\times aa$. What are all the offspring like?", opciones: ["Aa", "AA", "aa", "Half AA and half aa"], respuesta: 0, explicacion: "One parent only gives $A$ and the other only $a$." },
    ],
    visuales: ["$Aa \\times Aa$: 3 : 1"],
  },
  "vitalia-9331-sin-16-casillas": {
    nombre: "9:3:3:1 without drawing 16 boxes",
    descripcion: "Multiply the probabilities of each trait.",
    pasos: [
      "With two genes inherited separately, each one follows its own 3 : 1.",
      "For $AaBb \\times AaBb$: the chance of dominant in A is $\\tfrac{3}{4}$ and in B it's also $\\tfrac{3}{4}$.",
      "Multiply: dominant in both, $\\tfrac{3}{4} \\cdot \\tfrac{3}{4} = \\tfrac{9}{16}$; only one dominant, $\\tfrac{3}{16}$ each case; both recessive, $\\tfrac{1}{4} \\cdot \\tfrac{1}{4} = \\tfrac{1}{16}$.",
      "There's the **9 : 3 : 3 : 1** without drawing the 16-box square.",
    ],
    quiz: [
      { pregunta: "In $AaBb \\times AaBb$, what fraction comes out $aabb$?", opciones: ["1/16", "1/4", "9/16", "3/16"], respuesta: 0, explicacion: "$\\tfrac{1}{4} \\cdot \\tfrac{1}{4} = \\tfrac{1}{16}$." },
      { pregunta: "In the same cross, what fraction shows both dominant traits?", opciones: ["9/16", "3/16", "1/16", "3/4"], respuesta: 0, explicacion: "$\\tfrac{3}{4} \\cdot \\tfrac{3}{4} = \\tfrac{9}{16}$." },
    ],
    visuales: ["The 16 boxes confirm 9 : 3 : 3 : 1"],
  },
  "vitalia-chargaff": {
    nombre: "Chargaff in one step",
    descripcion: "A = T and G = C; the four add up to 100%.",
    pasos: [
      "Since A always pairs with T, in double-stranded DNA there's **as much A as T**. And as much G as C.",
      "The four add up to 100%. If you're given one, you can work out all of them.",
      "Example: 20% A. Then T = 20%, and 60% is left for G and C together: **30% each**.",
    ],
    quiz: [
      { pregunta: "A DNA molecule has 35% G. What percentage of A does it have?", opciones: ["15 %", "35 %", "65 %", "30 %"], respuesta: 0, explicacion: "C = 35%; G + C = 70%; 30% is left for A and T: 15% each." },
      { pregunta: "A DNA molecule has 28% T. How much A does it have?", opciones: ["28 %", "22 %", "72 %", "44 %"], respuesta: 0, explicacion: "A = T, always." },
    ],
    visuales: ["Each A has its T; each G, its C"],
  },
  "vitalia-tabla-de-codones": {
    nombre: "Reading the codon table",
    descripcion: "First letter on the left, second on top, third on the right.",
    pasos: [
      "The ribosome reads messenger RNA **three letters at a time**: each triplet is a **codon**, and each codon specifies an amino acid.",
      "In the table: the **first letter** picks the big row (left); the **second**, the column (top); the **third**, the line inside the box (right).",
      "$AUG$ is Met and it also marks the **start**. $UAA$, $UAG$ and $UGA$ are **stop**: that's where the protein ends.",
      "Example: $AUG\\text{-}CCU\\text{-}GUU \\to$ Met-Pro-Val.",
    ],
    quiz: [
      { pregunta: "How many RNA letters make up a codon?", opciones: ["3", "1", "2", "4"], respuesta: 0, explicacion: "A codon is a triplet of bases." },
      { pregunta: "What does the codon $UAA$ do?", opciones: ["Ends the protein", "Starts the protein", "Codes for methionine", "Nothing"], respuesta: 0, explicacion: "$UAA$ is a stop codon." },
    ],
    visuales: ["Three letters at a time: one amino acid per codon"],
  },
  "vitalia-arterias-salen-venas-vuelven": {
    nombre: "Arteries go out, veins come back",
    descripcion: "The heart rule, with the exception of the lungs.",
    pasos: [
      "**Arteries**: carry blood **away from** the heart. **Veins**: bring it back **to** the heart. The rule is the direction, not the color.",
      "Almost always, arteries carry oxygen-rich blood and veins oxygen-poor blood.",
      "Exception: the **pulmonary artery** leaves the heart toward the lungs **without** oxygen, and the **pulmonary veins** come back **with** oxygen.",
      "Trick: \"**A**rtery = **A**way from the heart\".",
    ],
    quiz: [
      { pregunta: "Which vessel carries blood from the heart to the lungs?", opciones: ["The pulmonary artery", "The pulmonary vein", "The aorta", "The vena cava"], respuesta: 0, explicacion: "It leaves the heart: it's an artery, even though it carries oxygen-poor blood." },
      { pregunta: "What makes a vessel a vein?", opciones: ["That it carries blood toward the heart", "That it carries oxygen-poor blood", "That it's thin", "That it's blue"], respuesta: 0, explicacion: "The rule is the direction of flow." },
    ],
    visuales: ["The path of blood through the heart"],
  },
  "vitalia-digestion-por-estaciones": {
    nombre: "Digestion, station by station",
    descripcion: "Mouth: starch. Stomach: proteins. Small intestine: everything, and it's absorbed.",
    pasos: [
      "**Mouth**: food is chewed and the **amylase** in saliva starts breaking down **starch**.",
      "**Stomach**: acid and **pepsin** break down **proteins**.",
      "**Small intestine**: with bile and the enzymes from the pancreas, everything finishes being digested (fats too, with **lipase**), and the nutrients **are absorbed** into the blood.",
      "**Large intestine**: water is recovered.",
    ],
    quiz: [
      { pregunta: "Where does the digestion of starch begin?", opciones: ["In the mouth", "In the stomach", "In the large intestine", "In the liver"], respuesta: 0, explicacion: "The amylase in saliva starts breaking it down." },
      { pregunta: "Where are most of the nutrients absorbed?", opciones: ["In the small intestine", "In the stomach", "In the mouth", "In the esophagus"], respuesta: 0, explicacion: "Its villi pass them into the blood." },
    ],
    visuales: ["Station by station"],
  },
  "vitalia-insulina-baja-glucagon-sube": {
    nombre: "Insulin lowers, glucagon raises",
    descripcion: "So you never mix them up.",
    pasos: [
      "Both come from the **pancreas** and control the sugar (glucose) in the blood.",
      "**Insulin**: after eating, glucose goes up; insulin makes the cells take it in and **lowers it**.",
      "**Glucagon**: when fasting, glucose goes down; glucagon makes the liver release it and **raises it**.",
      "Trick: **glu**cagon brings **glu**cose back. In diabetes insulin fails and glucose stays high.",
    ],
    quiz: [
      { pregunta: "You just ate and your glucose went up. Which hormone lowers it?", opciones: ["Insulin", "Glucagon", "Adrenaline", "Thyroxine"], respuesta: 0, explicacion: "Insulin makes the cells take in glucose." },
      { pregunta: "Which organ produces insulin and glucagon?", opciones: ["The pancreas", "The liver", "The stomach", "The kidney"], respuesta: 0, explicacion: "Both hormones come from the pancreas." },
    ],
    visuales: ["Up, down: the pancreas corrects it"],
  },
  "vitalia-innata-o-adquirida": {
    nombre: "Innate or acquired",
    descripcion: "Fast and general, or slow and with memory.",
    pasos: [
      "**Innate immunity**: you're born with it, it acts fast and against any invader. Skin, mucous membranes, fever, inflammation and white blood cells that \"eat\" microbes.",
      "**Acquired immunity**: it takes longer the first time, but it's **specific** (antibodies made to fit each microbe) and it has **memory**.",
      "Thanks to memory, the second time the response is fast and strong. That's what **vaccines** take advantage of.",
    ],
    quiz: [
      { pregunta: "Which type of defense has memory?", opciones: ["Acquired", "Innate", "The skin", "Fever"], respuesta: 0, explicacion: "Memory lymphocytes remember the microbe." },
      { pregunta: "Skin that keeps microbes out is part of which immunity?", opciones: ["Innate", "Acquired", "Artificial", "Vaccine"], respuesta: 0, explicacion: "It's a general barrier you're born with." },
    ],
    visuales: ["First the innate one; then, the antibodies"],
  },
  "vitalia-reino-en-3-preguntas": {
    nombre: "The kingdom in 3 questions",
    descripcion: "Does it have a nucleus? Does it have a wall? Does it make its own food?",
    pasos: [
      "1) Does it have a **nucleus**? If not: **Monera** (bacteria).",
      "2) If it has a nucleus and is **a single cell** (almost always): **Protists**, like the amoeba or the paramecium.",
      "3) Multicellular **with a wall that makes its own food** (photosynthesis): **Plants**. With a chitin wall that **absorbs** its food: **Fungi**.",
      "4) Multicellular **with no wall** that **eats** other living things: **Animals**.",
    ],
    quiz: [
      { pregunta: "A multicellular being, with a chitin wall, that absorbs its food. Which kingdom is it?", opciones: ["Fungi", "Plants", "Animals", "Protists"], respuesta: 0, explicacion: "A chitin wall and feeding by absorption: a fungus." },
      { pregunta: "A living thing with no nucleus. Which kingdom does it belong to?", opciones: ["Monera", "Protists", "Fungi", "Animals"], respuesta: 0, explicacion: "Without a nucleus it's a prokaryote: a bacterium." },
    ],
    visuales: ["Each one to its kingdom"],
  },
  "vitalia-vertebrados-por-la-piel": {
    nombre: "Vertebrates by their skin",
    descripcion: "Hair, feathers, dry scales, wet scales or bare skin.",
    pasos: [
      "To classify a vertebrate, look at its skin:",
      "**Hair**: mammal. **Feathers**: bird. **Dry scales**: reptile.",
      "**Scales** with gills in the water: fish. **Bare, moist skin**: amphibian.",
      "Watch out for tricks: whales and dolphins are mammals (they breathe air and give milk), and the penguin is a bird.",
    ],
    quiz: [
      { pregunta: "An animal with bare, moist skin that's born in water. What is it?", opciones: ["Amphibian", "Reptile", "Fish", "Mammal"], respuesta: 0, explicacion: "Bare, moist skin: an amphibian, like the frog." },
      { pregunta: "Which class does the dolphin belong to?", opciones: ["Mammals", "Fish", "Amphibians", "Reptiles"], respuesta: 0, explicacion: "It breathes air, has hair at birth and nurses its young." },
    ],
    visuales: ["The 5 classes of vertebrates"],
  },
  "vitalia-plantas-vasos-semillas-flores": {
    nombre: "Plants: vessels, seeds, flowers",
    descripcion: "Each group adds something new.",
    pasos: [
      "**Mosses** (bryophytes): no vessels; that's why they're short and live in damp places.",
      "**Ferns**: they add **vessels** that carry water; they grow taller, but they reproduce by spores, without seeds.",
      "**Gymnosperms** (pines): they add the **seed**, naked, in cones.",
      "**Angiosperms**: they add **flower and fruit**, which protects the seed. They're most of the plants.",
    ],
    quiz: [
      { pregunta: "A plant has vessels but reproduces by spores, without seeds. Which group is it?", opciones: ["Ferns", "Mosses", "Gymnosperms", "Angiosperms"], respuesta: 0, explicacion: "Vessels without seeds: ferns." },
      { pregunta: "What do angiosperms have that pines don't?", opciones: ["Flowers and fruits", "Seeds", "Vessels", "Roots"], respuesta: 0, explicacion: "The pine has naked seeds in cones; angiosperms, inside a fruit." },
    ],
    visuales: ["From mosses to flowers"],
  },
  "vitalia-dona-reina-fue": {
    nombre: "\"Dear King Philip Came Over For Good Soup\"",
    descripcion: "The order of the ranks, from the biggest to the smallest.",
    pasos: [
      "The ranks for classifying go from the broadest to the most specific: **D**omain, **K**ingdom, **P**hylum, **C**lass, **O**rder, **F**amily, **G**enus, **S**pecies.",
      "The sentence \"**D**ear **K**ing **P**hilip **C**ame **O**ver **F**or **G**ood **S**oup\" has the same initials.",
      "The lower you go, the more alike the beings that share that rank: all mammals share a class; only dogs share a species.",
    ],
    quiz: [
      { pregunta: "Which rank comes right after \"Class\"?", opciones: ["Order", "Family", "Phylum", "Genus"], respuesta: 0, explicacion: "Dear King Philip Came **O**ver…" },
      { pregunta: "Which is the most specific rank?", opciones: ["Species", "Genus", "Kingdom", "Domain"], respuesta: 0, explicacion: "It's the last one: only beings that can reproduce with each other." },
    ],
    visuales: ["The human being, from domain to species"],
  },
  "vitalia-nombre-cientifico": {
    nombre: "Writing a scientific name",
    descripcion: "Genus capitalized, species lowercase, in italics.",
    pasos: [
      "Each species has a **two-word** name in Latin, the same all over the world (Linnaeus came up with it).",
      "The first word is the **genus**, **capitalized**; the second, the **species**, in **lowercase**.",
      "It's written in **italics** (or underlined by hand): *Homo sapiens*, *Panthera leo*.",
      "Typical mistakes: *Panthera Leo* (species capitalized), *panthera leo* (genus in lowercase).",
    ],
    quiz: [
      { pregunta: "Which one is written correctly?", opciones: ["Canis familiaris", "canis familiaris", "Canis Familiaris", "CANIS FAMILIARIS"], respuesta: 0, explicacion: "Genus capitalized and species in lowercase." },
      { pregunta: "In *Quercus robur*, what is \"Quercus\"?", opciones: ["The genus", "The species", "The family", "The kingdom"], respuesta: 0, explicacion: "The first word is the genus." },
    ],
    visuales: ["Genus and species are the last two steps"],
  },
  "vitalia-cadena-en-3-eslabones": {
    nombre: "The chain in 3 links",
    descripcion: "Producer, primary consumer, secondary consumer.",
    pasos: [
      "A **food chain** shows who eats whom. The arrow points to the one that eats.",
      "It always starts with a **producer**: a plant or an alga that makes its food with light.",
      "Then come the **consumers**: primary (eats plants, herbivore), secondary (eats herbivores) and tertiary.",
      "**Decomposers** (fungi and bacteria) recycle everyone's remains.",
    ],
    quiz: [
      { pregunta: "In grass → cow → human, what is the cow?", opciones: ["Primary consumer", "Producer", "Secondary consumer", "Decomposer"], respuesta: 0, explicacion: "It eats the producer: it's an herbivore." },
      { pregunta: "What does a food chain always start with?", opciones: ["A producer", "A carnivore", "A decomposer", "An herbivore"], respuesta: 0, explicacion: "Energy enters through the ones that do photosynthesis." },
    ],
    visuales: ["Each link eats the one below"],
  },
  "vitalia-regla-del-10": {
    nombre: "The 10% rule",
    descripcion: "Each level gets only 10% of the energy of the one before.",
    pasos: [
      "At each step of the chain, most of the energy is spent on living (moving, breathing) and is lost as heat.",
      "The next level gets, roughly, **10%**.",
      "If the grass has $10\\,000$ kcal, the rabbits get $1000$, the foxes $100$ and the eagle $10$.",
      "That's why there are many plants, fewer herbivores and few predators: the pyramid narrows toward the top.",
    ],
    quiz: [
      { pregunta: "The plants in a field have $50\\,000$ kcal. How much reaches the herbivores?", opciones: ["5000 kcal", "500 kcal", "50,000 kcal", "45,000 kcal"], respuesta: 0, explicacion: "10% of $50\\,000$ is $5000$." },
      { pregunta: "Why are there fewer predators than herbivores?", opciones: ["Much less energy reaches them", "They eat less", "They live longer", "They don't need energy"], respuesta: 0, explicacion: "Only 10% passes from one level to the next." },
    ],
    visuales: ["Each level gets 10% of the one before"],
  },
  "vitalia-relaciones-quien-gana": {
    nombre: "Relationships by \"who wins\"",
    descripcion: "Win-win, win-lose, win-nothing, lose-lose.",
    pasos: [
      "To name a relationship between two species, ask who wins and who loses.",
      "**Mutualism** (win-win): the bee and the flower. **Predation** (win-lose, one dies): the lion and the zebra.",
      "**Parasitism** (win-lose, the other stays alive): the tick and the dog. **Commensalism** (win-nothing): the remora and the shark.",
      "**Competition** (both lose): two lions after the same prey.",
    ],
    quiz: [
      { pregunta: "A louse lives on a person's head and feeds on their blood. What relationship is it?", opciones: ["Parasitism", "Mutualism", "Commensalism", "Predation"], respuesta: 0, explicacion: "One wins and the other loses, but stays alive." },
      { pregunta: "Clownfish live in the anemone and clean it; it protects them. What relationship is it?", opciones: ["Mutualism", "Parasitism", "Competition", "Commensalism"], respuesta: 0, explicacion: "Both win." },
    ],
    visuales: ["Bee and flower", "Lion and zebra", "Tick and dog", "Remora and shark", "Two lions, one prey"],
  },
  "vitalia-ciclo-del-carbono": {
    nombre: "The carbon cycle in 4 arrows",
    descripcion: "Photosynthesis takes it out of the air; respiration, decomposition and combustion return it.",
    pasos: [
      "Carbon goes around between the air (as $CO_2$) and living things.",
      "1) **Photosynthesis** takes $CO_2$ out of the air and turns it into glucose.",
      "2) The **respiration** of all living things returns it to the air. 3) **Decomposers** do too, when they break down remains.",
      "4) The **combustion** of oil, coal and gas releases carbon that was stored for millions of years: that's why the $CO_2$ in the air is increasing.",
    ],
    quiz: [
      { pregunta: "Which process takes carbon dioxide out of the air?", opciones: ["Photosynthesis", "Respiration", "Combustion", "Decomposition"], respuesta: 0, explicacion: "Plants take in $CO_2$ to make glucose." },
      { pregunta: "Which human activity increases the $CO_2$ in the air?", opciones: ["Burning oil and coal", "Planting trees", "Making compost", "Saving water"], respuesta: 0, explicacion: "Combustion releases carbon that was stored underground." },
    ],
    visuales: ["Carbon enters through photosynthesis and leaves through respiration"],
  },
  ...VITALIA_CLASES_EN,
};
