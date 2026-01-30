module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, email, phone } = req.body || {};

  const safeName = String(name || '').trim();
  const safeEmail = String(email || '').trim();
  const safePhone = String(phone || '').trim();

  console.log(
    `[contact] ${new Date().toISOString()} name=${safeName || 'unknown'} email=${safeEmail} phone=${safePhone}`
  );

  res.status(200).json({
    ok: true,
    message: 'Tack! Vi h\u00f6r av oss snart.'
  });
};
