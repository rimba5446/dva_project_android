import React, { useEffect, useState } from 'react';
import { getCategories, getMenus, createOrder } from '../api';
import { Box, Typography, Button, Grid, Card, Select, MenuItem, InputLabel, FormControl, Snackbar, Alert } from '@mui/material';
import BottomNav from '../components/BottomNav';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

export default function OrderPage({ user, setUser }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [notif, setNotif] = useState({ open: false, message: '', severity: 'success' });
  const [cartOpen, setCartOpen] = useState(false);
  const [buyerName, setBuyerName] = useState("");

  useEffect(() => {
    getCategories().then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    if (user?.id_cabang) {
      getMenus(selectedCategory, user.id_cabang).then(res => {
        setMenus(res.data);
      });
    }
  }, [selectedCategory, user]);

  const addToCart = (menu) => {
    setCart(prev => {
      const exist = prev.find(item => item.id_masakan === menu.id_masakan);
      if (exist) {
        return prev.map(item =>
          item.id_masakan === menu.id_masakan
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, { ...menu, qty: 1 }];
    });
  };

  // Tambah fungsi untuk edit qty dan hapus item
  const updateQty = (id_masakan, delta) => {
    setCart(prev => prev.map(item =>
      item.id_masakan === id_masakan
        ? { ...item, qty: Math.max(1, item.qty + delta) }
        : item
    ));
  };
  const removeFromCart = (id_masakan) => {
    setCart(prev => prev.filter(item => item.id_masakan !== id_masakan));
  };

  const handleOrder = async () => {
    try {
      await createOrder({
        user_id: user.id_user,
        items: cart.map(item => ({
          id_masakan: item.id_masakan,
          qty: item.qty,
          harga: item.harga // <-- ini penting!
        })),
        nama_pembeli: buyerName // <-- kirim nama pembeli
      });
      setCart([]);
      setBuyerName("");
      setNotif({ open: true, message: 'Order berhasil!', severity: 'success' });
    } catch {
      setNotif({ open: true, message: 'Order gagal!', severity: 'error' });
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">Entri Order</Typography>
          <Button
            variant="outlined"
            startIcon={<ShoppingCartIcon />}
            onClick={() => setCartOpen(true)}
            sx={{ minWidth: 40, px: 2 }}
          >
            {cart.length}
          </Button>
        </Box>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Pilih Kategori</InputLabel>
          <Select
            value={selectedCategory}
            label="Pilih Kategori"
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {categories.map(cat => (
              <MenuItem key={cat.id_category} value={cat.id_category}>{cat.nama_category}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', p: 3, pb: 8 }}>
        <Grid container spacing={2} justifyContent="center">
          {menus.map(menu => (
            <Grid item xs={6} sm={4} md={3} key={menu.id_masakan}>
              <Card
                sx={{
                  width: 140,
                  height: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 0,
                  mx: 'auto',
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    px: 1,
                    pt: 2,
                    pb: 0,
                  }}
                >
                  <Box
                    sx={{
                      minHeight: 48,
                      maxHeight: 48,
                      width: '100%',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.2,
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontSize={14}
                      align="center"
                      sx={{
                        fontWeight: 'bold',
                        textAlign: 'center',
                        width: '100%',
                        lineHeight: 1.2,
                      }}
                    >
                      {menu.nama_masakan}
                    </Typography>
                  </Box>
                  <Typography fontSize={13} align="center" sx={{ mb: 0.5 }}>
                    Rp{menu.harga.toLocaleString('id-ID')},-
                  </Typography>
                  <Typography fontSize={13} align="center">
                    Stok: {menu.stok}
                  </Typography>
                </Box>
                <Box sx={{ px: 1, pb: 1 }}>
                  <Button
                    onClick={() => addToCart(menu)}
                    variant="contained"
                    size="small"
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    Tambah Menu
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Dialog open={cartOpen} onClose={() => setCartOpen(false)}>
          <DialogTitle>Keranjang</DialogTitle>
          <DialogContent dividers>
            {cart.length === 0 && <Typography>Belum ada item.</Typography>}
            {cart.map(item => (
              <Box key={item.id_masakan} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 1 }}>
                <span>{item.nama_masakan}</span>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button size="small" onClick={() => updateQty(item.id_masakan, -1)} disabled={item.qty <= 1}>-</Button>
                  <Typography>{item.qty}</Typography>
                  <Button size="small" onClick={() => updateQty(item.id_masakan, 1)}>+</Button>
                </Box>
                <span>Rp{item.harga.toLocaleString('id-ID')} x {item.qty} = Rp{(item.harga * item.qty).toLocaleString('id-ID')}</span>
                <IconButton size="small" color="error" onClick={() => removeFromCart(item.id_masakan)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            {/* Tambah input nama pembeli */}
            {cart.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Nama Pembeli</Typography>
                <input
                  type="text"
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                  placeholder="Masukkan nama pembeli"
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                />
              </Box>
            )}
            {cart.length > 0 && (
              <Box sx={{ mt: 2, fontWeight: 'bold', textAlign: 'right' }}>
                Total: Rp{cart.reduce((a, b) => a + b.harga * b.qty, 0).toLocaleString('id-ID')}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCartOpen(false)}>Tutup</Button>
            {cart.length > 0 && (
              <Button variant="contained" color="success" onClick={handleOrder}>
                Proses Order
              </Button>
            )}
          </DialogActions>
        </Dialog>
        <Snackbar open={notif.open} autoHideDuration={2500} onClose={() => setNotif({ ...notif, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity={notif.severity}>{notif.message}</Alert>
        </Snackbar>
      </Box>
      <BottomNav setUser={setUser} />
    </Box>
  );
}
