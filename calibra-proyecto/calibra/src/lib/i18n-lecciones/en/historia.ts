import type { TraduccionLeccion } from "../traducir";

// Historia — 25 Técnicas y 31 Clases en inglés. Convenciones: a. C. = BC, d. C. = AD (476 AD, 3500 BC),
// «hacia» = c., siglo XIX = 19th century, Edad Media = Middle Ages, Edad Moderna = Early Modern Age,
// Edad Contemporánea = Contemporary Age. Los nombres de hechos y personajes usan la forma inglesa
// establecida y se repiten idénticos en todas las lecciones.
export const HISTORIA_EN: Record<string, TraduccionLeccion> = {
  "historia-anclaje-cronologico": {
    nombre: "Chronological anchoring: four dates that organize everything",
    descripcion: "Use a few dates you already know as reference points and place any event by its distance to the nearest one.",
    pasos: [
      "An anchor date is one you already know well and use as a reference point. Instead of memorizing every year one by one, you place the new event by its distance to an anchor.",
      "School history has four natural anchors, the ones that separate the five eras: 3500 BC (the invention of writing), 476 AD (the fall of the Western Roman Empire), 1492 (Columbus reaches the Americas) and 1789 (the French Revolution).",
      "These are conventions, not laws of nature: other textbooks put the end of the Middle Ages at the fall of Constantinople (1453) and the end of the Early Modern Age at American independence (1776) or at Waterloo (1815). Use the four school anchors, but know that variants exist.",
      "Example: the “Battle of Marathon” took place in 490 BC. It is later than 3500 BC and earlier than 476 AD, so it falls in Antiquity. And “Copernicus publishes his heliocentric theory,” in 1543, is only 51 years after Columbus reached the Americas: it belongs to the Early Modern Age.",
      "To place a new event, first ask yourself between which two anchors it falls and then which one it is closer to.",
    ],
    quiz: [
      {
        pregunta: "Which event marks, by school convention, the beginning of the Middle Ages?",
        opciones: [
          "Columbus reaches the Americas",
          "Storming of the Bastille, start of the French Revolution",
          "Invention of writing in Sumer",
          "Fall of the Western Roman Empire",
        ],
        respuesta: 3,
        explicacion:
          "By school convention the Middle Ages begin with the fall of the Western Roman Empire (476 AD). Columbus's arrival opens the Early Modern Age, the French Revolution the Contemporary Age and writing, Antiquity.",
      },
      {
        pregunta: "According to school periodization, in which era did the “Battle of Hastings” take place?",
        opciones: ["Antiquity", "Middle Ages", "Early Modern Age", "Prehistory"],
        respuesta: 1,
        explicacion: "1066 falls in the Middle Ages (from 476 AD, by school convention).",
      },
      {
        pregunta: "Why are the boundaries between eras said to be conventions?",
        opciones: [
          "Because those events did not really happen",
          "Because the years of those events change every century",
          "Because every country celebrates its own official date",
          "Because historians choose them to organize study, and other textbooks use different dates",
        ],
        respuesta: 3,
        explicacion:
          "A convention is a useful agreement for organizing study. The events at the anchors did happen, but other books put the boundaries at other dates.",
      },
      {
        pregunta: "Which of these anchors is “Copernicus publishes his heliocentric theory” closest to?",
        opciones: [
          "Invention of writing in Sumer (3500 BC)",
          "Fall of the Western Roman Empire (476 AD)",
          "Storming of the Bastille, start of the French Revolution (1789)",
          "Columbus reaches the Americas (1492)",
        ],
        respuesta: 3,
        explicacion:
          "Copernicus publishes his heliocentric theory in 1543: that is 51 years after Columbus reached the Americas and 246 years before the French Revolution.",
      },
    ],
    visuales: ["The four anchors between the five eras", "Two examples between the anchors"],
  },
  "historia-linea-de-tiempo-mental": {
    nombre: "Mental timeline",
    descripcion: "Picture events as points on a line running from the distant past to today, and walk along it instead of reciting a list.",
    pasos: [
      "Picture a straight line: at one end, the most distant past; at the other, today. Each new event is a point you place on it, close to the ones you already know.",
      "When you are asked to order several events, do not recite a list: walk the line from one end to the other. That way, ordering stops being calculation and becomes reading.",
      "Apply it to Prehistory, which is the longest part of the line. These six events happened before writing existed and are ordered from left to right, from oldest to most recent.",
      "Millions of years pass between the first and the last, so the Prehistory line cannot be drawn to scale: you remember the order of the events, not the distances.",
    ],
    quiz: [
      {
        pregunta: "According to this technique, how is it best to picture the events of a historical period?",
        opciones: [
          "As points placed on a line, from the distant past to today",
          "As an alphabetically ordered list",
          "As a table of rows and columns",
          "As a family tree",
        ],
        respuesta: 0,
        explicacion: "The technique proposes an imaginary line: ordering becomes walking along it from one end to the other.",
      },
      {
        pregunta: "Which came first: “Controlled use of fire by hominids” or “Lascaux cave paintings”?",
        opciones: [
          "Controlled use of fire by hominids",
          "Lascaux cave paintings",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 0,
        explicacion: "Controlled use of fire by hominids dates to c. 800,000 BC and the Lascaux cave paintings to c. 17,000 BC.",
      },
      {
        pregunta: "Why is the Prehistory line not drawn to scale?",
        opciones: [
          "Because millions of years pass between the first events and the last",
          "Because Prehistory has no events",
          "Because BC dates cannot be drawn",
          "Because a scale only works for events with an exact date",
        ],
        respuesta: 0,
        explicacion:
          "Between “First knapped stone tools” (c. 2,500,000 BC) and “Lascaux cave paintings” (c. 17,000 BC) there are more than two million years: the most recent events would end up squeezed together.",
      },
      {
        pregunta: "According to school periodization, in which era did the “Lascaux cave paintings” appear?",
        opciones: ["Antiquity", "Prehistory", "Middle Ages", "Early Modern Age"],
        respuesta: 1,
        explicacion: "c. 17,000 BC falls in Prehistory (up to 3500 BC, by school convention).",
      },
    ],
    visuales: ["Six events of Prehistory, in order (not to scale)"],
  },
  "historia-tecnica-fechas-aproximadas": {
    nombre: "When there are no years: approximate dates and “c.”",
    descripcion: "Before writing, dates are estimates: learn to read “c.” and to keep the era and the order, not the year.",
    pasos: [
      "Before writing, nobody recorded dates. Specialists estimate the age of remains using scientific methods, and the result is an estimate with a margin of error, not an exact year.",
      "That is why Prehistory dates are written with “c.”: the “Start of agriculture in the Fertile Crescent” happened c. 9000 BC. The older an event is, the bigger the margin: a few centuries for agriculture, hundreds of thousands of years for the first tools.",
      "Other dates are conventional: school fixes them even if books disagree a little. The invention of writing is placed at 3500 BC by convention, and that date marks the end of Prehistory.",
      "Practical rule: if a date carries a “c.”, do not memorize it as an exact year. Keep the order of the events and the era in which they happened; the year is only an order of magnitude.",
    ],
    quiz: [
      {
        pregunta: "What does “c. 9000 BC” mean?",
        opciones: [
          "That it happened in exactly that year",
          "That it happened approximately in that year, with a margin of error",
          "That it happened after that year",
          "That the date is still secret",
        ],
        respuesta: 1,
        explicacion: "“c.” warns you that the date is an estimate: the event happened around that year, with a margin of error.",
      },
      {
        pregunta: "Why is the date of the invention of writing considered conventional?",
        opciones: [
          "Because school fixes a reference year even if books disagree a little",
          "Because nobody invented writing",
          "Because it is the only exact date in Prehistory",
          "Because it changes every time a book is opened",
        ],
        respuesta: 0,
        explicacion: "Writing did not appear overnight: 3500 BC is taken as a reference to separate Prehistory from Antiquity.",
      },
      {
        pregunta: "According to school periodization, in which era did the “Start of agriculture in the Fertile Crescent” take place?",
        opciones: ["Prehistory", "Antiquity", "Middle Ages", "Early Modern Age"],
        respuesta: 0,
        explicacion: "c. 9000 BC falls in Prehistory (up to 3500 BC, by school convention).",
      },
      {
        pregunta: "Which came first: “End of the last ice age” or “First smelted copper objects”?",
        opciones: [
          "First smelted copper objects",
          "End of the last ice age",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 1,
        explicacion: "The end of the last ice age dates to c. 10,000 BC and the first smelted copper objects to c. 5000 BC.",
      },
    ],
    visuales: ["Four events with approximate dates"],
  },
  "historia-tecnica-causa-y-consecuencia": {
    nombre: "Cause, event and consequence",
    descripcion: "Link events with “because” and “so”: what caused an event and what it caused in turn.",
    pasos: [
      "An event rarely happens alone: a cause pushes it and it pushes a consequence. Looking for that chain helps you remember the order, because a consequence is never earlier than its cause.",
      "Example: when the last ice age ended (c. 10,000 BC) the climate became milder and more stable, and agriculture began in the Near East (c. 9000 BC). With food in storage, villages grew and, in Sumer, writing appeared (3500 BC); its first known uses were keeping accounts.",
      "To check a chain, read it backward with “because” and forward with “so.” If any sentence sounds wrong, there is a misplaced link.",
      "Careful: an event happening after another does not prove it is its consequence. School-level simplification: real events have several causes; here the main chain is shown.",
    ],
    quiz: [
      {
        pregunta: "Which of these events was a consequence of the “Start of agriculture in the Fertile Crescent”?",
        opciones: [
          "Controlled use of fire by hominids",
          "Invention of writing in Sumer",
          "Lascaux cave paintings",
          "Appearance of the first Homo sapiens in Africa",
        ],
        respuesta: 1,
        explicacion:
          "The invention of writing in Sumer (3500 BC) came later and builds on the “Start of agriculture in the Fertile Crescent”; the other events are earlier than c. 9000 BC, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events helped cause the “Start of agriculture in the Fertile Crescent”?",
        opciones: [
          "Invention of writing in Sumer",
          "End of the last ice age",
          "Unification of Upper and Lower Egypt",
          "Construction of the Great Pyramid of Giza",
        ],
        respuesta: 1,
        explicacion:
          "The end of the last ice age (c. 10,000 BC) came earlier and helped cause it; the other events happened after c. 9000 BC, so they cannot be a cause.",
      },
      {
        pregunta: "If one event happens after another, can you claim it is its consequence?",
        opciones: [
          "No: happening later does not prove it is a consequence; you have to know the relationship between the two",
          "Yes, always",
          "Yes, if they happened in the same century",
          "Only if they happened in the same region",
        ],
        respuesta: 0,
        explicacion:
          "“After” is not the same as “because of.” To speak of cause and consequence you need a relationship explained by historians.",
      },
      {
        pregunta: "How do you check a chain of causes and consequences?",
        opciones: [
          "By ordering the events by name",
          "By adding up the years between the events",
          "By looking for events from the same region",
          "By reading it backward with “because” and forward with “so”",
        ],
        respuesta: 3,
        explicacion: "If “this happened because the previous thing happened” and “so the next thing happened” sound right, the chain makes sense.",
      },
    ],
    visuales: ["From the ice age to writing"],
  },
  "historia-bloques-por-siglo": {
    nombre: "Group by century, not by loose date",
    descripcion: "Go from a year to its century with a rule and group events into blocks of time: it is much easier to review than a list of loose dates.",
    pasos: [
      "Before learning the exact year of an event, place the century in which it happened. A century is a hundred years, and grouping events by century turns a list of loose dates into a few blocks that are easy to review.",
      "Rule for AD years: century n runs from year (n − 1) · 100 + 1 to year n · 100. That is why the year 1900 belongs to the 19th century and 1901 to the 20th. Example: the “Eruption of Vesuvius and destruction of Pompeii” happened in 79 AD, which is in the 1st century.",
      "For BC years you count backward: the 1st century BC runs from 100 BC to 1 BC. So the “Assassination of Julius Caesar” (44 BC) is in the 1st century BC and the “Battle of Marathon” (490 BC), in the 5th century BC.",
      "Apply it to the first great landmarks of Antiquity. The first block runs up to c. 2500 BC and brings together writing, the unification of Egypt, the Great Pyramid and the cities of the Indus; the second, the age of Hammurabi, the Shang dynasty and the Olmecs; and only then comes Carthage, already in the 9th century BC.",
      "Meet two protagonists of those blocks: Hammurabi (18th century BC) and Ramesses II (13th century BC). Their life dates are approximate.",
    ],
    quiz: [
      {
        pregunta: "In which century did the “Battle of Marathon” take place?",
        opciones: ["6th century BC", "4th century BC", "5th century", "5th century BC"],
        respuesta: 3,
        explicacion:
          "490 BC belongs to the 5th century BC: century n runs from year (n − 1) · 100 + 1 to year n · 100 and, for BC years, you count backward.",
      },
      {
        pregunta: "In which century did the “Assassination of Julius Caesar” take place?",
        opciones: ["2nd century BC", "1st century", "1st century BC", "3rd century BC"],
        respuesta: 2,
        explicacion:
          "44 BC belongs to the 1st century BC: century n runs from year (n − 1) · 100 + 1 to year n · 100 and, for BC years, you count backward.",
      },
      {
        pregunta: "Which century does the year 1900 belong to?",
        opciones: ["20th century", "18th century", "21st century", "19th century"],
        respuesta: 3,
        explicacion: "The 19th century runs from 1801 to 1900: round years close a century, they do not open it.",
      },
      {
        pregunta: "According to this technique, what should you place before the exact year of an event?",
        opciones: [
          "The name of the person who wrote it",
          "The city where it is studied",
          "The century or block of time it belongs to",
          "The day and the month",
        ],
        respuesta: 2,
        explicacion: "Placing the century (the block) first and then refining the year within it is easier than memorizing a flat list of dates.",
      },
    ],
    visuales: [
      "From year to century",
      "The first great landmarks, in blocks of centuries",
      "Two protagonists of the first blocks",
    ],
  },
  "historia-tecnica-anios-antes-de-cristo": {
    nombre: "BC years are counted backward",
    descripcion: "How to order years before Christ without slipping up: the bigger the number, the older the event.",
    pasos: [
      "Years before Christ (BC) are counted backward: the bigger the number, the older the event. That is why the “First Olympic Games of antiquity” (776 BC) came before the “Battle of Marathon” (490 BC).",
      "There is no year 0: after 1 BC comes 1 AD. That is why between “Augustus begins the Roman Empire” (27 BC) and the “Eruption of Vesuvius and destruction of Pompeii” (79 AD) there are 105 years, not 106.",
      "To order several BC years, write them from the highest to the lowest number. Apply it to these eight events: read from top to bottom, their numbers go down because the events are more and more recent.",
      "Common trap: a BC event is always earlier than an AD one, even if the second one's number is small. Always check the era before comparing the numbers.",
      "Four protagonists of this line: Homer (8th century BC), Cyrus II the Great (6th century BC), the Buddha (Siddhartha Gautama) and Confucius, who taught around 500 BC in India and in China.",
    ],
    quiz: [
      {
        pregunta: "Which came first: the “First Olympic Games of antiquity” or the “Battle of Marathon”?",
        opciones: [
          "Battle of Marathon",
          "First Olympic Games of antiquity",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 1,
        explicacion: "The First Olympic Games of antiquity date to 776 BC and the Battle of Marathon to 490 BC.",
      },
      {
        pregunta: "Which came first: “Founding of Rome, according to tradition” or “Start of the Roman Republic”?",
        opciones: [
          "Start of the Roman Republic",
          "Founding of Rome, according to tradition",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 1,
        explicacion: "The founding of Rome, according to tradition, dates to 753 BC and the start of the Roman Republic to 509 BC.",
      },
      {
        pregunta: "How many years are there between 10 BC and 10 AD?",
        opciones: ["20 years", "18 years", "0 years", "19 years"],
        respuesta: 3,
        explicacion: "There is no year 0: from 10 BC to 1 BC there are 9 years, from 1 BC to 1 AD there is 1 year and from 1 AD to 10 AD there are 9 years; in total, 19.",
      },
      {
        pregunta: "In which century did the “First Olympic Games of antiquity” take place?",
        opciones: ["9th century BC", "8th century BC", "7th century BC", "8th century"],
        respuesta: 1,
        explicacion:
          "776 BC belongs to the 8th century BC: century n runs from year (n − 1) · 100 + 1 to year n · 100 and, for BC years, you count backward.",
      },
    ],
    visuales: ["Eight BC events, from oldest to most recent", "Four protagonists"],
  },
  "historia-tecnica-sincronia": {
    nombre: "What was happening elsewhere at the same time?",
    descripcion: "Compare civilizations in the same period instead of studying them separately: it is the key to not mixing up eras.",
    pasos: [
      "Synchrony is what happens at the same time in different places. Instead of studying each civilization separately, always ask yourself: when was this?, and what was happening in the rest of the world meanwhile?",
      "Example between the 4th and 3rd centuries BC: while the “Death of Alexander the Great in Babylon” (323 BC) closed a stage in the Mediterranean, in India the Maurya Empire was founded (c. 321 BC) and, a century later, in China the country was unified (221 BC).",
      "The figure puts the events in lanes by region on a single time axis. Read from left to right and notice which lane each event is in: that is the trick to not confusing civilizations.",
      "Careful: two things happening at the same time does not mean one caused the other. Synchrony is for placing, not for explaining. These other events complete the picture of the period.",
      "Protagonists of the period: Leonidas, Xerxes I, Pericles, Socrates, Plato, Aristotle, Alexander the Great, Euclid.",
    ],
    quiz: [
      {
        pregunta: "What is synchrony?",
        opciones: [
          "Comparing what was happening at the same time in different regions of the world",
          "Ordering events by name",
          "Counting the years between two events",
          "Explaining the cause of an event",
        ],
        respuesta: 0,
        explicacion: "Synchrony means “at the same time”: it is comparing civilizations in the same period.",
      },
      {
        pregunta: "Which came first: “Chandragupta founds the Maurya Empire” or “Qin Shi Huang unifies China”?",
        opciones: [
          "Qin Shi Huang unifies China",
          "Chandragupta founds the Maurya Empire",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 1,
        explicacion: "Chandragupta founds the Maurya Empire in c. 321 BC and Qin Shi Huang unifies China in 221 BC.",
      },
      {
        pregunta: "Which of these events happened in another region, but in the same period as “Chandragupta founds the Maurya Empire”?",
        opciones: [
          "Fall of the Western Roman Empire",
          "Columbus reaches the Americas",
          "Construction of the Great Pyramid of Giza",
          "Death of Alexander the Great in Babylon",
        ],
        respuesta: 3,
        explicacion:
          "Chandragupta founds the Maurya Empire in c. 321 BC and the Death of Alexander the Great in Babylon is in 323 BC: they almost coincide. The other events happened centuries or millennia earlier or later.",
      },
      {
        pregunta: "If two events happen at the same time in different regions, can you claim one caused the other?",
        opciones: [
          "Yes, always",
          "Yes, if both are from the same era",
          "No: synchrony is for placing events, not for explaining them",
          "Only if they happened in the same month",
        ],
        respuesta: 2,
        explicacion: "To speak of a cause you need a relationship explained by historians, not just coincidence in time.",
      },
    ],
    visuales: ["Same period, three regions", "Eight events of the 5th to 3rd centuries BC", "Protagonists of the period"],
  },
  "historia-tecnica-personajes-por-rol": {
    nombre: "Recognize figures by their role and their era",
    descripcion: "To avoid mixing up the protagonists, look at three things: what role they played, when they lived and which event they are linked to.",
    pasos: [
      "Names get confused when they are studied in isolation. For each figure keep three facts: their role (ruler, military leader, scientist...), their era and an event they are linked to. With that they almost never get mixed up.",
      "Example: Julius Caesar was a Roman general and politician linked to “Julius Caesar crosses the Rubicon” (49 BC) and the “Assassination of Julius Caesar” (44 BC). He was not an emperor: the first one was Augustus, who began the Empire in 27 BC.",
      "Another help: ask yourself whether a figure could have been alive at an event. Hannibal could not have known Augustus: they were more than a century apart.",
      "The cards below give the role, the years of life, the era and the events in the table in which each figure appears. The birth and death dates of some are approximate.",
      "The eight events on this technique's line are the ones that frame those eight figures.",
    ],
    quiz: [
      {
        pregunta: "Was Julius Caesar a Roman emperor?",
        opciones: [
          "No: he was a general and politician; the first emperor was Augustus",
          "Yes, he was the first emperor",
          "Yes, he was the last emperor",
          "No: he was a king of Egypt",
        ],
        respuesta: 0,
        explicacion: "Julius Caesar was assassinated in 44 BC, before the Empire began (27 BC) under Augustus.",
      },
      {
        pregunta: "According to the technique, which three facts should you keep about each figure?",
        opciones: [
          "Their favorite color, their city and their food",
          "Their height, their weight and their age",
          "Only their full name",
          "Their role, their era and an event they are linked to",
        ],
        respuesta: 3,
        explicacion: "Role, era and a linked event let you recognize them without confusing them with someone else.",
      },
      {
        pregunta: "Which of these figures could have been alive at the “Battle of Actium” (31 BC)?",
        opciones: ["Augustus", "Hannibal", "Alexander the Great", "Qin Shi Huang"],
        respuesta: 0,
        explicacion: "Augustus (63 BC – 14 AD) was alive in 31 BC and took part in it; the other three died centuries earlier.",
      },
      {
        pregunta: "According to school periodization, in which era did the “Founding of the Han dynasty in China” take place?",
        opciones: ["Prehistory", "Antiquity", "Middle Ages", "Early Modern Age"],
        respuesta: 1,
        explicacion: "202 BC falls in Antiquity (from 3500 BC, by school convention).",
      },
    ],
    visuales: ["Eight figures, eight roles", "The events that frame those figures"],
  },
  "historia-tecnica-cadenas-causales": {
    nombre: "Two-step chains: from event A to event C",
    descripcion: "For a distant consequence, look for the intermediate event: A causes B, and B causes C.",
    pasos: [
      "A two-step chain links three events: A causes B and B causes C. When a question links two distant events, look for the intermediate event that acts as a bridge.",
      "Roman example: Caesar's assassination (44 BC) set off a civil war; one of its decisive battles was the “Battle of Actium” (31 BC); and after it Augustus began the Empire (27 BC).",
      "Another relationship of the period: the Edict of Milan (313 AD) allowed Christianity to be practiced in the Empire, and in 380 AD Christianity was declared the official religion.",
      "School-level simplification: every event has several causes. The best-known chain is chosen, but you should know there are more.",
      "These ten events complete the timeline from the Empire of Augustus to the division of the Roman Empire, along with what was happening at the same time in other regions.",
    ],
    quiz: [
      {
        pregunta: "Which of these events was a consequence of the “Battle of Actium”?",
        opciones: [
          "Augustus begins the Roman Empire",
          "Invention of writing in Sumer",
          "Battle of Marathon",
          "Qin Shi Huang unifies China",
        ],
        respuesta: 0,
        explicacion:
          "Augustus begins the Roman Empire (27 BC) came later and builds on the “Battle of Actium”; the other events are earlier than 31 BC, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events helped cause “Augustus begins the Roman Empire”?",
        opciones: [
          "Battle of Actium",
          "Eruption of Vesuvius and destruction of Pompeii",
          "Edict of Milan",
          "Fall of the Western Roman Empire",
        ],
        respuesta: 0,
        explicacion:
          "The Battle of Actium (31 BC) came earlier and helped cause it; the other events happened after 27 BC, so they cannot be a cause.",
      },
      {
        pregunta: "In the chain “Caesar's assassination → Actium → Empire,” which is the intermediate event?",
        opciones: [
          "Eruption of Vesuvius and destruction of Pompeii",
          "Edict of Milan",
          "Founding of Rome, according to tradition",
          "Battle of Actium",
        ],
        respuesta: 3,
        explicacion:
          "The chain is Assassination of Julius Caesar (44 BC) → Battle of Actium (31 BC) → Augustus begins the Roman Empire (27 BC). The other events are not between those two.",
      },
      {
        pregunta: "Which of these events was a consequence of the “Edict of Milan”?",
        opciones: [
          "Invention of writing in Sumer",
          "Christianity is declared the official religion of the Roman Empire",
          "Battle of Marathon",
          "Eruption of Vesuvius and destruction of Pompeii",
        ],
        respuesta: 1,
        explicacion:
          "Christianity is declared the official religion of the Roman Empire (380 AD) came later and builds on the “Edict of Milan”; the other events are earlier than 313 AD, so they cannot be its consequence.",
      },
    ],
    visuales: ["From the Ides of March to the Empire", "Ten events of the end of Antiquity", "Two protagonists"],
  },
  "historia-asociacion-memorable": {
    nombre: "Memorable association",
    descripcion:
      "Connect an event with an image or with a real, distinctive fact: it is remembered better than repeating a date out loud. Without making anything up.",
    pasos: [
      "For each event you find hard to remember, look for a real, distinctive image or detail that connects it to the key fact. The odder or more vivid the image, the longer it sticks, and it does not have to make sense to anyone else.",
      "Example with Charlemagne: his name comes from Latin (Carolus Magnus) and means “Charles the Great.” Picture a Christmas wreath, because he was crowned emperor on Christmas Day in 800 AD.",
      "Example with the “Hijra: Muhammad and his followers move from Mecca to Medina”: “hijra” means “migration.” Picture a caravan leaving Mecca for Medina in 622 AD, the starting point of the Islamic calendar.",
      "Honesty rule: the association helps you remember, but never make up a fact so that it rhymes or sounds better. If the image says something false, it is better not to use it. Then, the next day, review the association once more: that second review fixes it in place.",
      "Apply it to these eight events of the first centuries of the Middle Ages and to four protagonists (Justinian I, Muhammad, Charlemagne, Al-Khwarizmi).",
    ],
    quiz: [
      {
        pregunta: "According to this technique, what makes an association useful?",
        opciones: [
          "That it makes up a date that rhymes",
          "That it is long and complicated",
          "That it copies the one for another event",
          "That it connects the event with a real, distinctive image or fact",
        ],
        respuesta: 3,
        explicacion: "The image or fact must be real and striking; making up facts so that they rhyme produces mistakes.",
      },
      {
        pregunta: "Which came first: the “Hijra: Muhammad and his followers move from Mecca to Medina” or “Charlemagne is crowned emperor”?",
        opciones: [
          "Hijra: Muhammad and his followers move from Mecca to Medina",
          "Charlemagne is crowned emperor",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 0,
        explicacion:
          "The Hijra: Muhammad and his followers move from Mecca to Medina dates to 622 AD and Charlemagne is crowned emperor to 800 AD.",
      },
      {
        pregunta: "What does “hijra” mean?",
        opciones: ["Migration", "Battle", "Coronation", "Pilgrimage to Mecca"],
        respuesta: 0,
        explicacion:
          "The Hijra: Muhammad and his followers move from Mecca to Medina (622 AD) was the move of Muhammad and his followers from Mecca to Medina; the word means “migration.”",
      },
      {
        pregunta: "Who was this figure? King of the Franks. He was crowned emperor by the pope on Christmas Day in the year 800.",
        opciones: ["Muhammad", "Justinian I", "Charlemagne", "Genghis Khan"],
        respuesta: 2,
        explicacion: "Charlemagne (742 AD – 814 AD (approximate dates)): he was crowned emperor by the pope on Christmas Day in the year 800.",
      },
    ],
    visuales: ["Eight events of the Early Middle Ages", "Four protagonists"],
  },
  "historia-siglas-para-secuencias": {
    nombre: "Acronyms to remember short sequences",
    descripcion: "When you have to memorize the order of three or four events, build an acronym from the first letter of each one.",
    pasos: [
      "Take the first letter (or syllable) of each event, in the right order. Use them to build a word or a short phrase; it does not have to be a real word, it just has to be easy for you to pronounce.",
      "Example: “Schism between the Eastern and Western Churches” (1054), “Battle of Hastings” (1066), “Start of the First Crusade” (1096) and “Saladin retakes Jerusalem” (1187). The initials, in that order, are S-H-C-S: “shucks.”",
      "The acronym gives you the ORDER, not the context. Combine it with the mental timeline: the acronym fixes the order and the line shows you where each event falls.",
      "Apply it to these eight events of the 9th to 12th centuries and to five protagonists of the period. Say it out loud a couple of times: the rhythm of the acronym helps more than looking at the list.",
    ],
    quiz: [
      {
        pregunta: "Which acronym results from ordering “East-West Schism, Hastings, First Crusade, Saladin”?",
        opciones: ["H-C-S-S", "S-S-H-C", "S-H-C-S", "S-C-H-S"],
        respuesta: 2,
        explicacion: "The initials in chronological order are S (1054), H (1066), C (1096) and S (1187).",
      },
      {
        pregunta: "Which came first: the “Battle of Hastings” or the “Start of the First Crusade”?",
        opciones: [
          "Start of the First Crusade",
          "They happened in the same year",
          "Battle of Hastings",
          "There is no way to know which came first",
        ],
        respuesta: 2,
        explicacion: "The Battle of Hastings dates to 1066 and the Start of the First Crusade to 1096.",
      },
      {
        pregunta: "According to the technique, what should you combine with the acronym?",
        opciones: [
          "A map of the city",
          "The mental timeline: the acronym gives the order and the line gives the context",
          "The alphabetical list of the names",
          "A made-up date",
        ],
        respuesta: 1,
        explicacion: "The acronym is for remembering the order; the timeline shows when and where each event happened.",
      },
      {
        pregunta: "In which century did the “Battle of Hastings” take place?",
        opciones: ["11th century", "12th century", "10th century", "11th century BC"],
        respuesta: 0,
        explicacion:
          "1066 belongs to the 11th century: century n runs from year (n − 1) · 100 + 1 to year n · 100 and, for BC years, you count backward.",
      },
    ],
    visuales: ["Eight events of the 9th to 12th centuries", "Five protagonists"],
  },
  "historia-tecnica-sincronia-siglo-xiii": {
    nombre: "The 13th century: four regions at once",
    descripcion: "Apply synchrony to the 13th century: what was happening at the same time in Europe, Africa, Central Asia and East Asia.",
    pasos: [
      "Remember: synchrony means comparing what was happening at the same time in different regions, on a single time axis, instead of studying each civilization separately.",
      "Example from the 13th century: in Central Asia “Temüjin is proclaimed Genghis Khan” (1206) gave rise to the Mongol Empire; in England “Magna Carta in England” (1215) was signed; in West Africa “Sundiata Keita founds the Mali Empire” (c. 1235) took shape; and in China the Mongols founded the Yuan dynasty (1271).",
      "Read the axis from left to right and compare the lanes: one century, four different worlds. That way you do not confuse which civilization was where at which moment.",
      "The other events of the century, on the line below, and five protagonists: Minamoto no Yoritomo, Genghis Khan, Kublai Khan, Sundiata Keita, Marco Polo.",
    ],
    quiz: [
      {
        pregunta: "Which event happened in another region, but in the same century as “Magna Carta in England”?",
        opciones: [
          "Fall of the Western Roman Empire",
          "Columbus reaches the Americas",
          "Start of the Tang dynasty in China",
          "Sundiata Keita founds the Mali Empire",
        ],
        respuesta: 3,
        explicacion:
          "Magna Carta in England dates to 1215, 13th century; Sundiata Keita founds the Mali Empire dates to c. 1235, the same century. The other events are from very different centuries.",
      },
      {
        pregunta: "Which came first: “Temüjin is proclaimed Genghis Khan” or “Kublai Khan founds the Yuan dynasty in China”?",
        opciones: [
          "Temüjin is proclaimed Genghis Khan",
          "Kublai Khan founds the Yuan dynasty in China",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 0,
        explicacion: "Temüjin is proclaimed Genghis Khan in 1206 and Kublai Khan founds the Yuan dynasty in China in 1271.",
      },
      {
        pregunta: "In which century did “Kublai Khan founds the Yuan dynasty in China” take place?",
        opciones: ["14th century", "12th century", "13th century", "13th century BC"],
        respuesta: 2,
        explicacion:
          "1271 belongs to the 13th century: century n runs from year (n − 1) · 100 + 1 to year n · 100 and, for BC years, you count backward.",
      },
      {
        pregunta: "Who was this figure? Mongol emperor of China. A grandson of Genghis Khan, he founded the Yuan dynasty in China.",
        opciones: ["Genghis Khan", "Marco Polo", "Saladin", "Kublai Khan"],
        respuesta: 3,
        explicacion: "Kublai Khan (1215 – 1294): a grandson of Genghis Khan, he founded the Yuan dynasty in China.",
      },
    ],
    visuales: ["From 1192 to 1271, four regions", "Eight events of the 13th century (and the late 12th)", "Five protagonists"],
  },
  "historia-tecnica-causa-y-efecto-siglo-xiv": {
    nombre: "Cause and effect in the 14th century",
    descripcion: "Link the events of the 14th century with “because” and “so”: how one empire leads to another and how a rich kingdom becomes famous.",
    pasos: [
      "Remember: a consequence is never earlier than its cause. To check a chain, read it backward with “because” and forward with “so.”",
      "Example 1: the Mali Empire, founded by “Sundiata Keita founds the Mali Empire” (c. 1235), grew rich on the gold trade; that is why its emperor Mansa Musa was able to make his famous “Mansa Musa's pilgrimage to Mecca” (c. 1324).",
      "Example 2: “Kublai Khan founds the Yuan dynasty in China” (1271), founded by the Mongols in China, came before the “Start of the Ming dynasty in China” (1368), which ruled China after the Mongols left.",
      "The other events of the century (the Black Death, the Hundred Years' War, the travels of Ibn Battuta, Great Zimbabwe, the Maori and Tenochtitlan) are not shown here in a chain; they are still studied as landmarks of the century.",
    ],
    quiz: [
      {
        pregunta: "Which of these events was a consequence of “Kublai Khan founds the Yuan dynasty in China”?",
        opciones: [
          "Start of the Ming dynasty in China",
          "Fall of the Western Roman Empire",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
          "Start of the Tang dynasty in China",
        ],
        respuesta: 0,
        explicacion:
          "Start of the Ming dynasty in China (1368) came later and builds on “Kublai Khan founds the Yuan dynasty in China”; the other events are earlier than 1271, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events was a consequence of “Sundiata Keita founds the Mali Empire”?",
        opciones: [
          "Mansa Musa's pilgrimage to Mecca",
          "Start of the Tang dynasty in China",
          "Fall of the Western Roman Empire",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
        ],
        respuesta: 0,
        explicacion:
          "Mansa Musa's pilgrimage to Mecca (c. 1324) came later and builds on “Sundiata Keita founds the Mali Empire”; the other events are earlier than c. 1235, so they cannot be its consequence.",
      },
      {
        pregunta: "Which came first: “The Black Death reaches Europe” or “Start of the Ming dynasty in China”?",
        opciones: [
          "Start of the Ming dynasty in China",
          "They happened in the same year",
          "The Black Death reaches Europe",
          "There is no way to know which came first",
        ],
        respuesta: 2,
        explicacion: "The Black Death reaches Europe in 1347 and the Start of the Ming dynasty in China in 1368.",
      },
      {
        pregunta: "Who was this figure? Emperor of Mali. His pilgrimage to Mecca, with huge amounts of gold, made him famous around the world.",
        opciones: ["Sundiata Keita", "Mansa Musa", "Ibn Battuta", "Saladin"],
        respuesta: 1,
        explicacion:
          "Mansa Musa (active c. 1324 (approximate dates)): his pilgrimage to Mecca, with huge amounts of gold, made him famous around the world.",
      },
    ],
    visuales: ["A rich kingdom and a famous journey", "From the Mongols to the Ming", "Eight events of the 14th century", "Two travelers of the 14th century"],
  },
  "historia-tecnica-cierre-de-la-edad-media": {
    nombre: "How the Middle Ages end: 1453 or 1492",
    descripcion: "The events of the final years of the Middle Ages and the two dates that books propose as the border with the Early Modern Age.",
    pasos: [
      "Remember: the boundaries between eras are conventions. This lesson uses the school one, 1492 (Columbus reaches the Americas), but other books close the Middle Ages in 1453, with the “Fall of Constantinople to the Ottomans.”",
      "Before those dates, events took place that already herald the modern world: “Zheng He's first maritime expedition” (1405), “Joan of Arc liberates Orléans” (1429) and “Gutenberg prints the Bible with movable type” (c. 1455).",
      "In the Americas, “Pachacuti begins the expansion of the Inca Empire” (c. 1438) and “Construction of Machu Picchu” (c. 1450) show that the Andes had a great state with no contact with Europe at all.",
      "Advice: if a text says “end of the Middle Ages,” check which boundary it uses. Both dates are valid, but they are not the same.",
    ],
    quiz: [
      {
        pregunta: "Which event do other textbooks propose, instead of Columbus's arrival, as the end of the Middle Ages?",
        opciones: [
          "Storming of the Bastille, start of the French Revolution",
          "Fall of the Western Roman Empire",
          "Fall of Constantinople to the Ottomans",
          "Invention of writing in Sumer",
        ],
        respuesta: 2,
        explicacion: "Other textbooks use 1453, the fall of Constantinople, as the end of the Middle Ages; school uses 1492.",
      },
      {
        pregunta: "Which came first: “Joan of Arc liberates Orléans” or “Fall of Constantinople to the Ottomans”?",
        opciones: [
          "Fall of Constantinople to the Ottomans",
          "They happened in the same year",
          "Joan of Arc liberates Orléans",
          "There is no way to know which came first",
        ],
        respuesta: 2,
        explicacion: "Joan of Arc liberates Orléans in 1429 and the Fall of Constantinople to the Ottomans in 1453.",
      },
      {
        pregunta: "Who was this figure? French military heroine. She led French troops at Orléans during the Hundred Years' War and died at the stake.",
        opciones: ["Zheng He", "Pachacuti", "Joan of Arc", "Johannes Gutenberg"],
        respuesta: 2,
        explicacion:
          "Joan of Arc (1412 – 1431 (approximate dates)): she led French troops at Orléans during the Hundred Years' War and died at the stake.",
      },
      {
        pregunta: "According to school periodization, in which era did the “Construction of Machu Picchu” take place?",
        opciones: ["Antiquity", "Middle Ages", "Early Modern Age", "Prehistory"],
        respuesta: 1,
        explicacion: "c. 1450 falls in the Middle Ages (from 476 AD, by school convention).",
      },
    ],
    visuales: ["Six events of the 15th century", "Five protagonists of the 15th century"],
  },
  "historia-tecnica-anclas-de-1492": {
    nombre: "Before and after 1492: use the anchor of the Early Modern Age",
    descripcion: "Place the events of the quarter century after Columbus's arrival by their distance to that anchor.",
    pasos: [
      "Remember: an anchor is a date you know well and use as a reference. The one for the Early Modern Age is 1492, Columbus's arrival in the Americas: by school convention, the Early Modern Age begins with it.",
      "That same year the “Fall of Granada, the last Muslim kingdom on the Iberian Peninsula” took place. Two years later, in 1494, Castile and Portugal signed the Treaty of Tordesillas to divide the zones of exploration; and in 1498 Vasco da Gama reached India by sea, sailing around Africa.",
      "The Renaissance, of which Leonardo da Vinci (“Leonardo da Vinci begins the Mona Lisa,” c. 1503) and Michelangelo (the ceiling of the Sistine Chapel, 1508) are part, follows closely.",
      "And only 25 years after the anchor, Luther published his 95 Theses (1517) and the Protestant Reformation began. Placing each event by its distance to 1492 makes it easy to remember their order.",
    ],
    quiz: [
      {
        pregunta: "Which came first: the “Treaty of Tordesillas between Castile and Portugal” or “Vasco da Gama reaches India by sea”?",
        opciones: [
          "Vasco da Gama reaches India by sea",
          "Treaty of Tordesillas between Castile and Portugal",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 1,
        explicacion: "The Treaty of Tordesillas between Castile and Portugal dates to 1494 and Vasco da Gama reaches India by sea to 1498.",
      },
      {
        pregunta: "Which came first: “Vasco da Gama reaches India by sea” or “Luther publishes the 95 Theses and the Protestant Reformation begins”?",
        opciones: [
          "Luther publishes the 95 Theses and the Protestant Reformation begins",
          "Vasco da Gama reaches India by sea",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 1,
        explicacion:
          "Vasco da Gama reaches India by sea in 1498 and Luther publishes the 95 Theses and the Protestant Reformation begins in 1517.",
      },
      {
        pregunta: "According to school periodization, in which era did “Michelangelo begins painting the ceiling of the Sistine Chapel” take place?",
        opciones: ["Middle Ages", "Early Modern Age", "Contemporary Age", "Prehistory"],
        respuesta: 1,
        explicacion: "1508 falls in the Early Modern Age (from 1492, by school convention).",
      },
      {
        pregunta: "Who was this figure? German theologian. His 95 Theses started the Protestant Reformation.",
        opciones: ["Christopher Columbus", "Martin Luther", "Leonardo da Vinci", "Nicolaus Copernicus"],
        respuesta: 1,
        explicacion: "Martin Luther (1483 – 1546): his 95 Theses started the Protestant Reformation.",
      },
    ],
    visuales: ["A quarter century from the 1492 anchor", "Six protagonists"],
  },
  "historia-tecnica-cadenas-de-la-conquista": {
    nombre: "Two-step chains: from Columbus to the Viceroyalty",
    descripcion: "Link Columbus's arrival with the fall of Tenochtitlan and with the Viceroyalty of New Spain, and other events of exploration.",
    pasos: [
      "Remember: a two-step chain links three events, A causes B and B causes C. When a question links two distant events, look for the intermediate event.",
      "Example: Columbus's voyage (1492) opened the way to new expeditions; one of them, Hernán Cortés's, ended with the “Fall of Tenochtitlan to the Spanish” (1521); and afterward the “Viceroyalty of New Spain is created” (1535). Historians point to several causes of that fall, among them the Spanish alliances with peoples who were enemies of the Mexica and epidemics.",
      "Another chain: Magellan's expedition left Spain (1519) and, after Magellan's death in the Philippines, Elcano completed it: the first circumnavigation of the globe (1522).",
      "These events are on the line below, together with Pizarro's capture of Atahualpa (1532), the Battle of Panipat, which gave rise to the Mughal Empire in India, and Copernicus's theory (1543).",
    ],
    quiz: [
      {
        pregunta: "Which of these events was a consequence of “Columbus reaches the Americas”?",
        opciones: [
          "Fall of Tenochtitlan to the Spanish",
          "Fall of Constantinople to the Ottomans",
          "Gutenberg prints the Bible with movable type",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
        ],
        respuesta: 0,
        explicacion:
          "Fall of Tenochtitlan to the Spanish (1521) came later and builds on “Columbus reaches the Americas”; the other events are earlier than 1492, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events helped cause “Viceroyalty of New Spain is created”?",
        opciones: [
          "Copernicus publishes his heliocentric theory",
          "Defeat of the Spanish Armada",
          "Galileo observes the sky with the telescope",
          "Fall of Tenochtitlan to the Spanish",
        ],
        respuesta: 3,
        explicacion:
          "The Fall of Tenochtitlan to the Spanish (1521) came earlier and helped cause it; the other events happened after 1535, so they cannot be a cause.",
      },
      {
        pregunta: "Which of these events was a consequence of “Magellan leaves Spain with five ships bound for the Moluccas”?",
        opciones: [
          "Fall of Constantinople to the Ottomans",
          "Gutenberg prints the Bible with movable type",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
          "The Magellan–Elcano expedition completes the first circumnavigation of the globe",
        ],
        respuesta: 3,
        explicacion:
          "The Magellan–Elcano expedition completes the first circumnavigation of the globe (1522) came later and builds on “Magellan leaves Spain with five ships bound for the Moluccas”; the other events are earlier than 1519, so they cannot be its consequence.",
      },
      {
        pregunta: "Who was this figure? Spanish navigator. He completed the first circumnavigation of the globe in command of the ship Victoria.",
        opciones: ["Juan Sebastián Elcano", "Ferdinand Magellan", "Christopher Columbus", "Vasco da Gama"],
        respuesta: 0,
        explicacion:
          "Juan Sebastián Elcano (died in 1526 (approximate dates)): he completed the first circumnavigation of the globe in command of the ship Victoria.",
      },
    ],
    visuales: ["From Columbus to the Viceroyalty", "Eight events from 1492 to 1543", "Eight protagonists"],
  },
  "historia-tecnica-sincronia-siglo-xvi": {
    nombre: "Late 16th and early 17th century: four regions at once",
    descripcion: "Apply synchrony: what was happening at the same time in India, Europe, Japan and North America.",
    pasos: [
      "Remember: synchrony is comparing what was happening at the same time in different regions on a single time axis, so as not to mix up civilizations.",
      "Example: in India the reign of Akbar began (1556); in Europe the “Defeat of the Spanish Armada” took place (1588) and Cervantes published “Cervantes publishes the first part of Don Quixote” (1605); in Japan the “Tokugawa shogunate begins in Japan” (1603) got under way; and in North America the “Founding of Jamestown, the first lasting English settlement in North America” (1607) was established.",
      "These events took place within roughly half a century, but in worlds with almost no contact with each other. Three more complete the line: “Tokugawa Ieyasu wins at Sekigahara” (1600), “Galileo observes the sky with the telescope” (1609) and “Start of the Thirty Years' War” (1618).",
      "Five protagonists of that time: Akbar, Tokugawa Ieyasu, Shakespeare, Cervantes and Galileo.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Akbar begins his reign in the Mughal Empire” or “Defeat of the Spanish Armada”?",
        opciones: [
          "Defeat of the Spanish Armada",
          "They happened in the same year",
          "There is no way to know which came first",
          "Akbar begins his reign in the Mughal Empire",
        ],
        respuesta: 3,
        explicacion: "Akbar begins his reign in the Mughal Empire in 1556 and the Defeat of the Spanish Armada in 1588.",
      },
      {
        pregunta: "Which came first: “Defeat of the Spanish Armada” or “Tokugawa shogunate begins in Japan”?",
        opciones: [
          "Tokugawa shogunate begins in Japan",
          "They happened in the same year",
          "Defeat of the Spanish Armada",
          "There is no way to know which came first",
        ],
        respuesta: 2,
        explicacion: "The Defeat of the Spanish Armada dates to 1588 and the Tokugawa shogunate begins in Japan to 1603.",
      },
      {
        pregunta: "In which century did the “Tokugawa shogunate begins in Japan” take place?",
        opciones: ["18th century", "16th century", "17th century", "17th century BC"],
        respuesta: 2,
        explicacion:
          "1603 belongs to the 17th century: century n runs from year (n − 1) · 100 + 1 to year n · 100 and, for BC years, you count backward.",
      },
      {
        pregunta: "Who was this figure? Spanish writer. He wrote Don Quixote of La Mancha.",
        opciones: ["Miguel de Cervantes", "William Shakespeare", "Galileo Galilei", "Akbar"],
        respuesta: 0,
        explicacion: "Miguel de Cervantes (1547 – 1616): he wrote Don Quixote of La Mancha.",
      },
    ],
    visuales: ["From 1556 to 1607, four regions", "Eight events from 1556 to 1618", "Five protagonists"],
  },
  "historia-tecnica-personajes-siglo-xvii": {
    nombre: "Recognize 17th-century figures by their role",
    descripcion: "Tell an African queen, a Mughal emperor and an English scientist apart by their role, their era and the event that identifies them.",
    pasos: [
      "Remember: to avoid confusing figures, keep three facts about each one: their role, their era and an event they are linked to.",
      "Example: Nzinga was queen of Ndongo and Matamba and resisted Portuguese pressure for decades (1624); Shah Jahan, a Mughal emperor, had the Taj Mahal built (1632); and Isaac Newton, an English scientist, published the Principia (1687).",
      "Around them, events took place elsewhere: the arrival of the first enslaved Africans in Virginia (1619), the Peace of Westphalia (1648), the Qing dynasty in China (1644) and the Seven Years' War (1756).",
    ],
    quiz: [
      {
        pregunta: "Who was this figure? Queen of Ndongo and Matamba. She resisted Portuguese pressure in Central Africa for decades.",
        opciones: ["Nzinga", "Shah Jahan", "Isaac Newton", "Cleopatra VII"],
        respuesta: 0,
        explicacion: "Nzinga (1583 – 1663): she resisted Portuguese pressure in Central Africa for decades.",
      },
      {
        pregunta: "Who was this figure? English scientist. He formulated the law of universal gravitation.",
        opciones: ["Shah Jahan", "Galileo Galilei", "Isaac Newton", "Nicolaus Copernicus"],
        respuesta: 2,
        explicacion: "Isaac Newton (1643 – 1727 (approximate dates)): he formulated the law of universal gravitation.",
      },
      {
        pregunta: "Which came first: “Construction of the Taj Mahal begins” or “Seven Years' War”?",
        opciones: [
          "Construction of the Taj Mahal begins",
          "Seven Years' War",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 0,
        explicacion: "Construction of the Taj Mahal begins in 1632 and the Seven Years' War in 1756.",
      },
      {
        pregunta: "Which three facts should you keep about each figure?",
        opciones: [
          "Their height, their weight and their age",
          "Only their full name",
          "Their role, their era and an event they are linked to",
          "Their favorite color and their food",
        ],
        respuesta: 2,
        explicacion: "With the role, the era and a linked event you can recognize a figure without confusing them with another.",
      },
    ],
    visuales: ["Three figures, three roles", "Seven events of the 17th century and the mid-18th"],
  },
  "historia-tecnica-cadena-hacia-la-independencia-de-eeuu": {
    nombre: "A chain of three events: from the Seven Years' War to the Constitution",
    descripcion:
      "Link the Seven Years' War, American independence and its Constitution, and place the events of the late 18th century.",
    pasos: [
      "Remember: a consequence is never earlier than its cause, and a chain is checked by reading it backward with “because” and forward with “so.”",
      "Example: the Seven Years' War (1756) left the United Kingdom with heavy debts; the British government imposed new taxes on its North American colonies; the colonies protested and declared their independence (1776); and they created their Constitution (1787).",
      "The late 18th century was also the time of Rousseau's The Social Contract (1762), Watt's steam engine (1769), Cook's voyage to Australia (1770) and Túpac Amaru II's rebellion in the Andes (1780).",
      "School-level simplification: every event has more than one cause. Here the best-known chain is shown.",
    ],
    quiz: [
      {
        pregunta: "Which of these events was a consequence of the “Seven Years' War”?",
        opciones: [
          "Fall of Constantinople to the Ottomans",
          "Gutenberg prints the Bible with movable type",
          "United States Declaration of Independence",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
        ],
        respuesta: 2,
        explicacion:
          "The United States Declaration of Independence (1776) came later and builds on the “Seven Years' War”; the other events are earlier than 1756, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events was a consequence of the “United States Declaration of Independence”?",
        opciones: [
          "Fall of Constantinople to the Ottomans",
          "Columbus reaches the Americas",
          "The United States Constitution is drafted",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
        ],
        respuesta: 2,
        explicacion:
          "The United States Constitution is drafted (1787) came later and builds on the “United States Declaration of Independence”; the other events are earlier than 1776, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events helped cause the “United States Declaration of Independence”?",
        opciones: [
          "Storming of the Bastille, start of the French Revolution",
          "Battle of Waterloo",
          "Seven Years' War",
          "Start of World War I",
        ],
        respuesta: 2,
        explicacion:
          "The Seven Years' War (1756) came earlier and helped cause it; the other events happened after 1776, so they cannot be a cause.",
      },
      {
        pregunta: "Who was this figure? President of the United States. He drafted the Declaration of Independence and was the third president of the United States.",
        opciones: ["George Washington", "Benjamin Franklin", "Jean-Jacques Rousseau", "Thomas Jefferson"],
        respuesta: 3,
        explicacion:
          "Thomas Jefferson (1743 – 1826): he drafted the Declaration of Independence and was the third president of the United States.",
      },
    ],
    visuales: ["From the war to the Constitution", "Six events from 1762 to 1787", "Seven protagonists"],
  },
  "historia-tecnica-cadenas-de-las-revoluciones": {
    nombre: "Two-step chains: from the French Revolution to Haiti and Spanish America",
    descripcion: "Link the events from 1789 to 1810 with two chains: the revolutions, Napoleon and the independence movements.",
    pasos: [
      "Remember: a two-step chain links three events, A causes B and B causes C. When a question links two distant events, look for the intermediate event that acts as a bridge.",
      "Chain 1: “Storming of the Bastille, start of the French Revolution” (1789), the start of the French Revolution, influenced the “Haitian Revolution begins” (1791), which ended in the “Independence of Haiti” (1804).",
      "Chain 2: Napoleon crowned himself emperor (1804); his invasion of Spain (1808) weakened Spanish power; and in c. 1810 the independence revolutions began in Spanish America.",
      "Other events of the period: the Declaration of the Rights of Man (1789), Jenner's vaccine (1796) and Napoleon's campaign in Egypt (1798), which brought the discovery of the Rosetta Stone (1799).",
    ],
    quiz: [
      {
        pregunta: "Which of these events was a consequence of “Storming of the Bastille, start of the French Revolution”?",
        opciones: [
          "Fall of Constantinople to the Ottomans",
          "Haitian Revolution begins",
          "Columbus reaches the Americas",
          "United States Declaration of Independence",
        ],
        respuesta: 1,
        explicacion:
          "The Haitian Revolution begins (1791) came later and builds on “Storming of the Bastille, start of the French Revolution”; the other events are earlier than 1789, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events was a consequence of “Napoleon crowns himself emperor of the French”?",
        opciones: [
          "Fall of Constantinople to the Ottomans",
          "Columbus reaches the Americas",
          "Storming of the Bastille, start of the French Revolution",
          "Napoleon invades Spain",
        ],
        respuesta: 3,
        explicacion:
          "Napoleon invades Spain (1808) came later and builds on “Napoleon crowns himself emperor of the French”; the other events are earlier than 1804, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events helped cause “Independence revolutions begin in Spanish America”?",
        opciones: [
          "Start of World War I",
          "Construction of the Berlin Wall",
          "Napoleon invades Spain",
          "Apollo 11 lands on the Moon",
        ],
        respuesta: 2,
        explicacion:
          "Napoleon invades Spain (1808) came earlier and helped cause it; the other events happened after 1810, so they cannot be a cause.",
      },
      {
        pregunta: "Who was this figure? Emperor of the French. He crowned himself emperor of the French in 1804 and was defeated at Waterloo.",
        opciones: ["Toussaint Louverture", "Edward Jenner", "George Washington", "Napoleon Bonaparte"],
        respuesta: 3,
        explicacion: "Napoleon Bonaparte (1769 – 1821): he crowned himself emperor of the French in 1804 and was defeated at Waterloo.",
      },
    ],
    visuales: [
      "From the French Revolution to Haiti",
      "From Napoleon to the Spanish American independence movements",
      "Ten events from 1789 to 1810",
      "Three protagonists",
    ],
  },
  "historia-tecnica-sincronia-siglo-xix": {
    nombre: "Four continents at once: 1815 and 1839",
    descripcion: "Apply synchrony to the first half of the 19th century: Europe, Africa, the Americas and East Asia.",
    pasos: [
      "Remember: synchrony is comparing what was happening at the same time in different regions on a single time axis.",
      "Example: in Europe the Napoleonic Wars ended with the “Battle of Waterloo” (1815); almost at the same time, in southern Africa Shaka founded the Zulu kingdom (c. 1816), in South America San Martín crossed the Andes (1817) and, some twenty years later, in East Asia the First Opium War began (1839).",
      "The two lines below add the events of the following decades, up to the emancipation of enslaved people in the United States.",
      "Seven protagonists: Shaka, José de San Martín, Simón Bolívar, Jean-François Champollion, Karl Marx, Charles Darwin, Abraham Lincoln.",
    ],
    quiz: [
      {
        pregunta: "Which came first: the “Battle of Waterloo” or “First Opium War begins”?",
        opciones: [
          "First Opium War begins",
          "They happened in the same year",
          "There is no way to know which came first",
          "Battle of Waterloo",
        ],
        respuesta: 3,
        explicacion: "The Battle of Waterloo dates to 1815 and the First Opium War begins in 1839.",
      },
      {
        pregunta: "Which came first: “San Martín crosses the Andes” or “Start of the American Civil War”?",
        opciones: [
          "San Martín crosses the Andes",
          "Start of the American Civil War",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 0,
        explicacion: "San Martín crosses the Andes in 1817 and the Start of the American Civil War in 1861.",
      },
      {
        pregunta: "In which century did “Darwin publishes On the Origin of Species” take place?",
        opciones: ["20th century", "19th century", "18th century", "19th century BC"],
        respuesta: 1,
        explicacion:
          "1859 belongs to the 19th century: century n runs from year (n − 1) · 100 + 1 to year n · 100 and, for BC years, you count backward.",
      },
      {
        pregunta: "Who was this figure? President of the United States. He was president during the Civil War and proclaimed the emancipation of enslaved people.",
        opciones: ["Charles Darwin", "Abraham Lincoln", "Karl Marx", "Simón Bolívar"],
        respuesta: 1,
        explicacion:
          "Abraham Lincoln (1809 – 1865): he was president during the Civil War and proclaimed the emancipation of enslaved people.",
      },
    ],
    visuales: ["From 1815 to 1839, four regions", "From 1815 to 1824", "From 1830 to 1863", "Seven protagonists"],
  },
  "historia-tecnica-cambio-de-siglo": {
    nombre: "The turn of the century: round years close the century",
    descripcion: "Practice going from year to century with round years like 1900 and 2000, and place the events between 1868 and 1912.",
    pasos: [
      "Remember: century n runs from year (n − 1) · 100 + 1 to year n · 100. A round year closes the century; it does not open it.",
      "That is why “Ethiopia defeats Italy at the Battle of Adwa” (1896) is from the 19th century, while the “First powered flight by the Wright brothers” (1903) is already from the 20th century. And the year 1900 is still from the 19th century and 2000 from the 20th.",
      "The turn from the 19th to the 20th century brings together events from all over the world: the “Meiji Restoration in Japan” (1868), the Suez Canal (1869), Bell's telephone (1876), the Berlin Conference (1884), women's suffrage in New Zealand (1893), Einstein's relativity (1905) and the Chinese Republic (1912).",
      "Eight protagonists: Otto von Bismarck, Emperor Meiji, Alexander Graham Bell, Menelik II, Marie Curie, Sun Yat-sen, Rabindranath Tagore, Albert Einstein.",
    ],
    quiz: [
      {
        pregunta: "In which century did “Ethiopia defeats Italy at the Battle of Adwa” take place?",
        opciones: ["20th century", "19th century", "18th century", "19th century BC"],
        respuesta: 1,
        explicacion:
          "1896 belongs to the 19th century: century n runs from year (n − 1) · 100 + 1 to year n · 100 and, for BC years, you count backward.",
      },
      {
        pregunta: "In which century did the “First powered flight by the Wright brothers” take place?",
        opciones: ["21st century", "19th century", "20th century", "20th century BC"],
        respuesta: 2,
        explicacion:
          "1903 belongs to the 20th century: century n runs from year (n − 1) · 100 + 1 to year n · 100 and, for BC years, you count backward.",
      },
      {
        pregunta: "Which century does the year 2000 belong to?",
        opciones: ["21st century", "20th century", "19th century", "22nd century"],
        respuesta: 1,
        explicacion: "The year 2000 closes the 20th century; the 21st century began in the year 2001.",
      },
      {
        pregunta: "Which came first: “Bell patents the telephone” or the “First powered flight by the Wright brothers”?",
        opciones: [
          "First powered flight by the Wright brothers",
          "Bell patents the telephone",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 1,
        explicacion: "Bell patents the telephone in 1876 and the First powered flight by the Wright brothers takes place in 1903.",
      },
    ],
    visuales: ["Round years and the turn of the century", "Nine events from 1868 to 1912", "Eight protagonists"],
  },
  "historia-tecnica-causas-de-la-primera-guerra": {
    nombre: "Causes and consequences: World War I and the 1929 crisis",
    descripcion: "Three short chains from the first decades of the 20th century: the war and the Russian Revolution, the war and Versailles, and the 1929 crisis.",
    pasos: [
      "Remember: a consequence is never earlier than its cause. To check a chain, read it backward with “because” and forward with “so.”",
      "Chain 1: “Assassination of Archduke Franz Ferdinand in Sarajevo” (1914) was the trigger of the “Start of World War I” (1914); during the war the “October Revolution in Russia” (1917) took place, from which the “Founding of the Soviet Union” (1922) emerged.",
      "Chain 2: the war ended with the armistice (1918) and the victorious powers signed the Treaty of Versailles (1919). Chain 3: the 1929 stock market crash in New York was followed by the Great Depression, a worldwide economic crisis.",
      "Other events of those decades: the discovery of penicillin (1928) and Gandhi's Salt March (1930). Protagonists: Vladimir Lenin, Mahatma Gandhi, Alexander Fleming.",
    ],
    quiz: [
      {
        pregunta: "Which of these events was a consequence of “Assassination of Archduke Franz Ferdinand in Sarajevo”?",
        opciones: [
          "Storming of the Bastille, start of the French Revolution",
          "Battle of Waterloo",
          "Meiji Restoration in Japan",
          "Start of World War I",
        ],
        respuesta: 3,
        explicacion:
          "The Start of World War I (1914) came later and builds on “Assassination of Archduke Franz Ferdinand in Sarajevo”; the other events are earlier than 1914, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events was a consequence of the “Start of World War I”?",
        opciones: [
          "Storming of the Bastille, start of the French Revolution",
          "Battle of Waterloo",
          "Meiji Restoration in Japan",
          "October Revolution in Russia",
        ],
        respuesta: 3,
        explicacion:
          "The October Revolution in Russia (1917) came later and builds on the “Start of World War I”; the other events are earlier than 1914, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events helped cause the “Treaty of Versailles”?",
        opciones: [
          "Start of World War II",
          "Construction of the Berlin Wall",
          "Armistice ends World War I",
          "Apollo 11 lands on the Moon",
        ],
        respuesta: 2,
        explicacion:
          "The Armistice that ends World War I (1918) came earlier and helped cause it; the other events happened after 1919, so they cannot be a cause.",
      },
      {
        pregunta: "Which of these events helped cause “Great Depression begins”?",
        opciones: [
          "Start of World War II",
          "Construction of the Berlin Wall",
          "Apollo 11 lands on the Moon",
          "Stock market crash on Wall Street",
        ],
        respuesta: 3,
        explicacion:
          "The Stock market crash on Wall Street (1929) came earlier and helped cause it; the other events happened after 1929, so they cannot be a cause.",
      },
    ],
    visuales: [
      "From the Sarajevo assassination to the USSR",
      "From the war to Versailles",
      "From the crash to the Depression",
      "Ten events from 1914 to 1930",
      "Three protagonists",
    ],
  },
  "historia-tecnica-personajes-de-la-segunda-guerra": {
    nombre: "Figures by role: World War II and the postwar years",
    descripcion: "Recognize the protagonists from 1939 to 1949 by their role, their country and a linked event, without value judgments.",
    pasos: [
      "Remember: to avoid confusing figures, keep their role, their era and a linked event. In recent history it is best to record only verifiable facts, without value judgments.",
      "Examples: Winston Churchill was prime minister of the United Kingdom for most of the war; Franklin D. Roosevelt was president of the United States when it entered the war (1941); Joseph Stalin ruled the Soviet Union; Adolf Hitler was chancellor of Germany when the war began (1939).",
      "After the war (1945) new protagonists emerged: Eleanor Roosevelt, who chaired the committee that drafted the Universal Declaration of Human Rights (1948); Jawaharlal Nehru, the first head of government of independent India (1947); and Mao Zedong, who proclaimed the People's Republic of China (1949).",
      "The two lines below put the twelve events of the war and the immediate postwar period in order.",
    ],
    quiz: [
      {
        pregunta: "Who was this figure? British prime minister. He was prime minister of the United Kingdom for most of World War II.",
        opciones: ["Franklin D. Roosevelt", "Joseph Stalin", "Jawaharlal Nehru", "Winston Churchill"],
        respuesta: 3,
        explicacion: "Winston Churchill (1874 – 1965): he was prime minister of the United Kingdom for most of World War II.",
      },
      {
        pregunta: "Who was this figure? American diplomat. She chaired the committee that drafted the Universal Declaration of Human Rights.",
        opciones: ["Eleanor Roosevelt", "Franklin D. Roosevelt", "Winston Churchill", "Marie Curie"],
        respuesta: 0,
        explicacion: "Eleanor Roosevelt (1884 – 1962): she chaired the committee that drafted the Universal Declaration of Human Rights.",
      },
      {
        pregunta: "Which came first: “Attack on Pearl Harbor” or “Universal Declaration of Human Rights”?",
        opciones: [
          "Universal Declaration of Human Rights",
          "They happened in the same year",
          "Attack on Pearl Harbor",
          "There is no way to know which came first",
        ],
        respuesta: 2,
        explicacion: "The Attack on Pearl Harbor dates to 1941 and the Universal Declaration of Human Rights to 1948.",
      },
      {
        pregunta: "Which came first: “Founding of the United Nations” or “Independence of India and Pakistan”?",
        opciones: [
          "Independence of India and Pakistan",
          "They happened in the same year",
          "There is no way to know which came first",
          "Founding of the United Nations",
        ],
        respuesta: 3,
        explicacion: "The Founding of the United Nations dates to 1945 and the Independence of India and Pakistan to 1947.",
      },
    ],
    visuales: ["Seven protagonists", "From 1939 to 1945", "From 1945 to 1949"],
  },
  "historia-tecnica-hechos-y-opiniones": {
    nombre: "Facts and opinions: how to study recent history",
    descripcion: "Separate a fact (with a date and protagonists) from a judgment or an interpretation, and place the events from 1957 to 2020.",
    pasos: [
      "A fact has a date, a place and protagonists and can be checked. An opinion or an interpretation says whether something was good or bad, or why it “really” happened; historians debate it and it can change.",
      "Examples: “Apollo 11 landed on the Moon in 1969” is a fact. “It was humanity's greatest achievement” is an opinion. “The Berlin Wall fell in 1989” is a fact.",
      "The more recent a period is, the closer readers' opinions are. That is why this course teaches only what has broad consensus about recent history: what happened, when and who took part. Disputed figures and judgments are left out.",
      "Apply the technique to the events from 1957 to 2020: the two lines below contain only facts and the card of eight protagonists, with no judgments.",
    ],
    quiz: [
      {
        pregunta: "Which of these statements is a fact?",
        opciones: [
          "The Moon landing was humanity's greatest achievement",
          "The Moon landing was a waste of money",
          "The Moon landing was the best thing that happened in the 20th century",
          "Apollo 11 landed on the Moon in 1969",
        ],
        respuesta: 3,
        explicacion: "A fact can be checked with a date and protagonists; the other options are opinions or judgments.",
      },
      {
        pregunta: "According to this technique, what is taught about recent history?",
        opciones: [
          "Each author's opinions",
          "What has broad consensus: what happened, when and who took part",
          "Only the disputed figures",
          "Only what happened more than a thousand years ago",
        ],
        respuesta: 1,
        explicacion: "In recent history it is best to stick to verifiable dates and protagonists and to avoid judgments.",
      },
      {
        pregunta: "Which came first: “Launch of Sputnik 1” or “Fall of the Berlin Wall”?",
        opciones: [
          "Fall of the Berlin Wall",
          "They happened in the same year",
          "Launch of Sputnik 1",
          "There is no way to know which came first",
        ],
        respuesta: 2,
        explicacion: "The Launch of Sputnik 1 dates to 1957 and the Fall of the Berlin Wall to 1989.",
      },
      {
        pregunta: "Who was this figure? President of South Africa. He spent 27 years in prison and was the first president of South Africa elected in multiracial voting.",
        opciones: ["John F. Kennedy", "Kwame Nkrumah", "Nelson Mandela", "Mikhail Gorbachev"],
        respuesta: 2,
        explicacion:
          "Nelson Mandela (1918 – 2013): he spent 27 years in prison and was the first president of South Africa elected in multiracial voting.",
      },
    ],
    visuales: ["From 1957 to 1969", "From 1980 to 2020", "Eight protagonists"],
  },
  "historia-clase-01-paleolitico": {
    nombre: "The first humans: the Paleolithic",
    descripcion: "How the first humans lived, what changed with fire and how our species reached every continent.",
    pasos: [
      "Goal: by the end you will be able to describe how the first humans lived and put in time order the stone tools, fire, the appearance of Homo sapiens and their migrations.",
      "Context: this is the first lesson of the course and you do not need to know anything beforehand. Just keep in mind that Prehistory is everything that happened before writing (which school places at c. 3500 BC), and that is why its dates are always approximate.",
      "The Paleolithic (“old stone”) is the longest stage of humanity: it begins with the first knapped stone tools (c. 2,500,000 BC) and ends with the end of the last ice age (c. 10,000 BC). School-level simplification: specialists divide it into phases. The groups were small and nomadic, and lived by hunting, fishing and gathering.",
      "Mastering fire (c. 800,000 BC) made it possible to keep warm, cook, scare off animals and lengthen the day. It was the work of hominids that came before our species.",
      "The first Homo sapiens appear in Africa (c. 300,000 BC); that date is revised whenever older remains are discovered. From there our species spread: it reached Australia (c. 50,000 BC) and the Americas (c. 15,000 BC); specialists still debate when it reached the Americas.",
      "Paleolithic humans also left art: the Lascaux cave paintings (c. 17,000 BC), in France, show mostly animals.",
      "Key figures: in Prehistory we do not know names, because nobody wrote them down. We know those people through what they left behind: tools, bones, the remains of campfires and paintings.",
      "Causes and consequences: each advance opened the way to the next. With fire and better tools, groups could survive in cold climates and expand into new territories; that expansion took our species to almost every continent.",
      "Connects with: the next lesson, the Neolithic, where agriculture changes the way of living; and with Antiquity, where writing finally makes it possible to date by year.",
      "Common mistakes: (1) believing that dinosaurs and humans lived together: non-avian dinosaurs went extinct millions of years before our species appeared; (2) picturing a “first human” in a specific year: it was a gradual process; (3) reading “c.” as an exact year.",
    ],
    quiz: [
      {
        pregunta: "According to school periodization, in which era did the “Appearance of the first Homo sapiens in Africa” take place?",
        opciones: ["Antiquity", "Middle Ages", "Early Modern Age", "Prehistory"],
        respuesta: 3,
        explicacion: "c. 300,000 BC falls in Prehistory (up to 3500 BC, by school convention).",
      },
      {
        pregunta: "Which came first: “Controlled use of fire by hominids” or “First humans reach Australia”?",
        opciones: [
          "First humans reach Australia",
          "Controlled use of fire by hominids",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 1,
        explicacion: "Controlled use of fire by hominids dates to c. 800,000 BC and the arrival of the first humans in Australia to c. 50,000 BC.",
      },
      {
        pregunta: "Why do we not know the names of people in Prehistory?",
        opciones: [
          "Because back then nobody had a name",
          "Because writing did not exist yet and only material remains survive",
          "Because the names were lost in a war",
          "Because historians decided not to write them down",
        ],
        respuesta: 1,
        explicacion:
          "Prehistory ends, by convention, with the invention of writing: before it there are no texts and only remains such as tools, bones and paintings are studied.",
      },
      {
        pregunta: "Which of these statements about the Paleolithic is correct?",
        opciones: [
          "They lived in large walled cities",
          "The groups were small and nomadic, and lived by hunting, fishing and gathering",
          "They grew cereals in large fields",
          "They wrote tablets to keep accounts",
        ],
        respuesta: 1,
        explicacion: "Cities, agriculture and writing appear much later, with the Neolithic and the end of Prehistory.",
      },
      {
        pregunta: "A date like “c. 300,000 BC” for the appearance of Homo sapiens is...",
        opciones: [
          "The exact year the first human was born",
          "A conventional date fixed by school",
          "An estimate with a large margin of error",
          "A date that is never debated anymore",
        ],
        respuesta: 2,
        explicacion: "Prehistory dates are approximate and are revised when new finds appear.",
      },
    ],
    visuales: ["From the first stone tool to the first migrations"],
  },
  "historia-clase-02-neolitico": {
    nombre: "The Neolithic: the agricultural revolution and the end of Prehistory",
    descripcion: "How agriculture transformed human life and why the appearance of writing closes Prehistory.",
    pasos: [
      "Goal: by the end you will be able to explain what the agricultural revolution was, what changed with it and why the appearance of writing is taken as the end of Prehistory.",
      "Context: in the previous lesson you saw that Paleolithic groups were nomadic. The climate changed when the last ice age ended (c. 10,000 BC) and that opened the way to a new way of life.",
      "With a milder, more stable climate, in the Fertile Crescent (an arc-shaped region in the Near East) some communities began to grow cereals and raise animals: this is the start of agriculture (c. 9000 BC). It is called the “Neolithic revolution” (“new stone”) because it changed the way of living, even though the process took many centuries.",
      "Not all the change was just agricultural. At Göbekli Tepe, in present-day Turkey, a monumental stone temple was built (c. 9500 BC) that, according to most specialists, was built by communities that did not yet depend on agriculture. And later the first smelted copper objects appear (c. 5000 BC), the beginning of metallurgy.",
      "By producing food and storing it, communities became sedentary: villages, surpluses, specialized trades and differences in wealth appeared. With large villages and trade, writing arose in Sumer (3500 BC, by convention), first used to keep accounts. That invention marks the end of Prehistory.",
      "Key figures: as in the previous lesson, we do not know names. The collective protagonist is the first farming communities.",
      "Causes and consequences: the end of the ice age favored agriculture; agriculture made villages and surpluses possible; and from them came cities and writing. School-level simplification: each step had many causes and took place in several regions.",
      "Connects with: Antiquity, which begins right with “Invention of writing in Sumer”; and with the Technique “Cause, event and consequence,” which uses this same chain.",
      "Common mistakes: (1) agriculture did not appear in one place or in one year: it arose independently in several regions of the world; (2) “revolution” does not mean fast, but that it changed things at the root; (3) the Neolithic is still Prehistory: Antiquity begins with writing.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Construction of the Göbekli Tepe temple” or “First smelted copper objects”?",
        opciones: [
          "First smelted copper objects",
          "They happened in the same year",
          "Construction of the Göbekli Tepe temple",
          "There is no way to know which came first",
        ],
        respuesta: 2,
        explicacion: "Construction of the Göbekli Tepe temple dates to c. 9500 BC and the first smelted copper objects to c. 5000 BC.",
      },
      {
        pregunta: "According to school periodization, in which era did the “First smelted copper objects” appear?",
        opciones: ["Antiquity", "Middle Ages", "Prehistory", "Early Modern Age"],
        respuesta: 2,
        explicacion: "c. 5000 BC falls in Prehistory (up to 3500 BC, by school convention).",
      },
      {
        pregunta: "Which of these events helped cause the “Start of agriculture in the Fertile Crescent”?",
        opciones: [
          "Invention of writing in Sumer",
          "End of the last ice age",
          "Construction of the Great Pyramid of Giza",
          "Code of Hammurabi in Babylon",
        ],
        respuesta: 1,
        explicacion:
          "The end of the last ice age (c. 10,000 BC) came earlier and helped cause it; the other events happened after c. 9000 BC, so they cannot be a cause.",
      },
      {
        pregunta: "Which event marks, by convention, the end of Prehistory?",
        opciones: [
          "Invention of writing in Sumer",
          "Start of agriculture in the Fertile Crescent",
          "Controlled use of fire by hominids",
          "First smelted copper objects",
        ],
        respuesta: 0,
        explicacion: "Prehistory is what happened before writing; school places its invention at c. 3500 BC.",
      },
      {
        pregunta: "Why is it called an agricultural “revolution” if the process took centuries?",
        opciones: [
          "Because it changed the way of living at the root, even though the change was slow",
          "Because it happened in a single year",
          "Because armies carried it out",
          "Because it only happened in Europe",
        ],
        respuesta: 0,
        explicacion: "“Revolution” refers to the depth of the change (sedentary life, surpluses, villages), not to its speed.",
      },
    ],
    visuales: ["From the end of the ice age to writing", "A chain of causes"],
  },
  "historia-clase-03-mesopotamia-y-egipto": {
    nombre: "Mesopotamia and Egypt: the first civilizations",
    descripcion: "Two civilizations born beside great rivers: the writing and laws of Mesopotamia, and the pharaohs and pyramids of Egypt.",
    pasos: [
      "Goal: by the end you will be able to explain what the first civilizations of Mesopotamia and Egypt had in common and place their great landmarks: writing, the Code of Hammurabi, the unification of Egypt and the Great Pyramid.",
      "Context: Antiquity begins with writing, which school places at c. 3500 BC. Review of Prehistory: when the last ice age ended (c. 10,000 BC) agriculture appeared (c. 9000 BC); with food in storage villages grew and, afterward, writing arose. That chain of causes and consequences ends right here.",
      "Mesopotamia means “between rivers”: it is the region between the Tigris and the Euphrates, in present-day Iraq. There, in Sumer, there were cities such as Ur and Uruk and cuneiform writing developed, made with wedge-shaped signs pressed with a reed onto clay tablets.",
      "In Babylon, King Hammurabi had a set of laws carved on a stone stele: the Code of Hammurabi (c. 1754 BC). It is one of the first written legal codes that survive and it regulated matters such as trade, property and the family. It dates to the 18th century BC.",
      "Egypt was born along the Nile River, whose yearly floods left fertile soil. Around 3100 BC Upper and Lower Egypt were united under a single pharaoh. Pharaohs were considered sacred figures and ruled with the help of scribes and priests. The Great Pyramid of Giza (c. 2560 BC) was the tomb of the pharaoh Khufu and dates to the 26th century BC.",
      "Key figures: Hammurabi, king of Babylon, and Ramesses II, pharaoh of Egypt for more than sixty years. They are known through texts and monuments, and some of their life dates are approximate.",
      "Causes and consequences: writing made it possible to record accounts, laws and news. That is why, long after its invention, a king could publish laws in writing for his whole kingdom. The figure below links the chain from Prehistory to the Code of Hammurabi.",
      "Connects with: the lessons on India and China, where other great civilizations also arose beside rivers; with the lesson on Greece, which will inherit ideas from Egypt and Mesopotamia; and with the Technique “BC years are counted backward,” which is useful for ordering all these dates.",
      "Common mistakes: (1) confusing Mesopotamia (Tigris and Euphrates, Asia) with Egypt (Nile, Africa); (2) believing Hammurabi invented laws: written laws already existed earlier, but his code is one of the most complete that survive; (3) reading “c. 2560 BC” as an exact year: it is an estimate.",
    ],
    quiz: [
      {
        pregunta: "In which century did the “Code of Hammurabi in Babylon” take place?",
        opciones: ["19th century BC", "17th century BC", "18th century", "18th century BC"],
        respuesta: 3,
        explicacion:
          "c. 1754 BC belongs to the 18th century BC: century n runs from year (n − 1) · 100 + 1 to year n · 100 and, for BC years, you count backward.",
      },
      {
        pregunta: "Which came first: “Unification of Upper and Lower Egypt” or “Construction of the Great Pyramid of Giza”?",
        opciones: [
          "Construction of the Great Pyramid of Giza",
          "They happened in the same year",
          "Unification of Upper and Lower Egypt",
          "There is no way to know which came first",
        ],
        respuesta: 2,
        explicacion:
          "Unification of Upper and Lower Egypt dates to c. 3100 BC and Construction of the Great Pyramid of Giza to c. 2560 BC.",
      },
      {
        pregunta: "What does “Mesopotamia” mean?",
        opciones: [
          "“Land of the Nile”",
          "“City of the king”",
          "“Land of the pharaohs”",
          "“Between rivers”: the region between the Tigris and the Euphrates",
        ],
        respuesta: 3,
        explicacion: "Mesopotamia comes from Greek and means “between rivers.” The Nile is the river of Egypt.",
      },
      {
        pregunta: "Which of these events was a consequence of “Invention of writing in Sumer”?",
        opciones: [
          "Controlled use of fire by hominids",
          "Lascaux cave paintings",
          "End of the last ice age",
          "Code of Hammurabi in Babylon",
        ],
        respuesta: 3,
        explicacion:
          "The Code of Hammurabi in Babylon (c. 1754 BC) came later and builds on “Invention of writing in Sumer”; the other events are earlier than 3500 BC, so they cannot be its consequence.",
      },
      {
        pregunta: "What was the Code of Hammurabi?",
        opciones: [
          "An epic poem from Greece",
          "A temple in Egypt",
          "A set of written laws, carved on a stele, from the kingdom of Babylon",
          "An accounts tablet from Prehistory",
        ],
        respuesta: 2,
        explicacion:
          "It was a set of laws of Hammurabi, king of Babylon (c. 1754 BC); its stele is among the oldest written legal evidence that survives.",
      },
    ],
    visuales: [
      "BC centuries: they are counted backward",
      "Egypt and Mesopotamia on the timeline",
      "Hammurabi and Ramesses II",
      "From the ice age to written laws",
    ],
  },
  "historia-clase-04-india-antigua": {
    nombre: "Ancient India: from the Indus Valley to the Guptas",
    descripcion: "The cities of the Indus, the birth of Buddhism and the Maurya and Gupta empires.",
    pasos: [
      "Goal: by the end you will be able to place the great stages of ancient India: the cities of the Indus, the birth of Buddhism and the Maurya and Gupta empires.",
      "Context: in the lesson on Mesopotamia and Egypt you saw that the first civilizations were born beside rivers; India had its own in the valley of the Indus River. And remember that BC years are counted backward: c. 2600 BC is older than c. 321 BC.",
      "The Indus civilization had planned cities such as Harappa and Mohenjo-Daro (c. 2600 BC), with orderly streets, brick houses and drainage systems. Its writing has still not been deciphered, so we know about it only from what it left underground.",
      "Around 500 BC, Siddhartha Gautama, called the Buddha (“the awakened one”), taught in northern India a path to overcome suffering; his teaching gave rise to Buddhism. Specialists debate in which decade he lived, which is why the date is approximate.",
      "Chandragupta founded the Maurya Empire (c. 321 BC), the first to unite a large part of the subcontinent. His grandson Ashoka, after the Kalinga War (c. 261 BC), embraced Buddhism and left edicts carved on rock and on pillars.",
      "The Gupta Empire (c. 320 AD) is usually remembered as a time of great development in the arts, mathematics and sciences in northern India.",
      "Key figures: the Buddha, spiritual teacher; Chandragupta, founder of the Maurya Empire; and Ashoka, an emperor who spread Buddhism. The life dates of all three are approximate or debated.",
      "Causes and consequences: the Maurya Empire, formed by Chandragupta, left a large kingdom that Ashoka ruled; the Kalinga War marked his turn toward Buddhism and toward a policy of tolerance declared in his edicts. School-level simplification: the relationship between that war and his conversion is known mainly from his own edicts.",
      "Connects with: the lesson on Alexander the Great, who reached the Indus Valley in the same century in which the Maurya Empire was formed; and with the lesson on China, where Buddhism will arrive later along the Silk Road.",
      "Common mistakes: (1) believing the Buddha was a god: he was a teacher who lived as a person; (2) thinking Buddhism was born in China: it was born in India and spread afterward to other regions; (3) confusing the Maurya Empire (from the 4th century BC) with the Gupta (from the 4th century AD).",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Teachings of the Buddha and birth of Buddhism” or “Chandragupta founds the Maurya Empire”?",
        opciones: [
          "Teachings of the Buddha and birth of Buddhism",
          "Chandragupta founds the Maurya Empire",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 0,
        explicacion: "Teachings of the Buddha and birth of Buddhism dates to c. 500 BC and Chandragupta founds the Maurya Empire to c. 321 BC.",
      },
      {
        pregunta: "Which of these events was a consequence of “Chandragupta founds the Maurya Empire”?",
        opciones: [
          "Rise of the Indus Valley cities (Harappa and Mohenjo-Daro)",
          "Code of Hammurabi in Babylon",
          "Kalinga War and Ashoka's conversion to Buddhism",
          "Construction of the Great Pyramid of Giza",
        ],
        respuesta: 2,
        explicacion:
          "The Kalinga War and Ashoka's conversion to Buddhism (c. 261 BC) came later and build on “Chandragupta founds the Maurya Empire”; the other events are earlier than c. 321 BC, so they cannot be its consequence.",
      },
      {
        pregunta: "Who was this figure? Maurya emperor. After the Kalinga War he adopted Buddhism and spread its teachings.",
        opciones: ["Chandragupta Maurya", "Ashoka", "The Buddha (Siddhartha Gautama)", "Qin Shi Huang"],
        respuesta: 1,
        explicacion: "Ashoka (304 BC – 232 BC (approximate dates)): after the Kalinga War he adopted Buddhism and spread its teachings.",
      },
      {
        pregunta: "According to school periodization, in which era did the “Start of the Gupta Empire in India” take place?",
        opciones: ["Antiquity", "Prehistory", "Middle Ages", "Early Modern Age"],
        respuesta: 0,
        explicacion: "c. 320 AD falls in Antiquity (from 3500 BC, by school convention).",
      },
      {
        pregunta: "Where was Buddhism born?",
        opciones: ["In China", "In Egypt", "In India", "In Greece"],
        respuesta: 2,
        explicacion: "Buddhism was born in northern India from the teachings of the Buddha and later spread to other regions of Asia.",
      },
    ],
    visuales: [
      "From the Indus cities to the Gupta Empire",
      "The Buddha, Chandragupta and Ashoka",
      "The Maurya Empire and its turn toward Buddhism",
    ],
  },
  "historia-clase-05-china-antigua": {
    nombre: "Ancient China: from the Shang to the Han",
    descripcion: "The first texts, Confucius, the first emperor and the Han dynasty, with the invention of paper.",
    pasos: [
      "Goal: by the end you will be able to place the great stages of ancient China: the Shang dynasty, Confucius, the unification of the country, the Han dynasty and paper.",
      "Context: like Mesopotamia, Egypt and India, China had a great civilization beside a river, the Yellow River. And remember the rule for BC centuries: 221 BC belongs to the 3rd century BC, which is counted backward.",
      "According to traditional chronology, the Shang dynasty began c. 1600 BC. From it survive the oldest inscriptions in China: questions to the gods written on animal bones and turtle shells, the “oracle bones.”",
      "Confucius taught c. 500 BC. His ideas about conduct, respect for the family and good government formed Confucianism, which influenced China for many centuries.",
      "Qin Shi Huang unified the Chinese kingdoms under a single emperor in 221 BC. He unified writing, coinage and measures, he is associated with joining earlier defensive walls (the origin of the Great Wall) and he had himself buried with an army of terracotta figures.",
      "The Han dynasty (202 BC) ruled for more than four centuries. During it the Silk Road was consolidated, a network of roads that linked China with the Mediterranean, and Confucianism became the basis of the training of officials. In c. 105 AD, Cai Lun presented to the court paper made from plant fibers; today we know it was already in use earlier, but he improved and spread its manufacture.",
      "Key figures: Confucius (philosopher), Qin Shi Huang (first emperor) and Cai Lun (court official). Their life dates are approximate, or imprecise in the case of Cai Lun.",
      "Causes and consequences: the Qin unification created a centralized state that the Han inherited and consolidated for centuries. School-level simplification: between the two dynasties there were wars and changes that are not detailed here.",
      "Connects with: India, where Buddhism was born and would reach China along the Silk Road; with Rome, the other great empire of the time (at the same time as the Han); and with the Middle Ages, when the Tang dynasty, and later the Mongols, will rule China.",
      "Common mistakes: (1) treating China as a single dynasty: there were many; (2) believing one person built the Great Wall all at once: it was built and rebuilt over centuries; (3) believing Cai Lun invented paper out of nothing: he improved and spread a technique that already existed.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Start of the Shang dynasty in China, according to traditional chronology” or “Teachings of Confucius in China”?",
        opciones: [
          "Start of the Shang dynasty in China, according to traditional chronology",
          "Teachings of Confucius in China",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 0,
        explicacion:
          "Start of the Shang dynasty in China, according to traditional chronology, dates to c. 1600 BC and Teachings of Confucius in China to c. 500 BC.",
      },
      {
        pregunta: "Which came first: “Qin Shi Huang unifies China” or “Founding of the Han dynasty in China”?",
        opciones: [
          "Founding of the Han dynasty in China",
          "They happened in the same year",
          "There is no way to know which came first",
          "Qin Shi Huang unifies China",
        ],
        respuesta: 3,
        explicacion: "Qin Shi Huang unifies China in 221 BC and the Founding of the Han dynasty in China is in 202 BC.",
      },
      {
        pregunta: "Who was this figure? First emperor of China. He unified China and had himself buried with a terracotta army.",
        opciones: ["Confucius", "Julius Caesar", "Qin Shi Huang", "Alexander the Great"],
        respuesta: 2,
        explicacion: "Qin Shi Huang (259 BC – 210 BC): he unified China and had himself buried with a terracotta army.",
      },
      {
        pregunta: "In which century did “Qin Shi Huang unifies China” take place?",
        opciones: ["3rd century BC", "4th century BC", "2nd century BC", "3rd century"],
        respuesta: 0,
        explicacion:
          "221 BC belongs to the 3rd century BC: century n runs from year (n − 1) · 100 + 1 to year n · 100 and, for BC years, you count backward.",
      },
      {
        pregunta: "What was the Silk Road?",
        opciones: [
          "A canal that crossed China",
          "A network of roads that linked China with the Mediterranean",
          "A wall on the northern border",
          "An empire of India",
        ],
        respuesta: 1,
        explicacion:
          "The Silk Road allowed goods, religions and ideas to circulate between China and the Mediterranean; it was consolidated during the Han dynasty.",
      },
    ],
    visuales: ["From the Shang to the invention of paper", "Confucius, Qin Shi Huang and Cai Lun"],
  },
  "historia-clase-06-grecia-y-persia": {
    nombre: "Greece and Persia: polis, the Persian Wars and philosophy",
    descripcion: "The Greek city-states, the Persian Empire, the wars between them and the birth of philosophy.",
    pasos: [
      "Goal: by the end you will be able to explain what classical Greece was like, what pitted Greeks against Persians and why Athens is remembered for its democracy and its philosophy.",
      "Context: as with all the BC dates in this lesson, the bigger the number, the older the event: 776 BC is earlier than 490 BC. If you are coming from the previous lessons, remember that the civilizations of Mesopotamia and Egypt are much older than those of Greece.",
      "Persia was an enormous empire. Cyrus II the Great founded it and conquered Babylon in 539 BC, in one of the largest empires of its time.",
      "Greece, by contrast, was not a united country but many independent city-states (polis), such as Athens and Sparta. They shared a language, a religion and competitions such as the Olympic Games (776 BC, according to tradition), and their oldest poems are the Iliad and the Odyssey, attributed to Homer (c. 750 BC); it is debated who he was and whether he was a single person.",
      "The Persians tried to subdue the polis. The Athenians won at the “Battle of Marathon” (490 BC). At the “Battle of Thermopylae” (480 BC), a small Greek army, with the Spartan king Leonidas, held out for several days against the enormous army of Xerxes I before being defeated. In the end, the Greeks won the war.",
      "Under Pericles, Athens lived its time of greatest splendor: Athenian democracy, in which adult male citizens voted (not women, enslaved people or foreigners), and the building of the Parthenon (447 BC) on the Acropolis.",
      "Philosophy was born in Athens as a way of questioning life and the world. Socrates taught by dialogue and left nothing written; he was tried and sentenced to death (399 BC). His disciple Plato founded the Academy.",
      "Key figures: Cyrus II and Xerxes I (Persia), Leonidas (Sparta), Pericles, Socrates and Plato (Athens) and Homer, the poet. The life dates of several are approximate.",
      "Causes and consequences: the Persian attempts to dominate Greece led to the Persian Wars; the Greek victory gave Athens prestige and power, and that power made possible the age of Pericles, with its democracy and its art. School-level simplification: not all the polis supported Athens and not all benefited equally.",
      "Connects with: India and China, where in those same centuries the Buddha and Confucius taught; the synchrony figure below shows it. Also with the next lesson, where Alexander the Great will conquer the Persian Empire.",
      "Common mistakes: (1) confusing Athens with Sparta: the first stood out for its democracy and culture; the second, for its military organization; (2) believing ancient Greece was a country: it was many polis; (3) thinking Socrates wrote books: we know him mainly through Plato.",
    ],
    quiz: [
      {
        pregunta: "Which came first: the “Battle of Marathon” or the “Battle of Thermopylae”?",
        opciones: [
          "Battle of Thermopylae",
          "Battle of Marathon",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 1,
        explicacion: "The Battle of Marathon dates to 490 BC and the Battle of Thermopylae to 480 BC.",
      },
      {
        pregunta: "Which came first: the “First Olympic Games of antiquity” or “Start of construction of the Parthenon”?",
        opciones: [
          "Start of construction of the Parthenon",
          "First Olympic Games of antiquity",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 1,
        explicacion: "The First Olympic Games of antiquity date to 776 BC and the Start of construction of the Parthenon to 447 BC.",
      },
      {
        pregunta: "Who was this figure? King of Sparta. He died defending the pass of Thermopylae against the Persian army.",
        opciones: ["Pericles", "Cyrus II the Great", "Plato", "Leonidas"],
        respuesta: 3,
        explicacion: "Leonidas (died in 480 BC (approximate dates)): he died defending the pass of Thermopylae against the Persian army.",
      },
      {
        pregunta: "Who was this figure? Greek philosopher. He taught by dialogue with questions, left nothing written and was sentenced to death in Athens.",
        opciones: ["Plato", "Homer", "Xerxes I", "Socrates"],
        respuesta: 3,
        explicacion:
          "Socrates (470 BC – 399 BC (approximate dates)): he taught by dialogue with questions, left nothing written and was sentenced to death in Athens.",
      },
      {
        pregunta: "In which century did the “Trial and death of Socrates” take place?",
        opciones: ["5th century BC", "3rd century BC", "4th century BC", "4th century"],
        respuesta: 2,
        explicacion:
          "399 BC belongs to the 4th century BC: century n runs from year (n − 1) · 100 + 1 to year n · 100 and, for BC years, you count backward.",
      },
      {
        pregunta: "What were the polis?",
        opciones: [
          "Provinces of a single Greek kingdom",
          "The Persian warships",
          "Independent city-states, such as Athens and Sparta",
          "The temples of the Olympic Games",
        ],
        respuesta: 2,
        explicacion: "Greece was made up of many independent city-states that shared a language and a religion but not a single government.",
      },
    ],
    visuales: ["Greece and Persia, from 776 BC to 399 BC", "The protagonists", "c. 500 BC, four regions at once"],
  },
  "historia-clase-07-alejandro-y-el-helenismo": {
    nombre: "Alexander the Great and the Hellenistic world",
    descripcion: "The conquest of the Persian Empire, the mixing of cultures of Hellenism and the science of Alexandria.",
    pasos: [
      "Goal: by the end you will be able to tell who Alexander the Great was, what he conquered, what Hellenism is and why Euclid is remembered.",
      "Context: in the previous lesson you saw that Greece was many polis and that the Persian Empire was enormous. North of Greece lay Macedonia, a kingdom that ended up dominating the polis and attacking Persia.",
      "Alexander became king of Macedonia at a very young age and was a student of Aristotle. In 334 BC he began the conquest of the Persian Empire and advanced as far as the Indus Valley, where his exhausted soldiers refused to go on.",
      "Alexander died in Babylon in 323 BC. His empire did not survive united: his generals divided it among themselves and formed separate kingdoms.",
      "That mixing of Greek culture with those of Egypt and the East is called Hellenism. One of its centers was Alexandria, in Egypt, a city with a library and a museum where scientists and scholars worked.",
      "According to tradition, Euclid worked there and wrote the Elements (c. 300 BC), a geometry treatise that kept being studied for more than two thousand years.",
      "Key figures: Alexander the Great (conquering king), Aristotle (philosopher, his teacher) and Euclid (mathematician). To avoid confusing them, look at their role: king, philosopher and mathematician.",
      "Causes and consequences: Alexander's conquests spread the Greek language and Greek ideas across the East, and also brought Eastern ideas to Greece. It is a remarkable synchrony: at almost the same time the Maurya Empire was forming in India.",
      "Connects with: the lesson on India (Maurya Empire) and with the one on Rome, which will later inherit much of the Hellenistic world.",
      "Common mistakes: (1) believing Alexander was a Greek from Athens: he was Macedonian; (2) thinking his empire lasted for centuries: it split up at his death; (3) confusing Hellenistic with Hellenic: Hellenism is the mixing that came after Alexander.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Alexander the Great begins the conquest of the Persian Empire” or “Death of Alexander the Great in Babylon”?",
        opciones: [
          "Death of Alexander the Great in Babylon",
          "They happened in the same year",
          "Alexander the Great begins the conquest of the Persian Empire",
          "There is no way to know which came first",
        ],
        respuesta: 2,
        explicacion:
          "Alexander the Great begins the conquest of the Persian Empire in 334 BC and the Death of Alexander the Great in Babylon is in 323 BC.",
      },
      {
        pregunta: "Who was this figure? Greek philosopher. He founded the Lyceum and was the teacher of Alexander the Great.",
        opciones: ["Aristotle", "Plato", "Socrates", "Pericles"],
        respuesta: 0,
        explicacion: "Aristotle (384 BC – 322 BC): he founded the Lyceum and was the teacher of Alexander the Great.",
      },
      {
        pregunta: "Who was this figure? Greek mathematician. He wrote the Elements, the great geometry treatise of Antiquity.",
        opciones: ["Aristotle", "Homer", "Euclid", "Alexander the Great"],
        respuesta: 2,
        explicacion: "Euclid (active c. 300 BC (approximate dates)): he wrote the Elements, the great geometry treatise of Antiquity.",
      },
      {
        pregunta: "In which century did the “Death of Alexander the Great in Babylon” take place?",
        opciones: ["5th century BC", "3rd century BC", "4th century BC", "4th century"],
        respuesta: 2,
        explicacion:
          "323 BC belongs to the 4th century BC: century n runs from year (n − 1) · 100 + 1 to year n · 100 and, for BC years, you count backward.",
      },
      {
        pregunta: "What is Hellenism?",
        opciones: [
          "The mixing of Greek culture with those of Egypt and the East after Alexander's conquests",
          "Greek culture before the polis",
          "An empire founded by Rome",
          "A religion of India",
        ],
        respuesta: 0,
        explicacion: "Hellenism is the spread of Greek culture across the East and its mixing with other cultures after Alexander's conquests.",
      },
    ],
    visuales: ["From the conquest of Persia to the Elements", "A king, a philosopher and a mathematician"],
  },
  "historia-clase-08-roma-republica": {
    nombre: "Rome: from city to Republic",
    descripcion: "The founding of Rome, the Republic, the wars against Carthage and the figure of Julius Caesar.",
    pasos: [
      "Goal: by the end you will be able to explain how Rome grew from a city to dominate the Mediterranean, what the Republic was and who Julius Caesar was.",
      "Context: in this lesson the dates are also BC, so remember that 753 BC is earlier than 509 BC. And to avoid confusing figures, look at their role and the event they are linked to.",
      "According to tradition, Rome was founded in 753 BC; according to legend, by Romulus, who with his brother Remus is said to have been raised by a she-wolf. It is a conventional date, not a proven one.",
      "Rome was first a monarchy. Around 509 BC the Romans created the Republic, governed by elected magistrates (the consuls) and by the Senate. School-level simplification: only part of the population had full political rights.",
      "Rome's rival in the Mediterranean was Carthage, in North Africa. In the Second Punic War, the Carthaginian general Hannibal crossed the Alps with elephants (218 BC) to attack Rome from the north. In the end, Rome won and destroyed Carthage (146 BC).",
      "The conquests brought wealth but also internal conflicts: slave revolts, such as Spartacus's, and struggles between generals. One of them was Julius Caesar, who conquered Gaul and crossed the Rubicon with his army (49 BC), which set off a civil war.",
      "Julius Caesar was named dictator and was assassinated by a group of senators in 44 BC. He was not an emperor: the Empire began afterward.",
      "Key figures: Julius Caesar (general and politician), Hannibal (Carthaginian general) and Spartacus (leader of a slave revolt). Link them with their event: the Rubicon, the Alps and the revolt.",
      "Causes and consequences: the wars against Carthage made Rome a power; the civil wars at the end of the Republic are related to the end of that system, the subject of the next lesson.",
      "Connects with: the next lesson, on the Roman Empire, which begins with the civil wars of this stage; the one on Greece (Rome inherited and adapted a good part of its culture) and the one on ancient Africa, where Carthage is.",
      "Common mistakes: (1) believing Julius Caesar was an emperor: he was a general and dictator; (2) confusing the Roman Republic with a modern democracy; (3) believing Hannibal was Roman: he was from Carthage; (4) reading 753 BC as a proven year: it is the date given by tradition.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Founding of Rome, according to tradition” or “Start of the Roman Republic”?",
        opciones: [
          "Start of the Roman Republic",
          "Founding of Rome, according to tradition",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 1,
        explicacion: "The founding of Rome, according to tradition, dates to 753 BC and the start of the Roman Republic to 509 BC.",
      },
      {
        pregunta: "Which came first: “Hannibal crosses the Alps” or “Destruction of Carthage by Rome”?",
        opciones: [
          "Destruction of Carthage by Rome",
          "Hannibal crosses the Alps",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 1,
        explicacion: "Hannibal crosses the Alps in 218 BC and the Destruction of Carthage by Rome is in 146 BC.",
      },
      {
        pregunta: "Who was this figure? Carthaginian general. He crossed the Alps with elephants to attack Rome.",
        opciones: ["Julius Caesar", "Spartacus", "Leonidas", "Hannibal"],
        respuesta: 3,
        explicacion: "Hannibal (247 BC – 183 BC (approximate dates)): he crossed the Alps with elephants to attack Rome.",
      },
      {
        pregunta: "Who was this figure? Leader of a slave revolt. He led a great revolt of slaves and gladiators against Rome.",
        opciones: ["Spartacus", "Hannibal", "Julius Caesar", "Augustus"],
        respuesta: 0,
        explicacion: "Spartacus (died in 71 BC (approximate dates)): he led a great revolt of slaves and gladiators against Rome.",
      },
      {
        pregunta: "Was Julius Caesar the first Roman emperor?",
        opciones: [
          "No: he was a general and dictator; the Empire began after his death",
          "Yes, he was the first emperor",
          "Yes, he was the last emperor of the Republic",
          "No: he was a king of Egypt",
        ],
        respuesta: 0,
        explicacion: "Julius Caesar died in 44 BC; the Empire began with Augustus, in 27 BC.",
      },
      {
        pregunta: "Why is 753 BC considered a conventional date?",
        opciones: [
          "Because it is the year Romulus died",
          "Because it is the date fixed by tradition, not a proven year",
          "Because it is the exact date of the Republic",
          "Because it was calculated with satellites",
        ],
        respuesta: 1,
        explicacion: "The founding of Rome is explained by a tradition and a legend; the date 753 BC is the one fixed by tradition.",
      },
    ],
    visuales: ["From the founding of Rome to Caesar's assassination", "Julius Caesar, Hannibal and Spartacus"],
  },
  "historia-clase-09-imperio-romano-y-cristianismo": {
    nombre: "The Roman Empire and Christianity",
    descripcion: "From the civil war to the Empire of Augustus, the eruption of Vesuvius and the path of Christianity to becoming the official religion.",
    pasos: [
      "Goal: by the end you will be able to explain how the Republic ended and the Empire began, what happened with Christianity and why the Empire was divided.",
      "Context: in the previous lesson you saw that Julius Caesar was assassinated (44 BC) and that Rome was living through civil wars. This lesson starts from there: a chain of causes and consequences that runs from that assassination to the Empire.",
      "Caesar's assassination set off a new civil war. His adopted heir, Octavian, defeated Mark Antony and Cleopatra at the “Battle of Actium” (31 BC). Cleopatra died in 30 BC and Egypt became a Roman province.",
      "Shortly afterward, Octavian received the name Augustus and became the first emperor (27 BC). A long period of relative peace and prosperity began, the Pax Romana, which lasted about two centuries.",
      "A famous episode of this period is the eruption of Vesuvius (79 AD), which destroyed Pompeii and Herculaneum and preserved them under layers of ash and pumice.",
      "Christianity, born in the Empire, suffered persecutions for a time. The emperor Constantine issued the Edict of Milan (313 AD), which allowed it to be practiced, and moved the capital to a new city beside the Bosphorus, Constantinople (330 AD). Later, in 380 AD, Christianity was declared the official religion of the Empire.",
      "In 395 AD the Empire was permanently divided into two parts, East and West. The Western one will fall, by school convention, in 476 AD: that date opens the Middle Ages.",
      "Key figures: Augustus (first emperor), Cleopatra (last queen of Ptolemaic Egypt) and Constantine (an emperor who favored Christianity).",
      "Causes and consequences: the civil war led from Caesar to Actium and from Actium to the Empire; the Edict of Milan led to Christianity becoming the official religion. Both chains are in the figures below.",
      "Connects with: the Middle Ages, which begins with the fall of Western Rome; the Byzantine Empire, which continues in the East with its capital in Constantinople; and India and China, contemporaries of the Roman Empire.",
      "Common mistakes: (1) believing “the Roman Empire fell” in a single day: the fall of the West in 476 is a conventional date in a long process; (2) thinking Rome ended completely: the Eastern Empire lasted a thousand years more; (3) confusing Republic with Empire: the Republic ends with the conflicts that lead to Augustus.",
    ],
    quiz: [
      {
        pregunta: "Which of these events was a consequence of the “Battle of Actium”?",
        opciones: [
          "Augustus begins the Roman Empire",
          "Invention of writing in Sumer",
          "Battle of Marathon",
          "Qin Shi Huang unifies China",
        ],
        respuesta: 0,
        explicacion:
          "Augustus begins the Roman Empire (27 BC) came later and builds on the “Battle of Actium”; the other events are earlier than 31 BC, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events helped cause “Christianity is declared the official religion of the Roman Empire”?",
        opciones: [
          "Fall of the Western Roman Empire",
          "Edict of Milan",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
          "Inauguration of Hagia Sophia in Constantinople",
        ],
        respuesta: 1,
        explicacion:
          "The Edict of Milan (313 AD) came earlier and helped cause it; the other events happened after 380 AD, so they cannot be a cause.",
      },
      {
        pregunta: "Which came first: “Eruption of Vesuvius and destruction of Pompeii” or the “Edict of Milan”?",
        opciones: [
          "Eruption of Vesuvius and destruction of Pompeii",
          "Edict of Milan",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 0,
        explicacion: "The Eruption of Vesuvius and destruction of Pompeii dates to 79 AD and the Edict of Milan to 313 AD.",
      },
      {
        pregunta: "Who was this figure? Roman emperor. He issued the Edict of Milan and moved the capital to a new city beside the Bosphorus.",
        opciones: ["Augustus", "Julius Caesar", "Constantine I", "Cleopatra VII"],
        respuesta: 2,
        explicacion:
          "Constantine I (272 AD – 337 AD (approximate dates)): he issued the Edict of Milan and moved the capital to a new city beside the Bosphorus.",
      },
      {
        pregunta: "In which century did the “Eruption of Vesuvius and destruction of Pompeii” take place?",
        opciones: ["2nd century", "1st century BC", "1st century", "3rd century"],
        respuesta: 2,
        explicacion:
          "79 AD belongs to the 1st century: century n runs from year (n − 1) · 100 + 1 to year n · 100 and, for BC years, you count backward.",
      },
      {
        pregunta: "When does Antiquity end according to school convention?",
        opciones: [
          "With the Edict of Milan, 313 AD",
          "With the fall of the Western Roman Empire, 476 AD",
          "With the assassination of Julius Caesar, 44 BC",
          "With Columbus's arrival, 1492",
        ],
        respuesta: 1,
        explicacion: "By school convention, the fall of the Western Roman Empire opens the Middle Ages; other books use other dates.",
      },
    ],
    visuales: [
      "From the Ides of March to the Empire",
      "Christianity, the official religion",
      "From the Empire of Augustus to the division of the Empire",
      "Augustus, Cleopatra and Constantine",
    ],
  },
  "historia-clase-10-africa-y-america-antiguas": {
    nombre: "Ancient Africa and the Americas: Carthage, Aksum, the Olmecs and the Maya",
    descripcion: "Civilizations that developed far from the eastern Mediterranean: the trade of Carthage and Aksum and the cultures of Mesoamerica.",
    pasos: [
      "Goal: by the end you will be able to place four ancient civilizations outside Europe and Asia: Carthage and Aksum, in Africa, and the Olmecs and the Maya, in the Americas.",
      "Context: ancient history did not happen only in the eastern Mediterranean. As throughout Antiquity, BC years are counted backward: c. 1200 BC is earlier than 814 BC.",
      "Carthage, on the coast of present-day Tunisia, was founded, according to tradition, by Phoenician colonists from Tyre in c. 814 BC. It became a great maritime trading power and a rival of Rome; it is Hannibal's city.",
      "Aksum was a kingdom in the north of present-day Ethiopia and Eritrea, with trade across the Red Sea and the Indian Ocean. Its king Ezana adopted Christianity in c. 330 AD; Aksum was one of the first Christian states.",
      "The Olmecs developed on the coast of the Gulf of Mexico (c. 1200 BC) the first great culture of Mesoamerica; their enormous stone heads are famous.",
      "The Classic period of Maya civilization (c. 250 AD) is known for its cities with pyramid-shaped temples, a hieroglyphic script, a very precise calendar and advanced knowledge of astronomy.",
      "Key figures: in this lesson the protagonists are collective (the Carthaginians, the Aksumites, the Olmecs and the Maya). Their rulers are less well known from written sources and do not appear in the course table.",
      "Causes and consequences: Maya writing developed independently of those of the Old World. School-level simplification: the history of four different civilizations is boiled down to one event each.",
      "Connects with: the lesson on the Roman Republic (wars against Carthage), the one on the Roman Empire (Aksum is a contemporary of Constantine) and the Middle Ages, when Mali, the Aztecs and the Incas will emerge.",
      "Common mistakes: (1) confusing the Maya, Aztecs and Incas: the Maya are much older than the Aztecs and the Incas, who belong to the end of the Middle Ages; (2) believing Africa had no ancient states: Carthage and Aksum are two examples; (3) thinking Carthage was Greek or Roman: it was Phoenician in origin.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Rise of the Olmec culture on the Gulf of Mexico” or “Founding of Carthage, according to tradition”?",
        opciones: [
          "Founding of Carthage, according to tradition",
          "They happened in the same year",
          "There is no way to know which came first",
          "Rise of the Olmec culture on the Gulf of Mexico",
        ],
        respuesta: 3,
        explicacion:
          "Rise of the Olmec culture on the Gulf of Mexico dates to c. 1200 BC and Founding of Carthage, according to tradition, to 814 BC.",
      },
      {
        pregunta: "According to school periodization, in which era did the “Start of the Maya Classic period” take place?",
        opciones: ["Prehistory", "Antiquity", "Middle Ages", "Early Modern Age"],
        respuesta: 1,
        explicacion: "c. 250 AD falls in Antiquity (from 3500 BC, by school convention).",
      },
      {
        pregunta: "In which century did “Ezana, king of Aksum, adopts Christianity” take place?",
        opciones: ["5th century", "4th century", "3rd century", "4th century BC"],
        respuesta: 1,
        explicacion:
          "c. 330 AD belongs to the 4th century: century n runs from year (n − 1) · 100 + 1 to year n · 100 and, for BC years, you count backward.",
      },
      {
        pregunta: "In which region did the Olmec culture develop?",
        opciones: [
          "In North Africa",
          "In the Indus Valley",
          "In the Aegean Sea",
          "On the coast of the Gulf of Mexico (Mesoamerica)",
        ],
        respuesta: 3,
        explicacion: "The Olmecs were the first great culture of Mesoamerica and developed near the Gulf of Mexico.",
      },
      {
        pregunta: "Which civilization adopted Christianity in c. 330 AD under its king Ezana?",
        opciones: ["Aksum", "Carthage", "The Olmecs", "The Maya"],
        respuesta: 0,
        explicacion:
          "Ezana, king of Aksum, adopted Christianity in c. 330 AD; Carthage had been destroyed centuries earlier and the cultures of Mesoamerica were on another continent.",
      },
    ],
    visuales: ["Four civilizations outside the eastern Mediterranean"],
  },
  "historia-clase-11-bizancio-y-los-otomanos": {
    nombre: "Byzantium: from the end of Western Rome to the fall of Constantinople",
    descripcion: "The Eastern Roman Empire, its great age under Justinian, the split between the Churches and the Ottoman conquest of Constantinople.",
    pasos: [
      "Goal: by the end you will be able to explain what happened to the Roman Empire after 476, what the Byzantine Empire was and how it ended.",
      "Context: the Middle Ages begin, by school convention, with the fall of the Western Roman Empire (476 AD). Review of Antiquity: the Empire had been divided into two parts, East and West, and Constantinople was the capital of the East; Christianity was the official religion, and a cause always comes before its consequence.",
      "When Western Rome fell, the Eastern Empire went on with its capital in Constantinople. Historians call it the Byzantine Empire (a later name: its inhabitants still called themselves Romans). Its emperor Justinian ordered Roman law to be compiled and the basilica of Hagia Sophia to be built, inaugurated in 537 AD.",
      "Over time, the Churches of Rome and Constantinople drifted apart and split in 1054: the so-called East-West Schism, the origin of the Catholic and Orthodox Churches.",
      "To the east a new power appeared. According to tradition, Osman I founded the Ottoman Empire in c. 1299, and in 1453 the sultan Mehmed II conquered Constantinople, ending the Byzantine Empire. The city became the Ottoman capital.",
      "Key figures: Justinian I (Byzantine emperor) and Mehmed II (Ottoman sultan, conqueror of Constantinople).",
      "Causes and consequences: as the Ottomans grew, they gradually surrounded the Byzantine Empire, and the conquest of Constantinople is the consequence of that process. The figure shows that relationship.",
      "Connects with: the Technique “How the Middle Ages end: 1453 or 1492” (some textbooks use 1453 as the end of the era); with the lesson on the Islamic world and with the Early Modern Age, where the Ottoman Empire will be a great power.",
      "Common mistakes: (1) believing that in 476 the whole Roman Empire ended: only the Western one ended, the Eastern one lasted until 1453 (977 years later); (2) thinking “Byzantine” is a different people: it is the modern name of the Eastern Roman Empire; (3) believing Constantinople and Istanbul are different cities: it is the same city with different names.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Inauguration of Hagia Sophia in Constantinople” or “Schism between the Eastern and Western Churches”?",
        opciones: [
          "Inauguration of Hagia Sophia in Constantinople",
          "Schism between the Eastern and Western Churches",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 0,
        explicacion:
          "The Inauguration of Hagia Sophia in Constantinople dates to 537 AD and the Schism between the Eastern and Western Churches to 1054.",
      },
      {
        pregunta: "Which of these events was a consequence of “Osman I founds the Ottoman Empire”?",
        opciones: [
          "Fall of the Western Roman Empire",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
          "Start of the Tang dynasty in China",
          "Fall of Constantinople to the Ottomans",
        ],
        respuesta: 3,
        explicacion:
          "The Fall of Constantinople to the Ottomans (1453) came later and builds on “Osman I founds the Ottoman Empire”; the other events are earlier than 1299, so they cannot be its consequence.",
      },
      {
        pregunta: "Who was this figure? Byzantine emperor. He ordered Roman law to be compiled and Hagia Sophia to be built.",
        opciones: ["Mehmed II", "Justinian I", "Charlemagne", "Muhammad"],
        respuesta: 1,
        explicacion: "Justinian I (482 AD – 565 AD): he ordered Roman law to be compiled and Hagia Sophia to be built.",
      },
      {
        pregunta: "Who was this figure? Ottoman sultan. He conquered Constantinople in 1453.",
        opciones: ["Mehmed II", "Justinian I", "Saladin", "Genghis Khan"],
        respuesta: 0,
        explicacion: "Mehmed II (1432 – 1481): he conquered Constantinople in 1453.",
      },
      {
        pregunta: "What happened to the Eastern Roman Empire in 476?",
        opciones: [
          "It disappeared along with the Western one",
          "It united with the Franks",
          "It was conquered by the Ottomans that same year",
          "It kept existing with its capital in Constantinople",
        ],
        respuesta: 3,
        explicacion: "Only the Western Empire fell. The Eastern one, called Byzantine, lasted until 1453.",
      },
    ],
    visuales: ["From 476 to 1453", "The Ottoman rise and the fall of Constantinople", "An emperor and a sultan"],
  },
  "historia-clase-12-mundo-islamico": {
    nombre: "The Islamic world: from Muhammad to Saladin",
    descripcion: "The birth of Islam, its expansion, Baghdad as a center of learning and Saladin's reconquest of Jerusalem.",
    pasos: [
      "Goal: by the end you will be able to explain how Islam was born and expanded, why Baghdad was a great center of learning and who Saladin was.",
      "Context: in this lesson there are several cause-and-consequence relationships: a cause brings about a consequence and that can, in turn, be the cause of another. As background, remember that from the ancient world Greek, Persian and Indian texts survived that the scholars of Baghdad would end up translating.",
      "Muhammad preached in Mecca on the Arabian Peninsula; his preaching gave rise to Islam. In 622 AD he and his followers moved to Medina: this is the Hijra, year 1 of the Islamic calendar.",
      "After his death, Islam expanded rapidly. Muslim armies reached the Iberian Peninsula in 711 AD and, according to tradition, the Franks stopped a Muslim advance at the “Battle of Poitiers, between Franks and Muslim armies” (732 AD); its real importance is debated.",
      "The Abbasids founded Baghdad as their capital (762 AD). There, in c. 830 AD, the House of Wisdom flourished, a center where Greek, Persian and Indian texts were translated and studied. From its scholar Al-Khwarizmi the words “algebra” and “algorithm” derive; and Avicenna wrote the Canon of Medicine, which was studied for centuries.",
      "The Crusades were Christian military expeditions toward the Holy Land: the first began in 1096. The sultan Saladin recaptured Jerusalem for the Muslims in 1187.",
      "Key figures: Muhammad, Al-Khwarizmi, Avicenna, Saladin. To avoid confusing them: a prophet, a mathematician, a physician and a sultan.",
      "Causes and consequences: the arrival in Iberia led to a clash at Poitiers; the founding of Baghdad led to the House of Wisdom; and the First Crusade led to the reconquest of Jerusalem by Saladin. The three chains are in the figure.",
      "Connects with: the lesson on the Byzantine Empire (the Crusades ended up affecting Constantinople), with the one on feudal Europe (Charlemagne and the Franks) and with the Early Modern Age, where knowledge from the Islamic world helped the European Renaissance.",
      "Common mistakes: (1) believing “Islamic” and “Arab” are the same: the Islamic world included very different peoples (Persians, Turks, Berbers and others); (2) confusing the Hijra with Muhammad's birth: it is his move to Medina; (3) thinking the Battle of Poitiers stopped all of Islam: it was one episode and its importance is debated.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Hijra: Muhammad and his followers move from Mecca to Medina” or “Founding of Baghdad by the Abbasids”?",
        opciones: [
          "Founding of Baghdad by the Abbasids",
          "They happened in the same year",
          "There is no way to know which came first",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
        ],
        respuesta: 3,
        explicacion:
          "The Hijra: Muhammad and his followers move from Mecca to Medina dates to 622 AD and the Founding of Baghdad by the Abbasids to 762 AD.",
      },
      {
        pregunta: "Which of these events was a consequence of “Founding of Baghdad by the Abbasids”?",
        opciones: [
          "Fall of the Western Roman Empire",
          "Rise of the House of Wisdom in Baghdad",
          "Inauguration of Hagia Sophia in Constantinople",
          "Start of the Tang dynasty in China",
        ],
        respuesta: 1,
        explicacion:
          "The Rise of the House of Wisdom in Baghdad (c. 830 AD) came later and builds on “Founding of Baghdad by the Abbasids”; the other events are earlier than 762 AD, so they cannot be its consequence.",
      },
      {
        pregunta: "Who was this figure? Mathematician of the Islamic world. The word “algorithm” comes from his name and the word “algebra” from his book.",
        opciones: ["Avicenna", "Al-Khwarizmi", "Muhammad", "Saladin"],
        respuesta: 1,
        explicacion:
          "Al-Khwarizmi (780 AD – 850 AD (approximate dates)): the word “algorithm” comes from his name and the word “algebra” from his book.",
      },
      {
        pregunta: "Who was this figure? Sultan of Egypt and Syria. He reconquered Jerusalem in 1187.",
        opciones: ["Avicenna", "Muhammad", "Saladin", "Genghis Khan"],
        respuesta: 2,
        explicacion: "Saladin (1137 – 1193 (approximate dates)): he reconquered Jerusalem in 1187.",
      },
      {
        pregunta: "What was the Hijra?",
        opciones: [
          "The birth of Muhammad",
          "A battle against the Franks",
          "The move of Muhammad and his followers from Mecca to Medina",
          "The conquest of Jerusalem",
        ],
        respuesta: 2,
        explicacion:
          "The Hijra: Muhammad and his followers move from Mecca to Medina (622 AD) was the move from Mecca to Medina; it is the starting point of the Islamic calendar.",
      },
    ],
    visuales: [
      "From the Hijra to Saladin",
      "A prophet, a mathematician, a physician and a sultan",
      "From the advance in Iberia to Poitiers",
      "From Baghdad to the House of Wisdom",
      "From the First Crusade to Jerusalem",
    ],
  },
  "historia-clase-13-europa-feudal": {
    nombre: "Feudal Europe: Franks, Vikings, Normans and the Crusades",
    descripcion: "Charlemagne, feudalism, the Viking voyages, the Norman conquest of England, Magna Carta and the First Crusade.",
    pasos: [
      "Goal: by the end you will be able to explain how feudal Europe was organized and place in order Charlemagne, the Vikings, William the Conqueror, Magna Carta and the First Crusade.",
      "Context: after the fall of Western Rome (476 AD) western Europe was divided into kingdoms ruled by Germanic peoples. Among them the Franks stood out. And remember that a cause always comes before its consequence.",
      "Charlemagne, king of the Franks, was crowned emperor by the pope on Christmas Day of 800 AD. His empire brought together much of western Europe.",
      "Feudal society was organized as a chain of loyalties: the king, the lords and the knights, and below them the peasants, many of them serfs tied to the land they worked. School-level simplification: feudalism varied greatly by place and century.",
      "The Vikings, Scandinavian seafarers, traveled all over Europe. One of them, Leif Erikson, reached North America around 1000: almost five centuries before Columbus (492 years).",
      "In 1066, William, Duke of Normandy, won at Hastings and became king of England. In 1215 the barons forced the king to sign Magna Carta, which established that the king's power had limits.",
      "In 1096 the First Crusade began: a Christian military expedition toward the Holy Land, called by the pope.",
      "Key figures: Charlemagne, William the Conqueror, Leif Erikson.",
      "Causes and consequences: the Norman conquest changed the nobility and the language of England; Magna Carta is a distant precursor of the idea of government with limits; the First Crusade opened a century of confrontations with the Islamic world.",
      "Connects with: the lesson on the Islamic world (Crusades and Saladin), the one on Byzantium (the schism between Churches) and the Early Modern Age, where European states will grow stronger.",
      "Common mistakes: (1) believing Columbus was the first European in the Americas: the Vikings arrived earlier, but their contact had no continuity; (2) confusing Charlemagne (king of the Franks) with a Roman emperor; (3) thinking Magna Carta gave rights to everyone: it protected mainly the barons and over time it was used as an example of limits on power.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Charlemagne is crowned emperor” or the “Battle of Hastings”?",
        opciones: [
          "Battle of Hastings",
          "Charlemagne is crowned emperor",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 1,
        explicacion: "Charlemagne is crowned emperor in 800 AD and the Battle of Hastings is in 1066.",
      },
      {
        pregunta: "Which came first: “Leif Erikson reaches North America” or “Magna Carta in England”?",
        opciones: [
          "Leif Erikson reaches North America",
          "Magna Carta in England",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 0,
        explicacion: "Leif Erikson reaches North America in c. 1000 and Magna Carta in England in 1215.",
      },
      {
        pregunta: "Who was this figure? Duke of Normandy and king of England. He won the Battle of Hastings and became king of England.",
        opciones: ["Charlemagne", "William the Conqueror", "Leif Erikson", "Saladin"],
        respuesta: 1,
        explicacion:
          "William the Conqueror (1028 – 1087 (approximate dates)): he won the Battle of Hastings and became king of England.",
      },
      {
        pregunta: "Who was this figure? Norse explorer. He reached North America around the year 1000, centuries before Columbus.",
        opciones: ["Leif Erikson", "Marco Polo", "Ibn Battuta", "Zheng He"],
        respuesta: 0,
        explicacion:
          "Leif Erikson (active c. 1000 (approximate dates)): he reached North America around the year 1000, centuries before Columbus.",
      },
      {
        pregunta: "What did Magna Carta establish?",
        opciones: [
          "That the king owned all the lands",
          "That the peasants were free",
          "That the king's power had limits",
          "That England belonged to France",
        ],
        respuesta: 2,
        explicacion: "Magna Carta (1215) was an agreement between the king and the barons that put limits on royal power.",
      },
    ],
    visuales: ["From Charlemagne to the First Crusade", "An emperor, an explorer and a king"],
  },
  "historia-clase-14-crisis-tardomedieval": {
    nombre: "The crisis of the Late Middle Ages: the Black Death and the Hundred Years' War",
    descripcion: "The Black Death, the war between France and England, Joan of Arc and Gutenberg's printing press.",
    pasos: [
      "Goal: by the end you will be able to explain what the Black Death was, why the Hundred Years' War is remembered and what changed with Gutenberg's printing press.",
      "Context: feudal Europe was a society of kings, lords and peasants tied to the land. In the 14th and 15th centuries that society went through a crisis of epidemics, wars and economic change that marked the end of the Middle Ages. Remember too that a cause comes before its consequence: here a war and an epidemic change society.",
      "The Hundred Years' War pitted England and France against each other from 1337. In reality it was a series of wars with truces that went on for more than a century.",
      "The Black Death, an epidemic of bubonic plague, reached Europe in 1347 along the trade routes and caused the death of a very large part of the population; the exact figures are debated, which is why none are given here. With fewer peasants, labor became scarce and working conditions changed.",
      "In the middle of the war, Joan of Arc, a young French peasant, led French troops and liberated Orléans (1429). She was captured, tried and executed in 1431.",
      "Shortly afterward, Gutenberg developed the movable-type printing press in Europe and printed the Bible (c. 1455): books became quicker and cheaper to produce, and written knowledge spread much more widely.",
      "Key figures: Joan of Arc (French military heroine) and Johannes Gutenberg (German printer).",
      "Causes and consequences: the Hundred Years' War led to the appearance of figures such as Joan of Arc; Gutenberg's press will be a key tool for the Renaissance and the Reformation, which are studied in the Early Modern Age.",
      "Connects with: the lesson on feudal Europe, with the Technique “How the Middle Ages end: 1453 or 1492” and with the Early Modern Age.",
      "Common mistakes: (1) believing the Hundred Years' War lasted exactly a hundred years: it was longer, with truces; (2) believing Gutenberg invented printing in general: in China printing with movable type already existed earlier, and he developed the movable-type system in Europe; (3) taking the date of the Bible as exact: it is approximate.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “The Black Death reaches Europe” or “Joan of Arc liberates Orléans”?",
        opciones: [
          "The Black Death reaches Europe",
          "Joan of Arc liberates Orléans",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 0,
        explicacion: "The Black Death reaches Europe in 1347 and Joan of Arc liberates Orléans in 1429.",
      },
      {
        pregunta: "Which of these events was a consequence of “Start of the Hundred Years' War”?",
        opciones: [
          "Fall of the Western Roman Empire",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
          "Charlemagne is crowned emperor",
          "Joan of Arc liberates Orléans",
        ],
        respuesta: 3,
        explicacion:
          "Joan of Arc liberates Orléans (1429) came later and builds on “Start of the Hundred Years' War”; the other events are earlier than 1337, so they cannot be its consequence.",
      },
      {
        pregunta: "Who was this figure? French military heroine. She led French troops at Orléans during the Hundred Years' War and died at the stake.",
        opciones: ["Johannes Gutenberg", "Marco Polo", "Joan of Arc", "William the Conqueror"],
        respuesta: 2,
        explicacion:
          "Joan of Arc (1412 – 1431 (approximate dates)): she led French troops at Orléans during the Hundred Years' War and died at the stake.",
      },
      {
        pregunta: "Who was this figure? German printer. He developed the movable-type printing press in Europe.",
        opciones: ["Joan of Arc", "Johannes Gutenberg", "Mehmed II", "Marco Polo"],
        respuesta: 1,
        explicacion: "Johannes Gutenberg (died in 1468 (approximate dates)): he developed the movable-type printing press in Europe.",
      },
      {
        pregunta: "What was a consequence of the movable-type printing press in Europe?",
        opciones: [
          "People stopped writing by hand forever",
          "Paper stopped being made",
          "Books were banned",
          "Books became quicker and cheaper to produce and knowledge spread more widely",
        ],
        respuesta: 3,
        explicacion: "With the printing press many copies could be produced with less work and lower cost; none of the other options happened.",
      },
    ],
    visuales: ["From the war to the printing press", "A heroine and a printer", "The war that brought Joan of Arc"],
  },
  "historia-clase-15-asia-oriental-y-los-mongoles": {
    nombre: "China, Japan, India and Southeast Asia: from the Tang to the Ming",
    descripcion: "The Chinese dynasties, the Japan of the shoguns, the Delhi Sultanate, Angkor Wat and the Mongol empire.",
    pasos: [
      "Goal: by the end you will be able to place the Chinese dynasties of the Middle Ages, the Mongol empire and the other great civilizations of Asia: Japan, India and the Khmer Empire.",
      "Context: in the lesson on ancient China you saw that the Han unified a great state. After centuries of divisions, China was unified again under new dynasties. And remember: a cause comes before its consequence; in this lesson there is a chain of four events.",
      "The Tang dynasty (618 AD) is remembered as a time of splendor, with a great capital, Chang'an, and brilliant poetry. The Song dynasty (960 AD) was a time of great economic development and of inventions such as printing, gunpowder and the compass, although some already existed earlier.",
      "In Japan, real power passed to the military leaders: Minamoto no Yoritomo established the Kamakura shogunate (1192). The emperor still existed, but the shogun governed. Earlier, the court lady Murasaki Shikibu had written The Tale of Genji, considered one of the first novels in the world.",
      "In India, the Delhi Sultanate was founded in 1206. In Southeast Asia, the Khmer Empire raised the temple of Angkor Wat (c. 1130), in present-day Cambodia.",
      "The Mongols: Temüjin was proclaimed Genghis Khan (1206) and with him the largest continuous land empire in history was born. His grandson Kublai Khan founded the Yuan dynasty in China (1271). The Venetian Marco Polo reached his court in c. 1275 and recounted his journey in a famous book.",
      "The Ming drove the Mongols out of China (1368). Under them, the admiral Zheng He led great fleets to the Indian Ocean and the coasts of East Africa (1405).",
      "Key figures: Murasaki Shikibu, Minamoto no Yoritomo, Genghis Khan, Kublai Khan, Marco Polo, Zheng He.",
      "Causes and consequences: the proclamation of Genghis Khan led to the Mongol empire; from it the Yuan dynasty was born; and from the fall of the Yuan the Ming dynasty arose, which promoted Zheng He's expeditions.",
      "Connects with: the lesson on the Islamic world (Baghdad and the Mongols), the one on medieval Africa (Ibn Battuta traveled through Asia) and the Early Modern Age (trade with Asia will drive the European voyages of exploration).",
      "Common mistakes: (1) confusing Genghis Khan with Kublai Khan: Kublai was his grandson and founded the Yuan dynasty; (2) confusing shogun with emperor: in Japan the emperor remained, but real power belonged to the shogun; (3) believing Zheng He reached the Americas: he reached the Indian Ocean and East Africa.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Start of the Tang dynasty in China” or “Start of the Song dynasty in China”?",
        opciones: [
          "Start of the Tang dynasty in China",
          "Start of the Song dynasty in China",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 0,
        explicacion: "The Start of the Tang dynasty in China dates to 618 AD and the Start of the Song dynasty in China to 960 AD.",
      },
      {
        pregunta: "Which of these events was a consequence of “Temüjin is proclaimed Genghis Khan”?",
        opciones: [
          "Fall of the Western Roman Empire",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
          "Start of the Tang dynasty in China",
          "Kublai Khan founds the Yuan dynasty in China",
        ],
        respuesta: 3,
        explicacion:
          "Kublai Khan founds the Yuan dynasty in China (1271) came later and builds on “Temüjin is proclaimed Genghis Khan”; the other events are earlier than 1206, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events helped cause the “Start of the Ming dynasty in China”?",
        opciones: [
          "Zheng He's first maritime expedition",
          "Kublai Khan founds the Yuan dynasty in China",
          "Fall of Constantinople to the Ottomans",
          "Gutenberg prints the Bible with movable type",
        ],
        respuesta: 1,
        explicacion:
          "Kublai Khan founds the Yuan dynasty in China (1271) came earlier and helped cause it; the other events happened after 1368, so they cannot be a cause.",
      },
      {
        pregunta: "Who was this figure? Mongol emperor of China. A grandson of Genghis Khan, he founded the Yuan dynasty in China.",
        opciones: ["Genghis Khan", "Marco Polo", "Zheng He", "Kublai Khan"],
        respuesta: 3,
        explicacion: "Kublai Khan (1215 – 1294): a grandson of Genghis Khan, he founded the Yuan dynasty in China.",
      },
      {
        pregunta: "Who was this figure? Chinese admiral. He led great Chinese fleets to the Indian Ocean and the coasts of East Africa.",
        opciones: ["Marco Polo", "Genghis Khan", "Zheng He", "Kublai Khan"],
        respuesta: 2,
        explicacion:
          "Zheng He (1371 – 1433 (approximate dates)): he led great Chinese fleets to the Indian Ocean and the coasts of East Africa.",
      },
      {
        pregunta: "In medieval Japan, who held real power?",
        opciones: [
          "The emperor, who ruled alone",
          "The sultan of Delhi",
          "The Mongols",
          "The shogun, a military leader",
        ],
        respuesta: 3,
        explicacion: "With the Kamakura shogunate (1192) real power passed to the shogun, although the emperor still existed.",
      },
    ],
    visuales: [
      "Five landmarks from the 7th to the 12th centuries",
      "Five landmarks from the Mongols to the Ming",
      "The protagonists",
      "From Genghis Khan to Zheng He",
    ],
  },
  "historia-clase-16-africa-y-oceania-medievales": {
    nombre: "Medieval Africa and Oceania: Mali, Zimbabwe and the Maori",
    descripcion: "The Mali empire and Mansa Musa, the travels of Ibn Battuta, Great Zimbabwe and the arrival of the Maori in New Zealand.",
    pasos: [
      "Goal: by the end you will be able to explain why the Mali empire was famous, who Ibn Battuta was and what Great Zimbabwe and the settlement of New Zealand were.",
      "Context: in Antiquity there were great African states, such as Carthage and Aksum. In the Middle Ages, in West Africa, trade across the Sahara Desert, in gold and salt, made new empires grow: a cause (trade) that brings about a consequence (wealth and power).",
      "Sundiata Keita founded the Mali empire in c. 1235, a tradition preserved in the oral epic of Sundiata. Mali controlled the gold trade, and cities such as Timbuktu were centers of commerce and of the study of Islam.",
      "The emperor Mansa Musa made a famous pilgrimage to Mecca (c. 1324). According to Arab chroniclers, he carried so much gold that his journey showed the wealth of Mali to the whole Islamic world.",
      "Ibn Battuta, a Moroccan traveler, set out from Tangier in 1325 and for almost thirty years traveled through Africa, Asia and part of Europe; he later dictated the book of his travels.",
      "In southern Africa, Great Zimbabwe was a stone city with great gold trade with the coast of the Indian Ocean (c. 1300). And in the Pacific, the Maori, Polynesian seafarers, settled in New Zealand (c. 1300).",
      "Key figures: Sundiata Keita, Mansa Musa, Ibn Battuta.",
      "Causes and consequences: the Mali empire, rich from trade, made Mansa Musa's famous pilgrimage possible. School-level simplification: the details about the gold he carried come from chroniclers of the time and are not known exactly.",
      "Connects with: the lesson on the Islamic world (Mali was an Islamic empire), with the one on Asia (Ibn Battuta traveled through Asia) and with the Early Modern Age, when Europeans will reach the African coasts.",
      "Common mistakes: (1) believing the present-day Republic of Mali is the same territory as the medieval empire: they do not coincide; (2) thinking Africa lacked written history: there is oral tradition and Arab sources, as well as the ruins; (3) attributing Great Zimbabwe to other peoples: it was built by African peoples.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Sundiata Keita founds the Mali Empire” or “Mansa Musa's pilgrimage to Mecca”?",
        opciones: [
          "Mansa Musa's pilgrimage to Mecca",
          "They happened in the same year",
          "There is no way to know which came first",
          "Sundiata Keita founds the Mali Empire",
        ],
        respuesta: 3,
        explicacion: "Sundiata Keita founds the Mali Empire in c. 1235 and Mansa Musa's pilgrimage to Mecca takes place in c. 1324.",
      },
      {
        pregunta: "Which of these events was a consequence of “Sundiata Keita founds the Mali Empire”?",
        opciones: [
          "Mansa Musa's pilgrimage to Mecca",
          "Fall of the Western Roman Empire",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
          "Start of the Tang dynasty in China",
        ],
        respuesta: 0,
        explicacion:
          "Mansa Musa's pilgrimage to Mecca (c. 1324) came later and builds on “Sundiata Keita founds the Mali Empire”; the other events are earlier than c. 1235, so they cannot be its consequence.",
      },
      {
        pregunta: "Who was this figure? Moroccan traveler. He journeyed through Africa, Asia and part of Europe for almost thirty years and dictated the book of his travels.",
        opciones: ["Ibn Battuta", "Mansa Musa", "Marco Polo", "Zheng He"],
        respuesta: 0,
        explicacion:
          "Ibn Battuta (1304 – 1368 (approximate dates)): he journeyed through Africa, Asia and part of Europe for almost thirty years and dictated the book of his travels.",
      },
      {
        pregunta: "Who was this figure? Founder of the Mali Empire. He founded the Mali Empire in West Africa.",
        opciones: ["Sundiata Keita", "Mansa Musa", "Ibn Battuta", "Genghis Khan"],
        respuesta: 0,
        explicacion: "Sundiata Keita (active c. 1235 (approximate dates)): he founded the Mali Empire in West Africa.",
      },
      {
        pregunta: "What did the Mali empire mainly trade across the Sahara?",
        opciones: ["Silk and paper", "Gold and salt", "Oil and gas", "Chinese spices and porcelain"],
        respuesta: 1,
        explicacion: "The trade in gold and salt across the Sahara made the Mali empire rich.",
      },
    ],
    visuales: [
      "Five events of Africa and Oceania in the 13th and 14th centuries",
      "A founder, an emperor and a traveler",
      "A rich empire and a pilgrimage",
    ],
  },
  "historia-clase-17-america-precolombina": {
    nombre: "Pre-Columbian Americas: the Aztecs and the Incas",
    descripcion: "Tenochtitlan, the Aztec capital, and the Inca Empire of the Andes, with Machu Picchu.",
    pasos: [
      "Goal: by the end you will be able to tell the Aztecs from the Incas and place the founding of Tenochtitlan, the Inca expansion and Machu Picchu.",
      "Context: in Antiquity, the Americas had cultures such as the Olmec and the Maya. In the Middle Ages two great states emerged in Mesoamerica and in the Andes: the Aztec and the Inca. Neither had contact with Europe until 1492. And a cause always comes before its consequence: here, expansion comes before the great cities.",
      "The Mexica, also called Aztecs, founded Tenochtitlan, according to tradition, in c. 1325, on an island in Lake Texcoco. They farmed on chinampas, artificial islands for cultivation, and their city became the capital of a great empire.",
      "In the Andes, the Incas had their capital at Cusco. Under the ruler Pachacuti began the expansion that turned Cusco into the center of a great empire (c. 1438). The Inca state had a network of roads and used quipus, knotted cords for recording information.",
      "Machu Picchu (c. 1450) is associated with that expansion, a stone city in the Andes, considered a royal estate of Pachacuti.",
      "Key figures: Pachacuti, Inca ruler. For the Aztecs, the course table does not include rulers from this period.",
      "Causes and consequences: the Inca expansion led to the building of cities such as Machu Picchu. Both empires will be conquered by the Spanish in the Early Modern Age; that story continues in the following lessons.",
      "Connects with: the lesson on ancient Africa and the Americas (Olmecs and Maya), with the Early Modern Age (Columbus's arrival and the conquest) and with the world today, where the Quechua and Nahuatl languages are still alive.",
      "Common mistakes: (1) confusing the Maya, Aztecs and Incas: the Maya are much older; (2) believing the Aztecs and Incas were neighbors: they were very far from each other, in Mesoamerica and in the Andes; (3) reading the founding date of Tenochtitlan as an exact year: it is the date given by tradition.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Founding of Tenochtitlan, according to tradition” or “Pachacuti begins the expansion of the Inca Empire”?",
        opciones: [
          "Pachacuti begins the expansion of the Inca Empire",
          "They happened in the same year",
          "There is no way to know which came first",
          "Founding of Tenochtitlan, according to tradition",
        ],
        respuesta: 3,
        explicacion:
          "Founding of Tenochtitlan, according to tradition, dates to 1325 and Pachacuti begins the expansion of the Inca Empire to c. 1438.",
      },
      {
        pregunta: "Which of these events was a consequence of “Pachacuti begins the expansion of the Inca Empire”?",
        opciones: [
          "Fall of the Western Roman Empire",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
          "Start of the Tang dynasty in China",
          "Construction of Machu Picchu",
        ],
        respuesta: 3,
        explicacion:
          "The Construction of Machu Picchu (c. 1450) came later and builds on “Pachacuti begins the expansion of the Inca Empire”; the other events are earlier than c. 1438, so they cannot be its consequence.",
      },
      {
        pregunta: "Who was this figure? Inca ruler. He turned the lordship of Cusco into the Inca Empire.",
        opciones: ["Mansa Musa", "Genghis Khan", "Pachacuti", "Mehmed II"],
        respuesta: 2,
        explicacion: "Pachacuti (active c. 1438 (approximate dates)): he turned the lordship of Cusco into the Inca Empire.",
      },
      {
        pregunta: "According to school periodization, in which era did the “Construction of Machu Picchu” take place?",
        opciones: ["Antiquity", "Middle Ages", "Early Modern Age", "Prehistory"],
        respuesta: 1,
        explicacion: "c. 1450 falls in the Middle Ages (from 476 AD, by school convention).",
      },
      {
        pregunta: "What were quipus?",
        opciones: [
          "Viking ships",
          "Aztec temples",
          "Knotted cords the Incas used to record information",
          "Maya gold coins",
        ],
        respuesta: 2,
        explicacion: "Quipus were knotted cords: the Inca state used them to keep accounts and records.",
      },
    ],
    visuales: ["Tenochtitlan, the Inca expansion and Machu Picchu", "Pachacuti", "From expansion to monument"],
  },
  "historia-clase-18-renacimiento-y-reforma": {
    nombre: "The Renaissance and the Protestant Reformation",
    descripcion: "The art and letters of the Renaissance, Luther's 95 Theses and the wars of religion that ended with the Peace of Westphalia.",
    pasos: [
      "Goal: by the end you will be able to explain what the Renaissance was, what set off the Protestant Reformation and how the religious wars in Europe ended.",
      "Context: the Early Modern Age begins, by school convention, with 1492. Review of the Middle Ages: Gutenberg's printing press (c. 1455) made books cheaper and let ideas circulate more; and remember that a cause always comes before its consequence.",
      "The Renaissance was a movement of renewal in art, letters and thought that was born in Italy and spread across Europe; it recovered interest in the culture of classical Antiquity and put the human being at the center. Leonardo da Vinci painted the Mona Lisa (begun c. 1503) and Michelangelo the ceiling of the Sistine Chapel (1508).",
      "In literature, Cervantes published the first part of Don Quixote (1605), considered one of the great novels of world literature, and Shakespeare wrote plays such as Hamlet and Romeo and Juliet.",
      "In 1517 the German theologian Martin Luther published his 95 Theses, in which he criticized practices of the Catholic Church; that is how the Protestant Reformation began, which divided the Christians of western Europe into Catholics and Protestants.",
      "Religious conflicts mixed with politics. The Thirty Years' War, which began in 1618, pitted many European states against each other and ended with the Peace of Westphalia (1648), which laid the foundations of the system of sovereign states.",
      "Key figures: Leonardo da Vinci, Michelangelo, Miguel de Cervantes, William Shakespeare, Martin Luther. The first four were artists and writers; the last one, a theologian.",
      "Causes and consequences: the 95 Theses led to the religious split; that split contributed to the Thirty Years' War; and the war ended with the Peace of Westphalia. The figure links the three events.",
      "Connects with: the lesson on the crisis of the Late Middle Ages (printing press) and the one on the exploration of the Americas, which happened at the same time; and with the Enlightenment, which will inherit the critical spirit of the Renaissance.",
      "Common mistakes: (1) believing Renaissance and Reformation are the same: the first is a cultural movement; the second, a religious one; (2) thinking Luther wanted to create a new Church from the start: he began by criticizing practices; (3) believing the Peace of Westphalia ended all the wars of Europe: it closed the Thirty Years' War.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Leonardo da Vinci begins the Mona Lisa” or “Luther publishes the 95 Theses and the Protestant Reformation begins”?",
        opciones: [
          "Luther publishes the 95 Theses and the Protestant Reformation begins",
          "They happened in the same year",
          "Leonardo da Vinci begins the Mona Lisa",
          "There is no way to know which came first",
        ],
        respuesta: 2,
        explicacion:
          "Leonardo da Vinci begins the Mona Lisa in c. 1503 and Luther publishes the 95 Theses and the Protestant Reformation begins in 1517.",
      },
      {
        pregunta: "Which of these events was a consequence of “Luther publishes the 95 Theses and the Protestant Reformation begins”?",
        opciones: [
          "Fall of the Western Roman Empire",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
          "Gutenberg prints the Bible with movable type",
          "Start of the Thirty Years' War",
        ],
        respuesta: 3,
        explicacion:
          "The Start of the Thirty Years' War (1618) came later and builds on “Luther publishes the 95 Theses and the Protestant Reformation begins”; the other events are earlier than 1517, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events was a consequence of “Start of the Thirty Years' War”?",
        opciones: [
          "Fall of the Western Roman Empire",
          "Peace of Westphalia",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
          "Gutenberg prints the Bible with movable type",
        ],
        respuesta: 1,
        explicacion:
          "The Peace of Westphalia (1648) came later and builds on the “Start of the Thirty Years' War”; the other events are earlier than 1618, so they cannot be its consequence.",
      },
      {
        pregunta: "Who was this figure? Italian sculptor and painter. He sculpted the David and painted the ceiling of the Sistine Chapel.",
        opciones: ["Leonardo da Vinci", "Martin Luther", "Galileo Galilei", "Michelangelo"],
        respuesta: 3,
        explicacion: "Michelangelo (1475 – 1564): he sculpted the David and painted the ceiling of the Sistine Chapel.",
      },
      {
        pregunta: "Who was this figure? Spanish writer. He wrote Don Quixote of La Mancha.",
        opciones: ["Miguel de Cervantes", "William Shakespeare", "Michelangelo", "Martin Luther"],
        respuesta: 0,
        explicacion: "Miguel de Cervantes (1547 – 1616): he wrote Don Quixote of La Mancha.",
      },
      {
        pregunta: "What was the Protestant Reformation?",
        opciones: [
          "A war between the Roman Empire and Persia",
          "An Italian artistic movement",
          "A law of the Ottoman Empire",
          "A religious movement started by Luther that divided the Christians of western Europe",
        ],
        respuesta: 3,
        explicacion: "The Reformation began with the 95 Theses (1517); the artistic movement is the Renaissance.",
      },
    ],
    visuales: [
      "From Renaissance art to the Peace of Westphalia",
      "Artists, writers and a theologian",
      "From the 95 Theses to the Peace of Westphalia",
    ],
  },
  "historia-clase-19-exploracion-y-conquista-de-america": {
    nombre: "The voyages of exploration and the conquest of the Americas",
    descripcion: "Columbus, Tordesillas, the route to India, the first circumnavigation of the globe and the fall of the Aztec and Inca empires.",
    pasos: [
      "Goal: by the end you will be able to explain why Europeans set out to sea, what happened with Columbus's arrival and how the Aztec and Inca empires fell.",
      "Context: the Early Modern Age begins with 1492. Review of the Middle Ages: the Aztecs (Tenochtitlan, c. 1325) and the Incas (under Pachacuti) were two great states in the Americas with no contact with Europe, and chains of causes and consequences help to put events in order.",
      "The Iberian powers were looking for sea routes to Asia, for its spices, avoiding the routes controlled by others. Portugal sailed around Africa and Vasco da Gama reached India (1498). Castile backed Columbus, who in 1492 reached the Americas thinking he had reached Asia; that is why the inhabitants of the Americas were called “Indians.”",
      "That same year Granada fell, the last Muslim kingdom on the Iberian Peninsula (1492). To avoid conflicts between Castile and Portugal, in 1494 they signed the Treaty of Tordesillas, which divided the zones of exploration between them.",
      "Magellan's expedition left Spain (1519). Magellan died in the Philippines in 1521 and Elcano completed the voyage: the first circumnavigation of the globe (1522).",
      "Hernán Cortés led an expedition that, with the help of Indigenous allies who were enemies of the Mexica, conquered Tenochtitlan (1521); in 1535 the Viceroyalty of New Spain was created. Pizarro captured the Inca ruler Atahualpa at Cajamarca (1532), in an Inca Empire weakened by an internal war.",
      "Key figures: Christopher Columbus, Isabella I of Castile, Vasco da Gama, Ferdinand Magellan, Juan Sebastián Elcano, Hernán Cortés, Moctezuma II, Francisco Pizarro, Atahualpa.",
      "Causes and consequences: Columbus's voyages led to the Treaty of Tordesillas, to the conquest of Tenochtitlan and to the capture of Atahualpa; from the fall of Tenochtitlan came the Viceroyalty. The epidemics brought from Europe caused enormous mortality among the peoples of the Americas; the figures are debated, which is why none are given here.",
      "Connects with: the lesson on pre-Columbian Americas (Aztecs and Incas), the one on the empires of Asia, which had contact with the Portuguese, and the Contemporary Age, where the independence of the Americas closes this period.",
      "Common mistakes: (1) believing the Americas were an empty land: it was inhabited by millions of people; and believing Columbus knew he had reached a new continent: he believed he had reached Asia; (2) believing Magellan completed the circumnavigation: he died before; Elcano completed it; (3) believing the conquest was only military: alliances, diseases and internal wars had an influence.",
    ],
    quiz: [
      {
        pregunta: "Which came first: the “Treaty of Tordesillas between Castile and Portugal” or “Vasco da Gama reaches India by sea”?",
        opciones: [
          "Vasco da Gama reaches India by sea",
          "Treaty of Tordesillas between Castile and Portugal",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 1,
        explicacion: "The Treaty of Tordesillas between Castile and Portugal dates to 1494 and Vasco da Gama reaches India by sea to 1498.",
      },
      {
        pregunta: "Which of these events was a consequence of “Columbus reaches the Americas”?",
        opciones: [
          "Treaty of Tordesillas between Castile and Portugal",
          "Fall of Constantinople to the Ottomans",
          "Gutenberg prints the Bible with movable type",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
        ],
        respuesta: 0,
        explicacion:
          "The Treaty of Tordesillas between Castile and Portugal (1494) came later and builds on “Columbus reaches the Americas”; the other events are earlier than 1492, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events was a consequence of “Fall of Tenochtitlan to the Spanish”?",
        opciones: [
          "Viceroyalty of New Spain is created",
          "Fall of Constantinople to the Ottomans",
          "Gutenberg prints the Bible with movable type",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
        ],
        respuesta: 0,
        explicacion:
          "The Viceroyalty of New Spain is created (1535) came later and builds on the “Fall of Tenochtitlan to the Spanish”; the other events are earlier than 1521, so they cannot be its consequence.",
      },
      {
        pregunta: "Who was this figure? Spanish navigator. He completed the first circumnavigation of the globe in command of the ship Victoria.",
        opciones: ["Juan Sebastián Elcano", "Ferdinand Magellan", "Christopher Columbus", "Hernán Cortés"],
        respuesta: 0,
        explicacion:
          "Juan Sebastián Elcano (died in 1526 (approximate dates)): he completed the first circumnavigation of the globe in command of the ship Victoria.",
      },
      {
        pregunta: "Who was this figure? Spanish conquistador. He led the conquest of the Inca Empire.",
        opciones: ["Hernán Cortés", "Christopher Columbus", "Vasco da Gama", "Francisco Pizarro"],
        respuesta: 3,
        explicacion: "Francisco Pizarro (died in 1541 (approximate dates)): he led the conquest of the Inca Empire.",
      },
      {
        pregunta: "Why did Columbus call the inhabitants of the Americas “Indians”?",
        opciones: [
          "Because they spoke languages of India",
          "Because he believed he had reached Asia, the Indies",
          "Because they came from India",
          "Because that was the name of their people",
        ],
        respuesta: 1,
        explicacion:
          "Columbus thought he had reached the Indies, that is, Asia; the name stuck, even though it does not correspond to the peoples of the Americas.",
      },
    ],
    visuales: [
      "Nine events of exploration and conquest",
      "From Columbus to Tenochtitlan and the Viceroyalty",
      "From Magellan to the first circumnavigation",
      "The protagonists (1)",
      "The protagonists (2)",
    ],
  },
  "historia-clase-20-imperios-de-asia-moderna": {
    nombre: "The great empires of Asia: Mughals, Tokugawa and Qing",
    descripcion: "The Mughal Empire of India, the Tokugawa shogunate of Japan and the Qing dynasty of China.",
    pasos: [
      "Goal: by the end you will be able to place three great Asian states of the Early Modern Age: the Mughal Empire, the Japan of the Tokugawa and the China of the Qing.",
      "Context: in the Middle Ages, the Delhi Sultanate ruled northern India, in Japan power had passed to the shoguns and in China the Ming dynasty ruled. This lesson looks at what replaced them, and every event has a cause that comes before it.",
      "In India, Babur, a prince from Central Asia, won at Panipat (1526) and founded the Mughal Empire. His grandson Akbar ruled from 1556 and is remembered for his policy of tolerance among religions.",
      "Shah Jahan, another Mughal emperor, had the Taj Mahal built as a mausoleum for his wife (1632).",
      "In Japan, Tokugawa Ieyasu won at Sekigahara (1600) and became shogun in 1603. The Tokugawa shogunate ruled Japan for more than two and a half centuries (until the Meiji Restoration, 1868).",
      "In China, the Manchus took Beijing and the rule of the Qing dynasty began (1644), the last imperial dynasty of China.",
      "Key figures: Babur, Akbar, Shah Jahan, Tokugawa Ieyasu.",
      "Causes and consequences: Ieyasu's victory at Sekigahara led to the Tokugawa shogunate. School-level simplification: the Mughal Empire, very rich, was also a target of European merchants.",
      "Connects with: the lesson on medieval East Asia, the one on the great European voyages (the Portuguese were already in India) and the Contemporary Age, where Japan will modernize with the Meiji Restoration and China will be affected by imperialism.",
      "Common mistakes: (1) confusing the Mughals with the Mongols: the former ruled India (Babur descended from the Mongols on his mother's side), the latter are Genghis Khan's; (2) believing the shogun was the emperor: the shogun governed in the emperor's name; (3) thinking the Taj Mahal is a temple: it is a mausoleum.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Babur founds the Mughal Empire after the Battle of Panipat” or “Tokugawa Ieyasu wins at Sekigahara”?",
        opciones: [
          "Tokugawa Ieyasu wins at Sekigahara",
          "They happened in the same year",
          "Babur founds the Mughal Empire after the Battle of Panipat",
          "There is no way to know which came first",
        ],
        respuesta: 2,
        explicacion:
          "Babur founds the Mughal Empire after the Battle of Panipat in 1526 and Tokugawa Ieyasu wins at Sekigahara in 1600.",
      },
      {
        pregunta: "Which of these events was a consequence of “Tokugawa Ieyasu wins at Sekigahara”?",
        opciones: [
          "Fall of Constantinople to the Ottomans",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
          "Tokugawa shogunate begins in Japan",
          "Start of the Tang dynasty in China",
        ],
        respuesta: 2,
        explicacion:
          "The Tokugawa shogunate begins in Japan (1603) came later and builds on “Tokugawa Ieyasu wins at Sekigahara”; the other events are earlier than 1600, so they cannot be its consequence.",
      },
      {
        pregunta: "Who was this figure? Mughal emperor. He had the Taj Mahal built as a mausoleum for his wife.",
        opciones: ["Akbar", "Babur", "Tokugawa Ieyasu", "Shah Jahan"],
        respuesta: 3,
        explicacion: "Shah Jahan (1592 – 1666): he had the Taj Mahal built as a mausoleum for his wife.",
      },
      {
        pregunta: "Who was this figure? Founder of the Mughal Empire. He won at Panipat and founded the Mughal Empire in India.",
        opciones: ["Akbar", "Babur", "Shah Jahan", "Tokugawa Ieyasu"],
        respuesta: 1,
        explicacion: "Babur (1483 – 1530): he won at Panipat and founded the Mughal Empire in India.",
      },
      {
        pregunta: "What is the Taj Mahal?",
        opciones: [
          "A mausoleum that Shah Jahan had built for his wife",
          "A temple in Japan",
          "A Chinese fortress",
          "A palace in Constantinople",
        ],
        respuesta: 0,
        explicacion: "The Taj Mahal, whose construction began in c. 1632, is a mausoleum of the Mughal Empire.",
      },
    ],
    visuales: ["Six events of India, Japan and China", "Four protagonists", "From the Battle of Sekigahara to the shogunate"],
  },
  "historia-clase-21-revolucion-cientifica-e-ilustracion": {
    nombre: "The Scientific Revolution and the Enlightenment",
    descripcion: "Copernicus, Galileo, Newton, the Enlightenment's ideas of reason and popular sovereignty and the steam engine.",
    pasos: [
      "Goal: by the end you will be able to explain what changed in science with Copernicus, Galileo and Newton and what ideas the Enlightenment defended.",
      "Context: the Renaissance (previous lesson) gave Europe back its interest in observing and studying nature. From that curiosity came the scientific advances of the following centuries.",
      "Nicolaus Copernicus proposed that the Earth and the other planets revolve around the Sun, in his work of 1543. Galileo observed the sky with the telescope (1609) and discovered, among other things, the moons of Jupiter; he had conflicts with the Church for defending those ideas.",
      "Isaac Newton published the Principia (1687), where he formulated the law of universal gravitation and the laws of motion.",
      "The Enlightenment was an 18th-century movement that defended the use of reason, freedom of thought and criticism of authority. Its ideas influenced the revolutions that followed.",
      "One of its authors, Rousseau, wrote The Social Contract (1762), in which he argues that political power arises from an agreement among citizens.",
      "Technology also advanced: James Watt patented an improved steam engine (1769), which was soon applied in factories and transport.",
      "Key figures: Nicolaus Copernicus, Galileo Galilei, Isaac Newton, Jean-Jacques Rousseau, James Watt.",
      "Causes and consequences: scientific discoveries changed the idea of the universe; the Enlightenment applied that confidence in reason to politics and society; and the steam engine opened the way to the Industrial Revolution, which is studied in the Contemporary Age.",
      "Connects with: the lesson on the Renaissance (scientific curiosity comes from there), with the one on the exploration of the Americas (navigation used astronomy) and with the Contemporary Age, where science drives industrialization.",
      "Common mistakes: (1) believing Galileo invented the telescope: he improved it and used it to observe the sky; (2) confusing Copernicus with Galileo: Copernicus proposed heliocentrism, Galileo contributed observations; (3) believing Watt invented the steam engine out of nothing: he improved a machine that already existed.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Copernicus publishes his heliocentric theory” or “Newton publishes the Principia”?",
        opciones: [
          "Newton publishes the Principia",
          "Copernicus publishes his heliocentric theory",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 1,
        explicacion: "Copernicus publishes his heliocentric theory in 1543 and Newton publishes the Principia in 1687.",
      },
      {
        pregunta: "Which came first: “Galileo observes the sky with the telescope” or “Rousseau publishes The Social Contract”?",
        opciones: [
          "Rousseau publishes The Social Contract",
          "They happened in the same year",
          "Galileo observes the sky with the telescope",
          "There is no way to know which came first",
        ],
        respuesta: 2,
        explicacion: "Galileo observes the sky with the telescope in 1609 and Rousseau publishes The Social Contract in 1762.",
      },
      {
        pregunta: "Who was this figure? Polish astronomer. He proposed that the Earth and the planets revolve around the Sun.",
        opciones: ["Galileo Galilei", "Isaac Newton", "Nicolaus Copernicus", "Jean-Jacques Rousseau"],
        respuesta: 2,
        explicacion: "Nicolaus Copernicus (1473 – 1543): he proposed that the Earth and the planets revolve around the Sun.",
      },
      {
        pregunta: "Who was this figure? English scientist. He formulated the law of universal gravitation.",
        opciones: ["Galileo Galilei", "Nicolaus Copernicus", "Isaac Newton", "James Watt"],
        respuesta: 2,
        explicacion: "Isaac Newton (1643 – 1727 (approximate dates)): he formulated the law of universal gravitation.",
      },
      {
        pregunta: "What did the thinkers of the Enlightenment defend?",
        opciones: [
          "Absolute obedience to kings",
          "A return to nomadic life",
          "A ban on books",
          "The use of reason, freedom of thought and criticism of authority",
        ],
        respuesta: 3,
        explicacion: "The Enlightenment trusted in reason and criticized authorities that were not based on it.",
      },
    ],
    visuales: ["Five landmarks of science and ideas", "Five protagonists"],
  },
  "historia-clase-22-colonias-comercio-y-esclavitud-atlantica": {
    nombre: "The Atlantic world: colonies, slavery and rivalries between powers",
    descripcion: "The Spanish Armada, the colonies of North America, the enslavement of Africans, Queen Nzinga, Cook's expeditions and Túpac Amaru II's rebellion.",
    pasos: [
      "Goal: by the end you will be able to place the main powers that competed in the Atlantic, how the English colonies of North America were founded and what the trade in enslaved Africans was.",
      "Context: after the voyages of exploration and the conquest of the Americas, other European powers, such as England, France and the Netherlands, set out to compete for territory and trade. Each event in this lesson has causes and consequences that link together.",
      "The rivalry between Spain and England showed in the defeat of the Spanish Armada, the fleet Spain sent against England (1588).",
      "In 1607 Jamestown was founded, the first lasting English settlement in North America. In 1619 the first enslaved Africans arrived in Virginia. The transatlantic slave trade took millions of enslaved African people to the Americas; the figures are debated, which is why none are given here.",
      "In Africa, Queen Nzinga of Ndongo (1624) resisted Portuguese pressure for decades. In the Pacific, James Cook explored the east coast of Australia (1770). And in the Andes, Túpac Amaru II led a rebellion against the colonial administration (1780).",
      "The Seven Years' War (1756) pitted the European powers against each other on several continents: it left debts and changes in the colonial map.",
      "Key figures: Nzinga, James Cook, Túpac Amaru II.",
      "Causes and consequences: the founding of Jamestown led to plantations settling in Virginia and, with them, to the arrival of enslaved Africans; the Seven Years' War had effects on the British colonies, the subject of the next lesson.",
      "Connects with: the lesson on exploration and conquest, the one on the independence of the United States, the one on medieval Africa and the Contemporary Age (abolition of slavery).",
      "Common mistakes: (1) believing slavery began with the Atlantic slave trade: it existed earlier in many societies; what was new was its scale and its transoceanic character; (2) thinking African peoples only suffered the slave trade and did not resist: there was resistance, such as Nzinga's; (3) believing Cook “discovered” Australia, which had been inhabited for tens of thousands of years.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Defeat of the Spanish Armada” or “Founding of Jamestown, the first lasting English settlement in North America”?",
        opciones: [
          "Founding of Jamestown, the first lasting English settlement in North America",
          "They happened in the same year",
          "Defeat of the Spanish Armada",
          "There is no way to know which came first",
        ],
        respuesta: 2,
        explicacion:
          "The Defeat of the Spanish Armada dates to 1588 and the Founding of Jamestown, the first lasting English settlement in North America, to 1607.",
      },
      {
        pregunta: "Which of these events was a consequence of “Founding of Jamestown, the first lasting English settlement in North America”?",
        opciones: [
          "First enslaved Africans arrive in Virginia",
          "Fall of Constantinople to the Ottomans",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
          "Gutenberg prints the Bible with movable type",
        ],
        respuesta: 0,
        explicacion:
          "First enslaved Africans arrive in Virginia (1619) came later and builds on “Founding of Jamestown, the first lasting English settlement in North America”; the other events are earlier than 1607, so they cannot be its consequence.",
      },
      {
        pregunta: "Who was this figure? Queen of Ndongo and Matamba. She resisted Portuguese pressure in Central Africa for decades.",
        opciones: ["Nzinga", "Túpac Amaru II", "James Cook", "Atahualpa"],
        respuesta: 0,
        explicacion: "Nzinga (1583 – 1663): she resisted Portuguese pressure in Central Africa for decades.",
      },
      {
        pregunta: "Who was this figure? British navigator. He explored the Pacific and reached the east coast of Australia.",
        opciones: ["Túpac Amaru II", "Ferdinand Magellan", "James Cook", "Christopher Columbus"],
        respuesta: 2,
        explicacion: "James Cook (1728 – 1779): he explored the Pacific and reached the east coast of Australia.",
      },
      {
        pregunta: "In which century did “Túpac Amaru II's rebellion in the Andes” take place?",
        opciones: ["19th century", "17th century", "18th century", "18th century BC"],
        respuesta: 2,
        explicacion:
          "1780 belongs to the 18th century: century n runs from year (n − 1) · 100 + 1 to year n · 100 and, for BC years, you count backward.",
      },
    ],
    visuales: ["Seven events of the Atlantic world", "Nzinga, Cook and Túpac Amaru II", "From Jamestown to Virginia"],
  },
  "historia-clase-23-independencia-de-estados-unidos": {
    nombre: "The independence of the United States",
    descripcion: "From the conflict over taxes to the Declaration of Independence and the Constitution, and how the Early Modern Age closes.",
    pasos: [
      "Goal: by the end you will be able to explain why the British colonies of North America became independent and what was established in their Constitution.",
      "Context: the thirteen British colonies had been founded along the coasts of North America (the Atlantic world), and the ideas of the Enlightenment, such as that political power arises from an agreement among citizens, circulated among their inhabitants. A cause comes before its consequence; in this lesson there is a chain.",
      "After the Seven Years' War (1756), the United Kingdom was left in debt and imposed new taxes on its colonies. The colonists protested: they argued that they should not pay taxes without having representatives in Parliament.",
      "The colonies confronted the United Kingdom and declared their independence (1776). The Declaration, written mainly by Thomas Jefferson, stated that all men are created equal and have rights such as life and liberty, ideas of the Enlightenment.",
      "George Washington commanded the Continental Army during the war. School-level simplification: the ideals of equality and liberty did not reach everyone in practice: slavery continued and women and Indigenous peoples were left without those rights.",
      "In 1787 the United States Constitution was drafted, which established a federal government with powers divided into three branches.",
      "Key figures: Thomas Jefferson, Benjamin Franklin, George Washington: the drafter, the scientist and politician who took part, and the commander and first president.",
      "Causes and consequences: the Seven Years' War led to the taxes, the taxes to the protest and the protest to independence; independence led to the Constitution. The figure shows the main chain.",
      "Connects with: the French Revolution (which relied on similar ideas), with the Spanish American independence movements and with the Contemporary Age, which begins with the French Revolution in 1789.",
      "Common mistakes: (1) confusing the date of the Declaration with the end of the war: independence was declared earlier and the war went on afterward; (2) believing the Constitution and the Declaration are the same document; (3) thinking the Early Modern Age ends with this independence: the school convention closes it in 1789.",
    ],
    quiz: [
      {
        pregunta: "Which of these events was a consequence of the “Seven Years' War”?",
        opciones: [
          "Fall of Constantinople to the Ottomans",
          "Gutenberg prints the Bible with movable type",
          "United States Declaration of Independence",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
        ],
        respuesta: 2,
        explicacion:
          "The United States Declaration of Independence (1776) came later and builds on the “Seven Years' War”; the other events are earlier than 1756, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events was a consequence of the “United States Declaration of Independence”?",
        opciones: [
          "Fall of Constantinople to the Ottomans",
          "Columbus reaches the Americas",
          "The United States Constitution is drafted",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
        ],
        respuesta: 2,
        explicacion:
          "The United States Constitution is drafted (1787) came later and builds on the “United States Declaration of Independence”; the other events are earlier than 1776, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events helped cause the “United States Declaration of Independence”?",
        opciones: [
          "Storming of the Bastille, start of the French Revolution",
          "Battle of Waterloo",
          "Seven Years' War",
          "Start of World War I",
        ],
        respuesta: 2,
        explicacion:
          "The Seven Years' War (1756) came earlier and helped cause it; the other events happened after 1776, so they cannot be a cause.",
      },
      {
        pregunta: "Who was this figure? President of the United States. He commanded the Continental Army and was the first president of the United States.",
        opciones: ["Thomas Jefferson", "Benjamin Franklin", "Martin Luther", "George Washington"],
        respuesta: 3,
        explicacion:
          "George Washington (1732 – 1799): he commanded the Continental Army and was the first president of the United States.",
      },
      {
        pregunta: "Who mainly drafted the United States Declaration of Independence?",
        opciones: ["George Washington", "Benjamin Franklin", "Isaac Newton", "Thomas Jefferson"],
        respuesta: 3,
        explicacion:
          "Thomas Jefferson drafted most of the Declaration (1776); Washington commanded the army and Franklin took part in the process.",
      },
    ],
    visuales: ["From the war to the Constitution", "Three protagonists"],
  },
  "historia-clase-24-revolucion-francesa-y-napoleon": {
    nombre: "The French Revolution and Napoleon",
    descripcion: "The start of the Contemporary Age: the French Revolution, the Rights of Man, Napoleon's France and its end at Waterloo.",
    pasos: [
      "Goal: by the end you will be able to explain what the French Revolution was, why its start is taken as the boundary of the Contemporary Age and what role Napoleon played.",
      "Context: by school convention, the Early Modern Age ends and the Contemporary Age begins with 1789 (other textbooks use other dates). Review of the Early Modern Age: the ideas of the Enlightenment, such as Rousseau's in The Social Contract (1762), and the independence of the United States (1776), which had followed the Seven Years' War (1756), were circulating in France. Remember that a cause always comes before its consequence.",
      "In 1789, the people of Paris stormed the Bastille, a fortress-prison; that event symbolizes the start of the French Revolution. Shortly afterward the Declaration of the Rights of Man and of the Citizen (1789) was adopted, which affirmed equality of rights before the law.",
      "Napoleon Bonaparte, a general, gradually gained power and crowned himself emperor of the French (1804). His campaign in Egypt (1798) brought the discovery of the Rosetta Stone (1799), whose text in three scripts allowed Champollion to decipher the Egyptian hieroglyphs (1822).",
      "Napoleon invaded Spain (1808), which had great consequences in Spanish America. His power ended with the defeat at Waterloo (1815).",
      "Key figures: Napoleon Bonaparte and Jean-François Champollion.",
      "Causes and consequences: the independence of the United States and the ideas of the Enlightenment contributed to the French Revolution; the Revolution led to the Declaration of Rights. The figure links those relationships. School-level simplification: the Revolution had many stages and economic and social causes that are not detailed here.",
      "Connects with: the lesson on the revolutions of the Americas (the Haitian and the Spanish American ones), with the one on the independence of the United States and with those that follow on industrialization and imperialism.",
      "Common mistakes: (1) believing the French Revolution ended with the storming of the Bastille: it was the beginning; (2) confusing Napoleon with a king: he crowned himself emperor; (3) thinking Champollion found the Rosetta Stone: Napoleon's army found it and he deciphered the hieroglyphs afterward.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Storming of the Bastille, start of the French Revolution” or “Napoleon crowns himself emperor of the French”?",
        opciones: [
          "Napoleon crowns himself emperor of the French",
          "They happened in the same year",
          "There is no way to know which came first",
          "Storming of the Bastille, start of the French Revolution",
        ],
        respuesta: 3,
        explicacion:
          "Storming of the Bastille, start of the French Revolution, dates to 1789 and Napoleon crowns himself emperor of the French to 1804.",
      },
      {
        pregunta: "Which of these events was a consequence of “Storming of the Bastille, start of the French Revolution”?",
        opciones: [
          "Fall of Constantinople to the Ottomans",
          "Declaration of the Rights of Man and of the Citizen",
          "Columbus reaches the Americas",
          "Seven Years' War",
        ],
        respuesta: 1,
        explicacion:
          "The Declaration of the Rights of Man and of the Citizen (1789) came later and builds on “Storming of the Bastille, start of the French Revolution”; the other events are earlier than 1789, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events was a consequence of “Napoleon's campaign in Egypt”?",
        opciones: [
          "Fall of Constantinople to the Ottomans",
          "Columbus reaches the Americas",
          "Seven Years' War",
          "Discovery of the Rosetta Stone",
        ],
        respuesta: 3,
        explicacion:
          "The Discovery of the Rosetta Stone (1799) came later and builds on “Napoleon's campaign in Egypt”; the other events are earlier than 1798, so they cannot be its consequence.",
      },
      {
        pregunta: "Who was this figure? French Egyptologist. He deciphered the Egyptian hieroglyphs.",
        opciones: ["Napoleon Bonaparte", "Jean-François Champollion", "Edward Jenner", "Charles Darwin"],
        respuesta: 1,
        explicacion: "Jean-François Champollion (1790 – 1832): he deciphered the Egyptian hieroglyphs.",
      },
      {
        pregunta: "According to school periodization, in which era did the “Battle of Waterloo” take place?",
        opciones: ["Early Modern Age", "Prehistory", "Antiquity", "Contemporary Age"],
        respuesta: 3,
        explicacion: "1815 falls in the Contemporary Age (from 1789, by school convention).",
      },
      {
        pregunta: "Which event is taken, by school convention, as the beginning of the Contemporary Age?",
        opciones: [
          "Columbus reaches the Americas",
          "Storming of the Bastille, start of the French Revolution",
          "Fall of the Western Roman Empire",
          "Invention of writing in Sumer",
        ],
        respuesta: 1,
        explicacion: "The school convention opens the Contemporary Age with the French Revolution; other textbooks propose other dates.",
      },
    ],
    visuales: [
      "From 1776 to 1815",
      "From American independence to the Rights of Man",
      "From Rousseau to the Bastille",
      "Napoleon and Champollion",
    ],
  },
  "historia-clase-25-revoluciones-e-independencias-de-america": {
    nombre: "The Haitian Revolution and the independence of Spanish America",
    descripcion: "How Haiti became independent and how the Spanish colonies of the Americas stopped being colonies with Bolívar and San Martín.",
    pasos: [
      "Goal: by the end you will be able to explain how Haiti became independent and why the independence movements of Spanish America began, with their main protagonists.",
      "Context: in the previous lesson you saw the French Revolution (1789) and Napoleon's invasion of Spain (1808). Review of the Early Modern Age: the colonies of the Americas had been under European rule for about three centuries, since the voyages of exploration and the conquest.",
      "Haiti was a French colony with a plantation economy sustained by enslaved people. The 1791 rebellion was one of the largest rebellions of enslaved people in colonial history and the only one that ended up creating an independent state (1804): Haiti was the first independent country of Latin America and the Caribbean and the first governed by formerly enslaved people. Its main leader was Toussaint Louverture.",
      "In Spanish America, Napoleon's invasion of Spain weakened Spanish power and the independence movements began (c. 1810).",
      "José de San Martín crossed the Andes with his army (1817) to liberate Chile and then Peru. Simón Bolívar, from the north, led the independence of several countries. The two met at the Guayaquil meeting (1822); historians debate what they agreed. The Battle of Ayacucho (1824) was decisive for the end of Spanish rule in South America.",
      "Key figures: Toussaint Louverture, José de San Martín, Simón Bolívar.",
      "Causes and consequences: the French Revolution influenced the Haitian rebellion, which led to independence; Napoleon's invasion of Spain led to the Spanish American independence movements, which produced San Martín's expeditions and battles such as Ayacucho.",
      "Connects with: the lesson on the independence of the United States (the first country to become independent from a European empire), the one on the French Revolution and the one on imperialism, where other regions will lose or gain autonomy.",
      "Common mistakes: (1) believing all the independence movements happened at once: they were different processes over the course of years; (2) confusing Bolívar with San Martín: one acted mainly in northern South America and the other in the south and the Pacific; (3) believing Haiti was a Spanish colony: it was French.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Haitian Revolution begins” or “San Martín crosses the Andes”?",
        opciones: [
          "San Martín crosses the Andes",
          "They happened in the same year",
          "Haitian Revolution begins",
          "There is no way to know which came first",
        ],
        respuesta: 2,
        explicacion: "The Haitian Revolution begins in 1791 and San Martín crosses the Andes in 1817.",
      },
      {
        pregunta: "Which of these events was a consequence of “Haitian Revolution begins”?",
        opciones: [
          "Fall of Constantinople to the Ottomans",
          "Independence of Haiti",
          "Columbus reaches the Americas",
          "Seven Years' War",
        ],
        respuesta: 1,
        explicacion:
          "The Independence of Haiti (1804) came later and builds on “Haitian Revolution begins”; the other events are earlier than 1791, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events was a consequence of “Independence revolutions begin in Spanish America”?",
        opciones: [
          "Fall of Constantinople to the Ottomans",
          "Columbus reaches the Americas",
          "San Martín crosses the Andes",
          "Seven Years' War",
        ],
        respuesta: 2,
        explicacion:
          "San Martín crosses the Andes (1817) came later and builds on “Independence revolutions begin in Spanish America”; the other events are earlier than 1810, so they cannot be its consequence.",
      },
      {
        pregunta: "Who was this figure? Leader of the Haitian Revolution. He was the main leader of the revolution of enslaved people in Haiti.",
        opciones: ["Simón Bolívar", "Toussaint Louverture", "José de San Martín", "Napoleon Bonaparte"],
        respuesta: 1,
        explicacion:
          "Toussaint Louverture (1743 – 1803 (approximate dates)): he was the main leader of the revolution of enslaved people in Haiti.",
      },
      {
        pregunta: "Who was this figure? General of South American independence. He crossed the Andes with his army to liberate Chile and Peru.",
        opciones: ["Simón Bolívar", "José de San Martín", "Toussaint Louverture", "George Washington"],
        respuesta: 1,
        explicacion: "José de San Martín (1778 – 1850): he crossed the Andes with his army to liberate Chile and Peru.",
      },
      {
        pregunta: "Which power ruled Haiti before its independence?",
        opciones: ["Spain", "The United Kingdom", "Portugal", "France"],
        respuesta: 3,
        explicacion: "Haiti was a French colony; its independence came in 1804.",
      },
    ],
    visuales: [
      "From 1789 to 1824",
      "From the Bastille to the independence of Haiti",
      "From Napoleon to the Spanish American independence movements",
      "Three protagonists",
    ],
  },
  "historia-clase-26-industrializacion-y-ciencia": {
    nombre: "Industrialization and scientific advances",
    descripcion: "From the steam engine and the railway to the vaccine, evolution, the telephone, the airplane, relativity and penicillin.",
    pasos: [
      "Goal: by the end you will be able to explain how the steam engine changed work and transport and place the great scientific and technical advances of the 19th and 20th centuries.",
      "Context: the scientific revolution of the 16th and 17th centuries and the Enlightenment had spread confidence in reason and observation. With that momentum, Watt's steam engine (1769) reached the factories; and a cause always comes before its consequence.",
      "The Industrial Revolution began in the United Kingdom: factories and machines replaced many manual tasks, cities grew and family life changed. One symbol was the steam railway between Liverpool and Manchester (1830). New ideas about society also emerged, such as those of Karl Marx.",
      "In medicine, Jenner tested the first vaccine, against smallpox (1796); almost two centuries later, the World Health Organization declared that disease eradicated (1980). Fleming discovered penicillin (1928), the first antibiotic.",
      "In biology, Darwin published On the Origin of Species (1859), in which he proposed evolution by natural selection.",
      "Communications and transport sped up: Bell's telephone (1876) and the first powered flight by the Wright brothers (1903). In physics, Einstein published the theory of special relativity (1905).",
      "Key figures: Edward Jenner, Charles Darwin, Karl Marx, Alexander Graham Bell, Marie Curie, Albert Einstein, Alexander Fleming.",
      "Causes and consequences: Watt's steam engine made the railway possible; and Jenner's vaccine, over time and with the spread of vaccination, led to the eradication of smallpox. Both chains are in the figure.",
      "Connects with: the lesson on imperialism (the new techniques gave advantages to the industrial powers), with the one on World War I and with the world today, shaped by science and technology.",
      "Common mistakes: (1) believing Watt invented the steam engine: he improved it; (2) confusing vaccine and antibiotic: a vaccine prevents diseases and an antibiotic treats them; (3) believing Darwin said that “humans come from monkeys”: he proposed natural selection as a mechanism of evolution.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Watt patents his steam engine” or “Bell patents the telephone”?",
        opciones: [
          "Bell patents the telephone",
          "They happened in the same year",
          "Watt patents his steam engine",
          "There is no way to know which came first",
        ],
        respuesta: 2,
        explicacion: "Watt patents his steam engine in 1769 and Bell patents the telephone in 1876.",
      },
      {
        pregunta: "Which of these events was a consequence of “Watt patents his steam engine”?",
        opciones: [
          "Fall of Constantinople to the Ottomans",
          "Columbus reaches the Americas",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
          "Opening of the steam railway between Liverpool and Manchester",
        ],
        respuesta: 3,
        explicacion:
          "The Opening of the steam railway between Liverpool and Manchester (1830) came later and builds on “Watt patents his steam engine”; the other events are earlier than 1769, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events was a consequence of “Jenner tests the smallpox vaccine”?",
        opciones: [
          "Fall of Constantinople to the Ottomans",
          "Columbus reaches the Americas",
          "Hijra: Muhammad and his followers move from Mecca to Medina",
          "The WHO declares smallpox eradicated",
        ],
        respuesta: 3,
        explicacion:
          "The WHO declares smallpox eradicated (1980) came later and builds on “Jenner tests the smallpox vaccine”; the other events are earlier than 1796, so they cannot be its consequence.",
      },
      {
        pregunta: "Who was this figure? English naturalist. He proposed evolution by natural selection in On the Origin of Species.",
        opciones: ["Albert Einstein", "Alexander Fleming", "Charles Darwin", "Edward Jenner"],
        respuesta: 2,
        explicacion: "Charles Darwin (1809 – 1882): he proposed evolution by natural selection in On the Origin of Species.",
      },
      {
        pregunta: "Who was this figure? Scottish scientist. He discovered penicillin in 1928.",
        opciones: ["Alexander Fleming", "Edward Jenner", "Charles Darwin", "Marie Curie"],
        respuesta: 0,
        explicacion: "Alexander Fleming (1881 – 1955): he discovered penicillin in 1928.",
      },
      {
        pregunta: "In which century did “Einstein publishes the theory of special relativity” take place?",
        opciones: ["20th century", "21st century", "19th century", "20th century BC"],
        respuesta: 0,
        explicacion:
          "1905 belongs to the 20th century: century n runs from year (n − 1) · 100 + 1 to year n · 100 and, for BC years, you count backward.",
      },
    ],
    visuales: [
      "From steam to penicillin",
      "From the steam engine to the railway",
      "From the vaccine to the eradication of smallpox",
      "Seven protagonists",
    ],
  },
  "historia-clase-27-imperialismo-y-abolicion-de-la-esclavitud": {
    nombre: "Imperialism, the abolition of slavery and new states",
    descripcion: "The abolition of slavery in the British Empire and in the United States, the Opium War, the modernization of Japan, the partition of Africa and the resistance to it.",
    pasos: [
      "Goal: by the end you will be able to explain how legal slavery ended in the British Empire and in the United States, what 19th-century imperialism was and how some states of Asia and Africa responded.",
      "Context: the trade in enslaved Africans had grown in the Atlantic world over centuries. In Asia, Japan was under the Tokugawa shogunate and China under the Qing dynasty; in Africa there were states such as Mali in the Middle Ages and others afterward. With industrialization, the European powers gained technical advantages and extended their control. A cause comes before its consequence.",
      "The abolition: the United Kingdom passed the Slavery Abolition Act for its Empire (1833). In the United States, the Civil War (1861) led to Lincoln's Emancipation Proclamation (1863); complete abolition in the country came later.",
      "Imperialism: the European powers expanded their rule over Asia and Africa. The First Opium War (1839) pitted China against the United Kingdom. The Suez Canal (1869) shortened the route to Asia, and the Berlin Conference (1884) regulated the colonial partition of Africa among European powers, without the participation of African peoples.",
      "Not all states were dominated. Japan modernized after the Meiji Restoration (1868); Ethiopia defeated Italy at the Battle of Adwa (1896); in southern Africa, Shaka formed the Zulu kingdom (c. 1816); China ended the empire and proclaimed the Republic (1912); and New Zealand was the first country to grant women the vote (1893).",
      "Key figures: Abraham Lincoln, Otto von Bismarck, Emperor Meiji, Menelik II, Shaka, Sun Yat-sen, Rabindranath Tagore.",
      "Causes and consequences: the Civil War led to the Emancipation Proclamation; the imbalance of power between industrial powers and other states led to wars such as the Opium War; and the Meiji Restoration was a Japanese response to that world. School-level simplification: each region had its own history and its own protagonists.",
      "Connects with: the lesson on the independence of the Americas (another way of ending colonial rule), the one on World War I (imperial rivalries were one of its causes) and the one on decolonization, 20th century.",
      "Common mistakes: (1) believing slavery ended everywhere at once: it was a process with different dates in each place; (2) believing all of Africa was colonized: Ethiopia kept its independence (with a brief occupation in the 20th century); (3) confusing Meiji with the shogunate: Meiji ended it.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Slavery Abolition Act in the British Empire” or “Start of the American Civil War”?",
        opciones: [
          "Start of the American Civil War",
          "They happened in the same year",
          "Slavery Abolition Act in the British Empire",
          "There is no way to know which came first",
        ],
        respuesta: 2,
        explicacion: "The Slavery Abolition Act in the British Empire dates to 1833 and the Start of the American Civil War to 1861.",
      },
      {
        pregunta: "Which of these events was a consequence of “Start of the American Civil War”?",
        opciones: [
          "Fall of Constantinople to the Ottomans",
          "Lincoln's Emancipation Proclamation",
          "Columbus reaches the Americas",
          "Storming of the Bastille, start of the French Revolution",
        ],
        respuesta: 1,
        explicacion:
          "Lincoln's Emancipation Proclamation (1863) came later and builds on the “Start of the American Civil War”; the other events are earlier than 1861, so they cannot be its consequence.",
      },
      {
        pregunta: "Which came first: “First Opium War begins” or “Berlin Conference on the colonial partition of Africa”?",
        opciones: [
          "Berlin Conference on the colonial partition of Africa",
          "They happened in the same year",
          "There is no way to know which came first",
          "First Opium War begins",
        ],
        respuesta: 3,
        explicacion:
          "The First Opium War begins in 1839 and the Berlin Conference on the colonial partition of Africa takes place in 1884.",
      },
      {
        pregunta: "Who was this figure? Emperor of Ethiopia. He defeated Italy at the Battle of Adwa.",
        opciones: ["Abraham Lincoln", "Otto von Bismarck", "Menelik II", "Sun Yat-sen"],
        respuesta: 2,
        explicacion: "Menelik II (1844 – 1913): he defeated Italy at the Battle of Adwa.",
      },
      {
        pregunta: "Who was this figure? President of the United States. He was president during the Civil War and proclaimed the emancipation of enslaved people.",
        opciones: ["Otto von Bismarck", "Abraham Lincoln", "Menelik II", "George Washington"],
        respuesta: 1,
        explicacion:
          "Abraham Lincoln (1809 – 1865): he was president during the Civil War and proclaimed the emancipation of enslaved people.",
      },
      {
        pregunta: "What did the Berlin Conference regulate?",
        opciones: [
          "The end of the Civil War",
          "The independence of Haiti",
          "The colonial partition of Africa among European powers",
          "The unification of China",
        ],
        respuesta: 2,
        explicacion:
          "The Berlin Conference (1884) regulated the colonial partition of Africa among European powers, without the participation of African peoples.",
      },
    ],
    visuales: ["From 1833 to 1869", "From c. 1816 to 1912", "From the Civil War to the Emancipation", "The protagonists"],
  },
  "historia-clase-28-primera-guerra-mundial-revolucion-rusa-y-entreguerras": {
    nombre: "World War I, the Russian Revolution and the interwar years",
    descripcion: "From Sarajevo to World War I, the Russian Revolution, the Treaty of Versailles, the founding of the USSR and the 1929 crisis.",
    pasos: [
      "Goal: by the end you will be able to explain what set off World War I, what the Russian Revolution was and what happened in the interwar years, with their dates and protagonists.",
      "Context: in the previous lesson you saw that the European powers were competing for empires. And remember that a two-step chain links three events: A causes B and B causes C; in this lesson there are several.",
      "In 1914 Archduke Franz Ferdinand, heir to the Austro-Hungarian throne, was assassinated in Sarajevo. From that event, the systems of alliances led the main European powers to confront each other and World War I began (1914), which spread to other continents.",
      "During the war, the revolution took place in Russia (1917): the Bolsheviks, led by Lenin, seized power. Shortly afterward the Soviet Union was founded (1922).",
      "The war ended with an armistice (1918) and the victorious powers signed the Treaty of Versailles (1919).",
      "In 1929 the New York stock market collapsed and the Great Depression began (1929), a worldwide economic crisis with unemployment and business closures. In India, Gandhi led the Salt March (1930), a nonviolent action against the British salt tax.",
      "Key figures: Vladimir Lenin (Bolshevik leader) and Mahatma Gandhi (leader of India's independence movement).",
      "Causes and consequences: the Sarajevo assassination led to the war; the war opened the way to the Russian Revolution and to the founding of the USSR; the war ended with the armistice and with Versailles; and the 1929 crisis led to the Great Depression. The four chains are in the figures.",
      "Connects with: the lesson on imperialism (underlying causes), with the one on World War II (which took place a few years later) and with the one on decolonization (the Salt March is an episode of India's independence).",
      "Common mistakes: (1) believing the assassination caused the war by itself: it was the trigger of accumulated tensions; (2) confusing armistice with peace treaty: the first stops the fighting and the second sets the terms of peace; (3) believing the USSR was founded in 1917: the Revolution was in 1917 and the USSR in 1922.",
    ],
    quiz: [
      {
        pregunta: "Which of these events was a consequence of “Assassination of Archduke Franz Ferdinand in Sarajevo”?",
        opciones: [
          "Storming of the Bastille, start of the French Revolution",
          "Battle of Waterloo",
          "Meiji Restoration in Japan",
          "Start of World War I",
        ],
        respuesta: 3,
        explicacion:
          "The Start of World War I (1914) came later and builds on “Assassination of Archduke Franz Ferdinand in Sarajevo”; the other events are earlier than 1914, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events was a consequence of the “Start of World War I”?",
        opciones: [
          "Storming of the Bastille, start of the French Revolution",
          "Battle of Waterloo",
          "Meiji Restoration in Japan",
          "October Revolution in Russia",
        ],
        respuesta: 3,
        explicacion:
          "The October Revolution in Russia (1917) came later and builds on the “Start of World War I”; the other events are earlier than 1914, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events was a consequence of “Stock market crash on Wall Street”?",
        opciones: [
          "Great Depression begins",
          "Start of World War I",
          "October Revolution in Russia",
          "Treaty of Versailles",
        ],
        respuesta: 0,
        explicacion:
          "The Great Depression begins (1929) came later and builds on the “Stock market crash on Wall Street”; the other events are earlier than 1929, so they cannot be its consequence.",
      },
      {
        pregunta: "Which came first: “October Revolution in Russia” or “Stock market crash on Wall Street”?",
        opciones: [
          "October Revolution in Russia",
          "Stock market crash on Wall Street",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 0,
        explicacion: "The October Revolution in Russia dates to 1917 and the Stock market crash on Wall Street to 1929.",
      },
      {
        pregunta: "Who was this figure? Russian Bolshevik leader. He led the Bolsheviks in the October Revolution of 1917.",
        opciones: ["Mahatma Gandhi", "Winston Churchill", "Vladimir Lenin", "Jawaharlal Nehru"],
        respuesta: 2,
        explicacion: "Vladimir Lenin (1870 – 1924): he led the Bolsheviks in the October Revolution of 1917.",
      },
      {
        pregunta: "What is the difference between an armistice and a peace treaty?",
        opciones: [
          "An armistice stops the fighting; a treaty sets the terms of peace",
          "They are the same",
          "An armistice is signed by only one country and a treaty by all",
          "A treaty stops the fighting and an armistice sets the peace",
        ],
        respuesta: 0,
        explicacion: "The armistice (1918) stopped the fighting of World War I; the Treaty of Versailles (1919) set the terms of peace.",
      },
    ],
    visuales: [
      "From Sarajevo to the USSR",
      "From the war to Versailles",
      "From the 1929 crash to the Depression",
      "From 1914 to 1930",
      "Lenin and Gandhi",
    ],
  },
  "historia-clase-29-segunda-guerra-mundial": {
    nombre: "World War II",
    descripcion: "The start of the war, Pearl Harbor, Normandy, the liberation of Auschwitz, the atomic bombs and the end of the war, with their dates and protagonists.",
    pasos: [
      "Goal: by the end you will be able to place the main events of World War II in order and recognize its protagonists, with dates and without value judgments.",
      "Context: World War I and the 1929 crisis left an unstable world. Since this lesson deals with a recent subject, remember the technique “Facts and opinions”: here only the facts with broad consensus are taught, with their date and their protagonists, without judgments or disputed figures.",
      "Germany, ruled by the regime of Adolf Hitler, invaded Poland (1939) and World War II began (1939). The war spread to Europe, Africa, Asia and the Pacific.",
      "In 1941, Japan attacked the American base at Pearl Harbor, in Hawaii; afterward the United States entered the war. In 1944 the Allied forces landed in Normandy, in northern France, the so-called D-Day.",
      "In 1945, Soviet troops liberated the Auschwitz camp, one of the concentration and extermination camps of the Nazi regime. The Allied and Soviet armies found other camps as they advanced. Their study requires more space than this lesson has, which is why no figures are given here.",
      "The United States dropped atomic bombs on the Japanese cities of Hiroshima and Nagasaki (1945), and the war ended (1945).",
      "Key figures: Adolf Hitler, Winston Churchill, Joseph Stalin, Franklin D. Roosevelt: the head of government of Germany, the prime minister of the United Kingdom, the leader of the Soviet Union and the president of the United States.",
      "Causes and consequences: the invasion of Poland led to the start of the war; the attack on Pearl Harbor led the United States to enter it. School-level simplification: the underlying causes of the war are numerous and are the concern of historians.",
      "Connects with: the lesson on World War I and the interwar crises, and with the next one, where the United Nations is created and the Cold War begins.",
      "Common mistakes: (1) confusing the start date (1939) with that of the entry of the United States (1941): they are two different events; (2) believing the war was only European: it was fought on several continents; (3) attributing the course of the war to a single person: governments, armies and whole societies took part.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Germany invades Poland” or “Attack on Pearl Harbor”?",
        opciones: [
          "Germany invades Poland",
          "Attack on Pearl Harbor",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 0,
        explicacion: "Germany invades Poland in 1939 and the Attack on Pearl Harbor takes place in 1941.",
      },
      {
        pregunta: "Which came first: “Normandy landings (D-Day)” or “Atomic bombs on Hiroshima and Nagasaki”?",
        opciones: [
          "Atomic bombs on Hiroshima and Nagasaki",
          "They happened in the same year",
          "There is no way to know which came first",
          "Normandy landings (D-Day)",
        ],
        respuesta: 3,
        explicacion: "The Normandy landings (D-Day) took place in 1944 and the Atomic bombs on Hiroshima and Nagasaki in 1945.",
      },
      {
        pregunta: "Which of these events was a consequence of “Germany invades Poland”?",
        opciones: [
          "Start of World War II",
          "Storming of the Bastille, start of the French Revolution",
          "Battle of Waterloo",
          "Meiji Restoration in Japan",
        ],
        respuesta: 0,
        explicacion:
          "The Start of World War II (1939) came later and builds on “Germany invades Poland”; the other events are earlier than 1939, so they cannot be its consequence.",
      },
      {
        pregunta: "Who was this figure? British prime minister. He was prime minister of the United Kingdom for most of World War II.",
        opciones: ["Franklin D. Roosevelt", "Joseph Stalin", "Adolf Hitler", "Winston Churchill"],
        respuesta: 3,
        explicacion: "Winston Churchill (1874 – 1965): he was prime minister of the United Kingdom for most of World War II.",
      },
      {
        pregunta: "Who was this figure? President of the United States. He was president during the Great Depression and almost all of World War II.",
        opciones: ["Winston Churchill", "Joseph Stalin", "Franklin D. Roosevelt", "Abraham Lincoln"],
        respuesta: 2,
        explicacion:
          "Franklin D. Roosevelt (1882 – 1945): he was president during the Great Depression and almost all of World War II.",
      },
      {
        pregunta: "According to school periodization, in which era did the “Normandy landings (D-Day)” take place?",
        opciones: ["Early Modern Age", "Prehistory", "Contemporary Age", "Antiquity"],
        respuesta: 2,
        explicacion: "1944 falls in the Contemporary Age (from 1789, by school convention).",
      },
    ],
    visuales: ["From 1939 to 1945", "From the invasion of Poland to the war", "Four protagonists"],
  },
  "historia-clase-30-onu-derechos-humanos-y-guerra-fria": {
    nombre: "The United Nations, human rights and the Cold War",
    descripcion: "The UN, the Universal Declaration of Human Rights, the start and milestones of the Cold War, the space race and the civil rights movement.",
    pasos: [
      "Goal: by the end you will be able to explain what the United Nations and the Universal Declaration of Human Rights are and place the main events of the Cold War up to the Moon landing, with dates and protagonists.",
      "Context: the previous lesson ended with the end of World War II. Since this subject is recent, the technique “Facts and opinions” is followed: here there are only facts with broad consensus, without judgments or interpretation.",
      "The United Nations, an international organization to keep the peace and promote cooperation among countries, was founded in 1945. In 1948, its General Assembly adopted the Universal Declaration of Human Rights; the committee that drafted it was chaired by Eleanor Roosevelt. It is a declaration of principles: it is not a binding treaty.",
      "The Cold War was a political, economic and military rivalry between the United States and the Soviet Union and their allies, without direct combat between the two powers; it is placed, by convention, from 1947. In 1949, Mao Zedong proclaimed the People's Republic of China.",
      "In Berlin the Wall was built (1961), which divided the city. In the Cuban Missile Crisis (1962), the United States and the Soviet Union confronted each other over Soviet missiles installed in Cuba; the crisis was resolved without war.",
      "The rivalry was also technological: the USSR launched the satellite Sputnik 1 (1957) and sent the first human into space, Yuri Gagarin (1961). The United States took Neil Armstrong to the Moon with the Apollo 11 mission (1969).",
      "In the United States, the civil rights movement, led by Martin Luther King, gathered a crowd at the March on Washington (1963), where he gave the “I Have a Dream” speech.",
      "Key figures: Eleanor Roosevelt, Mao Zedong, John F. Kennedy, Martin Luther King Jr., Yuri Gagarin, Neil Armstrong.",
      "Causes and consequences: the founding of the UN led to the Universal Declaration; the end of the war opened the Cold War; that produced the Wall, the missile crisis and the space race; and Sputnik led to Gagarin and to the Moon landing. The chains are in the figures.",
      "Connects with: the lesson on World War II, with the one on decolonization and the end of the Cold War, and with the lesson on the revolutions (the rights of man of 1789).",
      "Common mistakes: (1) believing the Cold War was a war with battles between the two powers: the rivalry was expressed in other fields; (2) confusing the UN with the Declaration: the UN is the organization; the Declaration is a document it adopted; (3) believing the space race ended with Gagarin: it went on until the Moon landing.",
    ],
    quiz: [
      {
        pregunta: "Which of these events was a consequence of “Founding of the United Nations”?",
        opciones: [
          "Storming of the Bastille, start of the French Revolution",
          "Battle of Waterloo",
          "Start of World War I",
          "Universal Declaration of Human Rights",
        ],
        respuesta: 3,
        explicacion:
          "The Universal Declaration of Human Rights (1948) came later and builds on “Founding of the United Nations”; the other events are earlier than 1945, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events was a consequence of “Launch of Sputnik 1”?",
        opciones: [
          "Storming of the Bastille, start of the French Revolution",
          "Battle of Waterloo",
          "Start of World War I",
          "Yuri Gagarin, first human in space",
        ],
        respuesta: 3,
        explicacion:
          "Yuri Gagarin, first human in space (1961) came later and builds on “Launch of Sputnik 1”; the other events are earlier than 1957, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events was a consequence of “Yuri Gagarin, first human in space”?",
        opciones: [
          "Apollo 11 lands on the Moon",
          "Storming of the Bastille, start of the French Revolution",
          "Battle of Waterloo",
          "Start of World War I",
        ],
        respuesta: 0,
        explicacion:
          "Apollo 11 lands on the Moon (1969) came later and builds on “Yuri Gagarin, first human in space”; the other events are earlier than 1961, so they cannot be its consequence.",
      },
      {
        pregunta: "Which came first: “Construction of the Berlin Wall” or “Apollo 11 lands on the Moon”?",
        opciones: [
          "Construction of the Berlin Wall",
          "Apollo 11 lands on the Moon",
          "They happened in the same year",
          "There is no way to know which came first",
        ],
        respuesta: 0,
        explicacion: "The Construction of the Berlin Wall dates to 1961 and Apollo 11 lands on the Moon in 1969.",
      },
      {
        pregunta: "Who was this figure? American diplomat. She chaired the committee that drafted the Universal Declaration of Human Rights.",
        opciones: ["Eleanor Roosevelt", "Franklin D. Roosevelt", "Marie Curie", "John F. Kennedy"],
        respuesta: 0,
        explicacion: "Eleanor Roosevelt (1884 – 1962): she chaired the committee that drafted the Universal Declaration of Human Rights.",
      },
      {
        pregunta: "Who was this figure? Leader of the civil rights movement. He led the civil rights movement in the United States with nonviolent methods.",
        opciones: ["Martin Luther King Jr.", "John F. Kennedy", "Nelson Mandela", "Mahatma Gandhi"],
        respuesta: 0,
        explicacion:
          "Martin Luther King Jr. (1929 – 1968): he led the civil rights movement in the United States with nonviolent methods.",
      },
    ],
    visuales: [
      "From 1945 to 1949",
      "From 1957 to 1969",
      "From the UN to the Universal Declaration",
      "From the postwar years to the Cold War and the missiles",
      "From Sputnik to the Moon",
      "Six protagonists",
    ],
  },
  "historia-clase-31-descolonizacion-y-mundo-actual": {
    nombre: "Decolonization, the end of the Cold War and the world today",
    descripcion: "The independence of India and Ghana, the Year of Africa, Mandela, the fall of the Berlin Wall, the dissolution of the USSR and the COVID-19 pandemic.",
    pasos: [
      "Goal: by the end you will be able to explain what decolonization was, place the end of the Cold War and recognize the most important events of recent decades, with dates and protagonists.",
      "Context: in the previous lesson you saw the Cold War; in the one on imperialism, how the European powers dominated much of Asia and Africa. Since this subject is recent, the technique “Facts and opinions” is followed: only facts with broad consensus, without judgments or disputed figures.",
      "After World War II, many peoples of Asia and Africa stopped being colonies. In 1947 India and Pakistan became independent from the United Kingdom, in a partition accompanied by great displacements of population; Jawaharlal Nehru was the first head of government of independent India. In 1957 Ghana, led by Kwame Nkrumah, was one of the first countries of sub-Saharan Africa to achieve it, and 1960 is called the “Year of Africa” because of the many independences.",
      "In South Africa, the system of legal racial segregation, apartheid, ended through a political process. Nelson Mandela was released from prison (1990) and was elected president in the first multiracial elections (1994).",
      "In Europe, the Berlin Wall fell (1989) and Germany was reunified (1990). The Soviet Union, led by Mikhail Gorbachev, was dissolved (1991), and with it the Cold War ended.",
      "The world today: in the 1990s the World Wide Web, invented by Tim Berners-Lee, was opened to the public, which changed communication; and the World Health Organization declared the COVID-19 pandemic (2020).",
      "Key figures: Jawaharlal Nehru, Kwame Nkrumah, Nelson Mandela, Mikhail Gorbachev, Tim Berners-Lee.",
      "Causes and consequences: Ghana's independence led many African countries to follow that path; Mandela's release from prison led to his election as president; and the fall of the Wall led to German reunification. These chains are in the figures.",
      "Connects with: the lesson on the Cold War, the one on imperialism, the one on the Industrial Revolution and science (the web) and the whole course: history goes on.",
      "Common mistakes: (1) believing all the colonies became independent in the same year: there were different processes over decades; (2) confusing the fall of the Wall (1989) with German reunification (1990) or the dissolution of the USSR (1991): they are three different events; (3) mixing facts with opinions about them: in recent history it is best to always keep them separate.",
    ],
    quiz: [
      {
        pregunta: "Which came first: “Independence of Ghana” or “Fall of the Berlin Wall”?",
        opciones: [
          "Fall of the Berlin Wall",
          "They happened in the same year",
          "There is no way to know which came first",
          "Independence of Ghana",
        ],
        respuesta: 3,
        explicacion: "The Independence of Ghana dates to 1957 and the Fall of the Berlin Wall to 1989.",
      },
      {
        pregunta: "Which of these events was a consequence of “Independence of Ghana”?",
        opciones: [
          "Year of Africa: independence of numerous African countries",
          "Storming of the Bastille, start of the French Revolution",
          "Battle of Waterloo",
          "Start of World War I",
        ],
        respuesta: 0,
        explicacion:
          "The Year of Africa: independence of numerous African countries (1960) came later and builds on “Independence of Ghana”; the other events are earlier than 1957, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events was a consequence of “Nelson Mandela is released from prison”?",
        opciones: [
          "Mandela is elected president in South Africa's first multiracial elections",
          "Storming of the Bastille, start of the French Revolution",
          "Battle of Waterloo",
          "Start of World War I",
        ],
        respuesta: 0,
        explicacion:
          "Mandela is elected president in South Africa's first multiracial elections (1994) came later and builds on “Nelson Mandela is released from prison”; the other events are earlier than 1990, so they cannot be its consequence.",
      },
      {
        pregunta: "Which of these events was a consequence of “Fall of the Berlin Wall”?",
        opciones: [
          "Reunification of Germany",
          "Storming of the Bastille, start of the French Revolution",
          "Battle of Waterloo",
          "Start of World War I",
        ],
        respuesta: 0,
        explicacion:
          "The Reunification of Germany (1990) came later and builds on the “Fall of the Berlin Wall”; the other events are earlier than 1989, so they cannot be its consequence.",
      },
      {
        pregunta: "Who was this figure? Leader of Ghana's independence. He led Ghana's independence and was its first head of government.",
        opciones: ["Kwame Nkrumah", "Nelson Mandela", "Jawaharlal Nehru", "Mikhail Gorbachev"],
        respuesta: 0,
        explicacion: "Kwame Nkrumah (1909 – 1972): he led Ghana's independence and was its first head of government.",
      },
      {
        pregunta: "Who was this figure? Last leader of the Soviet Union. He was the last leader of the Soviet Union.",
        opciones: ["Nelson Mandela", "Jawaharlal Nehru", "Kwame Nkrumah", "Mikhail Gorbachev"],
        respuesta: 3,
        explicacion: "Mikhail Gorbachev (1931 – 2022): he was the last leader of the Soviet Union.",
      },
    ],
    visuales: [
      "From 1947 to 1990",
      "From 1991 to 2020",
      "From Ghana to the Year of Africa",
      "From release from prison to the presidency",
      "From the fall of the Wall to reunification",
      "Five protagonists",
    ],
  },
};
