import React from 'react';
import { useState, useEffect } from 'react';
import  '../Principal/Principal.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { ThreeDots } from 'react-loader-spinner';

const ValidarMoviles = ({ role, datosTodoBackup, setDatosTodoBackup, mesAnioSeleccionado, setMesAnioSeleccionado }) => {
    const [datos, setDatos] = useState([]);
    const [datosTodoBackupTratamiento, setDatosTodoBackupTratamiento] = useState([]);
    const [datosBackUp, setDatosBackUp] = useState([]);
    const [error, setError] = useState('');
    const [totalItems, setTotalItems] = useState(0);
    const [sumaValorEsperado, setSumaValorEsperado] = useState(0);
    const [filtroColor, setFiltroColor] = useState('blanco');
    const [filtros, setFiltros] = useState({});
    const [ordenarCampo, setOrdenarCampo] = useState('nombreCompleto');
    const [ordenarOrden, setOrdenarOrden] = useState('asc');
    const [totalItemsBackup, setTotalItemsBackup] = useState(0);
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

    const obtenerValorEsperado = (valor) => {
        const numero = parseFloat(valor);
        if (numero == null || numero === '' || isNaN(numero)) {
            return 0;
        }
        return numero;
    };

    const cargarDatos = () => {
        fetch('https://sicteferias.from-co.net:8120/capacidad/Todo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role }),
        })
            .then(response => response.json())
            .then(data => {

                if (!Array.isArray(data)) {
                    throw new Error('Los datos recibidos no son un array');
                }

                const filtrarDatos = data.filter(item => item.tipoFacturacion === 'EVENTO');
                const filtrarDatosBackUp = filtrarDatos.filter(item => item.tipoDeMovil === 'BACKUP');
                const filtrarDatosSinBackUp = filtrarDatos.filter(item => item.tipoDeMovil !== 'BACKUP');

                const grupoDatos = filtrarDatosSinBackUp.reduce((acc, item) => {
                    const key = `${item.placa}${item.tipoDeMovil}`;

                    if (!acc[key]) {
                        acc[key] = {
                            placa: item.placa,
                            valorEsperado: item.valorEsperado,
                            tipoDeMovil: item.tipoDeMovil,
                            turnos: item.turnos,
                            personas: item.personas,
                            items: []
                        };
                    }

                    if (item.valorEsperado && !isNaN(item.valorEsperado)) {
                        acc[key].valorEsperado = item.valorEsperado;
                    }

                    acc[key].items.push({
                        nombreCompleto: item.nombreCompleto,
                        cedula: item.cedula,
                        coordinador: item.coordinador,
                        director: item.director
                    });

                    return acc;
                }, {});

                const suma = Object.values(grupoDatos).reduce((acc, item) => acc + obtenerValorEsperado(item.valorEsperado), 0);

                const directores = ["Todo",...new Set(filtrarDatosSinBackUp.map(item => item.director))];
                const coordinadores = ["Todo",...new Set(filtrarDatosSinBackUp.map(item => item.coordinador))];

                setSumaValorEsperado(suma);
                setDatos(grupoDatos);   
                setDatosBackUp(filtrarDatosBackUp);
                setTotalItemsBackup(filtrarDatosBackUp.length);
                setTotalItems(Object.keys(grupoDatos).length);
                setCoordinadores(coordinadores);
                setDirectores(directores);

                const placasVistas = new Set();
                const duplicadosData = new Set();

                Object.values(grupoDatos).forEach(item => {
                    if (placasVistas.has(item.placa)) {
                        duplicadosData.add(item.placa);
                    } else {
                        placasVistas.add(item.placa);
                    }
                });
                setDuplicados(duplicadosData);

                setLoading(false);
            })
            .catch(error => {
                setError('Error al cargar los datos: ' + error.message);
                setLoading(false);
            });
    };

    const tratamientoDatosTodoBackup = () => {
        if (ultimoMes !== mesAnioSeleccionado) {
            if (!Array.isArray(datosTodoBackup)) {
                throw new Error('Los datos recibidos no son un array');
            }

            const filtrarDatosTodoBackupRole = datosTodoBackup.filter(item => {
                if (item.director === role) {
                    return item
                } else if (role === 'admin') {
                    return item
                }
                return  false;
            })

            const filtrarDatosTodoBackup = filtrarDatosTodoBackupRole.filter(item => {
                if (mesAnioSeleccionado) {
                    const [mes, anio] = mesAnioSeleccionado.split('-');
                    const fecha = new Date(item.fechaReporte);
                    return  (fecha.getMonth() + 1 === parseInt(mes) && fecha.getFullYear() === parseInt(anio));
                }

                return false;
            })

            const filtrarDatos = filtrarDatosTodoBackup.filter(item => item.tipoFacturacion === 'EVENTO');
            const filtrarDatosBackUp = filtrarDatos.filter(item => item.tipoDeMovil === 'BACKUP');
            const filtrarDatosSinBackUp = filtrarDatos.filter(item => item.tipoDeMovil !== 'BACKUP');

            const grupoDatos = filtrarDatosSinBackUp.reduce((acc, item) => {
                const key = `${item.placa}${item.tipoDeMovil}`;

                if (!acc[key]) {
                    acc[key] = {
                        placa: item.placa,
                        valorEsperado: item.valorEsperado,
                        tipoDeMovil: item.tipoDeMovil,
                        turnos: item.turnos,
                        personas: item.personas,
                        items: []
                    };
                }

                if (item.valorEsperado && !isNaN(item.valorEsperado)) {
                    acc[key].valorEsperado = item.valorEsperado;
                }

                acc[key].items.push({
                    nombreCompleto: item.nombreCompleto,
                    cedula: item.cedula,
                    coordinador: item.coordinador,
                    director: item.director
                });

                return acc;
            }, {});

            const suma = Object.values(grupoDatos).reduce((acc, item) => acc + obtenerValorEsperado(item.valorEsperado), 0);

            const coordinadores = ["Todo",...new Set(filtrarDatosSinBackUp.map(item => item.coordinador))];
            const directores = ["Todo",...new Set(filtrarDatosSinBackUp.map(item => item.director))];

            setSumaValorEsperado(suma);
            setDatosTodoBackupTratamiento(grupoDatos);   
            setDatosBackUp(filtrarDatosBackUp);
            setTotalItemsBackup(filtrarDatosBackUp.length);
            setTotalItems(Object.keys(grupoDatos).length);
            setCoordinadores(coordinadores);
            setDirectores(directores);

            const placasVistas = new Set();
            const duplicadosData = new Set();

            Object.values(grupoDatos).forEach(item => {
                if (placasVistas.has(item.placa)) {
                    duplicadosData.add(item.placa);
                } else {
                    placasVistas.add(item.placa);
                }
            });
            setDuplicados(duplicadosData);

        }else{
            cargarDatos();
        }
    };

    useEffect(() => {
        setDatos([]);
        cargarDatos();
        getUltimoMes();
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

    const datosSeleccionados = mesAnioSeleccionado === ultimoMes ? datos : datosTodoBackupTratamiento;

    const datosFiltrados = Object.entries(datosSeleccionados).filter(([placa, data]) => {
        const alertaColor = validarCantidadIntegrantes(data);
        const filtroCoordinador = selectedItemCoordinador === 'Todo' || data.items.some(item => item.coordinador === selectedItemCoordinador);
        const filtroDirector = selectedItemDirector === 'Todo' || data.items.some(item => item.director === selectedItemDirector);
        return (filtroColor === 'blanco' || alertaColor === filtroColor) && filtroCoordinador && filtroDirector;
    });

    const sumaValorFiltrada = datosFiltrados.reduce((acc, [placa, data]) => acc + obtenerValorEsperado(data.valorEsperado), 0);

    const getUltimoMes = () => {
        let bandera = 0;
        const uniqueDate = new Set();
        datosTodoBackup.forEach(item => {
            if (bandera === 0) {
                const date = new Date(item.fechaReporte);
                const mesAnio = `${date.getMonth() + 2}-${date.getFullYear()}`;
                uniqueDate.add(mesAnio);
                bandera = 1;
            }
        });
        ultimoMes = uniqueDate;
    };
    
    const getMesesAnios = () => {
        let bandera = 0;
        const uniqueDates = new Set();
        datosTodoBackup.forEach(item => {
            if (bandera === 0) {
                const date = new Date(item.fechaReporte);
                const mesAnio = `${date.getMonth() + 2}-${date.getFullYear()}`;
                uniqueDates.add(mesAnio);
                bandera = 1;
            }
            if (item.fechaReporte) {
                const date = new Date(item.fechaReporte);
                const mesAnio = `${date.getMonth() + 1}-${date.getFullYear()}`;
                uniqueDates.add(mesAnio);
            }
        });
        return Array.from(uniqueDates);
    };

    useEffect(() => {
        tratamientoDatosTodoBackup();
        setTotalItemsBackup(filtrarDatos.length);
    }, [mesAnioSeleccionado, selectedItemCoordinador, selectedItemDirector]);

    useEffect(() => {
        setTotalItemsBackup(filtrarDatos.length);
    }, [filtros, selectedItemCoordinador, selectedItemDirector]);

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
        const filtroCoordinador = selectedItemCoordinador === 'Todo' || item.coordinador === selectedItemCoordinador;
        return filtroCoordinador;
    });

    const datosBackUpFiltrados2 = datosBackUpFiltrados.filter(item => {
        const filtroDirector = selectedItemDirector === 'Todo' || item.director === selectedItemDirector;
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
        acc[data.tipoDeMovil].valor += obtenerValorEsperado(data.valorEsperado);
        return acc;
    }, {});

    const totalCantidad = Object.values(resumenMoviles).reduce((acc, data) => acc + data.cantidad, 0);
    const totalValor = Object.values(resumenMoviles).reduce((acc, data) => acc + data.valor, 0);

    return (
        <div>
            {loading ? (
                <div id="CargandoPagina">
                    <ThreeDots
                        type="ThreeDots"
                        color="#0B1A46"
                        height={200}
                        width={200}
                    />
                    <p>... Cargando Datos ...</p>
                </div>
            ) : (
        
                <div id='Principal-Visualizar'>
                    <div id="Principal-ValidarMoviles">
                        <div id='Cartas'>
                            <div id='Listado-Moviles'>
                                <div>
                                    <h2>Listado de Moviles</h2>
                                </div>
                                <div id="Filtros">
                                    <div className="Grupo-Personal-Movil">
                                        <span className="Titulo">Filtros</span>
                                        <div className="row">
                                            <div className="col-sm-4">
                                                <h6>Personal en la Movil</h6>
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <button id='Blanco' className='btn btn-light' onClick={() => setFiltroColor('blanco')}>Todo</button>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <button id='Naranja' className='btn btn-warning' onClick={() => setFiltroColor('naranja')}>Falta</button>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <button id='Verde' className='btn btn-success' onClick={() => setFiltroColor('verde')}>Correcta</button>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <button id='Rojo' className='btn btn-danger' onClick={() => setFiltroColor('rojo')}>Excedida</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-4">
                                                <h6>Placa</h6>
                                                <button id='Morado' className='btn btn-primary' onClick={() => setFiltroColor('morado')}>Duplicada</button>
                                                <h6>Fecha Reporte</h6>
                                                <div className="Fecha-Reporte-Select">
                                                    <select id='Fecha-Reporte-Boton' value={mesAnioSeleccionado} onChange={(e) => setMesAnioSeleccionado(e.target.value)} className="select-box">
                                                        {getMesesAnios().map((mesAnio, index) => (
                                                            <option key={index} value={mesAnio}>
                                                                {mesAnio}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-4" id='Coordinador'>
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
                                            <div key={index} className={`Carta`} id={`Carta-${validarCantidadIntegrantes(data)}`}>
                                                <div className="row">
                                                    <div className="col-sm-5" id='Integrantes'>
                                                        <h5>Integrantes</h5>
                                                        <ul>
                                                            {data.items && data.items.map((item, index) => (
                                                                <li key={index}>{item.cedula} - {item.nombreCompleto}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className="col-sm-5" id='Movil'>
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
                                                    <div className="col-sm-2" id='Placa'>
                                                        <h1>{data.placa}</h1>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                            <div id='Datos'>
                                <div>
                                    <h4>Valor de la Operacion</h4>
                                    <p>{formatearValorEsperado(sumaValorFiltrada)}</p>
                                </div>
                                <div>
                                    <h4>Moviles</h4>
                                    <div id='Tabla-Moviles'>
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
                                <div id='BACK-UP'>
                                    <h4>Personal de Backup</h4>
                                    <div id="Tabla-Backup">
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
                                                        <tr key={item.cedula}>
                                                            <td>{item.cedula}</td>
                                                            <td>{item.nombreCompleto}</td>
                                                            <td>{item.cargo}</td>
                                                        </tr>  
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div id='piePagina'>
                                    <p>Total de items: {totalItemsBackup}</p> 
                                    <div id='Botones-piePagina'>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ValidarMoviles;