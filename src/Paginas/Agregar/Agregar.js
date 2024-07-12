import React, { useState, useEffect } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import { ThreeDots } from 'react-loader-spinner';

let datosAgregadosBandera = [];

const Agregar = ({ role }) => {
    const [datos, setDatos] = useState([]);
    const [filtros, setFiltros] = useState({});
    const [error, setError] = useState('');
    const [datosAgregados, setDatosAgregados] = useState([]);
    const [datosCompletosAgregados, setDatosCompletosAgregados] = useState([]);
    const [datosMovil, setDatosMovil] = useState([]);
    const [tipoMovilAdmon, setTipoMovilAdmon] = useState([]);
    const [tipoMovilEvento, setTipoMovilEvento] = useState([]);
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
    const [dropdownOpenTipoFacturacion, setDropdownOpenTipoFacturacion] = useState(false);
    const [selectedItemTipoFacturacion, setSelectedItemTipoFacturacion] = useState('Seleccionar opción');
    const [dropdownOpenTipoMovil, setDropdownOpenTipoMovil] = useState(false);
    const [selectedItemTipoMovil, setSelectedItemTipoMovil] = useState('Seleccionar opción');
    const [dropdownOpenCoordinador, setDropdownOpenCoordinador] = useState(false);
    const [selectedItemCoordinador, setSelectedItemCoordinador] = useState('Seleccionar opción');
    const [tipoMovilOptions, setTipoMovilOptions] = useState([]);
    const [coordinadores, setCoordinadores] = useState([]);
    const [loading, setLoading] = useState(true);

    const cargarDatosCoordinador = () => {
        fetch('https://sicteferias.from-co.net:8120/capacidad/Coordinador')
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
            .catch(error => setError('Error al cargar los datos: ' + error.message));
    };

    const cargarDatosMovil = () => {
        fetch('https://sicteferias.from-co.net:8120/capacidad/Movil')
            .then(response => response.json())
            .then(data => {
                const admon = data
                    .filter(item => item.tipoFacturacion === 'ADMON')
                    .sort((a, b) => a.tipoMovil.localeCompare(b.tipoMovil))
                    .map(item => item.tipoMovil);
                
                const evento = data
                    .filter(item => item.tipoFacturacion === 'EVENTO')
                    .sort((a, b) => a.tipoMovil.localeCompare(b.tipoMovil))
                    .map(item => item.tipoMovil);

                setDatosMovil(data);
                setTipoMovilAdmon(admon);
                setTipoMovilEvento(evento);
            })
            .catch(error => setError('Error al cargar los datos: ' + error.message));
    };

    const cargarDatos = () => {
        fetch('https://sicteferias.from-co.net:8120/capacidad/ContinuaEnPlantaSinCapacidad', {
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
                setError('Error al cargar los datos: ' + error.message);
                setLoading(false); 
            });
    };

    const cargarDatosAgregados = () => {
        fetch('https://sicteferias.from-co.net:8120/capacidad/Todo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role }),
        })
            .then(response => response.json())
            .then(data => {
                const datosFiltrados = data.filter(item => {
                    const fecha = new Date(item.fechaReporte);
                    const dia = fecha.getDate();
                    return dia === 2;
                });
                setDatosCompletosAgregados(data);
                setDatosAgregados(datosFiltrados);
                setTotalItemsAgregados(datosFiltrados.length);
            })
            .catch(error => setError('Error al cargar los datos: ' + error.message));
    };

    useEffect(() => {
        cargarDatosCoordinador();
        setDatosCompletosAgregados([]);
        setDatosAgregados([]);
        datosAgregadosBandera = [];
        setDatos([]);
        cargarDatos();
        cargarDatosAgregados();
        cargarDatosMovil();
        BotonLimpiarFiltros();
    }, []);

    const BotonLimpiarFiltros = () => {
        setFiltrosAgregados({});
        setFiltros({});
        setSelectedItemTipoFacturacion('Seleccionar opción');
        setSelectedItemTipoMovil('Seleccionar opción');
        setSelectedItemCoordinador('Seleccionar opción');
        setTipoMovilOptions([]);
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

    const toggleTipoFacturacion = () => setDropdownOpenTipoFacturacion(prevState => !prevState);
    const toggleTipoMovil = () => setDropdownOpenTipoMovil(prevState => !prevState);
    const toggleCoordinador = () => setDropdownOpenCoordinador(prevState => !prevState);

    const handleSelectTipoFacturacion = (item) => {
        setSelectedItemTipoFacturacion(item);
        if (item === 'ADMON') {
            setTipoMovilOptions(tipoMovilAdmon);
        } else if (item === 'EVENTO') {
            setTipoMovilOptions(tipoMovilEvento);
        }
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
                placa: data.placa,
                tipoFacturacion: selectedItemTipoFacturacion,
                tipoDeMovil: selectedItemTipoMovil,
                cedula: data.cedula,
                coordinador: selectedItemCoordinador
            };

            const movilesExistente = datosCompletosAgregados.filter(movil => movil.placa === data.placa);
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

    const botonAplicar = () => {
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
        if (filasSeleccionadas.size === 0) {
            toast.error('Por favor selecciona al menos una cédula', { className: 'toast-error' });
            return;
        }

        setFiltrosAgregados({});
        setFiltros({});

        const cedulasSeleccionadas = Array.from(filasSeleccionadas).map(cedula => {
            return ordenarDatos.find(item => item.nit === cedula).nit;
        });

        const promises = cedulasSeleccionadas.map(cedula => {
            const data = {
                id: 1,
                carpeta: carpeta,
                placa: placa,
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
                return fetch('https://sicteferias.from-co.net:8120/capacidad/agregarPersonal', {
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

        Promise.all(promises)
            .then(() => {
                setDatosAgregados([]);
                setDatos([]);
                setFilasSeleccionadas(new Set());
                setTodasSeleccionadas(false);
                BotonLimpiarFiltros();
                datosAgregadosBandera = [];

                return delay(1000);
            })
            .then(() => {
                cargarDatos();
                cargarDatosAgregados();
            })
            .catch(error => {
                setError('Error al aplicar los cambios: ' + error.message);
            });
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
                <div id="Principal-Container">
                    <div id='Principal-Agregar'>
                        <div id="Principal-Agregar-Botones">
                            <div>
                                <label htmlFor="uname">Tipo Facturación:</label>
                                <Dropdown isOpen={dropdownOpenTipoFacturacion} toggle={toggleTipoFacturacion}>
                                    <DropdownToggle caret className="btn btn-primary">
                                        {selectedItemTipoFacturacion}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem onClick={() => handleSelectTipoFacturacion('ADMON')}>ADMON</DropdownItem>
                                        <DropdownItem onClick={() => handleSelectTipoFacturacion('EVENTO')}>EVENTO</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                            <div>
                                <label htmlFor="uname">Tipo Movil:</label>
                                <Dropdown isOpen={dropdownOpenTipoMovil} toggle={toggleTipoMovil}>
                                    <DropdownToggle caret className="btn btn-primary">
                                        {selectedItemTipoMovil}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        {tipoMovilOptions.map((option, index) => (
                                            <DropdownItem key={index} onClick={() => handleSelectTipoMovil(option)}>{option}</DropdownItem>
                                        ))}
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                            <div>
                                <label htmlFor="uname">Coordinador:</label>
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

                            <div id="Principal-Agregar-Botones-Red" className="form-group">
                                <label htmlFor="carpeta" className="form-label">Carpeta:</label>
                                <input type="text" className="form-control" id="carpeta" placeholder="Ingresa la Carpeta" value={carpeta} onChange={(e) => setCarpeta(e.target.value)} required />
                                <div className="invalid-feedback">Campo Obligatorio</div>
                            </div>

                            <div id="Principal-Agregar-Botones-Red" className="form-group">
                                <label htmlFor="placa" className="form-label">Placa:</label>
                                <input type="text" className="form-control" id="placa" placeholder="Ingresa la Placa" value={placa} onChange={(e) => setPlaca(e.target.value)} maxLength={6} required />
                                {!isPlacaValida && <p style={{ color: 'red' }}>Placa no válida</p>}
                                <div className="invalid-feedback">Campo Obligatorio</div>
                            </div>

                            <div id='Botones-Accion'>
                                <button id='Boton-Limpiar' className="btn btn-secondary" onClick={BotonLimpiarFiltros}>Limpiar</button>
                                <button id='Boton-Aplicar' className="btn btn-secondary" onClick={botonAplicar}>Aplicar</button>
                            </div>
                        </div>

                        <div id="Principal-Agregar-Pendientes">
                            <div id='Titulo'>
                                <span>Pendientes</span>
                            </div>
                            <div className="tabla-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>
                                                <div>
                                                    <span>Seleccionar</span>
                                                    <input id='Checkbox-Encabezado' type="checkbox" checked={todasSeleccionadas} onChange={clickSeleccionarTodas} style={{ cursor: 'pointer' }} />
                                                </div>
                                            </th>
                                            {['nit', 'nombre', 'cargo', 'perfil', 'director'].map(columna => (
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
                                            <tr key={item.nit} className={filasSeleccionadas.has(item.nit) ? 'fila-seleccionada' : ''}>
                                                <td>
                                                    <input id='Checkbox-Filas' type="checkbox" checked={filasSeleccionadas.has(item.nit)} style={{ cursor: 'pointer' }} onChange={() => clickFila(item.nit)} />
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
                            <div id='piePagina'>
                                <p>Total de items: {totalItems}</p>
                                <div id='Botones-piePagina'>

                                </div>
                            </div>
                        </div>

                        <div id="Principal-Agregar-Agregados">
                            <div id='Titulo'>
                                <span>Agregados</span>
                            </div>
                            <div className="tabla-container">
                                <table>
                                    <thead>
                                        <tr>
                                            {['cedula', 'nombreCompleto', 'cargo', 'centroCosto', 'nomina', 'regional', 'ciudadTrabajo', 'red', 'cliente', 'area', 'subArea', 'tipoDeMovil', 'tipoFacturacion', 'movil', 'coordinador', 'director', 'valorEsperado', 'placa', 'fechaReporte', 'mes', 'año', 'turnos', 'personas'].map(columna => (
                                                <th key={columna}>
                                                    <div>
                                                        {columna.charAt(0).toUpperCase() + columna.slice(1)} <i className={getIconoFiltroAgregados(columna)} onClick={() => clickEncabezadosAgregados(columna)} style={{ cursor: 'pointer' }}></i>
                                                    </div>
                                                    <input type="text" onChange={e => clickAplicarFiltrosAgregados(e, columna)} />
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ordenarDatosAgregados.map((item) => (
                                            <tr key={item.cedula}>
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
                            <div id='piePagina'>
                                <p>Total de items: {totalItemsAgregados}</p>
                                <div id='Botones-piePagina'>

                                </div>
                            </div>
                        </div>
                        <ToastContainer />
                    </div>
                </div>
            )} 
        </div>
    );
};

export default Agregar;