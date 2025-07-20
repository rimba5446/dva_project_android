// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { TextField, Button, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSetting, setOpenSetting] = useState(false);
  const [serverUrl, setServerUrl] = useState(() => localStorage.getItem('server_url') || 'http://192.168.1.7:5000/api');
  const [tempUrl, setTempUrl] = useState(serverUrl);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submit login', username, password);
    try {
      const res = await login(username, password);
      console.log('API response:', res.data);
      onLogin(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/order'); // Redirect ke halaman order
    } catch (err) {
      console.log('API error:', err);
      setError('Login gagal/Akun belum di validasi');
    }
  };

  const handleOpenSetting = () => {
    setTempUrl(serverUrl);
    setOpenSetting(true);
  };
  const handleCloseSetting = () => setOpenSetting(false);
  const handleSaveSetting = () => {
    setServerUrl(tempUrl);
    localStorage.setItem('server_url', tempUrl);
    setOpenSetting(false);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 10, position: 'relative' }}>
      <IconButton
        aria-label="setting"
        onClick={handleOpenSetting}
        sx={{ position: 'absolute', top: 8, right: 8 }}
        size="large"
      >
        <SettingsIcon />
      </IconButton>
      <Typography variant="h4" mb={2}>Login Kasir</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Username" fullWidth margin="normal" value={username} onChange={e => setUsername(e.target.value)} />
        <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <Typography color="error">{error}</Typography>}
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Login</Button>
      </form>
      <Dialog open={openSetting} onClose={handleCloseSetting}>
        <DialogTitle>Setting Server</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>Server saat ini: {serverUrl}</Typography>
          <TextField
            label="Alamat/IP Server"
            fullWidth
            margin="normal"
            value={tempUrl}
            onChange={e => setTempUrl(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSetting}>Batal</Button>
          <Button onClick={handleSaveSetting} variant="contained">Simpan</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
