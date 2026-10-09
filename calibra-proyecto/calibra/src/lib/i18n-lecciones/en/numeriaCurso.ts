import type { TraduccionLeccion } from "../traducir";

// Numeria — the 36 classes of the full course (0251: fractions, decimals, percentages, powers and
// roots, basic algebra and basic geometry) in English. Terms: carita feliz = the "butterfly" (smiley
// face) method, regla de la oreja = the "ear rule" (extremes and means), amplificar = scale up,
// MCD = GCD, MCM = LCM, cateto = leg, baldosa = tile. The $…$ formulas stay exactly as in Spanish
// (decimal comma included); plain-text numbers use a decimal point.
export const NUMERIA_CURSO_EN: Record<string, TraduccionLeccion> = {
  "numeria-clase-fraccion-que-es": {
    nombre: "What a fraction is and equivalent fractions",
    descripcion: "Equal parts of a whole, and why 2/3 and 4/6 are the same amount.",
    pasos: [
      "A fraction $\\frac{a}{b}$ says you split a whole into $b$ equal parts and took $a$ of them: the bottom one is the denominator and the top one the numerator.",
      "If you multiply the top and the bottom by the same number, the pieces get smaller but you take more of them: the amount doesn't change. That's called scaling up.",
    ],
    quiz: [
      { pregunta: "In $\\frac{3}{5}$, what does the 5 tell you?", opciones: ["How many equal parts the whole was split into", "How many parts were taken", "The result of dividing"], respuesta: 0, explicacion: "The denominator (bottom) says how many equal parts the whole was split into." },
      { pregunta: "Which one is equivalent to $\\frac{2}{3}$?", opciones: ["$\\frac{4}{6}$", "$\\frac{4}{5}$", "$\\frac{3}{4}$"], respuesta: 0, explicacion: "Multiplying the top and the bottom by 2: $\\frac{2 \\times 2}{3 \\times 2} = \\frac{4}{6}$." },
    ],
    visuales: ["$\\frac{2}{3}$ and $\\frac{4}{6}$ are the same size"],
  },
  "numeria-clase-fraccion-simplificar": {
    nombre: "Simplifying fractions with the GCD",
    descripcion: "Dividing the top and the bottom by the greatest common divisor to leave the fraction in lowest terms.",
    pasos: [
      "Simplifying is the opposite of scaling up: you divide the top and the bottom by the same number.",
      "To do it in a single step, use the greatest common divisor (GCD): the biggest number that divides both exactly.",
    ],
    quiz: [
      { pregunta: "What is the GCD of 12 and 18?", opciones: ["6", "3", "2"], respuesta: 0, explicacion: "6 divides 12 and 18 exactly, and there's no bigger number that does." },
      { pregunta: "What is $\\frac{12}{18}$ simplified?", opciones: ["$\\frac{2}{3}$", "$\\frac{4}{6}$", "$\\frac{6}{9}$"], respuesta: 0, explicacion: "Dividing by 6: $\\frac{12 \\div 6}{18 \\div 6} = \\frac{2}{3}$." },
    ],
    visuales: ["Simplifying $\\frac{12}{18}$"],
  },
  "numeria-clase-fraccion-mixtos": {
    nombre: "Mixed numbers and improper fractions",
    descripcion: "Going from $\\frac{11}{4}$ to $2\\frac{3}{4}$ and back.",
    pasos: [
      "When the numerator is bigger than the denominator, the fraction is worth more than a whole: it's improper.",
      "It's written as a mixed number by dividing: the quotient is the wholes and the remainder stays as a fraction.",
    ],
    quiz: [
      { pregunta: "How do you write $\\frac{11}{4}$ as a mixed number?", opciones: ["$2\\frac{3}{4}$", "$3\\frac{1}{4}$", "$2\\frac{1}{4}$"], respuesta: 0, explicacion: "11 ÷ 4 = 2 with 3 left over: two wholes and $\\frac{3}{4}$." },
      { pregunta: "What is $1\\frac{2}{5}$ as a fraction?", opciones: ["$\\frac{7}{5}$", "$\\frac{3}{5}$", "$\\frac{12}{5}$"], respuesta: 0, explicacion: "$\\frac{1 \\times 5 + 2}{5} = \\frac{7}{5}$." },
    ],
    visuales: ["$\\frac{11}{4}$ as a mixed number"],
  },
  "numeria-clase-fraccion-igual-denominador": {
    nombre: "Adding and subtracting with the same denominator",
    descripcion: "If the pieces are the same size, you only add or subtract the numerators.",
    pasos: [
      "If two fractions have the same denominator, they're talking about pieces of the same size.",
      "So you add (or subtract) only the numerators and the denominator stays the same. At the end, simplify if you can.",
    ],
    quiz: [
      { pregunta: "What is $\\frac{2}{7} + \\frac{3}{7}$?", opciones: ["$\\frac{5}{7}$", "$\\frac{5}{14}$", "$\\frac{6}{7}$"], respuesta: 0, explicacion: "2 + 3 = 5 and the denominator stays at 7." },
      { pregunta: "What is $\\frac{5}{8} - \\frac{1}{8}$?", opciones: ["$\\frac{1}{2}$", "$\\frac{4}{16}$", "$\\frac{6}{8}$"], respuesta: 0, explicacion: "5 − 1 = 4: $\\frac{4}{8}$, which simplified is $\\frac{1}{2}$." },
    ],
    visuales: ["$\\frac{2}{7} + \\frac{3}{7}$", "$\\frac{5}{8} - \\frac{1}{8}$"],
  },
  "numeria-clase-fraccion-carita-feliz": {
    nombre: "The smiley face method",
    descripcion: "Adding and subtracting fractions with different denominators by drawing eyes and a smile.",
    pasos: [
      "To add or subtract fractions with different denominators there's a shortcut: the smiley face.",
      "The eyes are the cross products (the numerator of one times the denominator of the other) and they go on top; the smile is the product of the denominators and goes on the bottom.",
      "It always works. Sometimes the result comes out with big numbers: that's why you simplify at the end.",
    ],
    quiz: [
      { pregunta: "In the smiley face for $\\frac{2}{3} + \\frac{1}{4}$, what goes on the bottom (the smile)?", opciones: ["$3 \\times 4 = 12$", "$2 \\times 4 = 8$", "$3 + 4 = 7$"], respuesta: 0, explicacion: "The smile multiplies the two denominators." },
      { pregunta: "What is $\\frac{2}{3} + \\frac{1}{4}$?", opciones: ["$\\frac{11}{12}$", "$\\frac{3}{7}$", "$\\frac{3}{12}$"], respuesta: 0, explicacion: "Eyes: 2×4 = 8 and 3×1 = 3. On top 8 + 3 = 11, on the bottom 12." },
      { pregunta: "What is $\\frac{5}{6} - \\frac{1}{4}$?", opciones: ["$\\frac{7}{12}$", "$\\frac{4}{2}$", "$\\frac{14}{24}$"], respuesta: 0, explicacion: "Eyes: 5×4 = 20 and 6×1 = 6. $\\frac{20 - 6}{24} = \\frac{14}{24} = \\frac{7}{12}$." },
    ],
    visuales: ["$\\frac{2}{3} + \\frac{1}{4}$ with the smiley face", "$\\frac{5}{6} - \\frac{1}{4}$, simplifying at the end"],
  },
  "numeria-clase-fraccion-mcm-varias": {
    nombre: "Adding several fractions with the LCM",
    descripcion: "With three or more fractions, bring them all to the same denominator by scaling each one.",
    pasos: [
      "With three or more fractions the smiley face gets complicated. Better: find the LCM of all the denominators.",
      "Scale each fraction (scale it up) by whatever it needs to reach that LCM. Then add only the numerators.",
    ],
    quiz: [
      { pregunta: "What is the LCM of 2, 3 and 4?", opciones: ["12", "24", "9"], respuesta: 0, explicacion: "12 is the first number that's in the times tables of 2, 3 and 4." },
      { pregunta: "By how much do you scale up $\\frac{2}{3}$ to get twelfths?", opciones: ["By 4", "By 3", "By 12"], respuesta: 0, explicacion: "3 × 4 = 12, so $\\frac{2}{3} = \\frac{8}{12}$." },
      { pregunta: "What is $\\frac{1}{2} + \\frac{2}{3} + \\frac{3}{4}$?", opciones: ["$\\frac{23}{12}$", "$\\frac{6}{9}$", "$\\frac{23}{24}$"], respuesta: 0, explicacion: "$\\frac{6}{12} + \\frac{8}{12} + \\frac{9}{12} = \\frac{23}{12}$." },
    ],
    visuales: ["$\\frac{1}{2} + \\frac{2}{3} + \\frac{3}{4}$"],
  },
  "numeria-clase-fraccion-multiplicar": {
    nombre: "Multiplying fractions and cross-simplifying",
    descripcion: "Numerator times numerator, denominator times denominator, and how to make the numbers smaller first.",
    pasos: [
      "Multiplying fractions is the most direct: numerator times numerator and denominator times denominator.",
      "Trick: before multiplying, cross-simplify (a numerator with the denominator of the other fraction). The numbers stay small and the result comes out already simplified.",
    ],
    quiz: [
      { pregunta: "What is $\\frac{2}{3} \\times \\frac{4}{5}$?", opciones: ["$\\frac{8}{15}$", "$\\frac{6}{8}$", "$\\frac{10}{12}$"], respuesta: 0, explicacion: "2×4 = 8 on top and 3×5 = 15 on the bottom." },
      { pregunta: "In $\\frac{4}{9} \\times \\frac{3}{8}$, what can be cross-simplified?", opciones: ["4 with 8, and 3 with 9", "4 with 9", "3 with 8"], respuesta: 0, explicacion: "4 and 8 are divided by 4; 3 and 9 by 3." },
      { pregunta: "What does $\\frac{4}{9} \\times \\frac{3}{8}$ give?", opciones: ["$\\frac{1}{6}$", "$\\frac{12}{72}$", "$\\frac{7}{17}$"], respuesta: 0, explicacion: "After simplifying: $\\frac{1}{3} \\times \\frac{1}{2} = \\frac{1}{6}$." },
    ],
    visuales: ["$\\frac{4}{9} \\times \\frac{3}{8}$"],
  },
  "numeria-clase-fraccion-division-cruz": {
    nombre: "Dividing fractions with the cross",
    descripcion: "An X between the two fractions: the cross products give the result.",
    pasos: [
      "To divide fractions you can multiply by the second one flipped over, or use the cross, which is the same but faster.",
      "The numerator of the first times the denominator of the second: it goes on top. The denominator of the first times the numerator of the second: it goes on the bottom.",
    ],
    quiz: [
      { pregunta: "In $\\frac{3}{4} \\div \\frac{5}{6}$, what goes on top?", opciones: ["$3 \\times 6 = 18$", "$3 \\times 5 = 15$", "$4 \\times 5 = 20$"], respuesta: 0, explicacion: "On top: the numerator of the first times the denominator of the second." },
      { pregunta: "What is $\\frac{3}{4} \\div \\frac{5}{6}$?", opciones: ["$\\frac{9}{10}$", "$\\frac{15}{24}$", "$\\frac{5}{8}$"], respuesta: 0, explicacion: "$\\frac{18}{20}$, which simplified is $\\frac{9}{10}$." },
    ],
    visuales: ["$\\frac{3}{4} \\div \\frac{5}{6}$ with the cross"],
  },
  "numeria-clase-fraccion-regla-oreja": {
    nombre: "The ear rule (extremes and means)",
    descripcion: "When one fraction sits on top of another: extremes on top, means on the bottom.",
    pasos: [
      "Sometimes the division shows up as one fraction on top of another (a complex fraction).",
      "The big ear joins the extremes (the topmost number and the bottommost one) and goes on top; the small ear joins the means (the two in the middle) and goes on the bottom.",
    ],
    quiz: [
      { pregunta: "In the ear rule, which numbers are the extremes?", opciones: ["The topmost one and the bottommost one", "The two in the middle", "The two numerators"], respuesta: 0, explicacion: "Extremes: the ones at the ends. Means: the ones in the middle." },
      { pregunta: "What is $\\dfrac{2/3}{4/5}$?", opciones: ["$\\frac{5}{6}$", "$\\frac{8}{15}$", "$\\frac{12}{10}$"], respuesta: 0, explicacion: "Extremes 2×5 = 10, means 3×4 = 12: $\\frac{10}{12} = \\frac{5}{6}$." },
    ],
    visuales: ["$\\dfrac{2/3}{4/5}$ with the ear rule"],
  },
  "numeria-clase-decimal-posicional": {
    nombre: "Place value of decimals",
    descripcion: "Tenths, hundredths and thousandths: what each place after the decimal point is worth.",
    pasos: [
      "After the decimal point, each place is worth ten times less than the one before: tenths, hundredths, thousandths.",
      "So, 3.472 is 3 ones plus 4 tenths, 7 hundredths and 2 thousandths.",
    ],
    quiz: [
      { pregunta: "In 3.472, what is the 7 worth?", opciones: ["7 hundredths (0.07)", "7 tenths (0.7)", "7 ones"], respuesta: 0, explicacion: "It's the second place after the decimal point: hundredths." },
      { pregunta: "Which is bigger: 0.5 or 0.45?", opciones: ["0.5", "0.45", "They're equal"], respuesta: 0, explicacion: "0.5 = 0.50, which is more than 0.45: you compare place by place." },
    ],
    visuales: ["Place by place: 3.472"],
  },
  "numeria-clase-decimal-suma-resta": {
    nombre: "Adding and subtracting decimals",
    descripcion: "Line up the decimal points, fill in with zeros and work as with whole numbers.",
    pasos: [
      "The golden rule: decimal point under decimal point. That way you add tenths with tenths and hundredths with hundredths.",
      "If one has fewer decimals, fill it in with zeros. Then work as always and bring the decimal point down in the same place.",
    ],
    quiz: [
      { pregunta: "What is 12.5 + 3.75?", opciones: ["$16,25$", "$15,80$", "$4,00$"], respuesta: 0, explicacion: "12.50 + 3.75 = 16.25 with the decimal points lined up." },
      { pregunta: "What is 8.3 − 2.47?", opciones: ["$5,83$", "$6,17$", "$6,43$"], respuesta: 0, explicacion: "8.30 − 2.47 = 5.83." },
    ],
    visuales: ["12.5 + 3.75", "8.3 − 2.47"],
  },
  "numeria-clase-decimal-multiplicar": {
    nombre: "Multiplying decimals",
    descripcion: "Multiply as whole numbers and count the decimals to place the point.",
    pasos: [
      "To multiply decimals you don't need to line up the decimal points: you multiply as if they were whole numbers.",
      "Then you count how many decimals the two factors have together, and the result gets that many decimals.",
    ],
    quiz: [
      { pregunta: "What is 2.5 × 1.3?", opciones: ["$3,25$", "$32,5$", "$0,325$"], respuesta: 0, explicacion: "25 × 13 = 325 and there are 2 decimals in total: 3.25." },
      { pregunta: "How many decimals does the result of 0.2 × 0.03 have?", opciones: ["3", "2", "1"], respuesta: 0, explicacion: "1 decimal + 2 decimals = 3: 0.2 × 0.03 = 0.006." },
    ],
    visuales: ["2.5 × 1.3"],
  },
  "numeria-clase-decimal-fraccion": {
    nombre: "From fraction to decimal",
    descripcion: "The fraction bar is a division: terminating and repeating decimals.",
    pasos: [
      "Every fraction is a division: $\\frac{3}{8}$ is $3 \\div 8$.",
      "If the remainder reaches zero, the decimal terminates. If a remainder repeats, the decimals repeat forever: it's a repeating decimal.",
    ],
    quiz: [
      { pregunta: "What is $\\frac{3}{8}$ as a decimal?", opciones: ["$0,375$", "$0,38$", "$2,666$"], respuesta: 0, explicacion: "3 ÷ 8 = 0.375: the remainder reaches zero." },
      { pregunta: "What is the decimal of $\\frac{1}{3}$ like?", opciones: ["Repeating: 0.333…", "Terminating: 0.3", "Terminating: 0.33"], respuesta: 0, explicacion: "The remainder 1 repeats forever: the 3 never ends." },
    ],
    visuales: ["$\\frac{3}{8}$ as a decimal", "$\\frac{1}{3}$: a decimal that never ends"],
  },
  "numeria-clase-porcentaje-que-es": {
    nombre: "What a percentage is",
    descripcion: "Out of every 100: percentage, fraction and decimal are the same thing.",
    pasos: [
      "\"Percent\" means \"out of every 100\": 35% is 35 out of every 100.",
      "That's why a percentage is a fraction with denominator 100, and also a decimal (you divide by 100).",
    ],
    quiz: [
      { pregunta: "What is 35% as a decimal?", opciones: ["$0,35$", "$3,5$", "$35$"], respuesta: 0, explicacion: "35 ÷ 100 = 0.35." },
      { pregunta: "What percentage is $\\frac{1}{4}$?", opciones: ["25 %", "14 %", "40 %"], respuesta: 0, explicacion: "$\\frac{1}{4} = \\frac{25}{100}$ = 25%." },
    ],
    visuales: ["35% on a grid of 100"],
  },
  "numeria-clase-porcentaje-de": {
    nombre: "Finding the percentage of a number",
    descripcion: "The 10% and 1% trick, and the direct calculation.",
    pasos: [
      "10% of a number is dividing it by 10, and 1% is dividing it by 100.",
      "Any percentage is built from those two: 35% is 3 times 10% plus 5 times 1%. Or directly: number × percentage ÷ 100.",
    ],
    quiz: [
      { pregunta: "What is 10% of 80?", opciones: ["$8$", "$0,8$", "$10$"], respuesta: 0, explicacion: "80 ÷ 10 = 8." },
      { pregunta: "What is 35% of 80?", opciones: ["$28$", "$35$", "$24$"], respuesta: 0, explicacion: "3 × 8 + 5 × 0.8 = 24 + 4 = 28." },
    ],
    visuales: ["35% of 80"],
  },
  "numeria-clase-porcentaje-aumentos": {
    nombre: "Increases and discounts",
    descripcion: "Adding or subtracting a percentage, and the multiplying shortcut.",
    pasos: [
      "An increase adds a part of the price; a discount subtracts it. First work out that part.",
      "Shortcut: with a 15% increase you pay 115%, that is, × 1.15. With a 25% discount you pay 75%: × 0.75.",
    ],
    quiz: [
      { pregunta: "A price of 200 goes up 15%. What does it become?", opciones: ["$230$", "$215$", "$170$"], respuesta: 0, explicacion: "15% of 200 = 30, and 200 + 30 = 230." },
      { pregunta: "Something costs 80 with a 25% discount. How much do you pay?", opciones: ["$60$", "$55$", "$20$"], respuesta: 0, explicacion: "25% of 80 = 20, and 80 − 20 = 60." },
    ],
    visuales: ["200 with a 15% increase", "80 with a 25% discount"],
  },
  "numeria-clase-potencia-que-es": {
    nombre: "What a power is",
    descripcion: "Base and exponent: multiplying a number by itself several times.",
    pasos: [
      "A power is a repeated multiplication: $3^4$ is $3 \\times 3 \\times 3 \\times 3$.",
      "The number at the bottom is the base (what gets multiplied) and the little one on top is the exponent (how many times).",
    ],
    quiz: [
      { pregunta: "What is $3^4$?", opciones: ["81", "12", "64"], respuesta: 0, explicacion: "3 × 3 × 3 × 3 = 81." },
      { pregunta: "In $5^2$, which is the base?", opciones: ["5", "2", "25"], respuesta: 0, explicacion: "The base is the number that gets multiplied: 5." },
    ],
    visuales: ["$3^4$ step by step"],
  },
  "numeria-clase-potencia-producto": {
    nombre: "Multiplying powers with the same base",
    descripcion: "The exponents add up: $2^3 \\cdot 2^4 = 2^7$.",
    pasos: [
      "If you multiply powers with the same base, you put all the factors together in a single row.",
      "That's why the exponents add up. Careful: it only works if the base is the same.",
    ],
    quiz: [
      { pregunta: "What is $2^3 \\cdot 2^4$ as a power?", opciones: ["$2^{7}$", "$2^{12}$", "$4^7$"], respuesta: 0, explicacion: "3 + 4 = 7 factors in total." },
      { pregunta: "Can you add the exponents of $2^3 \\cdot 5^2$?", opciones: ["No, the bases are different", "Yes, it gives $10^5$", "Yes, it gives $7^5$"], respuesta: 0, explicacion: "The rule only works with the same base." },
    ],
    visuales: ["$2^3 \\cdot 2^4$"],
  },
  "numeria-clase-potencia-cociente": {
    nombre: "Dividing powers with the same base",
    descripcion: "The factors cancel out and the exponents are subtracted.",
    pasos: [
      "When dividing powers with the same base, each factor on the bottom cancels one on top.",
      "The leftovers remain: the exponents are subtracted.",
    ],
    quiz: [
      { pregunta: "What is $\\frac{5^6}{5^2}$?", opciones: ["$5^{4}$", "$5^3$", "$1^4$"], respuesta: 0, explicacion: "6 − 2 = 4." },
      { pregunta: "What is $\\frac{10^5}{10^3}$?", opciones: ["$100$", "$10^8$", "$2$"], respuesta: 0, explicacion: "$10^{5-3} = 10^2 = 100$." },
    ],
    visuales: ["$\\frac{5^6}{5^2}$"],
  },
  "numeria-clase-potencia-potencia-cero": {
    nombre: "Power of a power and the zero exponent",
    descripcion: "$(3^2)^3 = 3^6$ and why $7^0 = 1$.",
    pasos: [
      "A power raised to another power is several equal groups: the exponents are multiplied.",
      "And any number (except 0) raised to 0 is worth 1: it's a power divided by itself.",
    ],
    quiz: [
      { pregunta: "What is $(3^2)^3$ as a power?", opciones: ["$3^{6}$", "$3^5$", "$9^5$"], respuesta: 0, explicacion: "2 × 3 = 6." },
      { pregunta: "What is $125^0$?", opciones: ["1", "0", "125"], respuesta: 0, explicacion: "Any base other than 0 raised to 0 gives 1." },
    ],
    visuales: ["$(3^2)^3$", "Why $7^0 = 1$"],
  },
  "numeria-clase-raiz-cuadrada": {
    nombre: "The square root",
    descripcion: "The side of a square: the inverse operation of squaring.",
    pasos: [
      "Squaring is building a square: $7^2 = 49$ little squares.",
      "The square root does the opposite: if you have 49 little squares in a square, how long is the side? $\\sqrt{49} = 7$.",
    ],
    quiz: [
      { pregunta: "What is $\\sqrt{49}$?", opciones: ["7", "24.5", "9"], respuesta: 0, explicacion: "7 × 7 = 49." },
      { pregunta: "What is $\\sqrt{144}$?", opciones: ["12", "14", "72"], respuesta: 0, explicacion: "12 × 12 = 144." },
    ],
    visuales: ["$\\sqrt{49}$"],
  },
  "numeria-clase-raiz-estimar": {
    nombre: "Estimating roots that aren't exact",
    descripcion: "Trapping the root between two perfect squares.",
    pasos: [
      "If the number isn't a perfect square, find the two perfect squares it's between.",
      "The root falls between their sides, and closer to the square the number is nearer to.",
    ],
    quiz: [
      { pregunta: "Between which numbers is $\\sqrt{50}$?", opciones: ["Between 7 and 8", "Between 5 and 6", "Between 24 and 26"], respuesta: 0, explicacion: "$7^2 = 49$ and $8^2 = 64$." },
      { pregunta: "Is $\\sqrt{50}$ closer to 7 or to 8?", opciones: ["To 7", "To 8", "Right in the middle"], respuesta: 0, explicacion: "50 is 1 away from 49 and 14 away from 64." },
    ],
    visuales: ["$\\sqrt{50}$: between 7 and 8"],
  },
  "numeria-clase-algebra-variables": {
    nombre: "Variables and expressions",
    descripcion: "A letter that holds a number, and how to evaluate an expression.",
    pasos: [
      "A variable is a letter that stands for a number we don't know yet (or that can change). $3x$ means $3 \\times x$.",
      "Evaluating is replacing the letter with a number and doing the math: if $x = 5$, then $3x + 2 = 3 \\cdot 5 + 2 = 17$.",
    ],
    quiz: [
      { pregunta: "What does $4x$ mean?", opciones: ["$4 \\times x$", "$4 + x$", "40-something"], respuesta: 0, explicacion: "A number stuck to a letter is multiplied." },
      { pregunta: "If $x = 3$, what is $2x + 5$?", opciones: ["11", "28", "10"], respuesta: 0, explicacion: "2 · 3 + 5 = 11." },
    ],
    visuales: ["Evaluating $3x + 2$ when $x = 5$", "The expression has a letter:", "Replace the x with 5:", "First the multiplication, then the addition:"],
  },
  "numeria-clase-algebra-terminos": {
    nombre: "Like terms",
    descripcion: "Grouping what has the same letter to simplify an expression.",
    pasos: [
      "Like terms are the ones with the same letter (or none): $3x$ and $-x$ are like terms; $2$ and $5$ too.",
      "To simplify, you add the coefficients of each group. $x$ with $x$, numbers with numbers: they never mix.",
    ],
    quiz: [
      { pregunta: "What does $3x + 2 - x + 5$ become?", opciones: ["$2x + 7$", "$9x$", "$4x + 7$"], respuesta: 0, explicacion: "3x − x = 2x and 2 + 5 = 7." },
      { pregunta: "Can you combine $4x$ and $3$?", opciones: ["No, they aren't like terms", "Yes, it gives $7x$", "Yes, it gives $12x$"], respuesta: 0, explicacion: "One has an x and the other doesn't." },
    ],
    visuales: ["$3x + 2 - x + 5$"],
  },
  "numeria-clase-algebra-distributiva": {
    nombre: "The distributive property",
    descripcion: "Spreading out the multiplication: $3(x + 4) = 3x + 12$.",
    pasos: [
      "A number in front of a parenthesis multiplies everything inside it.",
      "You can see it with a rectangle: height 3 and width $x + 4$. Its area is two pieces: $3x$ and $12$.",
    ],
    quiz: [
      { pregunta: "What is $3(x + 4)$?", opciones: ["$3x + 12$", "$3x + 4$", "$7x$"], respuesta: 0, explicacion: "3 · x = 3x and 3 · 4 = 12." },
      { pregunta: "What is $2(5 - x)$?", opciones: ["$10 - 2x$", "$10 - x$", "$7 - x$"], respuesta: 0, explicacion: "2 · 5 = 10 and 2 · (−x) = −2x." },
    ],
    visuales: ["$3(x + 4)$ as an area"],
  },
  "numeria-clase-algebra-un-paso": {
    nombre: "One-step equations",
    descripcion: "An equation is a balance: whatever you do on one side you do on the other.",
    pasos: [
      "An equation is like a balanced scale: both sides are worth the same.",
      "To solve for x, do the opposite operation on both sides: if it adds, subtract; if it multiplies, divide.",
    ],
    quiz: [
      { pregunta: "If $x + 5 = 12$, what is x?", opciones: ["7", "17", "60"], respuesta: 0, explicacion: "Subtracting 5 from both sides: x = 7." },
      { pregunta: "If $4x = 20$, what is x?", opciones: ["5", "16", "80"], respuesta: 0, explicacion: "Dividing both sides by 4: x = 5." },
    ],
    visuales: ["$x + 5 = 12$"],
  },
  "numeria-clase-algebra-dos-pasos": {
    nombre: "Two-step equations",
    descripcion: "First the loose number goes, then the one that multiplies.",
    pasos: [
      "In $3x + 4 = 19$ there are two things on top of the x: a + 4 and a × 3.",
      "They're undone in reverse order: first the + 4 (by subtracting), then the × 3 (by dividing). At the end, check by substituting.",
    ],
    quiz: [
      { pregunta: "If $3x + 4 = 19$, what is x?", opciones: ["5", "7", "23"], respuesta: 0, explicacion: "19 − 4 = 15 and 15 ÷ 3 = 5." },
      { pregunta: "If $2x - 6 = 10$, what is x?", opciones: ["8", "2", "16"], respuesta: 0, explicacion: "10 + 6 = 16 and 16 ÷ 2 = 8." },
    ],
    visuales: ["$3x + 4 = 19$", "Check: x = 5"],
  },
  "numeria-clase-algebra-dos-lados": {
    nombre: "Equations with x on both sides",
    descripcion: "Gathering the x's on one side and the numbers on the other.",
    pasos: [
      "If there are x's on both sides, first remove the x's from one side (by subtracting) so they all end up together.",
      "After that it's a two-step equation like the ones before.",
    ],
    quiz: [
      { pregunta: "If $5x + 3 = 2x + 15$, what is x?", opciones: ["4", "6", "2"], respuesta: 0, explicacion: "Subtracting 2x: 3x + 3 = 15. Subtracting 3: 3x = 12. So x = 4." },
      { pregunta: "In $7x = 3x + 20$, what's best to do first?", opciones: ["Subtract 3x from both sides", "Subtract 20", "Divide by 7"], respuesta: 0, explicacion: "That way the x's end up on just one side: 4x = 20." },
    ],
    visuales: ["$5x + 3 = 2x + 15$"],
  },
  "numeria-clase-geometria-angulos": {
    nombre: "Complementary and supplementary angles",
    descripcion: "The ones that together make 90° and the ones that make 180°.",
    pasos: [
      "A right angle measures 90° (a corner) and a straight angle measures 180° (a line).",
      "Two angles are complementary if they add up to 90° and supplementary if they add up to 180°.",
    ],
    quiz: [
      { pregunta: "What is the complement of 35°?", opciones: ["55°", "145°", "35°"], respuesta: 0, explicacion: "90° − 35° = 55°." },
      { pregunta: "What is the supplement of 120°?", opciones: ["60°", "30°", "240°"], respuesta: 0, explicacion: "180° − 120° = 60°." },
    ],
    visuales: ["The complement of 35°", "The supplement of 120°"],
  },
  "numeria-clase-geometria-triangulo-angulos": {
    nombre: "The angles of a triangle add up to 180°",
    descripcion: "If you cut off the three corners and put them together, they form a straight line.",
    pasos: [
      "In any triangle, the three angles together add up to 180°: if you place them side by side, they form a straight line.",
      "That's why, if you know two angles, the third is whatever is missing to reach 180°.",
    ],
    quiz: [
      { pregunta: "If a triangle has angles of 50° and 60°, how big is the third one?", opciones: ["70°", "90°", "110°"], respuesta: 0, explicacion: "180° − 50° − 60° = 70°." },
      { pregunta: "Can a triangle have two 100° angles?", opciones: ["No, they already go over 180°", "Yes", "Only if it's big"], respuesta: 0, explicacion: "100° + 100° = 200° > 180°." },
    ],
    visuales: ["A triangle with 50° and 60°"],
  },
  "numeria-clase-geometria-rectangulo": {
    nombre: "Perimeter and area of a rectangle",
    descripcion: "The edge and the surface: what you measure with a tape and what you cover with tiles.",
    pasos: [
      "The perimeter is the length of the edge: you add the four sides, $P = 2 \\times (\\text{base} + \\text{height})$.",
      "The area is how many 1 × 1 little squares fit inside: $A = \\text{base} \\times \\text{height}$.",
    ],
    quiz: [
      { pregunta: "What is the perimeter of a 6 × 4 rectangle?", opciones: ["20", "24", "10"], respuesta: 0, explicacion: "6 + 4 + 6 + 4 = 20." },
      { pregunta: "What is its area?", opciones: ["24", "20", "10"], respuesta: 0, explicacion: "6 × 4 = 24 little squares." },
    ],
    visuales: ["A 6 × 4 rectangle"],
  },
  "numeria-clase-geometria-area-triangulo": {
    nombre: "Area of a triangle",
    descripcion: "A triangle is half of a rectangle.",
    pasos: [
      "Every triangle fits in a rectangle with the same base and the same height, and takes up exactly half of it.",
      "That's why $A = \\frac{\\text{base} \\times \\text{height}}{2}$. The height is always measured straight, perpendicular to the base.",
    ],
    quiz: [
      { pregunta: "What is the area of a triangle with base 8 and height 5?", opciones: ["20", "40", "13"], respuesta: 0, explicacion: "8 × 5 = 40 and half of it is 20." },
      { pregunta: "Why do you divide by 2?", opciones: ["Because it's half of the rectangle", "Because it has 2 equal sides", "Because there are 2 measurements"], respuesta: 0, explicacion: "The triangle takes up half of the rectangle that encloses it." },
    ],
    visuales: ["Base 8, height 5"],
  },
  "numeria-clase-geometria-circulo": {
    nombre: "The circle: area",
    descripcion: "Radius, diameter and the formula $A = \\pi r^2$.",
    pasos: [
      "The radius goes from the center to the edge; the diameter crosses the whole circle and is twice as long.",
      "The area is $\\pi \\times r^2$, with $\\pi \\approx 3,14$ (or $\\frac{22}{7}$ if the radius is a multiple of 7).",
    ],
    quiz: [
      { pregunta: "If the radius is 7, how long is the diameter?", opciones: ["14", "7", "49"], respuesta: 0, explicacion: "The diameter is twice the radius." },
      { pregunta: "What is the area with radius 7 (using $\\frac{22}{7}$)?", opciones: ["154", "44", "21.98"], respuesta: 0, explicacion: "$\\frac{22}{7} \\times 49 = 154$." },
    ],
    visuales: ["A circle with radius 7"],
  },
  "numeria-clase-geometria-pitagoras": {
    nombre: "The Pythagorean theorem",
    descripcion: "In a right triangle, the squares of the legs add up to the square of the hypotenuse.",
    pasos: [
      "In a right triangle, the longest side (opposite the right angle) is the hypotenuse; the other two are the legs.",
      "If you draw a square on each side, the two small ones together have the same area as the big one: $a^2 + b^2 = c^2$.",
    ],
    quiz: [
      { pregunta: "If the legs measure 3 and 4, how long is the hypotenuse?", opciones: ["5", "7", "12"], respuesta: 0, explicacion: "9 + 16 = 25 and $\\sqrt{25} = 5$." },
      { pregunta: "If the legs measure 6 and 8, how long is the hypotenuse?", opciones: ["10", "14", "48"], respuesta: 0, explicacion: "36 + 64 = 100 and $\\sqrt{100} = 10$." },
    ],
    visuales: ["Legs 3 and 4", "Legs 6 and 8"],
  },
  "numeria-clase-geometria-areas-compuestas": {
    nombre: "Areas of composite shapes",
    descripcion: "Splitting into rectangles, or working out the big one and subtracting the gap.",
    pasos: [
      "A strangely shaped figure is almost always made of rectangles.",
      "An easy way: work out the big rectangle and subtract the missing piece.",
    ],
    quiz: [
      { pregunta: "What is the area of a 10 × 6 with a 4 × 3 cutout?", opciones: ["48", "60", "72"], respuesta: 0, explicacion: "60 − 12 = 48." },
      { pregunta: "What other way is there to work it out?", opciones: ["Split it into rectangles and add them up", "Multiply all the sides", "Add all the sides"], respuesta: 0, explicacion: "Adding the parts or subtracting the gap gives the same result." },
    ],
    visuales: ["A 10 × 6 rectangle with a 4 × 3 cutout"],
  },
  "numeria-clase-geometria-volumen": {
    nombre: "Volume of a box (prism)",
    descripcion: "How many little cubes fit: layers of length × width, stacked up.",
    pasos: [
      "The volume is how many 1 × 1 × 1 little cubes fit inside.",
      "A layer has length × width little cubes, and there are as many layers as the height: $V = \\text{length} \\times \\text{width} \\times \\text{height}$.",
    ],
    quiz: [
      { pregunta: "What is the volume of a 4 × 3 × 2 box?", opciones: ["24", "9", "12"], respuesta: 0, explicacion: "A layer has 12 little cubes and there are 2 layers: 24." },
      { pregunta: "A cube with side 3: how many little cubes does it have?", opciones: ["27", "9", "12"], respuesta: 0, explicacion: "3 × 3 × 3 = 27." },
    ],
    visuales: ["A 4 × 3 × 2 box"],
  },
};
