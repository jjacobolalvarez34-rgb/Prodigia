-- ============================================================
-- Prodigia — Codia (mundo 13): explicación visual/animada en Aprender.
--
-- Agrega `contenido.visuales` a las 5 Técnicas y las 8 Clases de
-- 0193_codia_contenido.sql y deja `contenido.pasos` al día (pasos nuevos
-- que cubren lo que evalúa la práctica: comentarios, += y *=, largo y
-- repetición de textos, orden de la suma con textos, lista dinámica, máximo,
-- factorial, O(n log n) y O(n³)). NO toca el quiz: un update por slug que
-- mezcla las claves 'pasos' y 'visuales' en el jsonb existente.
--
-- Los visuales son "codia.traza" (ejecución paso a paso con
-- línea resaltada y tabla de variables), "codia.comparar" (el mismo
-- programa en Python, Java, JavaScript y TypeScript con su salida real),
-- "codia.flujo" (diagrama de flujo de un condicional o un bucle) y
-- "codia.crecimiento" (cuánto trabajo hace un bucle cuando crece n). Cada
-- uno lleva el programa en el IR de la práctica (src/lib/codia/tipos.ts);
-- el código, la salida y las variables se calculan al mostrarlo, nunca
-- viajan tipeados a mano.
--
-- Este archivo se GENERA desde src/lib/codia/lecciones/ (fuente única) y
-- lecciones.test.ts lo compara byte a byte con lo generado. No editar a
-- mano. Requiere 0193 (las filas existen). Idempotente.
-- ============================================================

update public.techniques set contenido = contenido || jsonb_build_object(
  'pasos', $codia$[
  "Para saber qué imprime un fragmento no adivines: haz una tabla con una columna por variable y una fila por cada línea que cambia algo. Así no dependes de la memoria y encuentras el resultado paso a paso.",
  "Ejemplo resuelto. Sigue este programa:\n```python\na = 3\nb = 4\na = a + b\nb = a - b\nprint(a, b)\n```\nTabla: línea 1 deja a=3. Línea 2 deja a=3, b=4. Línea 3 calcula a + b = 7 y lo guarda en a: a=7, b=4. Línea 4 calcula a - b = 7 - 4 = 3 con el valor NUEVO de a y lo guarda en b: a=7, b=3. El print muestra:\n```salida\n7 3\n```",
  "Regla de oro: en a = a + b primero se calcula el lado derecho con los valores que las variables tienen AHORA, y recién después se guarda el resultado en el lado izquierdo. El signo = no es una igualdad de matemática: significa guarda esto en esa variable.",
  "El mismo programa en los otros tres lenguajes: la tabla es idéntica, solo cambia cómo se escribe.\n```java\nint a = 3;\nint b = 4;\na = a + b;\nb = a - b;\nSystem.out.println(a + \" \" + b);\n```\n```javascript\nlet a = 3;\nlet b = 4;\na = a + b;\nb = a - b;\nconsole.log(a, b);\n```\n```typescript\nlet a: number = 3;\nlet b: number = 4;\na = a + b;\nb = a - b;\nconsole.log(a, b);\n```\n```salida\n7 3\n```",
  "Trampa clásica: intercambiar dos variables sin una tercera se rompe. Trazalo:\n```python\na = 1\nb = 2\na = b\nb = a\nprint(a, b)\n```\nLínea 3: a pasa a valer 2 y el 1 original se pierde. Línea 4: b = a copia ese 2. Las dos quedan iguales:\n```salida\n2 2\n```\nPara intercambiar necesitas una variable temporal: t = a, luego a = b y por último b = t.",
  "Consejo de examen: tacha el valor viejo cada vez que una variable cambia y escribe el nuevo al lado. Si el fragmento tiene un bucle, agrega una fila por vuelta. Tardas un minuto y evitas casi todos los errores de lectura."
]$codia$::jsonb,
  'visuales', $codia$[
  {
    "tipo": "codia.traza",
    "despuesDePaso": 1,
    "titulo": "Sigue el programa línea por línea",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "a",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 3
          },
          "id": "s1"
        },
        {
          "k": "decl",
          "n": "b",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 4
          },
          "id": "s2"
        },
        {
          "k": "asig",
          "n": "a",
          "e": {
            "k": "op",
            "op": "+",
            "a": {
              "k": "v",
              "n": "a"
            },
            "b": {
              "k": "v",
              "n": "b"
            }
          },
          "id": "s3"
        },
        {
          "k": "asig",
          "n": "b",
          "e": {
            "k": "op",
            "op": "-",
            "a": {
              "k": "v",
              "n": "a"
            },
            "b": {
              "k": "v",
              "n": "b"
            }
          },
          "id": "s4"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "a"
            },
            {
              "k": "v",
              "n": "b"
            }
          ],
          "id": "s5"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.comparar",
    "despuesDePaso": 3,
    "titulo": "El mismo programa en los cuatro lenguajes",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "a",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 3
          },
          "id": "s1"
        },
        {
          "k": "decl",
          "n": "b",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 4
          },
          "id": "s2"
        },
        {
          "k": "asig",
          "n": "a",
          "e": {
            "k": "op",
            "op": "+",
            "a": {
              "k": "v",
              "n": "a"
            },
            "b": {
              "k": "v",
              "n": "b"
            }
          },
          "id": "s3"
        },
        {
          "k": "asig",
          "n": "b",
          "e": {
            "k": "op",
            "op": "-",
            "a": {
              "k": "v",
              "n": "a"
            },
            "b": {
              "k": "v",
              "n": "b"
            }
          },
          "id": "s4"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "a"
            },
            {
              "k": "v",
              "n": "b"
            }
          ],
          "id": "s5"
        }
      ]
    }
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 4,
    "titulo": "La trampa: intercambiar sin una variable temporal",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "a",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 1
          },
          "id": "s1"
        },
        {
          "k": "decl",
          "n": "b",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 2
          },
          "id": "s2"
        },
        {
          "k": "asig",
          "n": "a",
          "e": {
            "k": "v",
            "n": "b"
          },
          "id": "s3"
        },
        {
          "k": "asig",
          "n": "b",
          "e": {
            "k": "v",
            "n": "a"
          },
          "id": "s4"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "a"
            },
            {
              "k": "v",
              "n": "b"
            }
          ],
          "id": "s5"
        }
      ]
    },
    "lenguaje": "python"
  }
]$codia$::jsonb)
where slug = 'codia-tecnica-tabla-seguimiento' and problem_type = 'codia';

update public.techniques set contenido = contenido || jsonb_build_object(
  'pasos', $codia$[
  "Frente a un bucle haz siempre tres preguntas: ¿con qué valor arranca? ¿cuándo se corta? ¿qué cambia en cada vuelta? Con esas tres respuestas sabes cuántas vueltas da y no te pierdes.",
  "En un for con rango el límite superior NO se incluye: range(2, 6) recorre 2, 3, 4 y 5. Las vueltas son límite - inicio = 6 - 2 = 4.\n```python\nfor i in range(2, 6):\n    print(i)\n```\n```salida\n2\n3\n4\n5\n```\nEn Java, JavaScript y TypeScript pasa lo mismo con la condición i < 6.\n```java\nfor (int i = 2; i < 6; i++) {\n    System.out.println(i);\n}\n```\n```javascript\nfor (let i = 2; i < 6; i++) {\n    console.log(i);\n}\n```\n```typescript\nfor (let i = 2; i < 6; i++) {\n    console.log(i);\n}\n```\n```salida\n2\n3\n4\n5\n```",
  "En un while, mira qué cambia en cada vuelta y cuándo deja de cumplirse la condición. Ejemplo resuelto:\n```python\nn = 20\nvueltas = 0\nwhile n > 1:\n    n = n // 2\n    vueltas = vueltas + 1\nprint(vueltas, n)\n```\nVuelta 1: n pasa de 20 a 10. Vuelta 2: a 5. Vuelta 3: a 2. Vuelta 4: a 1, y como 1 > 1 es falso el bucle termina.\n```salida\n4 1\n```",
  "Con un acumulador (total = total + algo) anota el valor de total al final de cada vuelta. Si el bucle es de 4 vueltas, son 4 filas en tu tabla. No calcules todo de golpe.",
  "Cuidado con dos errores muy comunes: contar una vuelta de más o de menos por el límite (off-by-one) y olvidarte de que en Java, JavaScript y TypeScript con i <= 5 SÍ se incluye el 5 mientras que range(5) de Python llega hasta 4."
]$codia$::jsonb,
  'visuales', $codia$[
  {
    "tipo": "codia.traza",
    "despuesDePaso": 1,
    "titulo": "El límite superior no se incluye: range(2, 6)",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "para",
          "v": "i",
          "desde": {
            "k": "n",
            "v": 2
          },
          "hasta": {
            "k": "n",
            "v": 6
          },
          "cuerpo": [
            {
              "k": "print",
              "args": [
                {
                  "k": "v",
                  "n": "i"
                }
              ],
              "id": "s2"
            }
          ],
          "id": "s1"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.flujo",
    "despuesDePaso": 2,
    "titulo": "El while: cuándo se repite y cuándo se corta",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "n",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 20
          },
          "id": "s1"
        },
        {
          "k": "decl",
          "n": "vueltas",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 0
          },
          "id": "s2"
        },
        {
          "k": "mientras",
          "cond": {
            "k": "op",
            "op": ">",
            "a": {
              "k": "v",
              "n": "n"
            },
            "b": {
              "k": "n",
              "v": 1
            }
          },
          "cuerpo": [
            {
              "k": "asig",
              "n": "n",
              "e": {
                "k": "op",
                "op": "div",
                "a": {
                  "k": "v",
                  "n": "n"
                },
                "b": {
                  "k": "n",
                  "v": 2
                }
              },
              "id": "s4"
            },
            {
              "k": "asig",
              "n": "vueltas",
              "e": {
                "k": "op",
                "op": "+",
                "a": {
                  "k": "v",
                  "n": "vueltas"
                },
                "b": {
                  "k": "n",
                  "v": 1
                }
              },
              "id": "s5"
            }
          ],
          "id": "s3"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "vueltas"
            },
            {
              "k": "v",
              "n": "n"
            }
          ],
          "id": "s6"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 2,
    "titulo": "El mismo while, vuelta por vuelta",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "n",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 20
          },
          "id": "s1"
        },
        {
          "k": "decl",
          "n": "vueltas",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 0
          },
          "id": "s2"
        },
        {
          "k": "mientras",
          "cond": {
            "k": "op",
            "op": ">",
            "a": {
              "k": "v",
              "n": "n"
            },
            "b": {
              "k": "n",
              "v": 1
            }
          },
          "cuerpo": [
            {
              "k": "asig",
              "n": "n",
              "e": {
                "k": "op",
                "op": "div",
                "a": {
                  "k": "v",
                  "n": "n"
                },
                "b": {
                  "k": "n",
                  "v": 2
                }
              },
              "id": "s4"
            },
            {
              "k": "asig",
              "n": "vueltas",
              "e": {
                "k": "op",
                "op": "+",
                "a": {
                  "k": "v",
                  "n": "vueltas"
                },
                "b": {
                  "k": "n",
                  "v": 1
                }
              },
              "id": "s5"
            }
          ],
          "id": "s3"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "vueltas"
            },
            {
              "k": "v",
              "n": "n"
            }
          ],
          "id": "s6"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 3,
    "titulo": "Un acumulador: el total al final de cada vuelta",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "total",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 0
          },
          "id": "s1"
        },
        {
          "k": "para",
          "v": "i",
          "desde": {
            "k": "n",
            "v": 1
          },
          "hasta": {
            "k": "n",
            "v": 5
          },
          "cuerpo": [
            {
              "k": "asig",
              "n": "total",
              "e": {
                "k": "op",
                "op": "+",
                "a": {
                  "k": "v",
                  "n": "total"
                },
                "b": {
                  "k": "op",
                  "op": "*",
                  "a": {
                    "k": "v",
                    "n": "i"
                  },
                  "b": {
                    "k": "n",
                    "v": 2
                  }
                }
              },
              "id": "s3"
            }
          ],
          "id": "s2"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "total"
            }
          ],
          "id": "s4"
        }
      ]
    },
    "lenguaje": "python"
  }
]$codia$::jsonb)
where slug = 'codia-tecnica-leer-bucles' and problem_type = 'codia';

update public.techniques set contenido = contenido || jsonb_build_object(
  'pasos', $codia$[
  "Un error no es un fracaso: es una pista. El nombre del error te dice qué tipo de problema es y la línea te dice dónde buscar. Hay cinco que aparecen todo el tiempo.",
  "1) Error de sintaxis: el programa ni siquiera empieza. Casi siempre falta un dos puntos, un paréntesis, una llave o una comilla.\n```python!\nif 3 > 2\n    print(\"si\")\n```\n```salida\nSyntaxError\n```",
  "2) Nombre inexistente: usaste una variable o función que no existe, muchas veces por un error de tipeo.\n```python!\ntotal = 10\nprint(totl)\n```\n```salida\nNameError\n```\nEn Java el mismo problema no llega a ejecutarse: el compilador lo frena antes.\n```java!\nint total = 10;\nSystem.out.println(totl);\n```\n```salida\nerror de compilación\n```",
  "3) Índice fuera de rango: pediste la posición n en una lista de n elementos. Las posiciones van de 0 a n - 1.\n```python!\ndatos = [4, 5, 6]\nprint(datos[3])\n```\n```salida\nIndexError\n```\n```java!\nint[] datos = {4, 5, 6};\nSystem.out.println(datos[3]);\n```\n```salida\nArrayIndexOutOfBoundsException\n```",
  "4) División por cero: en Python y en Java con enteros es un error.\n```python!\nprint(10 // 0)\n```\n```salida\nZeroDivisionError\n```\n```java!\nSystem.out.println(10 / 0);\n```\n```salida\nArithmeticException\n```\nJavaScript es distinto: no falla, imprime Infinity.\n```javascript\nconsole.log(10 / 0);\n```\n```salida\nInfinity\n```",
  "5) Tipos incompatibles: mezclar cosas que no se pueden combinar.\n```python!\nprint(\"edad: \" + 30)\n```\n```salida\nTypeError\n```\nEn Java y TypeScript el compilador lo detecta antes de ejecutar.\n```typescript!\nlet edad: number = \"treinta\";\n```\n```salida\nerror de compilación\n```"
]$codia$::jsonb,
  'visuales', $codia$[
  {
    "tipo": "codia.comparar",
    "despuesDePaso": 3,
    "titulo": "Índice fuera de rango, según el lenguaje",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "datos",
          "ty": "arr",
          "e": {
            "k": "arr",
            "items": [
              {
                "k": "n",
                "v": 4
              },
              {
                "k": "n",
                "v": 5
              },
              {
                "k": "n",
                "v": 6
              }
            ]
          }
        },
        {
          "k": "print",
          "args": [
            {
              "k": "ix",
              "a": {
                "k": "v",
                "n": "datos"
              },
              "i": {
                "k": "n",
                "v": 3
              }
            }
          ]
        }
      ]
    }
  },
  {
    "tipo": "codia.comparar",
    "despuesDePaso": 4,
    "titulo": "Dividir por cero, según el lenguaje",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "print",
          "args": [
            {
              "k": "op",
              "op": "div",
              "a": {
                "k": "n",
                "v": 10
              },
              "b": {
                "k": "n",
                "v": 0
              }
            }
          ]
        }
      ]
    }
  },
  {
    "tipo": "codia.comparar",
    "despuesDePaso": 5,
    "titulo": "Mezclar texto y número con +",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "print",
          "args": [
            {
              "k": "op",
              "op": "+",
              "a": {
                "k": "s",
                "v": "edad: "
              },
              "b": {
                "k": "n",
                "v": 30
              }
            }
          ]
        }
      ]
    }
  }
]$codia$::jsonb)
where slug = 'codia-tecnica-errores-tipicos' and problem_type = 'codia';

update public.techniques set contenido = contenido || jsonb_build_object(
  'pasos', $codia$[
  "La división entera descarta los decimales y el resto (módulo, %) es lo que sobra. Con números positivos los cuatro lenguajes coinciden: 17 = 3 * 5 + 2.\n```python\nprint(17 // 5, 17 % 5)\n```\n```salida\n3 2\n```\n```java\nSystem.out.println(17 / 5 + \" \" + 17 % 5);\n```\n```javascript\nconsole.log(Math.trunc(17 / 5), 17 % 5);\n```\n```typescript\nconsole.log(Math.trunc(17 / 5), 17 % 5);\n```\n```salida\n3 2\n```\nEn Java dos enteros ya dividen entero con /. En JavaScript y TypeScript el / siempre da decimales, por eso se usa Math.trunc.",
  "Con negativos Python redondea hacia abajo (piso) y los demás hacia cero. Mismo cálculo, dos resultados:\n```python\nprint(-7 // 2, -7 % 3)\n```\n```salida\n-4 2\n```\n```java\nSystem.out.println(-7 / 2 + \" \" + -7 % 3);\n```\n```salida\n-3 -1\n```\n```javascript\nconsole.log(Math.trunc(-7 / 2), -7 % 3);\n```\n```salida\n-3 -1\n```",
  "Cómo recordarlo: en Python el resto lleva el signo del divisor (por eso -7 % 3 da 2); en Java, JavaScript y TypeScript lleva el signo del dividendo (por eso da -1). Si el fragmento no tiene negativos, no te preocupes: dan lo mismo.",
  "Uso práctico del resto: saber si un número es par (n % 2 == 0) o repetir un ciclo (i % 3 da 0, 1, 2, 0, 1, 2...).\n```python\nfor i in range(6):\n    print(i % 3)\n```\n```salida\n0\n1\n2\n0\n1\n2\n```"
]$codia$::jsonb,
  'visuales', $codia$[
  {
    "tipo": "codia.comparar",
    "despuesDePaso": 0,
    "titulo": "Con positivos los cuatro coinciden",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "print",
          "args": [
            {
              "k": "op",
              "op": "div",
              "a": {
                "k": "n",
                "v": 17
              },
              "b": {
                "k": "n",
                "v": 5
              }
            },
            {
              "k": "op",
              "op": "mod",
              "a": {
                "k": "n",
                "v": 17
              },
              "b": {
                "k": "n",
                "v": 5
              }
            }
          ]
        }
      ]
    }
  },
  {
    "tipo": "codia.comparar",
    "despuesDePaso": 1,
    "titulo": "Con negativos Python se separa de los demás",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "print",
          "args": [
            {
              "k": "op",
              "op": "div",
              "a": {
                "k": "n",
                "v": -7
              },
              "b": {
                "k": "n",
                "v": 2
              }
            },
            {
              "k": "op",
              "op": "mod",
              "a": {
                "k": "n",
                "v": -7
              },
              "b": {
                "k": "n",
                "v": 3
              }
            }
          ]
        }
      ]
    }
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 3,
    "titulo": "El resto como ciclo: 0, 1, 2, 0, 1, 2",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "para",
          "v": "i",
          "desde": {
            "k": "n",
            "v": 0
          },
          "hasta": {
            "k": "n",
            "v": 6
          },
          "cuerpo": [
            {
              "k": "print",
              "args": [
                {
                  "k": "op",
                  "op": "mod",
                  "a": {
                    "k": "v",
                    "n": "i"
                  },
                  "b": {
                    "k": "n",
                    "v": 3
                  }
                }
              ],
              "id": "s2"
            }
          ],
          "id": "s1"
        }
      ]
    },
    "lenguaje": "python"
  }
]$codia$::jsonb)
where slug = 'codia-tecnica-division-entera-modulo' and problem_type = 'codia';

update public.techniques set contenido = contenido || jsonb_build_object(
  'pasos', $codia$[
  "La complejidad temporal dice cómo crece el trabajo cuando crece n (por ejemplo, el largo de una lista). No mide segundos: mide cuántas veces se repite la operación principal.",
  "Regla de un vistazo: sin bucles sobre n es O(1); un bucle sobre n es O(n); dos bucles anidados sobre n son O(n²). Pruébalo contando cuántas veces corre total = total + 1 cuando n se duplica:\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        total = total + 1\n    return total\n\nprint(contar(4), contar(8))\n```\n```salida\n4 8\n```\nCon un bucle, al duplicar n el trabajo se duplica. Con dos anidados:\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        for j in range(n):\n            total = total + 1\n    return total\n\nprint(contar(4), contar(8))\n```\n```salida\n16 64\n```\nDuplicar n multiplicó el trabajo por cuatro: es O(n²).",
  "Bucles en secuencia se suman, no se multiplican: dos bucles de n vueltas, uno después del otro, hacen 2n operaciones, que sigue siendo O(n).\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        total = total + 1\n    for j in range(n):\n        total = total + 1\n    return total\n\nprint(contar(4), contar(8))\n```\n```salida\n8 16\n```",
  "Un bucle interno que siempre da 3 vueltas es una constante: el total es 3n, o sea O(n). Solo cuentan los bucles que dependen de n.\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        for j in range(3):\n            total = total + 1\n    return total\n\nprint(contar(4), contar(8))\n```\n```salida\n12 24\n```"
]$codia$::jsonb,
  'visuales', $codia$[
  {
    "tipo": "codia.traza",
    "despuesDePaso": 1,
    "titulo": "Dos bucles anidados sobre n = 3: nueve vueltas del cuerpo",
    "programa": {
      "funcs": [
        {
          "nombre": "contar",
          "params": [
            {
              "n": "n",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "total",
              "ty": "int",
              "e": {
                "k": "n",
                "v": 0
              },
              "id": "f1"
            },
            {
              "k": "para",
              "v": "i",
              "desde": {
                "k": "n",
                "v": 0
              },
              "hasta": {
                "k": "v",
                "n": "n"
              },
              "cuerpo": [
                {
                  "k": "para",
                  "v": "j",
                  "desde": {
                    "k": "n",
                    "v": 0
                  },
                  "hasta": {
                    "k": "v",
                    "n": "n"
                  },
                  "cuerpo": [
                    {
                      "k": "asig",
                      "n": "total",
                      "e": {
                        "k": "op",
                        "op": "+",
                        "a": {
                          "k": "v",
                          "n": "total"
                        },
                        "b": {
                          "k": "n",
                          "v": 1
                        }
                      },
                      "id": "f4"
                    }
                  ],
                  "id": "f3"
                }
              ],
              "id": "f2"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "total"
              },
              "id": "f5"
            }
          ]
        }
      ],
      "main": [
        {
          "k": "print",
          "args": [
            {
              "k": "call",
              "f": "contar",
              "args": [
                {
                  "k": "n",
                  "v": 3
                }
              ]
            }
          ],
          "id": "m1"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.crecimiento",
    "despuesDePaso": 1,
    "titulo": "Al duplicar n: el trabajo se duplica o se cuadruplica",
    "series": [
      {
        "nombre": "Un bucle sobre n",
        "etiqueta": "O(n)",
        "funcion": {
          "nombre": "contar",
          "params": [
            {
              "n": "n",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "total",
              "ty": "int",
              "e": {
                "k": "n",
                "v": 0
              },
              "id": "c1"
            },
            {
              "k": "para",
              "v": "i",
              "desde": {
                "k": "n",
                "v": 0
              },
              "hasta": {
                "k": "v",
                "n": "n"
              },
              "cuerpo": [
                {
                  "k": "asig",
                  "n": "total",
                  "e": {
                    "k": "op",
                    "op": "+",
                    "a": {
                      "k": "v",
                      "n": "total"
                    },
                    "b": {
                      "k": "n",
                      "v": 1
                    }
                  },
                  "id": "c3"
                }
              ],
              "id": "c2"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "total"
              },
              "id": "c4"
            }
          ]
        }
      },
      {
        "nombre": "Dos bucles anidados",
        "etiqueta": "O(n²)",
        "funcion": {
          "nombre": "contar",
          "params": [
            {
              "n": "n",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "total",
              "ty": "int",
              "e": {
                "k": "n",
                "v": 0
              },
              "id": "c1"
            },
            {
              "k": "para",
              "v": "i",
              "desde": {
                "k": "n",
                "v": 0
              },
              "hasta": {
                "k": "v",
                "n": "n"
              },
              "cuerpo": [
                {
                  "k": "para",
                  "v": "j",
                  "desde": {
                    "k": "n",
                    "v": 0
                  },
                  "hasta": {
                    "k": "v",
                    "n": "n"
                  },
                  "cuerpo": [
                    {
                      "k": "asig",
                      "n": "total",
                      "e": {
                        "k": "op",
                        "op": "+",
                        "a": {
                          "k": "v",
                          "n": "total"
                        },
                        "b": {
                          "k": "n",
                          "v": 1
                        }
                      },
                      "id": "c4"
                    }
                  ],
                  "id": "c3"
                }
              ],
              "id": "c2"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "total"
              },
              "id": "c5"
            }
          ]
        }
      }
    ],
    "ns": [
      4,
      8,
      16
    ]
  },
  {
    "tipo": "codia.crecimiento",
    "despuesDePaso": 3,
    "titulo": "Las cuatro formas del paso a paso, con el mismo n",
    "series": [
      {
        "nombre": "Un bucle sobre n",
        "etiqueta": "O(n)",
        "funcion": {
          "nombre": "contar",
          "params": [
            {
              "n": "n",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "total",
              "ty": "int",
              "e": {
                "k": "n",
                "v": 0
              },
              "id": "c1"
            },
            {
              "k": "para",
              "v": "i",
              "desde": {
                "k": "n",
                "v": 0
              },
              "hasta": {
                "k": "v",
                "n": "n"
              },
              "cuerpo": [
                {
                  "k": "asig",
                  "n": "total",
                  "e": {
                    "k": "op",
                    "op": "+",
                    "a": {
                      "k": "v",
                      "n": "total"
                    },
                    "b": {
                      "k": "n",
                      "v": 1
                    }
                  },
                  "id": "c3"
                }
              ],
              "id": "c2"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "total"
              },
              "id": "c4"
            }
          ]
        }
      },
      {
        "nombre": "Dos bucles anidados",
        "etiqueta": "O(n²)",
        "funcion": {
          "nombre": "contar",
          "params": [
            {
              "n": "n",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "total",
              "ty": "int",
              "e": {
                "k": "n",
                "v": 0
              },
              "id": "c1"
            },
            {
              "k": "para",
              "v": "i",
              "desde": {
                "k": "n",
                "v": 0
              },
              "hasta": {
                "k": "v",
                "n": "n"
              },
              "cuerpo": [
                {
                  "k": "para",
                  "v": "j",
                  "desde": {
                    "k": "n",
                    "v": 0
                  },
                  "hasta": {
                    "k": "v",
                    "n": "n"
                  },
                  "cuerpo": [
                    {
                      "k": "asig",
                      "n": "total",
                      "e": {
                        "k": "op",
                        "op": "+",
                        "a": {
                          "k": "v",
                          "n": "total"
                        },
                        "b": {
                          "k": "n",
                          "v": 1
                        }
                      },
                      "id": "c4"
                    }
                  ],
                  "id": "c3"
                }
              ],
              "id": "c2"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "total"
              },
              "id": "c5"
            }
          ]
        }
      },
      {
        "nombre": "Dos bucles, uno después del otro",
        "etiqueta": "O(n)",
        "funcion": {
          "nombre": "contar",
          "params": [
            {
              "n": "n",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "total",
              "ty": "int",
              "e": {
                "k": "n",
                "v": 0
              },
              "id": "c1"
            },
            {
              "k": "para",
              "v": "i",
              "desde": {
                "k": "n",
                "v": 0
              },
              "hasta": {
                "k": "v",
                "n": "n"
              },
              "cuerpo": [
                {
                  "k": "asig",
                  "n": "total",
                  "e": {
                    "k": "op",
                    "op": "+",
                    "a": {
                      "k": "v",
                      "n": "total"
                    },
                    "b": {
                      "k": "n",
                      "v": 1
                    }
                  },
                  "id": "c3"
                }
              ],
              "id": "c2"
            },
            {
              "k": "para",
              "v": "j",
              "desde": {
                "k": "n",
                "v": 0
              },
              "hasta": {
                "k": "v",
                "n": "n"
              },
              "cuerpo": [
                {
                  "k": "asig",
                  "n": "total",
                  "e": {
                    "k": "op",
                    "op": "+",
                    "a": {
                      "k": "v",
                      "n": "total"
                    },
                    "b": {
                      "k": "n",
                      "v": 1
                    }
                  },
                  "id": "c5"
                }
              ],
              "id": "c4"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "total"
              },
              "id": "c6"
            }
          ]
        }
      },
      {
        "nombre": "Bucle interno de 3 vueltas fijas",
        "etiqueta": "O(n)",
        "funcion": {
          "nombre": "contar",
          "params": [
            {
              "n": "n",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "total",
              "ty": "int",
              "e": {
                "k": "n",
                "v": 0
              },
              "id": "c1"
            },
            {
              "k": "para",
              "v": "i",
              "desde": {
                "k": "n",
                "v": 0
              },
              "hasta": {
                "k": "v",
                "n": "n"
              },
              "cuerpo": [
                {
                  "k": "para",
                  "v": "j",
                  "desde": {
                    "k": "n",
                    "v": 0
                  },
                  "hasta": {
                    "k": "n",
                    "v": 3
                  },
                  "cuerpo": [
                    {
                      "k": "asig",
                      "n": "total",
                      "e": {
                        "k": "op",
                        "op": "+",
                        "a": {
                          "k": "v",
                          "n": "total"
                        },
                        "b": {
                          "k": "n",
                          "v": 1
                        }
                      },
                      "id": "c4"
                    }
                  ],
                  "id": "c3"
                }
              ],
              "id": "c2"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "total"
              },
              "id": "c5"
            }
          ]
        }
      }
    ],
    "ns": [
      4,
      8,
      16
    ]
  }
]$codia$::jsonb)
where slug = 'codia-tecnica-complejidad-vistazo' and problem_type = 'codia';

update public.techniques set contenido = contenido || jsonb_build_object(
  'pasos', $codia$[
  "Una variable es un nombre que apunta a un valor guardado en memoria. Los tipos básicos son el entero (15), el texto (\"Ana\") y el booleano (verdadero o falso). Python y JavaScript deducen el tipo solos; Java y TypeScript te piden declararlo, y por eso detectan más errores antes de correr.",
  "Mismo programa en los cuatro lenguajes. Python:\n```python\nedad = 15\nnombre = \"Ana\"\nmayor = edad >= 18\nprint(nombre, edad, mayor)\n```\n```salida\nAna 15 False\n```\nJava, JavaScript y TypeScript:\n```java\nint edad = 15;\nString nombre = \"Ana\";\nboolean mayor = edad >= 18;\nSystem.out.println(nombre + \" \" + edad + \" \" + mayor);\n```\n```javascript\nlet edad = 15;\nconst nombre = \"Ana\";\nconst mayor = edad >= 18;\nconsole.log(nombre, edad, mayor);\n```\n```typescript\nlet edad: number = 15;\nconst nombre: string = \"Ana\";\nconst mayor: boolean = edad >= 18;\nconsole.log(nombre, edad, mayor);\n```\n```salida\nAna 15 false\n```\nDetalle: Python escribe True y False con mayúscula; los otros tres, true y false.",
  "Un comentario es texto para las personas: el lenguaje lo ignora por completo. Python usa # y Java, JavaScript y TypeScript usan //. Sirve para explicar por qué hay una línea, y también para desactivarla sin borrarla. Los cuatro programas imprimen lo mismo:\n```python\n# Guarda la edad de Ana\nedad = 15\n# Muestra la edad\nprint(edad)\n```\n```java\n// Guarda la edad de Ana\nint edad = 15;\n// Muestra la edad\nSystem.out.println(edad);\n```\n```javascript\n// Guarda la edad de Ana\nconst edad = 15;\n// Muestra la edad\nconsole.log(edad);\n```\n```typescript\n// Guarda la edad de Ana\nconst edad: number = 15;\n// Muestra la edad\nconsole.log(edad);\n```\n```salida\n15\n```\nLos comentarios no aparecen en la salida. Si pones el símbolo del comentario delante de una instrucción, esa línea deja de ejecutarse:\n```python\nedad = 15\n# print(edad)\nprint(\"Listo\")\n```\n```salida\nListo\n```",
  "Java y TypeScript no dejan cambiar el tipo de una variable: asignar un texto a un entero es un error de compilación. Python y JavaScript sí lo permiten.\n```java!\nint x = \"hola\";\n```\n```salida\nerror de compilación\n```\n```typescript!\nlet x: number = \"hola\";\n```\n```salida\nerror de compilación\n```\n```python\nx = 5\nx = \"hola\"\nprint(x)\n```\n```salida\nhola\n```",
  "Asignar es guardar, no comparar: cada línea usa el valor actual y guarda el resultado. Traza este programa con una tabla (puntos: 10, luego 15, luego 30):\n```python\npuntos = 10\npuntos = puntos + 5\npuntos = puntos * 2\nprint(puntos)\n```\n```java\nint puntos = 10;\npuntos = puntos + 5;\npuntos = puntos * 2;\nSystem.out.println(puntos);\n```\n```javascript\nlet puntos = 10;\npuntos = puntos + 5;\npuntos = puntos * 2;\nconsole.log(puntos);\n```\n```typescript\nlet puntos: number = 10;\npuntos = puntos + 5;\npuntos = puntos * 2;\nconsole.log(puntos);\n```\n```salida\n30\n```",
  "Unir texto con números: Java, JavaScript y TypeScript convierten el número solos al usar +; Python exige str().\n```python\nedad = 15\nprint(\"Edad: \" + str(edad))\n```\n```java\nint edad = 15;\nSystem.out.println(\"Edad: \" + edad);\n```\n```javascript\nconst edad = 15;\nconsole.log(\"Edad: \" + edad);\n```\n```typescript\nconst edad: number = 15;\nconsole.log(\"Edad: \" + edad);\n```\n```salida\nEdad: 15\n```\nSin el str(), Python protesta:\n```python!\nprint(\"Edad: \" + 15)\n```\n```salida\nTypeError\n```",
  "El orden importa cuando se mezclan números y texto con +. Java, JavaScript y TypeScript evalúan de izquierda a derecha: en 1 + 2 + \"5\" primero suman los números (3) y después se concatena (\"35\"); en \"1\" + 2 + 3 ya hay un texto desde el principio, así que todo se concatena (\"123\").\n```java\nSystem.out.println(1 + 2 + \"5\");\nSystem.out.println(\"1\" + 2 + 3);\n```\n```javascript\nconsole.log(1 + 2 + \"5\");\nconsole.log(\"1\" + 2 + 3);\n```\n```typescript\nconsole.log(1 + 2 + \"5\");\nconsole.log(\"1\" + 2 + 3);\n```\n```salida\n35\n123\n```\nPython no mezcla números con texto: esas dos líneas dan TypeError. Para obtener el mismo resultado se convierte con str():\n```python\nprint(str(1 + 2) + \"5\")\nprint(\"1\" + str(2) + str(3))\n```\n```salida\n35\n123\n```",
  "Dos operaciones más con textos. El largo de un texto (cuántos caracteres tiene, contando los espacios) se pide con len() en Python, con .length() en Java y con .length en JavaScript y TypeScript:\n```python\nnombre = \"Ana Paz\"\nprint(len(\"Hola\"), len(nombre))\n```\n```java\nString nombre = \"Ana Paz\";\nSystem.out.println(\"Hola\".length() + \" \" + nombre.length());\n```\n```javascript\nconst nombre = \"Ana Paz\";\nconsole.log(\"Hola\".length, nombre.length);\n```\n```typescript\nconst nombre: string = \"Ana Paz\";\nconsole.log(\"Hola\".length, nombre.length);\n```\n```salida\n4 7\n```\nSolo Python permite repetir un texto multiplicándolo por un número: \"ab\" * 3 da \"ababab\". En JavaScript y TypeScript se usa .repeat(3) y en Java esa multiplicación ni compila.\n```python\nr = \"ab\" * 3\nprint(r)\nprint(len(r))\n```\n```javascript\nconst r = \"ab\".repeat(3);\nconsole.log(r);\nconsole.log(r.length);\n```\n```typescript\nconst r: string = \"ab\".repeat(3);\nconsole.log(r);\nconsole.log(r.length);\n```\n```salida\nababab\n6\n```\n```java!\nString r = \"ab\" * 3;\n```\n```salida\nerror de compilación\n```",
  "Ejemplo resuelto: precio de una compra.\n```python\nprecio = 8\ncantidad = 3\ntotal = precio * cantidad\ndescuento = 4\ntotal = total - descuento\nprint(total)\n```\nTabla: precio=8; cantidad=3; total=24 (8 * 3); descuento=4; total=20 (24 - 4). El print muestra 20 y, como cada línea usa el valor actual de la variable, el orden de las líneas importa.\n```salida\n20\n```\nEn los otros tres lenguajes solo cambia la declaración (int, let, let ... : number): la lógica y el resultado son idénticos."
]$codia$::jsonb,
  'visuales', $codia$[
  {
    "tipo": "codia.comparar",
    "despuesDePaso": 1,
    "titulo": "Variables y tipos en los cuatro lenguajes",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "edad",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 15
          }
        },
        {
          "k": "decl",
          "n": "nombre",
          "ty": "str",
          "e": {
            "k": "s",
            "v": "Ana"
          }
        },
        {
          "k": "decl",
          "n": "mayor",
          "ty": "bool",
          "e": {
            "k": "op",
            "op": ">=",
            "a": {
              "k": "v",
              "n": "edad"
            },
            "b": {
              "k": "n",
              "v": 18
            }
          }
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "nombre"
            },
            {
              "k": "v",
              "n": "edad"
            },
            {
              "k": "v",
              "n": "mayor"
            }
          ]
        }
      ]
    }
  },
  {
    "tipo": "codia.comparar",
    "despuesDePaso": 2,
    "titulo": "Comentarios: # en Python, // en los demás",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "com",
          "t": "Guarda la edad de Ana"
        },
        {
          "k": "decl",
          "n": "edad",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 15
          }
        },
        {
          "k": "com",
          "t": "Muestra la edad"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "edad"
            }
          ]
        }
      ]
    }
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 4,
    "titulo": "Asignar es guardar, no comparar",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "puntos",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 10
          },
          "id": "s1"
        },
        {
          "k": "asig",
          "n": "puntos",
          "e": {
            "k": "op",
            "op": "+",
            "a": {
              "k": "v",
              "n": "puntos"
            },
            "b": {
              "k": "n",
              "v": 5
            }
          },
          "id": "s2"
        },
        {
          "k": "asig",
          "n": "puntos",
          "e": {
            "k": "op",
            "op": "*",
            "a": {
              "k": "v",
              "n": "puntos"
            },
            "b": {
              "k": "n",
              "v": 2
            }
          },
          "id": "s3"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "puntos"
            }
          ],
          "id": "s4"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.comparar",
    "despuesDePaso": 6,
    "titulo": "El orden de la suma cuando hay texto",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "print",
          "args": [
            {
              "k": "op",
              "op": "+",
              "a": {
                "k": "op",
                "op": "+",
                "a": {
                  "k": "n",
                  "v": 1
                },
                "b": {
                  "k": "n",
                  "v": 2
                }
              },
              "b": {
                "k": "s",
                "v": "5"
              }
            }
          ]
        },
        {
          "k": "print",
          "args": [
            {
              "k": "op",
              "op": "+",
              "a": {
                "k": "op",
                "op": "+",
                "a": {
                  "k": "s",
                  "v": "1"
                },
                "b": {
                  "k": "n",
                  "v": 2
                }
              },
              "b": {
                "k": "n",
                "v": 3
              }
            }
          ]
        }
      ]
    }
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 7,
    "titulo": "Repetir un texto con * (solo Python)",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "r",
          "ty": "str",
          "e": {
            "k": "op",
            "op": "*",
            "a": {
              "k": "s",
              "v": "ab"
            },
            "b": {
              "k": "n",
              "v": 3
            }
          },
          "id": "s1"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "r"
            }
          ],
          "id": "s2"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "long",
              "a": {
                "k": "v",
                "n": "r"
              },
              "de": "str"
            }
          ],
          "id": "s3"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 8,
    "titulo": "Ejemplo resuelto: el precio de una compra",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "precio",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 8
          },
          "id": "s1"
        },
        {
          "k": "decl",
          "n": "cantidad",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 3
          },
          "id": "s2"
        },
        {
          "k": "decl",
          "n": "total",
          "ty": "int",
          "e": {
            "k": "op",
            "op": "*",
            "a": {
              "k": "v",
              "n": "precio"
            },
            "b": {
              "k": "v",
              "n": "cantidad"
            }
          },
          "id": "s3"
        },
        {
          "k": "decl",
          "n": "descuento",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 4
          },
          "id": "s4"
        },
        {
          "k": "asig",
          "n": "total",
          "e": {
            "k": "op",
            "op": "-",
            "a": {
              "k": "v",
              "n": "total"
            },
            "b": {
              "k": "v",
              "n": "descuento"
            }
          },
          "id": "s5"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "total"
            }
          ],
          "id": "s6"
        }
      ]
    },
    "lenguaje": "python"
  }
]$codia$::jsonb)
where slug = 'codia-clase-01-variables-y-tipos' and problem_type = 'codia';

update public.techniques set contenido = contenido || jsonb_build_object(
  'pasos', $codia$[
  "Un condicional ejecuta un bloque solo si una condición (un booleano) es verdadera. Los comparadores son ==, !=, <, <=, > y >=; para combinar condiciones, Python usa and, or, not y los otros tres lenguajes usan &&, || y !.",
  "Mismo if/else en los cuatro lenguajes (x vale 7): Python usa dos puntos e indentación; los otros usan paréntesis y llaves.\n```python\nx = 7\nif x > 5:\n    print(\"grande\")\nelse:\n    print(\"chico\")\n```\n```java\nint x = 7;\nif (x > 5) {\n    System.out.println(\"grande\");\n} else {\n    System.out.println(\"chico\");\n}\n```\n```javascript\nlet x = 7;\nif (x > 5) {\n    console.log(\"grande\");\n} else {\n    console.log(\"chico\");\n}\n```\n```typescript\nlet x: number = 7;\nif (x > 5) {\n    console.log(\"grande\");\n} else {\n    console.log(\"chico\");\n}\n```\n```salida\ngrande\n```",
  "Varias ramas: se evalúan en orden y gana la PRIMERA condición verdadera (elif en Python, else if en los demás). Con nota = 72:\n```python\nnota = 72\nif nota >= 90:\n    print(\"A\")\nelif nota >= 70:\n    print(\"B\")\nelse:\n    print(\"C\")\n```\n```java\nint nota = 72;\nif (nota >= 90) {\n    System.out.println(\"A\");\n} else if (nota >= 70) {\n    System.out.println(\"B\");\n} else {\n    System.out.println(\"C\");\n}\n```\n```javascript\nlet nota = 72;\nif (nota >= 90) {\n    console.log(\"A\");\n} else if (nota >= 70) {\n    console.log(\"B\");\n} else {\n    console.log(\"C\");\n}\n```\n```typescript\nlet nota: number = 72;\nif (nota >= 90) {\n    console.log(\"A\");\n} else if (nota >= 70) {\n    console.log(\"B\");\n} else {\n    console.log(\"C\");\n}\n```\n```salida\nB\n```\n72 no llega a 90, sí llega a 70: imprime B y las ramas de abajo ni se miran.",
  "Condiciones combinadas: los dos lados de un and (&&) deben ser verdaderos; con or (||) alcanza uno. Edad 15:\n```python\nedad = 15\nif edad >= 12 and edad <= 17:\n    print(\"adolescente\")\n```\n```java\nint edad = 15;\nif (edad >= 12 && edad <= 17) {\n    System.out.println(\"adolescente\");\n}\n```\n```javascript\nlet edad = 15;\nif (edad >= 12 && edad <= 17) {\n    console.log(\"adolescente\");\n}\n```\n```typescript\nlet edad: number = 15;\nif (edad >= 12 && edad <= 17) {\n    console.log(\"adolescente\");\n}\n```\n```salida\nadolescente\n```",
  "La trampa de = contra ==: un solo signo = ASIGNA, dos COMPARAN. Python y Java lo detectan y frenan el programa:\n```python!\nx = 5\nif x = 5:\n    print(\"cinco\")\n```\n```salida\nSyntaxError\n```\n```java!\nint x = 5;\nif (x = 5) {\n    System.out.println(\"cinco\");\n}\n```\n```salida\nerror de compilación\n```\nEn JavaScript hay un detalle más: == convierte tipos y === no. Por eso se recomienda ===.\n```javascript\nconsole.log(\"5\" == 5);\nconsole.log(\"5\" === 5);\n```\n```salida\ntrue\nfalse\n```",
  "Ejemplo resuelto: qué estado imprime.\n```python\ntemp = 24\nif temp > 30:\n    estado = \"calor\"\nelif temp > 20:\n    estado = \"templado\"\nelse:\n    estado = \"frio\"\nprint(estado)\n```\nTraza: 24 > 30 es falso, se salta esa rama; 24 > 20 es verdadero, estado = \"templado\" y no se mira el else.\n```salida\ntemplado\n```"
]$codia$::jsonb,
  'visuales', $codia$[
  {
    "tipo": "codia.flujo",
    "despuesDePaso": 1,
    "titulo": "if / else con x = 7",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "x",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 7
          },
          "id": "s1"
        },
        {
          "k": "si",
          "cond": {
            "k": "op",
            "op": ">",
            "a": {
              "k": "v",
              "n": "x"
            },
            "b": {
              "k": "n",
              "v": 5
            }
          },
          "entonces": [
            {
              "k": "print",
              "args": [
                {
                  "k": "s",
                  "v": "grande"
                }
              ],
              "id": "s3"
            }
          ],
          "sino": [
            {
              "k": "print",
              "args": [
                {
                  "k": "s",
                  "v": "chico"
                }
              ],
              "id": "s4"
            }
          ],
          "id": "s2"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.flujo",
    "despuesDePaso": 2,
    "titulo": "Varias ramas: gana la primera condición verdadera",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "nota",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 72
          },
          "id": "s1"
        },
        {
          "k": "si",
          "cond": {
            "k": "op",
            "op": ">=",
            "a": {
              "k": "v",
              "n": "nota"
            },
            "b": {
              "k": "n",
              "v": 90
            }
          },
          "entonces": [
            {
              "k": "print",
              "args": [
                {
                  "k": "s",
                  "v": "A"
                }
              ],
              "id": "s3"
            }
          ],
          "sino": [
            {
              "k": "si",
              "cond": {
                "k": "op",
                "op": ">=",
                "a": {
                  "k": "v",
                  "n": "nota"
                },
                "b": {
                  "k": "n",
                  "v": 70
                }
              },
              "entonces": [
                {
                  "k": "print",
                  "args": [
                    {
                      "k": "s",
                      "v": "B"
                    }
                  ],
                  "id": "s5"
                }
              ],
              "sino": [
                {
                  "k": "print",
                  "args": [
                    {
                      "k": "s",
                      "v": "C"
                    }
                  ],
                  "id": "s6"
                }
              ],
              "id": "s4"
            }
          ],
          "id": "s2"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 2,
    "titulo": "Las ramas de abajo ni se miran",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "nota",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 72
          },
          "id": "s1"
        },
        {
          "k": "si",
          "cond": {
            "k": "op",
            "op": ">=",
            "a": {
              "k": "v",
              "n": "nota"
            },
            "b": {
              "k": "n",
              "v": 90
            }
          },
          "entonces": [
            {
              "k": "print",
              "args": [
                {
                  "k": "s",
                  "v": "A"
                }
              ],
              "id": "s3"
            }
          ],
          "sino": [
            {
              "k": "si",
              "cond": {
                "k": "op",
                "op": ">=",
                "a": {
                  "k": "v",
                  "n": "nota"
                },
                "b": {
                  "k": "n",
                  "v": 70
                }
              },
              "entonces": [
                {
                  "k": "print",
                  "args": [
                    {
                      "k": "s",
                      "v": "B"
                    }
                  ],
                  "id": "s5"
                }
              ],
              "sino": [
                {
                  "k": "print",
                  "args": [
                    {
                      "k": "s",
                      "v": "C"
                    }
                  ],
                  "id": "s6"
                }
              ],
              "id": "s4"
            }
          ],
          "id": "s2"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.comparar",
    "despuesDePaso": 3,
    "titulo": "Condiciones combinadas: and o &&",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "edad",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 15
          }
        },
        {
          "k": "si",
          "cond": {
            "k": "op",
            "op": "y",
            "a": {
              "k": "op",
              "op": ">=",
              "a": {
                "k": "v",
                "n": "edad"
              },
              "b": {
                "k": "n",
                "v": 12
              }
            },
            "b": {
              "k": "op",
              "op": "<=",
              "a": {
                "k": "v",
                "n": "edad"
              },
              "b": {
                "k": "n",
                "v": 17
              }
            }
          },
          "entonces": [
            {
              "k": "print",
              "args": [
                {
                  "k": "s",
                  "v": "adolescente"
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    "tipo": "codia.flujo",
    "despuesDePaso": 5,
    "titulo": "Ejemplo resuelto: qué estado imprime",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "temp",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 24
          },
          "id": "s1"
        },
        {
          "k": "decl",
          "n": "estado",
          "ty": "str",
          "e": {
            "k": "s",
            "v": ""
          },
          "id": "s2"
        },
        {
          "k": "si",
          "cond": {
            "k": "op",
            "op": ">",
            "a": {
              "k": "v",
              "n": "temp"
            },
            "b": {
              "k": "n",
              "v": 30
            }
          },
          "entonces": [
            {
              "k": "asig",
              "n": "estado",
              "e": {
                "k": "s",
                "v": "calor"
              },
              "id": "s4"
            }
          ],
          "sino": [
            {
              "k": "si",
              "cond": {
                "k": "op",
                "op": ">",
                "a": {
                  "k": "v",
                  "n": "temp"
                },
                "b": {
                  "k": "n",
                  "v": 20
                }
              },
              "entonces": [
                {
                  "k": "asig",
                  "n": "estado",
                  "e": {
                    "k": "s",
                    "v": "templado"
                  },
                  "id": "s6"
                }
              ],
              "sino": [
                {
                  "k": "asig",
                  "n": "estado",
                  "e": {
                    "k": "s",
                    "v": "frio"
                  },
                  "id": "s7"
                }
              ],
              "id": "s5"
            }
          ],
          "id": "s3"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "estado"
            }
          ],
          "id": "s8"
        }
      ]
    },
    "lenguaje": "python"
  }
]$codia$::jsonb)
where slug = 'codia-clase-02-condicionales' and problem_type = 'codia';

update public.techniques set contenido = contenido || jsonb_build_object(
  'pasos', $codia$[
  "Un bucle repite un bloque. Usa for cuando sabes cuántas vueltas hay (recorrer un rango o una lista) y while cuando repites hasta que algo cambie. En los dos casos haz las tres preguntas: dónde arranca, cuándo termina, qué cambia por vuelta.",
  "for de 0 a 2 en los cuatro lenguajes (el límite superior no se incluye):\n```python\nfor i in range(3):\n    print(i)\n```\n```java\nfor (int i = 0; i < 3; i++) {\n    System.out.println(i);\n}\n```\n```javascript\nfor (let i = 0; i < 3; i++) {\n    console.log(i);\n}\n```\n```typescript\nfor (let i = 0; i < 3; i++) {\n    console.log(i);\n}\n```\n```salida\n0\n1\n2\n```",
  "Acumulador: una variable que junta el resultado. Suma de 1 a 5:\n```python\ntotal = 0\nfor i in range(1, 6):\n    total = total + i\nprint(total)\n```\n```java\nint total = 0;\nfor (int i = 1; i <= 5; i++) {\n    total = total + i;\n}\nSystem.out.println(total);\n```\n```javascript\nlet total = 0;\nfor (let i = 1; i <= 5; i++) {\n    total = total + i;\n}\nconsole.log(total);\n```\n```typescript\nlet total: number = 0;\nfor (let i = 1; i <= 5; i++) {\n    total = total + i;\n}\nconsole.log(total);\n```\n```salida\n15\n```\nFíjate que range(1, 6) equivale a i <= 5: las dos formas llegan hasta 5.",
  "Cuando una variable se actualiza usando su propio valor (total = total + i) existe una forma corta: total += i. También hay -= y *=. Es solo una abreviatura: hace exactamente lo mismo. Suma y producto de los números de 1 a 4:\n```python\nsuma = 0\nproducto = 1\nfor i in range(1, 5):\n    suma += i\n    producto *= i\nprint(suma, producto)\n```\n```java\nint suma = 0;\nint producto = 1;\nfor (int i = 1; i < 5; i++) {\n    suma += i;\n    producto *= i;\n}\nSystem.out.println(suma + \" \" + producto);\n```\n```javascript\nlet suma = 0;\nlet producto = 1;\nfor (let i = 1; i < 5; i++) {\n    suma += i;\n    producto *= i;\n}\nconsole.log(suma, producto);\n```\n```typescript\nlet suma: number = 0;\nlet producto: number = 1;\nfor (let i = 1; i < 5; i++) {\n    suma += i;\n    producto *= i;\n}\nconsole.log(suma, producto);\n```\n```salida\n10 24\n```\nVuelta a vuelta: suma va 1, 3, 6, 10 y producto va 1, 2, 6, 24.",
  "while: cuenta regresiva. La condición se revisa ANTES de cada vuelta y algo adentro tiene que acercarla a falsa; si no, el bucle no termina nunca.\n```python\nn = 3\nwhile n > 0:\n    print(n)\n    n = n - 1\n```\n```java\nint n = 3;\nwhile (n > 0) {\n    System.out.println(n);\n    n = n - 1;\n}\n```\n```javascript\nlet n = 3;\nwhile (n > 0) {\n    console.log(n);\n    n = n - 1;\n}\n```\n```typescript\nlet n: number = 3;\nwhile (n > 0) {\n    console.log(n);\n    n = n - 1;\n}\n```\n```salida\n3\n2\n1\n```",
  "break corta el bucle apenas se cumple algo. Primer múltiplo de 4 desde 10:\n```python\nfor i in range(10, 30):\n    if i % 4 == 0:\n        print(i)\n        break\n```\n```java\nfor (int i = 10; i < 30; i++) {\n    if (i % 4 == 0) {\n        System.out.println(i);\n        break;\n    }\n}\n```\n```javascript\nfor (let i = 10; i < 30; i++) {\n    if (i % 4 == 0) {\n        console.log(i);\n        break;\n    }\n}\n```\n```typescript\nfor (let i = 10; i < 30; i++) {\n    if (i % 4 === 0) {\n        console.log(i);\n        break;\n    }\n}\n```\n```salida\n12\n```\nPrueba 10 (resto 2), 11 (resto 3), 12 (resto 0): imprime 12 y sale.",
  "Ejemplo resuelto con tabla: suma de cuadrados.\n```python\ntotal = 0\nfor i in range(1, 4):\n    total = total + i * i\nprint(total)\n```\nVuelta 1: i=1, total = 0 + 1 = 1. Vuelta 2: i=2, total = 1 + 4 = 5. Vuelta 3: i=3, total = 5 + 9 = 14. Termina porque range(1, 4) no incluye el 4.\n```salida\n14\n```",
  "Otro ejemplo clásico: el factorial de n es 1 * 2 * ... * n (el de 5 es 120). Un for con un acumulador que se multiplica lo calcula, dentro de una función:\n```python\ndef factorial(n):\n    r = 1\n    for i in range(2, n + 1):\n        r *= i\n    return r\n\nprint(factorial(5))\n```\n```java\nstatic int factorial(int n) {\n    int r = 1;\n    for (int i = 2; i < n + 1; i++) {\n        r *= i;\n    }\n    return r;\n}\n\nSystem.out.println(factorial(5));\n```\n```javascript\nfunction factorial(n) {\n    let r = 1;\n    for (let i = 2; i < n + 1; i++) {\n        r *= i;\n    }\n    return r;\n}\n\nconsole.log(factorial(5));\n```\n```typescript\nfunction factorial(n: number): number {\n    let r: number = 1;\n    for (let i = 2; i < n + 1; i++) {\n        r *= i;\n    }\n    return r;\n}\n\nconsole.log(factorial(5));\n```\n```salida\n120\n```\nTabla: r empieza en 1 y con i = 2, 3, 4, 5 pasa a 2, 6, 24, 120. El for arranca en 2 porque multiplicar por 1 no cambia nada, y el límite es n + 1 porque el límite superior no se incluye.",
  "El error más común: una vuelta de más o de menos. range(1, 5) llega hasta 4, no hasta 5:\n```python\ntotal = 0\nfor i in range(1, 5):\n    total = total + i\nprint(total)\n```\n```salida\n10\n```\nSi querías sumar de 1 a 5 (15) tenías que escribir range(1, 6). En Java, JavaScript y TypeScript el equivalente es escribir i < 5 cuando necesitabas i <= 5."
]$codia$::jsonb,
  'visuales', $codia$[
  {
    "tipo": "codia.comparar",
    "despuesDePaso": 1,
    "titulo": "El mismo for en los cuatro lenguajes",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "para",
          "v": "i",
          "desde": {
            "k": "n",
            "v": 0
          },
          "hasta": {
            "k": "n",
            "v": 3
          },
          "cuerpo": [
            {
              "k": "print",
              "args": [
                {
                  "k": "v",
                  "n": "i"
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 2,
    "titulo": "Un acumulador que suma de 1 a 5",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "total",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 0
          },
          "id": "s1"
        },
        {
          "k": "para",
          "v": "i",
          "desde": {
            "k": "n",
            "v": 1
          },
          "hasta": {
            "k": "n",
            "v": 6
          },
          "cuerpo": [
            {
              "k": "asig",
              "n": "total",
              "e": {
                "k": "op",
                "op": "+",
                "a": {
                  "k": "v",
                  "n": "total"
                },
                "b": {
                  "k": "v",
                  "n": "i"
                }
              },
              "id": "s3"
            }
          ],
          "id": "s2"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "total"
            }
          ],
          "id": "s4"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 3,
    "titulo": "Suma y producto con += y *=",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "suma",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 0
          },
          "id": "s1"
        },
        {
          "k": "decl",
          "n": "producto",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 1
          },
          "id": "s2"
        },
        {
          "k": "para",
          "v": "i",
          "desde": {
            "k": "n",
            "v": 1
          },
          "hasta": {
            "k": "n",
            "v": 5
          },
          "cuerpo": [
            {
              "k": "asig",
              "n": "suma",
              "e": {
                "k": "v",
                "n": "i"
              },
              "aug": "+",
              "id": "s4"
            },
            {
              "k": "asig",
              "n": "producto",
              "e": {
                "k": "v",
                "n": "i"
              },
              "aug": "*",
              "id": "s5"
            }
          ],
          "id": "s3"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "suma"
            },
            {
              "k": "v",
              "n": "producto"
            }
          ],
          "id": "s6"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.flujo",
    "despuesDePaso": 4,
    "titulo": "El while: la condición se revisa antes de cada vuelta",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "n",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 3
          },
          "id": "s1"
        },
        {
          "k": "mientras",
          "cond": {
            "k": "op",
            "op": ">",
            "a": {
              "k": "v",
              "n": "n"
            },
            "b": {
              "k": "n",
              "v": 0
            }
          },
          "cuerpo": [
            {
              "k": "print",
              "args": [
                {
                  "k": "v",
                  "n": "n"
                }
              ],
              "id": "s3"
            },
            {
              "k": "asig",
              "n": "n",
              "e": {
                "k": "op",
                "op": "-",
                "a": {
                  "k": "v",
                  "n": "n"
                },
                "b": {
                  "k": "n",
                  "v": 1
                }
              },
              "id": "s4"
            }
          ],
          "id": "s2"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 5,
    "titulo": "break corta el bucle apenas se cumple algo",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "para",
          "v": "i",
          "desde": {
            "k": "n",
            "v": 10
          },
          "hasta": {
            "k": "n",
            "v": 30
          },
          "cuerpo": [
            {
              "k": "si",
              "cond": {
                "k": "op",
                "op": "==",
                "a": {
                  "k": "op",
                  "op": "mod",
                  "a": {
                    "k": "v",
                    "n": "i"
                  },
                  "b": {
                    "k": "n",
                    "v": 4
                  }
                },
                "b": {
                  "k": "n",
                  "v": 0
                }
              },
              "entonces": [
                {
                  "k": "print",
                  "args": [
                    {
                      "k": "v",
                      "n": "i"
                    }
                  ],
                  "id": "s3"
                },
                {
                  "k": "romper",
                  "id": "s4"
                }
              ],
              "id": "s2"
            }
          ],
          "id": "s1"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 6,
    "titulo": "Ejemplo resuelto: suma de cuadrados",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "total",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 0
          },
          "id": "s1"
        },
        {
          "k": "para",
          "v": "i",
          "desde": {
            "k": "n",
            "v": 1
          },
          "hasta": {
            "k": "n",
            "v": 4
          },
          "cuerpo": [
            {
              "k": "asig",
              "n": "total",
              "e": {
                "k": "op",
                "op": "+",
                "a": {
                  "k": "v",
                  "n": "total"
                },
                "b": {
                  "k": "op",
                  "op": "*",
                  "a": {
                    "k": "v",
                    "n": "i"
                  },
                  "b": {
                    "k": "v",
                    "n": "i"
                  }
                }
              },
              "id": "s3"
            }
          ],
          "id": "s2"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "total"
            }
          ],
          "id": "s4"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 7,
    "titulo": "Factorial de 5 con un for",
    "programa": {
      "funcs": [
        {
          "nombre": "factorial",
          "params": [
            {
              "n": "n",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "r",
              "ty": "int",
              "e": {
                "k": "n",
                "v": 1
              },
              "id": "f1"
            },
            {
              "k": "para",
              "v": "i",
              "desde": {
                "k": "n",
                "v": 2
              },
              "hasta": {
                "k": "op",
                "op": "+",
                "a": {
                  "k": "v",
                  "n": "n"
                },
                "b": {
                  "k": "n",
                  "v": 1
                }
              },
              "cuerpo": [
                {
                  "k": "asig",
                  "n": "r",
                  "e": {
                    "k": "v",
                    "n": "i"
                  },
                  "aug": "*",
                  "id": "f3"
                }
              ],
              "id": "f2"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "r"
              },
              "id": "f4"
            }
          ]
        }
      ],
      "main": [
        {
          "k": "print",
          "args": [
            {
              "k": "call",
              "f": "factorial",
              "args": [
                {
                  "k": "n",
                  "v": 5
                }
              ]
            }
          ],
          "id": "m1"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 8,
    "titulo": "Una vuelta de menos: range(1, 5) llega hasta 4",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "total",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 0
          },
          "id": "s1"
        },
        {
          "k": "para",
          "v": "i",
          "desde": {
            "k": "n",
            "v": 1
          },
          "hasta": {
            "k": "n",
            "v": 5
          },
          "cuerpo": [
            {
              "k": "asig",
              "n": "total",
              "e": {
                "k": "op",
                "op": "+",
                "a": {
                  "k": "v",
                  "n": "total"
                },
                "b": {
                  "k": "v",
                  "n": "i"
                }
              },
              "id": "s3"
            }
          ],
          "id": "s2"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "total"
            }
          ],
          "id": "s4"
        }
      ]
    },
    "lenguaje": "python"
  }
]$codia$::jsonb)
where slug = 'codia-clase-03-bucles' and problem_type = 'codia';

update public.techniques set contenido = contenido || jsonb_build_object(
  'pasos', $codia$[
  "Una función agrupa código bajo un nombre. Recibe parámetros (los datos de entrada) y con return devuelve un resultado a quien la llamó. Reutilizas la lógica sin copiarla y puedes probarla con distintos valores.",
  "Una función que duplica un número, en los cuatro lenguajes:\n```python\ndef doble(x):\n    return x * 2\n\nprint(doble(4))\n```\n```java\nstatic int doble(int x) {\n    return x * 2;\n}\n\nSystem.out.println(doble(4));\n```\n```javascript\nfunction doble(x) {\n    return x * 2;\n}\n\nconsole.log(doble(4));\n```\n```typescript\nfunction doble(x: number): number {\n    return x * 2;\n}\n\nconsole.log(doble(4));\n```\n```salida\n8\n```\nEn Java y TypeScript los parámetros y lo que devuelve llevan tipo (int, number).",
  "Imprimir no es devolver: print muestra algo en pantalla; return entrega un valor. Una función sin return devuelve nada (None en Python, undefined en JavaScript):\n```python\ndef saludar(n):\n    print(\"Hola\", n)\n\nr = saludar(\"Ana\")\nprint(r)\n```\n```salida\nHola Ana\nNone\n```\n```javascript\nfunction saludar(n) {\n    console.log(\"Hola\", n);\n}\n\nconst r = saludar(\"Ana\");\nconsole.log(r);\n```\n```salida\nHola Ana\nundefined\n```\nEn Java, un método void ni siquiera permite guardar su resultado:\n```java!\nstatic void saludar(String n) {\n    System.out.println(\"Hola \" + n);\n}\n\nint r = saludar(\"Ana\");\n```\n```salida\nerror de compilación\n```",
  "Alcance: una variable creada dentro de una función solo existe ahí adentro.\n```python!\ndef f():\n    x = 5\n\nf()\nprint(x)\n```\n```salida\nNameError\n```\n```javascript!\nfunction f() {\n    let x = 5;\n}\n\nf();\nconsole.log(x);\n```\n```salida\nReferenceError\n```\n```java!\nstatic void f() {\n    int x = 5;\n}\n\nf();\nSystem.out.println(x);\n```\n```salida\nerror de compilación\n```\n```typescript!\nfunction f(): void {\n    let x: number = 5;\n}\n\nf();\nconsole.log(x);\n```\n```salida\nerror de compilación\n```",
  "Una función con condicional: devuelve el mayor de dos números. Fíjate que hay un return en cada camino.\n```python\ndef mayor(a, b):\n    if a > b:\n        return a\n    return b\n\nprint(mayor(3, 9))\n```\n```java\nstatic int mayor(int a, int b) {\n    if (a > b) {\n        return a;\n    }\n    return b;\n}\n\nSystem.out.println(mayor(3, 9));\n```\n```javascript\nfunction mayor(a, b) {\n    if (a > b) {\n        return a;\n    }\n    return b;\n}\n\nconsole.log(mayor(3, 9));\n```\n```typescript\nfunction mayor(a: number, b: number): number {\n    if (a > b) {\n        return a;\n    }\n    return b;\n}\n\nconsole.log(mayor(3, 9));\n```\n```salida\n9\n```",
  "Ejemplo resuelto: llamadas anidadas. Se evalúa de adentro hacia afuera.\n```python\ndef doble(x):\n    return x * 2\n\ndef triple(x):\n    return x * 3\n\nprint(triple(doble(2)))\n```\nPaso 1: doble(2) devuelve 4. Paso 2: triple(4) devuelve 12. Recién entonces print muestra el valor.\n```salida\n12\n```\nEn los otros tres lenguajes la lectura es exactamente la misma: primero el paréntesis de más adentro."
]$codia$::jsonb,
  'visuales', $codia$[
  {
    "tipo": "codia.comparar",
    "despuesDePaso": 1,
    "titulo": "Una función que duplica, en los cuatro lenguajes",
    "programa": {
      "funcs": [
        {
          "nombre": "doble",
          "params": [
            {
              "n": "x",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "retorna",
              "e": {
                "k": "op",
                "op": "*",
                "a": {
                  "k": "v",
                  "n": "x"
                },
                "b": {
                  "k": "n",
                  "v": 2
                }
              }
            }
          ]
        }
      ],
      "main": [
        {
          "k": "print",
          "args": [
            {
              "k": "call",
              "f": "doble",
              "args": [
                {
                  "k": "n",
                  "v": 4
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 4,
    "titulo": "Una función con un return en cada camino",
    "programa": {
      "funcs": [
        {
          "nombre": "mayor",
          "params": [
            {
              "n": "a",
              "ty": "int"
            },
            {
              "n": "b",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "si",
              "cond": {
                "k": "op",
                "op": ">",
                "a": {
                  "k": "v",
                  "n": "a"
                },
                "b": {
                  "k": "v",
                  "n": "b"
                }
              },
              "entonces": [
                {
                  "k": "retorna",
                  "e": {
                    "k": "v",
                    "n": "a"
                  },
                  "id": "g2"
                }
              ],
              "id": "g1"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "b"
              },
              "id": "g3"
            }
          ]
        }
      ],
      "main": [
        {
          "k": "print",
          "args": [
            {
              "k": "call",
              "f": "mayor",
              "args": [
                {
                  "k": "n",
                  "v": 3
                },
                {
                  "k": "n",
                  "v": 9
                }
              ]
            }
          ],
          "id": "m1"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 5,
    "titulo": "Llamadas anidadas: de adentro hacia afuera",
    "programa": {
      "funcs": [
        {
          "nombre": "doble",
          "params": [
            {
              "n": "x",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "resultado",
              "ty": "int",
              "e": {
                "k": "op",
                "op": "*",
                "a": {
                  "k": "v",
                  "n": "x"
                },
                "b": {
                  "k": "n",
                  "v": 2
                }
              },
              "id": "d1"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "resultado"
              },
              "id": "d2"
            }
          ]
        },
        {
          "nombre": "triple",
          "params": [
            {
              "n": "x",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "resultado",
              "ty": "int",
              "e": {
                "k": "op",
                "op": "*",
                "a": {
                  "k": "v",
                  "n": "x"
                },
                "b": {
                  "k": "n",
                  "v": 3
                }
              },
              "id": "t1"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "resultado"
              },
              "id": "t2"
            }
          ]
        }
      ],
      "main": [
        {
          "k": "print",
          "args": [
            {
              "k": "call",
              "f": "triple",
              "args": [
                {
                  "k": "call",
                  "f": "doble",
                  "args": [
                    {
                      "k": "n",
                      "v": 2
                    }
                  ]
                }
              ]
            }
          ],
          "id": "m1"
        }
      ]
    },
    "lenguaje": "python"
  }
]$codia$::jsonb)
where slug = 'codia-clase-04-funciones' and problem_type = 'codia';

update public.techniques set contenido = contenido || jsonb_build_object(
  'pasos', $codia$[
  "Una lista (arreglo) guarda varios valores en orden y se accede por posición, empezando en 0. Un diccionario (mapa) guarda pares clave-valor y se accede por clave: la clave identifica al valor, no su posición.",
  "Crear una lista, leer un elemento y ver cuántos tiene:\n```python\nnums = [4, 8, 15]\nprint(nums[0], len(nums))\n```\n```java\nint[] nums = {4, 8, 15};\nSystem.out.println(nums[0] + \" \" + nums.length);\n```\n```javascript\nconst nums = [4, 8, 15];\nconsole.log(nums[0], nums.length);\n```\n```typescript\nconst nums: number[] = [4, 8, 15];\nconsole.log(nums[0], nums.length);\n```\n```salida\n4 3\n```",
  "Un arreglo fijo (int[] en Java) no crece. Cuando no sabes cuántos datos habrá, usa una lista dinámica: se agrega al final con append en Python, con add en Java (ArrayList) y con push en JavaScript y TypeScript. Leer por posición y pedir el tamaño funciona igual que antes:\n```python\nlista = []\nlista.append(4)\nlista.append(8)\nlista.append(15)\nprint(lista[1], len(lista), lista[len(lista) - 1])\n```\n```java\nimport java.util.*;\n\nList<Integer> lista = new ArrayList<>();\nlista.add(4);\nlista.add(8);\nlista.add(15);\nSystem.out.println(lista.get(1) + \" \" + lista.size() + \" \" + lista.get(lista.size() - 1));\n```\n```javascript\nconst lista = [];\nlista.push(4);\nlista.push(8);\nlista.push(15);\nconsole.log(lista[1], lista.length, lista[lista.length - 1]);\n```\n```typescript\nconst lista: number[] = [];\nlista.push(4);\nlista.push(8);\nlista.push(15);\nconsole.log(lista[1], lista.length, lista[lista.length - 1]);\n```\n```salida\n8 3 15\n```\nLa lista quedó [4, 8, 15]: la posición 1 es el 8, el tamaño es 3 y el último elemento está en la posición tamaño - 1 (la 2), porque las posiciones empiezan en 0.",
  "Recorrer y acumular: suma de todos los elementos.\n```python\nnums = [4, 8, 15]\nsuma = 0\nfor x in nums:\n    suma = suma + x\nprint(suma)\n```\n```java\nint[] nums = {4, 8, 15};\nint suma = 0;\nfor (int x : nums) {\n    suma = suma + x;\n}\nSystem.out.println(suma);\n```\n```javascript\nconst nums = [4, 8, 15];\nlet suma = 0;\nfor (const x of nums) {\n    suma = suma + x;\n}\nconsole.log(suma);\n```\n```typescript\nconst nums: number[] = [4, 8, 15];\nlet suma: number = 0;\nfor (const x of nums) {\n    suma = suma + x;\n}\nconsole.log(suma);\n```\n```salida\n27\n```",
  "Máximo de una lista: guarda el primer elemento como el mayor visto hasta ahora y recorre comparando; si aparece uno más grande, lo reemplaza.\n```python\ndatos = [7, 3, 9, 4]\nmayor = datos[0]\nfor x in datos:\n    if x > mayor:\n        mayor = x\nprint(mayor)\n```\n```java\nint[] datos = {7, 3, 9, 4};\nint mayor = datos[0];\nfor (int x : datos) {\n    if (x > mayor) {\n        mayor = x;\n    }\n}\nSystem.out.println(mayor);\n```\n```javascript\nconst datos = [7, 3, 9, 4];\nlet mayor = datos[0];\nfor (const x of datos) {\n    if (x > mayor) {\n        mayor = x;\n    }\n}\nconsole.log(mayor);\n```\n```typescript\nconst datos: number[] = [7, 3, 9, 4];\nlet mayor: number = datos[0];\nfor (const x of datos) {\n    if (x > mayor) {\n        mayor = x;\n    }\n}\nconsole.log(mayor);\n```\n```salida\n9\n```\nTabla: mayor empieza en 7; con x = 3 no cambia; con x = 9 pasa a 9; con x = 4 no cambia. Empezar con el primer elemento (y no con 0) hace que también funcione con números negativos.",
  "Índice fuera de rango: con 3 elementos las posiciones son 0, 1 y 2. Pedir la 3 rompe Python y Java...\n```python!\nnums = [4, 8, 15]\nprint(nums[3])\n```\n```salida\nIndexError\n```\n```java!\nint[] nums = {4, 8, 15};\nSystem.out.println(nums[3]);\n```\n```salida\nArrayIndexOutOfBoundsException\n```\n...pero JavaScript no falla: devuelve undefined, y ese valor puede colarse en cálculos después.\n```javascript\nconst nums = [4, 8, 15];\nconsole.log(nums[3]);\n```\n```salida\nundefined\n```",
  "Diccionario (mapa): guardar edades por nombre. Asignar a una clave que ya existe la sobrescribe.\n```python\nedades = {\"ana\": 15, \"luis\": 17}\nedades[\"ana\"] = 16\nprint(edades[\"ana\"], len(edades))\n```\n```java\nimport java.util.*;\n\nMap<String, Integer> edades = new HashMap<>();\nedades.put(\"ana\", 15);\nedades.put(\"luis\", 17);\nedades.put(\"ana\", 16);\nSystem.out.println(edades.get(\"ana\") + \" \" + edades.size());\n```\n```javascript\nconst edades = new Map();\nedades.set(\"ana\", 15);\nedades.set(\"luis\", 17);\nedades.set(\"ana\", 16);\nconsole.log(edades.get(\"ana\"), edades.size);\n```\n```typescript\nconst edades = new Map<string, number>();\nedades.set(\"ana\", 15);\nedades.set(\"luis\", 17);\nedades.set(\"ana\", 16);\nconsole.log(edades.get(\"ana\"), edades.size);\n```\n```salida\n16 2\n```\nHay dos claves (ana y luis): la segunda asignación a ana no agregó una entrada, cambió su valor.",
  "Ejemplo resuelto: contar cuántas veces aparece cada número con un diccionario. Traza con datos = 1, 2, 1, 3, 1: el conteo va {1:1}, {1:1, 2:1}, {1:2, 2:1}, {1:2, 2:1, 3:1}, {1:3, 2:1, 3:1}.\n```python\ndatos = [1, 2, 1, 3, 1]\nconteo = {}\nfor x in datos:\n    if x in conteo:\n        conteo[x] = conteo[x] + 1\n    else:\n        conteo[x] = 1\nprint(conteo[1], len(conteo))\n```\n```java\nimport java.util.*;\n\nint[] datos = {1, 2, 1, 3, 1};\nMap<Integer, Integer> conteo = new HashMap<>();\nfor (int x : datos) {\n    if (conteo.containsKey(x)) {\n        conteo.put(x, conteo.get(x) + 1);\n    } else {\n        conteo.put(x, 1);\n    }\n}\nSystem.out.println(conteo.get(1) + \" \" + conteo.size());\n```\n```javascript\nconst datos = [1, 2, 1, 3, 1];\nconst conteo = new Map();\nfor (const x of datos) {\n    if (conteo.has(x)) {\n        conteo.set(x, conteo.get(x) + 1);\n    } else {\n        conteo.set(x, 1);\n    }\n}\nconsole.log(conteo.get(1), conteo.size);\n```\n```typescript\nconst datos: number[] = [1, 2, 1, 3, 1];\nconst conteo = new Map<number, number>();\nfor (const x of datos) {\n    if (conteo.has(x)) {\n        conteo.set(x, conteo.get(x)! + 1);\n    } else {\n        conteo.set(x, 1);\n    }\n}\nconsole.log(conteo.get(1), conteo.size);\n```\n```salida\n3 3\n```"
]$codia$::jsonb,
  'visuales', $codia$[
  {
    "tipo": "codia.comparar",
    "despuesDePaso": 1,
    "titulo": "Leer un elemento y ver cuántos hay",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "nums",
          "ty": "arr",
          "e": {
            "k": "arr",
            "items": [
              {
                "k": "n",
                "v": 4
              },
              {
                "k": "n",
                "v": 8
              },
              {
                "k": "n",
                "v": 15
              }
            ]
          }
        },
        {
          "k": "print",
          "args": [
            {
              "k": "ix",
              "a": {
                "k": "v",
                "n": "nums"
              },
              "i": {
                "k": "n",
                "v": 0
              }
            },
            {
              "k": "long",
              "a": {
                "k": "v",
                "n": "nums"
              },
              "de": "arr"
            }
          ]
        }
      ]
    }
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 2,
    "titulo": "Una lista que crece con append",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "dsDecl",
          "n": "lista",
          "ty": "lista",
          "id": "s1"
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "lista",
            "op": "agregar",
            "args": [
              {
                "k": "n",
                "v": 4
              }
            ]
          },
          "id": "s2"
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "lista",
            "op": "agregar",
            "args": [
              {
                "k": "n",
                "v": 8
              }
            ]
          },
          "id": "s3"
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "lista",
            "op": "agregar",
            "args": [
              {
                "k": "n",
                "v": 15
              }
            ]
          },
          "id": "s4"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "ds",
              "n": "lista",
              "op": "obt",
              "args": [
                {
                  "k": "n",
                  "v": 1
                }
              ]
            },
            {
              "k": "ds",
              "n": "lista",
              "op": "tam",
              "args": []
            },
            {
              "k": "ds",
              "n": "lista",
              "op": "obt",
              "args": [
                {
                  "k": "op",
                  "op": "-",
                  "a": {
                    "k": "ds",
                    "n": "lista",
                    "op": "tam",
                    "args": []
                  },
                  "b": {
                    "k": "n",
                    "v": 1
                  }
                }
              ]
            }
          ],
          "id": "s5"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.comparar",
    "despuesDePaso": 2,
    "titulo": "Agregar al final: append, add o push",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "dsDecl",
          "n": "lista",
          "ty": "lista"
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "lista",
            "op": "agregar",
            "args": [
              {
                "k": "n",
                "v": 4
              }
            ]
          }
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "lista",
            "op": "agregar",
            "args": [
              {
                "k": "n",
                "v": 8
              }
            ]
          }
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "lista",
            "op": "agregar",
            "args": [
              {
                "k": "n",
                "v": 15
              }
            ]
          }
        },
        {
          "k": "print",
          "args": [
            {
              "k": "ds",
              "n": "lista",
              "op": "obt",
              "args": [
                {
                  "k": "n",
                  "v": 1
                }
              ]
            },
            {
              "k": "ds",
              "n": "lista",
              "op": "tam",
              "args": []
            },
            {
              "k": "ds",
              "n": "lista",
              "op": "obt",
              "args": [
                {
                  "k": "op",
                  "op": "-",
                  "a": {
                    "k": "ds",
                    "n": "lista",
                    "op": "tam",
                    "args": []
                  },
                  "b": {
                    "k": "n",
                    "v": 1
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 3,
    "titulo": "Recorrer una lista y acumular",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "nums",
          "ty": "arr",
          "e": {
            "k": "arr",
            "items": [
              {
                "k": "n",
                "v": 4
              },
              {
                "k": "n",
                "v": 8
              },
              {
                "k": "n",
                "v": 15
              }
            ]
          },
          "id": "s1"
        },
        {
          "k": "decl",
          "n": "suma",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 0
          },
          "id": "s2"
        },
        {
          "k": "paraCada",
          "v": "x",
          "en": {
            "k": "v",
            "n": "nums"
          },
          "cuerpo": [
            {
              "k": "asig",
              "n": "suma",
              "e": {
                "k": "op",
                "op": "+",
                "a": {
                  "k": "v",
                  "n": "suma"
                },
                "b": {
                  "k": "v",
                  "n": "x"
                }
              },
              "id": "s4"
            }
          ],
          "id": "s3"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "suma"
            }
          ],
          "id": "s5"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 4,
    "titulo": "El máximo: reemplazar cuando aparece uno mayor",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "datos",
          "ty": "arr",
          "e": {
            "k": "arr",
            "items": [
              {
                "k": "n",
                "v": 7
              },
              {
                "k": "n",
                "v": 3
              },
              {
                "k": "n",
                "v": 9
              },
              {
                "k": "n",
                "v": 4
              }
            ]
          },
          "id": "s1"
        },
        {
          "k": "decl",
          "n": "mayor",
          "ty": "int",
          "e": {
            "k": "ix",
            "a": {
              "k": "v",
              "n": "datos"
            },
            "i": {
              "k": "n",
              "v": 0
            }
          },
          "id": "s2"
        },
        {
          "k": "paraCada",
          "v": "x",
          "en": {
            "k": "v",
            "n": "datos"
          },
          "cuerpo": [
            {
              "k": "si",
              "cond": {
                "k": "op",
                "op": ">",
                "a": {
                  "k": "v",
                  "n": "x"
                },
                "b": {
                  "k": "v",
                  "n": "mayor"
                }
              },
              "entonces": [
                {
                  "k": "asig",
                  "n": "mayor",
                  "e": {
                    "k": "v",
                    "n": "x"
                  },
                  "id": "s5"
                }
              ],
              "id": "s4"
            }
          ],
          "id": "s3"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "mayor"
            }
          ],
          "id": "s6"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.comparar",
    "despuesDePaso": 5,
    "titulo": "Índice fuera de rango, según el lenguaje",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "nums",
          "ty": "arr",
          "e": {
            "k": "arr",
            "items": [
              {
                "k": "n",
                "v": 4
              },
              {
                "k": "n",
                "v": 8
              },
              {
                "k": "n",
                "v": 15
              }
            ]
          }
        },
        {
          "k": "print",
          "args": [
            {
              "k": "ix",
              "a": {
                "k": "v",
                "n": "nums"
              },
              "i": {
                "k": "n",
                "v": 3
              }
            }
          ]
        }
      ]
    }
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 6,
    "titulo": "Un diccionario: la clave ana se sobrescribe",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "dsDecl",
          "n": "edades",
          "ty": "mapa",
          "id": "s1"
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "edades",
            "op": "poner",
            "args": [
              {
                "k": "s",
                "v": "ana"
              },
              {
                "k": "n",
                "v": 15
              }
            ]
          },
          "id": "s2"
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "edades",
            "op": "poner",
            "args": [
              {
                "k": "s",
                "v": "luis"
              },
              {
                "k": "n",
                "v": 17
              }
            ]
          },
          "id": "s3"
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "edades",
            "op": "poner",
            "args": [
              {
                "k": "s",
                "v": "ana"
              },
              {
                "k": "n",
                "v": 16
              }
            ]
          },
          "id": "s4"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "ds",
              "n": "edades",
              "op": "obt",
              "args": [
                {
                  "k": "s",
                  "v": "ana"
                }
              ]
            },
            {
              "k": "ds",
              "n": "edades",
              "op": "tam",
              "args": []
            }
          ],
          "id": "s5"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.comparar",
    "despuesDePaso": 6,
    "titulo": "El diccionario en los cuatro lenguajes",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "dsDecl",
          "n": "edades",
          "ty": "mapa"
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "edades",
            "op": "poner",
            "args": [
              {
                "k": "s",
                "v": "ana"
              },
              {
                "k": "n",
                "v": 15
              }
            ]
          }
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "edades",
            "op": "poner",
            "args": [
              {
                "k": "s",
                "v": "luis"
              },
              {
                "k": "n",
                "v": 17
              }
            ]
          }
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "edades",
            "op": "poner",
            "args": [
              {
                "k": "s",
                "v": "ana"
              },
              {
                "k": "n",
                "v": 16
              }
            ]
          }
        },
        {
          "k": "print",
          "args": [
            {
              "k": "ds",
              "n": "edades",
              "op": "obt",
              "args": [
                {
                  "k": "s",
                  "v": "ana"
                }
              ]
            },
            {
              "k": "ds",
              "n": "edades",
              "op": "tam",
              "args": []
            }
          ]
        }
      ]
    }
  }
]$codia$::jsonb)
where slug = 'codia-clase-05-listas-y-diccionarios' and problem_type = 'codia';

update public.techniques set contenido = contenido || jsonb_build_object(
  'pasos', $codia$[
  "La complejidad temporal describe cómo crece el número de operaciones cuando crece n. La medimos contando cuántas veces se ejecuta la operación principal. Nos interesa la forma del crecimiento: si n se duplica, ¿el trabajo se duplica (O(n)), se cuadruplica (O(n²)) o casi no cambia (O(1))?",
  "Dos bucles anidados sobre n, en los cuatro lenguajes. La función devuelve cuántas veces corre la línea total = total + 1:\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        for j in range(n):\n            total = total + 1\n    return total\n\nprint(contar(8), contar(16))\n```\n```java\nstatic int contar(int n) {\n    int total = 0;\n    for (int i = 0; i < n; i++) {\n        for (int j = 0; j < n; j++) {\n            total = total + 1;\n        }\n    }\n    return total;\n}\n\nSystem.out.println(contar(8) + \" \" + contar(16));\n```\n```javascript\nfunction contar(n) {\n    let total = 0;\n    for (let i = 0; i < n; i++) {\n        for (let j = 0; j < n; j++) {\n            total = total + 1;\n        }\n    }\n    return total;\n}\n\nconsole.log(contar(8), contar(16));\n```\n```typescript\nfunction contar(n: number): number {\n    let total: number = 0;\n    for (let i = 0; i < n; i++) {\n        for (let j = 0; j < n; j++) {\n            total = total + 1;\n        }\n    }\n    return total;\n}\n\nconsole.log(contar(8), contar(16));\n```\n```salida\n64 256\n```\nAl duplicar n de 8 a 16 el trabajo pasó de 64 a 256: se multiplicó por 4. Es O(n²).",
  "Un solo bucle da O(n): al duplicar n el trabajo se duplica.\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        total = total + 1\n    return total\n\nprint(contar(8), contar(16))\n```\n```java\nstatic int contar(int n) {\n    int total = 0;\n    for (int i = 0; i < n; i++) {\n        total = total + 1;\n    }\n    return total;\n}\n\nSystem.out.println(contar(8) + \" \" + contar(16));\n```\n```javascript\nfunction contar(n) {\n    let total = 0;\n    for (let i = 0; i < n; i++) {\n        total = total + 1;\n    }\n    return total;\n}\n\nconsole.log(contar(8), contar(16));\n```\n```typescript\nfunction contar(n: number): number {\n    let total: number = 0;\n    for (let i = 0; i < n; i++) {\n        total = total + 1;\n    }\n    return total;\n}\n\nconsole.log(contar(8), contar(16));\n```\n```salida\n8 16\n```\nDos bucles UNO DESPUÉS DEL OTRO también son O(n): 8 + 8 = 16 y 16 + 16 = 32, se suman, no se multiplican.\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        total = total + 1\n    for j in range(n):\n        total = total + 1\n    return total\n\nprint(contar(8), contar(16))\n```\n```salida\n16 32\n```",
  "Trampa: un bucle interno que depende de i sigue siendo O(n²). Con j desde 0 hasta i - 1 se hacen 0 + 1 + 2 + ... + (n - 1) = n(n-1)/2 operaciones:\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        for j in range(i):\n            total = total + 1\n    return total\n\nprint(contar(8), contar(16))\n```\n```salida\n28 120\n```\n28 y 120: al duplicar n se multiplica por algo cercano a 4 (y más cerca de 4 cuanto más grande es n). Las constantes como 1/2 no cambian la forma.",
  "Un bucle interno de largo fijo es una constante: no cuenta como bucle sobre n.\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        for j in range(3):\n            total = total + 1\n    return total\n\nprint(contar(8), contar(16))\n```\n```salida\n24 48\n```\n3n operaciones: O(n). Y si el valor se reduce a la mitad en cada vuelta, el bucle es logarítmico:\n```python\ndef contar(n):\n    total = 0\n    i = 1\n    while i < n:\n        total = total + 1\n        i = i * 2\n    return total\n\nprint(contar(8), contar(16))\n```\n```java\nstatic int contar(int n) {\n    int total = 0;\n    int i = 1;\n    while (i < n) {\n        total = total + 1;\n        i = i * 2;\n    }\n    return total;\n}\n\nSystem.out.println(contar(8) + \" \" + contar(16));\n```\n```javascript\nfunction contar(n) {\n    let total = 0;\n    let i = 1;\n    while (i < n) {\n        total = total + 1;\n        i = i * 2;\n    }\n    return total;\n}\n\nconsole.log(contar(8), contar(16));\n```\n```typescript\nfunction contar(n: number): number {\n    let total: number = 0;\n    let i: number = 1;\n    while (i < n) {\n        total = total + 1;\n        i = i * 2;\n    }\n    return total;\n}\n\nconsole.log(contar(8), contar(16));\n```\n```salida\n3 4\n```\nDuplicar n suma UNA vuelta: es O(log n).",
  "Un bucle sobre n que por dentro tiene un contador que se duplica (log n vueltas) hace n * log n operaciones: O(n log n). Crece un poco más que O(n) y bastante menos que O(n²).\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        j = 1\n        while j < n:\n            total = total + 1\n            j = j * 2\n    return total\n\nprint(contar(8), contar(16))\n```\n```salida\n24 64\n```\nCon n = 8 son 8 vueltas por 3 (log n) = 24; con n = 16 son 16 por 4 = 64. Al duplicar n el trabajo se multiplica por un poco más de 2 (2,7 en este caso), no por 2 como en O(n) ni por 4 como en O(n²).",
  "Tres bucles anidados sobre n hacen n * n * n operaciones: O(n³). Al duplicar n el trabajo se multiplica por 8.\n```python\ndef contar(n):\n    total = 0\n    for i in range(n):\n        for j in range(n):\n            for k in range(n):\n                total = total + 1\n    return total\n\nprint(contar(4), contar(8))\n```\n```salida\n64 512\n```\nPasar de n = 4 a n = 8 llevó el trabajo de 64 a 512, ocho veces más. Cada bucle anidado sobre n agrega un factor n: uno es O(n), dos son O(n²), tres son O(n³).",
  "Ejemplo resuelto: la estructura importa. Preguntar si un nombre está en una lista recorre los elementos (O(n) en el peor caso); en un conjunto (set en Python, HashSet en Java, Set en JavaScript) la búsqueda es O(1) en promedio.\n```python\nnombres = [\"ana\", \"luis\", \"marta\"]\nprint(\"luis\" in nombres)\nconjunto = {\"ana\", \"luis\", \"marta\"}\nprint(\"luis\" in conjunto)\n```\n```salida\nTrue\nTrue\n```\nEl resultado es el mismo; lo que cambia es cuánto trabajo hace la computadora cuando hay millones de elementos."
]$codia$::jsonb,
  'visuales', $codia$[
  {
    "tipo": "codia.crecimiento",
    "despuesDePaso": 1,
    "titulo": "De n = 8 a n = 16: uno se duplica y el otro se cuadruplica",
    "series": [
      {
        "nombre": "Un bucle sobre n",
        "etiqueta": "O(n)",
        "funcion": {
          "nombre": "contar",
          "params": [
            {
              "n": "n",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "total",
              "ty": "int",
              "e": {
                "k": "n",
                "v": 0
              },
              "id": "c1"
            },
            {
              "k": "para",
              "v": "i",
              "desde": {
                "k": "n",
                "v": 0
              },
              "hasta": {
                "k": "v",
                "n": "n"
              },
              "cuerpo": [
                {
                  "k": "asig",
                  "n": "total",
                  "e": {
                    "k": "op",
                    "op": "+",
                    "a": {
                      "k": "v",
                      "n": "total"
                    },
                    "b": {
                      "k": "n",
                      "v": 1
                    }
                  },
                  "id": "c3"
                }
              ],
              "id": "c2"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "total"
              },
              "id": "c4"
            }
          ]
        }
      },
      {
        "nombre": "Dos bucles anidados",
        "etiqueta": "O(n²)",
        "funcion": {
          "nombre": "contar",
          "params": [
            {
              "n": "n",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "total",
              "ty": "int",
              "e": {
                "k": "n",
                "v": 0
              },
              "id": "c1"
            },
            {
              "k": "para",
              "v": "i",
              "desde": {
                "k": "n",
                "v": 0
              },
              "hasta": {
                "k": "v",
                "n": "n"
              },
              "cuerpo": [
                {
                  "k": "para",
                  "v": "j",
                  "desde": {
                    "k": "n",
                    "v": 0
                  },
                  "hasta": {
                    "k": "v",
                    "n": "n"
                  },
                  "cuerpo": [
                    {
                      "k": "asig",
                      "n": "total",
                      "e": {
                        "k": "op",
                        "op": "+",
                        "a": {
                          "k": "v",
                          "n": "total"
                        },
                        "b": {
                          "k": "n",
                          "v": 1
                        }
                      },
                      "id": "c4"
                    }
                  ],
                  "id": "c3"
                }
              ],
              "id": "c2"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "total"
              },
              "id": "c5"
            }
          ]
        }
      }
    ],
    "ns": [
      8,
      16
    ]
  },
  {
    "tipo": "codia.crecimiento",
    "despuesDePaso": 4,
    "titulo": "Cómo crece el trabajo según la forma del bucle",
    "series": [
      {
        "nombre": "Un bucle sobre n",
        "etiqueta": "O(n)",
        "funcion": {
          "nombre": "contar",
          "params": [
            {
              "n": "n",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "total",
              "ty": "int",
              "e": {
                "k": "n",
                "v": 0
              },
              "id": "c1"
            },
            {
              "k": "para",
              "v": "i",
              "desde": {
                "k": "n",
                "v": 0
              },
              "hasta": {
                "k": "v",
                "n": "n"
              },
              "cuerpo": [
                {
                  "k": "asig",
                  "n": "total",
                  "e": {
                    "k": "op",
                    "op": "+",
                    "a": {
                      "k": "v",
                      "n": "total"
                    },
                    "b": {
                      "k": "n",
                      "v": 1
                    }
                  },
                  "id": "c3"
                }
              ],
              "id": "c2"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "total"
              },
              "id": "c4"
            }
          ]
        }
      },
      {
        "nombre": "Dos bucles anidados",
        "etiqueta": "O(n²)",
        "funcion": {
          "nombre": "contar",
          "params": [
            {
              "n": "n",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "total",
              "ty": "int",
              "e": {
                "k": "n",
                "v": 0
              },
              "id": "c1"
            },
            {
              "k": "para",
              "v": "i",
              "desde": {
                "k": "n",
                "v": 0
              },
              "hasta": {
                "k": "v",
                "n": "n"
              },
              "cuerpo": [
                {
                  "k": "para",
                  "v": "j",
                  "desde": {
                    "k": "n",
                    "v": 0
                  },
                  "hasta": {
                    "k": "v",
                    "n": "n"
                  },
                  "cuerpo": [
                    {
                      "k": "asig",
                      "n": "total",
                      "e": {
                        "k": "op",
                        "op": "+",
                        "a": {
                          "k": "v",
                          "n": "total"
                        },
                        "b": {
                          "k": "n",
                          "v": 1
                        }
                      },
                      "id": "c4"
                    }
                  ],
                  "id": "c3"
                }
              ],
              "id": "c2"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "total"
              },
              "id": "c5"
            }
          ]
        }
      },
      {
        "nombre": "Bucle interno que depende de i",
        "etiqueta": "O(n²)",
        "funcion": {
          "nombre": "contar",
          "params": [
            {
              "n": "n",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "total",
              "ty": "int",
              "e": {
                "k": "n",
                "v": 0
              },
              "id": "c1"
            },
            {
              "k": "para",
              "v": "i",
              "desde": {
                "k": "n",
                "v": 0
              },
              "hasta": {
                "k": "v",
                "n": "n"
              },
              "cuerpo": [
                {
                  "k": "para",
                  "v": "j",
                  "desde": {
                    "k": "n",
                    "v": 0
                  },
                  "hasta": {
                    "k": "v",
                    "n": "i"
                  },
                  "cuerpo": [
                    {
                      "k": "asig",
                      "n": "total",
                      "e": {
                        "k": "op",
                        "op": "+",
                        "a": {
                          "k": "v",
                          "n": "total"
                        },
                        "b": {
                          "k": "n",
                          "v": 1
                        }
                      },
                      "id": "c4"
                    }
                  ],
                  "id": "c3"
                }
              ],
              "id": "c2"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "total"
              },
              "id": "c5"
            }
          ]
        }
      },
      {
        "nombre": "El contador se duplica en cada vuelta",
        "etiqueta": "O(log n)",
        "funcion": {
          "nombre": "contar",
          "params": [
            {
              "n": "n",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "total",
              "ty": "int",
              "e": {
                "k": "n",
                "v": 0
              },
              "id": "c1"
            },
            {
              "k": "decl",
              "n": "i",
              "ty": "int",
              "e": {
                "k": "n",
                "v": 1
              },
              "id": "c2"
            },
            {
              "k": "mientras",
              "cond": {
                "k": "op",
                "op": "<",
                "a": {
                  "k": "v",
                  "n": "i"
                },
                "b": {
                  "k": "v",
                  "n": "n"
                }
              },
              "cuerpo": [
                {
                  "k": "asig",
                  "n": "total",
                  "e": {
                    "k": "op",
                    "op": "+",
                    "a": {
                      "k": "v",
                      "n": "total"
                    },
                    "b": {
                      "k": "n",
                      "v": 1
                    }
                  },
                  "id": "c4"
                },
                {
                  "k": "asig",
                  "n": "i",
                  "e": {
                    "k": "op",
                    "op": "*",
                    "a": {
                      "k": "v",
                      "n": "i"
                    },
                    "b": {
                      "k": "n",
                      "v": 2
                    }
                  },
                  "id": "c5"
                }
              ],
              "id": "c3"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "total"
              },
              "id": "c6"
            }
          ]
        }
      }
    ],
    "ns": [
      4,
      8,
      16,
      32
    ]
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 4,
    "titulo": "Un contador que se duplica: log n vueltas",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "n",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 8
          },
          "id": "s1"
        },
        {
          "k": "decl",
          "n": "total",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 0
          },
          "id": "s2"
        },
        {
          "k": "decl",
          "n": "i",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 1
          },
          "id": "s3"
        },
        {
          "k": "mientras",
          "cond": {
            "k": "op",
            "op": "<",
            "a": {
              "k": "v",
              "n": "i"
            },
            "b": {
              "k": "v",
              "n": "n"
            }
          },
          "cuerpo": [
            {
              "k": "asig",
              "n": "total",
              "e": {
                "k": "op",
                "op": "+",
                "a": {
                  "k": "v",
                  "n": "total"
                },
                "b": {
                  "k": "n",
                  "v": 1
                }
              },
              "id": "s5"
            },
            {
              "k": "asig",
              "n": "i",
              "e": {
                "k": "op",
                "op": "*",
                "a": {
                  "k": "v",
                  "n": "i"
                },
                "b": {
                  "k": "n",
                  "v": 2
                }
              },
              "id": "s6"
            }
          ],
          "id": "s4"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "total"
            }
          ],
          "id": "s7"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.crecimiento",
    "despuesDePaso": 5,
    "titulo": "O(n log n): entre O(n) y O(n²)",
    "series": [
      {
        "nombre": "Un bucle sobre n",
        "etiqueta": "O(n)",
        "funcion": {
          "nombre": "contar",
          "params": [
            {
              "n": "n",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "total",
              "ty": "int",
              "e": {
                "k": "n",
                "v": 0
              },
              "id": "c1"
            },
            {
              "k": "para",
              "v": "i",
              "desde": {
                "k": "n",
                "v": 0
              },
              "hasta": {
                "k": "v",
                "n": "n"
              },
              "cuerpo": [
                {
                  "k": "asig",
                  "n": "total",
                  "e": {
                    "k": "op",
                    "op": "+",
                    "a": {
                      "k": "v",
                      "n": "total"
                    },
                    "b": {
                      "k": "n",
                      "v": 1
                    }
                  },
                  "id": "c3"
                }
              ],
              "id": "c2"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "total"
              },
              "id": "c4"
            }
          ]
        }
      },
      {
        "nombre": "Un bucle con un contador que se duplica adentro",
        "etiqueta": "O(n log n)",
        "funcion": {
          "nombre": "contar",
          "params": [
            {
              "n": "n",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "total",
              "ty": "int",
              "e": {
                "k": "n",
                "v": 0
              },
              "id": "c1"
            },
            {
              "k": "para",
              "v": "i",
              "desde": {
                "k": "n",
                "v": 0
              },
              "hasta": {
                "k": "v",
                "n": "n"
              },
              "cuerpo": [
                {
                  "k": "decl",
                  "n": "j",
                  "ty": "int",
                  "e": {
                    "k": "n",
                    "v": 1
                  },
                  "id": "c3"
                },
                {
                  "k": "mientras",
                  "cond": {
                    "k": "op",
                    "op": "<",
                    "a": {
                      "k": "v",
                      "n": "j"
                    },
                    "b": {
                      "k": "v",
                      "n": "n"
                    }
                  },
                  "cuerpo": [
                    {
                      "k": "asig",
                      "n": "total",
                      "e": {
                        "k": "op",
                        "op": "+",
                        "a": {
                          "k": "v",
                          "n": "total"
                        },
                        "b": {
                          "k": "n",
                          "v": 1
                        }
                      },
                      "id": "c5"
                    },
                    {
                      "k": "asig",
                      "n": "j",
                      "e": {
                        "k": "op",
                        "op": "*",
                        "a": {
                          "k": "v",
                          "n": "j"
                        },
                        "b": {
                          "k": "n",
                          "v": 2
                        }
                      },
                      "id": "c6"
                    }
                  ],
                  "id": "c4"
                }
              ],
              "id": "c2"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "total"
              },
              "id": "c7"
            }
          ]
        }
      },
      {
        "nombre": "Dos bucles anidados",
        "etiqueta": "O(n²)",
        "funcion": {
          "nombre": "contar",
          "params": [
            {
              "n": "n",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "total",
              "ty": "int",
              "e": {
                "k": "n",
                "v": 0
              },
              "id": "c1"
            },
            {
              "k": "para",
              "v": "i",
              "desde": {
                "k": "n",
                "v": 0
              },
              "hasta": {
                "k": "v",
                "n": "n"
              },
              "cuerpo": [
                {
                  "k": "para",
                  "v": "j",
                  "desde": {
                    "k": "n",
                    "v": 0
                  },
                  "hasta": {
                    "k": "v",
                    "n": "n"
                  },
                  "cuerpo": [
                    {
                      "k": "asig",
                      "n": "total",
                      "e": {
                        "k": "op",
                        "op": "+",
                        "a": {
                          "k": "v",
                          "n": "total"
                        },
                        "b": {
                          "k": "n",
                          "v": 1
                        }
                      },
                      "id": "c4"
                    }
                  ],
                  "id": "c3"
                }
              ],
              "id": "c2"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "total"
              },
              "id": "c5"
            }
          ]
        }
      }
    ],
    "ns": [
      4,
      8,
      16,
      32
    ]
  },
  {
    "tipo": "codia.crecimiento",
    "despuesDePaso": 6,
    "titulo": "Tres bucles anidados: al duplicar n el trabajo se multiplica por 8",
    "series": [
      {
        "nombre": "Dos bucles anidados",
        "etiqueta": "O(n²)",
        "funcion": {
          "nombre": "contar",
          "params": [
            {
              "n": "n",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "total",
              "ty": "int",
              "e": {
                "k": "n",
                "v": 0
              },
              "id": "c1"
            },
            {
              "k": "para",
              "v": "i",
              "desde": {
                "k": "n",
                "v": 0
              },
              "hasta": {
                "k": "v",
                "n": "n"
              },
              "cuerpo": [
                {
                  "k": "para",
                  "v": "j",
                  "desde": {
                    "k": "n",
                    "v": 0
                  },
                  "hasta": {
                    "k": "v",
                    "n": "n"
                  },
                  "cuerpo": [
                    {
                      "k": "asig",
                      "n": "total",
                      "e": {
                        "k": "op",
                        "op": "+",
                        "a": {
                          "k": "v",
                          "n": "total"
                        },
                        "b": {
                          "k": "n",
                          "v": 1
                        }
                      },
                      "id": "c4"
                    }
                  ],
                  "id": "c3"
                }
              ],
              "id": "c2"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "total"
              },
              "id": "c5"
            }
          ]
        }
      },
      {
        "nombre": "Tres bucles anidados",
        "etiqueta": "O(n³)",
        "funcion": {
          "nombre": "contar",
          "params": [
            {
              "n": "n",
              "ty": "int"
            }
          ],
          "ret": "int",
          "cuerpo": [
            {
              "k": "decl",
              "n": "total",
              "ty": "int",
              "e": {
                "k": "n",
                "v": 0
              },
              "id": "c1"
            },
            {
              "k": "para",
              "v": "i",
              "desde": {
                "k": "n",
                "v": 0
              },
              "hasta": {
                "k": "v",
                "n": "n"
              },
              "cuerpo": [
                {
                  "k": "para",
                  "v": "j",
                  "desde": {
                    "k": "n",
                    "v": 0
                  },
                  "hasta": {
                    "k": "v",
                    "n": "n"
                  },
                  "cuerpo": [
                    {
                      "k": "para",
                      "v": "k",
                      "desde": {
                        "k": "n",
                        "v": 0
                      },
                      "hasta": {
                        "k": "v",
                        "n": "n"
                      },
                      "cuerpo": [
                        {
                          "k": "asig",
                          "n": "total",
                          "e": {
                            "k": "op",
                            "op": "+",
                            "a": {
                              "k": "v",
                              "n": "total"
                            },
                            "b": {
                              "k": "n",
                              "v": 1
                            }
                          },
                          "id": "c5"
                        }
                      ],
                      "id": "c4"
                    }
                  ],
                  "id": "c3"
                }
              ],
              "id": "c2"
            },
            {
              "k": "retorna",
              "e": {
                "k": "v",
                "n": "total"
              },
              "id": "c6"
            }
          ]
        }
      }
    ],
    "ns": [
      4,
      8,
      16
    ]
  }
]$codia$::jsonb)
where slug = 'codia-clase-06-recorridos-y-complejidad' and problem_type = 'codia';

update public.techniques set contenido = contenido || jsonb_build_object(
  'pasos', $codia$[
  "Hay tres familias de errores. De sintaxis (o de compilación): el programa ni arranca. De ejecución: arranca y se rompe en una línea. De lógica: corre sin quejarse pero da un resultado equivocado; son los más difíciles porque nadie te avisa.",
  "Errores de sintaxis en los cuatro lenguajes: falta un dos puntos en Python, un punto y coma en Java y una comilla de cierre en JavaScript y TypeScript.\n```python!\nif 3 > 2\n    print(\"si\")\n```\n```salida\nSyntaxError\n```\n```java!\nint x = 5\nSystem.out.println(x);\n```\n```salida\nerror de compilación\n```\n```javascript!\nconsole.log(\"hola);\n```\n```salida\nSyntaxError\n```\n```typescript!\nconsole.log(\"hola);\n```\n```salida\nerror de compilación\n```",
  "Nombre inexistente (casi siempre un error de tipeo): Python y JavaScript lo descubren al ejecutar esa línea; Java y TypeScript, al compilar.\n```python!\ntotal = 10\nprint(totl)\n```\n```salida\nNameError\n```\n```java!\nint total = 10;\nSystem.out.println(totl);\n```\n```salida\nerror de compilación\n```\n```javascript!\nconst total = 10;\nconsole.log(totl);\n```\n```salida\nReferenceError\n```\n```typescript!\nconst total: number = 10;\nconsole.log(totl);\n```\n```salida\nerror de compilación\n```",
  "Errores de ejecución: índice fuera de rango y división por cero.\n```python!\ndatos = [1, 2, 3]\nprint(datos[3])\n```\n```salida\nIndexError\n```\n```java!\nint[] datos = {1, 2, 3};\nSystem.out.println(datos[3]);\n```\n```salida\nArrayIndexOutOfBoundsException\n```\n```python!\nprint(8 // 0)\n```\n```salida\nZeroDivisionError\n```\n```java!\nSystem.out.println(8 / 0);\n```\n```salida\nArithmeticException\n```\nEn JavaScript y TypeScript ninguno de los dos rompe: dan undefined e Infinity, por eso el error aparece más tarde y es más difícil de rastrear.\n```javascript\nconst datos = [1, 2, 3];\nconsole.log(datos[3], 8 / 0);\n```\n```typescript\nconst datos: number[] = [1, 2, 3];\nconsole.log(datos[3], 8 / 0);\n```\n```salida\nundefined Infinity\n```",
  "Errores de lógica: el clásico es una vuelta de más o de menos. Queríamos la suma de 1 a 4 (10) y da otra cosa:\n```python\ntotal = 0\nfor i in range(1, 4):\n    total = total + i\nprint(total)\n```\n```salida\n6\n```\nDiagnóstico: range(1, 4) llega hasta 3. Para incluir el 4 hay que escribir range(1, 5). Cuando el resultado no es el esperado, no busques en todo el código: compara contra lo que hiciste a mano.",
  "Depurar con print: muestra el valor de las variables en cada vuelta y compara contra tu tabla de seguimiento.\n```python\ntotal = 0\nfor i in range(1, 4):\n    total = total + i\n    print(\"i =\", i, \"total =\", total)\nprint(total)\n```\n```salida\ni = 1 total = 1\ni = 2 total = 3\ni = 3 total = 6\n6\n```\nMétodo: 1) lee el nombre del error y la línea; 2) reproduce el problema con el fragmento más chico posible; 3) traza con una tabla o con print; 4) cambia UNA cosa por vez y vuelve a probar."
]$codia$::jsonb,
  'visuales', $codia$[
  {
    "tipo": "codia.comparar",
    "despuesDePaso": 3,
    "titulo": "Errores de ejecución, según el lenguaje",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "datos",
          "ty": "arr",
          "e": {
            "k": "arr",
            "items": [
              {
                "k": "n",
                "v": 1
              },
              {
                "k": "n",
                "v": 2
              },
              {
                "k": "n",
                "v": 3
              }
            ]
          }
        },
        {
          "k": "print",
          "args": [
            {
              "k": "ix",
              "a": {
                "k": "v",
                "n": "datos"
              },
              "i": {
                "k": "n",
                "v": 3
              }
            },
            {
              "k": "op",
              "op": "div",
              "a": {
                "k": "n",
                "v": 8
              },
              "b": {
                "k": "n",
                "v": 0
              }
            }
          ]
        }
      ]
    }
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 4,
    "titulo": "Un error de lógica: corre sin quejarse y da 6",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "total",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 0
          },
          "id": "s1"
        },
        {
          "k": "para",
          "v": "i",
          "desde": {
            "k": "n",
            "v": 1
          },
          "hasta": {
            "k": "n",
            "v": 4
          },
          "cuerpo": [
            {
              "k": "asig",
              "n": "total",
              "e": {
                "k": "op",
                "op": "+",
                "a": {
                  "k": "v",
                  "n": "total"
                },
                "b": {
                  "k": "v",
                  "n": "i"
                }
              },
              "id": "s3"
            }
          ],
          "id": "s2"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "total"
            }
          ],
          "id": "s4"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 5,
    "titulo": "Depurar con print: i y total en cada vuelta",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "total",
          "ty": "int",
          "e": {
            "k": "n",
            "v": 0
          },
          "id": "s1"
        },
        {
          "k": "para",
          "v": "i",
          "desde": {
            "k": "n",
            "v": 1
          },
          "hasta": {
            "k": "n",
            "v": 4
          },
          "cuerpo": [
            {
              "k": "asig",
              "n": "total",
              "e": {
                "k": "op",
                "op": "+",
                "a": {
                  "k": "v",
                  "n": "total"
                },
                "b": {
                  "k": "v",
                  "n": "i"
                }
              },
              "id": "s3"
            },
            {
              "k": "print",
              "args": [
                {
                  "k": "s",
                  "v": "i ="
                },
                {
                  "k": "v",
                  "n": "i"
                },
                {
                  "k": "s",
                  "v": "total ="
                },
                {
                  "k": "v",
                  "n": "total"
                }
              ],
              "id": "s4"
            }
          ],
          "id": "s2"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "v",
              "n": "total"
            }
          ],
          "id": "s5"
        }
      ]
    },
    "lenguaje": "python"
  }
]$codia$::jsonb)
where slug = 'codia-clase-07-errores-y-depuracion' and problem_type = 'codia';

update public.techniques set contenido = contenido || jsonb_build_object(
  'pasos', $codia$[
  "Una pila es LIFO: el último en entrar es el primero en salir (como una pila de platos). Una cola es FIFO: el primero en entrar es el primero en salir (como la fila de una caja). Un conjunto guarda elementos sin repetir y responde rápido si un elemento está o no.",
  "Pila: apilar 1, 2 y 3 y desapilar dos veces. Sale primero el 3.\n```python\npila = []\npila.append(1)\npila.append(2)\npila.append(3)\nprint(pila.pop())\nprint(pila.pop())\n```\n```java\nimport java.util.*;\n\nDeque<Integer> pila = new ArrayDeque<>();\npila.push(1);\npila.push(2);\npila.push(3);\nSystem.out.println(pila.pop());\nSystem.out.println(pila.pop());\n```\n```javascript\nconst pila = [];\npila.push(1);\npila.push(2);\npila.push(3);\nconsole.log(pila.pop());\nconsole.log(pila.pop());\n```\n```typescript\nconst pila: number[] = [];\npila.push(1);\npila.push(2);\npila.push(3);\nconsole.log(pila.pop());\nconsole.log(pila.pop());\n```\n```salida\n3\n2\n```",
  "Cola: encolar 1, 2 y 3 y desencolar dos veces. Sale primero el 1.\n```python\nfrom collections import deque\n\ncola = deque()\ncola.append(1)\ncola.append(2)\ncola.append(3)\nprint(cola.popleft())\nprint(cola.popleft())\n```\n```java\nimport java.util.*;\n\nQueue<Integer> cola = new ArrayDeque<>();\ncola.add(1);\ncola.add(2);\ncola.add(3);\nSystem.out.println(cola.poll());\nSystem.out.println(cola.poll());\n```\n```javascript\nconst cola = [];\ncola.push(1);\ncola.push(2);\ncola.push(3);\nconsole.log(cola.shift());\nconsole.log(cola.shift());\n```\n```typescript\nconst cola: number[] = [];\ncola.push(1);\ncola.push(2);\ncola.push(3);\nconsole.log(cola.shift());\nconsole.log(cola.shift());\n```\n```salida\n1\n2\n```\nEn Python usa deque para colas: con una lista, pop(0) mueve todos los elementos de lugar (O(n)); popleft de deque es O(1).",
  "Conjunto: agregar elementos repetidos no hace nada. Agregamos 2, 6, 2, 6 y 1:\n```python\ns = set()\nfor x in [2, 6, 2, 6, 1]:\n    s.add(x)\nprint(len(s))\nprint(6 in s)\n```\n```salida\n3\nTrue\n```\n```java\nimport java.util.*;\n\nSet<Integer> s = new HashSet<>();\nfor (int x : new int[]{2, 6, 2, 6, 1}) {\n    s.add(x);\n}\nSystem.out.println(s.size());\nSystem.out.println(s.contains(6));\n```\n```javascript\nconst s = new Set();\nfor (const x of [2, 6, 2, 6, 1]) {\n    s.add(x);\n}\nconsole.log(s.size);\nconsole.log(s.has(6));\n```\n```typescript\nconst s = new Set<number>();\nfor (const x of [2, 6, 2, 6, 1]) {\n    s.add(x);\n}\nconsole.log(s.size);\nconsole.log(s.has(6));\n```\n```salida\n3\ntrue\n```",
  "Uso típico de una pila: invertir. Se apila cada elemento y después se desapila hasta vaciarla, y sale en orden inverso.\n```python\ndatos = [1, 2, 3]\npila = []\nfor x in datos:\n    pila.append(x)\nwhile len(pila) > 0:\n    print(pila.pop())\n```\n```java\nimport java.util.*;\n\nint[] datos = {1, 2, 3};\nDeque<Integer> pila = new ArrayDeque<>();\nfor (int x : datos) {\n    pila.push(x);\n}\nwhile (!pila.isEmpty()) {\n    System.out.println(pila.pop());\n}\n```\n```javascript\nconst datos = [1, 2, 3];\nconst pila = [];\nfor (const x of datos) {\n    pila.push(x);\n}\nwhile (pila.length > 0) {\n    console.log(pila.pop());\n}\n```\n```typescript\nconst datos: number[] = [1, 2, 3];\nconst pila: number[] = [];\nfor (const x of datos) {\n    pila.push(x);\n}\nwhile (pila.length > 0) {\n    console.log(pila.pop());\n}\n```\n```salida\n3\n2\n1\n```",
  "Ejemplo resuelto: una cola de turnos. Se saca al primero; si es par se imprime y si es impar vuelve al final sumándole 1. Con la cola 3, 4, 5:\n```python\nfrom collections import deque\n\ncola = deque([3, 4, 5])\nwhile len(cola) > 0:\n    x = cola.popleft()\n    if x % 2 == 0:\n        print(x)\n    else:\n        cola.append(x + 1)\n```\nTraza: sale 3 (impar), vuelve 4 y la cola es 4, 5, 4. Sale 4 (par): imprime 4. Sale 5 (impar), vuelve 6: cola 4, 6. Sale 4: imprime 4. Sale 6: imprime 6. La cola queda vacía.\n```salida\n4\n4\n6\n```"
]$codia$::jsonb,
  'visuales', $codia$[
  {
    "tipo": "codia.comparar",
    "despuesDePaso": 1,
    "titulo": "Pila (LIFO): sale primero el último que entró",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "dsDecl",
          "n": "pila",
          "ty": "pila"
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "pila",
            "op": "apilar",
            "args": [
              {
                "k": "n",
                "v": 1
              }
            ]
          }
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "pila",
            "op": "apilar",
            "args": [
              {
                "k": "n",
                "v": 2
              }
            ]
          }
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "pila",
            "op": "apilar",
            "args": [
              {
                "k": "n",
                "v": 3
              }
            ]
          }
        },
        {
          "k": "print",
          "args": [
            {
              "k": "ds",
              "n": "pila",
              "op": "desapilar",
              "args": []
            }
          ]
        },
        {
          "k": "print",
          "args": [
            {
              "k": "ds",
              "n": "pila",
              "op": "desapilar",
              "args": []
            }
          ]
        }
      ]
    }
  },
  {
    "tipo": "codia.comparar",
    "despuesDePaso": 2,
    "titulo": "Cola (FIFO): sale primero el primero que entró",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "dsDecl",
          "n": "cola",
          "ty": "cola"
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "cola",
            "op": "encolar",
            "args": [
              {
                "k": "n",
                "v": 1
              }
            ]
          }
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "cola",
            "op": "encolar",
            "args": [
              {
                "k": "n",
                "v": 2
              }
            ]
          }
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "cola",
            "op": "encolar",
            "args": [
              {
                "k": "n",
                "v": 3
              }
            ]
          }
        },
        {
          "k": "print",
          "args": [
            {
              "k": "ds",
              "n": "cola",
              "op": "desencolar",
              "args": []
            }
          ]
        },
        {
          "k": "print",
          "args": [
            {
              "k": "ds",
              "n": "cola",
              "op": "desencolar",
              "args": []
            }
          ]
        }
      ]
    }
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 3,
    "titulo": "Un conjunto no guarda repetidos",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "dsDecl",
          "n": "s",
          "ty": "conj",
          "id": "s1"
        },
        {
          "k": "paraCada",
          "v": "x",
          "en": {
            "k": "arr",
            "items": [
              {
                "k": "n",
                "v": 2
              },
              {
                "k": "n",
                "v": 6
              },
              {
                "k": "n",
                "v": 2
              },
              {
                "k": "n",
                "v": 6
              },
              {
                "k": "n",
                "v": 1
              }
            ]
          },
          "cuerpo": [
            {
              "k": "exec",
              "e": {
                "k": "ds",
                "n": "s",
                "op": "agregar",
                "args": [
                  {
                    "k": "v",
                    "n": "x"
                  }
                ]
              },
              "id": "s3"
            }
          ],
          "id": "s2"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "ds",
              "n": "s",
              "op": "tam",
              "args": []
            }
          ],
          "id": "s4"
        },
        {
          "k": "print",
          "args": [
            {
              "k": "ds",
              "n": "s",
              "op": "tiene",
              "args": [
                {
                  "k": "n",
                  "v": 6
                }
              ]
            }
          ],
          "id": "s5"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 4,
    "titulo": "Invertir con una pila",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "decl",
          "n": "datos",
          "ty": "arr",
          "e": {
            "k": "arr",
            "items": [
              {
                "k": "n",
                "v": 1
              },
              {
                "k": "n",
                "v": 2
              },
              {
                "k": "n",
                "v": 3
              }
            ]
          },
          "id": "s1"
        },
        {
          "k": "dsDecl",
          "n": "pila",
          "ty": "pila",
          "id": "s2"
        },
        {
          "k": "paraCada",
          "v": "x",
          "en": {
            "k": "v",
            "n": "datos"
          },
          "cuerpo": [
            {
              "k": "exec",
              "e": {
                "k": "ds",
                "n": "pila",
                "op": "apilar",
                "args": [
                  {
                    "k": "v",
                    "n": "x"
                  }
                ]
              },
              "id": "s4"
            }
          ],
          "id": "s3"
        },
        {
          "k": "mientras",
          "cond": {
            "k": "op",
            "op": ">",
            "a": {
              "k": "ds",
              "n": "pila",
              "op": "tam",
              "args": []
            },
            "b": {
              "k": "n",
              "v": 0
            }
          },
          "cuerpo": [
            {
              "k": "print",
              "args": [
                {
                  "k": "ds",
                  "n": "pila",
                  "op": "desapilar",
                  "args": []
                }
              ],
              "id": "s6"
            }
          ],
          "id": "s5"
        }
      ]
    },
    "lenguaje": "python"
  },
  {
    "tipo": "codia.traza",
    "despuesDePaso": 5,
    "titulo": "Ejemplo resuelto: una cola de turnos",
    "programa": {
      "funcs": [],
      "main": [
        {
          "k": "dsDecl",
          "n": "cola",
          "ty": "cola",
          "id": "s1"
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "cola",
            "op": "encolar",
            "args": [
              {
                "k": "n",
                "v": 3
              }
            ]
          },
          "id": "s2"
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "cola",
            "op": "encolar",
            "args": [
              {
                "k": "n",
                "v": 4
              }
            ]
          },
          "id": "s3"
        },
        {
          "k": "exec",
          "e": {
            "k": "ds",
            "n": "cola",
            "op": "encolar",
            "args": [
              {
                "k": "n",
                "v": 5
              }
            ]
          },
          "id": "s4"
        },
        {
          "k": "mientras",
          "cond": {
            "k": "op",
            "op": ">",
            "a": {
              "k": "ds",
              "n": "cola",
              "op": "tam",
              "args": []
            },
            "b": {
              "k": "n",
              "v": 0
            }
          },
          "cuerpo": [
            {
              "k": "decl",
              "n": "x",
              "ty": "int",
              "e": {
                "k": "ds",
                "n": "cola",
                "op": "desencolar",
                "args": []
              },
              "id": "s6"
            },
            {
              "k": "si",
              "cond": {
                "k": "op",
                "op": "==",
                "a": {
                  "k": "op",
                  "op": "mod",
                  "a": {
                    "k": "v",
                    "n": "x"
                  },
                  "b": {
                    "k": "n",
                    "v": 2
                  }
                },
                "b": {
                  "k": "n",
                  "v": 0
                }
              },
              "entonces": [
                {
                  "k": "print",
                  "args": [
                    {
                      "k": "v",
                      "n": "x"
                    }
                  ],
                  "id": "s8"
                }
              ],
              "sino": [
                {
                  "k": "exec",
                  "e": {
                    "k": "ds",
                    "n": "cola",
                    "op": "encolar",
                    "args": [
                      {
                        "k": "op",
                        "op": "+",
                        "a": {
                          "k": "v",
                          "n": "x"
                        },
                        "b": {
                          "k": "n",
                          "v": 1
                        }
                      }
                    ]
                  },
                  "id": "s9"
                }
              ],
              "id": "s7"
            }
          ],
          "id": "s5"
        }
      ]
    },
    "lenguaje": "python"
  }
]$codia$::jsonb)
where slug = 'codia-clase-08-pilas-colas-y-conjuntos' and problem_type = 'codia';
