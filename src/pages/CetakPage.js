import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderDetail, getSettings } from '../api';
import { Box, Typography, Divider, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

function formatRupiah(num) {
  return 'Rp' + (Number(num) || 0).toLocaleString('id-ID');
}

export default function CetakPage() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getOrderDetail(id).then(res => setDetail(res.data));
    getSettings().then(res => setSettings(res.data));
  }, [id]);

  useEffect(() => {
    if (detail && settings) setTimeout(() => window.print(), 500);
  }, [detail, settings]);

  if (!detail || !settings) return <Typography>Loading...</Typography>;

  // Diskon logic
  const items = detail.items || [];
  let totalDiskon = 0;
  if (settings.discount_active && settings.discount_value > 0 && Array.isArray(settings.discount_menu)) {
    for (const item of items) {
      if (settings.discount_menu.includes(item.id_masakan) && item.jumlah >= settings.discount_min_qty) {
        if (settings.discount_type === 'nominal') {
          totalDiskon += settings.discount_value * Math.floor(item.jumlah / settings.discount_min_qty);
        } else if (settings.discount_type === 'persen') {
          totalDiskon += ((item.harga * item.jumlah) * settings.discount_value / 100);
        }
      }
    }
  }
  totalDiskon = Math.round(totalDiskon);
  const totalAkhir = Math.max(0, (detail.total_harga || 0) - totalDiskon);

  // Kupon logic
  let kuponPerMakanan = {};
  if (Array.isArray(settings.coupon_food)) {
    for (const item of items) {
      for (const cf of settings.coupon_food) {
        if (cf && item.nama_masakan && item.nama_masakan.toLowerCase().includes(cf.toLowerCase())) {
          const min = settings.coupon_min || 1;
          const jml = Math.floor(item.jumlah / Math.max(1, min));
          if (jml > 0) {
            kuponPerMakanan[cf] = (kuponPerMakanan[cf] || 0) + jml;
          }
        }
      }
    }
  }

  return (
    <Box sx={{ p: 2, maxWidth: 400, mx: 'auto', bgcolor: '#fff', color: '#000', fontSize: 12 }}>
      <Box textAlign="center">
        {settings.logo ? (
          <img
            src={
              settings.logo.startsWith('http')
                ? settings.logo
                : `http://localhost/dva_mobile/dva_project/gambar/${settings.logo}`
            }
            alt="logo"
            style={{ maxWidth: 80 }}
            onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/80x80?text=No+Logo'; }}
          />
        ) : (
          <div style={{ height: 80, lineHeight: '80px' }}>No Logo</div>
        )}
        <div>{settings.alamat}</div>
        <div>Telp: {settings.telp}</div>
        <div>Email: {settings.email}</div>
      </Box>
      <Divider sx={{ my: 1 }} />
      <Box>
        <Typography align="center" fontWeight="bold">No Antrian: {detail.no_meja}</Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>Nama Pembeli</TableCell>
              <TableCell>:</TableCell>
              <TableCell>{detail.nama_pembeli}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Waktu Pesan</TableCell>
              <TableCell>:</TableCell>
              <TableCell>{detail.waktu_pesan}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Metode Pembayaran</TableCell>
              <TableCell>:</TableCell>
              <TableCell>{detail.metode_pembayaran}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>:</TableCell>
              <TableCell>{detail.metode_beli}</TableCell>
            </TableRow>
            {detail.midtrans_order_id && (
              <TableRow>
                <TableCell>Midtrans Order ID</TableCell>
                <TableCell>:</TableCell>
                <TableCell>{detail.midtrans_order_id}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
      <Divider sx={{ my: 1 }} />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>No</TableCell>
            <TableCell>Menu</TableCell>
            <TableCell align="right">Jumlah</TableCell>
            <TableCell align="right">Harga</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, idx) => (
            <TableRow key={item.id_masakan}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{item.nama_masakan}</TableCell>
              <TableCell align="right">{item.jumlah}</TableCell>
              <TableCell align="right">{formatRupiah(item.harga)}</TableCell>
              <TableCell align="right">{formatRupiah((item.harga || 0) * (item.jumlah || 0))}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={4}><b>Total</b></TableCell>
            <TableCell align="right"><b>{formatRupiah(detail.total_harga)}</b></TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={4}><b>Uang Bayar</b></TableCell>
            <TableCell align="right"><b>{formatRupiah(detail.uang_bayar)}</b></TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={4}><b>Uang Kembali</b></TableCell>
            <TableCell align="right"><b>{formatRupiah(detail.uang_kembali)}</b></TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={4}><b>Diskon</b></TableCell>
            <TableCell align="right"><b>- {formatRupiah(totalDiskon)}</b></TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={4}><b>Total Akhir</b></TableCell>
            <TableCell align="right"><b>{formatRupiah(totalAkhir)}</b></TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Divider sx={{ my: 1 }} />
      <Typography align="center" fontWeight="bold">TERIMAKASIH ATAS KUNJUNGANNYA</Typography>
      <Divider sx={{ my: 1 }} />
      {/* Kupon */}
      {Object.keys(kuponPerMakanan).length > 0 && (
        <Box textAlign="center" my={2}>
          {Object.entries(kuponPerMakanan).map(([cf, jml]) => (
            Array.from({ length: jml }).map((_, i) => (
              <Box key={cf + i} sx={{ border: '2px dashed #000', p: 1, my: 1 }}>
                <Typography variant="body2">Kumpulkan Struk ini dan dapatkan</Typography>
                <Typography variant="body2" fontWeight="bold">GRATIS x1 {cf}</Typography>
                <Typography variant="body2">TUKARKAN KE KASIR</Typography>
              </Box>
            ))
          ))}
        </Box>
      )}
      <Typography align="center" sx={{ fontSize: 10 }}>www.dva-project.com</Typography>
    </Box>
  );
}
