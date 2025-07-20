import React, { useState } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Select, FormControl, InputLabel, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import BottomNav from '../components/BottomNav';
import { getLaporan } from '../api';

export default function LaporanPage() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [type, setType] = useState('harian');
  const [laporan, setLaporan] = useState([]);
  const [sum, setSum] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await getLaporan(start, end, type, user.id_cabang);
      setLaporan(res.data.laporan || []);
      setSum(res.data.sum || null);
    } catch (err) {
      console.error('Laporan error:', err, err?.response?.data);
      alert('Gagal mengambil data laporan: ' + (err?.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" mb={2}>Laporan Transaksi</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Tanggal Mulai"
            type="date"
            value={start}
            onChange={e => setStart(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Tanggal Akhir"
            type="date"
            value={end}
            onChange={e => setEnd(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl>
            <InputLabel>Tipe</InputLabel>
            <Select value={type} label="Tipe" onChange={e => setType(e.target.value)}>
              <MenuItem value="harian">Harian (Detail)</MenuItem>
              <MenuItem value="bulanan">Bulanan (Rekap Harian)</MenuItem>
              <MenuItem value="sum">Summary</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={fetchLaporan} disabled={loading}>Filter</Button>
        </Box>
        {/* Summary Section untuk Harian & Bulanan */}
        {(type === 'harian' || type === 'bulanan') && sum && (
          <Paper sx={{ mt: 2, mb: 2, p: 2 }}>
            <Typography>Total Transaksi: {sum.total_transaksi}</Typography>
            <Typography>Total Pendapatan: Rp{sum.total_pendapatan}</Typography>
          </Paper>
        )}
        {/* Tabel Laporan */}
        {type === 'harian' && laporan.length > 0 && (
          <Box sx={{ width: '100%', overflowX: 'auto', mt: 2 }}>
            <Paper sx={{ minWidth: 600 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Waktu</TableCell>
                    <TableCell>Pembeli</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Kasir</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {laporan.map(row => (
                    <TableRow key={row.id_order}>
                      <TableCell>{row.id_order}</TableCell>
                      <TableCell>{row.waktu_pesan}</TableCell>
                      <TableCell>{row.nama_pembeli}</TableCell>
                      <TableCell>Rp{row.total_harga}</TableCell>
                      <TableCell>{row.username}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        )}
        {type === 'bulanan' && laporan.length > 0 && (
          <Box sx={{ width: '100%', overflowX: 'auto', mt: 2 }}>
            <Paper sx={{ minWidth: 600 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tanggal</TableCell>
                    <TableCell>Total Transaksi</TableCell>
                    <TableCell>Total Pendapatan</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {laporan.map(row => (
                    <TableRow key={row.tanggal}>
                      <TableCell>{row.tanggal}</TableCell>
                      <TableCell>{row.total_transaksi}</TableCell>
                      <TableCell>Rp{row.total_pendapatan}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        )}
        {type === 'sum' && sum && (
          <Paper sx={{ mt: 2, p: 2 }}>
            <Typography>Total Transaksi: {sum.total_transaksi}</Typography>
            <Typography>Total Pendapatan: Rp{sum.total_pendapatan}</Typography>
          </Paper>
        )}
        {/* Pesan jika tidak ada data sama sekali */}
        {laporan.length === 0 && !loading && !sum && (
          <Typography sx={{ mt: 2 }}>Belum ada data.</Typography>
        )}
      </Box>
      <BottomNav />
    </>
  );
}
