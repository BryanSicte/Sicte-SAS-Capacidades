import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import '../Principal/Principal.css';
import { ToastContainer, toast } from 'react-toastify';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'react-toastify/dist/ReactToastify.css';

let datosAgregadosBandera = [];

const ValidarPersonal = ({ role }) => {
    const [datos, setDatos] = useState([]);
    const [datosAgregados, setDatosAgregados] = useState([]);
    const [datosMovil, setDatosMovil] = useState([]);
    const [filtros, setFiltros] = useState({});
    const [error, setError] = useState('');
    const [ordenarCampo, setOrdenarCampo] = useState('nombreCompleto');
    const [ordenarOrden, setOrdenarOrden] = useState('asc');
    const [totalItems, setTotalItems] = useState(0);
    const [filasSeleccionadas, setFilasSeleccionadas] = useState(new Set());
    const [todasSeleccionadas, setTodasSeleccionadas] = useState(false);

    const opcionesTipoMovilValidas = new Set([
        'AUXILIAR DE PROYECTO', 'BACKOFFICE', 'CONTRATISTA', 'COORDINADOR', 'DIBUJANTE', 'DISEÑADOR DE REDES HFC Y FIBRA', 'FORMADOR', 'GESTOR DE RUTA', 'LIDER DE ACOMETIDAS', 'LIDER DE DISEÑO', 'MOVIL DE APOYO (UNI/BIDI)', 'SUPERVISOR',
        'BACKUP', 'CUADRILLA INSTALACIÓN DOBLE EN CARRO', 'CUADRILLA INSTALACIÓN DOBLE EN MOTO', 'CUADRILLA INSTALACIÓN SENCILLA EN CARRO', 'CUADRILLA INSTALACIÓN SENCILLA EN MOTO', 'CUADRILLA MANTENIMIENTO SENCILLA EN MOTO', 'INGENIERO CONFIGURACIONES NO ESTÁNDAR F.O', 'MO PEFO MOVIL 3P 1T', 'MO PEFO MOVIL 3P 2T', 'MOTORIZADO - SDS', 'MOVIL DE EMPALMERIA 2P', 'MOVIL DE EMPALMERIA 3P', 'MOVIL DE EMPALMERIA 4P', 'MOVIL DE TENDIDO 3P', 'MOVIL DE TENDIDO 4P', 'MOVIL INFRAESTRUCTURA - ELECTRIFICADORAS 3P 1T', 'MOVIL INFRAESTRUCTURA - ELECTRIFICADORAS 4P 1T', 'MOVIL MANTENIMIENTO DROP F.O', 'MOVIL PROYECTOS HFC 4P', 'PEFO MEDIDOR DIURNO', 'PL CUADRILLA ACOMETIDAS', 'PL CUADRILLA VISITA TECNICA', 'TIPO CUADRILLA 1 - 2P 1T + Moto', 'TIPO CUADRILLA 2 - 2P 2T + Moto', 'TIPO CUADRILLA 3 - 2P 3T + Moto', 'TIPO CUADRILLA 4 - 3P 3T + Moto', 'UNIDAD DE SERVICIO  INTEGRAL_ COAXIAL+FO TIPO FURGON 3P - 1T', 'UNIDAD DE SERVICIO INTEGRAL _P.E  RUIDO TIPO FURGON 3P - 1T', 'UNIDAD DE SERVICIO INTEGRAL _P.E  TIPO FURGON POTENCIA 2P - 1T', 'UNIDAD DE SERVICIO INTEGRAL _P.E PREVENTIVO EDIFICIOS TIPO CARRY 2P - 1T', 'UNIDAD DE SERVICIO INTEGRAL _P.E PREVENTIVO EDIFICIOS TIPO CARRY 3P - 1T', 'UNIDAD DE SERVICIO INTEGRAL _P.E PREVENTIVO TIPO CARRY 2P - 1T', 'UNIDAD DE SERVICIO INTEGRAL _P.E PREVENTIVO TIPO FURGON 10P - 1T', 'UNIDAD DE SERVICIO INTEGRAL _P.E PREVENTIVO TIPO FURGÓN 2P - 1T', 'UNIDAD DE SERVICIO INTEGRAL _P.E PREVENTIVO TIPO FURGÓN 2P - 2T', 'UNIDAD DE SERVICIO INTEGRAL _P.E PREVENTIVO TIPO FURGON 4P - 1T', 'UNIDAD DE SERVICIO INTEGRAL _P.E PREVENTIVO TIPO FURGON 5P - 1T', 'UNIDAD DE SERVICIO INTEGRAL _P.E PREVENTIVO TIPO FURGON 6P - 1T', 'UNIDAD DE SERVICIO INTEGRAL _P.E PREVENTIVO TIPO FURGON 8P - 1T', 'UNIDAD DE SERVICIO INTEGRAL _P.E TIPO CARRY 2P - 1T', 'UNIDAD DE SERVICIO INTEGRAL _P.E TIPO FURGÓN 2P - 1T', 'UNIDAD DE SERVICIO INTEGRAL _P.E TIPO FURGÓN 2P - 2T', 'UNIDAD DE SERVICIO INTEGRAL _P.E TIPO FURGÓN 2P - 3T', 'UNIDAD DE SERVICIO INTEGRAL _P.E TIPO MOTO 1P - 1T'
    ]);

    const cargarDatosMovil = () => {
        fetch('http://localhost:8080/capacidad/Movil')
            .then(response => response.json())
            .then(data => {
                setDatosMovil(data);
            })
            .catch(error => setError('Error al cargar los datos: ' + error.message));
    };

    const cargarDatos = () => {
        fetch('http://localhost:8080/capacidad/ContinuaEnPlanta', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role }),
        })
            .then(response => response.json())  
            .then(data => {

                const datosFormateados = data.map(item => {
                    const newItem = { ...item };
    
                    Object.keys(newItem).forEach(key => {
                        if (key === 'movil') {
                            newItem[key] = parseFloat(item[key]).toFixed(3);
                        } else if (key === 'personas') {
                            newItem[key] = parseFloat(item[key]).toFixed(0);
                        } else {
                            newItem[key] = item[key];
                        }
                    });
    
                    return newItem;
                });
                const datosFiltrados = datosFormateados.filter(item => opcionesTipoMovilValidas.has(item.tipoDeMovil));
                const datosFiltrados2 = datosFiltrados.filter(item => validarPlaca(item));
                setDatos(datosFiltrados2);
                setTotalItems(datosFiltrados2.length);
            })
            .catch(error => setError('Error al cargar los datos: ' + error.message));
    };

    useEffect(() => {
        BotonLimpiarFiltros();
        setDatos([]);
        datosAgregadosBandera = [];
        cargarDatos();
        cargarDatosAgregados();
        cargarDatosMovil();
    }, []);

    const BotonLimpiarFiltros = () => {
        setFiltros({});
        document.querySelectorAll('input[type="text"]').forEach(input => {
            input.value = '';
        });
    };

    const clickEncabezados = (columna) => {
        if (ordenarCampo === columna) {
            setOrdenarOrden(ordenarOrden === 'asc' ? 'desc' : 'asc');
        } else {
            setOrdenarCampo(columna);
            setOrdenarOrden('asc');
        }
    };

    const clickAplicarFiltros = (e, columna) => {
        const Valor = e.target.value;
        setFiltros({ ...filtros, [columna]: Valor });
    };

    const validarPlaca = (item) => {
        const placa = item.placa;
        if (item.tipoFacturacion === 'EVENTO' && item.tipoDeMovil !== 'BACKUP') {

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
        } else if (item.tipoFacturacion === 'ADMON' || (item.tipoFacturacion === 'EVENTO' && item.tipoDeMovil === 'BACKUP')) {
            if (placa.length === 6) {
                const primerosTres = placa.substring(0, 3);
                const cuartoYQuinto = placa.substring(3, 5);
                const sexto = placa.substring(5, 6);

                const regexLetras = /^[A-Z]+$/;
                const regexNumeros = /^[0-9]+$/;

                if (regexLetras.test(primerosTres) && regexNumeros.test(cuartoYQuinto) && (regexLetras.test(sexto) || regexNumeros.test(sexto))) {
                    return true;
                }
            }
            if (placa === "null") {
                return true;
            }
        }
        return false;
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

    const exportarExcel = () => {
        const ws = XLSX.utils.json_to_sheet(ordenarDatos);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Datos');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'Validar Personal.xlsx');
    };

    const clickFila = (cedula) => {
        const nuevasFilasSeleccionadas = new Set(filasSeleccionadas);
        if (nuevasFilasSeleccionadas.has(cedula)) {
            nuevasFilasSeleccionadas.delete(cedula);
        } else {
            nuevasFilasSeleccionadas.add(cedula);
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
            ordenarDatos.forEach(item => todas.add(item.cedula));
            setFilasSeleccionadas(todas);
            setTodasSeleccionadas(true);
        }
    };

    const cargarDatosAgregados = () => {
        fetch('http://localhost:8080/capacidad/Todo')
            .then(response => response.json())
            .then(data => {
                setDatosAgregados(data);
            })
            .catch(error => setError('Error al cargar los datos: ' + error.message));
    };

    const validarCapacidadMovil = (data) => {
        if (data.tipoFacturacion === 'EVENTO' && data.tipoDeMovil !== 'BACKUP') {

            const datos = {
                placa: data.placa,
                tipoFacturacion: data.tipoFacturacion,
                tipoDeMovil: data.tipoDeMovil,
                cedula: data.cedula,
                coordinador: data.coordinador
            };

            const movilesExistente = datosAgregados.filter(movil => movil.placa === data.placa);
            const movilesExistenteBandera = datosAgregadosBandera.filter(movil => movil.placa === data.placa);

            if (movilesExistente.length > 0) {
                const capacidadMaxima = parseFloat(movilesExistente[0].personas) * parseFloat(movilesExistente[0].turnos);
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
                const tipoDeMovilBandera = datosMovil.filter(movil => movil.tipoMovil === movilesExistenteBandera[0].tipoDeMovil);
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

    const enviarSeleccionadosAlBackend = () => {
        const filasArray = Array.from(filasSeleccionadas);
        const promises = filasArray.map(cedula => {
            const item = ordenarDatos.find(item => item.cedula === cedula);

            if (!validarCapacidadMovil(item)) {
                toast.error(`La movil con placa ${item.placa} ha excedido su capacidad.`);
            } else {
                fetch('http://localhost:8080/capacidad/AgregarCapacidad', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(item),
                })
                .then(response => {
                    if (!response.ok) {
                        toast.error('No se cargaron los datos', { className: 'toast-error' });
                        throw new Error(`Error al enviar la fila: ${response.status}`);
                    } else {
                        console.log('Fila enviada correctamente');
                        toast.success('Datos cargados', { className: 'toast-success' });
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error('Error:', error);
                    toast.error(`Error al enviar la fila: ${error.message}`, { className: 'toast-error' });
                });
            }
        });

        Promise.all(promises).then(() => {
            datosAgregadosBandera = [];
            setDatos([]);
            setFilasSeleccionadas(new Set());
            setTodasSeleccionadas(false);
            cargarDatos();
        });
    };

    const limpiarSeleccionados = () => {
        setFilasSeleccionadas(new Set());
    }

    const formatearValorEsperado = (valorEsperado) => {
        const valor = valorEsperado !== "null" ? valorEsperado : 0;
        const formatter = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        });
        return formatter.format(valor);
    };

    return (
        <div id='Principal-ValidarPersonal'>
            <div id='Principal-Visualizar'>
                <div id='Botones-Encabezado'>
                    <button id='Boton-Borrar-Filtros' className="btn btn-secondary" onClick={BotonLimpiarFiltros}><i className="fas fa-filter"></i> Borrar Filtros</button>
                    <button id='Boton-Exportar-Excel' className="btn btn-secondary" onClick={exportarExcel}><i className="fas fa-file-excel"></i> Exportar</button>
                </div>
                <div className="tabla-container">
                    <table>
                        <thead>
                            <tr>
                                <th>
                                    <div>
                                        <span>Validado</span>
                                        <input id='Checkbox-Encabezado' type="checkbox" checked={todasSeleccionadas} onChange={clickSeleccionarTodas} style={{ cursor: 'pointer' }} />
                                    </div>
                                </th>
                                {['cedula', 'nombreCompleto', 'cargo', 'centroCosto', 'nomina', 'regional', 'ciudadTrabajo', 'red', 'cliente', 'area', 'subArea', 'tipoDeMovil', 'tipoFacturacion', 'movil', 'coordinador', 'director', 'valorEsperado', 'placa', 'fechaReporte', 'mes', 'año', 'turnos', 'personas'].map(columna => (
                                    <th key={columna}>
                                        <div>
                                            {columna.charAt(0).toUpperCase() + columna.slice(1)} <i className={getIconoFiltro(columna)} onClick={() => clickEncabezados(columna)} style={{ cursor: 'pointer' }}></i>
                                        </div>
                                        <input type="text" onChange={e => clickAplicarFiltros(e, columna)} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {ordenarDatos.map((item, index) => (
                                <tr key={item.cedula} className={filasSeleccionadas.has(item.cedula) ? 'fila-seleccionada' : ''}>
                                    <td>
                                        <input id='Checkbox-Filas' type="checkbox" checked={filasSeleccionadas.has(item.cedula)} style={{ cursor: 'pointer' }} onChange={() => clickFila(item.cedula)} />
                                    </td>
                                    {Object.keys(item).slice(1)
                                        .filter(key => key !== 'codigoSap')
                                        .filter(key => key !== 'contratista')
                                        .filter(key => key !== 'tipoCarro')
                                        .map((key, i) => (
                                            <td key={i}>
                                                {key === 'valorEsperado' ? formatearValorEsperado(item[key]) : item[key]}
                                            </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <ToastContainer />
                <div id='piePagina'>
                    <p>Total de items: {totalItems}</p> 
                    <div id='Botones-piePagina'>
                        <button id='Boton-Limpiar' className="btn btn-secondary" onClick={limpiarSeleccionados}>Limpiar</button>
                        <button id='Boton-Aplicar' className="btn btn-secondary" onClick={enviarSeleccionadosAlBackend}>Aplicar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ValidarPersonal;