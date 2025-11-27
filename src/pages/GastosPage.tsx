import React, { useState, useMemo, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
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
    Divider,
    Paper,
    Alert,
    Badge,
    DialogActions,
} from '@mui/material';
import {
    Search,
    FilterList,
    Visibility,
    Receipt,
    ShoppingCart,
    AttachMoney,
    TrendingUp,
    Warning,
    CheckCircle,
    Image as ImageIcon,
    Close,
    FileDownload,
    CalendarToday,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from 'axios';
import { useParams } from 'react-router-dom';

// Tipos
interface ItemGasto {
    descripcion: string;
    unidad_medida: string;
    precio_unitario: number;
    cantidad: number;
    subtotal: number;
}

interface Gasto {
    _id: string;
    tipo: 'viatico' | 'compra';
    categoria: string;
    ruc: string;
    razon_social: string;
    fecha_emision: string;
    total: number;
    moneda: 'PEN' | 'USD';
    igv: number;
    descuento: number;
    detraccion: number;
    modificado: boolean;
    img_url: string;
    con_sustento: boolean;
    detalle_sustento: string;
    descripcion: string;
    direccion: string;
    items: ItemGasto[];
    gira: {
        _id: string;
        title: string;
        task: string;
    };
    createdAt: string;
    updatedAt: string;
}

const categorias = [
    'Alimentación',
    'Transporte',
    'Hospedaje',
    'Otros'
];
const API_URL = 'http://localhost:4000/api/gastos'
export const GastosPage: React.FC = () => {
    const [gastos, setGastos] = useState<Gasto[]>([]);
    const [page, setPage] = useState(0);
    const { giraId } = useParams();
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipo, setFilterTipo] = useState<string>('Todos');
    const [filterCategoria, setFilterCategoria] = useState<string>('Todos');
    const [filterMoneda, setFilterMoneda] = useState<string>('Todos');
    const [filterGira, setFilterGira] = useState<string>('Todos');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedGasto, setSelectedGasto] = useState<Gasto | null>(null);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);

    const getGastos = () => {
        axios.get(`${API_URL}/gira/${giraId}`)
            .then(res => {
                setGastos(res.data);
            })
            .catch(error => {
                console.log(error);
                alert('Error on server');
            })
    }
    useEffect(() => {
        getGastos();
    }, [])
    const giras = useMemo(() => {
        const girasMap = new Map();
        gastos.forEach(g => {
            if (!girasMap.has(g.gira._id)) {
                girasMap.set(g.gira._id, g.gira);
            }
        });
        return Array.from(girasMap.values());
    }, [gastos]);

    // Filtrado y búsqueda
    const filteredGastos = useMemo(() => {
        return gastos.filter((gasto) => {
            const matchesSearch =
                gasto.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
                gasto.ruc.includes(searchTerm) ||
                gasto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                gasto.gira.title.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesTipo = filterTipo === 'Todos' || gasto.tipo === filterTipo;
            const matchesCategoria = filterCategoria === 'Todos' || gasto.categoria === filterCategoria;
            const matchesMoneda = filterMoneda === 'Todos' || gasto.moneda === filterMoneda;
            const matchesGira = filterGira === 'Todos' || gasto.gira._id === filterGira;

            return matchesSearch && matchesTipo && matchesCategoria && matchesMoneda && matchesGira;
        });
    }, [gastos, searchTerm, filterTipo, filterCategoria, filterMoneda, filterGira]);

    // Estadísticas
    const stats = useMemo(() => {
        const totalGastos = gastos.length;
        const viaticos = gastos.filter(g => g.tipo === 'viatico').length;
        const compras = gastos.filter(g => g.tipo === 'compra').length;

        const totalPEN = gastos
            .filter(g => g.moneda === 'PEN')
            .reduce((sum, g) => sum + g.total, 0);

        const totalUSD = gastos
            .filter(g => g.moneda === 'USD')
            .reduce((sum, g) => sum + g.total, 0);

        const sinSustento = gastos.filter(g => !g.con_sustento).length;
        const modificados = gastos.filter(g => g.modificado).length;

        return { totalGastos, viaticos, compras, totalPEN, totalUSD, sinSustento, modificados };
    }, [gastos]);

    const getTipoColor = (tipo: string) => {
        return tipo === 'viatico' ? 'primary' : 'secondary';
    };

    const getTipoIcon = (tipo: string) => {
        return tipo === 'viatico' ? <Receipt /> : <ShoppingCart />;
    };

    const formatCurrency = (amount: number, currency: string) => {
        const symbol = currency === 'USD' ? '$' : 'S/';
        if (!amount || amount === 0) return '0.00'
        return `${symbol} ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleViewDetails = (gasto: Gasto) => {
        setSelectedGasto(gasto);
    };

    const handleCloseDetails = () => {
        setSelectedGasto(null);
    };

    const handleViewImage = (gasto: Gasto) => {
        setSelectedGasto(gasto);
        setImageDialogOpen(true);
    };

    const handleCloseImage = () => {
        setImageDialogOpen(false);
    };
    const getTipo = {
        compra: 'Compra',
        viatico: 'Viático'
    }
    const getCategoria: Record<string, string> = {
        alimentacion: 'Alimentación',
        movilidad: 'Transporte',
        hospedaje: 'Hospedaje',
        otros: 'Otros'
    };
    return (
        <Box>
            <Alert severity="info" sx={{ mb: 3 }} icon={<Receipt />}>
                Los gastos se registran desde la aplicación móvil. Esta vista es solo para consulta y seguimiento.
            </Alert>
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ borderLeft: 4, borderColor: 'primary.main' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography color="text.secondary" variant="body2" gutterBottom>
                                        Total Gastos
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.totalGastos}
                                    </Typography>
                                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                        <Chip label={`Viáticos: ${stats.viaticos}`} size="small" color="primary" variant="outlined" />
                                        <Chip label={`Compras: ${stats.compras}`} size="small" color="secondary" variant="outlined" />
                                    </Stack>
                                </Box>
                                <Receipt sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
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
                                        Total Soles
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        S/ {stats.totalPEN.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                    </Typography>
                                </Box>
                                <AttachMoney sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
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
                                        Total Dólares
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        $ {stats.totalUSD.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                    </Typography>
                                </Box>
                                <TrendingUp sx={{ fontSize: 48, color: 'info.main', opacity: 0.3 }} />
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
                                        Requieren Atención
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stats.sinSustento}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Sin sustento: {stats.sinSustento} | Modificados: {stats.modificados}
                                    </Typography>
                                </Box>
                                <Warning sx={{ fontSize: 48, color: 'warning.main', opacity: 0.3 }} />
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
                                placeholder="Buscar por razón social, RUC, descripción o gira..."
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
                                startIcon={<FileDownload />}
                            >
                                Exportar
                            </Button>
                        </Stack>

                        {showFilters && (
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <FormControl size="small" fullWidth>
                                        <InputLabel>Tipo</InputLabel>
                                        <Select
                                            value={filterTipo}
                                            label="Tipo"
                                            onChange={(e) => setFilterTipo(e.target.value)}
                                        >
                                            <MenuItem value="Todos">Todos</MenuItem>
                                            <MenuItem value="Viático">Viático</MenuItem>
                                            <MenuItem value="Compra">Compra</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <FormControl size="small" fullWidth>
                                        <InputLabel>Categoría</InputLabel>
                                        <Select
                                            value={filterCategoria}
                                            label="Categoría"
                                            onChange={(e) => setFilterCategoria(e.target.value)}
                                        >
                                            <MenuItem value="Todos">Todos</MenuItem>
                                            {categorias.map((cat) => (
                                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <FormControl size="small" fullWidth>
                                        <InputLabel>Moneda</InputLabel>
                                        <Select
                                            value={filterMoneda}
                                            label="Moneda"
                                            onChange={(e) => setFilterMoneda(e.target.value)}
                                        >
                                            <MenuItem value="Todos">Todas</MenuItem>
                                            <MenuItem value="PEN">Soles (PEN)</MenuItem>
                                            <MenuItem value="USD">Dólares (USD)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <FormControl size="small" fullWidth>
                                        <InputLabel>Gira</InputLabel>
                                        <Select
                                            value={filterGira}
                                            label="Gira"
                                            onChange={(e) => setFilterGira(e.target.value)}
                                        >
                                            <MenuItem value="Todos">Todas</MenuItem>
                                            {giras.map((gira) => (
                                                <MenuItem key={gira._id} value={gira._id}>
                                                    {gira.task} - {gira.title}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            {/* Tabla de Gastos */}
            <Card elevation={0}>
                {filteredGastos.length === 0 ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 8,
                            px: 2
                        }}
                    >
                        <Receipt sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No se encontraron gastos
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            {searchTerm || filterTipo !== 'Todos' || filterCategoria !== 'Todos' || filterMoneda !== 'Todos' || filterGira !== 'Todos'
                                ? 'No hay gastos que coincidan con los filtros aplicados. Intenta ajustar los criterios de búsqueda.'
                                : 'Aún no hay gastos registrados para esta gira. Los gastos se registran desde la aplicación móvil.'}
                        </Typography>
                        {(searchTerm || filterTipo !== 'Todos' || filterCategoria !== 'Todos' || filterMoneda !== 'Todos' || filterGira !== 'Todos') && (
                            <Button
                                variant="outlined"
                                sx={{ mt: 3 }}
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterTipo('Todos');
                                    setFilterCategoria('Todos');
                                    setFilterMoneda('Todos');
                                    setFilterGira('Todos');
                                }}
                            >
                                Limpiar filtros
                            </Button>
                        )}
                    </Box>
                ) : (
                    <>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                                        <TableCell><strong>Fecha</strong></TableCell>
                                        <TableCell><strong>Tipo</strong></TableCell>
                                        <TableCell><strong>Descripción</strong></TableCell>

                                        <TableCell><strong>Proveedor</strong></TableCell>
                                        <TableCell><strong>Categoría</strong></TableCell>
                                        <TableCell align="right"><strong>Monto</strong></TableCell>
                                        <TableCell><strong>Estado</strong></TableCell>
                                        <TableCell align="center"><strong>Acciones</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredGastos
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((gasto) => (
                                            <TableRow key={gasto._id} hover>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <CalendarToday fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            {format(new Date(gasto.fecha_emision), 'dd/MM/yyyy', { locale: es })}
                                                        </Typography>
                                                    </Stack>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {format(new Date(gasto.fecha_emision), 'HH:mm', { locale: es })}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={getTipoIcon(gasto.tipo)}
                                                        label={getTipo[gasto.tipo]}
                                                        color={getTipoColor(gasto.tipo)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {gasto.descripcion}
                                                    </Typography>
                                                    {gasto.direccion && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {gasto.direccion}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {gasto.razon_social}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        RUC: {gasto.ruc}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={getCategoria[gasto.categoria]} size="small" variant="outlined" />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {formatCurrency(gasto.total, gasto.moneda)}
                                                    </Typography>
                                                    {gasto.igv > 0 && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            IGV: {formatCurrency(gasto.igv, gasto.moneda)}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Stack spacing={0.5}>
                                                        {gasto.con_sustento ? (
                                                            <Chip
                                                                icon={<CheckCircle />}
                                                                label="Con sustento"
                                                                size="small"
                                                                color="success"
                                                                variant="outlined"
                                                            />
                                                        ) : (
                                                            <Chip
                                                                icon={<Warning />}
                                                                label="Sin sustento"
                                                                size="small"
                                                                color="warning"
                                                            />
                                                        )}
                                                        {gasto.modificado && (
                                                            <Chip
                                                                label="Modificado"
                                                                size="small"
                                                                color="info"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Stack direction="row" spacing={1} justifyContent="center">
                                                        <Tooltip title="Ver detalles">
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => handleViewDetails(gasto)}
                                                            >
                                                                <Visibility fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            component="div"
                            count={filteredGastos.length}
                            page={page}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            labelRowsPerPage="Filas por página:"
                        />
                    </>
                )}
            </Card>

            <Dialog
                open={!!selectedGasto && !imageDialogOpen}
                onClose={handleCloseDetails}
                maxWidth="lg"
                fullWidth
            >
                {selectedGasto && (
                    <>
                        <DialogTitle>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ bgcolor: getTipoColor(selectedGasto.tipo) + '.main' }}>
                                        {getTipoIcon(selectedGasto.tipo)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6">Detalle del Gasto</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            ID: {selectedGasto._id}
                                        </Typography>
                                    </Box>
                                </Stack>
                                <IconButton onClick={handleCloseDetails}>
                                    <Close />
                                </IconButton>
                            </Stack>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container spacing={3}>
                                {/* Columna izquierda: Imagen del comprobante */}
                                <Grid size={{ xs: 12, md: 5 }}>
                                    <Paper
                                        elevation={3}
                                        sx={{
                                            p: 2,
                                            bgcolor: 'grey.50',
                                            position: 'sticky',
                                            top: 16,
                                            maxHeight: 'calc(100vh - 300px)',
                                            overflow: 'auto'
                                        }}
                                    >
                                        <Stack spacing={2}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <ImageIcon color="primary" />
                                                <Typography variant="subtitle2" color="primary">
                                                    COMPROBANTE
                                                </Typography>
                                            </Stack>
                                            <Divider />
                                            <Box
                                                component="img"
                                                src={selectedGasto.img_url}
                                                alt="Comprobante"
                                                sx={{
                                                    width: '100%',
                                                    height: 'auto',
                                                    borderRadius: 1,
                                                    boxShadow: 2,
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.2s',
                                                    '&:hover': {
                                                        transform: 'scale(1.02)'
                                                    }
                                                }}
                                                onClick={() => handleViewImage(selectedGasto)}
                                            />
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                startIcon={<FileDownload />}
                                                href={selectedGasto.img_url}
                                                download
                                                size="small"
                                            >
                                                Descargar Comprobante
                                            </Button>
                                            <Button
                                                fullWidth
                                                variant="text"
                                                startIcon={<Visibility />}
                                                onClick={() => handleViewImage(selectedGasto)}
                                                size="small"
                                            >
                                                Ver en pantalla completa
                                            </Button>
                                        </Stack>
                                    </Paper>
                                </Grid>

                                {/* Columna derecha: Información del gasto */}
                                <Grid size={{ xs: 12, md: 7 }}>
                                    <Stack spacing={3}>
                                        {/* Información General */}
                                        <Box>
                                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                                INFORMACIÓN GENERAL
                                            </Typography>
                                            <Divider sx={{ mb: 2 }} />
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Tipo de Gasto
                                                    </Typography>
                                                    <Box sx={{ mt: 0.5 }}>
                                                        <Chip
                                                            icon={getTipoIcon(selectedGasto.tipo)}
                                                            label={getTipo[selectedGasto.tipo]}
                                                            color={getTipoColor(selectedGasto.tipo)}
                                                            size="small"
                                                        />
                                                    </Box>
                                                </Grid>

                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Categoría
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {getCategoria[selectedGasto.categoria]}
                                                    </Typography>
                                                </Grid>

                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Fecha de Emisión
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {format(new Date(selectedGasto.fecha_emision), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                                                    </Typography>
                                                </Grid>

                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Gira Asociada
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {selectedGasto.gira.task} - {selectedGasto.gira.title}
                                                    </Typography>
                                                </Grid>

                                                <Grid size={{ xs: 12 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Descripción
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {selectedGasto.descripcion}
                                                    </Typography>
                                                </Grid>

                                                {selectedGasto.direccion && (
                                                    <Grid size={{ xs: 12 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Dirección
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {selectedGasto.direccion}
                                                        </Typography>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Box>

                                        {/* Proveedor */}
                                        <Box>
                                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                                DATOS DEL PROVEEDOR
                                            </Typography>
                                            <Divider sx={{ mb: 2 }} />
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, sm: 8 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Razón Social
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {selectedGasto.razon_social}
                                                    </Typography>
                                                </Grid>

                                                <Grid size={{ xs: 12, sm: 4 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        RUC
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={500} fontFamily="monospace">
                                                        {selectedGasto.ruc}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        {/* Montos */}
                                        <Box>
                                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                                DETALLE DE MONTOS
                                            </Typography>
                                            <Divider sx={{ mb: 2 }} />
                                            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                                <Stack spacing={1}>
                                                    <Stack direction="row" justifyContent="space-between">
                                                        <Typography variant="body2">Subtotal:</Typography>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {formatCurrency(selectedGasto.total - selectedGasto.igv, selectedGasto.moneda)}
                                                        </Typography>
                                                    </Stack>
                                                    {selectedGasto.igv > 0 && (
                                                        <Stack direction="row" justifyContent="space-between">
                                                            <Typography variant="body2">IGV (18%):</Typography>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {formatCurrency(selectedGasto.igv, selectedGasto.moneda)}
                                                            </Typography>
                                                        </Stack>
                                                    )}
                                                    {selectedGasto.descuento > 0 && (
                                                        <Stack direction="row" justifyContent="space-between">
                                                            <Typography variant="body2" color="success.main">Descuento:</Typography>
                                                            <Typography variant="body2" fontWeight={500} color="success.main">
                                                                -{formatCurrency(selectedGasto.descuento, selectedGasto.moneda)}
                                                            </Typography>
                                                        </Stack>
                                                    )}
                                                    {selectedGasto.detraccion > 0 && (
                                                        <Stack direction="row" justifyContent="space-between">
                                                            <Typography variant="body2">Detracción:</Typography>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {formatCurrency(selectedGasto.detraccion, selectedGasto.moneda)}
                                                            </Typography>
                                                        </Stack>
                                                    )}
                                                    <Divider />
                                                    <Stack direction="row" justifyContent="space-between">
                                                        <Typography variant="h6">Total:</Typography>
                                                        <Typography variant="h6" color="primary">
                                                            {formatCurrency(selectedGasto.total, selectedGasto.moneda)}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                            </Paper>
                                        </Box>

                                        {/* Items */}
                                        {selectedGasto.items && selectedGasto.items.length > 0 && (
                                            <Box>
                                                <Typography variant="subtitle2" color="primary" gutterBottom>
                                                    ITEMS DEL COMPROBANTE
                                                </Typography>
                                                <Divider sx={{ mb: 2 }} />
                                                <TableContainer component={Paper} variant="outlined">
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                                                <TableCell><strong>Descripción</strong></TableCell>
                                                                <TableCell align="right"><strong>Cant.</strong></TableCell>
                                                                <TableCell align="right"><strong>P. Unit.</strong></TableCell>
                                                                <TableCell align="right"><strong>Subtotal</strong></TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {selectedGasto.items.map((item, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell>{item.descripcion}</TableCell>
                                                                    <TableCell align="right">{item.cantidad}</TableCell>
                                                                    <TableCell align="right">
                                                                        {formatCurrency(item.precio_unitario, selectedGasto.moneda)}
                                                                    </TableCell>
                                                                    <TableCell align="right">
                                                                        <Typography fontWeight={500}>
                                                                            {formatCurrency(item.subtotal, selectedGasto.moneda)}
                                                                        </Typography>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        )}

                                        {/* Sustento */}
                                        <Box>
                                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                                SUSTENTO
                                            </Typography>
                                            <Divider sx={{ mb: 2 }} />
                                            {selectedGasto.con_sustento ? (
                                                <Paper sx={{ p: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.main' }}>
                                                    <Stack direction="row" spacing={2} alignItems="flex-start">
                                                        <CheckCircle color="success" />
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={500} color="success.dark">
                                                                Gasto con sustento documentado
                                                            </Typography>
                                                            {selectedGasto.detalle_sustento && (
                                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                                    {selectedGasto.detalle_sustento}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Stack>
                                                </Paper>
                                            ) : (
                                                <Paper sx={{ p: 2, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.main' }}>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Warning color="warning" />
                                                        <Typography variant="body2" fontWeight={500} color="warning.dark">
                                                            Este gasto no tiene sustento documentado
                                                        </Typography>
                                                    </Stack>
                                                </Paper>
                                            )}
                                        </Box>

                                        {selectedGasto.modificado && (
                                            <Alert severity="info" icon={<Warning />}>
                                                Este gasto fue modificado después de su registro inicial
                                            </Alert>
                                        )}
                                    </Stack>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, py: 2 }}>
                            <Button onClick={handleCloseDetails} variant="contained">
                                Cerrar
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Dialog de Imagen del Comprobante */}
            <Dialog
                open={imageDialogOpen}
                onClose={handleCloseImage}
                maxWidth="md"
                fullWidth
            >
                {selectedGasto && (
                    <>
                        <DialogTitle>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">Comprobante - {selectedGasto.descripcion}</Typography>
                                <IconButton onClick={handleCloseImage}>
                                    <Close />
                                </IconButton>
                            </Stack>
                        </DialogTitle>
                        <DialogContent>
                            <Box
                                component="img"
                                src={selectedGasto.img_url}
                                alt="Comprobante"
                                sx={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: 1,
                                    boxShadow: 3
                                }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button
                                startIcon={<FileDownload />}
                                href={selectedGasto.img_url}
                                download
                            >
                                Descargar
                            </Button>
                            <Button onClick={handleCloseImage}>Cerrar</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};