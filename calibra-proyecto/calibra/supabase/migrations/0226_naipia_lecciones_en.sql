-- ============================================================
-- Prodigia — naipia: lecciones de Aprender en inglés (13 lecciones).
-- Requiere 0225_lecciones_en_columnas.sql.
--
-- Llena nombre_en, descripcion_en y contenido_en de cada lección (Técnicas y Clases).
-- contenido_en = el contenido en español con `pasos`, `quiz` y `visuales` reemplazados
-- por su versión en inglés (misma forma, mismas preguntas y mismas posiciones de la
-- respuesta correcta): lo que no se traduce (ids, programas, símbolos) queda igual.
-- Solo UPDATE por slug; no toca progreso ni el contenido en español.
--
-- Este archivo se GENERA desde src/lib/i18n-lecciones/en/naipia.ts y el test
-- src/lib/i18n-lecciones/traducciones.test.ts comprueba que coincida. No editar a
-- mano. Regenerar: I18N_LECCIONES_ESCRIBIR_SQL=1 npx vitest run src/lib/i18n-lecciones
-- (0226)
-- ============================================================

update public.techniques
set nombre_en = 'Group cards into pairs that cancel out',
    descripcion_en = 'Instead of adding card by card, look for pairs of opposite value: they cancel and you only count what is left over.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["In Hi-Lo, a low card is worth $+1$ and a high card is worth $-1$. If you see one of each, they cancel: together they are worth $0$.","Look at the sequence below: first the neutral cards are set aside, then the pairs are found. Only what is left without a partner counts: here the count is $0$.","Pairs do not have to be next to each other, but never use the same card in two pairs."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"With Hi-Lo, what do a 4 and a queen add up to together?","opciones":["0","+2","-2","+1"],"respuesta":"0","explicacion":"The 4 is worth +1 and the queen is worth -1: they cancel and add up to 0."},{"pregunta":"With Hi-Lo, what is the count of 5♠ K♦ 2♥ J♣ 8♠?","opciones":["1","0","-1","2"],"respuesta":"0","explicacion":"The 5 and the K cancel, the 2 and the J cancel, and the 8 is worth 0: the count is 0."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"naipia.valores","sistema":"hilo","despuesDePaso":0,"titulo":"Low, neutral and high cards in Hi-Lo"},{"tipo":"naipia.cancelacion","sistema":"hilo","cartas":["K♠","3♥","9♦","5♣","A♠","2♦","7♥","Q♣"],"despuesDePaso":1,"titulo":"The pairs touch and disappear"}]$leccion_en$::jsonb
    )
where slug = 'naipia-tecnica-pares';

update public.techniques
set nombre_en = 'Count in blocks',
    descripcion_en = 'Split the sequence into blocks of 3 or 4 cards, sum up each block with a single number and add the summaries.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Adding card by card forces you to update the count many times, and every update is a chance to make a mistake. With blocks you sum up three cards at a glance and update only once.","Look at a block, work out its whole value and only then add it to the running count. Here the blocks are worth $+3$, $-2$ and $+1$, and the final count is $+2$.","With practice the block grows on its own. If you start making mistakes, go back to smaller blocks: at the beginning accuracy matters more than speed."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"With Hi-Lo, what is the block 3♠ 9♥ Q♦ worth?","opciones":["1","-1","0","2"],"respuesta":"0","explicacion":"The 3 is worth +1, the 9 is worth 0 and the queen is worth -1: 1 + 0 - 1 = 0."},{"pregunta":"With Hi-Lo, if the running count was +3 and the block 2♠ 4♥ K♦ arrives, what is the new count?","opciones":["3","5","1","4"],"respuesta":"4","explicacion":"The block is worth +1 +1 -1 = +1, so 3 + 1 = 4."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"naipia.conteo","sistema":"hilo","cartas":["4♠","6♥","2♦","K♣","8♠","A♥","3♣","10♦","5♠"],"bloque":3,"velocidad":2200,"despuesDePaso":1,"titulo":"A block of 3 cards, a single update"}]$leccion_en$::jsonb
    )
where slug = 'naipia-tecnica-bloques';

update public.techniques
set nombre_en = 'Find your rhythm',
    descripcion_en = 'Counting fast is not counting in a hurry: an even rhythm avoids jumps and recounts.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The main cause of mistakes is not the arithmetic but an uneven rhythm: speeding up on the easy cards and getting stuck on the hard ones makes you lose the thread.","Choose a rhythm you can keep up and hold it card after card. Keep only the running count in your head, without repeating the list of cards.","If you lose the thread, do not guess: go back to a count you know and carry on at the same rhythm."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What should you prioritize when you start training?","opciones":["Accuracy first, speed later","Speed first, accuracy later","Remembering every suit","Counting every card out loud"],"respuesta":"Accuracy first, speed later","explicacion":"An even, mistake-free rhythm is built first; speed comes after you master accuracy."},{"pregunta":"What should you keep in your head while you count?","opciones":["The full list of cards seen","Only the running count","The suit of each card","How many kings have come out"],"respuesta":"Only the running count","explicacion":"Keeping a single number leaves your working memory free."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"naipia.conteo","sistema":"hilo","cartas":["5♠","K♥","2♦","8♣","Q♠","4♥","9♦","6♣","A♠","3♥","10♦","7♠"],"velocidad":1100,"despuesDePaso":1,"titulo":"One card at regular intervals, always the same"},{"tipo":"cuadros","despuesDePaso":2,"titulo":"How to train your rhythm","cuadros":[{"texto":"First, accuracy: count without hurry until you stop making mistakes.","resaltar":"0 errores"},{"texto":"Once you stop making mistakes, shorten the time per card little by little."},{"texto":"If you start failing again, step back: an even rhythm is built, not forced."}]}]$leccion_en$::jsonb
    )
where slug = 'naipia-tecnica-ritmo';

update public.techniques
set nombre_en = 'Check: a full deck adds up to 0',
    descripcion_en = 'In a balanced system, the 52 cards of a deck add up to exactly 0: use it to check your count.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["A deck has 52 cards, 4 of each rank. In Hi-Lo, added together, they give exactly $0$: that is why it is a balanced system.","It is useful to check your count: if you counted a whole deck and did not get $0$, there was a mistake.","And it works the other way round: what is left of the deck adds up to the opposite of what you have already seen."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"With Hi-Lo, what does a full 52-card deck add up to?","opciones":["4","-4","0","52"],"respuesta":"0","explicacion":"There are 20 cards of +1, 20 of -1 and 12 of 0: the sum is 0."},{"pregunta":"You saw part of a deck with Hi-Lo and the count was +5. What do the cards left in that deck add up to?","opciones":["5","0","-52","-5"],"respuesta":"-5","explicacion":"The full deck adds up to 0, so what is left adds up to the opposite of what was seen: -5."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"naipia.mazo","sistema":"hilo","despuesDePaso":0,"titulo":"The sum of a full deck"},{"tipo":"cuadros","despuesDePaso":2,"titulo":"What is left of the deck","cuadros":[{"texto":"You saw 10 cards from a deck: 2♠ 3♥ 4♦ 9♣ K♠ 5♥ 7♦ 6♣ Q♥ 8♠."},{"texto":"Their Hi-Lo count:","formula":"1 + 1 + 1 + 0 - 1 + 1 + 0 + 1 - 1 + 0 = 3","resaltar":"$+3$"},{"texto":"The full deck adds up to $0$, so the 42 cards left add up to:","formula":"0 - (+3) = -3","resaltar":"$-3$"}]}]$leccion_en$::jsonb
    )
where slug = 'naipia-tecnica-mazo-cero';

update public.techniques
set nombre_en = 'Neutral cards are not counted',
    descripcion_en = 'Every system has cards worth 0: learning which ones they are saves you work and mistakes.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["In Hi-Lo, the 7, 8 and 9 are worth $0$: when they come out there is nothing to do, the count stays the same.","Example: 8♠ 9♥ 7♦ 4♣ are three neutral cards and a 4 worth $+1$. The count is $+1$.","Careful: the neutral cards change from one system to another. In KO the 7 is worth $+1$, and in Hi-Opt II the Ace is worth $0$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"With Hi-Lo, which cards are worth 0?","opciones":["7, 8 and 9","2, 3 and 4","10, J and Q","Only the 8"],"respuesta":"7, 8 and 9","explicacion":"In Hi-Lo the cards from 7 to 9 are neutral."},{"pregunta":"With Hi-Lo, what is the count of 7♠ 8♥ 9♦?","opciones":["1","0","-1","3"],"respuesta":"0","explicacion":"All three are neutral: the count does not move."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"naipia.valores","sistema":"hilo","enfatizar":0,"despuesDePaso":0,"titulo":"The neutral cards of Hi-Lo"},{"tipo":"naipia.conteo","sistema":"hilo","cartas":["8♠","9♥","7♦","4♣"],"velocidad":1500,"despuesDePaso":1,"titulo":"Neutral cards do not move the count"},{"tipo":"naipia.comparar","sistemas":["hilo","ko","hiopt2","omega2"],"cartas":["7♠","8♥","9♦","A♣"],"despuesDePaso":2,"titulo":"Neutral cards change depending on the system"}]$leccion_en$::jsonb
    )
where slug = 'naipia-tecnica-neutras';

update public.techniques
set nombre_en = 'Class 1: Why we count values and not cards',
    descripcion_en = 'The central idea of the sport: sum up what happened in a single small number instead of remembering every card.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["A 52-card deck is too much information to remember in full. Counting systems sum it up in a single small number: the running count.","Look at it with five cards: each one moves the count according to its value. With Hi-Lo, 3♠ K♥ 6♦ 2♣ 9♠ ends at $+2$.","The order in which the cards come out does not change the final count: only how many of each value you saw matters.","Training counting is training sustained attention and fast mental arithmetic, not photographic memory."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What do you keep in your head when counting cards?","opciones":["The full list of cards seen","Only the suit of each card","A single number that is updated card by card","How many cards are left of each suit"],"respuesta":"A single number that is updated card by card","explicacion":"All systems sum up what has been seen in a single number: the running count."},{"pregunta":"Does the order in which the cards come out change the final running count?","opciones":["Yes, it always changes it","Only if there are face cards","Only if a suit repeats","No, only the values seen matter"],"respuesta":"No, only the values seen matter","explicacion":"The final count is the sum of values; a sum does not depend on order."},{"pregunta":"With Hi-Lo (2 through 6 = +1, 7 through 9 = 0, 10 through Ace = -1), what is the count of 4♠ 4♥ Q♦ A♣ 5♠?","opciones":["1","3","-1","0"],"respuesta":"1","explicacion":"The two 4s give +2, the Q and the Ace give -2 and the 5 gives +1: +1 in total."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":0,"titulo":"From 52 cards to a single number","cuadros":[{"texto":"Remembering every card seen is too much: working memory holds only a few items at a time."},{"texto":"Instead, each card adds a small value: low cards $+1$, neutral cards $0$ and high cards $-1$ (example: Hi-Lo)."},{"texto":"You only carry one number, the running count, which goes up or down card by card."},{"texto":"If many low cards have come out, more high cards remain in what is left, and the number goes up."}]},{"tipo":"naipia.conteo","sistema":"hilo","cartas":["3♠","K♥","6♦","2♣","9♠"],"velocidad":1500,"despuesDePaso":1,"titulo":"Every card moves the count"},{"tipo":"cuadros","despuesDePaso":2,"titulo":"Order does not matter","cuadros":[{"texto":"The same cards in a different order: 9♠ 2♣ K♥ 6♦ 3♠."},{"texto":"The same values, added in a different order:","formula":"0 + 1 - 1 + 1 + 1 = 2","resaltar":"$+2$"},{"texto":"Same final count: a sum does not depend on the order of its terms."}]}]$leccion_en$::jsonb
    )
where slug = 'naipia-clase-por-que-valores';

update public.techniques
set nombre_en = 'Class 2: Hi-Lo, the base system',
    descripcion_en = 'The Hi-Lo values, how to keep the running count and how to check that your count is consistent.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Hi-Lo has only three values: low cards are worth $+1$, neutral cards $0$ and high cards $-1$. The count starts at $0$.","Every card that comes out moves the count according to its value; neutral cards leave it unchanged. This sequence ends at $0$.","Check: a full deck adds up to $0$. If you counted a whole deck and did not get $0$, review it.","Typical mistakes: counting the Ace as a low card (here it is a high card and is worth $-1$) and counting the 7 as $+1$ (in Hi-Lo it is neutral; only in KO is it worth $+1$)."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"With Hi-Lo, what is the count of 2♠ 3♥ 4♦ 5♣?","opciones":["2","4","0","-4"],"respuesta":"4","explicacion":"Four low cards: +1 each, +4 in total."},{"pregunta":"With Hi-Lo, what is the count of 7♠ K♥ 3♦ 10♣ 2♠ 5♥?","opciones":["2","0","1","3"],"respuesta":"1","explicacion":"Step by step: 7♠ (0) → 0; K♥ (-1) → -1; 3♦ (+1) → 0; 10♣ (-1) → -1; 2♠ (+1) → 0; 5♥ (+1) → +1."},{"pregunta":"What is the Ace worth in Hi-Lo?","opciones":["+1","0","-2","-1"],"respuesta":"-1","explicacion":"In Hi-Lo the Ace is counted as a high card: -1."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"naipia.valores","sistema":"hilo","despuesDePaso":0,"titulo":"The Hi-Lo values"},{"tipo":"naipia.conteo","sistema":"hilo","cartas":["7♠","K♥","3♦","10♣","2♠","5♥","A♦","9♣","6♠","J♥"],"velocidad":1100,"despuesDePaso":1,"titulo":"Running count step by step"},{"tipo":"naipia.mazo","sistema":"hilo","despuesDePaso":2,"titulo":"Why Hi-Lo is balanced"}]$leccion_en$::jsonb
    )
where slug = 'naipia-clase-hilo';

update public.techniques
set nombre_en = 'Class 3: Cancellation and speed',
    descripcion_en = 'How to combine cancelling pairs, neutral cards and blocks to count faster without losing accuracy.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Speed comes from three habits: discarding neutral cards without looking at them, cancelling pairs of opposite value and summing up by blocks.","First the neutral cards are set aside and then the pairs are cancelled. What is left without a partner is the count: here $+1$.","The same count in blocks of 4 cards: a single update per block.","If the order is unfavorable, the count moves a lot before recovering: do not panic, count calmly. Train the length of the sequence first and only then shorten the time."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"With Hi-Lo, what count is left after cancelling pairs in J♠ 2♥ 9♦ 3♣ 5♠?","opciones":["2","0","-1","3"],"respuesta":"2","explicacion":"The J and the 2 cancel; the 9 is neutral; the 3 and the 5 are left (+1 and +1): the count is +2. Careful with pairs: do not use a card twice."},{"pregunta":"With Hi-Lo, what is the count of Q♠ 4♥ 8♦ K♣ 6♠ 9♥ A♦ 2♣?","opciones":["1","0","-1","2"],"respuesta":"0","explicacion":"Step by step: Q♠ (-1) → -1; 4♥ (+1) → 0; 8♦ (0) → 0; K♣ (-1) → -1; 6♠ (+1) → 0; 9♥ (0) → 0; A♦ (-1) → -1; 2♣ (+1) → 0."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"naipia.cancelacion","sistema":"hilo","cartas":["Q♠","4♥","8♦","K♣","6♠","9♥","A♦","2♣","10♠","3♦","7♣","5♥"],"despuesDePaso":1,"titulo":"Discard neutral cards and cancel pairs"},{"tipo":"naipia.conteo","sistema":"hilo","cartas":["Q♠","4♥","8♦","K♣","6♠","9♥","A♦","2♣","10♠","3♦","7♣","5♥"],"bloque":4,"velocidad":2400,"despuesDePaso":2,"titulo":"In blocks of 4"}]$leccion_en$::jsonb
    )
where slug = 'naipia-clase-cancelacion';

update public.techniques
set nombre_en = 'Class 4: KO, an unbalanced system',
    descripcion_en = 'The KO system values the 7 as a low card: it is simpler to use with several decks, but its full deck does not add up to 0.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["KO uses the same groups as Hi-Lo with one difference: the 7 is also worth $+1$.","Since there are more cards of $+1$ than of $-1$, a full deck adds up to $+4$, not $0$: KO is an unbalanced system.","Count this sequence with KO: it gives $+4$. With Hi-Lo the same sequence gives $+2$: the 7s change the result.","Since the full deck adds up to $+4$, what is left is worked out by subtracting from $+4$, not from $0$."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What does a full 52-card deck add up to with KO?","opciones":["0","-4","4","24"],"respuesta":"4","explicacion":"There are 24 cards of +1 (2 through 7) and 20 of -1: 24 - 20 = 4."},{"pregunta":"With KO, what is the count of 7♠ 7♥ K♦?","opciones":["-1","0","3","1"],"respuesta":"1","explicacion":"Each 7 is worth +1 and the king is worth -1: 1 + 1 - 1 = 1."},{"pregunta":"You saw 7♠ K♥ 4♦ 9♣ 7♥ 2♠ from a deck with KO. What do the cards that are left add up to?","opciones":["1","-3","3","7"],"respuesta":"1","explicacion":"What was seen adds up to +3; the full deck adds up to +4; what is left is 4 - (+3) = 1."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"naipia.valores","sistema":"ko","despuesDePaso":0,"titulo":"The KO values"},{"tipo":"naipia.mazo","sistema":"ko","despuesDePaso":1,"titulo":"The full deck does not go back to 0"},{"tipo":"naipia.conteo","sistema":"ko","cartas":["7♠","K♥","4♦","9♣","7♥","2♠","A♦","8♣","6♠","3♥"],"velocidad":1100,"despuesDePaso":2,"titulo":"Counting with KO"},{"tipo":"cuadros","despuesDePaso":3,"titulo":"What is left of the deck with KO","cuadros":[{"texto":"You saw the 10 cards 7♠ K♥ 4♦ 9♣ 7♥ 2♠ A♦ 8♣ 6♠ 3♥ and the KO count was $+4$."},{"texto":"The 42 cards that are left add up to the total of the deck minus what was seen:","formula":"4 - (4) = 0","resaltar":"$0$"}]}]$leccion_en$::jsonb
    )
where slug = 'naipia-clase-ko';

update public.techniques
set nombre_en = 'Class 5: Why there are different systems',
    descripcion_en = 'Accuracy against speed: each system chooses how many different values to distinguish, and that changes the mental effort.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["All systems sum up the sequence in one number, but they differ in how many values they distinguish: Hi-Lo and KO use three; Hi-Opt II and Omega II use up to five.","Look at the same sequence with the four systems: Hi-Lo gives $+2$, KO $+3$, Hi-Opt II $+5$ and Omega II $+5$.","More values capture more detail about the cards that are left, but each card demands a finer decision and speed drops. There is no best system: it is a balance between accuracy and speed.","That is why counts from different systems are not compared: each one has its own scale. Master one before moving on to the next."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Why is Hi-Opt II usually more accurate than Hi-Lo?","opciones":["It uses fewer values","It distinguishes more values, although it demands more mental effort","It does not require memory","It always adds up to 0 on each card"],"respuesta":"It distinguishes more values, although it demands more mental effort","explicacion":"More different values capture more detail, at the cost of speed and effort."},{"pregunta":"With the sequence 6♠ K♥ 4♦ 9♣ 2♥ A♠ 5♦ 7♣, what count does Hi-Opt II give?","opciones":["6","4","5","7"],"respuesta":"5","explicacion":"With Hi-Opt II: 6♠ (+1) → +1; K♥ (-2) → -1; 4♦ (+2) → +1; 9♣ (0) → +1; 2♥ (+1) → +2; A♠ (0) → +2; 5♦ (+2) → +4; 7♣ (+1) → +5."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"naipia.comparar","sistemas":["hilo","ko","hiopt2","omega2"],"cartas":["6♠","K♥","4♦","9♣","2♥","A♠","5♦","7♣"],"despuesDePaso":1,"titulo":"The same sequence, four systems"}]$leccion_en$::jsonb
    )
where slug = 'naipia-clase-sistemas';

update public.techniques
set nombre_en = 'Class 6: Hi-Opt II',
    descripcion_en = 'Values from $+2$ to $-2$: more accuracy in exchange for more effort per card.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Hi-Opt II uses five values, from $+2$ to $-2$: more accuracy in exchange for more effort per card.","It is balanced: a full deck adds up to $0$.","Differences with Hi-Lo that you have to memorize: the Ace and the 9 are neutral, the 7 is worth $+1$ and the cards of $+2$ and $-2$ move the count twice as much. This sequence ends at $+3$.","Cancellation: a $+2$ (4 or 5) cancels with a $-2$ (10, J, Q, K). The $+1$ cards have no $-1$ partner in this system, so they pile up."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What is the Ace worth in Hi-Opt II?","opciones":["-1","-2","+1","0"],"respuesta":"0","explicacion":"In Hi-Opt II the Ace is neutral."},{"pregunta":"With Hi-Opt II, what is the count of 5♠ 4♥ Q♦?","opciones":["2","1","-2","4"],"respuesta":"2","explicacion":"The 5 and the 4 are worth +2 each and the queen -2: 2 + 2 - 2 = 2."},{"pregunta":"With Hi-Opt II, what is the count of 4♠ 10♥ 6♦ A♣ 3♠ K♦ 5♥ 8♣ 2♠?","opciones":["4","3","2","5"],"respuesta":"3","explicacion":"Step by step: 4♠ (+2) → +2; 10♥ (-2) → 0; 6♦ (+1) → +1; A♣ (0) → +1; 3♠ (+1) → +2; K♦ (-2) → 0; 5♥ (+2) → +2; 8♣ (0) → +2; 2♠ (+1) → +3."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"naipia.valores","sistema":"hiopt2","despuesDePaso":0,"titulo":"The Hi-Opt II values"},{"tipo":"naipia.mazo","sistema":"hiopt2","despuesDePaso":1,"titulo":"A full deck adds up to 0"},{"tipo":"naipia.conteo","sistema":"hiopt2","cartas":["4♠","10♥","6♦","A♣","3♠","K♦","5♥","8♣","2♠"],"velocidad":1100,"despuesDePaso":2,"titulo":"Counting with Hi-Opt II"},{"tipo":"naipia.cancelacion","sistema":"hiopt2","cartas":["5♠","Q♦","4♥","J♣","6♠","3♦","8♥","7♣"],"despuesDePaso":3,"titulo":"The +2s and the -2s cancel; the +1s pile up"}]$leccion_en$::jsonb
    )
where slug = 'naipia-clase-hiopt2';

update public.techniques
set nombre_en = 'Class 7: Omega II',
    descripcion_en = 'A fine multi-value system in which the 9 is worth $-1$ and the Ace is neutral.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Omega II also uses five values. The 9 is worth $-1$ and the Ace is neutral ($0$).","It is a balanced system: a full deck adds up to $0$.","Differences with Hi-Opt II: here the 6 is worth $+2$ (there $+1$) and the 9 is worth $-1$ (there $0$). Those are the two ranks that are most often mixed up when switching systems.","Example: 6♠ 9♥ 2♦ K♣ A♠ 7♦ 4♥ 10♠ 8♣ ends at $+1$. In cancellation, a $+1$ can only be cancelled by a $-1$, and the only $-1$ is the 9."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What is the 9 worth in Omega II?","opciones":["0","+1","-1","-2"],"respuesta":"-1","explicacion":"In Omega II the 9 is worth -1."},{"pregunta":"With Omega II, what is the count of 6♠ 9♥ K♦?","opciones":["1","-3","2","-1"],"respuesta":"-1","explicacion":"The 6 is worth +2, the 9 is worth -1 and the king is worth -2: 2 - 1 - 2 = -1."},{"pregunta":"With Omega II, what is the count of 6♠ 9♥ 2♦ K♣ A♠ 7♦ 4♥ 10♠ 8♣?","opciones":["1","2","0","3"],"respuesta":"1","explicacion":"Step by step: 6♠ (+2) → +2; 9♥ (-1) → +1; 2♦ (+1) → +2; K♣ (-2) → 0; A♠ (0) → 0; 7♦ (+1) → +1; 4♥ (+2) → +3; 10♠ (-2) → +1; 8♣ (0) → +1."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"naipia.valores","sistema":"omega2","despuesDePaso":0,"titulo":"The Omega II values"},{"tipo":"naipia.mazo","sistema":"omega2","despuesDePaso":1,"titulo":"A full deck adds up to 0"},{"tipo":"naipia.comparar","sistemas":["hiopt2","omega2"],"cartas":["6♠","9♥","A♦","7♣"],"despuesDePaso":2,"titulo":"Omega II compared with Hi-Opt II"},{"tipo":"naipia.conteo","sistema":"omega2","cartas":["6♠","9♥","2♦","K♣","A♠","7♦","4♥","10♠","8♣"],"velocidad":1100,"despuesDePaso":3,"titulo":"Counting with Omega II"}]$leccion_en$::jsonb
    )
where slug = 'naipia-clase-omega2';

update public.techniques
set nombre_en = 'Class 8: True count and estimating the cards left',
    descripcion_en = 'Dividing the running count by the decks left to compare different situations, always declaring the rounding rule.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["A running count of $+6$ means different things if 6 decks are left or only 1. The true count corrects for that by dividing by the decks left.","Example: in a set of 4 decks, 96 cards came out. There are 112 cards left, that is 2.15 decks: to the nearest half deck, 2. With a running count of $+10$: 10 ÷ 2 = 5.","The result is almost never a whole number, so the rounding rule is always declared. With negative values the rules differ: -7 ÷ 3 = -2.33. Nearest: -2; truncating: -2; rounding down: -3.","Another example: 11 ÷ 2.5 = 4.4. Nearest: 4; truncating: 4."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Running count +13, 3 decks left. What is the true count rounding down (to the lower whole number)?","opciones":["5","4","3","13"],"respuesta":"4","explicacion":"13 / 3 = 4.33; rounding down gives 4."},{"pregunta":"Running count -7, 3 decks left. What is the true count discarding the decimals (truncating toward zero)?","opciones":["-3","2","-2","-7"],"respuesta":"-2","explicacion":"-7 / 3 = -2.33; truncating toward zero leaves -2. Rounding down would have been -3."},{"pregunta":"In a set of 6 decks, 130 cards have already come out. How many decks are left, to the nearest half deck?","opciones":["4","3","2.5","3.5"],"respuesta":"3.5","explicacion":"312 - 130 = 182 cards are left; 182 / 52 = exactly 3.5 decks."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"cuadros","despuesDePaso":0,"titulo":"The idea in one formula","cuadros":[{"texto":"The true count divides the running count by the decks that are left (it is used with balanced systems, like Hi-Lo):","formula":"\\text{conteo verdadero} = \\dfrac{\\text{conteo corriente}}{\\text{mazos restantes}}"},{"texto":"With many decks, the same running count weighs little; with few decks, it weighs a lot."}]},{"tipo":"naipia.verdadero","conteo":10,"mazosTotales":4,"cartasJugadas":96,"regla":"cercano","despuesDePaso":1,"titulo":"Estimate the decks, divide and round"},{"tipo":"naipia.verdadero","conteo":-7,"mazosRestantes":3,"regla":"abajo","despuesDePaso":2,"titulo":"With negatives, the rule matters"},{"tipo":"naipia.verdadero","conteo":11,"mazosRestantes":2.5,"regla":"cercano","despuesDePaso":3,"titulo":"With a half deck"}]$leccion_en$::jsonb
    )
where slug = 'naipia-clase-conteo-verdadero';
