import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Drawer,
  Menu,
  MenuItem,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BeenhereIcon from '@mui/icons-material/Beenhere';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../contexts/AuthContext';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import '../styles/NavBar.css';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, profile, logout } = useAuth();
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [value, setValue] = useState<number>(0);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const navItems = (
    <List>
      <ListItem
        button
        onClick={() => handleNavigation('/')}
        className={`iconColor ${value === 0 ? 'active-tab' : ''}`}
      >
        <ListItemIcon>
          <HomeIcon className="iconColor" />
        </ListItemIcon>
        {!isMediumScreen && !isSmallScreen && <ListItemText primary="Home" />}
      </ListItem>
      <ListItem
        button
        onClick={() => handleNavigation('/explore')}
        className={`iconColor ${value === 1 ? 'active-tab' : ''}`}
      >
        <ListItemIcon>
          <ExploreIcon className="iconColor" />
        </ListItemIcon>
        {!isMediumScreen && !isSmallScreen && <ListItemText primary="Explore" />}
      </ListItem>
      <ListItem
        button
        onClick={() => handleNavigation('/bucketlist')}
        className={`iconColor ${value === 2 ? 'active-tab' : ''}`}
      >
        <ListItemIcon>
          <ListAltIcon className="iconColor" />
        </ListItemIcon>
        {!isMediumScreen && !isSmallScreen && <ListItemText primary="Bucket List" />}
      </ListItem>
      <ListItem
        button
        onClick={() => handleNavigation('/visited')}
        className={`iconColor ${value === 3 ? 'active-tab' : ''}`}
      >
        <ListItemIcon>
          <BeenhereIcon className="iconColor" />
        </ListItemIcon>
        {!isMediumScreen && !isSmallScreen && <ListItemText primary="Visited" />}
      </ListItem>
      <ListItem
        button
        onClick={() => handleNavigation('/profile')}
        className={`iconColor ${value === 4 ? 'active-tab' : ''}`}
      >
        <ListItemIcon>
          <PersonIcon className="iconColor" />
        </ListItemIcon>
        {!isMediumScreen && !isSmallScreen && <ListItemText primary="Profile" />}
      </ListItem>
    </List>
  );

  const drawer = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <Box sx={{ mb: 2, px: 2, position: 'relative' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            transition: 'background-color 0.3s',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
          onClick={handleProfileMenuOpen}
        >
          <Avatar
            src={profile?.profileIcon}
            className="avatar"
            sx={{
              width: 48,
              height: 48,
            }}
          >
            {!profile?.profileIcon && currentUser?.email?.charAt(0).toUpperCase()}
          </Avatar>
          {!isMediumScreen && !isSmallScreen && (
            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle1" className="userName">
                {profile?.displayName || 'User Name'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentUser?.email}
              </Typography>
            </Box>
          )}
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          sx={{ mt: 1, ml: 0.5 }}
        >
          <MenuItem onClick={() => handleNavigation('/profile')}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={() => handleNavigation('/settings')}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>
      <Box sx={{ flexGrow: 1, px: 2, mt: 0 }}>
        {navItems}
      </Box>
    </Box>
  );

  return (
    <Box>
      {isSmallScreen ? (
        <>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ ml: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ width: '240px', flexShrink: 0 }}
          >
            {drawer}
          </Drawer>
          <BottomNavigation
            value={value}
            onChange={(event: React.ChangeEvent<{}>, newValue: number) => {
              setValue(newValue);
              const paths = ['/', '/explore', '/bucketlist', '/visited', '/profile'];
              handleNavigation(paths[newValue]);
            }}
            showLabels
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              boxShadow: theme.shadows[3],
              zIndex: 1300,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <BottomNavigationAction label="Home" icon={<HomeIcon />} />
            <BottomNavigationAction label="Explore" icon={<ExploreIcon />} />
            <BottomNavigationAction label="Bucket List" icon={<ListAltIcon />} />
            <BottomNavigationAction label="Visited" icon={<BeenhereIcon />} />
            <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
          </BottomNavigation>
        </>
      ) : (
        <Box
          className="navbar"
          sx={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            bottom: '16px',
            width: isMediumScreen ? '80px' : '240px',
            backgroundColor: theme.palette.background.default,
            boxShadow: theme.shadows[3],
            borderRadius: '12px',
            paddingTop: '16px',
            transition: 'width 0.3s ease-in-out',
            overflow: 'hidden',
            zIndex: 1300,
          }}
        >
          {drawer}
        </Box>
      )}
    </Box>
  );
};

export default NavBar;
