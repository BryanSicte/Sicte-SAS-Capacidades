import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Visualizar from '../Visualizar/Visualizar';
import Agregar from '../Agregar/Agregar';
import ValidarPersonal from '../ValidarPersonas/ValidarPersonal';
import Retirados from '../Retirados/Retirados';
import ValidarMoviles from '../ValidarMoviles/ValidarMoviles';
import Reportes from '../Reportes/Reportes';
import ImportarDatos from '../Importar Datos/ImportarDatos';
import { ThreeDots } from 'react-loader-spinner';
import './Principal.css'

const Principal = () => {
    const [datos, setDatos] = useState([]);
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const role = query.get('role');
    const [paginaActiva, setPaginaActiva] = useState('Visualizar');
    const [error, setError] = useState('');
    const [datosMovil, setDatosMovil] = useState([]);
    const [tipoMovilValidas, setTipoMovilValidas] = useState({});
    const [tipoFacturacionValidas, setTipoFacturacionValidas] = useState({});
    const [coordinadores, setCoordinadores] = useState([]);
    const [mesAnioSeleccionado, setMesAnioSeleccionado] = useState('');
    const [datosTodoBackup, setDatosTodoBackup] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDatosBackup();
        cargarDatosMovil();
        cargarDatosCoordinador();
        cargarDatos();
    }, []);

    const cargarDatosMovil = () => {
        fetch(`${process.env.REACT_APP_API_URL}/capacidades/movil`)
            .then(response => response.json())
            .then(data => {
                setDatosMovil(data);
                const tipoMovil = data.map(item => item.tipo_movil);
                const tipoFacturacion = data.map(item => item.tipo_facturacion);
                const tipoMovilUnicos = Array.from(new Set(tipoMovil));
                const tipoFacturacionUnicos = Array.from(new Set(tipoFacturacion));
                setTipoMovilValidas(tipoMovilUnicos);
                setTipoFacturacionValidas(tipoFacturacionUnicos);
            })
            .catch(error => setError('Error al cargar los datos: ' + error.message));
    };

    const cargarDatosCoordinador = () => {
        fetch(`${process.env.REACT_APP_API_URL}/capacidades/coordinador`)
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

    const cambiarPagina = (pagina) => {
        cargarDatos();
        setPaginaActiva(pagina);
    };

    const cargarDatosBackup = () => {
        fetch(`${process.env.REACT_APP_API_URL}/capacidades/todoBackup`)
            .then(response => response.json())
            .then(data => {
                setDatosTodoBackup(data);
                setLoading(false);
            })
            .catch(error => {
                setError('Error al cargar los datos: ' + error.message);
            });
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
            })
            .catch(error => {
                setError('Error al cargar los datos: ' + error.message);
                setLoading(false);
            });
    };

    const renderizarPagina = () => {
        const paginaProps = {
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
            setCoordinadores,
            datosTodoBackup,
            setDatosTodoBackup,
            mesAnioSeleccionado,
            setMesAnioSeleccionado,
            datos,
            setDatos
        };

        switch (paginaActiva) {
            case 'Visualizar':
                return <Visualizar {...paginaProps} />;
            case 'ValidarPersonal':
                return <ValidarPersonal {...paginaProps} />;
            case 'Agregar':
                return <Agregar {...paginaProps} />;
            case 'ImportarDatos':
                return <ImportarDatos {...paginaProps} />;
            case 'Retirados':
                return <Retirados {...paginaProps} />;
            case 'ValidarMoviles':
                return <ValidarMoviles {...paginaProps} />;
            case 'Reportes':
                return <Reportes {...paginaProps} />;
            default:
                return null;
        }
    };

    return (
        <div>
            {loading ? (
                <div className="CargandoPagina2">
                    <ThreeDots
                        type="ThreeDots"
                        color="#0B1A46"
                        height={200}
                        width={200}
                    />
                    <p>... Cargando Datos ...</p>
                </div>
            ) : (
                <div className="Principal-Container">
                    <div className="Principal-Menu-Lateral">
                        <div className='Principal-Titulo'>
                            <h3>Capacidades</h3>
                        </div>
                        <div className='Principal-Lista'>
                            <ul>
                                <li onClick={() => cambiarPagina('Visualizar')} className={paginaActiva === 'Visualizar' ? 'active' : ''}>
                                    <i className="fas fa-eye"></i>Visualizar
                                </li>
                                <li onClick={() => cambiarPagina('ValidarPersonal')} className={paginaActiva === 'ValidarPersonal' ? 'active' : ''}>
                                    <i className="fas fa-user-check"></i>Validar Personal
                                </li>
                                <li onClick={() => cambiarPagina('Agregar')} className={paginaActiva === 'Agregar' ? 'active' : ''}>
                                    <i className="fas fa-user-plus"></i>Agregar
                                </li>
                                <li onClick={() => cambiarPagina('ImportarDatos')} className={paginaActiva === 'ImportarDatos' ? 'active' : ''}>
                                    <i className="fas fa-upload"></i>Importar Datos
                                </li>
                                <li onClick={() => cambiarPagina('Retirados')} className={paginaActiva === 'Retirados' ? 'active' : ''}>
                                    <i className="fas fa-user-times"></i>Retirados
                                </li>
                                <li onClick={() => cambiarPagina('ValidarMoviles')} className={paginaActiva === 'ValidarMoviles' ? 'active' : ''}>
                                    <i className="fas fa-car"></i>Validar Moviles
                                </li>
                                <li onClick={() => cambiarPagina('Reportes')} className={paginaActiva === 'Reportes' ? 'active' : ''}>
                                    <i className="fas fa-file-alt"></i>Reportes
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className='contenido'>
                        {renderizarPagina()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Principal;