import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // Importamos bcrypt

export const login = async (req, res) => {
  const { username, password } = req.body;

  // Comparamos la contraseña enviada por el usuario con el hash guardado en .env
  const isMatch = await bcrypt.compare(password, process.env.AUTH_PASS_HASH);

  if (username === process.env.AUTH_USER && isMatch) {
    const payload = { user: { username } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Credenciales incorrectas' });
  }
};