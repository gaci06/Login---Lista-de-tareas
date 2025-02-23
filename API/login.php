<?php
require_once 'db.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$usuario = $data['usuario'] ?? '';
$contrasena = $data['contrasena'] ?? '';

if (!$usuario || !$contrasena) {
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

$stmt = $pdo->prepare("SELECT id, contrasena FROM usuarios WHERE usuario = ?");
$stmt->execute([$usuario]);
$user = $stmt->fetch();

if ($user && hash('sha256', $contrasena) === $user['contrasena']) {
    $token = bin2hex(random_bytes(32));
    $expiracion = date('Y-m-d H:i:s', strtotime('+5 minutes'));

    $pdo->prepare("UPDATE usuarios SET token = ?, expiracion_token = ? WHERE id = ?")
        ->execute([$token, $expiracion, $user['id']]);

    echo json_encode(["token" => $token, "expiracion" => $expiracion]);
} else {
    echo json_encode(["error" => "Credenciales incorrectas"]);
}
?>
