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
    const [ordenarCampo, setOrdenarCampo] = useState('NOMBRE_COMPLETO');
    const [ordenarOrden, setOrdenarOrden] = useState('asc');
    const [totalItems, setTotalItems] = useState(0);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [filasSeleccionadas, setFilasSeleccionadas] = useState(new Set());
    const [todasSeleccionadas, setTodasSeleccionadas] = useState(false);
    const [loading, setLoading] = useState(true);

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
                setTotalItems(data.length);
                setLoading(false);
                console.log(data)
            })
            .catch(error => {
                setError('Error al cargar los datos: ' + error.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        //BotonLimpiarFiltros();
        //setDatos([]);
        cargarDatos();
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

    useEffect(() => {
        setTotalItems(filtrarDatos.length);
    }, [filtros]);

    const clickAplicarFiltros = (e, columna) => {
        const Valor = e.target.value;
        setFiltros({ ...filtros, [columna]: Valor });
    };

    const datosArray = Array.isArray(datos) ? datos : [];

    const filtrarDatos = datosArray.filter(item => {
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
            ordenarDatos.forEach(item => todas.add(item.CEDULA));
            setFilasSeleccionadas(todas);
            setTodasSeleccionadas(true);
        }
    };

    const clickAplicar = () => {
        setLoading(true);
        const filasArray = Array.from(filasSeleccionadas);
        const promesasEliminacion = filasArray.map(cedula => {
            return fetch(`${process.env.REACT_APP_API_URL}/capacidades/eliminar-filas`, {
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
                                    {ordenarDatos.length > 0 && modoEdicion && (
                                        <th>
                                            <div>
                                                <span>Eliminar</span>
                                                <input id='Checkbox-Encabezado' type="checkbox" checked={todasSeleccionadas} onChange={clickSeleccionarTodas} style={{ cursor: 'pointer' }} />
                                            </div>
                                        </th>
                                    )}
                                    {ordenarDatos.length > 0 &&
                                        Object.keys(ordenarDatos[0])
                                            .filter(key => !['id', 'CODIGO_SAP', 'CONTRATISTA', 'TIPO_CARRO'].includes(key))
                                            .sort((a, b) => {
                                                if (a === "placa") return b === "cargo" ? 1 : -1;
                                                if (b === "placa") return a === "cargo" ? -1 : 1;
                                                return 0;
                                            })
                                            .map(columna => (
                                                <th key={`encabezado-${columna}`}>
                                                    <div>
                                                        {columna.charAt(0).toUpperCase() + columna.slice(1).toLowerCase()}{" "}
                                                        <i
                                                            className={getIconoFiltro(columna)}
                                                            onClick={() => clickEncabezados(columna)}
                                                            style={{ cursor: 'pointer' }}
                                                        ></i>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        onKeyDown={e => {
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
                                {ordenarDatos.map((item, index) => (
                                    <tr key={item.cedula} className={filasSeleccionadas.has(item.CEDULA) ? 'fila-seleccionada' : ''}>
                                        {modoEdicion && (
                                            <td>
                                                <input id='Checkbox-Filas' type="checkbox" checked={filasSeleccionadas.has(item.CEDULA)} style={{ cursor: 'pointer' }} onChange={() => clickFila(item.CEDULA)} />
                                            </td>
                                        )}
                                        {Object.keys(item).slice(1)
                                            .filter(key => key !== 'CODIGO_SAP')
                                            .filter(key => key !== 'CONTRATISTA')
                                            .filter(key => key !== 'TIPO_CARRO')
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