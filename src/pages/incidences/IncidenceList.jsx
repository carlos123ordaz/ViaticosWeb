import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    Tooltip,
    Avatar,
    Divider,
    Alert,
    CircularProgress,
    InputAdornment,
    Snackbar,
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Close as CloseIcon,
    CalendarToday as CalendarIcon,
    LocationOn as LocationIcon,
    Business as BusinessIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    Image as ImageIcon,
    ZoomIn as ZoomInIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es, mt } from 'date-fns/locale';
import moment from 'moment';
import 'moment/locale/es';
import axios from 'axios';

moment.locale('es');

const API_URL = 'http://localhost:4000/api/incidencias';

export const IncidenceList = () => {
    // Estados
    const [incidencias, setIncidencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Filtros
    const [filtroFecha, setFiltroFecha] = useState('todas');
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroSeveridad, setFiltroSeveridad] = useState('todos');
    const [filtroArea, setFiltroArea] = useState('todas');
    const [showFilters, setShowFilters] = useState(false);

    // Modals
    const [selectedIncidencia, setSelectedIncidencia] = useState(null);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [openEstadoModal, setOpenEstadoModal] = useState(false);
    const [openImageModal, setOpenImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // Cambio de estado
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [fechaEstimada, setFechaEstimada] = useState(null);
    const [notasEstado, setNotasEstado] = useState('');
    const [savingEstado, setSavingEstado] = useState(false);

    // Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Opciones para filtros
    const opcionesFecha = [
        { value: 'todas', label: 'Todas las fechas' },
        { value: 'hoy', label: 'Hoy' },
        { value: 'semana', label: 'Esta semana' },
        { value: 'mes', label: 'Este mes' },
        { value: 'rango', label: 'Rango personalizado' },
    ];

    const estados = ['Pendiente', 'En Revisión', 'Resuelto', 'Cerrado'];
    const severidades = ['Bajo', 'Medio', 'Alto', 'Crítico'];
    const areas = [
        'Planta de Producción',
        'Almacén A',
        'Almacén B',
        'Zona de Desechos',
        'Línea de Ensamblaje 1',
        'Línea de Ensamblaje 2',
        'Línea de Ensamblaje 3',
        'Oficinas Administrativas',
    ];

    useEffect(() => {
        loadIncidencias();
    }, []);

    const loadIncidencias = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);
            const data = response.data.incidencias || response.data;

            setIncidencias(data);
        } catch (error) {
            console.error('Error al cargar incidencias:', error);
            setSnackbar({
                open: true,
                message: 'Error al cargar las incidencias',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const incidenciasFiltradas = incidencias.filter(inc => {
        const matchSearch = inc.tipoIncidente?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inc.ubicacion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inc.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchEstado = filtroEstado === 'todos' || inc.estado === filtroEstado;
        const matchSeveridad = filtroSeveridad === 'todos' || inc.gradoSeveridad === filtroSeveridad;
        const matchArea = filtroArea === 'todas' || inc.areaAfectada === filtroArea;
        let matchFecha = true;
        const hoy = moment().startOf('day');
        const fechaInc = moment(inc.fecha);

        if (filtroFecha === 'hoy') {
            matchFecha = fechaInc.isSame(hoy, 'day');
        } else if (filtroFecha === 'semana') {
            matchFecha = fechaInc.isSame(hoy, 'week');
        } else if (filtroFecha === 'mes') {
            matchFecha = fechaInc.isSame(hoy, 'month');
        } else if (filtroFecha === 'rango' && fechaInicio && fechaFin) {
            matchFecha = fechaInc.isBetween(moment(fechaInicio), moment(fechaFin), 'day', '[]');
        }

        return matchSearch && matchEstado && matchSeveridad && matchArea && matchFecha;
    });

    // Paginación
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Configuraciones de severidad
    const getSeveridadConfig = (severidad) => {
        const configs = {
            'Bajo': { color: 'info', bgColor: '#E0F2FE', textColor: '#0369A1' },
            'Medio': { color: 'warning', bgColor: '#FEF3C7', textColor: '#92400E' },
            'Alto': { color: 'error', bgColor: '#FEE2E2', textColor: '#991B1B' },
            'Crítico': { color: 'error', bgColor: '#FEE2E2', textColor: '#7F1D1D' },
        };
        return configs[severidad] || configs['Medio'];
    };

    // Configuraciones de estado
    const getEstadoConfig = (estado) => {
        const configs = {
            'Pendiente': { color: 'warning', icon: <ScheduleIcon fontSize="small" /> },
            'En Revisión': { color: 'info', icon: <VisibilityIcon fontSize="small" /> },
            'Resuelto': { color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
            'Cerrado': { color: 'default', icon: <CheckCircleIcon fontSize="small" /> },
        };
        return configs[estado] || configs['Pendiente'];
    };

    // Abrir modal de detalle
    const handleOpenDetail = (incidencia) => {
        setSelectedIncidencia(incidencia);
        setOpenDetailModal(true);
    };

    // Abrir modal de cambio de estado
    const handleOpenEstadoModal = (incidencia) => {
        setSelectedIncidencia(incidencia);
        setNuevoEstado(incidencia.estado);
        setFechaEstimada(incidencia.fechaEstimadaResolucion || null);
        setNotasEstado('');
        setOpenEstadoModal(true);
    };

    // Guardar cambio de estado
    const handleSaveEstado = async () => {
        try {
            setSavingEstado(true);

            const updateData = {
                estado: nuevoEstado,
            };
            if (nuevoEstado === 'En Revisión' && fechaEstimada) {
                updateData.fechaEstimadaResolucion = fechaEstimada;
            }

            await axios.put(`${API_URL}/${selectedIncidencia._id}`, updateData);

            setIncidencias(prev => prev.map(inc =>
                inc._id === selectedIncidencia._id
                    ? { ...inc, estado: nuevoEstado, fechaEstimadaResolucion: fechaEstimada }
                    : inc
            ));
            setOpenEstadoModal(false);
            setSnackbar({
                open: true,
                message: 'Estado actualizado correctamente',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            setSnackbar({
                open: true,
                message: 'Error al actualizar el estado',
                severity: 'error'
            });
        } finally {
            setSavingEstado(false);
        }
    };

    // Abrir imagen en modal
    const handleOpenImage = (imageUrl) => {
        setSelectedImage(imageUrl);
        setOpenImageModal(true);
    };

    // Limpiar filtros
    const handleClearFilters = () => {
        setSearchQuery('');
        setFiltroFecha('todas');
        setFechaInicio(null);
        setFechaFin(null);
        setFiltroEstado('todos');
        setFiltroSeveridad('todos');
        setFiltroArea('todas');
    };

    // Contar incidencias por estado
    const getEstadisticas = () => {
        return {
            total: incidencias.length,
            pendientes: incidencias.filter(i => i.estado === 'Pendiente').length,
            enRevision: incidencias.filter(i => i.estado === 'En Revisión').length,
            resueltos: incidencias.filter(i => i.estado === 'Resuelto').length,
            criticos: incidencias.filter(i => i.gradoSeveridad === 'Crítico').length,
        };
    };

    const stats = getEstadisticas();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">Total</Typography>
                                <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                        <Card sx={{ borderLeft: '4px solid #F59E0B' }}>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">Pendientes</Typography>
                                <Typography variant="h4" fontWeight="bold" color="warning.main">{stats.pendientes}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                        <Card sx={{ borderLeft: '4px solid #3B82F6' }}>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">En Revisión</Typography>
                                <Typography variant="h4" fontWeight="bold" color="info.main">{stats.enRevision}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                        <Card sx={{ borderLeft: '4px solid #10B981' }}>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">Resueltos</Typography>
                                <Typography variant="h4" fontWeight="bold" color="success.main">{stats.resueltos}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                        <Card sx={{ borderLeft: '4px solid #EF4444' }}>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">Críticos</Typography>
                                <Typography variant="h4" fontWeight="bold" color="error.main">{stats.criticos}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Barra de búsqueda y filtros */}
                <Card sx={{ mb: 2 }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Buscar por tipo, ubicación o descripción..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <Button
                                        variant={showFilters ? "contained" : "outlined"}
                                        startIcon={<FilterListIcon />}
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        Filtros
                                    </Button>
                                    {(filtroEstado !== 'todos' || filtroSeveridad !== 'todos' ||
                                        filtroArea !== 'todas' || filtroFecha !== 'todas') && (
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={handleClearFilters}
                                            >
                                                Limpiar
                                            </Button>
                                        )}
                                </Stack>
                            </Grid>
                        </Grid>

                        {/* Panel de filtros expandible */}
                        {showFilters && (
                            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 3, sm: 6 }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Período</InputLabel>
                                            <Select
                                                value={filtroFecha}
                                                label="Período"
                                                onChange={(e) => setFiltroFecha(e.target.value)}
                                            >
                                                {opcionesFecha.map(op => (
                                                    <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {filtroFecha === 'rango' && (
                                        <>
                                            <Grid size={{ xs: 12, md: 3, sm: 6 }}>
                                                <DatePicker
                                                    label="Fecha inicio"
                                                    value={fechaInicio}
                                                    onChange={setFechaInicio}
                                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 3, sm: 6 }}>
                                                <DatePicker
                                                    label="Fecha fin"
                                                    value={fechaFin}
                                                    onChange={setFechaFin}
                                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                                />
                                            </Grid>
                                        </>
                                    )}

                                    <Grid item xs={12} sm={6} md={filtroFecha === 'rango' ? 3 : 3}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Estado</InputLabel>
                                            <Select
                                                value={filtroEstado}
                                                label="Estado"
                                                onChange={(e) => setFiltroEstado(e.target.value)}
                                            >
                                                <MenuItem value="todos">Todos</MenuItem>
                                                {estados.map(estado => (
                                                    <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 3, sm: 6 }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Severidad</InputLabel>
                                            <Select
                                                value={filtroSeveridad}
                                                label="Severidad"
                                                onChange={(e) => setFiltroSeveridad(e.target.value)}
                                            >
                                                <MenuItem value="todos">Todas</MenuItem>
                                                {severidades.map(sev => (
                                                    <MenuItem key={sev} value={sev}>{sev}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 3, sm: 6 }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Área</InputLabel>
                                            <Select
                                                value={filtroArea}
                                                label="Área"
                                                onChange={(e) => setFiltroArea(e.target.value)}
                                            >
                                                <MenuItem value="todas">Todas</MenuItem>
                                                {areas.map(area => (
                                                    <MenuItem key={area} value={area}>{area}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell><strong>Tipo</strong></TableCell>
                                    <TableCell><strong>Fecha</strong></TableCell>
                                    <TableCell><strong>Ubicación</strong></TableCell>
                                    <TableCell><strong>Severidad</strong></TableCell>
                                    <TableCell><strong>Estado</strong></TableCell>
                                    <TableCell><strong>Reportado por</strong></TableCell>
                                    <TableCell align="center"><strong>Acciones</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {incidenciasFiltradas
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((incidencia) => {
                                        const sevConfig = getSeveridadConfig(incidencia.gradoSeveridad);
                                        const estConfig = getEstadoConfig(incidencia.estado);

                                        return (
                                            <TableRow
                                                key={incidencia._id}
                                                hover
                                                sx={{
                                                    '&:hover': { backgroundColor: '#fafafa' },
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <TableCell onClick={() => handleOpenDetail(incidencia)}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {incidencia.img_url && (
                                                            <Avatar
                                                                src={incidencia.img_url}
                                                                variant="rounded"
                                                                sx={{ width: 40, height: 40 }}
                                                            />
                                                        )}
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="600">
                                                                {incidencia.tipoIncidente}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {incidencia.areaAfectada}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell onClick={() => handleOpenDetail(incidencia)}>
                                                    <Typography variant="body2">
                                                        {moment(incidencia.fecha).format('DD/MM/YYYY')}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {moment(incidencia.fecha).format('HH:mm')}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell onClick={() => handleOpenDetail(incidencia)}>
                                                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                        {incidencia.ubicacion}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell onClick={() => handleOpenDetail(incidencia)}>
                                                    <Chip
                                                        label={incidencia.gradoSeveridad}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: sevConfig.bgColor,
                                                            color: sevConfig.textColor,
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title="Cambiar estado">
                                                        <Chip
                                                            icon={estConfig.icon}
                                                            label={incidencia.estado}
                                                            size="small"
                                                            color={estConfig.color}
                                                            onClick={() => handleOpenEstadoModal(incidencia)}
                                                            sx={{ cursor: 'pointer', fontWeight: 600 }}
                                                        />
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell onClick={() => handleOpenDetail(incidencia)}>
                                                    <Typography variant="body2">{`${incidencia.user?.nombre} ${incidencia.user?.apellido}` || 'N/A'}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {incidencia.user?.correo || 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="Ver detalles">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => handleOpenDetail(incidencia)}
                                                        >
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {incidencia.img_url && (
                                                        <Tooltip title="Ver imagen">
                                                            <IconButton
                                                                size="small"
                                                                color="info"
                                                                onClick={() => handleOpenImage(incidencia.img_url)}
                                                            >
                                                                <ImageIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {incidenciasFiltradas.length === 0 && (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary">
                                No se encontraron incidencias
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Intenta ajustar los filtros de búsqueda
                            </Typography>
                        </Box>
                    )}

                    <TablePagination
                        component="div"
                        count={incidenciasFiltradas.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Filas por página:"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                    />
                </Card>

                {/* Modal de Detalle */}
                <Dialog
                    open={openDetailModal}
                    onClose={() => setOpenDetailModal(false)}
                    maxWidth="md"
                    fullWidth
                >
                    {selectedIncidencia && (
                        <>
                            <DialogTitle>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6" fontWeight="bold">
                                        Detalle de Incidencia
                                    </Typography>
                                    <IconButton onClick={() => setOpenDetailModal(false)}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>
                            </DialogTitle>
                            <DialogContent dividers>
                                {/* Imagen */}
                                {selectedIncidencia.img_url && (
                                    <Box sx={{ mb: 3, position: 'relative' }}>
                                        <img
                                            src={selectedIncidencia.img_url}
                                            alt="Incidencia"
                                            style={{
                                                width: '100%',
                                                maxHeight: 400,
                                                objectFit: 'cover',
                                                borderRadius: 8,
                                            }}
                                        />
                                        <IconButton
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                backgroundColor: 'rgba(0,0,0,0.6)',
                                                color: 'white',
                                                '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' }
                                            }}
                                            onClick={() => handleOpenImage(selectedIncidencia.img_url)}
                                        >
                                            <ZoomInIcon />
                                        </IconButton>
                                    </Box>
                                )}

                                {/* Header con tipo y severidad */}
                                <Box sx={{ mb: 3 }}>
                                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                        <Chip
                                            label={selectedIncidencia.gradoSeveridad}
                                            size="small"
                                            sx={{
                                                backgroundColor: getSeveridadConfig(selectedIncidencia.gradoSeveridad).bgColor,
                                                color: getSeveridadConfig(selectedIncidencia.gradoSeveridad).textColor,
                                                fontWeight: 600,
                                            }}
                                        />
                                        <Chip
                                            icon={getEstadoConfig(selectedIncidencia.estado).icon}
                                            label={selectedIncidencia.estado}
                                            size="small"
                                            color={getEstadoConfig(selectedIncidencia.estado).color}
                                        />
                                    </Stack>
                                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                                        {selectedIncidencia.tipoIncidente}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Registrado {moment(selectedIncidencia.createdAt).fromNow()}
                                    </Typography>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* Información principal */}
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                                            <CalendarIcon color="action" fontSize="small" />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Fecha del incidente
                                                </Typography>
                                                <Typography variant="body1" fontWeight="600">
                                                    {moment(selectedIncidencia.fecha).format('DD/MM/YYYY HH:mm')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                                            <LocationIcon color="action" fontSize="small" />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Ubicación
                                                </Typography>
                                                <Typography variant="body1" fontWeight="600">
                                                    {selectedIncidencia.ubicacion}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                                            <BusinessIcon color="action" fontSize="small" />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Área afectada
                                                </Typography>
                                                <Typography variant="body1" fontWeight="600">
                                                    {selectedIncidencia.areaAfectada}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                                            <WarningIcon color="action" fontSize="small" />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Reportado por
                                                </Typography>
                                                <Typography variant="body1" fontWeight="600">
                                                    {selectedIncidencia.user?.nombre || 'N/A'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {selectedIncidencia.user?.email || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ my: 2 }} />

                                {/* Descripción */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                        Descripción del Evento
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                        {selectedIncidencia.descripcion}
                                    </Typography>
                                </Box>

                                {/* Recomendación */}
                                {selectedIncidencia.recomendacion && (
                                    <Box
                                        sx={{
                                            p: 2,
                                            backgroundColor: '#FFFBEB',
                                            borderLeft: '4px solid #F59E0B',
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="#92400E">
                                            Recomendación
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedIncidencia.recomendacion}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Fecha estimada de resolución */}
                                {selectedIncidencia.fechaEstimadaResolucion && (
                                    <Alert severity="info" sx={{ mt: 2 }}>
                                        <Typography variant="body2">
                                            <strong>Fecha estimada de resolución:</strong>{' '}
                                            {moment(selectedIncidencia.fechaEstimadaResolucion).format('DD/MM/YYYY HH:mm')}
                                        </Typography>
                                    </Alert>
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpenDetailModal(false)}>Cerrar</Button>
                                <Button
                                    variant="contained"
                                    startIcon={<EditIcon />}
                                    onClick={() => {
                                        setOpenDetailModal(false);
                                        handleOpenEstadoModal(selectedIncidencia);
                                    }}
                                >
                                    En revisión
                                </Button>
                            </DialogActions>
                        </>
                    )}
                </Dialog>
                <Dialog
                    open={openEstadoModal}
                    onClose={() => !savingEstado && setOpenEstadoModal(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        <Typography variant="h6" fontWeight="bold">
                            Agregar fecha estimada
                        </Typography>
                    </DialogTitle>
                    <DialogContent dividers>
                        {selectedIncidencia && (
                            <Box>
                                <DatePicker
                                    label="Fecha estimada de resolución"
                                    value={fechaEstimada}
                                    onChange={setFechaEstimada}
                                    disabled={savingEstado}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            helperText: 'Establece una fecha estimada para resolver esta incidencia'
                                        }
                                    }}
                                />
                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <InputLabel>Selecciona una opción</InputLabel>
                                    <Select
                                        value={''}
                                        label="Selecciona una opción"
                                        onChange={(e) => { }}
                                    >
                                        <MenuItem value={10}>Luchito</MenuItem>
                                        <MenuItem value={20}>Victor</MenuItem>
                                        <MenuItem value={30}>Luchito 2</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenEstadoModal(false)} disabled={savingEstado}>
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSaveEstado}
                            disabled={savingEstado}
                        >
                            {savingEstado ? <CircularProgress size={24} /> : 'Guardar'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Modal de Imagen Ampliada */}
                <Dialog
                    open={openImageModal}
                    onClose={() => setOpenImageModal(false)}
                    maxWidth="lg"
                    fullWidth
                >
                    <DialogTitle>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">Imagen de la Incidencia</Typography>
                            <IconButton onClick={() => setOpenImageModal(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        {selectedImage && (
                            <img
                                src={selectedImage}
                                alt="Incidencia ampliada"
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    maxHeight: '80vh',
                                    objectFit: 'contain',
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>

                {/* Snackbar para notificaciones */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </LocalizationProvider>
    );
};