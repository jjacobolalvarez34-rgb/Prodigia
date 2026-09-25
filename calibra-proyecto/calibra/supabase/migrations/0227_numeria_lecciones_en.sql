-- ============================================================
-- Prodigia — numeria: lecciones de Aprender en inglés (44 lecciones).
-- Requiere 0225_lecciones_en_columnas.sql.
--
-- Llena nombre_en, descripcion_en y contenido_en de cada lección (Técnicas y Clases).
-- contenido_en = el contenido en español con `pasos`, `quiz` y `visuales` reemplazados
-- por su versión en inglés (misma forma, mismas preguntas y mismas posiciones de la
-- respuesta correcta): lo que no se traduce (ids, programas, símbolos) queda igual.
-- Solo UPDATE por slug; no toca progreso ni el contenido en español.
--
-- Este archivo se GENERA desde src/lib/i18n-lecciones/en/numeria.ts y el test
-- src/lib/i18n-lecciones/traducciones.test.ts comprueba que coincida. No editar a
-- mano. Regenerar: I18N_LECCIONES_ESCRIBIR_SQL=1 npx vitest run src/lib/i18n-lecciones
-- (0227)
-- ============================================================

update public.techniques
set nombre_en = 'Complement to 10',
    descripcion_en = 'Add fast by finding the part a number needs to reach 10.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["When an addend is a short distance from a ten, complete that ten first and add the rest afterwards.","With $8 + 5$: $8$ needs $2$ to reach $10$. That $2$ comes from the $5$, so $3$ are left to add."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Using the complement to 10, to add 8 + 5, how much does 8 need to reach 10?","opciones":["2","3","5","8"],"respuesta":"2","explicacion":"8 is 2 away from 10 (8+2=10)."},{"pregunta":"After completing the ten, what is left to add in 8 + 5?","opciones":["3","2","5","10"],"respuesta":"3","explicacion":"You already used 2 of the 5 to complete the ten; 5−2=3 are left."},{"pregunta":"Using the complement to 10, what is 8 + 5?","opciones":["13","12","15","10"],"respuesta":"13","explicacion":"10 + 3 = 13, the same result as adding directly."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"texto":"$8 + 5$: $8$ is $2$ short of $10$"},{"formula":"8 + 2 = 10"},{"texto":"$3$ of the $5$ are left (you already used $2$)"},{"formula":"10 + 3 = 13","resaltar":"8 + 5 = 13"}]}]$leccion_en$::jsonb
    )
where slug = 'complemento-a-10';

update public.techniques
set nombre_en = 'Add by rounding to the ten',
    descripcion_en = 'Round the harder number to the nearest ten and adjust at the end.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Round the harder number to the nearest ten, add, and fix the adjustment at the end.","With $47 + 38$: round $38$ to $40$, add, and then subtract what you added too much."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To add 47 + 38 by rounding to the ten, what number do you round 38 to?","opciones":["40","30","50","38"],"respuesta":"40","explicacion":"38 is closer to 40 than to 30, so it is rounded to 40."},{"pregunta":"If you rounded 38 to 40, how much did you add too much?","opciones":["2","3","8","40"],"respuesta":"2","explicacion":"40 − 38 = 2: that is what you must subtract at the end to compensate."},{"pregunta":"With this technique, what is 47 + 38?","opciones":["85","87","83","89"],"respuesta":"85","explicacion":"47+40=87, and since you added 2 too much, 87−2=85."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"texto":"$47 + 38$: round $38$ to $40$"},{"formula":"47 + 40 = 87"},{"texto":"You added $2$ too much ($40$ instead of $38$)"},{"formula":"87 - 2 = 85","resaltar":"47 + 38 = 85"}]}]$leccion_en$::jsonb
    )
where slug = 'redondear-decena';

update public.techniques
set nombre_en = 'Add from the left',
    descripcion_en = 'You add from the largest position to the smallest (hundreds, tens, ones) instead of starting with the ones.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Add from the largest position to the smallest (hundreds, tens, ones) instead of starting with the ones.","With $456 + 327$: first the hundreds, then the tens, and the ones at the end."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Adding from the left, which position do you add first?","opciones":["The hundreds (the biggest one)","The ones (the smallest one)","The tens first, always","Any of them, the order does not matter"],"respuesta":"The hundreds (the biggest one)","explicacion":"The technique adds from the largest position to the smallest: hundreds, then tens, then ones."},{"pregunta":"For 456 + 327, what does the sum of the hundreds (4+3) give?","opciones":["700","70","7","800"],"respuesta":"700","explicacion":"4 hundreds + 3 hundreds = 7 hundreds = 700, just as the lesson shows."},{"pregunta":"Following the lesson example (456 + 327), what is the final result?","opciones":["783","770","790","813"],"respuesta":"783","explicacion":"700 (hundreds) + 70 (tens) + 13 (ones) = 783."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"texto":"Add the hundreds: 4 + 3 = 7 → 700"},{"texto":"Add the tens: 5 + 2 = 7 → 700 + 70 = 770"},{"texto":"Add the ones: 6 + 7 = 13","resaltar":"770 + 13 = 783"}]}]$leccion_en$::jsonb
    )
where slug = 'sumar-por-la-izquierda';

update public.techniques
set nombre_en = 'Double and adjust',
    descripcion_en = 'For nearly equal numbers, you double the smaller one and adjust by the difference.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["For two nearly equal numbers, double the smaller one and adjust by the difference.","With $48 + 51$: double the smaller one ($48$) and add the difference with the other."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To add 48 + 51 with this technique, which number do you double?","opciones":["48 (the smaller one)","51 (the bigger one)","The average of the two","99 (the result)"],"respuesta":"48 (the smaller one)","explicacion":"The technique says: pick the smaller number and double it."},{"pregunta":"What is the difference between 51 and 48 that has to be adjusted?","opciones":["3","2","48","51"],"respuesta":"3","explicacion":"51 − 48 = 3, that is the difference you add to the double."},{"pregunta":"With this technique, what is 48 + 51?","opciones":["99","96","102","93"],"respuesta":"99","explicacion":"48+48=96, and adding the difference of 3, 96+3=99."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"formula":"48 + 48 = 96"},{"texto":"The difference between $51$ and $48$ is $3$"},{"formula":"96 + 3 = 99","resaltar":"48 + 51 = 99"}]}]$leccion_en$::jsonb
    )
where slug = 'duplicar-y-ajustar';

update public.techniques
set nombre_en = 'Adding big numbers, position by position',
    descripcion_en = 'With 4 or 5 digits, adding everything at once invites mistakes — splitting by position makes it manageable.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["With 4 or 5 digits, adding everything at once invites mistakes — splitting by position makes it manageable.","It is the same idea as the complement to 10, column by column, just with longer numbers."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"This technique extends which idea to numbers of 4 or 5 digits?","opciones":["Splitting by position and adding each one separately, like the complement to 10 but in columns","Always rounding to the nearest hundred","Multiplying instead of adding","Ignoring the ones if the number is very big"],"respuesta":"Splitting by position and adding each one separately, like the complement to 10 but in columns","explicacion":"It is the same logic of adding by columns, now applied to thousands, hundreds, tens and ones."},{"pregunta":"If when adding a position the result is 10 or more, what happens?","opciones":["That part is \"carried\" to the next position","The excess is discarded","You have to start over from the ones","The result is automatically wrong"],"respuesta":"That part is \"carried\" to the next position","explicacion":"The carry passes to the next position, the same idea as the complement to 10 but in a chain."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.columnas","operacion":"suma","a":4827,"b":3956,"despuesDePaso":1,"titulo":"4827 + 3956, position by position"}]$leccion_en$::jsonb
    )
where slug = 'sumar-por-posicion-numeros-grandes';

update public.techniques
set nombre_en = 'Estimate before adding big numbers',
    descripcion_en = 'A quick estimate warns you if you made a mistake before you trust the exact result.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["A quick estimate warns you if there is a mistake before you trust the exact result.","Round each number to its highest position, add those roundings, and compare with the real result."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To estimate before adding 4827 to another number, what is 4827 rounded to first?","opciones":["5000 (to its highest position)","4800","4830","5827"],"respuesta":"5000 (to its highest position)","explicacion":"You round to the number's highest position: 4827 rounds to 5000 (thousands)."},{"pregunta":"What is estimating for in this technique?","opciones":["To detect whether the exact result is far from what was expected and warn of a mistake","To always replace the exact calculation","To round the final result","To avoid adding the ones"],"respuesta":"To detect whether the exact result is far from what was expected and warn of a mistake","explicacion":"It is a quick check: if the real result is far from the estimate, there was probably a mistake in some step."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"texto":"Round each number: $4827$ → $5000$, and $3956$ → $4000$"},{"formula":"5000 + 4000 = 9000","resaltar":"Estimación: 9000"},{"texto":"Now add the real numbers, position by position: $4827 + 3956 = 8783$"},{"resaltar":"Resultado real: 8783 (cerca de la estimación de 9000)"}]}]$leccion_en$::jsonb
    )
where slug = 'estimar-antes-de-sumar-grande';

update public.techniques
set nombre_en = 'Subtraction by compensation',
    descripcion_en = 'You round both numbers by the same amount and the result does not change.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["To subtract, round the number being subtracted to the ten and adjust the result at the end.","With $82 - 47$: round $47$ to $50$, subtract, and give the adjustment back."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To subtract 82 − 47 with this technique, what do you round 47 to?","opciones":["50","40","45","82"],"respuesta":"50","explicacion":"47 is rounded to the nearest 50 to simplify the subtraction."},{"pregunta":"If you rounded 47 to 50, did you subtract too much or too little, and by how much?","opciones":["Too much, by 3","Too little, by 3","Too much, by 7","Neither too much nor too little"],"respuesta":"Too much, by 3","explicacion":"50 is 3 more than 47, so you subtracted 3 too much and those 3 have to be given back to the result."},{"pregunta":"With this technique, what is 82 − 47?","opciones":["35","32","38","29"],"respuesta":"35","explicacion":"82−50=32, and since you subtracted 3 too much, 32+3=35."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"texto":"$82 - 47$: round $47$ to $50$"},{"formula":"82 - 50 = 32"},{"texto":"You subtracted $3$ too much ($50$ instead of $47$)"},{"formula":"32 + 3 = 35","resaltar":"82 - 47 = 35"}]}]$leccion_en$::jsonb
    )
where slug = 'resta-compensacion';

update public.techniques
set nombre_en = 'Complement to 100',
    descripcion_en = 'To subtract from a round number like 100, each digit is subtracted from 9 except the last one, which is subtracted from 10.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["To subtract from a round number like 100, each digit is subtracted from 9 except the last one, which is subtracted from 10.","With $100 - 63$: the first digit is subtracted from $9$ and the last one from $10$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To subtract 100 − 63 with the complement to 100, what number is the first digit (6) subtracted from?","opciones":["From 9","From 10","From 6","From 3"],"respuesta":"From 9","explicacion":"All digits are subtracted from 9, except the last one, which is subtracted from 10."},{"pregunta":"What number is the last digit (3) subtracted from?","opciones":["From 10","From 9","From 100","From 3"],"respuesta":"From 10","explicacion":"The last digit is the only exception: it is subtracted from 10, not from 9."},{"pregunta":"Applying the technique, what is 100 − 63?","opciones":["37","33","47","27"],"respuesta":"37","explicacion":"9−6=3 (first digit) and 10−3=7 (last digit) → 37."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"texto":"Subtract each digit from 9, except the last one, which is subtracted from 10"},{"formula":"9 - 6 = 3"},{"formula":"10 - 3 = 7","resaltar":"100 - 63 = 37"}]}]$leccion_en$::jsonb
    )
where slug = 'complemento-a-100';

update public.techniques
set nombre_en = 'Subtracting big numbers, borrowing big',
    descripcion_en = 'The same idea of "borrowing" from small subtractions, chained across several positions.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The same idea of \"borrowing\" from small subtractions, chained across several positions.","You subtract from right to left, and the borrowing can be chained several times in a row."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"In this technique, if the top digit is smaller than the bottom one in a position, what do you do?","opciones":["You \"borrow\" 1 from the next position","You subtract the other way round (bottom minus top)","You put a 0 in that position","You round the whole number"],"respuesta":"You \"borrow\" 1 from the next position","explicacion":"It is the same idea of borrowing from small subtractions, now chained across several positions."},{"pregunta":"Can the borrowing technique be chained several times in a row?","opciones":["Yes, if several positions in a row need it","No, it can only happen once per subtraction","No, that means the subtraction is badly set up","Only if the number has fewer than 3 digits"],"respuesta":"Yes, if several positions in a row need it","explicacion":"The borrowing can be chained position after position, just as the lesson describes."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.columnas","operacion":"resta","a":8241,"b":3956,"despuesDePaso":1,"titulo":"8241 - 3956, borrowing"}]$leccion_en$::jsonb
    )
where slug = 'restar-por-posicion-numeros-grandes';

update public.techniques
set nombre_en = 'Subtract by completing to the nearest round number',
    descripcion_en = 'For big numbers, sometimes it is faster to "complete" than to subtract directly.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["For big numbers, sometimes it is faster to \"complete\" to the nearest round number than to subtract directly.","The step that is forgotten most is the final adjustment — without it, the result is off by exactly that difference."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To subtract using 6850, what round number does this technique suggest thinking of?","opciones":["7000","6800","6900","6000"],"respuesta":"7000","explicacion":"It is the lesson example: 6850 is completed to the nearest round number, 7000."},{"pregunta":"If you use 7000 instead of 6850, what final adjustment has to be made?","opciones":["Add 150 back to the result","Subtract 150 from the result","No adjustment is needed","Multiply the result by 150"],"respuesta":"Add 150 back to the result","explicacion":"7000 − 6850 = 150; since you subtracted too much by using the round number, that difference has to be added back."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"texto":"For $9241 - 6850$, use the round number closest to $6850$: $7000$"},{"formula":"9241 - 7000 = 2241"},{"texto":"Adjust by adding the difference between $7000$ and $6850$: $7000 - 6850 = 150$"},{"formula":"2241 + 150 = 2391","resaltar":"9241 - 6850 = 2391"}]}]$leccion_en$::jsonb
    )
where slug = 'restar-completando-al-redondo-mas-cercano';

update public.techniques
set nombre_en = '×11 in one second',
    descripcion_en = 'Split the digits, add them, and carry if needed.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Split the digits of the number, add them, and put that result in the middle (with a carry if it goes over 9).","With $37 \\times 11$: split the digits $3$ and $7$, and add them."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To multiply 37 × 11 with this technique, what do you do first with the digits of 37?","opciones":["Split them: 3 and 7, leaving a gap in the middle","Add them and multiply by 11","Multiply them by each other","Subtract them"],"respuesta":"Split them: 3 and 7, leaving a gap in the middle","explicacion":"The trick splits the digits of the number (3_7) and uses the gap in the middle for the result of the sum."},{"pregunta":"What goes in the gap in the middle?","opciones":["The sum of the two digits (3+7=10)","The difference of the two digits","The biggest digit","A zero always"],"respuesta":"The sum of the two digits (3+7=10)","explicacion":"3+7=10 goes in the middle; since it goes over 9, the 1 is carried to the first digit."},{"pregunta":"With this technique, what is 37 × 11?","opciones":["407","370","417","307"],"respuesta":"407","explicacion":"3+7=10, the 1 is carried to the first digit (3+1=4), leaving 4_0_7 = 407."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"texto":"$37 \\times 11$: split the digits: $3$ _ $7$"},{"formula":"3 + 7 = 10"},{"texto":"Since it goes over 9, carry the 1: $(3+1)\\ 0\\ 7$"},{"formula":"37 \\times 11 = 407","resaltar":"37 × 11 = 407"}]}]$leccion_en$::jsonb
    )
where slug = 'x11-segundo';

update public.techniques
set nombre_en = '×5 = half of ×10',
    descripcion_en = 'Multiplying by 5 is multiplying by 10 and dividing the result by 2.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Multiplying by 10 is adding a zero. Multiplying by 5 is doing that and halving.","With $48 \\times 5$: multiply by $10$ first and halve the result."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To multiply 48 × 5, this technique says to multiply first by…","opciones":["10","2","5","100"],"respuesta":"10","explicacion":"×5 is worked out as ×10 and then halving the result."},{"pregunta":"After 48 × 10 = 480, what operation is missing?","opciones":["Divide 480 by 2","Multiply 480 by 2","Subtract 10 from 480","Add 5 to 480"],"respuesta":"Divide 480 by 2","explicacion":"Halving the result of ×10 gives the result of ×5."},{"pregunta":"With this technique, what is 48 × 5?","opciones":["240","480","96","24"],"respuesta":"240","explicacion":"48×10=480, and 480÷2=240."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"formula":"48 \\times 10 = 480"},{"texto":"Halve that result"},{"formula":"480 \\div 2 = 240","resaltar":"48 × 5 = 240"}]}]$leccion_en$::jsonb
    )
where slug = 'x5-mitad-de-x10';

update public.techniques
set nombre_en = 'Squares of numbers ending in 5',
    descripcion_en = 'To square a number that ends in 5: take the tens digit, multiply it by itself plus one, and stick 25 on the end.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["To square a number that ends in 5: take the tens digit, multiply it by itself plus one, and add 25 at the end."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To work out $35^2$ with this technique, what do you do with the tens digit (3)?","opciones":["Multiply it by itself plus one: $3 \\times 4$","Multiply it by 5","Add 25 to it","Square it directly"],"respuesta":"Multiply it by itself plus one: $3 \\times 4$","explicacion":"The tens digit is multiplied by the next number: $3 \\times 4 = 12$."},{"pregunta":"What is stuck on the end of the result of that multiplication?","opciones":["\"25\"","\"05\"","The same original number","Nothing, it is already complete"],"respuesta":"\"25\"","explicacion":"Every square of a number ending in 5 ends in 25 — \"25\" is stuck on the result of $3\\times4$."},{"pregunta":"With this technique, what is $35^2$?","opciones":["1225","1025","1250","925"],"respuesta":"1225","explicacion":"$3\\times4=12$, stick \"25\" on it → $35^2=1225$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":0,"cuadros":[{"texto":"$35^2$: the tens digit is $3$"},{"formula":"3 \\times 4 = 12"},{"texto":"Add \"25\" at the end"},{"formula":"35^2 = 1225","resaltar":"35² = 1225"}]}]$leccion_en$::jsonb
    )
where slug = 'cuadrado-terminado-en-5';

update public.techniques
set nombre_en = '×9 = ×10 minus the number',
    descripcion_en = 'Multiplying by 9 is multiplying by 10 and subtracting the original number.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Multiplying by 9 is multiplying by 10 and subtracting the original number.","With $47 \\times 9$: multiply by $10$ and subtract $47$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To multiply 47 × 9, this technique says to multiply first by…","opciones":["10","9","8","11"],"respuesta":"10","explicacion":"×9 is worked out as ×10 and then subtracting the original number."},{"pregunta":"After 47 × 10 = 470, what do you subtract?","opciones":["The original number, 47","9","10","470"],"respuesta":"The original number, 47","explicacion":"×9 = ×10 minus the number, so the original 47 is subtracted."},{"pregunta":"With this technique, what is 47 × 9?","opciones":["423","470","433","413"],"respuesta":"423","explicacion":"47×10=470, and 470−47=423."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"formula":"47 \\times 10 = 470"},{"formula":"470 - 47 = 423","resaltar":"47 × 9 = 423"}]}]$leccion_en$::jsonb
    )
where slug = 'x9-es-x10-menos-el-numero';

update public.techniques
set nombre_en = 'Numbers near 100',
    descripcion_en = 'The base method: you use how much each number is short of 100.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The base method: it is for multiplying two numbers that are close to $100$ (like $98 \\times 97$). Instead of multiplying in columns, you work with what each number is MISSING to reach $100$: its complement.","Step 1, the complements: $100 - 98 = 2$ and $100 - 97 = 3$.","Step 2, the first digits: subtract crosswise. From one number subtract the complement of the OTHER one: $98 - 3 = 95$. If you do it the other way round, $97 - 2 = 95$: it always gives the same.","Step 3, the last two digits: multiply the complements, $2 \\times 3 = 6$. Since the result takes TWO digits, it is written with a zero in front: $06$.","Step 4, put it together: $95$ in front and $06$ behind. So $98 \\times 97 = 9506$.","Why does it work? $98 = 100 - 2$ and $97 = 100 - 3$. When multiplying: $(100 - 2)(100 - 3) = 10000 - 300 - 200 + 6 = 9500 + 6$. The $9500$ is the first digits ($95$ times a hundred) and the $6$ is the last ones.","Another example, $96 \\times 94$: complements $4$ and $6$; first digits $96 - 6 = 90$; last ones $4 \\times 6 = 24$. Result: $9024$. If the complements give more than two digits, as in $88 \\times 87$ ($12 \\times 13 = 156$), add that number: $7500 + 156 = 7656$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To multiply 98 × 97 with the base method, what is worked out first?","opciones":["How much each number is short of 100 (2 and 3)","The average of the two numbers","The sum of the two numbers","The square of each number"],"respuesta":"How much each number is short of 100 (2 and 3)","explicacion":"98 is 2 short of 100, and 97 is 3 short — those complements are the basis of the method."},{"pregunta":"How do you get the last two digits of the result?","opciones":["Multiplying the complements by each other (2×3=06)","Adding the complements","Subtracting the complements","Multiplying the original numbers"],"respuesta":"Multiplying the complements by each other (2×3=06)","explicacion":"2×3=06 are the last two digits of the final result."},{"pregunta":"With this technique, what is 98 × 97?","opciones":["9506","9406","9606","8506"],"respuesta":"9506","explicacion":"98−3=95 (first digits) and 2×3=06 (last digits) → 9506."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"texto":"What each number is missing to reach 100"},{"formula":"100 - 98 = 2"},{"resaltar":"100 - 97 = 3"}]},{"tipo":"cuadros","despuesDePaso":2,"cuadros":[{"texto":"Cross subtraction: one number minus the complement of the other"},{"formula":"98 - 3 = 95"},{"resaltar":"97 - 2 = 95"}]},{"tipo":"cuadros","despuesDePaso":3,"cuadros":[{"texto":"Complement times complement (two digits)"},{"formula":"2 \\times 3 = 6"},{"resaltar":"6 \\to 06"}]},{"tipo":"cuadros","despuesDePaso":4,"cuadros":[{"texto":"Complement to 100: $98 \\to 2$, $97 \\to 3$"},{"formula":"98 - 3 = 95"},{"formula":"2 \\times 3 = 6"},{"resaltar":"98 × 97 = 9506 = 9506"}]},{"tipo":"cuadros","despuesDePaso":5,"cuadros":[{"formula":"(100 - 2)(100 - 3) = 10000 - 300 - 200 + 6"},{"resaltar":"= 9500 + 6 = 9506"}]},{"tipo":"cuadros","despuesDePaso":6,"cuadros":[{"texto":"96 × 94: complements 4 and 6"},{"formula":"96 - 6 = 90"},{"formula":"4 \\times 6 = 24"},{"resaltar":"96 × 94 = 9024 = 9024"}]}]$leccion_en$::jsonb
    )
where slug = 'numeros-cercanos-a-100';

update public.techniques
set nombre_en = '×4 = double twice',
    descripcion_en = 'Multiplying by 4 is doubling the number and doubling the result again.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Multiplying by 4 is doubling the number and doubling the result again.","With $37 \\times 4$: double twice in a row."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To multiply 37 × 4 with this technique, what operation is repeated?","opciones":["Doubling (multiplying by 2), twice","Multiplying by 4 directly","Dividing by 2, twice","Adding 4 to the number"],"respuesta":"Doubling (multiplying by 2), twice","explicacion":"×4 is doubling the number and doubling the result again."},{"pregunta":"If you double 37 once, what do you get?","opciones":["74","148","37","111"],"respuesta":"74","explicacion":"37×2=74 — the first doubling, before doubling again."},{"pregunta":"With this technique, what is 37 × 4?","opciones":["148","144","152","111"],"respuesta":"148","explicacion":"37×2=74, and 74×2=148."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"formula":"37 \\times 2 = 74"},{"formula":"74 \\times 2 = 148","resaltar":"37 × 4 = 148"}]}]$leccion_en$::jsonb
    )
where slug = 'x4-duplicar-dos-veces';

update public.techniques
set nombre_en = 'Multiplication by parts (distributive)',
    descripcion_en = 'Splitting a factor into hundreds + tens + ones turns a big multiplication into several small ones.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Splitting a factor into hundreds + tens + ones turns a big multiplication into several small ones.","With $234 \\times 6$: split $234$ into $200 + 30 + 4$ and multiply each part."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To multiply by parts, how is a factor like 234 split?","opciones":["Into hundreds + tens + ones: 200+30+4","Into 2+3+4","Into even and odd","Into its half and its double"],"respuesta":"Into hundreds + tens + ones: 200+30+4","explicacion":"234 = 200 + 30 + 4, the distributive property applied to each part."},{"pregunta":"After splitting the factor, what do you do with the other factor?","opciones":["Multiply it by each part separately and add the results","Add it to each part","Ignore it","Divide it among the parts"],"respuesta":"Multiply it by each part separately and add the results","explicacion":"Each partial multiplication (by 200, by 30, by 4) is simpler, and they are added at the end."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"formula":"200 \\times 6 = 1200"},{"formula":"30 \\times 6 = 180"},{"formula":"4 \\times 6 = 24"},{"formula":"1200 + 180 + 24 = 1404","resaltar":"234 × 6 = 1404"}]}]$leccion_en$::jsonb
    )
where slug = 'multiplicar-por-partes';

update public.techniques
set nombre_en = 'Multiply by rounding first',
    descripcion_en = 'Rounding a factor, multiplying, and adjusting afterwards is usually faster than multiplying the real number at once.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Rounding a factor, multiplying, and adjusting afterwards is usually faster than multiplying the real number at once.","With $98 \\times 47$: round $98$ to $100$ and adjust the difference."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"If one of the factors is 98, what is it rounded to with this technique?","opciones":["100","90","95","98"],"respuesta":"100","explicacion":"98 is rounded to the nearest round number, 100, to simplify the calculation."},{"pregunta":"If you rounded 98 to 100, did you go over or fall short, and by how much (in times the other factor)?","opciones":["You went over, by 2 times the other factor","You fell short, by 2 times the other factor","You went over, by 100 times the other factor","There is no difference"],"respuesta":"You went over, by 2 times the other factor","explicacion":"100 is 2 more than 98, so the result with 100 is 2 times the other factor above the real one."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"formula":"100 \\times 47 = 4700"},{"texto":"You went over by $2$ times $47$"},{"formula":"2 \\times 47 = 94"},{"formula":"4700 - 94 = 4606","resaltar":"98 × 47 = 4606"}]}]$leccion_en$::jsonb
    )
where slug = 'multiplicar-redondeando-primero';

update public.techniques
set nombre_en = 'Divisibility rules for 3',
    descripcion_en = 'You add the digits of the number; if that sum is a multiple of 3, the original number is too.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Add the digits of the number; if that sum is a multiple of 3, the original number is too.","With $471$: the sum of the digits is $12$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To find out whether 471 is divisible by 3, what is worked out first?","opciones":["The sum of its digits: 4+7+1","The remainder of dividing by 3","Half of 471","The square of 471"],"respuesta":"The sum of its digits: 4+7+1","explicacion":"The divisibility rule for 3 is based on adding the digits of the number."},{"pregunta":"If that sum of digits is a multiple of 3, what is concluded?","opciones":["That the original number is also divisible by 3","That the original number is even","That the original number is prime","Nothing, you still have to divide to confirm"],"respuesta":"That the original number is also divisible by 3","explicacion":"That is the whole rule: if the sum of digits is a multiple of 3, the original number is too, without needing to divide."},{"pregunta":"According to this rule, is 471 divisible by 3?","opciones":["Yes, because 4+7+1=12 is a multiple of 3","No, because 471 is odd","Yes, because 471 ends in 1","No, because 12 is not a multiple of 3"],"respuesta":"Yes, because 4+7+1=12 is a multiple of 3","explicacion":"4+7+1=12, and 12 is a multiple of 3, so 471 is too (471÷3=157)."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"formula":"4 + 7 + 1 = 12"},{"texto":"If that sum is a multiple of 3, the original number is too"},{"resaltar":"12 es múltiplo de 3 → 471 es divisible por 3"}]}]$leccion_en$::jsonb
    )
where slug = 'divisibilidad-por-3';

update public.techniques
set nombre_en = '÷5 = ×2 and move the point',
    descripcion_en = 'Dividing by 5 is multiplying by 2 and moving the decimal point one place.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Dividing by 5 is multiplying by 2 and moving the decimal point one place.","With $84 \\div 5$: multiply by $2$ and move the point."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To divide 84 ÷ 5 with this technique, what do you do first?","opciones":["Multiply 84 by 2","Divide 84 by 2","Multiply 84 by 10","Add 5 to 84"],"respuesta":"Multiply 84 by 2","explicacion":"÷5 is ×2 and moving the point: first you multiply by 2."},{"pregunta":"After 84 × 2 = 168, what do you do to finish?","opciones":["Move the decimal point one place to the left (divide by 10)","Move the decimal point one place to the right","Divide by 5 again","Subtract 2"],"respuesta":"Move the decimal point one place to the left (divide by 10)","explicacion":"168 divided by 10 (moving the point) gives 16.8, the final result."},{"pregunta":"With this technique, what is 84 ÷ 5?","opciones":["16.8","33.6","8.4","42"],"respuesta":"16.8","explicacion":"84×2=168, and moving the point one place: 16.8."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"formula":"84 \\times 2 = 168"},{"texto":"Move the decimal point one place to the left (divide by 10)"},{"formula":"168 \\div 10 = 16.8","resaltar":"84 ÷ 5 = 16.8"}]}]$leccion_en$::jsonb
    )
where slug = 'dividir-por-5';

update public.techniques
set nombre_en = 'Dividing big numbers, by parts',
    descripcion_en = 'Splitting the dividend into a convenient multiple of the divisor plus a remainder simplifies big divisions.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Splitting the dividend into a convenient multiple of the divisor plus a remainder simplifies big divisions.","With $288 \\div 12$: find the biggest convenient multiple and divide what is left."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To divide 288 ÷ 12 by parts, what do you look for first?","opciones":["The biggest easy multiple of 12 that is less than or equal to 288 (for example 12×20=240)","The remainder of the division directly","Half of 288","Any number to subtract"],"respuesta":"The biggest easy multiple of 12 that is less than or equal to 288 (for example 12×20=240)","explicacion":"You look for a convenient multiple of the divisor, like 12×20=240, to simplify the calculation."},{"pregunta":"With this technique, what is 288 ÷ 12?","opciones":["24","20","28","22"],"respuesta":"24","explicacion":"288−240=48, and 48÷12=4; adding the partial quotients: 20+4=24."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"formula":"12 \\times 20 = 240"},{"formula":"288 - 240 = 48"},{"formula":"48 \\div 12 = 4"},{"formula":"20 + 4 = 24","resaltar":"288 ÷ 12 = 24"}]}]$leccion_en$::jsonb
    )
where slug = 'dividir-numeros-grandes-por-partes';

update public.techniques
set nombre_en = 'Estimate the quotient before dividing',
    descripcion_en = 'Knowing roughly how many digits the result will have avoids big mistakes when dividing.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Knowing roughly how many digits the result will have avoids big mistakes when dividing.","A quick estimate with the rounded number gives a reference before actually dividing."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What is estimating the quotient before dividing a big number for?","opciones":["To get an idea of the order of magnitude of the result and avoid big mistakes","To always replace the exact division","To round the divisor","To know whether the number is even or odd"],"respuesta":"To get an idea of the order of magnitude of the result and avoid big mistakes","explicacion":"Knowing roughly how many digits the result will have helps detect big mistakes before finishing."},{"pregunta":"If, when trying a quotient, the multiplication by the divisor goes over the dividend, what should you do?","opciones":["Lower the quotient you tried","Raise the quotient you tried","Change the divisor","Start over with another dividend"],"respuesta":"Lower the quotient you tried","explicacion":"If you went over the dividend, the quotient you tried is too high — lower it and try again."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"texto":"Round the dividend: $8916 \\to 9000$"},{"formula":"9000 \\div 4 = 2250","resaltar":"Estimación: 2250"},{"formula":"8916 \\div 4 = 2229","resaltar":"Resultado real: 2229 (cerca de la estimación)"}]}]$leccion_en$::jsonb
    )
where slug = 'estimar-el-cociente-grande';

update public.techniques
set nombre_en = 'Adding with the same denominator',
    descripcion_en = 'When two fractions have the same denominator, you add the numerators and keep the denominator the same.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["When two fractions have the same denominator, add the numerators and keep the denominator the same."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To add $\\dfrac{1}{5} + \\dfrac{2}{5}$ with this technique, what is added?","opciones":["The numerators: 1+2","The denominators: 5+5","Numerators and denominators alike","Nothing, you have to find a common denominator first"],"respuesta":"The numerators: 1+2","explicacion":"When the denominator is already the same, you only add the numerators."},{"pregunta":"What happens to the denominator when adding fractions with the same denominator?","opciones":["It stays the same","It is added too","It is multiplied by 2","It is subtracted"],"respuesta":"It stays the same","explicacion":"The denominator stays the same — only the numerator changes, which is the sum of the originals."},{"pregunta":"With this technique, what is $\\dfrac{1}{5} + \\dfrac{2}{5}$?","opciones":["$\\dfrac{3}{5}$","$\\dfrac{3}{10}$","$\\dfrac{2}{5}$","$\\dfrac{1}{5}$"],"respuesta":"$\\dfrac{3}{5}$","explicacion":"1+2=3 in the numerator, same denominator: $\\dfrac{3}{5}$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.fraccion","operacion":"suma","num1":1,"den1":5,"num2":2,"den2":5,"despuesDePaso":0,"titulo":"1/5 + 2/5"}]$leccion_en$::jsonb
    )
where slug = 'sumar-fracciones-igual-denominador';

update public.techniques
set nombre_en = 'Simplify by dividing by the greatest common divisor',
    descripcion_en = 'Find the biggest number that divides both the numerator and the denominator exactly, and divide both by it.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Find the biggest number that divides both the numerator and the denominator exactly, and divide both by it.","With $\\dfrac{8}{12}$: the greatest common divisor is $4$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To simplify $\\dfrac{8}{12}$, what is looked for first?","opciones":["The greatest common divisor (GCD) of 8 and 12","The least common multiple of 8 and 12","The sum of 8 and 12","The double of 8 and 12"],"respuesta":"The greatest common divisor (GCD) of 8 and 12","explicacion":"The technique looks for the GCD to divide the numerator and the denominator by the same number."},{"pregunta":"What is the GCD of 8 and 12?","opciones":["4","2","3","6"],"respuesta":"4","explicacion":"4 is the biggest number that divides both 8 and 12 exactly."},{"pregunta":"What is $\\dfrac{8}{12}$ once simplified?","opciones":["$\\dfrac{2}{3}$","$\\dfrac{4}{6}$","$\\dfrac{1}{2}$","$\\dfrac{2}{4}$"],"respuesta":"$\\dfrac{2}{3}$","explicacion":"8÷4=2 and 12÷4=3, so $\\dfrac{8}{12}=\\dfrac{2}{3}$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"formula":"\\text{MCD}(8,12) = 4"},{"formula":"8 \\div 4 = 2"},{"formula":"12 \\div 4 = 3","resaltar":"\\dfrac{8}{12} = \\dfrac{2}{3}"}]}]$leccion_en$::jsonb
    )
where slug = 'simplificar-con-mcd';

update public.techniques
set nombre_en = 'Least common denominator',
    descripcion_en = 'To add fractions with different denominators, you first convert them to a common denominator.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["To add fractions with different denominators, they are first converted to a common denominator.","With $\\dfrac{1}{4} + \\dfrac{1}{6}$: the least common multiple of the denominators is $12$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To add $\\dfrac{1}{4} + \\dfrac{1}{6}$, what do you have to look for first?","opciones":["The least common multiple of the denominators (4 and 6)","The greatest common divisor of the denominators","The sum of the denominators","Which fraction is bigger"],"respuesta":"The least common multiple of the denominators (4 and 6)","explicacion":"With different denominators, you first have to convert them to a common denominator: the LCM."},{"pregunta":"What is the least common multiple of 4 and 6?","opciones":["12","24","10","6"],"respuesta":"12","explicacion":"12 is the smallest number that is a multiple of both 4 and 6."},{"pregunta":"With this technique, what is $\\dfrac{1}{4} + \\dfrac{1}{6}$?","opciones":["$\\dfrac{5}{12}$","$\\dfrac{2}{10}$","$\\dfrac{1}{12}$","$\\dfrac{6}{12}$"],"respuesta":"$\\dfrac{5}{12}$","explicacion":"$\\dfrac{1}{4}=\\dfrac{3}{12}$ and $\\dfrac{1}{6}=\\dfrac{2}{12}$; added: $\\dfrac{3}{12}+\\dfrac{2}{12}=\\dfrac{5}{12}$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.mcm","a":4,"b":6,"despuesDePaso":1,"titulo":"LCM of 4 and 6"},{"tipo":"numeria.fraccion","operacion":"suma","num1":1,"den1":4,"num2":1,"den2":6,"despuesDePaso":1,"titulo":"1/4 + 1/6 with a common denominator"}]$leccion_en$::jsonb
    )
where slug = 'minimo-comun-denominador';

update public.techniques
set nombre_en = 'Comparing fractions with the cross product',
    descripcion_en = 'To know which fraction is bigger without looking for a common denominator, you multiply crosswise.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["To know which fraction is bigger without looking for a common denominator, you multiply crosswise.","With $\\dfrac{3}{4}$ and $\\dfrac{4}{5}$: multiply each numerator by the denominator of the other one."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To compare $\\dfrac{3}{4}$ and $\\dfrac{4}{5}$ with the cross product, what do you multiply first?","opciones":["The numerator of the first by the denominator of the second: 3×5","The two numerators by each other","The two denominators by each other","The numerator of the second by the numerator of the first"],"respuesta":"The numerator of the first by the denominator of the second: 3×5","explicacion":"That is the first cross product: 3×5=15."},{"pregunta":"What is multiplied in the second cross product?","opciones":["The numerator of the second by the denominator of the first: 4×4","The denominator of the second by the denominator of the first","The numerator of the first by the numerator of the second","4×5"],"respuesta":"The numerator of the second by the denominator of the first: 4×4","explicacion":"The second cross product is 4×4=16."},{"pregunta":"Comparing 15 and 16, which fraction is bigger, $\\dfrac{3}{4}$ or $\\dfrac{4}{5}$?","opciones":["$\\dfrac{4}{5}$, because 15<16","$\\dfrac{3}{4}$, because 15<16","They are equal","It cannot be known without a common denominator"],"respuesta":"$\\dfrac{4}{5}$, because 15<16","explicacion":"Since the first product (15) is smaller than the second (16), the first fraction is smaller: $\\dfrac{3}{4}<\\dfrac{4}{5}$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"formula":"3 \\times 5 = 15"},{"formula":"4 \\times 4 = 16"},{"resaltar":"15 < 16 → \\dfrac{3}{4} < \\dfrac{4}{5}"}]}]$leccion_en$::jsonb
    )
where slug = 'comparar-con-producto-cruzado';

update public.techniques
set nombre_en = 'From fraction to decimal, by dividing',
    descripcion_en = 'A decimal is nothing more than the result of dividing the numerator by the denominator.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["A decimal is nothing more than the result of dividing the numerator by the denominator.","$\\dfrac{3}{4}$ divided gives $0.75$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To convert $\\dfrac{3}{4}$ to a decimal, what operation is done?","opciones":["Divide the numerator by the denominator: 3÷4","Multiply numerator by denominator","Add numerator and denominator","Subtract the denominator from the numerator"],"respuesta":"Divide the numerator by the denominator: 3÷4","explicacion":"A decimal is, no more and no less, the result of that division."},{"pregunta":"What is the decimal equivalent of $\\dfrac{3}{4}$?","opciones":["0.75","0.34","0.43","1.33"],"respuesta":"0.75","explicacion":"3÷4=0.75."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.recta","despuesDePaso":1,"min":0,"max":1,"marcas":[{"valor":0.75,"etiqueta":"$\\dfrac{3}{4} = 0.75$"}],"titulo":"3/4 on the number line"}]$leccion_en$::jsonb
    )
where slug = 'convertir-fraccion-decimal';

update public.techniques
set nombre_en = 'A percentage is a decimal moved two places',
    descripcion_en = 'To find X% of a number, you convert the percentage to a decimal (÷100) and multiply.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["To find X% of a number, convert the percentage to a decimal (÷100) and multiply.","$15\\%$ of $200$ is $0.15 \\times 200 = 30$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To find 15% of 200, what decimal is the 15% converted to first?","opciones":["0.15","1.5","15","0.015"],"respuesta":"0.15","explicacion":"A percentage is converted to a decimal by dividing it by 100: 15÷100=0.15."},{"pregunta":"After converting the percentage to a decimal, what do you do?","opciones":["Multiply it by the number (200)","Add it to the number","Divide the number by the decimal","Subtract the decimal from the number"],"respuesta":"Multiply it by the number (200)","explicacion":"0.15 × 200 = 30 is the final result: 15% of 200."},{"pregunta":"How much is 15% of 200 with this technique?","opciones":["30","15","20","150"],"respuesta":"30","explicacion":"0.15×200=30."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.recta","despuesDePaso":1,"min":0,"max":1,"marcas":[{"valor":0.15,"etiqueta":"$15\\% = 0.15$"}],"titulo":"15% of 200 = 30"}]$leccion_en$::jsonb
    )
where slug = 'porcentaje-como-decimal';

update public.techniques
set nombre_en = 'Rounding by looking at the next digit',
    descripcion_en = 'To round to N places, you look at the digit that follows: 5 or more, round up; less than 5, leave it as is.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["To round to N places, look at the digit that follows: 5 or more, it goes up; less than 5, it stays the same.","Rounding $3.14159$ to $2$ decimals: the third decimal is $1$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To round 3.14159 to 2 decimals, which digit do you have to look at?","opciones":["The third decimal (1)","The first decimal (1)","The last decimal (9)","The whole part (3)"],"respuesta":"The third decimal (1)","explicacion":"To round to N places, you look at the digit that follows — in this case, the third decimal."},{"pregunta":"Since that digit is less than 5, what happens to the second decimal?","opciones":["It stays the same","It goes up by 1","It becomes 0","It is removed together with the third"],"respuesta":"It stays the same","explicacion":"The rule is: 5 or more, it goes up; less than 5, it stays the same — and 1 < 5."},{"pregunta":"What is 3.14159 rounded to 2 decimals?","opciones":["3.14","3.15","3.1","3.142"],"respuesta":"3.14","explicacion":"The third decimal (1) is less than 5, so the result is 3.14."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.recta","despuesDePaso":1,"min":3.1,"max":3.2,"marcas":[{"valor":3.14159,"etiqueta":"3.14159"},{"valor":3.14,"etiqueta":"3.14 (rounded)"}],"titulo":"3.14159 rounded to 2 decimals"}]$leccion_en$::jsonb
    )
where slug = 'redondear-decimales';

update public.techniques
set nombre_en = 'A power is multiplying the number by itself',
    descripcion_en = 'aⁿ means multiplying "a" by itself "n" times.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["$a^n$ means multiplying \"a\" by itself \"n\" times.","$2^4$ means $2$ multiplied by itself $4$ times."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What does $2^4$ mean?","opciones":["2 multiplied by itself 4 times","2 added 4 times","2 multiplied by 4","4 multiplied by itself 2 times"],"respuesta":"2 multiplied by itself 4 times","explicacion":"The exponent tells how many times the base is multiplied by itself."},{"pregunta":"What is $2^4$?","opciones":["16","8","32","6"],"respuesta":"16","explicacion":"2×2=4, 4×2=8, 8×2=16."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.potencia","modo":"cadena","base":2,"exponente":4,"despuesDePaso":1,"titulo":"$2^4 = 16$"}]$leccion_en$::jsonb
    )
where slug = 'potencia-como-multiplicacion-repetida';

update public.techniques
set nombre_en = 'Square root by trying nearby squares',
    descripcion_en = 'To estimate a square root, look for which number squared comes closest.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["To estimate a square root, look for which number squared comes closest.","For $\\sqrt{49}$: $7 \\times 7 = 49$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To estimate $\\sqrt{49}$ by trial, what do you look for?","opciones":["Which number squared gives 49","Half of 49","The double of 49","A number that added to itself gives 49"],"respuesta":"Which number squared gives 49","explicacion":"The square root of 49 is the number that, squared, gives 49."},{"pregunta":"What is $\\sqrt{49}$?","opciones":["7","24.5","14","49"],"respuesta":"7","explicacion":"7×7=49, so $\\sqrt{49}=7$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.potencia","modo":"cuadricula","base":7,"exponente":2,"despuesDePaso":1,"titulo":"$\\sqrt{49} = 7$"}]$leccion_en$::jsonb
    )
where slug = 'raiz-cuadrada-por-tanteo';

update public.techniques
set nombre_en = 'Notation: counting the zeros',
    descripcion_en = 'A big number in scientific notation is a digit × 10 raised to the number of places the decimal point moved.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["A big number in scientific notation is a digit × 10 raised to the number of places the decimal point moved.","You count the zeros (or places) to know the exponent."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To write 3,000 in scientific notation, what do you count?","opciones":["How many places the decimal point moved","How many digits the number has","The first digit of the number","Half of the number"],"respuesta":"How many places the decimal point moved","explicacion":"The exponent of 10 is the number of places the decimal point moved."},{"pregunta":"How is 3,000 written in scientific notation?","opciones":["$3 \\times 10^3$","$3 \\times 10^4$","$30 \\times 10^2$","$3 \\times 10^2$"],"respuesta":"$3 \\times 10^3$","explicacion":"The point moved 3 places, so the exponent is 3: $3 \\times 10^3$."},{"pregunta":"How is 45,000 written in scientific notation?","opciones":["$4.5 \\times 10^4$","$45 \\times 10^3$","$4.5 \\times 10^3$","$45 \\times 10^4$"],"respuesta":"$4.5 \\times 10^4$","explicacion":"45,000 = 4.5 × 10,000, and $10.000=10^4$."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":1,"cuadros":[{"texto":"$3.000$ is written as $3 \\times 10^3$"},{"texto":"$45.000$ is written as $4.5 \\times 10^4$"}]}]$leccion_en$::jsonb
    )
where slug = 'notacion-cientifica-basica';

update public.techniques
set nombre_en = 'What a variable is',
    descripcion_en = 'x is not a mystery: it is a number you do not know yet, with a fixed value you can find.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["x is not a mystery: it is a number that is not known yet, with a fixed value that can be found.","In $x + 5 = 12$, there is only one number that makes the equation work: $x = 7$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"According to this lesson, what is a variable like x?","opciones":["An unknown number, but with a single fixed value that can be found","A number that can be anything at once","A letter that always stands for 1","A symbol with no numerical value"],"respuesta":"An unknown number, but with a single fixed value that can be found","explicacion":"x is not an infinite mystery: it stands for one specific number that makes the equation true."},{"pregunta":"In $x + 5 = 12$, how many values of x make the equation true?","opciones":["Only one","None","Infinitely many","Exactly two"],"respuesta":"Only one","explicacion":"There is only one number that makes the equation work: x=7."},{"pregunta":"Solving an equation means…","opciones":["Finding the number that makes the equality true","Inventing a new number","Changing the sign of the equation","Always adding 1 to each side"],"respuesta":"Finding the number that makes the equality true","explicacion":"It is exactly what the lesson says: solving for x is finding that single number."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.balanza","modo":"despejar","coefX":1,"constante":5,"resultado":12,"despuesDePaso":1}]$leccion_en$::jsonb
    )
where slug = 'que-es-una-variable';

update public.techniques
set nombre_en = 'Solving for x step by step',
    descripcion_en = 'To find x, undo the operations in reverse order — the last thing done to x is the first thing undone.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["To find x, undo the operations in reverse order — the last thing done to x is the first thing undone.","With $2x + 3 = 11$: first subtract $3$ from both sides, and then divide by $2$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"In $2x + 3 = 11$, which operation was done to x first and which afterwards?","opciones":["First it was multiplied by 2, then 3 was added","First 3 was added, then it was multiplied by 2","First it was divided, then subtracted","Both operations were done at the same time"],"respuesta":"First it was multiplied by 2, then 3 was added","explicacion":"That order matters: x was first multiplied by 2 and then 3 was added."},{"pregunta":"To solve for x, in what order are those operations undone?","opciones":["In reverse order: first subtract 3, then divide by 2","In the same order they were done","Dividing first, subtracting afterwards","The order does not matter"],"respuesta":"In reverse order: first subtract 3, then divide by 2","explicacion":"The last thing done to x is the first thing undone."},{"pregunta":"What is x in $2x + 3 = 11$?","opciones":["4","8","5.5","3"],"respuesta":"4","explicacion":"Subtracting 3 on both sides: 2x=8; dividing by 2: x=4."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.balanza","modo":"despejar","coefX":2,"constante":3,"resultado":11,"despuesDePaso":1}]$leccion_en$::jsonb
    )
where slug = 'despejar-paso-a-paso';

update public.techniques
set nombre_en = 'Check your answer by substituting',
    descripcion_en = 'Once you have solved for x, you can always check whether it is right by putting it back into the original equation.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Once x has been solved, you can always check whether it is right by putting it back into the original equation.","With $x = 4$ in $2x + 3 = 11$: $2(4) + 3 = 11$, it matches."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"If you solved x=4 in $2x+3=11$, how do you check that it is right?","opciones":["Replacing x with 4 in the original equation","Solving for x again from scratch","Changing the sign of the equation","Adding 4 to both sides"],"respuesta":"Replacing x with 4 in the original equation","explicacion":"Substituting the value you found into the original equation is the way to check the result."},{"pregunta":"When substituting x=4, what does $2(4)+3$ give?","opciones":["11","8","12","14"],"respuesta":"11","explicacion":"2×4=8, and 8+3=11 — it matches the right side of the original equation."},{"pregunta":"If the result of substituting does NOT match the other side of the equation, what does it mean?","opciones":["That you have to review the solving, something went wrong","That the equation has no solution","That x has two possible values","That you have to add the difference to x"],"respuesta":"That you have to review the solving, something went wrong","explicacion":"If it does not match, the value of x you found is not correct and you have to review the solving steps."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.balanza","modo":"verificar","coefX":2,"constante":3,"resultado":11,"despuesDePaso":1}]$leccion_en$::jsonb
    )
where slug = 'verificar-sustituyendo';

update public.techniques
set nombre_en = 'Pythagorean triples by heart',
    descripcion_en = 'Memorize 3-4-5, 5-12-13 and 8-15-17 (and their multiples, like 6-8-10) — if two sides of a right triangle fit one of these patterns, you already know the third without calculating any root.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Memorizing 3-4-5, 5-12-13 and 8-15-17 (and their multiples) lets you know the third side of a right triangle without calculating any root.","A right triangle with legs $8$ and $6$: it is the $3$-$4$-$5$ triple multiplied by $2$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which are the 3 base Pythagorean triples to memorize according to this technique?","opciones":["3-4-5, 5-12-13 and 8-15-17","1-2-3, 4-5-6 and 7-8-9","3-4-5 only","Any triple of consecutive numbers"],"respuesta":"3-4-5, 5-12-13 and 8-15-17","explicacion":"They are the 3 base triples the lesson mentions, plus their multiples."},{"pregunta":"A right triangle has legs 6 and 8. Which base triple do you recognize multiplied by 2?","opciones":["3-4-5","5-12-13","8-15-17","6-8-10 is not a multiple of any base triple"],"respuesta":"3-4-5","explicacion":"6=2×3 and 8=2×4, so it is the 3-4-5 triple multiplied by 2."},{"pregunta":"With this technique, how long is the hypotenuse of a triangle with legs 6 and 8?","opciones":["10","14","12","9"],"respuesta":"10","explicacion":"Since it is 3-4-5 multiplied by 2, the hypotenuse is 2×5=10, without calculating any root."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.figura","modo":"triangulo","cateto1":8,"cateto2":6,"despuesDePaso":1}]$leccion_en$::jsonb
    )
where slug = 'geometria-ternas-pitagoricas';

update public.techniques
set nombre_en = 'Area of composite shapes: split into simple parts',
    descripcion_en = 'An odd shape is almost always a big rectangle minus (or plus) a small one. Work out each part separately and add or subtract at the end.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["An odd shape is almost always a big rectangle minus (or plus) a small one. Work out each part separately and add or subtract at the end.","A rectangle of $10 \\times 8$ with a corner of $3 \\times 2$ cut out."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"To find the area of a composite shape, this technique says to split it into…","opciones":["Simple parts (like rectangles) and work out each one separately","Triangles always, without exception","A single shape whatever the figure","Inscribed circles"],"respuesta":"Simple parts (like rectangles) and work out each one separately","explicacion":"An odd shape is almost always a big rectangle minus (or plus) a small one."},{"pregunta":"A 10×8 rectangle has a 3×2 corner cut out. What is the area of the big rectangle?","opciones":["80","74","6","24"],"respuesta":"80","explicacion":"10×8=80 is the area of the whole rectangle, before subtracting the cut-out corner."},{"pregunta":"What is the final area of that shape (10×8 with a 3×2 corner cut out)?","opciones":["74","80","6","86"],"respuesta":"74","explicacion":"80 (big rectangle) − 6 (cut-out corner, 3×2) = 74."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.figura","modo":"areaCompuesta","anchoGrande":10,"altoGrande":8,"anchoRecorte":3,"altoRecorte":2,"despuesDePaso":1}]$leccion_en$::jsonb
    )
where slug = 'geometria-area-compuestas';

update public.techniques
set nombre_en = 'π ≈ 22/7 when the radius is a multiple of 7, otherwise 3.14',
    descripcion_en = 'With radii that are multiples of 7, using 22/7 instead of 3.14 leaves exact calculations with no decimals. With any other radius, 3.14 is still the best quick approximation.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["With radii that are multiples of 7, using 22/7 instead of 3.14 leaves exact calculations with no decimals. With any other radius, 3.14 is still the best quick approximation.","Circle of radius $7$: area $= \\pi \\times 7^2$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"According to this technique, when is it better to use $\\dfrac{22}{7}$ instead of 3.14 for π?","opciones":["When the radius is a multiple of 7","Always, it is more accurate","When the radius is even","Never, 3.14 is always better"],"respuesta":"When the radius is a multiple of 7","explicacion":"With radii that are multiples of 7, $\\dfrac{22}{7}$ cancels the 7 of the squared radius and leaves exact calculations."},{"pregunta":"For a circle of radius 7, what is the area using $\\dfrac{22}{7}$?","opciones":["154","150","144","161"],"respuesta":"154","explicacion":"$\\dfrac{22}{7} \\times 49 = 22 \\times 7 = 154$, exact with no decimals."},{"pregunta":"For a circle of radius 5 (not a multiple of 7), which approximation is better to use?","opciones":["3.14","22/7","3.5","None, you have to use exact π"],"respuesta":"3.14","explicacion":"5 is not a multiple of 7, so 3.14 is still the best quick approximation for that case."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.figura","modo":"circulo","radio":7,"despuesDePaso":1}]$leccion_en$::jsonb
    )
where slug = 'geometria-pi-fraccion';

update public.techniques
set nombre_en = 'Complementary and supplementary angles, at a glance',
    descripcion_en = 'Complementary angles add up to 90°, supplementary angles add up to 180°. Subtract straight from the total — there is no need to set up an equation for this.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Complementary angles add up to 90°, supplementary angles add up to 180°. You subtract straight from the total — there is no need to set up an equation for this.","Two supplementary angles, one measures $125°$: the other measures $55°$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Two supplementary angles add up to…","opciones":["180°","90°","360°","45°"],"respuesta":"180°","explicacion":"Supplementary angles add up to 180°; complementary angles add up to 90°, according to this technique."},{"pregunta":"If a supplementary angle measures 125°, how much does the other one measure?","opciones":["55°","65°","125°","35°"],"respuesta":"55°","explicacion":"180−125=55, just as the lesson example shows."},{"pregunta":"What operation should you use to find the missing complementary or supplementary angle?","opciones":["Subtract straight from the total (90° or 180°), with no need for an equation","Always set up an equation with x","Divide the given angle by 2","Multiply the given angle by 2"],"respuesta":"Subtract straight from the total (90° or 180°), with no need for an equation","explicacion":"The technique avoids setting up an equation: it is enough to subtract straight from the total."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.figura","modo":"angulos","tipoAngulo":"suplementario","conocido":125,"despuesDePaso":1}]$leccion_en$::jsonb
    )
where slug = 'geometria-angulos-complementarios';

update public.techniques
set nombre_en = 'Basic concepts: place value, adding and subtracting',
    descripcion_en = 'What each digit means depending on its position, and where the carry (when adding) and the borrowing (when subtracting) come from.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Each digit of a number is worth something different depending on its position: in 248, the 2 is 2 hundreds (200), the 4 is 4 tens (40) and the 8 is 8 ones.","Adding is putting together, column by column. When a column goes over 9, you \"carry\" 1 to the next column — for example, if the ones give 14, you write down the 4 and add that 1 to the tens.","Subtracting is taking away. If the top digit is smaller than the bottom one, that column \"borrows\" 1 from the next position: the one that lends goes down by 1, and the one that borrows gains 10."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What is the 4 worth in the number 248?","opciones":["4 ones","4 tens (40)","4 hundreds (400)"],"respuesta":"4 tens (40)","explicacion":"In 248, the 2 is in the hundreds, the 4 in the tens and the 8 in the ones: the 4 is worth 40."},{"pregunta":"When adding 248 + 176, what happens in the ones column?","opciones":["8+6=14, write 4 and carry 1","8+6=14, write 1 and carry 4","8+6=14, write 14"],"respuesta":"8+6=14, write 4 and carry 1","explicacion":"14 has one digit too many: the 4 stays in the ones and the 1 is carried to the tens column."},{"pregunta":"When subtracting 532 − 178, what happens in the ones column?","opciones":["2 is less than 8: you borrow and 12−8=4","2 is less than 8: the result is negative","2−8=6"],"respuesta":"2 is less than 8: you borrow and 12−8=4","explicacion":"Since 2 < 8, that column borrows 1 from the tens: 12−8=4."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.columnas","operacion":"suma","a":248,"b":176,"despuesDePaso":1,"titulo":"248 + 176, column by column"},{"tipo":"numeria.columnas","operacion":"resta","a":532,"b":178,"despuesDePaso":2,"titulo":"532 − 178, borrowing"}]$leccion_en$::jsonb
    )
where slug = 'numeria-clase-conceptos-basicos';

update public.techniques
set nombre_en = 'Column multiplication: partial products',
    descripcion_en = 'What multiplying means and how column multiplication is built with partial products.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Multiplying a×b means adding a, b times: 23×3 is 23+23+23. For bigger numbers we use a shortcut, column multiplication.","You multiply the top number by each digit of the bottom one, starting with the ones — each partial product moves one place to the left because that digit is worth ten times more than the previous one.","The final result is the sum of all the partial products."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"In 23×14, what does the partial product 230 represent?","opciones":["23×1 (the ten of 14), moved one place","23×4, moved one place","The whole 23×14"],"respuesta":"23×1 (the ten of 14), moved one place","explicacion":"The 1 of 14 is worth 10 (one ten), so 23×1 moves one place: 230."},{"pregunta":"What does 23×14 give?","opciones":["322","312","342"],"respuesta":"322","explicacion":"92 (23×4) + 230 (23×10) = 322."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.multiplicacion","a":23,"b":14,"despuesDePaso":1,"titulo":"23 × 14, product by product"}]$leccion_en$::jsonb
    )
where slug = 'numeria-clase-multiplicacion';

update public.techniques
set nombre_en = 'Long division: the "house", step by step',
    descripcion_en = 'How to share out the dividend digit by digit: bring down, see how many times it fits, multiply and subtract.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Long division (the \"house\") shares out the dividend digit by digit: you bring down a digit, see how many times the divisor fits, multiply and subtract.","You repeat the process bringing down the next digit until you have used them all. What is left over at the end is the remainder."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"When dividing 937 by 4, how many times does 4 fit into the first 9?","opciones":["2 times (remainder 1)","3 times (remainder 0)","9 times"],"respuesta":"2 times (remainder 1)","explicacion":"4×2=8, and 9−8=1: it fits 2 times with remainder 1 (that 1 is carried to the next column)."},{"pregunta":"What is the quotient of 937 ÷ 4?","opciones":["234","243","324"],"respuesta":"234","explicacion":"Bringing down each digit: 9÷4=2 (remainder 1), 13÷4=3 (remainder 1), 17÷4=4 (remainder 1) → quotient 234."},{"pregunta":"What is the final remainder of 937 ÷ 4?","opciones":["1","0","4"],"respuesta":"1","explicacion":"234×4=936, and 937−936=1."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.division","dividendo":937,"divisor":4,"despuesDePaso":1,"titulo":"937 ÷ 4, the house"}]$leccion_en$::jsonb
    )
where slug = 'numeria-clase-division';

update public.techniques
set nombre_en = 'Least common multiple (LCM)',
    descripcion_en = 'What the LCM is and how to find it by listing the multiples of each number until they match.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The least common multiple (LCM) of two numbers is the first number that appears in both multiplication tables.","You list the multiples of each number until the same value shows up in both lists — that is the LCM.","The LCM of the denominators is the \"common ground\" used to add or subtract fractions with different denominators, in the next class."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What is the LCM of 4 and 6?","opciones":["12","24","10"],"respuesta":"12","explicacion":"Multiples of 4: 4, 8, 12... Multiples of 6: 6, 12... The first one in common is 12."},{"pregunta":"What is the LCM used for when working with fractions?","opciones":["To find a common denominator","To simplify any fraction","To multiply numerators"],"respuesta":"To find a common denominator","explicacion":"The LCM of the denominators gives the smallest possible common denominator."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.mcm","a":4,"b":6,"despuesDePaso":1,"titulo":"LCM of 4 and 6"}]$leccion_en$::jsonb
    )
where slug = 'numeria-clase-mcm';

update public.techniques
set nombre_en = 'Operations with fractions',
    descripcion_en = 'Adding and subtracting with a common denominator, and multiplying and dividing fractions — each with its own procedure.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["To add or subtract fractions with different denominators, you first convert them to the common denominator (the LCM you saw in the previous class) and then you add or subtract only the numerators.","To multiply fractions, you multiply numerator by numerator and denominator by denominator — no common denominator is needed.","To divide fractions, you multiply by the reciprocal fraction of the second term (flip its numerator and denominator)."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What does 1/4 + 1/6 give with a common denominator?","opciones":["5/12","2/10","1/12"],"respuesta":"5/12","explicacion":"LCM(4,6)=12: 1/4=3/12 and 1/6=2/12. 3/12+2/12=5/12."},{"pregunta":"What does 2/3 × 3/5 give?","opciones":["2/5","6/8","5/6"],"respuesta":"2/5","explicacion":"2×3=6 (numerator) and 3×5=15 (denominator): 6/15, which simplified is 2/5."},{"pregunta":"What does 2/3 ÷ 3/5 give?","opciones":["10/9","6/15","9/10"],"respuesta":"10/9","explicacion":"Dividing is multiplying by the reciprocal: 2/3 × 5/3 = 10/9."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"numeria.fraccion","operacion":"suma","num1":1,"den1":4,"num2":1,"den2":6,"despuesDePaso":0,"titulo":"1/4 + 1/6"},{"tipo":"numeria.fraccion","operacion":"multiplicacion","num1":2,"den1":3,"num2":3,"den2":5,"despuesDePaso":1,"titulo":"2/3 × 3/5"},{"tipo":"numeria.fraccion","operacion":"division","num1":2,"den1":3,"num2":3,"den2":5,"despuesDePaso":2,"titulo":"2/3 ÷ 3/5"}]$leccion_en$::jsonb
    )
where slug = 'numeria-clase-fracciones-operaciones';
