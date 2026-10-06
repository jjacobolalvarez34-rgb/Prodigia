-- ============================================================
-- Prodigia — Codia por lenguaje (pedido del usuario, 2026-10-06).
--
-- Primero «Lo básico» (la lógica, igual en los cuatro lenguajes: 0193) y
-- después cada lenguaje por separado, con su forma de escribirse y sus usos:
-- «Los cuatro lenguajes» (compilado o interpretado, tipado, para qué sirve
-- cada uno) y tres Clases de Python, Java, JavaScript y TypeScript, más una
-- Técnica de «chuleta» por lenguaje.
-- 4 Técnicas (orden 14-17) y 13 Clases (orden 18-30). Los grupos del
-- sidebar salen de src/lib/aprender/grupos.ts.
--
-- Este archivo se GENERA desde src/lib/codia/lecciones/lenguajes.ts y
-- lecciones.test.ts EJECUTA cada fragmento (python, javac + JVM, node,
-- typescript). No editar a mano. Idempotente (on conflict por slug).
-- Requiere 0193.
-- ============================================================

insert into public.techniques (slug, nombre, descripcion, problem_type, contenido, orden, requiere_pro) values
('codia-tecnica-python-chuleta', 'Python en un vistazo: dos puntos, sangría y print',
  'Lo mínimo para leer y escribir Python sin tropezar: bloques con sangría, variables sin tipo, True y False con mayúscula y las dos divisiones.',
  'codia',
  $codia${
  "pasos": [
    "Bloques con sangría: después de if, for, while o def van dos puntos, y las líneas de adentro se corren 4 espacios.\n```python\nfor i in range(3):\n    print(i)\n```\n```salida\n0\n1\n2\n```",
    "Sin tipos ni punto y coma: la variable toma el tipo del valor que le das, y puede cambiarlo.\n```python\nx = 5\nx = \"cinco\"\nprint(x)\n```\n```salida\ncinco\n```",
    "True y False van con mayúscula, y los operadores lógicos se escriben con palabras: and, or, not.\n```python\nprint(3 > 2 and not False)\n```\n```salida\nTrue\n```",
    "Dos divisiones: / siempre da decimal y // da la parte entera.\n```python\nprint(10 / 4, 10 // 4)\n```\n```salida\n2.5 2\n```"
  ],
  "quiz": [
    {
      "pregunta": "¿Qué imprime?\n```python\nprint(list(range(2, 5)))\n```",
      "opciones": [
        "[2, 3, 4]",
        "[2, 3, 4, 5]",
        "[3, 4]"
      ],
      "respuesta": "[2, 3, 4]",
      "explicacion": "range(2, 5) empieza en 2 y se detiene antes del 5."
    },
    {
      "pregunta": "¿Cómo se escribe «verdadero» en Python?",
      "opciones": [
        "true",
        "True",
        "TRUE"
      ],
      "respuesta": "True",
      "explicacion": "En Python los booleanos llevan mayúscula: True y False."
    }
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 0,
      "titulo": "Python en tres reglas",
      "cuadros": [
        {
          "texto": "Dos puntos y sangría marcan cada bloque"
        },
        {
          "texto": "La variable toma el tipo del valor"
        },
        {
          "texto": "True, False, and, or y not se escriben así"
        }
      ]
    }
  ]
}$codia$::jsonb,
  14, false),
('codia-tecnica-java-chuleta', 'Java en un vistazo: tipos, punto y coma y llaves',
  'Lo mínimo para leer Java: cada variable declara su tipo, cada sentencia termina en punto y coma y los bloques van entre llaves.',
  'codia',
  $codia${
  "pasos": [
    "Cada sentencia termina en punto y coma y los bloques van entre llaves.\n```java\nfor (int i = 0; i < 3; i++) {\n    System.out.println(i);\n}\n```\n```salida\n0\n1\n2\n```",
    "Cada variable declara su tipo y no puede cambiarlo: si no coincide, el programa ni siquiera compila.\n```java!\nint x = 5;\nx = \"cinco\";\n```\n```salida\nerror de compilación\n```",
    "Para imprimir se usa System.out.println, y para unir texto, el signo +.\n```java\nString mundo = \"Codia\";\nSystem.out.println(\"Hola, \" + mundo);\n```\n```salida\nHola, Codia\n```",
    "Cuidado: un int dividido por otro int descarta los decimales. Con un decimal en la cuenta, el resultado es decimal.\n```java\nSystem.out.println(10 / 4);\nSystem.out.println(10 / 4.0);\n```\n```salida\n2\n2.5\n```"
  ],
  "quiz": [
    {
      "pregunta": "¿Qué imprime?\n```java\nSystem.out.println(9 / 2);\n```",
      "opciones": [
        "4.5",
        "4",
        "5"
      ],
      "respuesta": "4",
      "explicacion": "9 y 2 son int: la división entera descarta el .5."
    },
    {
      "pregunta": "¿Con qué termina cada sentencia en Java?",
      "opciones": [
        "Con punto y coma",
        "Con dos puntos",
        "Con un salto de línea"
      ],
      "respuesta": "Con punto y coma",
      "explicacion": "Java exige ; al final de cada sentencia."
    }
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 0,
      "titulo": "Java en tres reglas",
      "cuadros": [
        {
          "texto": "Cada variable declara su tipo"
        },
        {
          "texto": "Cada sentencia termina en punto y coma"
        },
        {
          "texto": "Los bloques van entre llaves"
        }
      ]
    }
  ]
}$codia$::jsonb,
  15, false),
('codia-tecnica-javascript-chuleta', 'JavaScript en un vistazo: const, === y las sorpresas del +',
  'Lo mínimo para no caer en las trampas de JavaScript: const y let, comparar siempre con === y cuidado con sumar texto y números.',
  'codia',
  $codia${
  "pasos": [
    "const para lo que no cambia y let para lo que sí. En código nuevo no se usa var.\n```javascript\nconst base = 10;\nlet total = base;\ntotal += 5;\nconsole.log(total);\n```\n```salida\n15\n```",
    "Compara siempre con ===, que exige el mismo valor y el mismo tipo. El == convierte los tipos antes de comparar y da sorpresas.\n```javascript\nconsole.log(1 == \"1\", 1 === \"1\");\n```\n```salida\ntrue false\n```",
    "Con un texto de por medio, + une en vez de sumar. Para sumar, convierte primero con Number.\n```javascript\nconsole.log(\"2\" + 2);\nconsole.log(Number(\"2\") + 2);\n```\n```salida\n22\n4\n```",
    "Para imprimir varias cosas, sepáralas con coma en console.log: se muestran con un espacio en medio.\n```javascript\nconst nombre = \"Ana\";\nconsole.log(\"Hola\", nombre);\n```\n```salida\nHola Ana\n```"
  ],
  "quiz": [
    {
      "pregunta": "¿Qué imprime?\n```javascript\nconsole.log(\"5\" + 1);\n```",
      "opciones": [
        "6",
        "51",
        "Error"
      ],
      "respuesta": "51",
      "explicacion": "Con un texto de por medio, + une: «5» y «1» dan «51»."
    },
    {
      "pregunta": "¿Qué imprime?\n```javascript\nconsole.log(2 === 2.0);\n```",
      "opciones": [
        "true",
        "false",
        "Error"
      ],
      "respuesta": "true",
      "explicacion": "En JavaScript todos los números son del mismo tipo: 2 y 2.0 son el mismo valor."
    }
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 1,
      "titulo": "JavaScript en tres reglas",
      "cuadros": [
        {
          "texto": "const por defecto; let si va a cambiar"
        },
        {
          "texto": "Compara con ==="
        },
        {
          "texto": "Texto + número une, no suma"
        }
      ]
    }
  ]
}$codia$::jsonb,
  16, false),
('codia-tecnica-typescript-chuleta', 'TypeScript en un vistazo: dos puntos y el tipo',
  'TypeScript es JavaScript con tipos: el tipo va después del nombre, con dos puntos, y si no coincide el programa no compila.',
  'codia',
  $codia${
  "pasos": [
    "El tipo va después del nombre, con dos puntos.\n```typescript\nlet edad: number = 15;\nconsole.log(edad + 1);\n```\n```salida\n16\n```",
    "Si el valor no coincide con el tipo, no compila: el error aparece antes de ejecutar.\n```typescript!\nlet edad: number = \"quince\";\n```\n```salida\nerror de compilación\n```",
    "Las funciones declaran el tipo de cada parámetro y del resultado.\n```typescript\nfunction area(base: number, altura: number): number {\n  return (base * altura) / 2;\n}\nconsole.log(area(6, 4));\n```\n```salida\n12\n```",
    "Todo lo demás es JavaScript: const, let, ===, arreglos y objetos funcionan igual.\n```typescript\nconst xs: number[] = [1, 2, 3];\nconsole.log(xs.length === 3);\n```\n```salida\ntrue\n```"
  ],
  "quiz": [
    {
      "pregunta": "¿Qué pasa con este código?\n```typescript\nfunction f(n: number): number {\n  return n;\n}\nf(\"1\");\n```",
      "opciones": [
        "No compila: error de compilación",
        "Devuelve 1",
        "Devuelve «1»"
      ],
      "respuesta": "No compila: error de compilación",
      "explicacion": "f pide un number y le pasan un string: el compilador lo rechaza."
    },
    {
      "pregunta": "¿Dónde se escribe el tipo de una variable en TypeScript?",
      "opciones": [
        "Después del nombre, con dos puntos",
        "Antes del nombre, como en Java",
        "En un comentario"
      ],
      "respuesta": "Después del nombre, con dos puntos",
      "explicacion": "Por ejemplo: let edad: number = 15."
    }
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 0,
      "titulo": "TypeScript en tres reglas",
      "cuadros": [
        {
          "texto": "nombre: tipo"
        },
        {
          "texto": "Si el tipo no coincide, no compila"
        },
        {
          "texto": "El resto es JavaScript"
        }
      ]
    }
  ]
}$codia$::jsonb,
  17, false),
('codia-clase-lenguajes-panorama', 'Cuatro lenguajes, cuatro mundos: para qué sirve cada uno',
  'Las ideas de Lo básico son las mismas en todos los lenguajes; cambia cómo se escriben y para qué se usan. Compilado o interpretado, tipado estático o dinámico, y el lugar de Python, Java, JavaScript y TypeScript.',
  'codia',
  $codia${
  "pasos": [
    "Ya sabes lo básico: variables, condicionales, bucles, funciones y estructuras de datos. Esas ideas son las mismas en todos los lenguajes. Lo que cambia es cómo se escriben, cómo se ejecutan y para qué se usa cada uno.",
    "Interpretado o compilado. Python y JavaScript se ejecutan con un intérprete, que lee el programa y lo va corriendo. Java se compila primero a bytecode, que después corre en la máquina virtual de Java (JVM). TypeScript se compila a JavaScript, revisando los tipos en el camino.",
    "Tipado dinámico o estático. En Python y JavaScript el tipo lo tiene el valor y los errores de tipo aparecen al correr. En Java y TypeScript declaras los tipos y el compilador avisa antes. Mira qué pasa al unir un texto con un número. Python se niega:\n```python!\nprint(\"Edad: \" + 15)\n```\n```salida\nTypeError\n```\nJava, JavaScript y TypeScript convierten el número en texto:\n```java\nSystem.out.println(\"Edad: \" + 15);\n```\n```javascript\nconsole.log(\"Edad: \" + 15);\n```\n```typescript\nconsole.log(\"Edad: \" + 15);\n```\n```salida\nEdad: 15\n```",
    "Para qué se usa cada uno. Python: ciencia de datos, inteligencia artificial, automatizar tareas y enseñar a programar. Java: apps Android, sistemas de bancos y empresas grandes, servidores. JavaScript: todo lo que se mueve en una página web, y también servidores con Node.js. TypeScript: JavaScript con tipos, para proyectos web grandes hechos en equipo (Prodigia está escrita en TypeScript).",
    "El primer programa de siempre, en los cuatro:\n```python\nprint(\"Hola, mundo\")\n```\n```java\nSystem.out.println(\"Hola, mundo\");\n```\n```javascript\nconsole.log(\"Hola, mundo\");\n```\n```typescript\nconsole.log(\"Hola, mundo\");\n```\n```salida\nHola, mundo\n```",
    "No hay un lenguaje «mejor»: hay herramientas para trabajos distintos. Lo que aprendiste en Lo básico se transfiere: quien entiende un bucle en Python lo entiende en Java en minutos. En las secciones siguientes ves cada lenguaje por dentro y en qué se usa."
  ],
  "quiz": [
    {
      "pregunta": "¿Qué lenguaje entienden directamente todos los navegadores?",
      "opciones": [
        "Python",
        "JavaScript",
        "Java"
      ],
      "respuesta": "JavaScript",
      "explicacion": "JavaScript es el lenguaje de las páginas web; TypeScript se compila a JavaScript para correr ahí."
    },
    {
      "pregunta": "¿Qué pasa al correr esto en Python?\n```python\nprint(\"Puntos: \" + 10)\n```",
      "opciones": [
        "Imprime Puntos: 10",
        "Falla con TypeError",
        "Imprime Puntos: 10.0"
      ],
      "respuesta": "Falla con TypeError",
      "explicacion": "Python no une texto con números por su cuenta: hay que convertir con str(10)."
    },
    {
      "pregunta": "¿Qué hace el compilador de TypeScript antes de ejecutar?",
      "opciones": [
        "Revisa los tipos y lo convierte a JavaScript",
        "Lo convierte a Python",
        "Lo ejecuta en la JVM"
      ],
      "respuesta": "Revisa los tipos y lo convierte a JavaScript",
      "explicacion": "Los tipos se revisan al compilar y desaparecen en el JavaScript que se ejecuta."
    }
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 1,
      "titulo": "¿Cómo se ejecuta?",
      "cuadros": [
        {
          "texto": "Python: lo lee y lo corre un intérprete"
        },
        {
          "texto": "JavaScript: lo corre el navegador o Node.js"
        },
        {
          "texto": "Java: se compila a bytecode y lo corre la JVM"
        },
        {
          "texto": "TypeScript: se revisa, se compila a JavaScript y corre como JavaScript"
        }
      ]
    },
    {
      "tipo": "cuadros",
      "despuesDePaso": 3,
      "titulo": "¿Para qué se usa?",
      "cuadros": [
        {
          "texto": "Python: datos e inteligencia artificial"
        },
        {
          "texto": "Java: Android y empresas"
        },
        {
          "texto": "JavaScript: la web"
        },
        {
          "texto": "TypeScript: proyectos web grandes"
        }
      ]
    }
  ]
}$codia$::jsonb,
  18, true),
('codia-clase-python-1-sintaxis', 'Python 1: un lenguaje que se lee casi como inglés',
  'Bloques con sangría, f-strings, listas y bucles, las tres operaciones de división y las comprensiones de lista.',
  'codia',
  $codia${
  "pasos": [
    "Python se diseñó para leerse fácil. No usa punto y coma ni llaves: los bloques se marcan con dos puntos y sangría de 4 espacios.\n```python\nedad = 16\nif edad >= 18:\n    print(\"Puede votar\")\nelse:\n    print(\"Todavía no\")\nprint(\"Fin\")\n```\n```salida\nTodavía no\nFin\n```",
    "La sangría no es decoración: si falta, el programa ni arranca.\n```python!\nif True:\nprint(\"hola\")\n```\n```salida\nIndentationError\n```",
    "Las f-strings meten variables dentro del texto con llaves, y print separa con un espacio lo que le pasas con comas.\n```python\nnombre = \"Ana\"\npuntos = 120\nprint(f\"{nombre} tiene {puntos} puntos\")\nprint(nombre, puntos)\n```\n```salida\nAna tiene 120 puntos\nAna 120\n```",
    "Listas y el bucle for, que recorre directamente los elementos. sum y len resuelven el promedio en una línea.\n```python\nnotas = [7, 9, 6]\nfor n in notas:\n    print(n * 2)\nprint(sum(notas) / len(notas))\n```\n```salida\n14\n18\n12\n7.333333333333333\n```",
    "Tres operaciones que confunden al principio: / siempre da decimal, // es la división entera y ** es la potencia.\n```python\nprint(7 / 2)\nprint(7 // 2)\nprint(2 ** 10)\n```\n```salida\n3.5\n3\n1024\n```",
    "Las comprensiones de lista construyen una lista nueva en una sola línea: «x por x, para cada x del 1 al 5».\n```python\ncuadrados = [x * x for x in range(1, 6)]\nprint(cuadrados)\n```\n```salida\n[1, 4, 9, 16, 25]\n```"
  ],
  "quiz": [
    {
      "pregunta": "¿Qué imprime?\n```python\nprint(9 // 2, 9 / 2)\n```",
      "opciones": [
        "4 4.5",
        "4.5 4.5",
        "4 4"
      ],
      "respuesta": "4 4.5",
      "explicacion": "// es la división entera (4) y / siempre da decimal (4.5)."
    },
    {
      "pregunta": "¿Cómo marca Python dónde empieza y termina un bloque?",
      "opciones": [
        "Con llaves",
        "Con la sangría",
        "Con punto y coma"
      ],
      "respuesta": "Con la sangría",
      "explicacion": "Dos puntos al final de la línea y las de adentro corridas 4 espacios."
    },
    {
      "pregunta": "¿Qué imprime?\n```python\nprint([x * 2 for x in [1, 2, 3]])\n```",
      "opciones": [
        "[2, 4, 6]",
        "[1, 2, 3, 1, 2, 3]",
        "[2, 4, 6, 2]"
      ],
      "respuesta": "[2, 4, 6]",
      "explicacion": "La comprensión multiplica cada elemento por 2."
    }
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 0,
      "titulo": "Lo propio de Python",
      "cuadros": [
        {
          "texto": "Bloques con dos puntos y sangría"
        },
        {
          "texto": "f-strings: f\"{variable}\""
        },
        {
          "texto": "/ decimal, // entera, ** potencia"
        },
        {
          "texto": "Comprensiones: [x * x for x in lista]"
        }
      ]
    }
  ]
}$codia$::jsonb,
  19, true),
('codia-clase-python-2-diccionarios-y-funciones', 'Python 2: diccionarios, funciones y módulos',
  'Guardar datos por nombre con diccionarios, escribir funciones con valores por defecto, importar módulos y evitar el KeyError.',
  'codia',
  $codia${
  "pasos": [
    "Un diccionario guarda pares clave-valor: buscas por nombre en vez de por posición.\n```python\nalumno = {\"nombre\": \"Luis\", \"edad\": 15}\nalumno[\"edad\"] = 16\nprint(alumno[\"nombre\"], alumno[\"edad\"])\nprint(len(alumno))\n```\n```salida\nLuis 16\n2\n```",
    "Para recorrerlo, items() da cada clave con su valor (en el orden en que se agregaron).\n```python\nprecios = {\"pan\": 2, \"leche\": 3}\nfor producto, precio in precios.items():\n    print(producto, precio)\n```\n```salida\npan 2\nleche 3\n```",
    "Las funciones se definen con def. Un parámetro puede tener un valor por defecto, que se usa si no lo pasas.\n```python\ndef saludar(nombre, saludo=\"Hola\"):\n    return f\"{saludo}, {nombre}\"\n\nprint(saludar(\"Ana\"))\nprint(saludar(\"Ana\", \"Buenas\"))\n```\n```salida\nHola, Ana\nBuenas, Ana\n```",
    "Python trae muchos módulos listos. Con import los usas: math tiene raíces, pi y mucho más.\n```python\nimport math\nprint(math.sqrt(81))\nprint(math.pi > 3)\n```\n```salida\n9.0\nTrue\n```",
    "El error típico de los diccionarios: pedir una clave que no existe.\n```python!\nedades = {\"Ana\": 15}\nprint(edades[\"Luis\"])\n```\n```salida\nKeyError\n```\nCon get pides la clave y das un valor por si no está:\n```python\nedades = {\"Ana\": 15}\nprint(edades.get(\"Luis\", 0))\n```\n```salida\n0\n```"
  ],
  "quiz": [
    {
      "pregunta": "¿Qué imprime?\n```python\nd = {\"a\": 1, \"b\": 2}\nd[\"a\"] = 5\nprint(d[\"a\"] + d[\"b\"])\n```",
      "opciones": [
        "7",
        "3",
        "6"
      ],
      "respuesta": "7",
      "explicacion": "d[\"a\"] pasa a valer 5, y 5 + 2 = 7."
    },
    {
      "pregunta": "¿Qué pasa al correr esto?\n```python\nprint({\"x\": 1}[\"y\"])\n```",
      "opciones": [
        "Imprime None",
        "Falla con KeyError",
        "Imprime 0"
      ],
      "respuesta": "Falla con KeyError",
      "explicacion": "La clave «y» no existe. Con .get(\"y\") devolvería None sin fallar."
    },
    {
      "pregunta": "¿Para qué sirve import en Python?",
      "opciones": [
        "Para usar código de otro módulo, como math",
        "Para crear una variable",
        "Para imprimir en pantalla"
      ],
      "respuesta": "Para usar código de otro módulo, como math",
      "explicacion": "import math trae las funciones del módulo math (sqrt, pi, etc.)."
    }
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 0,
      "titulo": "Diccionarios en Python",
      "cuadros": [
        {
          "texto": "d[\"clave\"] = valor guarda o cambia"
        },
        {
          "texto": "for k, v in d.items() recorre"
        },
        {
          "texto": "d.get(\"clave\", 0) no falla si falta"
        }
      ]
    }
  ]
}$codia$::jsonb,
  20, true),
('codia-clase-python-3-usos', 'Python 3: dónde se usa — datos, automatización e inteligencia artificial',
  'Por qué Python es el lenguaje de los datos y la IA, con ejemplos chicos de análisis, orden y conteo de palabras, y cuál es su punto débil.',
  'codia',
  $codia${
  "pasos": [
    "Python domina en ciencia de datos e inteligencia artificial (con bibliotecas como NumPy, pandas, scikit-learn y PyTorch), en la automatización de tareas (renombrar archivos, leer hojas de cálculo, descargar datos), en servidores web (Django y Flask) y en la enseñanza.",
    "Un análisis de datos chico, sin ninguna biblioteca: máximo, mínimo y promedio.\n```python\ntemperaturas = [21, 25, 19, 30, 24]\nprint(\"Máxima:\", max(temperaturas))\nprint(\"Mínima:\", min(temperaturas))\nprint(\"Promedio:\", sum(temperaturas) / len(temperaturas))\n```\n```salida\nMáxima: 30\nMínima: 19\nPromedio: 23.8\n```",
    "Automatizar es ordenar y limpiar datos en pocas líneas: aquí, poner mayúscula inicial y ordenar alfabéticamente.\n```python\nnombres = [\"sofía\", \"ana\", \"Luis\", \"bruno\"]\nordenados = sorted(n.capitalize() for n in nombres)\nprint(ordenados)\n```\n```salida\n['Ana', 'Bruno', 'Luis', 'Sofía']\n```",
    "Contar palabras es la base del análisis de texto (y de cómo empiezan muchos modelos de lenguaje).\n```python\ntexto = \"el gato y el perro y el pez\"\nconteo = {}\nfor palabra in texto.split():\n    conteo[palabra] = conteo.get(palabra, 0) + 1\nprint(conteo[\"el\"], conteo[\"y\"])\n```\n```salida\n3 2\n```",
    "Por qué Python ganó en IA: la sintaxis es corta, hay miles de bibliotecas y la comunidad científica lo adoptó. Su punto débil es la velocidad: para cálculos pesados es más lento que Java, y por eso las bibliotecas grandes están escritas en C por dentro y Python solo las «dirige»."
  ],
  "quiz": [
    {
      "pregunta": "¿Qué imprime?\n```python\nprint(max([3, 8, 2]) - min([3, 8, 2]))\n```",
      "opciones": [
        "6",
        "8",
        "11"
      ],
      "respuesta": "6",
      "explicacion": "El máximo es 8 y el mínimo 2: 8 − 2 = 6."
    },
    {
      "pregunta": "¿En qué área se usa más Python?",
      "opciones": [
        "Apps de iPhone",
        "Ciencia de datos e inteligencia artificial",
        "Animar páginas web en el navegador"
      ],
      "respuesta": "Ciencia de datos e inteligencia artificial",
      "explicacion": "Bibliotecas como NumPy, pandas y PyTorch lo hicieron el estándar en datos e IA."
    },
    {
      "pregunta": "¿Qué imprime?\n```python\npalabras = \"a b a\".split()\nprint(palabras.count(\"a\"))\n```",
      "opciones": [
        "1",
        "2",
        "3"
      ],
      "respuesta": "2",
      "explicacion": "split separa por espacios: [\"a\", \"b\", \"a\"], y «a» aparece 2 veces."
    }
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 0,
      "titulo": "Python en el mundo real",
      "cuadros": [
        {
          "texto": "Datos e IA: NumPy, pandas, PyTorch"
        },
        {
          "texto": "Automatizar: archivos, planillas, descargas"
        },
        {
          "texto": "Web: Django y Flask"
        },
        {
          "texto": "Punto débil: la velocidad"
        }
      ]
    }
  ]
}$codia$::jsonb,
  21, true),
('codia-clase-java-1-estructura', 'Java 1: tipos declarados y todo dentro de una clase',
  'Cómo es un programa Java, por qué se compila, los tipos básicos, los métodos static, los arreglos y la división entera.',
  'codia',
  $codia${
  "pasos": [
    "Un programa Java completo es una clase con un método main: public class Main, y adentro public static void main(String[] args). En estas lecciones mostramos solo lo que va dentro de main. Java se compila: javac revisa todo el programa y lo convierte en bytecode, que después ejecuta la máquina virtual de Java (JVM). Por eso se dice «escribe una vez, corre en cualquier lado».",
    "Cada variable declara su tipo: int (entero), double (decimal), String (texto) y boolean (verdadero o falso).\n```java\nint edad = 16;\ndouble altura = 1.68;\nString nombre = \"Luis\";\nboolean estudia = true;\nSystem.out.println(nombre + \" tiene \" + edad);\nSystem.out.println(altura * 2);\nSystem.out.println(estudia);\n```\n```salida\nLuis tiene 16\n3.36\ntrue\n```",
    "El compilador atrapa los errores de tipo antes de ejecutar nada:\n```java!\nint edad = \"dieciseis\";\n```\n```salida\nerror de compilación\n```",
    "Las funciones en Java se llaman métodos y también declaran tipos: el del resultado y el de cada parámetro.\n```java\nstatic int doble(int n) {\n    return n * 2;\n}\nSystem.out.println(doble(21));\n```\n```salida\n42\n```",
    "Los arreglos tienen tamaño fijo, y el for de Java tiene una forma corta para recorrerlos.\n```java\nint[] notas = {7, 9, 6};\nint suma = 0;\nfor (int n : notas) {\n    suma += n;\n}\nSystem.out.println(suma);\nSystem.out.println(suma / notas.length);\n```\n```salida\n22\n7\n```",
    "Ojo con la división: entre dos int, Java descarta los decimales. Con un double en la cuenta, el resultado es decimal.\n```java\nSystem.out.println(7 / 2);\nSystem.out.println(7 / 2.0);\n```\n```salida\n3\n3.5\n```"
  ],
  "quiz": [
    {
      "pregunta": "¿Qué imprime?\n```java\nSystem.out.println(10 / 4);\n```",
      "opciones": [
        "2.5",
        "2",
        "3"
      ],
      "respuesta": "2",
      "explicacion": "10 y 4 son int: la división entera da 2."
    },
    {
      "pregunta": "¿Qué pasa con este código?\n```java\nString s = 5;\n```",
      "opciones": [
        "Imprime 5",
        "No compila: error de compilación",
        "Guarda null"
      ],
      "respuesta": "No compila: error de compilación",
      "explicacion": "Un int no se puede guardar en una variable String."
    },
    {
      "pregunta": "¿Qué ejecuta los programas Java ya compilados?",
      "opciones": [
        "El navegador",
        "La máquina virtual de Java (JVM)",
        "El intérprete de Python"
      ],
      "respuesta": "La máquina virtual de Java (JVM)",
      "explicacion": "javac genera bytecode y la JVM lo ejecuta."
    }
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 0,
      "titulo": "Cómo corre Java",
      "cuadros": [
        {
          "texto": "Escribes Main.java"
        },
        {
          "texto": "javac revisa y compila a bytecode"
        },
        {
          "texto": "La JVM ejecuta el bytecode en cualquier sistema"
        }
      ]
    }
  ]
}$codia$::jsonb,
  22, true),
('codia-clase-java-2-objetos', 'Java 2: clases y objetos',
  'La idea central de Java: una clase es un molde y un objeto es algo concreto hecho con ese molde. Constructores, métodos, ArrayList y un error en tiempo de ejecución.',
  'codia',
  $codia${
  "pasos": [
    "Java es un lenguaje orientado a objetos. Una clase es un molde: dice qué datos (atributos) y qué acciones (métodos) tiene algo. Un objeto es una cosa concreta hecha con ese molde, con sus propios datos.",
    "Una clase Mascota con un constructor (el método que arma el objeto) y un método. Con new se crea un objeto.\n```java\nstatic class Mascota {\n    String nombre;\n    int edad;\n\n    Mascota(String nombre, int edad) {\n        this.nombre = nombre;\n        this.edad = edad;\n    }\n\n    String presentarse() {\n        return nombre + \" tiene \" + edad;\n    }\n}\nMascota m = new Mascota(\"Toby\", 3);\nSystem.out.println(m.presentarse());\n```\n```salida\nToby tiene 3\n```",
    "Cada objeto guarda sus propios datos: sumar en uno no cambia el otro.\n```java\nstatic class Contador {\n    int valor = 0;\n\n    void sumar() {\n        valor++;\n    }\n}\nContador a = new Contador();\nContador b = new Contador();\na.sumar();\na.sumar();\nb.sumar();\nSystem.out.println(a.valor + \" \" + b.valor);\n```\n```salida\n2 1\n```",
    "Para listas que crecen se usa ArrayList, que hay que importar. Entre los signos < > va el tipo de lo que guarda.\n```java\nimport java.util.ArrayList;\nArrayList<String> nombres = new ArrayList<>();\nnombres.add(\"Ana\");\nnombres.add(\"Luis\");\nnombres.add(\"Bea\");\nSystem.out.println(nombres.size());\nSystem.out.println(nombres.get(1));\nSystem.out.println(nombres);\n```\n```salida\n3\nLuis\n[Ana, Luis, Bea]\n```",
    "Hay errores que el compilador no puede ver, porque dependen de los datos: aparecen al ejecutar.\n```java!\nint[] a = {1, 2, 3};\nSystem.out.println(a[3]);\n```\n```salida\nArrayIndexOutOfBoundsException\n```"
  ],
  "quiz": [
    {
      "pregunta": "¿Qué imprime?\n```java\nstatic class Caja {\n    int n;\n\n    Caja(int n) {\n        this.n = n;\n    }\n}\nCaja c = new Caja(5);\nc.n = c.n + 2;\nSystem.out.println(c.n);\n```",
      "opciones": [
        "5",
        "7",
        "2"
      ],
      "respuesta": "7",
      "explicacion": "El objeto empieza con n = 5 y después se le suma 2."
    },
    {
      "pregunta": "¿Qué es un objeto en Java?",
      "opciones": [
        "Un tipo de bucle",
        "Una cosa concreta creada con el molde de una clase",
        "Un archivo .java"
      ],
      "respuesta": "Una cosa concreta creada con el molde de una clase",
      "explicacion": "La clase es el molde; con new se crean objetos a partir de él."
    },
    {
      "pregunta": "¿Qué imprime?\n```java\nimport java.util.ArrayList;\nArrayList<Integer> xs = new ArrayList<>();\nxs.add(4);\nxs.add(8);\nSystem.out.println(xs.size() + xs.get(0));\n```",
      "opciones": [
        "6",
        "12",
        "24"
      ],
      "respuesta": "6",
      "explicacion": "size() es 2 y get(0) es 4: 2 + 4 = 6."
    }
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 1,
      "titulo": "Clase y objeto",
      "cuadros": [
        {
          "texto": "Clase: el molde (Mascota)"
        },
        {
          "texto": "Objeto: algo concreto (Toby, 3 años)"
        },
        {
          "texto": "new crea el objeto; el constructor lo llena"
        }
      ]
    }
  ]
}$codia$::jsonb,
  23, true),
('codia-clase-java-3-usos', 'Java 3: dónde se usa — Android, empresas y servidores',
  'Por qué bancos, empresas y Android confían en Java, con un ejemplo de cuenta bancaria, un HashMap de inventario y el precio de su seguridad: escribir más.',
  'codia',
  $codia${
  "pasos": [
    "Java nació en 1995 con la promesa de «escribe una vez, corre en cualquier lado»: el mismo bytecode corre en Windows, Mac, Linux o un teléfono. Hoy está en las apps Android (junto con Kotlin), en los sistemas de bancos y empresas grandes, en servidores (con Spring) y en videojuegos como la edición Java de Minecraft.",
    "Por qué lo eligen las empresas: los tipos estrictos y el compilador atrapan muchos errores antes de que el sistema llegue a los usuarios, la JVM es muy rápida, y organizar todo en clases ayuda a que cientos de personas trabajen en el mismo código.",
    "Un ejemplo típico de empresa: una cuenta bancaria. El saldo es private (solo la propia clase lo toca) y se cambia con métodos que controlan las reglas, como no retirar más de lo que hay.\n```java\nstatic class Cuenta {\n    private int saldo = 0;\n\n    void depositar(int monto) {\n        saldo += monto;\n    }\n\n    boolean retirar(int monto) {\n        if (monto > saldo) {\n            return false;\n        }\n        saldo -= monto;\n        return true;\n    }\n\n    int getSaldo() {\n        return saldo;\n    }\n}\nCuenta c = new Cuenta();\nc.depositar(100);\nSystem.out.println(c.retirar(30));\nSystem.out.println(c.retirar(500));\nSystem.out.println(c.getSaldo());\n```\n```salida\ntrue\nfalse\n70\n```",
    "Un inventario con HashMap, el diccionario de Java: guarda pares clave-valor.\n```java\nimport java.util.HashMap;\nHashMap<String, Integer> stock = new HashMap<>();\nstock.put(\"lapiz\", 10);\nstock.put(\"cuaderno\", 4);\nstock.put(\"lapiz\", stock.get(\"lapiz\") - 3);\nSystem.out.println(stock.get(\"lapiz\"));\nSystem.out.println(stock.containsKey(\"goma\"));\n```\n```salida\n7\nfalse\n```",
    "El precio de esa seguridad: Java pide escribir más. Lo que en Python es una línea de print, en Java va dentro de una clase y de un main, con el tipo de cada cosa declarado:\n```java\nString saludo = \"hola\";\nSystem.out.println(saludo);\n```\n```salida\nhola\n```\nSe escribe más, pero el compilador te protege más: por eso brilla en sistemas grandes que tienen que funcionar durante años."
  ],
  "quiz": [
    {
      "pregunta": "¿Qué imprime?\n```java\nint saldo = 50;\nint retiro = 80;\nif (retiro > saldo) {\n    System.out.println(\"Fondos insuficientes\");\n} else {\n    saldo -= retiro;\n    System.out.println(saldo);\n}\n```",
      "opciones": [
        "-30",
        "Fondos insuficientes",
        "50"
      ],
      "respuesta": "Fondos insuficientes",
      "explicacion": "80 es mayor que 50, así que entra al if y no descuenta nada."
    },
    {
      "pregunta": "¿En qué se usa mucho Java?",
      "opciones": [
        "Apps Android y sistemas de empresas",
        "Solo páginas web en el navegador",
        "Hojas de cálculo"
      ],
      "respuesta": "Apps Android y sistemas de empresas",
      "explicacion": "Android, bancos, empresas y servidores son su terreno principal."
    },
    {
      "pregunta": "¿Qué significa que un atributo sea private?",
      "opciones": [
        "Que es constante",
        "Que solo lo puede usar el código de su propia clase",
        "Que se borra al terminar el programa"
      ],
      "respuesta": "Que solo lo puede usar el código de su propia clase",
      "explicacion": "Así nadie cambia el saldo sin pasar por las reglas de depositar y retirar."
    }
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 0,
      "titulo": "Java en el mundo real",
      "cuadros": [
        {
          "texto": "Apps Android"
        },
        {
          "texto": "Bancos y empresas"
        },
        {
          "texto": "Servidores con Spring"
        },
        {
          "texto": "Minecraft (edición Java)"
        }
      ]
    }
  ]
}$codia$::jsonb,
  24, true),
('codia-clase-javascript-1-sintaxis', 'JavaScript 1: el lenguaje de la web',
  'Por qué JavaScript está en todas las páginas, const y let, == contra ===, los métodos de arreglos y cómo son sus números.',
  'codia',
  $codia${
  "pasos": [
    "JavaScript es el único lenguaje que entienden todos los navegadores: cada botón que reacciona, cada menú que se abre y cada animación de una página lo usan. Fuera del navegador corre con Node.js.",
    "const para lo que no cambia y let para lo que sí. Un const no se puede reasignar:\n```javascript\nconst nombre = \"Ana\";\nlet puntos = 10;\npuntos = puntos + 5;\nconsole.log(nombre + \" tiene \" + puntos);\n```\n```salida\nAna tiene 15\n```\n```javascript!\nconst vidas = 3;\nvidas = 2;\n```\n```salida\nTypeError\n```",
    "== compara convirtiendo tipos y da sorpresas; === exige el mismo valor y el mismo tipo. Usa siempre ===.\n```javascript\nconsole.log(5 == \"5\");\nconsole.log(5 === \"5\");\nconsole.log(0 == false);\n```\n```salida\ntrue\nfalse\ntrue\n```",
    "Los arreglos traen métodos muy usados: map transforma cada elemento, filter se queda con algunos y join los une en un texto.\n```javascript\nconst notas = [7, 9, 6];\nconst dobles = notas.map((n) => n * 2);\nconst aprobadas = notas.filter((n) => n >= 7);\nconsole.log(dobles.join(\", \"));\nconsole.log(aprobadas.length);\n```\n```salida\n14, 18, 12\n2\n```",
    "Todos los números son del mismo tipo (no hay enteros aparte): 7 / 2 da 3.5 y, para la parte entera, se usa Math.floor. Los decimales se guardan en binario, y por eso aparecen restos como en 0.1 + 0.2.\n```javascript\nconsole.log(7 / 2);\nconsole.log(Math.floor(7 / 2));\nconsole.log(0.1 + 0.2);\n```\n```salida\n3.5\n3\n0.30000000000000004\n```"
  ],
  "quiz": [
    {
      "pregunta": "¿Qué imprime?\n```javascript\nconsole.log(\"3\" + 4);\n```",
      "opciones": [
        "7",
        "34",
        "Error"
      ],
      "respuesta": "34",
      "explicacion": "Con un texto de por medio, + une: «3» y «4» dan «34»."
    },
    {
      "pregunta": "¿Qué imprime?\n```javascript\nconsole.log([1, 2, 3].map((x) => x * x).join(\"-\"));\n```",
      "opciones": [
        "1-4-9",
        "1-2-3",
        "2-4-6"
      ],
      "respuesta": "1-4-9",
      "explicacion": "map eleva cada número al cuadrado y join los une con guiones."
    },
    {
      "pregunta": "¿Qué diferencia hay entre == y ===?",
      "opciones": [
        "Ninguna",
        "=== compara también el tipo",
        "== es más estricto"
      ],
      "respuesta": "=== compara también el tipo",
      "explicacion": "5 == \"5\" da true porque convierte; 5 === \"5\" da false."
    }
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 1,
      "titulo": "JavaScript en la web",
      "cuadros": [
        {
          "texto": "El navegador lo ejecuta en cada página"
        },
        {
          "texto": "const y let declaran variables"
        },
        {
          "texto": "Usa === para comparar"
        },
        {
          "texto": "map, filter y join para arreglos"
        }
      ]
    }
  ]
}$codia$::jsonb,
  25, true),
('codia-clase-javascript-2-objetos-y-funciones', 'JavaScript 2: objetos, funciones flecha y JSON',
  'Objetos con propiedades, funciones normales y flecha, desestructuración, JSON (el formato de datos de la web) y el famoso undefined.',
  'codia',
  $codia${
  "pasos": [
    "Un objeto agrupa datos con nombre, como un diccionario de Python.\n```javascript\nconst alumno = { nombre: \"Luis\", edad: 15 };\nalumno.edad = 16;\nconsole.log(alumno.nombre, alumno.edad);\nconsole.log(Object.keys(alumno).length);\n```\n```salida\nLuis 16\n2\n```",
    "Hay dos formas de escribir funciones: la normal y la flecha, más corta.\n```javascript\nfunction sumar(a, b) {\n  return a + b;\n}\nconst restar = (a, b) => a - b;\nconsole.log(sumar(5, 3), restar(5, 3));\n```\n```salida\n8 2\n```",
    "La desestructuración saca propiedades a variables, y los tres puntos copian un arreglo dentro de otro.\n```javascript\nconst punto = { x: 3, y: 4 };\nconst { x, y } = punto;\nconsole.log(x * y);\nconst lista = [1, 2];\nconst mas = [...lista, 3];\nconsole.log(mas.length);\n```\n```salida\n12\n3\n```",
    "JSON es el formato con el que viajan los datos por internet. JSON.stringify convierte un objeto en texto y JSON.parse hace lo contrario.\n```javascript\nconst datos = { mundo: \"Codia\", nivel: 4 };\nconst texto = JSON.stringify(datos);\nconsole.log(texto);\nconst otra = JSON.parse(texto);\nconsole.log(otra.nivel + 1);\n```\n```salida\n{\"mundo\":\"Codia\",\"nivel\":4}\n5\n```",
    "Pedir una propiedad que no existe no falla: da undefined.\n```javascript\nconst o = { a: 1 };\nconsole.log(o.b);\n```\n```salida\nundefined\n```\nPero pedirle algo a undefined sí falla, y es uno de los errores más comunes de la web:\n```javascript!\nconst o = { a: 1 };\nconsole.log(o.b.c);\n```\n```salida\nTypeError\n```"
  ],
  "quiz": [
    {
      "pregunta": "¿Qué imprime?\n```javascript\nconst p = { a: 2, b: 3 };\nconsole.log(p.a * p.b);\n```",
      "opciones": [
        "5",
        "6",
        "23"
      ],
      "respuesta": "6",
      "explicacion": "p.a es 2 y p.b es 3: 2 × 3 = 6."
    },
    {
      "pregunta": "¿Qué imprime?\n```javascript\nconsole.log(JSON.stringify({ x: 1 }));\n```",
      "opciones": [
        "{\"x\":1}",
        "{ x: 1 }",
        "x:1"
      ],
      "respuesta": "{\"x\":1}",
      "explicacion": "JSON pone las claves entre comillas dobles y no deja espacios."
    },
    {
      "pregunta": "¿Qué pasa al correr esto?\n```javascript\nconst u = undefined;\nconsole.log(u.largo);\n```",
      "opciones": [
        "Imprime undefined",
        "Falla con TypeError",
        "Imprime 0"
      ],
      "respuesta": "Falla con TypeError",
      "explicacion": "No se puede leer una propiedad de undefined."
    }
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 3,
      "titulo": "Un dato que viaja por internet",
      "cuadros": [
        {
          "texto": "Objeto en el navegador"
        },
        {
          "texto": "JSON.stringify: lo convierte en texto"
        },
        {
          "texto": "Viaja al servidor"
        },
        {
          "texto": "JSON.parse: vuelve a ser objeto"
        }
      ]
    }
  ]
}$codia$::jsonb,
  26, true),
('codia-clase-javascript-3-usos', 'JavaScript 3: dónde se usa — páginas web, servidores y apps',
  'Del navegador a los servidores y los teléfonos: React, Node.js, React Native y Electron, la idea de callback y por qué tanta flexibilidad pide cuidado.',
  'codia',
  $codia${
  "pasos": [
    "En el navegador, JavaScript cambia la página cuando haces algo: un clic, escribir, deslizar. Las páginas grandes usan frameworks como React, Vue o Angular. Prodigia, por ejemplo, está hecha con React.",
    "Fuera del navegador está en todas partes: servidores con Node.js, apps de teléfono con React Native (como la app Android de Prodigia) y programas de escritorio con Electron (como el editor VS Code).",
    "La web funciona con la idea de «cuando pase esto, haz aquello»: le pasas una función a otra para que la llame en el momento justo. Esa función se llama callback.\n```javascript\nfunction alHacerClic(accion) {\n  console.log(\"Clic recibido\");\n  accion();\n}\nalHacerClic(() => console.log(\"Abriendo el panel\"));\n```\n```salida\nClic recibido\nAbriendo el panel\n```",
    "Un carrito de compras, típico de una tienda en línea: reduce recorre la lista acumulando el total.\n```javascript\nconst carrito = [\n  { producto: \"lapiz\", precio: 2 },\n  { producto: \"cuaderno\", precio: 5 },\n];\nconst total = carrito.reduce((suma, item) => suma + item.precio, 0);\nconsole.log(\"Total: \" + total);\n```\n```salida\nTotal: 7\n```",
    "Ventaja y cuidado: JavaScript está en todos lados y es muy flexible, pero esa flexibilidad trae sorpresas que no avisan:\n```javascript\nconsole.log(\"3\" + 4);\nconsole.log(1 == \"1\");\n```\n```salida\n34\ntrue\n```\nPor eso los proyectos grandes suelen pasarse a TypeScript, que agrega los tipos."
  ],
  "quiz": [
    {
      "pregunta": "¿Dónde corre JavaScript, además del navegador?",
      "opciones": [
        "Solo en el navegador",
        "En servidores, con Node.js",
        "En la JVM"
      ],
      "respuesta": "En servidores, con Node.js",
      "explicacion": "Node.js permite usar JavaScript fuera del navegador."
    },
    {
      "pregunta": "¿Qué imprime?\n```javascript\nconsole.log([2, 3, 4].reduce((a, b) => a + b, 0));\n```",
      "opciones": [
        "9",
        "24",
        "234"
      ],
      "respuesta": "9",
      "explicacion": "reduce suma todo empezando en 0: 2 + 3 + 4 = 9."
    },
    {
      "pregunta": "¿Qué es un callback?",
      "opciones": [
        "Un error de JavaScript",
        "Una función que se pasa a otra para que la llame después",
        "Una variable constante"
      ],
      "respuesta": "Una función que se pasa a otra para que la llame después",
      "explicacion": "Es la base de «cuando pase esto, haz aquello» en la web."
    }
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 0,
      "titulo": "JavaScript en el mundo real",
      "cuadros": [
        {
          "texto": "Páginas web: React, Vue, Angular"
        },
        {
          "texto": "Servidores: Node.js"
        },
        {
          "texto": "Apps de teléfono: React Native"
        },
        {
          "texto": "Escritorio: Electron"
        }
      ]
    }
  ]
}$codia$::jsonb,
  27, true),
('codia-clase-typescript-1-tipos', 'TypeScript 1: JavaScript con tipos',
  'Qué agrega TypeScript a JavaScript: anotaciones de tipo, errores antes de ejecutar, inferencia y funciones tipadas.',
  'codia',
  $codia${
  "pasos": [
    "TypeScript es JavaScript con tipos. El compilador revisa que cada valor sea del tipo esperado y después genera JavaScript normal: los tipos desaparecen al ejecutar. Todo programa JavaScript válido es casi siempre TypeScript válido.",
    "Las anotaciones van después del nombre, con dos puntos:\n```typescript\nlet nombre: string = \"Ana\";\nlet edad: number = 15;\nlet activo: boolean = true;\nconsole.log(nombre, edad + 1, activo);\n```\n```salida\nAna 16 true\n```",
    "Lo que en JavaScript sería un error al ejecutar (o un error silencioso), aquí ni siquiera compila:\n```typescript!\nlet puntos: number = 10;\npuntos = \"diez\";\n```\n```salida\nerror de compilación\n```",
    "No hace falta escribir todos los tipos: TypeScript los deduce (inferencia). Sabe que precios es una lista de números y no deja meter un texto.\n```typescript\nconst precios = [3, 5, 2];\nconst total = precios.reduce((a, b) => a + b, 0);\nconsole.log(total.toFixed(2));\n```\n```salida\n10.00\n```\n```typescript!\nconst precios = [3, 5, 2];\nprecios.push(\"gratis\");\n```\n```salida\nerror de compilación\n```",
    "Las funciones declaran el tipo de sus parámetros y de su resultado, y quien las llama mal se entera antes de ejecutar.\n```typescript\nfunction promedio(notas: number[]): number {\n  return notas.reduce((a, b) => a + b, 0) / notas.length;\n}\nconsole.log(promedio([6, 8, 10]));\n```\n```salida\n8\n```\n```typescript!\nfunction doble(n: number): number {\n  return n * 2;\n}\ndoble(\"4\");\n```\n```salida\nerror de compilación\n```"
  ],
  "quiz": [
    {
      "pregunta": "¿Qué pasa con este código?\n```typescript\nlet x: string = 5;\n```",
      "opciones": [
        "Guarda «5»",
        "No compila: error de compilación",
        "Guarda 5"
      ],
      "respuesta": "No compila: error de compilación",
      "explicacion": "x es un string y 5 es un number: el compilador lo rechaza."
    },
    {
      "pregunta": "¿Qué queda de los tipos cuando el programa se ejecuta?",
      "opciones": [
        "Nada: se borran al compilar a JavaScript",
        "Se revisan otra vez en cada línea",
        "Se guardan en un archivo aparte"
      ],
      "respuesta": "Nada: se borran al compilar a JavaScript",
      "explicacion": "Los tipos solo existen para el compilador; lo que corre es JavaScript."
    },
    {
      "pregunta": "¿Qué imprime?\n```typescript\nconst n: number = 7;\nconsole.log(n * 3);\n```",
      "opciones": [
        "21",
        "73",
        "777"
      ],
      "respuesta": "21",
      "explicacion": "n es un número: 7 × 3 = 21."
    }
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 0,
      "titulo": "Cómo corre TypeScript",
      "cuadros": [
        {
          "texto": "Escribes código con tipos"
        },
        {
          "texto": "tsc revisa los tipos"
        },
        {
          "texto": "Genera JavaScript sin tipos"
        },
        {
          "texto": "Corre como cualquier JavaScript"
        }
      ]
    }
  ]
}$codia$::jsonb,
  28, true),
('codia-clase-typescript-2-interfaces', 'TypeScript 2: interfaces, uniones y null',
  'Describir la forma de un objeto con interface, limitar valores con tipos unión y tratar con cuidado lo que puede ser null.',
  'codia',
  $codia${
  "pasos": [
    "Una interface describe la forma que debe tener un objeto. Un signo de pregunta marca una propiedad opcional.\n```typescript\ninterface Jugador {\n  nombre: string;\n  nivel: number;\n  clan?: string;\n}\nconst j: Jugador = { nombre: \"Bea\", nivel: 7 };\nconsole.log(j.nombre, j.nivel);\nconsole.log(j.clan === undefined);\n```\n```salida\nBea 7\ntrue\n```",
    "Si falta una propiedad obligatoria, no compila:\n```typescript!\ninterface Jugador {\n  nombre: string;\n  nivel: number;\n}\nconst j: Jugador = { nombre: \"Bea\" };\n```\n```salida\nerror de compilación\n```",
    "Un tipo unión limita los valores posibles. Así, un rango solo puede ser uno de los que existen:\n```typescript\ntype Rango = \"bronce\" | \"plata\" | \"oro\";\nfunction siguiente(r: Rango): Rango {\n  if (r === \"bronce\") return \"plata\";\n  return \"oro\";\n}\nconsole.log(siguiente(\"bronce\"));\n```\n```salida\nplata\n```\n```typescript!\ntype Rango = \"bronce\" | \"plata\" | \"oro\";\nconst r: Rango = \"diamante\";\n```\n```salida\nerror de compilación\n```",
    "Si algo puede faltar, se escribe con | null, y el compilador obliga a revisarlo antes de usarlo.\n```typescript\nfunction largo(texto: string | null): number {\n  if (texto === null) {\n    return 0;\n  }\n  return texto.length;\n}\nconsole.log(largo(\"hola\"), largo(null));\n```\n```salida\n4 0\n```",
    "Por qué importa: en JavaScript, olvidarse de que algo puede ser null o undefined es una de las causas más comunes de errores en páginas web. TypeScript convierte ese olvido en un aviso del editor antes de que llegue a los usuarios."
  ],
  "quiz": [
    {
      "pregunta": "¿Qué pasa con este código?\n```typescript\ninterface P {\n  x: number;\n}\nconst p: P = { x: \"1\" };\n```",
      "opciones": [
        "Compila y x vale «1»",
        "No compila: error de compilación",
        "Compila y x vale 1"
      ],
      "respuesta": "No compila: error de compilación",
      "explicacion": "x tiene que ser number y le dan un string."
    },
    {
      "pregunta": "¿Qué imprime?\n```typescript\ntype Color = \"rojo\" | \"azul\";\nconst c: Color = \"azul\";\nconsole.log(c.toUpperCase());\n```",
      "opciones": [
        "azul",
        "AZUL",
        "Azul"
      ],
      "respuesta": "AZUL",
      "explicacion": "c es un texto: toUpperCase lo pasa a mayúsculas."
    },
    {
      "pregunta": "¿Para qué sirve una interface?",
      "opciones": [
        "Para dibujar la interfaz de una página",
        "Para describir la forma que debe tener un objeto",
        "Para importar módulos"
      ],
      "respuesta": "Para describir la forma que debe tener un objeto",
      "explicacion": "Dice qué propiedades tiene y de qué tipo es cada una."
    }
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 0,
      "titulo": "Herramientas de TypeScript",
      "cuadros": [
        {
          "texto": "interface: la forma de un objeto"
        },
        {
          "texto": "prop?: propiedad opcional"
        },
        {
          "texto": "\"a\" | \"b\": solo esos valores"
        },
        {
          "texto": "| null: puede faltar, hay que revisarlo"
        }
      ]
    }
  ]
}$codia$::jsonb,
  29, true),
('codia-clase-typescript-3-usos', 'TypeScript 3: dónde se usa — proyectos grandes y equipos',
  'Dónde se usa TypeScript, cómo ayuda a un equipo, un ejemplo realista con datos de una partida, genéricos y cuándo conviene JavaScript a secas.',
  'codia',
  $codia${
  "pasos": [
    "TypeScript se usa donde se usaría JavaScript, pero en proyectos grandes: páginas con React, Angular o Vue, servidores con Node.js y apps de teléfono con React Native. Lo creó Microsoft en 2012, y hoy lo usa buena parte de la industria web. Prodigia está escrita en TypeScript.",
    "La ventaja en equipo: el editor autocompleta y marca errores mientras escribes. Si alguien cambia el nombre de una propiedad, TypeScript señala todos los lugares que quedaron usando el nombre viejo:\n```typescript!\ninterface Usuario {\n  nombreCompleto: string;\n}\nconst u: Usuario = { nombreCompleto: \"Ana Paz\" };\nconsole.log(u.nombre);\n```\n```salida\nerror de compilación\n```\nEn un proyecto de miles de archivos, eso evita muchísimos errores.",
    "Un ejemplo realista: describir los datos de una partida y calcular la precisión.\n```typescript\ninterface Partida {\n  mundo: string;\n  correctas: number;\n  total: number;\n}\nfunction precision(p: Partida): string {\n  return Math.round((p.correctas / p.total) * 100) + \"%\";\n}\nconst partida: Partida = { mundo: \"Codia\", correctas: 8, total: 10 };\nconsole.log(precision(partida));\n```\n```salida\n80%\n```",
    "Los genéricos permiten escribir una función que sirve para cualquier tipo sin perder cuál es: T es «el tipo que sea».\n```typescript\nfunction primero<T>(lista: T[]): T {\n  return lista[0];\n}\nconst n = primero([4, 5, 6]);\nconst s = primero([\"a\", \"b\"]);\nconsole.log(n + 1, s.toUpperCase());\n```\n```salida\n5 A\n```",
    "El costo: hay que compilar y escribir tipos. Regla práctica: para un script chico o un proyecto de una sola persona, JavaScript alcanza; para un proyecto grande o hecho en equipo, TypeScript se paga solo."
  ],
  "quiz": [
    {
      "pregunta": "¿Qué imprime?\n```typescript\nfunction total(xs: number[]): number {\n  return xs.reduce((a, b) => a + b, 0);\n}\nconsole.log(total([1, 2, 3]));\n```",
      "opciones": [
        "6",
        "123",
        "3"
      ],
      "respuesta": "6",
      "explicacion": "reduce suma la lista: 1 + 2 + 3 = 6."
    },
    {
      "pregunta": "¿Quién creó TypeScript?",
      "opciones": [
        "Google",
        "Microsoft",
        "Oracle"
      ],
      "respuesta": "Microsoft",
      "explicacion": "Microsoft lo presentó en 2012."
    },
    {
      "pregunta": "¿Cuándo conviene más TypeScript que JavaScript?",
      "opciones": [
        "En un script de diez líneas",
        "En proyectos grandes o hechos en equipo",
        "Nunca: son lo mismo"
      ],
      "respuesta": "En proyectos grandes o hechos en equipo",
      "explicacion": "Los tipos ayudan a que muchas personas cambien el código sin romperlo."
    }
  ],
  "visuales": [
    {
      "tipo": "cuadros",
      "despuesDePaso": 0,
      "titulo": "TypeScript en el mundo real",
      "cuadros": [
        {
          "texto": "Páginas grandes con React o Angular"
        },
        {
          "texto": "Servidores con Node.js"
        },
        {
          "texto": "Apps con React Native"
        },
        {
          "texto": "Equipos grandes: el editor avisa los errores"
        }
      ]
    }
  ]
}$codia$::jsonb,
  30, true)
on conflict (slug) do update set
  nombre = excluded.nombre,
  descripcion = excluded.descripcion,
  problem_type = excluded.problem_type,
  contenido = excluded.contenido,
  orden = excluded.orden,
  requiere_pro = excluded.requiere_pro;
