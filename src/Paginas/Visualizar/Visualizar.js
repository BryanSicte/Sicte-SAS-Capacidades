import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import '../Principal/Principal.css';
import { ToastContainer, toast } from 'react-toastify';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';

const Visualizar = ({ role }) => {
    const [datos, setDatos] = useState([]);
    const [filtros, setFiltros] = useState({});
    const [error, setError] = useState('');
    const [ordenarCampo, setOrdenarCampo] = useState('nombreCompleto');
    const [ordenarOrden, setOrdenarOrden] = useState('asc');
    const [totalItems, setTotalItems] = useState(0);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [filasSeleccionadas, setFilasSeleccionadas] = useState(new Set());
    const [todasSeleccionadas, setTodasSeleccionadas] = useState(false);
    const [loading, setLoading] = useState(true);
    const [totalitemsInicial, setTotalitemsInicial] = useState(false);

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
                setDatos(data);
                if (filtrarDatos.length === 0 && !totalitemsInicial) {
                    setTotalItems(data.length);
                    setTotalitemsInicial(true);
                } else {
                    setTotalItems(filtrarDatos.length);
                }
                setLoading(false);
            })
            .catch(error => {
                setError('Error al cargar los datos: ' + error.message);
                setLoading(false); 
            });
    };

    const filtrarDatos = datos.filter(item => {
        for (let key in filtros) {
            if (filtros[key] && item[key] && !item[key].toLowerCase().includes(filtros[key].toLowerCase())) {
                return false;
            }
        }
        return true;
    });

    useEffect(() => {
        //BotonLimpiarFiltros();
        //setDatos([]);
        cargarDatos();
    }, [filtrarDatos]);

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
        setTotalItems(filtrarDatos.length);
    };

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
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'Visualizar.xlsx');
    };

    const clickModoEdicion = () => {
        setModoEdicion(!modoEdicion);
        setFilasSeleccionadas(new Set());
        setTodasSeleccionadas(false);
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

    const clickAplicar = () => {
        const filasArray = Array.from(filasSeleccionadas);
        const promesasEliminacion = filasArray.map(cedula => {
            return fetch('https://sicteferias.from-co.net:8120/capacidad/eliminar-filas', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cedula })
            })
            .then(response => {
                if (response.ok) {
                    toast.success('Datos elminados', { className: 'toast-success' });
                    console.log('Fila eliminada con éxito');
                } else {
                    toast.error('No se eliminar los datos', { className: 'toast-error' });
                    throw new Error('No se pudo eliminar la fila');
                }
            })
            .catch(error => {
                console.error('Error al eliminar filas:', error);
                toast.error(`Error al eliminar fila con cédula ${cedula}: ${error.message}`, { className: 'toast-error' });
            });
        });

        Promise.all(promesasEliminacion).then(() => {
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
                    <div id='Botones-Encabezado'>
                        <button id='Boton-Borrar-Filtros' className="btn btn-secondary" onClick={BotonLimpiarFiltros}><i className="fas fa-filter"></i> Borrar Filtros</button>
                        <div>
                            <button id='Boton-Editar' className={`btn btn-secondary ${modoEdicion ? 'btn-naranja' : ''}`} onClick={clickModoEdicion}><i className="fas fa-trash-alt"></i> Borrar Filas</button>
                            <button id='Boton-Exportar-Excel' className="btn btn-secondary" onClick={exportarExcel}><i className="fas fa-file-excel"></i> Exportar</button>
                        </div>
                    </div>
                    <div className="tabla-container">
                        <table>
                            <thead>
                                <tr>
                                    {modoEdicion && (
                                        <th>
                                            <div>
                                                <span>Eliminar</span>
                                                <input id='Checkbox-Encabezado' type="checkbox" checked={todasSeleccionadas} onChange={clickSeleccionarTodas} style={{ cursor: 'pointer' }} />
                                            </div>
                                        </th>
                                    )}
                                    {['cedula', 'nombreCompleto', 'cargo', 'centroCosto', 'nomina', 'regional', 'ciudadTrabajo', 'red', 'cliente', 'area', 'subArea', 'tipoDeMovil', 'tipoFacturacion', 'movil', 'coordinador', 'director', 'valorEsperado', 'placa', 'fechaReporte', 'mes', 'año', 'turnos', 'personas'].map(columna => (
                                        <th key={columna}>
                                            <div>
                                                {columna.charAt(0).toUpperCase() + columna.slice(1)} <i className={getIconoFiltro(columna)} onClick={() => clickEncabezados(columna)}   ></i>
                                            </div>
                                            <input type="text" onChange={e => clickAplicarFiltros(e, columna)} />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {ordenarDatos.map((item, index) => (
                                        <tr key={item.cedula} className={filasSeleccionadas.has(item.cedula) ? 'fila-seleccionada' : ''}>
                                            {modoEdicion && (
                                                <td>
                                                    <input id='Checkbox-Filas' type="checkbox" checked={filasSeleccionadas.has(item.cedula)} style={{ cursor: 'pointer' }} onChange={() => clickFila(item.cedula)} />
                                                </td>
                                            )}
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
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                    <ToastContainer />
                    <div id='piePagina'>
                        <p>Total de items: {totalItems}</p>
                        <div id='Botones-piePagina'>
                            {modoEdicion && (
                                <div>
                                    <button id='Boton-Limpiar' className="btn btn-secondary" onClick={limpiarSeleccionados}>Limpiar</button>
                                    <button id='Boton-Aplicar' className="btn btn-secondary" onClick={clickAplicar}>Aplicar</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Visualizar;