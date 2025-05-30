import React from 'react';
import { useState, useEffect } from 'react';
import  '../Principal/Principal.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ThreeDots } from 'react-loader-spinner';
import './Retirados.css'

const Retirados = ({ role }) => {
    const [datos, setDatos] = useState([]);
    const [filtros, setFiltros] = useState({});
    const [error, setError] = useState('');
    const [ordenarCampo, setOrdenarCampo] = useState('nombreCompleto');
    const [ordenarOrden, setOrdenarOrden] = useState('asc');
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [totalitemsInicial, setTotalitemsInicial] = useState(false);

    const cargarDatos = () => {
        fetch(`${process.env.REACT_APP_API_URL}/capacidades/noContinuaEnPlanta`)
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
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'Retirados.xlsx');
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
        <div className='Retirados'>
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
                                        {Object.keys(ordenarDatos[0])
                                            .filter(key => !['id'].includes(key))
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
                                        .filter(key => key !== 'id')
                                        .map((key, i) => (
                                            <td key={i}>
                                                {item[key]}
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

export default Retirados;