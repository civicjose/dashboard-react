import jwt from 'jsonwebtoken';

export const login = (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.AUTH_USER && password === process.env.AUTH_PASS) {
    const payload = { user: { username } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Credenciales incorrectas' });
  }
};