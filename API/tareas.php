<?php
require_once 'db.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$headers = getallheaders();
$token = $headers['Authorization'] ?? '';

$stmt = $pdo->prepare("SELECT id FROM usuarios WHERE token = ? AND expiracion_token > NOW()");
$stmt->execute([$token]);
$user = $stmt->fetch();

if (!$user) {
    echo json_encode(["error" => "Acceso no autorizado"]);
    exit;
}

$user_id = $user['id'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->prepare("SELECT * FROM tareas WHERE usuario_id = ?");
        $stmt->execute([$user_id]);
        $result = $stmt->fetchAll();
        echo json_encode($result);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO tareas (usuario_id, titulo, descripcion, estado) VALUES (?, ?, ?, 'pendiente')");
        $stmt->execute([$user_id, $data['titulo'], $data['descripcion']]);
        echo json_encode(["mensaje" => "Tarea creada"]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Verificar si la tarea pertenece al usuario
        $stmt = $pdo->prepare("SELECT id FROM tareas WHERE id = ? AND usuario_id = ?");
        $stmt->execute([$data['id'], $user_id]);
        if (!$stmt->fetch()) {
            echo json_encode(["error" => "No tienes permiso para modificar esta tarea"]);
            exit;
        }
        
        // Si solo se quiere actualizar el estado
        if (isset($data['estado']) && !isset($data['titulo']) && !isset($data['descripcion'])) {
            $stmt = $pdo->prepare("UPDATE tareas SET estado = ? WHERE id = ? AND usuario_id = ?");
            $ok = $stmt->execute([$data['estado'], $data['id'], $user_id]);
        } else {
            $stmt = $pdo->prepare("UPDATE tareas SET titulo = ?, descripcion = ?, estado = ? WHERE id = ? AND usuario_id = ?");
            $ok = $stmt->execute([
                $data['titulo'], 
                $data['descripcion'], 
                $data['estado'], 
                $data['id'], 
                $user_id
            ]);
        }

        if ($ok) {
            echo json_encode(["mensaje" => "Tarea actualizada"]);
        } else {
            echo json_encode(["error" => "No se pudo actualizar"]);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("DELETE FROM tareas WHERE id = ? AND usuario_id = ?");
        $ok = $stmt->execute([$data['id'], $user_id]);
        
        if ($ok) {
            echo json_encode(["mensaje" => "Tarea eliminada"]);
        } else {
            echo json_encode(["error" => "No se pudo eliminar"]);
        }
        break;
}
