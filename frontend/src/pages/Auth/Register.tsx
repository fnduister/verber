import { PersonAdd, Visibility, VisibilityOff } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Container,
    Grid,
    IconButton,
    InputAdornment,
    Link,
    MenuItem,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearError, registerUser } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store/store';

const Register: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: '',
        grade: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const grades = [
        { key: '6thGrade', value: t('auth.grades.6thGrade') },
        { key: '7thGrade', value: t('auth.grades.7thGrade') },
        { key: '8thGrade', value: t('auth.grades.8thGrade') },
        { key: '9thGrade', value: t('auth.grades.9thGrade') },
        { key: '10thGrade', value: t('auth.grades.10thGrade') },
        { key: '11thGrade', value: t('auth.grades.11thGrade') },
        { key: '12thGrade', value: t('auth.grades.12thGrade') },
        { key: 'university', value: t('auth.grades.university') },
        { key: 'other', value: t('auth.grades.other') },
    ];

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
        return () => {
            dispatch(clearError());
        };
    }, [isAuthenticated, navigate, dispatch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (e.target.name === 'confirmPassword' || e.target.name === 'password') {
            setPasswordError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        // Validate password strength
        if (formData.password.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
            return;
        }

        // Validate age
        const age = parseInt(formData.age);
        if (isNaN(age) || age < 10 || age > 100) {
            setPasswordError('Please enter a valid age between 10 and 100');
            return;
        }

        const userData = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            age: age,
            grade: formData.grade,
        };

        await dispatch(registerUser(userData));
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: 'calc(100vh - 80px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4,
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ width: '100%' }}
                >
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <PersonAdd sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                                {t('auth.createAccount')}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {t('auth.joinVerber')}
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        {passwordError && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {passwordError}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label={t('auth.username')}
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                margin="normal"
                                autoComplete="username"
                                autoFocus
                            />

                            <TextField
                                fullWidth
                                label={t('auth.email')}
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                margin="normal"
                                autoComplete="email"
                            />

                            <Grid container spacing={2} sx={{ mt: 0 }}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label={t('auth.age')}
                                        name="age"
                                        type="number"
                                        value={formData.age}
                                        onChange={handleChange}
                                        required
                                        inputProps={{ min: 10, max: 100 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        select
                                        label={t('auth.grade')}
                                        name="grade"
                                        value={formData.grade}
                                        onChange={handleChange}
                                        required
                                    >
                                        {grades.map((grade) => (
                                            <MenuItem key={grade.key} value={grade.value}>
                                                {grade.value}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>

                            <TextField
                                fullWidth
                                label={t('auth.password')}
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                margin="normal"
                                autoComplete="new-password"
                                helperText={t('auth.passwordHelperText')}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                label={t('auth.confirmPassword')}
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                margin="normal"
                                autoComplete="new-password"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                            >
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ mt: 3, mb: 2, py: 1.5 }}
                            >
                                {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
                            </Button>

                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {t('auth.alreadyHaveAccount')}{' '}
                                    <Link
                                        component="button"
                                        type="button"
                                        onClick={() => navigate('/login')}
                                        sx={{ cursor: 'pointer', textDecoration: 'none' }}
                                    >
                                        {t('auth.signInHere')}
                                    </Link>
                                </Typography>
                            </Box>
                        </form>
                    </Paper>
                </motion.div>
            </Box>
        </Container>
    );
};

export default Register;