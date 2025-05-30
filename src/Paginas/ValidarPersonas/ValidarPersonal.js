import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import '../Principal/Principal.css';
import { ToastContainer, toast } from 'react-toastify';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';
import './ValidarPersonal.css'

const ValidarPersonal = ({
    role,
    error,
    setError,
    datosMovil,
    setDatosMovil,
    tipoMovilValidas,
    setTipoMovilValidas,
    tipoFacturacionValidas,
    setTipoFacturacionValidas,
    coordinadores,
    setCoordinadores
}) => {
    let datosAgregadosBandera = [];
    const [datos, setDatos] = useState([]);
    const [datosAgregados, setDatosAgregados] = useState([]);
    const [filtros, setFiltros] = useState({});
    const [ordenarCampo, setOrdenarCampo] = useState('NOMBRE_COMPLETO');
    const [ordenarOrden, setOrdenarOrden] = useState('asc');
    const [totalItems, setTotalItems] = useState(0);
    const [filasSeleccionadas, setFilasSeleccionadas] = useState(new Set());
    const [todasSeleccionadas, setTodasSeleccionadas] = useState(false);
    const [loading, setLoading] = useState(true);

    const cargarDatos = () => {
        fetch(`${process.env.REACT_APP_API_URL}/capacidades/continuaEnPlanta`, {
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
                        if (key === 'MOVIL') {
                            newItem[key] = parseFloat(item[key]).toFixed(3);
                        } else if (key === 'PERSONAS') {
                            newItem[key] = parseFloat(item[key]).toFixed(0);
                        } else {
                            newItem[key] = item[key];
                        }
                    });

                    return newItem;
                });
                const tipoMovilValidas2 = new Set(tipoMovilValidas);
                const datosFiltrados = datosFormateados.filter(item => tipoMovilValidas2.has(item.TIPO_DE_MOVIL));
                const tipoFacturacionValidas2 = new Set(tipoFacturacionValidas);
                const datosFiltrados2 = datosFiltrados.filter(item => tipoFacturacionValidas2.has(item.TIPO_FACTURACION));
                const coordinadores2 = new Set(coordinadores);
                const datosFiltrados3 = datosFiltrados2.filter(item => coordinadores2.has(item.COORDINADOR));
                const datosFiltrados4 = datosFiltrados3.filter(item => validarPlaca(item));
                setDatos(datosFiltrados4);
                setTotalItems(datosFiltrados4.length);
                setLoading(false);
            })
            .catch(error => {
                setError('Error al cargar los datos: ' + error.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        //BotonLimpiarFiltros();
        //setDatos([]);
        datosAgregadosBandera = [];
        cargarDatos();
        cargarDatosAgregados();

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

    const validarPlaca = (item) => {
        const placa = item.PLACA;
        if (item.TIPO_FACTURACION === 'EVENTO' && item.TIPO_DE_MOVIL !== 'BACKUP') {

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
        } else if (item.TIPO_FACTURACION === 'ADMON' || (item.TIPO_FACTURACION === 'EVENTO' && item.TIPO_DE_MOVIL === 'BACKUP')) {
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

    useEffect(() => {
        setTotalItems(filtrarDatos.length);
    }, [filtros]);

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
            ordenarDatos.forEach(item => todas.add(item.CEDULA));
            setFilasSeleccionadas(todas);
            setTodasSeleccionadas(true);
        }
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
                setDatosAgregados(data);
            })
            .catch(error => setError('Error al cargar los datos: ' + error.message));
    };

    const validarCapacidadMovil = (data) => {
        if (data.tipoFacturacion === 'EVENTO' && data.tipoDeMovil !== 'BACKUP') {

            const datos = {
                placa: data.placa,
                tipoFacturacion: data.tipoFacturacion,
                tipoDeMovil: data.tipoMovil,
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

    const enviarSeleccionadosAlBackend = () => {
        setLoading(true);
        const filasArray = Array.from(filasSeleccionadas);
        const promises = filasArray.map(cedula => {
            const item = ordenarDatos.find(item => item.CEDULA === cedula);
            const data = {
                id: 1,
                carpeta: item.CARPETA,
                placa: item.PLACA,
                tipoFacturacion: item.TIPO_FACTURACION,
                tipoMovil: item.TIPO_DE_MOVIL,
                cedula: item.CEDULA,
                coordinador: item.COORDINADOR
            };

            if (!validarCapacidadMovil(data)) {
                toast.error(`La movil con placa ${data.placa} ha excedido su capacidad.`);
            } else {
                fetch(`${process.env.REACT_APP_API_URL}/capacidades/agregarPersonalValidarPersonal`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
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
                        setError('Error al enviar los datos al backend: ' + error.message);
                    });
            }
        });

        Promise.all(promises).then(() => {
            datosAgregadosBandera = [];
            setDatos([]);
            setFilasSeleccionadas(new Set());
            setTodasSeleccionadas(false);

            setTimeout(() => {
                cargarDatos();
            }, 3000)
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
        <div className='ValidarPersonal'>
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
                <div className='Principal-Visualizar'>
                    <div className='Botones-Encabezado'>
                        <button className='Boton-Borrar-Filtros btn btn-secondary' onClick={BotonLimpiarFiltros}><i className="fas fa-filter"></i> Borrar Filtros</button>
                        <button className='Boton-Exportar-Excel btn btn-secondary' onClick={exportarExcel}><i className="fas fa-file-excel"></i> Exportar</button>
                    </div>
                    <div className="tabla-container">
                        <table>
                            {ordenarDatos.length > 0 && (
                                <thead>
                                    <tr>
                                        <th>
                                            <div>
                                                <span>Validado</span>
                                            </div>
                                            <input className='Checkbox-Encabezado' type="checkbox" checked={todasSeleccionadas} onChange={clickSeleccionarTodas} style={{ cursor: 'pointer' }} />
                                        </th>
                                        {Object.keys(ordenarDatos[0])
                                            .filter(key => !['id', 'CODIGO_SAP', 'CONTRATISTA', 'TIPO_CARRO', 'TIPO_VEHICULO'].includes(key))
                                            .map(columna => (
                                                <th key={columna}>
                                                    <div>
                                                        {columna.charAt(0).toUpperCase() + columna.slice(1).toLowerCase()}{" "}
                                                        <i
                                                            className={getIconoFiltro(columna)}
                                                            onClick={() => clickEncabezados(columna)}
                                                            style={{ cursor: "pointer" }}
                                                        ></i>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                clickAplicarFiltros(e, columna);
                                                            }
                                                        }}
                                                    />
                                                </th>
                                            ))}
                                    </tr>
                                </thead>
                            )}
                            <tbody>
                                {ordenarDatos.map((item, index) => (
                                    <tr key={item.cedula} className={filasSeleccionadas.has(item.CEDULA) ? 'fila-seleccionada' : ''}>
                                        <td>
                                            <input className='Checkbox-Filas' type="checkbox" checked={filasSeleccionadas.has(item.CEDULA)} style={{ cursor: 'pointer' }} onChange={() => clickFila(item.CEDULA)} />
                                        </td>
                                        {Object.keys(item).slice(1)
                                            .filter(key => key !== 'CODIGO_SAP')
                                            .filter(key => key !== 'CONTRATISTA')
                                            .filter(key => key !== 'TIPO_CARRO')
                                            .filter(key => key !== 'TIPO_VEHICULO')
                                            .sort((a, b) => {
                                                if (a === "placa") return b === "cargo" ? 1 : -1;
                                                if (b === "placa") return a === "cargo" ? -1 : 1;
                                                return 0;
                                            })
                                            .map((key, i) => (
                                                <td key={i}>
                                                    {key === 'VALOR_ESPERADO' ? formatearValorEsperado(item[key]) : item[key]}
                                                </td>
                                            ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <ToastContainer />
                    <div className='piePagina'>
                        <p>Total de items: {totalItems}</p>
                        <div className='Botones-piePagina'>
                            <button className='Boton-Limpiar btn btn-secondary' onClick={limpiarSeleccionados}>Limpiar</button>
                            <button className='Boton-Aplicar btn btn-secondary' onClick={enviarSeleccionadosAlBackend}>Aplicar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ValidarPersonal;