import React, { useEffect, useState } from 'react';
import { getOrders, getOrderDetail, bayarOrder, hapusOrder, getQris } from '../api';
import { Box, Typography, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel, CircularProgress, Snackbar, Alert } from '@mui/material';
import BottomNav from '../components/BottomNav';

export default function TransaksiPage({ setUser }) {
  const [orders, setOrders] = useState([]);
  const [detail, setDetail] = useState(null);
  const [open, setOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [payData, setPayData] = useState({ uang_bayar: '', metode_pembayaran: 'Tunai', metode_beli: 'Online', nama_pembeli: '', uang_kembali: '', qris: null });
  const [notif, setNotif] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    getOrders(user.id_cabang).then(res => setOrders(res.data));
  }, []);

  const handleDetail = (orderId) => {
    getOrderDetail(orderId).then(res => {
      setDetail(res.data);
      setOpen(true);
    });
  };

  const handlePayOpen = (order) => {
    getOrderDetail(order.id_order).then(res => {
      setDetail(res.data);
      setPayData({
        uang_bayar: '',
        metode_pembayaran: 'Tunai',
        metode_beli: order.metode_beli || 'Online',
        nama_pembeli: order.nama_pembeli || '',
        uang_kembali: '',
        qris: null
      });
      setPayOpen(true);
    });
  };

  const handlePayChange = (e) => {
    const { name, value } = e.target;
    let uang_kembali = payData.uang_kembali;
    if (name === 'uang_bayar' && payData.metode_pembayaran === 'Tunai') {
      uang_kembali = (parseInt(value || 0) - parseInt(detail.total_harga || 0)).toString();
    }
    setPayData(prev => ({ ...prev, [name]: value, uang_kembali }));
  };

  const handleMetodeChange = async (e) => {
    const metode = e.target.value;
    let uang_bayar = payData.uang_bayar;
    let uang_kembali = payData.uang_kembali;
    let qris = null;
    if (metode === 'Non Tunai') {
      uang_bayar = detail.total_harga;
      uang_kembali = '0';
      setPayLoading(true);
      // Ambil QRIS
      const qrisRes = await getQris({ order_id: detail.id_order, gross_amount: detail.total_harga, nama_pembeli: payData.nama_pembeli || '-' });
      qris = qrisRes.qr_url || null;
      setPayLoading(false);
    } else {
      uang_bayar = '';
      uang_kembali = '';
    }
    setPayData(prev => ({ ...prev, metode_pembayaran: metode, uang_bayar, uang_kembali, qris }));
  };

  const handlePay = async () => {
    setPayLoading(true);
    const data = {
      uang_bayar: payData.uang_bayar,
      uang_kembali: payData.uang_kembali,
      metode_pembayaran: payData.metode_pembayaran,
      metode_beli: payData.metode_beli,
      nama_pembeli: payData.nama_pembeli,
      status_order: 'sudah bayar',
      midtrans_order_id: null,
      midtrans_transaction_id: null
    };
    const res = await bayarOrder(detail.id_order, data);
    setPayLoading(false);
    setPayOpen(false);
    setNotif({ open: true, message: res.success ? 'Pembayaran berhasil!' : 'Pembayaran gagal!', severity: res.success ? 'success' : 'error' });
    if (res.success) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      getOrders(user.id_cabang).then(res => setOrders(res.data));
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Hapus order ini?')) return;
    const res = await hapusOrder(orderId);
    setNotif({ open: true, message: res.success ? 'Order dihapus!' : 'Gagal hapus order!', severity: res.success ? 'success' : 'error' });
    if (res.success) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      getOrders(user.id_cabang).then(res => setOrders(res.data));
    }
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" mb={2}>Daftar Transaksi</Typography>
        <List>
          {orders.map(order => (
            <ListItem key={order.id_order} alignItems="flex-start">
              <ListItemText
                primary={`Order #${order.id_order} - Rp${order.total_harga}`}
                secondary={`Meja: ${order.no_meja} | Status: ${order.status_order}`}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                <Button variant="contained" color="success" onClick={() => handlePayOpen(order)} disabled={order.status_order === 'sudah bayar'} size="small">
                  Bayar
                </Button>
                <Button variant="outlined" color="error" onClick={() => handleDelete(order.id_order)} size="small" disabled={order.status_order !== 'pending'}>
                  Hapus
                </Button>
                <Button variant="outlined" onClick={() => handleDetail(order.id_order)} size="small">
                  Detail
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>
        {/* Dialog Detail */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Detail Transaksi</DialogTitle>
          <DialogContent>
            {detail ? (
              <>
                <Typography>Order ID: {detail.id_order}</Typography>
                <Typography>Nama Pembeli: {detail.nama_pembeli}</Typography>
                <Typography>Total: Rp{detail.total_harga}</Typography>
                <Typography>Metode: {detail.metode_pembayaran}</Typography>
                <Typography>Waktu: {detail.waktu_pesan}</Typography>
                <Typography variant="h6" mt={2}>Item:</Typography>
                <ul>
                  {detail.items && detail.items.map(item => (
                    <li key={item.id_masakan}>{item.nama_masakan} x {item.jumlah}</li>
                  ))}
                </ul>
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => window.open(`/cetak/${detail.id_order}`, '_blank')}
                >
                  Cetak Struk
                </Button>
              </>
            ) : <Typography>Loading...</Typography>}
          </DialogContent>
        </Dialog>
        {/* Dialog Bayar */}
        <Dialog open={payOpen} onClose={() => setPayOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Pembayaran</DialogTitle>
          <DialogContent>
            {detail && (
              <>
                <Typography>Order ID: {detail.id_order}</Typography>
                <Typography>Total: Rp{detail.total_harga}</Typography>
                {/* Tambahkan detail item yang dibeli */}
                <Typography variant="subtitle1" sx={{ mt: 2 }}>Detail Pesanan:</Typography>
                {console.log('Detail items:', detail.items)}
                <ul style={{ marginTop: 4, marginBottom: 8 }}>
                  {detail.items && detail.items.map(item => (
                    <li key={item.id_masakan}>{item.nama_masakan} x {item.jumlah}</li>
                  ))}
                </ul>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Metode Pembayaran</InputLabel>
                  <Select
                    name="metode_pembayaran"
                    value={payData.metode_pembayaran}
                    label="Metode Pembayaran"
                    onChange={handleMetodeChange}
                  >
                    <MenuItem value="Tunai">Tunai</MenuItem>
                    <MenuItem value="Non Tunai">Non Tunai (QRIS)</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Metode Beli</InputLabel>
                  <Select
                    name="metode_beli"
                    value={payData.metode_beli}
                    label="Metode Beli"
                    onChange={handlePayChange}
                  >
                    <MenuItem value="Online">Online</MenuItem>
                    <MenuItem value="Non Online">Non Online</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Nama Pembeli"
                  name="nama_pembeli"
                  value={payData.nama_pembeli}
                  onChange={handlePayChange}
                  fullWidth sx={{ mt: 2 }}
                  InputProps={{ readOnly: true }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <TextField
                    label="Uang Bayar"
                    name="uang_bayar"
                    type="number"
                    value={payData.uang_bayar}
                    onChange={handlePayChange}
                    fullWidth
                    disabled={payData.metode_pembayaran === 'Non Tunai'}
                  />
                  {payData.metode_pembayaran === 'Tunai' && (
                    <Button
                      variant="outlined"
                      sx={{ ml: 1, whiteSpace: 'nowrap', height: '56px' }}
                      onClick={() => {
                        const uang_bayar = detail.total_harga;
                        const uang_kembali = (parseInt(uang_bayar || 0) - parseInt(detail.total_harga || 0)).toString();
                        setPayData(prev => ({ ...prev, uang_bayar, uang_kembali }));
                      }}
                    >
                      Uang Pas
                    </Button>
                  )}
                </Box>
                <TextField
                  label="Kembalian"
                  name="uang_kembali"
                  type="number"
                  value={payData.uang_kembali}
                  fullWidth sx={{ mt: 2 }}
                  disabled
                />
                {payData.metode_pembayaran === 'Non Tunai' && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    {payLoading ? <CircularProgress /> : payData.qris ? (
                      <>
                        <Typography>Scan QRIS untuk bayar:</Typography>
                        <img src={payData.qris} alt="QRIS" style={{ width: 200, height: 200 }} />
                      </>
                    ) : null}
                  </Box>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPayOpen(false)}>Batal</Button>
            <Button onClick={handlePay} variant="contained" color="success" disabled={payLoading || (payData.metode_pembayaran === 'Tunai' && (parseInt(payData.uang_bayar || 0) < parseInt(detail?.total_harga || 0)))}>
              Bayar
            </Button>
          </DialogActions>
        </Dialog>
        {/* Snackbar Notif */}
        {notif.open && (
          <Snackbar open={notif.open} autoHideDuration={2500} onClose={() => setNotif({ ...notif, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert severity={notif.severity}>{notif.message}</Alert>
          </Snackbar>
        )}
      </Box>
      <BottomNav setUser={setUser} />
    </>
  );
}
