import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Stack,
    Avatar,
    Chip,
    Button,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Collapse,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    OutlinedInput,
    Checkbox,
    ListItemText,
    FormHelperText,
    Switch,
    FormControlLabel,
} from '@mui/material';
import {
    Search,
    FilterList,
    People,
    CheckCircle,
    Cancel,
    Refresh,
    Add,
    Edit,
    Delete,
    Close,
} from '@mui/icons-material';
import axios from 'axios';

// Tipos basados en el esquema de MongoDB
interface Usuario {
    _id?: string;
    photo?: string;
    nombre: string;
    apellido: string;
    dni: string;
    cargo: string;
    area: string[];
    celular: string;
    correo: string;
    password?: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
    sede: string;
}

interface UsuarioFormData {
    photo?: string;
    nombre: string;
    apellido: string;
    dni: string;
    cargo: string;
    area: string[];
    celular: string;
    correo: string;
    password?: string;
    active: boolean;
    sede: string;
}
// Áreas disponibles
const areas = [
    'Dirección General',
    'Contabilidad',
    'Servicio Post Venta',
    'Proyectos',
    'Ventas Norte',
    'Ventas Lima',
    'Ventas Internas',
    'Ventas',
    'Ventas Comercial',
    'Marketing',
    'Administración',
    'Sistemas',
    'Almacén',
    'Gerencia',
    'Facturación',
    'Cobranzas',
    'Operaciones',
    'RRHH',
    'TI',
    'Compras',
    'Servicio Técnico',
    'Automatización',
    'Proyectos Especiales',
    'Asistencia',
];

interface Sede {
    _id?: string;
    nombre: string;
    direccion: string;
    latitude: string;
    longitude: string;
    radio: Number;
    active?: boolean;
}

// Configura tu URL base del backend
const API_URL = 'http://localhost:4000/api/usuarios';

export const UsersPage: React.FC = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [totalUsuarios, setTotalUsuarios] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState<string>('todos');
    const [filterArea, setFilterArea] = useState<string>('todos');
    const [showFilters, setShowFilters] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);
    const [stats, setStats] = useState({ total: 0, activos: 0, inactivos: 0 });
    const [sedes, setSedes] = useState<Sede[] | null>(null);
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UsuarioFormData>({
        defaultValues: {
            photo: '',
            nombre: '',
            apellido: '',
            dni: '',
            cargo: '',
            area: [],
            sede: '',
            celular: '',
            correo: '',
            password: '',
            active: true,
        },
    });
    const getSedes = async () => {
        axios.get('http://localhost:4000/api/sedes')
            .then(res => {
                console.log(res.data)
                setSedes(res.data);
            })
            .catch(err => {
                console.error(err);
                setError(err.response?.data?.message || 'Error al cargar sedes');
                setSedes([]);
            })
    };
    useEffect(() => {

        getSedes();
    }, []);
    const getUsuarios = async () => {
        setLoading(true);
        setError(null);

        try {
            const params: any = {
                page: page + 1,
                limit: rowsPerPage,
            };

            if (searchTerm.trim()) {
                params.search = searchTerm.trim();
            }

            if (filterActive !== 'todos') {
                params.active = filterActive === 'activos';
            }

            if (filterArea !== 'todos') {
                params.area = filterArea;
            }

            const response = await axios.get(API_URL);
            setUsuarios(response.data);

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Error al cargar usuarios');
            setUsuarios([]);
            setTotalUsuarios(0);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        getUsuarios();
    }, [page, rowsPerPage, filterActive, filterArea, searchTerm]);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const [searchTimeout, setSearchTimeout] = useState<any>(null);
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            setPage(0);
        }, 500);

        setSearchTimeout(timeout);
    };

    // Limpiar filtros
    const handleClearFilters = () => {
        setFilterActive('todos');
        setFilterArea('todos');
        setSearchTerm('');
        setPage(0);
    };

    // Abrir dialog para crear
    const handleOpenCreate = () => {
        setDialogMode('create');
        setCurrentUserId(null);
        reset({
            photo: '',
            nombre: '',
            apellido: '',
            dni: '',
            cargo: '',
            area: [],
            celular: '',
            correo: '',
            password: '',
            active: true,
        });
        setOpenDialog(true);
    };

    // Abrir dialog para editar
    const handleOpenEdit = (usuario: Usuario) => {
        setDialogMode('edit');
        setCurrentUserId(usuario._id || null);
        reset({
            photo: usuario.photo || '',
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            dni: usuario.dni,
            cargo: usuario.cargo,
            area: usuario.area,
            celular: usuario.celular,
            correo: usuario.correo,
            password: '',
            active: usuario.active,
            sede: usuario.sede || '',
        });
        setOpenDialog(true);
    };

    // Cerrar dialog
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentUserId(null);
        reset();
    };

    // Guardar usuario (crear o editar)
    const onSubmit = async (data: UsuarioFormData) => {
        setLoading(true);
        setError(null);
        try {
            const payload = { ...data };
            if (dialogMode === 'edit' && !payload.password) {
                delete payload.password;
            }
            if (dialogMode === 'create') {
                await axios.post(API_URL, payload);
                setSuccess('Usuario creado exitosamente');
            } else {
                await axios.put(`${API_URL}/${currentUserId}`, payload);
                setSuccess('Usuario actualizado exitosamente');
            }
            handleCloseDialog();
            getUsuarios();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al guardar usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDeleteDialog = (usuario: Usuario) => {
        setUserToDelete(usuario);
        setOpenDeleteDialog(true);
    };

    // Cerrar dialog de eliminación
    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setUserToDelete(null);
    };

    // Eliminar usuario
    const handleDeleteUser = async () => {
        if (!userToDelete?._id) return;

        setLoading(true);
        setError(null);

        try {
            await axios.delete(`${API_URL}/${userToDelete._id}`);
            setSuccess('Usuario eliminado exitosamente');
            handleCloseDeleteDialog();
            getUsuarios();

        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al eliminar usuario');
        } finally {
            setLoading(false);
        }
    };

    const getNombreCompleto = (usuario: Usuario) => {
        return `${usuario.nombre} ${usuario.apellido}`.trim();
    };

    const getInitials = (usuario: Usuario) => {
        const name = usuario.nombre?.[0] || '';
        const lastName = usuario.apellido?.[0] || '';
        return `${name}${lastName}`.toUpperCase();
    };

    const getAreaNames = (userAreas: string[]) => {
        if (!userAreas || userAreas.length === 0) return '-';
        if (userAreas.length <= 2) return userAreas.join(', ');
        return `${userAreas.slice(0, 2).join(', ')}... (+${userAreas.length - 2})`;
    };

    return (
        <Box>
            {/* Alerts */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card elevation={0} sx={{ borderLeft: 4, borderColor: 'primary.main' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography color="text.secondary" variant="body2" gutterBottom>
                                        Total Usuarios
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.total}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Registrados
                                    </Typography>
                                </Box>
                                <People sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card elevation={0} sx={{ borderLeft: 4, borderColor: 'success.main' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography color="text.secondary" variant="body2" gutterBottom>
                                        Activos
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.activos}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {stats.total > 0 ? ((stats.activos / stats.total) * 100).toFixed(1) : 0}% del total
                                    </Typography>
                                </Box>
                                <CheckCircle sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card elevation={0} sx={{ borderLeft: 4, borderColor: 'error.main' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography color="text.secondary" variant="body2" gutterBottom>
                                        Inactivos
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.inactivos}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Deshabilitados
                                    </Typography>
                                </Box>
                                <Cancel sx={{ fontSize: 48, color: 'error.main', opacity: 0.3 }} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Controles de búsqueda y filtros */}
            <Card elevation={0} sx={{ mb: 3 }}>
                <CardContent>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                            <TextField
                                placeholder="Buscar por nombre, email, DNI..."
                                size="small"
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ flexGrow: 1, minWidth: 300 }}
                            />
                            <Button
                                variant="outlined"
                                startIcon={<FilterList />}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                Filtros
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Refresh />}
                                onClick={() => {
                                    getUsuarios();
                                }}
                                disabled={loading}
                            >
                                Actualizar
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleOpenCreate}
                            >
                                Nuevo Usuario
                            </Button>
                        </Stack>

                        <Collapse in={showFilters}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <FormControl size="small" fullWidth>
                                        <InputLabel>Estado</InputLabel>
                                        <Select
                                            value={filterActive}
                                            label="Estado"
                                            onChange={(e) => {
                                                setFilterActive(e.target.value);
                                                setPage(0);
                                            }}
                                        >
                                            <MenuItem value="todos">Todos</MenuItem>
                                            <MenuItem value="activos">Activos</MenuItem>
                                            <MenuItem value="inactivos">Inactivos</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <FormControl size="small" fullWidth>
                                        <InputLabel>Área</InputLabel>
                                        <Select
                                            value={filterArea}
                                            label="Área"
                                            onChange={(e) => {
                                                setFilterArea(e.target.value);
                                                setPage(0);
                                            }}
                                        >
                                            <MenuItem value="todos">Todas</MenuItem>
                                            {areas.map((area) => (
                                                <MenuItem key={area} value={area}>
                                                    {area}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Button
                                        fullWidth
                                        variant="text"
                                        size="medium"
                                        onClick={handleClearFilters}
                                    >
                                        Limpiar Filtros
                                    </Button>
                                </Grid>
                            </Grid>
                        </Collapse>
                    </Stack>
                </CardContent>
            </Card>

            {/* Tabla de Usuarios */}
            <Card elevation={0}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'grey.50' }}>
                                <TableCell><strong>Usuario</strong></TableCell>
                                <TableCell><strong>DNI</strong></TableCell>
                                <TableCell><strong>Cargo</strong></TableCell>
                                <TableCell><strong>Áreas</strong></TableCell>
                                <TableCell><strong>Contacto</strong></TableCell>
                                <TableCell><strong>Estado</strong></TableCell>
                                <TableCell align="center"><strong>Acciones</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <CircularProgress />
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                            Cargando usuarios...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : usuarios.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No se encontraron usuarios
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                usuarios.map((usuario) => (
                                    <TableRow key={usuario._id} hover>
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar
                                                    src={usuario.photo}
                                                    alt={getNombreCompleto(usuario)}
                                                    sx={{ width: 48, height: 48 }}
                                                >
                                                    {getInitials(usuario)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {getNombreCompleto(usuario)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {usuario.correo || '-'}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {usuario.dni || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {usuario.cargo || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ maxWidth: 250 }}>
                                                {getAreaNames(usuario.area)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {usuario.celular || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {usuario.active ? (
                                                <Chip
                                                    icon={<CheckCircle />}
                                                    label="Activo"
                                                    size="small"
                                                    color="success"
                                                    variant="outlined"
                                                />
                                            ) : (
                                                <Chip
                                                    icon={<Cancel />}
                                                    label="Inactivo"
                                                    size="small"
                                                    color="error"
                                                    variant="outlined"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleOpenEdit(usuario)}
                                                    title="Editar"
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleOpenDeleteDialog(usuario)}
                                                    title="Eliminar"
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
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
                    count={totalUsuarios}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                    }
                />
            </Card>

            {/* Dialog Crear/Editar Usuario */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">
                                {dialogMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
                            </Typography>
                            <IconButton onClick={handleCloseDialog} size="small">
                                <Close />
                            </IconButton>
                        </Stack>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2} sx={{ mt: 0.5 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="nombre"
                                    control={control}
                                    rules={{ required: 'El nombre es requerido' }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Nombre"
                                            error={!!errors.nombre}
                                            helperText={errors.nombre?.message}
                                            required
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="apellido"
                                    control={control}
                                    rules={{ required: 'El apellido es requerido' }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Apellido"
                                            error={!!errors.apellido}
                                            helperText={errors.apellido?.message}
                                            required
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="dni"
                                    control={control}
                                    rules={{
                                        required: 'El DNI es requerido',
                                        pattern: {
                                            value: /^\d{8}$/,
                                            message: 'El DNI debe tener 8 dígitos',
                                        },
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="DNI"
                                            error={!!errors.dni}
                                            helperText={errors.dni?.message}
                                            required
                                            inputProps={{ maxLength: 8 }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="celular"
                                    control={control}
                                    rules={{
                                        pattern: {
                                            value: /^\d{9}$/,
                                            message: 'El celular debe tener 9 dígitos',
                                        },
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Celular"
                                            error={!!errors.celular}
                                            helperText={errors.celular?.message}
                                            inputProps={{ maxLength: 9 }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="correo"
                                    control={control}
                                    rules={{
                                        required: 'El correo es requerido',
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: 'El correo no es válido',
                                        },
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Correo Electrónico"
                                            type="email"
                                            error={!!errors.correo}
                                            helperText={errors.correo?.message}
                                            required
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="password"
                                    control={control}
                                    rules={{
                                        required: dialogMode === 'create' ? 'La contraseña es requerida' : false,
                                        minLength: {
                                            value: 6,
                                            message: 'La contraseña debe tener al menos 6 caracteres',
                                        },
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label={dialogMode === 'create' ? 'Contraseña' : 'Nueva Contraseña (opcional)'}
                                            type="password"
                                            error={!!errors.password}
                                            helperText={
                                                errors.password?.message ||
                                                (dialogMode === 'edit' ? 'Dejar vacío para mantener la contraseña actual' : '')
                                            }
                                            required={dialogMode === 'create'}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="cargo"
                                    control={control}
                                    rules={{ required: 'El cargo es requerido' }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Cargo"
                                            error={!!errors.cargo}
                                            helperText={errors.cargo?.message}
                                            required
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="area"
                                    control={control}
                                    rules={{
                                        required: 'Debe seleccionar al menos un área',
                                        validate: (value) => value.length > 0 || 'Debe seleccionar al menos un área'
                                    }}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.area}>
                                            <InputLabel>Áreas *</InputLabel>
                                            <Select
                                                {...field}
                                                multiple
                                                input={<OutlinedInput label="Áreas *" />}
                                                renderValue={(selected) => selected.join(', ')}
                                            >
                                                {areas.map((area) => (
                                                    <MenuItem key={area} value={area}>
                                                        <Checkbox checked={field.value.indexOf(area) > -1} />
                                                        <ListItemText primary={area} />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.area && (
                                                <FormHelperText>{errors.area.message}</FormHelperText>
                                            )}
                                        </FormControl>
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="sede"
                                    control={control}
                                    // rules={{
                                    //     required: 'Debe seleccionar al menos un área',
                                    //     validate: (value) => value.length > 0 || 'Debe seleccionar al menos un área'
                                    // }}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.area}>
                                            <InputLabel>Sedes *</InputLabel>
                                            <Select
                                                {...field}
                                                input={<OutlinedInput label="Sedes *" />}
                                            >
                                                {sedes?.map((sede) => (
                                                    <MenuItem key={sede._id} value={sede._id}>{sede.nombre}</MenuItem>
                                                ))}
                                            </Select>
                                            {errors.area && (
                                                <FormHelperText>{errors.area.message}</FormHelperText>
                                            )}
                                        </FormControl>
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="photo"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="URL de Foto (opcional)"
                                            placeholder="https://ejemplo.com/foto.jpg"
                                            helperText="Ingrese la URL de la foto de perfil"
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="active"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={field.value}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                />
                                            }
                                            label="Usuario Activo"
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button onClick={handleCloseDialog} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            startIcon={loading && <CircularProgress size={20} />}
                        >
                            {dialogMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Dialog de Confirmación de Eliminación */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Delete color="error" />
                        <Typography variant="h6">Confirmar Eliminación</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Está seguro que desea eliminar al usuario{' '}
                        <strong>{userToDelete ? getNombreCompleto(userToDelete) : ''}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleCloseDeleteDialog} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDeleteUser}
                        variant="contained"
                        color="error"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};