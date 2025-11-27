import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
    Tooltip,
    Avatar,
    Alert,
    Snackbar,
    CircularProgress,
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Search,
    FilterList,
    TrendingUp,
    AttachMoney,
    Assignment,
    CheckCircle,
    ReceiptLong,
    LocationOn,
    CalendarToday,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AddGiraComponent } from '../components/Gira/AddGiraComponent';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Usuario {
    _id: string;
    nombre: string;
    apellido?: string;
    email?: string;
    correo?: string;
    rol?: string;
    cargo?: string;
    photo?: string;
}

interface Gira {
    _id: string;
    task: string;
    usuario: Usuario;
    motivo: string;
    comentario: string;
    semana: string;
    unidad_negocio: string;
    task_gira: string;
    active: boolean;
    estado: 'Pendiente' | 'En Proceso' | 'Completada' | 'Cancelada';
    lugar: string;
    fecha_inicio: string;
    fecha_fin: string;
    monto_soles: number;
    monto_dolares: number;
    createdAt: string;
    updatedAt: string;
}

const unidadesNegocio = [
    'Ventas',
    'Auditoría',
    'Recursos Humanos',
    'Operaciones',
    'Marketing',
    'TI'
];

const estadosGira = ['Pendiente', 'En Proceso', 'Completada', 'Cancelada'];
const API_URL = 'http://localhost:4000/api/giras';

export const GirasPage: React.FC = () => {
    const [giras, setGiras] = useState<Gira[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState<string>('Todos');
    const [filterUnidad, setFilterUnidad] = useState<string>('Todos');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingGira, setEditingGira] = useState<Gira | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const navigate = useNavigate();

    const showMessage = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const getGiras = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}`);
            setGiras(res.data);
        } catch (error) {
            console.error('Error al cargar giras:', error);
            showMessage('Error al cargar las giras', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteGira = async (giraId: string) => {
        try {
            await axios.delete(`${API_URL}/${giraId}`);
            showMessage('Gira eliminada correctamente', 'success');
            getGiras();
        } catch (error) {
            console.error('Error al eliminar:', error);
            showMessage('Error al eliminar la gira', 'error');
        }
    };

    useEffect(() => {
        getGiras();
    }, [getGiras]);

    const filteredGiras = useMemo(() => {
        return giras.filter((gira) => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                gira.motivo.toLowerCase().includes(searchLower) ||
                gira.task.toLowerCase().includes(searchLower) ||
                gira.usuario.nombre.toLowerCase().includes(searchLower) ||
                (gira.usuario.apellido?.toLowerCase() || '').includes(searchLower) ||
                gira.unidad_negocio.toLowerCase().includes(searchLower) ||
                (gira.lugar?.toLowerCase() || '').includes(searchLower);

            const matchesEstado = filterEstado === 'Todos' || gira.estado === filterEstado;
            const matchesUnidad = filterUnidad === 'Todos' || gira.unidad_negocio === filterUnidad;

            return matchesSearch && matchesEstado && matchesUnidad;
        });
    }, [giras, searchTerm, filterEstado, filterUnidad]);

    const stats = useMemo(() => {
        const total = giras.length;
        const activas = giras.filter(g => g.active).length;
        const montoTotalSoles = giras.reduce((sum, g) => sum + (g.monto_soles || 0), 0);
        const montoTotalDolares = giras.reduce((sum, g) => sum + (g.monto_dolares || 0), 0);
        const completadas = giras.filter(g => g.estado === 'Completada').length;

        return { total, activas, montoTotalSoles, montoTotalDolares, completadas };
    }, [giras]);

    const handleOpenDialog = (gira?: Gira) => {
        setEditingGira(gira || null);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingGira(null);
    };

    const handleSuccess = () => {
        getGiras();
        showMessage(
            editingGira ? 'Gira actualizada correctamente' : 'Gira creada correctamente',
            'success'
        );
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Está seguro de eliminar esta gira?')) {
            deleteGira(id);
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'Completada': return 'success';
            case 'En Proceso': return 'info';
            case 'Pendiente': return 'warning';
            case 'Cancelada': return 'error';
            default: return 'default';
        }
    };

    const getInitials = (usuario: Usuario) => {
        const nombre = usuario.nombre || '';
        const apellido = usuario.apellido || '';
        return `${nombre[0] || ''}${apellido[0] || ''}`.toUpperCase();
    };

    const getNombreCompleto = (usuario: Usuario) => {
        return `${usuario.nombre} ${usuario.apellido || ''}`.trim();
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Cards de estadísticas */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ borderLeft: 4, borderColor: 'primary.main' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography color="text.secondary" variant="body2" gutterBottom>
                                        Total Giras
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.total}
                                    </Typography>
                                </Box>
                                <Assignment sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ borderLeft: 4, borderColor: 'success.main' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography color="text.secondary" variant="body2" gutterBottom>
                                        Activas
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.activas}
                                    </Typography>
                                </Box>
                                <TrendingUp sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ borderLeft: 4, borderColor: 'info.main' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography color="text.secondary" variant="body2" gutterBottom>
                                        Presupuesto Soles
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700}>
                                        S/ {stats.montoTotalSoles.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                    </Typography>
                                </Box>
                                <AttachMoney sx={{ fontSize: 48, color: 'info.main', opacity: 0.3 }} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ borderLeft: 4, borderColor: 'warning.main' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography color="text.secondary" variant="body2" gutterBottom>
                                        Presupuesto Dólares
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700}>
                                        $ {stats.montoTotalDolares.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                    </Typography>
                                </Box>
                                <AttachMoney sx={{ fontSize: 48, color: 'warning.main', opacity: 0.3 }} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Barra de búsqueda y filtros */}
            <Card elevation={0} sx={{ mb: 3 }}>
                <CardContent>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                            <TextField
                                placeholder="Buscar por motivo, task, usuario, unidad o lugar..."
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ flexGrow: 1, minWidth: 250 }}
                            />
                            <Button
                                variant="outlined"
                                startIcon={<FilterList />}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                Filtros
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => handleOpenDialog()}
                            >
                                Nueva Gira
                            </Button>
                        </Stack>

                        {showFilters && (
                            <Stack direction="row" spacing={2} flexWrap="wrap">
                                <FormControl size="small" sx={{ minWidth: 180 }}>
                                    <InputLabel>Estado</InputLabel>
                                    <Select
                                        value={filterEstado}
                                        label="Estado"
                                        onChange={(e) => setFilterEstado(e.target.value)}
                                    >
                                        <MenuItem value="Todos">Todos</MenuItem>
                                        {estadosGira.map((estado) => (
                                            <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ minWidth: 200 }}>
                                    <InputLabel>Unidad de Negocio</InputLabel>
                                    <Select
                                        value={filterUnidad}
                                        label="Unidad de Negocio"
                                        onChange={(e) => setFilterUnidad(e.target.value)}
                                    >
                                        <MenuItem value="Todos">Todos</MenuItem>
                                        {unidadesNegocio.map((unidad) => (
                                            <MenuItem key={unidad} value={unidad}>{unidad}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            {/* Tabla de Giras */}
            <Card elevation={0}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'grey.50' }}>
                                <TableCell><strong>Task</strong></TableCell>
                                <TableCell><strong>Motivo</strong></TableCell>
                                <TableCell><strong>Usuario</strong></TableCell>
                                <TableCell><strong>Lugar</strong></TableCell>
                                <TableCell><strong>Fechas</strong></TableCell>
                                <TableCell><strong>Presupuesto</strong></TableCell>
                                <TableCell><strong>Estado</strong></TableCell>
                                <TableCell align="center"><strong>Acciones</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredGiras.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                        <Stack spacing={2} alignItems="center">
                                            <Assignment sx={{ fontSize: 64, color: 'text.disabled' }} />
                                            <Typography variant="h6" color="text.secondary">
                                                No se encontraron registros
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {searchTerm || filterEstado !== 'Todos' || filterUnidad !== 'Todos'
                                                    ? 'Intenta ajustar los filtros de búsqueda'
                                                    : 'Comienza creando una nueva gira'}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredGiras
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((gira) => (
                                        <TableRow key={gira._id} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontFamily="monospace" fontWeight={500}>
                                                    {gira.task}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {gira.unidad_negocio}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {gira.motivo}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Semana: {gira.semana}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Avatar
                                                        src={gira.usuario.photo}
                                                        sx={{
                                                            width: 32,
                                                            height: 32,
                                                            bgcolor: 'primary.main',
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        {getInitials(gira.usuario)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2">
                                                            {getNombreCompleto(gira.usuario)}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {gira.usuario.rol || gira.usuario.cargo || ''}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                {gira.lugar ? (
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <LocationOn fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            {gira.lugar}
                                                        </Typography>
                                                    </Stack>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        -
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {gira.fecha_inicio && gira.fecha_fin ? (
                                                    <Stack spacing={0.5}>
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <CalendarToday sx={{ fontSize: 14 }} color="action" />
                                                            <Typography variant="caption">
                                                                {format(new Date(gira.fecha_inicio), 'dd/MM/yyyy', { locale: es })}
                                                            </Typography>
                                                        </Stack>
                                                        <Typography variant="caption" color="text.secondary">
                                                            al {format(new Date(gira.fecha_fin), 'dd/MM/yyyy', { locale: es })}
                                                        </Typography>
                                                    </Stack>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        -
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Stack spacing={0.5}>
                                                    {gira.monto_soles > 0 && (
                                                        <Typography variant="body2" fontWeight={600}>
                                                            S/ {gira.monto_soles.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                                        </Typography>
                                                    )}
                                                    {gira.monto_dolares > 0 && (
                                                        <Typography variant="body2" fontWeight={600} color="info.main">
                                                            $ {gira.monto_dolares.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                                        </Typography>
                                                    )}
                                                    {gira.monto_soles === 0 && gira.monto_dolares === 0 && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            Sin presupuesto
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={gira.estado}
                                                    color={getEstadoColor(gira.estado)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={1} justifyContent="center">
                                                    <Tooltip title="Editar">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => handleOpenDialog(gira)}
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Eliminar">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDelete(gira._id)}
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Ver gastos">
                                                        <IconButton
                                                            size="small"
                                                            color="secondary"
                                                            onClick={() => navigate(`/gastos/${gira._id}`)}
                                                        >
                                                            <ReceiptLong fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={filteredGiras.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                    }
                />
            </Card>

            {/* Diálogo de agregar/editar */}
            <AddGiraComponent
                openDialog={openDialog}
                handleCloseDialog={handleCloseDialog}
                editingGira={editingGira}
                onSuccess={handleSuccess}
            />

            {/* Snackbar para mensajes */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};