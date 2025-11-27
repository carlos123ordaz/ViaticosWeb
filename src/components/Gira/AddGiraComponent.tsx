import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormHelperText,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    FormControlLabel,
    Switch,
    Avatar,
    Autocomplete,
    CircularProgress,
    Typography,
    Alert,
} from '@mui/material';
import axios from 'axios';

interface Usuario {
    _id: string;
    photo?: string;
    nombre: string;
    apellido?: string;
    dni?: string;
    cargo?: string;
    celular?: string;
    correo?: string;
    password?: string;
    active?: boolean;
}

interface FormData {
    task: string;
    usuario: string;
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
}

const unidadesNegocio = ['Ventas', 'Auditoría', 'Recursos Humanos', 'Operaciones', 'Marketing', 'TI'];
const estadosGira = ['Pendiente', 'En Proceso', 'Completada', 'Cancelada'];
const API_URL = 'http://localhost:4000/api';

interface AddGiraComponentProps {
    openDialog: boolean;
    handleCloseDialog: () => void;
    editingGira?: any;
    onSuccess?: () => void;
}

export const AddGiraComponent: React.FC<AddGiraComponentProps> = ({
    openDialog,
    handleCloseDialog,
    editingGira,
    onSuccess
}) => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch
    } = useForm<FormData>({
        defaultValues: {
            task: '',
            usuario: '',
            motivo: '',
            comentario: '',
            semana: '',
            unidad_negocio: '',
            task_gira: '',
            active: true,
            estado: 'Pendiente',
            lugar: '',
            fecha_inicio: '',
            fecha_fin: '',
            monto_soles: 0,
            monto_dolares: 0,
        },
    });

    const fechaInicio = watch('fecha_inicio');

    const getUsuarios = async () => {
        setLoadingUsuarios(true);
        try {
            const res = await axios.get(`${API_URL}/usuarios`);
            setUsuarios(res.data);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            setError('Error al cargar la lista de usuarios');
        } finally {
            setLoadingUsuarios(false);
        }
    };

    useEffect(() => {
        if (openDialog) {
            getUsuarios();
        }
    }, [openDialog]);

    useEffect(() => {
        if (editingGira) {
            setValue('task', editingGira.task || '');
            setValue('usuario', editingGira.usuario?._id || '');
            setValue('motivo', editingGira.motivo || '');
            setValue('comentario', editingGira.comentario || '');
            setValue('semana', editingGira.semana || '');
            setValue('unidad_negocio', editingGira.unidad_negocio || '');
            setValue('task_gira', editingGira.task_gira || '');
            setValue('active', editingGira.active ?? true);
            setValue('estado', editingGira.estado || 'Pendiente');
            setValue('lugar', editingGira.lugar || '');
            setValue('monto_soles', editingGira.monto_soles || 0);
            setValue('monto_dolares', editingGira.monto_dolares || 0);

            // Convertir fechas de ISO a formato datetime-local
            if (editingGira.fecha_inicio) {
                const fechaInicioFormatted = new Date(editingGira.fecha_inicio).toISOString().slice(0, 16);
                setValue('fecha_inicio', fechaInicioFormatted);
            }
            if (editingGira.fecha_fin) {
                const fechaFinFormatted = new Date(editingGira.fecha_fin).toISOString().slice(0, 16);
                setValue('fecha_fin', fechaFinFormatted);
            }
        } else {
            reset();
        }
    }, [editingGira, setValue, reset]);

    const getNombreCompleto = (usuario: Usuario) => {
        return `${usuario.nombre} ${usuario.apellido || ''}`.trim();
    };

    const getInitials = (usuario: Usuario) => {
        const name = usuario.nombre?.[0] || '';
        const lastName = usuario.apellido?.[0] || '';
        return `${name}${lastName}`.toUpperCase();
    };

    const filteredUsuarios = usuarios.filter(u =>
        getNombreCompleto(u).toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const onSubmit = async (data: FormData) => {
        setSubmitting(true);
        setError(null);

        try {
            const dataToSend = {
                ...data,
                fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio).toISOString() : undefined,
                fecha_fin: data.fecha_fin ? new Date(data.fecha_fin).toISOString() : undefined,
            };

            if (editingGira) {
                await axios.put(`${API_URL}/giras/${editingGira._id}`, dataToSend);
            } else {
                await axios.post(`${API_URL}/giras`, dataToSend);
            }

            reset();
            onSuccess?.();
            handleCloseDialog();
        } catch (error: any) {
            console.error('Error al guardar:', error);
            setError(error.response?.data?.message || 'Error al guardar la gira');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            reset();
            setError(null);
            handleCloseDialog();
        }
    };

    return (
        <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>
                    {editingGira ? 'Editar Gira' : 'Nueva Gira de Trabajo'}
                </DialogTitle>
                <DialogContent dividers>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        {/* Task ID */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="task"
                                control={control}
                                rules={{ required: 'El Task ID es requerido' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Task ID"
                                        error={!!errors.task}
                                        helperText={errors.task?.message}
                                        disabled={submitting}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Semana */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="semana"
                                control={control}
                                rules={{ required: 'La semana es requerida' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Semana"
                                        type="week"
                                        error={!!errors.semana}
                                        helperText={errors.semana?.message}
                                        InputLabelProps={{ shrink: true }}
                                        disabled={submitting}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Usuario Asignado */}
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="usuario"
                                control={control}
                                rules={{ required: 'Debe seleccionar un usuario' }}
                                render={({ field: { onChange, value, ...field } }) => (
                                    <Autocomplete
                                        {...field}
                                        options={filteredUsuarios}
                                        loading={loadingUsuarios}
                                        getOptionLabel={(option) => getNombreCompleto(option)}
                                        value={usuarios.find((u) => u._id === value) || null}
                                        onChange={(_, newValue) => {
                                            onChange(newValue ? newValue._id : '');
                                        }}
                                        onInputChange={(_, newInputValue) => {
                                            setSearchTerm(newInputValue);
                                        }}
                                        disabled={submitting}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Usuario Asignado"
                                                error={!!errors.usuario}
                                                helperText={errors.usuario?.message}
                                                placeholder="Buscar por nombre o apellido..."
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {loadingUsuarios ? (
                                                                <CircularProgress color="inherit" size={20} />
                                                            ) : null}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props} key={option._id}>
                                                <Stack direction="row" spacing={2} alignItems="center" width="100%">
                                                    <Avatar
                                                        src={option.photo}
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
                                                            bgcolor: 'primary.main',
                                                            fontSize: '0.875rem',
                                                        }}
                                                    >
                                                        {getInitials(option)}
                                                    </Avatar>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {getNombreCompleto(option)}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {option.cargo || 'Sin cargo'} • {option.correo || 'Sin email'}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </li>
                                        )}
                                        noOptionsText={
                                            loadingUsuarios
                                                ? "Buscando..."
                                                : searchTerm
                                                    ? "No se encontraron usuarios"
                                                    : "Escribe para buscar usuarios"
                                        }
                                        isOptionEqualToValue={(option, value) => option._id === value._id}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Unidad de Negocio */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="unidad_negocio"
                                control={control}
                                rules={{ required: 'La unidad de negocio es requerida' }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.unidad_negocio}>
                                        <InputLabel>Unidad de Negocio *</InputLabel>
                                        <Select {...field} label="Unidad de Negocio *" disabled={submitting}>
                                            {unidadesNegocio.map((unidad) => (
                                                <MenuItem key={unidad} value={unidad}>
                                                    {unidad}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.unidad_negocio && (
                                            <FormHelperText>{errors.unidad_negocio.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        {/* Estado */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="estado"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth>
                                        <InputLabel>Estado</InputLabel>
                                        <Select {...field} label="Estado" disabled={submitting}>
                                            {estadosGira.map((estado) => (
                                                <MenuItem key={estado} value={estado}>
                                                    {estado}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        {/* Lugar */}
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="lugar"
                                control={control}
                                rules={{ required: 'El lugar es requerido' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Lugar"
                                        error={!!errors.lugar}
                                        helperText={errors.lugar?.message}
                                        disabled={submitting}
                                        placeholder="Ej: Lima, Cusco, Arequipa..."
                                    />
                                )}
                            />
                        </Grid>

                        {/* Fecha de Inicio */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="fecha_inicio"
                                control={control}
                                rules={{ required: 'La fecha de inicio es requerida' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Fecha de Inicio"
                                        type="datetime-local"
                                        error={!!errors.fecha_inicio}
                                        helperText={errors.fecha_inicio?.message}
                                        InputLabelProps={{ shrink: true }}
                                        disabled={submitting}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Fecha de Fin */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="fecha_fin"
                                control={control}
                                rules={{
                                    required: 'La fecha de fin es requerida',
                                    validate: (value) => {
                                        if (fechaInicio && value) {
                                            return new Date(value) > new Date(fechaInicio) ||
                                                'La fecha de fin debe ser posterior a la fecha de inicio';
                                        }
                                        return true;
                                    }
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Fecha de Fin"
                                        type="datetime-local"
                                        error={!!errors.fecha_fin}
                                        helperText={errors.fecha_fin?.message}
                                        InputLabelProps={{ shrink: true }}
                                        disabled={submitting}
                                        inputProps={{
                                            min: fechaInicio || undefined
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Monto en Soles */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="monto_soles"
                                control={control}
                                rules={{
                                    min: { value: 0, message: 'El monto no puede ser negativo' },
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Monto Asignado (Soles)"
                                        type="number"
                                        error={!!errors.monto_soles}
                                        helperText={errors.monto_soles?.message}
                                        disabled={submitting}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">S/</InputAdornment>,
                                        }}
                                        inputProps={{ step: "0.01", min: "0" }}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Monto en Dólares */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Controller
                                name="monto_dolares"
                                control={control}
                                rules={{
                                    min: { value: 0, message: 'El monto no puede ser negativo' },
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Monto Asignado (Dólares)"
                                        type="number"
                                        error={!!errors.monto_dolares}
                                        helperText={errors.monto_dolares?.message}
                                        disabled={submitting}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                        }}
                                        inputProps={{ step: "0.01", min: "0" }}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Task de Gira */}
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="task_gira"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Task de Gira"
                                        disabled={submitting}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Motivo */}
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="motivo"
                                control={control}
                                rules={{ required: 'El motivo es requerido' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Motivo"
                                        multiline
                                        rows={2}
                                        error={!!errors.motivo}
                                        helperText={errors.motivo?.message}
                                        disabled={submitting}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Comentario */}
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="comentario"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Comentario"
                                        multiline
                                        rows={3}
                                        disabled={submitting}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Activa */}
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="active"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={field.value}
                                                onChange={field.onChange}
                                                disabled={submitting}
                                            />
                                        }
                                        label="Gira Activa"
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleClose} disabled={submitting}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                        startIcon={submitting ? <CircularProgress size={20} /> : null}
                    >
                        {submitting ? 'Guardando...' : (editingGira ? 'Actualizar' : 'Crear')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};