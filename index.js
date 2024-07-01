const $ = (e) => document.getElementById(e);
const q = (e) => document.querySelectorAll(e);
const c = (e) => document.getElementsByClassName(e);
const url = "http://127.0.0.1/PersonasEmpleadosClientes.php";
let objetos = [];
let listado = [];

class Persona {
  constructor(id, nombre, apellido, edad) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.edad = edad;
  }

  toString() {
    return `ID: ${this.id}, Nombre: ${this.nombre}, Apellido: ${this.apellido}, Edad: ${this.edad}`;
  }

  toJson() {
    return JSON.stringify({
      id: this.id,
      nombre: this.nombre,
      apellido: this.apellido,
      edad: this.edad,
    });
  }
}

class Empleado extends Persona {
  constructor(id, nombre, apellido, edad, sueldo, ventas) {
    super(id, nombre, apellido, edad);
    this.sueldo = sueldo;
    this.ventas = ventas;
  }

  toString() {
    return `${super.toString()}, Sueldo: ${this.sueldo}, Ventas: ${
      this.ventas
    }`;
  }

  toJson() {
    return JSON.stringify({
      ...JSON.parse(super.toJson()),
      sueldo: this.sueldo,
      ventas: this.ventas,
    });
  }
}

class Cliente extends Persona {
  constructor(id, nombre, apellido, edad, telefono, compras) {
    super(id, nombre, apellido, edad);
    this.telefono = telefono;
    this.compras = compras;
  }

  toString() {
    return `${super.toString()}, Sueldo: ${this.telefono}, Ventas: ${
      this.compras
    }`;
  }

  toJson() {
    return JSON.stringify({
      ...JSON.parse(super.toJson()),
      telefono: this.telefono,
      compras: this.compras,
    });
  }
}

//PUNTO 3
//UTILIZANDO HTTP REQUEST
function cargaInicial() {
  mostrarSpinner();
  let http = new XMLHttpRequest();
  http.onreadystatechange = function () {
    if (http.readyState == 4)
      if (http.status == 200) {
        console.log("OK");
        objetos = JSON.parse(http.response);
        objetos.forEach((e) => {
          let o = instanciarUnObjeto(e);
          listado.push(o);
        });
        ocultarSpinner();
        crearTabla(listado);
        crearFormularioAbm();
        cargarEventos();
      } else {
        console.log("FALLÓ");
        alert("Error al cargar la tabla");
      }
  };

  http.open("GET", url, true);
  http.send();
}

//INSTACIA LOS OBJETOS DE UN LISTADO (NO SE USA)
function instanciarObjetos(listado) {
  let listadoAux = [];
  listado.forEach((e) => {
    if (e.ventas) {
      listadoAux.push(
        new Empleado(e.id, e.nombre, e.apellido, e.edad, e.sueldo, e.ventas)
      );
    } else
      listadoAux.push(
        new Cliente(e.id, e.nombre, e.apellido, e.edad, e.telefono, e.compras)
      );
  });
  return listadoAux;
}

//INSTANCIA UN OBJETO EN LA CLASE CORRESPONDIENTE
function instanciarUnObjeto(objeto) {
  let nuevoObjeto;

  if (objeto.ventas) {
    nuevoObjeto = new Empleado(
      objeto.id,
      objeto.nombre,
      objeto.apellido,
      objeto.edad,
      objeto.sueldo,
      objeto.ventas
    );
  } else
    nuevoObjeto = new Cliente(
      objeto.id,
      objeto.nombre,
      objeto.apellido,
      objeto.edad,
      objeto.telefono,
      objeto.compras
    );

  return nuevoObjeto;
}

// POR SI ALGUN OBJETO TIENE MAS CAMPOS QUE OTRO
function contarCampos(listado) {
  let max = 0;
  listado.forEach((e) => {
    if (Object.keys(e).length > max) max = Object.keys(e).length;
  });
  return max;
}

// ESTO DEVUELVE LAS KEYS PARA LAS CABECERAS
function traerKeys(listado) {
  let keys = [];
  listado.forEach((e) => {
    Object.keys(e).forEach((k) => {
      if (!keys.includes(k)) {
        keys.push(k);
      }
    });
  });

  return keys;
}

//CREAR Y ACTUALIZA TABLA DINAMICA. RECIBE LISTADO
function crearTabla(listado) {
  //LIMPIAR TABLA
  let tablaExiste = document.querySelector("#formTabla");
  let btnExiste = document.querySelector("#btnAgregar");
  if (tablaExiste != null) tablaExiste.remove();
  if (btnExiste != null) btnExiste.remove();

  let keys = traerKeys(listado);
  let tabla = document.createElement("table");
  let tHead = document.createElement("thead");
  let tBody = document.createElement("tbody");
  let tCabecera = document.createElement("tr");

  tabla.appendChild(tHead);
  tabla.appendChild(tBody);
  tHead.appendChild(tCabecera);

  tabla.setAttribute("id", "formTabla");

  //CABECERA
  keys.forEach((e) => {
    let celda = document.createElement("th");
    celda.innerText = e.toUpperCase();
    tCabecera.appendChild(celda);
    // celda.style.border = "1px solid #000";
  });

  //FILAS
  listado.forEach((e) => {
    let fila = document.createElement("tr");
    fila.setAttribute("class", "tFila");
    tBody.appendChild(fila);

    keys.forEach((f) => {
      let celda = document.createElement("td");
      fila.appendChild(celda);
      celda.innerText = e[f] !== undefined ? e[f] : "N/A";
      // celda.style.border = "1px solid #000";
    });

    //BOTONES
    let btnModificar = document.createElement("button");
    let btnEliminar = document.createElement("button");
    fila.append(btnModificar);
    fila.append(btnEliminar);
    btnModificar.innerText = "MODIFICAR";
    btnEliminar.innerText = "ELIMINAR";

    btnModificar.setAttribute("class", "t-btn-modificar");
    btnEliminar.setAttribute("class", "t-btn-eliminar");
  });

  // tabla.style.border = "1px solid #000";

  //BOTON AGREGAR
  let divFormListado = document.getElementById("divFormListado");
  let btnAgregar = document.createElement("button");
  btnAgregar.setAttribute("id", "btnAgregar");
  btnAgregar.innerText = "Agregar Elemento";

  divFormListado.appendChild(tabla);
  divFormListado.appendChild(btnAgregar);
}

//CREAR FORMULARIO ABM
function crearFormularioAbm() {
  //CREO TODOS LOS OBJETOS
  let divFormAbm = document.getElementById("divFormAbm");
  let divBtnAbm = document.createElement("div");
  let btnAceptar = document.createElement("button");
  let btnCancelar = document.createElement("button");
  let titulo = document.createElement("h2");
  let keys = traerKeys(listado);
  let contenedor = document.createElement("div");
  contenedor.setAttribute("id", "divOption");

  //SETEO ATRIBUTOS
  titulo.setAttribute("id", "tituloABM");
  divBtnAbm.setAttribute("class", "btn-formAbm");
  btnAceptar.setAttribute("id", "abmAceptar");
  btnCancelar.setAttribute("id", "abmCancelar");

  btnAceptar.innerText = "Aceptar";
  btnCancelar.innerText = "Cancelar";

  divFormAbm.append(contenedor);
  divFormAbm.append(titulo);

  //CREO UN INPUT POR CADA CAMPO EXISTENTE
  keys.forEach((e) => {
    let label = document.createElement("label");
    let campo = document.createElement("input");

    label.innerText = `${e.toUpperCase()}: `;

    label.setAttribute("id", `lbl-abm-${e}`);
    campo.setAttribute("id", `abm-${e}`);
    campo.setAttribute("class", "abm-input");

    divFormAbm.appendChild(label);
    divFormAbm.appendChild(campo);
  });

  divBtnAbm.appendChild(btnAceptar);
  divBtnAbm.appendChild(btnCancelar);
  divFormAbm.appendChild(divBtnAbm);

  document.getElementById("divFormAbm").style.display = "none";
}

//MUESTRA U OCULTA LOS FORMULARIOS SEGUN CORRESPONDA (NO LO USO)
function mostrarOcultarForm() {
  let divFormListado = document.getElementById("divFormListado");
  let divFormAbm = document.getElementById("divFormAbm");

  divFormAbm.style.display == "none"
    ? (divFormAbm.style.display = "flex")
    : (divFormAbm.style.display = "none");

  divFormListado.style.display == "none"
    ? (divFormListado.style.display = "")
    : (divFormListado.style.display = "none");
}

//MUESTRA U OCULTA EL DIV DE LA TABLA
function mostrarDivTabla() {
  $("divFormListado").style.display = "";
  cargarEventos();
}
function ocultarDivTabla() {
  $("divFormListado").style.display = "none";
}

//MUESTRA U OCULTA EL DIV DEL FORMULARIO ABM
function mostrarDivAbm() {
  $("divFormAbm").style.display = "";
}
function ocultarDivAbm() {
  $("divFormAbm").style.display = "none";
}

//MUESTRA U OCULTA EL DIV DEL SPINNER
function mostrarSpinner() {
  $("spinner-overlay").style.display = "flex";
}
function ocultarSpinner() {
  $("spinner-overlay").style.display = "none";
}

//MUESTRA U OCULTA LOS CAMPOS DE CLIENTE O EMPLEADO
function mostrarCamposCliente() {
  $("lbl-abm-sueldo").style.display = "none";
  $("lbl-abm-ventas").style.display = "none";
  $("abm-sueldo").style.display = "none";
  $("abm-ventas").style.display = "none";

  $("lbl-abm-compras").style.display = "";
  $("lbl-abm-telefono").style.display = "";
  $("abm-compras").style.display = "";
  $("abm-telefono").style.display = "";

  $("abm-compras").value = "";
  $("abm-telefono").value = "";
}
function mostrarCamposEmpleado() {
  $("lbl-abm-compras").style.display = "none";
  $("lbl-abm-telefono").style.display = "none";
  $("abm-compras").style.display = "none";
  $("abm-telefono").style.display = "none";

  $("lbl-abm-sueldo").style.display = "";
  $("lbl-abm-ventas").style.display = "";
  $("abm-sueldo").style.display = "";
  $("abm-ventas").style.display = "";

  $("abm-sueldo").value = "";
  $("abm-ventas").value = "";
}

//FUNCION PARA CARGAR ABM CON LOS CAMPOS DE LA FILA
function cargarAbm(indice) {
  let inputs = q(".abm-input");
  let td = q(".tFila")[indice].querySelectorAll("td");

  for (let i = 0; i < td.length; i++) {
    inputs[i].value = td[i].innerText;
  }
}

function validarPersona(objeto) {
  if (
    typeof objeto.nombre === "string" &&
    objeto.nombre.trim() !== "" &&
    typeof objeto.apellido === "string" &&
    objeto.apellido.trim() !== "" &&
    objeto.edad > 15
  )
    return true;
  return false;
}

function validarCliente(objeto) {
  if (
    validarPersona(objeto) &&
    typeof objeto.compras === "number" &&
    objeto.compras > 0 &&
    typeof objeto.telefono === "string" &&
    objeto.telefono.trim() !== ""
  )
    return true;
  return false;
}

function validarEmpleado(objeto) {
  if (
    validarPersona(objeto) &&
    typeof objeto.sueldo === "number" &&
    objeto.sueldo > 0 &&
    typeof objeto.ventas === "number" &&
    objeto.ventas > 0
  )
    return true;
  return false;
}

//ALTA ABM
function abmAlta() {
  mostrarSpinner();
  let objeto;
  let id = parseInt($("abm-id").value);
  let nombre = $("abm-nombre").value;
  let apellido = $("abm-apellido").value;
  let edad = parseInt($("abm-edad").value);
  let sueldo = parseFloat($("abm-sueldo").value);
  let ventas = parseInt($("abm-ventas").value);
  let compras = parseInt($("abm-compras").value);
  let telefono = $("abm-telefono").value;

  if (compras !== "" && telefono.trim() !== "") {
    objeto = {
      id: id,
      nombre: nombre,
      apellido: apellido,
      edad: edad,
      compras: compras,
      telefono: telefono,
    };
  } else if (sueldo !== "" && ventas !== "") {
    objeto = {
      id: id,
      nombre: nombre,
      apellido: apellido,
      edad: edad,
      sueldo: sueldo,
      ventas: ventas,
    };
  } else {
    alert("Hay campos vacios");
    ocultarSpinner();
  }

  if (validarCliente(objeto) || validarEmpleado(objeto)) {
    let opciones = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(objeto),
    };

    fetch(url, opciones)
      .then((response) => {
        ocultarSpinner();
        if (!response.ok) {
          console.log(response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        objeto.id = data.id;
        let nuevoObjeto = instanciarUnObjeto(objeto);
        listado.push(nuevoObjeto);
        ocultarSpinner();
        alert("Objeto ingresado correctamente");
        crearTabla(listado);
        ocultarDivAbm();
        mostrarDivTabla();
      })
      .catch((error) => {
        ocultarSpinner();
        console.error(error);
        ocultarDivAbm();
        mostrarDivTabla();
        alert("ALTA - Error de red");
      });
  } else {
    ocultarSpinner();
    alert("No se pudieron validar los campos ingresados");
  }
}

//USA METODO PUT PORQUE POST NO CONECTA
async function abmModificacion() {
  mostrarSpinner();
  let objeto = {
    id: parseInt($("abm-id").value),
    nombre: $("abm-nombre").value,
    apellido: $("abm-apellido").value,
    edad: parseInt($("abm-edad").value),
    sueldo: parseFloat($("abm-sueldo").value),
    ventas: parseInt($("abm-ventas").value),
    compras: parseInt($("abm-compras").value),
    telefono: $("abm-telefono").value,
  };

  let opciones = {
    // method: "POST",
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(objeto),
  };

  let indice = listado.findIndex((e) => e.id == objeto.id);
  if (indice != -1) {
    if (validarCliente(objeto) || validarEmpleado(objeto)) {
      try {
        const response = await fetch(url, opciones);
        if (!response.ok) {
          console.error(response.status, response.statusText);
          ocultarSpinner();
          ocultarDivAbm();
          mostrarDivTabla();
          alert("No se pudo conectar");
        } else {
          let contenido = await response.json();
          //Modificar los campos
          for (let key in objeto) {
            if (
              objeto.hasOwnProperty(key) &&
              listado[indice].hasOwnProperty(key)
            ) {
              listado[indice][key] = objeto[key];
            }
          }
          ocultarSpinner();
          console.log("Actualización exitosa:", contenido);
          alert("Registro actualizado correctamente.");
          crearTabla(listado);
          ocultarDivAbm();
          mostrarDivTabla();
        }
      } catch (error) {
        console.error(error);
        ocultarSpinner();
        alert("MODIFICAR - Error de red");
        ocultarDivAbm();
        mostrarDivTabla();
      }
    } else {
      ocultarSpinner();
      alert("No se pudieron validar los datos");
    }
  } else {
    ocultarSpinner();
    alert("El objeto no se encuentra en la lista");
  }
}

//USA METODO GET PORQUE DELETE NO CONECTA
async function abmBaja() {
  mostrarSpinner();

  let opciones = {
    // method: "DELETE",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  let idABorrar = $("abm-id").value;
  let indice = listado.findIndex((e) => e.id == idABorrar);
  if (indice != -1) {
    try {
      const response = await fetch(url, opciones);
      if (!response.ok) {
        console.error(response.status, response.statusText);
        ocultarSpinner();
        ocultarDivAbm();
        mostrarDivTabla();
        alert("No se pudo conectar");
      } else {
        listado.splice(indice, 1);
        ocultarSpinner();
        console.log("Eliminación exitosa");
        alert("Registro eliminado correctamente.");
        crearTabla(listado);
        ocultarDivAbm();
        mostrarDivTabla();
      }
    } catch (error) {
      ocultarSpinner();
      console.error(error);
      alert("ELIMINAR - Error de red");
      ocultarDivAbm();
      mostrarDivTabla();
    }
  } else {
    ocultarSpinner();
    alert("El objeto no se encuentra en la lista");
  }
}

function limpiarEventos() {
  abmAceptar.removeEventListener("click", abmAlta);
  abmAceptar.removeEventListener("click", abmModificacion);
  abmAceptar.removeEventListener("click", abmBaja);
}

function crearSelect() {
  // Crear el select para "Empleado" y "Cliente"
  if (!$("abm-tipo")) {
    let divOption = $("divOption");
    let labelTipo = document.createElement("label");
    let selectTipo = document.createElement("select");
    let optionEmpleado = document.createElement("option");
    let optionCliente = document.createElement("option");

    divOption.appendChild(labelTipo);
    divOption.appendChild(selectTipo);

    labelTipo.innerText = "Tipo: ";
    selectTipo.setAttribute("id", "abm-tipo");

    optionEmpleado.value = "Empleado";
    optionEmpleado.innerText = "Empleado";

    optionCliente.value = "Cliente";
    optionCliente.innerText = "Cliente";

    selectTipo.appendChild(optionEmpleado);
    selectTipo.appendChild(optionCliente);

    // Añadir evento para mostrar campos específicos
    selectTipo.addEventListener("change", function () {
      if (selectTipo.value === "Empleado") {
        mostrarCamposEmpleado();
      } else {
        mostrarCamposCliente();
      }
    });
    // $("divFormAbm").insertBefore(selectTipo, divFormAbm.firstChild);
    $("divFormAbm").prepend(divOption);
    // $("divFormAbm").insertBefore(labelTipo, selectTipo);
  }
}
// EVENTOS
function cargarEventos() {
  const abmAceptar = $("abmAceptar");
  const abmCancelar = $("abmCancelar");
  const btnAgregar = $("btnAgregar");
  const btnMod = q(".t-btn-modificar");
  const btnEli = q(".t-btn-eliminar");
  $("abm-id").setAttribute("disabled", "true");

  // ABM ALTA
  btnAgregar.addEventListener("click", function () {
    limpiarEventos();
    $("tituloABM").innerText = "ALTA";
    let inputs = q(".abm-input");
    inputs.forEach((e) => (e.value = ""));
    mostrarCamposEmpleado();
    mostrarDivAbm();
    ocultarDivTabla();
    crearSelect();
    abmAceptar.addEventListener("click", abmAlta);
  });

  // ABM MODIFICACION
  for (let i = 0; i < btnMod.length; i++) {
    btnMod[i].addEventListener("click", function () {
      limpiarEventos();
      if ($("divOption")) $("divOption").innerHTML = "";
      $("tituloABM").innerText = "MODIFICAR";
      if (listado[i] instanceof Cliente) mostrarCamposCliente();
      else if (listado[i] instanceof Empleado) mostrarCamposEmpleado();
      mostrarDivAbm();
      ocultarDivTabla();
      cargarAbm(i);
      abmAceptar.addEventListener("click", abmModificacion);
    });
  }

  // ABM ELIMINAR
  for (let i = 0; i < btnEli.length; i++) {
    btnEli[i].addEventListener("click", function () {
      limpiarEventos();
      if ($("divOption")) $("divOption").innerHTML = "";
      $("tituloABM").innerText = "ELIMINAR";
      if (listado[i] instanceof Cliente) mostrarCamposCliente();
      else if (listado[i] instanceof Empleado) mostrarCamposEmpleado();
      mostrarDivAbm();
      ocultarDivTabla();
      cargarAbm(i);
      abmAceptar.addEventListener("click", abmBaja);
    });
  }

  // OCULTAR FORM ABM CON CANCELAR
  abmCancelar.addEventListener("click", function () {
    ocultarDivAbm();
    mostrarDivTabla();
  });
}

window.addEventListener("load", cargaInicial);
