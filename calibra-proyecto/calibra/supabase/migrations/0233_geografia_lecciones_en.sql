-- ============================================================
-- Prodigia — geografia: lecciones de Aprender en inglés (39 lecciones).
-- Requiere 0225_lecciones_en_columnas.sql.
--
-- Llena nombre_en, descripcion_en y contenido_en de cada lección (Técnicas y Clases).
-- contenido_en = el contenido en español con `pasos`, `quiz` y `visuales` reemplazados
-- por su versión en inglés (misma forma, mismas preguntas y mismas posiciones de la
-- respuesta correcta): lo que no se traduce (ids, programas, símbolos) queda igual.
-- Solo UPDATE por slug; no toca progreso ni el contenido en español.
--
-- Este archivo se GENERA desde src/lib/i18n-lecciones/en/geografia.ts y el test
-- src/lib/i18n-lecciones/traducciones.test.ts comprueba que coincida. No editar a
-- mano. Regenerar: I18N_LECCIONES_ESCRIBIR_SQL=1 npx vitest run src/lib/i18n-lecciones
-- (0233)
-- ============================================================

update public.techniques
set nombre_en = 'South America vs. Central America: two very different shapes',
    descripcion_en = 'South America is a wide triangle that narrows toward the south; Central America is a narrow strip shaped like an isthmus.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The Americas are not a single block: South America is a big triangle, wide in the north and narrow at the far south (Patagonia).","Central America is completely different — an isthmus, a narrow strip of land that connects North America with South America.","Recognizing this difference in shape is the first step before learning the countries of each block separately."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What general shape does South America have?","opciones":["A wide triangle that narrows toward the south","A narrow strip running north to south","An almost perfect circle","An archipelago of islands"],"respuesta":"A wide triangle that narrows toward the south","explicacion":"South America is wide in the north (near the equator) and narrows toward the far south, in Patagonia."},{"pregunta":"What is the narrow strip of land that connects North America with South America called?","opciones":["The Central American isthmus","The Southern Cone","The Andean region","The Mexican plateau"],"respuesta":"The Central American isthmus","explicacion":"An isthmus is a narrow strip of land between two larger masses — exactly the shape of Central America."},{"pregunta":"Why is it worth telling South America and Central America apart before memorizing individual countries?","opciones":["Because placing the big block first makes it easier to place the countries inside it","Because countries switch blocks depending on the year","Because there is no real difference between the two","Because Central America has no countries of its own"],"respuesta":"Because placing the big block first makes it easier to place the countries inside it","explicacion":"It is the same idea as the general sub-region technique: the big block first, the individual countries afterwards."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"america","paisesIds":["076","320"],"despuesDePaso":2,"titulo":"Brazil (wide triangle) and Guatemala (narrow isthmus)"}]$leccion_en$::jsonb
    )
where slug = 'geografia-tecnica-forma-sudamerica-vs-centroamerica';

update public.techniques
set nombre_en = 'Brazil as an anchor: it borders almost the whole continent',
    descripcion_en = 'Brazil is the largest country in South America and borders almost all the other South American countries, except Chile and Ecuador.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Brazil covers almost half of South America's territory — it is a natural anchor for placing its neighbors.","It borders almost every South American country: Argentina, Bolivia, Colombia, Paraguay, Peru, Uruguay and Venezuela, among others.","The only two South American countries that do NOT border Brazil are Chile and Ecuador — both are on the Pacific side."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Why does Brazil work well as an anchor country for placing its neighbors?","opciones":["Because it is the largest country in South America and borders almost all the others","Because it is in the exact center of the American continent","Because it is the only country with a coast on two oceans","Because all the other countries used to be part of Brazil"],"respuesta":"Because it is the largest country in South America and borders almost all the others","explicacion":"Its size and the number of borders it shares make it a natural reference point for placing the rest."},{"pregunta":"Which are the two South American countries that do NOT border Brazil?","opciones":["Chile and Ecuador","Argentina and Uruguay","Peru and Bolivia","Colombia and Venezuela"],"respuesta":"Chile and Ecuador","explicacion":"Both are on the Pacific side, separated from Brazil by other countries — they are the exception to the rule."},{"pregunta":"Which of these countries DOES border Brazil?","opciones":["Argentina","Chile","Ecuador","None of the above"],"respuesta":"Argentina","explicacion":"Argentina shares a long border with Brazil, unlike Chile and Ecuador."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"america","paisesIds":["076","032","170"],"despuesDePaso":2,"titulo":"Brazil and two of its neighbors: Argentina and Colombia"}]$leccion_en$::jsonb
    )
where slug = 'geografia-tecnica-vecinos-de-brasil';

update public.techniques
set nombre_en = 'Caribbean islands: size and relative position',
    descripcion_en = 'Cuba is the largest island and the westernmost of the Caribbean; Jamaica is to the south; Haiti and the Dominican Republic share one island to the east.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Cuba is the largest island in the Caribbean and the closest to the United States and Mexico — a good starting point.","Jamaica is a smaller island, located south of Cuba.","Farther east, a single island (Hispaniola) is divided between two countries: Haiti in the west and the Dominican Republic in the east."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which is the largest island in the Caribbean?","opciones":["Cuba","Jamaica","Dominican Republic","Haiti"],"respuesta":"Cuba","explicacion":"Cuba is by far the largest island in the Caribbean and the westernmost of the archipelago."},{"pregunta":"Which two countries share the same island (Hispaniola)?","opciones":["Haiti and the Dominican Republic","Cuba and Jamaica","Jamaica and Haiti","Cuba and the Dominican Republic"],"respuesta":"Haiti and the Dominican Republic","explicacion":"Hispaniola is a single island divided into two countries: Haiti in the west, the Dominican Republic in the east."},{"pregunta":"Where is Jamaica in relation to Cuba?","opciones":["To the south","To the north","To the east, much farther away","On the same island"],"respuesta":"To the south","explicacion":"Jamaica is an independent island, located south of Cuba."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"america","paisesIds":["192","388","214"],"despuesDePaso":2,"titulo":"Cuba, Jamaica and the Dominican Republic"}]$leccion_en$::jsonb
    )
where slug = 'geografia-tecnica-caribe-por-tamano-y-posicion';

update public.techniques
set nombre_en = 'The Central American isthmus, country by country',
    descripcion_en = 'Central America is a chain of 7 countries between Mexico and Colombia — learning them in order, from north to south, is easier than learning them one by one.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Central America has 7 countries, arranged in a chain between Mexico (to the north) and Colombia (to the south, already in South America).","From north to south: Guatemala, Belize, Honduras, El Salvador, Nicaragua, Costa Rica and Panama.","Panama is the last link — the country that connects the isthmus with South America through its border with Colombia."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"How many countries make up the Central American chain?","opciones":["7","5","9","4"],"respuesta":"7","explicacion":"Guatemala, Belize, Honduras, El Salvador, Nicaragua, Costa Rica and Panama — 7 countries in total."},{"pregunta":"Which is the Central American country that connects the isthmus with South America?","opciones":["Panama","Guatemala","Costa Rica","Belize"],"respuesta":"Panama","explicacion":"Panama is the final link: to the southeast it borders Colombia, already in South America."},{"pregunta":"Which of these countries is farthest north in the Central American chain?","opciones":["Guatemala","Panama","Costa Rica","Nicaragua"],"respuesta":"Guatemala","explicacion":"Guatemala is the first country in the chain, the closest to Mexico."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"america","paisesIds":["320","340","188","591"],"despuesDePaso":2,"titulo":"Central American chain: Guatemala, Honduras, Costa Rica and Panama"}]$leccion_en$::jsonb
    )
where slug = 'geografia-tecnica-istmo-centroamericano-en-cadena';

update public.techniques
set nombre_en = 'Southern Cone: the narrow strip and the big block',
    descripcion_en = 'Chile is a long, narrow strip pressed against the mountain range; Argentina is the big block next to it, with smaller Uruguay and Paraguay.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["At the southern tip of South America, Chile forms a long, narrow strip, squeezed between the Andes mountain range and the Pacific Ocean.","Argentina, on the other side of the range, is a much wider block — almost twice as long as Chile from east to west.","Uruguay and Paraguay are the two smallest countries of the group: Uruguay right on the Atlantic coast, Paraguay landlocked."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which Southern Cone country is shaped like a long, narrow strip?","opciones":["Chile","Argentina","Uruguay","Paraguay"],"respuesta":"Chile","explicacion":"Chile is squeezed between the Andes mountain range and the Pacific Ocean — very long from north to south, very narrow from east to west."},{"pregunta":"Which of these 4 Southern Cone countries has no access to the sea?","opciones":["Paraguay","Chile","Uruguay","Argentina"],"respuesta":"Paraguay","explicacion":"Paraguay is the only one of the 4 completely surrounded by land, with no coast on any ocean."},{"pregunta":"Which of these countries is the smallest of the group, right on the Atlantic coast?","opciones":["Uruguay","Argentina","Chile","Paraguay"],"respuesta":"Uruguay","explicacion":"Uruguay is the smallest of the four and has a coast on the Atlantic Ocean."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"america","paisesIds":["152","032","858","600"],"despuesDePaso":2,"titulo":"Chile, Argentina, Uruguay and Paraguay"}]$leccion_en$::jsonb
    )
where slug = 'geografia-tecnica-cono-sur-franja-y-bloque';

update public.techniques
set nombre_en = 'Scandinavian countries: shape and orientation',
    descripcion_en = 'Norway has a coastline cut by fjords and stretches diagonally; Sweden is wider and lies to the east; Finland has thousands of lakes.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Norway has a very jagged coastline, full of fjords, and stretches diagonally toward the northeast, right along the sea.","Sweden lies east of Norway — it is wider and its coastline is much more regular, without so many fjords.","Finland, east of Sweden, stands out for having thousands of lakes scattered across its territory."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which Scandinavian country is recognized by its coastline cut into fjords?","opciones":["Norway","Sweden","Finland","Denmark"],"respuesta":"Norway","explicacion":"Fjords are deep inlets of the sea between mountains, typical of Norway's west coast."},{"pregunta":"Which country lies east of Sweden and is known for its thousands of lakes?","opciones":["Finland","Norway","Denmark","Iceland"],"respuesta":"Finland","explicacion":"Finland has an enormous number of lakes scattered across its territory — a very distinctive feature."},{"pregunta":"Which of these three countries lies farthest west, right on the Norwegian Sea?","opciones":["Norway","Sweden","Finland","All three are equally far west"],"respuesta":"Norway","explicacion":"Norway occupies the westernmost strip of the Scandinavian peninsula, with Sweden to its east."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"europa","paisesIds":["578","752","246"],"despuesDePaso":2,"titulo":"Norway, Sweden and Finland"}]$leccion_en$::jsonb
    )
where slug = 'geografia-tecnica-escandinavos-forma-y-orientacion';

update public.techniques
set nombre_en = 'The Balkans: many small, close countries',
    descripcion_en = 'In southeastern Europe there are many small countries very close to one another — Croatia, Serbia and Bulgaria are three examples.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The Balkans are the region in southeastern Europe, between Italy and Turkey — unlike France or Spain, many small countries live side by side there, very close to one another.","Croatia has a curved shape, like a crescent moon, right along the coast of the Adriatic Sea.","Serbia and Bulgaria lie farther inland and toward the east of the region, neither with the long coastline that Croatia has."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What characterizes the Balkans region on the map of Europe?","opciones":["It has many small countries very close to one another","It is the region with the fewest countries on the whole continent","All its countries share the same language","None of its countries has a sea coast"],"respuesta":"It has many small countries very close to one another","explicacion":"Unlike big countries such as France or Spain, southeastern Europe is very fragmented."},{"pregunta":"Which Balkan country is curved, like a crescent moon, along the Adriatic Sea?","opciones":["Croatia","Serbia","Bulgaria","Romania"],"respuesta":"Croatia","explicacion":"Croatia's coast curves along the Adriatic Sea, giving it that characteristic shape."},{"pregunta":"Between which two countries does the Balkans region lie?","opciones":["Italy and Turkey","France and Germany","Spain and Portugal","Norway and Russia"],"respuesta":"Italy and Turkey","explicacion":"The Balkans occupy southeastern Europe, between the Italian peninsula and Turkey."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"europa","paisesIds":["191","688","100"],"despuesDePaso":2,"titulo":"Croatia, Serbia and Bulgaria"}]$leccion_en$::jsonb
    )
where slug = 'geografia-tecnica-balcanes-muchos-paises-chicos';

update public.techniques
set nombre_en = 'European islands separated from the continent',
    descripcion_en = 'The United Kingdom and Ireland share an archipelago separated by the English Channel; Iceland is much more isolated, in the middle of the North Atlantic.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The United Kingdom and Ireland are two neighboring islands, separated from the rest of Europe by the English Channel — a narrow but real sea.","Iceland is much farther away, isolated in the middle of the North Atlantic Ocean, with no nearby neighbor.","Recognizing these three islands as a separate group helps you avoid confusing them with mainland countries that touch one another."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What separates the United Kingdom and Ireland from the rest of mainland Europe?","opciones":["The English Channel","The Mediterranean Sea","The Ural Mountains","The Baltic Sea"],"respuesta":"The English Channel","explicacion":"The English Channel is the narrow arm of sea that separates the British Isles from the continent."},{"pregunta":"Which of these three islands is the most isolated, with no nearby neighbors?","opciones":["Iceland","The United Kingdom","Ireland","None is isolated"],"respuesta":"Iceland","explicacion":"Iceland is in the middle of the North Atlantic, much farther from the continent than the United Kingdom and Ireland."},{"pregunta":"Are the United Kingdom and Ireland on the same island or on different islands?","opciones":["On different islands, though neighboring","On the same island, divided by an internal border","The United Kingdom is not an island","Ireland is part of the continent"],"respuesta":"On different islands, though neighboring","explicacion":"They are two islands separated by the Irish Sea, not a single divided island."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"europa","paisesIds":["826","372"],"despuesDePaso":2,"titulo":"The United Kingdom and Ireland"}]$leccion_en$::jsonb
    )
where slug = 'geografia-tecnica-islas-europeas-separadas';

update public.techniques
set nombre_en = 'Germany: the crossroads of central Europe',
    descripcion_en = 'Germany shares a border with France, Poland, Austria and several other countries — using it as a center helps you place its neighbors.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Germany is in the middle of Europe and shares a border with more countries than almost any other on the continent.","To the west lies France; to the east, Poland; to the south, Austria — three of its biggest neighbors.","Using Germany as a center is a quick way to place several neighboring countries at once, instead of learning them one by one."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Why is Germany a good anchor country on the map of central Europe?","opciones":["Because it shares a border with many countries at once","Because it is the largest country in all of Europe","Because it has no neighbors at all","Because it is an island in the middle of the continent"],"respuesta":"Because it shares a border with many countries at once","explicacion":"The number of neighbors Germany has makes it a good central reference point."},{"pregunta":"Which country lies east of Germany?","opciones":["Poland","France","Spain","Portugal"],"respuesta":"Poland","explicacion":"Poland borders Germany on the east."},{"pregunta":"Which country lies west of Germany?","opciones":["France","Poland","Austria","Romania"],"respuesta":"France","explicacion":"France borders Germany on the west."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"europa","paisesIds":["276","250","616","040"],"despuesDePaso":2,"titulo":"Germany and three of its neighbors: France, Poland and Austria"}]$leccion_en$::jsonb
    )
where slug = 'geografia-tecnica-europa-central-fronteras-compartidas';

update public.techniques
set nombre_en = 'The Iberian Peninsula: two countries, one block',
    descripcion_en = 'Spain and Portugal share the same peninsula, at the southwestern tip of Europe; Portugal occupies the strip along the Atlantic.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Spain and Portugal share the same peninsula — the Iberian — at the southwestern tip of the continent.","Portugal occupies the narrow strip along the Atlantic Ocean, on the western edge of the peninsula.","Spain occupies the rest, much larger, with a coast on the Atlantic and also on the Mediterranean Sea."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which two countries share the Iberian Peninsula?","opciones":["Spain and Portugal","Spain and Italy","France and Spain","Portugal and Italy"],"respuesta":"Spain and Portugal","explicacion":"Both countries occupy the same peninsula, at the southwestern tip of Europe."},{"pregunta":"Which country occupies the strip along the Atlantic Ocean, on the western edge?","opciones":["Portugal","Spain","France","Italy"],"respuesta":"Portugal","explicacion":"Portugal is the narrow strip in the west of the peninsula; its whole coast faces the Atlantic."},{"pregunta":"Besides the Atlantic, which sea does Spain have a coast on?","opciones":["The Mediterranean","The Baltic","The North Sea","The Black Sea"],"respuesta":"The Mediterranean","explicacion":"Spain has a coast on both the Atlantic and the Mediterranean, unlike Portugal."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"europa","paisesIds":["724","620"],"despuesDePaso":2,"titulo":"Spain and Portugal on the Iberian Peninsula"}]$leccion_en$::jsonb
    )
where slug = 'geografia-tecnica-peninsula-iberica-dos-paises';

update public.techniques
set nombre_en = 'Landlocked African countries',
    descripcion_en = 'Chad, Mali and Zambia are completely surrounded by land — recognizing them as ''enclosed'' helps you place them.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["In Africa there are several countries with no coast at all — they are completely surrounded by land, by other countries.","Chad and Mali, in the center and west of the continent, are two clear examples: no side of their territory touches the sea.","Zambia, farther south, is another example — unlike coastal countries such as Nigeria or Kenya, which do have an ocean coast."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What does it mean for a country to be landlocked?","opciones":["That it is completely surrounded by land, with no ocean coast","That it is in the exact center of the continent","That it has no rivers","That it is the smallest country in the region"],"respuesta":"That it is completely surrounded by land, with no ocean coast","explicacion":"A landlocked country is surrounded by land on all sides."},{"pregunta":"Which of these African countries DOES have an ocean coast?","opciones":["Nigeria","Chad","Mali","Zambia"],"respuesta":"Nigeria","explicacion":"Nigeria has a coast on the Gulf of Guinea, unlike Chad, Mali and Zambia."},{"pregunta":"Which of these countries is completely surrounded by land?","opciones":["Chad","Kenya","Nigeria","Morocco"],"respuesta":"Chad","explicacion":"Chad has no coast on any ocean — it is in north-central Africa, surrounded by other countries."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"africa","paisesIds":["148","466","894"],"despuesDePaso":2,"titulo":"Chad, Mali and Zambia: landlocked"}]$leccion_en$::jsonb
    )
where slug = 'geografia-tecnica-costeros-vs-sin-salida-al-mar';

update public.techniques
set nombre_en = 'The Sahara as a natural border',
    descripcion_en = 'The Sahara Desert separates North Africa (Morocco, Algeria, Libya, Egypt) from the rest of the continent.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The Sahara is the largest desert in the world and covers almost all of northern Africa.","The countries north of the Sahara — Morocco, Algeria, Libya and Egypt — form a block clearly different from the rest of the continent.","Using the Sahara as a great natural border helps you mentally separate 'the Arab north' from sub-Saharan Africa."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which desert separates North Africa from the rest of the continent?","opciones":["The Sahara","The Kalahari","The Namib Desert","The Arabian Desert"],"respuesta":"The Sahara","explicacion":"The Sahara is the largest desert in the world and covers almost all of northern Africa."},{"pregunta":"Which of these countries is NOT in the North African block north of the Sahara?","opciones":["Kenya","Morocco","Algeria","Libya"],"respuesta":"Kenya","explicacion":"Kenya is in East Africa, south of the Sahara — it is not part of the North African block."},{"pregunta":"Which of these countries DOES lie north of the Sahara?","opciones":["Egypt","Nigeria","South Africa","Tanzania"],"respuesta":"Egypt","explicacion":"Egypt is at the far northeast of Africa, north of the Sahara."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"africa","paisesIds":["504","012","434","818"],"despuesDePaso":2,"titulo":"Morocco, Algeria, Libya and Egypt: north of the Sahara"}]$leccion_en$::jsonb
    )
where slug = 'geografia-tecnica-sahara-como-referencia';

update public.techniques
set nombre_en = 'The Horn of Africa: the tip that sticks out',
    descripcion_en = 'Somalia, Ethiopia, Eritrea and Djibouti form the pointed peninsula that sticks out into the Indian Ocean in the northeast of the continent.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The Horn of Africa is the pointed peninsula that sticks out to the east, toward the Indian Ocean, in the northeast of the continent.","Four countries form it: Somalia (the tip itself), Ethiopia (inland, with no coast), Eritrea and Djibouti (both with a coast on the Red Sea).","Its pointed shape is easy to recognize at a glance — very different from the rest of the African coastline."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which country forms the very tip of the Horn of Africa?","opciones":["Somalia","Ethiopia","Eritrea","Djibouti"],"respuesta":"Somalia","explicacion":"Somalia occupies the tip that sticks out into the Indian Ocean, giving the Horn of Africa its characteristic shape."},{"pregunta":"Which of these 4 Horn of Africa countries has no coast (is inland)?","opciones":["Ethiopia","Somalia","Eritrea","Djibouti"],"respuesta":"Ethiopia","explicacion":"Ethiopia is the only one of the four without a coast — it is surrounded by the other three and by Kenya and Sudan."},{"pregunta":"Toward which ocean does the Horn of Africa peninsula stick out?","opciones":["The Indian Ocean","The Atlantic Ocean","The Mediterranean Sea","The Pacific Ocean"],"respuesta":"The Indian Ocean","explicacion":"The Horn of Africa sticks out to the east, toward the Indian Ocean."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"africa","paisesIds":["706","231","232","262"],"despuesDePaso":2,"titulo":"Somalia, Ethiopia, Eritrea and Djibouti: the Horn of Africa"}]$leccion_en$::jsonb
    )
where slug = 'geografia-tecnica-cuerno-de-africa';

update public.techniques
set nombre_en = 'Straight borders: a colonial legacy',
    descripcion_en = 'Chad, Libya and Namibia have borders drawn almost with a ruler — traced by colonial powers without following geographic features.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Many African borders were drawn by European colonial powers, almost with a ruler, without following rivers or mountains.","Chad and Libya are two clear examples: several of their boundaries are straight lines, not the irregular curves typical of a river or a mountain range.","Namibia is another striking case: it has a long, narrow, straight strip (the Caprivi Strip) that stretches toward the east."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Why are many African borders straight lines?","opciones":["Because colonial powers drew them without following geographic features","Because they always follow the course of a river","Because all African countries are the same size","Because the UN drew them in the 21st century"],"respuesta":"Because colonial powers drew them without following geographic features","explicacion":"Unlike natural borders (rivers, mountains), many African borders are a legacy of lines drawn in colonial times."},{"pregunta":"Which country has a long, narrow, straight strip that stretches toward the east (the Caprivi Strip)?","opciones":["Namibia","Chad","Libya","South Africa"],"respuesta":"Namibia","explicacion":"The Caprivi Strip is a narrow, straight extension of Namibia's territory toward the east."},{"pregunta":"Which of these countries is an example of almost straight borders?","opciones":["Chad","Italy","Chile","The United Kingdom"],"respuesta":"Chad","explicacion":"Chad, in north-central Africa, has several boundaries drawn as straight lines."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"africa","paisesIds":["148","434","516"],"despuesDePaso":2,"titulo":"Chad, Libya and Namibia: almost straight borders"}]$leccion_en$::jsonb
    )
where slug = 'geografia-tecnica-fronteras-rectas-coloniales';

update public.techniques
set nombre_en = 'Lesotho: a country surrounded by another',
    descripcion_en = 'Lesotho is completely surrounded by South Africa — it has no border with any other country, a unique case on the continent.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Lesotho is a small, mountainous country located inside South Africa's territory.","It is completely surrounded by South Africa: it shares a border with no other country in the world.","This kind of country (completely surrounded by another) is called an enclave — Lesotho is the best-known example in Africa."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"How many countries, besides South Africa, border Lesotho?","opciones":["None","One","Two","Three"],"respuesta":"None","explicacion":"Lesotho is completely surrounded by South Africa — it has no border with any other country."},{"pregunta":"What is a country completely surrounded by another, like Lesotho, called?","opciones":["An enclave","A peninsula","An isthmus","An archipelago"],"respuesta":"An enclave","explicacion":"An enclave is a territory completely surrounded by another country — Lesotho is the best-known example in Africa."},{"pregunta":"Which country completely surrounds Lesotho?","opciones":["South Africa","Namibia","Botswana","Zimbabwe"],"respuesta":"South Africa","explicacion":"All of Lesotho's territory lies inside South Africa."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"africa","paisesIds":["710","426"],"despuesDePaso":2,"titulo":"South Africa and Lesotho, the country it completely surrounds"}]$leccion_en$::jsonb
    )
where slug = 'geografia-tecnica-sudafrica-rodea-a-lesoto';

update public.techniques
set nombre_en = 'Three Asian peninsulas for quick orientation',
    descripcion_en = 'Korea sticks out to the east, Indochina (Vietnam) to the south, and the Arabian Peninsula (Saudi Arabia) is the largest of the three.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Korea is a peninsula that sticks out east of China, between the Yellow Sea and the Sea of Japan.","Indochina, where Vietnam is, is the peninsula that sticks out to the south, between India and China.","The Arabian Peninsula, where Saudi Arabia is, is the largest of the three — it occupies almost all of southwestern Asia."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"In which direction does the Korean peninsula stick out from China?","opciones":["To the east","To the south","To the west","To the north"],"respuesta":"To the east","explicacion":"Korea sticks out to the east of China, between the Yellow Sea and the Sea of Japan."},{"pregunta":"Which is the largest of the three Asian peninsulas?","opciones":["The Arabian Peninsula","Korea","Indochina","All are the same size"],"respuesta":"The Arabian Peninsula","explicacion":"The Arabian Peninsula, where Saudi Arabia is, occupies almost all of southwestern Asia — much larger than Korea or Indochina."},{"pregunta":"On which peninsula is Vietnam?","opciones":["Indochina","Korea","Arabian","Anatolia"],"respuesta":"Indochina","explicacion":"Vietnam is on the Indochinese peninsula, which sticks out to the south between India and China."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"asia_oceania","paisesIds":["410","704","682"],"despuesDePaso":2,"titulo":"Korea, Vietnam and Saudi Arabia: three peninsulas"}]$leccion_en$::jsonb
    )
where slug = 'geografia-tecnica-peninsulas-asiaticas';

update public.techniques
set nombre_en = 'Indonesia and the Philippines: archipelago countries',
    descripcion_en = 'Indonesia and the Philippines are made up of thousands of islands, not one continuous block of land like China or India.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Unlike China or India (blocks of continuous land), Indonesia and the Philippines are archipelagos — countries made of thousands of islands.","Indonesia, with more than 17,000 islands, is the largest archipelago in the world, located between the Indian and Pacific oceans.","The Philippines, north of Indonesia, is another large archipelago, made up of more than 7,000 islands."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What do Indonesia and the Philippines have in common?","opciones":["Both are archipelagos, countries made of thousands of islands","Both are landlocked countries","Both share the same land border","Both are on the Arabian Peninsula"],"respuesta":"Both are archipelagos, countries made of thousands of islands","explicacion":"Unlike China or India, neither of the two is a block of continuous land."},{"pregunta":"Which of these two countries lies farther north?","opciones":["The Philippines","Indonesia","They are at the same latitude","Neither is in Asia"],"respuesta":"The Philippines","explicacion":"The Philippines is north of Indonesia, farther from the equator, entirely above it."},{"pregunta":"Approximately how many islands make up Indonesia?","opciones":["More than 17,000","About 100","Only 3","About 500"],"respuesta":"More than 17,000","explicacion":"Indonesia is the largest archipelago in the world, with more than 17,000 islands."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"asia_oceania","paisesIds":["360","608"],"despuesDePaso":2,"titulo":"Indonesia and the Philippines: countries made of thousands of islands"}]$leccion_en$::jsonb
    )
where slug = 'geografia-tecnica-islas-sudeste-asiatico';

update public.techniques
set nombre_en = 'Oceania: huge Australia, the rest much smaller',
    descripcion_en = 'Australia is almost as big as all of Europe; New Zealand, Papua New Guinea and Fiji are a fraction of its size.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Australia dominates Oceania in size — it is almost as big as all of Europe put together.","New Zealand, to the southeast, is made up of two main islands, much smaller than Australia.","Papua New Guinea and Fiji are two other countries in Oceania, both quite a bit smaller than Australia and located farther north."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which continent is Australia's size usually compared to?","opciones":["Europe (it is almost as big)","Antarctica","Greenland","None, it is much smaller than any continent"],"respuesta":"Europe (it is almost as big)","explicacion":"Australia is almost as big as all of Europe — it dominates the size of Oceania."},{"pregunta":"How many main islands make up New Zealand?","opciones":["Two","One","Five","Ten"],"respuesta":"Two","explicacion":"New Zealand is made up of two main islands (the North Island and the South Island), plus smaller islands."},{"pregunta":"Which of these Oceania countries is much smaller than Australia?","opciones":["Fiji","None, they are all the same size","There are no other countries in Oceania","Australia is the smallest"],"respuesta":"Fiji","explicacion":"Fiji is a small archipelago, a fraction of Australia's size."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"asia_oceania","paisesIds":["036","554","242"],"despuesDePaso":2,"titulo":"Australia, New Zealand and Fiji: very different sizes"}]$leccion_en$::jsonb
    )
where slug = 'geografia-tecnica-oceania-por-tamano-relativo';

update public.techniques
set nombre_en = 'Central Asia: the five countries ending in ''-stan''',
    descripcion_en = 'Kazakhstan, Uzbekistan, Turkmenistan, Kyrgyzstan and Tajikistan form a block between Russia and Afghanistan.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Five Central Asian countries end in '-stan': Kazakhstan, Uzbekistan, Turkmenistan, Kyrgyzstan and Tajikistan.","All five lie in the same block, between Russia to the north and Afghanistan/Iran to the south.","Kazakhstan is by far the largest and the northernmost of the five; Tajikistan and Kyrgyzstan are the smallest and most mountainous."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"How many Central Asian countries end in '-stan'?","opciones":["5","3","7","2"],"respuesta":"5","explicacion":"Kazakhstan, Uzbekistan, Turkmenistan, Kyrgyzstan and Tajikistan — five countries in total."},{"pregunta":"Which of the five '-stan' countries is the largest and the northernmost?","opciones":["Kazakhstan","Tajikistan","Kyrgyzstan","Turkmenistan"],"respuesta":"Kazakhstan","explicacion":"Kazakhstan is by far the largest of the five and the one that reaches farthest north, next to Russia."},{"pregunta":"Which two countries lie south of the Central Asian block?","opciones":["Afghanistan and Iran","China and Russia","India and Pakistan","Turkey and Saudi Arabia"],"respuesta":"Afghanistan and Iran","explicacion":"The block of the five '-stan' countries lies between Russia (to the north) and Afghanistan/Iran (to the south)."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"asia_oceania","paisesIds":["398","860","762"],"despuesDePaso":2,"titulo":"Kazakhstan, Uzbekistan and Tajikistan: Central Asia"}]$leccion_en$::jsonb
    )
where slug = 'geografia-tecnica-asia-central-los-stan';

update public.techniques
set nombre_en = 'The Middle East around Saudi Arabia',
    descripcion_en = 'Saudi Arabia occupies the center of the Arabian Peninsula; around it, smaller countries such as Qatar, Kuwait and the Emirates.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Saudi Arabia occupies most of the Arabian Peninsula — a good starting point for placing its neighbors.","Around it there are several much smaller countries, all with a coast on the Persian Gulf: Qatar, Kuwait and the United Arab Emirates.","The three small countries share that coastal position on the gulf, on the eastern edge of the peninsula."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which country occupies most of the Arabian Peninsula?","opciones":["Saudi Arabia","Qatar","Kuwait","United Arab Emirates"],"respuesta":"Saudi Arabia","explicacion":"Saudi Arabia is by far the largest country on the Arabian Peninsula."},{"pregunta":"On which gulf do Qatar, Kuwait and the United Arab Emirates have a coast?","opciones":["The Persian Gulf","The Gulf of Aden","The Red Sea","The Gulf of Oman"],"respuesta":"The Persian Gulf","explicacion":"The three small countries of the Arabian Peninsula share a coast on the Persian Gulf."},{"pregunta":"Which of these countries is much smaller than Saudi Arabia?","opciones":["Qatar","None, they are all similar in size","All are larger than Saudi Arabia","Yemen"],"respuesta":"Qatar","explicacion":"Qatar is a very small country compared with the extent of Saudi Arabia."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"asia_oceania","paisesIds":["682","634","414","784"],"despuesDePaso":2,"titulo":"Saudi Arabia, Qatar, Kuwait and the United Arab Emirates"}]$leccion_en$::jsonb
    )
where slug = 'geografia-tecnica-oriente-medio-alrededor-de-arabia';

update public.techniques
set nombre_en = 'Divide and conquer',
    descripcion_en = 'Grouping countries into mental sub-regions is much easier than memorizing them one by one.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Instead of memorizing countries one by one, group them into sub-regions: Central America is a separate block from South America, and Eastern Europe is different from Western Europe.","First learn where each sub-region is, as a big block on the map.","Only afterwards place the countries inside each block: it is much easier to remember 5 countries of a region than 25 loose ones."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"What is the main advantage of grouping countries into sub-regions before memorizing them?","opciones":["It is easier to remember a few big blocks than many loose countries","Countries change names depending on the region","All regions have the same number of countries","There is no need to learn any individual country"],"respuesta":"It is easier to remember a few big blocks than many loose countries","explicacion":"It is the core idea of the technique: 5 countries of a region are much easier to remember than 25 loose ones."},{"pregunta":"Which of these is a real example of a sub-region within a continent?","opciones":["Central America (within the Americas)","The Northern Hemisphere (within the Earth)","The Pacific Ocean (within Asia)","A country's capital (within that country)"],"respuesta":"Central America (within the Americas)","explicacion":"It is the same example as in the lesson: Central America is a different block from South America."},{"pregunta":"According to this technique, what is best to learn first?","opciones":["Where the block of the whole sub-region is on the map","The name of each country's capital","Each country's flag","Each country's exact population"],"respuesta":"Where the block of the whole sub-region is on the map","explicacion":"Only after placing the big block is it worth placing the countries inside it, one by one."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"america","paisesIds":["320","340","188","591"],"despuesDePaso":1,"titulo":"Central America: a separate block, with Guatemala, Honduras, Costa Rica and Panama"},{"tipo":"geografia.mapa","continente":"america","paisesIds":["152","032","858","600"],"despuesDePaso":2,"titulo":"Inside South America, the Southern Cone: Chile, Argentina, Uruguay and Paraguay"}]$leccion_en$::jsonb
    )
where slug = 'dividir-en-subregiones';

update public.techniques
set nombre_en = 'Anchor by neighbors',
    descripcion_en = 'Use a country you already place without hesitation as a reference to find the ones next to it.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Choose a country you already place without hesitation: your anchor. If you already know where Brazil or France is, use it as a starting point.","To place a new country, ask yourself: is it north, south, east or west of my anchor?","Every country you learn well becomes a new anchor: the map is built as a chain, not all at once."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"According to this technique, what do you need first to place a new country?","opciones":["A country you already place without hesitation, to use as a reference","To memorize the exact coordinates","To learn the new country's flag","To know how many inhabitants it has"],"respuesta":"A country you already place without hesitation, to use as a reference","explicacion":"That is the anchor: the starting point from which everything else is placed."},{"pregunta":"If your anchor is Brazil (which you already place well), in what approximate direction do you look for Argentina?","opciones":["To the south","To the north","To the east","To the west"],"respuesta":"To the south","explicacion":"Argentina is south of Brazil: exactly the kind of question this technique solves."},{"pregunta":"What happens to every country you learn well, according to this technique?","opciones":["It becomes a new anchor to place other countries","It stops serving as a reference once learned","It only helps place countries on the same continent","It is forgotten as soon as you learn a new one"],"respuesta":"It becomes a new anchor to place other countries","explicacion":"The map is built as a chain: every newly learned country can be used as the anchor for the next."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"america","paisesIds":["076","032"],"despuesDePaso":1,"titulo":"With Brazil as the anchor, Argentina lies to the south"},{"tipo":"geografia.mapa","continente":"america","paisesIds":["032","858","600"],"despuesDePaso":2,"titulo":"Now Argentina is the anchor: Uruguay and Paraguay are its neighbors"}]$leccion_en$::jsonb
    )
where slug = 'anclar-por-vecinos';

update public.techniques
set nombre_en = 'Characteristic shape',
    descripcion_en = 'Recognize a country by its distinctive silhouette, before looking at its exact borders.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Look at the country's overall silhouette before the border details: many can be recognized at a glance.","Examples: Italy is shaped like a boot, and Chile is a long, narrow strip pressed against the mountain range.","Practice covering the name: can you recognize the shape without reading anything?"]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"According to this technique, what is best to look at first to recognize a country on the map?","opciones":["Its overall silhouette, before the border details","The color it is painted on the map","Its exact size in square kilometers","The name written above the country"],"respuesta":"Its overall silhouette, before the border details","explicacion":"Many countries can be recognized at a glance by their overall shape, without needing to see the fine border details."},{"pregunta":"Which country has a characteristic boot shape?","opciones":["Italy","Chile","Egypt","Japan"],"respuesta":"Italy","explicacion":"It is the same example as in the lesson: the boot is the most recognizable silhouette in Europe."},{"pregunta":"Which country is a long, narrow strip pressed against the mountain range?","opciones":["Chile","Italy","Brazil","Mexico"],"respuesta":"Chile","explicacion":"It is the same example as in the lesson: Chile is elongated from north to south and very narrow from east to west."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"europa","paisesIds":["380"],"despuesDePaso":1,"titulo":"Italy: a boot reaching into the Mediterranean"},{"tipo":"geografia.mapa","continente":"america","paisesIds":["152"],"despuesDePaso":1,"titulo":"Chile: a long, narrow strip"}]$leccion_en$::jsonb
    )
where slug = 'forma-caracteristica';

update public.techniques
set nombre_en = 'Southern Cone: Argentina, Chile, Uruguay and Paraguay',
    descripcion_en = 'The southernmost block of South America: 4 countries with temperate climates, very different from one another in shape and size.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The Southern Cone is the block of countries at the far south of South America, where the continent narrows.","It is made up of 4 countries: Argentina (the largest of the 4, with great plains — the pampas), Chile (a narrow strip pressed against the Andes), Uruguay (small, between Argentina and Brazil) and Paraguay (landlocked).","A distinctive trait of the group: of the 4, only Paraguay has no ocean coast — it is completely surrounded by land.","Practice identifying these 4 countries on the map before moving on to the Andean Region, farther north."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which 4 countries make up the Southern Cone?","opciones":["Argentina, Chile, Uruguay and Paraguay","Argentina, Brazil, Chile and Peru","Chile, Peru, Bolivia and Ecuador","Uruguay, Paraguay, Brazil and Bolivia"],"respuesta":"Argentina, Chile, Uruguay and Paraguay","explicacion":"They are the 4 countries at the far south of South America, where the continent narrows toward Patagonia."},{"pregunta":"Which of the 4 Southern Cone countries has no access to the sea?","opciones":["Paraguay","Argentina","Chile","Uruguay"],"respuesta":"Paraguay","explicacion":"Paraguay is completely surrounded by land, with no coast on any ocean."},{"pregunta":"Which Southern Cone country has great plains known as the pampas?","opciones":["Argentina","Chile","Uruguay","Paraguay"],"respuesta":"Argentina","explicacion":"The pampas are the great fertile plains of central Argentina."},{"pregunta":"Which Southern Cone country is a narrow strip pressed against the Andes mountain range?","opciones":["Chile","Argentina","Uruguay","Paraguay"],"respuesta":"Chile","explicacion":"Chile is squeezed between the Andes and the Pacific Ocean, very long and very narrow."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"america","paisesIds":["032","152","858","600"],"despuesDePaso":2,"titulo":"Southern Cone: Argentina, Chile, Uruguay and Paraguay"}]$leccion_en$::jsonb
    )
where slug = 'geografia-clase-cono-sur';

update public.techniques
set nombre_en = 'Andean Region: Colombia, Venezuela, Ecuador, Peru and Bolivia',
    descripcion_en = '5 countries crossed by the Andes mountain range, in the north and west of South America.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The Andean Region groups the countries crossed by the Andes mountain range, in the north and west of South America.","It is made up of 5 countries: Colombia and Venezuela (the northernmost, with a Caribbean coast), Ecuador (the smallest, crossed by the equator), Peru and Bolivia (the southernmost of the group, with the Andean plateau and Lake Titicaca).","A distinctive trait: Bolivia, like Paraguay, has no access to the sea — it lost it in a war with Chile in the 19th century.","The 5 countries share the same mountain range as their backbone, although their climate varies a lot from north to south."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which mountain range crosses the 5 countries of the Andean Region?","opciones":["The Andes","The Alps","The Himalayas","The Rockies"],"respuesta":"The Andes","explicacion":"The Andes mountain range runs from north to south through the 5 countries of this region."},{"pregunta":"Which of these Andean countries has no access to the sea?","opciones":["Bolivia","Peru","Colombia","Ecuador"],"respuesta":"Bolivia","explicacion":"Bolivia lost its access to the sea to Chile in the 19th century and is now surrounded by land."},{"pregunta":"Which Andean country is the smallest and is crossed by the equator?","opciones":["Ecuador","Colombia","Peru","Venezuela"],"respuesta":"Ecuador","explicacion":"Ecuador owes its name to the equator, the line that crosses its territory."},{"pregunta":"Which two Andean countries have a coast on the Caribbean Sea?","opciones":["Colombia and Venezuela","Peru and Bolivia","Ecuador and Peru","Bolivia and Colombia"],"respuesta":"Colombia and Venezuela","explicacion":"They are the two northernmost Andean countries, both with a Caribbean coast in addition to the Andean one."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"america","paisesIds":["170","862","218","604"],"despuesDePaso":2,"titulo":"Andean Region: Colombia, Venezuela, Ecuador and Peru"}]$leccion_en$::jsonb
    )
where slug = 'geografia-clase-region-andina';

update public.techniques
set nombre_en = 'Central America and the Caribbean: the isthmus and the islands',
    descripcion_en = 'The land bridge between Mexico and South America, plus the islands of the Caribbean Sea.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["This sub-region combines two parts: the Central American isthmus (a strip of land) and the islands of the Caribbean Sea.","On the isthmus: Guatemala (the northernmost), Costa Rica and Panama (the southernmost, before reaching South America).","On the islands: Cuba (the largest), the Dominican Republic and Jamaica.","A distinctive trait: unlike South America (a continuous block), here narrow mainland and islands are combined — two different kinds of geography in the same sub-region."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which two kinds of geography does this sub-region combine?","opciones":["Isthmus (mainland) and islands","Only islands","Only mountain range","Only desert"],"respuesta":"Isthmus (mainland) and islands","explicacion":"Central America is a strip of mainland; the Caribbean is islands — two different geographies in the same sub-region."},{"pregunta":"Which is the largest Caribbean island mentioned in this lesson?","opciones":["Cuba","Jamaica","Dominican Republic","Puerto Rico"],"respuesta":"Cuba","explicacion":"Cuba is the largest island in the Caribbean."},{"pregunta":"Which is the Central American country that connects the isthmus with South America?","opciones":["Panama","Guatemala","Costa Rica","Cuba"],"respuesta":"Panama","explicacion":"Panama, at the southern end of the isthmus, borders Colombia."},{"pregunta":"Which of these countries belongs to the Central American isthmus, not to the Caribbean islands?","opciones":["Costa Rica","Cuba","Jamaica","Dominican Republic"],"respuesta":"Costa Rica","explicacion":"Costa Rica is part of the Central American mainland strip, not an island."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"america","paisesIds":["320","188","591","192"],"despuesDePaso":2,"titulo":"Guatemala, Costa Rica, Panama and Cuba"}]$leccion_en$::jsonb
    )
where slug = 'geografia-clase-centroamerica-y-caribe';

update public.techniques
set nombre_en = 'North America: the United States, Canada and Mexico',
    descripcion_en = 'The 3 big countries in the north of the continent, from largest to smallest: Canada, the United States and Mexico.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["North America, in this sub-region, groups only 3 countries — but among the largest in the world.","Canada, the northernmost, is the second largest country in the world by area, although with a small population compared with its size.","The United States, south of Canada, stretches from coast to coast between the Pacific and Atlantic oceans.","Mexico, the southernmost of the 3, connects North America with the Central American isthmus."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which of the 3 North American countries is the largest by area?","opciones":["Canada","The United States","Mexico","All three are the same size"],"respuesta":"Canada","explicacion":"Canada is the second largest country in the world by area, larger than the United States."},{"pregunta":"Which country connects North America with the Central American isthmus?","opciones":["Mexico","Canada","The United States","Guatemala"],"respuesta":"Mexico","explicacion":"Mexico is the southernmost of the 3 and borders Guatemala, already in Central America."},{"pregunta":"Between which two oceans does the United States stretch, from coast to coast?","opciones":["The Pacific and the Atlantic","The Atlantic and the Indian","The Pacific and the Indian","The Arctic and the Atlantic"],"respuesta":"The Pacific and the Atlantic","explicacion":"The United States has a coast on both oceans, from coast to coast."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"america","paisesIds":["124","840","484"],"despuesDePaso":2,"titulo":"Canada, the United States and Mexico"}]$leccion_en$::jsonb
    )
where slug = 'geografia-clase-norteamerica';

update public.techniques
set nombre_en = 'Western Europe: France, Germany, the Netherlands and Belgium',
    descripcion_en = 'The block of countries farthest west in central Europe, with some of the largest economies on the continent.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Western Europe groups the countries in the west-center of the continent, between the Atlantic and Germany.","France, the largest of the 4, has a coast on both the Atlantic and the Mediterranean.","Germany, east of France, is the most populous country in the region and shares a border with many neighbors.","The Netherlands and Belgium, the smallest of the 4, lie right on the North Sea, between France and Germany."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which Western European country has a coast on both the Atlantic and the Mediterranean?","opciones":["France","Germany","The Netherlands","Belgium"],"respuesta":"France","explicacion":"France is the only one of the 4 with a coast on both seas."},{"pregunta":"Which are the two smallest countries of the group, right on the North Sea?","opciones":["The Netherlands and Belgium","France and Germany","Germany and Belgium","France and the Netherlands"],"respuesta":"The Netherlands and Belgium","explicacion":"Both are much smaller than France or Germany and lie on the North Sea."},{"pregunta":"Which Western European country is the most populous in the region?","opciones":["Germany","Belgium","The Netherlands","None, they all have the same population"],"respuesta":"Germany","explicacion":"Germany has the largest population of the 4 countries in this sub-region."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"europa","paisesIds":["250","276","528","056"],"despuesDePaso":2,"titulo":"France, Germany, the Netherlands and Belgium"}]$leccion_en$::jsonb
    )
where slug = 'geografia-clase-europa-occidental';

update public.techniques
set nombre_en = 'Eastern Europe: Poland, Ukraine, Hungary and Romania',
    descripcion_en = 'The block between Germany and Russia, with Ukraine as the largest of the 4 by area.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Eastern Europe groups the countries between Germany and Russia, many of them former members of the Soviet bloc.","Poland, east of Germany, is one of the most populous countries in the region.","Ukraine, farther east, is the largest of the 4 by area — one of the biggest agricultural plains in Europe.","Hungary and Romania, farther south, complete the group, both in the basin of the Danube River."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which of these 4 Eastern European countries is the largest by area?","opciones":["Ukraine","Poland","Hungary","Romania"],"respuesta":"Ukraine","explicacion":"Ukraine is by far the largest of the 4 by area."},{"pregunta":"Which river runs through both Hungary and Romania?","opciones":["The Danube","The Rhine","The Volga","The Seine"],"respuesta":"The Danube","explicacion":"The Danube runs through several Eastern European countries, including Hungary and Romania."},{"pregunta":"Which country lies east of Germany, starting the Eastern European block?","opciones":["Poland","Ukraine","Romania","Hungary"],"respuesta":"Poland","explicacion":"Poland is the country that borders Germany directly on the east."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"europa","paisesIds":["616","804","348","642"],"despuesDePaso":2,"titulo":"Poland, Ukraine, Hungary and Romania"}]$leccion_en$::jsonb
    )
where slug = 'geografia-clase-europa-del-este';

update public.techniques
set nombre_en = 'Scandinavia and the Baltic: Sweden, Norway, Denmark and Finland',
    descripcion_en = 'The block of northern Europe, with cold climates and an economy historically based on the sea.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["This sub-region groups the Nordic countries, at the far north of Europe.","Sweden and Norway share the Scandinavian peninsula; Norway, with its fjord coastline, faces the Atlantic, and Sweden faces the Baltic Sea.","Denmark, the smallest and southernmost of the 4, connects the Scandinavian peninsula with the rest of mainland Europe.","Finland, east of Sweden, stands out for its thousands of lakes and its long border with Russia."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which two countries share the Scandinavian peninsula?","opciones":["Sweden and Norway","Sweden and Denmark","Norway and Finland","Denmark and Finland"],"respuesta":"Sweden and Norway","explicacion":"Both countries occupy the same peninsula, with Norway in the west and Sweden in the east."},{"pregunta":"Which of the 4 Nordic countries is the smallest and the southernmost?","opciones":["Denmark","Sweden","Norway","Finland"],"respuesta":"Denmark","explicacion":"Denmark is the smallest of the 4 and the one that connects the region with the rest of mainland Europe."},{"pregunta":"Which Nordic country has a long border with Russia?","opciones":["Finland","Denmark","Norway","Sweden"],"respuesta":"Finland","explicacion":"Finland borders Russia to the east along an extensive border."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"europa","paisesIds":["752","578","208","246"],"despuesDePaso":2,"titulo":"Sweden, Norway, Denmark and Finland"}]$leccion_en$::jsonb
    )
where slug = 'geografia-clase-escandinavia-baltico';

update public.techniques
set nombre_en = 'Mediterranean Region: Spain, Italy, Greece and Portugal',
    descripcion_en = 'Southern Europe, with warm climates and a coast on the Mediterranean Sea (except Portugal, on the Atlantic).',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The Mediterranean Region groups the countries of southern Europe, most of them with a coast on the Mediterranean Sea.","Spain and Italy are the two largest of the group — Spain on the Iberian Peninsula, Italy on the Italian peninsula.","Greece, in the far southeast, has thousands of islands of its own scattered across the Aegean Sea.","Portugal is the exception: it shares a peninsula with Spain, but its whole coast faces the Atlantic Ocean, not the Mediterranean."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which of these 4 countries does NOT have a coast on the Mediterranean Sea?","opciones":["Portugal","Spain","Italy","Greece"],"respuesta":"Portugal","explicacion":"All of Portugal's coast faces the Atlantic Ocean, not the Mediterranean."},{"pregunta":"Which Mediterranean country has thousands of islands of its own in the Aegean Sea?","opciones":["Greece","Spain","Italy","Portugal"],"respuesta":"Greece","explicacion":"Greece has thousands of islands scattered across the Aegean Sea, a very distinctive feature of the country."},{"pregunta":"Which two countries share the Iberian Peninsula within this sub-region?","opciones":["Spain and Portugal","Spain and Italy","Italy and Greece","Portugal and Italy"],"respuesta":"Spain and Portugal","explicacion":"Both share the same peninsula, in southwestern Europe."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"europa","paisesIds":["724","380","300","620"],"despuesDePaso":2,"titulo":"Spain, Italy, Greece and Portugal"}]$leccion_en$::jsonb
    )
where slug = 'geografia-clase-region-mediterranea';

update public.techniques
set nombre_en = 'North Africa (Maghreb): Morocco, Algeria, Tunisia and Libya',
    descripcion_en = 'The block north of the Sahara, between the Mediterranean and the great desert.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The Maghreb is the block of countries in North Africa, north of the Sahara Desert and with a coast on the Mediterranean Sea.","Morocco, the westernmost, is the closest to Europe — separated from Spain by the Strait of Gibraltar.","Algeria, east of Morocco, is the largest country in Africa by area.","Tunisia and Libya complete the block toward the east, both also with a Mediterranean coast."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which strait separates Morocco from Spain at its narrowest point?","opciones":["The Strait of Gibraltar","The Red Sea","The Persian Gulf","The Suez Canal"],"respuesta":"The Strait of Gibraltar","explicacion":"The Strait of Gibraltar is the narrow passage that separates northern Morocco from southern Spain."},{"pregunta":"Which of these 4 Maghreb countries is the largest in Africa by area?","opciones":["Algeria","Morocco","Tunisia","Libya"],"respuesta":"Algeria","explicacion":"Algeria is the largest country on the whole African continent by area."},{"pregunta":"On which sea do the 4 Maghreb countries have a coast?","opciones":["The Mediterranean Sea","The Red Sea","The Indian Ocean","The Gulf of Guinea"],"respuesta":"The Mediterranean Sea","explicacion":"The 4 Maghreb countries share a coast on the Mediterranean Sea, north of the Sahara."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"africa","paisesIds":["504","012","788","434"],"despuesDePaso":2,"titulo":"Morocco, Algeria, Tunisia and Libya"}]$leccion_en$::jsonb
    )
where slug = 'geografia-clase-norte-de-africa-magreb';

update public.techniques
set nombre_en = 'West Africa: Nigeria, Ghana, Senegal and Ivory Coast',
    descripcion_en = 'The coastal block on the Gulf of Guinea, with Nigeria as the most populous country on the whole continent.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["West Africa groups the coastal countries on the Gulf of Guinea, in the west of the continent.","Nigeria, the easternmost of the 4, is the most populous country in all of Africa.","Ghana, farther west, has a direct coast on the Gulf of Guinea, just like its neighbor Ivory Coast.","Senegal, the northernmost and westernmost of the 4, is the westernmost tip of the African continent."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which West African country is the most populous on the whole continent?","opciones":["Nigeria","Ghana","Senegal","Ivory Coast"],"respuesta":"Nigeria","explicacion":"Nigeria is by far the most populous country in Africa."},{"pregunta":"On which gulf do Nigeria, Ghana and Ivory Coast have a coast?","opciones":["The Gulf of Guinea","The Persian Gulf","The Gulf of Aden","The Gulf of Oman"],"respuesta":"The Gulf of Guinea","explicacion":"The three countries share a coast on the Gulf of Guinea, in West Africa."},{"pregunta":"Which of these 4 countries is at the westernmost tip of the African continent?","opciones":["Senegal","Nigeria","Ghana","Ivory Coast"],"respuesta":"Senegal","explicacion":"Senegal occupies the westernmost end of the whole African continent."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"africa","paisesIds":["566","288","686","384"],"despuesDePaso":2,"titulo":"Nigeria, Ghana, Senegal and Ivory Coast"}]$leccion_en$::jsonb
    )
where slug = 'geografia-clase-africa-occidental';

update public.techniques
set nombre_en = 'East Africa: Kenya, Ethiopia, Tanzania and Uganda',
    descripcion_en = 'The block in the east of the continent, crossed by the Great Rift Valley and some of the largest lakes in Africa.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["East Africa groups the countries in the east of the continent, crossed by the Great Rift Valley.","Kenya and Tanzania have a coast on the Indian Ocean and share some of the best-known savannas in Africa.","Ethiopia, farther north, has no access to the sea and is one of the oldest countries on the continent to have kept its independence.","Uganda, inland, is crossed by Lake Victoria, one of the largest lakes in the world, shared with Kenya and Tanzania."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which great geographic feature crosses the countries of East Africa?","opciones":["The Great Rift Valley","The Sahara Desert","The Atlas Mountains","The Congo River"],"respuesta":"The Great Rift Valley","explicacion":"The Great Rift Valley is a huge geological fracture that runs through East Africa from north to south."},{"pregunta":"Which of these 4 East African countries has no access to the sea?","opciones":["Ethiopia","Kenya","Tanzania","None, all 4 have a coast"],"respuesta":"Ethiopia","explicacion":"Ethiopia is inland, surrounded by Eritrea, Djibouti, Somalia, Kenya, South Sudan and Sudan."},{"pregunta":"Which large lake do Uganda, Kenya and Tanzania share?","opciones":["Lake Victoria","Lake Titicaca","The Dead Sea","Lake Baikal"],"respuesta":"Lake Victoria","explicacion":"Lake Victoria is one of the largest lakes in the world and is shared by the three countries."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"africa","paisesIds":["404","231","834","800"],"despuesDePaso":2,"titulo":"Kenya, Ethiopia, Tanzania and Uganda"}]$leccion_en$::jsonb
    )
where slug = 'geografia-clase-africa-oriental';

update public.techniques
set nombre_en = 'Southern Africa: South Africa, Namibia, Botswana and Zimbabwe',
    descripcion_en = 'The block at the far south of the continent, with South Africa as the most economically developed country in the region.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Southern Africa groups the countries at the far south of the continent.","South Africa, at the southern tip, has a coast on two oceans: the Atlantic and the Indian.","Namibia, northwest of South Africa, has a coast on the Atlantic and a long straight strip toward the east (the Caprivi Strip).","Botswana and Zimbabwe, inland, have no access to the sea and share a border with South Africa as well as with Namibia or Zambia."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"On which two oceans does South Africa have a coast?","opciones":["The Atlantic and the Indian","The Atlantic and the Pacific","The Indian and the Pacific","Only the Indian"],"respuesta":"The Atlantic and the Indian","explicacion":"South Africa is at the southern tip of the continent, with a coast on both oceans."},{"pregunta":"Which of these 4 Southern African countries have no access to the sea?","opciones":["Botswana and Zimbabwe","South Africa and Namibia","Only South Africa","None, all 4 have a coast"],"respuesta":"Botswana and Zimbabwe","explicacion":"Both are in the interior of the continent, surrounded by land."},{"pregunta":"Which Southern African country has a long straight strip toward the east (the Caprivi Strip)?","opciones":["Namibia","South Africa","Botswana","Zimbabwe"],"respuesta":"Namibia","explicacion":"The Caprivi Strip is a narrow, straight extension of Namibia's territory."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"africa","paisesIds":["710","516","072","716"],"despuesDePaso":2,"titulo":"South Africa, Namibia, Botswana and Zimbabwe"}]$leccion_en$::jsonb
    )
where slug = 'geografia-clase-africa-austral';

update public.techniques
set nombre_en = 'East Asia: China, Japan, South Korea and Mongolia',
    descripcion_en = 'The block in the east of Asia, with China as the largest and most populous country in the region.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["East Asia groups the countries at the far east of the Asian continent.","China, the largest of the 4, dominates the region in both territory and population.","Japan, an archipelago off the east coast of China, is separated from the continent by the Sea of Japan.","South Korea, on the Korean peninsula, and Mongolia, inland between China and Russia, complete the block."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which East Asian country is an archipelago, separated from the continent by the Sea of Japan?","opciones":["Japan","China","South Korea","Mongolia"],"respuesta":"Japan","explicacion":"Japan is made up of several islands, separated from the Asian continent by the Sea of Japan."},{"pregunta":"Which East Asian country is inland, between China and Russia, with no access to the sea?","opciones":["Mongolia","Japan","South Korea","China"],"respuesta":"Mongolia","explicacion":"Mongolia is in the interior of the continent, surrounded by China and Russia."},{"pregunta":"On which peninsula is South Korea located?","opciones":["The Korean peninsula","The Arabian Peninsula","Indochina","The Italian peninsula"],"respuesta":"The Korean peninsula","explicacion":"South Korea occupies the southern half of the Korean peninsula, which sticks out to the east of China."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"asia_oceania","paisesIds":["156","392","410","496"],"despuesDePaso":2,"titulo":"China, Japan, South Korea and Mongolia"}]$leccion_en$::jsonb
    )
where slug = 'geografia-clase-asia-oriental';

update public.techniques
set nombre_en = 'Southeast and South Asia: Indonesia, the Philippines, Vietnam and India',
    descripcion_en = 'Two neighboring regions: the archipelagos and Indochina in the southeast, and the Indian subcontinent in the south.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["This Class combines two neighboring regions: Southeast Asia (islands and the Indochinese peninsula) and South Asia (the Indian subcontinent).","Indonesia and the Philippines are archipelagos, countries made of thousands of islands, in Southeast Asia.","Vietnam, on the Indochinese peninsula, stretches as a long, curved strip along the east coast.","India, in South Asia, dominates a subcontinent of its own, separated from the rest of Asia by the Himalayas to the north."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which mountain range separates India from the rest of Asia to the north?","opciones":["The Himalayas","The Andes","The Alps","The Atlas"],"respuesta":"The Himalayas","explicacion":"The Himalayas, the highest mountain range in the world, separate the Indian subcontinent from the rest of Asia."},{"pregunta":"Which country in this lesson is shaped like a long, curved strip along the coast of Indochina?","opciones":["Vietnam","India","Indonesia","The Philippines"],"respuesta":"Vietnam","explicacion":"Vietnam stretches as a long, curved strip along the east coast of the Indochinese peninsula."},{"pregunta":"Which of these 4 countries are archipelagos?","opciones":["Indonesia and the Philippines","Vietnam and India","India and Indonesia","Vietnam and the Philippines"],"respuesta":"Indonesia and the Philippines","explicacion":"Both are made up of thousands of islands, unlike Vietnam and India, which are blocks of continuous land."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"asia_oceania","paisesIds":["360","608","704","356"],"despuesDePaso":2,"titulo":"Indonesia, the Philippines, Vietnam and India"}]$leccion_en$::jsonb
    )
where slug = 'geografia-clase-sudeste-asiatico-y-meridional';

update public.techniques
set nombre_en = 'The Middle East: Saudi Arabia, Iran, Turkey and Israel',
    descripcion_en = 'The block between the Mediterranean and the Persian Gulf, with Saudi Arabia as the largest country by territory.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["The Middle East groups the countries between the Mediterranean Sea and the Persian Gulf, in southwestern Asia.","Saudi Arabia, on the Arabian Peninsula, is the largest country in the region by territory.","Turkey, in the northwest, has a small part of its territory in Europe — it is the only country in this lesson with territory on two continents.","Iran, to the east, and its smallest neighbor, Israel, on the Mediterranean coast, complete the block."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which country in this lesson has territory on two continents (Asia and Europe)?","opciones":["Turkey","Saudi Arabia","Iran","Israel"],"respuesta":"Turkey","explicacion":"A small part of Turkey, in the northwest, is in Europe; the rest is in Asia."},{"pregunta":"Which of these 4 countries is the largest by territory?","opciones":["Saudi Arabia","Israel","Turkey","Iran"],"respuesta":"Saudi Arabia","explicacion":"Saudi Arabia occupies most of the Arabian Peninsula, the largest of the 4."},{"pregunta":"Which country in this lesson has a direct coast on the Mediterranean Sea, at the far west of the group?","opciones":["Israel","Iran","Saudi Arabia","None has a Mediterranean coast"],"respuesta":"Israel","explicacion":"Israel has a coast on the Mediterranean Sea, unlike Saudi Arabia and Iran."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"asia_oceania","paisesIds":["682","364","792","376"],"despuesDePaso":2,"titulo":"Saudi Arabia, Iran, Turkey and Israel"}]$leccion_en$::jsonb
    )
where slug = 'geografia-clase-oriente-medio';

update public.techniques
set nombre_en = 'Oceania: Australia, New Zealand, Papua New Guinea and Fiji',
    descripcion_en = 'The most isolated region of the four: a huge island-continent and several much smaller archipelagos.',
    contenido_en = contenido || jsonb_build_object(
      'pasos', $leccion_en$["Oceania is the most isolated region of the four: it is made up of Australia and a series of islands scattered across the Pacific Ocean.","Australia is both a country and a continent of its own — almost as big as all of Europe.","New Zealand, southeast of Australia, is made up of two main islands, with a much colder and more mountainous climate.","Papua New Guinea, north of Australia, and Fiji, farther east, are two much smaller archipelagos, near the equator."]$leccion_en$::jsonb,
      'quiz', $leccion_en$[{"pregunta":"Which Oceania country is also a continent of its own?","opciones":["Australia","New Zealand","Papua New Guinea","Fiji"],"respuesta":"Australia","explicacion":"Australia is the only country in the world that occupies an entire continent."},{"pregunta":"Which of these Oceania countries lies north of Australia, near the equator?","opciones":["Papua New Guinea","New Zealand","None, all are in the south","Fiji"],"respuesta":"Papua New Guinea","explicacion":"Papua New Guinea is north of Australia, much closer to the equator than New Zealand."},{"pregunta":"How many main islands make up New Zealand?","opciones":["Two","One","Five","None, it is part of the Australian continent"],"respuesta":"Two","explicacion":"New Zealand is made up of two main islands, the North Island and the South Island."}]$leccion_en$::jsonb,
      'visuales', $leccion_en$[{"tipo":"geografia.mapa","continente":"asia_oceania","paisesIds":["036","554","598","242"],"despuesDePaso":2,"titulo":"Australia, New Zealand, Papua New Guinea and Fiji"}]$leccion_en$::jsonb
    )
where slug = 'geografia-clase-oceania';
