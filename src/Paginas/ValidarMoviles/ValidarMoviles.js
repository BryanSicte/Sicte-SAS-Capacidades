import React from 'react';
import { useState, useEffect } from 'react';
import  '../Principal/Principal.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

const ValidarMoviles = ({ role }) => {
    const [datos, setDatos] = useState([]);
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
                    if (!acc[item.placa]) {
                        acc[item.placa] = {
                            tipoDeMovil: item.tipoDeMovil,
                            valorEsperado: item.valorEsperado,
                            turnos: item.personas,
                            personas: item.turnos,
                            items: []
                        };
                    }

                    if (item.valorEsperado && !isNaN(item.valorEsperado)) {
                        acc[item.placa].valorEsperado = item.valorEsperado;
                    }

                    acc[item.placa].items.push({ nombreCompleto: item.nombreCompleto, cedula: item.cedula, coordinador: item.coordinador });
                    return acc;
                }, {});

                const suma = Object.values(grupoDatos).reduce((acc, item) => acc + obtenerValorEsperado(item.valorEsperado), 0);

                const coordinadores = ["Todo",...new Set(filtrarDatosSinBackUp.map(item => item.coordinador))];

                setSumaValorEsperado(suma);
                setDatos(grupoDatos);
                setDatosBackUp(filtrarDatosBackUp);
                setTotalItemsBackup(filtrarDatosBackUp.length);
                setTotalItems(Object.keys(grupoDatos).length);
                setCoordinadores(coordinadores)
            })
            .catch(error => setError('Error al cargar los datos: ' + error.message));
    };

    useEffect(() => {
        setDatos([]);
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
        if (data.items.length < cantidadEsperada) {
            return 'naranja';
        } else if (data.items.length === cantidadEsperada) {
            return 'verde';
        } else {
            return 'rojo';
        }
    };

    const datosFiltrados = Object.entries(datos).filter(([placa, data]) => {
        const alertaColor = validarCantidadIntegrantes(data);
        const filtroCoordinador = selectedItemCoordinador === 'Todo' || data.items.some(item => item.coordinador === selectedItemCoordinador);
        return (filtroColor === 'blanco' || alertaColor === filtroColor) && filtroCoordinador;
    });

    const sumaValorFiltrada = datosFiltrados.reduce((acc, [placa, data]) => acc + obtenerValorEsperado(data.valorEsperado), 0);

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

    const filtrarDatos = datosBackUp.filter(item => {
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
        <div id='Principal-Visualizar'>
            <div id="Principal-ValidarMoviles">
                <div id='Cartas'>
                    <div id='Listado-Moviles'>
                        <div>
                            <h2>Listado de Moviles</h2>
                        </div>
                        <div id="Filtros">
                            <div className="row">
                                <div className="Grupo-Personal-Movil">
                                    <span className="Titulo">Filtro de Personal en la Movil</span>
                                    <div className="col-sm-3">
                                        <button id='Blanco' className='btn btn-light' onClick={() => setFiltroColor('blanco')}>Todo</button>
                                    </div>
                                    <div className="col-sm-3">
                                        <button id='Naranja' className='btn btn-warning' onClick={() => setFiltroColor('naranja')}>Falta</button>
                                    </div>
                                    <div className="col-sm-3">
                                        <button id='Verde' className='btn btn-success' onClick={() => setFiltroColor('verde')}>Correcta</button>
                                    </div>
                                    <div className="col-sm-3">
                                        <button id='Rojo' className='btn btn-danger' onClick={() => setFiltroColor('rojo')}>Excedida</button>
                                    </div>
                                </div>
                                <div className="Grupo-Coordinador">
                                    <span className="Titulo">Filtro Coordinador</span>
                                    <div className="col-sm-12">
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
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="carta-container">
                            {datosFiltrados
                                .sort(([placaA], [placaB]) => placaA.localeCompare(placaB))
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
                                                <h1>{placa}</h1>
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
    );
};

export default ValidarMoviles;