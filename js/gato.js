'use strict'
/************************
    VARIABLES GLOBALES
*************************/
var canvas; var context; //variables del canvas y su contexto
var comentario; //variable del DOM donde se imprimira los comentarios
var restablecer;
var gameover = false; //variables para saber si alguien ya perdio
var tiradas = 0; //tiradas hechas
var fichaArray = new Array(); //array de  las fichas
var FILAS = 3; //numero de las filas
var COLUMNAS = 3; //numero de las filas
var fichas_X = 0;
var fichas_O = 0;
var grosorLinea = 3; //grosor de las lineas separativas de las fichas
var anchoFicha = 0; //ancho de las fichas
var fuenteFicha = "bold 100px Arial";
var colorFichaX = "#5895DA";
var colorFichaO = "#DA5858";
var tiempoParaPensarMaquina = 1000; //tiempo par que piense la maquina expresado en milisegundos
var tiempoParaMostrarBoton = 1000; //tiempo para mostrar el boton para volver a jugar

/************************
        CLASSES
*************************/
/***CLASE DE LAS FICHAS***/
class Ficha {
  constructor(f, c) {
    this.f = f;
    this.c = c;
    this.valor = "";
    this.peso = 0;
  }
  pinta(context, valor){
    this.valor = valor;
    //context.fillStyle = "#5895DA";
    //context.fillRect(0,0,100,100);
    context.font = fuenteFicha;
    context.fillStyle = (valor=="x")?colorFichaX:colorFichaO;
    //context.fillText('x', 0, 100, )
    var xt = ((this.c)*anchoFicha)+20;
    var yt = ((this.f+1)*anchoFicha)-25;
    context.fillText(this.valor, xt,yt,anchoFicha,anchoFicha);
  }
}


/************************
        FUNCIONES
*************************/

/***ASIGNAMOS VALORES A LAS VARIABLES DEPENDIENTES DEL CANVAS***/
function ComenzarJuego() {
  restablecer.style.display = 'none';
  context.clearRect(0, 0, canvas.width, canvas.height);
  tiradas = 0;
  gameover = false;
  anchoFicha = canvas.width / 3;
  context.lineWidth = grosorLinea;
  CrearFichas();
  DibujarTablero();
  canvas.addEventListener('click', SeleccionaFicha, false);
  Comentar('Pulse su Jugada...');
}

/***DIBUJAMOS EL TABLERO***/
function DibujarTablero(){
  for(let i = 0; i < COLUMNAS; i++){
    //dibujamos linea horizontal -
    context.beginPath();
    context.moveTo(i * anchoFicha, 0);
    context.lineTo(i * anchoFicha, canvas.width);
    context.stroke();
    //dibujamos linea vertical |
    context.beginPath();
    context.moveTo(0, i * anchoFicha);
    context.lineTo(canvas.width, i * anchoFicha);
    context.stroke();
  }
}

/***ESCRIBIMOS COMENTARIOS***/
function Comentar(texto) {
  comentario.innerHTML = texto;
}

/***CREAMOS FICHAS***/
function CrearFichas() {
  for(let f = 0; f < FILAS; f++){
    fichaArray[f] = new Array(3);
    for(let c = 0; c < COLUMNAS; c++){
      fichaArray[f][c] = new Ficha(f, c);
    }
  }
  console.log(fichaArray);
}

/**AJUSTAMOS POSICION DEL PUNTERO RELATIVAMENTE A UN ELEMENTO**/
function AjustarPosicion(e, elemento){
  var clientRect = elemento.getBoundingClientRect();
  return {
    x: Math.round(e.x - clientRect.left),
    y: Math.round(e.y - clientRect.top)
  }
}

/***SELECCIONAMOS FICHA***/
function SeleccionaFicha(e) {
  var pos = AjustarPosicion(e, canvas);
  var c = Math.trunc(((pos.x>=canvas.width)?canvas.width-1:pos.x) / anchoFicha);
  var f = Math.trunc(((pos.y>=canvas.height)?canvas.height-1:pos.y) / anchoFicha);
  if(fichaArray[f][c].valor == ""){
    console.log('Has Seleccionado la ficha: '+f+', '+c);
    tiradas++;
    canvas.removeEventListener('click', SeleccionaFicha, false);
    fichaArray[f][c].pinta(context, 'x');
    console.log('tiradas: '+tiradas);
    Comentar('Pensando...');
    setTimeout(JugadaMaquina, tiempoParaPensarMaquina);
  }
  else {
    Comentar('Esta ficha ya esta en uso!');
  }
}

/************************
CALCULO PESOS DE LAS FICHAS
*************************/
function CalculoPeso(ficha, x, o) {
  if(ficha.valor == ""){
    if(x == 0 && o == 2){
      ficha.peso += 10;
    } else if (x == 2 && o == 0) {
      ficha.peso += 6;
    } else if (x == 0 && o == 1) {
      ficha.peso += 3;
    } else {
      ficha.peso += 1;
    }
  }
  else {
    ficha.peso = 0;
  }
}

/************************
 VERIFICAR FIN DEL JUEGO
*************************/
function VerificarGameover(x, o) {
  var fin = false;
  if(x == 3) {
    fin = true;
    Comentar('Has Ganado!');
    setTimeout(GameOver, tiempoParaMostrarBoton);
  }
  if(o == 3){
    fin = true;
    Comentar('Has Perdido');
    setTimeout(GameOver, tiempoParaMostrarBoton);
  }
  return fin;
}

/************************
FUNCION AL TERMINAR EL JUEGO
*************************/
function GameOver() {
  if(gameover){
    //si hay un ganador
  }else {
    //si no hay un ganador
  }
  restablecer.style.display = '';
}

/************************
    JUGADA MAQUINA
*************************/
function JugadaMaquina() {
  tiradas++;
  console.log('tiradas: '+tiradas);
  if(gameover == false){
    //verificamos y calculamos el peso de las fichas
    VerificaFilas(true);
    VerificaColumnas(true);
    VerificaDiagonal_1(true);
    VerificaDiagonal_2(true);
    //seleccionamos la mejor Jugada

    var mejorJugada = 0;
    var x, y;
		for(let f = 0; f < FILAS; f++){
      for(let c = 0; c < COLUMNAS; c++){
        if(fichaArray[f][c].peso > mejorJugada){
          mejorJugada = fichaArray[f][c].peso;
          y = f; x = c;
        }
      }
    }
    //aplicamos Jugada
    if(tiradas < 10)fichaArray[y][x].pinta(context, 'o');
    //verificamos sin calcular el peso de las fichas
    VerificaFilas(false);
    VerificaColumnas(false);
    VerificaDiagonal_1(false);
    VerificaDiagonal_2(false);
    //verificamos si alguien gano
    if(!gameover){
      if(tiradas < 9){
        canvas.addEventListener('click', SeleccionaFicha, false);
        Comentar('Pulse su Jugada...');
      }else {
        Comentar('Gato!');
        setTimeout(GameOver, tiempoParaMostrarBoton);
      }
    }
  }
}

/************************
    VERIFICAR FILAS,
    COLUMNAS, DIAGONALES
*************************/
//filas
function VerificaFilas(calculaPeso) {
  if(!gameover){
    for(let f = 0; f < FILAS; f++){
      fichas_X = 0; fichas_O = 0;
      for(let c = 0; c < COLUMNAS; c++){
        fichas_X += (fichaArray[f][c].valor=='x')?1:0;
        fichas_O += (fichaArray[f][c].valor=='o')?1:0;
      }
      if(calculaPeso){
        for(let c = 0; c < COLUMNAS; c++){
          CalculoPeso(fichaArray[f][c], fichas_X, fichas_O);
        }
      }
      gameover = VerificarGameover(fichas_X, fichas_O);
      if(gameover) break;
    }
  }
}
//columnas
function VerificaColumnas(calculaPeso) {
  if(!gameover){
    for(let c = 0; c < COLUMNAS; c++){
      fichas_X = 0; fichas_O = 0;
      for(let f = 0; f < FILAS; f++){
        fichas_X += (fichaArray[f][c].valor=='x')?1:0;
        fichas_O += (fichaArray[f][c].valor=='o')?1:0;
      }
      if(calculaPeso){
        for(let f = 0; f < FILAS; f++){
          CalculoPeso(fichaArray[f][c], fichas_X, fichas_O);
        }
      }
      gameover = VerificarGameover(fichas_X, fichas_O);
      if(gameover) break;
    }
  }
}
//diagonal_1_\
function VerificaDiagonal_1(calculaPeso) {
  if(!gameover){
    fichas_X = 0; fichas_O = 0;
    for(let i = 0; i < FILAS; i++){
      fichas_X += (fichaArray[i][i].valor=='x')?1:0;
      fichas_O += (fichaArray[i][i].valor=='o')?1:0;
    }
    if(calculaPeso){
      for(let i = 0; i < FILAS; i++){
        CalculoPeso(fichaArray[i][i], fichas_X, fichas_O);
      }
    }
    gameover = VerificarGameover(fichas_X, fichas_O);
  }
}
//diagonal_2_/
function VerificaDiagonal_2(calculaPeso) {
  if(!gameover){
    fichas_X = 0; fichas_O = 0;
    var j = 2;
    for(let i = 0; i < FILAS; i++){
      fichas_X += (fichaArray[j][i].valor=='x')?1:0;
      fichas_O += (fichaArray[j][i].valor=='o')?1:0;
      j--;
    }
    if(calculaPeso){
      j = 2;
      for(let i = 0; i < FILAS; i++){
        CalculoPeso(fichaArray[j][i], fichas_X, fichas_O);
        j--;
      }
    }
    gameover = VerificarGameover(fichas_X, fichas_O);
  }
}

/************************
    EJECUTAR JUEGO
*************************/

canvas = document.querySelector('#canvas');
comentario = document.querySelector('#comentarios p');
restablecer = document.querySelector('#restablecer');
restablecer.addEventListener('click', ComenzarJuego, false);
if(canvas && canvas.getContext && comentario && restablecer){
  context = canvas.getContext('2d');
  if(context){
    console.log('contexto creado correctamente!');
    ComenzarJuego();
  }
  else {
    alert('error al crear tu contexto');
  }
}
