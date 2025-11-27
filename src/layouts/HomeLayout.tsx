import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    useTheme,
    useMediaQuery,
    Chip,
    Stack,
    Tooltip,
    Collapse,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    Receipt,
    Business,
    People,
    Assessment,
    Settings,
    AccountCircle,
    Logout,
    Notifications,
    ChevronLeft,
    ChevronRight,
    ExpandLess,
    ExpandMore,
} from '@mui/icons-material';

const drawerWidth = 280;
const collapsedDrawerWidth = 80;

interface NavigationItem {
    text: string;
    icon: React.ReactElement;
    path: string;
    subItems?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Giras de Trabajo', icon: <Business />, path: '/giras' },
    { text: 'Usuarios', icon: <People />, path: '/usuarios' },
    { text: 'Asistencia', icon: <People />, path: '/asistencia' },
    { text: 'Sedes', icon: <People />, path: '/sedes' },
    { text: 'Incidencias', icon: <People />, path: '/incidencias' },
];

const getPageTitle = (pathname: string): string => {
    for (const item of navigationItems) {
        if (item.path === pathname) return item.text;
        if (item.subItems) {
            const subItem = item.subItems.find(sub => sub.path === pathname);
            if (subItem) return subItem.text;
        }
    }
    return 'Dashboard';
};


export const HomeLayout: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [drawerCollapsed, setDrawerCollapsed] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleDrawerCollapse = () => {
        setDrawerCollapsed(!drawerCollapsed);
        setExpandedItems([]); // Colapsar todos los submenús cuando se colapsa el drawer
    };

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNavigate = (path: string) => {
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const handleLogout = () => {
        handleProfileMenuClose();
        navigate('/login');
    };

    const handleExpandClick = (itemText: string) => {
        if (drawerCollapsed) return;
        setExpandedItems(prev =>
            prev.includes(itemText)
                ? prev.filter(item => item !== itemText)
                : [...prev, itemText]
        );
    };

    const currentDrawerWidth = drawerCollapsed ? collapsedDrawerWidth : drawerWidth;

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo/Brand Section */}
            <Box sx={{
                p: drawerCollapsed ? 1.5 : 3,
                borderBottom: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                minHeight: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {!drawerCollapsed ? (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                color: 'white',
                                letterSpacing: '0.5px'
                            }}
                        >
                            VIÁTICOS
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: '0.75rem',
                                mt: 0.5
                            }}
                        >
                            Sistema Empresarial
                        </Typography>
                    </Box>
                ) : (
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            color: 'white',
                            letterSpacing: '1px'
                        }}
                    >
                        V
                    </Typography>
                )}
            </Box>

            {/* Collapse Button */}
            {!isMobile && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <IconButton onClick={handleDrawerCollapse} size="small">
                        {drawerCollapsed ? <ChevronRight /> : <ChevronLeft />}
                    </IconButton>
                </Box>
            )}

            {/* Navigation */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
                <List dense sx={{ px: drawerCollapsed ? 0.5 : 1 }}>
                    {navigationItems.map((item) => {
                        const isSelected = location.pathname === item.path ||
                            (item.subItems && item.subItems.some(sub => sub.path === location.pathname));
                        const isExpanded = expandedItems.includes(item.text);

                        return (
                            <Box key={item.text}>
                                <Tooltip title={drawerCollapsed ? item.text : ''} placement="right">
                                    <ListItemButton
                                        selected={isSelected}
                                        onClick={() => {
                                            if (item.subItems && !drawerCollapsed) {
                                                handleExpandClick(item.text);
                                            } else {
                                                handleNavigate(item.path);
                                            }
                                        }}
                                        sx={{
                                            borderRadius: 1,
                                            mx: drawerCollapsed ? 0.5 : 1,
                                            mb: 0.5,
                                            minHeight: 44,
                                            justifyContent: drawerCollapsed ? 'center' : 'flex-start',
                                            px: drawerCollapsed ? 1 : 2,
                                            '&.Mui-selected': {
                                                backgroundColor: 'primary.main',
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: 'primary.dark',
                                                },
                                                '& .MuiListItemIcon-root': {
                                                    color: 'white',
                                                },
                                            },
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                            },
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: drawerCollapsed ? 0 : 40 }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        {!drawerCollapsed && (
                                            <>
                                                <ListItemText
                                                    primary={item.text}
                                                    primaryTypographyProps={{
                                                        fontSize: '0.875rem',
                                                        fontWeight: isSelected ? 600 : 400
                                                    }}
                                                />
                                                {item.subItems && (
                                                    isExpanded ? <ExpandLess /> : <ExpandMore />
                                                )}
                                            </>
                                        )}
                                    </ListItemButton>
                                </Tooltip>

                                {/* SubItems */}
                                {item.subItems && !drawerCollapsed && (
                                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {item.subItems.map((subItem) => (
                                                <ListItemButton
                                                    key={subItem.text}
                                                    selected={location.pathname === subItem.path}
                                                    onClick={() => handleNavigate(subItem.path)}
                                                    sx={{
                                                        pl: 5,
                                                        borderRadius: 1,
                                                        mx: 1,
                                                        mb: 0.5,
                                                        '&.Mui-selected': {
                                                            backgroundColor: 'primary.light',
                                                            color: 'primary.main',
                                                        },
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={subItem.text}
                                                        primaryTypographyProps={{
                                                            fontSize: '0.8rem'
                                                        }}
                                                    />
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    </Collapse>
                                )}
                            </Box>
                        );
                    })}
                </List>
            </Box>

            {/* User Info Footer */}
            {!drawerCollapsed && (
                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                            JP
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                                Juan Pérez
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                                Administrador
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
            )}
        </Box>
    );

    const currentPageTitle = getPageTitle(location.pathname);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <CssBaseline />

            {/* AppBar */}
            <AppBar
                position="fixed"
                elevation={1}
                sx={{
                    width: { lg: `calc(100% - ${currentDrawerWidth}px)` },
                    ml: { lg: `${currentDrawerWidth}px` },
                    backgroundColor: 'background.paper',
                    color: 'text.primary',
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { lg: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                            {currentPageTitle}
                        </Typography>

                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                            label="Empresa S.A."
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                        />
                        <IconButton color="inherit">
                            <Notifications />
                        </IconButton>
                        <IconButton
                            color="inherit"
                            onClick={handleProfileMenuOpen}
                        >
                            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                                JP
                            </Avatar>
                        </IconButton>
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* Profile Menu */}
            <Menu
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{
                    elevation: 8,
                    sx: { minWidth: 200, mt: 1 }
                }}
            >
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" fontWeight={600}>Juan Pérez</Typography>
                    <Typography variant="caption" color="text.secondary">
                        juan.perez@empresa.com
                    </Typography>
                </Box>
                <MenuItem onClick={handleProfileMenuClose} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                        <AccountCircle fontSize="small" />
                    </ListItemIcon>
                    Mi Perfil
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
                    <ListItemIcon>
                        <Logout fontSize="small" sx={{ color: 'error.main' }} />
                    </ListItemIcon>
                    Cerrar Sesión
                </MenuItem>
            </Menu>

            {/* Drawer */}
            <Box
                component="nav"
                sx={{ width: { lg: currentDrawerWidth }, flexShrink: { lg: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', lg: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                        },
                    }}
                >
                    {drawer}
                </Drawer>

                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', lg: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: currentDrawerWidth,
                            transition: theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { lg: `calc(100% - ${currentDrawerWidth}px)` },
                    minHeight: '100vh',
                    backgroundColor: 'grey.50',
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                <Toolbar />
                <Box sx={{ p: 3 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};