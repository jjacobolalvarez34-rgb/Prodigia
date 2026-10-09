import type { TraduccionLeccion } from "../traducir";

// Codia — the 17 lessons of the language sections (0255: Python, Java, JavaScript and TypeScript) in
// English. Same rules as en/codia.ts: code and output blocks are inserted from the Spanish text with
// the ⟦N⟧ marker (N-th block of that step or question, base 1), so the programs don't change; what the
// programs print stays as it is. Only "error de compilación" outputs are written out, as
// "compilation error".
export const CODIA_LENGUAJES_EN: Record<string, TraduccionLeccion> = {
  "codia-tecnica-python-chuleta": {
    nombre: "Python at a glance: colons, indentation and print",
    descripcion: "The minimum to read and write Python without tripping: indented blocks, untyped variables, True and False capitalized and the two divisions.",
    pasos: [
      "Indented blocks: after if, for, while or def comes a colon, and the lines inside are shifted 4 spaces.\n⟦1⟧\n⟦2⟧",
      "No types and no semicolons: the variable takes the type of the value you give it, and it can change it.\n⟦1⟧\n⟦2⟧",
      "True and False are capitalized, and the logical operators are written as words: and, or, not.\n⟦1⟧\n⟦2⟧",
      "Two divisions: / always gives a decimal and // gives the whole part.\n⟦1⟧\n⟦2⟧",
    ],
    quiz: [
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["[2, 3, 4]", "[2, 3, 4, 5]", "[3, 4]"], respuesta: 0, explicacion: "range(2, 5) starts at 2 and stops before 5." },
      { pregunta: "How do you write \"true\" in Python?", opciones: ["true", "True", "TRUE"], respuesta: 1, explicacion: "In Python booleans are capitalized: True and False." },
    ],
    visuales: ["Python in three rules", "A colon and indentation mark each block", "The variable takes the type of the value", "True, False, and, or and not are written like this"],
  },
  "codia-tecnica-java-chuleta": {
    nombre: "Java at a glance: types, semicolons and braces",
    descripcion: "The minimum to read Java: each variable declares its type, each statement ends with a semicolon and blocks go between braces.",
    pasos: [
      "Each statement ends with a semicolon and blocks go between braces.\n⟦1⟧\n⟦2⟧",
      "Each variable declares its type and can't change it: if it doesn't match, the program won't even compile.\n⟦1⟧\n~~~salida\ncompilation error\n~~~",
      "To print you use System.out.println, and to join text, the + sign.\n⟦1⟧\n⟦2⟧",
      "Careful: an int divided by another int drops the decimals. With a decimal in the calculation, the result is a decimal.\n⟦1⟧\n⟦2⟧",
    ],
    quiz: [
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["4.5", "4", "5"], respuesta: 1, explicacion: "9 and 2 are ints: integer division drops the .5." },
      { pregunta: "What does each statement end with in Java?", opciones: ["A semicolon", "A colon", "A line break"], respuesta: 0, explicacion: "Java requires ; at the end of each statement." },
    ],
    visuales: ["Java in three rules", "Each variable declares its type", "Each statement ends with a semicolon", "Blocks go between braces"],
  },
  "codia-tecnica-javascript-chuleta": {
    nombre: "JavaScript at a glance: const, === and the surprises of +",
    descripcion: "The minimum to avoid JavaScript's traps: const and let, always compare with === and watch out when adding text and numbers.",
    pasos: [
      "const for what doesn't change and let for what does. New code doesn't use var.\n⟦1⟧\n⟦2⟧",
      "Always compare with ===, which requires the same value and the same type. == converts the types before comparing and gives surprises.\n⟦1⟧\n⟦2⟧",
      "With a text in the mix, + joins instead of adding. To add, convert first with Number.\n⟦1⟧\n⟦2⟧",
      "To print several things, separate them with commas in console.log: they're shown with a space in between.\n⟦1⟧\n⟦2⟧",
    ],
    quiz: [
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["6", "51", "Error"], respuesta: 1, explicacion: "With a text in the mix, + joins: \"5\" and \"1\" give \"51\"." },
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["true", "false", "Error"], respuesta: 0, explicacion: "In JavaScript all numbers are the same type: 2 and 2.0 are the same value." },
    ],
    visuales: ["JavaScript in three rules", "const by default; let if it's going to change", "Compare with ===", "Text + number joins, it doesn't add"],
  },
  "codia-tecnica-typescript-chuleta": {
    nombre: "TypeScript at a glance: a colon and the type",
    descripcion: "TypeScript is JavaScript with types: the type goes after the name, with a colon, and if it doesn't match the program doesn't compile.",
    pasos: [
      "The type goes after the name, with a colon.\n⟦1⟧\n⟦2⟧",
      "If the value doesn't match the type, it doesn't compile: the error shows up before running.\n⟦1⟧\n~~~salida\ncompilation error\n~~~",
      "Functions declare the type of each parameter and of the result.\n⟦1⟧\n⟦2⟧",
      "Everything else is JavaScript: const, let, ===, arrays and objects work the same.\n⟦1⟧\n⟦2⟧",
    ],
    quiz: [
      { pregunta: "What happens with this code?\n⟦1⟧", opciones: ["It doesn't compile: compilation error", "It returns 1", "It returns \"1\""], respuesta: 0, explicacion: "f asks for a number and gets a string: the compiler rejects it." },
      { pregunta: "Where is the type of a variable written in TypeScript?", opciones: ["After the name, with a colon", "Before the name, as in Java", "In a comment"], respuesta: 0, explicacion: "For example: let edad: number = 15." },
    ],
    visuales: ["TypeScript in three rules", "name: type", "If the type doesn't match, it doesn't compile", "The rest is JavaScript"],
  },
  "codia-clase-lenguajes-panorama": {
    nombre: "Four languages, four worlds: what each one is for",
    descripcion: "The ideas of The basics are the same in every language; what changes is how they're written and what they're used for. Compiled or interpreted, static or dynamic typing, and the place of Python, Java, JavaScript and TypeScript.",
    pasos: [
      "You already know the basics: variables, conditionals, loops, functions and data structures. Those ideas are the same in every language. What changes is how they're written, how they run and what each one is used for.",
      "Interpreted or compiled. Python and JavaScript run with an interpreter, which reads the program and runs it as it goes. Java is first compiled to bytecode, which then runs on the Java virtual machine (JVM). TypeScript is compiled to JavaScript, checking the types along the way.",
      "Dynamic or static typing. In Python and JavaScript the value carries the type and type errors show up when running. In Java and TypeScript you declare the types and the compiler warns you earlier. Look at what happens when you join a text with a number. Python refuses:\n⟦1⟧\n⟦2⟧\nJava, JavaScript and TypeScript turn the number into text:\n⟦3⟧\n⟦4⟧\n⟦5⟧\n⟦6⟧",
      "What each one is used for. Python: data science, artificial intelligence, automating tasks and teaching programming. Java: Android apps, systems at banks and big companies, servers. JavaScript: everything that moves on a web page, and also servers with Node.js. TypeScript: JavaScript with types, for big web projects built by teams (Prodigia is written in TypeScript).",
      "The classic first program, in all four:\n⟦1⟧\n⟦2⟧\n⟦3⟧\n⟦4⟧\n⟦5⟧",
      "There's no \"best\" language: there are tools for different jobs. What you learned in The basics carries over: someone who understands a loop in Python understands it in Java in minutes. In the next sections you'll see each language from the inside and what it's used for.",
    ],
    quiz: [
      { pregunta: "Which language do all browsers understand directly?", opciones: ["Python", "JavaScript", "Java"], respuesta: 1, explicacion: "JavaScript is the language of web pages; TypeScript is compiled to JavaScript to run there." },
      { pregunta: "What happens when you run this in Python?\n⟦1⟧", opciones: ["It prints Puntos: 10", "It fails with TypeError", "It prints Puntos: 10.0"], respuesta: 1, explicacion: "Python doesn't join text with numbers on its own: you have to convert with str(10)." },
      { pregunta: "What does the TypeScript compiler do before running?", opciones: ["Checks the types and turns it into JavaScript", "Turns it into Python", "Runs it on the JVM"], respuesta: 0, explicacion: "Types are checked when compiling and disappear in the JavaScript that runs." },
    ],
    visuales: [
      "How does it run?",
      "Python: an interpreter reads it and runs it",
      "JavaScript: the browser or Node.js runs it",
      "Java: it's compiled to bytecode and the JVM runs it",
      "TypeScript: it's checked, compiled to JavaScript and runs as JavaScript",
      "What is it used for?",
      "Python: data and artificial intelligence",
      "Java: Android and companies",
      "JavaScript: the web",
      "TypeScript: big web projects",
    ],
  },
  "codia-clase-python-1-sintaxis": {
    nombre: "Python 1: a language that reads almost like English",
    descripcion: "Indented blocks, f-strings, lists and loops, the three division operations and list comprehensions.",
    pasos: [
      "Python was designed to be easy to read. It uses no semicolons or braces: blocks are marked with a colon and an indentation of 4 spaces.\n⟦1⟧\n⟦2⟧",
      "Indentation isn't decoration: if it's missing, the program won't even start.\n⟦1⟧\n⟦2⟧",
      "f-strings put variables inside text with braces, and print separates with a space whatever you pass it with commas.\n⟦1⟧\n⟦2⟧",
      "Lists and the for loop, which goes directly through the elements. sum and len give you the average in one line.\n⟦1⟧\n⟦2⟧",
      "Three operations that confuse people at first: / always gives a decimal, // is integer division and ** is the power.\n⟦1⟧\n⟦2⟧",
      "List comprehensions build a new list in a single line: \"x times x, for each x from 1 to 5\".\n⟦1⟧\n⟦2⟧",
    ],
    quiz: [
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["4 4.5", "4.5 4.5", "4 4"], respuesta: 0, explicacion: "// is integer division (4) and / always gives a decimal (4.5)." },
      { pregunta: "How does Python mark where a block starts and ends?", opciones: ["With braces", "With indentation", "With semicolons"], respuesta: 1, explicacion: "A colon at the end of the line and the lines inside shifted 4 spaces." },
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["[2, 4, 6]", "[1, 2, 3, 1, 2, 3]", "[2, 4, 6, 2]"], respuesta: 0, explicacion: "The comprehension multiplies each element by 2." },
    ],
    visuales: ["What's special about Python", "Blocks with a colon and indentation", "f-strings: f\"{variable}\"", "/ decimal, // integer, ** power", "Comprehensions: [x * x for x in lista]"],
  },
  "codia-clase-python-2-diccionarios-y-funciones": {
    nombre: "Python 2: dictionaries, functions and modules",
    descripcion: "Storing data by name with dictionaries, writing functions with default values, importing modules and avoiding KeyError.",
    pasos: [
      "A dictionary stores key-value pairs: you look things up by name instead of by position.\n⟦1⟧\n⟦2⟧",
      "To go through it, items() gives each key with its value (in the order they were added).\n⟦1⟧\n⟦2⟧",
      "Functions are defined with def. A parameter can have a default value, which is used if you don't pass it.\n⟦1⟧\n⟦2⟧",
      "Python comes with many ready-made modules. With import you use them: math has square roots, pi and much more.\n⟦1⟧\n⟦2⟧",
      "The typical dictionary error: asking for a key that doesn't exist.\n⟦1⟧\n⟦2⟧\nWith get you ask for the key and give a value in case it's not there:\n⟦3⟧\n⟦4⟧",
    ],
    quiz: [
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["7", "3", "6"], respuesta: 0, explicacion: "d[\"a\"] becomes 5, and 5 + 2 = 7." },
      { pregunta: "What happens when you run this?\n⟦1⟧", opciones: ["It prints None", "It fails with KeyError", "It prints 0"], respuesta: 1, explicacion: "The key \"y\" doesn't exist. With .get(\"y\") it would return None without failing." },
      { pregunta: "What is import for in Python?", opciones: ["To use code from another module, like math", "To create a variable", "To print on the screen"], respuesta: 0, explicacion: "import math brings in the functions of the math module (sqrt, pi, etc.)." },
    ],
    visuales: ["Dictionaries in Python", "d[\"clave\"] = valor stores or changes", "for k, v in d.items() goes through it", "d.get(\"clave\", 0) doesn't fail if it's missing"],
  },
  "codia-clase-python-3-usos": {
    nombre: "Python 3: where it's used — data, automation and artificial intelligence",
    descripcion: "Why Python is the language of data and AI, with small examples of analysis, sorting and word counting, and what its weak point is.",
    pasos: [
      "Python dominates in data science and artificial intelligence (with libraries like NumPy, pandas, scikit-learn and PyTorch), in automating tasks (renaming files, reading spreadsheets, downloading data), in web servers (Django and Flask) and in teaching.",
      "A small data analysis, without any library: maximum, minimum and average.\n⟦1⟧\n⟦2⟧",
      "Automating means sorting and cleaning data in a few lines: here, capitalizing the first letter and sorting alphabetically.\n⟦1⟧\n⟦2⟧",
      "Counting words is the basis of text analysis (and of how many language models get started).\n⟦1⟧\n⟦2⟧",
      "Why Python won in AI: the syntax is short, there are thousands of libraries and the scientific community adopted it. Its weak point is speed: for heavy calculations it's slower than Java, which is why the big libraries are written in C on the inside and Python only \"directs\" them.",
    ],
    quiz: [
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["6", "8", "11"], respuesta: 0, explicacion: "The maximum is 8 and the minimum 2: 8 − 2 = 6." },
      { pregunta: "In which area is Python used the most?", opciones: ["iPhone apps", "Data science and artificial intelligence", "Animating web pages in the browser"], respuesta: 1, explicacion: "Libraries like NumPy, pandas and PyTorch made it the standard in data and AI." },
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["1", "2", "3"], respuesta: 1, explicacion: "split separates by spaces: [\"a\", \"b\", \"a\"], and \"a\" appears 2 times." },
    ],
    visuales: ["Python in the real world", "Data and AI: NumPy, pandas, PyTorch", "Automating: files, spreadsheets, downloads", "Web: Django and Flask", "Weak point: speed"],
  },
  "codia-clase-java-1-estructura": {
    nombre: "Java 1: declared types and everything inside a class",
    descripcion: "What a Java program looks like, why it's compiled, the basic types, static methods, arrays and integer division.",
    pasos: [
      "A complete Java program is a class with a main method: public class Main, and inside it public static void main(String[] args). In these lessons we only show what goes inside main. Java is compiled: javac checks the whole program and turns it into bytecode, which the Java virtual machine (JVM) then runs. That's why people say \"write once, run anywhere\".",
      "Each variable declares its type: int (integer), double (decimal), String (text) and boolean (true or false).\n⟦1⟧\n⟦2⟧",
      "The compiler catches type errors before anything runs:\n⟦1⟧\n~~~salida\ncompilation error\n~~~",
      "Functions in Java are called methods and they also declare types: the one of the result and the one of each parameter.\n⟦1⟧\n⟦2⟧",
      "Arrays have a fixed size, and Java's for has a short form to go through them.\n⟦1⟧\n⟦2⟧",
      "Careful with division: between two ints, Java drops the decimals. With a double in the calculation, the result is a decimal.\n⟦1⟧\n⟦2⟧",
    ],
    quiz: [
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["2.5", "2", "3"], respuesta: 1, explicacion: "10 and 4 are ints: integer division gives 2." },
      { pregunta: "What happens with this code?\n⟦1⟧", opciones: ["It prints 5", "It doesn't compile: compilation error", "It stores null"], respuesta: 1, explicacion: "An int can't be stored in a String variable." },
      { pregunta: "What runs Java programs once they're compiled?", opciones: ["The browser", "The Java virtual machine (JVM)", "The Python interpreter"], respuesta: 1, explicacion: "javac generates bytecode and the JVM runs it." },
    ],
    visuales: ["How Java runs", "You write Main.java", "javac checks it and compiles it to bytecode", "The JVM runs the bytecode on any system"],
  },
  "codia-clase-java-2-objetos": {
    nombre: "Java 2: classes and objects",
    descripcion: "Java's central idea: a class is a mold and an object is something concrete made with that mold. Constructors, methods, ArrayList and a runtime error.",
    pasos: [
      "Java is an object-oriented language. A class is a mold: it says what data (attributes) and what actions (methods) something has. An object is a concrete thing made with that mold, with its own data.",
      "A Mascota (pet) class with a constructor (the method that builds the object) and a method. With new an object is created.\n⟦1⟧\n⟦2⟧",
      "Each object keeps its own data: adding to one doesn't change the other.\n⟦1⟧\n⟦2⟧",
      "For lists that grow you use ArrayList, which has to be imported. Between the < > signs goes the type of what it stores.\n⟦1⟧\n⟦2⟧",
      "There are errors the compiler can't see, because they depend on the data: they show up when running.\n⟦1⟧\n⟦2⟧",
    ],
    quiz: [
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["5", "7", "2"], respuesta: 1, explicacion: "The object starts with n = 5 and then 2 is added." },
      { pregunta: "What is an object in Java?", opciones: ["A type of loop", "A concrete thing created with the mold of a class", "A .java file"], respuesta: 1, explicacion: "The class is the mold; with new, objects are created from it." },
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["6", "12", "24"], respuesta: 0, explicacion: "size() is 2 and get(0) is 4: 2 + 4 = 6." },
    ],
    visuales: ["Class and object", "Class: the mold (Mascota)", "Object: something concrete (Toby, 3 years old)", "new creates the object; the constructor fills it in"],
  },
  "codia-clase-java-3-usos": {
    nombre: "Java 3: where it's used — Android, companies and servers",
    descripcion: "Why banks, companies and Android trust Java, with a bank account example, an inventory HashMap and the price of its safety: writing more.",
    pasos: [
      "Java was born in 1995 with the promise of \"write once, run anywhere\": the same bytecode runs on Windows, Mac, Linux or a phone. Today it's in Android apps (along with Kotlin), in the systems of banks and big companies, in servers (with Spring) and in video games like the Java edition of Minecraft.",
      "Why companies choose it: strict types and the compiler catch many errors before the system reaches users, the JVM is very fast, and organizing everything in classes helps hundreds of people work on the same code.",
      "A typical company example: a bank account. The balance (saldo) is private (only the class itself touches it) and it's changed with methods that enforce the rules, like not withdrawing more than there is.\n⟦1⟧\n⟦2⟧",
      "An inventory with HashMap, Java's dictionary: it stores key-value pairs.\n⟦1⟧\n⟦2⟧",
      "The price of that safety: Java asks you to write more. What in Python is one print line, in Java goes inside a class and a main, with the type of everything declared:\n⟦1⟧\n⟦2⟧\nYou write more, but the compiler protects you more: that's why it shines in big systems that have to work for years.",
    ],
    quiz: [
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["-30", "Fondos insuficientes", "50"], respuesta: 1, explicacion: "80 is greater than 50, so it goes into the if and doesn't subtract anything." },
      { pregunta: "What is Java used for a lot?", opciones: ["Android apps and company systems", "Only web pages in the browser", "Spreadsheets"], respuesta: 0, explicacion: "Android, banks, companies and servers are its main ground." },
      { pregunta: "What does it mean for an attribute to be private?", opciones: ["That it's constant", "That only the code of its own class can use it", "That it's deleted when the program ends"], respuesta: 1, explicacion: "That way nobody changes the balance without going through the rules of depositing and withdrawing." },
    ],
    visuales: ["Java in the real world", "Android apps", "Banks and companies", "Servers with Spring", "Minecraft (Java edition)"],
  },
  "codia-clase-javascript-1-sintaxis": {
    nombre: "JavaScript 1: the language of the web",
    descripcion: "Why JavaScript is on every page, const and let, == versus ===, array methods and what its numbers are like.",
    pasos: [
      "JavaScript is the only language that every browser understands: every button that reacts, every menu that opens and every animation on a page uses it. Outside the browser it runs with Node.js.",
      "const for what doesn't change and let for what does. A const can't be reassigned:\n⟦1⟧\n⟦2⟧\n⟦3⟧\n⟦4⟧",
      "== compares by converting types and gives surprises; === requires the same value and the same type. Always use ===.\n⟦1⟧\n⟦2⟧",
      "Arrays come with very common methods: map transforms each element, filter keeps some of them and join puts them together in a text.\n⟦1⟧\n⟦2⟧",
      "All numbers are the same type (there are no separate integers): 7 / 2 gives 3.5 and, for the whole part, you use Math.floor. Decimals are stored in binary, which is why leftovers show up, as in 0.1 + 0.2.\n⟦1⟧\n⟦2⟧",
    ],
    quiz: [
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["7", "34", "Error"], respuesta: 1, explicacion: "With a text in the mix, + joins: \"3\" and \"4\" give \"34\"." },
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["1-4-9", "1-2-3", "2-4-6"], respuesta: 0, explicacion: "map squares each number and join puts them together with dashes." },
      { pregunta: "What's the difference between == and ===?", opciones: ["None", "=== also compares the type", "== is stricter"], respuesta: 1, explicacion: "5 == \"5\" gives true because it converts; 5 === \"5\" gives false." },
    ],
    visuales: ["JavaScript on the web", "The browser runs it on every page", "const and let declare variables", "Use === to compare", "map, filter and join for arrays"],
  },
  "codia-clase-javascript-2-objetos-y-funciones": {
    nombre: "JavaScript 2: objects, arrow functions and JSON",
    descripcion: "Objects with properties, regular and arrow functions, destructuring, JSON (the data format of the web) and the famous undefined.",
    pasos: [
      "An object groups named data, like a Python dictionary.\n⟦1⟧\n⟦2⟧",
      "There are two ways to write functions: the regular one and the shorter arrow one.\n⟦1⟧\n⟦2⟧",
      "Destructuring pulls properties out into variables, and the three dots copy one array into another.\n⟦1⟧\n⟦2⟧",
      "JSON is the format data travels in across the internet. JSON.stringify turns an object into text and JSON.parse does the opposite.\n⟦1⟧\n⟦2⟧",
      "Asking for a property that doesn't exist doesn't fail: it gives undefined.\n⟦1⟧\n⟦2⟧\nBut asking undefined for something does fail, and it's one of the most common errors on the web:\n⟦3⟧\n⟦4⟧",
    ],
    quiz: [
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["5", "6", "23"], respuesta: 1, explicacion: "p.a is 2 and p.b is 3: 2 × 3 = 6." },
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["{\"x\":1}", "{ x: 1 }", "x:1"], respuesta: 0, explicacion: "JSON puts the keys in double quotes and leaves no spaces." },
      { pregunta: "What happens when you run this?\n⟦1⟧", opciones: ["It prints undefined", "It fails with TypeError", "It prints 0"], respuesta: 1, explicacion: "You can't read a property of undefined." },
    ],
    visuales: ["A piece of data that travels across the internet", "An object in the browser", "JSON.stringify: turns it into text", "It travels to the server", "JSON.parse: it becomes an object again"],
  },
  "codia-clase-javascript-3-usos": {
    nombre: "JavaScript 3: where it's used — web pages, servers and apps",
    descripcion: "From the browser to servers and phones: React, Node.js, React Native and Electron, the idea of a callback and why so much flexibility calls for care.",
    pasos: [
      "In the browser, JavaScript changes the page when you do something: a click, typing, scrolling. Big pages use frameworks like React, Vue or Angular. Prodigia, for example, is built with React.",
      "Outside the browser it's everywhere: servers with Node.js, phone apps with React Native (like Prodigia's Android app) and desktop programs with Electron (like the VS Code editor).",
      "The web works with the idea of \"when this happens, do that\": you pass a function to another one so it calls it at the right moment. That function is called a callback.\n⟦1⟧\n⟦2⟧",
      "A shopping cart, typical of an online store: reduce goes through the list adding up the total.\n⟦1⟧\n⟦2⟧",
      "Advantage and caution: JavaScript is everywhere and is very flexible, but that flexibility brings surprises that give no warning:\n⟦1⟧\n⟦2⟧\nThat's why big projects usually move to TypeScript, which adds types.",
    ],
    quiz: [
      { pregunta: "Where does JavaScript run, besides the browser?", opciones: ["Only in the browser", "On servers, with Node.js", "On the JVM"], respuesta: 1, explicacion: "Node.js lets you use JavaScript outside the browser." },
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["9", "24", "234"], respuesta: 0, explicacion: "reduce adds everything starting at 0: 2 + 3 + 4 = 9." },
      { pregunta: "What is a callback?", opciones: ["A JavaScript error", "A function passed to another one so it calls it later", "A constant variable"], respuesta: 1, explicacion: "It's the basis of \"when this happens, do that\" on the web." },
    ],
    visuales: ["JavaScript in the real world", "Web pages: React, Vue, Angular", "Servers: Node.js", "Phone apps: React Native", "Desktop: Electron"],
  },
  "codia-clase-typescript-1-tipos": {
    nombre: "TypeScript 1: JavaScript with types",
    descripcion: "What TypeScript adds to JavaScript: type annotations, errors before running, inference and typed functions.",
    pasos: [
      "TypeScript is JavaScript with types. The compiler checks that each value is of the expected type and then generates normal JavaScript: the types disappear when running. Almost any valid JavaScript program is valid TypeScript.",
      "Annotations go after the name, with a colon:\n⟦1⟧\n⟦2⟧",
      "What in JavaScript would be an error when running (or a silent error), here doesn't even compile:\n⟦1⟧\n~~~salida\ncompilation error\n~~~",
      "You don't have to write every type: TypeScript deduces them (inference). It knows precios is a list of numbers and won't let you put text in it.\n⟦1⟧\n⟦2⟧\n⟦3⟧\n~~~salida\ncompilation error\n~~~",
      "Functions declare the type of their parameters and of their result, and whoever calls them wrong finds out before running.\n⟦1⟧\n⟦2⟧\n⟦3⟧\n~~~salida\ncompilation error\n~~~",
    ],
    quiz: [
      { pregunta: "What happens with this code?\n⟦1⟧", opciones: ["It stores \"5\"", "It doesn't compile: compilation error", "It stores 5"], respuesta: 1, explicacion: "x is a string and 5 is a number: the compiler rejects it." },
      { pregunta: "What's left of the types when the program runs?", opciones: ["Nothing: they're erased when compiling to JavaScript", "They're checked again on every line", "They're saved in a separate file"], respuesta: 0, explicacion: "Types only exist for the compiler; what runs is JavaScript." },
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["21", "73", "777"], respuesta: 0, explicacion: "n is a number: 7 × 3 = 21." },
    ],
    visuales: ["How TypeScript runs", "You write code with types", "tsc checks the types", "It generates JavaScript without types", "It runs like any JavaScript"],
  },
  "codia-clase-typescript-2-interfaces": {
    nombre: "TypeScript 2: interfaces, unions and null",
    descripcion: "Describing the shape of an object with interface, limiting values with union types and handling what can be null with care.",
    pasos: [
      "An interface describes the shape an object must have. A question mark marks an optional property.\n⟦1⟧\n⟦2⟧",
      "If a required property is missing, it doesn't compile:\n⟦1⟧\n~~~salida\ncompilation error\n~~~",
      "A union type limits the possible values. That way, a rank can only be one of the ones that exist:\n⟦1⟧\n⟦2⟧\n⟦3⟧\n~~~salida\ncompilation error\n~~~",
      "If something can be missing, you write it with | null, and the compiler makes you check it before using it.\n⟦1⟧\n⟦2⟧",
      "Why it matters: in JavaScript, forgetting that something can be null or undefined is one of the most common causes of errors on web pages. TypeScript turns that oversight into an editor warning before it reaches users.",
    ],
    quiz: [
      { pregunta: "What happens with this code?\n⟦1⟧", opciones: ["It compiles and x is \"1\"", "It doesn't compile: compilation error", "It compiles and x is 1"], respuesta: 1, explicacion: "x has to be a number and it's given a string." },
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["azul", "AZUL", "Azul"], respuesta: 1, explicacion: "c is a text: toUpperCase makes it uppercase." },
      { pregunta: "What is an interface for?", opciones: ["To draw a page's interface", "To describe the shape an object must have", "To import modules"], respuesta: 1, explicacion: "It says which properties it has and what type each one is." },
    ],
    visuales: ["TypeScript tools", "interface: the shape of an object", "prop?: optional property", "\"a\" | \"b\": only those values", "| null: it can be missing, you have to check it"],
  },
  "codia-clase-typescript-3-usos": {
    nombre: "TypeScript 3: where it's used — big projects and teams",
    descripcion: "Where TypeScript is used, how it helps a team, a realistic example with the data of a game, generics and when plain JavaScript is enough.",
    pasos: [
      "TypeScript is used wherever JavaScript would be, but in big projects: pages with React, Angular or Vue, servers with Node.js and phone apps with React Native. Microsoft created it in 2012, and today a good part of the web industry uses it. Prodigia is written in TypeScript.",
      "The advantage in a team: the editor autocompletes and flags errors as you type. If someone renames a property, TypeScript points out every place still using the old name:\n⟦1⟧\n~~~salida\ncompilation error\n~~~\nIn a project with thousands of files, that prevents a huge number of errors.",
      "A realistic example: describing the data of a game and calculating the accuracy.\n⟦1⟧\n⟦2⟧",
      "Generics let you write a function that works for any type without losing which one it is: T is \"whatever the type is\".\n⟦1⟧\n⟦2⟧",
      "The cost: you have to compile and write types. Rule of thumb: for a small script or a one-person project, JavaScript is enough; for a big project or one built by a team, TypeScript pays for itself.",
    ],
    quiz: [
      { pregunta: "What does it print?\n⟦1⟧", opciones: ["6", "123", "3"], respuesta: 0, explicacion: "reduce adds up the list: 1 + 2 + 3 = 6." },
      { pregunta: "Who created TypeScript?", opciones: ["Google", "Microsoft", "Oracle"], respuesta: 1, explicacion: "Microsoft introduced it in 2012." },
      { pregunta: "When is TypeScript a better fit than JavaScript?", opciones: ["In a ten-line script", "In big projects or ones built by a team", "Never: they're the same"], respuesta: 1, explicacion: "Types help many people change the code without breaking it." },
    ],
    visuales: ["TypeScript in the real world", "Big pages with React or Angular", "Servers with Node.js", "Apps with React Native", "Big teams: the editor flags the errors"],
  },
};
