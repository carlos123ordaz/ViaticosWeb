// LoginPage.tsx
import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Paper,
    InputAdornment,
    IconButton,
    Alert,
    CircularProgress,
    Link,
    Divider,
    Fade,
    Slide,
    Zoom,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Login as LoginIcon,
    Person,
    Lock,
    LockOpen,
    ArrowForward,
} from '@mui/icons-material';
import axios from 'axios';

interface LoginFormData {
    email: string;
    password: string;
}

interface FormErrors {
    email?: string;
    password?: string;
}

export default function LoginPage() {
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState<string>('');
    const [focusedField, setFocusedField] = useState<string>('');

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.email) {
            newErrors.email = 'El correo electrónico es requerido';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Ingresa un correo electrónico válido';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined,
            }));
        }
        setLoginError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setLoginError('');

        try {
            const response = await axios.post('http://localhost:4000/api/auth/login', formData);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                window.location.href = '/dashboard';
            }
        } catch (error: any) {
            if (error.response?.status === 401) {
                setLoginError('Credenciales inválidas. Por favor, intenta nuevamente.');
            } else if (error.response?.status === 404) {
                setLoginError('Usuario no encontrado.');
            } else {
                setLoginError('Error de conexión. Por favor, intenta más tarde.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleTogglePassword = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '150%',
                    height: '150%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                    animation: 'moveBackground 20s linear infinite',
                },
                '@keyframes moveBackground': {
                    '0%': { transform: 'translate(0, 0)' },
                    '100%': { transform: 'translate(50px, 50px)' },
                },
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    top: '-100px',
                    right: '-100px',
                    animation: 'float 6s ease-in-out infinite',
                    '@keyframes float': {
                        '0%, 100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(20px)' },
                    },
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    bottom: '-50px',
                    left: '-50px',
                    animation: 'float 8s ease-in-out infinite',
                }}
            />

            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
                <Zoom in timeout={500}>
                    <Paper
                        elevation={24}
                        sx={{
                            padding: { xs: 4, sm: 6 },
                            borderRadius: 4,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <Slide direction="down" in timeout={700}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    mb: 4,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 3,
                                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                                        animation: 'pulse 2s ease-in-out infinite',
                                        '@keyframes pulse': {
                                            '0%, 100%': {
                                                transform: 'scale(1)',
                                                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                                            },
                                            '50%': {
                                                transform: 'scale(1.05)',
                                                boxShadow: '0 12px 32px rgba(102, 126, 234, 0.6)',
                                            },
                                        },
                                    }}
                                >
                                    {showPassword ? (
                                        <LockOpen sx={{ fontSize: 40, color: 'white' }} />
                                    ) : (
                                        <Lock sx={{ fontSize: 40, color: 'white' }} />
                                    )}
                                </Box>
                                <Typography
                                    variant="h3"
                                    component="h1"
                                    fontWeight={800}
                                    gutterBottom
                                    sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    Bienvenido
                                </Typography>
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    textAlign="center"
                                    sx={{ fontWeight: 500 }}
                                >
                                    Ingresa a tu cuenta para continuar
                                </Typography>
                            </Box>
                        </Slide>

                        <Fade in timeout={1000}>
                            <Box>
                                {loginError && (
                                    <Slide direction="down" in>
                                        <Alert
                                            severity="error"
                                            sx={{
                                                mb: 3,
                                                borderRadius: 2,
                                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                                            }}
                                        >
                                            {loginError}
                                        </Alert>
                                    </Slide>
                                )}

                                <Box component="form" onSubmit={handleSubmit}>
                                    <TextField
                                        fullWidth
                                        label="Correo Electrónico"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField('')}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                        margin="normal"
                                        autoComplete="email"
                                        autoFocus
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Person
                                                        sx={{
                                                            color: focusedField === 'email' ? 'primary.main' : 'action.active',
                                                            transition: 'color 0.3s',
                                                        }}
                                                    />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                                                },
                                                '&.Mui-focused': {
                                                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.25)',
                                                },
                                            },
                                        }}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Contraseña"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField('')}
                                        error={!!errors.password}
                                        helperText={errors.password}
                                        margin="normal"
                                        autoComplete="current-password"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Lock
                                                        sx={{
                                                            color: focusedField === 'password' ? 'primary.main' : 'action.active',
                                                            transition: 'color 0.3s',
                                                        }}
                                                    />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={handleTogglePassword}
                                                        edge="end"
                                                        aria-label="toggle password visibility"
                                                        sx={{
                                                            transition: 'transform 0.3s',
                                                            '&:hover': {
                                                                transform: 'scale(1.1)',
                                                            },
                                                        }}
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                                                },
                                                '&.Mui-focused': {
                                                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.25)',
                                                },
                                            },
                                        }}
                                    />

                                    <Box sx={{ textAlign: 'right', mt: 1.5, mb: 3 }}>
                                        <Link
                                            href="/recuperar-password"
                                            variant="body2"
                                            sx={{
                                                textDecoration: 'none',
                                                color: 'primary.main',
                                                fontWeight: 600,
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    color: 'primary.dark',
                                                    textDecoration: 'underline',
                                                },
                                            }}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </Box>

                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        disabled={isLoading}
                                        endIcon={!isLoading && <ArrowForward />}
                                        sx={{
                                            py: 1.8,
                                            fontSize: '1.1rem',
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            borderRadius: 2,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5568d3 0%, #653d8f 100%)',
                                                boxShadow: '0 12px 32px rgba(102, 126, 234, 0.6)',
                                                transform: 'translateY(-2px)',
                                            },
                                            '&:active': {
                                                transform: 'translateY(0)',
                                            },
                                        }}
                                    >
                                        {isLoading ? (
                                            <CircularProgress size={26} color="inherit" />
                                        ) : (
                                            'Iniciar Sesión'
                                        )}
                                    </Button>
                                </Box>

                                <Divider sx={{ my: 4 }}>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontWeight: 600 }}
                                    >
                                        o continúa con
                                    </Typography>
                                </Divider>

                                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        sx={{
                                            py: 1.5,
                                            borderRadius: 2,
                                            borderWidth: 2,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                borderWidth: 2,
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                                            },
                                        }}
                                    >
                                        Google
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        sx={{
                                            py: 1.5,
                                            borderRadius: 2,
                                            borderWidth: 2,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                borderWidth: 2,
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                                            },
                                        }}
                                    >
                                        Microsoft
                                    </Button>
                                </Box>

                                <Box sx={{ textAlign: 'center', mt: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        ¿No tienes una cuenta?{' '}
                                        <Link
                                            href="/registro"
                                            sx={{
                                                textDecoration: 'none',
                                                color: 'primary.main',
                                                fontWeight: 700,
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    color: 'primary.dark',
                                                    textDecoration: 'underline',
                                                },
                                            }}
                                        >
                                            Regístrate aquí
                                        </Link>
                                    </Typography>
                                </Box>
                            </Box>
                        </Fade>
                    </Paper>
                </Zoom>
            </Container>
        </Box>
    );
}