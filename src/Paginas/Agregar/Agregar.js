import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { ThreeDots } from 'react-loader-spinner';
import './Agregar.css'

const Agregar = ({ role }) => {
    let datosAgregadosBandera = [];
    const [datos, setDatos] = useState([]);
    const [filtros, setFiltros] = useState({});
    const [datosAgregados, setDatosAgregados] = useState([]);
    const [datosCompletosAgregados, setDatosCompletosAgregados] = useState([]);
    const [datosMovil, setDatosMovil] = useState([]);
    const [filtrosAgregados, setFiltrosAgregados] = useState({});
    const [ordenarCampo, setOrdenarCampo] = useState('nombre');
    const [ordenarCampoAgregados, setOrdenarCampoAgregados] = useState('nombreCompleto');
    const [ordenarOrden, setOrdenarOrden] = useState('asc');
    const [ordenarOrdenAgregados, setOrdenarOrdenAgregados] = useState('asc');
    const [totalItems, setTotalItems] = useState(0);
    const [totalItemsAgregados, setTotalItemsAgregados] = useState(0);
    const [filasSeleccionadas, setFilasSeleccionadas] = useState(new Set());
    const [todasSeleccionadas, setTodasSeleccionadas] = useState(false);
    const [carpeta, setCarpeta] = useState("");
    const [placa, setPlaca] = useState("");
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const [isPlacaValida, setIsPlacaValida] = useState(true);
    const [selectedItemSegmento, setSelectedItemSegmento] = useState('');
    const [selectedItemArea, setSelectedItemArea] = useState('');
    const [selectedItemTipoFacturacion, setSelectedItemTipoFacturacion] = useState('');
    const [selectedItemTipoMovil, setSelectedItemTipoMovil] = useState('');
    const [selectedItemCoordinador, setSelectedItemCoordinador] = useState('Seleccionar opción');
    const [segmentoOptions, setSegmentoOptions] = useState([]);
    const [areaOptions, setAreaOptions] = useState([]);
    const [tipoFacturacionOptions, setTipoFacturacionOptions] = useState([]);
    const [tipoMovilOptions, setTipoMovilOptions] = useState([]);
    const [coordinadores, setCoordinadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtrosLimpiados, setFiltrosLimpiados] = useState(false);

    const cargarDatosCoordinador = () => {
        fetch(`${process.env.REACT_APP_API_URL}/capacidades/coordinador`)
            .then(response => response.json())
            .then(data => {
                const coordDirect = new Set();
                data.forEach(item => {
                    coordDirect.add(item.coordinador);
                    coordDirect.add(item.director);
                });
                const unirCoordDirect = Array.from(coordDirect).sort((a, b) => a.localeCompare(b));

                setCoordinadores(unirCoordDirect);
            })
            .catch(error => console.log('Error al cargar los datos: ' + error.message));
    };

    const cargarDatosMovil = () => {
        fetch(`${process.env.REACT_APP_API_URL}/capacidades/movil`)
            .then(response => response.json())
            .then(data => {
                setDatosMovil(data);

                const opcionesFiltradasFacturacion = data
                    .map(dato => dato.tipo_facturacion);

                const opcionesUnicasOrdenadasFacturacion = [...new Set(opcionesFiltradasFacturacion)].sort((a, b) =>
                    a.localeCompare(b)
                );

                setTipoFacturacionOptions(opcionesUnicasOrdenadasFacturacion)

                const opcionesFiltradasArea = data
                    .map(dato => dato.area);

                const opcionesUnicasOrdenadasArea = [...new Set(opcionesFiltradasArea)].sort((a, b) =>
                    a.localeCompare(b)
                );

                setAreaOptions(opcionesUnicasOrdenadasArea)

                const opcionesAdicionales = ['PARQUE AUTOMOTOR', 'LOGISTICA', 'RECURSOS HUMANOS', 'IT', 'PRODUCCION'];

                const opcionesFiltradasSegmento = data
                    .filter(dato => dato.segmento !== 'NA')
                    .map(dato => dato.segmento);

                const todasLasOpciones = [...opcionesAdicionales, ...opcionesFiltradasSegmento];

                const opcionesUnicasOrdenadasSegmento = [...new Set(todasLasOpciones)].sort((a, b) =>
                    a.localeCompare(b)
                );

                setSegmentoOptions(opcionesUnicasOrdenadasSegmento);
            })
            .catch(error => console.log('Error al cargar los datos: ' + error.message));
    };

    const cargarDatos = () => {
        fetch(`${process.env.REACT_APP_API_URL}/capacidades/continuaEnPlantaSinCapacidad`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role }),
        })
            .then(response => response.json())
            .then(data => {
                setDatos(data);
                setTotalItems(data.length);
                setLoading(false);
            })
            .catch(error => {
                console.log('Error al cargar los datos: ' + error.message);
                setLoading(false);
            });
    };

    const cargarDatosAgregados = () => {
        fetch(`${process.env.REACT_APP_API_URL}/capacidades/todo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role }),
        })
            .then(response => response.json())
            .then(data => {
                setDatosCompletosAgregados(data);
                setDatosAgregados(data);
                setTotalItemsAgregados(data.length);
            })
            .catch(error => console.log('Error al cargar los datos: ' + error.message));
    };

    useEffect(() => {
        cargarDatosCoordinador();
        //setDatosCompletosAgregados([]);
        //setDatosAgregados([]);
        //datosAgregadosBandera = [];
        //setDatos([]);
        cargarDatos();
        cargarDatosAgregados();
        cargarDatosMovil();
        //BotonLimpiarFiltros();
    }, []);

    const BotonLimpiarFiltros = () => {
        setFiltrosAgregados({});
        setFiltros({});
        document.querySelectorAll('.tabla-container input[type="text"]').forEach(input => {
            input.value = '';
        });
        setSelectedItemSegmento('Seleccionar opción');
        setSelectedItemArea('Seleccionar opción');
        setSelectedItemTipoFacturacion('Seleccionar opción');
        setSelectedItemTipoMovil('Seleccionar opción');
        setSelectedItemCoordinador('Seleccionar opción');
        setCarpeta("");
        setPlaca("");
    };

    const clickEncabezados = (columna) => {
        if (ordenarCampo === columna) {
            // Cambiar el orden de clasificación si ya se ha ordenado por la misma columna
            setOrdenarOrden(ordenarOrden === 'asc' ? 'desc' : 'asc');
        } else {
            // Si se selecciona una nueva columna, ordenarla de forma ascendente
            setOrdenarCampo(columna);
            setOrdenarOrden('asc');
        }
    };

    useEffect(() => {
        setTotalItems(filtrarDatos.length);
        setTotalItemsAgregados(filtrarDatosAgregados.length);
    }, [filtros, filtrosAgregados]);

    const clickAplicarFiltros = (e, columna) => {
        const Valor = e.target.value;
        setFiltros({ ...filtros, [columna]: Valor });
    };

    const filtrarDatos = datos.filter(item => {
        for (let key in filtros) {
            if (filtros[key] && item[key] && !item[key].toLowerCase().includes(filtros[key].toLowerCase())) {
                return false;
            }
        }
        return true;
    });

    const ordenarDatos = filtrarDatos.sort((a, b) => {
        if (ordenarCampo) {
            // Convertir los valores a minúsculas para asegurar una comparación insensible a mayúsculas y minúsculas
            const valueA = typeof a[ordenarCampo] === 'string' ? a[ordenarCampo].toLowerCase() : a[ordenarCampo];
            const valueB = typeof b[ordenarCampo] === 'string' ? b[ordenarCampo].toLowerCase() : b[ordenarCampo];

            if (valueA < valueB) {
                return ordenarOrden === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return ordenarOrden === 'asc' ? 1 : -1;
            }
            return 0;
        } else {
            return 0;
        }
    });

    const getIconoFiltro = (columna) => {
        if (ordenarCampo === columna) {
            return ordenarOrden === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
        }
        return 'fas fa-sort';
    };

    const clickFila = (nit) => {
        const nuevasFilasSeleccionadas = new Set(filasSeleccionadas);
        if (nuevasFilasSeleccionadas.has(nit)) {
            nuevasFilasSeleccionadas.delete(nit);
        } else {
            nuevasFilasSeleccionadas.add(nit);
        }
        setFilasSeleccionadas(nuevasFilasSeleccionadas);

        setTodasSeleccionadas(nuevasFilasSeleccionadas.size === ordenarDatos.length);
    };

    const clickSeleccionarTodas = () => {
        if (todasSeleccionadas) {
            setFilasSeleccionadas(new Set());
            setTodasSeleccionadas(false);
        } else {
            const todas = new Set();
            ordenarDatos.forEach(item => todas.add(item.nit));
            setFilasSeleccionadas(todas);
            setTodasSeleccionadas(true);
        }
    };

    const handleSelectTipoFacturacionSegmentoArea = (fact, segm, area) => {

        console.log("-----")
        setSelectedItemTipoFacturacion(fact);
        setSelectedItemSegmento(segm);
        setSelectedItemArea(area);
        let filtroSegm = segm;

        const opcionesAdicionales = ['PARQUE AUTOMOTOR', 'LOGISTICA', 'RECURSOS HUMANOS', 'IT', 'PRODUCCION'];

        if (opcionesAdicionales.includes(segm) && segm !== selectedItemSegmento) {
            segm = "NA";
            area = "ADMON";
            fact = "ADMON";
            console.log("solo admon")
            setSelectedItemArea("ADMON");
            setSelectedItemTipoFacturacion("ADMON");
        } else if (segm !== selectedItemSegmento && area) {
            setSelectedItemArea("");
            console.log("borro area")
            area = "";
            setSelectedItemTipoFacturacion("");
            fact = "";
        } else if (area !== selectedItemArea) {
            setSelectedItemTipoFacturacion("");
            fact = "";
        } else if (fact === "ADMON") {
            segm = "NA";
            area = "ADMON";
        }

        const opcionesFiltradas = datosMovil.filter(dato => (!fact || dato.tipo_facturacion === fact) && (!segm || dato.segmento === segm) && (!area || dato.area === area));
        console.log(opcionesFiltradas)

        if (fact !== "ADMON" && segm !== selectedItemSegmento) {
            const opcionesFiltradasArea = opcionesFiltradas.map(dato => dato.area);
            const opcionesFiltradasArea2 = [...new Set(opcionesFiltradasArea)].sort((a, b) => a.localeCompare(b));
            setAreaOptions(opcionesFiltradasArea2);
            console.log(opcionesFiltradasArea2)
            console.log("Estoy aqui")
        } else if (opcionesAdicionales.includes(filtroSegm) && segm === "NA") {
            console.log("Esra pasando")
            const opcionesFiltradasArea = opcionesFiltradas.map(dato => dato.area);
            const opcionesFiltradasArea2 = [...new Set(opcionesFiltradasArea)].sort((a, b) => a.localeCompare(b));
            setAreaOptions(opcionesFiltradasArea2)
            console.log(opcionesFiltradasArea2)
            console.log("Estoy aqui 2")
        }

        const opcionesFiltradasTipoMovil = opcionesFiltradas.map(dato => dato.tipo_movil);
        const opcionesFiltradasTipoMovil2 = [...new Set(opcionesFiltradasTipoMovil)].sort((a, b) => a.localeCompare(b));
        setTipoMovilOptions(opcionesFiltradasTipoMovil2);

        setSelectedItemTipoMovil('Seleccionar opción');
    };

    const handleSelectTipoMovil = (item) => {
        setSelectedItemTipoMovil(item);
    };

    const handleSelectCoordinador = (item) => {
        setSelectedItemCoordinador(item);
    };

    const validarCapacidadMovil = (data) => {

        if (selectedItemTipoFacturacion === 'EVENTO' && selectedItemTipoMovil !== 'BACKUP') {
            const datos = {
                placa: data.PLACA,
                tipoFacturacion: selectedItemTipoFacturacion,
                tipoDeMovil: selectedItemTipoMovil,
                cedula: data.CEDULA,
                coordinador: selectedItemCoordinador
            };

            const movilesExistente = datosCompletosAgregados.filter(movil => movil.PLACA === data.PLACA);
            const movilesExistenteBandera = datosAgregadosBandera.filter(movil => movil.PLACA === data.PLACA);

            if (movilesExistente.length > 0) {
                const capacidadMaxima = parseFloat(movilesExistente[0].PERSONAS) * parseFloat(movilesExistente[0].TURNOS);
                const capacidadActual = movilesExistente.length;
                let capacidadActualBandera = 0;

                if (movilesExistenteBandera.length > 0) {
                    capacidadActualBandera = movilesExistenteBandera.length;
                }

                if ((capacidadActual + capacidadActualBandera) >= capacidadMaxima) {
                    return false;
                }

                datosAgregadosBandera.push(datos);
                return true;

            } else if (movilesExistente.length === 0 && movilesExistenteBandera.length === 0) {
                datosAgregadosBandera.push(datos);
                return true;
            } else if (movilesExistente.length === 0 && movilesExistenteBandera.length > 0) {
                const tipoDeMovilBandera = datosMovil.filter(movil => movil.tipo_movil === movilesExistenteBandera[0].tipoDeMovil);
                const capacidadMaxima = parseFloat(tipoDeMovilBandera[0].personas) * parseFloat(tipoDeMovilBandera[0].turnos);
                const capacidadActual = movilesExistenteBandera.length;

                if (capacidadActual >= capacidadMaxima) {
                    return false;
                }

                datosAgregadosBandera.push(datos);
                return true;
            }
        } else {
            return true;
        }
    };

    const limpiarFiltros = () => {
        setFiltrosAgregados({});
        setFiltros({});
        setFiltrosLimpiados(true);
    };

    useEffect(() => {
        if (filtrosLimpiados) {
            setFiltrosLimpiados(false);
            if (!selectedItemSegmento || selectedItemSegmento === 'Seleccionar opción') {
                toast.error('Por favor selecciona un Segmento', { className: 'toast-error' });
                return;
            }
            if (!selectedItemArea || selectedItemArea === 'Seleccionar opción') {
                toast.error('Por favor selecciona un Area', { className: 'toast-error' });
                return;
            }
            if (!selectedItemTipoFacturacion || selectedItemTipoFacturacion === 'Seleccionar opción') {
                toast.error('Por favor selecciona un Tipo de Facturación', { className: 'toast-error' });
                return;
            }
            if (!selectedItemTipoMovil || selectedItemTipoMovil === 'Seleccionar opción') {
                toast.error('Por favor selecciona un Tipo de Móvil', { className: 'toast-error' });
                return;
            }
            if (!selectedItemCoordinador || selectedItemCoordinador === 'Seleccionar opción') {
                toast.error('Por favor selecciona un Coordinador', { className: 'toast-error' });
                return;
            }
            if (!carpeta) {
                toast.error('Por favor ingresa una Carpeta', { className: 'toast-error' });
                return;
            }
            if (!placa && selectedItemTipoFacturacion === "EVENTO") {
                toast.error('Por favor ingresa una placa', { className: 'toast-error' });
                return;
            }
            if (filasSeleccionadas.size === 0) {
                toast.error('Por favor selecciona al menos una cédula', { className: 'toast-error' });
                return;
            }

            const cedulasSeleccionadas = Array.from(filasSeleccionadas).map(cedula => {
                return ordenarDatos.find(item => item.nit === cedula).nit;
            });

            const promises = cedulasSeleccionadas.map(cedula => {
                const data = {
                    id: 1,
                    carpeta: carpeta,
                    placa: placa,
                    segmento: selectedItemSegmento,
                    area: selectedItemArea,
                    tipoFacturacion: selectedItemTipoFacturacion,
                    tipoMovil: selectedItemTipoMovil,
                    cedula: cedula,
                    coordinador: selectedItemCoordinador
                };

                if (!validarPlaca(data)) {
                    toast.error('Placa no válida, Ejemplo: ABC001 o ABC01D', { className: 'toast-error' });
                    return Promise.reject('Placa no válida');
                }

                if (!validarCapacidadMovil(data)) {
                    toast.error(`La movil con placa ${data.placa} ha excedido su capacidad.`);
                } else {
                    return fetch(`${process.env.REACT_APP_API_URL}/capacidades/agregarPersonal`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    })
                        .then(response => {
                            if (!response.ok) {
                                toast.error('No se cargaron los datos', { className: 'toast-error' });
                                throw new Error(`Error al agregar los datos: ${response.status}`);
                            } else {
                                toast.success(`Datos cargados para la cedula: ${cedula}`, { className: 'toast-success' });
                            }
                            return response.json();
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            toast.error(`Error al enviar la fila: ${error.message}`, { className: 'toast-error' });
                            console.log('Error al enviar los datos al backend: ' + error.message);
                        });
                }
            });

            Promise.all(promises)
                .then(() => {
                    setDatosAgregados([]);
                    setDatos([]);
                    setFilasSeleccionadas(new Set());
                    setTodasSeleccionadas(false);
                    BotonLimpiarFiltros();
                    datosAgregadosBandera = [];
                    setFiltrosLimpiados(false);
                    return delay(1000);
                })
                .then(() => {
                    cargarDatos();
                    cargarDatosAgregados();
                })
                .catch(error => {
                    console.log('Error al aplicar los cambios: ' + error.message);
                });
        }
    }, [filtrosLimpiados]);

    const botonAplicar = () => {
        limpiarFiltros();
    };

    const clickEncabezadosAgregados = (columna) => {
        if (ordenarCampoAgregados === columna) {
            // Cambiar el orden de clasificación si ya se ha ordenado por la misma columna
            setOrdenarOrdenAgregados(ordenarOrdenAgregados === 'asc' ? 'desc' : 'asc');
        } else {
            // Si se selecciona una nueva columna, ordenarla de forma ascendente
            setOrdenarCampoAgregados(columna);
            setOrdenarOrdenAgregados('asc');
        }
    };

    const clickAplicarFiltrosAgregados = (e, columna) => {
        const Valor = e.target.value;
        setFiltrosAgregados({ ...filtrosAgregados, [columna]: Valor });
    };

    const filtrarDatosAgregados = datosAgregados.filter(item => {
        for (let key in filtrosAgregados) {
            if (filtrosAgregados[key] && item[key] && !item[key].toLowerCase().includes(filtrosAgregados[key].toLowerCase())) {
                return false;
            }
        }
        return true;
    });

    const ordenarDatosAgregados = filtrarDatosAgregados.sort((c, d) => {
        if (ordenarCampoAgregados) {
            // Convertir los valores a minúsculas para asegurar una comparación insensible a mayúsculas y minúsculas
            const valueC = typeof c[ordenarCampoAgregados] === 'string' ? c[ordenarCampoAgregados].toLowerCase() : c[ordenarCampoAgregados];
            const valueD = typeof d[ordenarCampoAgregados] === 'string' ? d[ordenarCampoAgregados].toLowerCase() : d[ordenarCampoAgregados];

            if (valueC < valueD) {
                return ordenarOrdenAgregados === 'asc' ? -1 : 1;
            }
            if (valueC > valueD) {
                return ordenarOrdenAgregados === 'asc' ? 1 : -1;
            }
            return 0;
        } else {
            return 0;
        }
    });

    const getIconoFiltroAgregados = (columna) => {
        if (ordenarCampoAgregados === columna) {
            return ordenarOrdenAgregados === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
        }
        return 'fas fa-sort';
    };

    const formatearValorEsperado = (valorEsperado) => {
        const valor = valorEsperado !== "null" ? valorEsperado : 0;
        const formatter = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        });
        return formatter.format(valor);
    };

    const validarPlaca = (item) => {
        const placa = item.placa;
        if (item.tipoFacturacion === 'EVENTO' && item.tipoMovil !== 'BACKUP') {

            if (placa && placa.length === 6) {
                const primerosTres = placa.substring(0, 3);
                const cuartoYQuinto = placa.substring(3, 5);
                const sexto = placa.substring(5, 6);

                const regexLetras = /^[A-Z]+$/;
                const regexNumeros = /^[0-9]+$/;

                if (regexLetras.test(primerosTres) && regexNumeros.test(cuartoYQuinto) && (regexLetras.test(sexto) || regexNumeros.test(sexto))) {
                    return true;
                }
            }
        } else if (item.tipoFacturacion === 'ADMON' || (item.tipoFacturacion === 'EVENTO' && item.tipoMovil === 'BACKUP')) {
            if (placa.length === 6) {
                const primerosTres = placa.substring(0, 3);
                const cuartoYQuinto = placa.substring(3, 5);
                const sexto = placa.substring(5, 6);

                const regexLetras = /^[A-Z]+$/;
                const regexNumeros = /^[0-9]+$/;

                if (regexLetras.test(primerosTres) && regexNumeros.test(cuartoYQuinto) && (regexLetras.test(sexto) || regexNumeros.test(sexto))) {
                    return true;
                }
            } else if (placa === "null" || placa === "") {
                return true;
            }
        }
        return false;
    };

    return (
        <div className='Agregar'>
            {loading ? (
                <div className="CargandoPagina">
                    <ThreeDots
                        type="ThreeDots"
                        color="#0B1A46"
                        height={200}
                        width={200}
                    />
                    <p>... Cargando Datos ...</p>
                </div>
            ) : (
                <div className='Principal-Agregar'>
                    <div className="Principal-Agregar-Botones">
                        <div className='primeraFila'>
                            <div className='segmento'>
                                <label htmlFor="uname">Segmento:</label>
                                <select
                                    id="tipoFacturacion"
                                    className="form-select"
                                    value={selectedItemSegmento}
                                    onChange={(e) => {
                                        handleSelectTipoFacturacionSegmentoArea(selectedItemTipoFacturacion, e.target.value, selectedItemArea);
                                    }}
                                >
                                    <option value="">Seleccione una opción</option>
                                    {segmentoOptions.map((option, index) => (
                                        <option key={index} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='area'>
                                <label htmlFor="uname">Area:</label>
                                <select
                                    id="tipoFacturacion"
                                    className="form-select"
                                    value={selectedItemArea}
                                    onChange={(e) => handleSelectTipoFacturacionSegmentoArea(selectedItemTipoFacturacion, selectedItemSegmento, e.target.value)}
                                    disabled={!selectedItemSegmento}
                                >
                                    <option value="">Seleccione una opción</option>
                                    {areaOptions.map((option, index) => (
                                        <option key={index} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='tipoFacturacion'>
                                <label htmlFor="uname">Tipo Facturación:</label>
                                <select
                                    id="tipoFacturacion"
                                    className="form-select"
                                    value={selectedItemTipoFacturacion}
                                    onChange={(e) => handleSelectTipoFacturacionSegmentoArea(e.target.value, selectedItemSegmento, selectedItemArea)}
                                    disabled={!selectedItemSegmento || !selectedItemArea}
                                >
                                    <option value="">Seleccione una opción</option>
                                    {tipoFacturacionOptions.map((option, index) => (
                                        <option key={index} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='tipoMovil'>
                                <label htmlFor="uname">Tipo Movil:</label>
                                <select
                                    id="tipoMovil"
                                    className="form-select"
                                    value={selectedItemTipoMovil}
                                    onChange={(e) => handleSelectTipoMovil(e.target.value)}
                                    disabled={!selectedItemTipoFacturacion || !selectedItemSegmento || !selectedItemArea}
                                >
                                    <option value="">Seleccione una opción</option>
                                    {tipoMovilOptions.map((option, index) => (
                                        <option key={index} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className='segundaFila'>
                            <div className='coordinador'>
                                <label htmlFor="uname">Coordinador:</label>
                                <select
                                    id="tipoMovil"
                                    className="form-select"
                                    value={selectedItemCoordinador}
                                    onChange={(e) => handleSelectCoordinador(e.target.value)}
                                >
                                    <option value="">Seleccione una opción</option>
                                    {coordinadores.map((option, index) => (
                                        <option key={index} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="Principal-Agregar-Botones-Red form-group carpeta">
                                <label htmlFor="carpeta" className="form-label">Carpeta:</label>
                                <input type="text" className="form-control" placeholder="Ingresa la Carpeta" value={carpeta} onChange={(e) => setCarpeta(e.target.value)} required />
                                <div className="invalid-feedback">Campo Obligatorio</div>
                            </div>

                            <div className="Principal-Agregar-Botones-Red form-group placa">
                                <label htmlFor="placa" className="form-label">Placa:</label>
                                <input type="text" className="form-control" placeholder="Ingresa la Placa" value={placa} onChange={(e) => setPlaca(e.target.value)} maxLength={6} required />
                                {!isPlacaValida && <p style={{ color: 'red' }}>Placa no válida</p>}
                                <div className="invalid-feedback">Campo Obligatorio</div>
                            </div>

                            <div className='Botones-Accion'>
                                <label htmlFor="accion" className="form-label">Accion:</label>
                                <div className='botones'>
                                    <button className='Boton-Limpiar btn btn-secondary' onClick={BotonLimpiarFiltros}>Limpiar</button>
                                    <button className='Boton-Aplicar btn btn-secondary' onClick={botonAplicar}>Aplicar</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="Principal-Agregar-Pendientes">
                        <div className='Titulo'>
                            <span>Pendientes</span>
                        </div>
                        <div className="tabla-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>
                                            <div>
                                                <span>Seleccionar</span>
                                                <input className='Checkbox-Encabezado' type="checkbox" checked={todasSeleccionadas} onChange={clickSeleccionarTodas} style={{ cursor: 'pointer' }} />
                                            </div>
                                        </th>
                                        {['nit', 'nombre', 'cargo', 'perfil', 'director'].map(columna => (
                                            <th key={columna}>
                                                <div>
                                                    {columna.charAt(0).toUpperCase() + columna.slice(1)} <i className={getIconoFiltro(columna)} onClick={() => clickEncabezados(columna)} style={{ cursor: 'pointer' }}></i>
                                                </div>
                                                <input type="text" onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        clickAplicarFiltros(e, columna);
                                                    }
                                                }}
                                                />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {ordenarDatos.map((item) => (
                                        <tr key={item.nit} className={filasSeleccionadas.has(item.nit) ? 'fila-seleccionada' : ''}>
                                            <td>
                                                <input className='Checkbox-Filas' type="checkbox" checked={filasSeleccionadas.has(item.nit)} style={{ cursor: 'pointer' }} onChange={() => clickFila(item.nit)} />
                                            </td>
                                            <td>{item.nit}</td>
                                            <td>{item.nombre}</td>
                                            <td>{item.cargo}</td>
                                            <td>{item.perfil}</td>
                                            <td>{item.director}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className='piePagina'>
                            <p>Total de items: {totalItems}</p>
                            <div className='Botones-piePagina'>

                            </div>
                        </div>
                    </div>

                    <div className="Principal-Agregar-Agregados">
                        <div className='Titulo'>
                            <span>Agregados</span>
                        </div>
                        <div className="tabla-container">
                            <table>
                                {ordenarDatosAgregados.length > 0 && (
                                    <thead>
                                        <tr>
                                            {Object.keys(ordenarDatosAgregados[0])
                                                .filter(key => !['id', 'CODIGO_SAP', 'CONTRATISTA', 'TIPO_CARRO', 'TIPO_VEHICULO'].includes(key))
                                                .map(columna => (
                                                    <th key={columna}>
                                                        <div>
                                                            {columna.charAt(0).toUpperCase() + columna.slice(1).toLowerCase()}{" "}
                                                            <i
                                                                className={getIconoFiltroAgregados(columna)}
                                                                onClick={() => clickEncabezadosAgregados(columna)}
                                                                style={{ cursor: "pointer" }}
                                                            ></i>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    clickAplicarFiltrosAgregados(e, columna);
                                                                }
                                                            }}
                                                        />
                                                    </th>
                                                ))}
                                        </tr>
                                    </thead>
                                )}
                                <tbody>
                                    {ordenarDatosAgregados.map((item) => (
                                        <tr key={item.cedula}>
                                            {Object.keys(item).slice(1)
                                                .filter(key => key !== 'CODIGO_SAP')
                                                .filter(key => key !== 'CONTRATISTA')
                                                .filter(key => key !== 'TIPO_CARRO')
                                                .map((key, i) => (
                                                    <td key={key}>
                                                        {key === 'VALOR_ESPERADO' ? formatearValorEsperado(item[key]) : item[key]}
                                                    </td>
                                                ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className='piePagina'>
                            <p>Total de items: {totalItemsAgregados}</p>
                            <div className='Botones-piePagina'>

                            </div>
                        </div>
                    </div>
                    <ToastContainer />
                </div>
            )}
        </div>
    );
};

export default Agregar;