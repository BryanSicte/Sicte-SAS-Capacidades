import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import  './Login.css'
import Sicte from '../../Imagenes/Sicte 6.png'
import Cookies from 'js-cookie';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try {
            const response = await fetch('https://sicte-sas-capacidades-backend-no-production.up.railway.app/api/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Cambia el tipo de contenido a application/json
                },
                body: JSON.stringify({ correo: username, contrasena: password }), // Convierte los datos a JSON
            });
    
            if (response.ok) {
                const data = await response.json(); // Obtén la respuesta como JSON
                const userRole = data.rol; // Asume que la respuesta tiene una propiedad 'rol'
                console.log(data.rol)
                Cookies.set('userRole', data.rol, { expires: 7 });
                navigate(`/Principal?role=${encodeURIComponent(userRole)}`);
            } else {
                const errorText = await response.text();
                if (response.status === 404) {
                    setError('Usuario no encontrado');
                } else if (response.status === 401) {
                    setError('Contraseña incorrecta');
                } else {
                    setError('Error inesperado: ' + errorText);
                }
            }
        } catch (error) {
            setError('Error al conectar con el servidor');
        }
    };

    return (
        <div id="Login-App">
            <div id='Login-Contenido_1'>
                <img src={Sicte} alt="Logo Sicte" />
            </div>
            <div id='Login-Contenido_2'>
                <div id='Login-Titulo'>
                    <h1>¡ Bienvenido !</h1>
                </div>            
                <form onSubmit={handleSubmit}>
                    <div id='Login-Usuario'>
                        <i className="glyphicon fas fa-user"></i>
                        <input type="text" placeholder="Correo" value={username} onChange={(e) => setUsername(e.target.value)}/>
                    </div>
                    <div id='Login-Contraseña'>
                        <i className="fas fa-lock"></i>
                        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </div>

                    <div id='Login-Boton-Envio'>
                        <button type="submit" id='Login-Boton-Envio-Estilo' className="btn btn-primary">Iniciar sesión</button>
                    </div>
                </form>
                {error === "Error al conectar con el servidor" ? (
                    <div className='contenedor-error-message'>
                        <span className="error-message">
                            Por favor hacer click <a href="https://sicteferias.from-co.net:8120/" target="_blank" rel="noopener noreferrer">aqui</a> y dar acceso al enlace
                        </span>
                    </div>
                ) : (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                <div id='Version'>
                    <p>v1.27</p>
                </div>
            </div>
        </div>
    );
};

export default Login;