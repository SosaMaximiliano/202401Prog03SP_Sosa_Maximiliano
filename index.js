const $ = (e) => document.getElementById(e);
const q = (e) => document.querySelectorAll(e);
const c = (e) => document.getElementsByClassName(e);
const url = "https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero";
let objetos = [];
let listado = [];

class Persona {
  constructor(id, nombre, apellido, fechaNacimiento) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.fechaNacimiento = fechaNacimiento;
  }

  toString() {
    return `ID: ${this.id}, Nombre: ${this.nombre}, Apellido: ${this.apellido}, Fecha de nacimiento: ${this.fechaNacimiento}`;
  }
}

class Ciudadano extends Persona {
  constructor(id, nombre, apellido, fechaNacimiento, dni) {
    super(id, nombre, apellido, fechaNacimiento);
    this.dni = dni;
  }

  toString() {
    return `${super.toString()}, DNI: ${this.dni}`;
  }
}

class Extranjero extends Persona {
  constructor(id, nombre, apellido, fechaNacimiento, paisOrigen) {
    super(id, nombre, apellido, fechaNacimiento);
    this.paisOrigen = paisOrigen;
  }

  toString() {
    return `${super.toString()}, Pais de origen: ${this.paisOrigen}`;
  }
}

//PUNTO 3
//CARGA INICIAL HTTP REQUEST
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

//CARGA INICIAL FETCH
function cargaInicialFetch() {
  mostrarSpinner();

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error de conexión");
      }
      return response.json();
    })
    .then((datos) => {
      console.log("OK");
      datos.forEach((e) => {
        let o = instanciarUnObjeto(e);
        listado.push(o);
      });

      crearTabla(listado);
      crearFormularioAbm();
    })
    .catch((error) => {
      console.error("Hubo un problema con la solicitud fetch:", error);
      alert("Error al cargar la tabla");
    })
    .finally(() => {
      cargarEventos();
      ocultarSpinner();
    });
}

//CARGA INICIAL ASYNC
async function cargaInicialAsync() {
  mostrarSpinner();
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const datos = await response.json();
    console.log("Datos recibidos:", datos); // Verificar datos recibidos
    datos.forEach((e) => {
      let o = instanciarUnObjeto(e);
      listado.push(o);
    });

    crearTabla(listado);
    crearFormularioAbm();
  } catch (error) {
    console.error("Hubo un problema con la solicitud fetch:", error);
    alert("Error al cargar la tabla");
  } finally {
    cargarEventos();
    ocultarSpinner();
  }
}

//INSTANCIA LOS OBJETOS DE UN LISTADO (NO SE USA)
function instanciarObjetos(listado) {
  let listadoAux = [];
  listado.forEach((e) => {
    if (e.dni) {
      listadoAux.push(
        new Ciudadano(e.id, e.nombre, e.apellido, e.fechaNacimiento, e.dni)
      );
    } else
      listadoAux.push(
        new Extranjero(
          e.id,
          e.nombre,
          e.apellido,
          e.fechaNacimiento,
          e.paisOrigen
        )
      );
  });
  return listadoAux;
}

//INSTANCIA UN OBJETO EN LA CLASE CORRESPONDIENTE
function instanciarUnObjeto(objeto) {
  let nuevoObjeto;

  if (objeto.dni) {
    nuevoObjeto = new Ciudadano(
      objeto.id,
      objeto.nombre,
      objeto.apellido,
      objeto.fechaNacimiento,
      objeto.dni
    );
  } else
    nuevoObjeto = new Extranjero(
      objeto.id,
      objeto.nombre,
      objeto.apellido,
      objeto.fechaNacimiento,
      objeto.paisOrigen
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
  limpiarEventos();
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

//MUESTRA U OCULTA LOS CAMPOS DE Extranjero O Ciudadano
function mostrarCamposExtranjero() {
  $("lbl-abm-dni").style.display = "none";
  $("abm-dni").style.display = "none";

  $("lbl-abm-paisOrigen").style.display = "";
  $("abm-paisOrigen").style.display = "";

  $("abm-paisOrigen").value = "";
}
function mostrarCamposCiudadano() {
  $("lbl-abm-paisOrigen").style.display = "none";
  $("abm-paisOrigen").style.display = "none";

  $("lbl-abm-dni").style.display = "";
  $("abm-dni").style.display = "";

  $("abm-dni").value = "";
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
    typeof objeto.fechaNacimiento === "number"
  )
    return true;
  return false;
}

function validarExtranjero(objeto) {
  if (
    validarPersona(objeto) &&
    typeof objeto.paisOrigen === "string" &&
    objeto.paisOrigen.trim() !== ""
  )
    return true;
  return false;
}

function validarCiudadano(objeto) {
  if (
    validarPersona(objeto) &&
    typeof objeto.dni === "number" &&
    objeto.dni > 0
  )
    return true;
  return false;
}

function limpiarEventos() {
  const abmAceptar = $("abmAceptar");
  const abmCancelar = $("abmCancelar");

  if (abmAceptar) {
    abmAceptar.removeEventListener("click", abmAltaAsync);
    abmAceptar.removeEventListener("click", abmModificacionPromesas);
    abmAceptar.removeEventListener("click", abmBaja);
  }

  if (abmCancelar) {
    abmCancelar.removeEventListener("click", ocultarDivAbm);
  }
}

function crearSelect() {
  // Crear el select para "Ciudadano" y "Extranjero"
  if (!$("abm-tipo")) {
    let divOption = $("divOption");
    let labelTipo = document.createElement("label");
    let selectTipo = document.createElement("select");
    let optionCiudadano = document.createElement("option");
    let optionExtranjero = document.createElement("option");

    divOption.appendChild(labelTipo);
    divOption.appendChild(selectTipo);

    labelTipo.innerText = "Tipo: ";
    selectTipo.setAttribute("id", "abm-tipo");

    optionCiudadano.value = "Ciudadano";
    optionCiudadano.innerText = "Ciudadano";

    optionExtranjero.value = "Extranjero";
    optionExtranjero.innerText = "Extranjero";

    selectTipo.appendChild(optionCiudadano);
    selectTipo.appendChild(optionExtranjero);

    // Añadir evento para mostrar campos específicos
    selectTipo.addEventListener("change", function () {
      if (selectTipo.value === "Ciudadano") {
        mostrarCamposCiudadano();
      } else {
        mostrarCamposExtranjero();
      }
    });
    // $("divFormAbm").insertBefore(selectTipo, divFormAbm.firstChild);
    $("divFormAbm").prepend(divOption);
    // $("divFormAbm").insertBefore(labelTipo, selectTipo);
  }
}

//ALTA ABM
function abmAlta() {
  mostrarSpinner();
  let objeto;
  let nombre = $("abm-nombre").value;
  let apellido = $("abm-apellido").value;
  let fechaNacimiento = parseInt($("abm-fechaNacimiento").value);
  let dni = parseFloat($("abm-dni").value);
  let paisOrigen = $("abm-paisOrigen").value;

  if (paisOrigen.trim() !== "") {
    objeto = {
      nombre: nombre,
      apellido: apellido,
      fechaNacimiento: fechaNacimiento,
      paisOrigen: paisOrigen,
    };
  } else if (dni !== "") {
    objeto = {
      nombre: nombre,
      apellido: apellido,
      fechaNacimiento: fechaNacimiento,
      dni: dni,
    };
  } else {
    alert("Hay campos vacios");
    ocultarSpinner();
  }

  if (validarExtranjero(objeto) || validarCiudadano(objeto)) {
    let opciones = {
      method: "POST",
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

//ABM ALTA HTTPREQUEST
function abmAltaHttp() {
  mostrarSpinner();
  let objeto;
  let nombre = $("abm-nombre").value;
  let apellido = $("abm-apellido").value;
  let fechaNacimiento = parseInt($("abm-fechaNacimiento").value);
  let dni = parseFloat($("abm-dni").value);
  let paisOrigen = $("abm-paisOrigen").value;

  if (paisOrigen.trim() !== "") {
    objeto = {
      nombre: nombre,
      apellido: apellido,
      fechaNacimiento: fechaNacimiento,
      paisOrigen: paisOrigen,
    };
  } else if (dni !== "") {
    objeto = {
      nombre: nombre,
      apellido: apellido,
      fechaNacimiento: fechaNacimiento,
      dni: dni,
    };
  } else {
    alert("Debe completar los campos de Extranjero o de Ciudadano.");
    ocultarSpinner();
    return;
  }
  let http = new XMLHttpRequest();
  http.onreadystatechange = function () {
    if (http.readyState == 4) {
      if (http.status == 200) {
        let response = JSON.parse(http.responseText);
        console.log("Elemento agregado con éxito con ID:", response.id);
        objeto.id = response.id;
        console.log("OK");
        objeto.id = response.id;
        let nuevoObjeto = instanciarUnObjeto(objeto);
        listado.push(nuevoObjeto);
        ocultarSpinner();
        crearTabla(listado);
        ocultarDivAbm();
        mostrarDivTabla();
      } else {
        console.log("FALLÓ");
        alert("Error al cargar la tabla");
        ocultarSpinner();
      }
    }
  };

  http.open("POST", url, true);
  http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  http.send(JSON.stringify(objeto));
}

//ABM ALTA ASYNC
async function abmAltaAsync() {
  limpiarEventos();
  mostrarSpinner();

  let nombre = $("abm-nombre").value;
  let apellido = $("abm-apellido").value;
  let fechaNacimiento = parseInt($("abm-fechaNacimiento").value);
  let dni = parseFloat($("abm-dni").value);
  let paisOrigen = $("abm-paisOrigen").value;

  let objeto;
  if (paisOrigen.trim() !== "") {
    objeto = {
      nombre: nombre,
      apellido: apellido,
      fechaNacimiento: fechaNacimiento,
      paisOrigen: paisOrigen,
    };
  } else if (dni !== "") {
    objeto = {
      nombre: nombre,
      apellido: apellido,
      fechaNacimiento: fechaNacimiento,
      dni: dni,
    };
  } else {
    alert("Debe completar los campos de Extranjero o de Ciudadano.");
    ocultarSpinner();
    return;
  }
  if (validarCiudadano(objeto) || validarExtranjero(objeto)) {
    let enviarSolicitud = () => {
      return new Promise((r, e) => {
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(objeto),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Error al cargar la tabla");
            }
            return response.json();
          })
          .then((data) => {
            r(data);
          })
          .catch((error) => {
            e(error);
          });
      });
    };

    try {
      let data = await enviarSolicitud();
      alert("Elemento agregado con éxito");
      objeto.id = data.id;
      let nuevoObjeto = instanciarUnObjeto(objeto);
      listado.push(nuevoObjeto);
      crearTabla(listado);
      ocultarDivAbm();
      mostrarDivTabla();
    } catch (error) {
      alert("Error en la solicitud:", error);
      console.log(error.message);
    } finally {
      ocultarSpinner();
    }
  } else {
    alert("No se pudieron validar los campos");
    ocultarSpinner();
  }
}

async function abmModificacion() {
  mostrarSpinner();
  let objeto = {
    id: parseInt($("abm-id").value),
    nombre: $("abm-nombre").value,
    apellido: $("abm-apellido").value,
    fechaNacimiento: parseInt($("abm-fechaNacimiento").value),
    dni: parseFloat($("abm-dni").value),
    paisOrigen: $("abm-paisOrigen").value,
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
    if (validarExtranjero(objeto) || validarCiudadano(objeto)) {
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

//ABM MODIFICACION PROMESAS
function abmModificacionPromesas() {
  limpiarEventos();
  mostrarSpinner();
  let id = parseInt($("abm-id").value);
  let nombre = $("abm-nombre").value;
  let apellido = $("abm-apellido").value;
  let fechaNacimiento = parseInt($("abm-fechaNacimiento").value);
  let dni = parseFloat($("abm-dni").value);
  let paisOrigen = $("abm-paisOrigen").value;

  let objeto;
  if (paisOrigen.trim() !== "") {
    objeto = {
      id: id,
      nombre: nombre,
      apellido: apellido,
      fechaNacimiento: fechaNacimiento,
      paisOrigen: paisOrigen,
    };
  } else if (dni !== "") {
    objeto = {
      id: id,
      nombre: nombre,
      apellido: apellido,
      fechaNacimiento: fechaNacimiento,
      dni: dni,
    };
  } else {
    alert("Debe completar los campos de Extranjero o de Ciudadano.");
    ocultarSpinner();
    return;
  }

  return new Promise((resolve, reject) => {
    if (validarCiudadano(objeto) || validarExtranjero(objeto)) {
      let indice = listado.findIndex((e) => e.id === id);
      if (indice !== -1) {
        for (let key in objeto) {
          if (objeto.hasOwnProperty(key)) {
            listado[indice][key] = objeto[key];
          }
        }
        ocultarSpinner();
        alert("Registro actualizado correctamente.");
        resolve(listado[indice]);
        crearTabla(listado);
        ocultarDivAbm();
        mostrarDivTabla();
      } else {
        ocultarSpinner();
        //alert("El objeto no se encuentra en la lista");
        resolve(false);
        ocultarDivAbm();
        mostrarDivTabla();
      }
    } else {
      ocultarSpinner();
      alert("Validación fallida");
      ocultarDivAbm();
      mostrarDivTabla();
    }
  });
}

//ABM BAJA
function abmBaja() {
  limpiarEventos();
  mostrarSpinner();

  let idElemento = $("abm-id").value;

  if (!isNaN(idElemento)) {
    fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: idElemento }),
    })
      .then((response) => {
        ocultarSpinner();
        if (response.ok) {
          return response.text();
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      })
      .then((data) => {
        let idElementoNum = parseInt(idElemento);
        let index = listado.findIndex(
          (persona) => persona.id === idElementoNum
        );
        listado.splice(index, 1);
        alert("Elemento eliminado correctamente");
        crearTabla(listado);
        ocultarDivAbm();
        mostrarDivTabla();
      })
      .catch((error) => {
        console.error("Error al eliminar elemento:", error);
        ocultarSpinner();
        ocultarDivAbm();
        mostrarDivTabla();
        alert("No se pudo realizar la operacion.");
      });
  } else {
    alert("ID no válido");
    ocultarSpinner();
  }
}
// EVENTOS
function cargarEventos() {
  setTimeout(() => {
    const abmAceptar = $("abmAceptar");
    const abmCancelar = $("abmCancelar");
    const btnAgregar = $("btnAgregar");
    const btnMod = q(".t-btn-modificar");
    const btnEli = q(".t-btn-eliminar");
    $("abm-id").setAttribute("disabled", "true");

    // ABM ALTA
    btnAgregar.addEventListener("click", function () {
      limpiarEventos();
      setTimeout(() => {
        $("tituloABM").innerText = "ALTA";
        let inputs = q(".abm-input");
        inputs.forEach((e) => (e.value = ""));
        mostrarCamposCiudadano();
        mostrarDivAbm();
        ocultarDivTabla();
        crearSelect();
        abmAceptar.addEventListener("click", abmAltaAsync);
      }, 1);
    });

    // ABM MODIFICACION
    for (let i = 0; i < btnMod.length; i++) {
      btnMod[i].addEventListener("click", function () {
        limpiarEventos();
        if ($("divOption")) $("divOption").innerHTML = "";
        $("tituloABM").innerText = "MODIFICAR";
        if (listado[i] instanceof Extranjero) mostrarCamposExtranjero();
        else if (listado[i] instanceof Ciudadano) mostrarCamposCiudadano();
        mostrarDivAbm();
        ocultarDivTabla();
        cargarAbm(i);
        abmAceptar.addEventListener("click", abmModificacionPromesas);
      });
    }

    // ABM ELIMINAR
    for (let i = 0; i < btnEli.length; i++) {
      btnEli[i].addEventListener("click", function () {
        limpiarEventos();
        if ($("divOption")) $("divOption").innerHTML = "";
        $("tituloABM").innerText = "ELIMINAR";
        if (listado[i] instanceof Extranjero) mostrarCamposExtranjero();
        else if (listado[i] instanceof Ciudadano) mostrarCamposCiudadano();
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
  }, 1);
}

window.addEventListener("load", cargaInicial);
//window.addEventListener("load", cargaInicialFetch);
//window.addEventListener("load", cargaInicialAsync);
