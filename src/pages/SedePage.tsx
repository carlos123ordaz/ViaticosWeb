import React, { useState, useCallback, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Alert,
    Card,
    CardContent,
    Divider,
    List,
    ListItem,
    ListItemButton,
    CircularProgress,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Tooltip,
    Stack,
} from '@mui/material';
import {
    Add as AddIcon,
    LocationOn as LocationIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    MyLocation as MyLocationIcon,
    RadioButtonChecked as RadioIcon,
} from '@mui/icons-material';
import { GoogleMap, LoadScript, Marker, Circle } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAI4wxGabETICPQ6rmWft48nCg3i09efcY';
const API_BASE_URL = 'http://localhost:4000/api';
const libraries: ("places")[] = ["places"];

const mapContainerStyle = {
    width: '100%',
    height: '400px'
};

const defaultCenter = { lat: -12.0464, lng: -77.0428 }; // Lima, Perú

interface Sede {
    _id: string;
    nombre: string;
    direccion: string;
    latitude: number;
    longitude: number;
    radio: number;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface NuevoLugar {
    nombre: string;
    direccion: string;
    latitude: number;
    longitude: number;
    radio: number;
}

interface Sugerencia {
    description: string;
    place_id: string;
}

interface SnackbarState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
}

export const SedePage: React.FC = () => {
    const [sedes, setSedes] = useState<Sede[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [dialogLugar, setDialogLugar] = useState<boolean>(false);
    const [nuevoLugar, setNuevoLugar] = useState<NuevoLugar>({
        nombre: '',
        direccion: '',
        latitude: defaultCenter.lat,
        longitude: defaultCenter.lng,
        radio: 100,
    });
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(defaultCenter);
    const [busquedaLugar, setBusquedaLugar] = useState<string>('');
    const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'success'
    });
    const [editMode, setEditMode] = useState<boolean>(false);
    const [sedeEditando, setSedeEditando] = useState<Sede | null>(null);

    useEffect(() => {
        cargarSedes();
    }, []);

    const cargarSedes = async (): Promise<void> => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/sedes`);
            if (response.ok) {
                const data: Sede[] = await response.json();
                setSedes(data);
            } else {
                mostrarSnackbar('Error al cargar las sedes', 'error');
            }
        } catch (error) {
            console.error('Error al cargar sedes:', error);
            mostrarSnackbar('Error de conexión con el servidor', 'error');
        } finally {
            setLoading(false);
        }
    };

    const mostrarSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success'): void => {
        setSnackbar({ open: true, message, severity });
    };

    const buscarSugerencias = useCallback(async (value: string): Promise<void> => {
        if (!value || value.trim() === '') {
            setSugerencias([]);
            return;
        }

        try {
            const requestData = {
                input: value,
                locationBias: {
                    circle: {
                        center: {
                            latitude: defaultCenter.lat,
                            longitude: defaultCenter.lng
                        },
                        radius: 20000.0
                    }
                },
                languageCode: 'es'
            };

            const response = await fetch(
                'https://places.googleapis.com/v1/places:autocomplete',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                        'X-Goog-FieldMask': 'suggestions.placePrediction.place,suggestions.placePrediction.text'
                    },
                    body: JSON.stringify(requestData)
                }
            );

            const data = await response.json();

            if (response.ok && data.suggestions) {
                const predictions: Sugerencia[] = data.suggestions
                    .filter((s: any) => s.placePrediction)
                    .map((s: any) => ({
                        description: s.placePrediction.text.text,
                        place_id: s.placePrediction.place.replace('places/', '')
                    }));
                setSugerencias(predictions);
            } else {
                setSugerencias([]);
            }
        } catch (error) {
            console.error('Error al buscar lugares:', error);
            setSugerencias([]);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            buscarSugerencias(busquedaLugar);
        }, 500);
        return () => clearTimeout(timer);
    }, [busquedaLugar, buscarSugerencias]);

    const seleccionarLugar = async (placeId: string): Promise<void> => {
        try {
            const response = await fetch(
                `https://places.googleapis.com/v1/places/${placeId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
                        "X-Goog-FieldMask": "displayName,formattedAddress,location"
                    }
                }
            );

            const place = await response.json();
            if (response.ok && place.location) {
                const newCoords = {
                    lat: place.location.latitude,
                    lng: place.location.longitude
                };
                setNuevoLugar({
                    nombre: nuevoLugar.nombre,
                    direccion: place.formattedAddress || "",
                    latitude: place.location.latitude,
                    longitude: place.location.longitude,
                    radio: nuevoLugar.radio || 100,
                });
                setMapCenter(newCoords);
                setSugerencias([]);
                setBusquedaLugar('');
            }
        } catch (err) {
            console.error("Error al obtener detalles:", err);
            mostrarSnackbar('Error al obtener detalles del lugar', 'error');
        }
    };

    const onMarkerDragEnd = (e: google.maps.MapMouseEvent): void => {
        if (e.latLng) {
            const newCoords = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
            };
            setNuevoLugar({
                ...nuevoLugar,
                latitude: e.latLng.lat(),
                longitude: e.latLng.lng()
            });
            setMapCenter(newCoords);
        }
    };

    const onMapLoad = useCallback((mapInstance: google.maps.Map): void => {
        setMap(mapInstance);
    }, []);

    const guardarSede = async (): Promise<void> => {
        if (!nuevoLugar.nombre || !nuevoLugar.direccion) {
            mostrarSnackbar('Complete todos los campos requeridos', 'warning');
            return;
        }

        setLoading(true);
        try {
            const url = editMode && sedeEditando
                ? `${API_BASE_URL}/sedes/${sedeEditando._id}`
                : `${API_BASE_URL}/sedes`;

            const method = editMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: nuevoLugar.nombre,
                    direccion: nuevoLugar.direccion,
                    latitude: nuevoLugar.latitude,
                    longitude: nuevoLugar.longitude,
                    radio: nuevoLugar.radio,
                    active: true
                })
            });

            if (response.ok) {
                mostrarSnackbar(
                    editMode ? 'Sede actualizada exitosamente' : 'Sede agregada exitosamente',
                    'success'
                );
                cerrarDialog();
                cargarSedes();
            } else {
                const error = await response.json();
                mostrarSnackbar(error.message || 'Error al guardar sede', 'error');
            }
        } catch (error) {
            console.error('Error al guardar sede:', error);
            mostrarSnackbar('Error de conexión con el servidor', 'error');
        } finally {
            setLoading(false);
        }
    };

    const cerrarDialog = (): void => {
        setDialogLugar(false);
        setEditMode(false);
        setSedeEditando(null);
        setNuevoLugar({
            nombre: '',
            direccion: '',
            latitude: defaultCenter.lat,
            longitude: defaultCenter.lng,
            radio: 100,
        });
        setMapCenter(defaultCenter);
        setBusquedaLugar('');
        setSugerencias([]);
    };

    const abrirDialogEditar = (sede: Sede): void => {
        setEditMode(true);
        setSedeEditando(sede);
        setNuevoLugar({
            nombre: sede.nombre,
            direccion: sede.direccion,
            latitude: sede.latitude,
            longitude: sede.longitude,
            radio: sede.radio,
        });
        setMapCenter({ lat: sede.latitude, lng: sede.longitude });
        setDialogLugar(true);
    };

    const eliminarSede = async (id: string): Promise<void> => {
        if (!window.confirm('¿Está seguro de eliminar esta sede?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/sedes/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                mostrarSnackbar('Sede eliminada exitosamente', 'success');
                cargarSedes();
            } else {
                mostrarSnackbar('Error al eliminar sede', 'error');
            }
        } catch (error) {
            console.error('Error al eliminar sede:', error);
            mostrarSnackbar('Error de conexión con el servidor', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries}>
            <Box sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="end" alignItems="center">
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setDialogLugar(true)}
                        disabled={loading}
                        sx={{ height: 'fit-content' }}
                    >
                        Agregar Sede
                    </Button>
                </Stack>
            </Box>

            {loading && sedes.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                    <CircularProgress size={60} />
                </Box>
            ) : sedes.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <LocationIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No hay sedes registradas
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Comienza agregando tu primera sede para el control de asistencias
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setDialogLugar(true)}
                    >
                        Agregar Primera Sede
                    </Button>
                </Paper>
            ) : (
                <Paper sx={{ overflow: 'hidden' }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                                        Nombre de la Sede
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                                        Dirección
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                                        Coordenadas
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }} align="center">
                                        Radio
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }} align="center">
                                        Estado
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }} align="center">
                                        Acciones
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sedes.map((sede) => (
                                    <TableRow
                                        key={sede._id}
                                        hover
                                        sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                                    >
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <LocationIcon color="primary" />
                                                <Typography fontWeight="medium">
                                                    {sede.nombre}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {sede.direccion}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack spacing={0.5}>
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <MyLocationIcon fontSize="small" color="action" />
                                                    <Typography variant="caption" color="text.secondary">
                                                        Lat: {sede.latitude.toFixed(6)}
                                                    </Typography>
                                                </Stack>
                                                <Typography variant="caption" color="text.secondary" sx={{ pl: 2.5 }}>
                                                    Lng: {sede.longitude.toFixed(6)}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                icon={<RadioIcon />}
                                                label={`${sede.radio}m`}
                                                color="info"
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={sede.active ? 'Activa' : 'Inactiva'}
                                                color={sede.active ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Tooltip title="Editar sede">
                                                    <IconButton
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => abrirDialogEditar(sede)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar sede">
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        onClick={() => eliminarSede(sede._id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="body2" color="text.secondary">
                            Total de sedes: <strong>{sedes.length}</strong>
                        </Typography>
                    </Box>
                </Paper>
            )}

            <Dialog open={dialogLugar} onClose={cerrarDialog} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <LocationIcon />
                        <Typography variant="h6">
                            {editMode ? 'Editar Sede' : 'Agregar Nueva Sede'}
                        </Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Alert severity="info">
                            Busca un lugar para obtener sus datos automáticamente. Mueve el marcador para ajustar la ubicación.
                        </Alert>

                        <TextField
                            fullWidth
                            label="Nombre de la sede"
                            value={nuevoLugar.nombre}
                            onChange={(e) =>
                                setNuevoLugar({ ...nuevoLugar, nombre: e.target.value })
                            }
                            required
                            helperText="Nombre identificador de la sede"
                        />

                        <Box sx={{ position: 'relative' }}>
                            <TextField
                                fullWidth
                                label="Buscar lugar"
                                placeholder="Ej: Jockey Plaza, San Isidro, Lima"
                                value={busquedaLugar}
                                onChange={(e) => setBusquedaLugar(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                }}
                            />

                            {sugerencias.length > 0 && (
                                <Paper
                                    sx={{
                                        position: 'absolute',
                                        zIndex: 1300,
                                        width: '100%',
                                        maxHeight: 300,
                                        overflow: 'auto',
                                        mt: 1,
                                    }}
                                    elevation={8}
                                >
                                    <List>
                                        {sugerencias.map((sugerencia) => (
                                            <ListItem key={sugerencia.place_id} disablePadding>
                                                <ListItemButton onClick={() => seleccionarLugar(sugerencia.place_id)}>
                                                    <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                                                    <Typography variant="body2">{sugerencia.description}</Typography>
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            )}
                        </Box>

                        <Divider />

                        <Card variant="outlined" sx={{ bgcolor: 'primary.light' }}>
                            <CardContent>
                                <Typography variant="subtitle2" gutterBottom>
                                    Lugar Seleccionado:
                                </Typography>
                                <Typography variant="h6">
                                    {nuevoLugar.nombre || 'Sin seleccionar'}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    {nuevoLugar.direccion || 'Sin dirección'}
                                </Typography>
                            </CardContent>
                        </Card>

                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={mapCenter}
                            zoom={16}
                            onLoad={onMapLoad}
                        >
                            <Marker
                                position={{ lat: nuevoLugar.latitude, lng: nuevoLugar.longitude }}
                                draggable={true}
                                onDragEnd={onMarkerDragEnd}
                            />
                            <Circle
                                center={{ lat: nuevoLugar.latitude, lng: nuevoLugar.longitude }}
                                radius={nuevoLugar.radio || 100}
                                options={{
                                    fillColor: '#4285F4',
                                    fillOpacity: 0.2,
                                    strokeColor: '#4285F4',
                                    strokeOpacity: 0.8,
                                    strokeWeight: 2,
                                }}
                            />
                        </GoogleMap>

                        <TextField
                            fullWidth
                            label="Radio de Validación (metros)"
                            type="number"
                            value={nuevoLugar.radio}
                            onChange={(e) =>
                                setNuevoLugar({ ...nuevoLugar, radio: parseInt(e.target.value) || 100 })
                            }
                            helperText="Distancia máxima permitida para validar asistencias"
                            inputProps={{ min: 10, max: 1000, step: 10 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={cerrarDialog}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={guardarSede}
                        disabled={!nuevoLugar.nombre || !nuevoLugar.direccion || loading}
                    >
                        {loading ? <CircularProgress size={24} /> : editMode ? 'Guardar Cambios' : 'Agregar Sede'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
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
        </LoadScript>
    );
};