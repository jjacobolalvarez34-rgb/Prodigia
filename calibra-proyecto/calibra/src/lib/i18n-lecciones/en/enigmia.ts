import type { TraduccionLeccion } from "../traducir";

// Enigmia — 10 Técnicas nuevas y 11 Clases en inglés. Las 6 Técnicas históricas (logic_techniques sembradas
// en 0015/0020) no tienen fuente tipada y quedan en español (el cargador cae al español lección por lección).
export const ENIGMIA_EN: Record<string, TraduccionLeccion> = {
  "enigmia-tecnica-patrones-alternantes": {
    nombre: "Alternating patterns: two sequences in one",
    descripcion: "When a list of numbers does not follow a single pattern, test whether they are actually two interleaved sequences.",
    pasos: [
      "If subtracting consecutive terms does not always give the same result, the list may mix two different sequences: one in the odd positions and another in the even ones.",
      "Split the terms into two lists: those in position 1, 3, 5... on one side, and those in position 2, 4, 6... on the other.",
      "Look for the pattern of each list separately — each one is usually a simple sequence (arithmetic or geometric).",
    ],
    quiz: [
      {
        pregunta: "What is the next number: 2, 10, 5, 8, 8, 6, 11, 4, ?",
        opciones: ["14", "9", "17", "2"],
        respuesta: 0,
        explicacion: "Position 9 is odd: the sequence of odd positions is 2, 5, 8, 11, 14 (+3 each time), so the next term is 14.",
      },
      {
        pregunta: "In the sequence of odd positions 2, 5, 8, 11, 14, what is the constant difference?",
        opciones: ["+3", "+2", "+4", "−3"],
        respuesta: 0,
        explicacion: "Each odd term is the previous one plus 3: 5−2=3, 8−5=3, 11−8=3, 14−11=3.",
      },
      {
        pregunta: "In the sequence of even positions 10, 8, 6, 4, what is the constant difference?",
        opciones: ["−2", "+2", "−4", "−1"],
        respuesta: 0,
        explicacion: "Each even term is the previous one minus 2: 8−10=−2, 6−8=−2, 4−6=−2.",
      },
      {
        pregunta: "How do you recognize an alternating pattern?",
        opciones: [
          "The difference between consecutive terms is not constant, but it is between terms two apart",
          "All the terms are even",
          "The list has fewer than 4 items",
          "It can never be solved",
        ],
        respuesta: 0,
        explicacion: "That is the sign: splitting into two lists (odd/even) reveals two simple patterns, even if the whole list has no single pattern.",
      },
    ],
    visuales: ["Odd positions: +3 each time", "Even positions: −2 each time", "The combined list", "2, 10, 5, 8, 8, 6, 11, 4, ?"],
  },
  "enigmia-tecnica-silogismos-dos-premisas": {
    nombre: "Syllogisms: a shortcut to chain two premises",
    descripcion: "When two statements share a term, chain them directly to get the conclusion without overthinking it.",
    pasos: [
      "Look for the term that repeats in the two premises — that is the bridge between the first and the third idea.",
      "Chain: if the first leads to that shared term, and that term leads to the third idea, then the first leads directly to the third.",
      "There is no need to check the example against reality — the conclusion is valid just because of the form of the reasoning.",
    ],
    quiz: [
      {
        pregunta: "Every Zimbo is a Velar. Every Velar is a Tornaz. What can be concluded about the Zimbos?",
        opciones: ["Every Zimbo is a Tornaz", "No Zimbo is a Tornaz", "Nothing can be concluded", "Every Tornaz is a Zimbo"],
        respuesta: 0,
        explicacion: "Velar is the term the two premises share — it chains Zimbo→Velar→Tornaz into Zimbo→Tornaz.",
      },
      {
        pregunta: "In a two-premise syllogism, which term builds the bridge between the first and the third idea?",
        opciones: ["The one that repeats in the two premises", "The first one that appears", "The longest one to write", "None, there is no bridge"],
        respuesta: 0,
        explicacion: "That shared term is what connects the condition of the first premise with the conclusion of the second.",
      },
      {
        pregunta: "All Glimms are Fasos. All Fasos are Ruxos. Are all Glimms Ruxos?",
        opciones: ["Yes", "No", "Only some", "It is not known"],
        respuesta: 0,
        explicacion: "Same pattern: Glimms→Fasos→Ruxos chains into Glimms→Ruxos, whatever the words mean.",
      },
      {
        pregunta: "Why does the conclusion of a valid syllogism not need to be checked with a real example?",
        opciones: [
          "Because it is valid just by the structure of the reasoning, whatever the content",
          "Because it is always about animals",
          "Because the premises can never be false",
          "Because it only applies to exactly two premises",
        ],
        respuesta: 0,
        explicacion: "Logical validity depends on the form (A→B, B→C ⟹ A→C), not on whether A, B or C exist in reality.",
      },
    ],
    visuales: ["The shared term (Velar) builds the bridge"],
  },
  "enigmia-tecnica-negacion-ningun-x-es-y": {
    nombre: "Negation: what \"no X is Y\" means",
    descripcion: "\"No X is Y\" rules out ALL the X's from being Y — it lets you conclude with certainty as soon as you know something is X.",
    pasos: [
      "\"No X is Y\" is a total negation: not a single case of X can be Y, without exceptions.",
      "If you know something is X, you can already conclude with certainty that it is not Y — no extra data is needed.",
      "It is a stronger shortcut than the usual \"if...then\": here the negative conclusion is automatic.",
    ],
    quiz: [
      {
        pregunta: "No reptile is a mammal. A snake is a reptile. Is a snake a mammal?",
        opciones: ["No", "Yes", "It depends on the snake", "It is not known"],
        respuesta: 0,
        explicacion: "\"No reptile is a mammal\" rules out ALL reptiles from being mammals, without exceptions — the snake, being a reptile, is ruled out.",
      },
      {
        pregunta: "What exactly does \"no X is Y\" mean?",
        opciones: [
          "That not a single case of X can be Y",
          "That most X's are not Y",
          "That some X's could be Y",
          "That Y never exists",
        ],
        respuesta: 0,
        explicacion: "It is a total negation, without exceptions — different from \"most\" or \"some\", which would leave cases open.",
      },
      {
        pregunta: "No bird is a reptile. A parrot is a bird. Can a parrot be a reptile?",
        opciones: ["No", "Yes", "Only if it flies little", "It is not known"],
        respuesta: 0,
        explicacion: "Same pattern: the total negation of \"no bird is a reptile\" rules out all birds, including the parrot.",
      },
      {
        pregunta: "Why is \"no X is Y\" a stronger shortcut than a regular \"if...then\"?",
        opciones: [
          "Because the negative conclusion is automatic as soon as you know something is X, with no extra data",
          "Because it is always false",
          "Because it only applies to animals",
          "Because it can never be used in deduction",
        ],
        respuesta: 0,
        explicacion: "Unlike an \"if...then\" where sometimes \"it is not known\", here the total negation lets you conclude with immediate certainty.",
      },
    ],
    visuales: ["The total negation is passed on directly"],
  },
  "enigmia-tecnica-eliminacion-por-descarte": {
    nombre: "Elimination by ruling out",
    descripcion: "When you have several candidates and clues that rule out all but one, the one left is the answer.",
    pasos: [
      "Write down all the possible candidates before looking at any clue.",
      "Apply each clue one by one: if it rules out a candidate, cross it out — the clue does not have to say directly who it is.",
      "The candidate left uncrossed after all the clues is the answer — you do not need any clue that confirms it directly.",
    ],
    quiz: [
      {
        pregunta: "Beto has no pet. Caro lives in an apartment without a yard. Dani is allergic to animals. Among Ana, Beto, Caro and Dani, who has a dog?",
        opciones: ["Ana", "Beto", "Caro", "Dani"],
        respuesta: 0,
        explicacion: "The three clues rule out Beto, Caro and Dani — the only candidate left is Ana.",
      },
      {
        pregunta: "In elimination by ruling out, what do you need to reach a conclusion with certainty?",
        opciones: [
          "That the clues rule out all the candidates but one",
          "That a clue directly confirms the right candidate",
          "At least 5 candidates",
          "That all the clues are about the same person",
        ],
        respuesta: 0,
        explicacion: "There is no need for a clue that points directly to the answer — it is enough to eliminate all the others.",
      },
      {
        pregunta: "If a clue rules out a candidate that was already ruled out by another clue, what happens?",
        opciones: [
          "Nothing changes: that candidate is still ruled out",
          "It is included again",
          "It breaks the deduction",
          "You have to start over",
        ],
        respuesta: 0,
        explicacion: "Ruling out the same candidate twice does not bring it back — the final result is the same.",
      },
      {
        pregunta: "Why is the candidate left uncrossed the answer, even if no clue mentions it directly?",
        opciones: [
          "Because if all the others were ruled out, there is no other possible option",
          "Because it is always the first in the list",
          "Because the clues secretly confirm it",
          "It is not the answer, a direct clue is needed",
        ],
        respuesta: 0,
        explicacion: "It is the same logic as solving a case: when all the alternatives but one are eliminated, that one has to be the right one.",
      },
    ],
    visuales: ["has no pet", "lives in an apartment without a yard", "is allergic to animals", "Who has a dog?"],
  },
  "enigmia-tecnica-metodo-de-loci": {
    nombre: "Method of loci: memorize with a route",
    descripcion: "Associate each piece of data you want to remember with a place on a route you already know by heart — then you only walk the path in your mind.",
    pasos: [
      "Choose a route you know well by heart (your house, your way to school) and divide it into fixed places, always in the same order.",
      "Associate each item of the list with a place on the route, in order — the first item to the first place, the second to the second, and so on.",
      "To remember the whole list, walk the route in your mind in the same order: each place gives you back the associated item.",
    ],
    quiz: [
      {
        pregunta: "On the route Door→Living room→Kitchen→Bedroom associated with Milk, Eggs, Bread, Apples, which item is in the Kitchen?",
        opciones: ["Bread", "Milk", "Eggs", "Apples"],
        respuesta: 0,
        explicacion: "The third place (Kitchen) is associated with the third item of the list (Bread), in the same order as the route.",
      },
      {
        pregunta: "What characteristic does the chosen route need for the method of loci?",
        opciones: [
          "That you already know it by heart, in a fixed order",
          "That it has exactly 10 places",
          "That it is a place you have never visited",
          "That it changes order every time",
        ],
        respuesta: 0,
        explicacion: "The route is only the scaffolding — if you already know it by heart, you do not have to strain to remember the order, only the associations.",
      },
      {
        pregunta: "Which item is associated with the Bedroom in the example?",
        opciones: ["Apples", "Milk", "Bread", "Eggs"],
        respuesta: 0,
        explicacion: "The fourth place (Bedroom) corresponds to the fourth item of the list (Apples).",
      },
      {
        pregunta: "To recover the whole list with the method of loci, what do you have to do?",
        opciones: [
          "Walk through the places in the same order in which you associated each item",
          "Remember the places at random",
          "Memorize the list again from scratch",
          "Draw a new map every time",
        ],
        respuesta: 0,
        explicacion: "Each place on the route, in order, gives you back the item you associated with it — that is why the order of the route matters.",
      },
    ],
    visuales: ["Door", "Living room", "Kitchen", "Bedroom", "Milk", "Eggs", "Bread", "Apples", "Shopping list associated with a route through the house"],
  },
  "enigmia-tecnica-agrupar-por-categoria": {
    nombre: "Group by category before memorizing",
    descripcion: "Before grouping a list into blocks by size, sort it by category — each group becomes much easier to remember.",
    pasos: [
      "Before splitting the list into blocks, check whether the items can be grouped by a common category (fruits, animals, colors).",
      "Sort the list so that items of the same category end up together, and make one block per category.",
      "Each block becomes a single idea (\"fruits\", \"animals\", \"colors\") instead of several loose items, so there are fewer pieces to remember.",
    ],
    quiz: [
      {
        pregunta: "Apple, Pear, Grape, Dog, Cat, Lion, Red, Blue, Green — grouped by category into blocks of 3, which is the second block?",
        opciones: ["Dog, Cat, Lion", "Apple, Pear, Grape", "Red, Blue, Green", "Pear, Dog, Red"],
        respuesta: 0,
        explicacion: "The three blocks are Apple/Pear/Grape (fruits), Dog/Cat/Lion (animals) and Red/Blue/Green (colors) — the second is the animals one.",
      },
      {
        pregunta: "Why does grouping by category (instead of just by fixed size) help memorizing more?",
        opciones: [
          "Because each group becomes a single recognizable idea, instead of loose, unrelated items",
          "Because it really makes the list shorter",
          "Because it only works with exactly 9 items",
          "Because it avoids having to group at all",
        ],
        respuesta: 0,
        explicacion: "A group that makes sense (\"the fruits\") weighs less on memory than three items with no relation to each other.",
      },
      {
        pregunta: "What is the third block of the list above?",
        opciones: ["Red, Blue, Green", "Apple, Pear, Grape", "Dog, Cat, Lion", "Lion, Green, Grape"],
        respuesta: 0,
        explicacion: "The third block, after fruits and animals, is the colors one: Red, Blue, Green.",
      },
      {
        pregunta: "If a list has no natural common category, what is best to do?",
        opciones: [
          "Group by fixed size (simple chunking), as in the basic memory technique",
          "It is impossible to memorize it",
          "Memorize it letter by letter without grouping",
          "Discard the memory technique altogether",
        ],
        respuesta: 0,
        explicacion: "Grouping by category is an improvement when there are real categories — if there are none, chunking by fixed size still works.",
      },
    ],
    visuales: ["Apple", "Pear", "Grape", "Dog", "Cat", "Lion", "Red", "Blue", "Green", "9 items grouped into 3 categories"],
  },
  "enigmia-tecnica-visualizar-en-vez-de-repetir": {
    nombre: "Visualize instead of repeating",
    descripcion: "A vivid, unusual mental image is remembered better than repeating a fact over and over without thinking.",
    pasos: [
      "Repeating a fact without thinking (\"the key is under the flowerpot\", over and over) helps little: the mind pays no real attention to it.",
      "Instead, build an exaggerated or unusual mental image of the fact — the stranger or funnier it is, the better it sticks.",
      "The image does not have to make logical sense: the goal is for it to be memorable, not realistic.",
    ],
    quiz: [
      {
        pregunta: "According to this technique, what is remembered best?",
        opciones: [
          "A vivid, unusual mental image",
          "Repeating the fact many times without thinking",
          "Writing the fact on paper and putting it away",
          "Ignoring the fact until you need it",
        ],
        respuesta: 0,
        explicacion: "An exaggerated or strange image gets more real attention than mechanical repetition, and that is why it sticks better in memory.",
      },
      {
        pregunta: "Why does repeating a fact without thinking help little to memorize it?",
        opciones: [
          "Because the mind pays no real attention, it just repeats sounds",
          "Because repeating is forbidden",
          "Because it has to be repeated backwards",
          "Because it only works with numbers",
        ],
        respuesta: 0,
        explicacion: "Mechanical repetition does not force you to process the meaning of the fact, so it is forgotten almost as fast as if it had not been repeated.",
      },
      {
        pregunta: "Does the mental image used to memorize need to make logical sense?",
        opciones: [
          "No, the goal is for it to be memorable, not realistic",
          "Yes, it always has to be realistic",
          "Only if the fact is a number",
          "Only if there is plenty of time",
        ],
        respuesta: 0,
        explicacion: "An absurd or exaggerated image (a giant flowerpot spitting out a key) is remembered better than a realistic, boring one.",
      },
      {
        pregunta: "Which of these images would help MOST to remember \"the key is under the flowerpot\"?",
        opciones: [
          "A giant flowerpot that suddenly opens and spits a golden key through the air",
          "Repeating the phrase in a low voice",
          "An ordinary flowerpot, nothing special",
          "Not thinking about the flowerpot",
        ],
        respuesta: 0,
        explicacion: "It is the exaggerated, unusual image — the same logic that makes vivid images be remembered more than repetition.",
      },
    ],
    visuales: [
      "Two ways to remember the same fact",
      "Strategy A: repeat \"the key is under the flowerpot\" twenty times in a row, without imagining anything.",
      "Strategy B: imagine a giant flowerpot that suddenly opens and spits a shiny golden key through the air.",
    ],
  },
  "enigmia-tecnica-trazar-un-bucle-a-mano": {
    nombre: "Trace a loop by hand",
    descripcion: "A loop repeats the same instruction several times — to follow it by hand, apply the instruction once for each repetition, in order.",
    pasos: [
      "A loop says \"repeat this instruction N times\" — to trace it by hand, write the instruction as many times as it repeats, one below the other.",
      "Apply each repetition to the result of the previous one, never to the original value.",
      "The value after the last repetition is the final result of the loop.",
    ],
    quiz: [
      {
        pregunta: "x=1. You repeat the instruction \"x = x × 2\" three times. What is x at the end?",
        opciones: ["8", "6", "4", "2"],
        respuesta: 0,
        explicacion: "1×2=2, 2×2=4, 4×2=8 — each repetition is applied to the result of the previous one.",
      },
      {
        pregunta: "To what value is each repetition of a loop applied?",
        opciones: [
          "To the result of the previous repetition",
          "Always to the original value",
          "To a random value",
          "To the final value, before starting",
        ],
        respuesta: 0,
        explicacion: "A loop chains repetitions: each one starts from where the previous one left off, not from the initial value.",
      },
      {
        pregunta: "x=2. You repeat the instruction \"x = x + 3\" four times. What is x at the end?",
        opciones: ["14", "12", "10", "17"],
        respuesta: 0,
        explicacion: "2+3=5, 5+3=8, 8+3=11, 11+3=14 — four repetitions of +3 on the previous result.",
      },
      {
        pregunta: "How is a loop traced \"by hand\" (without running it on a computer)?",
        opciones: [
          "Writing the instruction once for each repetition and applying it in order",
          "Applying the instruction only once, however many repetitions it says",
          "Guessing the final result",
          "It is only possible with a computer",
        ],
        respuesta: 0,
        explicacion: "Tracing by hand is simulating the loop step by step: as many steps as repetitions, each one on the previous result.",
      },
    ],
    visuales: ["x=1: repeat 'x = x × 2' three times"],
  },
  "enigmia-tecnica-condicion-de-corte": {
    nombre: "Identify the stopping condition",
    descripcion: "A loop needs a condition that, sooner or later, stops being met — if it never stops being met, the loop never stops.",
    pasos: [
      "The stopping condition is the question the loop checks on each repetition to decide whether it continues or stops.",
      "While the condition is met, the loop keeps repeating; as soon as it stops being met, it stops.",
      "If the condition never stops being met (for example, if the value never changes in the right direction), the loop never stops.",
    ],
    quiz: [
      {
        pregunta: "x=1. At each step, if x<10, 3 is added; otherwise x does not change. At which step does the condition x<10 stop being met for the first time?",
        opciones: ["The fourth step", "The second step", "The third step", "It never stops being met"],
        respuesta: 0,
        explicacion: "1→4→7→10: only at the fourth step does x equal 10, which is no longer less than 10 — that is where the condition stops being met.",
      },
      {
        pregunta: "In the previous example (x=1, +3 while x<10), what is the final value of x?",
        opciones: ["10", "13", "7", "4"],
        respuesta: 0,
        explicacion: "1+3=4, 4+3=7, 7+3=10; at the fourth step the condition is no longer met and x stays at 10.",
      },
      {
        pregunta: "What is a stopping condition in a loop?",
        opciones: [
          "The condition the loop checks each time to decide whether it continues or stops",
          "The first step of the loop, always",
          "An error to avoid completely",
          "A type of variable",
        ],
        respuesta: 0,
        explicacion: "It is the question that is repeated on each turn of the loop — while the answer is \"yes\", the loop continues.",
      },
      {
        pregunta: "What happens if the stopping condition of a loop never stops being met?",
        opciones: [
          "The loop never stops",
          "The loop stops after one turn",
          "The loop gives a syntax error",
          "Nothing different happens",
        ],
        respuesta: 0,
        explicacion: "Without a condition that eventually fails, there is no signal for the loop to stop — it keeps repeating forever.",
      },
    ],
    visuales: ["x=1, while x<10 add 3 — at which step does it stop?"],
  },
  "enigmia-tecnica-simplificar-antes-de-ejecutar": {
    nombre: "Simplify before running",
    descripcion: "Before tracing an algorithm step by step, check whether it can be simplified to fewer steps with the same result — it saves time and mistakes.",
    pasos: [
      "Before running an algorithm step by step, check whether several consecutive instructions can be combined into one.",
      "For example, adding the same number several times in a row is the same as adding once the total of those additions.",
      "Simplifying does not change the final result — it only reduces the number of steps, so there are fewer places to make a mistake.",
    ],
    quiz: [
      {
        pregunta: "Starting at 0, what does adding 5 three times in a row give?",
        opciones: ["15", "10", "20", "5"],
        respuesta: 0,
        explicacion: "0+5=5, 5+5=10, 10+5=15 — the final result is 15.",
      },
      {
        pregunta: "Which algorithm reaches the same result in fewer steps, starting at 0: adding 5 three times, or adding 15 once?",
        opciones: [
          "Both give 15, but adding 15 once uses fewer steps",
          "Only adding 5 three times gives 15",
          "Adding 15 once gives a different result",
          "Neither of them reaches 15",
        ],
        respuesta: 0,
        explicacion: "Adding 5 three times (0→5→10→15) and adding 15 once (0→15) give the same final result, but the second one uses a single step.",
      },
      {
        pregunta: "What is gained by simplifying an algorithm before running it?",
        opciones: [
          "Fewer steps, and therefore fewer places to make a mistake",
          "A different, more precise result",
          "Nothing, the result always changes",
          "It only works for algorithms with negative numbers",
        ],
        respuesta: 0,
        explicacion: "Simplifying does not change the result — it reduces the number of steps, and every step less is one chance of error less.",
      },
      {
        pregunta: "Adding 4 the same number four times in a row, starting at 0, is equivalent to which simplified step?",
        opciones: ["Adding 16 once", "Adding 4 once", "Adding 8 twice", "Subtracting 16 once"],
        respuesta: 0,
        explicacion: "Adding 4 four times in a row (0→4→8→12→16) gives the same result as adding 16 at once (4×4=16).",
      },
    ],
    visuales: ["Not simplified: add 5 three times", "Simplified: add 15 once"],
  },
  "enigmia-clase-secuencias-aritmeticas-geometricas": {
    nombre: "What a sequence is: constant difference vs. constant ratio",
    descripcion: "The difference between an arithmetic sequence (the same amount is always added) and a geometric one (it is always multiplied by the same amount).",
    pasos: [
      "A sequence is an ordered list of numbers where each one depends on the previous one according to a fixed rule.",
      "In an arithmetic sequence, the difference between a term and the previous one is always the same — a constant amount is added (or subtracted).",
      "In a geometric sequence, the ratio between a term and the previous one is always the same — it is multiplied (or divided) by a constant amount.",
    ],
    quiz: [
      {
        pregunta: "What is the next term of this arithmetic sequence: 3, 7, 11, 15, ?",
        opciones: ["19", "18", "21", "17"],
        respuesta: 0,
        explicacion: "The difference between terms is always +4 (7−3=4, 11−7=4, 15−11=4) — the next one is 15+4=19.",
      },
      {
        pregunta: "What is the next term of this geometric sequence: 2, 6, 18, 54, ?",
        opciones: ["162", "108", "216", "150"],
        respuesta: 0,
        explicacion: "Each term is the previous one multiplied by 3 (constant ratio) — 54×3=162.",
      },
      {
        pregunta: "What distinguishes an arithmetic sequence from a geometric one?",
        opciones: [
          "The arithmetic one always adds the same amount; the geometric one always multiplies by the same amount",
          "The arithmetic one always starts at 0",
          "The geometric one only works with even numbers",
          "There is no real difference",
        ],
        respuesta: 0,
        explicacion: "That is exactly the difference: constant difference (addition/subtraction) versus constant ratio (multiplication/division).",
      },
    ],
    visuales: ["Arithmetic sequence: +4 each time", "Geometric sequence: ×3 each time"],
  },
  "enigmia-clase-patrones-no-numericos": {
    nombre: "Non-numeric patterns: letters, shapes and colors",
    descripcion: "The same logic as numeric sequences, applied to letters, shapes or colors that repeat with a fixed rhythm.",
    pasos: [
      "Not all patterns are made of numbers: they can also be made of letters, shapes or colors — the logic to solve them is the same.",
      "In a letter pattern, each letter can move forward a fixed number of positions in the alphabet, just like adding a number in a sequence.",
      "In a shape or color pattern, look for what repeats and every how many items — most are short cycles that repeat again and again.",
    ],
    quiz: [
      {
        pregunta: "What is the next letter in A, C, E, G, ?",
        opciones: ["I", "H", "F", "J"],
        respuesta: 0,
        explicacion: "Each letter moves forward 2 positions in the alphabet (A→C→E→G→I).",
      },
      {
        pregunta: "In the pattern Red, Blue, Red, Blue, ?, which color comes next?",
        opciones: ["Red", "Blue", "Green", "Yellow"],
        respuesta: 0,
        explicacion: "The pattern alternates two colors — after Blue, Red appears again.",
      },
      {
        pregunta: "A non-numeric pattern (letters, shapes, colors) is solved...",
        opciones: [
          "By looking for what repeats or what jump is applied, just like in a numeric sequence",
          "Only by trial and error, with no rule at all",
          "It never has a fixed rule",
          "By memorizing each case by heart",
        ],
        respuesta: 0,
        explicacion: "It is the same logic as an arithmetic/geometric sequence, applied to another type of element.",
      },
    ],
    visuales: ["A, C, E, G, ? — moves forward 2 letters each time", "Color and shape patterns", "Red, Blue, Red, Blue, ?", "△, ○, △, ○, ?"],
  },
  "enigmia-clase-proposiciones-y-contrapositiva": {
    nombre: "Propositions, truth value and the contrapositive",
    descripcion: "What a proposition is, what an \"if...then\" really says, and why its contrapositive always has the same value.",
    pasos: [
      "A proposition is a statement that can be true or false, never both at once — \"it is raining\" is a proposition; \"what a nice day\" is not (it has no truth value).",
      "A statement \"if P then Q\" says that, every time P holds, Q holds too — but Q holding does not prove that P held (there could be another cause).",
      "The contrapositive of \"if P then Q\" is \"if not Q then not P\" — it says exactly the same thing, only negated and turned around, and it always has the same truth value as the original.",
    ],
    quiz: [
      {
        pregunta: "If it rains, the floor gets wet. The floor is wet. Did it definitely rain?",
        opciones: ["It is not known", "Yes", "No", "Always"],
        respuesta: 0,
        explicacion: "The floor could be wet for another reason — the conclusion holding does not prove the condition.",
      },
      {
        pregunta: "What is the contrapositive of \"if it rains, the floor gets wet\"?",
        opciones: [
          "If the floor is not wet, it did not rain",
          "If it does not rain, the floor does not get wet",
          "If the floor gets wet, it rained",
          "If it rained, the floor does not get wet",
        ],
        respuesta: 0,
        explicacion: "The contrapositive negates and turns around the statement: \"if NOT the consequence, then NOT the condition\".",
      },
      {
        pregunta: "If \"if P then Q\" is true, what happens with its contrapositive?",
        opciones: ["It is always true too", "It is always false", "It depends on the case", "It has no truth value"],
        respuesta: 0,
        explicacion: "It is a logical property: an implication and its contrapositive always share the same truth value.",
      },
    ],
    visuales: ["If it rains, then the floor gets wet", "Contrapositive: if the floor is not wet, then it did not rain"],
  },
  "enigmia-clase-silogismos-simples": {
    nombre: "Simple syllogisms: if A→B and B→C, then A→C",
    descripcion: "How to chain two \"if...then\" statements that share a term, to deduce a new conclusion.",
    pasos: [
      "A syllogism chains two \"if...then\" statements that share a term in the middle: if A implies B, and B implies C, then A implies C.",
      "The trick is to identify the term that repeats in the two premises (B, in this case) — that is the one that builds the bridge between A and C.",
      "The conclusion (A implies C) is valid even though it was never checked directly — it is deduced just with the logic of the two premises.",
    ],
    quiz: [
      {
        pregunta: "If every dog is a mammal, and every mammal has a spine, what can be concluded about dogs?",
        opciones: ["They have a spine", "They do not have a spine", "They might not have a spine", "It cannot be known"],
        respuesta: 0,
        explicacion: "It is the conclusion of the syllogism: dog→mammal and mammal→spine chain into dog→spine.",
      },
      {
        pregunta: "A syllogism \"if A→B and B→C, then A→C\" is valid because...",
        opciones: [
          "The conclusion chains the two premises through the term they share (B)",
          "It is always true whatever A, B or C are in reality",
          "It only applies to examples with animals",
          "It has to be checked with an example every time",
        ],
        respuesta: 0,
        explicacion: "B is the bridge: it appears as a consequence of A and as a condition of C, so A ends up leading to C.",
      },
      {
        pregunta: "All Bloops are Razzies. All Razzies are Lazzies. Are all Bloops Lazzies?",
        opciones: ["Yes", "No", "It is not known", "Only some"],
        respuesta: 0,
        explicacion: "Bloops→Razzies and Razzies→Lazzies chain into Bloops→Lazzies, same pattern as dog→mammal→spine.",
      },
    ],
    visuales: ["If it is a dog → it is a mammal, and if it is a mammal → it has a spine"],
  },
  "enigmia-clase-chunking-y-asociacion": {
    nombre: "Chunking and association: group to remember more",
    descripcion: "Two techniques that combine: splitting a long list into small blocks, and linking each item to something you already know.",
    pasos: [
      "Chunking is grouping a long list into small blocks — it is much easier to remember 3 blocks of 3 than 9 loose numbers.",
      "Association is linking a new fact to something you already know well — an unusual image or story is remembered better than a lone number.",
      "Combining both techniques (grouping into blocks and associating each block with something known) is what most multiplies what you can remember.",
    ],
    quiz: [
      {
        pregunta: "The code 482915637 is grouped into blocks of 3: 482 - 915 - 637. Which is the second block?",
        opciones: ["915", "482", "637", "491"],
        respuesta: 0,
        explicacion: "The three blocks of 3 digits are 482, 915 and 637 — the second is 915.",
      },
      {
        pregunta: "Why does chunking (grouping into blocks) help to memorize?",
        opciones: [
          "Because it reduces the number of pieces to remember separately",
          "Because it really makes the number shorter",
          "Because it only works with even numbers",
          "Because it avoids having to pay attention",
        ],
        respuesta: 0,
        explicacion: "3 blocks are fewer pieces than 9 loose digits, even though the amount of information is the same.",
      },
      {
        pregunta: "The association technique consists of...",
        opciones: [
          "Linking a new fact to something you already know well, so it is easier to remember",
          "Repeating the fact non-stop until you memorize it",
          "Writing the fact on paper",
          "Ignoring the fact until it is needed",
        ],
        respuesta: 0,
        explicacion: "Connecting the new with the known (especially with an unusual image) helps it stick in memory.",
      },
    ],
    visuales: [
      "4",
      "8",
      "2",
      "9",
      "1",
      "5",
      "6",
      "3",
      "7",
      "482915637, grouped into blocks of 3",
      "Association: link a block to something known",
      "To remember the block 482, imagine: \"4 elephants with 8 legs each and 2 giant ears\".",
    ],
  },
  "enigmia-clase-que-es-un-algoritmo": {
    nombre: "What an algorithm is: steps, conditionals and order",
    descripcion: "A sequence of ordered, repeatable steps, with \"if...then\" decisions in the middle — and why the order of the steps matters.",
    pasos: [
      "An algorithm is a sequence of ordered, repeatable steps that solves a problem — the same steps, with the same input data, always give the same result.",
      "A conditional (\"if...then...else...\") is a decision inside the algorithm: depending on whether a condition is met or not, one step or another is run.",
      "The order of the steps matters: running the same steps in a different order can give a different result — never assume it gives the same.",
    ],
    quiz: [
      {
        pregunta: "x=0. Steps: 1) x=x+5, 2) if x>3 then x=x+2, otherwise x=x−2, 3) x=x×3. What is x at the end?",
        opciones: ["21", "15", "9", "7"],
        respuesta: 0,
        explicacion: "0+5=5; since 5>3, x=5+2=7; 7×3=21.",
      },
      {
        pregunta: "x=20. Order A (subtract 4, then divide by 2) gives a final x=8. Order B (divide by 2, then subtract 4) gives a final x=6. What does this show?",
        opciones: [
          "That the order of the steps of an algorithm can change the final result",
          "That you always have to divide first",
          "That subtracting and dividing always give the same result",
          "That the algorithm is badly written",
        ],
        respuesta: 0,
        explicacion: "The same two steps, in a different order, give 8 in one case and 6 in the other — the order is not a minor detail.",
      },
      {
        pregunta: "What is an algorithm?",
        opciones: [
          "A sequence of ordered, repeatable steps to solve a problem",
          "A guess with no fixed rules",
          "A type of memory puzzle",
          "A very big number",
        ],
        respuesta: 0,
        explicacion: "That is the central definition: ordered, repeatable steps that, with the same input, always give the same output.",
      },
    ],
    visuales: [
      "x=0: add 5, if x>3 add 2 (otherwise subtract 2), then multiply ×3",
      "Order A — x=20: first subtract 4, then divide by 2",
      "Order B — x=20: the same steps, reversed",
    ],
  },
  "enigmia-clase-patrones-compuestos-dos-reglas": {
    nombre: "Compound patterns: two rules combined",
    descripcion: "When a sequence does not have a single rule, separate the odd positions from the even ones — each one can follow its own rule.",
    pasos: [
      "A compound pattern combines two different rules in a single sequence — one rule for the odd positions (1st, 3rd, 5th...) and another for the even ones (2nd, 4th, 6th...).",
      "To solve it, split the sequence into two lists: the odd-position terms on one side, the even-position ones on the other.",
      "Find the pattern of each list separately (it can be arithmetic in one and geometric in the other) and apply it to find the missing term.",
    ],
    quiz: [
      {
        pregunta: "What is the next number: 1, 2, 5, 6, 9, 18, 13, 54, ?",
        opciones: ["17", "21", "162", "20"],
        respuesta: 0,
        explicacion: "Position 9 is odd: the sequence of odd positions is 1, 5, 9, 13, 17 (+4 each time), so the next term is 17.",
      },
      {
        pregunta: "In the sequence of odd positions 1, 5, 9, 13, 17, what type of pattern is it?",
        opciones: [
          "Arithmetic, with constant difference +4",
          "Geometric, with ratio ×4",
          "Alternating between even and odd",
          "It has no pattern",
        ],
        respuesta: 0,
        explicacion: "Each term is the previous one plus 4: 5−1=4, 9−5=4, 13−9=4, 17−13=4 — constant difference.",
      },
      {
        pregunta: "In the sequence of even positions 2, 6, 18, 54, what type of pattern is it?",
        opciones: [
          "Geometric, with constant ratio ×3",
          "Arithmetic, with difference +4",
          "Alternating",
          "It has no pattern",
        ],
        respuesta: 0,
        explicacion: "Each term is the previous one multiplied by 3: 6/2=3, 18/6=3, 54/18=3 — constant ratio.",
      },
      {
        pregunta: "How is a compound pattern of two rules solved?",
        opciones: [
          "Separating the sequence into odd and even positions, and looking for the pattern of each one separately",
          "Looking for a single rule that explains all the terms together",
          "It is impossible to solve without more information",
          "Averaging all the terms",
        ],
        respuesta: 0,
        explicacion: "A compound pattern mixes two different rules — separating them by position (odd/even) reveals each individual rule.",
      },
      {
        pregunta: "Can one of the two rules be arithmetic and the other geometric, within the same compound pattern?",
        opciones: [
          "Yes, each position (odd or even) can follow a different type of rule",
          "No, the two rules always have to be of the same type",
          "Only if the sequence has fewer than 4 terms",
          "No, a compound pattern is always arithmetic",
        ],
        respuesta: 0,
        explicacion: "It is precisely the case of this example: arithmetic odd positions (+4), geometric even positions (×3).",
      },
    ],
    visuales: ["Odd positions: arithmetic sequence +4", "Even positions: geometric sequence ×3", "The combined sequence", "1, 2, 5, 6, 9, 18, 13, 54, ?"],
  },
  "enigmia-clase-deduccion-por-eliminacion": {
    nombre: "Deduction by elimination",
    descripcion: "When no clue points directly to the answer, but each one rules out an option, the one that survives them all is the conclusion.",
    pasos: [
      "Elimination is a form of indirect deduction: instead of proving that something IS true, you prove that all the other options are NOT.",
      "Each clue rules out exactly one candidate — no clue has to mention the right answer.",
      "If after applying all the clues a single candidate is left unruled out, that is the conclusion — with the same certainty as if a clue had confirmed it directly.",
      "This method works because the options are mutually exclusive: if it cannot be any of the others, it has to be the one left.",
    ],
    quiz: [
      {
        pregunta: "Bruno did not arrive late. Marco does not have brown hair. Sofía was not in the building. Among Bruno, Elena, Marco and Sofía, who is left as the only possible candidate?",
        opciones: ["Elena", "Bruno", "Marco", "Sofía"],
        respuesta: 0,
        explicacion: "The three clues rule out Bruno, Marco and Sofía — the only candidate not ruled out is Elena.",
      },
      {
        pregunta: "What does elimination prove, as opposed to a direct deduction?",
        opciones: [
          "That all the options except one are NOT true, instead of directly proving which one IS",
          "That the answer is always the first option",
          "That no clue can be used twice",
          "That a clue confirming the answer is needed",
        ],
        respuesta: 0,
        explicacion: "It is indirect reasoning: everything that CANNOT be is ruled out, and what survives is the conclusion.",
      },
      {
        pregunta: "Why does elimination work when the options are mutually exclusive?",
        opciones: [
          "Because if none of the others can be the answer, the one left has to be",
          "Because the options can repeat",
          "Because there is always more than one possible answer",
          "It does not work, a direct clue is needed",
        ],
        respuesta: 0,
        explicacion: "If exactly one of the options is correct, and all but one are ruled out, that one is necessarily the right one.",
      },
      {
        pregunta: "Does any clue need to mention the right candidate directly?",
        opciones: [
          "No, it is enough that the clues rule out all the others",
          "Yes, a direct clue is always needed",
          "Only if there are more than 4 candidates",
          "Only if the clues are ambiguous",
        ],
        respuesta: 0,
        explicacion: "Elimination works even without any direct clue — the candidate that survives all the rulings-out is the answer.",
      },
      {
        pregunta: "If in the example a fourth clue also ruled out Elena, what would happen?",
        opciones: [
          "No possible candidate would be left — there would be a mistake in the clues or in the list of candidates",
          "The answer would still be Elena anyway",
          "A new candidate would be added automatically",
          "Nothing would change",
        ],
        respuesta: 0,
        explicacion: "If all the candidates are ruled out, something is wrongly set up: the right answer has to survive the true clues.",
      },
    ],
    visuales: [
      "did not arrive late that night",
      "does not have brown hair",
      "was not in the building that night",
      "Who is left after ruling out the other three?",
    ],
  },
  "enigmia-clase-repeticion-espaciada-y-recuerdo-activo": {
    nombre: "Spaced repetition and active recall",
    descripcion: "Reviewing a fact at increasingly longer intervals, and testing yourself instead of rereading, multiplies how long you remember it.",
    pasos: [
      "Spaced repetition consists of reviewing a fact at increasingly longer intervals, instead of reviewing it every day in a row.",
      "A simple pattern is to double the interval each time: you review on day 1, then on day 2, then on day 4, and so on — each review lets the next one wait longer.",
      "Active recall consists of testing yourself (\"what was this?\") before looking at the answer, instead of just rereading the material — it is harder at the time, but it is remembered better afterwards.",
      "Combining both techniques (spacing the reviews and actively testing yourself in each one) is what most multiplies how long a fact is remembered.",
    ],
    quiz: [
      {
        pregunta: "If the first review is on day 1 and each interval doubles, on which day does the fifth review fall?",
        opciones: ["16", "8", "10", "32"],
        respuesta: 0,
        explicacion: "1, 2, 4, 8, 16: each interval is double the previous one — the fifth term of that geometric sequence is 16.",
      },
      {
        pregunta: "What is the constant ratio of the sequence of intervals 1, 2, 4, 8, 16?",
        opciones: ["×2", "+2", "×4", "+1"],
        respuesta: 0,
        explicacion: "Each interval is double the previous one: 2/1=2, 4/2=2, 8/4=2, 16/8=2 — constant ratio ×2.",
      },
      {
        pregunta: "What is active recall?",
        opciones: [
          "Testing yourself before looking at the answer, instead of just rereading",
          "Reviewing the material every day without exception",
          "Writing the material only once",
          "Listening to the material out loud",
        ],
        respuesta: 0,
        explicacion: "Active recall forces the mind to retrieve the fact by itself, which fixes it much better than just rereading it.",
      },
      {
        pregunta: "Why does reviewing at increasingly longer intervals (instead of every day) help remember longer?",
        opciones: [
          "Because each successful review shows the fact is already more firmly set, and it can wait longer before the next review",
          "Because reviewing every day is forbidden",
          "Because long intervals make the fact shorter",
          "Because it does not matter when you review",
        ],
        respuesta: 0,
        explicacion: "Spacing the reviews takes advantage of the fact that the better set a fact is, the longer it takes to be forgotten — there is no need to review it every day.",
      },
      {
        pregunta: "Which combination most multiplies how long a fact is remembered?",
        opciones: [
          "Spacing the reviews AND actively testing yourself in each one",
          "Only rereading every day",
          "Only spacing the reviews, without testing yourself",
          "No combination changes anything",
        ],
        respuesta: 0,
        explicacion: "The two techniques reinforce each other: spacing takes advantage of the forgetting curve, and active recall sets the fact better in each review.",
      },
    ],
    visuales: [
      "Review intervals that double: day 1, 2, 4, 8, 16",
      "Active recall vs. rereading",
      "Rereading: looking at the material again, from beginning to end, without testing yourself.",
      "Active recall: covering the answer and trying to remember it before looking at it.",
    ],
  },
  "enigmia-clase-bucles-y-repeticion": {
    nombre: "Loops and repetition",
    descripcion: "A loop repeats the same block of instructions several times — understanding how many times it repeats and on which value is the key to tracing it right.",
    pasos: [
      "A loop is an instruction that repeats a number of times, or until a condition is met — instead of writing the same instruction over and over, the loop repeats it for you.",
      "Each repetition of the loop is applied to the result of the previous repetition, never to the original value the loop started with.",
      "To trace a loop by hand, simulate each repetition one by one, writing down the value after each one — it is exactly the same as writing the instruction repeated that many times.",
    ],
    quiz: [
      {
        pregunta: "x=0. A loop repeats 'x = x + 2' four times. What is x at the end?",
        opciones: ["8", "2", "6", "10"],
        respuesta: 0,
        explicacion: "0+2=2, 2+2=4, 4+2=6, 6+2=8 — four repetitions of +2, each one on the previous result.",
      },
      {
        pregunta: "How many times was the instruction repeated to get from 0 to 8 adding 2 at a time?",
        opciones: ["4", "2", "8", "1"],
        respuesta: 0,
        explicacion: "0→2→4→6→8 are four steps of +2 — the same number of times the loop repeated.",
      },
      {
        pregunta: "To which value is the second repetition of a loop applied?",
        opciones: [
          "To the result of the first repetition",
          "To the original value the loop started with",
          "To a random value",
          "To the result of the last repetition",
        ],
        respuesta: 0,
        explicacion: "Each repetition chains with the previous one — the second starts from where the first left off, not from the initial value.",
      },
      {
        pregunta: "What is a loop, in essence?",
        opciones: [
          "An instruction that repeats a number of times or until a condition is met",
          "An instruction that runs only once",
          "A type of variable that stores text",
          "A way of skipping steps of an algorithm",
        ],
        respuesta: 0,
        explicacion: "That is the central definition of a loop: controlled repetition, either for a fixed amount or by a condition.",
      },
      {
        pregunta: "Why does tracing a loop by hand give the same result as writing the instruction repeated that many times?",
        opciones: [
          "Because a loop IS, at heart, the same instruction repeated that many times",
          "Because they are two completely different things",
          "Because tracing by hand always gives a different result",
          "Because loops cannot be traced by hand",
        ],
        respuesta: 0,
        explicacion: "A loop is a shortcut so as not to repeat the instruction by hand — tracing it by hand is \"unrolling\" that shortcut, step by step.",
      },
    ],
    visuales: [
      "x=0: loop that repeats 'x = x + 2' four times",
      "Why the loop does not start over from the original value",
      "Each turn of the loop starts from the result of the previous turn, not from x=0 again.",
    ],
  },
  "enigmia-clase-depuracion-por-que-falla-un-algoritmo": {
    nombre: "Debugging: why an algorithm fails",
    descripcion: "When an algorithm does not give the expected result, the most common mistake is not in the steps themselves, but in the order in which they are run.",
    pasos: [
      "Debugging is finding out why an algorithm does not give the expected result — it is almost never a \"badly written\" step, but a step in the wrong order.",
      "To debug, run the algorithm step by step (trace by hand) and compare the value after each step with what you expected — the first step where they part ways is where the mistake is.",
      "If the same steps, in another order, give the expected result, the bug was the order — no operation needs to be changed, only reordered.",
    ],
    quiz: [
      {
        pregunta: "The expected result is 3. The algorithm (divide by 2, then subtract 4), starting at 10, gives 1. What is the bug?",
        opciones: [
          "The steps are in the wrong order",
          "An additional step is missing",
          "The initial value is wrong",
          "There is no bug, 1 is correct",
        ],
        respuesta: 0,
        explicacion: "10÷2=5, 5−4=1 (the algorithm with the bug). Subtracting first and dividing afterwards gives the expected result.",
      },
      {
        pregunta: "What is the result of the corrected algorithm (subtract 4, then divide by 2), starting at 10?",
        opciones: ["3", "1", "6", "2"],
        respuesta: 0,
        explicacion: "10−4=6, 6÷2=3 — the corrected order gives the expected result.",
      },
      {
        pregunta: "When debugging an algorithm, which step points to where the mistake is?",
        opciones: [
          "The first step where the value traced by hand parts ways with the expected value",
          "Always the last step",
          "Always the first step, whatever the result",
          "No step points to it, you have to guess",
        ],
        respuesta: 0,
        explicacion: "Comparing step by step against what was expected locates exactly where it starts to deviate — that is where the bug is.",
      },
      {
        pregunta: "If reordering the same steps fixes the result, what does that mean about the bug?",
        opciones: [
          "The bug was the order — no operation needs to be changed",
          "The bug was in a badly written operation",
          "There was no real bug",
          "A new step has to be added",
        ],
        respuesta: 0,
        explicacion: "The same operations, in another order, giving the expected result confirm that the problem was never WHAT was done, but WHEN.",
      },
    ],
    visuales: ["Algorithm with a bug: divide first, then subtract", "Corrected algorithm: subtract first, then divide"],
  },
};
