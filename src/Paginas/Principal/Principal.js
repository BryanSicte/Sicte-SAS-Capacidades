import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Visualizar from '../Visualizar/Visualizar';
import Agregar from '../Agregar/Agregar';
import ValidarPersonal from '../ValidarPersonas/ValidarPersonal';
import Retirados from '../Retirados/Retirados';
import ValidarMoviles from '../ValidarMoviles/ValidarMoviles';

const Principal = () => {
    const location = useLocation();
    const { role } = location.state || {};
    const [paginaActiva, setPaginaActiva] = useState('Visualizar');
    const [error, setError] = useState('');
    const [datosMovil, setDatosMovil] = useState([]);
    const [tipoMovilValidas, setTipoMovilValidas] = useState({});
    const [tipoFacturacionValidas, setTipoFacturacionValidas] = useState({});
    const [coordinadores, setCoordinadores] = useState([]);

    useEffect(() => {
        cargarDatosMovil();
        cargarDatosCoordinador();
    }, []);

    const cargarDatosMovil = () => {
        fetch('https://sicteferias.from-co.net:8120/capacidad/Movil')
        .then(response => response.json())
        .then(data => {
            setDatosMovil(data);
            const tipoMovil = data.map(item => item.tipoMovil);
            const tipoFacturacion = data.map(item => item.tipoFacturacion);
            const tipoMovilUnicos = Array.from(new Set(tipoMovil));
            const tipoFacturacionUnicos = Array.from(new Set(tipoFacturacion));
            setTipoMovilValidas(tipoMovilUnicos);
            setTipoFacturacionValidas(tipoFacturacionUnicos);
        })
        .catch(error => setError('Error al cargar los datos: ' + error.message));
    };

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

    const cambiarPagina = (pagina) => {
        setPaginaActiva(pagina);
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
            setCoordinadores
        };

        switch (paginaActiva) {
            case 'Visualizar':
                return <Visualizar {...paginaProps} />;
            case 'ValidarPersonal':
                return <ValidarPersonal {...paginaProps} />;
            case 'Agregar':
                return <Agregar {...paginaProps} />;
            case 'Retirados':
                return <Retirados {...paginaProps} />;
            case 'ValidarMoviles':
                return <ValidarMoviles {...paginaProps} />;
            default:
                return null;
        }
    };

    return (
        <div id="Principal-Container">
            <div id="Principal-Menu-Lateral">
                <div id='Principal-Titulo'>
                    <h3>Capacidades</h3>
                </div>
                <div id='Principal-Lista'>
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
                        <li onClick={() => cambiarPagina('Retirados')} className={paginaActiva === 'Retirados' ? 'active' : ''}>
                            <i className="fas fa-user-times"></i>Retirados
                        </li>
                        <li onClick={() => cambiarPagina('ValidarMoviles')} className={paginaActiva === 'ValidarMoviles' ? 'active' : ''}>
                            <i className="fas fa-car"></i>Validar Moviles
                        </li>
                    </ul>
                </div>
            </div>
            {renderizarPagina()}
        </div>
    );
};

export default Principal;