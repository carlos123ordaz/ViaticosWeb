import React, { useState, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Stack,
    Avatar,
    Chip,
    LinearProgress,
    IconButton,
    Button,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Collapse,
    Badge,
} from '@mui/material';
import {
    TrendingUp,
    Receipt,
    Business,
    AttachMoney,
    People,
    AccessTime,
    ArrowForward,
    ShoppingCart,
    FilterList,
    Refresh,
    Download,
    ExpandMore,
    ExpandLess,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface Usuario {
    _id: string;
    nombre: string;
    rol: string;
    email: string;
}

interface Gira {
    _id: string;
    title: string;
    task: string;
    usuario: Usuario;
}

interface FiltrosDashboard {
    usuario_id: string;
    gira_id: string;
    fecha_inicio: string;
    fecha_fin: string;
    tipo_gasto: string;
    estado: string;
}

// Datos de ejemplo - Usuarios
const usuarios: Usuario[] = [
    { _id: 'u1', nombre: 'Juan Pérez', rol: 'Gerente de Ventas', email: 'juan.perez@empresa.com' },
    { _id: 'u2', nombre: 'María García', rol: 'Auditora', email: 'maria.garcia@empresa.com' },
    { _id: 'u3', nombre: 'Carlos Rodríguez', rol: 'Jefe de RRHH', email: 'carlos.rodriguez@empresa.com' },
    { _id: 'u4', nombre: 'Ana López', rol: 'Supervisora', email: 'ana.lopez@empresa.com' },
    { _id: 'u5', nombre: 'Pedro Martínez', rol: 'Coordinador', email: 'pedro.martinez@empresa.com' },
];

// Datos de ejemplo - Giras
const giras: Gira[] = [
    { _id: 'g1', task: 'TASK-001', title: 'Visita Cliente Lima', usuario: usuarios[0] },
    { _id: 'g2', task: 'TASK-002', title: 'Auditoría Arequipa', usuario: usuarios[1] },
    { _id: 'g3', task: 'TASK-003', title: 'Capacitación Cusco', usuario: usuarios[2] },
    { _id: 'g4', task: 'TASK-004', title: 'Reunión Comercial Trujillo', usuario: usuarios[0] },
    { _id: 'g5', task: 'TASK-005', title: 'Inspección Chiclayo', usuario: usuarios[3] },
];

// Estadísticas generales (sin filtrar)
const statsGenerales = {
    totalUsuariosActivos: 5,
    totalGirasActivas: 8,
    totalGastosRegistrados: 127,
    montoTotalPEN: 45230.50,
    montoTotalUSD: 8420.00,
    gastosPendientesAprobacion: 12,
    presupuestoTotalMes: 75000,
};

// Gastos por categoría
const gastosPorCategoria = [
    { name: 'Alimentación', value: 8250, color: '#1976d2' },
    { name: 'Transporte', value: 6100, color: '#dc004e' },
    { name: 'Hospedaje', value: 12200, color: '#9c27b0' },
    { name: 'Materiales', value: 7900, color: '#ff9800' },
    { name: 'Combustible', value: 5200, color: '#4caf50' },
    { name: 'Otros', value: 5580, color: '#757575' },
];

// Tendencia mensual
const tendenciaMensual = [
    { mes: 'Ene', viaticos: 8500, compras: 4200 },
    { mes: 'Feb', viaticos: 9200, compras: 5100 },
    { mes: 'Mar', viaticos: 8800, compras: 4800 },
    { mes: 'Abr', viaticos: 10500, compras: 6200 },
    { mes: 'May', viaticos: 11200, compras: 5800 },
    { mes: 'Jun', viaticos: 12450, compras: 7230 },
];

// Comparativa por tipo
const comparativaTipos = [
    { tipo: 'Viáticos', cantidad: 82, porcentaje: 64.6, monto: 32450.50 },
    { tipo: 'Compras', cantidad: 45, porcentaje: 35.4, monto: 21200.00 },
];



const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [showFilters, setShowFilters] = useState(true);

    // Estados de filtros
    const [filtros, setFiltros] = useState<FiltrosDashboard>({
        usuario_id: 'todos',
        gira_id: 'todas',
        fecha_inicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        fecha_fin: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
        tipo_gasto: 'todos',
        estado: 'todos',
    });

    // Calcular estadísticas basadas en filtros (simulado)
    const estadisticasFiltradas = useMemo(() => {
        // Aquí aplicarías los filtros a tus datos reales
        // Por ahora mostramos datos de ejemplo
        let factor = 1;
        if (filtros.usuario_id !== 'todos') factor = 0.3;
        if (filtros.gira_id !== 'todas') factor *= 0.5;

        return {
            gastos: Math.round(statsGenerales.totalGastosRegistrados * factor),
            montoPEN: statsGenerales.montoTotalPEN * factor,
            montoUSD: statsGenerales.montoTotalUSD * factor,
            giras: Math.round(statsGenerales.totalGirasActivas * factor),
            pendientes: Math.round(statsGenerales.gastosPendientesAprobacion * factor),
        };
    }, [filtros]);

    const handleFiltroChange = (campo: keyof FiltrosDashboard, valor: string) => {
        setFiltros({ ...filtros, [campo]: valor });
    };

    const formatCurrency = (amount: number, currency: string = 'PEN') => {
        const symbol = currency === 'USD' ? '$' : 'S/';
        return `${symbol} ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
    };

    const getInitials = (nombre: string) => {
        return nombre
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="end" alignItems="center" sx={{ mb: 1 }}>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={() => window.location.reload()}
                    >
                        Actualizar
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                    >
                        Exportar
                    </Button>
                </Stack>
            </Stack>
            <Card elevation={0} sx={{ mb: 2 }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Usuario</InputLabel>
                                <Select
                                    value={filtros.usuario_id}
                                    label="Usuario"
                                    onChange={(e) => handleFiltroChange('usuario_id', e.target.value)}
                                >
                                    <MenuItem value="todos">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <People fontSize="small" />
                                            <Typography>Todos los usuarios</Typography>
                                        </Stack>
                                    </MenuItem>
                                    {usuarios.map((usuario) => (
                                        <MenuItem key={usuario._id} value={usuario._id}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Avatar
                                                    sx={{
                                                        width: 24,
                                                        height: 24,
                                                        fontSize: '0.75rem',
                                                        bgcolor: 'primary.main',
                                                    }}
                                                >
                                                    {getInitials(usuario.nombre)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2">{usuario.nombre}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {usuario.rol}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Filtro por Gira */}
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Gira</InputLabel>
                                <Select
                                    value={filtros.gira_id}
                                    label="Gira"
                                    onChange={(e) => handleFiltroChange('gira_id', e.target.value)}
                                >
                                    <MenuItem value="todas">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Business fontSize="small" />
                                            <Typography>Todas las giras</Typography>
                                        </Stack>
                                    </MenuItem>
                                    {giras.map((gira) => (
                                        <MenuItem key={gira._id} value={gira._id}>
                                            <Box>
                                                <Typography variant="body2" fontFamily="monospace">
                                                    {gira.task}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {gira.title}
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Tipo de Gasto</InputLabel>
                                <Select
                                    value={filtros.tipo_gasto}
                                    label="Tipo de Gasto"
                                    onChange={(e) => handleFiltroChange('tipo_gasto', e.target.value)}
                                >
                                    <MenuItem value="todos">Todos</MenuItem>
                                    <MenuItem value="viatico">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Receipt fontSize="small" />
                                            <Typography>Viáticos</Typography>
                                        </Stack>
                                    </MenuItem>
                                    <MenuItem value="compra">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <ShoppingCart fontSize="small" />
                                            <Typography>Compras</Typography>
                                        </Stack>
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Filtro por Estado */}
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    value={filtros.estado}
                                    label="Estado"
                                    onChange={(e) => handleFiltroChange('estado', e.target.value)}
                                >
                                    <MenuItem value="todos">Todos</MenuItem>
                                    <MenuItem value="aprobado">Aprobados</MenuItem>
                                    <MenuItem value="pendiente">Pendientes</MenuItem>
                                    <MenuItem value="rechazado">Rechazados</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Fecha Inicio */}
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="Desde"
                                value={filtros.fecha_inicio}
                                onChange={(e) => handleFiltroChange('fecha_inicio', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="Hasta"
                                value={filtros.fecha_fin}
                                onChange={(e) => handleFiltroChange('fecha_fin', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>

                </CardContent>
            </Card>
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Total Gastos */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ height: '100%', borderLeft: 4, borderColor: 'primary.main' }}>
                        <CardContent>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box>
                                        <Typography color="text.secondary" variant="body2" gutterBottom>
                                            Total Gastos
                                        </Typography>
                                        <Typography variant="h3" fontWeight={700}>
                                            {estadisticasFiltradas.gastos}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Registros en el período
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                                        <Receipt sx={{ fontSize: 32 }} />
                                    </Avatar>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Monto Soles */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ height: '100%', borderLeft: 4, borderColor: 'success.main' }}>
                        <CardContent>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box>
                                        <Typography color="text.secondary" variant="body2" gutterBottom>
                                            Total en Soles
                                        </Typography>
                                        <Typography variant="h3" fontWeight={700}>
                                            {formatCurrency(estadisticasFiltradas.montoPEN)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            PEN acumulado
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                                        <AttachMoney sx={{ fontSize: 32 }} />
                                    </Avatar>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Monto Dólares */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ height: '100%', borderLeft: 4, borderColor: 'info.main' }}>
                        <CardContent>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box>
                                        <Typography color="text.secondary" variant="body2" gutterBottom>
                                            Total en Dólares
                                        </Typography>
                                        <Typography variant="h3" fontWeight={700}>
                                            {formatCurrency(estadisticasFiltradas.montoUSD, 'USD')}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            USD acumulado
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                                        <TrendingUp sx={{ fontSize: 32 }} />
                                    </Avatar>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Pendientes de Aprobación */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ height: '100%', borderLeft: 4, borderColor: 'warning.main' }}>
                        <CardContent>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box>
                                        <Typography color="text.secondary" variant="body2" gutterBottom>
                                            Pendientes
                                        </Typography>
                                        <Typography variant="h3" fontWeight={700}>
                                            {estadisticasFiltradas.pendientes}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Requieren aprobación
                                        </Typography>
                                    </Box>
                                    <Badge badgeContent={estadisticasFiltradas.pendientes} color="warning">
                                        <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                                            <AccessTime sx={{ fontSize: 32 }} />
                                        </Avatar>
                                    </Badge>
                                </Stack>
                                <Button
                                    size="small"
                                    endIcon={<ArrowForward />}
                                    onClick={() => navigate('/gastos/aprobar')}
                                    sx={{ alignSelf: 'flex-start' }}
                                >
                                    Revisar
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>


            {/* Gráficos */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Gastos por Categoría */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card elevation={0} sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Gastos por Categoría
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Distribución según filtros aplicados
                            </Typography>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={gastosPorCategoria}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {gastosPorCategoria.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        contentStyle={{ borderRadius: 8 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <Stack spacing={1} sx={{ mt: 2 }}>
                                {gastosPorCategoria.map((item, index) => (
                                    <Stack
                                        key={index}
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                    >
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Box
                                                sx={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    bgcolor: item.color,
                                                }}
                                            />
                                            <Typography variant="body2">{item.name}</Typography>
                                        </Stack>
                                        <Typography variant="body2" fontWeight={600}>
                                            {formatCurrency(item.value)}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Tendencia Mensual */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card elevation={0} sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Tendencia Mensual
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Viáticos vs Compras - Últimos 6 meses
                            </Typography>
                            <ResponsiveContainer width="100%" height={500}>
                                <BarChart data={tendenciaMensual}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="mes" stroke="#666" />
                                    <YAxis stroke="#666" />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        contentStyle={{ borderRadius: 8 }}
                                    />
                                    <Legend />
                                    <Bar dataKey="viaticos" fill="#1976d2" name="Viáticos" radius={[8, 8, 0, 0]} />
                                    <Bar dataKey="compras" fill="#dc004e" name="Compras" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Card elevation={0}>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        Comparativa: Viáticos vs Compras
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Análisis del período seleccionado
                    </Typography>
                    <Grid container spacing={3}>
                        {comparativaTipos.map((tipo, index) => (
                            <Grid size={{ xs: 12, md: 6 }} key={index}>
                                <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                                    <Stack spacing={2}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar
                                                    sx={{
                                                        bgcolor: tipo.tipo === 'Viáticos' ? 'primary.main' : 'secondary.main',
                                                        width: 48,
                                                        height: 48,
                                                    }}
                                                >
                                                    {tipo.tipo === 'Viáticos' ? (
                                                        <Receipt sx={{ fontSize: 28 }} />
                                                    ) : (
                                                        <ShoppingCart sx={{ fontSize: 28 }} />
                                                    )}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6" fontWeight={600}>
                                                        {tipo.tipo}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {tipo.cantidad} registros
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                            <Typography variant="h5" fontWeight={700} color="primary">
                                                {tipo.porcentaje}%
                                            </Typography>
                                        </Stack>
                                        <LinearProgress
                                            variant="determinate"
                                            value={tipo.porcentaje}
                                            sx={{
                                                height: 10,
                                                borderRadius: 1,
                                                bgcolor: 'grey.200',
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: 1,
                                                    bgcolor: tipo.tipo === 'Viáticos' ? 'primary.main' : 'secondary.main',
                                                },
                                            }}
                                        />
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">
                                                Monto total
                                            </Typography>
                                            <Typography variant="body1" fontWeight={600}>
                                                {formatCurrency(tipo.monto)}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
};

export default DashboardPage;