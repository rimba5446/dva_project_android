import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Paper from '@mui/material/Paper';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AssessmentIcon from '@mui/icons-material/Assessment';

export default function BottomNav({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = React.useState(() => {
    if (location.pathname.startsWith('/order')) return 0;
    if (location.pathname.startsWith('/transaksi')) return 1;
    if (location.pathname.startsWith('/laporan')) return 3;
    return 0;
  });
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  React.useEffect(() => {
    if (location.pathname.startsWith('/order')) setValue(0);
    else if (location.pathname.startsWith('/transaksi')) setValue(1);
    else if (location.pathname.startsWith('/laporan')) setValue(3);
  }, [location.pathname]);

  const handleAccountClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    setAnchorEl(null);
    if (setUser) setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }} elevation={3}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          if (newValue === 0) navigate('/order');
          if (newValue === 1) navigate('/transaksi');
          if (newValue === 3) navigate('/laporan');
        }}
      >
        <BottomNavigationAction label="Order" icon={<ShoppingCartIcon />} value={0} />
        <BottomNavigationAction label="Transaksi" icon={<ReceiptIcon />} value={1} />
        <BottomNavigationAction label="Akun" icon={<AccountCircleIcon />} value={2} onClick={handleAccountClick} />
        <BottomNavigationAction
          label="Laporan"
          icon={<AssessmentIcon />}
          value={3}
          onClick={() => navigate('/laporan')}
        />
      </BottomNavigation>
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MenuItem onClick={handleLogout}>Logout / Ganti Akun</MenuItem>
      </Menu>
    </Paper>
  );
} 