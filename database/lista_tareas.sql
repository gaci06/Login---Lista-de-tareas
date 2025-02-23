-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS lista_tareas;
USE lista_tareas;

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    token VARCHAR(255),
    expiracion_token DATETIME
);

-- Insertar el usuario por defecto (usuario: daw, contraseña: daw2025)
INSERT INTO usuarios (usuario, contrasena) 
VALUES ('daw', SHA2('daw2025', 256));

-- Tabla de Tareas
CREATE TABLE tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    estado ENUM('pendiente','enProgreso','completada') DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
