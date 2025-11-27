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
    ImageList,
    ImageListItem,
    ImageListItemBar,
    AvatarGroup,
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
    Delete as DeleteIcon,
    Person as PersonIcon,
    AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
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
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);

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
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Cambio de estado
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [deadline, setDeadline] = useState(null);
    const [asignado, setAsignado] = useState('');
    const [notasEstado, setNotasEstado] = useState('');
    const [savingEstado, setSavingEstado] = useState(false);

    // Lista de usuarios para asignar (deberías obtenerla de tu API)
    const [usuarios, setUsuarios] = useState([]);

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
        loadUsuarios();
    }, [page, rowsPerPage, filtroEstado, filtroSeveridad]);

    const loadUsuarios = async () => {
        try {
            // Aquí deberías cargar los usuarios de tu API
            // const response = await axios.get('http://localhost:4000/api/users');
            // setUsuarios(response.data);

            // Ejemplo temporal:
            setUsuarios([
                { _id: '1', nombre: 'Juan', apellido: 'Pérez' },
                { _id: '2', nombre: 'María', apellido: 'García' },
                { _id: '3', nombre: 'Carlos', apellido: 'López' },
            ]);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    };

    const loadIncidencias = async () => {
        try {
            setLoading(true);
            const params = {
                page: page + 1,
                limit: rowsPerPage,
                ...(filtroEstado !== 'todos' && { estado: filtroEstado }),
                ...(filtroSeveridad !== 'todos' && { gradoSeveridad: filtroSeveridad })
            };

            const response = await axios.get(API_URL, { params });
            const data = response.data;

            setIncidencias(data.incidencias || []);
            setTotalPages(data.totalPages || 0);
            setTotal(data.total || 0);
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

    // Filtrado local adicional (para búsqueda y fecha)
    const incidenciasFiltradas = incidencias.filter(inc => {
        const matchSearch = inc.tipoIncidente?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inc.ubicacion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inc.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());

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

        return matchSearch && matchArea && matchFecha;
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
        setDeadline(incidencia.deadline || null);
        setAsignado(incidencia.asigned?._id || '');
        setNotasEstado('');
        setOpenEstadoModal(true);
    };

    // Guardar cambio de estado
    const handleSaveEstado = async () => {
        try {
            setSavingEstado(true);

            const updateData = {
                estado: nuevoEstado,
                deadline: deadline,
                asigned: asignado || null,
                notasEstado: notasEstado,
            };

            await axios.put(`${API_URL}/${selectedIncidencia._id}`, updateData);

            // Recargar incidencias
            await loadIncidencias();

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
    const handleOpenImage = (imageUrls, index = 0) => {
        setSelectedImage(imageUrls);
        setSelectedImageIndex(index);
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
            total: total,
            pendientes: incidencias.filter(i => i.estado === 'Pendiente').length,
            enRevision: incidencias.filter(i => i.estado === 'En Revisión').length,
            resueltos: incidencias.filter(i => i.estado === 'Resuelto').length,
            criticos: incidencias.filter(i => i.gradoSeveridad === 'Crítico').length,
        };
    };

    const stats = getEstadisticas();

    if (loading && incidencias.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                {/* Estadísticas */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">Total</Typography>
                                <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{ borderLeft: '4px solid #F59E0B' }}>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">Pendientes</Typography>
                                <Typography variant="h4" fontWeight="bold" color="warning.main">{stats.pendientes}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{ borderLeft: '4px solid #3B82F6' }}>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">En Revisión</Typography>
                                <Typography variant="h4" fontWeight="bold" color="info.main">{stats.enRevision}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card sx={{ borderLeft: '4px solid #10B981' }}>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">Resueltos</Typography>
                                <Typography variant="h4" fontWeight="bold" color="success.main">{stats.resueltos}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
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
                            <Grid item xs={12} md={6}>
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
                            <Grid item xs={12} md={6}>
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
                                    <Grid item xs={12} md={3} sm={6}>
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
                                            <Grid item xs={12} md={3} sm={6}>
                                                <DatePicker
                                                    label="Fecha inicio"
                                                    value={fechaInicio}
                                                    onChange={setFechaInicio}
                                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={3} sm={6}>
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

                                    <Grid item xs={12} md={3} sm={6}>
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

                                    <Grid item xs={12} md={3} sm={6}>
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

                {/* Tabla de incidencias */}
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
                                    <TableCell><strong>Asignado</strong></TableCell>
                                    <TableCell><strong>Deadline</strong></TableCell>
                                    <TableCell><strong>Reportado por</strong></TableCell>
                                    <TableCell align="center"><strong>Acciones</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {incidenciasFiltradas.map((incidencia) => {
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
                                                    {incidencia.imagenes && incidencia.imagenes.length > 0 && (
                                                        <AvatarGroup max={2}>
                                                            {incidencia.imagenes.slice(0, 2).map((img, idx) => (
                                                                <Avatar
                                                                    key={idx}
                                                                    src={img}
                                                                    variant="rounded"
                                                                    sx={{ width: 40, height: 40 }}
                                                                />
                                                            ))}
                                                        </AvatarGroup>
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
                                            <TableCell>
                                                {incidencia.asigned ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar sx={{ width: 24, height: 24 }}>
                                                            {incidencia.asigned.nombre?.charAt(0)}
                                                        </Avatar>
                                                        <Typography variant="body2">
                                                            {incidencia.asigned.nombre} {incidencia.asigned.apellido}
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        Sin asignar
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {incidencia.deadline ? (
                                                    <Chip
                                                        icon={<AccessTimeIcon fontSize="small" />}
                                                        label={moment(incidencia.deadline).format('DD/MM/YYYY')}
                                                        size="small"
                                                        variant="outlined"
                                                        color={moment(incidencia.deadline).isBefore(moment()) ? 'error' : 'default'}
                                                    />
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">-</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell onClick={() => handleOpenDetail(incidencia)}>
                                                <Typography variant="body2">
                                                    {incidencia.user?.nombre} {incidencia.user?.apellido}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {incidencia.user?.correo}
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
                                                {incidencia.imagenes && incidencia.imagenes.length > 0 && (
                                                    <Tooltip title={`Ver ${incidencia.imagenes.length} imagen(es)`}>
                                                        <IconButton
                                                            size="small"
                                                            color="info"
                                                            onClick={() => handleOpenImage(incidencia.imagenes)}
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
                        count={total}
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
                                {/* Galería de imágenes */}
                                {selectedIncidencia.imagenes && selectedIncidencia.imagenes.length > 0 && (
                                    <Box sx={{ mb: 3 }}>
                                        <ImageList sx={{ width: '100%', height: 200 }} cols={3} rowHeight={164}>
                                            {selectedIncidencia.imagenes.map((img, index) => (
                                                <ImageListItem key={index}>
                                                    <img
                                                        src={img}
                                                        alt={`Imagen ${index + 1}`}
                                                        loading="lazy"
                                                        style={{ cursor: 'pointer', objectFit: 'cover', height: '100%' }}
                                                        onClick={() => handleOpenImage(selectedIncidencia.imagenes, index)}
                                                    />
                                                    <ImageListItemBar
                                                        title={`Imagen ${index + 1}`}
                                                        actionIcon={
                                                            <IconButton
                                                                sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                                                onClick={() => handleOpenImage(selectedIncidencia.imagenes, index)}
                                                            >
                                                                <ZoomInIcon />
                                                            </IconButton>
                                                        }
                                                    />
                                                </ImageListItem>
                                            ))}
                                        </ImageList>
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
                                            <PersonIcon color="action" fontSize="small" />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Reportado por
                                                </Typography>
                                                <Typography variant="body1" fontWeight="600">
                                                    {selectedIncidencia.user?.nombre} {selectedIncidencia.user?.apellido}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {selectedIncidencia.user?.correo}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    {selectedIncidencia.asigned && (
                                        <Grid item xs={12} sm={6}>
                                            <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                                                <PersonIcon color="action" fontSize="small" />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Asignado a
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight="600">
                                                        {selectedIncidencia.asigned.nombre} {selectedIncidencia.asigned.apellido}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    )}

                                    {selectedIncidencia.deadline && (
                                        <Grid item xs={12} sm={6}>
                                            <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                                                <AccessTimeIcon color="action" fontSize="small" />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Fecha límite
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight="600">
                                                        {moment(selectedIncidencia.deadline).format('DD/MM/YYYY')}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    )}
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

                                {/* Historial de estados */}
                                {selectedIncidencia.historialEstados && selectedIncidencia.historialEstados.length > 0 && (
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                            Historial de Cambios
                                        </Typography>
                                        {selectedIncidencia.historialEstados.map((historial, index) => (
                                            <Box key={index} sx={{ mb: 1, pl: 2, borderLeft: '2px solid #e0e0e0' }}>
                                                <Typography variant="body2">
                                                    <strong>{historial.estado}</strong> - {moment(historial.fecha).format('DD/MM/YYYY HH:mm')}
                                                </Typography>
                                                {historial.notas && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {historial.notas}
                                                    </Typography>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
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
                                    Gestionar
                                </Button>
                            </DialogActions>
                        </>
                    )}
                </Dialog>

                {/* Modal de Cambio de Estado */}
                <Dialog
                    open={openEstadoModal}
                    onClose={() => !savingEstado && setOpenEstadoModal(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        <Typography variant="h6" fontWeight="bold">
                            Gestionar Incidencia
                        </Typography>
                    </DialogTitle>
                    <DialogContent dividers>
                        {selectedIncidencia && (
                            <Box>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Estado</InputLabel>
                                    <Select
                                        value={nuevoEstado}
                                        label="Estado"
                                        onChange={(e) => setNuevoEstado(e.target.value)}
                                        disabled={savingEstado}
                                    >
                                        {estados.map(estado => (
                                            <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Asignar a</InputLabel>
                                    <Select
                                        value={asignado}
                                        label="Asignar a"
                                        onChange={(e) => setAsignado(e.target.value)}
                                        disabled={savingEstado}
                                    >
                                        <MenuItem value="">Sin asignar</MenuItem>
                                        {usuarios.map(usuario => (
                                            <MenuItem key={usuario._id} value={usuario._id}>
                                                {usuario.nombre} {usuario.apellido}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <DatePicker
                                    label="Fecha límite (Deadline)"
                                    value={deadline}
                                    onChange={setDeadline}
                                    disabled={savingEstado}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            helperText: 'Establece una fecha límite para resolver esta incidencia'
                                        }
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label="Notas (opcional)"
                                    multiline
                                    rows={3}
                                    value={notasEstado}
                                    onChange={(e) => setNotasEstado(e.target.value)}
                                    disabled={savingEstado}
                                    sx={{ mt: 2 }}
                                    placeholder="Agregar notas sobre este cambio..."
                                />
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

                {/* Modal de Galería de Imágenes */}
                <Dialog
                    open={openImageModal}
                    onClose={() => setOpenImageModal(false)}
                    maxWidth="lg"
                    fullWidth
                >
                    <DialogTitle>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">
                                Imagen {selectedImageIndex + 1} de {selectedImage?.length || 0}
                            </Typography>
                            <IconButton onClick={() => setOpenImageModal(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        {selectedImage && selectedImage.length > 0 && (
                            <Box>
                                <img
                                    src={selectedImage[selectedImageIndex]}
                                    alt={`Imagen ${selectedImageIndex + 1}`}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        maxHeight: '70vh',
                                        objectFit: 'contain',
                                    }}
                                />
                                {selectedImage.length > 1 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
                                        <Button
                                            onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                                            disabled={selectedImageIndex === 0}
                                        >
                                            Anterior
                                        </Button>
                                        <Button
                                            onClick={() => setSelectedImageIndex(Math.min(selectedImage.length - 1, selectedImageIndex + 1))}
                                            disabled={selectedImageIndex === selectedImage.length - 1}
                                        >
                                            Siguiente
                                        </Button>
                                    </Box>
                                )}
                            </Box>
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