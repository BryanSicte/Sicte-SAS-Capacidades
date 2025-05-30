import React from 'react';
import { useState, useEffect } from 'react';
import '../Principal/Principal.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ThreeDots } from 'react-loader-spinner';
import './Reportes.css'

const Reportes = ({ role }) => {
    const [datos, setDatos] = useState([]);
    const [filtros, setFiltros] = useState({});
    const [error, setError] = useState('');
    const [ordenarCampo, setOrdenarCampo] = useState('nombreCompleto');
    const [ordenarOrden, setOrdenarOrden] = useState('asc');
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [mesAnioSeleccionado, setMesAnioSeleccionado] = useState('');

    const cargarDatos = () => {
        fetch(`${process.env.REACT_APP_API_URL}/capacidades/todoBackup`)
            .then(response => response.json())
            .then(data => {
                setDatos(data);
                setLoading(false);

                if (data.length > 0) {
                    const fechas = data.map(item => new Date(item.FECHA_REPORTE));
                    const ultimaFecha = new Date(Math.max(...fechas));
                    const mesAnio = `${ultimaFecha.getMonth() + 1}-${ultimaFecha.getFullYear()}`;
                    setMesAnioSeleccionado(mesAnio);
                }
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
    }, [filtros, mesAnioSeleccionado]);

    const clickAplicarFiltros = (e, columna) => {
        const Valor = e.target.value;
        setFiltros({ ...filtros, [columna]: Valor });
    };

    const getMesesAnios = () => {
        const uniqueDates = new Set();
        datos.forEach(item => {
            if (item.FECHA_REPORTE) {
                const date = new Date(item.FECHA_REPORTE);
                const mesAnio = `${date.getMonth() + 1}-${date.getFullYear()}`;
                uniqueDates.add(mesAnio);
            }
        });
        return Array.from(uniqueDates);
    };

    const filtrarDatos = datos.filter(item => {
        for (let key in filtros) {
            if (filtros[key] && item[key] && !item[key].toLowerCase().includes(filtros[key].toLowerCase())) {
                return false;
            }
        }
        if (mesAnioSeleccionado) {
            const [mes, anio] = mesAnioSeleccionado.split('-');
            const fecha = new Date(item.FECHA_REPORTE);
            if (fecha.getMonth() + 1 !== parseInt(mes) || fecha.getFullYear() !== parseInt(anio)) {
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

    const exportarExcel = () => {
        const ws = XLSX.utils.json_to_sheet(ordenarDatos);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Datos');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const [mes, anio] = mesAnioSeleccionado.split('-');
        let nombreArchivo = `Reporte ${mes}-${anio}.xlsx`;
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), nombreArchivo);
    };

    const formatearValorEsperado = (valorEsperado) => {
        const valor = valorEsperado !== "null" ? valorEsperado : 0;
        const formatter = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        });
        return formatter.format(valor);
    };

    return (
        <div className='Reportes'>
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
                        <button className='Boton-Borrar-Filtros btn btn-success' onClick={BotonLimpiarFiltros}><i className="fas fa-filter"></i> Borrar Filtros</button>
                        <div className="Fecha-Reporte-Select">
                            <select className='Fecha-Reporte-Boton select-box' value={mesAnioSeleccionado} onChange={(e) => setMesAnioSeleccionado(e.target.value)}>
                                {getMesesAnios().map((mesAnio, index) => (
                                    <option key={index} value={mesAnio}>
                                        {mesAnio}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button className='Boton-Exportar-Excel btn btn-success' onClick={exportarExcel}><i className="fas fa-file-excel"></i> Exportar</button>
                    </div>
                    <div className="tabla-container">
                        <table>
                            {ordenarDatos.length > 0 && (
                                <thead>
                                    <tr>
                                        {Object.keys(ordenarDatos[0])
                                            .filter(key => !['id','CODIGO_SAP', 'CONTRATISTA', 'TIPO_CARRO', 'TIPO_VEHICULO'].includes(key))
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
                                    <tr key={index}>
                                        {Object.keys(item).slice(1)
                                            .filter(key => key !== 'CODIGO_SAP')
                                            .filter(key => key !== 'CONTRATISTA')
                                            .filter(key => key !== 'TIPO_CARRO')
                                            .filter(key => key !== 'TIPO_VEHICULO')
                                            .map((key, i) => (
                                                <td key={i}>
                                                    {key === 'MOVIL' ? (parseFloat(item[key]).toFixed(3)) : key === 'PERSONAS' ? (parseFloat(item[key]).toFixed(0)) : key === 'VALOR_ESPERADO' ? formatearValorEsperado(item[key]) : item[key]}
                                                </td>
                                            ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className='piePagina'>
                        <p>Total de items: {totalItems}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reportes;