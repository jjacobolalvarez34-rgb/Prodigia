-- ============================================================
-- Prodigia — Codia (mundo 13): contenido de Aprender.
--
-- 5 Técnicas GRATIS (orden 1-5, requiere_pro=false) y 8 Clases PRO
-- (orden 6-13, requiere_pro=true; la primera fila requiere_pro=true es
-- preview gratis, ver src/lib/aprender/clases.ts). Las Clases son
-- progresivas y dependientes: variables y tipos -> condicionales ->
-- bucles -> funciones -> listas y diccionarios -> recorridos y
-- complejidad -> errores y depuración -> pilas, colas y conjuntos, con
-- el mismo ejemplo en Python, Java, JavaScript y TypeScript.
--
-- Este archivo se GENERA desde src/lib/codia/lecciones/ (fuente única) y
-- src/lib/codia/lecciones/lecciones.test.ts EJECUTA de verdad cada
-- fragmento de código (python, javac + JVM, node, typescript): la salida
-- mostrada en cada lección es la salida real. No editar a mano.
--
-- La validación del quiz vive en el server (/api/aprender/completar):
-- quien no es Pro no puede aprobar una clase requiere_pro.
-- Idempotente (on conflict por slug). Requiere 0189 (techniques admite
-- problem_type='codia') y 0170 (columna requiere_pro).
-- ============================================================

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values
('codia-tecnica-tabla-seguimiento', 'Trazar variables a mano con una tabla de seguimiento',
  'Antes de adivinar qué imprime un fragmento, anota cómo cambia cada variable línea por línea.',
  'codia',
  $codia${
  "pasos": [
    "Para saber qué imprime un fragmento no adivines: haz una tabla con una columna por variable y una fila por cada línea que cambia algo. Así no dependes de la memoria y encuentras el resultado paso a paso.",
    "Ejemplo resuelto. Sigue este programa:\n```python\na = 3\nb = 4\na = a + b\nb = a - b\nprint(a, b)\n```\nTabla: línea 1 deja a=3. Línea 2 deja a=3, b=4. Línea 3 calcula a + b = 7 y lo guarda en a: a=7, b=4. Línea 4 calcula a - b = 7 - 4 = 3 con el valor NUEVO de a y lo guarda en b: a=7, b=3. El print muestra:\n```salida\n7 3\n```",
    "Regla de oro: en a = a + b primero se calcula el lado derecho con los valores que las variables tienen AHORA, y recién después se guarda el resultado en el lado izquierdo. El signo = no es una igualdad de matemática: significa guarda esto en esa variable.",
    "El mismo programa en los otros tres lenguajes: la tabla es idéntica, solo cambia cómo se escribe.\n```java\nint a = 3;\nint b = 4;\na = a + b;\nb = a - b;\nSystem.out.println(a + \" \" + b);\n```\n```javascript\nlet a = 3;\nlet b = 4;\na = a + b;\nb = a - b;\nconsole.log(a, b);\n```\n```typescript\nlet a: number = 3;\nlet b: number = 4;\na = a + b;\nb = a - b;\nconsole.log(a, b);\n```\n```salida\n7 3\n```",
    "Trampa clásica: intercambiar dos variables sin una tercera se rompe. Trazalo:\n```python\na = 1\nb = 2\na = b\nb = a\nprint(a, b)\n```\nLínea 3: a pasa a valer 2 y el 1 original se pierde. Línea 4: b = a copia ese 2. Las dos quedan iguales:\n```salida\n2 2\n```\nPara intercambiar necesitas una variable temporal: t = a, luego a = b y por último b = t.",
    "Consejo de examen: tacha el valor viejo cada vez que una variable cambia y escribe el nuevo al lado. Si el fragmento tiene un bucle, agrega una fila por vuelta. Tardas un minuto y evitas casi todos los errores de lectura."
  ],
  "quiz": [
    {
      "pregunta": "¿Qué imprime este programa?\n```python\nx = 5\ny = x * 2\nx = y - 3\nprint(x, y)\n```",
      "opciones": [
        "7 10",
        "5 10",
        "7 7",
        "10 7"
      ],
      "respuesta": "7 10",
      "explicacion": "x=5; y=10; x = y - 3 = 7 (y sigue valiendo 10). Se imprime 7 10."
    },
    {
      "pregunta": "Si x vale 4 y luego se ejecuta x = x * x + 1, ¿cuánto vale x?\n```python\nx = 4\nx = x * x + 1\nprint(x)\n```",
      "opciones": [
        "17",
        "16",
        "9",
        "5"
      ],
      "respuesta": "17",
      "explicacion": "Se calcula con el valor viejo: 4 * 4 + 1 = 17, y recién entonces se guarda en x."
    }
  ]
}$codia$::jsonb,
  1, false),
('codia-tecnica-leer-bucles', 'Leer un bucle: cuántas vueltas da y qué cambia en cada una',
  'Tres preguntas para cualquier bucle: dónde empieza, cuándo termina y cuánto cambia por vuelta.',
  'codia',
  $codia${
  "pasos": [
    "Frente a un bucle haz siempre tres preguntas: ¿con qué valor arranca? ¿cuándo se corta? ¿qué cambia en cada vuelta? Con esas tres respuestas sabes cuántas vueltas da y no te pierdes.",
    "En un for con rango el límite superior NO se incluye: range(2, 6) recorre 2, 3, 4 y 5. Las vueltas son límite - inicio = 6 - 2 = 4.\n```python\nfor i in range(2, 6):\n    print(i)\n```\n```salida\n2\n3\n4\n5\n```\nEn Java, JavaScript y TypeScript pasa lo mismo con la condición i < 6.\n```java\nfor (int i = 2; i < 6; i++) {\n    System.out.println(i);\n}\n```\n```javascript\nfor (let i = 2; i < 6; i++) {\n    console.log(i);\n}\n```\n```typescript\nfor (let i = 2; i < 6; i++) {\n    console.log(i);\n}\n```\n```salida\n2\n3\n4\n5\n```",
    "En un while, mira qué cambia en cada vuelta y cuándo deja de cumplirse la condición. Ejemplo resuelto:\n```python\nn = 20\nvueltas = 0\nwhile n > 1:\n    n = n // 2\n    vueltas = vueltas + 1\nprint(vueltas, n)\n```\nVuelta 1: n pasa de 20 a 10. Vuelta 2: a 5. Vuelta 3: a 2. Vuelta 4: a 1, y como 1 > 1 es falso el bucle termina.\n```salida\n4 1\n```",
    "Con un acumulador (total = total + algo) anota el valor de total al final de cada vuelta. Si el bucle es de 4 vueltas, son 4 filas en tu tabla. No calcules todo de golpe.",
    "Cuidado con dos errores muy comunes: contar una vuelta de más o de menos por el límite (off-by-one) y olvidarte de que en Java, JavaScript y TypeScript con i <= 5 SÍ se incluye el 5 mientras que range(5) de Python llega hasta 4."
  ],
  "quiz": [
    {
      "pregunta": "¿Cuántas vueltas da un for i in range(3, 8) en Python?",
      "opciones": [
        "5",
        "4",
        "6",
        "8"
      ],
      "respuesta": "5",
      "explicacion": "El 8 no se incluye: i toma 3, 4, 5, 6 y 7, o sea 8 - 3 = 5 vueltas."
    },
    {
      "pregunta": "¿Qué imprime este código?\n```python\ntotal = 0\nfor i in range(1, 5):\n    total = total + i * 2\nprint(total)\n```",
      "opciones": [
        "20",
        "10",
        "30",
        "12"
      ],
      "respuesta": "20",
      "explicacion": "i = 1, 2, 3, 4: se suman 2, 4, 6 y 8 (acumulado 2, 6, 12, 20)."
    }
  ]
}$codia$::jsonb,
  2, false),
('codia-tecnica-errores-tipicos', 'Reconocer los errores típicos por el mensaje',
  'Cada error tiene un nombre y una causa habitual: aprender a leerlo te dice dónde mirar.',
  'codia',
  $codia${
  "pasos": [
    "Un error no es un fracaso: es una pista. El nombre del error te dice qué tipo de problema es y la línea te dice dónde buscar. Hay cinco que aparecen todo el tiempo.",
    "1) Error de sintaxis: el programa ni siquiera empieza. Casi siempre falta un dos puntos, un paréntesis, una llave o una comilla.\n```python!\nif 3 > 2\n    print(\"si\")\n```\n```salida\nSyntaxError\n```",
    "2) Nombre inexistente: usaste una variable o función que no existe, muchas veces por un error de tipeo.\n```python!\ntotal = 10\nprint(totl)\n```\n```salida\nNameError\n```\nEn Java el mismo problema no llega a ejecutarse: el compilador lo frena antes.\n```java!\nint total = 10;\nSystem.out.println(totl);\n```\n```salida\nerror de compilación\n```",
    "3) Índice fuera de rango: pediste la posición n en una lista de n elementos. Las posiciones van de 0 a n - 1.\n```python!\ndatos = [4, 5, 6]\nprint(datos[3])\n```\n```salida\nIndexError\n```\n```java!\nint[] datos = {4, 5, 6};\nSystem.out.println(datos[3]);\n```\n```salida\nArrayIndexOutOfBoundsException\n```",
    "4) División por cero: en Python y en Java con enteros es un error.\n```python!\nprint(10 // 0)\n```\n```salida\nZeroDivisionError\n```\n```java!\nSystem.out.println(10 / 0);\n```\n```salida\nArithmeticException\n```\nJavaScript es distinto: no falla, imprime Infinity.\n```javascript\nconsole.log(10 / 0);\n```\n```salida\nInfinity\n```",
    "5) Tipos incompatibles: mezclar cosas que no se pueden combinar.\n```python!\nprint(\"edad: \" + 30)\n```\n```salida\nTypeError\n```\nEn Java y TypeScript el compilador lo detecta antes de ejecutar.\n```typescript!\nlet edad: number = \"treinta\";\n```\n```salida\nerror de compilación\n```"
  ],
  "quiz": [
    {
      "pregunta": "¿Qué error produce este código?\n```python\ndatos = [1, 2, 3]\nprint(datos[3])\n```",
      "opciones": [
        "IndexError",
        "NameError",
        "SyntaxError",
        "ZeroDivisionError"
      ],
      "respuesta": "IndexError",
      "explicacion": "La lista tiene posiciones 0, 1 y 2; pedir la 3 se sale de rango."
    },
    {
      "pregunta": "¿Qué imprime este código en JavaScript?\n```javascript\nconsole.log(5 / 0);\n```",
      "opciones": [
        "Infinity",
        "Un error de división por cero",
        "0",
        "undefined"
      ],
      "respuesta": "Infinity",
      "explicacion": "JavaScript no lanza error al dividir por cero: da Infinity."
    }
  ]
}$codia$::jsonb,
  3, false),
('codia-tecnica-division-entera-modulo', 'División entera y resto: cuidado con los negativos',
  '// en Python, / entre enteros en Java y Math.trunc en JavaScript: casi siempre coinciden, salvo con negativos.',
  'codia',
  $codia${
  "pasos": [
    "La división entera descarta los decimales y el resto (módulo, %) es lo que sobra. Con números positivos los cuatro lenguajes coinciden: 17 = 3 * 5 + 2.\n```python\nprint(17 // 5, 17 % 5)\n```\n```salida\n3 2\n```\n```java\nSystem.out.println(17 / 5 + \" \" + 17 % 5);\n```\n```javascript\nconsole.log(Math.trunc(17 / 5), 17 % 5);\n```\n```typescript\nconsole.log(Math.trunc(17 / 5), 17 % 5);\n```\n```salida\n3 2\n```\nEn Java dos enteros ya dividen entero con /. En JavaScript y TypeScript el / siempre da decimales, por eso se usa Math.trunc.",
    "Con negativos Python redondea hacia abajo (piso) y los demás hacia cero. Mismo cálculo, dos resultados:\n```python\nprint(-7 // 2, -7 % 3)\n```\n```salida\n-4 2\n```\n```java\nSystem.out.println(-7 / 2 + \" \" + -7 % 3);\n```\n```salida\n-3 -1\n```\n```javascript\nconsole.log(Math.trunc(-7 / 2), -7 % 3);\n```\n```salida\n-3 -1\n```",
    "Cómo recordarlo: en Python el resto lleva el signo del divisor (por eso -7 % 3 da 2); en Java, JavaScript y TypeScript lleva el signo del dividendo (por eso da -1). Si el fragmento no tiene negativos, no te preocupes: dan lo mismo.",
    "Uso práctico del resto: saber si un número es par (n % 2 == 0) o repetir un ciclo (i % 3 da 0, 1, 2, 0, 1, 2...).\n```python\nfor i in range(6):\n    print(i % 3)\n```\n```salida\n0\n1\n2\n0\n1\n2\n```"
  ],
  "quiz": [
    {
      "pregunta": "¿Qué imprime este código en Python?\n```python\nprint(17 // 5, 17 % 5)\n```",
      "opciones": [
        "3 2",
        "3.4 2",
        "2 3",
        "4 2"
      ],
      "respuesta": "3 2",
      "explicacion": "17 // 5 es 3 (cociente entero) y 17 % 5 es 2 (resto)."
    },
    {
      "pregunta": "¿Qué imprime este código en Java?\n```java\nSystem.out.println(-7 / 2);\n```",
      "opciones": [
        "-3",
        "-4",
        "-3.5",
        "3"
      ],
      "respuesta": "-3",
      "explicacion": "Java trunca hacia cero: -3,5 pasa a -3. (Python daría -4 con //.)"
    },
    {
      "pregunta": "¿Qué imprime este código en Python?\n```python\nprint(-7 // 2)\n```",
      "opciones": [
        "-4",
        "-3",
        "-3.5",
        "4"
      ],
      "respuesta": "-4",
      "explicacion": "Python redondea hacia abajo: -3,5 pasa a -4."
    }
  ]
}$codia$::jsonb,
  4, false),
('codia-tecnica-complejidad-vistazo', 'Complejidad de un vistazo: contar bucles anidados',
  'Con contar cuántos bucles anidados recorren n ya sabes si el código es O(n) o O(n²).',
  'codia',
  $codia${
  "pasos": [
    "La complejidad temporal dice cómo crece el trabajo cuando crece n (por ejemplo, el largo de una lista). No mide segundos: mide cuántas veces se repite la operación principal.",
    "Regla de un vistazo: sin bucles sobre n es O(1); un bucle sobre n es O(n); dos bucles anidados sobre n son O(n²). Pruébalo contando cuántas veces corre total = total + 1 cuando n se duplica:\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        total = total + 1\n    return total\n\nprint(contar(4), contar(8))\n```\n```salida\n4 8\n```\nCon un bucle, al duplicar n el trabajo se duplica. Con dos anidados:\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        for j in range(n):\n            total = total + 1\n    return total\n\nprint(contar(4), contar(8))\n```\n```salida\n16 64\n```\nDuplicar n multiplicó el trabajo por cuatro: es O(n²).",
    "Bucles en secuencia se suman, no se multiplican: dos bucles de n vueltas, uno después del otro, hacen 2n operaciones, que sigue siendo O(n).\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        total = total + 1\n    for j in range(n):\n        total = total + 1\n    return total\n\nprint(contar(4), contar(8))\n```\n```salida\n8 16\n```",
    "Un bucle interno que siempre da 3 vueltas es una constante: el total es 3n, o sea O(n). Solo cuentan los bucles que dependen de n.\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        for j in range(3):\n            total = total + 1\n    return total\n\nprint(contar(4), contar(8))\n```\n```salida\n12 24\n```"
  ],
  "quiz": [
    {
      "pregunta": "Un código tiene un bucle que va de 0 a n y, después (no adentro), otro bucle que va de 0 a n. ¿Cuál es su complejidad?",
      "opciones": [
        "O(n)",
        "O(n²)",
        "O(1)",
        "O(2 elevado a n)"
      ],
      "respuesta": "O(n)",
      "explicacion": "Se suman: n + n = 2n operaciones, que crece igual que n."
    },
    {
      "pregunta": "¿Qué devuelve contar(5)?\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        for j in range(n):\n            total = total + 1\n    return total\n\nprint(contar(5))\n```",
      "opciones": [
        "25",
        "5",
        "10",
        "20"
      ],
      "respuesta": "25",
      "explicacion": "Dos bucles anidados de n vueltas: 5 * 5 = 25."
    }
  ]
}$codia$::jsonb,
  5, false),
('codia-clase-01-variables-y-tipos', 'Clase 1: Variables y tipos — guardar y nombrar datos',
  'Qué es una variable, qué tipos básicos existen y cómo se escribe lo mismo en Python, Java, JavaScript y TypeScript.',
  'codia',
  $codia${
  "pasos": [
    "Una variable es un nombre que apunta a un valor guardado en memoria. Los tipos básicos son el entero (15), el texto (\"Ana\") y el booleano (verdadero o falso). Python y JavaScript deducen el tipo solos; Java y TypeScript te piden declararlo, y por eso detectan más errores antes de correr.",
    "Mismo programa en los cuatro lenguajes. Python:\n```python\nedad = 15\nnombre = \"Ana\"\nmayor = edad >= 18\nprint(nombre, edad, mayor)\n```\n```salida\nAna 15 False\n```\nJava, JavaScript y TypeScript:\n```java\nint edad = 15;\nString nombre = \"Ana\";\nboolean mayor = edad >= 18;\nSystem.out.println(nombre + \" \" + edad + \" \" + mayor);\n```\n```javascript\nlet edad = 15;\nconst nombre = \"Ana\";\nconst mayor = edad >= 18;\nconsole.log(nombre, edad, mayor);\n```\n```typescript\nlet edad: number = 15;\nconst nombre: string = \"Ana\";\nconst mayor: boolean = edad >= 18;\nconsole.log(nombre, edad, mayor);\n```\n```salida\nAna 15 false\n```\nDetalle: Python escribe True y False con mayúscula; los otros tres, true y false.",
    "Un comentario es texto para las personas: el lenguaje lo ignora por completo. Python usa # y Java, JavaScript y TypeScript usan //. Sirve para explicar por qué hay una línea, y también para desactivarla sin borrarla. Los cuatro programas imprimen lo mismo:\n```python\n# Guarda la edad de Ana\nedad = 15\n# Muestra la edad\nprint(edad)\n```\n```java\n// Guarda la edad de Ana\nint edad = 15;\n// Muestra la edad\nSystem.out.println(edad);\n```\n```javascript\n// Guarda la edad de Ana\nconst edad = 15;\n// Muestra la edad\nconsole.log(edad);\n```\n```typescript\n// Guarda la edad de Ana\nconst edad: number = 15;\n// Muestra la edad\nconsole.log(edad);\n```\n```salida\n15\n```\nLos comentarios no aparecen en la salida. Si pones el símbolo del comentario delante de una instrucción, esa línea deja de ejecutarse:\n```python\nedad = 15\n# print(edad)\nprint(\"Listo\")\n```\n```salida\nListo\n```",
    "Java y TypeScript no dejan cambiar el tipo de una variable: asignar un texto a un entero es un error de compilación. Python y JavaScript sí lo permiten.\n```java!\nint x = \"hola\";\n```\n```salida\nerror de compilación\n```\n```typescript!\nlet x: number = \"hola\";\n```\n```salida\nerror de compilación\n```\n```python\nx = 5\nx = \"hola\"\nprint(x)\n```\n```salida\nhola\n```",
    "Asignar es guardar, no comparar: cada línea usa el valor actual y guarda el resultado. Traza este programa con una tabla (puntos: 10, luego 15, luego 30):\n```python\npuntos = 10\npuntos = puntos + 5\npuntos = puntos * 2\nprint(puntos)\n```\n```java\nint puntos = 10;\npuntos = puntos + 5;\npuntos = puntos * 2;\nSystem.out.println(puntos);\n```\n```javascript\nlet puntos = 10;\npuntos = puntos + 5;\npuntos = puntos * 2;\nconsole.log(puntos);\n```\n```typescript\nlet puntos: number = 10;\npuntos = puntos + 5;\npuntos = puntos * 2;\nconsole.log(puntos);\n```\n```salida\n30\n```",
    "Unir texto con números: Java, JavaScript y TypeScript convierten el número solos al usar +; Python exige str().\n```python\nedad = 15\nprint(\"Edad: \" + str(edad))\n```\n```java\nint edad = 15;\nSystem.out.println(\"Edad: \" + edad);\n```\n```javascript\nconst edad = 15;\nconsole.log(\"Edad: \" + edad);\n```\n```typescript\nconst edad: number = 15;\nconsole.log(\"Edad: \" + edad);\n```\n```salida\nEdad: 15\n```\nSin el str(), Python protesta:\n```python!\nprint(\"Edad: \" + 15)\n```\n```salida\nTypeError\n```",
    "El orden importa cuando se mezclan números y texto con +. Java, JavaScript y TypeScript evalúan de izquierda a derecha: en 1 + 2 + \"5\" primero suman los números (3) y después se concatena (\"35\"); en \"1\" + 2 + 3 ya hay un texto desde el principio, así que todo se concatena (\"123\").\n```java\nSystem.out.println(1 + 2 + \"5\");\nSystem.out.println(\"1\" + 2 + 3);\n```\n```javascript\nconsole.log(1 + 2 + \"5\");\nconsole.log(\"1\" + 2 + 3);\n```\n```typescript\nconsole.log(1 + 2 + \"5\");\nconsole.log(\"1\" + 2 + 3);\n```\n```salida\n35\n123\n```\nPython no mezcla números con texto: esas dos líneas dan TypeError. Para obtener el mismo resultado se convierte con str():\n```python\nprint(str(1 + 2) + \"5\")\nprint(\"1\" + str(2) + str(3))\n```\n```salida\n35\n123\n```",
    "Dos operaciones más con textos. El largo de un texto (cuántos caracteres tiene, contando los espacios) se pide con len() en Python, con .length() en Java y con .length en JavaScript y TypeScript:\n```python\nnombre = \"Ana Paz\"\nprint(len(\"Hola\"), len(nombre))\n```\n```java\nString nombre = \"Ana Paz\";\nSystem.out.println(\"Hola\".length() + \" \" + nombre.length());\n```\n```javascript\nconst nombre = \"Ana Paz\";\nconsole.log(\"Hola\".length, nombre.length);\n```\n```typescript\nconst nombre: string = \"Ana Paz\";\nconsole.log(\"Hola\".length, nombre.length);\n```\n```salida\n4 7\n```\nSolo Python permite repetir un texto multiplicándolo por un número: \"ab\" * 3 da \"ababab\". En JavaScript y TypeScript se usa .repeat(3) y en Java esa multiplicación ni compila.\n```python\nr = \"ab\" * 3\nprint(r)\nprint(len(r))\n```\n```javascript\nconst r = \"ab\".repeat(3);\nconsole.log(r);\nconsole.log(r.length);\n```\n```typescript\nconst r: string = \"ab\".repeat(3);\nconsole.log(r);\nconsole.log(r.length);\n```\n```salida\nababab\n6\n```\n```java!\nString r = \"ab\" * 3;\n```\n```salida\nerror de compilación\n```",
    "Ejemplo resuelto: precio de una compra.\n```python\nprecio = 8\ncantidad = 3\ntotal = precio * cantidad\ndescuento = 4\ntotal = total - descuento\nprint(total)\n```\nTabla: precio=8; cantidad=3; total=24 (8 * 3); descuento=4; total=20 (24 - 4). El print muestra 20 y, como cada línea usa el valor actual de la variable, el orden de las líneas importa.\n```salida\n20\n```\nEn los otros tres lenguajes solo cambia la declaración (int, let, let ... : number): la lógica y el resultado son idénticos."
  ],
  "quiz": [
    {
      "pregunta": "¿Qué imprime este código?\n```python\nx = 4\ny = x + 3\nx = y * 2\nprint(x, y)\n```",
      "opciones": [
        "14 7",
        "8 7",
        "14 14",
        "7 14"
      ],
      "respuesta": "14 7",
      "explicacion": "x=4; y=7; x = y * 2 = 14 (y sigue en 7)."
    },
    {
      "pregunta": "¿Cuál de estas líneas NO compila en Java?",
      "opciones": [
        "int x = \"hola\";",
        "String s = \"hola\";",
        "boolean b = true;",
        "int y = 3 + 4;"
      ],
      "respuesta": "int x = \"hola\";",
      "explicacion": "Un int no puede guardar un texto: Java lo rechaza al compilar."
    },
    {
      "pregunta": "¿Qué imprime este código en Python?\n```python\nprint(3 >= 2)\n```",
      "opciones": [
        "True",
        "true",
        "1",
        "3"
      ],
      "respuesta": "True",
      "explicacion": "La comparación da un booleano y Python lo escribe con mayúscula inicial."
    }
  ]
}$codia$::jsonb,
  6, true),
('codia-clase-02-condicionales', 'Clase 2: Condicionales — decidir qué camino sigue el código',
  'if, else y else if; operadores de comparación y lógicos; y la trampa de = contra == (y === en JavaScript).',
  'codia',
  $codia${
  "pasos": [
    "Un condicional ejecuta un bloque solo si una condición (un booleano) es verdadera. Los comparadores son ==, !=, <, <=, > y >=; para combinar condiciones, Python usa and, or, not y los otros tres lenguajes usan &&, || y !.",
    "Mismo if/else en los cuatro lenguajes (x vale 7): Python usa dos puntos e indentación; los otros usan paréntesis y llaves.\n```python\nx = 7\nif x > 5:\n    print(\"grande\")\nelse:\n    print(\"chico\")\n```\n```java\nint x = 7;\nif (x > 5) {\n    System.out.println(\"grande\");\n} else {\n    System.out.println(\"chico\");\n}\n```\n```javascript\nlet x = 7;\nif (x > 5) {\n    console.log(\"grande\");\n} else {\n    console.log(\"chico\");\n}\n```\n```typescript\nlet x: number = 7;\nif (x > 5) {\n    console.log(\"grande\");\n} else {\n    console.log(\"chico\");\n}\n```\n```salida\ngrande\n```",
    "Varias ramas: se evalúan en orden y gana la PRIMERA condición verdadera (elif en Python, else if en los demás). Con nota = 72:\n```python\nnota = 72\nif nota >= 90:\n    print(\"A\")\nelif nota >= 70:\n    print(\"B\")\nelse:\n    print(\"C\")\n```\n```java\nint nota = 72;\nif (nota >= 90) {\n    System.out.println(\"A\");\n} else if (nota >= 70) {\n    System.out.println(\"B\");\n} else {\n    System.out.println(\"C\");\n}\n```\n```javascript\nlet nota = 72;\nif (nota >= 90) {\n    console.log(\"A\");\n} else if (nota >= 70) {\n    console.log(\"B\");\n} else {\n    console.log(\"C\");\n}\n```\n```typescript\nlet nota: number = 72;\nif (nota >= 90) {\n    console.log(\"A\");\n} else if (nota >= 70) {\n    console.log(\"B\");\n} else {\n    console.log(\"C\");\n}\n```\n```salida\nB\n```\n72 no llega a 90, sí llega a 70: imprime B y las ramas de abajo ni se miran.",
    "Condiciones combinadas: los dos lados de un and (&&) deben ser verdaderos; con or (||) alcanza uno. Edad 15:\n```python\nedad = 15\nif edad >= 12 and edad <= 17:\n    print(\"adolescente\")\n```\n```java\nint edad = 15;\nif (edad >= 12 && edad <= 17) {\n    System.out.println(\"adolescente\");\n}\n```\n```javascript\nlet edad = 15;\nif (edad >= 12 && edad <= 17) {\n    console.log(\"adolescente\");\n}\n```\n```typescript\nlet edad: number = 15;\nif (edad >= 12 && edad <= 17) {\n    console.log(\"adolescente\");\n}\n```\n```salida\nadolescente\n```",
    "La trampa de = contra ==: un solo signo = ASIGNA, dos COMPARAN. Python y Java lo detectan y frenan el programa:\n```python!\nx = 5\nif x = 5:\n    print(\"cinco\")\n```\n```salida\nSyntaxError\n```\n```java!\nint x = 5;\nif (x = 5) {\n    System.out.println(\"cinco\");\n}\n```\n```salida\nerror de compilación\n```\nEn JavaScript hay un detalle más: == convierte tipos y === no. Por eso se recomienda ===.\n```javascript\nconsole.log(\"5\" == 5);\nconsole.log(\"5\" === 5);\n```\n```salida\ntrue\nfalse\n```",
    "Ejemplo resuelto: qué estado imprime.\n```python\ntemp = 24\nif temp > 30:\n    estado = \"calor\"\nelif temp > 20:\n    estado = \"templado\"\nelse:\n    estado = \"frio\"\nprint(estado)\n```\nTraza: 24 > 30 es falso, se salta esa rama; 24 > 20 es verdadero, estado = \"templado\" y no se mira el else.\n```salida\ntemplado\n```"
  ],
  "quiz": [
    {
      "pregunta": "¿Qué imprime este código?\n```python\nx = 10\nif x % 2 == 0 and x > 5:\n    print(\"A\")\nelse:\n    print(\"B\")\n```",
      "opciones": [
        "A",
        "B",
        "A y después B",
        "No imprime nada"
      ],
      "respuesta": "A",
      "explicacion": "10 es par y mayor que 5: las dos condiciones se cumplen."
    },
    {
      "pregunta": "En JavaScript, ¿qué operador compara igualdad SIN convertir tipos?",
      "opciones": [
        "===",
        "=",
        "==",
        "=>"
      ],
      "respuesta": "===",
      "explicacion": "=== compara valor y tipo; == convierte antes de comparar (\"5\" == 5 es true)."
    },
    {
      "pregunta": "¿Qué imprime este código?\n```python\nscore = 85\nif score >= 90:\n    print(\"A\")\nelif score >= 80:\n    print(\"B\")\nelse:\n    print(\"C\")\n```",
      "opciones": [
        "B",
        "A",
        "C",
        "A y B"
      ],
      "respuesta": "B",
      "explicacion": "85 no cumple >= 90 pero sí >= 80: gana esa rama y las demás no se evalúan."
    }
  ]
}$codia$::jsonb,
  7, true),
('codia-clase-03-bucles', 'Clase 3: Bucles — repetir sin copiar y pegar',
  'for y while, acumuladores, break y el error de una vuelta de más o de menos, en los cuatro lenguajes.',
  'codia',
  $codia${
  "pasos": [
    "Un bucle repite un bloque. Usa for cuando sabes cuántas vueltas hay (recorrer un rango o una lista) y while cuando repites hasta que algo cambie. En los dos casos haz las tres preguntas: dónde arranca, cuándo termina, qué cambia por vuelta.",
    "for de 0 a 2 en los cuatro lenguajes (el límite superior no se incluye):\n```python\nfor i in range(3):\n    print(i)\n```\n```java\nfor (int i = 0; i < 3; i++) {\n    System.out.println(i);\n}\n```\n```javascript\nfor (let i = 0; i < 3; i++) {\n    console.log(i);\n}\n```\n```typescript\nfor (let i = 0; i < 3; i++) {\n    console.log(i);\n}\n```\n```salida\n0\n1\n2\n```",
    "Acumulador: una variable que junta el resultado. Suma de 1 a 5:\n```python\ntotal = 0\nfor i in range(1, 6):\n    total = total + i\nprint(total)\n```\n```java\nint total = 0;\nfor (int i = 1; i <= 5; i++) {\n    total = total + i;\n}\nSystem.out.println(total);\n```\n```javascript\nlet total = 0;\nfor (let i = 1; i <= 5; i++) {\n    total = total + i;\n}\nconsole.log(total);\n```\n```typescript\nlet total: number = 0;\nfor (let i = 1; i <= 5; i++) {\n    total = total + i;\n}\nconsole.log(total);\n```\n```salida\n15\n```\nFíjate que range(1, 6) equivale a i <= 5: las dos formas llegan hasta 5.",
    "Cuando una variable se actualiza usando su propio valor (total = total + i) existe una forma corta: total += i. También hay -= y *=. Es solo una abreviatura: hace exactamente lo mismo. Suma y producto de los números de 1 a 4:\n```python\nsuma = 0\nproducto = 1\nfor i in range(1, 5):\n    suma += i\n    producto *= i\nprint(suma, producto)\n```\n```java\nint suma = 0;\nint producto = 1;\nfor (int i = 1; i < 5; i++) {\n    suma += i;\n    producto *= i;\n}\nSystem.out.println(suma + \" \" + producto);\n```\n```javascript\nlet suma = 0;\nlet producto = 1;\nfor (let i = 1; i < 5; i++) {\n    suma += i;\n    producto *= i;\n}\nconsole.log(suma, producto);\n```\n```typescript\nlet suma: number = 0;\nlet producto: number = 1;\nfor (let i = 1; i < 5; i++) {\n    suma += i;\n    producto *= i;\n}\nconsole.log(suma, producto);\n```\n```salida\n10 24\n```\nVuelta a vuelta: suma va 1, 3, 6, 10 y producto va 1, 2, 6, 24.",
    "while: cuenta regresiva. La condición se revisa ANTES de cada vuelta y algo adentro tiene que acercarla a falsa; si no, el bucle no termina nunca.\n```python\nn = 3\nwhile n > 0:\n    print(n)\n    n = n - 1\n```\n```java\nint n = 3;\nwhile (n > 0) {\n    System.out.println(n);\n    n = n - 1;\n}\n```\n```javascript\nlet n = 3;\nwhile (n > 0) {\n    console.log(n);\n    n = n - 1;\n}\n```\n```typescript\nlet n: number = 3;\nwhile (n > 0) {\n    console.log(n);\n    n = n - 1;\n}\n```\n```salida\n3\n2\n1\n```",
    "break corta el bucle apenas se cumple algo. Primer múltiplo de 4 desde 10:\n```python\nfor i in range(10, 30):\n    if i % 4 == 0:\n        print(i)\n        break\n```\n```java\nfor (int i = 10; i < 30; i++) {\n    if (i % 4 == 0) {\n        System.out.println(i);\n        break;\n    }\n}\n```\n```javascript\nfor (let i = 10; i < 30; i++) {\n    if (i % 4 == 0) {\n        console.log(i);\n        break;\n    }\n}\n```\n```typescript\nfor (let i = 10; i < 30; i++) {\n    if (i % 4 === 0) {\n        console.log(i);\n        break;\n    }\n}\n```\n```salida\n12\n```\nPrueba 10 (resto 2), 11 (resto 3), 12 (resto 0): imprime 12 y sale.",
    "Ejemplo resuelto con tabla: suma de cuadrados.\n```python\ntotal = 0\nfor i in range(1, 4):\n    total = total + i * i\nprint(total)\n```\nVuelta 1: i=1, total = 0 + 1 = 1. Vuelta 2: i=2, total = 1 + 4 = 5. Vuelta 3: i=3, total = 5 + 9 = 14. Termina porque range(1, 4) no incluye el 4.\n```salida\n14\n```",
    "Otro ejemplo clásico: el factorial de n es 1 * 2 * ... * n (el de 5 es 120). Un for con un acumulador que se multiplica lo calcula, dentro de una función:\n```python\ndef factorial(n):\n    r = 1\n    for i in range(2, n + 1):\n        r *= i\n    return r\n\nprint(factorial(5))\n```\n```java\nstatic int factorial(int n) {\n    int r = 1;\n    for (int i = 2; i < n + 1; i++) {\n        r *= i;\n    }\n    return r;\n}\n\nSystem.out.println(factorial(5));\n```\n```javascript\nfunction factorial(n) {\n    let r = 1;\n    for (let i = 2; i < n + 1; i++) {\n        r *= i;\n    }\n    return r;\n}\n\nconsole.log(factorial(5));\n```\n```typescript\nfunction factorial(n: number): number {\n    let r: number = 1;\n    for (let i = 2; i < n + 1; i++) {\n        r *= i;\n    }\n    return r;\n}\n\nconsole.log(factorial(5));\n```\n```salida\n120\n```\nTabla: r empieza en 1 y con i = 2, 3, 4, 5 pasa a 2, 6, 24, 120. El for arranca en 2 porque multiplicar por 1 no cambia nada, y el límite es n + 1 porque el límite superior no se incluye.",
    "El error más común: una vuelta de más o de menos. range(1, 5) llega hasta 4, no hasta 5:\n```python\ntotal = 0\nfor i in range(1, 5):\n    total = total + i\nprint(total)\n```\n```salida\n10\n```\nSi querías sumar de 1 a 5 (15) tenías que escribir range(1, 6). En Java, JavaScript y TypeScript el equivalente es escribir i < 5 cuando necesitabas i <= 5."
  ],
  "quiz": [
    {
      "pregunta": "¿Qué imprime este código?\n```python\nn = 5\nc = 0\nwhile n > 0:\n    n = n - 2\n    c = c + 1\nprint(c, n)\n```",
      "opciones": [
        "3 -1",
        "2 1",
        "3 0",
        "2 -1"
      ],
      "respuesta": "3 -1",
      "explicacion": "n: 5 -> 3 -> 1 -> -1. Son 3 vueltas y termina con n = -1."
    },
    {
      "pregunta": "¿Cuántas veces se ejecuta el cuerpo de un for i in range(2, 6) en Python?",
      "opciones": [
        "4",
        "3",
        "5",
        "6"
      ],
      "respuesta": "4",
      "explicacion": "i vale 2, 3, 4 y 5: son 6 - 2 = 4 vueltas."
    },
    {
      "pregunta": "¿Qué imprime este código en Java?\n```java\nint t = 0;\nfor (int i = 1; i <= 4; i++) {\n    t += i;\n}\nSystem.out.println(t);\n```",
      "opciones": [
        "10",
        "6",
        "15",
        "4"
      ],
      "respuesta": "10",
      "explicacion": "Con <= el 4 se incluye: 1 + 2 + 3 + 4 = 10."
    }
  ]
}$codia$::jsonb,
  8, true),
('codia-clase-04-funciones', 'Clase 4: Funciones — nombrar un bloque de código y reutilizarlo',
  'Parámetros, return, la diferencia entre imprimir y devolver, y el alcance de las variables.',
  'codia',
  $codia${
  "pasos": [
    "Una función agrupa código bajo un nombre. Recibe parámetros (los datos de entrada) y con return devuelve un resultado a quien la llamó. Reutilizas la lógica sin copiarla y puedes probarla con distintos valores.",
    "Una función que duplica un número, en los cuatro lenguajes:\n```python\ndef doble(x):\n    return x * 2\n\nprint(doble(4))\n```\n```java\nstatic int doble(int x) {\n    return x * 2;\n}\n\nSystem.out.println(doble(4));\n```\n```javascript\nfunction doble(x) {\n    return x * 2;\n}\n\nconsole.log(doble(4));\n```\n```typescript\nfunction doble(x: number): number {\n    return x * 2;\n}\n\nconsole.log(doble(4));\n```\n```salida\n8\n```\nEn Java y TypeScript los parámetros y lo que devuelve llevan tipo (int, number).",
    "Imprimir no es devolver: print muestra algo en pantalla; return entrega un valor. Una función sin return devuelve nada (None en Python, undefined en JavaScript):\n```python\ndef saludar(n):\n    print(\"Hola\", n)\n\nr = saludar(\"Ana\")\nprint(r)\n```\n```salida\nHola Ana\nNone\n```\n```javascript\nfunction saludar(n) {\n    console.log(\"Hola\", n);\n}\n\nconst r = saludar(\"Ana\");\nconsole.log(r);\n```\n```salida\nHola Ana\nundefined\n```\nEn Java, un método void ni siquiera permite guardar su resultado:\n```java!\nstatic void saludar(String n) {\n    System.out.println(\"Hola \" + n);\n}\n\nint r = saludar(\"Ana\");\n```\n```salida\nerror de compilación\n```",
    "Alcance: una variable creada dentro de una función solo existe ahí adentro.\n```python!\ndef f():\n    x = 5\n\nf()\nprint(x)\n```\n```salida\nNameError\n```\n```javascript!\nfunction f() {\n    let x = 5;\n}\n\nf();\nconsole.log(x);\n```\n```salida\nReferenceError\n```\n```java!\nstatic void f() {\n    int x = 5;\n}\n\nf();\nSystem.out.println(x);\n```\n```salida\nerror de compilación\n```\n```typescript!\nfunction f(): void {\n    let x: number = 5;\n}\n\nf();\nconsole.log(x);\n```\n```salida\nerror de compilación\n```",
    "Una función con condicional: devuelve el mayor de dos números. Fíjate que hay un return en cada camino.\n```python\ndef mayor(a, b):\n    if a > b:\n        return a\n    return b\n\nprint(mayor(3, 9))\n```\n```java\nstatic int mayor(int a, int b) {\n    if (a > b) {\n        return a;\n    }\n    return b;\n}\n\nSystem.out.println(mayor(3, 9));\n```\n```javascript\nfunction mayor(a, b) {\n    if (a > b) {\n        return a;\n    }\n    return b;\n}\n\nconsole.log(mayor(3, 9));\n```\n```typescript\nfunction mayor(a: number, b: number): number {\n    if (a > b) {\n        return a;\n    }\n    return b;\n}\n\nconsole.log(mayor(3, 9));\n```\n```salida\n9\n```",
    "Ejemplo resuelto: llamadas anidadas. Se evalúa de adentro hacia afuera.\n```python\ndef doble(x):\n    return x * 2\n\ndef triple(x):\n    return x * 3\n\nprint(triple(doble(2)))\n```\nPaso 1: doble(2) devuelve 4. Paso 2: triple(4) devuelve 12. Recién entonces print muestra el valor.\n```salida\n12\n```\nEn los otros tres lenguajes la lectura es exactamente la misma: primero el paréntesis de más adentro."
  ],
  "quiz": [
    {
      "pregunta": "¿Qué imprime este código?\n```python\ndef f(a, b):\n    return a * b + 1\n\nprint(f(2, 3))\n```",
      "opciones": [
        "7",
        "6",
        "8",
        "5"
      ],
      "respuesta": "7",
      "explicacion": "2 * 3 + 1 = 7."
    },
    {
      "pregunta": "¿Qué imprime este código en Python?\n```python\ndef saludar(n):\n    print(\"Hola\", n)\n\nprint(saludar(\"Ana\"))\n```",
      "opciones": [
        "Hola Ana\nNone",
        "Hola Ana",
        "None",
        "Hola Ana\nHola Ana"
      ],
      "respuesta": "Hola Ana\nNone",
      "explicacion": "Adentro de la función se imprime Hola Ana; como no devuelve nada, el print de afuera muestra None."
    },
    {
      "pregunta": "¿Qué imprime este código en JavaScript?\n```javascript\nfunction f(x) {\n    if (x > 3) {\n        return \"alto\";\n    }\n    return \"bajo\";\n}\n\nconsole.log(f(5), f(1));\n```",
      "opciones": [
        "alto bajo",
        "bajo alto",
        "alto alto",
        "bajo bajo"
      ],
      "respuesta": "alto bajo",
      "explicacion": "f(5): 5 > 3 devuelve alto. f(1): no entra al if y devuelve bajo."
    }
  ]
}$codia$::jsonb,
  9, true),
('codia-clase-05-listas-y-diccionarios', 'Clase 5: Listas y diccionarios — guardar muchos datos',
  'Listas o arreglos con índice desde 0, recorrerlos, y diccionarios (mapas) clave-valor, con el mismo ejemplo en los cuatro lenguajes.',
  'codia',
  $codia${
  "pasos": [
    "Una lista (arreglo) guarda varios valores en orden y se accede por posición, empezando en 0. Un diccionario (mapa) guarda pares clave-valor y se accede por clave: la clave identifica al valor, no su posición.",
    "Crear una lista, leer un elemento y ver cuántos tiene:\n```python\nnums = [4, 8, 15]\nprint(nums[0], len(nums))\n```\n```java\nint[] nums = {4, 8, 15};\nSystem.out.println(nums[0] + \" \" + nums.length);\n```\n```javascript\nconst nums = [4, 8, 15];\nconsole.log(nums[0], nums.length);\n```\n```typescript\nconst nums: number[] = [4, 8, 15];\nconsole.log(nums[0], nums.length);\n```\n```salida\n4 3\n```",
    "Un arreglo fijo (int[] en Java) no crece. Cuando no sabes cuántos datos habrá, usa una lista dinámica: se agrega al final con append en Python, con add en Java (ArrayList) y con push en JavaScript y TypeScript. Leer por posición y pedir el tamaño funciona igual que antes:\n```python\nlista = []\nlista.append(4)\nlista.append(8)\nlista.append(15)\nprint(lista[1], len(lista), lista[len(lista) - 1])\n```\n```java\nimport java.util.*;\n\nList<Integer> lista = new ArrayList<>();\nlista.add(4);\nlista.add(8);\nlista.add(15);\nSystem.out.println(lista.get(1) + \" \" + lista.size() + \" \" + lista.get(lista.size() - 1));\n```\n```javascript\nconst lista = [];\nlista.push(4);\nlista.push(8);\nlista.push(15);\nconsole.log(lista[1], lista.length, lista[lista.length - 1]);\n```\n```typescript\nconst lista: number[] = [];\nlista.push(4);\nlista.push(8);\nlista.push(15);\nconsole.log(lista[1], lista.length, lista[lista.length - 1]);\n```\n```salida\n8 3 15\n```\nLa lista quedó [4, 8, 15]: la posición 1 es el 8, el tamaño es 3 y el último elemento está en la posición tamaño - 1 (la 2), porque las posiciones empiezan en 0.",
    "Recorrer y acumular: suma de todos los elementos.\n```python\nnums = [4, 8, 15]\nsuma = 0\nfor x in nums:\n    suma = suma + x\nprint(suma)\n```\n```java\nint[] nums = {4, 8, 15};\nint suma = 0;\nfor (int x : nums) {\n    suma = suma + x;\n}\nSystem.out.println(suma);\n```\n```javascript\nconst nums = [4, 8, 15];\nlet suma = 0;\nfor (const x of nums) {\n    suma = suma + x;\n}\nconsole.log(suma);\n```\n```typescript\nconst nums: number[] = [4, 8, 15];\nlet suma: number = 0;\nfor (const x of nums) {\n    suma = suma + x;\n}\nconsole.log(suma);\n```\n```salida\n27\n```",
    "Máximo de una lista: guarda el primer elemento como el mayor visto hasta ahora y recorre comparando; si aparece uno más grande, lo reemplaza.\n```python\ndatos = [7, 3, 9, 4]\nmayor = datos[0]\nfor x in datos:\n    if x > mayor:\n        mayor = x\nprint(mayor)\n```\n```java\nint[] datos = {7, 3, 9, 4};\nint mayor = datos[0];\nfor (int x : datos) {\n    if (x > mayor) {\n        mayor = x;\n    }\n}\nSystem.out.println(mayor);\n```\n```javascript\nconst datos = [7, 3, 9, 4];\nlet mayor = datos[0];\nfor (const x of datos) {\n    if (x > mayor) {\n        mayor = x;\n    }\n}\nconsole.log(mayor);\n```\n```typescript\nconst datos: number[] = [7, 3, 9, 4];\nlet mayor: number = datos[0];\nfor (const x of datos) {\n    if (x > mayor) {\n        mayor = x;\n    }\n}\nconsole.log(mayor);\n```\n```salida\n9\n```\nTabla: mayor empieza en 7; con x = 3 no cambia; con x = 9 pasa a 9; con x = 4 no cambia. Empezar con el primer elemento (y no con 0) hace que también funcione con números negativos.",
    "Índice fuera de rango: con 3 elementos las posiciones son 0, 1 y 2. Pedir la 3 rompe Python y Java...\n```python!\nnums = [4, 8, 15]\nprint(nums[3])\n```\n```salida\nIndexError\n```\n```java!\nint[] nums = {4, 8, 15};\nSystem.out.println(nums[3]);\n```\n```salida\nArrayIndexOutOfBoundsException\n```\n...pero JavaScript no falla: devuelve undefined, y ese valor puede colarse en cálculos después.\n```javascript\nconst nums = [4, 8, 15];\nconsole.log(nums[3]);\n```\n```salida\nundefined\n```",
    "Diccionario (mapa): guardar edades por nombre. Asignar a una clave que ya existe la sobrescribe.\n```python\nedades = {\"ana\": 15, \"luis\": 17}\nedades[\"ana\"] = 16\nprint(edades[\"ana\"], len(edades))\n```\n```java\nimport java.util.*;\n\nMap<String, Integer> edades = new HashMap<>();\nedades.put(\"ana\", 15);\nedades.put(\"luis\", 17);\nedades.put(\"ana\", 16);\nSystem.out.println(edades.get(\"ana\") + \" \" + edades.size());\n```\n```javascript\nconst edades = new Map();\nedades.set(\"ana\", 15);\nedades.set(\"luis\", 17);\nedades.set(\"ana\", 16);\nconsole.log(edades.get(\"ana\"), edades.size);\n```\n```typescript\nconst edades = new Map<string, number>();\nedades.set(\"ana\", 15);\nedades.set(\"luis\", 17);\nedades.set(\"ana\", 16);\nconsole.log(edades.get(\"ana\"), edades.size);\n```\n```salida\n16 2\n```\nHay dos claves (ana y luis): la segunda asignación a ana no agregó una entrada, cambió su valor.",
    "Ejemplo resuelto: contar cuántas veces aparece cada número con un diccionario. Traza con datos = 1, 2, 1, 3, 1: el conteo va {1:1}, {1:1, 2:1}, {1:2, 2:1}, {1:2, 2:1, 3:1}, {1:3, 2:1, 3:1}.\n```python\ndatos = [1, 2, 1, 3, 1]\nconteo = {}\nfor x in datos:\n    if x in conteo:\n        conteo[x] = conteo[x] + 1\n    else:\n        conteo[x] = 1\nprint(conteo[1], len(conteo))\n```\n```java\nimport java.util.*;\n\nint[] datos = {1, 2, 1, 3, 1};\nMap<Integer, Integer> conteo = new HashMap<>();\nfor (int x : datos) {\n    if (conteo.containsKey(x)) {\n        conteo.put(x, conteo.get(x) + 1);\n    } else {\n        conteo.put(x, 1);\n    }\n}\nSystem.out.println(conteo.get(1) + \" \" + conteo.size());\n```\n```javascript\nconst datos = [1, 2, 1, 3, 1];\nconst conteo = new Map();\nfor (const x of datos) {\n    if (conteo.has(x)) {\n        conteo.set(x, conteo.get(x) + 1);\n    } else {\n        conteo.set(x, 1);\n    }\n}\nconsole.log(conteo.get(1), conteo.size);\n```\n```typescript\nconst datos: number[] = [1, 2, 1, 3, 1];\nconst conteo = new Map<number, number>();\nfor (const x of datos) {\n    if (conteo.has(x)) {\n        conteo.set(x, conteo.get(x)! + 1);\n    } else {\n        conteo.set(x, 1);\n    }\n}\nconsole.log(conteo.get(1), conteo.size);\n```\n```salida\n3 3\n```"
  ],
  "quiz": [
    {
      "pregunta": "¿Qué imprime este código?\n```python\nnums = [5, 6, 7]\nprint(nums[1] + nums[2])\n```",
      "opciones": [
        "13",
        "11",
        "12",
        "18"
      ],
      "respuesta": "13",
      "explicacion": "nums[1] es 6 y nums[2] es 7: la posición 0 es el 5."
    },
    {
      "pregunta": "¿Qué imprime este código en JavaScript?\n```javascript\nconst a = [1, 2, 3];\nconsole.log(a[3]);\n```",
      "opciones": [
        "undefined",
        "3",
        "0",
        "Lanza un error"
      ],
      "respuesta": "undefined",
      "explicacion": "JavaScript no lanza error por un índice fuera de rango: devuelve undefined."
    },
    {
      "pregunta": "¿Qué imprime este código en Python?\n```python\nd = {\"a\": 1}\nd[\"a\"] = 5\nd[\"b\"] = 2\nprint(d[\"a\"], len(d))\n```",
      "opciones": [
        "5 2",
        "1 2",
        "5 1",
        "1 1"
      ],
      "respuesta": "5 2",
      "explicacion": "La clave a se sobrescribe (1 pasa a 5) y b agrega una segunda entrada."
    }
  ]
}$codia$::jsonb,
  10, true),
('codia-clase-06-recorridos-y-complejidad', 'Clase 6: Recorridos y complejidad — O(n) contra O(n²)',
  'Contar bucles para saber cómo crece el trabajo: O(1), O(log n), O(n) y O(n²), y por qué importa la estructura elegida.',
  'codia',
  $codia${
  "pasos": [
    "La complejidad temporal describe cómo crece el número de operaciones cuando crece n. La medimos contando cuántas veces se ejecuta la operación principal. Nos interesa la forma del crecimiento: si n se duplica, ¿el trabajo se duplica (O(n)), se cuadruplica (O(n²)) o casi no cambia (O(1))?",
    "Dos bucles anidados sobre n, en los cuatro lenguajes. La función devuelve cuántas veces corre la línea total = total + 1:\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        for j in range(n):\n            total = total + 1\n    return total\n\nprint(contar(8), contar(16))\n```\n```java\nstatic int contar(int n) {\n    int total = 0;\n    for (int i = 0; i < n; i++) {\n        for (int j = 0; j < n; j++) {\n            total = total + 1;\n        }\n    }\n    return total;\n}\n\nSystem.out.println(contar(8) + \" \" + contar(16));\n```\n```javascript\nfunction contar(n) {\n    let total = 0;\n    for (let i = 0; i < n; i++) {\n        for (let j = 0; j < n; j++) {\n            total = total + 1;\n        }\n    }\n    return total;\n}\n\nconsole.log(contar(8), contar(16));\n```\n```typescript\nfunction contar(n: number): number {\n    let total: number = 0;\n    for (let i = 0; i < n; i++) {\n        for (let j = 0; j < n; j++) {\n            total = total + 1;\n        }\n    }\n    return total;\n}\n\nconsole.log(contar(8), contar(16));\n```\n```salida\n64 256\n```\nAl duplicar n de 8 a 16 el trabajo pasó de 64 a 256: se multiplicó por 4. Es O(n²).",
    "Un solo bucle da O(n): al duplicar n el trabajo se duplica.\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        total = total + 1\n    return total\n\nprint(contar(8), contar(16))\n```\n```java\nstatic int contar(int n) {\n    int total = 0;\n    for (int i = 0; i < n; i++) {\n        total = total + 1;\n    }\n    return total;\n}\n\nSystem.out.println(contar(8) + \" \" + contar(16));\n```\n```javascript\nfunction contar(n) {\n    let total = 0;\n    for (let i = 0; i < n; i++) {\n        total = total + 1;\n    }\n    return total;\n}\n\nconsole.log(contar(8), contar(16));\n```\n```typescript\nfunction contar(n: number): number {\n    let total: number = 0;\n    for (let i = 0; i < n; i++) {\n        total = total + 1;\n    }\n    return total;\n}\n\nconsole.log(contar(8), contar(16));\n```\n```salida\n8 16\n```\nDos bucles UNO DESPUÉS DEL OTRO también son O(n): 8 + 8 = 16 y 16 + 16 = 32, se suman, no se multiplican.\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        total = total + 1\n    for j in range(n):\n        total = total + 1\n    return total\n\nprint(contar(8), contar(16))\n```\n```salida\n16 32\n```",
    "Trampa: un bucle interno que depende de i sigue siendo O(n²). Con j desde 0 hasta i - 1 se hacen 0 + 1 + 2 + ... + (n - 1) = n(n-1)/2 operaciones:\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        for j in range(i):\n            total = total + 1\n    return total\n\nprint(contar(8), contar(16))\n```\n```salida\n28 120\n```\n28 y 120: al duplicar n se multiplica por algo cercano a 4 (y más cerca de 4 cuanto más grande es n). Las constantes como 1/2 no cambian la forma.",
    "Un bucle interno de largo fijo es una constante: no cuenta como bucle sobre n.\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        for j in range(3):\n            total = total + 1\n    return total\n\nprint(contar(8), contar(16))\n```\n```salida\n24 48\n```\n3n operaciones: O(n). Y si el valor se reduce a la mitad en cada vuelta, el bucle es logarítmico:\n```python\ndef contar(n):\n    total = 0\n    i = 1\n    while i < n:\n        total = total + 1\n        i = i * 2\n    return total\n\nprint(contar(8), contar(16))\n```\n```java\nstatic int contar(int n) {\n    int total = 0;\n    int i = 1;\n    while (i < n) {\n        total = total + 1;\n        i = i * 2;\n    }\n    return total;\n}\n\nSystem.out.println(contar(8) + \" \" + contar(16));\n```\n```javascript\nfunction contar(n) {\n    let total = 0;\n    let i = 1;\n    while (i < n) {\n        total = total + 1;\n        i = i * 2;\n    }\n    return total;\n}\n\nconsole.log(contar(8), contar(16));\n```\n```typescript\nfunction contar(n: number): number {\n    let total: number = 0;\n    let i: number = 1;\n    while (i < n) {\n        total = total + 1;\n        i = i * 2;\n    }\n    return total;\n}\n\nconsole.log(contar(8), contar(16));\n```\n```salida\n3 4\n```\nDuplicar n suma UNA vuelta: es O(log n).",
    "Un bucle sobre n que por dentro tiene un contador que se duplica (log n vueltas) hace n * log n operaciones: O(n log n). Crece un poco más que O(n) y bastante menos que O(n²).\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        j = 1\n        while j < n:\n            total = total + 1\n            j = j * 2\n    return total\n\nprint(contar(8), contar(16))\n```\n```salida\n24 64\n```\nCon n = 8 son 8 vueltas por 3 (log n) = 24; con n = 16 son 16 por 4 = 64. Al duplicar n el trabajo se multiplica por un poco más de 2 (2,7 en este caso), no por 2 como en O(n) ni por 4 como en O(n²).",
    "Tres bucles anidados sobre n hacen n * n * n operaciones: O(n³). Al duplicar n el trabajo se multiplica por 8.\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        for j in range(n):\n            for k in range(n):\n                total = total + 1\n    return total\n\nprint(contar(4), contar(8))\n```\n```salida\n64 512\n```\nPasar de n = 4 a n = 8 llevó el trabajo de 64 a 512, ocho veces más. Cada bucle anidado sobre n agrega un factor n: uno es O(n), dos son O(n²), tres son O(n³).",
    "Ejemplo resuelto: la estructura importa. Preguntar si un nombre está en una lista recorre los elementos (O(n) en el peor caso); en un conjunto (set en Python, HashSet en Java, Set en JavaScript) la búsqueda es O(1) en promedio.\n```python\nnombres = [\"ana\", \"luis\", \"marta\"]\nprint(\"luis\" in nombres)\nconjunto = {\"ana\", \"luis\", \"marta\"}\nprint(\"luis\" in conjunto)\n```\n```salida\nTrue\nTrue\n```\nEl resultado es el mismo; lo que cambia es cuánto trabajo hace la computadora cuando hay millones de elementos."
  ],
  "quiz": [
    {
      "pregunta": "¿Qué devuelve contar(6)?\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        for j in range(i):\n            total = total + 1\n    return total\n\nprint(contar(6))\n```",
      "opciones": [
        "15",
        "36",
        "6",
        "21"
      ],
      "respuesta": "15",
      "explicacion": "0 + 1 + 2 + 3 + 4 + 5 = 15 = 6 * 5 / 2."
    },
    {
      "pregunta": "Un bucle de 0 a n con otro bucle de 0 a n adentro. ¿Cuál es su complejidad?",
      "opciones": [
        "O(n²)",
        "O(n)",
        "O(1)",
        "O(log n)"
      ],
      "respuesta": "O(n²)",
      "explicacion": "Dos bucles anidados sobre n hacen n * n operaciones."
    },
    {
      "pregunta": "¿Qué devuelve contar(16)?\n```python\ndef contar(n):\n    total = 0\n    i = 1\n    while i < n:\n        total = total + 1\n        i = i * 2\n    return total\n\nprint(contar(16))\n```",
      "opciones": [
        "4",
        "16",
        "8",
        "15"
      ],
      "respuesta": "4",
      "explicacion": "i vale 1, 2, 4 y 8 (16 ya no cumple i < 16): 4 vueltas, log2(16)."
    }
  ]
}$codia$::jsonb,
  11, true),
('codia-clase-07-errores-y-depuracion', 'Clase 7: Errores comunes y depuración',
  'Errores de sintaxis, de ejecución y de lógica: cómo distinguirlos y cómo encontrar la línea culpable.',
  'codia',
  $codia${
  "pasos": [
    "Hay tres familias de errores. De sintaxis (o de compilación): el programa ni arranca. De ejecución: arranca y se rompe en una línea. De lógica: corre sin quejarse pero da un resultado equivocado; son los más difíciles porque nadie te avisa.",
    "Errores de sintaxis en los cuatro lenguajes: falta un dos puntos en Python, un punto y coma en Java y una comilla de cierre en JavaScript y TypeScript.\n```python!\nif 3 > 2\n    print(\"si\")\n```\n```salida\nSyntaxError\n```\n```java!\nint x = 5\nSystem.out.println(x);\n```\n```salida\nerror de compilación\n```\n```javascript!\nconsole.log(\"hola);\n```\n```salida\nSyntaxError\n```\n```typescript!\nconsole.log(\"hola);\n```\n```salida\nerror de compilación\n```",
    "Nombre inexistente (casi siempre un error de tipeo): Python y JavaScript lo descubren al ejecutar esa línea; Java y TypeScript, al compilar.\n```python!\ntotal = 10\nprint(totl)\n```\n```salida\nNameError\n```\n```java!\nint total = 10;\nSystem.out.println(totl);\n```\n```salida\nerror de compilación\n```\n```javascript!\nconst total = 10;\nconsole.log(totl);\n```\n```salida\nReferenceError\n```\n```typescript!\nconst total: number = 10;\nconsole.log(totl);\n```\n```salida\nerror de compilación\n```",
    "Errores de ejecución: índice fuera de rango y división por cero.\n```python!\ndatos = [1, 2, 3]\nprint(datos[3])\n```\n```salida\nIndexError\n```\n```java!\nint[] datos = {1, 2, 3};\nSystem.out.println(datos[3]);\n```\n```salida\nArrayIndexOutOfBoundsException\n```\n```python!\nprint(8 // 0)\n```\n```salida\nZeroDivisionError\n```\n```java!\nSystem.out.println(8 / 0);\n```\n```salida\nArithmeticException\n```\nEn JavaScript y TypeScript ninguno de los dos rompe: dan undefined e Infinity, por eso el error aparece más tarde y es más difícil de rastrear.\n```javascript\nconst datos = [1, 2, 3];\nconsole.log(datos[3], 8 / 0);\n```\n```typescript\nconst datos: number[] = [1, 2, 3];\nconsole.log(datos[3], 8 / 0);\n```\n```salida\nundefined Infinity\n```",
    "Errores de lógica: el clásico es una vuelta de más o de menos. Queríamos la suma de 1 a 4 (10) y da otra cosa:\n```python\ntotal = 0\nfor i in range(1, 4):\n    total = total + i\nprint(total)\n```\n```salida\n6\n```\nDiagnóstico: range(1, 4) llega hasta 3. Para incluir el 4 hay que escribir range(1, 5). Cuando el resultado no es el esperado, no busques en todo el código: compara contra lo que hiciste a mano.",
    "Depurar con print: muestra el valor de las variables en cada vuelta y compara contra tu tabla de seguimiento.\n```python\ntotal = 0\nfor i in range(1, 4):\n    total = total + i\n    print(\"i =\", i, \"total =\", total)\nprint(total)\n```\n```salida\ni = 1 total = 1\ni = 2 total = 3\ni = 3 total = 6\n6\n```\nMétodo: 1) lee el nombre del error y la línea; 2) reproduce el problema con el fragmento más chico posible; 3) traza con una tabla o con print; 4) cambia UNA cosa por vez y vuelve a probar."
  ],
  "quiz": [
    {
      "pregunta": "¿Qué error produce este código?\n```python\ndatos = [1, 2, 3]\nprint(datos[3])\n```",
      "opciones": [
        "IndexError",
        "NameError",
        "SyntaxError",
        "TypeError"
      ],
      "respuesta": "IndexError",
      "explicacion": "La lista tiene posiciones 0, 1 y 2: la 3 no existe."
    },
    {
      "pregunta": "¿Qué imprime este código en JavaScript?\n```javascript\nconsole.log(10 / 0);\n```",
      "opciones": [
        "Infinity",
        "Un error de división por cero",
        "0",
        "NaN"
      ],
      "respuesta": "Infinity",
      "explicacion": "JavaScript no lanza error: dividir un número positivo por cero da Infinity."
    },
    {
      "pregunta": "Queríamos sumar de 1 a 4, pero ¿qué imprime realmente este código?\n```python\ntotal = 0\nfor i in range(1, 4):\n    total = total + i\nprint(total)\n```",
      "opciones": [
        "6",
        "10",
        "4",
        "3"
      ],
      "respuesta": "6",
      "explicacion": "range(1, 4) recorre 1, 2 y 3 (1 + 2 + 3 = 6). Para llegar al 4 haría falta range(1, 5)."
    }
  ]
}$codia$::jsonb,
  12, true),
('codia-clase-08-pilas-colas-y-conjuntos', 'Clase 8: Pilas, colas y conjuntos',
  'LIFO, FIFO y sin repetidos: cómo se usan en Python, Java, JavaScript y TypeScript, y cuándo conviene cada una.',
  'codia',
  $codia${
  "pasos": [
    "Una pila es LIFO: el último en entrar es el primero en salir (como una pila de platos). Una cola es FIFO: el primero en entrar es el primero en salir (como la fila de una caja). Un conjunto guarda elementos sin repetir y responde rápido si un elemento está o no.",
    "Pila: apilar 1, 2 y 3 y desapilar dos veces. Sale primero el 3.\n```python\npila = []\npila.append(1)\npila.append(2)\npila.append(3)\nprint(pila.pop())\nprint(pila.pop())\n```\n```java\nimport java.util.*;\n\nDeque<Integer> pila = new ArrayDeque<>();\npila.push(1);\npila.push(2);\npila.push(3);\nSystem.out.println(pila.pop());\nSystem.out.println(pila.pop());\n```\n```javascript\nconst pila = [];\npila.push(1);\npila.push(2);\npila.push(3);\nconsole.log(pila.pop());\nconsole.log(pila.pop());\n```\n```typescript\nconst pila: number[] = [];\npila.push(1);\npila.push(2);\npila.push(3);\nconsole.log(pila.pop());\nconsole.log(pila.pop());\n```\n```salida\n3\n2\n```",
    "Cola: encolar 1, 2 y 3 y desencolar dos veces. Sale primero el 1.\n```python\nfrom collections import deque\n\ncola = deque()\ncola.append(1)\ncola.append(2)\ncola.append(3)\nprint(cola.popleft())\nprint(cola.popleft())\n```\n```java\nimport java.util.*;\n\nQueue<Integer> cola = new ArrayDeque<>();\ncola.add(1);\ncola.add(2);\ncola.add(3);\nSystem.out.println(cola.poll());\nSystem.out.println(cola.poll());\n```\n```javascript\nconst cola = [];\ncola.push(1);\ncola.push(2);\ncola.push(3);\nconsole.log(cola.shift());\nconsole.log(cola.shift());\n```\n```typescript\nconst cola: number[] = [];\ncola.push(1);\ncola.push(2);\ncola.push(3);\nconsole.log(cola.shift());\nconsole.log(cola.shift());\n```\n```salida\n1\n2\n```\nEn Python usa deque para colas: con una lista, pop(0) mueve todos los elementos de lugar (O(n)); popleft de deque es O(1).",
    "Conjunto: agregar elementos repetidos no hace nada. Agregamos 2, 6, 2, 6 y 1:\n```python\ns = set()\nfor x in [2, 6, 2, 6, 1]:\n    s.add(x)\nprint(len(s))\nprint(6 in s)\n```\n```salida\n3\nTrue\n```\n```java\nimport java.util.*;\n\nSet<Integer> s = new HashSet<>();\nfor (int x : new int[]{2, 6, 2, 6, 1}) {\n    s.add(x);\n}\nSystem.out.println(s.size());\nSystem.out.println(s.contains(6));\n```\n```javascript\nconst s = new Set();\nfor (const x of [2, 6, 2, 6, 1]) {\n    s.add(x);\n}\nconsole.log(s.size);\nconsole.log(s.has(6));\n```\n```typescript\nconst s = new Set<number>();\nfor (const x of [2, 6, 2, 6, 1]) {\n    s.add(x);\n}\nconsole.log(s.size);\nconsole.log(s.has(6));\n```\n```salida\n3\ntrue\n```",
    "Uso típico de una pila: invertir. Se apila cada elemento y después se desapila hasta vaciarla, y sale en orden inverso.\n```python\ndatos = [1, 2, 3]\npila = []\nfor x in datos:\n    pila.append(x)\nwhile len(pila) > 0:\n    print(pila.pop())\n```\n```java\nimport java.util.*;\n\nint[] datos = {1, 2, 3};\nDeque<Integer> pila = new ArrayDeque<>();\nfor (int x : datos) {\n    pila.push(x);\n}\nwhile (!pila.isEmpty()) {\n    System.out.println(pila.pop());\n}\n```\n```javascript\nconst datos = [1, 2, 3];\nconst pila = [];\nfor (const x of datos) {\n    pila.push(x);\n}\nwhile (pila.length > 0) {\n    console.log(pila.pop());\n}\n```\n```typescript\nconst datos: number[] = [1, 2, 3];\nconst pila: number[] = [];\nfor (const x of datos) {\n    pila.push(x);\n}\nwhile (pila.length > 0) {\n    console.log(pila.pop());\n}\n```\n```salida\n3\n2\n1\n```",
    "Ejemplo resuelto: una cola de turnos. Se saca al primero; si es par se imprime y si es impar vuelve al final sumándole 1. Con la cola 3, 4, 5:\n```python\nfrom collections import deque\n\ncola = deque([3, 4, 5])\nwhile len(cola) > 0:\n    x = cola.popleft()\n    if x % 2 == 0:\n        print(x)\n    else:\n        cola.append(x + 1)\n```\nTraza: sale 3 (impar), vuelve 4 y la cola es 4, 5, 4. Sale 4 (par): imprime 4. Sale 5 (impar), vuelve 6: cola 4, 6. Sale 4: imprime 4. Sale 6: imprime 6. La cola queda vacía.\n```salida\n4\n4\n6\n```"
  ],
  "quiz": [
    {
      "pregunta": "Se apilan 1, 2 y 3 y luego se desapila una vez. ¿Qué imprime?\n```python\npila = []\npila.append(1)\npila.append(2)\npila.append(3)\nprint(pila.pop())\n```",
      "opciones": [
        "3",
        "1",
        "2",
        "123"
      ],
      "respuesta": "3",
      "explicacion": "Una pila es LIFO: el último en entrar (el 3) es el primero en salir."
    },
    {
      "pregunta": "Se encolan 1, 2 y 3 y luego se desencola una vez. ¿Qué imprime?\n```python\nfrom collections import deque\n\nq = deque()\nq.append(1)\nq.append(2)\nq.append(3)\nprint(q.popleft())\n```",
      "opciones": [
        "1",
        "3",
        "2",
        "123"
      ],
      "respuesta": "1",
      "explicacion": "Una cola es FIFO: el primero en entrar (el 1) es el primero en salir."
    },
    {
      "pregunta": "¿Qué imprime este código?\n```python\ns = {1, 2, 2, 3, 3, 3}\nprint(len(s))\n```",
      "opciones": [
        "3",
        "6",
        "2",
        "1"
      ],
      "respuesta": "3",
      "explicacion": "Un conjunto no guarda repetidos: quedan 1, 2 y 3."
    }
  ]
}$codia$::jsonb,
  13, true)
on conflict (slug) do update set
  nombre = excluded.nombre,
  descripcion = excluded.descripcion,
  problem_type = excluded.problem_type,
  contenido = excluded.contenido,
  orden = excluded.orden,
  requiere_pro = excluded.requiere_pro;
