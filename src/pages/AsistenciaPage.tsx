import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Button,
    Grid,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Alert,
    Card,
    CardContent,
    Avatar,
    Stack,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    CircularProgress,
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    Map as MapIcon,
    Search as SearchIcon,
    Login as LoginIcon,
    Logout as LogoutIcon,
    AccessTime as TimeIcon,
    CalendarToday as CalendarIcon,
    Refresh as RefreshIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import { GoogleMap, LoadScript, Marker, Circle, Polyline } from '@react-google-maps/api';
import type { Libraries } from '@react-google-maps/api';
import axios from 'axios';
import moment from 'moment';
moment.updateLocale('es', {
    months: [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ],
    weekdays: [
        'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
    ]
});

const GOOGLE_MAPS_API_KEY = 'AIzaSyAI4wxGabETICPQ6rmWft48nCg3i09efcY';
const libraries: Libraries = ["places"];

const mapContainerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '12px',
};

interface Usuario {
    _id: string;
    nombre: string;
    apellido: string;
}

interface Sede {
    _id: string;
    nombre: string;
    direccion: string;
    latitude: number;
    longitude: number;
    radio: number;
}

interface Asistencia {
    _id: string;
    usuario: Usuario;
    sede: Sede;
    entrada: string;
    salida?: string;
    latitude_entrada: number;
    longitude_entrada: number;
    latitude_salida?: number;
    longitude_salida?: number;
    valido_entrada: boolean;
    valido_salida?: boolean;
    horas_trabajadas?: number;
    createdAt: string;
}

export const AsistenciaPage: React.FC = () => {
    const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
    const hoy = new Date().toISOString().split('T')[0];
    const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(hoy);
    const [filtroEstado, setFiltroEstado] = useState<string>('todos');
    const [filtroSede, setFiltroSede] = useState<string>('todos');
    const [busqueda, setBusqueda] = useState<string>('');
    const [dialogMapa, setDialogMapa] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [asistenciaSeleccionada, setAsistenciaSeleccionada] = useState<Asistencia | null>(null);
    const [sedes, setSedes] = useState<Sede[]>([]);

    const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return Math.round(R * c);
    };

    const getAsistencias = async () => {
        setIsLoading(true);
        try {
            const date = new Date(fechaSeleccionada);
            date.setDate(date.getDate() + 1);
            const response = await axios.get(`http://localhost:4000/api/asistencias/${date.toISOString()}`);
            setAsistencias(response.data);

            const sedesUnicas = Array.from(new Set(response.data.map((a: Asistencia) => a.sede._id)))
                .map(id => response.data.find((a: Asistencia) => a.sede._id === id)?.sede)
                .filter(Boolean) as Sede[];
            setSedes(sedesUnicas);
        } catch (error) {
            console.error('Error al obtener asistencias:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getAsistencias();
    }, [fechaSeleccionada]);

    const irDiaAnterior = () => {
        const fecha = new Date(fechaSeleccionada);
        fecha.setDate(fecha.getDate() - 1);
        setFechaSeleccionada(fecha.toISOString().split('T')[0]);
    };

    const irDiaSiguiente = () => {
        const fecha = new Date(fechaSeleccionada);
        fecha.setDate(fecha.getDate() + 1);
        setFechaSeleccionada(fecha.toISOString().split('T')[0]);
    };

    const verMapaAsistencia = (asistencia: Asistencia) => {
        setAsistenciaSeleccionada(asistencia);
        setDialogMapa(true);
    };

    const formatearFecha = (fecha: string): string => {
        return moment(fecha).format('dddd, D [de] MMMM [de] YYYY');
    };

    const formatearHora = (fecha: string): string => {
        return moment(fecha).format('HH:mm:ss');
    };

    const asistenciasFiltradas = asistencias.filter(asistencia => {
        const nombreCompleto = `${asistencia.usuario.nombre} ${asistencia.usuario.apellido}`.toLowerCase();
        const cumpleBusqueda = nombreCompleto.includes(busqueda.toLowerCase());

        const cumpleEstado = filtroEstado === 'todos' ||
            (filtroEstado === 'validas' && asistencia.valido_entrada && (asistencia.valido_salida !== false)) ||
            (filtroEstado === 'invalidas' && (!asistencia.valido_entrada || asistencia.valido_salida === false));

        const cumpleSede = filtroSede === 'todos' || asistencia.sede._id === filtroSede;

        return cumpleBusqueda && cumpleEstado && cumpleSede;
    });

    const getEstadoAsistencia = (asistencia: Asistencia) => {
        if (!asistencia.valido_entrada) return 'invalida-entrada';
        if (asistencia.salida && asistencia.valido_salida === false) return 'invalida-salida';
        if (!asistencia.salida) return 'en-curso';
        return 'valida';
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries}>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Tooltip title="Día anterior">
                                <IconButton
                                    onClick={irDiaAnterior}
                                    sx={{
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' }
                                    }}
                                >
                                    <ChevronLeftIcon />
                                </IconButton>
                            </Tooltip>

                            <TextField
                                fullWidth
                                type="date"

                                value={fechaSeleccionada}
                                onChange={(e) => setFechaSeleccionada(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CalendarIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Tooltip title="Día siguiente">
                                <IconButton
                                    onClick={irDiaSiguiente}
                                    disabled={fechaSeleccionada >= hoy}
                                    sx={{
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        '&:disabled': { bgcolor: 'action.disabledBackground' }
                                    }}
                                >
                                    <ChevronRightIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 7, display: 'block', mt: 0.5 }}
                        >
                            {formatearFecha(fechaSeleccionada)}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 2.5 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Buscar empleado"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Estado</InputLabel>
                            <Select
                                value={filtroEstado}
                                label="Estado"
                                onChange={(e) => setFiltroEstado(e.target.value)}
                            >
                                <MenuItem value="todos">Todos</MenuItem>
                                <MenuItem value="validas">Válidas</MenuItem>
                                <MenuItem value="invalidas">Inválidas</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 2.5 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Sede</InputLabel>
                            <Select
                                value={filtroSede}
                                label="Sede"
                                onChange={(e) => setFiltroSede(e.target.value)}
                            >
                                <MenuItem value="todos">Todas</MenuItem>
                                {sedes.map(sede => (
                                    <MenuItem key={sede._id} value={sede._id}>
                                        {sede.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 1 }}>
                        <Tooltip title="Actualizar">
                            <IconButton color="primary" size="large" onClick={getAsistencias}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                                    Empleado
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                                    Sede
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                                    Entrada
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                                    Salida
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                                    Horas
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                                    Precisión
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                                    Estado
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }} align="center">
                                    Acciones
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {asistenciasFiltradas.map((asistencia) => {
                                const estado = getEstadoAsistencia(asistencia);
                                const distanciaEntrada = calcularDistancia(
                                    asistencia.latitude_entrada,
                                    asistencia.longitude_entrada,
                                    asistencia.sede.latitude,
                                    asistencia.sede.longitude
                                );
                                const distanciaSalida = asistencia.latitude_salida && asistencia.longitude_salida
                                    ? calcularDistancia(
                                        asistencia.latitude_salida,
                                        asistencia.longitude_salida,
                                        asistencia.sede.latitude,
                                        asistencia.sede.longitude
                                    )
                                    : null;

                                return (
                                    <TableRow
                                        key={asistencia._id}
                                        hover
                                        sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                                    >
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar sx={{ bgcolor: 'primary.light' }}>
                                                    {asistencia.usuario.nombre.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography fontWeight="medium">
                                                        {asistencia.usuario.nombre} {asistencia.usuario.apellido}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <LocationIcon fontSize="small" color="action" />
                                                <Typography variant="body2">
                                                    {asistencia.sede.nombre}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={<LoginIcon />}
                                                label={formatearHora(asistencia.entrada)}
                                                size="small"
                                                color={asistencia.valido_entrada ? "success" : "error"}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {asistencia.salida ? (
                                                <Chip
                                                    icon={<LogoutIcon />}
                                                    label={formatearHora(asistencia.salida)}
                                                    size="small"
                                                    color={asistencia.valido_salida !== false ? "success" : "error"}
                                                    variant="outlined"
                                                />
                                            ) : (
                                                <Chip
                                                    label="En curso"
                                                    size="small"
                                                    color="info"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium">
                                                {asistencia.horas_trabajadas
                                                    ? `${asistencia.horas_trabajadas.toFixed(2)}h`
                                                    : '-'
                                                }
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack spacing={0.5}>
                                                <Typography variant="caption" color="text.secondary">
                                                    E: {distanciaEntrada}m
                                                </Typography>
                                                {distanciaSalida !== null && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        S: {distanciaSalida}m
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            {estado === 'valida' && (
                                                <Chip
                                                    icon={<CheckIcon />}
                                                    label="Válida"
                                                    color="success"
                                                    size="small"
                                                />
                                            )}
                                            {estado === 'invalida-entrada' && (
                                                <Chip
                                                    icon={<CancelIcon />}
                                                    label="Entrada fuera"
                                                    color="error"
                                                    size="small"
                                                />
                                            )}
                                            {estado === 'invalida-salida' && (
                                                <Chip
                                                    icon={<WarningIcon />}
                                                    label="Salida fuera"
                                                    color="warning"
                                                    size="small"
                                                />
                                            )}
                                            {estado === 'en-curso' && (
                                                <Chip
                                                    icon={asistencia.valido_entrada ? <CheckIcon /> : <CancelIcon />}
                                                    label="En curso"
                                                    color={asistencia.valido_entrada ? "info" : "error"}
                                                    size="small"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Ver en mapa">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => verMapaAsistencia(asistencia)}
                                                >
                                                    <MapIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                {asistenciasFiltradas.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            No se encontraron asistencias para {formatearFecha(fechaSeleccionada)}
                        </Typography>
                    </Box>
                )}
            </Paper>

            <Dialog
                open={dialogMapa}
                onClose={() => setDialogMapa(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <MapIcon />
                        <Box>
                            <Typography variant="h6">
                                Ubicación de Asistencia
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                {asistenciaSeleccionada?.usuario.nombre} - {asistenciaSeleccionada?.sede.nombre}
                            </Typography>
                        </Box>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {asistenciaSeleccionada && (
                        <Box>
                            <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar sx={{ bgcolor: asistenciaSeleccionada.valido_entrada ? 'success.light' : 'error.light' }}>
                                                    <LoginIcon />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Hora de Entrada
                                                    </Typography>
                                                    <Typography variant="h6" fontWeight="bold">
                                                        {formatearHora(asistenciaSeleccionada.entrada)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Distancia: {calcularDistancia(
                                                            asistenciaSeleccionada.latitude_entrada,
                                                            asistenciaSeleccionada.longitude_entrada,
                                                            asistenciaSeleccionada.sede.latitude,
                                                            asistenciaSeleccionada.sede.longitude
                                                        )}m
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar sx={{
                                                    bgcolor: asistenciaSeleccionada.salida
                                                        ? (asistenciaSeleccionada.valido_salida !== false ? 'success.light' : 'error.light')
                                                        : 'grey.300'
                                                }}>
                                                    <LogoutIcon />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Hora de Salida
                                                    </Typography>
                                                    <Typography variant="h6" fontWeight="bold">
                                                        {asistenciaSeleccionada.salida
                                                            ? formatearHora(asistenciaSeleccionada.salida)
                                                            : 'En curso'
                                                        }
                                                    </Typography>
                                                    {asistenciaSeleccionada.latitude_salida && asistenciaSeleccionada.longitude_salida && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            Distancia: {calcularDistancia(
                                                                asistenciaSeleccionada.latitude_salida,
                                                                asistenciaSeleccionada.longitude_salida,
                                                                asistenciaSeleccionada.sede.latitude,
                                                                asistenciaSeleccionada.sede.longitude
                                                            )}m
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar sx={{ bgcolor: 'info.light' }}>
                                                    <TimeIcon />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Tiempo Total
                                                    </Typography>
                                                    <Typography variant="h6" fontWeight="bold">
                                                        {asistenciaSeleccionada.horas_trabajadas
                                                            ? `${asistenciaSeleccionada.horas_trabajadas.toFixed(2)} horas`
                                                            : 'En curso'
                                                        }
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Jornada laboral
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 3 }}>
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={{
                                        lat: asistenciaSeleccionada.sede.latitude,
                                        lng: asistenciaSeleccionada.sede.longitude
                                    }}
                                    zoom={17}
                                    options={{
                                        mapTypeControl: true,
                                        streetViewControl: true,
                                        fullscreenControl: true,
                                    }}
                                >
                                    <Marker
                                        position={{
                                            lat: asistenciaSeleccionada.sede.latitude,
                                            lng: asistenciaSeleccionada.sede.longitude
                                        }}
                                        icon={{
                                            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                                        }}
                                        title={asistenciaSeleccionada.sede.nombre}
                                    />

                                    <Circle
                                        center={{
                                            lat: asistenciaSeleccionada.sede.latitude,
                                            lng: asistenciaSeleccionada.sede.longitude
                                        }}
                                        radius={asistenciaSeleccionada.sede.radio}
                                        options={{
                                            fillColor: asistenciaSeleccionada.valido_entrada && (asistenciaSeleccionada.valido_salida !== false)
                                                ? '#4CAF50'
                                                : '#F44336',
                                            fillOpacity: 0.15,
                                            strokeColor: asistenciaSeleccionada.valido_entrada && (asistenciaSeleccionada.valido_salida !== false)
                                                ? '#4CAF50'
                                                : '#F44336',
                                            strokeOpacity: 0.6,
                                            strokeWeight: 2,
                                        }}
                                    />

                                    <Marker
                                        position={{
                                            lat: asistenciaSeleccionada.latitude_entrada,
                                            lng: asistenciaSeleccionada.longitude_entrada
                                        }}
                                        icon={{
                                            url: asistenciaSeleccionada.valido_entrada
                                                ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                                                : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                                        }}
                                        title="Punto de Entrada"
                                        label={{
                                            text: 'E',
                                            color: 'white',
                                            fontWeight: 'bold',
                                        }}
                                    />

                                    {asistenciaSeleccionada.latitude_salida && asistenciaSeleccionada.longitude_salida && (
                                        <>
                                            <Marker
                                                position={{
                                                    lat: asistenciaSeleccionada.latitude_salida,
                                                    lng: asistenciaSeleccionada.longitude_salida
                                                }}
                                                icon={{
                                                    url: asistenciaSeleccionada.valido_salida !== false
                                                        ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                                                        : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                                                }}
                                                title="Punto de Salida"
                                                label={{
                                                    text: 'S',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                }}
                                            />
                                            <Polyline
                                                path={[
                                                    {
                                                        lat: asistenciaSeleccionada.latitude_entrada,
                                                        lng: asistenciaSeleccionada.longitude_entrada
                                                    },
                                                    {
                                                        lat: asistenciaSeleccionada.latitude_salida,
                                                        lng: asistenciaSeleccionada.longitude_salida
                                                    }
                                                ]}
                                                options={{
                                                    strokeColor: '#2196F3',
                                                    strokeOpacity: 0.7,
                                                    strokeWeight: 3,
                                                }}
                                            />
                                        </>
                                    )}
                                </GoogleMap>
                            </Paper>

                            <Paper sx={{ mt: 2, p: 2 }} variant="outlined">
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Box sx={{
                                                width: 16,
                                                height: 16,
                                                borderRadius: '50%',
                                                bgcolor: '#4285F4'
                                            }} />
                                            <Typography variant="caption">Sede (Radio: {asistenciaSeleccionada.sede.radio}m)</Typography>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Box sx={{
                                                width: 16,
                                                height: 16,
                                                borderRadius: '50%',
                                                bgcolor: '#4CAF50'
                                            }} />
                                            <Typography variant="caption">Entrada/Salida Válida</Typography>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Box sx={{
                                                width: 16,
                                                height: 16,
                                                borderRadius: '50%',
                                                bgcolor: '#F44336'
                                            }} />
                                            <Typography variant="caption">Fuera de Rango</Typography>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Paper>

                            <Alert
                                severity={
                                    asistenciaSeleccionada.valido_entrada && (asistenciaSeleccionada.valido_salida !== false)
                                        ? 'success'
                                        : !asistenciaSeleccionada.valido_entrada
                                            ? 'error'
                                            : 'warning'
                                }
                                sx={{ mt: 2 }}
                            >
                                <Typography variant="subtitle2" fontWeight="bold">
                                    {asistenciaSeleccionada.valido_entrada && (asistenciaSeleccionada.valido_salida !== false)
                                        ? 'Asistencia Válida'
                                        : !asistenciaSeleccionada.valido_entrada
                                            ? 'Entrada Fuera de Rango'
                                            : 'Salida Fuera de Rango'}
                                </Typography>
                                <Typography variant="body2">
                                    {!asistenciaSeleccionada.valido_entrada &&
                                        `La entrada se registró fuera del radio permitido de ${asistenciaSeleccionada.sede.radio}m`
                                    }
                                    {asistenciaSeleccionada.valido_entrada && asistenciaSeleccionada.valido_salida === false &&
                                        `La salida se registró fuera del radio permitido de ${asistenciaSeleccionada.sede.radio}m`
                                    }
                                    {asistenciaSeleccionada.valido_entrada && (asistenciaSeleccionada.valido_salida !== false) &&
                                        `El empleado registró su asistencia dentro del radio permitido de ${asistenciaSeleccionada.sede.radio}m`
                                    }
                                </Typography>
                            </Alert>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDialogMapa(false)} variant="contained">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

        </LoadScript>
    );
};