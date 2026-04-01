import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'llave-secreta-ultra-segura';
export const authenticateToken = (req, res, next) => {
    // 1. Extraer el token de la cabecera "Authorization"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // El formato suele ser: "Bearer TOKEN"
    if (!token) {
        return res.status(401).json({ error: "Acceso denegado. No hay token." });
    }
    try {
        // 2. Verificar el sello (Token)
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified; // Guardamos los datos del usuario en la petición
        next(); // ¡Todo bien! Pasa al siguiente paso (la ruta)
    }
    catch (error) {
        res.status(403).json({ error: "Token no válido o expirado" });
    }
};
//# sourceMappingURL=auth.js.map