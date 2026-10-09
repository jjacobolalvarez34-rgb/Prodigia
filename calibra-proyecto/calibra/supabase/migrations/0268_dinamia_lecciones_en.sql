-- ============================================================
-- Prodigia — dinamia: lecciones de Aprender en inglés (54 lecciones).
-- Requiere 0225_lecciones_en_columnas.sql.
--
-- Llena nombre_en, descripcion_en y contenido_en de cada lección (Técnicas y Clases).
-- contenido_en = el contenido en español con `pasos`, `quiz` y `visuales` reemplazados
-- por su versión en inglés (misma forma, mismas preguntas y mismas posiciones de la
-- respuesta correcta): lo que no se traduce (ids, programas, símbolos) queda igual.
-- Solo UPDATE por slug; no toca progreso ni el contenido en español.
--
-- Este archivo se GENERA desde src/lib/i18n-lecciones/en/dinamia.ts y el test
-- src/lib/i18n-lecciones/traducciones.test.ts comprueba que coincida. No editar a
-- mano. Regenerar: I18N_LECCIONES_ESCRIBIR_SQL=1 npx vitest run src/lib/i18n-lecciones
-- (0268)
-- ============================================================

update public.techniques
set nombre_en = 'Convert km/h to m/s in your head',
    descripcion_en = 'Divide by 3.6 to get m/s; multiply by 3.6 to go back.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["An hour has $3600$ s and a kilometer has $1000$ m. That's why $1\\ \\text{km/h} = \\dfrac{1000}{3600}\\ \\text{m/s} = \\dfrac{1}{3{,}6}\\ \\text{m/s}$.","To go from km/h to m/s, **divide by 3.6**: $72\\ \\text{km/h} \\div 3{,}6 = 20\\ \\text{m/s}$.","To go back, **multiply by 3.6**: $15\\ \\text{m/s} \\cdot 3{,}6 = 54\\ \\text{km/h}$.","Anchor to check: $36\\ \\text{km/h} = 10\\ \\text{m/s}$. If your result in m/s is bigger than in km/h, you used the wrong operation."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What is $108\\ \\text{km/h}$ in m/s?","opciones":["30 m/s","388.8 m/s","10.8 m/s","300 m/s"],"respuesta":"30 m/s","explicacion":"$108 \\div 3{,}6 = 30$."},{"pregunta":"What is $5\\ \\text{m/s}$ in km/h?","opciones":["18 km/h","1.4 km/h","50 km/h","36 km/h"],"respuesta":"18 km/h","explicacion":"$5 \\cdot 3{,}6 = 18$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","cuadros":[{"texto":"An hour is 3600 seconds; a kilometer, 1000 meters.","formula":"1\\ \\text{km/h} = \\frac{1000\\ \\text{m}}{3600\\ \\text{s}} = \\frac{1}{3{,}6}\\ \\text{m/s}"},{"texto":"From km/h to m/s: divide.","formula":"90 \\div 3{,}6 = 25","resaltar":"$90\\ \\text{km/h} = 25\\ \\text{m/s}$"},{"texto":"From m/s to km/h: multiply.","formula":"20 \\cdot 3{,}6 = 72","resaltar":"$20\\ \\text{m/s} = 72\\ \\text{km/h}$"}]}]$leccion_en$::jsonb
    )
where slug = 'dinamia-kmh-a-ms';

update public.techniques
set nombre_en = 'The d-v-t triangle',
    descripcion_en = 'Cover what you''re looking for and the triangle tells you whether to multiply or divide.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Draw a triangle with $d$ on top and $v$, $t$ on the bottom. It's the same formula $d = v \\cdot t$ written three ways.","Looking for the distance? Cover $d$: $v$ and $t$ are left side by side, so you **multiply**: $d = v \\cdot t$.","Looking for the speed or the time? Cover that letter: $d$ is left on top of the other one, so you **divide**: $v = \\dfrac{d}{t}$, $t = \\dfrac{d}{v}$.","It only works with constant speed, and with units that match: meters with m/s and seconds."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A cyclist covers $120$ m in $8$ s at constant speed. What is their speed?","opciones":["15 m/s","960 m/s","112 m/s","0.07 m/s"],"respuesta":"15 m/s","explicacion":"Cover $v$: $v = \\dfrac{d}{t} = \\dfrac{120}{8} = 15$ m/s."},{"pregunta":"To cover $200$ m at $4$ m/s, how long does it take?","opciones":["50 s","800 s","196 s","0.02 s"],"respuesta":"50 s","explicacion":"Cover $t$: $t = \\dfrac{d}{v} = \\dfrac{200}{4} = 50$ s."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.trayecto","v0":6,"a":0,"segundos":5,"titulo":"At 6 m/s, each second adds 6 m: in 5 s, $d = 6 \\cdot 5 = 30$ m"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-triangulo-dvt';

update public.techniques
set nombre_en = 'Free fall with g = 10',
    descripcion_en = 'Speeds 10, 20, 30…; distances 5, 20, 45…: the squares.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["With $g = 10\\ \\text{m/s}^2$, something you drop gains $10$ m/s every second: at $1, 2, 3$ s it moves at $10, 20, 30$ m/s ($v = 10 \\cdot t$).","The distance fallen is $d = 5 \\cdot t^2$: at $1, 2, 3, 4$ s it has fallen $5, 20, 45, 80$ m. That's $5$ times the squares $1, 4, 9, 16$.","That's why each second it falls more than the one before: $5, 15, 25, 35$ m (the odd numbers times 5).","If you're given the height, solve for the time: $t = \\sqrt{\\dfrac{d}{5}}$. From $45$ m it takes $\\sqrt{9} = 3$ s."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A stone falls freely for $4$ s ($g = 10$). How many meters did it fall?","opciones":["80 m","40 m","160 m","20 m"],"respuesta":"80 m","explicacion":"$d = 5 \\cdot t^2 = 5 \\cdot 16 = 80$ m."},{"pregunta":"How fast is it moving $2{,}5$ s after being dropped?","opciones":["25 m/s","12.5 m/s","31.25 m/s","10 m/s"],"respuesta":"25 m/s","explicacion":"$v = 10 \\cdot 2{,}5 = 25$ m/s."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.caida","g":10,"v0":0,"segundos":3,"titulo":"Marks every half second: farther and farther apart"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-caida-con-g-10';

update public.techniques
set nombre_en = 'Read a graph without calculating',
    descripcion_en = 'Straight line: constant speed. Curve: speeding up. Flat: at rest.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["In a **position-time** graph ($x$-$t$), the slope is the speed: steeper means faster.","A **sloped straight line** is constant speed; a **flat** one means it's at rest; a **curve** that gets steeper means it's speeding up.","In a **velocity-time** graph ($v$-$t$), a flat line is constant speed and a sloped straight line is constant acceleration.","Bonus: in $v$-$t$, the **area** under the line is the distance traveled."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"In an $x$-$t$ graph, a stretch is a flat line. What is the object doing?","opciones":["It's at rest","It moves at constant speed","It speeds up","It slows down"],"respuesta":"It's at rest","explicacion":"If the position doesn't change with time, it isn't moving."},{"pregunta":"In a $v$-$t$ graph, the line is flat at $10$ m/s for $3$ s. How far did it go?","opciones":["30 m","10 m","3.3 m","13 m"],"respuesta":"30 m","explicacion":"The area is a rectangle: $10 \\cdot 3 = 30$ m."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.grafica","eje":"x-t","v0":1,"a":1,"segundos":4,"titulo":"A curve that gets steeper: the object speeds up"},{"tipo":"dinamia.grafica","eje":"v-t","v0":8,"a":0,"segundos":4,"titulo":"In $v$-$t$, flat = constant speed; the area is the distance"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-leer-grafica';

update public.techniques
set nombre_en = 'Triangles you already know',
    descripcion_en = '3-4-5 and its multiples: the magnitude comes out without the square root.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The magnitude of a vector $(x, y)$ is $\\sqrt{x^2 + y^2}$. But some triples are worth recognizing on sight.","$3$-$4$-$5$: the vector $(3, 4)$ measures $5$. Its multiples too: $(6, 8)$ measures $10$; $(9, 12)$, $15$.","Two other useful ones: $5$-$12$-$13$ and $8$-$15$-$17$.","Signs don't change the magnitude: $(-6, 8)$ and $(6, -8)$ also measure $10$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What is the magnitude of the vector $(9, 12)$?","opciones":["15","21","10.5","225"],"respuesta":"15","explicacion":"It's $3 \\cdot (3, 4)$, so it measures $3 \\cdot 5 = 15$."},{"pregunta":"What is the magnitude of the vector $(-5, 12)$?","opciones":["13","7","17","-13"],"respuesta":"13","explicacion":"The $5$-$12$-$13$ triple; the sign doesn't matter."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.vectores","modo":"componentes","vectores":[{"nombre":"F","x":6,"y":8}],"titulo":"$(6, 8)$ is double $(3, 4)$: it measures $10$"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-triangulos-conocidos';

update public.techniques
set nombre_en = 'Sine or cosine, which one?',
    descripcion_en = 'The component next to the angle gets cosine; the opposite one, sine.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["A vector of magnitude $F$ makes an angle $\\theta$ with the $x$ axis. You want its components.","The component **next to** the angle (the one that forms the angle with the vector) gets **cosine**: $F_x = F \\cos\\theta$.","The **opposite** one gets **sine**: $F_y = F \\sin\\theta$.","If the angle is measured from the $y$ axis, they swap: the one next to it is now $F_y$. That's why it's better to look at where the angle is than to memorize \"x is cosine\"."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A $20$ N force makes $60^\\circ$ with the $x$ axis. What is $F_x$? ($\\cos 60^\\circ = 0{,}5$)","opciones":["10 N","17.3 N","20 N","40 N"],"respuesta":"10 N","explicacion":"The one next to the angle gets cosine: $20 \\cdot 0{,}5 = 10$ N."},{"pregunta":"A rope pulls with $10$ N at $30^\\circ$ from the **vertical**. What is the vertical component? ($\\cos 30^\\circ \\approx 0{,}87$)","opciones":["8.7 N","5 N","10 N","3 N"],"respuesta":"8.7 N","explicacion":"The angle is next to the vertical, so the vertical one gets cosine: $10 \\cdot 0{,}87 = 8{,}7$ N."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.vectores","modo":"componentes","vectores":[{"nombre":"F","x":8,"y":6}],"titulo":"$F = 10$; the one next to the angle with the $x$ axis is $F_x = 8$"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-seno-o-coseno';

update public.techniques
set nombre_en = 'Add by components',
    descripcion_en = 'Add all the x''s, add all the y''s, and only then take the magnitude.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Magnitudes are **not** added directly: two forces of $3$ N and $4$ N can give $1$, $5$ or $7$ N depending on where they point.","What you do add are the components: $R = (A_x + B_x,\\ A_y + B_y)$.","Example: $A = (3, 0)$ and $B = (0, 4)$ give $R = (3, 4)$, which measures $5$.","Only at the end do you take the magnitude of $R$ with Pythagoras."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Add $A = (2, 5)$ and $B = (4, 3)$. What is the resultant?","opciones":["(6, 8)","(8, 6)","(2, -2)","(6, 15)"],"respuesta":"(6, 8)","explicacion":"$x$: $2 + 4 = 6$; $y$: $5 + 3 = 8$."},{"pregunta":"What is the magnitude of that resultant $(6, 8)$?","opciones":["10","14","48","100"],"respuesta":"10","explicacion":"The $6$-$8$-$10$ triple (double $3$-$4$-$5$)."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.vectores","modo":"suma","vectores":[{"nombre":"A","x":3,"y":0},{"nombre":"B","x":0,"y":4}],"titulo":"Tip to tail: the resultant goes from the start to the end"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-sumar-por-componentes';

update public.techniques
set nombre_en = 'The equilibrant',
    descripcion_en = 'It''s the resultant flipped around: same size, opposite direction.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["A body is in equilibrium when the sum of all the forces is zero.","If there are already forces with resultant $R$, the force needed to balance them is $E = -R$: same magnitude, opposite direction.","Example: $F_1 = (5, 0)$ and $F_2 = (-2, 4)$ give $R = (3, 4)$. The equilibrant is $E = (-3, -4)$, with magnitude $5$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Two forces add up to $R = (6, -8)$ N. What is the equilibrant?","opciones":["(-6, 8) N","(6, -8) N","(8, -6) N","(0, 0) N"],"respuesta":"(-6, 8) N","explicacion":"$E = -R$: both signs change."},{"pregunta":"What is the magnitude of that equilibrant?","opciones":["10 N","14 N","2 N","-10 N"],"respuesta":"10 N","explicacion":"It measures the same as the resultant: $\\sqrt{36 + 64} = 10$ N."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.vectores","modo":"equilibrante","vectores":[{"nombre":"F₁","x":5,"y":0},{"nombre":"F₂","x":-2,"y":4}],"titulo":"The equilibrant closes the sum at zero"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-equilibrante';

update public.techniques
set nombre_en = 'Mass and weight are not the same',
    descripcion_en = 'Mass (kg) doesn''t change; weight (N) is mass times g and depends on the place.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Mass** is how much matter a body has and is measured in kilograms. It's the same on Earth, on the Moon or in space.","**Weight** is the force with which gravity pulls it: $P = m \\cdot g$, in newtons. On Earth, with $g = 10$, a $50$ kg person weighs $500$ N.","On the Moon, $g \\approx 1{,}6\\ \\text{m/s}^2$: the same person still has $50$ kg, but weighs $80$ N.","To go back from weight to mass, divide by $g$: $300\\ \\text{N} \\div 10 = 30$ kg."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"An astronaut has $70$ kg on Earth. What is their mass on the Moon?","opciones":["70 kg","11.2 kg","700 kg","0 kg"],"respuesta":"70 kg","explicacion":"Mass doesn't depend on the place; what changes is the weight."},{"pregunta":"A box weighs $250$ N on Earth ($g = 10$). What is its mass?","opciones":["25 kg","2500 kg","250 kg","2.5 kg"],"respuesta":"25 kg","explicacion":"$m = \\dfrac{P}{g} = \\dfrac{250}{10} = 25$ kg."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","cuadros":[{"texto":"Mass: how much matter there is. It doesn't depend on the place.","resaltar":"$50$ kg en la Tierra = $50$ kg en la Luna"},{"texto":"Weight: the force of gravity on that mass.","formula":"P = m \\cdot g"},{"texto":"On Earth","formula":"P = 50 \\cdot 10 = 500\\ \\text{N}"},{"texto":"On the Moon","formula":"P = 50 \\cdot 1{,}6 = 80\\ \\text{N}","resaltar":"Misma masa, otro peso"}]}]$leccion_en$::jsonb
    )
where slug = 'dinamia-masa-y-peso';

update public.techniques
set nombre_en = 'Free-body diagram in 4 steps',
    descripcion_en = 'Weight always; normal if it touches something; friction against the motion; tension if there''s a rope.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Draw the body alone, as a dot or a block, and add the forces in this order:","1) **Weight**, always, pointing down. 2) **Normal**, if it rests on a surface, perpendicular to it.","3) **Friction**, if there's rubbing, along the surface and against the motion. 4) **Tension**, if there's a rope, pulling along it.","Then add them up: if the net force is zero, the body keeps doing what it was doing; if not, it accelerates in the direction the net force points."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A book at rest on a table. What forces act on it?","opciones":["Weight and normal","Only the weight","Weight, normal and friction","Weight and tension"],"respuesta":"Weight and normal","explicacion":"It's resting on something (normal) and nothing pushes it sideways, so there's no friction."},{"pregunta":"A lamp hangs at rest from a cable. What forces act on it?","opciones":["Weight and tension","Weight and normal","Only the tension","Tension and friction"],"respuesta":"Weight and tension","explicacion":"It doesn't touch any surface: there's no normal; the cable pulls upward."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.cuerpoLibre","situacion":"empujado","masa":10,"empuje":50,"mu":0.2,"titulo":"A box pushed across the floor, force by force"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-cuerpo-libre-4-pasos';

update public.techniques
set nombre_en = 'Inclined plane: the axes trick',
    descripcion_en = 'Tilt the axes with the ramp: m·g·sin θ is what pulls it down.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["On a ramp it's not convenient to use horizontal and vertical axes. Tilt them: one axis **along** the ramp and the other **perpendicular** to it.","That way, the normal and the friction lie on the axes, and you only need to split the weight.","The part of the weight that pulls it down the ramp is $m g \\sin\\theta$; the part that presses it against the ramp is $m g \\cos\\theta$, and it equals the normal.","Without friction, the acceleration down the ramp is $a = g \\sin\\theta$: it doesn't depend on the mass."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A $6$ kg block on a frictionless $30^\\circ$ ramp. What force pulls it down the ramp? ($g = 10$; $\\sin 30^\\circ = 0{,}5$)","opciones":["30 N","60 N","52 N","3 N"],"respuesta":"30 N","explicacion":"$m g \\sin\\theta = 6 \\cdot 10 \\cdot 0{,}5 = 30$ N."},{"pregunta":"With what acceleration does it go down?","opciones":["5 m/s²","10 m/s²","30 m/s²","0.5 m/s²"],"respuesta":"5 m/s²","explicacion":"$a = g \\sin\\theta = 10 \\cdot 0{,}5 = 5\\ \\text{m/s}^2$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.cuerpoLibre","situacion":"plano","masa":4,"angulo":30,"mu":0.1,"titulo":"A $30^\\circ$ ramp: the weight is split between the two axes"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-plano-inclinado-ejes';

update public.techniques
set nombre_en = 'Block systems as a single body',
    descripcion_en = 'Acceleration = net external force ÷ total mass.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["If several blocks move together (stuck together or joined by a taut rope), they have the same acceleration.","Treat them as **a single body** with the total mass. The forces between them (tensions, pushes from one to another) cancel out.","Then $a = \\dfrac{F_{\\text{net external}}}{m_{\\text{total}}}$.","On a pulley with two hanging masses (Atwood machine), the net force is the difference of the weights: $a = \\dfrac{(m_1 - m_2) g}{m_1 + m_2}$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"You push with $36$ N on two blocks of $8$ kg and $4$ kg together on ice. What is their acceleration?","opciones":["3 m/s²","4.5 m/s²","9 m/s²","12 m/s²"],"respuesta":"3 m/s²","explicacion":"$a = \\dfrac{36}{8 + 4} = 3\\ \\text{m/s}^2$."},{"pregunta":"On a pulley hang $5$ kg and $3$ kg. What is their acceleration? ($g = 10$)","opciones":["2.5 m/s²","10 m/s²","6.7 m/s²","20 m/s²"],"respuesta":"2.5 m/s²","explicacion":"$a = \\dfrac{(5 - 3) \\cdot 10}{5 + 3} = \\dfrac{20}{8} = 2{,}5\\ \\text{m/s}^2$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.poleas","m1":3,"m2":2,"titulo":"Net force: $30 - 20 = 10$ N for $5$ kg in total"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-bloques-como-uno';

update public.techniques
set nombre_en = 'The sign of work',
    descripcion_en = 'With the motion: positive. Against it: negative. Perpendicular: zero.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The work of a force is $W = F \\cdot d \\cdot \\cos\\theta$, with $\\theta$ the angle between the force and the motion.","Force **with** the motion ($\\theta = 0^\\circ$, $\\cos = 1$): positive work, it gives energy.","Force **against** it ($\\theta = 180^\\circ$, $\\cos = -1$): negative work, it takes energy away. That's how friction works.","**Perpendicular** force ($\\theta = 90^\\circ$, $\\cos = 0$): zero work. The normal and the weight do no work if the body moves horizontally."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"You drag a box $5$ m across the floor. How much work does the box's weight do?","opciones":["Zero","Positive","Negative","It depends on the mass"],"respuesta":"Zero","explicacion":"The weight is vertical and the motion horizontal: they form $90^\\circ$."},{"pregunta":"A $20$ N friction force acts on something that slides $3$ m. How much work does it do?","opciones":["-60 J","60 J","0 J","-23 J"],"respuesta":"-60 J","explicacion":"It goes against the motion: $W = -20 \\cdot 3 = -60$ J."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.cuerpoLibre","situacion":"empujado","masa":10,"empuje":60,"mu":0.3,"titulo":"The push does positive work; friction, negative; weight and normal, zero"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-signo-del-trabajo';

update public.techniques
set nombre_en = 'The speed at the bottom doesn''t depend on the mass',
    descripcion_en = 'Without friction, v = √(2·g·h): the mass cancels out.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Something goes down from a height $h$ without friction. The potential energy at the top becomes kinetic at the bottom: $m g h = \\dfrac{1}{2} m v^2$.","The mass appears on both sides and **cancels out**: $v = \\sqrt{2 g h}$.","With $g = 10$: from $5$ m it arrives at $\\sqrt{100} = 10$ m/s; from $20$ m, at $\\sqrt{400} = 20$ m/s.","The other way around, to know how high something launched at $v$ goes: $h = \\dfrac{v^2}{2g} = \\dfrac{v^2}{20}$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A $200$ kg cart and a $50$ kg cart go down from $45$ m without friction. Which one is faster at the bottom?","opciones":["They're equally fast","The 200 kg one","The 50 kg one","It depends on the shape of the track"],"respuesta":"They're equally fast","explicacion":"$v = \\sqrt{2 g h}$ doesn't depend on the mass: both arrive at $30$ m/s."},{"pregunta":"A skateboard goes up a ramp at $6$ m/s, without friction. How high does it get?","opciones":["1.8 m","3.6 m","0.6 m","18 m"],"respuesta":"1.8 m","explicacion":"$h = \\dfrac{v^2}{20} = \\dfrac{36}{20} = 1{,}8$ m."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.energia","masa":2,"altura":5,"titulo":"All the potential becomes kinetic: $v = \\sqrt{2 \\cdot 10 \\cdot 5} = 10$ m/s"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-velocidad-abajo-sin-masa';

update public.techniques
set nombre_en = 'Efficiency in one step',
    descripcion_en = 'The useful part divided by what goes in, times 100.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["No machine uses all the energy it receives: part of it goes into heat, noise or rubbing.","**Efficiency** is $\\eta = \\dfrac{\\text{useful energy}}{\\text{energy in}} \\cdot 100\\ \\%$.","A motor that receives $1000$ J and delivers $750$ J of work has $\\eta = 75\\ \\%$; the remaining $250$ J went into heat.","It can never go over $100\\ \\%$: if you get more, you flipped the division."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A light bulb receives $60$ J and gives $9$ J of light. What is its efficiency?","opciones":["15 %","6.7 %","85 %","51 %"],"respuesta":"15 %","explicacion":"$\\dfrac{9}{60} \\cdot 100 = 15\\ \\%$."},{"pregunta":"A motor with $40\\ \\%$ efficiency receives $500$ J. How much useful work does it deliver?","opciones":["200 J","300 J","1250 J","460 J"],"respuesta":"200 J","explicacion":"$500 \\cdot 0{,}40 = 200$ J."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.energia","masa":1,"altura":20,"perdida":0.25,"titulo":"With friction, part of the energy becomes heat"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-rendimiento';

update public.techniques
set nombre_en = 'Collisions: sum before = sum after',
    descripcion_en = 'Total momentum is conserved; set it up with signs.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Momentum is $p = m \\cdot v$. In a collision, the **sum** of all the bodies' momenta is the same before and after.","Choose a positive direction (for example, to the right). Whatever goes the other way gets a minus sign.","If they stick together (perfectly inelastic collision), both leave with the same velocity: $v_f = \\dfrac{m_1 v_1 + m_2 v_2}{m_1 + m_2}$.","Example: $2$ kg at $6$ m/s hits $1$ kg at rest and they stick: $v_f = \\dfrac{12}{3} = 4$ m/s."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A $3$ kg cart at $4$ m/s hits a $1$ kg cart at rest and they stick together. How fast do they move off?","opciones":["3 m/s","4 m/s","12 m/s","1 m/s"],"respuesta":"3 m/s","explicacion":"$v_f = \\dfrac{3 \\cdot 4 + 0}{4} = 3$ m/s."},{"pregunta":"Two $1$ kg carts move toward each other at $5$ m/s each and stick together. How fast do they move off?","opciones":["0 m/s","5 m/s","10 m/s","2.5 m/s"],"respuesta":"0 m/s","explicacion":"$p = 1 \\cdot 5 + 1 \\cdot (-5) = 0$: they end up at rest."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.choque","m1":2,"v1":6,"m2":1,"v2":0,"clase":"plastico","titulo":"Before $12$ kg·m/s; after, also $12$"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-choques-suma-igual';

update public.techniques
set nombre_en = 'Kelvin in one step',
    descripcion_en = 'Add 273 to the °C. And there are never negative kelvins.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The Kelvin scale starts at **absolute zero**, the lowest possible temperature: $-273\\ ^\\circ\\text{C}$.","Each kelvin is the same size as a degree Celsius, so you just shift the zero: $T_K = T_{^\\circ\\text{C}} + 273$.","Water freezes at $273$ K and boils at $373$ K. A $27\\ ^\\circ\\text{C}$ day is $300$ K.","If you get a negative number in kelvin, there's a mistake: nothing is colder than $0$ K."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"How many kelvins is $-73\\ ^\\circ\\text{C}$?","opciones":["200 K","-200 K","346 K","73 K"],"respuesta":"200 K","explicacion":"$-73 + 273 = 200$ K."},{"pregunta":"A gas is at $350$ K. How many °C is that?","opciones":["77 °C","623 °C","-77 °C","350 °C"],"respuesta":"77 °C","explicacion":"$350 - 273 = 77\\ ^\\circ\\text{C}$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.termometro","modo":"escalas","temperaturas":[0,27,100],"titulo":"The three scales go up together"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-kelvin-en-un-paso';

update public.techniques
set nombre_en = 'Approximate °F in your head',
    descripcion_en = 'Double plus 30 to estimate; the exact formula for the result.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The exact formula is $^\\circ\\text{F} = ^\\circ\\text{C} \\cdot \\dfrac{9}{5} + 32$.","To estimate quickly: **double it, plus 30**. $20\\ ^\\circ\\text{C} \\to 40 + 30 = 70$; the exact one gives $68\\ ^\\circ\\text{F}$.","The other way, from °F to °C: **subtract 30 and divide by 2**. For the exact result: $^\\circ\\text{C} = (^\\circ\\text{F} - 32) \\cdot \\dfrac{5}{9}$.","Anchor: $-40\\ ^\\circ\\text{C} = -40\\ ^\\circ\\text{F}$, the only point where they match."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"How many °F is $25\\ ^\\circ\\text{C}$ (exact)?","opciones":["77 °F","80 °F","45 °F","57 °F"],"respuesta":"77 °F","explicacion":"$25 \\cdot \\dfrac{9}{5} + 32 = 45 + 32 = 77$."},{"pregunta":"It's $86\\ ^\\circ\\text{F}$ outside. How many °C is that (exact)?","opciones":["30 °C","28 °C","54 °C","43 °C"],"respuesta":"30 °C","explicacion":"$(86 - 32) \\cdot \\dfrac{5}{9} = 54 \\cdot \\dfrac{5}{9} = 30$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.termometro","modo":"escalas","temperaturas":[-40,20,37],"titulo":"°C, K and °F of the same temperature"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-fahrenheit-de-cabeza';

update public.techniques
set nombre_en = 'Gases: the table of what stays fixed',
    descripcion_en = 'Boyle (fixed T), Charles (fixed P), Gay-Lussac (fixed V).',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["A gas has pressure $P$, volume $V$ and temperature $T$ (always in **kelvin**). If one stays fixed, the other two change with a simple rule.","**Boyle**, fixed $T$: $P_1 V_1 = P_2 V_2$. If you squeeze the gas to half its volume, the pressure doubles.","**Charles**, fixed $P$: $\\dfrac{V_1}{T_1} = \\dfrac{V_2}{T_2}$. If you double the temperature in kelvin, the volume doubles.","**Gay-Lussac**, fixed $V$: $\\dfrac{P_1}{T_1} = \\dfrac{P_2}{T_2}$. That's why you don't heat an aerosol can."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A gas takes up $6$ L at $2$ atm. With the temperature fixed, the pressure rises to $3$ atm. What volume does it take up?","opciones":["4 L","9 L","1 L","12 L"],"respuesta":"4 L","explicacion":"Boyle: $2 \\cdot 6 = 3 \\cdot V_2$, so $V_2 = 4$ L."},{"pregunta":"A balloon has $3$ L at $300$ K. With the pressure fixed, it's heated to $400$ K. What volume does it have?","opciones":["4 L","2.25 L","100 L","3 L"],"respuesta":"4 L","explicacion":"Charles: $V_2 = 3 \\cdot \\dfrac{400}{300} = 4$ L."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.particulas","modo":"boyle","valores":[4,2,1],"inicial":1,"titulo":"Boyle: less volume, more hits against the walls"},{"tipo":"dinamia.particulas","modo":"charles","valores":[300,450,600],"inicial":2,"titulo":"Charles: more temperature, more volume"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-gases-que-queda-fijo';

update public.techniques
set nombre_en = 'Mixtures: the heat one gains, the other loses',
    descripcion_en = 'Set heat gained = heat given off and solve for the final temperature.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["If you mix hot water with cold water (with no losses), the heat the hot water **gives off** is what the cold water **gains**: $m_1 c (T_1 - T_f) = m_2 c (T_f - T_2)$.","If both are water, $c$ cancels and the final temperature is an average **weighted** by the masses: $T_f = \\dfrac{m_1 T_1 + m_2 T_2}{m_1 + m_2}$.","Example: $2$ kg at $80\\ ^\\circ\\text{C}$ with $2$ kg at $20\\ ^\\circ\\text{C}$ give $50\\ ^\\circ\\text{C}$, right in the middle.","Check: the result always lands **between** the two temperatures, closer to the one with more mass."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"You mix $3$ kg of water at $90\\ ^\\circ\\text{C}$ with $1$ kg at $10\\ ^\\circ\\text{C}$. What temperature does it end at?","opciones":["70 °C","50 °C","40 °C","80 °C"],"respuesta":"70 °C","explicacion":"$\\dfrac{3 \\cdot 90 + 1 \\cdot 10}{4} = \\dfrac{280}{4} = 70\\ ^\\circ\\text{C}$."},{"pregunta":"Which of these results is impossible when mixing water at $20\\ ^\\circ\\text{C}$ with water at $60\\ ^\\circ\\text{C}$?","opciones":["70 °C","30 °C","45 °C","55 °C"],"respuesta":"70 °C","explicacion":"The mixture always ends between the two temperatures."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.particulas","modo":"temperatura","valores":[280,315,350],"titulo":"Higher temperature: the particles move faster"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-mezclas-calor';

update public.techniques
set nombre_en = 'Does it float? Compare densities',
    descripcion_en = 'If it''s less dense than the liquid, it floats; if it''s denser, it sinks.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Density** is mass per volume: $\\rho = \\dfrac{m}{V}$. Water has $1000\\ \\text{kg/m}^3$.","A body **less dense** than the liquid floats; a **denser** one sinks. It doesn't matter whether it's big or small.","Also, the fraction that stays under the liquid is the ratio of densities: ice ($920$) in water stays $92\\ \\%$ submerged.","That's why a steel ship floats: with the air inside, its average density is lower than water's."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A piece of cork ($240\\ \\text{kg/m}^3$) is put in water. What happens?","opciones":["It floats","It sinks","It stays halfway down","It depends on its size"],"respuesta":"It floats","explicacion":"$240 < 1000$: it's less dense than water."},{"pregunta":"An $800\\ \\text{kg/m}^3$ object floats in water. What percentage stays submerged?","opciones":["80 %","20 %","125 %","8 %"],"respuesta":"80 %","explicacion":"$\\dfrac{800}{1000} = 0{,}8$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.fluido","modo":"flota","densidad":600,"liquido":1000,"titulo":"Wood ($600$) in water ($1000$): it floats with $60\\ \\%$ under"},{"tipo":"dinamia.fluido","modo":"flota","densidad":2700,"liquido":1000,"titulo":"Aluminum ($2700$) in water: it sinks"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-flota-compara-densidades';

update public.techniques
set nombre_en = 'Every 10 m of water, 1 more atmosphere',
    descripcion_en = 'Water adds 10 kPa per meter: 100 kPa (almost 1 atm) every 10 m.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Water pressure is $P = \\rho g h$. With $\\rho = 1000$ and $g = 10$, that's $10\\,000$ Pa per meter: **$10$ kPa per meter**.","In $10$ m of water you get $100$ kPa, almost one atmosphere ($101$ kPa).","**Absolute** pressure also adds the air above: at $20$ m, $101 + 200 = 301$ kPa, about $3$ atmospheres.","The shape of the container doesn't matter: only the depth."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What pressure does the water alone exert at a depth of $30$ m?","opciones":["300 kPa","30 kPa","3 kPa","3000 kPa"],"respuesta":"300 kPa","explicacion":"$10$ kPa per meter: $10 \\cdot 30 = 300$ kPa."},{"pregunta":"A diver is at $15$ m. What is the absolute pressure? (Air: $101$ kPa)","opciones":["251 kPa","150 kPa","116 kPa","1515 kPa"],"respuesta":"251 kPa","explicacion":"$101 + 10 \\cdot 15 = 251$ kPa."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.fluido","modo":"presion","profundidades":[1,5,10],"titulo":"Each meter deeper, $10$ kPa more"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-cada-10-m-una-atmosfera';

update public.techniques
set nombre_en = 'The press multiplies by the ratio of areas',
    descripcion_en = 'F₂ = F₁ · (A₂ / A₁): the big piston pushes as many times harder as it is bigger.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["In an enclosed liquid, the pressure you apply at one point reaches every point equally (Pascal's principle).","If you push a small piston of area $A_1$ with $F_1$, the big one ($A_2$) gets the same pressure and pushes with $F_2 = F_1 \\cdot \\dfrac{A_2}{A_1}$.","Example: $100$ N on $0{,}01\\ \\text{m}^2$ lifts $5000$ N on $0{,}5\\ \\text{m}^2$ (an area $50$ times larger).","It isn't magic: the big piston rises $50$ times less than the small one goes down."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"In a press, the big piston has $20$ times the area of the small one. You push with $30$ N. With what force does the big one rise?","opciones":["600 N","1.5 N","50 N","30 N"],"respuesta":"600 N","explicacion":"$30 \\cdot 20 = 600$ N."},{"pregunta":"If the small piston goes down $40$ cm, how much does the big one rise in that same press?","opciones":["2 cm","40 cm","800 cm","20 cm"],"respuesta":"2 cm","explicacion":"The volume that goes in is the volume that comes out: it rises $20$ times less, $40 \\div 20 = 2$ cm."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.fluido","modo":"prensa","f1":100,"a1":0.01,"a2":0.5,"titulo":"Hydraulic press: area $50$ times larger, force $50$ times larger"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-prensa-razon-de-areas';

update public.techniques
set nombre_en = 'Narrow pipe, fast water',
    descripcion_en = 'If the area halves, the speed doubles (A·v stays the same).',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Through a full pipe, the same amount of water passes every second everywhere: the **flow rate** $Q = A \\cdot v$ is constant.","So $A_1 v_1 = A_2 v_2$: where the pipe narrows, the water moves faster.","If the area drops to half, the speed doubles; if it drops to a third, it triples.","It's what you do when you cover the end of a hose with your finger."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Water moves at $1{,}5$ m/s and the pipe narrows to a quarter of the area. How fast does it move there?","opciones":["6 m/s","0.375 m/s","1.5 m/s","3 m/s"],"respuesta":"6 m/s","explicacion":"$1{,}5 \\cdot 4 = 6$ m/s."},{"pregunta":"A $0{,}02\\ \\text{m}^2$ pipe carries water at $3$ m/s. What is the flow rate?","opciones":["0.06 m³/s","150 m³/s","0.0067 m³/s","3.02 m³/s"],"respuesta":"0.06 m³/s","explicacion":"$Q = A \\cdot v = 0{,}02 \\cdot 3 = 0{,}06\\ \\text{m}^3/\\text{s}$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.tubo","modo":"continuidad","v1":2,"k":3,"titulo":"Area to a third: speed times three"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-cano-angosto';

update public.techniques
set nombre_en = 'Position, distance and velocity',
    descripcion_en = 'Reference frame, displacement and average velocity.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["To describe a motion, you first choose a **reference frame**: a zero point and a positive direction. The **position** $x$ is where the object is relative to that zero.","**Displacement** is the change in position: $\\Delta x = x_f - x_i$. It can be negative (if it went backward) or zero (if it came back to the same place).","**Distance traveled** is the whole path covered, always positive. If you walk $30$ m forward and $10$ m back, the displacement is $20$ m, but the distance is $40$ m.","**Average velocity** is the displacement divided by the time: $v_m = \\dfrac{\\Delta x}{\\Delta t}$. If a car goes from $x = 50$ m to $x = 350$ m in $20$ s, $v_m = \\dfrac{300}{20} = 15$ m/s."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"You walk $50$ m north and come back $20$ m. What is your displacement?","opciones":["30 m north","70 m north","20 m south","50 m north"],"respuesta":"30 m north","explicacion":"$\\Delta x = 50 - 20 = 30$ m north. The distance traveled, though, is $70$ m."},{"pregunta":"A runner does a full lap of a $400$ m track and finishes where they started. What is their displacement?","opciones":["0 m","400 m","200 m","800 m"],"respuesta":"0 m","explicacion":"They finished at the same position: $\\Delta x = 0$."},{"pregunta":"A train goes from $x = 2$ km to $x = 14$ km in $10$ min. What is its average velocity in m/s?","opciones":["20 m/s","1.2 m/s","72 m/s","120 m/s"],"respuesta":"20 m/s","explicacion":"$\\Delta x = 12\\,000$ m and $\\Delta t = 600$ s: $\\dfrac{12\\,000}{600} = 20$ m/s."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.trayecto","v0":5,"a":0,"segundos":4,"titulo":"Every second, the same displacement: $5$ m"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-posicion-y-velocidad';

update public.techniques
set nombre_en = 'Uniform linear motion',
    descripcion_en = 'd = v·t, x-t and v-t graphs, and meeting points.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["In **uniform linear motion** the velocity is constant: the object covers equal distances in equal times. Its position is $x = x_0 + v \\cdot t$.","In the $x$-$t$ graph it's a **straight line**, and its slope is the velocity. In the $v$-$t$ graph it's a **flat line**, and the area under it is the distance covered.","**Meeting points**: two cars $72$ m apart move toward each other at $7$ and $11$ m/s. They close in at $7 + 11 = 18$ m/s, so they meet after $\\dfrac{72}{18} = 4$ s.","If they move in the same direction, the one behind catches up with the one ahead at the **difference** of their speeds."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A car starts from $x_0 = 20$ m at a constant $15$ m/s. Where is it at $6$ s?","opciones":["110 m","90 m","35 m","120 m"],"respuesta":"110 m","explicacion":"$x = 20 + 15 \\cdot 6 = 110$ m."},{"pregunta":"Two cyclists $90$ m apart ride toward each other at $4$ and $5$ m/s. After how many seconds do they meet?","opciones":["10 s","90 s","18 s","22.5 s"],"respuesta":"10 s","explicacion":"They close in at $9$ m/s: $\\dfrac{90}{9} = 10$ s."},{"pregunta":"In the $v$-$t$ graph of uniform motion, what does the area under the line represent?","opciones":["The distance traveled","The acceleration","The time","The velocity"],"respuesta":"The distance traveled","explicacion":"It's velocity times time, which gives distance."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.trayecto","v0":10,"a":0,"segundos":3,"titulo":"Uniform motion: equally spaced marks"},{"tipo":"dinamia.grafica","eje":"x-t","v0":10,"a":0,"segundos":4,"x0":5,"titulo":"A straight line in $x$-$t$: slope $= 10$ m/s"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-mru';

update public.techniques
set nombre_en = 'Acceleration and uniformly accelerated motion',
    descripcion_en = 'The three equations, when to use each one, and braking.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Acceleration** is how much the velocity changes per second: $a = \\dfrac{\\Delta v}{\\Delta t}$. If a car goes from $0$ to $20$ m/s in $5$ s, $a = 4\\ \\text{m/s}^2$.","In **uniformly accelerated motion** (constant acceleration) there are three equations: (1) $v = v_0 + a t$; (2) $x = v_0 t + \\tfrac{1}{2} a t^2$; (3) $v^2 = v_0^2 + 2 a x$.","Pick the one that **doesn't** have the piece of data you're missing: if you aren't given the time, use (3).","**Braking**: a car at $25$ m/s brakes with $a = -5\\ \\text{m/s}^2$. It stops when $v = 0$: $t = \\dfrac{25}{5} = 5$ s, and it covers $x = \\dfrac{25^2}{2 \\cdot 5} = 62{,}5$ m."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A motorcycle starts from rest with $a = 3\\ \\text{m/s}^2$. How fast is it going at $4$ s?","opciones":["12 m/s","24 m/s","7 m/s","48 m/s"],"respuesta":"12 m/s","explicacion":"$v = 0 + 3 \\cdot 4 = 12$ m/s."},{"pregunta":"How many meters did that motorcycle cover in those $4$ s?","opciones":["24 m","12 m","48 m","6 m"],"respuesta":"24 m","explicacion":"$x = \\tfrac{1}{2} \\cdot 3 \\cdot 16 = 24$ m."},{"pregunta":"A car at $20$ m/s brakes at $4\\ \\text{m/s}^2$. How many meters does it need to stop?","opciones":["50 m","5 m","80 m","100 m"],"respuesta":"50 m","explicacion":"Without the time, use $v^2 = v_0^2 + 2ax$: $0 = 400 - 8x$, $x = 50$ m."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.trayecto","v0":12,"a":-3,"segundos":4,"titulo":"Braking: the marks get closer until it stops"},{"tipo":"dinamia.grafica","eje":"v-t","v0":10,"a":-2,"segundos":5,"titulo":"In $v$-$t$ it's a straight line; the area is what it covered"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-mrua';

update public.techniques
set nombre_en = 'Free fall and vertical throws',
    descripcion_en = 'Maximum height, flight time and why it takes as long to go up as to come down.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Without air, everything falls with the same acceleration $g \\approx 9{,}8\\ \\text{m/s}^2$ (we use $10$ for quick calculations), whether it's a feather or a hammer.","If you throw something up at $v_0$, gravity takes away $10$ m/s every second: it takes $t = \\dfrac{v_0}{g}$ to stop at the top.","The **maximum height** is $h = \\dfrac{v_0^2}{2g}$. Thrown at $20$ m/s: it rises for $2$ s and reaches $\\dfrac{400}{20} = 20$ m.","Coming down is going up in reverse: it takes the same time ($2$ s) and returns to your hand at $20$ m/s. The total flight time is $\\dfrac{2 v_0}{g} = 4$ s."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"You throw a ball up at $30$ m/s. How long does it take to reach the top? ($g = 10$)","opciones":["3 s","6 s","30 s","0.3 s"],"respuesta":"3 s","explicacion":"$t = \\dfrac{30}{10} = 3$ s."},{"pregunta":"What maximum height does it reach?","opciones":["45 m","90 m","30 m","300 m"],"respuesta":"45 m","explicacion":"$h = \\dfrac{30^2}{20} = 45$ m."},{"pregunta":"At the highest point, what are its velocity and its acceleration?","opciones":["v = 0 and a = g downward","v = 0 and a = 0","v = g and a = 0","v = 30 m/s and a = g"],"respuesta":"v = 0 and a = g downward","explicacion":"It stops for an instant, but gravity never stops acting."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.caida","g":10,"v0":20,"segundos":4,"titulo":"It goes up, stops for an instant at the top and comes down"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-caida-libre';

update public.techniques
set nombre_en = 'Projectile motion',
    descripcion_en = 'Two motions at once: uniform in x and accelerated in y; maximum range at 45°.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["A projectile launched at an angle does **two independent motions**: horizontally it moves at constant velocity $v_x = v_0 \\cos\\theta$; vertically it's a vertical throw with $v_y = v_0 \\sin\\theta$.","The flight time comes from the $y$ axis: $T = \\dfrac{2 v_y}{g}$. The range comes from the $x$ axis: $R = v_x \\cdot T$.","Example at $20$ m/s and $45^\\circ$: $v_x = v_y \\approx 14{,}2$ m/s; $T \\approx 2{,}84$ s; $R \\approx 40{,}3$ m.","For the same speed, the greatest range is reached at $45^\\circ$. And complementary angles ($30^\\circ$ and $60^\\circ$) go just as far."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"In projectile motion (without air), which component of the velocity doesn't change?","opciones":["The horizontal one","The vertical one","Both","Neither"],"respuesta":"The horizontal one","explicacion":"There's no acceleration in $x$; gravity only changes $v_y$."},{"pregunta":"A ball leaves with $v_x = 10$ m/s and $v_y = 15$ m/s. How long is it in the air? ($g = 10$)","opciones":["3 s","1.5 s","2 s","2.5 s"],"respuesta":"3 s","explicacion":"$T = \\dfrac{2 \\cdot 15}{10} = 3$ s."},{"pregunta":"What is that ball's range?","opciones":["30 m","45 m","15 m","25 m"],"respuesta":"30 m","explicacion":"$R = v_x \\cdot T = 10 \\cdot 3 = 30$ m."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.parabola","v0":20,"angulo":45,"titulo":"$v_x$ doesn't change; $v_y$ shrinks, is zero at the top and grows on the way down"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-tiro-parabolico';

update public.techniques
set nombre_en = 'Scalars and vectors',
    descripcion_en = 'Magnitude, direction and sense; vectors along a line.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["A **scalar** quantity is fully given by a number and its unit: mass ($5$ kg), time ($3$ s), temperature, energy.","A **vector** quantity also needs where it points: **magnitude** (how much), **direction** (the line) and **sense** (which way along it). Force, velocity, displacement and acceleration are vectors.","Along the same line, vectors are added with signs: $10$ N to the right and $13$ N to the left give $10 - 13 = -3$ N, that is, $3$ N to the left.","That's why \"I'm going $60$ km/h\" is speed (a scalar), but \"I'm going $60$ km/h north\" is velocity (a vector)."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which of these quantities is a vector?","opciones":["Force","Mass","Temperature","Time"],"respuesta":"Force","explicacion":"A force needs magnitude, direction and sense."},{"pregunta":"A box is pulled with $8$ N to the right and $15$ N to the left. What is the resultant? (right is positive)","opciones":["-7 N","7 N","23 N","-23 N"],"respuesta":"-7 N","explicacion":"$8 - 15 = -7$ N: $7$ N to the left."},{"pregunta":"Which three pieces of information define a vector?","opciones":["Magnitude, direction and sense","Mass, time and unit","Origin, color and length","Only the magnitude"],"respuesta":"Magnitude, direction and sense","explicacion":"How much, along which line and toward which side."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.vectores","modo":"suma","vectores":[{"nombre":"A","x":6,"y":0},{"nombre":"B","x":-9,"y":0}],"titulo":"Along a line: $6 + (-9) = -3$"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-escalares-y-vectores';

update public.techniques
set nombre_en = 'Adding vectors',
    descripcion_en = 'Tip to tail and the parallelogram.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["To add vectors with a drawing, put the **tail** of the second one at the **tip** of the first. The resultant goes from the tail of the first to the tip of the last.","The **parallelogram rule** is the same thing: with both vectors starting at the same point, the resultant is the diagonal of the parallelogram they form.","With numbers, you add the components: $A = (3, 0)$ and $B = (0, 4)$ give $R = (3, 4)$, with magnitude $5$.","The order doesn't matter: $A + B = B + A$. And the resultant is never more than the sum of the magnitudes nor less than their difference."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Add $A = (-2, 5)$ and $B = (7, 7)$. What is the resultant?","opciones":["(5, 12)","(9, 2)","(5, 2)","(-9, 12)"],"respuesta":"(5, 12)","explicacion":"$x$: $-2 + 7 = 5$; $y$: $5 + 7 = 12$."},{"pregunta":"What is the magnitude of that resultant $(5, 12)$?","opciones":["13","17","7","60"],"respuesta":"13","explicacion":"$\\sqrt{25 + 144} = \\sqrt{169} = 13$."},{"pregunta":"Two forces of $6$ N and $8$ N act on a point. Which resultant is impossible?","opciones":["15 N","2 N","10 N","14 N"],"respuesta":"15 N","explicacion":"The resultant is between $8 - 6 = 2$ and $8 + 6 = 14$ N."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.vectores","modo":"suma","vectores":[{"nombre":"A","x":4,"y":1},{"nombre":"B","x":2,"y":7}],"titulo":"Tip to tail: $R = (6, 8)$"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-sumar-vectores';

update public.techniques
set nombre_en = 'Components',
    descripcion_en = 'Breaking down and putting back together with sine and cosine.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["A vector of magnitude $F$ at an angle $\\theta$ from the $x$ axis **breaks down** into $F_x = F \\cos\\theta$ and $F_y = F \\sin\\theta$.","Example: $F = 20$ N at $30^\\circ$: $F_x = 20 \\cdot 0{,}87 = 17{,}4$ N and $F_y = 20 \\cdot 0{,}5 = 10$ N.","To **put it back together**, Pythagoras: $F = \\sqrt{F_x^2 + F_y^2}$. With $(17{,}4;\\ 10)$ you get about $20$ N again.","The signs tell you the quadrant: a negative $x$ component points left; a negative $y$ one, down."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A $50$ N force makes $60^\\circ$ with the $x$ axis. What is $F_y$? ($\\sin 60^\\circ \\approx 0{,}87$)","opciones":["43.5 N","25 N","50 N","86.6 N"],"respuesta":"43.5 N","explicacion":"$F_y = 50 \\cdot 0{,}87 = 43{,}5$ N."},{"pregunta":"A vector has components $(-8, 6)$. Where does it point?","opciones":["Up and to the left","Down and to the right","Up and to the right","Down and to the left"],"respuesta":"Up and to the left","explicacion":"Negative $x$: left; positive $y$: up."},{"pregunta":"What is the magnitude of the vector $(-8, 6)$?","opciones":["10","14","-2","100"],"respuesta":"10","explicacion":"$\\sqrt{64 + 36} = 10$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.vectores","modo":"componentes","vectores":[{"nombre":"F","x":8,"y":6}],"titulo":"The vector is the sum of its two components"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-componentes';

update public.techniques
set nombre_en = 'Angle of the resultant and dot product',
    descripcion_en = 'Arctangent, and when two vectors are perpendicular.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The **angle** of a vector $(x, y)$ with the $x$ axis satisfies $\\tan\\theta = \\dfrac{y}{x}$. For $(1, 1)$, $\\tan\\theta = 1$ and $\\theta = 45^\\circ$.","Watch the quadrant: $(-1, -1)$ also gives $\\tan\\theta = 1$, but it points at $225^\\circ$. Look at the signs before giving the angle.","The **dot product** is $A \\cdot B = A_x B_x + A_y B_y$. It gives a number (not a vector) and tells how much they point the same way.","If $A \\cdot B = 0$, the vectors are **perpendicular**. Example: $(3, 4) \\cdot (-4, 3) = -12 + 12 = 0$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What is $A \\cdot B$ with $A = (5, 6)$ and $B = (-4, -1)$?","opciones":["-26","-14","26","(-20, -6)"],"respuesta":"-26","explicacion":"$5 \\cdot (-4) + 6 \\cdot (-1) = -20 - 6 = -26$."},{"pregunta":"Which of these vectors is perpendicular to $(2, 3)$?","opciones":["(3, -2)","(2, 3)","(-2, -3)","(3, 2)"],"respuesta":"(3, -2)","explicacion":"$2 \\cdot 3 + 3 \\cdot (-2) = 0$."},{"pregunta":"What angle does the vector $(4, 4)$ make with the $x$ axis?","opciones":["45°","90°","30°","60°"],"respuesta":"45°","explicacion":"$\\tan\\theta = \\dfrac{4}{4} = 1$, and it's in the first quadrant."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.vectores","modo":"suma","vectores":[{"nombre":"A","x":3,"y":4},{"nombre":"B","x":-4,"y":3}],"titulo":"$A \\cdot B = 0$: they form a right angle"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-angulo-y-producto-escalar';

update public.techniques
set nombre_en = 'Force and the first law',
    descripcion_en = 'Inertia: with no net force, nothing changes.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["A **force** is a push or a pull; it's measured in newtons (N). What matters is the **net force**: the sum of all the forces.","**First law (inertia)**: if the net force is zero, a body at rest stays at rest and one that's moving keeps going in a straight line at constant velocity.","That's why, if the bus brakes suddenly, your body keeps going forward: nothing has stopped it yet.","Careful: \"it's moving\" doesn't mean \"there's a force\". A spaceship can go incredibly fast with zero net force."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A hockey puck slides on perfect ice, without friction. What does it do?","opciones":["It keeps going straight at the same speed","It slows down until it stops","It speeds up","It spins in circles"],"respuesta":"It keeps going straight at the same speed","explicacion":"With no net force, the velocity doesn't change (inertia)."},{"pregunta":"A car moves at a constant $80$ km/h on a straight road. What is the net force on it?","opciones":["Zero","Forward","Backward","Equal to its weight"],"respuesta":"Zero","explicacion":"Constant velocity in a straight line: the engine and the friction forces balance out."},{"pregunta":"Which law explains that the tablecloth comes out and the dishes stay on the table?","opciones":["First law (inertia)","Second law","Third law","Hooke's law"],"respuesta":"First law (inertia)","explicacion":"The plates tend to stay at rest if they get almost no force."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.cuerpoLibre","situacion":"piso","masa":5,"titulo":"Weight and normal cancel out: zero net force, it stays at rest"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-primera-ley';

update public.techniques
set nombre_en = 'Second law: F = m·a',
    descripcion_en = 'Net force, units and solving for each variable.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Second law**: the net force produces an acceleration in its same direction: $F_{\\text{net}} = m \\cdot a$.","A newton is the force that gives $1\\ \\text{m/s}^2$ to $1$ kg: $1\\ \\text{N} = 1\\ \\text{kg} \\cdot \\text{m/s}^2$.","Solving for each one: $a = \\dfrac{F}{m}$ and $m = \\dfrac{F}{a}$. With the same force, twice the mass accelerates half as much.","Example: you push a $10$ kg box with $50$ N and friction is $20$ N. The net force is $30$ N and $a = \\dfrac{30}{10} = 3\\ \\text{m/s}^2$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What net force does a $150$ kg motorcycle need to accelerate at $2\\ \\text{m/s}^2$?","opciones":["300 N","75 N","152 N","1500 N"],"respuesta":"300 N","explicacion":"$F = 150 \\cdot 2 = 300$ N."},{"pregunta":"You push a $40$ kg cart with $100$ N and friction is $20$ N. What is its acceleration?","opciones":["2 m/s²","2.5 m/s²","3 m/s²","0.5 m/s²"],"respuesta":"2 m/s²","explicacion":"Net force $= 80$ N; $a = \\dfrac{80}{40} = 2\\ \\text{m/s}^2$."},{"pregunta":"With the same force, you push a body with twice the mass. What happens to the acceleration?","opciones":["It's cut in half","It doubles","It doesn't change","It becomes zero"],"respuesta":"It's cut in half","explicacion":"$a = \\dfrac{F}{m}$: twice the mass, half the acceleration."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.cuerpoLibre","situacion":"empujado","masa":10,"empuje":50,"mu":0.2,"titulo":"Net force $= 50 - 20 = 30$ N, $a = 3\\ \\text{m/s}^2$"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-segunda-ley';

update public.techniques
set nombre_en = 'Third law and the normal force',
    descripcion_en = 'Action and reaction on different bodies; why the normal isn''t always equal to the weight.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Third law**: if A pushes B, B pushes A with the same force in the opposite direction. When you row, you push the water back and the water pushes you forward.","The two forces act on **different bodies**, which is why they don't cancel each other.","The **normal** is the force with which a surface pushes on whatever rests on it, perpendicular to the surface. It is **not** the reaction to the weight: the reaction to the weight is the Earth being pulled by the body.","The normal only equals the weight on a horizontal floor with no other vertical forces. On a ramp it's $m g \\cos\\theta$; if someone pushes down, it's greater than the weight."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A rocket expels gases downward. What makes it go up?","opciones":["The gases push it upward","The air below","Its weight","The normal force"],"respuesta":"The gases push it upward","explicacion":"Action and reaction: the rocket pushes the gases and the gases push the rocket."},{"pregunta":"Why are a book's weight and the table's normal force NOT an action-reaction pair?","opciones":["They act on the same body","They aren't the same size","They point the same way","One is bigger"],"respuesta":"They act on the same body","explicacion":"An action-reaction pair acts on different bodies."},{"pregunta":"A $10$ kg block on a $60^\\circ$ ramp. What is the normal force? ($\\cos 60^\\circ = 0{,}5$)","opciones":["50 N","100 N","87 N","10 N"],"respuesta":"50 N","explicacion":"$N = m g \\cos\\theta = 10 \\cdot 10 \\cdot 0{,}5 = 50$ N."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.cuerpoLibre","situacion":"plano","masa":4,"angulo":30,"titulo":"On the ramp, the normal is smaller than the weight: $40 \\cdot 0{,}87 = 34{,}8$ N"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-tercera-ley-y-normal';

update public.techniques
set nombre_en = 'Friction',
    descripcion_en = 'Static and kinetic, the coefficient μ and when it starts to move.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Friction** appears between surfaces in contact and opposes their sliding. It depends on the normal force and on a coefficient $\\mu$ (with no units).","**Static**: while the body isn't moving, friction matches your push, up to a maximum of $\\mu_e N$. If you push harder than that, it starts to move.","**Kinetic**: once it slides, friction is $\\mu_c N$, which is usually a bit smaller. That's why it's harder to get a piece of furniture moving than to keep it moving.","Example: a $20$ kg box with $\\mu_c = 0{,}25$ on a horizontal floor: $N = 200$ N and friction is $0{,}25 \\cdot 200 = 50$ N."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A $30$ kg box slides with $\\mu_c = 0{,}2$. What is the friction force?","opciones":["60 N","6 N","150 N","300 N"],"respuesta":"60 N","explicacion":"$N = 300$ N; $0{,}2 \\cdot 300 = 60$ N."},{"pregunta":"A piece of furniture has a maximum static friction of $120$ N. You push it with $90$ N. How much friction acts?","opciones":["90 N","120 N","30 N","0 N"],"respuesta":"90 N","explicacion":"As long as it doesn't move, static friction matches your push."},{"pregunta":"Why is it harder to get a piece of furniture moving than to keep it moving?","opciones":["Maximum static friction is greater than kinetic friction","The mass increases","The normal drops when it moves","The weight changes"],"respuesta":"Maximum static friction is greater than kinetic friction","explicacion":"Usually $\\mu_e > \\mu_c$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.cuerpoLibre","situacion":"empujado","masa":20,"empuje":80,"mu":0.25,"titulo":"Friction $= \\mu N = 50$ N, against the motion"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-rozamiento';

update public.techniques
set nombre_en = 'Inclined planes and pulleys',
    descripcion_en = 'Two-body problems, step by step.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Recipe for problems with several bodies: (1) a free-body diagram for each one; (2) axes along the motion; (3) $F = m a$ for each body; (4) solve the system.","**Atwood machine** ($m_1 = 3$ kg and $m_2 = 2$ kg hanging from a pulley): the heavier one wins. $a = \\dfrac{(3 - 2) \\cdot 10}{5} = 2\\ \\text{m/s}^2$.","The tension comes from either one: for $m_2$, $T - 20 = 2 \\cdot 2$, so $T = 24$ N. It's between the two weights, as it should be.","On a frictionless **inclined plane**, what pulls down the ramp is $m g \\sin\\theta$: a $4$ kg block at $30^\\circ$ feels $20$ N and accelerates at $5\\ \\text{m/s}^2$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"On an Atwood machine hang $6$ kg and $4$ kg. What is their acceleration? ($g = 10$)","opciones":["2 m/s²","10 m/s²","5 m/s²","1 m/s²"],"respuesta":"2 m/s²","explicacion":"$a = \\dfrac{(6 - 4) \\cdot 10}{10} = 2\\ \\text{m/s}^2$."},{"pregunta":"What is the tension in the rope of that Atwood machine?","opciones":["48 N","40 N","60 N","20 N"],"respuesta":"48 N","explicacion":"For the $4$ kg one: $T - 40 = 4 \\cdot 2$, so $T = 48$ N."},{"pregunta":"A $10$ kg block on a frictionless $30^\\circ$ plane. What is its acceleration?","opciones":["5 m/s²","10 m/s²","8.7 m/s²","50 m/s²"],"respuesta":"5 m/s²","explicacion":"$a = g \\sin 30^\\circ = 10 \\cdot 0{,}5 = 5\\ \\text{m/s}^2$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.poleas","m1":3,"m2":2,"titulo":"Atwood: $a = 2\\ \\text{m/s}^2$ and $T = 24$ N"},{"tipo":"dinamia.cuerpoLibre","situacion":"plano","masa":4,"angulo":30,"titulo":"A frictionless $30^\\circ$ plane"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-plano-y-poleas';

update public.techniques
set nombre_en = 'Circular motion and gravitation',
    descripcion_en = 'Centripetal force and the law of universal gravitation.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["In a circle, even if the speed is constant, the **direction** of the velocity changes all the time: there's an acceleration toward the center, $a_c = \\dfrac{v^2}{r}$.","That acceleration needs a force toward the center, the **centripetal** force: $F_c = \\dfrac{m v^2}{r}$. It can come from a rope, from the friction of the tires or from gravity.","If the force disappears (the rope is cut), the object keeps going in a straight line along the **tangent**.","**Universal gravitation**: two masses attract each other with $F = G \\dfrac{m_1 m_2}{d^2}$. If the distance doubles, the force drops to a quarter. It's the centripetal force that keeps the Moon going around."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A $0{,}5$ kg stone spins on a $1$ m rope at $4$ m/s. What force does the rope exert?","opciones":["8 N","2 N","4 N","16 N"],"respuesta":"8 N","explicacion":"$F_c = \\dfrac{0{,}5 \\cdot 16}{1} = 8$ N."},{"pregunta":"If the rope is cut, which way does the stone fly off?","opciones":["In a straight line along the tangent","Toward the center","Outward, in line with the rope","It keeps spinning"],"respuesta":"In a straight line along the tangent","explicacion":"With no force toward the center, it keeps the velocity it had, which is tangent."},{"pregunta":"If the distance between two planets triples, what happens to the force of gravity between them?","opciones":["It's divided by 9","It's divided by 3","It triples","It doesn't change"],"respuesta":"It's divided by 9","explicacion":"It depends on $\\dfrac{1}{d^2}$: $3^2 = 9$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.circular","masa":2,"radio":4,"v":6,"titulo":"$F_c = \\dfrac{2 \\cdot 36}{4} = 18$ N toward the center"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-circular-y-gravitacion';

update public.techniques
set nombre_en = 'Work and power',
    descripcion_en = 'W = F·d·cos θ, P = W/t, and the kWh.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["A force does **work** when it moves something: $W = F \\cdot d \\cdot \\cos\\theta$, in joules (J). Only the part of the force along the direction of motion counts.","Example: you drag a box $5$ m with a $40$ N rope at $60^\\circ$ from the floor: $W = 40 \\cdot 5 \\cdot 0{,}5 = 100$ J.","**Power** is how fast the work is done: $P = \\dfrac{W}{t}$, in watts (W). Running up the stairs takes the same work but more power.","The **kilowatt-hour** (kWh) is energy, not power: what a $1000$ W appliance uses in one hour. $1\\ \\text{kWh} = 3{,}6$ million J."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"You push a cart $10$ m with $30$ N in the direction of motion. How much work do you do?","opciones":["300 J","3 J","40 J","30 J"],"respuesta":"300 J","explicacion":"$W = 30 \\cdot 10 = 300$ J."},{"pregunta":"A motor does $1200$ J in $4$ s. What is its power?","opciones":["300 W","4800 W","1200 W","1196 W"],"respuesta":"300 W","explicacion":"$P = \\dfrac{1200}{4} = 300$ W."},{"pregunta":"A $2000$ W heater is on for $3$ hours. How much energy does it use?","opciones":["6 kWh","667 kWh","2 kWh","6000 kWh"],"respuesta":"6 kWh","explicacion":"$2\\ \\text{kW} \\cdot 3\\ \\text{h} = 6$ kWh."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.cuerpoLibre","situacion":"empujado","masa":10,"empuje":40,"titulo":"Only the push does work: weight and normal are perpendicular"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-trabajo-y-potencia';

update public.techniques
set nombre_en = 'Kinetic and potential energy',
    descripcion_en = 'Where the formulas come from and what they mean.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Energy** is the ability to do work. A moving body has it: **kinetic** energy, $E_c = \\tfrac{1}{2} m v^2$.","The speed is squared: going twice as fast means having **four times** the energy. That's why stopping from $100$ km/h is much harder than from $50$.","A body up high has **gravitational potential** energy, $E_p = m g h$: it's the work it took to lift it.","Example: a bike with its rider ($80$ kg) at $5$ m/s has $E_c = \\tfrac{1}{2} \\cdot 80 \\cdot 25 = 1000$ J; lifted onto a $2$ m wall it would have $E_p = 80 \\cdot 10 \\cdot 2 = 1600$ J."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"How much kinetic energy does a $0{,}4$ kg ball at $10$ m/s have?","opciones":["20 J","4 J","40 J","2 J"],"respuesta":"20 J","explicacion":"$\\tfrac{1}{2} \\cdot 0{,}4 \\cdot 100 = 20$ J."},{"pregunta":"If a car goes from $10$ to $20$ m/s, how many times does its kinetic energy increase?","opciones":["4 times","2 times","10 times","It doesn't change"],"respuesta":"4 times","explicacion":"$E_c$ goes with $v^2$: $2^2 = 4$."},{"pregunta":"How much potential energy does a $5$ kg backpack gain when lifted $3$ m?","opciones":["150 J","15 J","50 J","1.5 J"],"respuesta":"150 J","explicacion":"$E_p = 5 \\cdot 10 \\cdot 3 = 150$ J."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.energia","masa":2,"altura":5,"titulo":"At the top it's all potential; at the bottom, all kinetic"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-cinetica-y-potencial';

update public.techniques
set nombre_en = 'Conservation of energy',
    descripcion_en = 'Slides, pendulums and roller coasters without friction.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Without friction, **mechanical energy** ($E_c + E_p$) is conserved: what one loses, the other gains.","On a roller coaster that starts at rest $20$ m up, at the top there's only potential energy; at the lowest point, only kinetic.","To know the speed at any point, set the energies equal: $m g h_1 = m g h_2 + \\tfrac{1}{2} m v^2$, that is, $v = \\sqrt{2 g (h_1 - h_2)}$.","Example: from $20$ m, when it passes a point at $15$ m it's going $\\sqrt{2 \\cdot 10 \\cdot 5} = 10$ m/s. It can never go higher than where it started."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A pendulum is released from $0{,}8$ m above its lowest point. How fast does it pass through the bottom?","opciones":["4 m/s","16 m/s","8 m/s","2 m/s"],"respuesta":"4 m/s","explicacion":"$v = \\sqrt{2 \\cdot 10 \\cdot 0{,}8} = \\sqrt{16} = 4$ m/s."},{"pregunta":"A cart starts at rest $30$ m up, without friction. Can it go over a $35$ m hill?","opciones":["No, it never goes above its starting height","Yes, if it's fast","Yes, if it's light","It depends on the shape of the track"],"respuesta":"No, it never goes above its starting height","explicacion":"Its total energy is that of a $30$ m height."},{"pregunta":"A $1$ kg ball falls from $5$ m. How much kinetic energy does it have just before hitting the floor?","opciones":["50 J","5 J","500 J","25 J"],"respuesta":"50 J","explicacion":"All the potential energy became kinetic: $1 \\cdot 10 \\cdot 5 = 50$ J."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.energia","masa":2,"altura":20,"titulo":"The bars pass energy back and forth; the sum doesn't change"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-conservacion-energia';

update public.techniques
set nombre_en = 'Friction, heat and efficiency',
    descripcion_en = 'Where the energy that "gets lost" goes.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["With friction, mechanical energy is **not** conserved: part of it turns into **heat** (that's why brakes get hot). But total energy is conserved.","Balance: $E_{\\text{initial}} = E_{\\text{final}} + \\text{heat}$. A $10$ kg sled goes down from $5$ m ($500$ J) and reaches the bottom at $8$ m/s ($320$ J): $180$ J went into heat.","The heat friction generates is its work: $Q = f \\cdot d$.","The **efficiency** of a machine is the useful part: $\\eta = \\dfrac{E_{\\text{useful}}}{E_{\\text{in}}} \\cdot 100\\ \\%$. A car engine is around $30\\ \\%$; an electric one, around $90\\ \\%$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A $20$ kg sled goes down from $10$ m and reaches the bottom at $10$ m/s. How much energy turned into heat?","opciones":["1000 J","2000 J","1500 J","0 J"],"respuesta":"1000 J","explicacion":"$E_p = 2000$ J; $E_c = \\tfrac{1}{2} \\cdot 20 \\cdot 100 = 1000$ J; heat $= 1000$ J."},{"pregunta":"A $15$ N friction force acts over $8$ m. How much heat does it generate?","opciones":["120 J","23 J","1.9 J","7 J"],"respuesta":"120 J","explicacion":"$Q = f \\cdot d = 15 \\cdot 8 = 120$ J."},{"pregunta":"A motor receives $2000$ J and loses $1400$ J as heat. What is its efficiency?","opciones":["30 %","70 %","60 %","14 %"],"respuesta":"30 %","explicacion":"Useful $= 600$ J; $\\dfrac{600}{2000} = 30\\ \\%$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.energia","masa":1,"altura":20,"perdida":0.3,"titulo":"The heat bar grows: what's missing doesn't disappear"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-rozamiento-calor-rendimiento';

update public.techniques
set nombre_en = 'Springs and momentum',
    descripcion_en = 'Hooke''s law, impulse and collisions.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Hooke's law**: a spring stretched or compressed by $x$ exerts a force $F = k x$ ($k$ is its spring constant, in N/m). It stores energy $E = \\tfrac{1}{2} k x^2$.","**Momentum** is $p = m v$. The **impulse** of a force is $F \\cdot \\Delta t$ and it equals the change in $p$: that's why airbags make the crash last longer and lower the force.","In a **collision** with no outside forces, total $p$ is conserved. If they stick together (perfectly inelastic): $v_f = \\dfrac{m_1 v_1 + m_2 v_2}{m_1 + m_2}$.","In an **elastic** collision, kinetic energy is conserved too. With equal masses, the velocities swap: the incoming one stops and the other one moves off."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A spring with $k = 200$ N/m is compressed $0{,}1$ m. What force does it exert?","opciones":["20 N","2000 N","200 N","1 N"],"respuesta":"20 N","explicacion":"$F = k x = 200 \\cdot 0{,}1 = 20$ N."},{"pregunta":"A $1000$ kg railcar at $3$ m/s couples onto a $500$ kg railcar at rest. How fast do they keep going?","opciones":["2 m/s","3 m/s","1.5 m/s","1 m/s"],"respuesta":"2 m/s","explicacion":"$v_f = \\dfrac{3000}{1500} = 2$ m/s."},{"pregunta":"Why does an airbag reduce the force of the impact?","opciones":["It makes the stopping take longer","It reduces the mass","It eliminates the momentum","It increases the speed"],"respuesta":"It makes the stopping take longer","explicacion":"The change in $p$ is the same; with more $\\Delta t$, the force is smaller."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.choque","m1":2,"v1":6,"m2":1,"v2":0,"clase":"plastico","titulo":"Perfectly inelastic: they stick together, the sum of $p$ doesn't change"},{"tipo":"dinamia.choque","m1":1,"v1":4,"m2":1,"v2":0,"clase":"elastico","titulo":"Elastic with equal masses: they swap velocities"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-resortes-y-choques';

update public.techniques
set nombre_en = 'Temperature and heat',
    descripcion_en = 'What each one measures, and the scales.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Temperature** measures how fast, on average, the particles of something are moving. **Heat** is energy that passes from a hot body to a cold one.","They aren't the same: a bathtub at $40\\ ^\\circ\\text{C}$ has more thermal energy than a cup at $90\\ ^\\circ\\text{C}$, even though the cup is hotter.","Heat always goes from the hotter to the colder one, until they're at the same temperature (**thermal equilibrium**).","Scales: $T_K = T_{^\\circ\\text{C}} + 273$ and $^\\circ\\text{F} = ^\\circ\\text{C} \\cdot \\tfrac{9}{5} + 32$. Physics uses kelvin because it starts at absolute zero."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"You put a cold spoon in hot soup. Which way does the heat go?","opciones":["From the soup to the spoon","From the spoon to the soup","Both ways equally","There's no heat"],"respuesta":"From the soup to the spoon","explicacion":"Heat goes from the hotter one to the colder one."},{"pregunta":"What does temperature measure?","opciones":["The average agitation of the particles","The total amount of energy","The heat a body has","The mass of the particles"],"respuesta":"The average agitation of the particles","explicacion":"That's why a cup can be hotter than a bathtub while having less total energy."},{"pregunta":"How many °F is $37\\ ^\\circ\\text{C}$?","opciones":["98.6 °F","310 °F","66.6 °F","104 °F"],"respuesta":"98.6 °F","explicacion":"$37 \\cdot 1{,}8 + 32 = 98{,}6$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.particulas","modo":"temperatura","valores":[200,300,450],"titulo":"Higher temperature, faster particles"},{"tipo":"dinamia.termometro","modo":"escalas","temperaturas":[0,37,100],"titulo":"The same temperature on three scales"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-temperatura-y-calor';

update public.techniques
set nombre_en = 'Specific heat',
    descripcion_en = 'Q = m·c·ΔT and why water takes a long time to heat up.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Heating something takes heat: $Q = m \\cdot c \\cdot \\Delta T$, with $c$ the **specific heat** (how much energy $1$ kg needs to rise $1\\ ^\\circ\\text{C}$).","Water has a very high $c$: $4180\\ \\text{J/(kg}\\cdot{}^\\circ\\text{C)}$. Iron, about $450$. That's why the sea takes a long time to warm up and softens the climate on the coast.","Example: heating $2$ kg of water from $20$ to $70\\ ^\\circ\\text{C}$ takes $Q = 2 \\cdot 4180 \\cdot 50 = 418\\,000$ J.","In mixtures, the heat the hot one gives off is what the cold one gains: $m_1 c_1 (T_1 - T_f) = m_2 c_2 (T_f - T_2)$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"How much heat does it take to raise $1$ kg of water from $10$ to $30\\ ^\\circ\\text{C}$? ($c = 4180$)","opciones":["83,600 J","4180 J","125,400 J","41,800 J"],"respuesta":"83,600 J","explicacion":"$Q = 1 \\cdot 4180 \\cdot 20 = 83\\,600$ J."},{"pregunta":"With the same heat, which gets hotter: $1$ kg of water or $1$ kg of iron?","opciones":["The iron","The water","Both the same","It depends on the container"],"respuesta":"The iron","explicacion":"Its specific heat is much lower: it needs less energy per degree."},{"pregunta":"You mix $1$ kg of water at $80\\ ^\\circ\\text{C}$ with $3$ kg at $20\\ ^\\circ\\text{C}$. Final temperature?","opciones":["35 °C","50 °C","65 °C","40 °C"],"respuesta":"35 °C","explicacion":"$\\dfrac{80 + 60}{4} = 35\\ ^\\circ\\text{C}$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.termometro","modo":"escalas","temperaturas":[20,45,70],"titulo":"Each degree of water costs $4180$ J per kilogram"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-calor-especifico';

update public.techniques
set nombre_en = 'Phase changes',
    descripcion_en = 'Latent heat and the heating curve.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["While a substance changes state (melts or boils), it takes in heat but **its temperature doesn't rise**: the energy is used to separate the particles.","That heat is **latent heat**: $Q = m \\cdot L$. Melting ice takes $L_f \\approx 334\\,000$ J/kg; evaporating water, $L_v \\approx 2\\,260\\,000$ J/kg.","In water's **heating curve** you can see two plateaus: at $0\\ ^\\circ\\text{C}$ (it melts) and at $100\\ ^\\circ\\text{C}$ (it boils).","That's why a steam burn is worse than one from boiling water: steam, as it condenses on your skin, also releases all its latent heat."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"While water boils at $100\\ ^\\circ\\text{C}$, you keep heating it. What happens to its temperature?","opciones":["It stays at 100 °C","It rises","It drops","It goes up and down"],"respuesta":"It stays at 100 °C","explicacion":"The heat is used to go from liquid to vapor."},{"pregunta":"How much heat does it take to melt $2$ kg of ice at $0\\ ^\\circ\\text{C}$? ($L_f = 334\\,000$ J/kg)","opciones":["668,000 J","334,000 J","167,000 J","8360 J"],"respuesta":"668,000 J","explicacion":"$Q = m L = 2 \\cdot 334\\,000$ J."},{"pregunta":"What is the heat used in a change of state called?","opciones":["Latent heat","Specific heat","Temperature","Sensible heat"],"respuesta":"Latent heat","explicacion":"\"Latent\" (hidden) because it doesn't show on the thermometer."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.termometro","modo":"calentamiento","titulo":"The plateaus: heat goes in, the temperature doesn't rise"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-cambios-de-fase';

update public.techniques
set nombre_en = 'Expansion and ideal gases',
    descripcion_en = 'The three gas laws and P·V = n·R·T.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["When heated, almost everything **expands**: train rails have gaps, and the mercury in a thermometer rises.","In gases it's much more noticeable. With the temperature always in **kelvin**: Boyle (fixed $T$) $P_1 V_1 = P_2 V_2$; Charles (fixed $P$) $\\dfrac{V_1}{T_1} = \\dfrac{V_2}{T_2}$; Gay-Lussac (fixed $V$) $\\dfrac{P_1}{T_1} = \\dfrac{P_2}{T_2}$.","All three together: $\\dfrac{P V}{T}$ is constant, and the **ideal gas law** says what it's worth: $P V = n R T$, with $n$ the moles and $R = 8{,}31\\ \\text{J/(mol·K)}$.","Example: an $8$ L balloon at $350$ K is heated to $525$ K with the pressure fixed: $V_2 = 8 \\cdot \\dfrac{525}{350} = 12$ L."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A gas is at $3$ atm in a rigid tank at $300$ K. If it's heated to $400$ K, what is its pressure?","opciones":["4 atm","2.25 atm","3 atm","400 atm"],"respuesta":"4 atm","explicacion":"Gay-Lussac: $P_2 = 3 \\cdot \\dfrac{400}{300} = 4$ atm."},{"pregunta":"Why are the gas laws used with kelvin and not with °C?","opciones":["Because they need a scale that starts at absolute zero","Out of habit","Because °C are bigger","It makes no difference"],"respuesta":"Because they need a scale that starts at absolute zero","explicacion":"With °C, at $0$ degrees the volume would be zero, which is absurd."},{"pregunta":"A gas takes up $10$ L at $1$ atm. At a fixed temperature, it's compressed to $2$ L. What is its pressure?","opciones":["5 atm","0.2 atm","20 atm","2 atm"],"respuesta":"5 atm","explicacion":"Boyle: $1 \\cdot 10 = P_2 \\cdot 2$, so $P_2 = 5$ atm."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.particulas","modo":"boyle","valores":[4,2,1],"inicial":1,"titulo":"Boyle: at half the volume, double the pressure"},{"tipo":"dinamia.particulas","modo":"charles","valores":[300,450,600],"inicial":2,"titulo":"Charles: the volume follows the temperature in kelvin"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-gases-ideales';

update public.techniques
set nombre_en = 'First law and heat engines',
    descripcion_en = 'ΔU = Q − W, cycles and Carnot efficiency.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**First law of thermodynamics**: the heat that goes into a gas is split between raising its internal energy and doing work: $\\Delta U = Q - W$.","A **heat engine** takes heat $Q_c$ from a hot reservoir, does work $W$ and dumps the rest $Q_f$ into a cold reservoir: $W = Q_c - Q_f$.","Its efficiency is $\\eta = \\dfrac{W}{Q_c}$. It never reaches $100\\ \\%$: some heat always has to be dumped into the cold reservoir (second law).","The maximum possible is **Carnot's**: $\\eta_{\\max} = 1 - \\dfrac{T_f}{T_c}$, in kelvin. Between $600$ K and $300$ K, at most $50\\ \\%$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A gas takes in $500$ J of heat and does $200$ J of work. How much does its internal energy change?","opciones":["300 J","700 J","-300 J","200 J"],"respuesta":"300 J","explicacion":"$\\Delta U = Q - W = 500 - 200 = 300$ J."},{"pregunta":"An engine takes $2000$ J from the hot reservoir and dumps $1500$ J into the cold one. What is its efficiency?","opciones":["25 %","75 %","33 %","50 %"],"respuesta":"25 %","explicacion":"$W = 500$ J; $\\dfrac{500}{2000} = 25\\ \\%$."},{"pregunta":"What is the maximum (Carnot) efficiency between $400$ K and $300$ K?","opciones":["25 %","75 %","100 %","33 %"],"respuesta":"25 %","explicacion":"$1 - \\dfrac{300}{400} = 0{,}25$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.ciclo","qc":1000,"w":300,"titulo":"The area of the cycle is the work; what's left over goes to the cold reservoir"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-primera-ley-maquinas';

update public.techniques
set nombre_en = 'Density and pressure',
    descripcion_en = 'ρ = m/V and P = F/A.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Density** tells how much mass there is in each cubic meter: $\\rho = \\dfrac{m}{V}$. Water: $1000\\ \\text{kg/m}^3$; oil, about $900$; iron, $7800$.","A $4000$ kg object that takes up $5\\ \\text{m}^3$ has $\\rho = 800\\ \\text{kg/m}^3$.","**Pressure** is force spread over an area: $P = \\dfrac{F}{A}$, in pascals ($1\\ \\text{Pa} = 1\\ \\text{N/m}^2$).","The same force on a smaller area makes more pressure: that's why a sharp knife cuts and snowshoes keep you from sinking."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A $54$ kg block takes up $0{,}02\\ \\text{m}^3$. What is its density?","opciones":["2700 kg/m³","1.08 kg/m³","540 kg/m³","27 kg/m³"],"respuesta":"2700 kg/m³","explicacion":"$\\dfrac{54}{0{,}02} = 2700\\ \\text{kg/m}^3$ (it's aluminum)."},{"pregunta":"A $600$ N box rests on $0{,}3\\ \\text{m}^2$. What pressure does it exert?","opciones":["2000 Pa","180 Pa","600 Pa","200 Pa"],"respuesta":"2000 Pa","explicacion":"$P = \\dfrac{600}{0{,}3} = 2000$ Pa."},{"pregunta":"Why does a sharp knife cut better than a dull one?","opciones":["The same force goes on a smaller area: more pressure","It weighs more","It has more density","It makes less pressure"],"respuesta":"The same force goes on a smaller area: more pressure","explicacion":"$P = F / A$: with a small $A$, a big $P$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.fluido","modo":"presion","profundidades":[1,3,5],"titulo":"In a liquid, pressure grows with depth"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-densidad-y-presion';

update public.techniques
set nombre_en = 'Pressure in liquids',
    descripcion_en = 'P = ρ·g·h, atmospheric pressure and gauge pressure.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["In a liquid, pressure grows with depth: $P = \\rho g h$. In water, $10$ kPa per meter.","Only the depth matters, not the shape or the amount of water: at the bottom of a thin $5$ m tube and of a $5$ m deep pool the pressure is the same.","Air has weight too: **atmospheric pressure** at sea level is about $101$ kPa (1 atm).","**Gauge** pressure is what a pressure gauge measures (only the liquid's); **absolute** pressure also adds the atmospheric one. At $11$ m under water: gauge $110$ kPa, absolute $211$ kPa."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What gauge pressure is there at a depth of $25$ m in fresh water?","opciones":["250 kPa","351 kPa","25 kPa","2500 kPa"],"respuesta":"250 kPa","explicacion":"$1000 \\cdot 10 \\cdot 25 = 250\\,000$ Pa."},{"pregunta":"And the absolute pressure there? (Air: $101$ kPa)","opciones":["351 kPa","250 kPa","126 kPa","149 kPa"],"respuesta":"351 kPa","explicacion":"$250 + 101 = 351$ kPa."},{"pregunta":"A narrow tank and a wide pool both have $3$ m of water. Where is the pressure at the bottom greater?","opciones":["It's the same","In the pool","In the tank","It depends on the amount of water"],"respuesta":"It's the same","explicacion":"$P = \\rho g h$: only the depth matters."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.fluido","modo":"presion","profundidades":[2,6,11],"titulo":"$10$ kPa more for each meter"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-presion-en-liquidos';

update public.techniques
set nombre_en = 'Pascal''s principle',
    descripcion_en = 'Hydraulic presses and brakes.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Pascal's principle**: the pressure you apply to an enclosed liquid is transmitted equally to all its points.","In a **hydraulic press**, the pressure on both pistons is the same: $\\dfrac{F_1}{A_1} = \\dfrac{F_2}{A_2}$, so $F_2 = F_1 \\cdot \\dfrac{A_2}{A_1}$.","Example: $100$ N on $0{,}01\\ \\text{m}^2$ makes $10\\,000$ Pa; on $0{,}5\\ \\text{m}^2$ that pushes with $5000$ N, enough to lift a small car.","Energy isn't given away: the big piston rises as many times less as the force it gains. A car's **brakes** work this way: a small pedal moves big pistons at each wheel."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"In a press, $A_1 = 0{,}02\\ \\text{m}^2$ and $A_2 = 1\\ \\text{m}^2$. With $F_1 = 200$ N, what is $F_2$?","opciones":["10,000 N","4 N","200 N","1000 N"],"respuesta":"10,000 N","explicacion":"$F_2 = 200 \\cdot \\dfrac{1}{0{,}02} = 10\\,000$ N."},{"pregunta":"What do the two pistons of a hydraulic press have in common?","opciones":["The pressure","The force","The area","How far they move"],"respuesta":"The pressure","explicacion":"It's what Pascal says: the pressure is transmitted equally."},{"pregunta":"If the big piston has $40$ times the area of the small one and rises $1$ cm, how far did the small one go down?","opciones":["40 cm","1 cm","0.025 cm","4 cm"],"respuesta":"40 cm","explicacion":"The volume of liquid that moves is the same on both sides."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.fluido","modo":"prensa","f1":100,"a1":0.01,"a2":0.5,"titulo":"Same pressure, area $50$ times larger: force $50$ times larger"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-pascal';

update public.techniques
set nombre_en = 'Archimedes'' principle',
    descripcion_en = 'Buoyant force, apparent weight and floating.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["**Archimedes**: a submerged body gets an upward **buoyant force** equal to the weight of the liquid it displaces: $E = \\rho_{\\text{liq}} \\cdot g \\cdot V_{\\text{submerged}}$.","If the buoyant force with the whole body underwater is greater than its weight, it rises and **floats**; if it's smaller, it sinks. That happens when the body is less dense than the liquid.","A floating body sinks just enough for the buoyant force to equal its weight. The submerged fraction is $\\dfrac{\\rho_{\\text{body}}}{\\rho_{\\text{liq}}}$.","**Apparent weight**: underwater, a stone \"weighs\" less: $P_{ap} = P - E$. A $1\\ \\text{dm}^3$ stone ($10^{-3}\\ \\text{m}^3$) gets $10$ N of buoyant force."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A $0{,}002\\ \\text{m}^3$ object is completely submerged in water. What buoyant force does it get? ($g = 10$)","opciones":["20 N","2 N","200 N","0.02 N"],"respuesta":"20 N","explicacion":"$E = 1000 \\cdot 10 \\cdot 0{,}002 = 20$ N."},{"pregunta":"A stone weighs $50$ N and underwater gets $20$ N of buoyant force. What is its apparent weight?","opciones":["30 N","70 N","50 N","20 N"],"respuesta":"30 N","explicacion":"$P_{ap} = 50 - 20 = 30$ N."},{"pregunta":"A $500\\ \\text{kg/m}^3$ log floats in water. What fraction stays submerged?","opciones":["Half","All of it","A quarter","None"],"respuesta":"Half","explicacion":"$\\dfrac{500}{1000} = 0{,}5$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.fluido","modo":"flota","densidad":600,"liquido":1000,"titulo":"It floats with $60\\ \\%$ under: there the buoyant force equals the weight"},{"tipo":"dinamia.fluido","modo":"flota","densidad":2700,"liquido":1000,"titulo":"Even fully underwater, the buoyant force isn't enough: it sinks"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-arquimedes';

update public.techniques
set nombre_en = 'Fluids in motion',
    descripcion_en = 'Flow rate, continuity, Torricelli and Bernoulli.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The **flow rate** is the volume that passes per second: $Q = A \\cdot v$, in $\\text{m}^3/\\text{s}$. In a full pipe it's the same everywhere (**continuity**): $A_1 v_1 = A_2 v_2$.","**Torricelli**: water comes out of a hole at a depth $h$ with the speed it would have falling from that height: $v = \\sqrt{2 g h}$. With $5$ m of water above, it comes out at $10$ m/s.","**Bernoulli**: where a fluid moves faster, its pressure is lower. In a pipe that narrows, the water speeds up and its pressure drops.","That's partly how a plane stays up: air moves faster over the wing than under it, and the pressure difference pushes the wing up."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"A $0{,}05\\ \\text{m}^2$ pipe narrows to $0{,}01\\ \\text{m}^2$. If the water goes in at $2$ m/s, how fast does it come out?","opciones":["10 m/s","0.4 m/s","2 m/s","5 m/s"],"respuesta":"10 m/s","explicacion":"$0{,}05 \\cdot 2 = 0{,}01 \\cdot v$, so $v = 10$ m/s."},{"pregunta":"A tank has a hole $20$ m below the surface. How fast does the water come out? ($g = 10$)","opciones":["20 m/s","200 m/s","400 m/s","14 m/s"],"respuesta":"20 m/s","explicacion":"$v = \\sqrt{2 \\cdot 10 \\cdot 20} = \\sqrt{400} = 20$ m/s."},{"pregunta":"According to Bernoulli, what is the pressure like in the narrow part of a pipe?","opciones":["Lower, because the water moves faster","Higher, because the pipe squeezes","The same as in the wide part","Zero"],"respuesta":"Lower, because the water moves faster","explicacion":"More speed, less pressure."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"dinamia.tubo","modo":"continuidad","v1":2,"k":3,"titulo":"Continuity: area to a third, speed times three"},{"tipo":"dinamia.tubo","modo":"torricelli","h":5,"titulo":"Torricelli: $v = \\sqrt{2 \\cdot 10 \\cdot 5} = 10$ m/s"}]$leccion_en$::jsonb
    )
where slug = 'dinamia-clase-fluidos-en-movimiento';
