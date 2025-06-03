import React from 'react';
import { useState, useEffect } from 'react';
import '../Principal/Principal.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { ThreeDots } from 'react-loader-spinner';
import './ValidarMoviles.css'

const ValidarMoviles = ({ role, datosTodoBackup, setDatosTodoBackup, datos, setDatos }) => {
    const [datosTodoBackupTratamiento, setDatosTodoBackupTratamiento] = useState([]);
    const [datosBackUp, setDatosBackUp] = useState([]);
    const [error, setError] = useState('');
    const [totalItems, setTotalItems] = useState(0);
    const [sumaValorEsperado, setSumaValorEsperado] = useState(0);
    const [filtroColor, setFiltroColor] = useState('blanco');
    const [filtros, setFiltros] = useState({});
    const [ordenarCampo, setOrdenarCampo] = useState('NOMBRE_COMPLETO');
    const [ordenarOrden, setOrdenarOrden] = useState('asc');
    const [coordinadores, setCoordinadores] = useState([]);
    const [dropdownOpenCoordinador, setDropdownOpenCoordinador] = useState(false);
    const [selectedItemCoordinador, setSelectedItemCoordinador] = useState('Todo');
    const toggleCoordinador = () => setDropdownOpenCoordinador(prevState => !prevState);
    const [directores, setDirectores] = useState([]);
    const [dropdownOpenDirector, setDropdownOpenDirector] = useState(false);
    const [selectedItemDirector, setSelectedItemDirector] = useState('Todo');
    const toggleDirector = () => setDropdownOpenDirector(prevState => !prevState);
    const [loading, setLoading] = useState(true);
    const [duplicados, setDuplicados] = useState([]);
    let ultimoMes = '';
    const [mesAnioSeleccionado, setMesAnioSeleccionado] = useState('');

    const obtenerValorEsperado = (valor) => {
        const numero = parseFloat(valor);
        if (numero == null || numero === '' || isNaN(numero)) {
            return 0;
        }
        return numero;
    };

    const mesAnioSeleccionadoInicial = () => {
        if (datosTodoBackup.length > 0) {
            const fechas = datosTodoBackup.map(item => new Date(item.FECHA_REPORTE));
            const ultimaFecha = new Date(Math.max(...fechas));

            const siguienteMes = ultimaFecha.getMonth() + 1;
            const siguienteAnio = siguienteMes > 11 ? ultimaFecha.getFullYear() + 1 : ultimaFecha.getFullYear();
            const mesNormalizado = siguienteMes > 11 ? 1 : siguienteMes + 1;

            const mesAnio = `${mesNormalizado.toString().padStart(2, '0')}-${siguienteAnio}`;
            setMesAnioSeleccionado(mesAnio);
        }
    }

    const tratamientoDatos = () => {
        let datosATratar = ''
        const fechas = datosTodoBackup.map(item => new Date(item.FECHA_REPORTE));
        const ultimaFecha = new Date(Math.max(...fechas));

        const siguienteMes = ultimaFecha.getMonth() + 1;
        const siguienteAnio = siguienteMes > 11 ? ultimaFecha.getFullYear() + 1 : ultimaFecha.getFullYear();
        const mesNormalizado = siguienteMes > 11 ? 1 : siguienteMes + 1;

        const mesAnio = `${mesNormalizado.toString().padStart(2, '0')}-${siguienteAnio}`;

        ultimoMes = mesAnio;

        if (ultimoMes !== mesAnioSeleccionado) {
            datosATratar = datosTodoBackup;
        } else {
            datosATratar = datos;
        }

        if (!Array.isArray(datosATratar)) {
            throw new Error('Los datos recibidos no son un array');
        }

        const filtrarDatosTodoBackupRole = datosATratar.filter(item => {
            if (item.DIRECTOR === role) {
                return item
            } else if (role === 'admin') {
                return item
            }
            return false;
        })

        const filtrarDatosTodoBackup = filtrarDatosTodoBackupRole.filter(item => {
            if (mesAnioSeleccionado) {
                const [mes, anio] = mesAnioSeleccionado.split('-');
                const fecha = new Date(item.FECHA_REPORTE);
                return (fecha.getMonth() + 1 === parseInt(mes) && fecha.getFullYear() === parseInt(anio));
            }

            return false;
        })

        const filtrarDatos = filtrarDatosTodoBackup.filter(item => item.TIPO_FACTURACION === 'EVENTO');
        const filtrarDatosBackUp = filtrarDatosTodoBackup.filter(item => item.TIPO_DE_MOVIL === 'BACK UP');
        const filtrarDatosSinBackUp = filtrarDatos.filter(item => item.TIPO_DE_MOVIL !== 'BACK UP');

        const grupoDatos = filtrarDatosSinBackUp.reduce((acc, item) => {
            const key = `${item.PLACA}${item.TIPO_DE_MOVIL}`;

            if (!acc[key]) {
                acc[key] = {
                    placa: item.PLACA,
                    valorEsperado: 0,
                    tipoDeMovil: item.TIPO_DE_MOVIL,
                    turnos: item.TURNOS,
                    personas: item.PERSONAS,
                    items: []
                };
            }

            if (item.VALOR_ESPERADO && item.VALOR_ESPERADO > 0) {
                acc[key].valorEsperado = item.VALOR_ESPERADO;
            }

            acc[key].items.push({
                nombreCompleto: item.NOMBRE_COMPLETO,
                cedula: item.CEDULA,
                coordinador: item.COORDINADOR,
                director: item.DIRECTOR
            });

            return acc;
        }, {});

        const suma = Object.values(grupoDatos).reduce((acc, item) => acc + obtenerValorEsperado(item.valorEsperado), 0);

        const coordinadores = ["Todo", ...new Set(filtrarDatosSinBackUp.map(item => item.COORDINADOR))];
        const directores = ["Todo", ...new Set(filtrarDatosSinBackUp.map(item => item.DIRECTOR))];

        setSumaValorEsperado(suma);
        setDatosTodoBackupTratamiento(grupoDatos);
        setDatosBackUp(filtrarDatosBackUp);
        setTotalItems(Object.keys(grupoDatos).length);
        setCoordinadores(coordinadores);
        setDirectores(directores);

        const placasVistas = new Set();
        const duplicadosData = new Set();

        Object.values(grupoDatos).forEach(item => {
            if (placasVistas.has(item.PLACA)) {
                duplicadosData.add(item.PLACA);
            } else {
                placasVistas.add(item.PLACA);
            }
        });
        setDuplicados(duplicadosData);
    };

    const cargarDatos = () => {
        fetch(`${process.env.REACT_APP_API_URL}/capacidades/todo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role }),
        })
            .then(response => response.json())
            .then(data => {
                setDatos(data);
                setLoading(false);
            })
            .catch(error => {
                setError('Error al cargar los datos: ' + error.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        mesAnioSeleccionadoInicial();
        tratamientoDatos();
        cargarDatos();
    }, []);

    const formatearValorEsperado = (valorEsperado) => {
        const formatter = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        });
        return formatter.format(valorEsperado);
    };

    const validarCantidadIntegrantes = (data) => {
        const persona = parseFloat(data.personas);
        const turno = parseFloat(data.turnos);
        const cantidadEsperada = persona * turno;

        if (duplicados.has(data.placa)) {
            return 'morado';
        }

        if (data.items.length < cantidadEsperada) {
            return 'naranja';
        } else if (data.items.length === cantidadEsperada) {
            return 'verde';
        } else if (data.items.length > cantidadEsperada) {
            return 'rojo';
        }
    };

    const datosFiltrados = Object.entries(datosTodoBackupTratamiento).filter(([placa, data]) => {
        const alertaColor = validarCantidadIntegrantes(data);
        const filtroCoordinador = selectedItemCoordinador === 'Todo' || data.items.some(item => item.coordinador === selectedItemCoordinador);
        const filtroDirector = selectedItemDirector === 'Todo' || data.items.some(item => item.director === selectedItemDirector);
        return (filtroColor === 'blanco' || alertaColor === filtroColor) && filtroCoordinador && filtroDirector;
    });

    const sumaValorFiltrada = datosFiltrados.reduce((acc, [placa, data]) => acc + (obtenerValorEsperado(data.valorEsperado) * obtenerValorEsperado(data.turnos)), 0);

    const getMesesAnios = () => {
        let bandera = 0;
        const uniqueDates = new Set();
        datosTodoBackup.forEach(item => {
            if (bandera === 0) {
                const date = new Date(item.FECHA_REPORTE);

                const siguienteMes = date.getMonth() + 1;
                const siguienteAnio = siguienteMes > 11 ? date.getFullYear() + 1 : date.getFullYear();
                const mesNormalizado = siguienteMes > 11 ? 1 : siguienteMes + 1;

                const mesAnio = `${mesNormalizado.toString().padStart(2, '0')}-${siguienteAnio}`;

                uniqueDates.add(mesAnio);
                bandera = 1;
                ultimoMes = mesAnio;
            }
            if (item.FECHA_REPORTE) {
                const date = new Date(item.FECHA_REPORTE);
                const mesAnio = `${date.getMonth() + 1}-${date.getFullYear()}`;
                uniqueDates.add(mesAnio);
            }
        });
        return Array.from(uniqueDates);
    };

    useEffect(() => {
        tratamientoDatos();
    }, [mesAnioSeleccionado, selectedItemCoordinador, selectedItemDirector]);

    const clickAplicarFiltros = (e, columna) => {
        const Valor = e.target.value;
        setFiltros({ ...filtros, [columna]: Valor });
    };

    const getIconoFiltro = (columna) => {
        if (ordenarCampo === columna) {
            return ordenarOrden === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
        }
        return 'fas fa-sort';
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

    const datosBackUpFiltrados = datosBackUp.filter(item => {
        const filtroCoordinador = selectedItemCoordinador === 'Todo' || item.COORDINADOR === selectedItemCoordinador;
        return filtroCoordinador;
    });

    const datosBackUpFiltrados2 = datosBackUpFiltrados.filter(item => {
        const filtroDirector = selectedItemDirector === 'Todo' || item.DIRECTOR === selectedItemDirector;
        return filtroDirector;
    });

    const filtrarDatos = datosBackUpFiltrados2.filter(item => {
        for (let key in filtros) {
            if (filtros[key] && item[key] && !item[key].toLowerCase().includes(filtros[key].toLowerCase())) {
                return false;
            }
        }
        return true;
    });

    const ordenarDatos = filtrarDatos.sort((c, d) => {
        if (ordenarCampo) {
            // Convertir los valores a minúsculas para asegurar una comparación insensible a mayúsculas y minúsculas
            const valueC = typeof c[ordenarCampo] === 'string' ? c[ordenarCampo].toLowerCase() : c[ordenarCampo];
            const valueD = typeof d[ordenarCampo] === 'string' ? d[ordenarCampo].toLowerCase() : d[ordenarCampo];

            if (valueC < valueD) {
                return ordenarOrden === 'asc' ? -1 : 1;
            }
            if (valueC > valueD) {
                return ordenarOrden === 'asc' ? 1 : -1;
            }
            return 0;
        } else {
            return 0;
        }
    });

    const handleSelectCoordinador = (item) => {
        setSelectedItemCoordinador(item);
    };

    const handleSelectDirector = (item) => {
        setSelectedItemDirector(item);
    };

    const resumenMoviles = datosFiltrados.reduce((acc, [placa, data]) => {
        if (!acc[data.tipoDeMovil]) {
            acc[data.tipoDeMovil] = { cantidad: 0, valor: 0 };
        }
        acc[data.tipoDeMovil].cantidad += 1;
        acc[data.tipoDeMovil].valor += obtenerValorEsperado(data.valorEsperado) * obtenerValorEsperado(data.turnos);
        return acc;
    }, {});

    const totalCantidad = Object.values(resumenMoviles).reduce((acc, data) => acc + data.cantidad, 0);
    const totalValor = Object.values(resumenMoviles).reduce((acc, data) => acc + data.valor, 0);

    return (
        <div className='validarMoviles'>
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
                <div className="Principal-ValidarMoviles">
                    <div className='Cartas'>
                        <div className='Listado-Moviles'>
                            <div className='Titulo'>
                                <h2>Listado de Moviles</h2>
                            </div>
                            <div className="Filtros">
                                <div className="Grupo-Personal-Movil">
                                    <span className="TituloFiltros">Filtros</span>
                                    <div className="row">
                                        <div className="col-sm-4">
                                            <h6>Personal en la Movil</h6>
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <button className='Blanco btn btn-light' onClick={() => setFiltroColor('blanco')}>Todo</button>
                                                </div>
                                                <div className="col-sm-6">
                                                    <button className='Naranja btn btn-warning' onClick={() => setFiltroColor('naranja')}>Falta</button>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-6">
                                                    <button className='Verde btn btn-success' onClick={() => setFiltroColor('verde')}>Correcta</button>
                                                </div>
                                                <div className="col-sm-6">
                                                    <button className='Rojo btn btn-danger' onClick={() => setFiltroColor('rojo')}>Excedida</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <h6>Placa</h6>
                                            <button className='Morado btn btn-primary' onClick={() => setFiltroColor('morado')}>Duplicada</button>
                                            <h6>Fecha Reporte</h6>
                                            <div className="Fecha-Reporte-Select">
                                                <select className='Fecha-Reporte-Boton select-box' value={mesAnioSeleccionado} onChange={(e) => setMesAnioSeleccionado(e.target.value)}>
                                                    {getMesesAnios().map((mesAnio, index) => (
                                                        <option key={index} value={mesAnio}>
                                                            {mesAnio}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-sm-4 Coordinador">
                                            <h6>Coordinador</h6>
                                            <Dropdown isOpen={dropdownOpenCoordinador} toggle={toggleCoordinador}>
                                                <DropdownToggle caret className="btn btn-primary">
                                                    {selectedItemCoordinador}
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    {coordinadores.map((option, index) => (
                                                        <DropdownItem key={index} onClick={() => handleSelectCoordinador(option)}>{option}</DropdownItem>
                                                    ))}
                                                </DropdownMenu>
                                            </Dropdown>
                                            <h6>Director</h6>
                                            <Dropdown isOpen={dropdownOpenDirector} toggle={toggleDirector}>
                                                <DropdownToggle caret className="btn btn-primary">
                                                    {selectedItemDirector}
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    {directores.map((option, index) => (
                                                        <DropdownItem key={index} onClick={() => handleSelectDirector(option)}>{option}</DropdownItem>
                                                    ))}
                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="carta-container">
                                {datosFiltrados
                                    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                                    .map(([placa, data], index) => (
                                        <div key={index} className={`Carta Carta-${validarCantidadIntegrantes(data)}`}>
                                            <div className="row">
                                                <div className="col-sm-5 Integrantes">
                                                    <h5>Integrantes</h5>
                                                    <ul>
                                                        {data.items && data.items.map((item, index) => (
                                                            <li key={index}>{item.cedula} - {item.nombreCompleto}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="col-sm-5 Movil">
                                                    <div>
                                                        <h5>Tipo de Movil</h5>
                                                        <ul>
                                                            <p>{data.tipoDeMovil}</p>
                                                        </ul>
                                                        <h5>Valor Esperado</h5>
                                                        <ul>
                                                            <p>{formatearValorEsperado(data.valorEsperado)}</p>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div className="col-sm-2 Placa">
                                                    <h1>{data.placa}</h1>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                        <div className='Datos'>
                            <div className='ValorOperacion'>
                                <h4>Valor de la Operacion</h4>
                                <p>{formatearValorEsperado(sumaValorFiltrada)}</p>
                            </div>
                            <div>
                                <h4>Moviles</h4>
                                <div className='Tabla-Moviles'>
                                    <div className="tabla-container">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Tipo de Movil</th>
                                                    <th>Cantidad</th>
                                                    <th>Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(resumenMoviles).map(([tipo, data]) => (
                                                    <tr key={tipo}>
                                                        <td>{tipo}</td>
                                                        <td>{data.cantidad}</td>
                                                        <td>{formatearValorEsperado(data.valor)}</td>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <td><strong>Total</strong></td>
                                                    <td><strong>{totalCantidad}</strong></td>
                                                    <td><strong>{formatearValorEsperado(totalValor)}</strong></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className='BACK-UP'>
                                <h4>Personal de Backup</h4>
                                <div className="Tabla-Backup">
                                    <div className="tabla-container">
                                        <table>
                                            <thead>
                                                <tr>
                                                    {['cedula', 'nombreCompleto', 'cargo'].map(columna => (
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
                                                {ordenarDatos.map((item) => (
                                                    <tr key={item.CEDULA}>
                                                        <td>{item.CEDULA}</td>
                                                        <td>{item.NOMBRE_COMPLETO}</td>
                                                        <td>{item.CARGO}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className='piePagina'>
                                <p>Total de items: {datosBackUp.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ValidarMoviles;