import type { TraduccionLeccion } from "../traducir";
import { DINAMIA_CLASES_EN } from "./dinamiaClases";

// Dinamia (Physics) — 24 Técnicas (this file) and 22 Clases (dinamiaClases.ts) in English.
// Terms: rozamiento = friction, normal = normal force, empuje = buoyant force (Arquímedes) or
// push (a hand), caudal = flow rate, caño = pipe, pileta = pool, rendimiento = efficiency,
// cantidad de movimiento = momentum, foco caliente/frío = hot/cold reservoir. The $…$ formulas
// stay exactly as in Spanish (decimal comma included); plain-text numbers use a decimal point.
export const DINAMIA_EN: Record<string, TraduccionLeccion> = {
  "dinamia-kmh-a-ms": {
    nombre: "Convert km/h to m/s in your head",
    descripcion: "Divide by 3.6 to get m/s; multiply by 3.6 to go back.",
    pasos: [
      "An hour has $3600$ s and a kilometer has $1000$ m. That's why $1\\ \\text{km/h} = \\dfrac{1000}{3600}\\ \\text{m/s} = \\dfrac{1}{3{,}6}\\ \\text{m/s}$.",
      "To go from km/h to m/s, **divide by 3.6**: $72\\ \\text{km/h} \\div 3{,}6 = 20\\ \\text{m/s}$.",
      "To go back, **multiply by 3.6**: $15\\ \\text{m/s} \\cdot 3{,}6 = 54\\ \\text{km/h}$.",
      "Anchor to check: $36\\ \\text{km/h} = 10\\ \\text{m/s}$. If your result in m/s is bigger than in km/h, you used the wrong operation.",
    ],
    quiz: [
      { pregunta: "What is $108\\ \\text{km/h}$ in m/s?", opciones: ["30 m/s", "388.8 m/s", "10.8 m/s", "300 m/s"], respuesta: 0, explicacion: "$108 \\div 3{,}6 = 30$." },
      { pregunta: "What is $5\\ \\text{m/s}$ in km/h?", opciones: ["18 km/h", "1.4 km/h", "50 km/h", "36 km/h"], respuesta: 0, explicacion: "$5 \\cdot 3{,}6 = 18$." },
    ],
    visuales: ["An hour is 3600 seconds; a kilometer, 1000 meters.", "From km/h to m/s: divide.", "From m/s to km/h: multiply."],
  },
  "dinamia-triangulo-dvt": {
    nombre: "The d-v-t triangle",
    descripcion: "Cover what you're looking for and the triangle tells you whether to multiply or divide.",
    pasos: [
      "Draw a triangle with $d$ on top and $v$, $t$ on the bottom. It's the same formula $d = v \\cdot t$ written three ways.",
      "Looking for the distance? Cover $d$: $v$ and $t$ are left side by side, so you **multiply**: $d = v \\cdot t$.",
      "Looking for the speed or the time? Cover that letter: $d$ is left on top of the other one, so you **divide**: $v = \\dfrac{d}{t}$, $t = \\dfrac{d}{v}$.",
      "It only works with constant speed, and with units that match: meters with m/s and seconds.",
    ],
    quiz: [
      { pregunta: "A cyclist covers $120$ m in $8$ s at constant speed. What is their speed?", opciones: ["15 m/s", "960 m/s", "112 m/s", "0.07 m/s"], respuesta: 0, explicacion: "Cover $v$: $v = \\dfrac{d}{t} = \\dfrac{120}{8} = 15$ m/s." },
      { pregunta: "To cover $200$ m at $4$ m/s, how long does it take?", opciones: ["50 s", "800 s", "196 s", "0.02 s"], respuesta: 0, explicacion: "Cover $t$: $t = \\dfrac{d}{v} = \\dfrac{200}{4} = 50$ s." },
    ],
    visuales: ["At 6 m/s, each second adds 6 m: in 5 s, $d = 6 \\cdot 5 = 30$ m"],
  },
  "dinamia-caida-con-g-10": {
    nombre: "Free fall with g = 10",
    descripcion: "Speeds 10, 20, 30…; distances 5, 20, 45…: the squares.",
    pasos: [
      "With $g = 10\\ \\text{m/s}^2$, something you drop gains $10$ m/s every second: at $1, 2, 3$ s it moves at $10, 20, 30$ m/s ($v = 10 \\cdot t$).",
      "The distance fallen is $d = 5 \\cdot t^2$: at $1, 2, 3, 4$ s it has fallen $5, 20, 45, 80$ m. That's $5$ times the squares $1, 4, 9, 16$.",
      "That's why each second it falls more than the one before: $5, 15, 25, 35$ m (the odd numbers times 5).",
      "If you're given the height, solve for the time: $t = \\sqrt{\\dfrac{d}{5}}$. From $45$ m it takes $\\sqrt{9} = 3$ s.",
    ],
    quiz: [
      { pregunta: "A stone falls freely for $4$ s ($g = 10$). How many meters did it fall?", opciones: ["80 m", "40 m", "160 m", "20 m"], respuesta: 0, explicacion: "$d = 5 \\cdot t^2 = 5 \\cdot 16 = 80$ m." },
      { pregunta: "How fast is it moving $2{,}5$ s after being dropped?", opciones: ["25 m/s", "12.5 m/s", "31.25 m/s", "10 m/s"], respuesta: 0, explicacion: "$v = 10 \\cdot 2{,}5 = 25$ m/s." },
    ],
    visuales: ["Marks every half second: farther and farther apart"],
  },
  "dinamia-leer-grafica": {
    nombre: "Read a graph without calculating",
    descripcion: "Straight line: constant speed. Curve: speeding up. Flat: at rest.",
    pasos: [
      "In a **position-time** graph ($x$-$t$), the slope is the speed: steeper means faster.",
      "A **sloped straight line** is constant speed; a **flat** one means it's at rest; a **curve** that gets steeper means it's speeding up.",
      "In a **velocity-time** graph ($v$-$t$), a flat line is constant speed and a sloped straight line is constant acceleration.",
      "Bonus: in $v$-$t$, the **area** under the line is the distance traveled.",
    ],
    quiz: [
      { pregunta: "In an $x$-$t$ graph, a stretch is a flat line. What is the object doing?", opciones: ["It's at rest", "It moves at constant speed", "It speeds up", "It slows down"], respuesta: 0, explicacion: "If the position doesn't change with time, it isn't moving." },
      { pregunta: "In a $v$-$t$ graph, the line is flat at $10$ m/s for $3$ s. How far did it go?", opciones: ["30 m", "10 m", "3.3 m", "13 m"], respuesta: 0, explicacion: "The area is a rectangle: $10 \\cdot 3 = 30$ m." },
    ],
    visuales: ["A curve that gets steeper: the object speeds up", "In $v$-$t$, flat = constant speed; the area is the distance"],
  },
  "dinamia-triangulos-conocidos": {
    nombre: "Triangles you already know",
    descripcion: "3-4-5 and its multiples: the magnitude comes out without the square root.",
    pasos: [
      "The magnitude of a vector $(x, y)$ is $\\sqrt{x^2 + y^2}$. But some triples are worth recognizing on sight.",
      "$3$-$4$-$5$: the vector $(3, 4)$ measures $5$. Its multiples too: $(6, 8)$ measures $10$; $(9, 12)$, $15$.",
      "Two other useful ones: $5$-$12$-$13$ and $8$-$15$-$17$.",
      "Signs don't change the magnitude: $(-6, 8)$ and $(6, -8)$ also measure $10$.",
    ],
    quiz: [
      { pregunta: "What is the magnitude of the vector $(9, 12)$?", opciones: ["15", "21", "10.5", "225"], respuesta: 0, explicacion: "It's $3 \\cdot (3, 4)$, so it measures $3 \\cdot 5 = 15$." },
      { pregunta: "What is the magnitude of the vector $(-5, 12)$?", opciones: ["13", "7", "17", "-13"], respuesta: 0, explicacion: "The $5$-$12$-$13$ triple; the sign doesn't matter." },
    ],
    visuales: ["F", "$(6, 8)$ is double $(3, 4)$: it measures $10$"],
  },
  "dinamia-seno-o-coseno": {
    nombre: "Sine or cosine, which one?",
    descripcion: "The component next to the angle gets cosine; the opposite one, sine.",
    pasos: [
      "A vector of magnitude $F$ makes an angle $\\theta$ with the $x$ axis. You want its components.",
      "The component **next to** the angle (the one that forms the angle with the vector) gets **cosine**: $F_x = F \\cos\\theta$.",
      "The **opposite** one gets **sine**: $F_y = F \\sin\\theta$.",
      "If the angle is measured from the $y$ axis, they swap: the one next to it is now $F_y$. That's why it's better to look at where the angle is than to memorize \"x is cosine\".",
    ],
    quiz: [
      { pregunta: "A $20$ N force makes $60^\\circ$ with the $x$ axis. What is $F_x$? ($\\cos 60^\\circ = 0{,}5$)", opciones: ["10 N", "17.3 N", "20 N", "40 N"], respuesta: 0, explicacion: "The one next to the angle gets cosine: $20 \\cdot 0{,}5 = 10$ N." },
      { pregunta: "A rope pulls with $10$ N at $30^\\circ$ from the **vertical**. What is the vertical component? ($\\cos 30^\\circ \\approx 0{,}87$)", opciones: ["8.7 N", "5 N", "10 N", "3 N"], respuesta: 0, explicacion: "The angle is next to the vertical, so the vertical one gets cosine: $10 \\cdot 0{,}87 = 8{,}7$ N." },
    ],
    visuales: ["F", "$F = 10$; the one next to the angle with the $x$ axis is $F_x = 8$"],
  },
  "dinamia-sumar-por-componentes": {
    nombre: "Add by components",
    descripcion: "Add all the x's, add all the y's, and only then take the magnitude.",
    pasos: [
      "Magnitudes are **not** added directly: two forces of $3$ N and $4$ N can give $1$, $5$ or $7$ N depending on where they point.",
      "What you do add are the components: $R = (A_x + B_x,\\ A_y + B_y)$.",
      "Example: $A = (3, 0)$ and $B = (0, 4)$ give $R = (3, 4)$, which measures $5$.",
      "Only at the end do you take the magnitude of $R$ with Pythagoras.",
    ],
    quiz: [
      { pregunta: "Add $A = (2, 5)$ and $B = (4, 3)$. What is the resultant?", opciones: ["(6, 8)", "(8, 6)", "(2, -2)", "(6, 15)"], respuesta: 0, explicacion: "$x$: $2 + 4 = 6$; $y$: $5 + 3 = 8$." },
      { pregunta: "What is the magnitude of that resultant $(6, 8)$?", opciones: ["10", "14", "48", "100"], respuesta: 0, explicacion: "The $6$-$8$-$10$ triple (double $3$-$4$-$5$)." },
    ],
    visuales: ["A", "B", "Tip to tail: the resultant goes from the start to the end"],
  },
  "dinamia-equilibrante": {
    nombre: "The equilibrant",
    descripcion: "It's the resultant flipped around: same size, opposite direction.",
    pasos: [
      "A body is in equilibrium when the sum of all the forces is zero.",
      "If there are already forces with resultant $R$, the force needed to balance them is $E = -R$: same magnitude, opposite direction.",
      "Example: $F_1 = (5, 0)$ and $F_2 = (-2, 4)$ give $R = (3, 4)$. The equilibrant is $E = (-3, -4)$, with magnitude $5$.",
    ],
    quiz: [
      { pregunta: "Two forces add up to $R = (6, -8)$ N. What is the equilibrant?", opciones: ["(-6, 8) N", "(6, -8) N", "(8, -6) N", "(0, 0) N"], respuesta: 0, explicacion: "$E = -R$: both signs change." },
      { pregunta: "What is the magnitude of that equilibrant?", opciones: ["10 N", "14 N", "2 N", "-10 N"], respuesta: 0, explicacion: "It measures the same as the resultant: $\\sqrt{36 + 64} = 10$ N." },
    ],
    visuales: ["F₁", "F₂", "The equilibrant closes the sum at zero"],
  },
  "dinamia-masa-y-peso": {
    nombre: "Mass and weight are not the same",
    descripcion: "Mass (kg) doesn't change; weight (N) is mass times g and depends on the place.",
    pasos: [
      "**Mass** is how much matter a body has and is measured in kilograms. It's the same on Earth, on the Moon or in space.",
      "**Weight** is the force with which gravity pulls it: $P = m \\cdot g$, in newtons. On Earth, with $g = 10$, a $50$ kg person weighs $500$ N.",
      "On the Moon, $g \\approx 1{,}6\\ \\text{m/s}^2$: the same person still has $50$ kg, but weighs $80$ N.",
      "To go back from weight to mass, divide by $g$: $300\\ \\text{N} \\div 10 = 30$ kg.",
    ],
    quiz: [
      { pregunta: "An astronaut has $70$ kg on Earth. What is their mass on the Moon?", opciones: ["70 kg", "11.2 kg", "700 kg", "0 kg"], respuesta: 0, explicacion: "Mass doesn't depend on the place; what changes is the weight." },
      { pregunta: "A box weighs $250$ N on Earth ($g = 10$). What is its mass?", opciones: ["25 kg", "2500 kg", "250 kg", "2.5 kg"], respuesta: 0, explicacion: "$m = \\dfrac{P}{g} = \\dfrac{250}{10} = 25$ kg." },
    ],
    visuales: ["Mass: how much matter there is. It doesn't depend on the place.", "Weight: the force of gravity on that mass.", "On Earth", "On the Moon"],
  },
  "dinamia-cuerpo-libre-4-pasos": {
    nombre: "Free-body diagram in 4 steps",
    descripcion: "Weight always; normal if it touches something; friction against the motion; tension if there's a rope.",
    pasos: [
      "Draw the body alone, as a dot or a block, and add the forces in this order:",
      "1) **Weight**, always, pointing down. 2) **Normal**, if it rests on a surface, perpendicular to it.",
      "3) **Friction**, if there's rubbing, along the surface and against the motion. 4) **Tension**, if there's a rope, pulling along it.",
      "Then add them up: if the net force is zero, the body keeps doing what it was doing; if not, it accelerates in the direction the net force points.",
    ],
    quiz: [
      { pregunta: "A book at rest on a table. What forces act on it?", opciones: ["Weight and normal", "Only the weight", "Weight, normal and friction", "Weight and tension"], respuesta: 0, explicacion: "It's resting on something (normal) and nothing pushes it sideways, so there's no friction." },
      { pregunta: "A lamp hangs at rest from a cable. What forces act on it?", opciones: ["Weight and tension", "Weight and normal", "Only the tension", "Tension and friction"], respuesta: 0, explicacion: "It doesn't touch any surface: there's no normal; the cable pulls upward." },
    ],
    visuales: ["A box pushed across the floor, force by force"],
  },
  "dinamia-plano-inclinado-ejes": {
    nombre: "Inclined plane: the axes trick",
    descripcion: "Tilt the axes with the ramp: m·g·sin θ is what pulls it down.",
    pasos: [
      "On a ramp it's not convenient to use horizontal and vertical axes. Tilt them: one axis **along** the ramp and the other **perpendicular** to it.",
      "That way, the normal and the friction lie on the axes, and you only need to split the weight.",
      "The part of the weight that pulls it down the ramp is $m g \\sin\\theta$; the part that presses it against the ramp is $m g \\cos\\theta$, and it equals the normal.",
      "Without friction, the acceleration down the ramp is $a = g \\sin\\theta$: it doesn't depend on the mass.",
    ],
    quiz: [
      { pregunta: "A $6$ kg block on a frictionless $30^\\circ$ ramp. What force pulls it down the ramp? ($g = 10$; $\\sin 30^\\circ = 0{,}5$)", opciones: ["30 N", "60 N", "52 N", "3 N"], respuesta: 0, explicacion: "$m g \\sin\\theta = 6 \\cdot 10 \\cdot 0{,}5 = 30$ N." },
      { pregunta: "With what acceleration does it go down?", opciones: ["5 m/s²", "10 m/s²", "30 m/s²", "0.5 m/s²"], respuesta: 0, explicacion: "$a = g \\sin\\theta = 10 \\cdot 0{,}5 = 5\\ \\text{m/s}^2$." },
    ],
    visuales: ["A $30^\\circ$ ramp: the weight is split between the two axes"],
  },
  "dinamia-bloques-como-uno": {
    nombre: "Block systems as a single body",
    descripcion: "Acceleration = net external force ÷ total mass.",
    pasos: [
      "If several blocks move together (stuck together or joined by a taut rope), they have the same acceleration.",
      "Treat them as **a single body** with the total mass. The forces between them (tensions, pushes from one to another) cancel out.",
      "Then $a = \\dfrac{F_{\\text{net external}}}{m_{\\text{total}}}$.",
      "On a pulley with two hanging masses (Atwood machine), the net force is the difference of the weights: $a = \\dfrac{(m_1 - m_2) g}{m_1 + m_2}$.",
    ],
    quiz: [
      { pregunta: "You push with $36$ N on two blocks of $8$ kg and $4$ kg together on ice. What is their acceleration?", opciones: ["3 m/s²", "4.5 m/s²", "9 m/s²", "12 m/s²"], respuesta: 0, explicacion: "$a = \\dfrac{36}{8 + 4} = 3\\ \\text{m/s}^2$." },
      { pregunta: "On a pulley hang $5$ kg and $3$ kg. What is their acceleration? ($g = 10$)", opciones: ["2.5 m/s²", "10 m/s²", "6.7 m/s²", "20 m/s²"], respuesta: 0, explicacion: "$a = \\dfrac{(5 - 3) \\cdot 10}{5 + 3} = \\dfrac{20}{8} = 2{,}5\\ \\text{m/s}^2$." },
    ],
    visuales: ["Net force: $30 - 20 = 10$ N for $5$ kg in total"],
  },
  "dinamia-signo-del-trabajo": {
    nombre: "The sign of work",
    descripcion: "With the motion: positive. Against it: negative. Perpendicular: zero.",
    pasos: [
      "The work of a force is $W = F \\cdot d \\cdot \\cos\\theta$, with $\\theta$ the angle between the force and the motion.",
      "Force **with** the motion ($\\theta = 0^\\circ$, $\\cos = 1$): positive work, it gives energy.",
      "Force **against** it ($\\theta = 180^\\circ$, $\\cos = -1$): negative work, it takes energy away. That's how friction works.",
      "**Perpendicular** force ($\\theta = 90^\\circ$, $\\cos = 0$): zero work. The normal and the weight do no work if the body moves horizontally.",
    ],
    quiz: [
      { pregunta: "You drag a box $5$ m across the floor. How much work does the box's weight do?", opciones: ["Zero", "Positive", "Negative", "It depends on the mass"], respuesta: 0, explicacion: "The weight is vertical and the motion horizontal: they form $90^\\circ$." },
      { pregunta: "A $20$ N friction force acts on something that slides $3$ m. How much work does it do?", opciones: ["-60 J", "60 J", "0 J", "-23 J"], respuesta: 0, explicacion: "It goes against the motion: $W = -20 \\cdot 3 = -60$ J." },
    ],
    visuales: ["The push does positive work; friction, negative; weight and normal, zero"],
  },
  "dinamia-velocidad-abajo-sin-masa": {
    nombre: "The speed at the bottom doesn't depend on the mass",
    descripcion: "Without friction, v = √(2·g·h): the mass cancels out.",
    pasos: [
      "Something goes down from a height $h$ without friction. The potential energy at the top becomes kinetic at the bottom: $m g h = \\dfrac{1}{2} m v^2$.",
      "The mass appears on both sides and **cancels out**: $v = \\sqrt{2 g h}$.",
      "With $g = 10$: from $5$ m it arrives at $\\sqrt{100} = 10$ m/s; from $20$ m, at $\\sqrt{400} = 20$ m/s.",
      "The other way around, to know how high something launched at $v$ goes: $h = \\dfrac{v^2}{2g} = \\dfrac{v^2}{20}$.",
    ],
    quiz: [
      { pregunta: "A $200$ kg cart and a $50$ kg cart go down from $45$ m without friction. Which one is faster at the bottom?", opciones: ["They're equally fast", "The 200 kg one", "The 50 kg one", "It depends on the shape of the track"], respuesta: 0, explicacion: "$v = \\sqrt{2 g h}$ doesn't depend on the mass: both arrive at $30$ m/s." },
      { pregunta: "A skateboard goes up a ramp at $6$ m/s, without friction. How high does it get?", opciones: ["1.8 m", "3.6 m", "0.6 m", "18 m"], respuesta: 0, explicacion: "$h = \\dfrac{v^2}{20} = \\dfrac{36}{20} = 1{,}8$ m." },
    ],
    visuales: ["All the potential becomes kinetic: $v = \\sqrt{2 \\cdot 10 \\cdot 5} = 10$ m/s"],
  },
  "dinamia-rendimiento": {
    nombre: "Efficiency in one step",
    descripcion: "The useful part divided by what goes in, times 100.",
    pasos: [
      "No machine uses all the energy it receives: part of it goes into heat, noise or rubbing.",
      "**Efficiency** is $\\eta = \\dfrac{\\text{useful energy}}{\\text{energy in}} \\cdot 100\\ \\%$.",
      "A motor that receives $1000$ J and delivers $750$ J of work has $\\eta = 75\\ \\%$; the remaining $250$ J went into heat.",
      "It can never go over $100\\ \\%$: if you get more, you flipped the division.",
    ],
    quiz: [
      { pregunta: "A light bulb receives $60$ J and gives $9$ J of light. What is its efficiency?", opciones: ["15 %", "6.7 %", "85 %", "51 %"], respuesta: 0, explicacion: "$\\dfrac{9}{60} \\cdot 100 = 15\\ \\%$." },
      { pregunta: "A motor with $40\\ \\%$ efficiency receives $500$ J. How much useful work does it deliver?", opciones: ["200 J", "300 J", "1250 J", "460 J"], respuesta: 0, explicacion: "$500 \\cdot 0{,}40 = 200$ J." },
    ],
    visuales: ["With friction, part of the energy becomes heat"],
  },
  "dinamia-choques-suma-igual": {
    nombre: "Collisions: sum before = sum after",
    descripcion: "Total momentum is conserved; set it up with signs.",
    pasos: [
      "Momentum is $p = m \\cdot v$. In a collision, the **sum** of all the bodies' momenta is the same before and after.",
      "Choose a positive direction (for example, to the right). Whatever goes the other way gets a minus sign.",
      "If they stick together (perfectly inelastic collision), both leave with the same velocity: $v_f = \\dfrac{m_1 v_1 + m_2 v_2}{m_1 + m_2}$.",
      "Example: $2$ kg at $6$ m/s hits $1$ kg at rest and they stick: $v_f = \\dfrac{12}{3} = 4$ m/s.",
    ],
    quiz: [
      { pregunta: "A $3$ kg cart at $4$ m/s hits a $1$ kg cart at rest and they stick together. How fast do they move off?", opciones: ["3 m/s", "4 m/s", "12 m/s", "1 m/s"], respuesta: 0, explicacion: "$v_f = \\dfrac{3 \\cdot 4 + 0}{4} = 3$ m/s." },
      { pregunta: "Two $1$ kg carts move toward each other at $5$ m/s each and stick together. How fast do they move off?", opciones: ["0 m/s", "5 m/s", "10 m/s", "2.5 m/s"], respuesta: 0, explicacion: "$p = 1 \\cdot 5 + 1 \\cdot (-5) = 0$: they end up at rest." },
    ],
    visuales: ["Before $12$ kg·m/s; after, also $12$"],
  },
  "dinamia-kelvin-en-un-paso": {
    nombre: "Kelvin in one step",
    descripcion: "Add 273 to the °C. And there are never negative kelvins.",
    pasos: [
      "The Kelvin scale starts at **absolute zero**, the lowest possible temperature: $-273\\ ^\\circ\\text{C}$.",
      "Each kelvin is the same size as a degree Celsius, so you just shift the zero: $T_K = T_{^\\circ\\text{C}} + 273$.",
      "Water freezes at $273$ K and boils at $373$ K. A $27\\ ^\\circ\\text{C}$ day is $300$ K.",
      "If you get a negative number in kelvin, there's a mistake: nothing is colder than $0$ K.",
    ],
    quiz: [
      { pregunta: "How many kelvins is $-73\\ ^\\circ\\text{C}$?", opciones: ["200 K", "-200 K", "346 K", "73 K"], respuesta: 0, explicacion: "$-73 + 273 = 200$ K." },
      { pregunta: "A gas is at $350$ K. How many °C is that?", opciones: ["77 °C", "623 °C", "-77 °C", "350 °C"], respuesta: 0, explicacion: "$350 - 273 = 77\\ ^\\circ\\text{C}$." },
    ],
    visuales: ["The three scales go up together"],
  },
  "dinamia-fahrenheit-de-cabeza": {
    nombre: "Approximate °F in your head",
    descripcion: "Double plus 30 to estimate; the exact formula for the result.",
    pasos: [
      "The exact formula is $^\\circ\\text{F} = ^\\circ\\text{C} \\cdot \\dfrac{9}{5} + 32$.",
      "To estimate quickly: **double it, plus 30**. $20\\ ^\\circ\\text{C} \\to 40 + 30 = 70$; the exact one gives $68\\ ^\\circ\\text{F}$.",
      "The other way, from °F to °C: **subtract 30 and divide by 2**. For the exact result: $^\\circ\\text{C} = (^\\circ\\text{F} - 32) \\cdot \\dfrac{5}{9}$.",
      "Anchor: $-40\\ ^\\circ\\text{C} = -40\\ ^\\circ\\text{F}$, the only point where they match.",
    ],
    quiz: [
      { pregunta: "How many °F is $25\\ ^\\circ\\text{C}$ (exact)?", opciones: ["77 °F", "80 °F", "45 °F", "57 °F"], respuesta: 0, explicacion: "$25 \\cdot \\dfrac{9}{5} + 32 = 45 + 32 = 77$." },
      { pregunta: "It's $86\\ ^\\circ\\text{F}$ outside. How many °C is that (exact)?", opciones: ["30 °C", "28 °C", "54 °C", "43 °C"], respuesta: 0, explicacion: "$(86 - 32) \\cdot \\dfrac{5}{9} = 54 \\cdot \\dfrac{5}{9} = 30$." },
    ],
    visuales: ["°C, K and °F of the same temperature"],
  },
  "dinamia-gases-que-queda-fijo": {
    nombre: "Gases: the table of what stays fixed",
    descripcion: "Boyle (fixed T), Charles (fixed P), Gay-Lussac (fixed V).",
    pasos: [
      "A gas has pressure $P$, volume $V$ and temperature $T$ (always in **kelvin**). If one stays fixed, the other two change with a simple rule.",
      "**Boyle**, fixed $T$: $P_1 V_1 = P_2 V_2$. If you squeeze the gas to half its volume, the pressure doubles.",
      "**Charles**, fixed $P$: $\\dfrac{V_1}{T_1} = \\dfrac{V_2}{T_2}$. If you double the temperature in kelvin, the volume doubles.",
      "**Gay-Lussac**, fixed $V$: $\\dfrac{P_1}{T_1} = \\dfrac{P_2}{T_2}$. That's why you don't heat an aerosol can.",
    ],
    quiz: [
      { pregunta: "A gas takes up $6$ L at $2$ atm. With the temperature fixed, the pressure rises to $3$ atm. What volume does it take up?", opciones: ["4 L", "9 L", "1 L", "12 L"], respuesta: 0, explicacion: "Boyle: $2 \\cdot 6 = 3 \\cdot V_2$, so $V_2 = 4$ L." },
      { pregunta: "A balloon has $3$ L at $300$ K. With the pressure fixed, it's heated to $400$ K. What volume does it have?", opciones: ["4 L", "2.25 L", "100 L", "3 L"], respuesta: 0, explicacion: "Charles: $V_2 = 3 \\cdot \\dfrac{400}{300} = 4$ L." },
    ],
    visuales: ["Boyle: less volume, more hits against the walls", "Charles: more temperature, more volume"],
  },
  "dinamia-mezclas-calor": {
    nombre: "Mixtures: the heat one gains, the other loses",
    descripcion: "Set heat gained = heat given off and solve for the final temperature.",
    pasos: [
      "If you mix hot water with cold water (with no losses), the heat the hot water **gives off** is what the cold water **gains**: $m_1 c (T_1 - T_f) = m_2 c (T_f - T_2)$.",
      "If both are water, $c$ cancels and the final temperature is an average **weighted** by the masses: $T_f = \\dfrac{m_1 T_1 + m_2 T_2}{m_1 + m_2}$.",
      "Example: $2$ kg at $80\\ ^\\circ\\text{C}$ with $2$ kg at $20\\ ^\\circ\\text{C}$ give $50\\ ^\\circ\\text{C}$, right in the middle.",
      "Check: the result always lands **between** the two temperatures, closer to the one with more mass.",
    ],
    quiz: [
      { pregunta: "You mix $3$ kg of water at $90\\ ^\\circ\\text{C}$ with $1$ kg at $10\\ ^\\circ\\text{C}$. What temperature does it end at?", opciones: ["70 °C", "50 °C", "40 °C", "80 °C"], respuesta: 0, explicacion: "$\\dfrac{3 \\cdot 90 + 1 \\cdot 10}{4} = \\dfrac{280}{4} = 70\\ ^\\circ\\text{C}$." },
      { pregunta: "Which of these results is impossible when mixing water at $20\\ ^\\circ\\text{C}$ with water at $60\\ ^\\circ\\text{C}$?", opciones: ["70 °C", "30 °C", "45 °C", "55 °C"], respuesta: 0, explicacion: "The mixture always ends between the two temperatures." },
    ],
    visuales: ["Higher temperature: the particles move faster"],
  },
  "dinamia-flota-compara-densidades": {
    nombre: "Does it float? Compare densities",
    descripcion: "If it's less dense than the liquid, it floats; if it's denser, it sinks.",
    pasos: [
      "**Density** is mass per volume: $\\rho = \\dfrac{m}{V}$. Water has $1000\\ \\text{kg/m}^3$.",
      "A body **less dense** than the liquid floats; a **denser** one sinks. It doesn't matter whether it's big or small.",
      "Also, the fraction that stays under the liquid is the ratio of densities: ice ($920$) in water stays $92\\ \\%$ submerged.",
      "That's why a steel ship floats: with the air inside, its average density is lower than water's.",
    ],
    quiz: [
      { pregunta: "A piece of cork ($240\\ \\text{kg/m}^3$) is put in water. What happens?", opciones: ["It floats", "It sinks", "It stays halfway down", "It depends on its size"], respuesta: 0, explicacion: "$240 < 1000$: it's less dense than water." },
      { pregunta: "An $800\\ \\text{kg/m}^3$ object floats in water. What percentage stays submerged?", opciones: ["80 %", "20 %", "125 %", "8 %"], respuesta: 0, explicacion: "$\\dfrac{800}{1000} = 0{,}8$." },
    ],
    visuales: ["Wood ($600$) in water ($1000$): it floats with $60\\ \\%$ under", "Aluminum ($2700$) in water: it sinks"],
  },
  "dinamia-cada-10-m-una-atmosfera": {
    nombre: "Every 10 m of water, 1 more atmosphere",
    descripcion: "Water adds 10 kPa per meter: 100 kPa (almost 1 atm) every 10 m.",
    pasos: [
      "Water pressure is $P = \\rho g h$. With $\\rho = 1000$ and $g = 10$, that's $10\\,000$ Pa per meter: **$10$ kPa per meter**.",
      "In $10$ m of water you get $100$ kPa, almost one atmosphere ($101$ kPa).",
      "**Absolute** pressure also adds the air above: at $20$ m, $101 + 200 = 301$ kPa, about $3$ atmospheres.",
      "The shape of the container doesn't matter: only the depth.",
    ],
    quiz: [
      { pregunta: "What pressure does the water alone exert at a depth of $30$ m?", opciones: ["300 kPa", "30 kPa", "3 kPa", "3000 kPa"], respuesta: 0, explicacion: "$10$ kPa per meter: $10 \\cdot 30 = 300$ kPa." },
      { pregunta: "A diver is at $15$ m. What is the absolute pressure? (Air: $101$ kPa)", opciones: ["251 kPa", "150 kPa", "116 kPa", "1515 kPa"], respuesta: 0, explicacion: "$101 + 10 \\cdot 15 = 251$ kPa." },
    ],
    visuales: ["Each meter deeper, $10$ kPa more"],
  },
  "dinamia-prensa-razon-de-areas": {
    nombre: "The press multiplies by the ratio of areas",
    descripcion: "F₂ = F₁ · (A₂ / A₁): the big piston pushes as many times harder as it is bigger.",
    pasos: [
      "In an enclosed liquid, the pressure you apply at one point reaches every point equally (Pascal's principle).",
      "If you push a small piston of area $A_1$ with $F_1$, the big one ($A_2$) gets the same pressure and pushes with $F_2 = F_1 \\cdot \\dfrac{A_2}{A_1}$.",
      "Example: $100$ N on $0{,}01\\ \\text{m}^2$ lifts $5000$ N on $0{,}5\\ \\text{m}^2$ (an area $50$ times larger).",
      "It isn't magic: the big piston rises $50$ times less than the small one goes down.",
    ],
    quiz: [
      { pregunta: "In a press, the big piston has $20$ times the area of the small one. You push with $30$ N. With what force does the big one rise?", opciones: ["600 N", "1.5 N", "50 N", "30 N"], respuesta: 0, explicacion: "$30 \\cdot 20 = 600$ N." },
      { pregunta: "If the small piston goes down $40$ cm, how much does the big one rise in that same press?", opciones: ["2 cm", "40 cm", "800 cm", "20 cm"], respuesta: 0, explicacion: "The volume that goes in is the volume that comes out: it rises $20$ times less, $40 \\div 20 = 2$ cm." },
    ],
    visuales: ["Hydraulic press: area $50$ times larger, force $50$ times larger"],
  },
  "dinamia-cano-angosto": {
    nombre: "Narrow pipe, fast water",
    descripcion: "If the area halves, the speed doubles (A·v stays the same).",
    pasos: [
      "Through a full pipe, the same amount of water passes every second everywhere: the **flow rate** $Q = A \\cdot v$ is constant.",
      "So $A_1 v_1 = A_2 v_2$: where the pipe narrows, the water moves faster.",
      "If the area drops to half, the speed doubles; if it drops to a third, it triples.",
      "It's what you do when you cover the end of a hose with your finger.",
    ],
    quiz: [
      { pregunta: "Water moves at $1{,}5$ m/s and the pipe narrows to a quarter of the area. How fast does it move there?", opciones: ["6 m/s", "0.375 m/s", "1.5 m/s", "3 m/s"], respuesta: 0, explicacion: "$1{,}5 \\cdot 4 = 6$ m/s." },
      { pregunta: "A $0{,}02\\ \\text{m}^2$ pipe carries water at $3$ m/s. What is the flow rate?", opciones: ["0.06 m³/s", "150 m³/s", "0.0067 m³/s", "3.02 m³/s"], respuesta: 0, explicacion: "$Q = A \\cdot v = 0{,}02 \\cdot 3 = 0{,}06\\ \\text{m}^3/\\text{s}$." },
    ],
    visuales: ["Area to a third: speed times three"],
  },
  ...DINAMIA_CLASES_EN,
};
