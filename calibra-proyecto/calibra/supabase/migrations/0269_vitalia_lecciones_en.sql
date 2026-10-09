-- ============================================================
-- Prodigia — vitalia: lecciones de Aprender en inglés (60 lecciones).
-- Requiere 0225_lecciones_en_columnas.sql.
--
-- Llena nombre_en, descripcion_en y contenido_en de cada lección (Técnicas y Clases).
-- contenido_en = el contenido en español con `pasos`, `quiz` y `visuales` reemplazados
-- por su versión en inglés (misma forma, mismas preguntas y mismas posiciones de la
-- respuesta correcta): lo que no se traduce (ids, programas, símbolos) queda igual.
-- Solo UPDATE por slug; no toca progreso ni el contenido en español.
--
-- Este archivo se GENERA desde src/lib/i18n-lecciones/en/vitalia.ts y el test
-- src/lib/i18n-lecciones/traducciones.test.ts comprueba que coincida. No editar a
-- mano. Regenerar: I18N_LECCIONES_ESCRIBIR_SQL=1 npx vitest run src/lib/i18n-lecciones
-- (0269)
-- ============================================================

update public.techniques
set nombre_en = 'Animal or plant in 3 clues',
    descripcion_en = 'A wall, chloroplasts and a big vacuole: it''s a plant cell.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Animal and plant cells share almost everything: membrane, nucleus, mitochondria, ribosomes, endoplasmic reticulum and Golgi.","To tell them apart, look for three clues. 1) A rigid **cell wall** outside the membrane. 2) Green **chloroplasts**.","3) A huge **vacuole** in the center, which pushes everything else against the edges.","If you see all three, it's a plant cell. If it's rounded, with no wall or chloroplasts and with tiny vacuoles, it's an animal cell."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A cell has a cell wall and chloroplasts. What is it?","opciones":["A plant cell","An animal cell","A bacterium","A virus"],"respuesta":"A plant cell","explicacion":"A wall and chloroplasts are clues of a plant cell."},{"pregunta":"Which of these parts does an animal cell have?","opciones":["Mitochondria","Cell wall","Chloroplasts","A huge central vacuole"],"respuesta":"Mitochondria","explicacion":"Mitochondria are in animals and plants; the other three belong to the plant cell."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.celula","variante":"vegetal","organelos":["pared","cloroplasto","vacuola"],"titulo":"The three clues of the plant cell"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-animal-o-vegetal';

update public.techniques
set nombre_en = 'Each organelle, a job',
    descripcion_en = 'Think of the cell as a city: each part has a job.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Nucleus**: city hall, it keeps the DNA and gives the orders. **Mitochondrion**: the power plant, it gets energy out of glucose.","**Ribosome**: the protein factory. **Endoplasmic reticulum**: the streets where things are made and transported.","**Golgi apparatus**: the post office, it packs and delivers. **Lysosome**: recycling, it digests what's no longer useful.","**Membrane**: the border, it decides what comes in and what goes out."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which organelle builds proteins?","opciones":["Ribosome","Lysosome","Mitochondrion","Vacuole"],"respuesta":"Ribosome","explicacion":"Ribosomes are the protein factory."},{"pregunta":"Which organelle packs and delivers what the cell makes?","opciones":["Golgi apparatus","Nucleus","Ribosome","Mitochondrion"],"respuesta":"Golgi apparatus","explicacion":"The Golgi works as the cell's post office."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.celula","variante":"animal","titulo":"Each part of the animal cell and its job"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-cada-organelo-un-oficio';

update public.techniques
set nombre_en = 'Osmosis without getting confused',
    descripcion_en = 'Water goes toward where there''s more salt.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["In osmosis, what moves is **water**, through the membrane. Salt can't get through.","One rule: **water goes toward where there's more salt** (more solutes), as if to dilute it.","**Hypotonic** medium (less salt outside): water goes in and the cell swells. **Hypertonic** medium (more salt outside): water goes out and the cell shrivels.","That's why salted vegetables release water, and a raisin in water swells up."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"You put a red blood cell in very salty water. What happens to it?","opciones":["It loses water and shrivels","It swells and may burst","It stays the same","It absorbs the salt"],"respuesta":"It loses water and shrivels","explicacion":"There's more salt outside: water leaves the cell."},{"pregunta":"In osmosis, what crosses the membrane?","opciones":["Water","Salt","Proteins","The nucleus"],"respuesta":"Water","explicacion":"Osmosis is the movement of water toward where there are more solutes."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.membrana","modo":"osmosis","medio":"hipertonico","titulo":"More salt outside: water goes out"},{"tipo":"vitalia.membrana","modo":"osmosis","medio":"hipotonico","titulo":"Less salt outside: water goes in"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-osmosis-sin-confundirse';

update public.techniques
set nombre_en = 'Biomolecules by their building block',
    descripcion_en = 'Glucose: carbohydrates. Amino acid: proteins. Nucleotide: DNA.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The four big families of the molecules of life are built from repeated pieces, like a wall made of bricks.","**Carbohydrates** (starch, cellulose): their brick is **glucose**. **Proteins**: their brick is the **amino acid**.","**Nucleic acids** (DNA, RNA): their brick is the **nucleotide**. **Lipids** (fats): fatty acids and glycerol.","Trick: if you're told the brick, you already know the family."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What is the building block of proteins?","opciones":["The amino acid","Glucose","The nucleotide","The fatty acid"],"respuesta":"The amino acid","explicacion":"Proteins are chains of amino acids."},{"pregunta":"Starch is made of many glucose units. What is it?","opciones":["A carbohydrate","A protein","A lipid","A nucleic acid"],"respuesta":"A carbohydrate","explicacion":"Carbohydrates are built from sugars like glucose."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","cuadros":[{"texto":"Glucose + glucose + glucose…","resaltar":"Carbohidratos (almidón, celulosa)"},{"texto":"Amino acid + amino acid + …","resaltar":"Proteínas"},{"texto":"Nucleotide + nucleotide + …","resaltar":"ADN y ARN"},{"texto":"Fatty acids + glycerol","resaltar":"Lípidos (grasas y aceites)"}]}]$leccion_en$::jsonb
    )
where slug = 'vitalia-biomoleculas-por-su-ladrillo';

update public.techniques
set nombre_en = 'Photosynthesis and respiration are mirror images',
    descripcion_en = 'What one takes in, the other gives out.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Photosynthesis**: $6\\,CO_2 + 6\\,H_2O + \\text{light} \\to C_6H_{12}O_6 + 6\\,O_2$. It happens in the chloroplast.","**Cellular respiration**: $C_6H_{12}O_6 + 6\\,O_2 \\to 6\\,CO_2 + 6\\,H_2O + \\text{ATP}$. It happens in the mitochondrion.","It's the same equation turned around: the products of one are the ingredients of the other.","Careful: plants do both. Photosynthesis during the day; respiration, all the time."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which gas do plants give off when they do photosynthesis?","opciones":["Oxygen","Carbon dioxide","Nitrogen","Hydrogen"],"respuesta":"Oxygen","explicacion":"Photosynthesis produces glucose and $O_2$."},{"pregunta":"What does cellular respiration produce for the cell to use?","opciones":["ATP","Glucose","Oxygen","Light"],"respuesta":"ATP","explicacion":"Respiration gets the energy out of glucose in the form of ATP."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.energia","modo":"ciclo","titulo":"The cycle closes between chloroplast and mitochondrion"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-fotosintesis-y-respiracion-espejo';

update public.techniques
set nombre_en = 'PMAT: the order of mitosis',
    descripcion_en = 'Prophase, metaphase, anaphase, telophase.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The four phases of mitosis, in order: **P**rophase, **M**etaphase, **A**naphase, **T**elophase. \"PMAT\".","**Prophase**: the chromosomes condense. **Metaphase**: they line up in the **M**iddle.","**Anaphase**: the chromatids move **A**part toward the poles. **Telophase**: two nuclei form and the cell divides.","Before all of it comes **interphase**, when the cell grows and copies its DNA."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"In which phase do the chromosomes line up in the middle of the cell?","opciones":["Metaphase","Prophase","Anaphase","Telophase"],"respuesta":"Metaphase","explicacion":"Metaphase: M for Middle."},{"pregunta":"Which phase comes right after metaphase?","opciones":["Anaphase","Prophase","Telophase","Interphase"],"respuesta":"Anaphase","explicacion":"PMAT: after the M comes the A."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.division","modo":"mitosis","dosN":4,"titulo":"The four phases, one by one"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-pmat-mitosis';

update public.techniques
set nombre_en = 'Counting chromosomes',
    descripcion_en = 'Mitosis keeps 2n; meiosis leaves n.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Body cells have their chromosomes in pairs: **2n**. In humans, $2n = 46$.","**Mitosis** (growing, repairing): you get **2** cells identical to the mother cell, with **2n**. Humans: $46 \\to 46$.","**Meiosis** (making gametes): you get **4** cells with half, **n**. Humans: $46 \\to 23$.","When an egg ($n$) and a sperm ($n$) join, you're back to $2n$: $23 + 23 = 46$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A dog has $2n = 78$. How many chromosomes does a female dog's egg have?","opciones":["39","78","156","19"],"respuesta":"39","explicacion":"Gametes have $n$: half, 39."},{"pregunta":"A human skin cell ($46$) does mitosis. How many chromosomes does each daughter cell have?","opciones":["46","23","92","12"],"respuesta":"46","explicacion":"Mitosis keeps the number: $2n = 46$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.division","modo":"meiosis","dosN":4,"titulo":"Meiosis: from $2n$ to four $n$ cells"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-contar-cromosomas';

update public.techniques
set nombre_en = 'With oxygen or without?',
    descripcion_en = 'Respiration: about 36 ATP. Fermentation: 2 ATP.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The cell gets energy out of glucose in two ways, depending on whether there's oxygen or not.","**With oxygen** (aerobic respiration, in the mitochondrion): about **36 ATP** per glucose, and $CO_2$ and water come out.","**Without oxygen** (fermentation, in the cytoplasm): only **2 ATP**. Lactic acid comes out (tired muscle, yogurt) or alcohol and $CO_2$ (bread, beer).","That's why respiration is about 18 times more efficient."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A muscle works so hard that it runs short of oxygen. What does it do?","opciones":["Lactic fermentation","Photosynthesis","Alcoholic fermentation","It stops using glucose"],"respuesta":"Lactic fermentation","explicacion":"Without oxygen, the muscle ferments and produces lactic acid."},{"pregunta":"How many ATP does fermentation give for each glucose?","opciones":["2","36","6","0"],"respuesta":"2","explicacion":"Only 2 ATP, against about 36 from respiration."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.energia","modo":"respiracion","titulo":"With oxygen: about 36 ATP"},{"tipo":"vitalia.energia","modo":"fermentacion","titulo":"Without oxygen: 2 ATP"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-con-oxigeno-o-sin';

update public.techniques
set nombre_en = 'The complementary strand in a flash',
    descripcion_en = 'A with T, G with C; in RNA, A with U.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["In DNA the bases always pair the same way: **A with T** and **G with C**.","To write the complementary strand, swap letter by letter: $ATGC \\to TACG$.","When going to **RNA** (transcription) there's no T: **A** pairs with **U**. So, $TACG \\to AUGC$.","Trick: \"**A**pples in the **T**ree, **C**ar in the **G**arage\", and in RNA the T is swapped for U."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What is the complementary DNA strand of $AATGC$?","opciones":["TTACG","UUACG","AATGC","GCATT"],"respuesta":"TTACG","explicacion":"A→T, A→T, T→A, G→C, C→G."},{"pregunta":"What messenger RNA comes from transcribing $TACG$?","opciones":["AUGC","ATGC","UACG","TACG"],"respuesta":"AUGC","explicacion":"T→A, A→U, C→G, G→C."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.adn","modo":"replicacion","hebra":"ATGCCA","titulo":"Each base with its partner"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-hebra-complementaria';

update public.techniques
set nombre_en = 'Punnett in 30 seconds',
    descripcion_en = 'Set up the square, fill in the boxes and count them.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["1) Separate each parent's alleles: $Aa$ gives gametes $A$ and $a$.","2) Put one parent's on top and the other's on the left. 3) Each box combines the letter of its row with the one of its column.","4) Count: $Aa \\times Aa$ gives $AA$, $Aa$, $Aa$, $aa$. Phenotypes: 3 with the dominant trait and 1 recessive: **3 : 1**.","Each box is worth 25%: $aa$ shows up in 25% of cases."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"You cross $Aa \\times aa$. What percentage of the offspring is $aa$?","opciones":["50 %","25 %","75 %","0 %"],"respuesta":"50 %","explicacion":"Boxes: $Aa$, $Aa$, $aa$, $aa$: 2 out of 4."},{"pregunta":"You cross $AA \\times aa$. What are all the offspring like?","opciones":["Aa","AA","aa","Half AA and half aa"],"respuesta":"Aa","explicacion":"One parent only gives $A$ and the other only $a$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.punnett","padre1":"Aa","padre2":"Aa","titulo":"$Aa \\times Aa$: 3 : 1"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-punnett-30-segundos';

update public.techniques
set nombre_en = '9:3:3:1 without drawing 16 boxes',
    descripcion_en = 'Multiply the probabilities of each trait.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["With two genes inherited separately, each one follows its own 3 : 1.","For $AaBb \\times AaBb$: the chance of dominant in A is $\\tfrac{3}{4}$ and in B it's also $\\tfrac{3}{4}$.","Multiply: dominant in both, $\\tfrac{3}{4} \\cdot \\tfrac{3}{4} = \\tfrac{9}{16}$; only one dominant, $\\tfrac{3}{16}$ each case; both recessive, $\\tfrac{1}{4} \\cdot \\tfrac{1}{4} = \\tfrac{1}{16}$.","There's the **9 : 3 : 3 : 1** without drawing the 16-box square."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"In $AaBb \\times AaBb$, what fraction comes out $aabb$?","opciones":["1/16","1/4","9/16","3/16"],"respuesta":"1/16","explicacion":"$\\tfrac{1}{4} \\cdot \\tfrac{1}{4} = \\tfrac{1}{16}$."},{"pregunta":"In the same cross, what fraction shows both dominant traits?","opciones":["9/16","3/16","1/16","3/4"],"respuesta":"9/16","explicacion":"$\\tfrac{3}{4} \\cdot \\tfrac{3}{4} = \\tfrac{9}{16}$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.punnett","padre1":"AaBb","padre2":"AaBb","titulo":"The 16 boxes confirm 9 : 3 : 3 : 1"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-9331-sin-16-casillas';

update public.techniques
set nombre_en = 'Chargaff in one step',
    descripcion_en = 'A = T and G = C; the four add up to 100%.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Since A always pairs with T, in double-stranded DNA there's **as much A as T**. And as much G as C.","The four add up to 100%. If you're given one, you can work out all of them.","Example: 20% A. Then T = 20%, and 60% is left for G and C together: **30% each**."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A DNA molecule has 35% G. What percentage of A does it have?","opciones":["15 %","35 %","65 %","30 %"],"respuesta":"15 %","explicacion":"C = 35%; G + C = 70%; 30% is left for A and T: 15% each."},{"pregunta":"A DNA molecule has 28% T. How much A does it have?","opciones":["28 %","22 %","72 %","44 %"],"respuesta":"28 %","explicacion":"A = T, always."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.adn","modo":"replicacion","hebra":"AGCTTA","titulo":"Each A has its T; each G, its C"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-chargaff';

update public.techniques
set nombre_en = 'Reading the codon table',
    descripcion_en = 'First letter on the left, second on top, third on the right.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The ribosome reads messenger RNA **three letters at a time**: each triplet is a **codon**, and each codon specifies an amino acid.","In the table: the **first letter** picks the big row (left); the **second**, the column (top); the **third**, the line inside the box (right).","$AUG$ is Met and it also marks the **start**. $UAA$, $UAG$ and $UGA$ are **stop**: that's where the protein ends.","Example: $AUG\\text{-}CCU\\text{-}GUU \\to$ Met-Pro-Val."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"How many RNA letters make up a codon?","opciones":["3","1","2","4"],"respuesta":"3","explicacion":"A codon is a triplet of bases."},{"pregunta":"What does the codon $UAA$ do?","opciones":["Ends the protein","Starts the protein","Codes for methionine","Nothing"],"respuesta":"Ends the protein","explicacion":"$UAA$ is a stop codon."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.adn","modo":"traduccion","hebra":"AUGCCUGUU","titulo":"Three letters at a time: one amino acid per codon"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-tabla-de-codones';

update public.techniques
set nombre_en = 'Arteries go out, veins come back',
    descripcion_en = 'The heart rule, with the exception of the lungs.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Arteries**: carry blood **away from** the heart. **Veins**: bring it back **to** the heart. The rule is the direction, not the color.","Almost always, arteries carry oxygen-rich blood and veins oxygen-poor blood.","Exception: the **pulmonary artery** leaves the heart toward the lungs **without** oxygen, and the **pulmonary veins** come back **with** oxygen.","Trick: \"**A**rtery = **A**way from the heart\"."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which vessel carries blood from the heart to the lungs?","opciones":["The pulmonary artery","The pulmonary vein","The aorta","The vena cava"],"respuesta":"The pulmonary artery","explicacion":"It leaves the heart: it's an artery, even though it carries oxygen-poor blood."},{"pregunta":"What makes a vessel a vein?","opciones":["That it carries blood toward the heart","That it carries oxygen-poor blood","That it's thin","That it's blue"],"respuesta":"That it carries blood toward the heart","explicacion":"The rule is the direction of flow."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.recorrido","sistema":"circulatorio","titulo":"The path of blood through the heart"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-arterias-salen-venas-vuelven';

update public.techniques
set nombre_en = 'Digestion, station by station',
    descripcion_en = 'Mouth: starch. Stomach: proteins. Small intestine: everything, and it''s absorbed.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Mouth**: food is chewed and the **amylase** in saliva starts breaking down **starch**.","**Stomach**: acid and **pepsin** break down **proteins**.","**Small intestine**: with bile and the enzymes from the pancreas, everything finishes being digested (fats too, with **lipase**), and the nutrients **are absorbed** into the blood.","**Large intestine**: water is recovered."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Where does the digestion of starch begin?","opciones":["In the mouth","In the stomach","In the large intestine","In the liver"],"respuesta":"In the mouth","explicacion":"The amylase in saliva starts breaking it down."},{"pregunta":"Where are most of the nutrients absorbed?","opciones":["In the small intestine","In the stomach","In the mouth","In the esophagus"],"respuesta":"In the small intestine","explicacion":"Its villi pass them into the blood."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.recorrido","sistema":"digestivo","titulo":"Station by station"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-digestion-por-estaciones';

update public.techniques
set nombre_en = 'Insulin lowers, glucagon raises',
    descripcion_en = 'So you never mix them up.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Both come from the **pancreas** and control the sugar (glucose) in the blood.","**Insulin**: after eating, glucose goes up; insulin makes the cells take it in and **lowers it**.","**Glucagon**: when fasting, glucose goes down; glucagon makes the liver release it and **raises it**.","Trick: **glu**cagon brings **glu**cose back. In diabetes insulin fails and glucose stays high."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"You just ate and your glucose went up. Which hormone lowers it?","opciones":["Insulin","Glucagon","Adrenaline","Thyroxine"],"respuesta":"Insulin","explicacion":"Insulin makes the cells take in glucose."},{"pregunta":"Which organ produces insulin and glucagon?","opciones":["The pancreas","The liver","The stomach","The kidney"],"respuesta":"The pancreas","explicacion":"Both hormones come from the pancreas."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.hormona","modo":"glucosa","titulo":"Up, down: the pancreas corrects it"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-insulina-baja-glucagon-sube';

update public.techniques
set nombre_en = 'Innate or acquired',
    descripcion_en = 'Fast and general, or slow and with memory.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Innate immunity**: you're born with it, it acts fast and against any invader. Skin, mucous membranes, fever, inflammation and white blood cells that \"eat\" microbes.","**Acquired immunity**: it takes longer the first time, but it's **specific** (antibodies made to fit each microbe) and it has **memory**.","Thanks to memory, the second time the response is fast and strong. That's what **vaccines** take advantage of."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which type of defense has memory?","opciones":["Acquired","Innate","The skin","Fever"],"respuesta":"Acquired","explicacion":"Memory lymphocytes remember the microbe."},{"pregunta":"Skin that keeps microbes out is part of which immunity?","opciones":["Innate","Acquired","Artificial","Vaccine"],"respuesta":"Innate","explicacion":"It's a general barrier you're born with."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.defensa","modo":"respuesta","titulo":"First the innate one; then, the antibodies"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-innata-o-adquirida';

update public.techniques
set nombre_en = 'The kingdom in 3 questions',
    descripcion_en = 'Does it have a nucleus? Does it have a wall? Does it make its own food?',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["1) Does it have a **nucleus**? If not: **Monera** (bacteria).","2) If it has a nucleus and is **a single cell** (almost always): **Protists**, like the amoeba or the paramecium.","3) Multicellular **with a wall that makes its own food** (photosynthesis): **Plants**. With a chitin wall that **absorbs** its food: **Fungi**.","4) Multicellular **with no wall** that **eats** other living things: **Animals**."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A multicellular being, with a chitin wall, that absorbs its food. Which kingdom is it?","opciones":["Fungi","Plants","Animals","Protists"],"respuesta":"Fungi","explicacion":"A chitin wall and feeding by absorption: a fungus."},{"pregunta":"A living thing with no nucleus. Which kingdom does it belong to?","opciones":["Monera","Protists","Fungi","Animals"],"respuesta":"Monera","explicacion":"Without a nucleus it's a prokaryote: a bacterium."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.reinos","modo":"reinos","titulo":"Each one to its kingdom"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-reino-en-3-preguntas';

update public.techniques
set nombre_en = 'Vertebrates by their skin',
    descripcion_en = 'Hair, feathers, dry scales, wet scales or bare skin.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["To classify a vertebrate, look at its skin:","**Hair**: mammal. **Feathers**: bird. **Dry scales**: reptile.","**Scales** with gills in the water: fish. **Bare, moist skin**: amphibian.","Watch out for tricks: whales and dolphins are mammals (they breathe air and give milk), and the penguin is a bird."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"An animal with bare, moist skin that's born in water. What is it?","opciones":["Amphibian","Reptile","Fish","Mammal"],"respuesta":"Amphibian","explicacion":"Bare, moist skin: an amphibian, like the frog."},{"pregunta":"Which class does the dolphin belong to?","opciones":["Mammals","Fish","Amphibians","Reptiles"],"respuesta":"Mammals","explicacion":"It breathes air, has hair at birth and nurses its young."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.reinos","modo":"vertebrados","titulo":"The 5 classes of vertebrates"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-vertebrados-por-la-piel';

update public.techniques
set nombre_en = 'Plants: vessels, seeds, flowers',
    descripcion_en = 'Each group adds something new.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Mosses** (bryophytes): no vessels; that's why they're short and live in damp places.","**Ferns**: they add **vessels** that carry water; they grow taller, but they reproduce by spores, without seeds.","**Gymnosperms** (pines): they add the **seed**, naked, in cones.","**Angiosperms**: they add **flower and fruit**, which protects the seed. They're most of the plants."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A plant has vessels but reproduces by spores, without seeds. Which group is it?","opciones":["Ferns","Mosses","Gymnosperms","Angiosperms"],"respuesta":"Ferns","explicacion":"Vessels without seeds: ferns."},{"pregunta":"What do angiosperms have that pines don't?","opciones":["Flowers and fruits","Seeds","Vessels","Roots"],"respuesta":"Flowers and fruits","explicacion":"The pine has naked seeds in cones; angiosperms, inside a fruit."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.plantas","titulo":"From mosses to flowers"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-plantas-vasos-semillas-flores';

update public.techniques
set nombre_en = '"Dear King Philip Came Over For Good Soup"',
    descripcion_en = 'The order of the ranks, from the biggest to the smallest.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The ranks for classifying go from the broadest to the most specific: **D**omain, **K**ingdom, **P**hylum, **C**lass, **O**rder, **F**amily, **G**enus, **S**pecies.","The sentence \"**D**ear **K**ing **P**hilip **C**ame **O**ver **F**or **G**ood **S**oup\" has the same initials.","The lower you go, the more alike the beings that share that rank: all mammals share a class; only dogs share a species."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which rank comes right after \"Class\"?","opciones":["Order","Family","Phylum","Genus"],"respuesta":"Order","explicacion":"Dear King Philip Came **O**ver…"},{"pregunta":"Which is the most specific rank?","opciones":["Species","Genus","Kingdom","Domain"],"respuesta":"Species","explicacion":"It's the last one: only beings that can reproduce with each other."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.arbol","ejemplo":"humano","titulo":"The human being, from domain to species"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-dona-reina-fue';

update public.techniques
set nombre_en = 'Writing a scientific name',
    descripcion_en = 'Genus capitalized, species lowercase, in italics.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Each species has a **two-word** name in Latin, the same all over the world (Linnaeus came up with it).","The first word is the **genus**, **capitalized**; the second, the **species**, in **lowercase**.","It's written in **italics** (or underlined by hand): *Homo sapiens*, *Panthera leo*.","Typical mistakes: *Panthera Leo* (species capitalized), *panthera leo* (genus in lowercase)."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which one is written correctly?","opciones":["Canis familiaris","canis familiaris","Canis Familiaris","CANIS FAMILIARIS"],"respuesta":"Canis familiaris","explicacion":"Genus capitalized and species in lowercase."},{"pregunta":"In *Quercus robur*, what is \"Quercus\"?","opciones":["The genus","The species","The family","The kingdom"],"respuesta":"The genus","explicacion":"The first word is the genus."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.arbol","ejemplo":"perro","titulo":"Genus and species are the last two steps"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-nombre-cientifico';

update public.techniques
set nombre_en = 'The chain in 3 links',
    descripcion_en = 'Producer, primary consumer, secondary consumer.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["A **food chain** shows who eats whom. The arrow points to the one that eats.","It always starts with a **producer**: a plant or an alga that makes its food with light.","Then come the **consumers**: primary (eats plants, herbivore), secondary (eats herbivores) and tertiary.","**Decomposers** (fungi and bacteria) recycle everyone's remains."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"In grass → cow → human, what is the cow?","opciones":["Primary consumer","Producer","Secondary consumer","Decomposer"],"respuesta":"Primary consumer","explicacion":"It eats the producer: it's an herbivore."},{"pregunta":"What does a food chain always start with?","opciones":["A producer","A carnivore","A decomposer","An herbivore"],"respuesta":"A producer","explicacion":"Energy enters through the ones that do photosynthesis."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.cadena","eslabones":["Maíz","Saltamontes","Rana","Serpiente"],"titulo":"Each link eats the one below"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-cadena-en-3-eslabones';

update public.techniques
set nombre_en = 'The 10% rule',
    descripcion_en = 'Each level gets only 10% of the energy of the one before.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["At each step of the chain, most of the energy is spent on living (moving, breathing) and is lost as heat.","The next level gets, roughly, **10%**.","If the grass has $10\\,000$ kcal, the rabbits get $1000$, the foxes $100$ and the eagle $10$.","That's why there are many plants, fewer herbivores and few predators: the pyramid narrows toward the top."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"The plants in a field have $50\\,000$ kcal. How much reaches the herbivores?","opciones":["5000 kcal","500 kcal","50,000 kcal","45,000 kcal"],"respuesta":"5000 kcal","explicacion":"10% of $50\\,000$ is $5000$."},{"pregunta":"Why are there fewer predators than herbivores?","opciones":["Much less energy reaches them","They eat less","They live longer","They don't need energy"],"respuesta":"Much less energy reaches them","explicacion":"Only 10% passes from one level to the next."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.cadena","eslabones":["Pasto","Conejo","Zorro","Águila"],"energia":10000,"titulo":"Each level gets 10% of the one before"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-regla-del-10';

update public.techniques
set nombre_en = 'Relationships by "who wins"',
    descripcion_en = 'Win-win, win-lose, win-nothing, lose-lose.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["To name a relationship between two species, ask who wins and who loses.","**Mutualism** (win-win): the bee and the flower. **Predation** (win-lose, one dies): the lion and the zebra.","**Parasitism** (win-lose, the other stays alive): the tick and the dog. **Commensalism** (win-nothing): the remora and the shark.","**Competition** (both lose): two lions after the same prey."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A louse lives on a person's head and feeds on their blood. What relationship is it?","opciones":["Parasitism","Mutualism","Commensalism","Predation"],"respuesta":"Parasitism","explicacion":"One wins and the other loses, but stays alive."},{"pregunta":"Clownfish live in the anemone and clean it; it protects them. What relationship is it?","opciones":["Mutualism","Parasitism","Competition","Commensalism"],"respuesta":"Mutualism","explicacion":"Both win."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","cuadros":[{"texto":"Bee and flower","resaltar":"Mutualismo: ganan los dos"},{"texto":"Lion and zebra","resaltar":"Depredación: uno gana, el otro muere"},{"texto":"Tick and dog","resaltar":"Parasitismo: uno gana, el otro pierde pero vive"},{"texto":"Remora and shark","resaltar":"Comensalismo: uno gana, al otro no le afecta"},{"texto":"Two lions, one prey","resaltar":"Competencia: pierden los dos"}]}]$leccion_en$::jsonb
    )
where slug = 'vitalia-relaciones-quien-gana';

update public.techniques
set nombre_en = 'The carbon cycle in 4 arrows',
    descripcion_en = 'Photosynthesis takes it out of the air; respiration, decomposition and combustion return it.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Carbon goes around between the air (as $CO_2$) and living things.","1) **Photosynthesis** takes $CO_2$ out of the air and turns it into glucose.","2) The **respiration** of all living things returns it to the air. 3) **Decomposers** do too, when they break down remains.","4) The **combustion** of oil, coal and gas releases carbon that was stored for millions of years: that's why the $CO_2$ in the air is increasing."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which process takes carbon dioxide out of the air?","opciones":["Photosynthesis","Respiration","Combustion","Decomposition"],"respuesta":"Photosynthesis","explicacion":"Plants take in $CO_2$ to make glucose."},{"pregunta":"Which human activity increases the $CO_2$ in the air?","opciones":["Burning oil and coal","Planting trees","Making compost","Saving water"],"respuesta":"Burning oil and coal","explicacion":"Combustion releases carbon that was stored underground."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.energia","modo":"ciclo","titulo":"Carbon enters through photosynthesis and leaves through respiration"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-ciclo-del-carbono';

update public.techniques
set nombre_en = 'What is a cell?',
    descripcion_en = 'Cell theory; prokaryotes and eukaryotes.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The **cell** is the smallest unit that is alive: it feeds, grows, responds and reproduces.","**Cell theory**: (1) all living things are made of one or more cells; (2) the cell is the basic unit of life; (3) every cell comes from another cell.","There are two big types. **Prokaryotes** (bacteria): no nucleus, their DNA floats loose in the cytoplasm. They're small and very ancient.","**Eukaryotes** (animals, plants, fungi, protists): they have a **nucleus** with a membrane, and organelles. A **unicellular** being is a single cell; a **multicellular** one, many cells that share the work."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"According to cell theory, where does every cell come from?","opciones":["From another cell","From nonliving matter","From the nucleus","From water"],"respuesta":"From another cell","explicacion":"It's the third principle: every cell comes from another one."},{"pregunta":"What do eukaryotes have that prokaryotes don't?","opciones":["A nucleus with a membrane","DNA","Ribosomes","Plasma membrane"],"respuesta":"A nucleus with a membrane","explicacion":"They all have DNA, ribosomes and a membrane; the nucleus is what sets them apart."},{"pregunta":"A bacterium is…","opciones":["Unicellular and prokaryotic","Multicellular and eukaryotic","Unicellular and eukaryotic","A virus"],"respuesta":"Unicellular and prokaryotic","explicacion":"A single cell, with no nucleus."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.celula","variante":"procariota","titulo":"Prokaryote: no nucleus"},{"tipo":"vitalia.celula","variante":"animal","organelos":["membrana","nucleo","mitocondria"],"titulo":"Eukaryote: nucleus and organelles"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-que-es-una-celula';

update public.techniques
set nombre_en = 'The organelles',
    descripcion_en = 'The structure and job of each one.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Inside the eukaryotic cell, the **cytoplasm** holds organelles, each with a job.","**Nucleus**: keeps the DNA and controls the cell. **Ribosomes**: build proteins following the DNA's instructions.","**Endoplasmic reticulum**: the rough one (with ribosomes) makes proteins; the smooth one, lipids. **Golgi apparatus**: modifies, packs and delivers.","**Mitochondria**: do cellular respiration and produce ATP. **Lysosomes**: digest waste. **Vacuoles**: store water and substances.","A protein made for export takes this trip: ribosome → reticulum → Golgi → membrane → outside."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which organelle produces most of the ATP?","opciones":["Mitochondrion","Ribosome","Golgi","Lysosome"],"respuesta":"Mitochondrion","explicacion":"That's where cellular respiration happens."},{"pregunta":"Which organelle digests what the cell no longer uses?","opciones":["Lysosome","Nucleus","Reticulum","Vacuole"],"respuesta":"Lysosome","explicacion":"It has digestive enzymes."},{"pregunta":"What is the route of a protein that leaves the cell?","opciones":["Ribosome → reticulum → Golgi → membrane","Golgi → ribosome → nucleus","Nucleus → lysosome → membrane","Membrane → Golgi → ribosome"],"respuesta":"Ribosome → reticulum → Golgi → membrane","explicacion":"It's made, transported, packed and sent out."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.celula","variante":"animal","titulo":"The organelles of the animal cell, one by one"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-organelos';

update public.techniques
set nombre_en = 'Animal and plant cells',
    descripcion_en = 'How they''re alike and how they''re not.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**How they're alike**: both are eukaryotic, with a membrane, nucleus, mitochondria, ribosomes, reticulum and Golgi.","**Only the plant cell**: a cellulose wall (rigid shape), **chloroplasts** (photosynthesis) and a big **central vacuole** that keeps it firm.","**Only the animal cell**: a more rounded, flexible shape, clearly visible lysosomes and centrioles.","That's why a plant without water wilts: its vacuole loses water and the cell stops being pressed firmly against the wall."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What is the plant cell wall made of?","opciones":["Cellulose","Chitin","Proteins","Fats"],"respuesta":"Cellulose","explicacion":"Cellulose is a carbohydrate; chitin belongs to fungi."},{"pregunta":"Why does a plant without water wilt?","opciones":["Its vacuoles lose water","It loses its chloroplasts","The wall breaks","It loses the nucleus"],"respuesta":"Its vacuoles lose water","explicacion":"The water-filled vacuole keeps the cell firm."},{"pregunta":"Which of these organelles is in both cells?","opciones":["Mitochondrion","Chloroplast","Cell wall","Central vacuole"],"respuesta":"Mitochondrion","explicacion":"Animals and plants both respire."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.celula","variante":"vegetal","titulo":"Plant cell"},{"tipo":"vitalia.celula","variante":"animal","organelos":["membrana","nucleo","lisosoma"],"titulo":"Animal cell"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-animal-y-vegetal';

update public.techniques
set nombre_en = 'The membrane and transport',
    descripcion_en = 'Diffusion, osmosis, active transport; hypotonic, isotonic and hypertonic media.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The membrane is a double layer of lipids with proteins: it lets some things through and not others (**semipermeable**).","**Diffusion**: particles go from where there are more to where there are fewer, without spending energy. That's how $O_2$ gets into the cell.","**Osmosis**: it's the diffusion of **water**, which goes toward where there are more solutes. **Hypotonic** medium: water goes in; **isotonic**: it stays the same; **hypertonic**: water goes out.","**Active transport**: pump proteins move substances **against** the current (from less to more), spending **ATP**."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which type of transport spends ATP?","opciones":["Active transport","Diffusion","Osmosis","None"],"respuesta":"Active transport","explicacion":"It moves substances against the current."},{"pregunta":"A cell is in an isotonic medium. What happens to it?","opciones":["It stays the same","It swells","It shrivels","It bursts"],"respuesta":"It stays the same","explicacion":"Same concentration inside and out: as much water goes in as comes out."},{"pregunta":"How does oxygen get into the cell?","opciones":["By diffusion","By active transport","By osmosis","It doesn't get in"],"respuesta":"By diffusion","explicacion":"There's more $O_2$ outside than inside."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.membrana","modo":"difusion","titulo":"Diffusion: from more to less, for free"},{"tipo":"vitalia.membrana","modo":"activo","titulo":"Active transport: against the current, with ATP"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-membrana-y-transporte';

update public.techniques
set nombre_en = 'Biomolecules and enzymes',
    descripcion_en = 'The four families and how an enzyme works.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Carbohydrates** (sugars, starch, cellulose): quick energy and structure. **Lipids** (fats, oils): energy storage and membranes.","**Proteins** (chains of amino acids): build the body, transport things and speed up reactions. **Nucleic acids** (DNA, RNA): store and use information.","**Enzymes** are proteins that **speed up** reactions without being used up. Each one fits its **substrate** like a lock and key.","Examples: **amylase** breaks down starch; **pepsin**, proteins; **lipase**, fats. Too much heat deforms them and they stop working."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which enzyme breaks down starch?","opciones":["Amylase","Pepsin","Lipase","Insulin"],"respuesta":"Amylase","explicacion":"It's in saliva and in pancreatic juice."},{"pregunta":"What type of molecule are enzymes?","opciones":["Proteins","Lipids","Carbohydrates","DNA"],"respuesta":"Proteins","explicacion":"Almost all enzymes are proteins."},{"pregunta":"Which biomolecule is the main long-term energy store?","opciones":["Lipids","Proteins","DNA","Water"],"respuesta":"Lipids","explicacion":"Fats store a lot of energy in little space."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","cuadros":[{"texto":"The enzyme has a site shaped just right for its substrate.","resaltar":"Llave y cerradura"},{"texto":"The substrate fits and the reaction happens much faster.","resaltar":"Almidón + amilasa → azúcares"},{"texto":"The enzyme comes out the same as it went in and keeps working.","resaltar":"No se gasta"}]}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-biomoleculas-enzimas';

update public.techniques
set nombre_en = 'Photosynthesis',
    descripcion_en = 'Light reactions and the Calvin cycle, where they happen and what for.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Photosynthesis** turns light energy into chemical energy (glucose): $6\\,CO_2 + 6\\,H_2O + \\text{light} \\to C_6H_{12}O_6 + 6\\,O_2$.","It happens in the **chloroplasts**, thanks to **chlorophyll**, the green pigment that captures light.","**Light reactions** (in the thylakoids): with light, water is split, **$O_2$ is released** and ATP is made.","**Calvin cycle** (in the stroma): with that ATP, the $CO_2$ from the air is used to build **glucose**. It doesn't need light directly."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Where does the oxygen that plants release come from?","opciones":["From water","From CO₂","From glucose","From the soil"],"respuesta":"From water","explicacion":"In the light reactions, water is split and $O_2$ is released."},{"pregunta":"Which pigment captures light?","opciones":["Chlorophyll","Hemoglobin","Melanin","Only carotene"],"respuesta":"Chlorophyll","explicacion":"It's the green pigment of the chloroplasts."},{"pregunta":"In which stage is glucose made?","opciones":["In the Calvin cycle","In the light reactions","In the mitochondrion","In the nucleus"],"respuesta":"In the Calvin cycle","explicacion":"That's where $CO_2$ is used to build glucose."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.energia","modo":"fotosintesis","titulo":"What goes into and comes out of the chloroplast"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-fotosintesis';

update public.techniques
set nombre_en = 'Cellular respiration',
    descripcion_en = 'Glycolysis, the Krebs cycle and the electron transport chain, made simple.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Cellular respiration** gets the energy out of glucose and stores it in **ATP**: $C_6H_{12}O_6 + 6\\,O_2 \\to 6\\,CO_2 + 6\\,H_2O + \\text{ATP}$.","1) **Glycolysis** (in the cytoplasm): glucose is split in two. It gives 2 ATP and doesn't need oxygen.","2) **Krebs cycle** (in the mitochondrion): the pieces are taken apart completely and out comes the $CO_2$ you breathe out.","3) **Electron transport chain** (in the mitochondrial membrane): here **oxygen** is used and most of the ATP is made. In total, about 36 per glucose."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Where does glycolysis happen?","opciones":["In the cytoplasm","In the mitochondrion","In the nucleus","In the chloroplast"],"respuesta":"In the cytoplasm","explicacion":"It's the first stage, before going into the mitochondrion."},{"pregunta":"In which stage is oxygen used?","opciones":["In the electron transport chain","In glycolysis","In the Calvin cycle","In none"],"respuesta":"In the electron transport chain","explicacion":"$O_2$ takes the electrons at the end of the chain."},{"pregunta":"How many ATP does one glucose give in total, with oxygen?","opciones":["About 36","2","6","100"],"respuesta":"About 36","explicacion":"Most of them come from the electron transport chain."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.energia","modo":"respiracion","titulo":"Glucose and oxygen go in; ATP, CO₂ and water come out"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-respiracion-celular';

update public.techniques
set nombre_en = 'Fermentation',
    descripcion_en = 'Lactic and alcoholic: bread, yogurt, a tired muscle.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Without oxygen, the cell only does glycolysis (2 ATP) and then needs to \"recycle\" what it used: that's **fermentation**. It happens in the cytoplasm.","**Lactic fermentation**: produces lactic acid. Yogurt bacteria do it, and so do your muscles when they run short of oxygen.","**Alcoholic fermentation**: produces alcohol and $CO_2$. Yeasts do it: the $CO_2$ makes bread rise and the alcohol is in beer and wine.","It yields very little (2 ATP), but it's useful when there's no oxygen."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which gas makes bread dough rise?","opciones":["Carbon dioxide","Oxygen","Nitrogen","Water vapor"],"respuesta":"Carbon dioxide","explicacion":"Yeasts produce it in alcoholic fermentation."},{"pregunta":"Which fermentation do yogurt bacteria do?","opciones":["Lactic","Alcoholic","Acetic","None"],"respuesta":"Lactic","explicacion":"They produce lactic acid, which thickens the milk."},{"pregunta":"Where does fermentation happen?","opciones":["In the cytoplasm","In the mitochondrion","In the chloroplast","In the nucleus"],"respuesta":"In the cytoplasm","explicacion":"It doesn't use the mitochondrion."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.energia","modo":"fermentacion","titulo":"Without oxygen: 2 ATP and lactic acid or alcohol"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-fermentacion';

update public.techniques
set nombre_en = 'The cell cycle and mitosis',
    descripcion_en = 'G1, S, G2 and M; the phases with drawings.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The **cell cycle** is a cell's life between one division and the next. Most of it is **interphase**: G1 (it grows), S (it copies its DNA) and G2 (it gets ready).","Then comes the **M** phase: **mitosis**, which splits the copied DNA into two nuclei, and **cytokinesis**, which divides the cytoplasm.","Phases of mitosis: **prophase** (condensed chromosomes), **metaphase** (lined up in the middle), **anaphase** (the chromatids separate), **telophase** (two new nuclei).","Result: **two cells identical** to the mother cell, with the same number of chromosomes. It's used for growing and healing wounds."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"In which stage of the cycle is DNA copied?","opciones":["In the S phase","In mitosis","In G1","In telophase"],"respuesta":"In the S phase","explicacion":"S for synthesis: the DNA is duplicated."},{"pregunta":"How many cells come out of one mitosis?","opciones":["2 identical ones","4 different ones","2 different ones","1"],"respuesta":"2 identical ones","explicacion":"Identical to each other and to the mother cell."},{"pregunta":"What is mitosis used for in your body?","opciones":["To grow and repair tissues","To make gametes","To digest","To breathe"],"respuesta":"To grow and repair tissues","explicacion":"Gametes come from meiosis."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.division","modo":"mitosis","dosN":46,"titulo":"From one cell with 46 chromosomes, two with 46"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-ciclo-celular-mitosis';

update public.techniques
set nombre_en = 'Meiosis',
    descripcion_en = 'Why it exists, crossing over and variety.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Meiosis** makes the **gametes** (eggs and sperm). If gametes had $2n$, each generation would double its chromosomes; that's why they have **half**, $n$.","It does **two divisions**. In **meiosis I** the pairs of homologous chromosomes separate; in **meiosis II**, the chromatids. Result: **4 $n$ cells**.","Before that, in **crossing over**, homologous chromosomes swap pieces. Also, each pair is sorted at random.","That's why each gamete is unique, and siblings (except identical twins) aren't the same."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"How many cells come out of one meiosis?","opciones":["4","2","1","8"],"respuesta":"4","explicacion":"Two divisions in a row: 4 cells."},{"pregunta":"A horse has $2n = 64$. How many chromosomes does each gamete have?","opciones":["32","64","128","16"],"respuesta":"32","explicacion":"Gametes have $n$, half."},{"pregunta":"Which process makes each gamete different?","opciones":["Crossing over","Glycolysis","Cytokinesis","Interphase"],"respuesta":"Crossing over","explicacion":"Together with the random sorting of the chromosomes."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.division","modo":"meiosis","dosN":4,"titulo":"Two divisions: four $n$ gametes"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-meiosis';

update public.techniques
set nombre_en = 'DNA, genes and chromosomes',
    descripcion_en = 'What each one is and how information is stored.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**DNA** is an extremely long molecule shaped like a **double helix**: two strands joined by base pairs, A with T and G with C.","A **gene** is a stretch of DNA with the instructions to make a protein (for example, the one that gives eyes their color).","A **chromosome** is a tightly coiled strip of DNA with many genes. Humans have 46 (23 pairs): one of each pair comes from each parent.","Every cell in your body has the same DNA; what changes is which genes are used in each one."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What is a gene?","opciones":["A stretch of DNA with instructions for a protein","A whole chromosome","A cell","An organelle"],"respuesta":"A stretch of DNA with instructions for a protein","explicacion":"Genes are inside the chromosomes."},{"pregunta":"How many pairs of chromosomes does a human body cell have?","opciones":["23","46","12","92"],"respuesta":"23","explicacion":"46 chromosomes in 23 pairs."},{"pregunta":"In DNA, which base does G pair with?","opciones":["C","A","T","U"],"respuesta":"C","explicacion":"G with C; A with T."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.adn","modo":"replicacion","hebra":"ATGCGTTA","titulo":"The two strands and their base pairs"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-adn-genes-cromosomas';

update public.techniques
set nombre_en = 'From DNA to protein',
    descripcion_en = 'Transcription and translation.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["DNA doesn't leave the nucleus. To make a protein, a working copy is made: **messenger RNA**.","**Transcription** (in the nucleus): a gene is copied into RNA. It pairs just like DNA, but with **U instead of T**: $TACGGA \\to AUGCCU$.","**Translation** (at the ribosome): the ribosome reads the RNA **3 letters** at a time (codons) and for each codon adds an **amino acid**.","It starts at $AUG$ (Met) and ends at a stop codon. The chain of amino acids folds up and becomes the protein."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Where does transcription happen?","opciones":["In the nucleus","At the ribosome","In the mitochondrion","At the membrane"],"respuesta":"In the nucleus","explicacion":"That's where the DNA being copied is."},{"pregunta":"What messenger RNA comes from transcribing $TTACG$?","opciones":["AAUGC","AATGC","UUACG","TTACG"],"respuesta":"AAUGC","explicacion":"T→A, T→A, A→U, C→G, G→C."},{"pregunta":"Translate $AUG\\text{-}UGG$ (AUG = Met, UGG = Trp).","opciones":["Met-Trp","Trp-Met","Met-Met","Stop"],"respuesta":"Met-Trp","explicacion":"One amino acid per codon, in order."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.adn","modo":"transcripcion","hebra":"TACGGACAA","titulo":"Transcription: from DNA to messenger RNA"},{"tipo":"vitalia.adn","modo":"traduccion","hebra":"AUGCCUGUU","titulo":"Translation: 3 letters at a time, one amino acid"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-adn-a-proteina';

update public.techniques
set nombre_en = 'Mendel and inheritance',
    descripcion_en = 'Dominant, recessive, genotype and phenotype; one-trait crosses.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Each gene comes in versions called **alleles**, and you inherit one from each parent. They're written with letters: $A$ (dominant) and $a$ (recessive).","**Genotype**: the alleles you have ($AA$, $Aa$ or $aa$). **Phenotype**: how it looks. **Homozygous**: two the same; **heterozygous**: two different.","The **dominant** allele shows with a single copy: $AA$ and $Aa$ look the same. The **recessive** one only shows in $aa$.","Mendel crossed peas $Aa \\times Aa$ and got **3 : 1** (three with the dominant trait for every one with the recessive)."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which genotype is homozygous recessive?","opciones":["aa","Aa","AA","A"],"respuesta":"aa","explicacion":"Two identical, recessive alleles."},{"pregunta":"Brown ($M$) is dominant over blue ($m$). What color are the eyes of someone who is $Mm$?","opciones":["Brown","Blue","Green","Half and half"],"respuesta":"Brown","explicacion":"One dominant allele is enough."},{"pregunta":"Two $Mm$ parents. What's the probability of a child with blue eyes ($mm$)?","opciones":["25 %","50 %","75 %","0 %"],"respuesta":"25 %","explicacion":"One box out of four in the Punnett square."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.punnett","padre1":"Aa","padre2":"Aa","titulo":"Mendel's cross: 3 : 1"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-mendel';

update public.techniques
set nombre_en = 'Two-trait crosses',
    descripcion_en = 'Independent assortment and 9:3:3:1.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["If two genes are on different chromosomes, they're inherited **separately** (independent assortment, Mendel's second law).","An $AaBb$ parent makes four different gametes, in equal proportions: $AB$, $Ab$, $aB$, $ab$.","The cross $AaBb \\times AaBb$ has 16 boxes, with **9 : 3 : 3 : 1**: 9 dominant in both traits, 3 and 3 with only one, 1 recessive in both.","Shortcut: multiply the probabilities of each gene, $\\tfrac{3}{4} \\cdot \\tfrac{3}{4} = \\tfrac{9}{16}$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"How many different types of gametes does an $AaBb$ individual make?","opciones":["4","2","8","16"],"respuesta":"4","explicacion":"$AB$, $Ab$, $aB$ and $ab$."},{"pregunta":"In $AaBb \\times AaBb$, what fraction is dominant in A and recessive in B?","opciones":["3/16","9/16","1/16","1/4"],"respuesta":"3/16","explicacion":"$\\tfrac{3}{4} \\cdot \\tfrac{1}{4} = \\tfrac{3}{16}$."},{"pregunta":"What does Mendel's second law say?","opciones":["Genes on different chromosomes are inherited separately","All the offspring are the same","The recessive one disappears","Alleles blend together"],"respuesta":"Genes on different chromosomes are inherited separately","explicacion":"It's independent assortment."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.punnett","padre1":"AaBb","padre2":"AaBb","titulo":"16 boxes: 9 : 3 : 3 : 1"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-dos-rasgos';

update public.techniques
set nombre_en = 'Beyond Mendel',
    descripcion_en = 'Incomplete dominance, codominance and ABO blood groups.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Incomplete dominance**: the heterozygote is in between. In the four o'clock flower, red × white gives pink; pink × pink gives **1 red : 2 pink : 1 white**.","**Codominance**: both alleles show at the same time, without blending. Example: blood group **AB** shows A and B.","**ABO groups**: there are three alleles ($I^A$, $I^B$ and $i$). $I^A$ and $I^B$ are codominant and both are dominant over $i$.","Group A: $I^AI^A$ or $I^Ai$. Group B: $I^BI^B$ or $I^Bi$. Group AB: $I^AI^B$. Group O: $ii$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"You cross two pink four o'clock flowers (incomplete dominance). What percentage comes out pink?","opciones":["50 %","25 %","75 %","100 %"],"respuesta":"50 %","explicacion":"1 red : 2 pink : 1 white."},{"pregunta":"What genotype does someone with blood group O have?","opciones":["ii","IᴬIᴮ","Iᴬi","IᴮIᴮ"],"respuesta":"ii","explicacion":"Group O is recessive: it needs two $i$."},{"pregunta":"Blood group AB is an example of…","opciones":["Codominance","Incomplete dominance","Sex-linked inheritance","Mutation"],"respuesta":"Codominance","explicacion":"A and B are expressed at the same time."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.punnett","padre1":"Rr","padre2":"Rr","incompleta":true,"titulo":"Pink × pink: 1 : 2 : 1"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-mas-alla-de-mendel';

update public.techniques
set nombre_en = 'Sex-linked inheritance and family trees',
    descripcion_en = 'Color blindness, hemophilia and how to read a pedigree.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Women have two X chromosomes (XX); men, one X and one Y (XY). Some genes are only on the X.","If a recessive allele is on the X (color blindness, hemophilia), a woman is protected by her other X: she can be a **carrier** without showing it.","A man has a single X, which comes from his mother: if it carries the allele, he shows it. That's why these conditions are much more common in males.","In a **pedigree**, the square is a man, the circle is a woman, filled in means they have the trait and a dot means they're a carrier."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A boy is color-blind. Who did he inherit the allele from?","opciones":["From his mother","From his father","From both","From neither"],"respuesta":"From his mother","explicacion":"His only X comes from his mother; from his father he got the Y."},{"pregunta":"In a pedigree, what does a filled-in circle represent?","opciones":["A woman with the trait","A man with the trait","A woman who is a carrier","A healthy man"],"respuesta":"A woman with the trait","explicacion":"Circle: woman; filled in: shows the trait."},{"pregunta":"Why is hemophilia more common in men?","opciones":["They have a single X chromosome","They have two X chromosomes","The gene is on the Y","It's contagious"],"respuesta":"They have a single X chromosome","explicacion":"They have no other X to protect them."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.pedigri","modo":"ligadaX","titulo":"X-linked: carrier mother, color-blind son"},{"tipo":"vitalia.pedigri","modo":"recesiva","titulo":"Common recessive: healthy carrier parents"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-ligada-al-sexo-pedigri';

update public.techniques
set nombre_en = 'Digestion',
    descripcion_en = 'Mechanical and chemical, enzymes and absorption.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Digestion breaks food down into tiny molecules the blood can carry. It has two parts: **mechanical** (chewing, mixing) and **chemical** (enzymes).","**Mouth**: teeth and **amylase** (starch). **Stomach**: acid and **pepsin** (proteins). **Liver**: makes **bile**, which breaks fats into tiny droplets.","**Pancreas**: sends enzymes for everything to the intestine (amylase, proteases, **lipase**). Digestion finishes in the **small intestine**.","The **villi** of the small intestine absorb the nutrients into the blood. The **large intestine** recovers water."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What does bile do?","opciones":["Breaks fats into tiny droplets","Breaks down starch","Absorbs water","Produces insulin"],"respuesta":"Breaks fats into tiny droplets","explicacion":"That way lipase can digest them."},{"pregunta":"Which enzyme digests fats?","opciones":["Lipase","Amylase","Pepsin","Insulin"],"respuesta":"Lipase","explicacion":"Lipid: lipase."},{"pregunta":"Which part absorbs most of the water?","opciones":["The large intestine","The stomach","The mouth","The esophagus"],"respuesta":"The large intestine","explicacion":"Nutrients, in the small intestine; water, in the large one."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.recorrido","sistema":"digestivo","titulo":"The path of food"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-digestion';

update public.techniques
set nombre_en = 'Circulation',
    descripcion_en = 'The heart, systemic and pulmonary circulation, vessels and blood.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The **heart** has 4 chambers: two **atria** (they receive) and two **ventricles** (they pump). The right side handles oxygen-poor blood and the left, oxygen-rich blood.","**Pulmonary circulation**: right ventricle → lungs (picks up $O_2$) → left atrium.","**Systemic circulation**: left ventricle → aorta → the whole body → venae cavae → right atrium.","Vessels: **arteries** (leave the heart), **veins** (come back) and **capillaries** (very thin, where the exchange happens). Blood carries red blood cells ($O_2$), white blood cells (defense), platelets (clotting) and plasma."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which chamber of the heart sends blood to the whole body?","opciones":["The left ventricle","The right atrium","The right ventricle","The left atrium"],"respuesta":"The left ventricle","explicacion":"That's why it has the thickest wall."},{"pregunta":"Where are gases and nutrients exchanged with the tissues?","opciones":["In the capillaries","In the large arteries","In the aorta","In the atria"],"respuesta":"In the capillaries","explicacion":"Their walls are extremely thin."},{"pregunta":"Which blood cells carry oxygen?","opciones":["Red blood cells","Platelets","White blood cells","Plasma"],"respuesta":"Red blood cells","explicacion":"They have hemoglobin."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.recorrido","sistema":"circulatorio","titulo":"Two circulations, one heart"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-circulacion';

update public.techniques
set nombre_en = 'Breathing',
    descripcion_en = 'From the air to the alveolus and into the blood.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Air enters through the **nose** (it's filtered and warmed), passes through the **pharynx**, the **larynx** and the **trachea**, and spreads through the **bronchi** and **bronchioles**.","At the end are the **alveoli**: millions of tiny sacs surrounded by capillaries.","That's where **gas exchange** happens by diffusion: $O_2$ passes from the air into the blood and $CO_2$, from the blood into the air.","To breathe in, the **diaphragm** moves down and the lungs fill; to breathe out, it moves up and the air goes out."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Where does oxygen pass into the blood?","opciones":["In the alveoli","In the trachea","In the nose","In the bronchi"],"respuesta":"In the alveoli","explicacion":"They're surrounded by capillaries."},{"pregunta":"How do gases pass between the alveolus and the blood?","opciones":["By diffusion","By active transport","By osmosis","The heart pushes them"],"respuesta":"By diffusion","explicacion":"From where there's more to where there's less."},{"pregunta":"Which muscle moves down when you breathe in?","opciones":["The diaphragm","The heart","The stomach","The biceps"],"respuesta":"The diaphragm","explicacion":"As it moves down, it enlarges the chest and air comes in."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.recorrido","sistema":"respiratorio","titulo":"From the nose to the alveolus"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-respiracion';

update public.techniques
set nombre_en = 'Excretion',
    descripcion_en = 'The kidney and the nephron.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Cells produce waste that has to be removed. Breaking down proteins forms **urea**, which leaves the body in urine.","The **kidneys** filter the blood. Each one has about a million **nephrons**, its filtering units.","In the nephron, blood is filtered and then the useful things (water, glucose, salts) are **reabsorbed**. What's left, with the urea, is urine.","Route: kidney → **ureter** → **bladder** (where it's stored) → **urethra** (where it leaves). The kidneys also regulate the body's water and salts."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which protein waste leaves the body in urine?","opciones":["Urea","Glucose","Oxygen","Bile"],"respuesta":"Urea","explicacion":"It forms when proteins are broken down."},{"pregunta":"What is the filtering unit of the kidney?","opciones":["The nephron","The alveolus","The neuron","The villus"],"respuesta":"The nephron","explicacion":"Each kidney has about a million."},{"pregunta":"Through what does urine go down from the kidney to the bladder?","opciones":["Through the ureter","Through the urethra","Through the aorta","Through the esophagus"],"respuesta":"Through the ureter","explicacion":"The urethra takes it out of the bladder to the outside."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.recorrido","sistema":"urinario","titulo":"From blood to urine"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-excrecion';

update public.techniques
set nombre_en = 'Hormones and homeostasis',
    descripcion_en = 'Glands, hormones and feedback.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Hormones** are chemical messengers: a **gland** releases them into the blood and they act on a distant organ (the target organ).","Examples: **insulin** and **glucagon** (pancreas, glucose), **adrenaline** (adrenal glands, alertness), **thyroxine** (thyroid, metabolism), **growth hormone** (pituitary).","**Homeostasis** is keeping the body stable: temperature near 37 °C, glucose near 90 mg/dL, water and salts in balance.","It's achieved with **negative feedback**: if something goes up, the body brings it down; if it goes down, it brings it up. Like a thermostat."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"How do hormones travel to their target organ?","opciones":["Through the blood","Through the nerves","Through the air","Through the muscles"],"respuesta":"Through the blood","explicacion":"Glands release them into the bloodstream."},{"pregunta":"You feel hot and start sweating. What is this?","opciones":["Negative feedback","Positive feedback","An allergy","Digestion"],"respuesta":"Negative feedback","explicacion":"The body corrects the change to get back to 37 °C."},{"pregunta":"Which hormone gets you ready to run from danger?","opciones":["Adrenaline","Insulin","Thyroxine","Glucagon"],"respuesta":"Adrenaline","explicacion":"It speeds up your heart and your breathing."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.hormona","modo":"glucosa","titulo":"Glucose: insulin and glucagon"},{"tipo":"vitalia.hormona","modo":"temperatura","titulo":"Temperature: sweating and shivering"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-hormonas-homeostasis';

update public.techniques
set nombre_en = 'The body''s defenses',
    descripcion_en = 'Barriers, white blood cells, antibodies and vaccines.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**First line**: barriers like the skin, mucous membranes, mucus and stomach acid.","**Second line (innate)**: if a microbe gets in, there's inflammation, fever and white blood cells that \"eat\" it (phagocytes). It's fast and general.","**Third line (acquired)**: **lymphocytes** recognize that particular microbe. B lymphocytes make **antibodies** that stick to it. **Memory cells** remain.","A **vaccine** shows the body the microbe (dead, weakened or a part of it) without making you sick: memory cells form and, if the real one arrives, the response is fast."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which cells make antibodies?","opciones":["B lymphocytes","Red blood cells","Platelets","Neurons"],"respuesta":"B lymphocytes","explicacion":"They're part of the acquired defense."},{"pregunta":"Why does a vaccine work?","opciones":["It leaves memory cells against that microbe","It kills every microbe in the body","It's an antibiotic","It replaces the white blood cells"],"respuesta":"It leaves memory cells against that microbe","explicacion":"That way the next response is fast."},{"pregunta":"What is the first barrier against microbes?","opciones":["The skin","Antibodies","Fever","Lymphocytes"],"respuesta":"The skin","explicacion":"It's a physical barrier of the first line."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.defensa","modo":"respuesta","titulo":"Barriers, white blood cells and antibodies"},{"tipo":"vitalia.defensa","modo":"vacuna","titulo":"With a vaccine, the second time is fast and strong"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-defensas';

update public.techniques
set nombre_en = 'The nerve impulse',
    descripcion_en = 'Neuron, synapse and reflex arc.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The **neuron** is the cell of the nervous system. It receives signals through the **dendrites** and sends them along the **axon**, like a cable.","The message travels along the neuron as an **electrical impulse**. To pass to the next one, at the **synapse**, chemicals (neurotransmitters) are released.","**Sensory neurons** carry information from the senses to the central nervous system; **motor neurons** carry orders to the muscles.","In a **reflex arc** the response is decided in the spinal cord, without waiting for the brain: that's why you pull your hand away from the fire before you feel the pain."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"How does the message pass from one neuron to the next?","opciones":["With neurotransmitters at the synapse","Through the blood","By osmosis","Through the air"],"respuesta":"With neurotransmitters at the synapse","explicacion":"It's the chemical part of the communication."},{"pregunta":"In a reflex arc, where is the response decided?","opciones":["In the spinal cord","In the brain","In the muscle","In the skin"],"respuesta":"In the spinal cord","explicacion":"That's why it's so fast."},{"pregunta":"Which neurons carry orders to the muscles?","opciones":["Motor neurons","Sensory neurons","The ones in the retina","None"],"respuesta":"Motor neurons","explicacion":"Sensory neurons bring in information from the senses."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.recorrido","sistema":"nervioso","titulo":"Reflex arc: receptor, spinal cord and muscle"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-impulso-nervioso';

update public.techniques
set nombre_en = 'Classifying living things',
    descripcion_en = 'Why and how; the kingdoms.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["There are millions of species. **Classifying** means grouping them by their traits, to study and name them without confusion.","The traits that matter most: whether they have a **nucleus**, whether they're **one cell or many**, whether they have a **cell wall** and **how they feed** (they make their food, absorb it or eat it).","With that, the **5 kingdoms** are built: Monera (bacteria), Protists, Fungi, Plants and Animals.","Today, on top of that, everything is grouped into **3 domains** by type of cell: Bacteria, Archaea and Eukarya."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which kingdom does a paramecium (unicellular, with a nucleus) belong to?","opciones":["Protists","Monera","Fungi","Animals"],"respuesta":"Protists","explicacion":"Eukaryotic and made of a single cell."},{"pregunta":"Which trait separates Monera from the other kingdoms?","opciones":["They have no nucleus","They do photosynthesis","They're multicellular","They have a wall"],"respuesta":"They have no nucleus","explicacion":"They're prokaryotes."},{"pregunta":"How many domains are there?","opciones":["3","5","2","8"],"respuesta":"3","explicacion":"Bacteria, Archaea and Eukarya."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.reinos","modo":"reinos","titulo":"The 5 kingdoms"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-clasificar-seres-vivos';

update public.techniques
set nombre_en = 'Bacteria and protists',
    descripcion_en = 'The smallest and the most ancient.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Bacteria** are prokaryotes: no nucleus, with a wall and, many of them, with a flagellum. They were the first living things, more than 3.5 billion years ago.","There are harmful bacteria, but most are useful: the ones in your gut help you digest, others make yogurt, and many decompose remains.","**Cyanobacteria** do photosynthesis: they filled the atmosphere with oxygen.","**Protists** are eukaryotes, almost always single-celled: the **amoeba** and the **paramecium** eat like animals; **algae** do photosynthesis like plants."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What type of cell do bacteria have?","opciones":["Prokaryotic","Eukaryotic animal","Eukaryotic plant","They have no cells"],"respuesta":"Prokaryotic","explicacion":"No nucleus."},{"pregunta":"Which bacteria do photosynthesis?","opciones":["Cyanobacteria","The ones in the gut","The ones in yogurt","None"],"respuesta":"Cyanobacteria","explicacion":"They produce oxygen like plants."},{"pregunta":"A single-celled alga with a nucleus: which kingdom does it belong to?","opciones":["Protists","Plants","Monera","Fungi"],"respuesta":"Protists","explicacion":"It's eukaryotic and single-celled."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.celula","variante":"procariota","titulo":"A bacterium from the inside"},{"tipo":"vitalia.reinos","modo":"reinos","titulo":"Monera and protists among the 5 kingdoms"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-bacterias-protistas';

update public.techniques
set nombre_en = 'Fungi',
    descripcion_en = 'Neither plant nor animal: yeasts, molds and mushrooms.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Fungi** have cells with a nucleus and a **chitin wall** (the same substance as insects' shells).","They don't do photosynthesis: they feed by **absorbing** substances from their surroundings, often from dead remains (they're **decomposers**).","Three well-known types: **yeasts** (single-celled, they make bread and beer), **molds** (like the one on old bread; penicillin came from one) and **mushrooms**.","They reproduce by **spores**. What we see of a mushroom is only its reproductive part; the rest is threads underground (the mycelium)."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What is the cell wall of fungi made of?","opciones":["Chitin","Cellulose","Proteins","Calcium"],"respuesta":"Chitin","explicacion":"Plants use cellulose; fungi, chitin."},{"pregunta":"How do fungi feed?","opciones":["They absorb substances","They do photosynthesis","They hunt prey","They don't feed"],"respuesta":"They absorb substances","explicacion":"Many decompose remains."},{"pregunta":"Which fungus is used to make bread?","opciones":["Yeast","The button mushroom","Mold","Penicillin"],"respuesta":"Yeast","explicacion":"It ferments and releases $CO_2$, which makes the dough rise."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.reinos","modo":"reinos","titulo":"Fungi have their own kingdom"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-hongos';

update public.techniques
set nombre_en = 'Plants',
    descripcion_en = 'From mosses to flowers.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Plants are multicellular, with a **cellulose** wall, and they make their food by **photosynthesis**.","**Bryophytes** (mosses): no vessels or true roots; they need a lot of moisture. **Pteridophytes** (ferns): with vessels, without seeds; they reproduce by spores.","**Gymnosperms** (pines, cypresses): with naked seeds in cones. **Angiosperms**: with **flowers**, and the seed stays inside a **fruit**.","**Vessels** let them grow tall; the **seed**, live far from water; the **flower**, attract pollinators."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which group of plants has no vessels?","opciones":["Mosses","Ferns","Pines","Roses"],"respuesta":"Mosses","explicacion":"That's why they're short and live in damp places."},{"pregunta":"The pine has seeds, but no fruit. It's a…","opciones":["Gymnosperm","Angiosperm","Bryophyte","Pteridophyte"],"respuesta":"Gymnosperm","explicacion":"\"Gymno\" means naked."},{"pregunta":"What advantage did the seed give plants?","opciones":["Being able to live far from water","Doing photosynthesis","Having vessels","Moving around"],"respuesta":"Being able to live far from water","explicacion":"The seed protects the embryo and doesn't need water to reproduce."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.plantas","titulo":"Each group of plants adds something new"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-plantas';

update public.techniques
set nombre_en = 'Invertebrate animals',
    descripcion_en = 'The big groups and their traits.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Invertebrates** have no backbone and make up more than 95% of animals.","**Poriferans** (sponges): a body full of pores. **Cnidarians** (jellyfish, corals): tentacles with stinging cells.","**Mollusks** (snail, octopus): soft body, many with a shell. **Annelids** (earthworm): a body made of rings.","**Arthropods** (insects, spiders, crabs): jointed legs and an **external skeleton**; it's the largest group. **Echinoderms** (starfish): spiny skin and five-part symmetry."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which group does the spider belong to?","opciones":["Arthropods","Mollusks","Annelids","Cnidarians"],"respuesta":"Arthropods","explicacion":"Jointed legs and an external skeleton."},{"pregunta":"Which group does the octopus belong to?","opciones":["Mollusks","Echinoderms","Arthropods","Poriferans"],"respuesta":"Mollusks","explicacion":"A soft body, like the snail."},{"pregunta":"What is the largest group of animals?","opciones":["Arthropods","Mammals","Fish","Annelids"],"respuesta":"Arthropods","explicacion":"Insects alone are millions of species."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.reinos","modo":"invertebrados","titulo":"The groups of invertebrates"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-invertebrados';

update public.techniques
set nombre_en = 'Vertebrate animals',
    descripcion_en = 'The 5 classes.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Vertebrates** have a backbone and an internal skeleton. There are 5 classes.","**Fish**: scales, they breathe with gills. **Amphibians** (frog): bare, moist skin; when young they live in water and as adults they breathe air.","**Reptiles** (lizard, turtle): dry scales; they lay eggs with shells on land. **Birds**: feathers, a beak and hard-shelled eggs.","**Mammals**: hair and mammary glands (the young drink milk). Most are born from their mother's womb.","Fish, amphibians and reptiles don't regulate their temperature (they depend on the environment); birds and mammals do."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which trait do only mammals have?","opciones":["Mammary glands","A backbone","Eggs","Scales"],"respuesta":"Mammary glands","explicacion":"They give milk to their young."},{"pregunta":"Which classes regulate their own temperature?","opciones":["Birds and mammals","Fish and amphibians","Reptiles and fish","All of them"],"respuesta":"Birds and mammals","explicacion":"The rest depend on the environment."},{"pregunta":"Which class does the turtle belong to?","opciones":["Reptiles","Amphibians","Fish","Mammals"],"respuesta":"Reptiles","explicacion":"Dry scales and shelled eggs laid on land."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.reinos","modo":"vertebrados","titulo":"The 5 classes of vertebrates"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-vertebrados';

update public.techniques
set nombre_en = 'Taxonomy and the 3 domains',
    descripcion_en = 'Ranks, scientific names, Bacteria, Archaea and Eukarya.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Taxonomy** sorts living things into ranks from biggest to smallest: domain, kingdom, phylum, class, order, family, genus and species.","A **species** is the group of beings that can reproduce with each other and have fertile offspring.","**Scientific name** (Linnaeus): genus capitalized and species in lowercase, in italics: *Homo sapiens*.","The **3 domains**: **Bacteria** (common bacteria), **Archaea** (prokaryotes that live in extreme places, like boiling water) and **Eukarya** (everything with a nucleus)."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which domain groups the beings with a nucleus?","opciones":["Eukarya","Archaea","Bacteria","Animalia"],"respuesta":"Eukarya","explicacion":"\"Eu-karyon\": true nucleus."},{"pregunta":"Which rank goes between \"Family\" and \"Species\"?","opciones":["Genus","Order","Class","Kingdom"],"respuesta":"Genus","explicacion":"…Family, Genus, Species."},{"pregunta":"What defines a species?","opciones":["They can reproduce with each other and have fertile offspring","They live in the same place","They're the same color","They eat the same thing"],"respuesta":"They can reproduce with each other and have fertile offspring","explicacion":"It's the biological definition of species."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.arbol","ejemplo":"roble","titulo":"The oak, from domain to species"},{"tipo":"vitalia.arbol","ejemplo":"perro","titulo":"The dog, from domain to species"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-taxonomia-dominios';

update public.techniques
set nombre_en = 'Ecosystems and trophic levels',
    descripcion_en = 'Who eats whom, and each one''s place.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["An **ecosystem** is the living things in a place (**biotic factors**) plus what isn't alive: light, water, soil, temperature (**abiotic factors**).","**Trophic levels** sort living things by how they feed: **producers** (plants, algae), **primary consumers** (herbivores), **secondary** and **tertiary** consumers (carnivores).","**Decomposers** (fungi, bacteria) close the cycle: they return the matter from remains to the soil.","Several chains that cross each other form a **food web**: the same animal can eat at several levels."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which of these is an abiotic factor?","opciones":["Temperature","A tree","A bacterium","A fungus"],"respuesta":"Temperature","explicacion":"It isn't alive."},{"pregunta":"In algae → small fish → seal → shark, what is the seal?","opciones":["Secondary consumer","Primary consumer","Producer","Tertiary consumer"],"respuesta":"Secondary consumer","explicacion":"It eats the herbivore (the small fish)."},{"pregunta":"What do decomposers do?","opciones":["Return the matter from remains to the soil","Do photosynthesis","Hunt herbivores","Only produce oxygen"],"respuesta":"Return the matter from remains to the soil","explicacion":"They recycle the nutrients for the producers."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.cadena","eslabones":["Algas","Pez pequeño","Foca","Tiburón"],"titulo":"A chain in the sea"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-ecosistema-niveles';

update public.techniques
set nombre_en = 'Energy flow',
    descripcion_en = 'The pyramid and the 10%.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Energy enters the ecosystem with **sunlight**, which producers turn into chemical energy.","At each step of the chain, only about **10%** passes to the next level; the rest is used for living and lost as **heat**.","That's why the **energy pyramid** narrows toward the top and chains rarely have more than 4 or 5 links.","Energy **flows** in one direction and is lost; **matter**, on the other hand, is **recycled** thanks to decomposers."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A producer has $8000$ kcal. How much energy reaches the secondary consumer?","opciones":["80 kcal","800 kcal","8 kcal","7200 kcal"],"respuesta":"80 kcal","explicacion":"$8000 \\to 800 \\to 80$."},{"pregunta":"Where does the energy of almost every ecosystem come from?","opciones":["From the Sun","From the soil","From water","From decomposers"],"respuesta":"From the Sun","explicacion":"Producers capture it with photosynthesis."},{"pregunta":"What gets recycled in an ecosystem?","opciones":["Matter","Energy","Heat","Light"],"respuesta":"Matter","explicacion":"Energy flows and is lost; matter is used again."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.cadena","eslabones":["Pasto","Conejo","Zorro","Águila"],"energia":20000,"titulo":"From 20,000 kcal to 20 kcal in four levels"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-flujo-de-energia';

update public.techniques
set nombre_en = 'Relationships between species',
    descripcion_en = 'Mutualism, parasitism, commensalism, predation and competition.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The species in an ecosystem interact with each other. The relationships are named by who wins (+), who loses (−) and who isn't affected (0).","**Mutualism** (+/+): bees and flowers; the bacteria in your gut. **Commensalism** (+/0): the remora and the shark.","**Parasitism** (+/−): the tick and the dog; the parasite lives at the other's expense without killing it right away. **Predation** (+/−): the predator kills and eats the prey.","**Competition** (−/−): two species that need the same thing (food, space, light) harm each other."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"The remora eats the shark's leftovers, and the shark neither wins nor loses. It's…","opciones":["Commensalism","Parasitism","Mutualism","Predation"],"respuesta":"Commensalism","explicacion":"One wins (+) and the other isn't affected (0)."},{"pregunta":"Two lions fight over the same prey. It's…","opciones":["Competition","Mutualism","Commensalism","Predation"],"respuesta":"Competition","explicacion":"Both lose energy."},{"pregunta":"In which relationship do both species win?","opciones":["Mutualism","Parasitism","Commensalism","Competition"],"respuesta":"Mutualism","explicacion":"Both species win (+/+)."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","cuadros":[{"texto":"Bee and flower: the bee eats nectar and the flower gets pollinated.","resaltar":"Mutualismo (+/+)"},{"texto":"Remora and shark: the remora eats leftovers; the shark isn't affected.","resaltar":"Comensalismo (+/0)"},{"texto":"Tick and dog: the tick sucks blood.","resaltar":"Parasitismo (+/−)"},{"texto":"Lion and zebra.","resaltar":"Depredación (+/−)"},{"texto":"Two bird species after the same seeds.","resaltar":"Competencia (−/−)"}]}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-relaciones-especies';

update public.techniques
set nombre_en = 'Cycles of matter',
    descripcion_en = 'Carbon, water and nitrogen.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The planet's matter is recycled again and again in **cycles**.","**Carbon**: photosynthesis takes it from the air ($CO_2$); respiration, decomposition and **combustion** return it. Burning oil and coal adds $CO_2$ and warms the planet.","**Water**: it evaporates, condenses into clouds, falls as rain and runs into rivers and seas. Plants also release water through their leaves (transpiration).","**Nitrogen**: it's 78% of the air, but plants can't use it like that. Soil bacteria turn it into compounds that plants can absorb."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What returns carbon to the air as carbon dioxide?","opciones":["The respiration of living things","Photosynthesis","Condensation","Rain"],"respuesta":"The respiration of living things","explicacion":"So do decomposition and combustion."},{"pregunta":"Who makes the nitrogen in the air usable by plants?","opciones":["Soil bacteria","Animals","Rain alone","Wood fungi"],"respuesta":"Soil bacteria","explicacion":"They fix nitrogen into useful compounds."},{"pregunta":"What is the step of the water cycle in which clouds form called?","opciones":["Condensation","Evaporation","Precipitation","Infiltration"],"respuesta":"Condensation","explicacion":"Water vapor cools and forms tiny droplets."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"vitalia.energia","modo":"ciclo","titulo":"The carbon cycle between photosynthesis and respiration"}]$leccion_en$::jsonb
    )
where slug = 'vitalia-clase-ciclos-materia';
